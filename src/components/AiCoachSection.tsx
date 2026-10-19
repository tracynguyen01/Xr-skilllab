import { useState } from 'react'
import { buildCoachRequest, coachEndpoint, requestAiCoach } from '../domain/aiCoach'
import type { AiCoachResponse } from '../domain/coachContract'
import type { AssessmentResult, Attempt } from '../domain/types'

type AiCoachSectionProps = {
  result: AssessmentResult
  attempt: Attempt
  /**
   * Undefined reads the build-time URL. Null or an empty build keeps this section off.
   */
  endpoint?: string | null
}

/**
 * Optional AI reading of a finished result.
 * The offline Scenario Coach stays on the page either way. A failed request
 * leaves that coach as the feedback and does not show an error.
 */
export function AiCoachSection({ result, attempt, endpoint }: AiCoachSectionProps) {
  const url = endpoint === undefined ? coachEndpoint() : endpoint
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready'>('idle')
  const [feedback, setFeedback] = useState<AiCoachResponse | null>(null)
  if (!url) return null

  async function onRequest() {
    if (!url || phase === 'loading') return
    setPhase('loading')
    try {
      const next = await requestAiCoach(url, buildCoachRequest(attempt, result))
      setFeedback(next)
      setPhase('ready')
    } catch {
      setFeedback(null)
      setPhase('idle')
    }
  }

  return (
    <section className="coach-card card ai-coach" aria-labelledby="ai-coach-title" aria-busy={phase === 'loading'}>
      <p className="eyebrow">AI coaching (beta)</p>
      <h2 id="ai-coach-title">A second reading of this result</h2>
      {phase === 'ready' && feedback ? (
        <>
          <p className="fine-print">AI-generated feedback. It may be imperfect.</p>
          <p className="fine-print">This coaching does not change the score. The score comes from the scenario rules.</p>
          <h3>What went well</h3>
          <p>{feedback.whatWentWell}</p>
          <h3>What to practise</h3>
          <p>{feedback.whatToPractise}</p>
          <p className="next-step">{feedback.nextStep}</p>
        </>
      ) : (
        <>
          <p>You can ask for a short AI reading of this same result. The score above stays the one from the scenario rules.</p>
          <button type="button" className="btn btn-secondary" onClick={onRequest} disabled={phase === 'loading'}>
            {phase === 'loading' ? 'Requesting coaching…' : 'Request AI coaching'}
          </button>
        </>
      )}
    </section>
  )
}
