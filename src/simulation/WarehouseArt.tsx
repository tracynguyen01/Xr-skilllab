import { SCENE_MARKERS, type MarkerId } from './sceneObjects'

const VB_W = 1000
const VB_H = 640

function anchor(id: MarkerId): { x: number; y: number } {
  const marker = SCENE_MARKERS.find((item) => item.id === id)
  if (!marker) throw new Error(`Missing scene marker: ${id}`)
  return { x: (marker.x / 100) * VB_W, y: (marker.y / 100) * VB_H }
}

type CrateProps = {
  x: number
  y: number
  w: number
  h: number
  d?: number
  fill?: string
  top?: string
  side?: string
  tilt?: number
}

function Crate({ x, y, w, h, d = 12, fill = '#c9a36b', top = '#e4c89a', side = '#9a7544', tilt = 0 }: CrateProps) {
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g transform={tilt === 0 ? undefined : `rotate(${tilt} ${cx} ${cy})`}>
      <polygon points={`${x},${y} ${x + d},${y - d} ${x + w + d},${y - d} ${x + w},${y}`} fill={top} />
      <rect x={x} y={y} width={w} height={h} rx="3" fill={fill} />
      <polygon
        points={`${x + w},${y} ${x + w + d},${y - d} ${x + w + d},${y + h - d} ${x + w},${y + h}`}
        fill={side}
      />
      <rect x={x + 7} y={y + h * 0.46} width={w - 14} height="3" fill="rgba(40, 24, 8, 0.25)" />
    </g>
  )
}

function Pallet({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="8" rx="1" fill="#8d6236" />
      <rect x={x + 4} y={y + 8} width="8" height="7" fill="#6d4a28" />
      <rect x={x + w / 2 - 4} y={y + 8} width="8" height="7" fill="#6d4a28" />
      <rect x={x + w - 12} y={y + 8} width="8" height="7" fill="#6d4a28" />
    </g>
  )
}

/**
 * Illustrated warehouse drawn in code. Marker positions in sceneObjects.ts
 * are the anchors, so the picture and the buttons stay aligned.
 * Decorative only: the parent supplies the accessible buttons.
 */
