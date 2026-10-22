import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// 3D object ids (exit, spill, rack, …) match hazards/decoys in content.js.
// Scoring and answer text live there; this file only builds the scene.

const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function prng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const PRESETS = {
  establishing: { t: [0, 1, -2], theta: 0.6, phi: 1.02, r: 28 },
  inspection: { t: [0, 1.2, -1], theta: 0.35, phi: 1.33, r: 13 },
  hero: { t: [0, 1.4, -1.5], theta: 0.3, phi: 1.28, r: 19 },
  exit: { t: [6, 1.2, -8.2], theta: 0.15, phi: 1.3, r: 6.5 },
  spill: { t: [5, 0.2, 3.6], theta: 0.6, phi: 1.05, r: 5 },
  rack: { t: [10.2, 3.4, -2.8], theta: -0.9, phi: 1.25, r: 7 },
  forklift: { t: [-2.2, 1, 2.8], theta: 0.7, phi: 1.25, r: 7 },
  extinguisher: { t: [-11.8, 1.1, 0.5], theta: 1.1, phi: 1.35, r: 5 },
  firstaid: { t: [11.8, 1.5, 4], theta: -1.1, phi: 1.35, r: 5 },
  goodrack: { t: [-6.8, 2, -5.5], theta: 0.1, phi: 1.3, r: 8 },
  bay01: { t: [-9.6, 2, -5.5], theta: 0.1, phi: 1.3, r: 8 },
  bay03: { t: [-4, 2, -5.5], theta: 0.1, phi: 1.3, r: 8 },
  bay04: { t: [10.2, 2, -5.6], theta: -0.9, phi: 1.3, r: 8 },
  bay06: { t: [10.2, 2, 0], theta: -0.9, phi: 1.3, r: 8 },
  pallets: { t: [-5.5, 0.8, -7], theta: 0.3, phi: 1.3, r: 7 },
  dock: { t: [-5, 2, -8.5], theta: 0.1, phi: 1.3, r: 9 },
  workbench: { t: [-11, 1, 5.5], theta: 1.0, phi: 1.3, r: 6 },
};

