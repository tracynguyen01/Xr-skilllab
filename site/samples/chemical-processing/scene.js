import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { bootLesson, kit, noiseTexture } from './engine.js';

const PRESETS = {
  hero: { t: [0, 2, 0], theta: 0.62, phi: 1.16, r: 22 },
  establishing: { t: [0, 2.4, 0], theta: 1, phi: 1.05, r: 30 },
  inspection: { t: [0, 1.6, 0], theta: 0.35, phi: 1.22, r: 14 },
  incompatible: { t: [-5.2, 1, 2.2], theta: 0.8, phi: 1.25, r: 6 },
  eyewash: { t: [5.6, 1.3, -2.4], theta: -0.9, phi: 1.2, r: 6 },
  vapour: { t: [1.2, 1.4, -1], theta: 0.2, phi: 1.15, r: 6 },
  relief: { t: [2.4, 2.2, -3.6], theta: -0.4, phi: 1.15, r: 7 },
  segregated: { t: [-5.4, 1, -3], theta: 0.7, phi: 1.28, r: 6 },
  clearshower: { t: [6.2, 1.3, 1.6], theta: -1.1, phi: 1.25, r: 6 },
  reactor: { t: [-1.2, 2, -1], theta: 0.4, phi: 1.15, r: 8 },
  bund: { t: [0, 1.4, 4], theta: 0.1, phi: 1.25, r: 8 },
  sds: { t: [7.2, 1.5, 4], theta: -1.3, phi: 1.3, r: 5 },
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
    green: std({ color: 0x2f9d6c, roughness: .45 }),
    violet: std({ color: 0x8b7cff, roughness: .4, metalness: .1 }),
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

  // reactor, operating as drawn
  const reactor = new THREE.Group(); scene.add(reactor); reactor.position.set(-1.2, 0, -1.2);
  cyl(1.05, 1.05, 3.1, M.steel, 0, 1.7, 0, reactor);
  cyl(.35, .55, .5, M.steel, 0, 3.4, 0, reactor);
  cyl(.08, .08, .7, M.dark, 0, 3.9, 0, reactor);
  box(2.4, .08, 1.1, M.dark, 0, 2.3, 0, reactor);
  box(.08, 2.2, .7, M.yellow, 1.15, 1.1, 0, reactor);
  box(.5, .12, .5, M.violet, 0, 3.15, .7, reactor);
  register(reactor, 'reactor', 'Batch reactor', [0, 4.3, 0]);

  // bunded tanks
  const bund = new THREE.Group(); scene.add(bund); bund.position.set(.2, 0, 4.2);
  box(6.2, .45, 3.4, M.bund, 0, .22, 0, bund);
  box(5.6, .08, 2.8, std({ color: 0x9bb8c9, roughness: .2, metalness: .05, transparent: true, opacity: .35 }), 0, .5, 0, bund);
  [-1.5, 1.5].forEach((x, i) => {
    cyl(.7, .7, 2.2, i ? M.blue : M.white, x, 1.5, 0, bund);
    cyl(.25, .25, .3, M.dark, x, 2.7, 0, bund);
  });
  register(bund, 'bund', 'Bunded tanks', [0, 3.2, 0]);

  // incompatible drums
  const mixed = new THREE.Group(); scene.add(mixed); mixed.position.set(-5.4, 0, 2.4);
  const colors = [M.red, M.yellow, M.blue, M.red, M.violet, M.yellow];
  colors.forEach((mat, i) => {
    const col = i % 3; const row = Math.floor(i / 3);
    cyl(.32, .32, .75, mat, col * .72, .4, row * .75, mixed);
  });
  register(mixed, 'incompatible', 'Mixed drum store', [0.7, 1.5, .4]);

  // segregated store
  const seg = new THREE.Group(); scene.add(seg); seg.position.set(-5.6, 0, -3.4);
  box(2.4, .08, 1.3, M.dark, .6, .06, 0, seg);
  [0, .7, 1.4].forEach((x) => cyl(.3, .3, .72, M.blue, x, .44, 0, seg));
  box(.08, .9, 1.2, M.yellow, 2, .5, 0, seg);
  register(seg, 'segregated', 'Segregated drums', [0.7, 1.4, 0]);

  // obstructed shower
  const shower = new THREE.Group(); scene.add(shower); shower.position.set(5.8, 0, -2.6);
  cyl(.06, .06, 2.3, M.yellow, 0, 1.15, 0, shower);
  cyl(.06, .06, 1.1, M.yellow, .5, 2.25, 0, shower).rotation.z = Math.PI / 2;
  mesh(new THREE.SphereGeometry(.16, 12, 12), M.yellow, .95, 2.25, 0, shower);
  cyl(.22, .28, .12, M.steel, .2, 1.15, .35, shower);
  cyl(.28, .32, .7, M.red, .35, .38, .55, shower);
  box(.7, .35, .55, M.dark, .15, .2, .15, shower);
  register(shower, 'eyewash', 'Safety shower', [0.4, 2.6, 0]);

  // clear shower
  const clear = new THREE.Group(); scene.add(clear); clear.position.set(6.4, 0, 1.8);
  cyl(.06, .06, 2.3, M.green, 0, 1.15, 0, clear);
  cyl(.06, .06, .9, M.green, .4, 2.25, 0, clear).rotation.z = Math.PI / 2;
  cyl(.2, .26, .1, M.steel, .15, 1.15, .3, clear);
  register(clear, 'clearshower', 'Clear safety shower', [.3, 2.6, 0]);

  // vapour at a valve
  const valve = new THREE.Group(); scene.add(valve); valve.position.set(1.6, 0, -.2);
  cyl(.1, .1, 1.6, M.steel, 0, .8, 0, valve);
  cyl(.1, .1, 1.4, M.steel, .6, 1.15, 0, valve).rotation.z = Math.PI / 2;
  box(.28, .12, .18, M.red, .9, 1.15, 0, valve);
  const wisp = mesh(new THREE.SphereGeometry(.22, 12, 10), M.vapour, 1.15, 1.45, 0, valve); wisp.castShadow = false;
  const wisp2 = mesh(new THREE.SphereGeometry(.14, 10, 8), M.vapour, 1.25, 1.8, .05, valve); wisp2.castShadow = false;
  anim.push((t, reduced) => { const k = reduced ? 0 : (t % 1.6) / 1.6; wisp.position.y = 1.35 + k * .7; wisp.material.opacity = .5 * (1 - k); wisp2.position.y = 1.6 + k * .5; });
  register(valve, 'vapour', 'Valve manifold', [.4, 2.1, 0]);

  // gagged relief / open bypass
  const relief = new THREE.Group(); scene.add(relief); relief.position.set(2.6, 0, -3.8);
  cyl(.22, .22, 1.8, M.steel, 0, .9, 0, relief);
  cyl(.12, .18, .45, M.steel, 0, 1.95, 0, relief);
  box(.7, .06, .06, M.red, .15, 2.15, 0, relief);
  cyl(.08, .08, .9, M.yellow, .7, 1.2, 0, relief).rotation.z = Math.PI / 2;
  box(.16, .28, .08, M.orange, 1.15, 1.35, 0, relief);
  register(relief, 'relief', 'Relief and bypass', [0, 2.6, 0]);

  // SDS board
  const sds = new THREE.Group(); scene.add(sds); sds.position.set(7.4, 0, 4.2);
  box(.08, 1.1, .8, M.white, 0, 1.4, 0, sds);
  box(.04, .7, .55, M.violet, .06, 1.45, 0, sds);
  register(sds, 'sds', 'Information board', [0, 2.2, 0]);

  return { scene, insp, pick, anim };
}

bootLesson({ buildScene, presets: PRESETS, accent: 0x8b7cff, ariaLabel: '3D chemical batch plant' });
