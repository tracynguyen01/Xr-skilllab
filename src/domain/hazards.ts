import type { Hazard } from './types'

export const SCENARIO_ID = 'warehouse-safety-v1' as const
export const SCENARIO_VERSION = 'demo-v1'
export const RUBRIC_VERSION = 'demo-v1'

const SOURCE_NOTE =
  'Illustrative rubric demo-v1, written for this educational prototype and not yet reviewed by a safety professional. This is not a legal or compliance determination.'

/**
 * The four scored hazards. Edit this file to change training content.
 * Do not copy these strings into components.
 */
export const WAREHOUSE_HAZARDS: readonly Hazard[] = [
  {
    id: 'blocked-exit',
    title: 'Blocked Emergency Exit',
    shortDescription: 'Boxes are stacked across the path of a marked emergency exit.',
    educationalExplanation:
      'People need a clear way out in an emergency. Goods stored in an exit route can slow or block evacuation.',
    hotspot: { x: 4.2, y: 1.5, z: -5.2 },
    choices: [
      {
        id: 'ignore',
        label: 'Move past the boxes; the exit will probably be usable when needed.',
        feedback:
          'Leaving the boxes in place keeps the exit blocked. An emergency is the wrong moment to find out the route cannot be used.',
      },
      {
        id: 'report',
        label: 'Flag the obstruction and have the exit route made clear under site procedure.',
        feedback:
          'This matches the scenario guidance. Marking the obstruction and arranging for the route to be cleared under the site’s procedure deals with the blockage without asking an untrained person to move a load that may be heavy or unstable.',
      },
      {
        id: 'lock',
        label: 'Lock the exit so no one tries to use it.',
        feedback:
          'Locking the exit removes a way out. The illustrative response is to clear the route, not to stop people using it.',
      },
    ],
    correctChoiceId: 'report',
    rubricVersion: RUBRIC_VERSION,
    sourceReference: `${SOURCE_NOTE} Learning point: keep marked exit routes clear.`,
  },
  {
    id: 'floor-spill',
    title: 'Liquid Spill on the Walkway',
    shortDescription: 'A puddle sits on the marked pedestrian route.',
    educationalExplanation:
      'Liquid on a walking route can cause slips and falls if people are not warned and the spill is left unmanaged.',
    hotspot: { x: 0.4, y: 0.05, z: 1.2 },
    choices: [
      {
        id: 'leave',
        label: 'Walk around it and leave the spill for the next shift.',
        feedback:
          'Walking around it may keep you clear for a moment, but the spill stays on the route for the next person. The risk has not been dealt with.',
      },
      {
        id: 'isolate',
        label: 'Isolate and mark the area, then follow the approved spill-response procedure.',
        feedback:
          'This matches the scenario guidance. Marking the area warns other people while the site’s procedure decides who cleans the spill and with what equipment.',
      },
      {
        id: 'mop',
        label: 'Mop it up yourself without checking what the liquid is.',
        feedback:
          'Cleaning an unknown liquid without the site procedure can spread it or increase exposure. The illustrative response is to isolate the area and follow the approved procedure, not to improvise a cleanup.',
      },
    ],
    correctChoiceId: 'isolate',
    rubricVersion: RUBRIC_VERSION,
    sourceReference: `${SOURCE_NOTE} Learning point: isolate a spill and follow the site’s spill procedure.`,
  },
  {
    id: 'unstable-load',
    title: 'Unstable Pallet Stack',
    shortDescription: 'Boxes on a pallet are tilted, and the top of the stack overhangs the pallet edge.',
    educationalExplanation:
      'An unstable or overhanging stack can fall and strike someone working or walking nearby.',
    hotspot: { x: -1.6, y: 0.8, z: 0.4 },
    choices: [
      {
        id: 'pass',
        label: 'Keep walking past; the stack looks steady enough.',
        feedback:
          'Tilt and overhang are signs the load may fall. Leaving it unchecked keeps that risk in the aisle.',
      },
      {
        id: 'restrict',
        label: 'Restrict access and report the unstable stack so it can be corrected safely.',
        feedback:
          'This matches the scenario guidance. Keeping people out of the area and escalating the correction avoids asking an untrained visitor to restack a load that could fall.',
      },
      {
        id: 'climb',
        label: 'Climb the stack and push the top boxes back into place.',
        feedback:
          'Climbing onto an unstable stack, or pushing it, can bring the load down. The illustrative response is to restrict access and report it for a safe correction.',
      },
    ],
    correctChoiceId: 'restrict',
    rubricVersion: RUBRIC_VERSION,
    sourceReference: `${SOURCE_NOTE} Learning point: keep people away and have an unstable load corrected through the site’s procedure.`,
  },
  {
    id: 'forklift-crossing',
    title: 'Forklift and Pedestrian Conflict',
    shortDescription: 'A forklift is operating beside an unprotected stretch of the pedestrian walkway.',
    educationalExplanation:
      'People and industrial vehicles are safer when their routes are separated, so they are not in the same space at the same time.',
    hotspot: { x: 2.4, y: 0.9, z: 1.6 },
    choices: [
      {
        id: 'dash',
        label: 'Hurry across in front of the forklift while the driver is looking away.',
        feedback:
          'Stepping in front of an industrial vehicle increases the chance of being hit. Do not enter its path to save time.',
      },
      {
        id: 'separate',
        label: 'Use the designated separated crossing and the site’s traffic controls.',
        feedback:
          'This matches the scenario guidance. A separated crossing and the site’s traffic rules are there to keep pedestrians out of the vehicle’s path.',
      },
      {
        id: 'paint',
        label: 'Treat the walkway as safe because it is painted on the floor.',
        feedback:
          'Floor paint does not separate people from a vehicle that has moved onto the walking route. Use the designated crossing and the site’s traffic controls.',
      },
    ],
    correctChoiceId: 'separate',
    rubricVersion: RUBRIC_VERSION,
    sourceReference: `${SOURCE_NOTE} Learning point: use designated crossings and the site’s traffic controls.`,
  },
]

export function getHazard(hazardId: string): Hazard | undefined {
  return WAREHOUSE_HAZARDS.find((hazard) => hazard.id === hazardId)
}
