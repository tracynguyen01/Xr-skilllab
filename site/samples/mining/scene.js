import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { bootLesson, kit, noiseTexture } from './engine.js';

const PRESETS = {
  hero: { t: [0.4, 1.8, 1.6], theta: 0.95, phi: 1.18, r: 18 },
  establishing: { t: [0, 3, 0], theta: 1.1, phi: 1.02, r: 36 },
  inspection: { t: [1, 1.8, 1], theta: 0.45, phi: 1.2, r: 16 },
  blindspot: { t: [1.5, 1.6, 2.2], theta: 0.9, phi: 1.15, r: 10 },
  guarding: { t: [6.2, 1.6, -2], theta: -1.1, phi: 1.2, r: 8 },
  ground: { t: [-7, 2.2, -3], theta: 0.5, phi: 1.15, r: 10 },
  dust: { t: [6.5, 2, 4.5], theta: -0.4, phi: 1.15, r: 9 },
  guarded: { t: [6.2, 1.4, 1.2], theta: -1.2, phi: 1.25, r: 7 },
  water: { t: [-4, 1.4, 5], theta: 0.2, phi: 1.25, r: 8 },
  berm: { t: [-1, 1.2, -1], theta: 0.2, phi: 1.3, r: 8 },
  refuge: { t: [-8.5, 1.4, 4], theta: 1.1, phi: 1.25, r: 7 },
};

