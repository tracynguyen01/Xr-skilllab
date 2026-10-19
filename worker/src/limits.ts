/**
 * Per-IP token bucket and a daily counter.
 *
 * The default store is memory inside one Worker isolate. A new isolate starts
 * full again, and two isolates do not share counts. That is a brake, not a
 * global guarantee. Bind a KV namespace as COACH_LIMITS to share the same keys
 * across isolates. See docs/ai-coach.md.
 *
 * Each IP gets 5 tokens, refilled one token per minute. The daily cap is the
 * AI_DAILY_CAP env var and counts only calls that are about to reach the model.
 */

export const IP_CAPACITY = 5
export const IP_REFILL_MS = 60_000

export interface StringStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

type Bucket = { tokens: number; updated: number }

export function createMemoryStore(): StringStore {
  const values = new Map<string, string>()
  return {
    async get(key) {
      return values.get(key) ?? null
    },
    async put(key, value) {
      values.set(key, value)
    },
  }
}

export function storeFromKv(kv: StringStore): StringStore {
  return kv
}

function readBucket(raw: string | null, now: number): Bucket {
  if (!raw) return { tokens: IP_CAPACITY, updated: now }
  try {
    const parsed = JSON.parse(raw) as Partial<Bucket>
    if (
      typeof parsed.tokens === 'number' &&
      Number.isInteger(parsed.tokens) &&
      parsed.tokens >= 0 &&
      parsed.tokens <= IP_CAPACITY &&
      typeof parsed.updated === 'number' &&
      Number.isFinite(parsed.updated)
    ) {
      return { tokens: parsed.tokens, updated: parsed.updated }
    }
  } catch {
    // A broken value should not unlock the bucket.
  }
  return { tokens: 0, updated: now }
}

export async function allowIp(store: StringStore, ip: string, now: number): Promise<boolean> {
  const key = `ip:${ip}`
  const current = readBucket(await store.get(key), now)
  const elapsed = Math.max(0, now - current.updated)
  const gained = Math.floor(elapsed / IP_REFILL_MS)
  const tokens = Math.min(IP_CAPACITY, current.tokens + gained)
  const updated = gained > 0 ? current.updated + gained * IP_REFILL_MS : current.updated
  if (tokens < 1) {
    await store.put(key, JSON.stringify({ tokens, updated }))
    return false
  }
  await store.put(key, JSON.stringify({ tokens: tokens - 1, updated }))
  return true
}

export async function allowDaily(store: StringStore, day: string, cap: number): Promise<boolean> {
  const key = `day:${day}`
  const raw = await store.get(key)
  const count = raw === null ? 0 : Number(raw)
  if (!Number.isInteger(count) || count < 0 || count >= cap) return false
  await store.put(key, String(count + 1))
  return true
}

export function utcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}
