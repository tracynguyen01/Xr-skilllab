import { DECOYS } from './decoys'
import { getHazard, SCENARIO_ID, SCENARIO_VERSION } from './hazards'
import type { Attempt, SceneMode, SubmitStatus } from './types'

/**
 * Attempt rules shared by every view.
 * The future 3D scene should call these functions and must not score clicks itself.
 * A hazard is stored once: a second submission returns the original attempt unchanged.
 */

export function createAttempt(mode: SceneMode, startedAt = new Date().toISOString()): Attempt {
  return {
    attemptId: crypto.randomUUID(),
    scenarioId: SCENARIO_ID,
    scenarioVersion: SCENARIO_VERSION,
    startedAt,
    answers: {},
    inspectedDecoyIds: [],
    mode,
  }
}

export function submitHazardAnswer(
  attempt: Attempt,
  hazardId: string,
  choiceId: string,
  selectedAt: string,
): { attempt: Attempt; status: SubmitStatus } {
  if (attempt.endedAt) return { attempt, status: 'closed' }
  if (attempt.answers[hazardId]) return { attempt, status: 'duplicate' }

  const hazard = getHazard(hazardId)
  if (!hazard) return { attempt, status: 'unknown-hazard' }
  if (!hazard.choices.some((choice) => choice.id === choiceId)) {
    return { attempt, status: 'invalid-choice' }
  }

  return {
    status: 'recorded',
    attempt: {
      ...attempt,
      answers: {
        ...attempt.answers,
        [hazardId]: { hazardId, choiceId, selectedAt },
      },
    },
  }
}

export function inspectDecoy(
  attempt: Attempt,
  decoyId: string,
): { attempt: Attempt; status: 'recorded' | 'duplicate' | 'unknown-decoy' | 'closed' } {
  if (attempt.endedAt) return { attempt, status: 'closed' }
  if (!DECOYS.some((decoy) => decoy.id === decoyId)) return { attempt, status: 'unknown-decoy' }
  if (attempt.inspectedDecoyIds.includes(decoyId)) return { attempt, status: 'duplicate' }

  return {
    status: 'recorded',
    attempt: {
      ...attempt,
      inspectedDecoyIds: [...attempt.inspectedDecoyIds, decoyId],
    },
  }
}

/** Marks the attempt finished. A second call keeps the original end time. */
export function closeAttempt(attempt: Attempt, endedAt: string): Attempt {
  if (attempt.endedAt) return attempt
  return { ...attempt, endedAt }
}
