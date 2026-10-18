import { describe, expect, it } from 'vitest'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
import { scoreAttempt, scoreLabel } from '../domain/scoring'
import { createAttempt, submitHazardAnswer } from '../domain/session'
import type { AssessmentResult, Attempt, SceneMode } from '../domain/types'

const NOW = '2026-10-18T00:00:00.000Z'

function wrongChoice(hazardId: string): string {
  const hazard = WAREHOUSE_HAZARDS.find((item) => item.id === hazardId)
  if (!hazard) throw new Error(`Missing hazard ${hazardId}`)
  const choice = hazard.choices.find((item) => item.id !== hazard.correctChoiceId)
  if (!choice) throw new Error(`Missing incorrect choice for ${hazardId}`)
  return choice.id
}

function withAnswers(pairs: Array<[string, 'correct' | 'wrong']>, mode: SceneMode = '2d'): Attempt {
  let attempt = createAttempt(mode, NOW)
  for (const [hazardId, kind] of pairs) {
    const hazard = WAREHOUSE_HAZARDS.find((item) => item.id === hazardId)
    if (!hazard) throw new Error(hazardId)
    const choiceId = kind === 'correct' ? hazard.correctChoiceId : wrongChoice(hazardId)
    attempt = submitHazardAnswer(attempt, hazardId, choiceId, NOW).attempt
  }
  return attempt
}

function expectScoringRule(result: AssessmentResult) {
  expect(result.score).toBeGreaterThanOrEqual(0)
  expect(result.score).toBeLessThanOrEqual(100)
  expect(result.score).toBe(result.details.reduce((sum, detail) => sum + detail.points, 0))
  expect(result.identifiedHazards).toBe(result.details.filter((detail) => detail.identified).length)
  expect(result.correctActions).toBe(result.details.filter((detail) => detail.correct).length)
  for (const detail of result.details) {
    if (!detail.identified) {
      expect(detail.correct).toBe(false)
      expect(detail.points).toBe(0)
    } else if (detail.correct) {
      expect(detail.points).toBe(25)
    } else {
      expect(detail.points).toBe(15)
    }
  }
}

describe('warehouse scoring', () => {
  it('scores no selected hazards as 0', () => {
    const result = scoreAttempt(createAttempt('2d', NOW))
    expect(result.score).toBe(0)
    expect(result.identifiedHazards).toBe(0)
    expectScoringRule(result)
  })

  it('scores one hazard with an incorrect action as 15', () => {
    const result = scoreAttempt(withAnswers([['blocked-exit', 'wrong']]))
    expect(result.score).toBe(15)
    expect(result.identifiedHazards).toBe(1)
    expect(result.correctActions).toBe(0)
    expectScoringRule(result)
  })

  it('scores one hazard with the preferred action as 25', () => {
    const result = scoreAttempt(withAnswers([['floor-spill', 'correct']]))
    expect(result.score).toBe(25)
    expect(result.correctActions).toBe(1)
    expectScoringRule(result)
  })

  it('scores four hazards with incorrect actions as 60', () => {
    const result = scoreAttempt(
      withAnswers(WAREHOUSE_HAZARDS.map((hazard) => [hazard.id, 'wrong'] as [string, 'wrong'])),
    )
    expect(result.score).toBe(60)
    expectScoringRule(result)
  })

  it('scores four hazards with two preferred actions as 80', () => {
    const result = scoreAttempt(
      withAnswers([
        ['blocked-exit', 'correct'],
        ['floor-spill', 'correct'],
        ['unstable-load', 'wrong'],
        ['forklift-crossing', 'wrong'],
      ]),
    )
    expect(result.score).toBe(80)
    expectScoringRule(result)
  })

  it('scores three hazards with two preferred actions as 65', () => {
    const result = scoreAttempt(
      withAnswers([
        ['blocked-exit', 'correct'],
        ['floor-spill', 'wrong'],
        ['unstable-load', 'correct'],
      ]),
    )
    expect(result.score).toBe(65)
    expect(result.identifiedHazards).toBe(3)
    expect(result.details.find((detail) => detail.hazardId === 'forklift-crossing')?.identified).toBe(false)
    expectScoringRule(result)
  })

  it('scores four preferred actions as 100', () => {
    const result = scoreAttempt(
      withAnswers(WAREHOUSE_HAZARDS.map((hazard) => [hazard.id, 'correct'] as [string, 'correct'])),
    )
    expect(result.score).toBe(100)
    expectScoringRule(result)
  })

  it('does not change when the same result is read again', () => {
    const attempt = withAnswers([
      ['blocked-exit', 'correct'],
      ['floor-spill', 'wrong'],
    ])
    const first = scoreAttempt(attempt)
    expect(scoreAttempt(attempt)).toEqual(first)
    expect(attempt.answers['blocked-exit']?.choiceId).toBe('report')
  })

  it('gives the same result for 2D and 3D attempts', () => {
    const pairs = WAREHOUSE_HAZARDS.map((hazard, index) => [hazard.id, index % 2 === 0 ? 'correct' : 'wrong'] as [string, 'correct' | 'wrong'])
    expect(scoreAttempt(withAnswers(pairs, '2d'))).toEqual(scoreAttempt(withAnswers(pairs, '3d')))
  })

  it('uses the prototype labels and not a certification', () => {
    expect(scoreLabel(100)).toBe('Great start')
    expect(scoreLabel(80)).toBe('Great start')
    expect(scoreLabel(65)).toBe('Keep practising')
    expect(scoreLabel(39)).toBe('Review these hazards')
    expect(scoreLabel(0)).toBe('Review these hazards')
    expect(JSON.stringify(['Great start', 'Keep practising', 'Review these hazards'])).not.toContain('Certified')
  })
})
