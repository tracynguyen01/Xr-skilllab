import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function noiseTexture(hex, seed = 3) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const color = new THREE.Color(hex);
  g.fillStyle = '#' + color.getHexString();
  g.fillRect(0, 0, 256, 256);
  let s = seed;
  const rnd = () => { s = Math.imul(s ^ s >>> 15, s | 1); s ^= s + Math.imul(s ^ s >>> 7, 61 | s); return ((s ^ s >>> 14) >>> 0) / 4294967296; };
  for (let i = 0; i < 4000; i++) {
    const v = rnd() < .5 ? 0 : 255;
    g.fillStyle = `rgba(${v},${v},${v},${.03 + rnd() * .06})`;
    g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 3, 1 + rnd() * 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function badgeTex(kind, accent) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = kind === 'check' ? '#' + new THREE.Color(accent).getHexString() : '#F2C46D';
  g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill();
  g.strokeStyle = '#0B1220'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath();
  if (kind === 'check') { g.moveTo(38, 66); g.lineTo(56, 84); g.lineTo(92, 46); }
  else { g.moveTo(42, 42); g.lineTo(86, 86); g.moveTo(86, 42); g.lineTo(42, 86); }
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

class Orbit {
  constructor(cam, el) {
    this.cam = cam; this.el = el; this.cur = { theta: .3, phi: 1.12, r: 22 }; this.goal = { ...this.cur };
    this.target = new THREE.Vector3(0, 1.6, 0); this.goalTarget = this.target.clone();
    this.limits = { rMin: 4, rMax: 36, phiMin: .55, phiMax: 1.42 }; this.enabled = false; this.par = { x: 0, y: 0 }; this.parGoal = { x: 0, y: 0 }; this.auto = 0; this.tween = null; this.reduced = false;
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

export function bootLesson({ buildScene, presets, accent, ariaLabel }) {
  const badges = { check: badgeTex('check', accent), cross: badgeTex('cross', accent) };
  class View {
    constructor(opts = {}) {
      this.opts = opts;
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;border-radius:inherit';
      canvas.tabIndex = 0;
      canvas.setAttribute('aria-label', opts.ariaLabel || ariaLabel || '3D training scene');
      canvas.setAttribute('role', 'img');
      this.canvas = canvas;
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      Object.assign(this, buildScene());
      this.camera = new THREE.PerspectiveCamera(42, 1, .1, 160);
      this.controls = new Orbit(this.camera, canvas);
      this.controls.set(presets.hero);
      this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2();
      this.hover = null; this.focused = null; this.active = false; this.clock = new THREE.Clock(); this.t = 0; this.pulses = [];
      this.ro = new ResizeObserver(() => this.resize());
      let down = null;
      canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY, performance.now()]; });
      canvas.addEventListener('pointerup', e => { if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); const dt = performance.now() - down[2]; down = null; if (moved < 6 && dt < 600 && this.controls.enabled && !this.controls.tween) { const id = this.pickAt(e); if (id && this.onInspect) this.onInspect(id); } });
      canvas.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !this.controls.enabled || e.buttons) { if (this.hover) this.setHover(null); return; } const id = this.pickAt(e); const r = canvas.getBoundingClientRect(); this.setHover(id, e.clientX - r.left, e.clientY - r.top); });
      canvas.addEventListener('pointerleave', () => this.setHover(null));
      const loop = () => { this.raf = requestAnimationFrame(loop); const dt = Math.min(.05, this.clock.getDelta()); if (!this.active) return; this.t += dt; this.controls.update(dt); (this.anim || []).forEach(f => f(this.t, this.controls.reduced)); this.tickPulses(dt); this.renderer.render(this.scene, this.camera); };
      loop();
    }
    mount(host) { if (this.canvas.parentElement !== host) host.appendChild(this.canvas); this.ro.disconnect(); this.ro.observe(host); this.resize(); }
    resize() { const h = this.canvas.parentElement; if (!h) return; const w = h.clientWidth, hh = h.clientHeight; if (!w || !hh) return; this.renderer.setSize(w, hh, false); this.camera.aspect = w / hh; this.camera.updateProjectionMatrix(); }
    pickAt(e) { const r = this.canvas.getBoundingClientRect(); this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); this.ray.setFromCamera(this.ptr, this.camera); const hit = this.ray.intersectObjects(this.pick, false)[0]; return hit ? hit.object.userData.inspectId : null; }
    tint(id, hex, k) { const it = this.insp[id]; if (!it) return; it.group.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (!m.emissive || !m.userData.base) return; if (hex == null) { m.emissive.setHex(m.userData.base.e); m.emissiveIntensity = m.userData.base.i; } else { m.emissive.setHex(hex); m.emissiveIntensity = k; } }); }); }
    setHover(id, x, y) { if (this.hover && this.hover !== id && this.hover !== this.focused) this.tint(this.hover, null); if (id && id !== this.focused) this.tint(id, 0x84bfff, .22); this.hover = id; this.canvas.style.cursor = id ? 'pointer' : 'grab'; if (this.onHover) this.onHover(id ? { id, label: this.insp[id].label, x, y } : null); }
    focus(id) { if (this.focused) this.tint(this.focused, null); this.focused = id; if (id) this.tint(id, accent, .16); }
    setBadge(id, kind) { const it = this.insp[id]; if (!it) return; if (it.badge) { it.group.remove(it.badge); it.badge = null; } if (!kind) return; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: badges[kind], depthTest: false, transparent: true })); s.scale.set(.7, .7, 1); s.position.copy(it.badgeOffset); s.renderOrder = 10; it.group.add(s); it.badge = s; }
    clearBadges() { Object.keys(this.insp).forEach(id => this.setBadge(id, null)); this.focus(null); }
    pulseZone(id) { const it = this.insp[id]; if (!it) return; const p = new THREE.Vector3(); it.group.getWorldPosition(p); const m = new THREE.Mesh(new THREE.RingGeometry(.7, 2.4, 48), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, .04, p.z); m.renderOrder = 5; this.scene.add(m); this.pulses.push({ m, t: 0 }); }
    tickPulses(dt) { this.pulses = this.pulses.filter(p => { p.t += dt; const k = p.t / 4; if (k >= 1) { this.scene.remove(p.m); return false; } const w = Math.sin(k * Math.PI * 3) * .5 + .5; p.m.material.opacity = .28 * w * (1 - k); p.m.scale.setScalar(1 + k * .6); return true; }); }
    preset(name, ms) { return this.controls.tweenTo(presets[name] || presets.inspection, ms); }
    setPreset(name) { this.controls.set(presets[name] || presets.hero); }
    setReduced(v) { this.controls.reduced = v; }
  }
  window.XRWarehouse = { createView: (opts) => { try { return new View(opts); } catch (e) { console.warn('WebGL unavailable', e); return null; } }, PRESETS: presets };
  window.dispatchEvent(new Event('xrwarehouse-ready'));
}

export function kit(scene) {
  const insp = {}; const pick = []; const anim = [];
  const std = (p) => new THREE.MeshStandardMaterial(Object.assign({ roughness: .72, metalness: .05 }, p));
  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, parent = scene) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  const cyl = (rTop, rBot, h, mat, x, y, z, parent = scene) => mesh(new THREE.CylinderGeometry(rTop, rBot, h, 24), mat, x, y, z, parent);
  function register(group, id, label, offset) {
    group.userData.inspectId = id;
    group.traverse(o => { if (!o.isMesh) return; const mats = Array.isArray(o.material) ? o.material : [o.material]; const cl = mats.map(m => { const c = m.clone(); if (c.emissive) c.userData.base = { e: c.emissive.getHex(), i: c.emissiveIntensity || 1 }; return c; }); o.material = Array.isArray(o.material) ? cl : cl[0]; o.userData.inspectId = id; pick.push(o); });
    insp[id] = { group, label, badgeOffset: new THREE.Vector3(...offset), badge: null };
  }
  return { std, mesh, box, cyl, register, insp, pick, anim };
}
