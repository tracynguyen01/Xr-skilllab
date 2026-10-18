import type { Hotspot3D } from '../domain/types'
import { SCENE_MARKERS } from './sceneObjects'

type Spot = { id: string; kind: 'hazard' | 'decoy'; hotspot: Hotspot3D }

const GOLD = '#F2C46D'
const TEAL = '#42DDC5'
const STEEL = '#8ea3b8'
const CRATE = '#c9a36b'
const CRATE_DARK = '#a67c45'
const CRATE_LIGHT = '#d7b98a'

/**
 * Low-poly warehouse built from A-Frame primitives.
 * Marker positions use the shared hotspot coordinates. The room is scenery around them.
 */
export function warehouseMarkup(spots: readonly Spot[], reducedMotion: boolean): string {
  const at = (id: string): Hotspot3D => {
    const spot = spots.find((item) => item.id === id)
    if (!spot) throw new Error(`Missing 3D spot: ${id}`)
    return spot.hotspot
  }

  const exit = at('blocked-exit')
  const spill = at('floor-spill')
  const load = at('unstable-load')
  const truck = at('forklift-crossing')
  const extinguisher = at('secured-extinguisher')
  const aisle = at('clear-aisle')
  const checkUrl = paintBadge('check', TEAL, '#062821')

  return `
    <a-entity light="type: hemisphere; color: #e8f3fc; groundColor: #24384f; intensity: 0.72"></a-entity>
    <a-entity light="type: ambient; color: #c5d6e8; intensity: 0.38"></a-entity>
    <a-entity light="type: directional; color: #fff6ea; intensity: 1.05" position="-5 9 4"></a-entity>
    <a-entity light="type: point; color: #d7fff6; intensity: 0.55; distance: 9; decay: 2" position="-1.2 3.35 -1.4"></a-entity>
    <a-entity light="type: point; color: #42ddc5; intensity: 0.45; distance: 8; decay: 2" position="${exit.x} 2.7 ${exit.z + 1.2}"></a-entity>
    <a-entity light="type: point; color: #f2c46d; intensity: 0.28; distance: 7; decay: 2" position="1.4 3.2 0.2"></a-entity>

    ${floor()}
    ${ceiling()}
    ${walls()}
    ${racks()}
    ${exitDoor(exit, exitSignUrl())}
    ${blockingBoxes(exit)}
    ${puddle(spill)}
    ${unstableStack(load)}
    ${forklift(truck)}
    ${mountedExtinguisher(extinguisher)}
    ${tidyStack(aisle)}
    ${workbench()}

    ${spots.map((spot) => hotspot(spot, reducedMotion, checkUrl)).join('\n')}
  `
}

function floor(): string {
  return `
    <a-box width="12.2" height="0.16" depth="14.2" position="0 -0.08 1" material="color: #314862; roughness: 0.86"></a-box>
    <a-box width="1.7" height="0.02" depth="8.6" position="0.7 0.012 -0.6" material="color: #3d5674; roughness: 0.75"></a-box>
    <a-box width="0.045" height="0.025" depth="8.6" position="-0.12 0.03 -0.6" material="color: ${GOLD}; roughness: 0.45"></a-box>
    <a-box width="0.045" height="0.025" depth="8.6" position="1.52 0.03 -0.6" material="color: ${GOLD}; roughness: 0.45"></a-box>
    ${[-3.4, -1.8, -0.2, 1.4, 3].map((z) => `<a-box width="0.32" height="0.026" depth="0.08" position="0.7 0.032 ${z}" material="color: ${GOLD}"></a-box>`).join('\n')}
  `
}

function ceiling(): string {
  const panels = [
    [-2.4, -2.2],
    [0.2, -0.4],
    [2.6, -3.2],
    [-1.2, 0.8],
  ]
  return `
    <a-box width="12.2" height="0.12" depth="10.2" position="0 4.02 -1" material="color: #1b2e46; roughness: 0.9"></a-box>
    ${[-3.2, -0.6, 2].map((z) => `<a-box width="11.4" height="0.1" depth="0.14" position="0 3.88 ${z}" material="color: #24384f"></a-box>`).join('\n')}
    <a-box width="0.14" height="0.1" depth="9.2" position="-3.2 3.88 -1" material="color: #24384f"></a-box>
    <a-box width="0.14" height="0.1" depth="9.2" position="2.4 3.88 -1" material="color: #24384f"></a-box>
    ${panels.map(([x, z]) => `<a-box width="1.35" height="0.04" depth="0.42" position="${x} 3.78 ${z}" material="color: #f4f8fd; emissive: #d5e6f8; emissiveIntensity: 0.7"></a-box>`).join('\n')}
  `
}