// ---------- textures ----------
const T = {};
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function tex(c, repeat, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); } t.anisotropy = 4; return t; }
function buildTextures() {
  if (T.ready) return; T.ready = true;
  const R = prng(7);
  { const c = cv(512, 512), g = c.getContext('2d'); g.fillStyle = '#8b8e91'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 12000; i++) { const v = R() < .5 ? 30 : 235; g.fillStyle = `rgba(${v},${v},${v},${.02 + R() * .07})`; g.fillRect(R() * 512, R() * 512, 1 + R() * 2.5, 1 + R() * 2.5); }
    for (let i = 0; i < 16; i++) { g.strokeStyle = `rgba(25,25,28,${.04 + R() * .08})`; g.lineWidth = 3 + R() * 22; g.beginPath(); const y = R() * 512; g.moveTo(0, y); g.bezierCurveTo(170, y + (R() - .5) * 120, 340, y + (R() - .5) * 120, 512, y + (R() - .5) * 120); g.stroke(); }
    for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(60,55,50,${.05 + R() * .06})`; g.beginPath(); g.ellipse(R() * 512, R() * 512, 20 + R() * 60, 10 + R() * 30, R() * 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(40,40,44,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 256); g.lineTo(512, 256); g.moveTo(256, 0); g.lineTo(256, 512); g.stroke();
    T.concrete = tex(c, 5); T.concreteBump = tex(c, 5, false); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#b4885a'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(70,45,20,${R() * .08})`; g.fillRect(R() * 256, R() * 256, 2, 2); }
    g.fillStyle = '#8f6a42'; g.fillRect(112, 0, 32, 256); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(28, 150, 60, 40); g.fillStyle = '#333'; g.fillRect(34, 158, 48, 4); g.fillRect(34, 168, 36, 4); g.fillRect(34, 178, 44, 4);
    T.carton = tex(c); }
  { const c = cv(128, 512), g = c.getContext('2d'); for (let y = 0; y < 512; y += 28) { g.fillStyle = y / 28 % 2 ? '#6a7380' : '#5d6673'; g.fillRect(0, y, 128, 28); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y, 128, 3); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y + 25, 128, 3); } T.slats = tex(c); }
  { const c = cv(64, 256), g = c.getContext('2d'); g.fillStyle = '#f2c600'; g.fillRect(0, 0, 64, 256); g.fillStyle = '#1b1b1b'; for (let y = -64; y < 256; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y - 32); g.lineTo(64, y); g.lineTo(0, y + 32); g.fill(); } T.stripe = tex(c, 1); T.stripe.repeat.set(1, 4); }
  { const c = cv(384, 128), g = c.getContext('2d'); g.fillStyle = '#0f9d5e'; g.fillRect(0, 0, 384, 128); g.fillStyle = '#eafff3'; g.font = 'bold 86px Manrope, Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EXIT', 192, 68); T.exit = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#f3f5f7'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#17a35c'; g.fillRect(100, 40, 56, 176); g.fillRect(40, 100, 176, 56); T.cross = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#c8302c'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#fff'; g.font = 'bold 54px Manrope, Helvetica, Arial'; g.textAlign = 'center'; g.fillText('FIRE', 128, 110); g.font = 'bold 34px Manrope, Helvetica, Arial'; g.fillText('EXTINGUISHER', 128, 165); T.fireSign = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.moveTo(30, 100); g.lineTo(150, 100); g.lineTo(150, 60); g.lineTo(236, 128); g.lineTo(150, 196); g.lineTo(150, 156); g.lineTo(30, 156); g.fill(); T.arrow = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 22; for (let i = -256; i < 512; i += 64) { g.beginPath(); g.moveTo(i, 256); g.lineTo(i + 256, 0); g.stroke(); } T.hatch = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); T.blob = tex(c, 0, false); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#c9b48a'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#6f5a3a'; for (let y = 16; y < 256; y += 32) for (let x = 16; x < 256; x += 32) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } T.peg = tex(c); }
  T.bay = {}; T.bayTex = n => T.bay[n] || (T.bay[n] = (() => { const c = cv(192, 128), g = c.getContext('2d'); g.fillStyle = '#f5f8fc'; g.fillRect(0, 0, 192, 128); g.fillStyle = '#17263b'; g.fillRect(0, 0, 192, 30); g.fillStyle = '#f2c600'; g.font = 'bold 22px Manrope, Helvetica, Arial'; g.textAlign = 'center'; g.fillText('BAY', 96, 23); g.fillStyle = '#17263b'; g.font = 'bold 76px Manrope, Helvetica, Arial'; g.fillText(n, 96, 108); return tex(c); })());
  T.badge = {}; T.badgeTex = kind => T.badge[kind] || (T.badge[kind] = (() => { const c = cv(128, 128), g = c.getContext('2d'); g.fillStyle = kind === 'check' ? '#42DDC5' : '#F2C46D'; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill(); g.strokeStyle = '#0B1220'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); if (kind === 'check') { g.moveTo(38, 66); g.lineTo(56, 84); g.lineTo(92, 46); } else { g.moveTo(42, 42); g.lineTo(86, 86); g.moveTo(86, 42); g.lineTo(42, 86); } g.stroke(); return tex(c); })());
}

