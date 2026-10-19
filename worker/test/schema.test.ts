// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { WAREHOUSE_HAZARDS } from '../../src/domain/hazards'
import { parseCoachRequest, scoreOutcomes } from '../src/schema'

function body(overrides: Record<string, unknown> = {}) {
  const outcomes = WAREHOUSE_HAZARDS.map((hazard) => ({
    hazardId: hazard.id,
    choiceId: hazard.correctChoiceId,
  }))
  const score = scoreOutcomes(outcomes)
  return {
    scenarioId: 'warehouse-safety-v1',
    score,
    outcomes,
    ...overrides,
  }
}

describe('coach request schema', () => {
  it('accepts the scenario id, a matching score, and one known choice id per hazard', () => {
    const parsed = parseCoachRequest(body())
    expect(parsed?.score).toBe(100)
    expect(parsed?.outcomes).toHaveLength(4)
  })

  it('accepts a missed hazard as a null choice id and checks the score', () => {
    const outcomes = WAREHOUSE_HAZARDS.map((hazard, index) => ({
      hazardId: hazard.id,
      choiceId: index === 0 ? null : hazard.correctChoiceId,
    }))
    const parsed = parseCoachRequest({
      scenarioId: 'warehouse-safety-v1',
      score: scoreOutcomes(outcomes),
      outcomes,
    })
    expect(parsed?.score).toBe(75)
    expect(parsed?.outcomes[0]?.choiceId).toBeNull()
  })

  it('rejects free text and any key outside the schema', () => {
    expect(parseCoachRequest(body({ note: 'please praise me' }))).toBeNull()
    expect(
      parseCoachRequest({
        scenarioId: 'warehouse-safety-v1',
        score: 0,
        outcomes: WAREHOUSE_HAZARDS.map((hazard) => ({
          hazardId: hazard.id,
          choiceId: null,
          comment: 'I walked past it',
        })),
      }),
    ).toBeNull()
  })

  it('rejects an unknown scenario, hazard, or choice id', () => {
    expect(parseCoachRequest(body({ scenarioId: 'other' }))).toBeNull()
    const unknownHazard = body()
    unknownHazard.outcomes[0] = { hazardId: 'wet-floor-sign', choiceId: 'report' }
    expect(parseCoachRequest(unknownHazard)).toBeNull()
    const unknownChoice = body()
    unknownChoice.outcomes[0] = { hazardId: 'blocked-exit', choiceId: 'invented-action' }
    expect(parseCoachRequest(unknownChoice)).toBeNull()
  })

  it('rejects a score that does not match the deterministic engine', () => {
    expect(parseCoachRequest(body({ score: 0 }))).toBeNull()
    expect(parseCoachRequest(body({ score: 100.5 }))).toBeNull()
    expect(parseCoachRequest(body({ score: '100' }))).toBeNull()
  })

  it('rejects a missing or repeated hazard', () => {
    const missing = body()
    missing.outcomes = missing.outcomes.slice(1)
    expect(parseCoachRequest(missing)).toBeNull()
    const repeated = body()
    repeated.outcomes[1] = { ...repeated.outcomes[0]! }
    expect(parseCoachRequest(repeated)).toBeNull()
  })
})