function walls(): string {
  const columns = [-4, -2, 0, 2, 4]
  return `
    <a-box width="12.2" height="4.05" depth="0.16" position="0 2.02 -6.05" material="color: #24384f; roughness: 0.9"></a-box>
    <a-box width="0.16" height="4.05" depth="10.2" position="-6.05 2.02 -1" material="color: #1e3248; roughness: 0.9"></a-box>
    <a-box width="0.16" height="4.05" depth="10.2" position="6.05 2.02 -1" material="color: #1e3248; roughness: 0.9"></a-box>
    <a-box width="12.2" height="0.7" depth="0.16" position="0 3.7 4.05" material="color: #24384f"></a-box>
    <a-box width="12.2" height="0.06" depth="0.04" position="0 3.15 -5.94" material="color: ${TEAL}; emissive: ${TEAL}; emissiveIntensity: 0.25"></a-box>
    ${columns.map((x) => `<a-box width="0.12" height="3.5" depth="0.08" position="${x} 1.75 -5.92" material="color: #314862"></a-box>`).join('\n')}
  `
}

function blob(x: number, z: number, radius: number): string {
  return `<a-circle radius="${radius}" rotation="-90 0 0" position="${x} 0.02 ${z}" material="shader: flat; color: #071018; opacity: 0.4; transparent: true"></a-circle>`
}

function racks(): string {
  const bays = [-4.2, -2.6, -1]
  return bays
    .map((z, index) => {
      return `
        ${blob(-4.05, z, 0.85)}
        <a-box width="0.08" height="2.7" depth="0.08" position="-4.55 1.35 ${z - 0.55}" material="color: ${STEEL}"></a-box>
        <a-box width="0.08" height="2.7" depth="0.08" position="-4.55 1.35 ${z + 0.55}" material="color: ${STEEL}"></a-box>
        <a-box width="0.08" height="2.7" depth="0.08" position="-3.5 1.35 ${z - 0.55}" material="color: ${STEEL}"></a-box>
        <a-box width="0.08" height="2.7" depth="0.08" position="-3.5 1.35 ${z + 0.55}" material="color: ${STEEL}"></a-box>
        <a-box width="1.2" height="0.06" depth="1.2" position="-4.02 0.72 ${z}" material="color: #9aafc2"></a-box>
        <a-box width="1.2" height="0.06" depth="1.2" position="-4.02 1.55 ${z}" material="color: #9aafc2"></a-box>
        <a-box width="1.2" height="0.06" depth="1.2" position="-4.02 2.35 ${z}" material="color: #9aafc2"></a-box>
        <a-box width="0.46" height="0.32" depth="0.4" position="-4.22 0.94 ${z - 0.05}" material="color: ${index === 1 ? CRATE_LIGHT : CRATE}"></a-box>
        <a-box width="0.4" height="0.28" depth="0.34" position="-3.78 0.92 ${z + 0.12}" material="color: ${CRATE_DARK}"></a-box>
        <a-box width="0.5" height="0.26" depth="0.36" position="-4.05 1.74 ${z}" material="color: #b9925c"></a-box>
      `
    })
    .join('\n')
}

function exitDoor(exit: Hotspot3D, signUrl: string): string {
  // A canvas image, not <a-text>. A-Frame's text component fetches a font from a CDN.
  const sign = signUrl
    ? `<a-plane width="0.86" height="0.32" position="${exit.x} 2.62 ${exit.z - 0.26}" src="${signUrl}" material="shader: flat"></a-plane>`
    : `<a-box width="0.7" height="0.12" depth="0.02" position="${exit.x} 2.62 ${exit.z - 0.26}" material="color: ${TEAL}; emissive: ${TEAL}; emissiveIntensity: 0.5"></a-box>`
  return `
    <a-box width="1.7" height="2.7" depth="0.1" position="${exit.x} 1.35 ${exit.z - 0.48}" material="color: #0e2a22; roughness: 0.7"></a-box>
    <a-box width="1.28" height="2.15" depth="0.06" position="${exit.x} 1.22 ${exit.z - 0.4}" material="color: #1d7a52; roughness: 0.5"></a-box>
    <a-box width="0.08" height="2.15" depth="0.04" position="${exit.x - 0.58} 1.22 ${exit.z - 0.36}" material="color: #d7fff4"></a-box>
    <a-box width="0.08" height="2.15" depth="0.04" position="${exit.x + 0.58} 1.22 ${exit.z - 0.36}" material="color: #d7fff4"></a-box>
    <a-box width="1.9" height="0.08" depth="0.12" position="${exit.x} 0.08 ${exit.z - 0.32}" material="color: ${GOLD}"></a-box>
    <a-box width="0.96" height="0.36" depth="0.04" position="${exit.x} 2.62 ${exit.z - 0.3}" material="color: #04221c"></a-box>
    ${sign}
  `
}

