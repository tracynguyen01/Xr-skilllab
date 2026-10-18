/**
 * The opening shot. High and off to one side, looking across the room,
 * so every marker is in frame. Walk mode later drops the camera to eye height.
 */
export const ESTABLISHING_VIEW = {
  position: '4.15 2.95 2.35',
  rotation: '20.47 43.71 0',
}

/** A little further back. The camera eases from here into ESTABLISHING_VIEW. */
export const GLIDE_START = {
  position: '5.05 3.55 3.15',
  rotation: '21.48 44.46 0',
}

export const WALK_EYE_HEIGHT = 1.65

export const RESET_VIEW_EVENT = 'xr-skilllab-reset-view'
