import { getHazard } from './hazards'
import type { AssessmentResult, CoachFeedback } from './types'

/**
 * Offline Scenario Coach.
 * This file must stay free of network calls. It only restates the scored result.
 * It cannot mark a hazard correct unless the scoring engine already did.
 */

const NEXT_STEP_BY_HAZARD: Record<string, string> = {
  'blocked-exit': 'On the next attempt, look for hazards around emergency routes.',
  'floor-spill': 'On the next attempt, check pedestrian routes for spills.',
  'unstable-load': 'On the next attempt, inspect stacked loads for tilt or overhang.',
  'forklift-crossing': 'On the next attempt, watch where people and vehicles share space.',
}

function hazardTitle(hazardId: string): string {
  return getHazard(hazardId)?.title ?? hazardId
}

function joinTitles(titles: string[]): string {
  if (titles.length <= 1) return titles[0] ?? ''
  if (titles.length === 2) return `${titles[0]} and ${titles[1]}`
  return `${titles.slice(0, -1).join(', ')}, and ${titles[titles.length - 1]}`
}

export function buildScenarioCoach(result: AssessmentResult): CoachFeedback {
  const correctDetails = result.details.filter((detail) => detail.identified && detail.correct)
  const missed = result.details.filter((detail) => !detail.identified)
  const incorrect = result.details.filter((detail) => detail.identified && !detail.correct)

  const summary = `You identified ${result.identifiedHazards} of ${result.totalHazards} hazards and chose the preferred action for ${result.correctActions}.`

  const strength =
    correctDetails.length === 0
      ? 'You have a finished attempt to learn from. Each response on this page explains what the scenario was looking for.'
      : `You chose the preferred action for ${joinTitles(correctDetails.map((detail) => hazardTitle(detail.hazardId)))}.`

  const improvements = [
    ...missed.map((detail) => {
      const hazard = getHazard(detail.hazardId)
      const explanation = hazard?.educationalExplanation ?? detail.explanation
      return `Not assessed: ${hazardTitle(detail.hazardId)}. ${explanation}`
    }),
    ...incorrect.map((detail) => {
      return `Review this response: ${hazardTitle(detail.hazardId)}. ${detail.explanation}`
    }),
  ]

  const focus = missed[0] ?? incorrect[0]
  const nextStep = focus
    ? (NEXT_STEP_BY_HAZARD[focus.hazardId] ??
      'On the next attempt, inspect each marked point before you finish.')
    : 'Try again and talk through why the other actions were weaker before you submit.'

  return {
    source: 'offline-rules',
    summary,
    strength,
    improvements,
    nextStep,
    disclaimer: 'Illustrative learning feedback, not a formal safety assessment.',
  }
}