function blockingBoxes(exit: Hotspot3D): string {
  const z = exit.z + 0.7
  return `
    ${blob(exit.x, z, 0.9)}
    <a-box width="0.72" height="0.48" depth="0.55" position="${exit.x - 0.38} 0.26 ${z}" material="color: ${CRATE}; roughness: 0.78"></a-box>
    <a-box width="0.64" height="0.42" depth="0.5" position="${exit.x + 0.32} 0.23 ${z + 0.12}" material="color: ${CRATE_DARK}; roughness: 0.78"></a-box>
    <a-box width="0.5" height="0.38" depth="0.42" position="${exit.x - 0.08} 0.68 ${z + 0.02}" rotation="0 12 8" material="color: ${CRATE_LIGHT}"></a-box>
    <a-box width="0.46" height="0.28" depth="0.4" position="${exit.x + 0.15} 0.22 ${z - 0.55}" rotation="0 20 78" material="color: #b9925c"></a-box>
    <a-box width="1.3" height="0.03" depth="0.08" position="${exit.x} 0.04 ${z - 0.85}" rotation="0 8 0" material="color: ${GOLD}"></a-box>
    <a-box width="1.3" height="0.03" depth="0.08" position="${exit.x} 0.04 ${z - 0.95}" rotation="0 8 0" material="color: #1a1a1a"></a-box>
  `
}

function puddle(spill: Hotspot3D): string {
  return `
    ${blob(spill.x, spill.z, 0.85)}
    <a-circle radius="0.7" rotation="-90 0 0" position="${spill.x} 0.025 ${spill.z}" material="color: #8fd4ea; opacity: 0.45; transparent: true; roughness: 0.08; metalness: 0.25"></a-circle>
    <a-circle radius="0.42" rotation="-90 0 0" position="${spill.x + 0.06} 0.03 ${spill.z - 0.04}" material="color: #e7fbff; opacity: 0.35; transparent: true; roughness: 0.04; metalness: 0.4"></a-circle>
    <a-ring radius-inner="0.68" radius-outer="0.8" rotation="-90 0 0" position="${spill.x} 0.028 ${spill.z}" material="shader: flat; color: #b7e7f5; opacity: 0.55; transparent: true"></a-ring>
    <a-entity position="${spill.x + 0.85} 0 ${spill.z + 0.15}" rotation="0 -28 0">
      <a-box width="0.025" height="0.62" depth="0.42" position="-0.14 0.32 0" rotation="0 0 16" material="color: ${GOLD}"></a-box>
      <a-box width="0.025" height="0.62" depth="0.42" position="0.14 0.32 0" rotation="0 0 -16" material="color: ${GOLD}"></a-box>
      ${wetFloorBoard()}
    </a-entity>
  `
}

function wetFloorBoard(): string {
  const url = wetFloorUrl()
  if (!url) {
    return `<a-box width="0.34" height="0.24" depth="0.02" position="0 0.46 0" material="color: #f6d98a"></a-box>`
  }
  return `<a-plane width="0.36" height="0.26" position="0 0.48 0" src="${url}" material="shader: flat"></a-plane>`
}

function wetFloorUrl(): string {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 180
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = '#f2c46d'
  ctx.fillRect(0, 0, 256, 180)
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 10
  ctx.strokeRect(8, 8, 240, 164)
  ctx.fillStyle = '#1a1a1a'
  ctx.font = '700 42px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('WET', 128, 62)
  ctx.fillText('FLOOR', 128, 114)
  return canvas.toDataURL('image/png')
}

