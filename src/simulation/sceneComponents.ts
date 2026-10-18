import { ESTABLISHING_VIEW, WALK_EYE_HEIGHT } from './cameraPose'

type Vec3 = { x: number; y: number; z: number }

type AFrameApi = {
  components: Record<string, unknown>
  registerComponent: (name: string, definition: object) => void
  THREE: { Vector3: new () => Vec3 }
}

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']
const WALK_SPEED = 4.6

let lookTarget: Vec3 | null = null

/**
 * Custom A-Frame pieces for this one scene.
 * Registered once. StrictMode mounts twice, and a second register would throw.
 */
export function registerSceneComponents() {
  const aframe = (window as Window & { AFRAME?: AFrameApi }).AFRAME
  if (!aframe) return
  registerRoomBounds(aframe)
  registerFaceCamera(aframe)
  registerFloorWalk(aframe)
  registerPoseGlide(aframe)
}

function registerRoomBounds(aframe: AFrameApi) {
  if (aframe.components['room-bounds']) return
  aframe.registerComponent('room-bounds', {
    schema: { walking: { type: 'boolean', default: false } },
    tick(this: { data: { walking: boolean }; el: { object3D?: { position: Vec3 } } }, _time: number, delta: number) {
      if (!this.data.walking) return
      const position = this.el.object3D?.position
      if (!position) return
      position.x = clamp(position.x, -5.15, 5.15)
      position.z = clamp(position.z, -4.9, 3.15)
      const step = Math.min(1, (delta || 16) / 180)
      position.y += (WALK_EYE_HEIGHT - position.y) * step
    },
  })
}

/** Keeps a badge facing the viewer without the aframe-extras look-at component. */
function registerFaceCamera(aframe: AFrameApi) {
  if (aframe.components['face-camera']) return
  lookTarget = new aframe.THREE.Vector3()
  aframe.registerComponent('face-camera', {
    tick(this: { el: { object3D: { lookAt: (v: Vec3) => void; rotateY: (n: number) => void }; sceneEl?: { camera?: { getWorldPosition: (out: Vec3) => Vec3 } } } }) {
      const camera = this.el.sceneEl?.camera
      if (!camera || !lookTarget) return
      camera.getWorldPosition(lookTarget)
      this.el.object3D.lookAt(lookTarget)
      // A plane shows its front on +Z. lookAt aims -Z at the camera, so turn it around.
      this.el.object3D.rotateY(Math.PI)
    },
  })
}

/**
 * WASD and the arrow keys.
 * A-Frame's wasd-controls only listens when nothing on the page is focused,
 * so a click on the inspection list made movement feel broken. This walker
 * still stays quiet while a dialog is open or the visitor is typing.
 */
function registerFloorWalk(aframe: AFrameApi) {
  if (aframe.components['floor-walk']) return
  aframe.registerComponent('floor-walk', {
    schema: { enabled: { type: 'boolean', default: true } },
    init(this: WalkEl) {
      this.keys = new Set()
      this.onKeyDown = (event: KeyboardEvent) => {
        if (!this.data.enabled || this.el.dataset.gliding === 'true' || !canWalk(event)) return
        if (!MOVE_KEYS.includes(event.code)) return
        this.keys.add(event.code)
        this.el.setAttribute('room-bounds', 'walking: true')
        event.preventDefault()
      }
      this.onKeyUp = (event: KeyboardEvent) => {
        this.keys.delete(event.code)
      }
      this.onBlur = () => {
        this.keys.clear()
      }
      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('keyup', this.onKeyUp)
      window.addEventListener('blur', this.onBlur)
    },
    remove(this: WalkEl) {
      window.removeEventListener('keydown', this.onKeyDown)
      window.removeEventListener('keyup', this.onKeyUp)
      window.removeEventListener('blur', this.onBlur)
    },
    tick(this: WalkEl, _time: number, delta: number) {
      if (!this.data.enabled || this.el.dataset.gliding === 'true' || this.keys.size === 0) return
      const position = this.el.object3D?.position
      if (!position) return
      let strafe = 0
      let forward = 0
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) strafe -= 1
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) strafe += 1
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += 1
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= 1
      const length = Math.hypot(strafe, forward)
      if (length === 0) return
      strafe /= length
      forward /= length
      const yaw = this.el.object3D.rotation.y
      const sin = Math.sin(yaw)
      const cos = Math.cos(yaw)
      const step = WALK_SPEED * Math.min(0.05, (delta || 16) / 1000)
      // Heading: +Z yaw turns the camera toward -X. Forward is -Z in that frame.
      position.x += (strafe * cos - forward * sin) * step
      position.z += (-strafe * sin - forward * cos) * step
    },
  })
}

/** Short ease into the establishing view. Removed when the move finishes. */
function registerPoseGlide(aframe: AFrameApi) {
  if (aframe.components['pose-glide']) return
  const target = parseVec(ESTABLISHING_VIEW.position)
  const targetRotation = parseVec(ESTABLISHING_VIEW.rotation)
  aframe.registerComponent('pose-glide', {
    schema: { dur: { type: 'number', default: 1200 } },
    init(this: GlideEl) {
      this.captured = false
      this.el.dataset.gliding = 'true'
    },
    tick(this: GlideEl) {
      if (!this.captured) {
        const position = this.el.object3D.position
        const rotation = this.el.object3D.rotation
        this.from = { x: position.x, y: position.y, z: position.z }
        this.fromRotation = { x: rotation.x, y: rotation.y, z: rotation.z }
        this.started = performance.now()
        this.captured = true
        return
      }
      const span = Math.max(1, this.data.dur)
      const raw = Math.min(1, (performance.now() - this.started) / span)
      const t = raw * raw * (3 - 2 * raw)
      const position = this.el.object3D.position
      position.x = lerp(this.from.x, target.x, t)
      position.y = lerp(this.from.y, target.y, t)
      position.z = lerp(this.from.z, target.z, t)
      const rotation = this.el.object3D.rotation
      rotation.x = lerp(this.fromRotation.x, deg(targetRotation.x), t)
      rotation.y = lerp(this.fromRotation.y, deg(targetRotation.y), t)
      rotation.z = 0
      if (raw < 1) return
      delete this.el.dataset.gliding
      this.el.removeAttribute('pose-glide')
      this.el.emit('glide-ended')
    },
  })
}

type WalkEl = {
  data: { enabled: boolean }
  el: HTMLElement & { object3D: { position: Vec3; rotation: Vec3 } }
  keys: Set<string>
  onKeyDown: (event: KeyboardEvent) => void
  onKeyUp: (event: KeyboardEvent) => void
  onBlur: () => void
}

type GlideEl = {
  data: { dur: number }
  el: HTMLElement & {
    object3D: { position: Vec3; rotation: Vec3 }
    dataset: DOMStringMap
    removeAttribute: (name: string) => void
    emit: (name: string) => void
  }
  from: Vec3
  fromRotation: Vec3
  started: number
  captured: boolean
}

function canWalk(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return false
  if (document.querySelector('[role="dialog"]')) return false
  const target = event.target
  if (!(target instanceof HTMLElement)) return true
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return false
  if (target.isContentEditable) return false
  return true
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

function deg(value: number): number {
  return (value * Math.PI) / 180
}

function parseVec(value: string): Vec3 {
  const [x, y, z] = value.split(' ').map(Number)
  return { x, y, z }
}
