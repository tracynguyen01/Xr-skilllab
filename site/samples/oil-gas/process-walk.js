/**
 * Oil & Gas process walk — the six stations actually drawn on the pad.
 * Illustrative separation slice only. Not exploration, drilling, compression,
 * metering, or a pipeline, and not a scored hazard.
 */

export const STAGE_DISCLAIMER =
  'This station is illustrative. It is not a real facility, a live digital twin, a certified procedure, or AI coaching.'

const RAW_STAGES = [
  {
    id: 'stage-inlet',
    preset: 'stage-inlet',
    marker: '1  Inlet',
    name: 'Inlet / wellhead',
    short: 'Inlet',
    scale: 1.7,
    anchor: [-8.2, 3.0, 5.2],
    purpose:
      'The illustrated inlet on this pad: a wellhead where a fictional wellstream arrives and is handed to the separator train.',
    relevance:
      'This is the start of the separation slice drawn in the scene. Exploration, drilling, and bringing a real well on stream are not playable here.',
    stand: { x: -4.6, y: 0, z: 8.6, look: [-8.2, 1.4, 5.2] },
  },
  {
    id: 'stage-separator',
    preset: 'stage-separator',
    marker: '2  Separator',
    name: 'Separator',
    short: 'Separator',
    scale: 1.85,
    anchor: [-6.2, 3.6, -3.4],
    purpose:
      'The illustrated separator train: vessels that split gas and liquids before the pipe rack. This is the production and separation slice of the pad, not the whole industry lifecycle.',
    relevance:
      'It shows the idea of separation on a fictional pad. It is not a process design, a vessel rating, or an operating limit.',
    stand: { x: -1.8, y: 0, z: 1.8, look: [-6.2, 1.6, -2.2] },
  },
  {
    id: 'stage-rack',
    preset: 'stage-rack',
    marker: '3  Pipe rack',
    name: 'Pipe rack',
    short: 'Pipe rack',
    scale: 1.85,
    anchor: [0.2, 3.85, -0.15],
    purpose:
      'The illustrated rack that carries process pipe from the separator toward the pumps, with a branch toward the flare.',
    relevance:
      'A layout cue on this fictional pad. It is not a piping class, a stress model, or a permit to work.',
    stand: { x: 0.4, y: 0, z: 6.4, look: [0.2, 1.8, 0] },
  },
  {
    id: 'stage-pumps',
    preset: 'stage-pumps',
    marker: '4  Transfer pumps',
    name: 'Transfer pumps',
    short: 'Pumps',
    scale: 1.85,
    anchor: [0.6, 2.55, 4.5],
    purpose:
      'The illustrated pumps that move liquid onward toward a short export stub on this pad.',
    relevance:
      'They sit after the pipe rack in this teaching layout. They are not a pump curve, a start-up procedure, or an isolation certificate.',
    stand: { x: 0.5, y: 0, z: 8.4, look: [0.6, 1.0, 4.2] },
  },
  {
    id: 'stage-flare',
    preset: 'stage-flare',
    marker: '5  Flare',
    name: 'Flare',
    short: 'Flare',
    scale: 1.7,
    anchor: [8.6, 9.4, -6.2],
    purpose:
      'The illustrated relief path: a lighter pipe from the rack up to a lit flare stack.',
    relevance:
      'The flame is part of the teaching scene. It is not a flare study, a radiation contour, or a relief-system design.',
    stand: { x: 3.6, y: 0, z: -1.4, look: [8.6, 3.2, -6.2] },
  },
  {
    id: 'stage-export',
    preset: 'stage-export',
    marker: '6  Export',
    name: 'Export',
    short: 'Export',
    scale: 1.65,
    anchor: [10.3, 1.35, 4.5],
    purpose:
      'A short illustrated stub leaving the pump skid, showing where product would leave this pad slice.',
    relevance:
      'The stub is not a compressor, a meter, or a pipeline. Compression and metering, and pipeline and export, stay context on the page and are not playable in this scene.',
    stand: { x: 6.2, y: 0, z: 8.2, look: [9.4, 0.8, 4.7] },
  },
]

export const STAGES = RAW_STAGES.map((stage, index) => ({
  ...stage,
  index,
  n: index + 1,
  disclaimer: STAGE_DISCLAIMER,
}))

export function stageById(id) {
  return STAGES.find((stage) => stage.id === id) || null
}

/** Step along the chain. Null starts at the inlet. Ends do not wrap. */
export function stepStage(stages, id, delta) {
  const list = stages && stages.length ? stages : STAGES
  const dir = delta < 0 ? -1 : 1
  if (!id) return list[0]
  const index = list.findIndex((stage) => stage.id === id)
  if (index < 0) return list[0]
  const next = index + dir
  if (next < 0 || next >= list.length) return list[index]
  return list[next]
}

/**
 * Ask whether an immersive VR session can start.
 * Does not call requestSession — the Headset button does that on click.
 * @param {XRSystem | { isSessionSupported?: (mode: string) => Promise<boolean> } | null | undefined} [xr]
 */
export async function immersiveVrSupported(xr) {
  const source = arguments.length ? xr : (typeof navigator !== 'undefined' ? navigator.xr : undefined)
  try {
    if (!source || typeof source.isSessionSupported !== 'function') return false
    return !!(await source.isSessionSupported('immersive-vr'))
  } catch {
    return false
  }
}

/**
 * Reference-space offset so a headset visitor stands at `stand`, facing `look`.
 * Position follows the Three.js teleport example: the negation of the stand point.
 * @param {{ x: number, y?: number, z: number, look: number[] }} stand
 */
export function xrOffsetPose(stand) {
  const dx = stand.look[0] - stand.x
  const dz = stand.look[2] - stand.z
  const yaw = Math.atan2(dx, -dz)
  const half = -yaw / 2
  return {
    yaw,
    position: { x: -stand.x, y: 0, z: -stand.z },
    orientation: { x: 0, y: Math.sin(half), z: 0, w: Math.cos(half) },
  }
}

/**
 * World pose for the in-headset station card, between the visitor and the equipment.
 * PlaneGeometry faces +Z; `yaw` turns that normal toward the visitor.
 * @param {{ x: number, z: number, look: number[] }} stand
 */
export function boardPose(stand) {
  const dx = stand.look[0] - stand.x
  const dz = stand.look[2] - stand.z
  const len = Math.hypot(dx, dz) || 1
  const dist = Math.min(1.45, Math.max(1.05, len * 0.34))
  const x = stand.x + (dx / len) * dist
  const z = stand.z + (dz / len) * dist
  const fx = stand.x - x
  const fz = stand.z - z
  return { x, y: 1.32, z, yaw: Math.atan2(fx, fz) }
}

if (typeof window !== 'undefined') {
  window.OG_PROCESS = {
    STAGES,
    STAGE_DISCLAIMER,
    stageById,
    stepStage,
    immersiveVrSupported,
    xrOffsetPose,
    boardPose,
  }
}
