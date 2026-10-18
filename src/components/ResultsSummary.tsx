import { getHazard } from '../domain/hazards'
import { scoreLabel } from '../domain/scoring'
import { elapsedSeconds, formatElapsed } from '../domain/time'
import type { AssessmentResult, Attempt } from '../domain/types'
import { buildScenarioCoach } from '../domain/coach'

type ResultsSummaryProps = {
  result: AssessmentResult
  attempt: Attempt
}

export function ResultsSummary({ result, attempt }: ResultsSummaryProps) {
  const coach = buildScenarioCoach(result)
  const seconds = elapsedSeconds(attempt.startedAt, attempt.endedAt)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const filled = (Math.min(100, Math.max(0, result.score)) / 100) * circumference

  return (
    <div className="results">
      <header className="score-hero card">
        <div className="score-copy">
          <p className="eyebrow">Your Training Snapshot</p>
          <h1>Score: {result.score} / 100</h1>
          <p className="score-label">{scoreLabel(result.score)}</p>
          <p className="score-note">Prototype label, not a certification.</p>
          <p>
            Hazards identified: {result.identifiedHazards} / {result.totalHazards}
          </p>
          <p>
            Preferred actions selected: {result.correctActions} / {result.totalHazards}
          </p>
          <p className="timer-note">Time on task {formatElapsed(seconds)}. Not part of the score.</p>
          <p className="fine-print">
            15 points for each hazard you assessed, plus 10 if the action matched the scenario.
          </p>
        </div>
        <svg className="score-ring" viewBox="0 0 140 140" aria-hidden="true">
          <circle className="score-ring-track" cx="70" cy="70" r={radius} />
          <circle
            className="score-ring-value"
            cx="70"
            cy="70"
            r={radius}
            strokeDasharray={`${filled} ${circumference - filled}`}
          />
          <text x="70" y="76" textAnchor="middle" className="score-ring-text">
            {result.score}
          </text>
        </svg>
      </header>

      <section className="section-block">
        <h2>Review each hazard</h2>
        <ol className="hazard-results">
          {result.details.map((detail) => {
            const hazard = getHazard(detail.hazardId)
            const choice = hazard?.choices.find((item) => item.id === detail.selectedChoiceId)
            const status = !detail.identified
              ? 'Not assessed'
              : detail.correct
                ? 'Matches the scenario guidance'
                : 'Review this response'
            const points = !detail.identified
              ? '0 points'
              : detail.correct
                ? '25 points · 15 for identifying + 10 for the preferred action'
                : '15 points · identified, preferred action not selected'
            return (
              <li key={detail.hazardId} className={`hazard-result ${detail.correct ? 'is-correct' : detail.identified ? 'is-review' : 'is-missed'}`}>
                <div className="result-top">
                  <h3>{hazard?.title ?? detail.hazardId}</h3>
                  <p className="status-pill">{status}</p>
                </div>
                <p className="points-line">{points}</p>
                {choice ? <p className="selected-line">You selected: {choice.label}</p> : <p>No response was submitted for this hazard.</p>}
                <p>{detail.explanation}</p>
                {hazard ? (
                  <details className="source-note">
                    <summary>Source note</summary>
                    <p>{hazard.sourceReference}</p>
                  </details>
                ) : null}
              </li>
            )
          })}
        </ol>
      </section>

      <section className="coach-card card" aria-labelledby="coach-title">
        <p className="eyebrow">Scenario Coach · offline rules</p>
        <h2 id="coach-title">What the result shows</h2>
        <p>{coach.summary}</p>
        <h3>What went well</h3>
        <p>{coach.strength}</p>
        <h3>What to practise next</h3>
        {coach.improvements.length > 0 ? (
          <ul>
            {coach.improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No missed hazards and no weaker actions in this attempt.</p>
        )}
        <p className="next-step">{coach.nextStep}</p>
        <p className="fine-print">{coach.disclaimer}</p>
      </section>
    </div>
  )
}
