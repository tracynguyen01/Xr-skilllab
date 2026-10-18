import { useEffect, useRef, useState } from 'react'
import 'aframe'
import { DECOYS } from '../domain/decoys'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
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
  renderer?: { dispose?: () => void }
}

type AFrameApi = {
  components: Record<string, unknown>
  registerComponent: (name: string, definition: object) => void
}

/**
 * A-Frame warehouse. This file is loaded only when the visitor chooses 3D.
 *
 * React does not own the <a-scene> tree. Camera movement stays inside A-Frame
 * so a look or a step does not re-render the page. Listeners are removed when
 * the component unmounts. StrictMode runs the effect twice; the first scene
 * is removed before the second one is created, and room-bounds is registered once.
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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    onUnavailableRef.current = onUnavailable
  }, [onUnavailable])

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

    const timeout = window.setTimeout(fail, 12000)

    try {
      registerRoomBounds()
      scene = document.createElement('a-scene') as SceneEl
      scene.setAttribute('embedded', '')
      scene.setAttribute('renderer', 'antialias: true; colorManagement: true; toneMapping: no')
      scene.setAttribute('vr-mode-ui', 'enabled: false')
      scene.setAttribute('device-orientation-permission-ui', 'enabled: false')
      scene.setAttribute('keyboard-shortcuts', 'enterVR: false')
      scene.setAttribute('loading-screen', 'enabled: false')
      scene.setAttribute('background', 'color: #0B1220')
      scene.setAttribute('fog', 'type: linear; color: #0B1220; near: 12; far: 26')
      // Fill the scene before it joins the document. A-Frame looks for a camera
      // during connectedCallback. If the camera is added afterwards, that search
      // creates a default camera, our markup replaces it, and "loaded" never fires.
      scene.innerHTML = `
        ${warehouseMarkup(sceneSpots(), reducedMotion)}
        <a-entity data-camera position="0.6 1.6 3.1" camera="fov: 68" ${cameraControls(reducedMotion)} room-bounds>
          <a-entity cursor="rayOrigin: mouse" raycaster="objects: .hotspot"></a-entity>
        </a-entity>
      `
      listen('loaded', () => {
        if (!alive) return
        window.clearTimeout(timeout)
        setReady(true)
      })
      listen('click', (event) => {
        const id = hotspotId(event.target)
        if (id) onSelectRef.current(id)
      })
      listen('mouseenter', (event) => scaleHotspot(event.target, '1.16 1.16 1.16'))
      listen('mouseleave', (event) => scaleHotspot(event.target, '1 1 1'))
      host.appendChild(scene)
    } catch {
      window.clearTimeout(timeout)
      fail()
    }

    return () => {
      alive = false
      window.clearTimeout(timeout)
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
      const kind = node.getAttribute('data-kind')
      const done = assessed.has(id) || inspected.has(id)
      const color = done ? '#42DDC5' : kind === 'decoy' ? '#D5E4F2' : '#F2C46D'
      node.querySelectorAll('.hotspot').forEach((mesh) => {
        mesh.setAttribute('color', color)
      })
    })
  }, [ready, assessedKey, inspectedKey, assessedIds, inspectedIds])

  return (
    <div className="scene-3d-frame">
      {/* React must not render children into this node, or it will delete the scene. */}
      <div className="scene-3d-host" ref={hostRef} aria-hidden="true" />
      {ready ? null : (
        <p className="scene-loading" role="status">
          Loading the 3D warehouse…
        </p>
      )}
    </div>
  )
}

function sceneSpots() {
  return [
    ...WAREHOUSE_HAZARDS.map((hazard) => ({ id: hazard.id, kind: 'hazard' as const, hotspot: hazard.hotspot })),
    ...DECOYS.map((decoy) => ({ id: decoy.id, kind: 'decoy' as const, hotspot: decoy.hotspot })),
  ]
}

function cameraControls(reducedMotion: boolean): string {
  if (reducedMotion) return ''
  return 'look-controls="pointerLockEnabled: false; magicWindowTrackingEnabled: false" wasd-controls="fly: false; acceleration: 16"'
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

/** Keeps the camera inside the room without a physics engine. */
function registerRoomBounds() {
  const aframe = (window as Window & { AFRAME?: AFrameApi }).AFRAME
  if (!aframe || aframe.components['room-bounds']) return
  aframe.registerComponent('room-bounds', {
    tick(this: { el: { object3D?: { position: { x: number; y: number; z: number } } } }) {
      const position = this.el.object3D?.position
      if (!position) return
      position.x = Math.min(5.3, Math.max(-5.3, position.x))
      position.z = Math.min(3.3, Math.max(-4.6, position.z))
      position.y = 1.6
    },
  })
}
