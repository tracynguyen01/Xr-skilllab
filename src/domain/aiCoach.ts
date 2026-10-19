import type { AssessmentResult, Attempt } from './types'
import { parseAiCoachResponse, type AiCoachResponse } from './coachContract'

export type CoachRequest = {
  scenarioId: Attempt['scenarioId']
  score: number
  outcomes: Array<{ hazardId: string; choiceId: string | null }>
}

const REQUEST_TIMEOUT_MS = 12_000

/**
 * Public Worker URL, baked in at build time.
 * Unset or empty keeps the results page on the offline Scenario Coach.
 */
export function coachEndpoint(value: string | undefined = import.meta.env.VITE_COACH_API_URL): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

/** Structured result only. Choice ids, never the visitor's own sentences. */
export function buildCoachRequest(attempt: Attempt, result: AssessmentResult): CoachRequest {
  return {
    scenarioId: attempt.scenarioId,
    score: result.score,
    outcomes: result.details.map((detail) => ({
      hazardId: detail.hazardId,
      choiceId: detail.selectedChoiceId ?? null,
    })),
  }
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>

export async function requestAiCoach(
  url: string,
  body: CoachRequest,
  fetchImpl: FetchLike = fetch,
): Promise<AiCoachResponse> {
  let response: Response
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new Error('unavailable')
  }
  if (!response.ok) throw new Error('unavailable')
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('unavailable')
  }
  const parsed = parseAiCoachResponse(payload)
  if (!parsed) throw new Error('unavailable')
  return parsed
}
