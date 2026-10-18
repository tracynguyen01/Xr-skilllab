import { DECOYS } from '../domain/decoys'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
import type { Attempt } from '../domain/types'
import { SCENE_MARKERS } from './sceneObjects'
import { WarehouseArt } from './WarehouseArt'

type Warehouse2DProps = {
  attempt: Attempt
  onSelect: (id: string) => void
}

function titleFor(id: string): string {
  return (
    WAREHOUSE_HAZARDS.find((hazard) => hazard.id === id)?.title ??
    DECOYS.find((decoy) => decoy.id === id)?.title ??
    id
  )
}

function statusFor(id: string, kind: 'hazard' | 'decoy', attempt: Attempt): string {
  if (kind === 'hazard') return attempt.answers[id] ? 'Assessed' : 'Not yet assessed'
  return attempt.inspectedDecoyIds.includes(id) ? 'No issue found here' : 'Check this point'
}

export function WarehousePreview() {
  return (
    <figure className="scene-figure">
      <div className="scene-frame">
        <div className="scene-chrome">
          <span className="chrome-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>warehouse-safety-v1</span>
          <span className="chrome-tag">Illustrative</span>
        </div>
        <div className="scene-stage">
          <WarehouseArt />
          {SCENE_MARKERS.map((marker, index) => (
            <span
              key={marker.id}
              className={`hotspot-pin ${marker.kind === 'hazard' ? 'is-hazard' : 'is-decoy'} align-${marker.labelSide}`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              aria-hidden="true"
            >
              <span className="pin-dot">{index + 1}</span>
              <span className="pin-label">{marker.shortLabel}</span>
            </span>
          ))}
        </div>
      </div>
      <figcaption>Illustrative warehouse for the safety challenge. Not a photograph of a real site.</figcaption>
    </figure>
  )
}

export function Warehouse2D({ attempt, onSelect }: Warehouse2DProps) {
  return (
    <div className="scene-frame">
      <div className="scene-chrome">
        <span className="chrome-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>2D inspector</span>
        <span className="chrome-tag">Keyboard ready</span>
      </div>
      <div className="scene-stage">
        <WarehouseArt />
        {SCENE_MARKERS.map((marker) => {
          const assessed = marker.kind === 'hazard' && Boolean(attempt.answers[marker.id])
          const inspected = marker.kind === 'decoy' && attempt.inspectedDecoyIds.includes(marker.id)
          const status = statusFor(marker.id, marker.kind, attempt)
          return (
            <button
              key={marker.id}
              type="button"
              className={`hotspot align-${marker.labelSide} ${assessed ? 'is-assessed' : ''} ${inspected ? 'is-inspected' : ''} ${marker.kind === 'hazard' ? 'is-hazard' : 'is-decoy'}`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={() => onSelect(marker.id)}
              aria-label={`${titleFor(marker.id)}. ${status}`}
            >
              <span className="hotspot-dot" aria-hidden="true">
                {assessed || inspected ? '✓' : ''}
              </span>
              <span className="hotspot-name">{marker.shortLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function InspectionList({ attempt, onSelect }: Warehouse2DProps) {
  const hazards = WAREHOUSE_HAZARDS.map((hazard) => ({
    id: hazard.id,
    title: hazard.title,
    detail: hazard.shortDescription,
    status: statusFor(hazard.id, 'hazard', attempt),
    kind: 'Hazard' as const,
  }))
  const decoys = DECOYS.map((decoy) => ({
    id: decoy.id,
    title: decoy.title,
    detail: decoy.shortDescription,
    status: statusFor(decoy.id, 'decoy', attempt),
    kind: 'Check' as const,
  }))

  return (
    <ul className="inspect-list" aria-label="Inspection list">
      {[...hazards, ...decoys].map((item) => (
        <li key={item.id}>
          <button type="button" onClick={() => onSelect(item.id)}>
            <span className="list-kind">{item.kind}</span>
            <span className="list-copy">
              <span className="list-title">{item.title}</span>
              <span className="list-detail">{item.detail}</span>
            </span>
            <span className={`list-status ${item.status === 'Assessed' ? 'is-assessed' : ''} ${item.status === 'No issue found here' ? 'is-clear' : ''}`}>
              {item.status}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
