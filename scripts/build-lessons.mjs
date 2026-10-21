/**
 * Frozen. Do not run this as part of a build.
 *
 * It copies site/samples/xr-skilllab/index.html over the oil and gas, mining,
 * and chemical processing lessons. Those pages were edited by hand after the
 * generator first wrote them, so a normal run would wipe the scenes, the copy,
 * and the Fields menu. The script exits before it reads or writes anything
 * unless you pass --force-regenerate.
 */
import fs from 'node:fs'
import path from 'node:path'

if (!process.argv.includes('--force-regenerate')) {
  console.error(
    'scripts/build-lessons.mjs is frozen and did not change any files. The industry lessons were edited by hand. Pass --force-regenerate only when you mean to overwrite site/samples/oil-gas, mining, and chemical-processing.',
  )
  process.exit(1)
}

const root = path.resolve(import.meta.dirname, '..')
const source = fs.readFileSync(path.join(root, 'site/samples/xr-skilllab/index.html'), 'utf8')

const lessons = [
  {
    slug: 'oil-gas',
    name: 'Oil & Gas',
    accent: '#F2B544',
    hot: '#FFD27A',
    challenge: 'Gas Pad Challenge',
    lede: 'Step onto a fictional onshore gas pad, decide what you would do about each problem, and read a score built from fixed rules.',
    explore: 'Move through a lit processing pad and look closely at vessels, pipework and the gates.',
    demo: 'Four hazards are hidden on this fictional gas pad. Find them, decide how to respond, and see exactly how your score was built.',
    intro: 'Four hazards are hidden on this fictional gas pad. Find each one and choose how you would respond. You will get a transparent score and coaching at the end.',
    preview: 'Live 3D preview of the gas pad',
    canvas: 'Interactive 3D gas pad. Drag to look around, scroll to zoom, arrow keys rotate, click any object to inspect it.',
    planLabel: 'Plan of a fictional onshore gas pad: separators and a weeping flange on the left, pipe rack and hot work across the middle, flare to the north-east, muster gate on the fence, pumps and a control shelter to the south',
    plan: `<svg viewBox="0 0 480 360" role="img" aria-label="Plan of a fictional onshore gas pad: separators and a weeping flange on the left, pipe rack and hot work across the middle, flare to the north-east, muster gate on the fence, pumps and a control shelter to the south" style="display:block;width:100%;height:auto">
      <rect width="480" height="360" fill="#24303a"></rect>
      <rect x="36" y="70" width="408" height="230" rx="10" fill="#3e463c"></rect>
      <rect x="70" y="150" width="340" height="22" fill="#66788a"></rect>
      <rect x="78" y="108" width="96" height="28" rx="14" fill="#d5dee6"></rect>
      <rect x="78" y="142" width="96" height="6" fill="#F2B544"></rect>
      <rect x="300" y="48" width="14" height="78" fill="#d5dee6"></rect>
      <circle cx="307" cy="42" r="10" fill="#F2B544"></circle>
      <rect x="250" y="118" width="28" height="22" fill="#e07a3d"></rect>
      <rect x="168" y="230" width="36" height="22" rx="3" fill="#2a3138"></rect>
      <rect x="230" y="248" width="34" height="20" rx="3" fill="#2f8f5b"></rect>
      <rect x="70" y="268" width="22" height="28" fill="#c5ced6"></rect>
      <rect x="360" y="250" width="52" height="36" fill="#f4f7f8"></rect>
      <rect x="210" y="78" width="46" height="8" fill="#1f8a4c"></rect>
      <text x="240" y="344" fill="#B6C4D6" font-family="Manrope, Helvetica, Arial, sans-serif" font-size="11" text-anchor="middle">Fictional pad · not a site layout</text>
    </svg>`,
    footer: 'Oil &amp; Gas is an illustrative training concept in XR Concept Lab. The pad is fictional. It is not a site procedure, not a certification, and not a claim of regulatory compliance.',
  },
  {
    slug: 'mining',
    name: 'Mining',
    accent: '#E07A3D',
    hot: '#F0A06A',
    challenge: 'Open-cut Challenge',
    lede: 'Walk a fictional open-cut pit, decide what you would do about each problem, and read a score built from fixed rules.',
    explore: 'Move through a lit pit and look closely at the truck, the conveyors, the highwall and the crusher.',
    demo: 'Four hazards are hidden in this fictional pit. Find them, decide how to respond, and see exactly how your score was built.',
    intro: 'Four hazards are hidden in this fictional open-cut. Find each one and choose how you would respond. You will get a transparent score and coaching at the end.',
    preview: 'Live 3D preview of the open-cut',
    canvas: 'Interactive 3D open-cut. Drag to look around, scroll to zoom, arrow keys rotate, click any object to inspect it.',
    planLabel: 'Plan of a fictional open-cut: highwall to the west, haul road and truck in the centre, conveyors and crusher to the east, refuge and water cart to the south',
    plan: `<svg viewBox="0 0 480 360" role="img" aria-label="Plan of a fictional open-cut: highwall to the west, haul road and truck in the centre, conveyors and crusher to the east, refuge and water cart to the south" style="display:block;width:100%;height:auto">
      <rect width="480" height="360" fill="#c4a484"></rect>
      <rect x="24" y="36" width="110" height="120" fill="#8d6b52"></rect>
      <rect x="150" y="40" width="70" height="250" fill="#4e463f"></rect>
      <rect x="300" y="70" width="130" height="16" fill="#9aa3ab"></rect>
      <rect x="300" y="150" width="130" height="16" fill="#6f7a84"></rect>
      <rect x="190" y="180" width="46" height="28" fill="#f2c14e"></rect>
      <rect x="40" y="240" width="40" height="28" fill="#f7f4ee"></rect>
      <rect x="110" y="260" width="48" height="22" fill="#3d7ea6"></rect>
      <rect x="340" y="240" width="46" height="40" fill="#2c2926"></rect>
      <text x="240" y="344" fill="#3a3128" font-family="Manrope, Helvetica, Arial, sans-serif" font-size="11" text-anchor="middle">Fictional pit · not a site layout</text>
    </svg>`,
    footer: 'Mining is an illustrative training concept in XR Concept Lab. The pit is fictional. It is not a site procedure, not a certification, and not a claim of regulatory compliance.',
  },
  {
    slug: 'chemical-processing',
    name: 'Chemical processing',
    accent: '#8B7CFF',
    hot: '#B0A6FF',
    challenge: 'Batch Plant Challenge',
    lede: 'Enter a fictional batch plant, decide what you would do about each problem, and read a score built from fixed rules.',
    explore: 'Move through a lit plant and look closely at the drums, the showers, the manifold and the relief line.',
    demo: 'Four hazards are hidden in this fictional batch plant. Find them, decide how to respond, and see exactly how your score was built.',
    intro: 'Four hazards are hidden in this fictional batch plant. Find each one and choose how you would respond. You will get a transparent score and coaching at the end.',
    preview: 'Live 3D preview of the batch plant',
    canvas: 'Interactive 3D batch plant. Drag to look around, scroll to zoom, arrow keys rotate, click any object to inspect it.',
    planLabel: 'Plan of a fictional batch plant: segregated drums and a reactor to the west, relief and showers to the east, mixed drums and bunded tanks to the south',
    plan: `<svg viewBox="0 0 480 360" role="img" aria-label="Plan of a fictional batch plant: segregated drums and a reactor to the west, relief and showers to the east, mixed drums and bunded tanks to the south" style="display:block;width:100%;height:auto">
      <rect width="480" height="360" fill="#e7ebf0"></rect>
      <rect x="40" y="70" width="70" height="40" fill="#3c6fbf"></rect>
      <circle cx="190" cy="110" r="28" fill="#d7dee6" stroke="#2e3640"></circle>
      <rect x="270" y="78" width="16" height="40" fill="#d7dee6"></rect>
      <rect x="350" y="80" width="14" height="46" fill="#f2c14e"></rect>
      <rect x="250" y="160" width="40" height="14" fill="#c4473a"></rect>
      <rect x="360" y="170" width="14" height="40" fill="#2f9d6c"></rect>
      <rect x="50" y="230" width="78" height="40" fill="#c4473a"></rect>
      <rect x="190" y="240" width="90" height="48" fill="#b7c0b0"></rect>
      <rect x="380" y="270" width="28" height="36" fill="#8b7cff"></rect>
      <text x="240" y="344" fill="#5c6770" font-family="Manrope, Helvetica, Arial, sans-serif" font-size="11" text-anchor="middle">Fictional plant · not a site layout</text>
    </svg>`,
    footer: 'Chemical processing is an illustrative training concept in XR Concept Lab. The plant is fictional. It is not a site procedure, not a certification, and not a claim of regulatory compliance.',
  },
]

function rgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

function build(lesson) {
  let html = source
  html = html.replaceAll('#42DDC5', lesson.accent)
  html = html.replaceAll('#6CE7D3', lesson.hot)
  html = html.replaceAll('#7AE9D8', lesson.hot)
  html = html.replaceAll('rgba(66,221,197', `rgba(${rgb(lesson.accent)}`)
  html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<title>${lesson.name} · XR Concept Lab</title>`)
  html = html.replace('<script src="./support.js"></script>', '<script src="./support.js"></script>\n<script type="module" src="./content.js"></script>')
  html = html.replace('./warehouse.js', './scene.js')
  html = html.replace('<span>Warehouse Safety</span>', `<span>${lesson.name}</span>`)
  html = html.replace('>Warehouse Safety <span', `>${lesson.name} <span`)
  html = html.replace(
    'Warehouse Safety is an independent educational prototype. Training scenarios are illustrative and do not replace workplace induction, accredited training or professional safety advice.',
    lesson.footer,
  )
  html = html.replace(
    'Step inside an interactive warehouse, make real-world safety decisions, and get clear feedback on what you noticed and what to practise next.',
    lesson.lede,
  )
  html = html.replace(
    'Move through a lit, working warehouse and look closely at what\'s actually there.',
    lesson.explore,
  )
  html = html.replaceAll(
    'Four hazards are hidden in this warehouse. Find them, decide how to respond, and see exactly how your score was built.',
    lesson.demo,
  )
  html = html.replace(
    'Four hazards are hidden in this warehouse. Find each one and choose how you\'d respond. You\'ll get a transparent score and coaching at the end.',
    lesson.intro,
  )
  html = html.replaceAll('Warehouse Safety Challenge', lesson.challenge)
  html = html.replace('Live 3D preview of the warehouse', lesson.preview)
  html = html.replace(
    'Interactive 3D warehouse. Drag to look around, scroll to zoom, arrow keys rotate, click any object to inspect it.',
    lesson.canvas,
  )
  html = html.replace(
    'Illustrative learning exercise, not formal certification.',
    'Illustrative scenario, not a site procedure. Not a certification, and not a claim of regulatory compliance.',
  )
  html = html.replace(
    'Runs in your browser · No headset or account required',
    'Runs in your browser · Illustrative scenario, not a site procedure',
  )
  html = html.replace(
    'Learners notice hazards the way they would on the floor.',
    'Learners notice hazards the way they are drawn in the scene.',
  )
  html = html.replace(
    'Each hazard is worth 25 points: 15 for finding and assessing it, 10 more for choosing the best response. Time, hints and decoy inspections never change the score.',
    'Each hazard is worth 25 points: 15 for finding and assessing it, 10 more for choosing the best response. Time, hints and decoy inspections never change the score. The result is illustrative. It is not a certification and it does not show regulatory compliance.',
  )
  html = html.replace(
    'height:62px;display:flex;align-items:center;justify-content:space-between;gap:16px',
    'min-height:62px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:8px;padding-bottom:8px',
  )
  const svgStart = html.indexOf('<svg viewBox="0 0 480 360"')
  const svgEnd = html.indexOf('</svg>', svgStart)
  if (svgStart < 0 || svgEnd < 0) throw new Error('plan svg missing')
  html = html.slice(0, svgStart) + lesson.plan + html.slice(svgEnd + 6)

  const dataStart = html.indexOf('const HAZARDS = [')
  const letters = html.indexOf("const LETTERS = ['A', 'B', 'C'];")
  if (dataStart < 0 || letters < 0) throw new Error('hazard block missing')
  html = html.slice(0, dataStart) + 'const lesson = () => window.LESSON;\n' + html.slice(letters)
  html = html.replace(/const TEAL = '[^']+', /, '')
  html = html.replaceAll('HAZARDS', 'lesson().hazards')
  html = html.replaceAll('DECOYS', 'lesson().decoys')
  html = html.replaceAll('HOTSPOTS', 'lesson().hotspots')
  html = html.replaceAll('TEAL', 'lesson().accent')
  html = html.replace(
    /const coachTip = ids\.includes\([\s\S]*?';/,
    'const coachTip = lesson().tip(ids);',
  )
  html = html.replace(
    'score() { const a = this.state.answers; let found = 0, correct = 0; lesson().hazards.forEach(h => { if (a[h.id] != null) { found++; if (h.options[a[h.id]].ok) correct++; } }); return found * 15 + correct * 10; }',
    'score() { return lesson().score(this.state.answers); }',
  )
  html = html.replace(
    'const score = found * 15 + correct * 10;',
    'const score = lesson().score(a);',
  )
  html = html.replace(
    `const init = () => this.initViews();
    if (window.XRWarehouse) init(); else window.addEventListener('xrwarehouse-ready', init, { once: true });`,
    `const boot = () => { if (!window.XRWarehouse || !window.LESSON || this._booted) return; this._booted = true; this.initViews(); };
    window.addEventListener('xrwarehouse-ready', boot);
    window.addEventListener('lesson-ready', boot);
    boot();`,
  )
  if (html.includes('const HAZARDS') || html.includes('Warehouse Safety') || html.includes('warehouse.js')) {
    throw new Error(`leftover template text in ${lesson.slug}`)
  }
  const out = path.join(root, 'site/samples', lesson.slug, 'index.html')
  fs.writeFileSync(out, html)
  console.log('wrote', out, html.length)
}

for (const lesson of lessons) build(lesson)
