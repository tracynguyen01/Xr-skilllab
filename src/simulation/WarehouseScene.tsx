import { useEffect, useRef, useState } from 'react'
import 'aframe'
import { DECOYS } from '../domain/decoys'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
import { ESTABLISHING_VIEW, GLIDE_START, RESET_VIEW_EVENT } from './cameraPose'
import { SceneLoading } from './SceneLoading'
import { registerSceneComponents } from './sceneComponents'
import { warehouseMarkup } from './warehouseMarkup'

type WarehouseSceneProps = {
  assessedIds: readonly string[]
  inspectedIds: readonly string[]
  reducedMotion: boolean
  onSelect: (id: string) => void
  onUnavailable: () => void
}

type SceneEl = HTMLElement & {
  pause?: () => void
  renderer?: { dispose?: () => void; xr?: { enabled: boolean } }
  querySelector: (selector: string) => HTMLElement | null
}

/**
 * A-Frame warehouse. This file is loaded only when the visitor chooses 3D.
 *
 * React does not own the <a-scene> tree. Camera movement stays inside A-Frame
 * so a look or a step does not re-render the page. Listeners are removed when
 * the component unmounts. StrictMode runs the effect twice; the first scene
 * is removed before the second one is created.
 */
export function WarehouseScene({
  assessedIds,
  inspectedIds,
  reducedMotion,
  onSelect,
  onUnavailable,
}: WarehouseSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  const onUnavailableRef = useRef(onUnavailable)
  const reducedRef = useRef(reducedMotion)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    onUnavailableRef.current = onUnavailable
  }, [onUnavailable])

  useEffect(() => {
    reducedRef.current = reducedMotion
  }, [reducedMotion])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let alive = true
    let scene: SceneEl | null = null
    const listeners: Array<{ type: string; fn: EventListener }> = []

    function fail() {
      if (!alive) return
      onUnavailableRef.current()
    }

    function listen(type: string, fn: EventListener) {
      scene?.addEventListener(type, fn)
      listeners.push({ type, fn })
    }

    function onResetView() {
      const rig = scene?.querySelector('[data-rig]')
      if (!(rig instanceof HTMLElement)) return
      const camera = rig.querySelector('[data-camera]')
      // Look offsets live on the child. Zero them so the rig's downward pose is the shot.
      zeroLookOffsets(camera)
      if (camera instanceof HTMLElement) camera.setAttribute('look-controls', 'enabled: false')
      rig.setAttribute('floor-walk', 'enabled: false')
      rig.setAttribute('room-bounds', 'walking: false')
      if (reducedRef.current) {
        rig.setAttribute('position', ESTABLISHING_VIEW.position)
        rig.setAttribute('rotation', ESTABLISHING_VIEW.rotation)
        return
      }
      rig.removeAttribute('pose-glide')
      rig.setAttribute('pose-glide', 'dur: 900')
    }

    const timeout = window.setTimeout(fail, 12000)

    try {
      registerSceneComponents()
      scene = document.createElement('a-scene') as SceneEl
      scene.setAttribute('embedded', '')
      scene.setAttribute('renderer', 'antialias: true; colorManagement: true; toneMapping: no; logarithmicDepthBuffer: false')
      scene.setAttribute('vr-mode-ui', 'enabled: false')
      scene.setAttribute('device-orientation-permission-ui', 'enabled: false')
      scene.setAttribute('keyboard-shortcuts', 'enterVR: false')
      scene.setAttribute('loading-screen', 'enabled: false')
      scene.setAttribute('background', 'color: #163047')
      scene.setAttribute('fog', 'type: linear; color: #163047; near: 10; far: 26')
      // Fill the scene before it joins the document. A-Frame looks for a camera
      // during connectedCallback. If the camera is added afterwards, that search
      // creates a default camera, our markup replaces it, and "loaded" never fires.
      scene.innerHTML = `
        ${warehouseMarkup(sceneSpots(), reducedMotion)}
        ${cameraMarkup(reducedMotion)}
      `
      listen('loaded', () => {
        if (!alive || !scene) return
        window.clearTimeout(timeout)
        // The screenshot component reads pixels back from the GPU. We never take
        // those shots, and the raycaster only needs the marker meshes.
        scene.removeAttribute('screenshot')
        if (scene.renderer?.xr) scene.renderer.xr.enabled = false
        setReady(true)
      })
      listen('glide-ended', (event) => {
        const rig = event.target
        if (!(rig instanceof HTMLElement) || !rig.hasAttribute('data-rig')) return
        if (reducedRef.current) return
        const camera = rig.querySelector('[data-camera]')
        // The rig already holds the downward pitch. look-controls must start at zero
        // on the child, or its next tick replaces that pitch with its own offsets.
        zeroLookOffsets(camera)
        if (camera instanceof HTMLElement) camera.setAttribute('look-controls', 'enabled: true')
        rig.setAttribute('floor-walk', 'enabled: true')
      })
      listen('click', (event) => {
        const id = hotspotId(event.target)
        if (id) onSelectRef.current(id)
      })
      listen('mouseenter', (event) => scaleHotspot(event.target, '1.12 1.12 1.12'))
      listen('mouseleave', (event) => scaleHotspot(event.target, '1 1 1'))
      window.addEventListener(RESET_VIEW_EVENT, onResetView)
      host.appendChild(scene)
    } catch {
      window.clearTimeout(timeout)
      fail()
    }

    return () => {
      alive = false
      window.clearTimeout(timeout)
      window.removeEventListener(RESET_VIEW_EVENT, onResetView)
      setReady(false)
      if (scene) {
        for (const item of listeners) scene.removeEventListener(item.type, item.fn)
        scene.pause?.()
        scene.renderer?.dispose?.()
        scene.remove()
      }
      host.replaceChildren()
    }
  }, [reducedMotion])

  const assessedKey = assessedIds.join('|')
  const inspectedKey = inspectedIds.join('|')

  useEffect(() => {
    const host = hostRef.current
    if (!host || !ready) return
    const assessed = new Set(assessedIds)
    const inspected = new Set(inspectedIds)
    host.querySelectorAll<HTMLElement>('[data-hotspot]').forEach((node) => {
      const id = node.getAttribute('data-hotspot') ?? ''
      const done = assessed.has(id) || inspected.has(id)
      const color = done ? '#42DDC5' : '#F2C46D'
      node.querySelectorAll('.marker-ring, .marker-glow').forEach((mesh) => {
        mesh.setAttribute('color', color)
      })
      const badge = node.querySelector('.badge-face')
      const src = done ? node.getAttribute('data-check') : node.getAttribute('data-badge')
      if (badge && src) badge.setAttribute('src', src)
    })
  }, [ready, assessedKey, inspectedKey, assessedIds, inspectedIds])

  return (
    <div className="scene-3d-frame">
      {/* React must not render children into this node, or it will delete the scene. */}
      <div className="scene-3d-host" ref={hostRef} aria-hidden="true" />
      {ready ? null : <SceneLoading />}
    </div>
  )
}

