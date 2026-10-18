import { describe, expect, it, vi } from 'vitest'
import { scoreAttempt } from '../domain/scoring'
import { closeAttempt, createAttempt, inspectDecoy, submitHazardAnswer } from '../domain/session'
import { readStoredSession, STORAGE_KEY, writeStoredSession } from '../domain/storage'

const NOW = '2026-10-18T00:00:00.000Z'
const LATER = '2026-10-18T00:05:00.000Z'

describe('attempt session', () => {
  it('does not increase the score when the same hazard is submitted twice', () => {
    const started = createAttempt('2d', NOW)
    const first = submitHazardAnswer(started, 'blocked-exit', 'report', NOW)
    const second = submitHazardAnswer(first.attempt, 'blocked-exit', 'ignore', NOW)

    expect(first.status).toBe('recorded')
    expect(second.status).toBe('duplicate')
    expect(second.attempt).toBe(first.attempt)
    expect(second.attempt.answers['blocked-exit']?.choiceId).toBe('report')
    expect(scoreAttempt(second.attempt).score).toBe(25)
  })

  it('ignores an unknown hazard id and an invalid choice id', () => {
    const started = createAttempt('2d', NOW)
    const unknown = submitHazardAnswer(started, 'not-a-hazard', 'report', NOW)
    const invalid = submitHazardAnswer(started, 'blocked-exit', 'not-a-choice', NOW)

    expect(unknown.status).toBe('unknown-hazard')
    expect(unknown.attempt).toBe(started)
    expect(invalid.status).toBe('invalid-choice')
    expect(invalid.attempt).toBe(started)
    expect(scoreAttempt(started).score).toBe(0)
  })

  it('starts a new empty attempt on retry', () => {
    const first = submitHazardAnswer(createAttempt('2d', NOW), 'blocked-exit', 'report', NOW).attempt
    const inspected = inspectDecoy(first, 'clear-aisle').attempt
    const again = createAttempt('2d', LATER)

    expect(again.attemptId).not.toBe(inspected.attemptId)
    expect(again.answers).toEqual({})
    expect(again.inspectedDecoyIds).toEqual([])
    expect(again.endedAt).toBeUndefined()
    expect(scoreAttempt(again).score).toBe(0)
    expect(scoreAttempt(inspected).score).toBe(25)
  })

  it('does not let decoy checks change the score', () => {
    let attempt = createAttempt('2d', NOW)
    attempt = inspectDecoy(attempt, 'secured-extinguisher').attempt
    attempt = inspectDecoy(attempt, 'clear-aisle').attempt
    const repeat = inspectDecoy(attempt, 'secured-extinguisher')

    expect(scoreAttempt(attempt).score).toBe(0)
    expect(repeat.status).toBe('duplicate')
    expect(repeat.attempt.inspectedDecoyIds).toEqual(['secured-extinguisher', 'clear-aisle'])
  })

  it('rejects a new answer after the attempt is closed', () => {
    const closed = closeAttempt(createAttempt('2d', NOW), LATER)
    const extra = submitHazardAnswer(closed, 'floor-spill', 'isolate', LATER)
    expect(extra.status).toBe('closed')
    expect(extra.attempt).toBe(closed)
    expect(closeAttempt(closed, '2026-10-18T00:09:00.000Z')).toBe(closed)
  })

  it('reports unreadable session storage instead of throwing', () => {
    sessionStorage.setItem(STORAGE_KEY, '{')
    expect(readStoredSession().error).toBe(true)
    expect(readStoredSession().session).toBeNull()
  })

  it('keeps going when session storage cannot be written', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    expect(() => writeStoredSession({ attempt: null, result: null })).not.toThrow()
  })
})
