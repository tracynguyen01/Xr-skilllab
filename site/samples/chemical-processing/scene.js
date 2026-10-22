import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { bootLesson, kit, noiseTexture } from './engine.js';

const PRESETS = {
  hero: { t: [0, 2, 0], theta: 0.62, phi: 1.16, r: 22 },
  establishing: { t: [0, 2.4, 0], theta: 1, phi: 1.05, r: 30 },
  inspection: { t: [0, 1.6, 0], theta: 0.35, phi: 1.22, r: 14 },
  // Orbit angles chosen so the subject fills the frame and is not clipped by a neighbour.
  incompatible: { t: [-5.2, 0.9, 2.4], theta: 0.2, phi: 1.28, r: 5.5 },
  eyewash: { t: [5.8, 1.3, -2.6], theta: 0.3, phi: 1.22, r: 5.8 },
  vapour: { t: [1.6, 1.5, -0.2], theta: 0.55, phi: 1.18, r: 7 },
  relief: { t: [2.6, 2.0, -3.8], theta: 0.9, phi: 1.15, r: 8 },
  segregated: { t: [-5.4, 1.0, -3.2], theta: 0.55, phi: 1.25, r: 7 },
  clearshower: { t: [6.4, 1.3, 1.8], theta: -0.7, phi: 1.2, r: 6 },
  reactor: { t: [-1.2, 2.0, -1.2], theta: 0.85, phi: 1.12, r: 10 },
  bund: { t: [0.2, 1.5, 4.2], theta: -0.35, phi: 1.2, r: 10 },
  sds: { t: [7.4, 1.5, 4.2], theta: -1.35, phi: 1.25, r: 6 },
};