function sceneSpots() {
  return [
    ...WAREHOUSE_HAZARDS.map((hazard) => ({ id: hazard.id, kind: 'hazard' as const, hotspot: hazard.hotspot })),
    ...DECOYS.map((decoy) => ({ id: decoy.id, kind: 'decoy' as const, hotspot: decoy.hotspot })),
  ]
}

function cameraMarkup(reducedMotion: boolean): string {
  const cursor = `<a-entity cursor="rayOrigin: mouse; fuse: false; mouseCursorStylesEnabled: false" raycaster="objects: .hotspot; interval: 120; far: 24"></a-entity>`
  // Position and pitch live on the rig. look-controls only adds a delta on the child,
  // so it cannot overwrite the opening shot the way it did when it owned the camera.
  const look = reducedMotion
    ? ''
    : ` look-controls="enabled: false; pointerLockEnabled: false; magicWindowTrackingEnabled: false"`
  const rigPose = reducedMotion ? ESTABLISHING_VIEW : GLIDE_START
  const rigMotion = reducedMotion ? '' : ` pose-glide="dur: 1200" floor-walk="enabled: false"`
  return `
    <a-entity data-rig position="${rigPose.position}" rotation="${rigPose.rotation}" room-bounds${rigMotion}>
      <a-entity data-camera camera="fov: 70" position="0 0 0" rotation="0 0 0"${look}>
        ${cursor}
      </a-entity>
    </a-entity>
  `
}

function hotspotId(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null
  return target.closest('[data-hotspot]')?.getAttribute('data-hotspot') ?? null
}

function scaleHotspot(target: EventTarget | null, scale: string) {
  if (!(target instanceof Element)) return
  const root = target.closest('[data-hotspot]')
  root?.setAttribute('scale', scale)
}

function zeroLookOffsets(camera: Element | null) {
  if (!(camera instanceof HTMLElement)) return
  const look = (camera as HTMLElement & { components?: Record<string, LookControls> }).components?.['look-controls']
  const object3D = (camera as HTMLElement & { object3D?: { rotation: { x: number; y: number; z: number } } }).object3D
  if (look?.pitchObject) look.pitchObject.rotation.x = 0
  if (look?.yawObject) look.yawObject.rotation.y = 0
  if (look?.magicWindowDeltaEuler) {
    look.magicWindowDeltaEuler.x = 0
    look.magicWindowDeltaEuler.y = 0
    look.magicWindowDeltaEuler.z = 0
  }
  if (object3D) {
    object3D.rotation.x = 0
    object3D.rotation.y = 0
    object3D.rotation.z = 0
  }
}

type LookControls = {
  pitchObject?: { rotation: { x: number } }
  yawObject?: { rotation: { y: number } }
  magicWindowDeltaEuler?: { x: number; y: number; z: number }
}
