import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  REDUCED_MOTION_NOTE,
  RESTORE_ERROR,
  SCENE_INSTRUCTIONS_2D,
  SCENE_INSTRUCTIONS_3D,
  SIM_BODY,
  SIM_NOTE,
  SIM_TITLE,
  WEBGL_FALLBACK,
} from '../app/copy'
import { useSession } from '../app/useSession'
import { usePageTitle } from '../app/usePageTitle'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DecoyDialog, HazardDialog } from '../components/HazardDialog'
import { useElapsedNow } from '../components/useElapsedNow'
import { DECOYS, getDecoy } from '../domain/decoys'
import { getHazard, WAREHOUSE_HAZARDS } from '../domain/hazards'
import { elapsedSeconds, formatElapsed } from '../domain/time'
import type { Attempt, SceneMode } from '../domain/types'
import { highlightHotspot } from '../simulation/hotspotHighlight'
import { InspectionList, Warehouse2D, WarehousePreview } from '../simulation/Warehouse2D'
import { canUseWebGL, prefersReducedMotion } from '../simulation/webgl'
import { primaryView } from '../simulation/viewChoice'

// The 3D code, including A-Frame, stays out of the main bundle until this runs.
const WarehouseScene = lazy(() => import('../simulation/WarehouseScene').then((mod) => ({ default: mod.WarehouseScene })))