function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd7c3a2);
  scene.fog = new THREE.Fog(0xd7c3a2, 32, 78);
  const { std, mesh, box, cyl, register, insp, pick, anim } = kit(scene);
  const dirt = noiseTexture(0xb08968, 9); dirt.repeat.set(6, 6);
  const rock = noiseTexture(0x8d7868, 21); rock.repeat.set(2, 2);
  const M = {
    ground: std({ map: dirt, roughness: .95 }),
    wall: std({ map: rock, roughness: .9, color: 0xc4a484 }),
    road: std({ color: 0x4e463f, roughness: .92 }),
    yellow: std({ color: 0xf2c14e, roughness: .45, metalness: .15 }),
    dark: std({ color: 0x2c2926, roughness: .7, metalness: .2 }),
    steel: std({ color: 0x9aa3ab, roughness: .4, metalness: .55 }),
    orange: std({ color: 0xe07a3d, roughness: .5 }),
    blue: std({ color: 0x3d7ea6, roughness: .45, metalness: .15 }),
    white: std({ color: 0xf3f1ea, roughness: .5 }),
    green: std({ color: 0x3e8f57, roughness: .6 }),
    dust: new THREE.MeshStandardMaterial({ color: 0xd9c7a6, transparent: true, opacity: .45, roughness: 1, depthWrite: false }),
  };

  mesh(new THREE.SphereGeometry(95, 24, 16), new THREE.MeshBasicMaterial({ color: 0xe4d3b4, side: THREE.BackSide }));
  const ground = mesh(new THREE.CircleGeometry(46, 40), M.ground, 0, 0, 0); ground.rotation.x = -Math.PI / 2;
  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x8a6a48, .9));
  const sun = new THREE.DirectionalLight(0xffe0b0, 2.7);
  sun.position.set(-10, 20, 12); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 55 });
  sun.shadow.bias = -.0005; scene.add(sun); scene.add(sun.target);

  // highwall
  const wall = new THREE.Group(); scene.add(wall); wall.position.set(-8, 0, -4);
  box(8, 2.2, 3.2, M.wall, 0, 1.1, -1.2, wall);
  box(6.2, 1.8, 2.4, M.wall, .4, 3, -1.6, wall);
  box(4.2, 1.4, 1.8, M.wall, .8, 4.5, -1.9, wall);
  ;[[-.6, .4], [.4, .2], [1.1, .8], [-.2, 1.1]].forEach(([x, z], i) => {
    mesh(new THREE.DodecahedronGeometry(.28 + (i % 3) * .08), M.wall, x, .2, z + .8, wall);
  });
  register(wall, 'ground', 'Highwall toe', [0, 5.4, 0]);

  // Haul road, berm, and a flat route decal so the aisle reads as a road.
  const road = mesh(new THREE.PlaneGeometry(7, 22), M.road, 0, .03, 2); road.rotation.x = -Math.PI / 2;
  const route = mesh(new THREE.PlaneGeometry(2.2, 18), std({ color: 0x6a5f54, roughness: .95 }), 0, .04, 2.2);
  route.rotation.x = -Math.PI / 2;
  const berm = new THREE.Group(); scene.add(berm); berm.position.set(-3.6, 0, 1);
  for (let z = -6; z <= 6; z += 1.4) box(1.1, .7, 1.1, M.wall, 0, .35, z, berm);
  register(berm, 'berm', 'Road berm', [0, 1.4, 0]);

  // Haul truck: tray, cab, large wheels (+ light vehicle child in the blind spot).
  const truck = new THREE.Group(); scene.add(truck); truck.position.set(1.2, 0, 2.4);
  // Chassis
  box(2.6, .35, 4.2, M.dark, 0, .7, .2, truck);
  // Dump tray (open-top bed)
  box(2.5, .12, 2.8, M.yellow, 0, 1.55, -.35, truck);
  box(2.5, .9, .12, M.yellow, 0, 1.95, -1.7, truck);
  box(.12, .9, 2.8, M.yellow, -1.19, 1.95, -.35, truck);
  box(.12, .9, 2.8, M.yellow, 1.19, 1.95, -.35, truck);
  // Cab at the front
  box(2.2, 1.35, 1.35, M.yellow, 0, 1.55, 2.15, truck);
  box(1.5, .55, .08, M.dark, 0, 1.65, 2.82, truck);
  box(.95, .5, .65, M.white, .3, 2.15, 2.05, truck);
  // Large haul wheels
  ;[[-1.25, -1.35], [1.25, -1.35], [-1.25, .55], [1.25, .55], [-1.25, 2.0], [1.25, 2.0]].forEach(([x, z]) => {
    const w = cyl(.72, .72, .55, M.dark, x, .72, z, truck); w.rotation.z = Math.PI / 2;
    cyl(.35, .35, .56, M.steel, x, .72, z, truck).rotation.z = Math.PI / 2;
  });
  const lv = new THREE.Group(); truck.add(lv); lv.position.set(-2.15, 0, -1.35);
  box(1.15, .45, 2.1, M.white, 0, .55, 0, lv);
  box(.9, .4, .8, M.white, 0, .95, -.2, lv);
  [[-.5, -.7], [.5, -.7], [-.5, .7], [.5, .7]].forEach(([x, z]) => {
    const w = cyl(.22, .22, .18, M.dark, x, .22, z, lv); w.rotation.z = Math.PI / 2;
  });
  register(truck, 'blindspot', 'Haul truck', [0, 3.6, 1]);

  // North conveyor: frame, rollers, belt (ids/positions unchanged).
  const conv = new THREE.Group(); scene.add(conv); conv.position.set(6.4, 0, -2.2);
  box(.16, 1.6, .16, M.steel, -2.2, .8, 0, conv);
  box(.16, 1.6, .16, M.steel, 2.2, .8, 0, conv);
  box(.12, .12, .7, M.steel, -2.2, 1.55, 0, conv);
  box(.12, .12, .7, M.steel, 2.2, 1.55, 0, conv);
  // Idlers / rollers under the belt
  for (let x = -1.8; x <= 1.8; x += .9) {
    cyl(.14, .14, .65, M.dark, x, 1.48, 0, conv).rotation.x = Math.PI / 2;
  }
  box(4.8, .1, .7, M.dark, 0, 1.62, 0, conv);
  box(4.6, .06, .5, M.orange, 0, 1.7, 0, conv);
  register(conv, 'guarding', 'Conveyor (north run)', [0, 2.4, 0]);

  // South conveyor: same frame/belt idea with side panels (neutral label).
  const guarded = new THREE.Group(); scene.add(guarded); guarded.position.set(6.4, 0, 1.4);
  box(.16, 1.5, .16, M.steel, -1.6, .75, 0, guarded);
  box(.16, 1.5, .16, M.steel, 1.6, .75, 0, guarded);
  for (let x = -1.2; x <= 1.2; x += .8) {
    cyl(.12, .12, .55, M.dark, x, 1.38, 0, guarded).rotation.x = Math.PI / 2;
  }
  box(3.6, .1, .6, M.dark, 0, 1.5, 0, guarded);
  box(3.4, .05, .42, M.orange, 0, 1.58, 0, guarded);
  box(3.4, .7, .06, M.steel, 0, 1.2, .38, guarded);
  box(3.4, .7, .06, M.steel, 0, 1.2, -.38, guarded);
  register(guarded, 'guarded', 'Conveyor (south run)', [0, 2.2, 0]);

  // Crusher: hopper over a crusher body, then the dust plume.
  const crusher = new THREE.Group(); scene.add(crusher); crusher.position.set(7.2, 0, 5.2);
  // Body / jaws
  box(2.6, 1.6, 2.4, M.dark, 0, .85, 0, crusher);
  box(2.2, .5, 2.0, M.steel, 0, 1.85, 0, crusher);
  // Hopper (wider top, sits above the body)
  box(2.8, .15, 2.6, M.orange, 0, 2.35, 0, crusher);
  box(2.5, .9, .12, M.orange, 0, 2.85, 1.2, crusher);
  box(2.5, .9, .12, M.orange, 0, 2.85, -1.2, crusher);
  box(.12, .9, 2.4, M.orange, -1.3, 2.85, 0, crusher);
  box(.12, .9, 2.4, M.orange, 1.3, 2.85, 0, crusher);
  cyl(.35, .5, 1.1, M.steel, -1.7, 2.0, 0, crusher).rotation.z = Math.PI / 2;
  const cloud = mesh(new THREE.SphereGeometry(.7, 16, 12), M.dust, -2.3, 2.1, .2, crusher); cloud.castShadow = false;
  const cloud2 = mesh(new THREE.SphereGeometry(.45, 12, 10), M.dust, -2.8, 2.5, -.2, crusher); cloud2.castShadow = false;
  anim.push((t, reduced) => { const k = reduced ? 0 : Math.sin(t * 1.4) * .15; cloud.position.y = 2.1 + k; cloud2.position.x = -2.8 - Math.abs(k); });
  register(crusher, 'dust', 'Crusher transfer', [0, 3.6, 0]);

  // water cart
  const water = new THREE.Group(); scene.add(water); water.position.set(-4.2, 0, 5.6);
  box(1.3, .55, 2.6, M.blue, 0, .7, 0, water);
  cyl(.45, .45, 1.8, M.blue, 0, 1.15, -.1, water).rotation.z = Math.PI / 2;
  box(.8, .5, .7, M.white, 0, .85, 1.15, water);
  [[-.55, -1], [.55, -1], [-.55, 1], [.55, 1]].forEach(([x, z]) => { const w = cyl(.28, .28, .2, M.dark, x, .28, z, water); w.rotation.z = Math.PI / 2; });
  register(water, 'water', 'Water cart', [0, 2.1, 0]);

  // refuge
  const refuge = new THREE.Group(); scene.add(refuge); refuge.position.set(-8.6, 0, 4.6);
  box(2.2, 2, 1.8, M.white, 0, 1, 0, refuge);
  box(2.3, .12, 2, M.green, 0, 2.05, 0, refuge);
  box(.7, 1.3, .08, M.green, 0, .7, .92, refuge);
  box(.5, .3, .06, M.yellow, .7, 1.5, .92, refuge);
  register(refuge, 'refuge', 'Refuge chamber', [0, 2.5, 0]);

  return { scene, insp, pick, anim };
}

bootLesson({ buildScene, presets: PRESETS, accent: 0xe07a3d, ariaLabel: '3D open-cut mine scene' });
