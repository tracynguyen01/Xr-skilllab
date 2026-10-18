/**
 * 2D marker positions, as percentages of the illustration.
 * WarehouseArt draws the objects at these same points, and Warehouse2D
 * places the buttons here. The 3D coordinates live on each hazard instead.
 */

export type MarkerId =
  | 'blocked-exit'
  | 'floor-spill'
  | 'unstable-load'
  | 'forklift-crossing'
  | 'secured-extinguisher'
  | 'clear-aisle'

export type SceneMarker = {
  id: MarkerId
  kind: 'hazard' | 'decoy'
  shortLabel: string
  x: number
  y: number
  /** Which side of the dot the short label sits on, so it stays inside the frame. */
  labelSide: 'left' | 'right'
}

export const SCENE_MARKERS: readonly SceneMarker[] = [
  { id: 'secured-extinguisher', kind: 'decoy', shortLabel: 'Extinguisher', x: 18, y: 30, labelSide: 'right' },
  { id: 'clear-aisle', kind: 'decoy', shortLabel: 'Clear aisle', x: 30, y: 48, labelSide: 'right' },
  { id: 'blocked-exit', kind: 'hazard', shortLabel: 'Exit blocked', x: 73, y: 28, labelSide: 'left' },
  { id: 'unstable-load', kind: 'hazard', shortLabel: 'Unstable load', x: 44, y: 58, labelSide: 'left' },
  { id: 'forklift-crossing', kind: 'hazard', shortLabel: 'Forklift', x: 74, y: 60, labelSide: 'left' },
  { id: 'floor-spill', kind: 'hazard', shortLabel: 'Spill', x: 56, y: 74, labelSide: 'right' },
]
