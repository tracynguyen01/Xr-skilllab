import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COMING_SOON, RESTORE_ERROR, SIM_BODY, SIM_NOTE, SIM_TITLE } from '../app/copy'
import { useSession } from '../app/useSession'
import { usePageTitle } from '../app/usePageTitle'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DecoyDialog, HazardDialog } from '../components/HazardDialog'
import { getDecoy } from '../domain/decoys'
import { getHazard, WAREHOUSE_HAZARDS } from '../domain/hazards'
import { elapsedSeconds, formatElapsed } from '../domain/time'
import { useElapsedNow } from '../components/useElapsedNow'
import { useDialogFocus } from '../components/useDialogFocus'
import { InspectionList, Warehouse2D, WarehousePreview } from '../simulation/Warehouse2D'

export function SimulationPage() {
  usePageTitle('Demo')
  const navigate = useNavigate()
  const { attempt, restoreError, startAttempt, submitAnswer, markDecoy, finishAttempt, resetAttempt } = useSession()

  if (!attempt) {
    return (
      <section className="wrap sim-intro-layout">
        <div className="intro-art" aria-hidden="true">
          <WarehousePreview />
        </div>
        <div className="sim-intro card">
          {restoreError ? (
            <p className="form-error" role="status">
              {RESTORE_ERROR}
            </p>
          ) : null}
          <p className="eyebrow">Demo</p>
          <h1>{SIM_TITLE}</h1>
          <p className="lede">{SIM_BODY}</p>
          <p className="note">{SIM_NOTE}</p>
          <button type="button" className="btn btn-primary" onClick={startAttempt}>
            Use 2D Inspector
          </button>
          <aside className="coming-soon">
            <p className="badge badge-future">Coming soon</p>
            <h2>3D mode</h2>
            <p>{COMING_SOON}</p>
          </aside>
        </div>
      </section>
    )
  }

  return (
    <ActiveSimulation
      onFinish={() => {
        finishAttempt()
        navigate('/results')
      }}
      onReset={resetAttempt}
      onSubmit={submitAnswer}
      onInspect={markDecoy}
    />
  )
}

type ActiveProps = {
  onFinish: () => void
  onReset: () => void
  onSubmit: (hazardId: string, choiceId: string) => void
  onInspect: (decoyId: string) => void
}

function ActiveSimulation({ onFinish, onReset, onSubmit, onInspect }: ActiveProps) {
  const { attempt } = useSession()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const now = useElapsedNow(Boolean(attempt && !attempt.endedAt))

  if (!attempt) return null

  const assessed = Object.keys(attempt.answers).length
  const seconds = elapsedSeconds(attempt.startedAt, attempt.endedAt, now)
  const hazard = activeId ? getHazard(activeId) : undefined
  const decoy = activeId ? getDecoy(activeId) : undefined

  function select(id: string) {
    if (getDecoy(id)) onInspect(id)
    setActiveId(id)
  }

  function requestFinish() {
    if (assessed < WAREHOUSE_HAZARDS.length) {
      setFinishOpen(true)
      return
    }
    onFinish()
  }

  return (
    <section className="wrap sim-layout">
      <div className="sim-stage">
        <Warehouse2D attempt={attempt} onSelect={select} />
        <p className="scene-help">Select a marked point, or use the inspection list. Tab moves between them. Escape closes a dialog.</p>
      </div>

      <aside className="sim-panel card">
        <p className="eyebrow">Objective</p>
        <h1>{SIM_TITLE}</h1>
        <p>Look around the scene and select anything that appears unsafe.</p>
        <p className="progress" aria-live="polite">
          Hazards assessed: {assessed} of {WAREHOUSE_HAZARDS.length}
        </p>
        <div className="segments" aria-hidden="true">
          {WAREHOUSE_HAZARDS.map((item) => (
            <span key={item.id} className={attempt.answers[item.id] ? 'is-on' : ''} />
          ))}
        </div>
        <p className="timer">
          <span className="timer-value">{formatElapsed(seconds)}</span>
          <span className="timer-note">Time elapsed. Informational only — not part of the score.</span>
        </p>
        <div className="panel-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setHelpOpen(true)}>
            Instructions
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setResetOpen(true)}>
            Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={requestFinish}>
            Finish Assessment
          </button>
        </div>
        <h2 className="list-heading">Inspection list</h2>
        <InspectionList attempt={attempt} onSelect={select} />
        <aside className="coming-soon coming-soon-compact">
          <p className="badge badge-future">Coming soon</p>
          <p>{COMING_SOON}</p>
        </aside>
      </aside>

      {hazard ? (
        <HazardDialog
          hazard={hazard}
          answer={attempt.answers[hazard.id]}
          onSubmit={(choiceId) => onSubmit(hazard.id, choiceId)}
          onClose={() => setActiveId(null)}
        />
      ) : null}
      {decoy ? <DecoyDialog decoy={decoy} onClose={() => setActiveId(null)} /> : null}
      {helpOpen ? (
        <HelpDialog onClose={() => setHelpOpen(false)} />
      ) : null}
      {resetOpen ? (
        <ConfirmDialog
          title="Reset this attempt?"
          body="Your answers, checked points, and timer will be cleared."
          confirmLabel="Clear answers"
          cancelLabel="Cancel"
          onConfirm={() => {
            setResetOpen(false)
            setActiveId(null)
            onReset()
          }}
          onClose={() => setResetOpen(false)}
        />
      ) : null}
      {finishOpen ? (
        <ConfirmDialog
          title="Finish with hazards still open?"
          body={`You have assessed ${assessed} of ${WAREHOUSE_HAZARDS.length}. Unassessed hazards score 0.`}
          confirmLabel="Finish anyway"
          cancelLabel="Keep inspecting"
          onConfirm={() => {
            setFinishOpen(false)
            onFinish()
          }}
          onClose={() => setFinishOpen(false)}
        />
      ) : null}
    </section>
  )
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useDialogFocus(onClose)
  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="help-title">{SIM_TITLE}</h2>
        <p>{SIM_BODY}</p>
        <p>{SIM_NOTE}</p>
        <p>Having trouble with the picture? Every point is also in the inspection list.</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
