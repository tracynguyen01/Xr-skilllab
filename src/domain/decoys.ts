import type { Decoy } from './types'

const SOURCE_NOTE =
  'Scene dressing for illustrative rubric demo-v1. This is not a claim that any real workplace is compliant.'

/** Interactive checks that are not hazards. They never change the score. */
export const DECOYS: readonly Decoy[] = [
  {
    id: 'secured-extinguisher',
    title: 'Mounted fire extinguisher',
    shortDescription: 'A fire extinguisher is mounted on the wall, with clear space around it.',
    inspectionMessage: 'No issue found here',
    explanation:
      'In this illustration the extinguisher is mounted and the space in front of it is clear. It is a decoy, not one of the four scored hazards. A real check would still follow the site’s own equipment inspection rules.',
    sourceReference: SOURCE_NOTE,
  },
  {
    id: 'clear-aisle',
    title: 'Clear marked aisle',
    shortDescription: 'Cartons in this aisle are stacked squarely and the walking space is open.',
    inspectionMessage: 'No issue found here',
    explanation:
      'This part of the illustration is tidy on purpose. It is a decoy, not a scored hazard. The exercise is about the four defined unsafe conditions, not about declaring a real aisle safe.',
    sourceReference: SOURCE_NOTE,
  },
]

export function getDecoy(decoyId: string): Decoy | undefined {
  return DECOYS.find((decoy) => decoy.id === decoyId)
}
