// Mining lesson data and scoring.
// Same shape as oil-gas/content.js so unit tests can share one pattern.

export const hazards = [
  {
    id: 'blindspot',
    title: 'Light vehicle in a blind spot',
    context: 'A light vehicle is tucked against the rear corner of a haul truck, outside the truck\'s line of sight in this illustration.',
    options: [
      { text: 'Drive the light vehicle out past the truck\'s rear wheels.', ok: false, fb: 'The scene places the light vehicle where the haul truck cannot see it. Moving through that gap is the conflict the lesson is showing.' },
      { text: 'Leave both vehicles where they are, make the spot known, and wait until the truck is confirmed stationary and the area is clear.', ok: true, fb: 'The illustrated response is to stop the conflict and communicate before anyone moves. This is not a traffic plan for a real mine.' },
      { text: 'Sound the light vehicle\'s horn and pull alongside the truck.', ok: false, fb: 'A horn does not show that the haul truck driver has seen the light vehicle. The illustration still treats the corner as a blind spot.' },
    ],
  },
  {
    id: 'guarding',
    title: 'Conveyor without a guard',
    context: 'One conveyor run has open rollers. A second run nearby is drawn with side guards.',
    options: [
      { text: 'Step over the open rollers. The belt is moving slowly.', ok: false, fb: 'The scene leaves the nip points exposed. Crossing them is the hazard, whatever the belt speed looks like.' },
      { text: 'Keep people off that run and report the missing guard. Use the guarded run as the contrast, not as a reason to ignore this one.', ok: true, fb: 'The lesson contrasts a guarded conveyor with an open one. Reporting the open run is the response the scene rewards.' },
      { text: 'Tie a ribbon on the frame so people know to be careful.', ok: false, fb: 'A ribbon does not cover the rollers. The illustration still shows an unguarded nip point.' },
    ],
  },
  {
    id: 'ground',
    title: 'Loose ground at the highwall',
    context: 'Rocks have fallen to the toe of the highwall. No ground support is drawn on that face.',
    options: [
      { text: 'Walk the toe and kick the loose rocks aside.', ok: false, fb: 'Working under the face the scene has drawn as unsupported puts the person in the fall path.' },
      { text: 'Stay clear of the toe and report the loose ground before anyone works under that face.', ok: true, fb: 'The illustrated response is distance plus a report. The scene does not show a support design and does not claim one.' },
      { text: 'Park the light vehicle against the toe so the rocks have somewhere to land.', ok: false, fb: 'Putting a vehicle under the face adds a target. The lesson wants people and machines out of that zone.' },
    ],
  },
  {
    id: 'dust',
    title: 'Dust at the crusher',
    context: 'A visible dust cloud hangs at the crusher transfer. No spray is drawn on that point.',
    options: [
      { text: 'Work in the cloud. Dust this colour is only a nuisance.', ok: false, fb: 'The scene makes the cloud the thing to notice. Treating it as harmless skips the only control the illustration is asking for: stop and report.' },
      { text: 'Keep people out of the cloud and report that the transfer is not shown with any dust control.', ok: true, fb: 'The response rewarded here is to leave the plume and report it. This is an illustration, not a measurement of a real crusher.' },
      { text: 'Wet the ground with a bottle of water and continue.', ok: false, fb: 'A token splash does not match the size of the cloud drawn in the scene, and it leaves people in it.' },
    ],
  },
]

// Ids only for scoring tests — display names live on `equipment` / `hotspots`.
// Decoy `context` is unused in the UI (Info cards use `equipment`); kept for the shared content shape.
export const decoys = {
  guarded: { title: 'Conveyor (south run)', context: 'A short conveyor run on the south side of the pit layout.' },
  water: { title: 'Water cart', context: 'A water cart in the pit.' },
  berm: { title: 'Road berm', context: 'A continuous berm along the haul road.' },
  refuge: { title: 'Refuge chamber', context: 'A refuge chamber in the pit.' },
}

// Neutral Info-card copy — location only; no cues about whether an object is a scored hazard.
export const equipment = {
  blindspot: {
    name: 'Haul truck',
    purpose: 'A haul truck used to move rock in this fictional open-cut.',
    relevance: 'The truck sits on the haul road in the centre of the pit.',
  },
  guarding: {
    name: 'Conveyor (north run)',
    purpose: 'A conveyor run that carries material across this teaching scene.',
    relevance: 'This run sits on the north side of the east wall layout.',
  },
  ground: {
    name: 'Highwall toe',
    purpose: 'The foot of the highwall face in this illustration.',
    relevance: 'The toe sits on the west side of the pit near the berm.',
  },
  dust: {
    name: 'Crusher transfer',
    purpose: 'A crusher transfer point in this fictional pit.',
    relevance: 'The transfer sits at the south-east corner of the layout.',
  },
  guarded: {
    name: 'Conveyor (south run)',
    purpose: 'A conveyor run that carries material across this teaching scene.',
    relevance: 'This run sits on the south side of the east wall layout.',
  },
  water: {
    name: 'Water cart',
    purpose: 'A water cart used on haul roads in this illustration.',
    relevance: 'The cart is parked south of the haul road near the refuge.',
  },
  berm: {
    name: 'Road berm',
    purpose: 'An earth berm drawn along the haul road in this scene.',
    relevance: 'The berm runs beside the haul road on the west side of the pit.',
  },
  refuge: {
    name: 'Refuge chamber',
    purpose: 'A marked refuge chamber in this fictional pit.',
    relevance: 'The chamber sits south-west of the haul road.',
  },
}

export const hotspots = [
  { id: 'ground', l: 22, t: 22, label: 'Highwall toe' },
  { id: 'berm', l: 36, t: 40, label: 'Road berm' },
  { id: 'guarding', l: 74, t: 30, label: 'Conveyor (north run)' },
  { id: 'guarded', l: 74, t: 48, label: 'Conveyor (south run)' },
  { id: 'blindspot', l: 46, t: 58, label: 'Haul truck' },
  { id: 'refuge', l: 16, t: 72, label: 'Refuge chamber' },
  { id: 'water', l: 30, t: 78, label: 'Water cart' },
  { id: 'dust', l: 78, t: 74, label: 'Crusher transfer' },
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
  if (ids.includes('blindspot')) return 'Look at the haul truck\'s corners before anything else. The light vehicle is the small shape against the rear wheel.'
  if (ids.includes('guarding')) return 'Compare the two conveyors. One has side panels and one shows open rollers.'
  if (ids.includes('ground')) return 'Check the highwall toe for rocks that have already fallen.'
  if (ids.includes('dust')) return 'The crusher transfer is the pale cloud. The water cart is parked elsewhere on purpose.'
  return 'Read the pit in one pass: vehicles, conveyors, the wall, then the crusher.'
}

if (typeof window !== 'undefined') {
  window.LESSON = { hazards, decoys, equipment, hotspots, accent: '#E07A3D', score, tip }
  window.dispatchEvent(new Event('lesson-ready'))
}
