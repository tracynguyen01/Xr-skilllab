import { HERO_CAPTION, HERO_EYEBROW, HERO_HEADLINE, HERO_SUBHEAD, INDEPENDENCE_DISCLAIMER } from '../app/copy'
import { usePageTitle } from '../app/usePageTitle'
import { Button } from '../components/Button'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
import { POINTS_FOR_CORRECT_ACTION, POINTS_FOR_IDENTIFYING } from '../domain/scoring'
import { WarehousePreview } from '../simulation/Warehouse2D'

const STEPS = [
  {
    number: '01',
    title: 'Explore',
    text: 'Inspect the warehouse in 3D, or use the accessible 2D scene. Both use the same hazards.',
  },
  {
    number: '02',
    title: 'Decide',
    text: 'Open each hazard and choose the response you would take. Decoys are there to check, and they score nothing.',
  },
  {
    number: '03',
    title: 'Improve',
    text: 'Read a transparent score and Scenario Coach notes written from your answers by local rules.',
  },
]

export function HomePage() {
  usePageTitle('XR SkillLab')

  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">{HERO_EYEBROW}</p>
          <h1>{HERO_HEADLINE}</h1>
          <p className="lede">{HERO_SUBHEAD}</p>
          <div className="hero-actions">
            <Button to="/simulate">Start the Simulation</Button>
            <Button to="/how-it-works" variant="secondary">
              How It Works
            </Button>
          </div>
          <p className="caption">{HERO_CAPTION}</p>
          <ul className="expect">
            <li>Four hazards, designed to take a few minutes</li>
            <li>Score out of 100, with the points shown</li>
            <li>Full keyboard path, no headset</li>
          </ul>
        </div>
        <div className="hero-visual">
          <WarehousePreview />
        </div>
      </section>

      <section className="band" aria-label="What this version includes">
        <div className="wrap">
          <ul className="strip">
            <li>3D warehouse</li>
            <li>Accessible 2D scene</li>
            <li>Transparent scoring</li>
            <li>Offline Scenario Coach</li>
          </ul>
          <p className="band-note">No account required. An optional AI coach is not connected, and it would not be able to change the score.</p>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <p className="eyebrow">The loop</p>
          <h2>Three steps. One short exercise.</h2>
        </div>
        <ol className="steps">
          {STEPS.map((step) => (
            <li key={step.number} className="step-card">
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section wrap split">
        <div>
          <p className="eyebrow">Scoring</p>
          <h2>A score you can explain</h2>
          <p className="lede">
            Each hazard is worth 25 points: {POINTS_FOR_IDENTIFYING} for assessing it, and {POINTS_FOR_CORRECT_ACTION} if
            the action matches the scenario. Time is not scored. Checking a decoy does not add or remove points.
          </p>
          <ul className="rule-list">
            {WAREHOUSE_HAZARDS.map((hazard) => (
              <li key={hazard.id}>
                <span>{hazard.title}</span>
                <span className="rule-points">15 + 10</span>
              </li>
            ))}
          </ul>
          <p className="fine-print">
            This is the marking rule, not a measured learner result. Your own score appears only after you finish an
            attempt.
          </p>
        </div>
        <div className="coach-sample card">
          <p className="eyebrow">Scenario Coach</p>
          <h3>Feedback from the answers you actually gave</h3>
          <p>The coach fills this shape from your result. It does not call an AI service.</p>
          <ol className="coach-shape">
            <li>A count of hazards identified and preferred actions chosen.</li>
            <li>What went well, only where the preferred action was selected.</li>
            <li>What to practise, naming missed hazards and weaker choices.</li>
            <li>One next step for another attempt.</li>
          </ol>
          <Button to="/simulate">Start the Simulation</Button>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <p className="eyebrow">In this version</p>
          <h2>Built as a static learning prototype</h2>
        </div>
        <ul className="chips" aria-label="Technologies in this version">
          <li>React</li>
          <li>A-Frame</li>
          <li>TypeScript</li>
          <li>Vite</li>
          <li>Deterministic scoring</li>
          <li>Vitest</li>
        </ul>
        <ul className="chips chips-future" aria-label="Roadmap technologies">
          <li>AI Worker · roadmap</li>
        </ul>
        <p className="independence">{INDEPENDENCE_DISCLAIMER}</p>
      </section>
    </>
  )
}
