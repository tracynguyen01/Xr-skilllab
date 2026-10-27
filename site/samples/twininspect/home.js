import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function prng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export const ROOMS = [
  { id: 'hall', name: 'Entry hallway', x1: 2.8, z1: -1.6, x2: 4.0, z2: 4.5, thermal: true },
  { id: 'living', name: 'Living', x1: -2.6, z1: -1.0, x2: 2.8, z2: 4.5, thermal: true },
  { id: 'kitchen', name: 'Kitchen', x1: -2.6, z1: -4.5, x2: 2.8, z2: -1.0, thermal: true },
  { id: 'bath', name: 'Bathroom', x1: 4.0, z1: -1.6, x2: 6, z2: 0.8, thermal: true },
  { id: 'bed1', name: 'Bedroom 1', x1: -6, z1: -4.5, x2: -2.6, z2: 0 },
  { id: 'bed2', name: 'Bedroom 2', x1: 2.8, z1: -4.5, x2: 6, z2: -1.6 },
  { id: 'bed3', name: 'Bedroom 3', x1: -6, z1: 0, x2: -2.6, z2: 4.5 },
  { id: 'laundry', name: 'Laundry', x1: 4.0, z1: 0.8, x2: 6, z2: 4.5, thermal: true },
  { id: 'exterior', name: 'Exterior', x1: 6, z1: -4.5, x2: 8.5, z2: 8 },
];
export const POINTS = [
  { id: 'front', x: 3.4, z: 7.0, room: 'exterior', yaw: Math.PI, label: 'Front path' },
  { id: 'side', x: 7.0, z: 2.6, room: 'exterior', yaw: Math.PI / 2 + .4, label: 'Side path' },
  { id: 'entry', x: 3.4, z: 3.6, room: 'hall', yaw: Math.PI, label: 'Entry' },
  { id: 'hall', x: 3.4, z: 0.6, room: 'hall', yaw: Math.PI, label: 'Hallway' },
  { id: 'hallN', x: 3.4, z: -1.0, room: 'hall', yaw: Math.PI, label: 'Hallway north' },
  { id: 'living', x: 0.3, z: 2.4, room: 'living', yaw: Math.PI, label: 'Living' },
  { id: 'kitchen', x: 0.2, z: -2.4, room: 'kitchen', yaw: Math.PI, label: 'Kitchen' },
  { id: 'bath', x: 5.0, z: -0.3, room: 'bath', yaw: Math.PI * .75, label: 'Bathroom' },
  { id: 'bed1', x: -4.3, z: -2.2, room: 'bed1', yaw: Math.PI, label: 'Bedroom 1' },
  { id: 'bed2', x: 4.4, z: -3.0, room: 'bed2', yaw: Math.PI, label: 'Bedroom 2' },
  { id: 'bed3', x: -4.3, z: 2.2, room: 'bed3', yaw: Math.PI, label: 'Bedroom 3' },
  { id: 'laundry', x: 5.0, z: 2.4, room: 'laundry', yaw: Math.PI, label: 'Laundry' },
];
// planted items: anchors in world space
export const PLANTS = {
  stain: { pos: [3.4, 2.38, -0.4], room: 'hall', surface: 'ceiling', title: 'Ceiling water stain', category: 'Water/Moisture', severity: 'High', action: 'Plumber to locate the leak source above or near the bathroom.', notes: 'Brown irregular ring on the hallway ceiling outside the bathroom. Thermal shows a cool patch matching the stain; moisture probe reads 38%.', ai: true, thermal: true },
  grout: { pos: [5.88, 0.18, -1.15], room: 'bath', surface: 'east wall', title: 'Failed shower grout and silicone', category: 'Water/Moisture', severity: 'Medium', action: 'Waterproofing specialist to assess. Likely linked to the hallway ceiling stain.', notes: 'Dark, cracked grout lines at the shower base. Adjacent wall reads 31%.', ai: true, thermal: true },
  outlet: { pos: [0.9, 1.15, -4.38], room: 'kitchen', surface: 'north wall', title: 'Scorched power point', category: 'Electrical', severity: 'High', action: 'Licensed electrician before use; isolate the circuit.', notes: 'Brown heat discolouration around the outlet on the kitchen splashback.', ai: true },
  downpipe: { pos: [6.12, 0.7, 4.2], room: 'exterior', surface: 'east wall', title: 'Disconnected downpipe', category: 'Drainage', severity: 'Medium', action: 'Plumber to reconnect to stormwater and prevent water pooling at the footings.', notes: 'Downpipe ends above the ground with a pooled-water stain against the wall base.', ai: true },
  alarm: { pos: [3.4, 2.38, 2.0], room: 'hall', surface: 'ceiling', title: 'Missing smoke alarm', category: 'Safety', severity: 'High', action: 'Install a compliant smoke alarm.', notes: 'Empty mounting plate with screw holes on the hallway ceiling.' },
  crack: { pos: [3.55, 2.21, -1.54], room: 'hall', surface: 'north wall', title: 'Diagonal hairline crack', category: 'Structural', severity: 'Low', action: 'Monitor; refer to a structural engineer if it widens. Crack width cannot be assessed remotely.', notes: 'Hairline crack running diagonally from the corner of the bedroom 2 door frame, roughly 0.6 m long.' },
  touchup: { pos: [-2.54, 1.4, 3.6], room: 'living', surface: 'west wall', title: 'Possible moisture stain', category: 'Water/Moisture', severity: 'Medium', action: 'Investigate for moisture.', notes: 'Area of different surface sheen on the living room wall.', ai: true, falsePositive: true },
  cord: { pos: [-2.5, 0.05, 0.9], room: 'living', surface: 'west wall', decoy: 'Power cord running along the skirting. Nothing notable.' },
  rug: { pos: [1.3, 0.03, 0.95], room: 'living', surface: 'floor', decoy: 'Rug edge is slightly turned. Nothing notable.' },
  door: { pos: [-2.95, 0.3, 2.45], room: 'bed3', surface: 'door', decoy: 'Scuffed door face. Cosmetic only. Nothing notable.' },
};
export const MOISTURE = [
  { id: 'm1', pos: [3.4, 2.2, -0.6], room: 'hall', value: 38 }, { id: 'm2', pos: [5.8, 1.0, -0.6], room: 'bath', value: 31 },
  { id: 'm3', pos: [-2.45, 1.1, 3.6], room: 'living', value: 12 }, { id: 'm4', pos: [-2.45, 0.6, -3.0], room: 'bed1', value: 10 },
  { id: 'm5', pos: [-1.6, 0.5, -4.3], room: 'kitchen', value: 16 }, { id: 'm6', pos: [4.1, 0.6, 1.4], room: 'laundry', value: 21 },
];
export const AI_FLAGS = ['stain', 'grout', 'outlet', 'downpipe', 'touchup'];
export function roomAt(x, z) { const r = ROOMS.find(r => r.id !== 'exterior' && x >= r.x1 && x <= r.x2 && z >= r.z1 && z <= r.z2); return r ? r.id : 'exterior'; }