// ---------- scene ----------
function buildScene() {
  buildTextures();
  const R = prng(42);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b1220); scene.fog = new THREE.FogExp2(0x141b29, 0.014);
  const std = (p) => new THREE.MeshStandardMaterial(Object.assign({ roughness: .75, metalness: 0 }, p));
  const M = {
    concrete: std({ map: T.concrete, bumpMap: T.concreteBump, bumpScale: .015, roughness: .9 }),
    wall: std({ color: 0x4b5767, roughness: .95 }), wallLow: std({ color: 0x38424f, roughness: .95 }), ceiling: std({ color: 0x1a2029, roughness: 1 }),
    steel: std({ color: 0x2e4b86, roughness: .55, metalness: .35 }), beam: std({ color: 0xe0772a, roughness: .55, metalness: .3 }),
    darkSteel: std({ color: 0x2a313c, roughness: .6, metalness: .4 }), chrome: std({ color: 0xb9c2cc, roughness: .3, metalness: .8 }),
    carton: std({ map: T.carton, roughness: .85 }), wood: std({ color: 0xa07a4c, roughness: .9 }),
    hivis: std({ color: 0xf2c600, roughness: .5 }), black: std({ color: 0x15171a, roughness: .7 }), tyre: std({ color: 0x1b1d20, roughness: .95 }),
    green: std({ color: 0x2c8a57, roughness: .85 }), yellowLine: std({ color: 0xf0c419, roughness: .8 }), white: std({ color: 0xe6e9ec, roughness: .6 }),
    stripe: std({ map: T.stripe, roughness: .6 }), slats: std({ map: T.slats, roughness: .6, metalness: .3 }), red: std({ color: 0xc8302c, roughness: .45, metalness: .1 }),
    grey: std({ color: 0x6b7684, roughness: .6, metalness: .2 }), peg: std({ map: T.peg, roughness: .9 }),
    fixture: std({ color: 0xffffff, emissive: 0xffe3bd, emissiveIntensity: 2.2 }),
    spill: new THREE.MeshStandardMaterial({ color: 0x3b4b53, roughness: .08, metalness: .15, transparent: true, opacity: .85 }),
    blob: new THREE.MeshBasicMaterial({ map: T.blob, transparent: true, depthWrite: false }),
  };
  const insp = {}; const pick = []; const anim = [];
  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, parent) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  const blob = (w, d, x, z, parent = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.blob); m.rotation.x = -Math.PI / 2; m.position.set(x, .006, z); m.renderOrder = 1; parent.add(m); return m; };
  const floorPlane = (w, d, mat, x, z, y = .01, parent = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; parent.add(m); return m; };
  function register(group, id, label, badgeOffset) {
    group.userData.inspectId = id;
    group.traverse(o => { if (o.isMesh) { const mats = Array.isArray(o.material) ? o.material : [o.material]; const cl = mats.map(m => { const c = m.clone(); c.userData.base = { e: c.emissive ? c.emissive.getHex() : 0, i: c.emissiveIntensity || 1 }; return c; }); o.material = Array.isArray(o.material) ? cl : cl[0]; o.userData.inspectId = id; pick.push(o); } });
    insp[id] = { group, label, badgeOffset: new THREE.Vector3(...badgeOffset), badge: null };
  }

  // floor + shell
  const floor = floorPlane(26, 20, M.concrete, 0, 0, 0); floor.receiveShadow = true;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(24, 7), M.wall); back.position.set(0, 3.5, -9); back.receiveShadow = true; scene.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(18, 7), M.wall); left.rotation.y = Math.PI / 2; left.position.set(-12, 3.5, 0); left.receiveShadow = true; scene.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(18, 7), M.wall); right.rotation.y = -Math.PI / 2; right.position.set(12, 3.5, 0); right.receiveShadow = true; scene.add(right);
  [[0, .5, -8.99, 24, 0], [-11.99, .5, 0, 18, Math.PI / 2], [11.99, .5, 0, 18, -Math.PI / 2]].forEach(([x, y, z, w, ry]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 1), M.wallLow); m.rotation.y = ry; m.position.set(x, y, z); scene.add(m); });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(26, 20), M.ceiling); ceil.rotation.x = Math.PI / 2; ceil.position.y = 7; scene.add(ceil);
  [-6, -2, 2, 6].forEach(z => box(24, .22, .18, M.darkSteel, 0, 6.85, z));
  [[-7, -4.5], [0, -4.5], [7, -4.5], [-7, 1.5], [0, 1.5], [7, 1.5]].forEach(([x, z], i) => { box(1.5, .08, .3, M.fixture, x, 6.5, z); box(.06, .4, .06, M.darkSteel, x, 6.75, z); if (i !== 1 && i !== 4) { const pl = new THREE.PointLight(0xffd7a6, 55, 0, 2); pl.position.set(x, 6.3, z); scene.add(pl); } });

  // lights
  scene.add(new THREE.HemisphereLight(0xc9d4e4, 0x2a2421, .5));
  const sun = new THREE.DirectionalLight(0xffe6c6, 2.3); sun.position.set(7, 14, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 50 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03; sun.shadow.radius = 4; scene.add(sun); scene.add(sun.target);

  // floor markings
  floorPlane(22, 1.6, M.green, 0, 3); floorPlane(22, .1, M.yellowLine, 0, 3.85, .012); floorPlane(22, .1, M.yellowLine, 0, 2.15, .012);
  [-9, 1.5, 8].forEach(x => floorPlane(.9, .9, new THREE.MeshStandardMaterial({ map: T.arrow, transparent: true, roughness: .8 }), x, 3, .015));
  floorPlane(1.8, 1.6, new THREE.MeshStandardMaterial({ map: T.hatch, transparent: true, roughness: .8 }), -6.5, 3, .014);
  floorPlane(8.6, .08, M.yellowLine, -6.8, -4.85, .012); floorPlane(.08, 8.6, M.yellowLine, 9.95, -2.8, .012);

  // racking
  function rack(x, z, rotY, bays) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g);
    const bw = 2.8, n = bays.length;
    for (let i = 0; i <= n; i++) { [.5, -.5].forEach(zz => box(.1, 5, .1, M.steel, i * bw, 2.5, zz, g)); box(.1, .06, 1, M.steel, i * bw, 4.95, 0, g); box(.1, .06, 1, M.steel, i * bw, .6, 0, g); box(.28, .4, .28, M.stripe, i * bw, .2, .5, g); }
    const sh = blob(n * bw + 1.5, 2.4, n * bw / 2, 0, g);
    bays.forEach((b, i) => {
      const bg = new THREE.Group(); bg.position.set(i * bw + bw / 2, 0, 0); g.add(bg);
      [1.7, 3.4].forEach(y => { box(bw - .1, .12, .08, M.beam, 0, y, .5, bg); box(bw - .1, .12, .08, M.beam, 0, y, -.5, bg); });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(.55, .37), new THREE.MeshStandardMaterial({ map: T.bayTex(b.num), roughness: .6 })); sign.position.set(-bw / 2 + .32, 4.6, .56); bg.add(sign);
      b.levels.forEach((lv, li) => { const y = li === 0 ? 0 : [1.7, 3.4][li - 1] + .06; lv.forEach((spec, pi) => { if (!spec) return; const px = pi === 0 ? -.68 : .68; palletLoad(bg, px, y, 0, spec); }); });
      if (b.id) register(bg, b.id, b.label, [0, 5.3, .6]);
    });
  }
  function palletLoad(parent, x, y, z, spec) {
    const pg = new THREE.Group(); pg.position.set(x, y, z); parent.add(pg);
    box(1.2, .14, 1, M.wood, 0, .07, 0, pg);
    const st = new THREE.Group(); pg.add(st);
    const high = spec.high || 2, cw = .56, cd = .46, ch = .4;
    for (let h = 0; h < high; h++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { if (spec.sparse && h === high - 1 && i + j > 0) continue; const m = box(cw - .02, ch - .02, cd - .02, M.carton, (i - .5) * cw, .14 + ch / 2 + h * ch, (j - .5) * cd, st); m.rotation.y = (R() - .5) * .06; }
    if (spec.lean) { st.rotation.x = .17; st.rotation.z = -.08; st.position.set(.18, .02, .42); }
    return pg;
  }
  const L = (high, sparse) => ({ high, sparse });
  rack(-11, -5.5, 0, [
    { num: '01', id: 'bay01', label: 'Rack bay 01', levels: [[L(2), L(2)], [L(2), L(1)], [L(2), L(2)]] },
    { num: '02', id: 'goodrack', label: 'Rack bay 02', levels: [[L(2), L(2)], [L(2), L(2)], [L(2), L(2)]] },
    { num: '03', id: 'bay03', label: 'Rack bay 03', levels: [[L(2), L(1)], [L(2), L(2)], [L(1), null]] },
  ]);
  rack(10.6, -7, -Math.PI / 2, [
    { num: '04', id: 'bay04', label: 'Rack bay 04', levels: [[L(2), L(2)], [L(1), L(2)], [L(2), L(2)]] },
    { num: '05', id: 'rack', label: 'Rack bay 05', levels: [[L(2), L(2)], [L(2), L(2)], [L(2), { high: 3, lean: true }]] },
    { num: '06', id: 'bay06', label: 'Rack bay 06', levels: [[L(2), L(2)], [L(2), null], [L(2, true), L(2)]] },
  ]);

  // loose pallets near dock
  { const g = new THREE.Group(); scene.add(g); palletLoad(g, -6.8, 0, -7.2, L(2)); palletLoad(g, -5.4, 0, -7.4, L(1)); palletLoad(g, -3.6, 0, -6.9, { high: 2, sparse: true }); blob(4.2, 2.4, -5.2, -7.1, g); register(g, 'pallets', 'Floor-stacked pallets', [-5.2, 1.6, -7.1]); }

  // loading dock
  { const g = new THREE.Group(); g.position.set(-5, 0, -8.97); scene.add(g);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(4, 4.2), M.slats); door.position.y = 2.1; door.receiveShadow = true; g.add(door);
    box(.18, 4.4, .12, M.stripe, -2.1, 2.2, .02, g); box(.18, 4.4, .12, M.stripe, 2.1, 2.2, .02, g); box(4.4, .18, .12, M.darkSteel, 0, 4.4, .02, g);
    floorPlane(4, .35, M.stripe, 0, .3, .013, g); box(.4, .5, .25, M.tyre, -1.6, .25, .2, g); box(.4, .5, .25, M.tyre, 1.6, .25, .2, g);
    register(g, 'dock', 'Loading dock', [0, 4.9, .5]); }

  // emergency exit + hazard cartons
  { const g = new THREE.Group(); scene.add(g);
    box(1.1, 2.2, .06, M.darkSteel, 6, 1.1, -8.95, g); box(1, 2.1, .08, M.grey, 6, 1.05, -8.92, g); box(.8, .06, .06, M.chrome, 6, 1, -8.84, g);
    const sign = box(.95, .32, .08, [M.darkSteel, M.darkSteel, M.darkSteel, M.darkSteel, new THREE.MeshStandardMaterial({ map: T.exit, emissive: 0xffffff, emissiveMap: T.exit, emissiveIntensity: 1.1, color: 0x0f9d5e }), M.darkSteel], 6, 2.55, -8.86, g);
    sign.castShadow = false; const gl = new THREE.PointLight(0x2ee08a, 5, 4, 2); gl.position.set(6, 2.4, -8.4); g.add(gl);
    palletLoad(g, 5.9, 0, -8.3, L(2)); const extra = box(.54, .38, .44, M.carton, 6.5, .19, -7.65, g); extra.rotation.y = .4; blob(2.4, 1.8, 6, -8.1, g);
    register(g, 'exit', 'Emergency exit', [6, 2.3, -7.7]); }

  // spill
  { const g = new THREE.Group(); g.position.set(5, 0, 3.6); scene.add(g);
    [[0, 0, 1.5, 1], [.9, .5, 1, .7], [-.7, .55, .8, .5]].forEach(([x, z, sx, sz]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(.5, 40), M.spill); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(x, .02, z); m.renderOrder = 2; g.add(m); });
    register(g, 'spill', 'Pedestrian walkway', [0, .9, 0]); }

  // forklift
  const fork = new THREE.Group(); fork.position.set(-2.2, 0, 2.8); scene.add(fork);
  { const g = fork;
    box(1.1, .55, 1.6, M.hivis, 0, .55, .1, g); box(1.1, .7, .55, M.hivis, 0, .62, .85, g); box(1.12, .12, .5, M.stripe, 0, .3, 1.1, g);
    box(.5, .14, .5, M.black, 0, .95, .35, g); box(.5, .55, .1, M.black, 0, 1.28, .62, g);
    const col = box(.06, .6, .06, M.darkSteel, 0, 1.1, -.25, g); col.rotation.x = .5; const wheel = mesh(new THREE.CylinderGeometry(.16, .16, .04, 20), M.black, 0, 1.36, -.42, g); wheel.rotation.x = 1.0;
    [[-.5, -.55], [.5, -.55], [-.5, .7], [.5, .7]].forEach(([x, z]) => box(.06, 1.35, .06, M.black, x, 1.5, z, g));
    box(1.1, .06, 1.4, M.black, 0, 2.15, .07, g); [-.4, -.1, .2, .5].forEach(z => box(1.0, .03, .08, M.black, 0, 2.13, z, g));
    [-.36, .36].forEach(x => box(.09, 2.5, .12, M.darkSteel, x, 1.25, -.95, g)); box(.8, .08, .1, M.darkSteel, 0, 2.45, -.95, g); box(.9, .55, .06, M.darkSteel, 0, .5, -1.03, g);
    [-.26, .26].forEach(x => box(.12, .05, 1.1, M.grey, x, .08, -1.6, g));
    [[-.6, -.6], [.6, -.6], [-.6, .7], [.6, .7]].forEach(([x, z]) => { const w = mesh(new THREE.CylinderGeometry(.3, .3, .24, 24), M.tyre, x, .3, z, g); w.rotation.z = Math.PI / 2; const h = mesh(new THREE.CylinderGeometry(.14, .14, .26, 16), M.grey, x, .3, z, g); h.rotation.z = Math.PI / 2; });
    const beacon = mesh(new THREE.CylinderGeometry(.08, .09, .14, 16), new THREE.MeshStandardMaterial({ color: 0xf2a33a, emissive: 0xf2a33a, emissiveIntensity: .6 }), 0, 2.25, .55, g); beacon.castShadow = false;
    const bl = new THREE.PointLight(0xffa640, 0, 5, 2); bl.position.set(0, 2.3, .55); g.add(bl);
    blob(2.2, 3.4, 0, 0, g);
    register(g, 'forklift', 'Forklift', [0, 2.8, 0]);
    anim.push((t, reduced) => { const p = (Math.sin(t * 1.6) + 1) / 2; beacon.material.emissiveIntensity = .4 + p * 1.2; bl.intensity = p * 3; if (!reduced) g.position.z = 2.8 + Math.sin(t * .45) * .9; }); }

  // workbench
  { const g = new THREE.Group(); g.position.set(-11.1, 0, 5.5); g.rotation.y = Math.PI / 2; scene.add(g);
    box(2.2, .08, .75, M.wood, 0, .9, 0, g); box(2.2, .04, .7, M.darkSteel, 0, .35, 0, g); [[-1, -.3], [1, -.3], [-1, .3], [1, .3]].forEach(([x, z]) => box(.06, .9, .06, M.darkSteel, x, .45, z, g));
    box(.45, .18, .22, M.red, -.6, 1.03, 0, g); box(.3, .25, .3, M.carton, .55, 1.06, -.1, g); mesh(new THREE.CylinderGeometry(.08, .08, .3, 14), M.chrome, .1, 1.09, .15, g);
    const pb = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), M.peg); pb.position.set(0, 1.75, -.45); g.add(pb);
    blob(3, 1.6, 0, 0, g); register(g, 'workbench', 'Workbench', [0, 2.4, 0]); }

  // fire extinguisher (decoy)
  { const g = new THREE.Group(); g.position.set(-11.82, 0, .5); scene.add(g);
    mesh(new THREE.CylinderGeometry(.09, .09, .55, 20), M.red, 0, 1.0, 0, g); mesh(new THREE.CylinderGeometry(.05, .07, .08, 12), M.black, 0, 1.31, 0, g); box(.16, .04, .04, M.chrome, .04, 1.36, 0, g);
    box(.03, .3, .03, M.black, .1, 1.05, -.04, g); box(.05, .3, .14, M.grey, -.08, 1.0, 0, g);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(.34, .34), new THREE.MeshStandardMaterial({ map: T.fireSign, roughness: .6 })); s.rotation.y = Math.PI / 2; s.position.set(.02, 1.75, 0); g.add(s);
    register(g, 'extinguisher', 'Fire extinguisher', [.3, 2.2, 0]); }

  // first-aid station (decoy)
  { const g = new THREE.Group(); g.position.set(11.85, 0, 4); scene.add(g);
    box(.14, .6, .5, [M.white, new THREE.MeshStandardMaterial({ map: T.cross, roughness: .5 }), M.white, M.white, M.white, M.white], 0, 1.5, 0, g);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(.5, .14), new THREE.MeshStandardMaterial({ color: 0x17a35c, roughness: .6 })); s.rotation.y = -Math.PI / 2; s.position.set(-.09, 1.95, 0); g.add(s);
    register(g, 'firstaid', 'First-aid station', [-.3, 2.3, 0]); }

  return { scene, insp, pick, anim, fork };
}

