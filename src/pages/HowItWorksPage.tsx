import { usePageTitle } from '../app/usePageTitle'
import { ArchitectureMap } from '../components/ArchitectureMap'

const FLOW = [
  'Start creates a new attempt in this browser tab.',
  'Selecting a hazard opens a dialog with three responses.',
  'The first submitted response is stored. Another click does not add points.',
  'Finish runs the scoring function. Unanswered hazards score 0.',
  'Scenario Coach writes feedback only from that result.',
  'Try Again throws the attempt away and starts clean.',
]

export function HowItWorksPage() {
  usePageTitle('How It Works')

  return (
    <article className="wrap prose-page">
      <p className="eyebrow">How It Works</p>
      <h1>A small system with a hard line around the score</h1>
      <p className="lede">
        XR SkillLab is a static site. The browser holds the scenario, scores the attempt, and writes the coaching.
        Nothing in this version is sent to a server.
      </p>

      <h2>Architecture</h2>
      <ArchitectureMap />
      <p className="callout">
        Trust boundary: the scoring engine is the source of truth. A future AI Worker may only rephrase a finished
        result. It is not connected, and it would not be allowed to change points, invent actions, or certify anyone.
      </p>

      <h2>What happens in one attempt</h2>
      <ol className="flow-list">
        {FLOW.map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <h2>Why the score is rules, not a model</h2>
      <p>
        The points are easy to audit: 15 for assessing a real hazard, 10 more for the preferred action, once per
        hazard. Tests lock those totals. A language model is a poor place to hide marking rules, because a reviewer
        cannot see why a number moved. The coach can talk about the result. It cannot decide the result.
      </p>

      <h2>Why there is a 2D scene first</h2>
      <p>
        The full exercise has to work without WebGL, a headset, or a mouse. The illustrated warehouse and the
        inspection list share one hazard catalogue and one scoring module. The 3D scene, when it is added, should call
        those same functions.
      </p>

      <h2>Stack in this version</h2>
      <ul>
        <li>React, TypeScript, and Vite</li>
        <li>Hash routing, so a refresh on GitHub Pages still finds the page</li>
        <li>Vitest for the scoring, session, and coach rules</li>
        <li>GitHub Actions for checks, and GitHub Pages for static hosting after merge</li>
      </ul>

      <h2>Limitations</h2>
      <ul>
        <li>Not a formal safety course, and not reviewed by a safety professional yet.</li>
        <li>The warehouse is an illustration, not a measured digital twin.</li>
        <li>There is no 3D scene and no live AI model in this version.</li>
        <li>There is no account, saved history across visits, or LMS connection.</li>
        <li>No claim is made that using the demo improves real workplace performance.</li>
      </ul>
    </article>
  )
}