// ---------- textures ----------
const T = {};
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function tex(c, rep, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t; }
function noise(g, w, h, n, a, dark = true) { for (let i = 0; i < n; i++) { const v = dark ? 20 : 240; g.fillStyle = `rgba(${v},${v},${v},${Math.random() * a})`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
function textCanvas(text, { font = 'bold 36px Manrope, Helvetica, Arial', bg = 'rgba(26,29,33,.9)', fg = '#fff', pad = 22, dot = null, h = 64 } = {}) {
  const m = cv(8, 8).getContext('2d'); m.font = font; const w = Math.ceil(m.measureText(text).width) + pad * 2 + (dot ? 40 : 0);
  const c = cv(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, h, h / 2); g.fill();
  if (dot) { g.fillStyle = dot; g.beginPath(); g.arc(pad + 10, h / 2, 12, 0, 7); g.fill(); }
  g.fillStyle = fg; g.font = font; g.textBaseline = 'middle'; g.fillText(text, pad + (dot ? 40 : 0), h / 2 + 1); return c;
}
function buildTextures() {
  if (T.ready) return; T.ready = true; const R = prng(3); Math.random = Math.random; // deterministic enough via canvas noise
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#ECE8E0'; g.fillRect(0, 0, 256, 256); noise(g, 256, 256, 1500, .04); noise(g, 256, 256, 1500, .08, false); T.plaster = tex(c, [1, 1]); }
  { const c = cv(512, 512), g = c.getContext('2d'); const cols = ['#B5895A', '#A97C4D', '#BF9366', '#9E7245', '#B2845A']; for (let r = 0; r < 8; r++) { const off = (r % 2) * 180; for (let x = -256; x < 512; x += 256) { g.fillStyle = cols[(r * 3 + ((x + 256) / 256)) % 5]; g.fillRect(x + off, r * 64, 254, 62); } g.fillStyle = 'rgba(40,25,10,.45)'; g.fillRect(0, r * 64 + 62, 512, 2); } for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(60,35,10,${.05 + Math.random() * .1})`; g.lineWidth = 1; const y = Math.random() * 512; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(170, y + Math.random() * 6 - 3, 340, y + Math.random() * 6 - 3, 512, y); g.stroke(); } T.timber = tex(c, [1, 1]); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#B8B2A8'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#DAD6CF' : '#D4CFC7'; g.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); } noise(g, 256, 256, 800, .05); T.tile = tex(c, [1, 1]); }
  { const c = cv(256, 128), g = c.getContext('2d'); g.fillStyle = '#C9C4BC'; g.fillRect(0, 0, 256, 128); for (let r = 0; r < 4; r++) { const off = (r % 2) * 32; for (let x = -64; x < 256; x += 64) { g.fillStyle = '#F4F2EE'; g.fillRect(x + off + 2, r * 32 + 2, 60, 28); } } T.subway = tex(c, [1, 1]); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#D8D3CB'; g.fillRect(0, 0, 256, 256); noise(g, 256, 256, 3000, .12); noise(g, 256, 256, 1500, .2, false); T.stone = tex(c, [1, 1]); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#D9D3C7'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 32) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y + 28, 256, 4); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, y, 256, 2); } noise(g, 256, 256, 800, .05); T.clad = tex(c, [1, 1]); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#4B5057'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 32) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + 26, 256, 6); for (let x = (y / 32 % 2) * 32; x < 256; x += 64) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, y, 2, 26); } } T.roof = tex(c, [1, 1]); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#6E8F4F'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(${30 + Math.random() * 60},${90 + Math.random() * 70},${20 + Math.random() * 40},.5)`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 3); } T.grass = tex(c, [1, 1]); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#BDB8B0'; g.fillRect(0, 0, 256, 256); noise(g, 256, 256, 3000, .08); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.strokeRect(0, 0, 256, 256); T.concrete = tex(c, [1, 1]); }
  { const c = cv(512, 352), g = c.getContext('2d'); g.fillStyle = '#8A6A52'; g.fillRect(0, 0, 512, 352); g.fillStyle = '#B99A7E'; g.fillRect(24, 24, 464, 304); g.fillStyle = '#8A6A52'; g.fillRect(48, 48, 416, 256); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#B99A7E' : '#A3836A'; g.fillRect(80 + i * 60, 80, 30, 192); } T.rug = tex(c, [1, 1]); }
  { const c = cv(256, 256), g = c.getContext('2d'); for (let i = 0; i < 3; i++) { const gr = g.createRadialGradient(128, 128, 20 + i * 25, 128, 128, 70 + i * 22); gr.addColorStop(0, 'rgba(120,80,40,0)'); gr.addColorStop(.7, `rgba(110,70,30,${.35 - i * .08})`); gr.addColorStop(1, 'rgba(90,55,25,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(128, 128, 120, 95 + i * 8, i * .6, 0, 7); g.fill(); } T.stain = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 20, 128, 128, 120); gr.addColorStop(0, 'rgba(60,30,10,.8)'); gr.addColorStop(.5, 'rgba(90,50,20,.45)'); gr.addColorStop(1, 'rgba(90,50,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); T.scorch = tex(c); }
  { const c = cv(128, 128), g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#E9E5DC'; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill(); g.strokeStyle = '#B9B2A6'; g.lineWidth = 4; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke(); g.fillStyle = '#5a5a5a'; [[40, 64], [88, 64]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(64, 64, 10, 0, 7); g.fill(); T.plate = tex(c); }
  { const c = cv(512, 288), g = c.getContext('2d'); g.strokeStyle = 'rgba(50,45,40,.85)'; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); let x = 490, y = 262; g.moveTo(x, y); for (let i = 0; i < 18; i++) { x -= 26; y -= 13 + (Math.random() - .5) * 10; g.lineTo(x, y); } g.stroke(); T.crack = tex(c); }
  { const c = cv(512, 128), g = c.getContext('2d'); g.fillStyle = 'rgba(70,60,50,.55)'; g.fillRect(0, 96, 512, 32); g.strokeStyle = 'rgba(40,35,30,.9)'; g.lineWidth = 3; for (let x = 20; x < 512; x += 60) { g.beginPath(); g.moveTo(x, 128); g.lineTo(x + 8, 70 + Math.random() * 20); g.lineTo(x + 14, 40 + Math.random() * 20); g.stroke(); } g.fillStyle = 'rgba(30,30,30,.5)'; for (let x = 0; x < 512; x += 64) g.fillRect(x, 60, 3, 68); T.grout = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 10, 128, 128, 120); gr.addColorStop(0, 'rgba(60,60,60,.5)'); gr.addColorStop(1, 'rgba(60,60,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); T.scuff = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 10, 128, 128, 125); gr.addColorStop(0, 'rgba(40,90,220,.95)'); gr.addColorStop(.5, 'rgba(60,160,230,.8)'); gr.addColorStop(.8, 'rgba(120,210,170,.5)'); gr.addColorStop(1, 'rgba(200,220,80,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(128, 128, 125, 100, .4, 0, 7); g.fill(); T.cool = tex(c); }
  { const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#E8A33A'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 40; i++) { const gr = g.createRadialGradient(Math.random() * 256, Math.random() * 256, 5, 128, 128, 160); gr.addColorStop(0, `rgba(${230 + Math.random() * 25},${120 + Math.random() * 60},40,.25)`); gr.addColorStop(1, 'rgba(230,160,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); } T.thermal = tex(c, [1, 1]); }
  { const c = cv(256, 256), g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); T.blob = tex(c, null, false); }
  { const c = cv(128, 128), g = c.getContext('2d'); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(64, 64, 46, 0, 7); g.fill(); T.disc = tex(c); }
  { const c = cv(128, 128), g = c.getContext('2d'); g.strokeStyle = '#2F6FED'; g.lineWidth = 7; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); g.fillStyle = 'rgba(47,111,237,.25)'; g.beginPath(); g.arc(64, 64, 46, 0, 7); g.fill(); g.fillStyle = '#2F6FED'; g.beginPath(); g.arc(64, 64, 14, 0, 7); g.fill(); T.flag = tex(c); }
  T.flagLabel = tex(textCanvas('Pre-flagged', { bg: 'rgba(47,111,237,.95)', font: 'bold 34px Manrope, Helvetica, Arial' }));
  T.labelCache = {};
  T.label = (text, dot) => T.labelCache[text + dot] || (T.labelCache[text + dot] = tex(textCanvas(text, { dot })));
  T.pill = (text, color) => T.labelCache['p' + text + color] || (T.labelCache['p' + text + color] = tex(textCanvas(text, { bg: color, font: 'bold 40px Manrope, Helvetica, Arial', fg: '#fff', pad: 26 })));
}

// ---------- scene ----------
function buildScene() {
  buildTextures();
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xd6e2ec);
  const std = p => new THREE.MeshStandardMaterial(Object.assign({ roughness: .9, metalness: 0 }, p));
  const tiled = (t, rx, ry, p = {}) => { const m = t.clone(); m.needsUpdate = true; m.repeat.set(rx, ry); return std(Object.assign({ map: m }, p)); };
  const M = {
    plaster: std({ map: T.plaster, roughness: .95 }), ceiling: std({ color: 0xF4F1EB, roughness: 1 }), white: std({ color: 0xF7F5F0, roughness: .6 }), trim: std({ color: 0xF3F0EA, roughness: .5 }),
    clad: std({ map: T.clad, roughness: .9 }), roof: std({ map: T.roof, roughness: .95 }), gutter: std({ color: 0x6B7078, roughness: .5, metalness: .4 }), pipe: std({ color: 0x8A8F96, roughness: .5, metalness: .4 }),
    oak: std({ color: 0xC9A47A, roughness: .7 }), dark: std({ color: 0x33363B, roughness: .6 }), steel: std({ color: 0xB6BBC2, roughness: .35, metalness: .7 }), fabric: std({ color: 0x8C949C, roughness: 1 }), fabric2: std({ color: 0xB7BDC4, roughness: 1 }),
    linen: std({ color: 0xF1EDE4, roughness: 1 }), blanket: std({ color: 0x6F8A7A, roughness: 1 }), black: std({ color: 0x1b1b1b, roughness: .8 }), glass: new THREE.MeshStandardMaterial({ color: 0x9fc4dc, transparent: true, opacity: .28, roughness: .1, metalness: .2 }),
    thermal: new THREE.MeshBasicMaterial({ map: T.thermal }), blob: new THREE.MeshBasicMaterial({ map: T.blob, transparent: true, depthWrite: false }),
    thermalNone: new THREE.MeshBasicMaterial({ color: 0x6B7280 }),
  };
  const decal = (t, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ map: t, transparent: true, roughness: .9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }, extra));
  const pick = []; const anim = []; const thermalMeshes = []; const thermalPatches = []; const roofGroup = new THREE.Group(); scene.add(roofGroup);
  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene, ud) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); if (ud) Object.assign(m.userData, ud); pick.push(m); return m; };
  const box = (w, h, d, mat, x, y, z, parent, ud) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent, ud);
  const plane = (w, h, mat, x, y, z, rx = 0, ry = 0, parent = scene, ud) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.rotation.set(rx, ry, 0); m.position.set(x, y, z); m.receiveShadow = true; parent.add(m); if (ud) Object.assign(m.userData, ud); pick.push(m); return m; };
  const blob = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.blob); m.rotation.x = -Math.PI / 2; m.position.set(x, .004, z); m.renderOrder = 1; scene.add(m); };
  const H = 2.4;

  // walls: axis 'x' => runs along x at z=at; axis 'z' => along z at x=at
  function wall({ axis, at, from, to, t = .1, openings = [], mat = M.plaster, thermal = false, skirt = [1, -1], ext = false }) {
    const ops = [...openings].sort((a, b) => a.from - b.from); let cur = from;
    const seg = (a, b, y0, y1) => { if (b - a < .005 || y1 - y0 < .005) return; const len = b - a, h = y1 - y0; const g = axis === 'x' ? new THREE.BoxGeometry(len, h, t) : new THREE.BoxGeometry(t, h, len); const m = new THREE.Mesh(g, mat); if (axis === 'x') m.position.set((a + b) / 2, (y0 + y1) / 2, at); else m.position.set(at, (y0 + y1) / 2, (a + b) / 2); m.castShadow = m.receiveShadow = true; m.userData.wall = true; scene.add(m); pick.push(m); if (thermal) thermalMeshes.push(m); if (ext) { /* exterior: cladding on outside handled by separate skin */ } return m; };
    const skirting = (a, b) => skirt.forEach(s => { const g = axis === 'x' ? new THREE.BoxGeometry(b - a, .09, .014) : new THREE.BoxGeometry(.014, .09, b - a); const m = new THREE.Mesh(g, M.trim); if (axis === 'x') m.position.set((a + b) / 2, .045, at + s * (t / 2 + .007)); else m.position.set(at + s * (t / 2 + .007), .045, (a + b) / 2); scene.add(m); });
    ops.forEach(o => { seg(cur, o.from, 0, H); skirting(cur, o.from); seg(o.from, o.to, o.top, H); if (o.bottom > 0) { seg(o.from, o.to, 0, o.bottom); skirting(o.from, o.to); }
      if (o.door) { // architrave + optional slab
        const jamb = (p) => { const g = axis === 'x' ? new THREE.BoxGeometry(.05, o.top + .02, t + .03) : new THREE.BoxGeometry(t + .03, o.top + .02, .05); const m = new THREE.Mesh(g, M.trim); if (axis === 'x') m.position.set(p, (o.top + .02) / 2, at); else m.position.set(at, (o.top + .02) / 2, p); scene.add(m); };
        jamb(o.from - .02); jamb(o.to + .02); const hg = axis === 'x' ? new THREE.BoxGeometry(o.to - o.from + .1, .06, t + .03) : new THREE.BoxGeometry(t + .03, .06, o.to - o.from + .1); const hm = new THREE.Mesh(hg, M.trim); if (axis === 'x') hm.position.set((o.from + o.to) / 2, o.top + .02, at); else hm.position.set(at, o.top + .02, (o.from + o.to) / 2); scene.add(hm);
        if (o.slab !== false) { const w = o.to - o.from; const dg = new THREE.Group(); const slab = new THREE.Mesh(new THREE.BoxGeometry(w, o.top - .02, .04), M.white); slab.position.set(w / 2, (o.top - .02) / 2, 0); slab.castShadow = slab.receiveShadow = true; dg.add(slab); pick.push(slab); if (o.ud) Object.assign(slab.userData, o.ud); const knob = new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 12), M.steel); knob.position.set(w - .08, 1.0, .04); dg.add(knob); if (o.scuff) { const s = new THREE.Mesh(new THREE.PlaneGeometry(.3, .25), decal(T.scuff)); s.position.set(w * .45, .25, .021); dg.add(s); }
          if (axis === 'x') { dg.position.set(o.from, 0, at); dg.rotation.y = o.open || 0; } else { dg.position.set(at, 0, o.from); dg.rotation.y = Math.PI / 2 + (o.open || 0); } scene.add(dg); }
      }
      if (o.win) { const w = o.to - o.from, h = o.top - o.bottom; const fr = (gw, gh, px, py) => { const g = axis === 'x' ? new THREE.BoxGeometry(gw, gh, t + .04) : new THREE.BoxGeometry(t + .04, gh, gw); const m = new THREE.Mesh(g, M.white); if (axis === 'x') m.position.set(px, py, at); else m.position.set(at, py, px); scene.add(m); }; fr(w + .08, .05, (o.from + o.to) / 2, o.bottom); fr(w + .08, .05, (o.from + o.to) / 2, o.top); fr(.05, h, o.from, (o.top + o.bottom) / 2); fr(.05, h, o.to, (o.top + o.bottom) / 2); fr(.04, h, (o.from + o.to) / 2, (o.top + o.bottom) / 2);
        const gl = new THREE.Mesh(axis === 'x' ? new THREE.PlaneGeometry(w, h) : new THREE.PlaneGeometry(w, h), M.glass); if (axis === 'x') gl.position.set((o.from + o.to) / 2, (o.top + o.bottom) / 2, at); else { gl.position.set(at, (o.top + o.bottom) / 2, (o.from + o.to) / 2); gl.rotation.y = Math.PI / 2; } gl.material.side = THREE.DoubleSide; scene.add(gl); }
      cur = o.to; });
    seg(cur, to, 0, H); skirting(cur, to);
  }
  const DOOR = (c, extra = {}) => Object.assign({ from: c - .41, to: c + .41, bottom: 0, top: 2.04, door: true }, extra);
  const WIN = (a, b, bottom = .9, top = 2.1) => ({ from: a, to: b, bottom, top, win: true });
  // exterior walls (interior plaster; outer skin added below)
  wall({ axis: 'x', at: -4.5, from: -6.1, to: 6.1, t: .2, openings: [WIN(-5.2, -3.4), WIN(-1, 1, 1.1, 2.1), WIN(3.6, 5.2)], skirt: [1], thermal: true });
  wall({ axis: 'x', at: 4.5, from: -6.1, to: 6.1, t: .2, openings: [WIN(-5.0, -3.6), WIN(-.6, 1.6, .7, 2.1), DOOR(3.4, { open: 0, slab: true })], skirt: [-1], thermal: true });
  wall({ axis: 'z', at: -6, from: -4.4, to: 4.4, t: .2, openings: [WIN(-3.3, -1.7), WIN(1.5, 3)], skirt: [1] });
  wall({ axis: 'z', at: 6, from: -4.4, to: 4.4, t: .2, openings: [WIN(-4, -2.4), WIN(-1.0, -.2, 1.5, 2.1), DOOR(2.6, { open: 0 })], skirt: [-1], thermal: true });
  // exterior: plaster walls read as rendered finish; cladding texture kept for gable ends only
  // interior walls
  wall({ axis: 'z', at: 2.8, from: -1.6, to: 4.4, openings: [{ from: 1.2, to: 3.2, bottom: 0, top: 2.1 }], thermal: true });
  wall({ axis: 'z', at: 4.0, from: -1.6, to: 4.4, openings: [DOOR(-.4, { open: -1.3 }), DOOR(2.6, { open: -1.1 })], thermal: true });
  wall({ axis: 'x', at: -1.6, from: 2.8, to: 6, openings: [DOOR(3.4, { open: 1.2 })], thermal: true });
  wall({ axis: 'x', at: 0.8, from: 4.0, to: 6, thermal: true });
  wall({ axis: 'z', at: -2.6, from: -4.4, to: 4.4, openings: [DOOR(-2.2, { open: 1.4 }), DOOR(2.2, { open: 1.3, scuff: true, ud: { plant: 'door' } })], thermal: true });
  wall({ axis: 'x', at: 0, from: -6, to: -2.6 });

  // floors
  const floor = (r, t, scale) => { const w = r.x2 - r.x1, d = r.z2 - r.z1; const m = plane(w, d, tiled(t, w / scale, d / scale), (r.x1 + r.x2) / 2, 0, (r.z1 + r.z2) / 2, -Math.PI / 2); m.userData.floor = true; m.userData.room = r.id; };
  ROOMS.forEach(r => { if (r.id === 'exterior') return; floor(r, r.id === 'bath' || r.id === 'laundry' ? T.tile : T.timber, r.id === 'bath' || r.id === 'laundry' ? .6 : 2.4); });
  const ceil = plane(12, 9, M.ceiling, 0, H, 0, Math.PI / 2); ceil.castShadow = true; ceil.userData.ceiling = true; thermalMeshes.push(ceil); roofGroup.add(ceil);
  // ground + paths
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), tiled(T.grass, 25, 25)); g.rotation.x = -Math.PI / 2; g.position.y = -.01; g.receiveShadow = true; g.userData.ground = true; scene.add(g); pick.push(g); }
  plane(1.3, 13, tiled(T.concrete, 1, 10), 6.85, .002, 1.5, -Math.PI / 2).userData.ground = true;
  plane(1.2, 4, tiled(T.concrete, 1, 3), 3.4, .002, 6.7, -Math.PI / 2).userData.ground = true;
  // roof
  { const ang = Math.atan2(1.6, 4.9); [[1, 2.5], [-1, -2.5]].forEach(([s, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(13, .08, 5.25), tiled(T.roof, 10, 4)); m.rotation.x = s * ang; m.position.set(0, 3.3, z); m.castShadow = false; m.receiveShadow = true; roofGroup.add(m); });
    const sh = new THREE.Shape(); sh.moveTo(-4.95, 2.4); sh.lineTo(4.95, 2.4); sh.lineTo(0, 4.0); const gg = new THREE.ExtrudeGeometry(sh, { depth: .2, bevelEnabled: false }); [[-6.2], [6.0]].forEach(([x]) => { const m = new THREE.Mesh(gg, M.clad); m.rotation.y = Math.PI / 2; m.position.set(x, 0, 0); roofGroup.add(m); });
    [[4.95], [-4.95]].forEach(([z]) => { const g = new THREE.Mesh(new THREE.BoxGeometry(13, .1, .12), M.gutter); g.position.set(0, 2.45, z); scene.add(g); });
    const pipeAt = (x, z, bottom) => { const h = 2.45 - bottom; const p = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, h, 12), M.pipe); p.position.set(x, bottom + h / 2, z); p.castShadow = true; scene.add(p); pick.push(p); return p; };
    pipeAt(-6.18, -4.4, 0); pipeAt(6.18, -4.4, 0); const dp = pipeAt(6.18, 4.35, .7); dp.userData.plant = 'downpipe';
    const el = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .3, 12), M.pipe); el.rotation.z = Math.PI / 2; el.position.set(6.3, .72, 4.35); scene.add(el);
    const st = new THREE.Mesh(new THREE.PlaneGeometry(.9, .6), decal(T.stain)); st.rotation.y = Math.PI / 2; st.position.set(6.14, .3, 4.2); st.userData.plant = 'downpipe'; scene.add(st); pick.push(st);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(.45, 24), new THREE.MeshStandardMaterial({ color: 0x4a4f44, roughness: .15, transparent: true, opacity: .7 })); pool.rotation.x = -Math.PI / 2; pool.position.set(6.6, .006, 4.2); pool.userData.plant = 'downpipe'; scene.add(pool); pick.push(pool); }

  // kitchen
  box(5.0, .88, .58, M.oak, 0.1, .44, -4.11); box(5.0, .04, .62, tiled(T.stone, 4, 1), 0.1, .9, -4.1); box(.8, .02, .4, M.steel, 0, .905, -4.1);
  box(5.0, .7, .35, M.oak, 0.1, 1.95, -4.23); plane(5.0, .6, tiled(T.subway, 5, 1), 0.1, 1.3, -4.39).userData.room = 'kitchen';
  box(2.0, .9, .9, M.oak, 0, .45, -2.0); box(2.1, .04, 1.0, tiled(T.stone, 2, 1), 0, .92, -2.0); blob(2.4, 1.3, 0, -2.0);
  box(.9, 1.8, .7, M.steel, 2.3, .9, -1.6);
  box(.115, .075, .012, M.white, 0.9, 1.15, -4.384, scene, { plant: 'outlet' }); { const s = new THREE.Mesh(new THREE.PlaneGeometry(.34, .3), decal(T.scorch)); s.position.set(0.9, 1.15, -4.386); s.userData.plant = 'outlet'; scene.add(s); pick.push(s); }
  box(.115, .075, .012, M.white, -1.4, 1.15, -4.384); box(.115, .075, .012, M.white, 2.0, 1.15, -4.384);
  // living
  box(2.0, .4, .9, M.fabric, 0, .2, 3.2); box(2.0, .45, .25, M.fabric, 0, .62, 3.55); [-.5, .5].forEach(x => box(.9, .15, .8, M.fabric2, x, .47, 3.15)); box(.25, .55, .9, M.fabric, -1.1, .47, 3.2); box(.25, .55, .9, M.fabric, 1.1, .47, 3.2); blob(2.6, 1.4, 0, 3.2);
  { const r = plane(2.6, 1.9, tiled(T.rug, 1, 1), .2, .006, 1.9, -Math.PI / 2); r.userData.plant = 'rug'; r.userData.floor = true; r.userData.room = 'living'; const c = box(.32, .025, .22, M.oak, 1.34, .02, .95, scene, { plant: 'rug' }); c.material = tiled(T.rug, .2, .2); }
  box(1.0, .04, .5, M.oak, .2, .4, 2.1); [[-.45, 1.88], [.85, 1.88], [-.45, 2.32], [.85, 2.32]].forEach(([x, z]) => box(.04, .4, .04, M.dark, x, .2, z));
  box(1.2, .45, .4, M.oak, -2.35, .225, 1.2); box(1.0, .6, .05, M.black, -2.52, .95, 1.2); blob(1.5, .7, -2.3, 1.2);
  { const c = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1.5, 8), M.black); c.rotation.x = Math.PI / 2; c.position.set(-2.5, .02, .9); c.userData.plant = 'cord'; scene.add(c); pick.push(c); }
  plane(.5, .62, std({ color: 0xF0ECE4, roughness: .55 }), -2.544, 1.4, 3.6, 0, Math.PI / 2).userData.plant = 'touchup';
  // hall decals
  { const s = new THREE.Mesh(new THREE.CircleGeometry(.3, 32), decal(T.stain)); s.rotation.x = Math.PI / 2; s.position.set(3.4, H - .004, -0.4); s.userData.plant = 'stain'; scene.add(s); pick.push(s);
    const c = new THREE.Mesh(new THREE.CircleGeometry(.4, 32), decal(T.cool)); c.rotation.x = Math.PI / 2; c.position.set(3.4, H - .006, -0.4); c.visible = false; scene.add(c); thermalPatches.push(c);
    const p = new THREE.Mesh(new THREE.CircleGeometry(.065, 24), decal(T.plate)); p.rotation.x = Math.PI / 2; p.position.set(3.4, H - .004, 2.0); p.userData.plant = 'alarm'; scene.add(p); pick.push(p);
    const k = new THREE.Mesh(new THREE.PlaneGeometry(.64, .36), decal(T.crack)); k.position.set(3.55, 2.21, -1.545); k.userData.plant = 'crack'; scene.add(k); pick.push(k);
    const sw = (x, y, z, ry) => { const m = box(.08, .08, .012, M.white, x, y, z); m.rotation.y = ry; }; sw(3.95, 1.1, -1.0, -Math.PI / 2); sw(3.95, 1.1, 3.2, -Math.PI / 2); sw(2.85, 1.1, 0.9, Math.PI / 2); sw(-2.55, 1.1, -1.4, Math.PI / 2); sw(-2.55, 1.1, 1.3, Math.PI / 2); sw(2.95, 1.1, 3.6, 0);
    [[3.4, .3, 4.38, 0], [.5, .3, 4.38, 0], [-2.55, .3, 3.0, Math.PI / 2], [4.05, .3, 2.0, Math.PI / 2]].forEach(([x, y, z, ry]) => { const m = box(.115, .075, .012, M.white, x, y, z); m.rotation.y = ry; }); }
  // bathroom
  box(.9, .05, .9, M.white, 5.5, .025, -1.1); plane(.9, .9, tiled(T.tile, 3, 3, { roughness: .4 }), 5.5, .052, -1.1, -Math.PI / 2); { const g = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.9), M.glass); g.position.set(5.05, 1.0, -1.1); g.rotation.y = Math.PI / 2; scene.add(g); const g2 = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.9), M.glass); g2.position.set(5.5, 1.0, -.65); scene.add(g2); }
  plane(1.9, 1.2, tiled(T.tile, 3, 2, { roughness: .35 }), 5.0, .6, -1.545).userData.room = 'bath'; plane(2.3, 1.2, tiled(T.tile, 4, 2, { roughness: .35 }), 5.945, .6, -0.4, 0, -Math.PI / 2).userData.room = 'bath';
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(.9, .3), decal(T.grout)); g.position.set(5.94, .2, -1.1); g.rotation.y = -Math.PI / 2; g.userData.plant = 'grout'; scene.add(g); pick.push(g); const c = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .8), decal(T.cool)); c.position.set(5.93, .5, -1.0); c.rotation.y = -Math.PI / 2; c.visible = false; scene.add(c); thermalPatches.push(c); }
  box(.9, .8, .5, M.white, 5.5, .4, .45); box(.95, .04, .55, tiled(T.stone, 1, 1), 5.5, .82, .45); box(.5, .04, .35, M.steel, 5.5, .84, .4); plane(.8, .7, M.steel, 5.945, 1.5, .45, 0, -Math.PI / 2);
  box(.4, .4, .5, M.white, 4.4, .2, .3); mesh(new THREE.CylinderGeometry(.2, .2, .15, 20), M.white, 4.4, .45, .2); box(.42, .5, .18, M.white, 4.4, .6, .5);
  // bedrooms
  const bed = (x, z, w = 1.5) => { box(w, .25, 2.0, M.oak, x, .125, z); box(w - .05, .25, 1.95, M.linen, x, .375, z); box(w - .05, .08, 1.0, M.blanket, x, .54, z + .45); [-.35, .35].forEach(dx => box(.5, .12, .35, M.linen, x + dx * (w / 1.5), .56, z - .7)); box(w + .1, .8, .06, M.oak, x, .5, z - 1.0); blob(w + .6, 2.6, x, z); };
  bed(-4.3, -3.2); bed(4.9, -3.2, 1.4); bed(-4.3, 3.2);
  box(1.2, 2.0, .6, M.oak, -5.6, 1.0, -.6); box(1.2, 2.0, .6, M.oak, -5.6, 1.0, 3.9); box(.6, 2.0, 1.2, M.oak, 3.2, 1.0, -3.9); box(.5, .5, .4, M.oak, -5.3, .25, -1.9); box(.5, .5, .4, M.oak, -5.3, .25, 1.9);
  // laundry
  box(.6, .85, .6, M.white, 5.6, .425, 1.2); mesh(new THREE.CylinderGeometry(.22, .22, .02, 24), M.dark, 5.6, .5, .905).rotation.x = Math.PI / 2; box(.6, .85, .55, M.white, 4.45, .425, 1.2); box(.5, .3, .45, M.steel, 4.45, .78, 1.2);
  // downlights + room lights
  POINTS.forEach(p => { if (p.room === 'exterior') return; const d = new THREE.Mesh(new THREE.CircleGeometry(.06, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2dd, emissiveIntensity: 1.5 })); d.rotation.x = Math.PI / 2; d.position.set(p.x, H - .005, p.z); roofGroup.add(d); const l = new THREE.PointLight(0xffe9d2, 5, 5.5, 2); l.position.set(p.x, 2.2, p.z); scene.add(l); });
  scene.add(new THREE.HemisphereLight(0xdfe9f3, 0x8a7a66, 1.0));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6); sun.position.set(8, 11, 7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0xdde8ff, .5); fill.position.set(-6, 6, -8); scene.add(fill);

  // markers: capture discs, flags, moisture
  const discs = []; POINTS.forEach(p => { const m = new THREE.Mesh(new THREE.CircleGeometry(.28, 32), new THREE.MeshBasicMaterial({ map: T.disc, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, .03, p.z); m.renderOrder = 3; m.userData.disc = p.id; scene.add(m); discs.push(m); });
  const flags = {}; AI_FLAGS.forEach(id => { const pl = PLANTS[id]; const g = new THREE.Group(); const n = pl.surface === 'ceiling' ? [0, -.25, 0] : pl.surface === 'floor' ? [0, .25, 0] : pl.surface === 'east wall' ? [-.25, 0, 0] : pl.surface === 'west wall' ? [.25, 0, 0] : pl.surface === 'north wall' ? [0, 0, .25] : [0, 0, -.25]; g.position.set(pl.pos[0] + n[0], pl.pos[1] + n[1], pl.pos[2] + n[2]);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.flag, transparent: true, depthTest: false })); s.scale.set(.28, .28, 1); s.renderOrder = 8; s.userData.flag = id; g.add(s); const l = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.flagLabel, transparent: true, depthTest: false })); const r = T.flagLabel.image.width / T.flagLabel.image.height; l.scale.set(.09 * r, .09, 1); l.position.y = .26; l.renderOrder = 9; l.userData.flag = id; g.add(l); scene.add(g); flags[id] = { g, s }; pick.push(s, l); });
  anim.push(t => { Object.values(flags).forEach(f => { const k = .28 + Math.sin(t * 2.4) * .04; f.s.scale.set(k, k, 1); f.s.material.opacity = .75 + Math.sin(t * 2.4) * .2; }); });
  const moist = MOISTURE.map(m => { const col = m.value >= 25 ? '#C2410C' : m.value >= 17 ? '#D97706' : '#1F6F5C'; const tx = T.pill(`${m.value}%`, col); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); const r = tx.image.width / tx.image.height; s.scale.set(.12 * r, .12, 1); s.position.set(...m.pos); s.renderOrder = 9; s.visible = false; scene.add(s); return s; });

  return { scene, pick, anim, thermalMeshes, thermalPatches, roofGroup, discs, flags, moist, M, ceil };
}

