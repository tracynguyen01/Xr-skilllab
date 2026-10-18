import type { Hotspot3D } from '../domain/types'

type Spot = { id: string; kind: 'hazard' | 'decoy'; hotspot: Hotspot3D }

/**
 * Low-poly warehouse built from A-Frame primitives.
 * Hazard and decoy positions come from the shared scenario data.
 * The room itself is fixed scenery around those points.
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

  return `
    <a-entity light="type: ambient; color: #b7c9dc; intensity: 0.72"></a-entity>
    <a-entity light="type: directional; color: #f7fbff; intensity: 0.9" position="-3 8 4"></a-entity>
    <a-entity light="type: point; color: #42ddc5; intensity: 0.7; distance: 10" position="${exit.x} 2.8 ${exit.z + 1}"></a-entity>
    <a-entity light="type: point; color: #f2c46d; intensity: 0.4; distance: 8" position="0 3.2 0.5"></a-entity>

    <a-box width="12.4" height="0.12" depth="10.4" position="0 -0.06 -1" material="color: #1b2b3f; roughness: 0.92"></a-box>
    <a-box width="1.5" height="0.025" depth="8.4" position="0.85 0.01 -0.5" material="color: #24384f; roughness: 0.8"></a-box>
    <a-box width="0.05" height="0.03" depth="8.4" position="0.12 0.02 -0.5" material="color: #f2c46d; roughness: 0.6"></a-box>
    <a-box width="0.05" height="0.03" depth="8.4" position="1.58 0.02 -0.5" material="color: #f2c46d; roughness: 0.6"></a-box>
    ${dashLine()}

    <a-box width="12.4" height="3.7" depth="0.16" position="0 1.85 -6.05" material="color: #121c2c; roughness: 0.9"></a-box>
    <a-box width="0.16" height="3.7" depth="10.4" position="-6.05 1.85 -1" material="color: #152233; roughness: 0.9"></a-box>
    <a-box width="0.16" height="3.7" depth="10.4" position="6.05 1.85 -1" material="color: #152233; roughness: 0.9"></a-box>
    <a-box width="12.4" height="1.1" depth="0.16" position="0 3.15 4.05" material="color: #121c2c"></a-box>
    <a-box width="12.4" height="0.12" depth="10.4" position="0 3.7 -1" material="color: #0d1624"></a-box>
    ${lamp(-2.2, -2)}
    ${lamp(1.6, 0.4)}
    ${lamp(3.4, -3.6)}

    ${racks()}
    ${exitDoor(exit, exitSignUrl())}
    ${blockingBoxes(exit)}
    ${puddle(spill)}
    ${unstableStack(load)}
    ${forklift(truck)}
    ${mountedExtinguisher(extinguisher)}
    ${tidyStack(aisle)}
    ${workbench()}

    ${spots.map((spot) => hotspot(spot, reducedMotion)).join('\n')}
  `
}

function dashLine(): string {
  return [-3.2, -1.6, 0, 1.6, 3.2]
    .map(
      (z) =>
        `<a-box width="0.28" height="0.03" depth="0.08" position="0.85 0.025 ${z}" material="color: #f2c46d; roughness: 0.5"></a-box>`,
    )
    .join('\n')
}

function lamp(x: number, z: number): string {
  return `<a-box width="1.1" height="0.05" depth="0.28" position="${x} 3.58 ${z}" material="color: #e7eef8; emissive: #d5e4f5; emissiveIntensity: 0.85"></a-box>`
}

function racks(): string {
  const bays = [-4.2, -2.6, -1]
  return bays
    .map((z) => {
      return `
        <a-box width="0.08" height="2.6" depth="0.08" position="-4.55 1.3 ${z - 0.55}" material="color: #8ea3b8"></a-box>
        <a-box width="0.08" height="2.6" depth="0.08" position="-4.55 1.3 ${z + 0.55}" material="color: #8ea3b8"></a-box>
        <a-box width="0.08" height="2.6" depth="0.08" position="-3.55 1.3 ${z - 0.55}" material="color: #8ea3b8"></a-box>
        <a-box width="0.08" height="2.6" depth="0.08" position="-3.55 1.3 ${z + 0.55}" material="color: #8ea3b8"></a-box>
        <a-box width="1.15" height="0.06" depth="1.2" position="-4.05 0.7 ${z}" material="color: #9aafc2"></a-box>
        <a-box width="1.15" height="0.06" depth="1.2" position="-4.05 1.55 ${z}" material="color: #9aafc2"></a-box>
        <a-box width="0.42" height="0.28" depth="0.36" position="-4.2 0.88 ${z}" material="color: #c9a36b; roughness: 0.75"></a-box>
        <a-box width="0.36" height="0.24" depth="0.32" position="-3.85 0.86 ${z + 0.15}" material="color: #b9925c; roughness: 0.75"></a-box>
      `
    })
    .join('\n')
}

function exitDoor(exit: Hotspot3D, signUrl: string): string {
  // A canvas image, not <a-text>. A-Frame's text component fetches a font from a CDN.
  const sign = signUrl
    ? `<a-plane width="0.78" height="0.3" position="${exit.x} 2.55 ${exit.z - 0.28}" src="${signUrl}" material="shader: flat"></a-plane>`
    : `<a-box width="0.62" height="0.08" depth="0.02" position="${exit.x} 2.55 ${exit.z - 0.28}" material="color: #42ddc5; emissive: #42ddc5; emissiveIntensity: 0.4"></a-box>`
  return `
    <a-box width="1.55" height="2.45" depth="0.08" position="${exit.x} 1.22 ${exit.z - 0.45}" material="color: #0e2a22; roughness: 0.7"></a-box>
    <a-box width="1.25" height="2.05" depth="0.05" position="${exit.x} 1.18 ${exit.z - 0.39}" material="color: #1d7a52; roughness: 0.55"></a-box>
    <a-box width="1.7" height="0.08" depth="0.1" position="${exit.x} 0.12 ${exit.z - 0.35}" material="color: #f2c46d"></a-box>
    <a-box width="0.86" height="0.32" depth="0.04" position="${exit.x} 2.55 ${exit.z - 0.32}" material="color: #04221c"></a-box>
    ${sign}
  `
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
  ctx.strokeStyle = '#42ddc5'
  ctx.lineWidth = 8
  ctx.strokeRect(8, 8, 304, 104)
  ctx.fillStyle = '#e7fff8'
  ctx.font = '700 68px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('EXIT', 160, 64)
  return canvas.toDataURL('image/png')
}

function blockingBoxes(exit: Hotspot3D): string {
  const z = exit.z + 0.55
  return `
    <a-box width="0.7" height="0.55" depth="0.55" position="${exit.x - 0.35} 0.28 ${z}" material="color: #c9a36b; roughness: 0.78"></a-box>
    <a-box width="0.62" height="0.48" depth="0.5" position="${exit.x + 0.28} 0.24 ${z + 0.15}" material="color: #a67c45; roughness: 0.78"></a-box>
    <a-box width="0.5" height="0.4" depth="0.42" position="${exit.x - 0.05} 0.75 ${z + 0.05}" material="color: #d7b98a; roughness: 0.78"></a-box>
  `
}

function puddle(spill: Hotspot3D): string {
  return `
    <a-circle radius="0.55" rotation="-90 0 0" position="${spill.x} 0.02 ${spill.z}" material="shader: flat; color: #2f6f8c; opacity: 0.9"></a-circle>
    <a-ring radius-inner="0.55" radius-outer="0.72" rotation="-90 0 0" position="${spill.x} 0.025 ${spill.z}" material="shader: flat; color: #7ec8e3; opacity: 0.8"></a-ring>
  `
}

function unstableStack(load: Hotspot3D): string {
  return `
    <a-circle radius="0.7" rotation="-90 0 0" position="${load.x} 0.02 ${load.z}" material="shader: flat; color: #070e18; opacity: 0.4"></a-circle>
    <a-box width="0.95" height="0.1" depth="0.75" position="${load.x} 0.08 ${load.z}" material="color: #8d6236"></a-box>
    <a-box width="0.7" height="0.42" depth="0.55" position="${load.x - 0.02} 0.34 ${load.z}" material="color: #c9a36b"></a-box>
    <a-box width="0.62" height="0.36" depth="0.5" position="${load.x + 0.12} 0.7 ${load.z + 0.08}" rotation="0 8 14" material="color: #b9925c"></a-box>
  `
}

function forklift(truck: Hotspot3D): string {
  return `
    <a-circle radius="0.95" rotation="-90 0 0" position="${truck.x} 0.02 ${truck.z}" material="shader: flat; color: #070e18; opacity: 0.4"></a-circle>
    <a-entity position="${truck.x} 0 ${truck.z}" rotation="0 55 0">
      <a-box width="0.7" height="0.38" depth="1.25" position="0 0.42 0" material="color: #17324a; roughness: 0.45; metalness: 0.15"></a-box>
      <a-box width="0.62" height="0.42" depth="0.48" position="0 0.82 -0.15" material="color: #1e4060"></a-box>
      <a-box width="0.5" height="0.28" depth="0.06" position="0 0.84 0.12" material="color: #9fd8ea; opacity: 0.55"></a-box>
      <a-box width="0.08" height="0.7" depth="0.08" position="-0.22 0.7 0.55" material="color: #42ddc5"></a-box>
      <a-box width="0.08" height="0.7" depth="0.08" position="0.22 0.7 0.55" material="color: #42ddc5"></a-box>
      <a-box width="0.1" height="0.04" depth="0.7" position="-0.22 0.32 0.9" material="color: #d7dee8"></a-box>
      <a-box width="0.1" height="0.04" depth="0.7" position="0.22 0.32 0.9" material="color: #d7dee8"></a-box>
      <a-box width="0.72" height="0.08" depth="0.12" position="0 0.5 -0.62" material="color: #f2c46d"></a-box>
      <a-cylinder radius="0.16" height="0.12" position="-0.32 0.16 0.35" rotation="0 0 90" material="color: #101820"></a-cylinder>
      <a-cylinder radius="0.16" height="0.12" position="0.32 0.16 0.35" rotation="0 0 90" material="color: #101820"></a-cylinder>
      <a-cylinder radius="0.16" height="0.12" position="-0.32 0.16 -0.4" rotation="0 0 90" material="color: #101820"></a-cylinder>
      <a-cylinder radius="0.16" height="0.12" position="0.32 0.16 -0.4" rotation="0 0 90" material="color: #101820"></a-cylinder>
    </a-entity>
  `
}

function mountedExtinguisher(spot: Hotspot3D): string {
  return `
    <a-box width="0.08" height="0.7" depth="0.36" position="${spot.x - 0.12} ${spot.y} ${spot.z}" material="color: #102033"></a-box>
    <a-cylinder radius="0.1" height="0.48" position="${spot.x} ${spot.y} ${spot.z}" material="color: #e15b55"></a-cylinder>
    <a-cylinder radius="0.04" height="0.1" position="${spot.x} ${spot.y + 0.28} ${spot.z}" material="color: #243140"></a-cylinder>
  `
}

function tidyStack(aisle: Hotspot3D): string {
  return `
    <a-box width="0.85" height="0.1" depth="0.7" position="${aisle.x} 0.08 ${aisle.z}" material="color: #8d6236"></a-box>
    <a-box width="0.62" height="0.36" depth="0.48" position="${aisle.x} 0.32 ${aisle.z}" material="color: #d7b98a"></a-box>
    <a-box width="0.62" height="0.36" depth="0.48" position="${aisle.x} 0.68 ${aisle.z}" material="color: #c9a36b"></a-box>
  `
}

function workbench(): string {
  return `
    <a-box width="1.4" height="0.08" depth="0.6" position="4.3 0.9 2.4" material="color: #6d4a28"></a-box>
    <a-box width="0.08" height="0.85" depth="0.08" position="3.7 0.45 2.15" material="color: #4a3420"></a-box>
    <a-box width="0.08" height="0.85" depth="0.08" position="4.9 0.45 2.15" material="color: #4a3420"></a-box>
    <a-box width="0.08" height="0.85" depth="0.08" position="3.7 0.45 2.65" material="color: #4a3420"></a-box>
    <a-box width="0.08" height="0.85" depth="0.08" position="4.9 0.45 2.65" material="color: #4a3420"></a-box>
  `
}

function hotspot(spot: Spot, reducedMotion: boolean): string {
  const y = spot.hotspot.y + 0.65
  const color = spot.kind === 'hazard' ? '#F2C46D' : '#D5E4F2'
  const motion = reducedMotion
    ? ''
    : ' animation="property: scale; from: 1 1 1; to: 1.12 1.12 1.12; dir: alternate; loop: true; dur: 1700; easing: easeInOutSine"'
  return `
    <a-entity data-hotspot="${spot.id}" data-kind="${spot.kind}" position="${spot.hotspot.x} ${y} ${spot.hotspot.z}">
      <a-torus class="hotspot" radius="0.22" radius-tubular="0.025" rotation="90 0 0" color="${color}" material="color: ${color}; emissive: ${color}; emissiveIntensity: 0.35"${motion}></a-torus>
      <a-ring class="hotspot" radius-inner="0.12" radius-outer="0.2" color="${color}" material="shader: flat; color: ${color}"></a-ring>
    </a-entity>
  `
}
