// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { IP_CAPACITY, IP_REFILL_MS, allowDaily, allowIp, createMemoryStore } from '../src/limits'

describe('coach rate limits', () => {
  it('gives each IP a small bucket and then refuses', async () => {
    const store = createMemoryStore()
    const start = Date.parse('2026-10-19T00:00:00.000Z')
    for (let i = 0; i < IP_CAPACITY; i += 1) {
      expect(await allowIp(store, '203.0.113.8', start)).toBe(true)
    }
    expect(await allowIp(store, '203.0.113.8', start)).toBe(false)
    expect(await allowIp(store, '203.0.113.9', start)).toBe(true)
  })

  it('refills one token after the refill interval', async () => {
    const store = createMemoryStore()
    const start = Date.parse('2026-10-19T00:00:00.000Z')
    for (let i = 0; i < IP_CAPACITY; i += 1) await allowIp(store, '203.0.113.8', start)
    expect(await allowIp(store, '203.0.113.8', start + IP_REFILL_MS - 1)).toBe(false)
    expect(await allowIp(store, '203.0.113.8', start + IP_REFILL_MS)).toBe(true)
    expect(await allowIp(store, '203.0.113.8', start + IP_REFILL_MS)).toBe(false)
  })

  it('stops for the day once the shared cap is reached', async () => {
    const store = createMemoryStore()
    expect(await allowDaily(store, '2026-10-19', 2)).toBe(true)
    expect(await allowDaily(store, '2026-10-19', 2)).toBe(true)
    expect(await allowDaily(store, '2026-10-19', 2)).toBe(false)
    expect(await allowDaily(store, '2026-10-20', 2)).toBe(true)
  })

  it('does not treat a broken stored bucket as a full one', async () => {
    const store = createMemoryStore()
    await store.put('ip:203.0.113.8', '{not-json')
    expect(await allowIp(store, '203.0.113.8', Date.parse('2026-10-19T00:00:00.000Z'))).toBe(false)
  })
})
