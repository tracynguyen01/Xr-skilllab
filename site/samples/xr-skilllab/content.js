// Warehouse Safety lesson data and scoring.
// Same shape as oil-gas/content.js so unit tests can share one pattern.

export const hazards = [
  {
    id: 'exit',
    title: 'Blocked Emergency Exit',
    context: 'Cartons are stacked in front of a marked emergency exit door.',
    options: [
      { text: 'Step around the boxes. The exit is still technically reachable.', ok: false, fb: 'In an emergency people move quickly and in numbers. A partly blocked exit slows everyone down and can trap people.' },
      { text: 'Report the obstruction and have the route cleared under site procedure.', ok: true, fb: 'Exit routes must stay clear at all times. Reporting it gets the obstruction removed safely and properly.' },
      { text: 'Lock the exit door until the boxes are moved.', ok: false, fb: 'Locking an emergency exit removes an escape route entirely and creates a far more serious hazard.' },
    ],
  },
  {
    id: 'spill',
    title: 'Liquid Spill on Walkway',
    context: 'A glossy liquid pool spreads across the edge of the pedestrian walkway.',
    options: [
      { text: 'Walk around it carefully and carry on.', ok: false, fb: 'Others may not see it. An unmanaged spill on a walkway is a common cause of slips and falls.' },
      { text: 'Cordon it off with a wet-floor sign and report it for clean-up under the spill procedure.', ok: true, fb: 'Warning others immediately and using the approved clean-up process controls the risk, especially if the substance is unknown.' },
      { text: 'Throw some cardboard over it to soak it up.', ok: false, fb: 'This hides the hazard, may not absorb it, and the substance could be harmful to handle.' },
    ],
  },
  {
    id: 'rack',
    title: 'Unstable Pallet Load',
    context: 'Cartons on an upper rack level are leaning and overhanging the beam.',
    options: [
      { text: 'Push the leaning boxes back into place by hand.', ok: false, fb: 'Disturbing an unstable load can bring it down on you. Correcting it needs the right equipment and people.' },
      { text: 'Keep people clear of the area and report it so it can be safely restacked.', ok: true, fb: 'Restricting access removes exposure to falling objects while trained staff correct the load.' },
      { text: "Leave it. It's been like that all morning.", ok: false, fb: "A load that hasn't fallen yet is still a falling-object hazard. Time doesn't make it safer." },
    ],
  },
  {
    id: 'forklift',
    title: 'Forklift–Pedestrian Conflict',
    context: 'A forklift is reversing across the walkway where there is no barrier or marked crossing.',
    options: [
      { text: 'Cross quickly while the forklift is reversing away.', ok: false, fb: "Reversing forklifts have limited visibility and can change direction. Never cross a moving vehicle's path." },
      { text: 'Wait, use the designated crossing point and confirm the driver has seen you.', ok: true, fb: 'Separating people from vehicles, and making eye contact before crossing, is a core traffic-management control.' },
      { text: 'Wave at the driver and walk behind the forklift.', ok: false, fb: "A wave isn't confirmation, and walking behind a vehicle puts you in its blind spot and reversing path." },
    ],
  },
]

// Ids only for scoring tests — display names live on `equipment` / `hotspots`.
export const decoys = {
  extinguisher: { title: 'Fire extinguisher', context: 'A wall-mounted extinguisher beside the workbench area.' },
  firstaid: { title: 'First-aid station', context: 'A first-aid cabinet on the right-hand wall.' },
  goodrack: { title: 'Rack bay 02', context: 'A fully loaded bay in the back racking row.' },
  bay01: { title: 'Rack bay 01', context: 'A loaded bay in the back racking row.' },
  bay03: { title: 'Rack bay 03', context: 'A partly loaded bay in the back racking row.' },
  bay04: { title: 'Rack bay 04', context: 'A loaded bay in the right-hand racking row.' },
  bay06: { title: 'Rack bay 06', context: 'A partly loaded bay in the right-hand racking row.' },
  pallets: { title: 'Floor-stacked pallets', context: 'Pallets staged near the loading dock.' },
  dock: { title: 'Loading dock', context: 'The roller door on the back wall.' },
  workbench: { title: 'Workbench', context: 'A workbench against the left-hand wall.' },
}

