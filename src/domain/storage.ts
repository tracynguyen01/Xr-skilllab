import type { AssessmentResult, Attempt } from './types'

export const STORAGE_KEY = 'xr-skilllab.session.v1'

export type StoredSession = {
  version: 1
  attempt: Attempt | null
  result: AssessmentResult | null
}

function isAttempt(value: unknown): value is Attempt {
  if (!value || typeof value !== 'object') return false
  const attempt = value as Attempt
  return (
    attempt.scenarioId === 'warehouse-safety-v1' &&
    (attempt.mode === '2d' || attempt.mode === '3d') &&
    typeof attempt.attemptId === 'string' &&
    typeof attempt.startedAt === 'string' &&
    typeof attempt.answers === 'object' &&
    attempt.answers !== null &&
    Array.isArray(attempt.inspectedDecoyIds)
  )
}

function isResult(value: unknown): value is AssessmentResult {
  if (!value || typeof value !== 'object') return false
  const result = value as AssessmentResult
  return typeof result.score === 'number' && Array.isArray(result.details)
}

/**
 * Same-tab memory only. If storage is blocked or the saved value is junk,
 * the caller keeps going with an empty in-memory attempt.
 */
export function readStoredSession(): { session: StoredSession | null; error: boolean } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { session: null, error: false }
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (parsed.version !== 1) return { session: null, error: true }
    if (parsed.attempt !== null && !isAttempt(parsed.attempt)) return { session: null, error: true }
    if (parsed.result !== null && parsed.result !== undefined && !isResult(parsed.result)) {
      return { session: null, error: true }
    }
    return {
      error: false,
      session: {
        version: 1,
        attempt: parsed.attempt ?? null,
        result: parsed.result ?? null,
      },
    }
  } catch {
    return { session: null, error: true }
  }
}

export function writeStoredSession(session: Omit<StoredSession, 'version'>): void {
  try {
    const payload: StoredSession = { version: 1, attempt: session.attempt, result: session.result }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Private mode or a full quota should not stop the exercise.
  }
}

export function clearStoredSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore. The in-memory reset still happened.
  }
}