export function SimulationPage() {
  usePageTitle('Demo')
  const navigate = useNavigate()
  const webgl = useState(() => canUseWebGL())[0]
  const width = useViewportWidth()
  const reducedMotion = useReducedMotion()
  const [sceneError, setSceneError] = useState(false)
  const { attempt, restoreError, startAttempt, setMode, submitAnswer, markDecoy, finishAttempt, resetAttempt } = useSession()

  if (!attempt) {
    const primary = primaryView(width, webgl && !sceneError)
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
          {webgl && !sceneError ? null : (
            <p className="form-error" role="status">
              {WEBGL_FALLBACK}
            </p>
          )}
          <div className="hero-actions">
            {primary === '3d' ? (
              <button type="button" className="btn btn-primary" onClick={() => startAttempt('3d')}>
                Begin in 3D
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => startAttempt('2d')}>
                Use 2D Inspector
              </button>
            )}
            {primary === '3d' ? (
              <button type="button" className="btn btn-secondary" onClick={() => startAttempt('2d')}>
                Use 2D Inspector
              </button>
            ) : null}
            {primary === '2d' && webgl && !sceneError ? (
              <button type="button" className="btn btn-secondary" onClick={() => startAttempt('3d')}>
                Try 3D
              </button>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  return (
    <ActiveSimulation
      attempt={attempt}
      webgl={webgl && !sceneError}
      reducedMotion={reducedMotion}
      onSceneError={() => {
        setSceneError(true)
        setMode('2d')
      }}
      onMode={(mode) => setMode(mode)}
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
  attempt: Attempt
  webgl: boolean
  reducedMotion: boolean
  onSceneError: () => void
  onMode: (mode: SceneMode) => void
  onFinish: () => void
  onReset: () => void
  onSubmit: (hazardId: string, choiceId: string) => void
  onInspect: (decoyId: string) => void
}

function ActiveSimulation({
  attempt,
  webgl,
  reducedMotion,
  onSceneError,
  onMode,
  onFinish,
  onReset,
  onSubmit,
  onInspect,
}: ActiveProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const now = useElapsedNow(Boolean(attempt && !attempt.endedAt))

  const assessed = Object.keys(attempt.answers).length
  const seconds = elapsedSeconds(attempt.startedAt, attempt.endedAt, now)
  const hazard = activeId ? getHazard(activeId) : undefined
  const decoy = activeId ? getDecoy(activeId) : undefined
  const show3d = attempt.mode === '3d' && webgl

  useEffect(() => {
    if (attempt.mode === '3d' && !webgl) onSceneError()
  }, [attempt.mode, webgl, onSceneError])

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
    <section className={show3d ? 'wrap sim-layout is-3d' : 'wrap sim-layout'}>
      <div className="sim-stage">
        {show3d ? (
          <Suspense fallback={<SceneLoading />}>
            <WarehouseScene
              assessedIds={Object.keys(attempt.answers)}
              inspectedIds={attempt.inspectedDecoyIds}
              reducedMotion={reducedMotion}
              onSelect={select}
              onUnavailable={onSceneError}
            />
          </Suspense>
        ) : (
          <Warehouse2D attempt={attempt} onSelect={select} />
        )}
        <p className="scene-help">{show3d ? SCENE_INSTRUCTIONS_3D : SCENE_INSTRUCTIONS_2D}</p>
      </div>

      <aside className="sim-panel card">
        <p className="eyebrow">Objective</p>
        <h1>{SIM_TITLE}</h1>
        <p>Look around the scene and select anything that appears unsafe.</p>
        <p className="progress" aria-live="polite">
          {assessed} / {WAREHOUSE_HAZARDS.length} hazards assessed
        </p>
        <div className="segments" aria-hidden="true">
          {WAREHOUSE_HAZARDS.map((item) => (
            <span key={item.id} className={attempt.answers[item.id] ? 'is-on' : ''} />
          ))}
        </div>
        <div className="view-switch" role="group" aria-label="Scene view">
          <button
            type="button"
            className={attempt.mode === '3d' ? 'is-on' : ''}
            aria-pressed={attempt.mode === '3d'}
            disabled={!webgl}
            onClick={() => onMode('3d')}
          >
            3D
          </button>
          <button
            type="button"
            className={attempt.mode === '2d' ? 'is-on' : ''}
            aria-pressed={attempt.mode === '2d'}
            onClick={() => onMode('2d')}
          >
            2D
          </button>
        </div>
        {!webgl ? (
          <p className="form-error" role="status">
            {WEBGL_FALLBACK}
          </p>
        ) : null}
        <p className="timer">
          <span className="timer-value">{formatElapsed(seconds)}</span>
          <span className="timer-note">Time elapsed. Informational only — not part of the score.</span>
        </p>
        <h2 className="list-heading">How to move</h2>
        <p>{show3d ? SCENE_INSTRUCTIONS_3D : SCENE_INSTRUCTIONS_2D}</p>
        {show3d && reducedMotion ? <p className="note">{REDUCED_MOTION_NOTE}</p> : null}
        <h2 className="list-heading">Action history</h2>
        <ActionHistory attempt={attempt} />
        <div className="panel-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setResetOpen(true)}>
            Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={requestFinish}>
            Finish Assessment
          </button>
        </div>
        <h2 className="list-heading">Inspection list</h2>
        <InspectionList attempt={attempt} onSelect={select} onHighlight={highlightHotspot} />
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

function ActionHistory({ attempt }: { attempt: Attempt }) {
  const items = [
    ...WAREHOUSE_HAZARDS.flatMap((hazard) => {
      const answer = attempt.answers[hazard.id]
      if (!answer) return []
      const choice = hazard.choices.find((item) => item.id === answer.choiceId)
      return [`${hazard.title}: ${choice?.label ?? 'Recorded'}`]
    }),
    ...DECOYS.filter((decoy) => attempt.inspectedDecoyIds.includes(decoy.id)).map(
      (decoy) => `${decoy.title}: ${decoy.inspectionMessage}`,
    ),
  ]

  if (items.length === 0) return <p className="fine-print">Nothing selected yet.</p>

  return (
    <ul className="history-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function SceneLoading() {
  return (
    <div className="scene-3d-frame">
      <p className="scene-loading" role="status">
        Loading the 3D warehouse…
      </p>
    </div>
  )
}

function useViewportWidth(): number {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    function onResize() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => prefersReducedMotion())
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    function onChange() {
      setReduced(query.matches)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}