// Neutral Info-card copy — no cues about whether an object is a scored hazard.
export const equipment = {
  exit: {
    name: 'Emergency exit',
    purpose: 'A marked door on the warehouse wall in this illustration.',
    relevance: 'Cartons sit in front of the door frame in this scene.',
  },
  spill: {
    name: 'Pedestrian walkway',
    purpose: 'A painted walkway across the warehouse floor in this teaching scene.',
    relevance: 'A glossy patch sits on the edge of the walkway in this illustration.',
  },
  rack: {
    name: 'Rack bay 05',
    purpose: 'A storage bay on the right-hand racking row in this illustration.',
    relevance: 'Cartons on an upper level lean past the beam in this scene.',
  },
  forklift: {
    name: 'Forklift',
    purpose: 'A forklift used to move loads in this fictional warehouse.',
    relevance: 'The forklift is drawn reversing across the walkway in this scene.',
  },
  extinguisher: {
    name: 'Fire extinguisher',
    purpose: 'A portable extinguisher kept on the warehouse wall in this illustration.',
    relevance: 'It sits beside the workbench area on the left wall.',
  },
  firstaid: {
    name: 'First-aid station',
    purpose: 'A wall cabinet for first-aid supplies in this teaching scene.',
    relevance: 'The cabinet is mounted on the right-hand wall in this layout.',
  },
  goodrack: {
    name: 'Rack bay 02',
    purpose: 'A storage bay in the back racking row in this illustration.',
    relevance: 'This bay sits between bay 01 and bay 03 on the back wall.',
  },
  bay01: {
    name: 'Rack bay 01',
    purpose: 'A storage bay in the back racking row in this illustration.',
    relevance: 'This bay sits at the left end of the back racking row.',
  },
  bay03: {
    name: 'Rack bay 03',
    purpose: 'A storage bay in the back racking row in this illustration.',
    relevance: 'This bay sits at the right end of the back racking row.',
  },
  bay04: {
    name: 'Rack bay 04',
    purpose: 'A storage bay on the right-hand racking row in this illustration.',
    relevance: 'This bay sits above bay 05 on the right wall.',
  },
  bay06: {
    name: 'Rack bay 06',
    purpose: 'A storage bay on the right-hand racking row in this illustration.',
    relevance: 'This bay sits below bay 05 on the right wall.',
  },
  pallets: {
    name: 'Floor-stacked pallets',
    purpose: 'Pallets staged near the loading dock in this teaching scene.',
    relevance: 'The stack sits on the floor inside the storage area drawn here.',
  },
  dock: {
    name: 'Loading dock',
    purpose: 'A roller door on the back wall in this fictional warehouse.',
    relevance: 'The door marks the dock edge of the building layout.',
  },
  workbench: {
    name: 'Workbench',
    purpose: 'A workbench against the left-hand wall in this illustration.',
    relevance: 'The bench sits near the extinguisher on the left wall.',
  },
}

export const hotspots = [
  { id: 'dock', l: 29, t: 2, label: 'Loading dock' },
  { id: 'pallets', l: 26.7, t: 9, label: 'Floor-stacked pallets' },
  { id: 'bay01', l: 10, t: 22.2, label: 'Rack bay 01' },
  { id: 'goodrack', l: 21.7, t: 22.2, label: 'Rack bay 02' },
  { id: 'bay03', l: 33.3, t: 22.2, label: 'Rack bay 03' },
  { id: 'exit', l: 75, t: 5, label: 'Emergency exit' },
  { id: 'bay04', l: 93.75, t: 18.9, label: 'Rack bay 04' },
  { id: 'rack', l: 93.75, t: 34.4, label: 'Rack bay 05' },
  { id: 'bay06', l: 93.75, t: 50, label: 'Rack bay 06' },
  { id: 'extinguisher', l: 2, t: 52.8, label: 'Fire extinguisher' },
  { id: 'forklift', l: 40.8, t: 65.5, label: 'Forklift' },
  { id: 'spill', l: 70.8, t: 70.5, label: 'Pedestrian walkway' },
  { id: 'firstaid', l: 98, t: 72, label: 'First-aid station' },
  { id: 'workbench', l: 3.5, t: 80.5, label: 'Workbench' },
]

// 15 for finding a hazard, 10 for the preferred response (max 100).
export function score(answers) {
  let found = 0
  let correct = 0
  for (const hazard of hazards) {
    const pick = answers?.[hazard.id]
    if (pick == null) continue
    found += 1
    if (hazard.options[pick]?.ok) correct += 1
  }
  return found * 15 + correct * 10
}

export function tip(ids) {
  if (ids.includes('exit') || ids.includes('spill')) return 'Start by scanning exit routes and walkways.'
  if (ids.includes('rack')) return 'Look up. Check every upper rack level for loads that lean or overhang the beam.'
  if (ids.includes('forklift')) return 'Watch where vehicles and people share space, and look for the marked crossing.'
  return 'Trust your first read of the scene and try to finish with fewer decoy inspections.'
}

if (typeof window !== 'undefined') {
  window.LESSON = { hazards, decoys, equipment, hotspots, accent: '#42DDC5', score, tip }
  window.dispatchEvent(new Event('lesson-ready'))
}
