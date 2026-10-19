import { getHazard, SCENARIO_ID, SCENARIO_VERSION } from '../../src/domain/hazards'
import { scoreAttempt } from '../../src/domain/scoring'
import type { Attempt } from '../../src/domain/types'
import type { CoachRequest } from './schema'

export const MAX_TOKENS = 280

const SYSTEM_PROMPT = [
  'You write short practice feedback for one warehouse-safety scenario.',
  'Use only the evidence in the user message. That evidence was scored by fixed rules.',
  'Do not change the score, invent hazards, invent actions, or claim a certificate or qualification.',
  'Do not give emergency instructions beyond the evidence.',
  'Reply with JSON only, no markdown. Keys:',
  'whatWentWell (one or two sentences),',
  'whatToPractise (one or two sentences),',
  'nextStep (one sentence).',
].join(' ')

/** Server-side evidence. Titles and explanations come from the scenario catalogue, not the request text. */
export function buildCoachMessages(request: CoachRequest): { system: string; user: string } {
  const answers: Attempt['answers'] = {}
  for (const outcome of request.outcomes) {
    if (!outcome.choiceId) continue
    answers[outcome.hazardId] = {
      hazardId: outcome.hazardId,
      choiceId: outcome.choiceId,
      selectedAt: '1970-01-01T00:00:00.000Z',
    }
  }
  const attempt: Attempt = {
    attemptId: 'coach-prompt',
    scenarioId: SCENARIO_ID,
    scenarioVersion: SCENARIO_VERSION,
    startedAt: '1970-01-01T00:00:00.000Z',
    answers,
    inspectedDecoyIds: [],
    mode: '2d',
  }
  const result = scoreAttempt(attempt)
  const items = result.details.map((detail) => {
    const hazard = getHazard(detail.hazardId)
    const choice = hazard?.choices.find((item) => item.id === detail.selectedChoiceId)
    return {
      hazardId: detail.hazardId,
      title: hazard?.title ?? detail.hazardId,
      identified: detail.identified,
      preferredAction: detail.correct,
      choiceId: detail.selectedChoiceId ?? null,
      choiceLabel: choice?.label ?? null,
      learningPoint: hazard?.educationalExplanation ?? '',
    }
  })

  return {
    system: SYSTEM_PROMPT,
    user: JSON.stringify({
      scenarioId: SCENARIO_ID,
      score: result.score,
      scoreSource: 'deterministic-rules',
      items,
    }),
  }
}
