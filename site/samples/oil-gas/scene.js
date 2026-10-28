import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { bootLesson, kit, noiseTexture } from './engine.js';

const PRESETS = {
  hero: { t: [0, 2.2, 0], theta: 0.55, phi: 1.15, r: 24 },
  establishing: { t: [0, 2, 0], theta: 0.9, phi: 1.05, r: 32 },
  inspection: { t: [0, 1.6, 0], theta: 0.4, phi: 1.22, r: 16 },
  flange: { t: [-6.2, 1.8, -2], theta: 0.4, phi: 1.2, r: 8 },
  hotwork: { t: [5.2, 1.2, -1.2], theta: -0.6, phi: 1.15, r: 7 },
  pump: { t: [-1.2, 1, 3.4], theta: 0.2, phi: 1.2, r: 7 },
  muster: { t: [1.5, 1.4, -8.2], theta: 0.1, phi: 1.25, r: 8 },
  flare: { t: [8.5, 4, -6], theta: -0.8, phi: 1.15, r: 12 },
  wellhead: { t: [-8, 1.2, 5], theta: 0.8, phi: 1.25, r: 7 },
  shelter: { t: [7.2, 1.6, 5.2], theta: -1.2, phi: 1.2, r: 9 },
  lockedpump: { t: [2.4, 1, 4.2], theta: -0.3, phi: 1.25, r: 6 },
  extinguisher: { t: [6.2, 1.2, 3.2], theta: -1.4, phi: 1.3, r: 5 },
};