function unstableStack(load: Hotspot3D): string {
  return `
    ${blob(load.x, load.z, 0.7)}
    <a-box width="0.95" height="0.08" depth="0.75" position="${load.x} 0.06 ${load.z}" material="color: #8d6236"></a-box>
    <a-box width="0.72" height="0.36" depth="0.55" position="${load.x - 0.04} 0.28 ${load.z}" material="color: ${CRATE}"></a-box>
    <a-box width="0.66" height="0.32" depth="0.5" position="${load.x + 0.06} 0.6 ${load.z + 0.04}" material="color: ${CRATE_DARK}"></a-box>
    <a-box width="0.58" height="0.3" depth="0.46" position="${load.x + 0.16} 0.9 ${load.z + 0.1}" rotation="0 10 16" material="color: ${CRATE_LIGHT}"></a-box>
  `
}

function forklift(truck: Hotspot3D): string {
  return `
    ${blob(truck.x, truck.z, 1.05)}
    <a-entity position="${truck.x} 0 ${truck.z}" rotation="0 48 0">
      <a-box width="0.78" height="0.42" depth="1.35" position="0 0.48 0" material="color: #16324c; roughness: 0.42; metalness: 0.18"></a-box>
      <a-box width="0.7" height="0.36" depth="0.5" position="0 0.86 -0.2" material="color: #1e4668"></a-box>
      <a-box width="0.46" height="0.22" depth="0.04" position="0 0.9 0.08" material="color: #b7e4f2; opacity: 0.7; transparent: true"></a-box>
      <a-box width="0.7" height="0.1" depth="0.16" position="0 0.58 -0.72" material="color: ${GOLD}"></a-box>
      <a-box width="0.7" height="0.06" depth="0.08" position="0 0.66 -0.72" material="color: #111820"></a-box>
      <a-box width="0.08" height="0.85" depth="0.08" position="-0.24 0.78 0.62" material="color: ${TEAL}"></a-box>
      <a-box width="0.08" height="0.85" depth="0.08" position="0.24 0.78 0.62" material="color: ${TEAL}"></a-box>
      <a-box width="0.62" height="0.06" depth="0.08" position="0 1.18 0.62" material="color: #d7dee8"></a-box>
      <a-box width="0.08" height="0.7" depth="0.08" position="-0.28 1.05 -0.15" material="color: #101820"></a-box>
      <a-box width="0.08" height="0.7" depth="0.08" position="0.28 1.05 -0.15" material="color: #101820"></a-box>
      <a-box width="0.08" height="0.7" depth="0.08" position="-0.28 1.05 0.35" material="color: #101820"></a-box>
      <a-box width="0.08" height="0.7" depth="0.08" position="0.28 1.05 0.35" material="color: #101820"></a-box>
      <a-box width="0.7" height="0.05" depth="0.58" position="0 1.38 0.1" material="color: #101820"></a-box>
      <a-box width="0.1" height="0.04" depth="0.85" position="-0.18 0.22 0.95" material="color: #d5dde6"></a-box>
      <a-box width="0.1" height="0.04" depth="0.85" position="0.18 0.22 0.95" material="color: #d5dde6"></a-box>
      ${wheel('-0.34 0.16 0.38')}
      ${wheel('0.34 0.16 0.38')}
      ${wheel('-0.34 0.16 -0.42')}
      ${wheel('0.34 0.16 -0.42')}
    </a-entity>
  `
}

function wheel(position: string): string {
  return `<a-cylinder radius="0.16" height="0.1" position="${position}" rotation="0 0 90" material="color: #141414"></a-cylinder>`
}

function mountedExtinguisher(spot: Hotspot3D): string {
  return `
    <a-box width="0.08" height="0.78" depth="0.4" position="${spot.x - 0.14} ${spot.y} ${spot.z}" material="color: #102033"></a-box>
    <a-cylinder radius="0.11" height="0.52" position="${spot.x} ${spot.y} ${spot.z}" material="color: #e15b55"></a-cylinder>
    <a-cylinder radius="0.045" height="0.1" position="${spot.x} ${spot.y + 0.3} ${spot.z}" material="color: #243140"></a-cylinder>
    <a-box width="0.16" height="0.06" depth="0.02" position="${spot.x} ${spot.y + 0.02} ${spot.z + 0.1}" material="color: #f4f7fb"></a-box>
    <a-torus radius="0.07" radius-tubular="0.015" position="${spot.x + 0.02} ${spot.y - 0.05} ${spot.z + 0.1}" rotation="0 0 80" material="color: #1a1a1a"></a-torus>
  `
}

