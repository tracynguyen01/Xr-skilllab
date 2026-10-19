// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WAREHOUSE_HAZARDS } from '../../src/domain/hazards'
import { IP_CAPACITY } from '../src/limits'
import { MAX_TOKENS } from '../src/prompt'
import { handleCoachRequest, type CoachEnv } from '../src/handler'
import { createMemoryStore } from '../src/limits'
import { scoreOutcomes } from '../src/schema'

const ORIGIN = 'https://tracynguyen01.github.io'

function validBody() {
  const outcomes = WAREHOUSE_HAZARDS.map((hazard) => ({
    hazardId: hazard.id,
    choiceId: hazard.correctChoiceId,
  }))
  return { scenarioId: 'warehouse-safety-v1', score: scoreOutcomes(outcomes), outcomes }
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://coach.example/coach', {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.10', ...headers },
    body: JSON.stringify(body),
  })
}

function env(overrides: Partial<CoachEnv> = {}): CoachEnv {
  return {
    AI_API_KEY: 'test-key',
    AI_BASE_URL: 'https://example.test/v1',
    AI_MODEL: 'demo-model',
    AI_DAILY_CAP: '20',
    ...overrides,
  }
}

function modelReply(text: unknown) {
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(text) } }] }), { status: 200 })
}

const goodText = {
  whatWentWell: 'You chose the preferred action for each hazard in the evidence.',
  whatToPractise: 'On the next attempt, say why the other actions were weaker.',
  nextStep: 'Try the walkway spill first and name the site procedure.',
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('coach worker', () => {
  it('calls the provider with a server-built prompt and returns coaching without a score', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => modelReply(goodText))
    const response = await handleCoachRequest(request(validBody()), env(), {
      fetch: fetchImpl,
      store: createMemoryStore(),
      now: () => Date.parse('2026-10-19T01:00:00.000Z'),
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
    const payload = await response.json()
    expect(payload).toEqual({ source: 'llm', ...goodText })
    expect(payload).not.toHaveProperty('score')

    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, init] = fetchImpl.mock.calls[0]!
    expect(url).toBe('https://example.test/v1/chat/completions')
    const outbound = JSON.parse(String(init?.body)) as {
      max_tokens: number
      model: string
      messages: Array<{ content: string }>
    }
    expect(outbound.max_tokens).toBe(MAX_TOKENS)
    expect(outbound.model).toBe('demo-model')
    expect(outbound.messages[1]?.content).toContain('Blocked Emergency Exit')
    expect(outbound.messages[1]?.content).toContain('deterministic-rules')
    expect(outbound.messages[1]?.content).not.toContain('test-key')
    expect(JSON.stringify(init?.headers)).toContain('Bearer test-key')
  })

  it('does not log the request or the provider payload', async () => {
    const spies = ['log', 'info', 'warn', 'error', 'debug'].map((method) =>
      vi.spyOn(console, method as 'log').mockImplementation(() => {}),
    )
    const fetchImpl = vi.fn(async () => modelReply(goodText))
    await handleCoachRequest(request(validBody()), env(), {
      fetch: fetchImpl,
      store: createMemoryStore(),
      now: () => Date.parse('2026-10-19T01:00:00.000Z'),
    })
    for (const spy of spies) expect(spy).not.toHaveBeenCalled()
  })

  it('rate limits an IP before calling the provider again', async () => {
    const fetchImpl = vi.fn(async () => modelReply(goodText))
    const store = createMemoryStore()
    const now = () => Date.parse('2026-10-19T01:00:00.000Z')
    for (let i = 0; i < IP_CAPACITY; i += 1) {
      const response = await handleCoachRequest(request(validBody()), env(), { fetch: fetchImpl, store, now })
      expect(response.status).toBe(200)
    }
    const limited = await handleCoachRequest(request(validBody()), env(), { fetch: fetchImpl, store, now })
    expect(limited.status).toBe(429)
    expect(fetchImpl).toHaveBeenCalledTimes(IP_CAPACITY)
  })

  it('stops at the daily cap', async () => {
    const fetchImpl = vi.fn(async () => modelReply(goodText))
    const store = createMemoryStore()
    const now = () => Date.parse('2026-10-19T01:00:00.000Z')
    const limitedEnv = env({ AI_DAILY_CAP: '1' })
    expect((await handleCoachRequest(request(validBody()), limitedEnv, { fetch: fetchImpl, store, now })).status).toBe(200)
    expect((await handleCoachRequest(request(validBody(), { 'CF-Connecting-IP': '203.0.113.11' }), limitedEnv, { fetch: fetchImpl, store, now })).status).toBe(429)
    expect(fetchImpl).toHaveBeenCalledOnce()
  })

  it('rejects a foreign origin and answers preflight only for the Pages origin', async () => {
    const fetchImpl = vi.fn(async () => modelReply(goodText))
    const denied = await handleCoachRequest(request(validBody(), { Origin: 'https://evil.example' }), env(), {
      fetch: fetchImpl,
      store: createMemoryStore(),
    })
    expect(denied.status).toBe(403)
    expect(denied.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(fetchImpl).not.toHaveBeenCalled()

    const preflight = await handleCoachRequest(
      new Request('https://coach.example/coach', { method: 'OPTIONS', headers: { Origin: ORIGIN } }),
      env(),
      { fetch: fetchImpl, store: createMemoryStore() },
    )
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
  })

  it('stays unavailable when the provider is not configured', async () => {
    const fetchImpl = vi.fn(async () => modelReply(goodText))
    const response = await handleCoachRequest(request(validBody()), env({ AI_API_KEY: '' }), {
      fetch: fetchImpl,
      store: createMemoryStore(),
    })
    expect(response.status).toBe(503)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('rejects a model reply that is not the coaching schema', async () => {
    const fetchImpl = vi.fn(async () => modelReply({ ...goodText, score: 0 }))
    const response = await handleCoachRequest(request(validBody()), env(), {
      fetch: fetchImpl,
      store: createMemoryStore(),
    })
    expect(response.status).toBe(502)
    const payload = await response.json()
    expect(payload).toEqual({ error: 'unavailable' })
  })

  it('calls the platform fetch unbound so a method-style this does not 502', async () => {
    const receivers: unknown[] = []
    const original = globalThis.fetch
    function sensitiveFetch(this: unknown, _input: RequestInfo | URL, _init?: RequestInit) {
      receivers.push(this)
      if (this != null && this !== globalThis) throw new TypeError('Illegal invocation')
      return Promise.resolve(modelReply(goodText))
    }
    const asMethod = { fetch: sensitiveFetch }
    expect(() => {
      asMethod.fetch('https://example.test/v1/chat/completions', {})
    }).toThrow('Illegal invocation')
    receivers.length = 0

    globalThis.fetch = sensitiveFetch as typeof fetch
    try {
      const response = await handleCoachRequest(request(validBody()), env(), {
        store: createMemoryStore(),
        now: () => Date.parse('2026-10-19T01:00:00.000Z'),
      })
      expect(response.status).toBe(200)
      expect(receivers).toHaveLength(1)
      expect(receivers[0] == null || receivers[0] === globalThis).toBe(true)
    } finally {
      globalThis.fetch = original
    }
  })

  it('returns unavailable when the provider times out', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new DOMException('The operation was aborted', 'TimeoutError')
    })
    const response = await handleCoachRequest(request(validBody()), env(), {
      fetch: fetchImpl,
      store: createMemoryStore(),
    })
    expect(response.status).toBe(502)
  })
})