/** Calm world-space stage marker — not selectable, not a hazard hint. */
function stageLabelTex(text) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 128);
  g.fillStyle = 'rgba(11,18,32,.78)';
  roundRect(g, 12, 28, 488, 72, 18); g.fill();
  g.strokeStyle = 'rgba(182,196,214,.35)'; g.lineWidth = 3;
  roundRect(g, 12, 28, 488, 72, 18); g.stroke();
  g.fillStyle = '#F5F8FC';
  g.font = '600 42px Manrope, Helvetica, Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb7c6d4);
  scene.fog = new THREE.Fog(0xb7c6d4, 28, 70);
  const { std, mesh, box, cyl, register, insp, pick, anim } = kit(scene);
  const gravel = noiseTexture(0x8a7d6c, 11); gravel.repeat.set(8, 8);
  const pad = noiseTexture(0xc5c1b6, 4); pad.repeat.set(4, 4);
  const M = {
    ground: std({ map: gravel, roughness: .95 }),
    concrete: std({ map: pad, roughness: .88 }),
    steel: std({ color: 0xd5dde4, roughness: .35, metalness: .72 }),
    pipe: std({ color: 0x8ea0ae, roughness: .4, metalness: .55 }),
    yellow: std({ color: 0xf2b544, roughness: .5, metalness: .1 }),
    orange: std({ color: 0xe07a3d, roughness: .45 }),
    dark: std({ color: 0x2a3138, roughness: .6, metalness: .3 }),
    green: std({ color: 0x2f8f5b, roughness: .55 }),
    red: std({ color: 0xc44536, roughness: .45 }),
    white: std({ color: 0xf4f7f8, roughness: .5 }),
    glass: std({ color: 0x9ec9e8, roughness: .15, metalness: .1, emissive: 0x173044, emissiveIntensity: .4 }),
    flame: new THREE.MeshBasicMaterial({ color: 0xffb15a }),
  };

  const sky = mesh(new THREE.SphereGeometry(90, 24, 16), new THREE.MeshBasicMaterial({ color: 0xc5d4e2, side: THREE.BackSide }), 0, 0, 0);
  sky.castShadow = false; sky.receiveShadow = false;
  const ground = mesh(new THREE.CircleGeometry(40, 48), M.ground, 0, 0, 0); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  const slab = mesh(new THREE.PlaneGeometry(22, 16), M.concrete, 0, .02, 0); slab.rotation.x = -Math.PI / 2;

  scene.add(new THREE.HemisphereLight(0xfff4e4, 0x6d6458, .85));
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.6);
  sun.position.set(12, 18, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 50 });
  sun.shadow.bias = -.0005; scene.add(sun); scene.add(sun.target);

  // pipe rack
  const rack = new THREE.Group(); scene.add(rack);
  for (let x = -6; x <= 6; x += 3) {
    box(.18, 3.2, .18, M.dark, x, 1.6, -1.15, rack);
    box(.18, 3.2, .18, M.dark, x, 1.6, 1.15, rack);
  }
  box(13, .16, .16, M.dark, 0, 3.2, -1.15, rack);
  box(13, .16, .16, M.dark, 0, 3.2, 1.15, rack);
  [-.2, .35, .9].forEach((y, i) => {
    const p = cyl(.16, .16, 13.2, i === 1 ? M.yellow : M.pipe, 0, 2.2 + y * .35, 0, rack);
    p.rotation.z = Math.PI / 2;
  });

  // separators + weeping flange
  const vessels = new THREE.Group(); scene.add(vessels); vessels.position.set(-6.2, 0, -2.2);
  [0, 2.3].forEach((z) => {
    const body = cyl(.7, .7, 4.4, M.steel, 0, 1.35, z, vessels); body.rotation.z = Math.PI / 2;
    cyl(.2, .2, .7, M.dark, -1.5, .55, z, vessels);
    cyl(.2, .2, .7, M.dark, 1.5, .55, z, vessels);
    box(1.1, .12, .5, M.dark, -1.5, .2, z, vessels);
    box(1.1, .12, .5, M.dark, 1.5, .2, z, vessels);
  });
  const flange = cyl(.28, .28, .18, M.yellow, 2.15, 1.35, 0, vessels); flange.rotation.z = Math.PI / 2;
  const dripMat = new THREE.MeshStandardMaterial({ color: 0x9fd7c8, roughness: .15, metalness: .05, transparent: true, opacity: .85, emissive: 0x1a4, emissiveIntensity: .2 });
  const drip = mesh(new THREE.SphereGeometry(.08, 12, 12), dripMat, 2.35, .7, 0, vessels);
  const det = box(.28, .18, .16, M.dark, 1.4, 2.15, .2, vessels);
  const lamp = mesh(new THREE.SphereGeometry(.07, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff5a3c, emissive: 0xff3b2e, emissiveIntensity: 1.4 }), 1.4, 2.32, .2, vessels);
  const alarm = new THREE.PointLight(0xff4d3a, 2, 4, 2); alarm.position.set(1.4, 2.3, .2); vessels.add(alarm);
  anim.push((t) => { const p = (Math.sin(t * 6) + 1) / 2; lamp.material.emissiveIntensity = .3 + p * 2; alarm.intensity = p * 4; drip.position.y = .85 - (t % 1.2) * .55; drip.material.opacity = 1 - (t % 1.2) / 1.2; });
  // Neutral label: do not hint that this vessel is a scored finding.
  register(vessels, 'flange', 'Separator', [0, 3.2, 1]);

  // hot work without a permit
  const hot = new THREE.Group(); scene.add(hot); hot.position.set(5.4, 0, -1.4);
  box(1.6, 1.15, .08, M.orange, -.4, .7, .7, hot);
  box(1.6, 1.15, .08, M.yellow, .5, .7, -.5, hot);
  cyl(.16, .16, .9, M.dark, .9, .45, .2, hot);
  box(.55, .28, .35, M.dark, -.2, .35, 0, hot);
  const spark = mesh(new THREE.SphereGeometry(.06, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffe08a }), 0, .7, .1, hot);
  const sparkLight = new THREE.PointLight(0xffb15a, 3, 5, 2); sparkLight.position.set(0, .8, 0); hot.add(sparkLight);
  anim.push((t, reduced) => { spark.position.y = .55 + Math.abs(Math.sin(t * 18)) * .45; spark.position.x = Math.sin(t * 23) * .15; sparkLight.intensity = reduced ? 1.5 : 1 + Math.abs(Math.sin(t * 18)) * 4; });
  // Label the equipment (pipe rack), not the hazard name.
  register(hot, 'hotwork', 'Pipe rack', [0, 2.1, 0]);

  // pump missing a lock
  const pump = new THREE.Group(); scene.add(pump); pump.position.set(-1.4, 0, 3.6);
  box(1.5, .35, .9, M.dark, 0, .2, 0, pump);
  cyl(.38, .38, .7, M.steel, -.2, .7, 0, pump); cyl(.38, .38, .7, M.steel, -.2, .7, 0, pump).rotation.z = Math.PI / 2;
  box(.7, .55, .5, M.dark, .55, .6, 0, pump);
  box(.08, .7, .35, M.yellow, -1.05, 1.15, 0, pump);
  box(.22, .08, .08, M.red, -1.02, 1.35, 0, pump);
  register(pump, 'pump', 'Transfer pump', [0, 2, 0]);

  // isolated pump, lock fitted
  const locked = new THREE.Group(); scene.add(locked); locked.position.set(2.6, 0, 4.4);
  box(1.3, .3, .8, M.dark, 0, .18, 0, locked);
  cyl(.32, .32, .6, M.steel, 0, .6, 0, locked);
  box(.08, .6, .3, M.green, -.85, 1.05, 0, locked);
  mesh(new THREE.TorusGeometry(.08, .025, 8, 12), M.yellow, -.78, 1.2, .12, locked);
  register(locked, 'lockedpump', 'Isolated pump', [0, 1.8, 0]);

  // blocked muster gate
  const muster = new THREE.Group(); scene.add(muster); muster.position.set(1.2, 0, -8.4);
  box(.12, 1.6, 2.2, M.dark, -1.5, .8, 0, muster);
  box(.12, 1.6, 2.2, M.dark, 1.5, .8, 0, muster);
  box(1.2, 1.5, .08, M.green, 0, .75, 0, muster);
  cyl(.28, .28, .7, M.orange, -.15, .35, .45, muster);
  cyl(.28, .28, .7, M.red, .25, .35, .55, muster);
  box(.7, .45, .55, M.yellow, .05, .95, .4, muster);
  const sign = box(.7, .4, .06, M.green, 0, 2.15, 0, muster);
  sign.material = std({ color: 0x1f8a4c, emissive: 0x145c32, emissiveIntensity: .35 });
  register(muster, 'muster', 'Muster gate', [0, 2.6, .4]);

  // flare stack, operating as designed
  const flare = new THREE.Group(); scene.add(flare); flare.position.set(8.6, 0, -6.2);
  cyl(.28, .45, 7.2, M.steel, 0, 3.6, 0, flare);
  cyl(.7, .9, .4, M.dark, 0, .25, 0, flare);
  const flame = mesh(new THREE.ConeGeometry(.55, 1.6, 14), M.flame, 0, 8.1, 0, flare); flame.castShadow = false;
  const core = mesh(new THREE.ConeGeometry(.22, .9, 10), new THREE.MeshBasicMaterial({ color: 0xfff1c2 }), 0, 8.15, 0, flare); core.castShadow = false;
  const fl = new THREE.PointLight(0xff8a2a, 22, 24, 2); fl.position.set(0, 7.6, 0); flare.add(fl);
  anim.push((t, reduced) => { const s = reduced ? 1 : 1 + Math.sin(t * 7) * .12; flame.scale.set(s, 1 + Math.sin(t * 9) * .2, s); core.scale.y = flame.scale.y; fl.intensity = 14 + Math.sin(t * 8) * 4; });
  register(flare, 'flare', 'Flare stack', [0, 8.2, 0]);

  // wellhead
  const well = new THREE.Group(); scene.add(well); well.position.set(-8.2, 0, 5.2);
  box(1.6, .15, 1.6, M.dark, 0, .08, 0, well);
  cyl(.18, .18, 1.5, M.steel, 0, .9, 0, well);
  cyl(.42, .42, .28, M.dark, 0, 1.5, 0, well);
  box(.15, .15, .7, M.red, .35, 1.15, 0, well);
  box(.15, .15, .7, M.green, -.35, 1.15, 0, well);
  cyl(.08, .08, .5, M.yellow, .7, 1.15, 0, well).rotation.z = Math.PI / 2;
  register(well, 'wellhead', 'Wellhead', [0, 2.2, 0]);

  // control shelter
  const shelter = new THREE.Group(); scene.add(shelter); shelter.position.set(7.4, 0, 5.4);
  box(3.4, 2.4, 2.6, M.white, 0, 1.2, 0, shelter);
  box(3.6, .16, 2.9, M.dark, 0, 2.45, 0, shelter);
  box(.9, 1.6, .08, M.dark, -.6, .85, 1.32, shelter);
  box(1.1, .7, .08, M.glass, .7, 1.45, 1.32, shelter);
  box(.5, .35, .4, M.steel, 1.3, 2.2, .4, shelter);
  register(shelter, 'shelter', 'Control shelter', [0, 3, 0]);

  // extinguisher
  const ext = new THREE.Group(); scene.add(ext); ext.position.set(6.1, 0, 3.4);
  cyl(.1, .1, .55, M.red, 0, .7, 0, ext);
  box(.22, .05, .05, M.dark, .05, .98, 0, ext);
  box(.04, .5, .5, M.white, -.16, 1.15, 0, ext);
  register(ext, 'extinguisher', 'Fire extinguisher', [0, 1.7, 0]);

  // ---------------------------------------------------------------------------
  // Illustrative process chain (fictional pad only): inlet → separator → rack →
  // pumps → flare / export. Connecting runs + calm stage labels; not selectable.
  // ---------------------------------------------------------------------------
  const flow = new THREE.Group(); scene.add(flow);
  const Mflow = std({ color: 0x6f8496, roughness: .42, metalness: .5 });
  const MflowGas = std({ color: 0xa8b4c0, roughness: .4, metalness: .45 });
  const Mribbon = new THREE.MeshBasicMaterial({ color: 0xf2b544, transparent: true, opacity: .22, depthWrite: false });
  const Mchev = new THREE.MeshBasicMaterial({ color: 0xf2b544, transparent: true, opacity: .55, depthWrite: false });

  function pipeBetween(ax, ay, az, bx, by, bz, mat = Mflow, r = .11) {
    const a = new THREE.Vector3(ax, ay, az);
    const b = new THREE.Vector3(bx, by, bz);
    const dir = b.clone().sub(a);
    const len = dir.length();
    if (len < .01) return null;
    const mid = a.clone().add(b).multiplyScalar(.5);
    const m = cyl(r, r, len, mat, mid.x, mid.y, mid.z, flow);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    m.castShadow = true;
    return m;
  }
  function elbow(x, y, z, mat = Mflow, r = .13) {
    return mesh(new THREE.SphereGeometry(r, 12, 12), mat, x, y, z, flow);
  }
  function stageMarker(text, x, y, z, scale = 1.9) {
    const tx = stageLabelTex(text);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: true, opacity: .94 }));
    const aspect = tx.image.width / tx.image.height;
    s.scale.set(scale * aspect * .42, scale * .42, 1);
    s.position.set(x, y, z);
    s.renderOrder = 6;
    flow.add(s);
    return s;
  }

  // Wellhead / inlet → separator train (west side of vessels)
  pipeBetween(-7.5, 1.15, 5.2, -7.5, 1.15, 2.4);
  elbow(-7.5, 1.15, 2.4);
  pipeBetween(-7.5, 1.15, 2.4, -7.5, 1.15, -2.2);
  elbow(-7.5, 1.15, -2.2);
  pipeBetween(-7.5, 1.15, -2.2, -7.7, 1.35, -2.2);
  elbow(-7.7, 1.35, -2.2);
  pipeBetween(-7.7, 1.35, -2.2, -6.9, 1.35, -2.2);

  // Separator train → pipe rack (east of vessels, up into rack run)
  pipeBetween(-4.05, 1.35, -2.2, -3.2, 1.35, -2.2);
  elbow(-3.2, 1.35, -2.2);
  pipeBetween(-3.2, 1.35, -2.2, -3.2, 2.25, -2.2);
  elbow(-3.2, 2.25, -2.2);
  pipeBetween(-3.2, 2.25, -2.2, -3.2, 2.25, 0);
  elbow(-3.2, 2.25, 0);
  pipeBetween(-3.2, 2.25, 0, -1.4, 2.25, 0);

  // Rack → transfer pumps (drop south from rack)
  elbow(-1.4, 2.25, 0);
  pipeBetween(-1.4, 2.25, 0, -1.4, 2.25, 2.4);
  elbow(-1.4, 2.25, 2.4);
  pipeBetween(-1.4, 2.25, 2.4, -1.4, .85, 2.4);
  elbow(-1.4, .85, 2.4);
  pipeBetween(-1.4, .85, 2.4, -1.4, .85, 3.2);

  // Branch along skid toward second pump (illustrative continuity)
  pipeBetween(-.6, .55, 3.8, 2.0, .55, 4.2, Mflow, .09);

  // Rack east → flare (gas relief path) — thinner, lighter pipe
  pipeBetween(4.2, 2.25, 0, 6.4, 2.25, 0, MflowGas, .1);
  elbow(6.4, 2.25, 0, MflowGas, .12);
  pipeBetween(6.4, 2.25, 0, 6.4, 2.25, -3.2, MflowGas, .1);
  elbow(6.4, 2.25, -3.2, MflowGas, .12);
  pipeBetween(6.4, 2.25, -3.2, 8.2, 3.2, -5.4, MflowGas, .1);
  elbow(8.2, 3.2, -5.4, MflowGas, .12);
  pipeBetween(8.2, 3.2, -5.4, 8.6, 4.0, -6.0, MflowGas, .1);

  // Export stub from pumps toward pad edge (decorative; not selectable)
  pipeBetween(2.8, .55, 4.4, 5.2, .55, 4.6, Mflow, .1);
  elbow(5.2, .55, 4.6);
  pipeBetween(5.2, .55, 4.6, 9.4, .55, 4.8, Mflow, .1);
  // Export flange / end marker
  cyl(.22, .22, .14, M.yellow, 9.55, .55, 4.82, flow).rotation.z = Math.PI / 2;
  box(.5, .08, .35, M.dark, 9.85, .25, 4.82, flow);

  // Calm stage labels (no hazard wording)
  stageMarker('1  Inlet', -8.2, 3.0, 5.2, 1.7);
  stageMarker('2  Separator', -6.2, 3.6, -3.4, 1.85);
  stageMarker('3  Pipe rack', 0.2, 3.85, -0.15, 1.85);
  stageMarker('4  Transfer pumps', 0.6, 2.55, 4.5, 1.85);
  stageMarker('5  Flare', 8.6, 9.4, -6.2, 1.7);
  stageMarker('5  Export', 10.3, 1.35, 4.5, 1.55);

  // Subtle ground ribbon + chevrons along the main process path
  // Path on pad: wellhead → separator → rack mid → pumps → split (flare / export)
  const ribbonPts = [
    [-8.0, 5.0], [-7.4, 2.2], [-7.4, -1.6], [-5.0, -1.8],
    [-3.0, -0.6], [-1.4, 0.4], [-1.4, 2.6], [0.4, 3.8],
  ];
  for (let i = 0; i < ribbonPts.length - 1; i++) {
    const [x0, z0] = ribbonPts[i];
    const [x1, z1] = ribbonPts[i + 1];
    const dx = x1 - x0, dz = z1 - z0;
    const len = Math.hypot(dx, dz);
    const midX = (x0 + x1) / 2, midZ = (z0 + z1) / 2;
    const strip = mesh(new THREE.PlaneGeometry(len, .38), Mribbon, midX, .04, midZ, flow);
    strip.rotation.x = -Math.PI / 2;
    strip.rotation.z = -Math.atan2(dz, dx);
    strip.receiveShadow = false; strip.castShadow = false;
  }
  // Flare branch ribbon (lighter)
  {
    const strip = mesh(new THREE.PlaneGeometry(7.2, .28), Mribbon, 5.2, .04, -2.8, flow);
    strip.rotation.x = -Math.PI / 2;
    strip.rotation.z = -Math.atan2(-5.2, 3.4);
    strip.material = Mribbon.clone();
    strip.material.opacity = .16;
    strip.receiveShadow = false; strip.castShadow = false;
  }
  // Export branch ribbon
  {
    const strip = mesh(new THREE.PlaneGeometry(6.5, .28), Mribbon, 6.0, .04, 4.6, flow);
    strip.rotation.x = -Math.PI / 2;
    strip.receiveShadow = false; strip.castShadow = false;
  }

  const chevrons = [];
  const chevronSpots = [
    [-7.6, 3.6, Math.PI], [-7.5, 0.2, Math.PI], [-5.6, -1.7, -Math.PI / 2],
    [-3.4, -0.9, -0.4], [-1.5, 1.4, 0], [0.2, 3.6, -1.2],
    [4.0, -1.0, -0.9], [7.2, 4.55, -1.55],
  ];
  chevronSpots.forEach(([x, z, yaw]) => {
    const g = new THREE.Group(); flow.add(g); g.position.set(x, .05, z); g.rotation.y = yaw;
    const mat = Mchev.clone();
    const a = mesh(new THREE.PlaneGeometry(.32, .1), mat, -.08, 0, 0, g);
    a.rotation.x = -Math.PI / 2; a.rotation.z = .45;
    const b = mesh(new THREE.PlaneGeometry(.32, .1), mat, .08, 0, 0, g);
    b.rotation.x = -Math.PI / 2; b.rotation.z = -.45;
    a.receiveShadow = false; a.castShadow = false;
    b.receiveShadow = false; b.castShadow = false;
    chevrons.push({ g, mat });
  });
  // Soft pulse only when motion is allowed — static under prefers-reduced-motion.
  anim.push((t, reduced) => {
    if (reduced) {
      chevrons.forEach(({ mat }) => { mat.opacity = .5; });
      return;
    }
    chevrons.forEach(({ mat }, i) => {
      const phase = (Math.sin(t * 1.4 - i * .45) + 1) * .5;
      mat.opacity = .32 + phase * .38;
    });
  });

  // yellow walkway and a few bollards so the pad reads as a place
  const line = mesh(new THREE.PlaneGeometry(14, .12), M.yellow, 0, .03, 2.2); line.rotation.x = -Math.PI / 2; line.receiveShadow = true;
  [[-9, -6], [9, -6], [-9, 6], [9, 6]].forEach(([x, z]) => cyl(.12, .12, .8, M.yellow, x, .4, z));

  return { scene, insp, pick, anim };
}

bootLesson({
  buildScene,
  presets: PRESETS,
  accent: 0xf2b544,
  ariaLabel: '3D gas processing pad',
});