export function WarehouseArt() {
  const exit = anchor('blocked-exit')
  const spill = anchor('floor-spill')
  const load = anchor('unstable-load')
  const truck = anchor('forklift-crossing')
  const extinguisher = anchor('secured-extinguisher')
  const aisle = anchor('clear-aisle')

  return (
    <svg className="warehouse-art" viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#243e58" />
          <stop offset="100%" stopColor="#15283c" />
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3348" />
          <stop offset="100%" stopColor="#0e1c2c" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#42ddc5" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#84bfff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#0b1220" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2c46d" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f2c46d" stopOpacity="0.08" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      <rect width={VB_W} height={VB_H} fill="#08111c" />
      <rect width={VB_W} height={VB_H} fill="url(#glow)" />

      <g filter="url(#softShadow)">
        <polygon points="48,248 952,248 1000,608 0,608" fill="url(#floorGrad)" />
        <polygon points="78,86 922,86 952,248 48,248" fill="url(#wallGrad)" />
      </g>

      <g opacity="0.45" stroke="#2b3d55" strokeWidth="1">
        {Array.from({ length: 8 }, (_, index) => {
          const y = 280 + index * 40
          return <line key={y} x1={20 + index * 8} y1={y} x2={980 - index * 8} y2={y} />
        })}
      </g>

      {/* Pedestrian route. It runs toward the exit and is crossed by the forklift. */}
      <polygon points="610,268 830,268 760,590 430,590" fill="url(#pathGrad)" stroke="#f2c46d" strokeOpacity="0.7" />
      <line x1="720" y1="280" x2="600" y2="575" stroke="#f2c46d" strokeWidth="3" strokeDasharray="10 12" opacity="0.8" />

      {/* Delivery door, scenery only. */}
      <g>
        <rect x="800" y="108" width="92" height="132" rx="4" fill="#101c2b" stroke="#314862" />
        {Array.from({ length: 6 }, (_, index) => (
          <line key={index} x1="808" y1={124 + index * 18} x2="884" y2={124 + index * 18} stroke="#314862" />
        ))}
        <rect x="800" y="228" width="92" height="10" fill="#f2c46d" />
        <rect x="800" y="236" width="92" height="6" fill="#1b2430" />
      </g>

      {/* Racking along the left wall. */}
      <g>
        {[150, 230, 310].map((x) => (
          <rect key={x} x={x} y="128" width="8" height="200" rx="2" fill="#7f93a8" />
        ))}
        <rect x="150" y="168" width="168" height="6" fill="#9aafc2" />
        <rect x="150" y="230" width="168" height="6" fill="#9aafc2" />
        <Crate x={164} y={136} w={40} h={28} fill="#b9925c" />
        <Crate x={214} y={138} w={36} h={26} fill="#c9a36b" />
        <Crate x={168} y={198} w={44} h={28} fill="#c9a36b" />
      </g>

      {/* Mounted extinguisher. */}
      <g transform={`translate(${extinguisher.x} ${extinguisher.y})`}>
        <rect x="-22" y="-8" width="44" height="70" rx="4" fill="#102033" opacity="0.65" />
        <rect x="-18" y="-34" width="36" height="8" rx="2" fill="#9aafc2" />
        <rect x="-13" y="-28" width="26" height="54" rx="8" fill="#e15b55" />
        <rect x="-7" y="-42" width="14" height="14" rx="3" fill="#243140" />
        <path d="M8 -38 C 24 -36 24 -8 10 -4" fill="none" stroke="#243140" strokeWidth="3" />
        <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#f6d4d2" />
      </g>

      {/* Exit door. */}
      <g transform={`translate(${exit.x} ${exit.y})`}>
        <rect x="-50" y="-78" width="100" height="148" rx="4" fill="#0c1f17" />
        <rect x="-40" y="-66" width="80" height="128" rx="3" fill="#1d7a52" />
        <rect x="-16" y="-20" width="32" height="46" rx="2" fill="#d9f3e8" opacity="0.28" />
        <circle cx="24" cy="6" r="4" fill="#d7efe4" />
        <rect x="-40" y="-118" width="80" height="28" rx="4" fill="#10281e" stroke="#42ddc5" strokeWidth="2" />
        <text x="0" y="-99" textAnchor="middle" fill="#f5f8fc" fontSize="16" fontFamily="ui-sans-serif, system-ui" fontWeight="700">
          EXIT
        </text>
      </g>

      {/* Floor stencil, partly covered by the boxes below. */}
      <text
        x={exit.x}
        y={exit.y + 132}
        textAnchor="middle"
        fill="#f2c46d"
        opacity="0.55"
        fontSize="14"
        letterSpacing="3"
        fontFamily="ui-sans-serif, system-ui"
      >
        KEEP CLEAR
      </text>

      <Pallet x={exit.x - 78} y={exit.y + 108} w={150} />
      <Crate x={exit.x - 72} y={exit.y + 68} w={52} h={38} />
      <Crate x={exit.x - 16} y={exit.y + 58} w={56} h={46} fill="#d2ad74" />
      <Crate x={exit.x + 28} y={exit.y + 74} w={46} h={34} />

      {/* Tidy decoy stack, centred on its marker. */}
      <Pallet x={aisle.x - 54} y={aisle.y + 28} w={108} />
      <Crate x={aisle.x - 48} y={aisle.y - 6} w={46} h={32} />
      <Crate x={aisle.x + 2} y={aisle.y - 6} w={46} h={32} />
      <Crate x={aisle.x - 42} y={aisle.y - 42} w={42} h={30} />
      <Crate x={aisle.x + 4} y={aisle.y - 42} w={42} h={30} />

      {/* Unstable stack. The tilted crate sits on the marker, not below it. */}
      <Pallet x={load.x - 48} y={load.y + 34} w={104} />
      <Crate x={load.x - 42} y={load.y + 2} w={56} h={32} fill="#c9a36b" />
      <Crate x={load.x - 16} y={load.y - 36} w={64} h={34} fill="#d08a62" top="#e7b08a" side="#a86442" tilt={-14} />

      {/* Spill and a cone that is not standing up. */}
      <ellipse cx={spill.x} cy={spill.y} rx="54" ry="20" fill="#17675f" />
      <ellipse cx={spill.x - 8} cy={spill.y - 3} rx="30" ry="10" fill="#7ee0d2" opacity="0.72" />
      <ellipse cx={spill.x + 14} cy={spill.y + 2} rx="12" ry="4" fill="#f3fffc" opacity="0.8" />
      <g transform={`translate(${spill.x + 46} ${spill.y - 6}) rotate(72)`}>
        <polygon points="0,-18 11,12 -11,12" fill="#f2c46d" />
        <rect x="-12" y="10" width="24" height="6" rx="1" fill="#243140" />
        <rect x="-8" y="-6" width="16" height="4" fill="#243140" opacity="0.35" />
      </g>

      {/* Forklift intruding on the walkway. */}
      <g transform={`translate(${truck.x} ${truck.y})`}>
        <ellipse cx="6" cy="36" rx="70" ry="12" fill="rgba(0,0,0,0.28)" />
        <rect x="-92" y="6" width="52" height="6" rx="1" fill="#b7c6d4" />
        <rect x="-92" y="18" width="52" height="6" rx="1" fill="#8ea4bb" />
        <rect x="-42" y="-40" width="8" height="70" rx="2" fill="#5c7084" />
        <rect x="-34" y="-34" width="6" height="58" fill="#9aafc2" />
        <rect x="-24" y="-10" width="86" height="40" rx="7" fill="#e2b143" />
        <path d="M18 -10 h40 v-22 h-28 q-12 0 -12 12z" fill="#2a3340" />
        <rect x="28" y="-28" width="24" height="14" rx="2" fill="#b7e4f5" />
        <circle cx="-6" cy="32" r="10" fill="#1b212b" />
        <circle cx="48" cy="32" r="10" fill="#1b212b" />
        <circle cx="-6" cy="32" r="3.5" fill="#9aafc2" />
        <circle cx="48" cy="32" r="3.5" fill="#9aafc2" />
      </g>

      <g opacity="0.9">
        <rect x="250" y="96" width="70" height="8" rx="3" fill="#d7e6f4" opacity="0.35" />
        <rect x="560" y="96" width="70" height="8" rx="3" fill="#d7e6f4" opacity="0.35" />
      </g>
    </svg>
  )
}
