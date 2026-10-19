import { SCENARIO_ID, SCENARIO_VERSION, WAREHOUSE_HAZARDS } from '../../src/domain/hazards'
import { scoreAttempt } from '../../src/domain/scoring'
import type { Attempt } from '../../src/domain/types'

export type CoachOutcome = {
  hazardId: string
  choiceId: string | null
}

export type CoachRequest = {
  scenarioId: typeof SCENARIO_ID
  score: number
  outcomes: CoachOutcome[]
}

const REQUEST_KEYS = ['scenarioId', 'score', 'outcomes']
const OUTCOME_KEYS = ['hazardId', 'choiceId']

function isPlain(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function sameKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const own = Object.keys(value)
  return own.length === keys.length && keys.every((key) => own.includes(key))
}

/**
 * Accept only scenario id, the deterministic score, and one choice id per hazard.
 * Anything else, including free text, is rejected. The score must match scoreAttempt.
 */
export function parseCoachRequest(input: unknown): CoachRequest | null {
  if (!isPlain(input) || !sameKeys(input, REQUEST_KEYS)) return null
  if (input.scenarioId !== SCENARIO_ID) return null
  if (typeof input.score !== 'number' || !Number.isInteger(input.score)) return null
  if (!Array.isArray(input.outcomes) || input.outcomes.length !== WAREHOUSE_HAZARDS.length) return null

  const seen = new Set<string>()
  const outcomes: CoachOutcome[] = []
  for (const item of input.outcomes) {
    if (!isPlain(item) || !sameKeys(item, OUTCOME_KEYS)) return null
    if (typeof item.hazardId !== 'string' || seen.has(item.hazardId)) return null
    const hazard = WAREHOUSE_HAZARDS.find((entry) => entry.id === item.hazardId)
    if (!hazard) return null
    seen.add(item.hazardId)
    if (item.choiceId === null) {
      outcomes.push({ hazardId: item.hazardId, choiceId: null })
      continue
    }
    if (typeof item.choiceId !== 'string') return null
    if (!hazard.choices.some((choice) => choice.id === item.choiceId)) return null
    outcomes.push({ hazardId: item.hazardId, choiceId: item.choiceId })
  }

  if (seen.size !== WAREHOUSE_HAZARDS.length) return null
  if (scoreOutcomes(outcomes) !== input.score) return null
  return { scenarioId: SCENARIO_ID, score: input.score, outcomes }
}

export function scoreOutcomes(outcomes: readonly CoachOutcome[]): number {
  const answers: Attempt['answers'] = {}
  for (const outcome of outcomes) {
    if (!outcome.choiceId) continue
    answers[outcome.hazardId] = {
      hazardId: outcome.hazardId,
      choiceId: outcome.choiceId,
      selectedAt: '1970-01-01T00:00:00.000Z',
    }
  }
  const attempt: Attempt = {
    attemptId: 'coach-check',
    scenarioId: SCENARIO_ID,
    scenarioVersion: SCENARIO_VERSION,
    startedAt: '1970-01-01T00:00:00.000Z',
    answers,
    inspectedDecoyIds: [],
    mode: '2d',
  }
  return scoreAttempt(attempt).score
}
