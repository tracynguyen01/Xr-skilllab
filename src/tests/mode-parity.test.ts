import { describe, expect, it } from 'vitest'
import { DECOYS } from '../domain/decoys'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
import { scoreAttempt } from '../domain/scoring'
import { createAttempt, setAttemptMode, submitHazardAnswer } from '../domain/session'
import { primaryView } from '../simulation/viewChoice'
import { warehouseMarkup } from '../simulation/warehouseMarkup'

const NOW = '2026-10-18T00:00:00.000Z'

describe('3D and 2D share one score', () => {
  it('scores the same selections whether they were made in 3D or 2D', () => {
    let from3d = createAttempt('3d', NOW)
    let from2d = createAttempt('2d', NOW)

    for (const hazard of WAREHOUSE_HAZARDS) {
      from3d = submitHazardAnswer(from3d, hazard.id, hazard.correctChoiceId, NOW).attempt
      from2d = submitHazardAnswer(from2d, hazard.id, hazard.correctChoiceId, NOW).attempt
    }

    const threeD = scoreAttempt(from3d)
    const twoD = scoreAttempt(from2d)
    expect(threeD.score).toBe(100)
    expect(twoD).toEqual(threeD)
    expect(from3d.mode).toBe('3d')
    expect(from2d.mode).toBe('2d')
  })

  it('keeps the recorded answers when the view changes', () => {
    const started = submitHazardAnswer(createAttempt('3d', NOW), 'blocked-exit', 'report', NOW).attempt
    const switched = setAttemptMode(started, '2d')
    expect(switched.mode).toBe('2d')
    expect(switched.answers).toEqual(started.answers)
    expect(scoreAttempt(switched)).toEqual(scoreAttempt(started))
    expect(setAttemptMode(switched, '2d')).toBe(switched)
  })
})

describe('3D rings use the shared scenario positions', () => {
  it('does not keep a second copy of the hazard coordinates', () => {
    const spots = [
      ...WAREHOUSE_HAZARDS.map((hazard) => ({ id: hazard.id, kind: 'hazard' as const, hotspot: hazard.hotspot })),
      ...DECOYS.map((decoy) => ({ id: decoy.id, kind: 'decoy' as const, hotspot: decoy.hotspot })),
    ]
    const html = warehouseMarkup(spots, true)
    for (const spot of spots) {
      expect(html).toContain(`data-hotspot="${spot.id}"`)
      expect(html).toContain(`position="${spot.hotspot.x} 0 ${spot.hotspot.z}"`)
    }
  })
})

describe('which view the intro offers first', () => {
  it('uses 3D on a wide screen only when WebGL works', () => {
    expect(primaryView(1280, true)).toBe('3d')
    expect(primaryView(1024, true)).toBe('3d')
    expect(primaryView(1023, true)).toBe('2d')
    expect(primaryView(390, true)).toBe('2d')
    expect(primaryView(1440, false)).toBe('2d')
  })
})
