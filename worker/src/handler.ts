import { AI_COACH_SOURCE, parseAiCoachText } from '../../src/domain/coachContract'
import { allowDaily, allowIp, createMemoryStore, utcDay, type StringStore } from './limits'
import { MAX_TOKENS, buildCoachMessages } from './prompt'
import { parseCoachRequest } from './schema'

export const ALLOWED_ORIGIN = 'https://tracynguyen01.github.io'
const MAX_BODY = 2048
const UPSTREAM_TIMEOUT_MS = 8_000

export interface CoachEnv {
  AI_API_KEY?: string
  AI_BASE_URL?: string
  AI_MODEL?: string
  AI_DAILY_CAP?: string
  COACH_LIMITS?: StringStore
}

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>

export type HandlerDeps = {
  fetch: FetchLike
  now: () => number
  store: StringStore
}

const isolateStore = createMemoryStore()

type ReadyEnv = {
  apiKey: string
  baseUrl: string
  model: string
  dailyCap: number
}

export async function handleCoachRequest(request: Request, env: CoachEnv, deps?: Partial<HandlerDeps>): Promise<Response> {
  const url = new URL(request.url)
  const origin = request.headers.get('Origin')
  if (url.pathname !== '/coach') return respond(404, { error: 'not-found' }, origin)
  if (request.method === 'OPTIONS') return preflight(origin)
  if (request.method !== 'POST') return respond(405, { error: 'rejected' }, origin)

  if (origin !== ALLOWED_ORIGIN) return respond(403, { error: 'rejected' }, origin)

  const runtime: HandlerDeps = {
    fetch: deps?.fetch ?? fetch,
    now: deps?.now ?? Date.now,
    store: deps?.store ?? env.COACH_LIMITS ?? isolateStore,
  }

  let text: string
  try {
    text = await request.text()
  } catch {
    return respond(400, { error: 'rejected' }, origin)
  }
  if (text.length > MAX_BODY) return respond(400, { error: 'rejected' }, origin)

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  if (!(await allowIp(runtime.store, ip, runtime.now()))) {
    return respond(429, { error: 'limited' }, origin)
  }

  let json: unknown
  try {
    json = JSON.parse(text) as unknown
  } catch {
    return respond(400, { error: 'rejected' }, origin)
  }
  const coachRequest = parseCoachRequest(json)
  if (!coachRequest) return respond(400, { error: 'rejected' }, origin)

  const ready = readEnv(env)
  if (!ready) return respond(503, { error: 'unavailable' }, origin)
  if (!(await allowDaily(runtime.store, utcDay(runtime.now()), ready.dailyCap))) {
    return respond(429, { error: 'limited' }, origin)
  }

  const messages = buildCoachMessages(coachRequest)
  let upstream: Response
  try {
    upstream = await runtime.fetch(`${ready.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ready.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ready.model,
        temperature: 0.2,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: messages.system },
          { role: 'user', content: messages.user },
        ],
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch {
    return respond(502, { error: 'unavailable' }, origin)
  }
  if (!upstream.ok) return respond(502, { error: 'unavailable' }, origin)

  let modelPayload: unknown
  try {
    modelPayload = await upstream.json()
  } catch {
    return respond(502, { error: 'unavailable' }, origin)
  }
  const coaching = parseAiCoachText(unwrapModelJson(messageText(modelPayload)))
  if (!coaching) return respond(502, { error: 'unavailable' }, origin)

  return respond(200, { source: AI_COACH_SOURCE, ...coaching }, origin)
}

function readEnv(env: CoachEnv): ReadyEnv | null {
  const apiKey = env.AI_API_KEY?.trim() ?? ''
  const model = env.AI_MODEL?.trim() ?? ''
  const base = env.AI_BASE_URL?.trim() ?? ''
  if (!apiKey || !model || !base) return null
  if (!/^[A-Za-z0-9._:/-]{1,80}$/.test(model)) return null
  const cap = Number(env.AI_DAILY_CAP)
  if (!Number.isInteger(cap) || cap < 1 || cap > 1000) return null
  let parsed: URL
  try {
    parsed = new URL(base)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null
  if (parsed.username || parsed.password || parsed.search || parsed.hash) return null
  const path = parsed.pathname.replace(/\/$/, '')
  return {
    apiKey,
    model,
    dailyCap: cap,
    baseUrl: `${parsed.origin}${path}`,
  }
}

function messageText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const choices = (payload as { choices?: unknown }).choices
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== 'object') return null
  const message = (choices[0] as { message?: unknown }).message
  if (!message || typeof message !== 'object') return null
  const content = (message as { content?: unknown }).content
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return null
  let text = ''
  for (const part of content) {
    if (!part || typeof part !== 'object' || typeof (part as { text?: unknown }).text !== 'string') return null
    text += (part as { text: string }).text
  }
  return text
}

function unwrapModelJson(text: string | null): unknown {
  if (!text) return null
  const trimmed = text.trim()
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed)
  const raw = fenced?.[1] ?? trimmed
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function preflight(origin: string | null): Response {
  if (origin !== ALLOWED_ORIGIN) return respond(403, { error: 'rejected' }, origin)
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

function respond(status: number, body: Record<string, unknown>, origin: string | null): Response {
  const headers = corsHeaders(origin)
  headers.set('Content-Type', 'application/json')
  return new Response(JSON.stringify(body), { status, headers })
}

function corsHeaders(origin: string | null): Headers {
  const headers = new Headers()
  if (origin === ALLOWED_ORIGIN) {
    headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Vary', 'Origin')
  }
  return headers
}
