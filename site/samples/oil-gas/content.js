export const hazards = [
  {
    id: 'flange',
    title: 'Weeping flange',
    context: 'On this fictional pad, a separator flange is weeping and the nearby gas detector lamp is flashing.',
    options: [
      { text: 'Tighten the flange yourself while the lamp is still flashing.', ok: false, fb: 'In this illustration, working on a live flange while an alarm is active puts the person at the leak. The scene treats that as the wrong first move.' },
      { text: 'Move people back, leave the alarm as found, and report the weep so it can be made safe.', ok: true, fb: 'The illustrated response is to create distance and hand the leak to the people who isolate and repair it. This is a teaching scene, not a site procedure.' },
      { text: 'Silence the lamp and note it for the next shift.', ok: false, fb: 'Covering the alarm hides the only signal in the scene. The illustration treats the flashing lamp as something to act on, not mute.' },
    ],
  },
  {
    id: 'hotwork',
    title: 'Hot work by the pipe rack',
    context: 'A grinder is throwing sparks beside hydrocarbon pipework. No permit board is posted in the scene.',
    options: [
      { text: 'Keep grinding. The sparks are small and the pipe looks cold.', ok: false, fb: 'The scene places sparks next to process pipe with nothing showing that hot work was authorised. Continuing is the hazard.' },
      { text: 'Stop the work, keep ignition sources away from the rack, and report that no permit is visible.', ok: true, fb: 'In this illustration the safe step is to stop and report. A permit is not invented by the scene, and this is not a claim about any real permit system.' },
      { text: 'Lay a fire blanket over the pipe and carry on.', ok: false, fb: 'Covering the pipe does not show that the work was authorised. The illustration still treats open sparks beside the rack as uncontrolled.' },
    ],
  },
  {
    id: 'pump',
    title: 'Pump without isolation',
    context: 'A transfer pump has an open lock-out hasp and no lock. A neighbouring pump is locked.',
    options: [
      { text: 'Open the pump casing. The hasp is only there for show.', ok: false, fb: 'An empty hasp in this scene means isolation is not demonstrated. Opening equipment then is the hazard the lesson is pointing at.' },
      { text: 'Leave the pump untouched and report that it is not shown as isolated.', ok: true, fb: 'The illustrated response is to stop and report. The locked pump nearby is the contrast: a hasp with a lock, left alone.' },
      { text: 'Borrow the lock from the other pump and hang it here.', ok: false, fb: 'Moving the other pump\'s lock would remove the isolation the scene is showing as already in place.' },
    ],
  },
  {
    id: 'muster',
    title: 'Blocked muster gate',
    context: 'Drums and a crate stand in the muster gate. The muster sign is still visible behind them.',
    options: [
      { text: 'Leave the drums. People can squeeze past if they need to.', ok: false, fb: 'The illustration blocks the signed route. A gap someone might squeeze through is still a blocked escape in this scene.' },
      { text: 'Treat the gate as unavailable, use the clear route, and report the blockage.', ok: true, fb: 'The lesson wants the blocked gate reported and the clear way used. It does not describe a real site\'s muster plan.' },
      { text: 'Take the sign down so nobody relies on this gate.', ok: false, fb: 'Removing the sign hides the route instead of clearing it. The scene treats that as making the problem harder to see.' },
    ],
  },
]

export const decoys = {
  flare: { title: 'Flare stack', context: 'The flare is lit at the tip of the stack.', note: 'In this illustration the flare is the designed relief flame, not a leak at grade.' },
  wellhead: { title: 'Wellhead', context: 'A fenced wellhead with closed valve handles.', note: 'The tree is drawn closed and clear. Nothing in the scene asks for a response here.' },
  shelter: { title: 'Control shelter', context: 'A small control shelter with the door and window clear.', note: 'The shelter is unobstructed. It is scenery, not a hazard.' },
  lockedpump: { title: 'Isolated pump', context: 'A second pump with a lock on the hasp.', note: 'This one is drawn as isolated. Inspecting it does not change the score.' },
  extinguisher: { title: 'Fire extinguisher', context: 'An extinguisher standing clear of the walkway.', note: 'Mounted where it can be seen, and not blocking a route.' },
}

// Neutral equipment cards for the status panel. Labels stay calm on purpose —
// they must not reveal which objects are scored hazards.
export const equipment = {
  flange: {
    name: 'Separator',
    purpose: 'Separates gas and liquids on this fictional pad before they move on.',
    relevance: 'Flanges and detectors sit on the separator vessels in this scene.',
  },
  hotwork: {
    name: 'Pipe rack',
    purpose: 'Carries process pipework across the pad in this illustration.',
    relevance: 'Pipe runs cross the pad on this steel rack.',
  },
  pump: {
    name: 'Transfer pump',
    purpose: 'Moves product between vessels in this teaching scene.',
    relevance: 'This unit sits beside a second pump on the same pad skid.',
  },
  lockedpump: {
    name: 'Isolated pump',
    purpose: 'A second pump on the pad skid in this teaching scene.',
    relevance: 'This unit sits beside the transfer pump on the same pad skid.',
  },
  muster: {
    name: 'Muster gate',
    purpose: 'A signed exit through the pad fence in this illustration.',
    relevance: 'The gate opens through the fence line at the edge of the pad.',
  },
  flare: {
    name: 'Flare stack',
    purpose: 'Burns relief gas in this fictional layout.',
    relevance: 'The stack stands at the edge of the pad as the relief path.',
  },
  shelter: {
    name: 'Control shelter',
    purpose: 'A small shelter for local controls in this illustration.',
    relevance: 'The shelter marks a local control point on the pad layout.',
  },
  wellhead: {
    name: 'Wellhead',
    purpose: 'A fenced well tree on this fictional pad.',
    relevance: 'The tree sits inside a small fence on one corner of the pad.',
  },
  extinguisher: {
    name: 'Fire extinguisher',
    purpose: 'A portable extinguisher kept on the pad in this illustration.',
    relevance: 'The extinguisher stands beside the walkway near the shelter.',
  },
}

export const hotspots = [
  { id: 'muster', l: 56, t: 10, label: 'Muster gate' },
  { id: 'flare', l: 82, t: 18, label: 'Flare stack' },
  { id: 'flange', l: 24, t: 34, label: 'Separator' },
  { id: 'hotwork', l: 68, t: 40, label: 'Pipe rack' },
  { id: 'extinguisher', l: 74, t: 58, label: 'Fire extinguisher' },
  { id: 'pump', l: 40, t: 68, label: 'Transfer pump' },
  { id: 'lockedpump', l: 58, t: 74, label: 'Isolated pump' },
  { id: 'wellhead', l: 16, t: 80, label: 'Wellhead' },
  { id: 'shelter', l: 84, t: 78, label: 'Control shelter' },
]

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
  if (ids.includes('flange')) return 'Start at the vessels. A flashing detector or a weep at a flange is the first thing this scene wants noticed.'
  if (ids.includes('hotwork')) return 'Look for sparks beside pipework, and for whether the scene shows any permit at all.'
  if (ids.includes('pump')) return 'Compare the two pumps. One hasp is empty and one has a lock.'
  if (ids.includes('muster')) return 'Walk the fence line. A muster sign behind drums is not a clear route in this illustration.'
  return 'One slow lap is enough: alarms, sparks, isolation, then the gates.'
}

if (typeof window !== 'undefined') {
  window.LESSON = { hazards, decoys, equipment, hotspots, accent: '#F2B544', score, tip }
  window.dispatchEvent(new Event('lesson-ready'))
}
