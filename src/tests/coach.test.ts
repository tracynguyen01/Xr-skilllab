import { describe, expect, it, vi } from 'vitest'
import { buildScenarioCoach } from '../domain/coach'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
import { scoreAttempt } from '../domain/scoring'
import { createAttempt, submitHazardAnswer } from '../domain/session'

const NOW = '2026-10-18T00:00:00.000Z'

function answered(hazardId: string, correct: boolean) {
  const hazard = WAREHOUSE_HAZARDS.find((item) => item.id === hazardId)
  if (!hazard) throw new Error(hazardId)
  const choice = correct
    ? hazard.correctChoiceId
    : hazard.choices.find((item) => item.id !== hazard.correctChoiceId)?.id
  if (!choice) throw new Error('choice')
  return submitHazardAnswer(createAttempt('2d', NOW), hazardId, choice, NOW).attempt
}

describe('offline scenario coach', () => {
  it('does not claim an unobserved hazard was answered correctly', () => {
    const result = scoreAttempt(answered('floor-spill', true))
    const coach = buildScenarioCoach(result)

    expect(coach.summary).toBe('You identified 1 of 4 hazards and chose the preferred action for 1.')
    expect(coach.strength).toContain('Liquid Spill on the Walkway')
    expect(coach.strength).not.toContain('Blocked Emergency Exit')
    expect(coach.strength).not.toContain('Unstable Pallet Stack')
    expect(coach.strength).not.toContain('Forklift and Pedestrian Conflict')
    expect(coach.improvements.join(' ')).toContain('Not assessed: Blocked Emergency Exit')
    expect(coach.source).toBe('offline-rules')
  })

  it('does not praise a hazard whose action was incorrect', () => {
    const coach = buildScenarioCoach(scoreAttempt(answered('blocked-exit', false)))
    expect(coach.strength).not.toContain('Blocked Emergency Exit')
    expect(coach.strength).not.toContain('preferred action for')
    expect(coach.improvements.join(' ')).toContain('Review this response: Blocked Emergency Exit')
  })

  it('makes no cloud network call', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    buildScenarioCoach(scoreAttempt(createAttempt('2d', NOW)))
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