// ---------- camera ----------
class Cam {
  constructor(cam) { this.cam = cam; this.mode = 'orbit'; this.fp = { pos: new THREE.Vector3(3.4, 1.6, 3.6), yaw: Math.PI, pitch: 0, fov: 70, gyaw: Math.PI, gpitch: 0, gfov: 70 }; this.orbit = { target: new THREE.Vector3(0, 1, 0), theta: .6, phi: .9, r: 17, gtheta: .6, gphi: .9, gr: 17 }; this.par = { x: 0, y: 0 }; this.parGoal = { x: 0, y: 0 }; this.auto = 0; this.tween = null; this.reduced = false; this.enabled = false; }
  pose() { const p = new THREE.Vector3(), l = new THREE.Vector3(); if (this.mode === 'fp') { const f = this.fp; p.copy(f.pos); l.set(Math.cos(f.pitch) * Math.sin(f.yaw), Math.sin(f.pitch), Math.cos(f.pitch) * Math.cos(f.yaw)).add(p); return { pos: p, look: l, fov: f.fov }; } const o = this.orbit, th = o.theta + this.par.x, ph = Math.min(1.45, Math.max(.15, o.phi + this.par.y)); p.set(o.target.x + o.r * Math.sin(ph) * Math.sin(th), o.target.y + o.r * Math.cos(ph), o.target.z + o.r * Math.sin(ph) * Math.cos(th)); l.copy(o.target); return { pos: p, look: l, fov: 50 }; }
  apply(ps) { this.cam.position.copy(ps.pos); this.cam.lookAt(ps.look); if (Math.abs(this.cam.fov - ps.fov) > .01) { this.cam.fov = ps.fov; this.cam.updateProjectionMatrix(); } }
  setFP(pos, yaw, pitch = 0) { this.mode = 'fp'; const f = this.fp; f.pos.copy(pos); f.yaw = f.gyaw = yaw; f.pitch = f.gpitch = pitch; }
  setOrbit(o) { this.mode = 'orbit'; Object.assign(this.orbit, o, { gtheta: o.theta ?? this.orbit.theta, gphi: o.phi ?? this.orbit.phi, gr: o.r ?? this.orbit.r }); if (o.target) this.orbit.target.copy(o.target); }
  tweenTo(target, ms) { // target: {mode, ...params}
    const from = this.pose(); const save = { mode: this.mode }; if (target.mode === 'fp') this.setFP(target.pos, target.yaw, target.pitch || 0); else this.setOrbit(target); const to = this.pose(); if (target.mode === 'fp') { to.fov = target.fov || 70; this.fp.fov = this.fp.gfov = to.fov; }
    if (this.reduced || !ms) { this.apply(to); return Promise.resolve(); }
    return new Promise(res => { this.tween = { from, to, start: performance.now(), ms, res, arc: target.arc || 0 }; });
  }
  update(dt) {
    if (this.tween) { const tw = this.tween, k = ease(Math.min(1, (performance.now() - tw.start) / tw.ms)); const pos = tw.from.pos.clone().lerp(tw.to.pos, k); pos.y += Math.sin(k * Math.PI) * tw.arc; const look = tw.from.look.clone().lerp(tw.to.look, k); this.apply({ pos, look, fov: tw.from.fov + (tw.to.fov - tw.from.fov) * k }); if (k >= 1) { this.tween = null; tw.res(); } return; }
    const a = 1 - Math.pow(.002, dt); this.par.x += (this.parGoal.x - this.par.x) * a; this.par.y += (this.parGoal.y - this.par.y) * a;
    if (this.mode === 'fp') { const f = this.fp; f.yaw += (f.gyaw - f.yaw) * a; f.pitch += (f.gpitch - f.pitch) * a; f.fov += (f.gfov - f.fov) * a; }
    else { const o = this.orbit; if (this.auto && !this.reduced) o.gtheta += this.auto * dt; o.theta += (o.gtheta - o.theta) * a; o.phi += (o.gphi - o.phi) * a; o.r += (o.gr - o.r) * a; }
    this.apply(this.pose());
  }
  drag(dx, dy) { if (!this.enabled || this.tween) return; if (this.mode === 'fp') { this.fp.gyaw += dx * .0045; this.fp.gpitch = Math.min(1.2, Math.max(-1.2, this.fp.gpitch + dy * .0035)); } else { this.orbit.gtheta -= dx * .005; this.orbit.gphi = Math.min(1.35, Math.max(.2, this.orbit.gphi - dy * .004)); } }
  zoom(f) { if (!this.enabled) return; if (this.mode === 'fp') this.fp.gfov = Math.min(85, Math.max(38, this.fp.gfov * f)); else this.orbit.gr = Math.min(30, Math.max(7, this.orbit.gr * f)); }
}