// ---------- camera controller ----------
class Orbit {
  constructor(cam, el) {
    this.cam = cam; this.el = el; this.cur = { theta: .3, phi: 1.12, r: 21 }; this.goal = { ...this.cur };
    this.target = new THREE.Vector3(0, 1.2, -1.5); this.goalTarget = this.target.clone();
    this.limits = { rMin: 4.5, rMax: 26, phiMin: .7, phiMax: 1.46 }; this.enabled = false; this.par = { x: 0, y: 0 }; this.parGoal = { x: 0, y: 0 }; this.auto = 0; this.tween = null; this.reduced = false;
    this.ptrs = new Map(); this.pinch = 0;
    el.addEventListener('pointerdown', e => { this.ptrs.set(e.pointerId, [e.clientX, e.clientY]); el.setPointerCapture(e.pointerId); if (this.ptrs.size === 2) this.pinch = this.dist(); });
    el.addEventListener('pointermove', e => { if (!this.ptrs.has(e.pointerId)) return; const p = this.ptrs.get(e.pointerId); const dx = e.clientX - p[0], dy = e.clientY - p[1]; this.ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (!this.enabled || this.tween) return; if (this.ptrs.size === 2) { const d = this.dist(); if (this.pinch) this.zoom(Math.pow(.995, d - this.pinch)); this.pinch = d; return; } this.goal.theta -= dx * .005; this.goal.phi = this.clampPhi(this.goal.phi - dy * .004); });
    const up = e => { this.ptrs.delete(e.pointerId); this.pinch = 0; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => { if (!this.enabled) return; e.preventDefault(); this.zoom(Math.pow(1.0015, e.deltaY)); }, { passive: false });
    el.addEventListener('keydown', e => { if (!this.enabled || this.tween) return; const k = e.key; if (k === 'ArrowLeft') this.goal.theta += .12; else if (k === 'ArrowRight') this.goal.theta -= .12; else if (k === 'ArrowUp') this.goal.phi = this.clampPhi(this.goal.phi - .08); else if (k === 'ArrowDown') this.goal.phi = this.clampPhi(this.goal.phi + .08); else if (k === '+' || k === '=') this.zoom(.85); else if (k === '-' || k === '_') this.zoom(1.18); else return; e.preventDefault(); });
  }
  dist() { const a = [...this.ptrs.values()]; return Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); }
  clampPhi(p) { return Math.min(this.limits.phiMax, Math.max(this.limits.phiMin, p)); }
  zoom(f) { this.goal.r = Math.min(this.limits.rMax, Math.max(this.limits.rMin, this.goal.r * f)); }
  set(p) { this.tween = null; this.cur = { theta: p.theta, phi: p.phi, r: p.r }; this.goal = { ...this.cur }; this.target.set(...p.t); this.goalTarget.copy(this.target); this.apply(); }
  tweenTo(p, ms) {
    if (this.reduced || ms <= 0) { this.set(p); return Promise.resolve(); }
    return new Promise(res => { const from = { ...this.cur, t: this.target.clone() }; let dth = p.theta - from.theta; dth = Math.atan2(Math.sin(dth), Math.cos(dth)); this.tween = { from, to: { theta: from.theta + dth, phi: p.phi, r: p.r, t: new THREE.Vector3(...p.t) }, start: performance.now(), ms, res }; });
  }
  update(dt) {
    if (this.tween) { const tw = this.tween, k = ease(Math.min(1, (performance.now() - tw.start) / tw.ms)); this.cur.theta = tw.from.theta + (tw.to.theta - tw.from.theta) * k; this.cur.phi = tw.from.phi + (tw.to.phi - tw.from.phi) * k; this.cur.r = tw.from.r + (tw.to.r - tw.from.r) * k; this.target.lerpVectors(tw.from.t, tw.to.t, k); this.goal = { ...this.cur }; this.goalTarget.copy(this.target); if (k >= 1) { this.tween = null; tw.res(); } }
    else { if (this.auto) this.goal.theta += this.auto * dt; const a = 1 - Math.pow(.002, dt); this.par.x += (this.parGoal.x - this.par.x) * a; this.par.y += (this.parGoal.y - this.par.y) * a; this.cur.theta += (this.goal.theta - this.cur.theta) * a; this.cur.phi += (this.goal.phi - this.cur.phi) * a; this.cur.r += (this.goal.r - this.cur.r) * a; this.target.lerp(this.goalTarget, a); }
    this.apply();
  }
  apply() { const { theta, phi, r } = this.cur, t = this.target, th = theta + this.par.x, ph = this.clampPhi(phi + this.par.y); this.cam.position.set(t.x + r * Math.sin(ph) * Math.sin(th), t.y + r * Math.cos(ph), t.z + r * Math.sin(ph) * Math.cos(th)); this.cam.lookAt(t); }
}

