import { WAREHOUSE_HAZARDS } from './hazards'
import type { AssessmentDetail, AssessmentResult, Attempt } from './types'

/** Points for submitting any response to a real hazard. Awarded once. */
export const POINTS_FOR_IDENTIFYING = 15

/** Extra points when that response is the rubric's preferred action. */
export const POINTS_FOR_CORRECT_ACTION = 10

export function pointsForAnswer(correct: boolean): number {
  return POINTS_FOR_IDENTIFYING + (correct ? POINTS_FOR_CORRECT_ACTION : 0)
}

/**
 * Prototype labels only. These are not certifications or safety grades.
 * 80–100 Great start, 40–79 Keep practising, otherwise Review these hazards.
 */
export function scoreLabel(score: number): string {
  if (score >= 80) return 'Great start'
  if (score >= 40) return 'Keep practising'
  return 'Review these hazards'
}

/**
 * Score one attempt. Pure: the same attempt always returns the same result.
 * Time, decoy checks, and mode ('2d' or '3d') are ignored on purpose.
 * Each hazard contributes at most 25 points, from its single stored answer.
 */
export function scoreAttempt(attempt: Attempt): AssessmentResult {
  const details: AssessmentDetail[] = WAREHOUSE_HAZARDS.map((hazard) => {
    const answer = attempt.answers[hazard.id]
    const choice = answer ? hazard.choices.find((item) => item.id === answer.choiceId) : undefined

    // A missing or unusable choice is treated as "not assessed", worth 0.
    if (!answer || !choice) {
      return {
        hazardId: hazard.id,
        identified: false,
        correct: false,
        points: 0,
        explanation: hazard.educationalExplanation,
      }
    }

    const correct = answer.choiceId === hazard.correctChoiceId
    return {
      hazardId: hazard.id,
      identified: true,
      selectedChoiceId: answer.choiceId,
      correct,
      points: pointsForAnswer(correct),
      explanation: choice.feedback,
    }
  })

  const score = details.reduce((sum, detail) => sum + detail.points, 0)

  return {
    score,
    identifiedHazards: details.filter((detail) => detail.identified).length,
    correctActions: details.filter((detail) => detail.correct).length,
    totalHazards: WAREHOUSE_HAZARDS.length,
    details,
  }
}