const DOLLHOUSE = { mode: 'orbit', target: new THREE.Vector3(0, .6, 0), theta: .55, phi: .78, r: 18 };

// ---------- view ----------
class View {
  constructor(opts = {}) {
    const canvas = document.createElement('canvas'); canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;border-radius:inherit'; canvas.tabIndex = 0; canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', opts.ariaLabel || '3D home'); this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.0; this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    Object.assign(this, buildScene()); this.camera = new THREE.PerspectiveCamera(50, 1, .05, 200); this.cam = new Cam(this.camera); this.cam.setOrbit(DOLLHOUSE); this.setDollhouse(true);
    this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2(); this.active = false; this.clock = new THREE.Clock(); this.t = 0; this.tool = 'navigate'; this.pins = {}; this.measures = {}; this.hoverDisc = null; this.pinsGroup = new THREE.Group(); this.scene.add(this.pinsGroup); this.layers = { thermal: false, moisture: false, capture: true }; this.currentPoint = null;
    this.cursor = new THREE.Mesh(new THREE.SphereGeometry(.025, 16, 16), new THREE.MeshBasicMaterial({ color: 0x2F6FED, depthTest: false })); this.cursor.renderOrder = 20; this.cursor.visible = false; this.scene.add(this.cursor);
    this.ro = new ResizeObserver(() => this.resize());
    const ptrs = new Map(); let down = null, pinch = 0;
    const dist = () => { const a = [...ptrs.values()]; return Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); };
    canvas.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); try { canvas.setPointerCapture(e.pointerId); } catch (_) { } down = [e.clientX, e.clientY, performance.now()]; if (ptrs.size === 2) pinch = dist(); });
    canvas.addEventListener('pointermove', e => { if (ptrs.has(e.pointerId)) { const p = ptrs.get(e.pointerId); const dx = e.clientX - p[0], dy = e.clientY - p[1]; ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const d = dist(); if (pinch) this.cam.zoom(Math.pow(1.005, pinch - d)); pinch = d; return; } this.cam.drag(dx, dy); return; } if (e.pointerType === 'mouse') this.hoverAt(e); });
    const up = e => { ptrs.delete(e.pointerId); pinch = 0; if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]), dt = performance.now() - down[2]; down = null; if (moved < 6 && dt < 700 && this.cam.enabled && !this.cam.tween) this.clickAt(e); };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); down = null; });
    canvas.addEventListener('pointerleave', () => { this.cursor.visible = false; this.setHoverDisc(null); if (this.onHover) this.onHover(null); });
    canvas.addEventListener('wheel', e => { if (!this.cam.enabled) return; e.preventDefault(); this.cam.zoom(Math.pow(1.0015, e.deltaY)); }, { passive: false });
    canvas.addEventListener('keydown', e => { if (!this.cam.enabled || this.cam.tween) return; const k = e.key; if (k === 'ArrowLeft') this.cam.drag(-40, 0); else if (k === 'ArrowRight') this.cam.drag(40, 0); else if (k === 'ArrowUp') this.cam.drag(0, -30); else if (k === 'ArrowDown') this.cam.drag(0, 30); else return; e.preventDefault(); });
    this.frameCb = null; this.lastEmit = 0;
    this.renderer.setAnimationLoop(() => { const dt = Math.min(.05, this.clock.getDelta()); if (!this.active) return; this.t += dt; if (!this.renderer.xr.isPresenting) this.cam.update(dt); this.anim.forEach(f => f(this.t)); this.tickPins(dt); this.renderer.render(this.scene, this.camera); const now = performance.now(); if (this.frameCb && now - this.lastEmit > 100) { this.lastEmit = now; const f = this.cam; this.frameCb({ x: this.camera.position.x, z: this.camera.position.z, yaw: f.mode === 'fp' ? f.fp.yaw : null, fov: this.camera.fov, dollhouse: f.mode === 'orbit' }); } });
  }
  mount(host) { if (this.canvas.parentElement !== host) host.appendChild(this.canvas); this.ro.disconnect(); this.ro.observe(host); this.resize(); }
  resize() { const h = this.canvas.parentElement; if (!h) return; const w = h.clientWidth, hh = h.clientHeight; if (!w || !hh) return; this.renderer.setSize(w, hh, false); this.camera.aspect = w / hh; this.camera.updateProjectionMatrix(); }
  setReduced(v) { this.cam.reduced = v; }
  setDollhouse(on) { this.dollhouse = on; this.roofGroup.visible = !on; }
  // --- picking ---
  castAt(e, objs) { const r = this.canvas.getBoundingClientRect(); this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); this.ray.setFromCamera(this.ptr, this.camera); return this.ray.intersectObjects(objs, false).filter(h => h.object.visible && (!h.object.parent || h.object.parent.visible))[0]; }
  describe(h) { const p = h.point, n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new THREE.Vector3(0, 1, 0); const ud = h.object.userData; let surface = 'wall'; if (ud.ceiling) surface = 'ceiling'; else if (ud.floor || ud.ground) surface = ud.ground ? 'ground' : 'floor'; else if (n.y > .7) surface = 'floor'; else if (n.y < -.7) surface = 'ceiling'; else if (n.z > .7) surface = 'north wall'; else if (n.z < -.7) surface = 'south wall'; else if (n.x > .7) surface = 'west wall'; else if (n.x < -.7) surface = 'east wall'; if (ud.ext) surface = 'exterior wall'; if (!ud.wall && !ud.floor && !ud.ceiling && !ud.ground && !ud.ext && !ud.plant) surface = 'fixture'; if (ud.plant && PLANTS[ud.plant]) surface = PLANTS[ud.plant].surface;
    const room = ud.room || roomAt(p.x, p.z); return { point: [p.x, p.y, p.z], normal: [n.x, n.y, n.z], surface, room, plant: ud.plant || null, flag: ud.flag || null, disc: ud.disc || null }; }
  hoverAt(e) {
    if (!this.cam.enabled || this.cam.tween) return;
    if (this.tool === 'navigate') { const hd = this.cam.mode !== 'fp' || this.layers.capture ? this.castAt(e, this.discs) : null; this.setHoverDisc(hd ? hd.object : null); const hf = this.castAt(e, Object.values(this.flags).map(f => f.s)); this.canvas.style.cursor = hd || hf ? 'pointer' : 'grab'; if (this.onHover) this.onHover(hd ? { kind: 'disc', id: hd.object.userData.disc } : hf ? { kind: 'flag', id: hf.object.userData.flag } : null); return; }
    const h = this.castAt(e, this.pick); this.canvas.style.cursor = h ? 'crosshair' : 'default'; if (h) { this.cursor.visible = true; this.cursor.position.copy(h.point); } else this.cursor.visible = false;
    if (this.onHover) this.onHover(h ? { kind: 'surface', ...this.describe(h) } : null);
  }
  setHoverDisc(m) { if (this.hoverDisc && this.hoverDisc !== m) this.hoverDisc.scale.setScalar(1); this.hoverDisc = m; if (m) m.scale.setScalar(1.25); }
  clickAt(e) {
    if (this.tool === 'navigate') { const hf = this.castAt(e, Object.values(this.flags).flatMap(f => [f.s, f.g.children[1]])); if (hf && this.onClick) return this.onClick({ kind: 'flag', id: hf.object.userData.flag }); const hd = this.castAt(e, this.discs); if (hd && this.onClick) return this.onClick({ kind: 'disc', id: hd.object.userData.disc }); return; }
    const h = this.castAt(e, this.pick); if (h && this.onClick) this.onClick({ kind: 'surface', ...this.describe(h) });
  }
  setTool(t) { this.tool = t; this.cursor.visible = false; this.canvas.style.cursor = t === 'navigate' ? 'grab' : 'crosshair'; }
  // --- navigation ---
  goTo(id, ms = 1400, yawOverride) { const p = POINTS.find(p => p.id === id); if (!p) return Promise.resolve(); this.currentPoint = id; this.discs.forEach(d => { d.visible = d.userData.disc !== id && this.layers.capture; }); const fromDoll = this.cam.mode !== 'fp'; const yaw = yawOverride ?? (fromDoll ? p.yaw : this.cam.fp.yaw); if (fromDoll) this.setDollhouse(false); this.cam.enabled = false; return this.cam.tweenTo({ mode: 'fp', pos: new THREE.Vector3(p.x, 1.6, p.z), yaw, pitch: 0, fov: 70, arc: fromDoll ? 0 : .06 }, fromDoll ? Math.max(ms, 2400) : ms).then(() => { this.cam.enabled = true; }); }
  toDollhouse(ms = 1600) { this.setDollhouse(true); this.discs.forEach(d => d.visible = this.layers.capture); this.cam.enabled = false; return this.cam.tweenTo(Object.assign({}, DOLLHOUSE), ms).then(() => { this.cam.enabled = true; }); }
  lookAt(pos, ms = 1200) { const f = this.cam.fp; const d = new THREE.Vector3(...pos).sub(f.pos); const yaw = Math.atan2(d.x, d.z), pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); if (this.cam.reduced || !ms) { f.yaw = f.gyaw = yaw; f.pitch = f.gpitch = pitch; return Promise.resolve(); } let dy = yaw - f.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); f.gyaw = f.yaw + dy; f.gpitch = pitch; return new Promise(r => setTimeout(r, ms)); }
  async flyTo(pos) { const room = roomAt(pos[0], pos[2]); const key = p => { const d = Math.hypot(p.x - pos[0], p.z - pos[2]); return d < .9 ? d + 10 : d; }; const best = POINTS.filter(p => p.room === room).sort((a, b) => key(a) - key(b))[0] || POINTS[2]; const d = new THREE.Vector3(pos[0] - best.x, pos[1] - 1.6, pos[2] - best.z); const yaw = Math.atan2(d.x, d.z), pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); if (this.cam.mode === 'fp' && this.currentPoint === best.id) return this.lookAt(pos); this.currentPoint = best.id; const fromDoll = this.cam.mode !== 'fp'; if (fromDoll) this.setDollhouse(false); this.cam.enabled = false; await this.cam.tweenTo({ mode: 'fp', pos: new THREE.Vector3(best.x, 1.6, best.z), yaw, pitch, fov: 62 }, fromDoll ? 2200 : 1500); this.cam.enabled = true; }
  // --- entities ---
  addPin(f) { this.removePin(f.id); const g = new THREE.Group(); const col = new THREE.Color(f.color); const n = new THREE.Vector3(...(f.normal || [0, 1, 0])); const head = new THREE.Mesh(new THREE.SphereGeometry(.045, 20, 20), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .35, roughness: .4 })); head.position.copy(n.clone().multiplyScalar(.06)); g.add(head); const stem = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .06, 8), new THREE.MeshBasicMaterial({ color: col })); stem.position.copy(n.clone().multiplyScalar(.03)); stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); g.add(stem); const tx = T.label(f.title, f.color); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); const r = tx.image.width / tx.image.height; s.scale.set(.1 * r, .1, 1); s.position.copy(n.clone().multiplyScalar(.06)).y += .14; s.renderOrder = 10; g.add(s); g.position.set(...f.pos); g.scale.setScalar(.001); g.userData.drop = 0; this.pinsGroup.add(g); this.pins[f.id] = g; }
  removePin(id) { const g = this.pins[id]; if (g) { this.pinsGroup.remove(g); delete this.pins[id]; } }
  clearPins() { Object.keys(this.pins).forEach(id => this.removePin(id)); }
  tickPins(dt) { this.pinsGroup.children.forEach(g => { if (g.userData.drop >= 1) return; g.userData.drop = Math.min(1, g.userData.drop + dt / .45); const k = g.userData.drop; const s = k < .7 ? (k / .7) * 1.18 : 1.18 - ((k - .7) / .3) * .18; g.scale.setScalar(Math.max(.001, s)); }); }
  addMeasure(m) { this.removeMeasure(m.id); const g = new THREE.Group(); const a = new THREE.Vector3(...m.a), b = new THREE.Vector3(...m.b); const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color: 0xffffff, depthTest: false })); line.renderOrder = 11; g.add(line); [a, b].forEach(p => { const s = new THREE.Mesh(new THREE.SphereGeometry(.018, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false })); s.position.copy(p); s.renderOrder = 11; g.add(s); }); const tx = T.label(m.label, null); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); const r = tx.image.width / tx.image.height; s.scale.set(.085 * r, .085, 1); s.position.copy(a).lerp(b, .5); s.renderOrder = 12; g.add(s); this.scene.add(g); this.measures[m.id] = g; }
  removeMeasure(id) { const g = this.measures[id]; if (g) { this.scene.remove(g); delete this.measures[id]; } }
  setDraftPoint(p) { if (this.draft) { this.scene.remove(this.draft); this.draft = null; } if (p) { this.draft = new THREE.Mesh(new THREE.SphereGeometry(.022, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false })); this.draft.position.set(...p); this.draft.renderOrder = 11; this.scene.add(this.draft); } }
  setLayers(l) { Object.assign(this.layers, l); this.thermalMeshes.forEach(m => { if (!m.userData.base) m.userData.base = m.material; m.material = l.thermal ? this.M.thermal : m.userData.base; }); this.thermalPatches.forEach(p => p.visible = !!l.thermal); this.moist.forEach(s => s.visible = !!l.moisture); this.discs.forEach(d => d.visible = l.capture && d.userData.disc !== this.currentPoint); }
  setFlags(state) { Object.entries(this.flags).forEach(([id, f]) => { f.g.visible = !state[id] || state[id].status === 'open'; }); }
  // --- captures ---
  snapshot(w = 640) { const hid = [...this.discs, ...Object.values(this.flags).map(f => f.g), this.cursor].map(o => [o, o.visible]); hid.forEach(([o]) => o.visible = false); this.renderer.render(this.scene, this.camera); hid.forEach(([o, v]) => o.visible = v); const c = this.canvas; const o = document.createElement('canvas'); const r = c.width / c.height; o.width = w; o.height = Math.round(w / r); o.getContext('2d').drawImage(c, 0, 0, o.width, o.height); return o.toDataURL('image/jpeg', .78); }
  withPose(fn) { const saved = { pos: this.camera.position.clone(), q: this.camera.quaternion.clone(), fov: this.camera.fov, aspect: this.camera.aspect, doll: this.dollhouse, size: new THREE.Vector2() }; this.renderer.getSize(saved.size); const out = fn(); this.setDollhouse(saved.doll); this.renderer.setSize(saved.size.x, saved.size.y, false); this.camera.position.copy(saved.pos); this.camera.quaternion.copy(saved.q); this.camera.fov = saved.fov; this.camera.aspect = saved.aspect; this.camera.updateProjectionMatrix(); return out; }
  snapshotAt(from, to, fov = 62) { return this.withPose(() => { this.setDollhouse(false); this.camera.position.set(...from); this.camera.lookAt(new THREE.Vector3(...to)); this.camera.fov = fov; this.camera.updateProjectionMatrix(); return this.snapshot(640); }); }
  snapshotDollhouse() { const th = this.layers.thermal; if (th) this.setLayers({ ...this.layers, thermal: false }); const out = this.withPose(() => { this.setDollhouse(true); this.renderer.setSize(640, 480, false); this.camera.aspect = 4 / 3; const ph = .75, th = .55, r = 17; this.camera.position.set(r * Math.sin(ph) * Math.sin(th), .6 + r * Math.cos(ph), r * Math.sin(ph) * Math.cos(th)); this.camera.lookAt(0, .6, 0); this.camera.fov = 48; this.camera.updateProjectionMatrix(); return this.snapshot(640); }); if (th) this.setLayers({ ...this.layers, thermal: true }); return out; }
  panorama(id) { const p = POINTS.find(p => p.id === id); if (!p) return null; return this.withPose(() => { this.setDollhouse(false); const S = 448; this.renderer.setSize(S, S, false); this.camera.aspect = 1; this.camera.fov = 90; this.camera.updateProjectionMatrix(); const o = document.createElement('canvas'); o.width = S * 4; o.height = S; const g = o.getContext('2d'); const yaws = [p.yaw, p.yaw - Math.PI / 2, p.yaw - Math.PI, p.yaw - Math.PI * 1.5]; const hideDiscs = this.discs.map(d => d.visible); this.discs.forEach(d => d.visible = false); yaws.forEach((y, i) => { this.camera.position.set(p.x, 1.6, p.z); this.camera.lookAt(p.x + Math.sin(y), 1.6, p.z + Math.cos(y)); this.renderer.render(this.scene, this.camera); g.drawImage(this.canvas, 0, this.canvas.height - S, S * (this.canvas.width / S), S, i * S, 0, S, S); }); this.discs.forEach((d, i) => d.visible = hideDiscs[i]); return o.toDataURL('image/jpeg', .8); }); }
  // --- XR ---
  async xrSupported() { try { return !!(navigator.xr && await navigator.xr.isSessionSupported('immersive-vr')); } catch (_) { return false; } }
  async enterVR() { const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] }); this.renderer.xr.enabled = true; const rig = new THREE.Group(); const f = this.cam.fp; rig.position.set(this.camera.position.x, this.cam.mode === 'fp' ? 0 : 0, this.camera.position.z); rig.rotation.y = this.cam.mode === 'fp' ? f.yaw + Math.PI : 0; this.scene.add(rig); rig.add(this.camera); s.addEventListener('end', () => { rig.remove(this.camera); this.scene.remove(rig); this.renderer.xr.enabled = false; this.resize(); }); await this.renderer.xr.setSession(s); return s; }
}

window.TwinHome = { createView: o => { try { return new View(o); } catch (e) { console.warn('WebGL unavailable', e); return null; } }, ROOMS, POINTS, PLANTS, MOISTURE, AI_FLAGS, roomAt };
window.dispatchEvent(new Event('twinhome-ready'));