// ---------- view ----------
class View {
  constructor(opts = {}) {
    this.opts = opts;
    const canvas = document.createElement('canvas'); canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;border-radius:inherit';
    canvas.tabIndex = 0; canvas.setAttribute('aria-label', opts.ariaLabel || '3D warehouse scene'); canvas.setAttribute('role', 'img');
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const b = buildScene(); Object.assign(this, b);
    this.camera = new THREE.PerspectiveCamera(42, 1, .1, 120); this.controls = new Orbit(this.camera, canvas); this.controls.set(PRESETS.hero);
    this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2(); this.hover = null; this.focused = null; this.active = false; this.clock = new THREE.Clock(); this.t = 0; this.pulses = [];
    this.ro = new ResizeObserver(() => this.resize());
    let down = null;
    canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY, performance.now()]; });
    canvas.addEventListener('pointerup', e => { if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); const dt = performance.now() - down[2]; down = null; if (moved < 6 && dt < 600 && this.controls.enabled && !this.controls.tween) { const id = this.pickAt(e); if (id && this.onInspect) this.onInspect(id); } });
    canvas.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !this.controls.enabled || e.buttons) { if (this.hover) this.setHover(null); return; } const id = this.pickAt(e); const r = canvas.getBoundingClientRect(); this.setHover(id, e.clientX - r.left, e.clientY - r.top); });
    canvas.addEventListener('pointerleave', () => this.setHover(null));
    const loop = () => { this.raf = requestAnimationFrame(loop); const dt = Math.min(.05, this.clock.getDelta()); if (!this.active) return; this.t += dt; this.controls.update(dt); this.anim.forEach(f => f(this.t, this.controls.reduced)); this.tickPulses(dt); this.renderer.render(this.scene, this.camera); };
    loop();
  }
  mount(host) { if (this.canvas.parentElement !== host) host.appendChild(this.canvas); this.ro.disconnect(); this.ro.observe(host); this.resize(); }
  resize() { const h = this.canvas.parentElement; if (!h) return; const w = h.clientWidth, hh = h.clientHeight; if (!w || !hh) return; this.renderer.setSize(w, hh, false); this.camera.aspect = w / hh; this.camera.updateProjectionMatrix(); }
  pickAt(e) { const r = this.canvas.getBoundingClientRect(); this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); this.ray.setFromCamera(this.ptr, this.camera); const hit = this.ray.intersectObjects(this.pick, false)[0]; return hit ? hit.object.userData.inspectId : null; }
  tint(id, hex, k) { const it = this.insp[id]; if (!it) return; it.group.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (!m.emissive || !m.userData.base) return; if (hex == null) { m.emissive.setHex(m.userData.base.e); m.emissiveIntensity = m.userData.base.i; } else { m.emissive.setHex(hex); m.emissiveIntensity = k; } }); }); }
  setHover(id, x, y) { if (this.hover && this.hover !== id && this.hover !== this.focused) this.tint(this.hover, null); if (id && id !== this.focused) this.tint(id, 0x84bfff, .22); this.hover = id; this.canvas.style.cursor = id ? 'pointer' : 'grab'; if (this.onHover) this.onHover(id ? { id, label: this.insp[id].label, x, y } : null); }
  focus(id) { if (this.focused) this.tint(this.focused, null); this.focused = id; if (id) this.tint(id, 0x42ddc5, .11); }
  setBadge(id, kind) { const it = this.insp[id]; if (!it) return; if (it.badge) { it.group.remove(it.badge); it.badge = null; } if (!kind) return; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.badgeTex(kind), depthTest: false, transparent: true })); s.scale.set(.55, .55, 1); const p = it.badgeOffset.clone(); if (it.group.parent !== this.scene) {/* local */ } s.position.copy(p); s.renderOrder = 10; it.group.add(s); it.badge = s; }
  clearBadges() { Object.keys(this.insp).forEach(id => this.setBadge(id, null)); this.focus(null); }
  pulseZone(id) { const it = this.insp[id]; if (!it) return; const p = new THREE.Vector3(); it.group.getWorldPosition(p); if (id === 'rack') p.set(9.6, 0, -2.8); if (id === 'exit') p.set(6, 0, -7.9); const m = new THREE.Mesh(new THREE.RingGeometry(.6, 2.6, 48), new THREE.MeshBasicMaterial({ color: 0x42ddc5, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, .03, p.z); m.renderOrder = 5; this.scene.add(m); this.pulses.push({ m, t: 0 }); }
  tickPulses(dt) { this.pulses = this.pulses.filter(p => { p.t += dt; const k = p.t / 4; if (k >= 1) { this.scene.remove(p.m); return false; } const w = Math.sin(k * Math.PI * 3) * .5 + .5; p.m.material.opacity = .22 * w * (1 - k); p.m.scale.setScalar(1 + k * .6); return true; }); }
  preset(name, ms) { return this.controls.tweenTo(PRESETS[name] || PRESETS.inspection, ms); }
  setPreset(name) { this.controls.set(PRESETS[name]); }
  setReduced(v) { this.controls.reduced = v; }
}

window.XRWarehouse = { createView: (opts) => { try { return new View(opts); } catch (e) { console.warn('WebGL unavailable', e); return null; } }, PRESETS };
window.dispatchEvent(new Event('xrwarehouse-ready'));
