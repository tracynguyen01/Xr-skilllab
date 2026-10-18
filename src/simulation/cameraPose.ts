/**
 * Opening shot, from in front of the warehouse, looking down into the room.
 *
 * Pitch is negative on purpose. In A-Frame (Three.js order YXZ) a positive
 * rotation around X looks up. The last opening shot used a positive pitch,
 * so the camera stared at the ceiling.
 */
export const ESTABLISHING_VIEW = {
  position: '1.1 3.5 6.4',
  rotation: '-21.11 11.31 0',
}

/** A little further back and higher. The rig eases from here into ESTABLISHING_VIEW. */
export const GLIDE_START = {
  position: '1.45 4.15 7.3',
  rotation: '-22.64 12.36 0',
}

export const WALK_EYE_HEIGHT = 1.65

export const RESET_VIEW_EVENT = 'xr-skilllab-reset-view'