function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc9d5e4);
  scene.fog = new THREE.Fog(0xc9d5e4, 26, 64);
  const { std, mesh, box, cyl, register, insp, pick, anim } = kit(scene);
  const floorTex = noiseTexture(0xd5d8dc, 6); floorTex.repeat.set(6, 6);
  const M = {
    floor: std({ map: floorTex, roughness: .8 }),
    steel: std({ color: 0xd7dee6, roughness: .32, metalness: .7 }),
    dark: std({ color: 0x2e3640, roughness: .55, metalness: .35 }),
    white: std({ color: 0xf7f8f6, roughness: .45 }),
    yellow: std({ color: 0xf2c14e, roughness: .45 }),
    blue: std({ color: 0x3c6fbf, roughness: .4, metalness: .15 }),
    red: std({ color: 0xc4473a, roughness: .42 }),
    green: std({ color: 0x1f9a55, roughness: .4 }),
    violet: std({ color: 0x8b7cff, roughness: .4, metalness: .1 }),
    orange: std({ color: 0xe07a3d, roughness: .45 }),
    glass: std({ color: 0xb7d4ea, roughness: .12, metalness: .05, transparent: true, opacity: .85 }),
    vapour: new THREE.MeshBasicMaterial({ color: 0xf4f7fb, transparent: true, opacity: .55, depthWrite: false }),
    bund: std({ color: 0xb7c0b0, roughness: .85 }),
  };

  mesh(new THREE.SphereGeometry(80, 20, 14), new THREE.MeshBasicMaterial({ color: 0xd5e0ec, side: THREE.BackSide }));
  const floor = mesh(new THREE.PlaneGeometry(28, 20), M.floor, 0, 0, 0); floor.rotation.x = -Math.PI / 2;
  const wall = mesh(new THREE.PlaneGeometry(28, 7), std({ color: 0xe7ebf0, roughness: .9 }), 0, 3.5, -8); wall.receiveShadow = true;
  scene.add(new THREE.HemisphereLight(0xf3f7ff, 0x8d9298, .8));
  const sun = new THREE.DirectionalLight(0xfff5e8, 2.15);
  sun.position.set(8, 16, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 40 });
  sun.shadow.bias = -.0004; scene.add(sun); scene.add(sun.target);
  const bay = new THREE.PointLight(0xfff1d2, 18, 0, 2); bay.position.set(0, 6.2, 0); scene.add(bay);
  box(1.4, .08, .35, std({ color: 0xfff6e4, emissive: 0xffe7c2, emissiveIntensity: 1.1 }), 0, 5.6, 0);

  // Batch reactor: vessel, manway, agitator shaft, sample point, pipe stub.
  const reactor = new THREE.Group(); scene.add(reactor); reactor.position.set(-1.2, 0, -1.2);
  cyl(1.05, 1.05, 3.1, M.steel, 0, 1.7, 0, reactor);
  cyl(.95, .95, .2, M.dark, 0, .2, 0, reactor);
  cyl(.35, .55, .5, M.steel, 0, 3.4, 0, reactor);
  cyl(.08, .08, .7, M.dark, 0, 3.9, 0, reactor);
  box(.25, .08, .45, M.dark, 0, 4.2, 0, reactor);
  box(2.4, .08, 1.1, M.dark, 0, 2.3, 0, reactor);
  box(.08, 2.2, .7, M.yellow, 1.15, 1.1, 0, reactor);
  // Sample point / small valve on the shell
  box(.5, .12, .5, M.violet, 0, 3.15, .7, reactor);
  cyl(.08, .08, .55, M.steel, .9, 2.0, 0, reactor).rotation.z = Math.PI / 2;
  box(.14, .2, .1, M.red, 1.2, 2.05, 0, reactor);
  register(reactor, 'reactor', 'Batch reactor', [0, 4.3, 0]);

  // Storage tanks in a low bund with liquid surface and nozzle caps.
  const bund = new THREE.Group(); scene.add(bund); bund.position.set(.2, 0, 4.2);
  box(6.2, .45, 3.4, M.bund, 0, .22, 0, bund);
  // Bund walls so the containment reads as a wall, not a pad.
  box(6.2, .55, .12, M.bund, 0, .5, 1.64, bund);
  box(6.2, .55, .12, M.bund, 0, .5, -1.64, bund);
  box(.12, .55, 3.4, M.bund, 3.04, .5, 0, bund);
  box(.12, .55, 3.4, M.bund, -3.04, .5, 0, bund);
  box(5.6, .08, 2.8, std({ color: 0x9bb8c9, roughness: .2, metalness: .05, transparent: true, opacity: .35 }), 0, .5, 0, bund);
  [-1.5, 1.5].forEach((x, i) => {
    cyl(.7, .7, 2.2, i ? M.blue : M.white, x, 1.5, 0, bund);
    cyl(.25, .25, .3, M.dark, x, 2.7, 0, bund);
    cyl(.12, .12, .4, M.steel, x + .55, 1.2, .5, bund).rotation.z = Math.PI / 2;
  });
  register(bund, 'bund', 'Storage tanks', [0, 3.2, 0]);

  // South drum bay — mixed colours (contrasts with the north bay of matching blue drums).
  const mixed = new THREE.Group(); scene.add(mixed); mixed.position.set(-5.4, 0, 2.4);
  box(2.6, .06, 1.8, M.dark, .7, .03, .35, mixed);
  const colors = [M.red, M.yellow, M.blue, M.red, M.violet, M.yellow];
  colors.forEach((mat, i) => {
    const col = i % 3; const row = Math.floor(i / 3);
    cyl(.32, .32, .75, mat, col * .72, .4, row * .75, mixed);
    cyl(.28, .28, .04, M.dark, col * .72, .8, row * .75, mixed);
  });
  register(mixed, 'incompatible', 'Drum bay (south)', [0.7, 1.5, .4]);

  // North drum bay — matching blue drums behind a yellow divider (decoy contrast).
  const seg = new THREE.Group(); scene.add(seg); seg.position.set(-5.6, 0, -3.4);
  box(2.4, .08, 1.3, M.dark, .6, .06, 0, seg);
  [0, .7, 1.4].forEach((x) => {
    cyl(.3, .3, .72, M.blue, x, .44, 0, seg);
    cyl(.26, .26, .04, M.dark, x, .82, 0, seg);
  });
  box(.08, .9, 1.2, M.yellow, 2, .5, 0, seg);
  register(seg, 'segregated', 'Drum bay (north)', [0.7, 1.4, 0]);

  // North safety shower with a red drum and crate in front (hazard). Same yellow as the south twin.
  const shower = new THREE.Group(); scene.add(shower); shower.position.set(5.8, 0, -2.6);
  cyl(.06, .06, 2.3, M.yellow, 0, 1.15, 0, shower);
  cyl(.06, .06, 1.1, M.yellow, .5, 2.25, 0, shower).rotation.z = Math.PI / 2;
  mesh(new THREE.SphereGeometry(.16, 12, 12), M.yellow, .95, 2.25, 0, shower);
  // Eyewash bowl
  cyl(.22, .28, .12, M.steel, .2, 1.15, .35, shower);
  cyl(.28, .32, .7, M.red, .35, .38, .55, shower);
  box(.7, .35, .55, M.dark, .15, .2, .15, shower);
  // Floor mark — same colour on both showers so paint does not hint which is scored.
  box(.9, .02, .9, M.green, .2, .01, .2, shower);
  register(shower, 'eyewash', 'Safety shower (north)', [0.4, 2.6, 0]);

  // South safety shower — same yellow post and green floor mark; open approach.
  const clear = new THREE.Group(); scene.add(clear); clear.position.set(6.4, 0, 1.8);
  cyl(.06, .06, 2.3, M.yellow, 0, 1.15, 0, clear);
  cyl(.06, .06, .9, M.yellow, .4, 2.25, 0, clear).rotation.z = Math.PI / 2;
  mesh(new THREE.SphereGeometry(.14, 12, 12), M.yellow, .85, 2.25, 0, clear);
  cyl(.2, .26, .1, M.steel, .15, 1.15, .3, clear);
  box(.9, .02, .9, M.green, .2, .01, .2, clear);
  register(clear, 'clearshower', 'Safety shower (south)', [.3, 2.6, 0]);

  // Valve manifold: pipe rack, handwheel, rising vapour.
  const valve = new THREE.Group(); scene.add(valve); valve.position.set(1.6, 0, -.2);
  // Pipe runs
  cyl(.1, .1, 1.6, M.steel, 0, .8, 0, valve);
  cyl(.1, .1, 1.4, M.steel, .6, 1.15, 0, valve).rotation.z = Math.PI / 2;
  cyl(.1, .1, .9, M.steel, 1.25, 1.15, .4, valve).rotation.x = Math.PI / 2;
  // Red handwheel / valve body (contrasts with steel pipe)
  box(.28, .12, .18, M.red, .9, 1.15, 0, valve);
  cyl(.18, .18, .06, M.red, .9, 1.28, 0, valve);
  const wisp = mesh(new THREE.SphereGeometry(.22, 12, 10), M.vapour, 1.15, 1.45, 0, valve); wisp.castShadow = false;
  const wisp2 = mesh(new THREE.SphereGeometry(.14, 10, 8), M.vapour, 1.25, 1.8, .05, valve); wisp2.castShadow = false;
  anim.push((t, reduced) => { const k = reduced ? 0 : (t % 1.6) / 1.6; wisp.position.y = 1.35 + k * .7; wisp.material.opacity = .5 * (1 - k); wisp2.position.y = 1.6 + k * .5; });
  register(valve, 'vapour', 'Valve manifold', [.4, 2.1, 0]);

  // Transfer pump (scenery only — not a scored / inspectable id).
  const pump = new THREE.Group(); scene.add(pump); pump.position.set(3.2, 0, 1.4);
  box(.55, .18, .7, M.dark, 0, .09, 0, pump);
  cyl(.28, .28, .55, M.steel, 0, .45, 0, pump);
  box(.4, .35, .35, M.blue, .45, .4, 0, pump);
  cyl(.08, .08, .5, M.steel, -.35, .45, 0, pump).rotation.z = Math.PI / 2;
  cyl(.08, .08, .45, M.steel, .2, .7, .35, pump).rotation.x = Math.PI / 2;

  // Relief header: stack, gag bar, open yellow bypass with orange handle.
  const relief = new THREE.Group(); scene.add(relief); relief.position.set(2.6, 0, -3.8);
  cyl(.22, .22, 1.8, M.steel, 0, .9, 0, relief);
  cyl(.12, .18, .45, M.steel, 0, 1.95, 0, relief);
  // Gag / bar across the relief mouth
  box(.7, .06, .06, M.red, .15, 2.15, 0, relief);
  // Bypass line with open handle
  cyl(.08, .08, .9, M.yellow, .7, 1.2, 0, relief).rotation.z = Math.PI / 2;
  box(.16, .28, .08, M.orange, 1.15, 1.35, 0, relief);
  box(.5, .08, .5, M.dark, 0, .08, 0, relief);
  register(relief, 'relief', 'Relief header', [0, 2.6, 0]);

  // Wall board (fictional information panel).
  const sds = new THREE.Group(); scene.add(sds); sds.position.set(7.4, 0, 4.2);
  box(.08, 1.1, .8, M.white, 0, 1.4, 0, sds);
  box(.04, .7, .55, M.violet, .06, 1.45, 0, sds);
  box(.9, .08, .08, M.dark, 0, .82, 0, sds);
  register(sds, 'sds', 'Wall board', [0, 2.2, 0]);

  return { scene, insp, pick, anim };
}

bootLesson({ buildScene, presets: PRESETS, accent: 0x8b7cff, ariaLabel: '3D chemical batch plant' });