function tidyStack(aisle: Hotspot3D): string {
  return `
    ${blob(aisle.x, aisle.z, 0.55)}
    <a-box width="0.85" height="0.08" depth="0.7" position="${aisle.x} 0.06 ${aisle.z}" material="color: #8d6236"></a-box>
    <a-box width="0.62" height="0.32" depth="0.48" position="${aisle.x} 0.26 ${aisle.z}" material="color: ${CRATE_LIGHT}"></a-box>
    <a-box width="0.62" height="0.32" depth="0.48" position="${aisle.x} 0.58 ${aisle.z}" material="color: ${CRATE}"></a-box>
  `
}

function workbench(): string {
  return `
    ${blob(4.3, 2.35, 0.7)}
    <a-box width="1.45" height="0.08" depth="0.62" position="4.3 0.92 2.4" material="color: #6d4a28"></a-box>
    <a-box width="0.08" height="0.88" depth="0.08" position="3.68 0.46 2.16" material="color: #4a3420"></a-box>
    <a-box width="0.08" height="0.88" depth="0.08" position="4.92 0.46 2.16" material="color: #4a3420"></a-box>
    <a-box width="0.08" height="0.88" depth="0.08" position="3.68 0.46 2.64" material="color: #4a3420"></a-box>
    <a-box width="0.08" height="0.88" depth="0.08" position="4.92 0.46 2.64" material="color: #4a3420"></a-box>
  `
}

function hotspot(spot: Spot, reducedMotion: boolean, checkUrl: string): string {
  const number = SCENE_MARKERS.findIndex((marker) => marker.id === spot.id) + 1
  const badgeUrl = paintBadge(String(number > 0 ? number : 1), GOLD, '#102033')
  const pulse = reducedMotion
    ? ''
    : ' animation="property: scale; from: 1 1 1; to: 1.08 1 1.08; dir: alternate; loop: true; dur: 1800; easing: easeInOutSine"'
  // The ring sits on the floor at the shared x/z. y from the scenario is the prop, not the ring.
  return `
    <a-entity data-hotspot="${spot.id}" data-kind="${spot.kind}" data-badge="${badgeUrl}" data-check="${checkUrl}" position="${spot.hotspot.x} 0 ${spot.hotspot.z}">
      <a-ring class="marker-glow hotspot" radius-inner="0.34" radius-outer="0.5" rotation="-90 0 0" position="0 0.03 0" material="shader: flat; color: ${GOLD}; opacity: 0.28; transparent: true"></a-ring>
      <a-ring class="marker-ring hotspot" radius-inner="0.28" radius-outer="0.36" rotation="-90 0 0" position="0 0.04 0" material="shader: flat; color: ${GOLD}"${pulse}></a-ring>
      <a-entity class="marker-badge" position="0 1.05 0" face-camera>
        <a-plane class="badge-face hotspot" width="0.38" height="0.38" src="${badgeUrl}" material="shader: flat; transparent: true; depthTest: false"></a-plane>
      </a-entity>
    </a-entity>
  `
}

const badgeCache = new Map<string, string>()

function paintBadge(label: string, fill: string, ink: string): string {
  const key = `${label}|${fill}`
  const cached = badgeCache.get(key)
  if (cached !== undefined) return cached
  const url = drawBadge(label, fill, ink)
  badgeCache.set(key, url)
  return url
}

/** Local canvas, so the numbers do not need a font download. */
function drawBadge(label: string, fill: string, ink: string): string {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = 160
  canvas.height = 160
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.clearRect(0, 0, 160, 160)
  ctx.beginPath()
  ctx.arc(80, 80, 68, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = '#102033'
  ctx.stroke()
  ctx.fillStyle = ink
  ctx.strokeStyle = ink
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (label === 'check') {
    ctx.lineWidth = 14
    ctx.beginPath()
    ctx.moveTo(48, 84)
    ctx.lineTo(70, 106)
    ctx.lineTo(114, 54)
    ctx.stroke()
  } else {
    ctx.font = '700 78px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 80, 86)
  }
  return canvas.toDataURL('image/png')
}

/** Painted locally so the door reads as an exit without a network font. */
function exitSignUrl(): string {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 120
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = '#06352c'
  ctx.fillRect(0, 0, 320, 120)
  ctx.strokeStyle = TEAL
  ctx.lineWidth = 8
  ctx.strokeRect(8, 8, 304, 104)
  ctx.fillStyle = '#e7fff8'
  ctx.font = '700 68px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('EXIT', 160, 64)
  return canvas.toDataURL('image/png')
}
