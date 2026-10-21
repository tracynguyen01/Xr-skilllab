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
