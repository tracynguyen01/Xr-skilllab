export const hazards = [
  {
    id: 'incompatible',
    title: 'Incompatible drums stored together',
    context: 'Red, yellow, blue and violet drums are stacked against each other. A separate bay holds only blue drums.',
    options: [
      { text: 'Leave the mix. The colours are just a paint choice.', ok: false, fb: 'The scene uses colour to show unlike drums stored together, and a second bay where like drums are kept apart. Ignoring the mix misses that contrast.' },
      { text: 'Do not move the drums yourself. Report the mixed bay and leave the segregated bay as it is drawn.', ok: true, fb: 'The illustrated response is to report the mix rather than rearrange chemicals by hand. This is not a storage code and not a real plant\'s rule.' },
      { text: 'Stack them higher so the bay takes less floor space.', ok: false, fb: 'Stacking the mix higher keeps unlike drums together and adds a handling risk the scene is not asking for.' },
    ],
  },
  {
    id: 'eyewash',
    title: 'Obstructed safety shower',
    context: 'A drum and a crate sit in front of one safety shower. A second shower further along is clear.',
    options: [
      { text: 'The other shower is clear, so this one can stay blocked.', ok: false, fb: 'The illustration includes a blocked shower on purpose. A second clear shower does not make the blocked one acceptable in the scene.' },
      { text: 'Treat this shower as unavailable, keep people from relying on it, and report the obstruction.', ok: true, fb: 'The lesson wants the blockage reported. It does not ask the learner to drag the drum clear, and it is not a site rule.' },
      { text: 'Tip the drum on its side so there is a gap to the bowl.', ok: false, fb: 'Moving an unknown drum to "make a gap" is another handling step. The scene rewards reporting, not improvising a path.' },
    ],
  },
  {
    id: 'vapour',
    title: 'Vapour at a valve',
    context: 'A pale wisp rises from a red-handled valve on the manifold.',
    options: [
      { text: 'Sniff near the valve to identify the vapour.', ok: false, fb: 'The scene shows an unknown wisp. Putting a face in it is the exposure the lesson is warning about.' },
      { text: 'Step back, keep others out of the wisp, and report the valve.', ok: true, fb: 'Distance and a report are the illustrated response. The scene does not identify the vapour and does not claim a detection method.' },
      { text: 'Open the valve fully so the pressure drops.', ok: false, fb: 'Opening the valve would enlarge the release the scene is already showing.' },
    ],
  },
  {
    id: 'relief',
    title: 'Bypassed relief',
    context: 'A relief line has a bar tied across it, and the bypass beside it is drawn open.',
    options: [
      { text: 'Leave the bar. Someone fitted it for a reason.', ok: false, fb: 'The illustration shows a relief path held shut and a bypass left open. Leaving both as drawn is the hazard.' },
      { text: 'Do not operate the valves. Report that the relief is shown gagged and the bypass is open.', ok: true, fb: 'The rewarded step is to stop and report. This is an illustrative arrangement, not a description of a real interlock.' },
      { text: 'Close the bypass and cut the bar off.', ok: false, fb: 'Changing the valves without the scene showing isolation is another uncontrolled step. The lesson stops at reporting what is visible.' },
    ],
  },
]

export const decoys = {
  segregated: { title: 'Segregated drums', context: 'A bay of matching blue drums with a divider.', note: 'Like drums, separated from the mixed bay. Not a hazard in this illustration.' },
  clearshower: { title: 'Clear safety shower', context: 'A shower and eyewash with nothing in front of them.', note: 'The approach is clear. The blocked shower is the other one.' },
  reactor: { title: 'Batch reactor', context: 'A closed reactor with its agitator and a small sample point.', note: 'Drawn as operating inside the illustration. Nothing here asks for a response.' },
  bund: { title: 'Bunded tanks', context: 'Two tanks standing inside a bund that is holding liquid.', note: 'The bund is doing the job the scene drew it for. The drums outside it are a separate question.' },
  sds: { title: 'Information board', context: 'A board on the wall, clear to read.', note: 'Scenery. Inspecting it does not change the score.' },
}

export const hotspots = [
  { id: 'segregated', l: 18, t: 24, label: 'Segregated drums' },
  { id: 'reactor', l: 40, t: 32, label: 'Batch reactor' },
  { id: 'relief', l: 62, t: 28, label: 'Relief and bypass' },
  { id: 'eyewash', l: 78, t: 30, label: 'Blocked shower' },
  { id: 'vapour', l: 56, t: 48, label: 'Valve manifold' },
  { id: 'clearshower', l: 80, t: 52, label: 'Clear shower' },
  { id: 'incompatible', l: 18, t: 68, label: 'Mixed drums' },
  { id: 'bund', l: 48, t: 74, label: 'Bunded tanks' },
  { id: 'sds', l: 84, t: 80, label: 'Information board' },
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
  if (ids.includes('incompatible')) return 'Compare the two drum bays. One is mixed colours and one is a single colour behind a divider.'
  if (ids.includes('eyewash')) return 'Check both showers. The blocked one has a drum in front of the bowl.'
  if (ids.includes('vapour')) return 'Look for the pale wisp on the red valve. Do not treat it as steam unless the scene says so.'
  if (ids.includes('relief')) return 'The relief line is the one with a bar across it. The yellow bypass beside it is drawn open.'
  return 'Walk the floor once: drums, showers, the manifold, then the relief line.'
}

if (typeof window !== 'undefined') {
  window.LESSON = { hazards, decoys, hotspots, accent: '#8B7CFF', score, tip }
  window.dispatchEvent(new Event('lesson-ready'))
}
