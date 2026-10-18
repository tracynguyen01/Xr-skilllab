import { describe, expect, it } from 'vitest'
import { DECOYS } from '../domain/decoys'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
import { SCENE_MARKERS } from '../simulation/sceneObjects'

describe('scenario content', () => {
  it('defines four hazards with three explained choices and a source note', () => {
    expect(WAREHOUSE_HAZARDS).toHaveLength(4)
    const ids = WAREHOUSE_HAZARDS.map((hazard) => hazard.id)
    expect(new Set(ids).size).toBe(4)

    for (const hazard of WAREHOUSE_HAZARDS) {
      expect(hazard.choices).toHaveLength(3)
      expect(hazard.choices.map((choice) => choice.id)).toContain(hazard.correctChoiceId)
      expect(hazard.sourceReference.length).toBeGreaterThan(20)
      expect(hazard.educationalExplanation.length).toBeGreaterThan(20)
      for (const choice of hazard.choices) {
        expect(choice.label.length).toBeGreaterThan(10)
        expect(choice.feedback.length).toBeGreaterThan(20)
      }
    }
  })

  it('includes at least two decoys that say no issue was found', () => {
    expect(DECOYS.length).toBeGreaterThanOrEqual(2)
    for (const decoy of DECOYS) {
      expect(decoy.inspectionMessage).toBe('No issue found here')
    }
  })

  it('places every hazard and decoy on the 2D scene', () => {
    const markerIds = SCENE_MARKERS.map((marker) => marker.id)
    for (const hazard of WAREHOUSE_HAZARDS) expect(markerIds).toContain(hazard.id)
    for (const decoy of DECOYS) expect(markerIds).toContain(decoy.id)
  })
})
