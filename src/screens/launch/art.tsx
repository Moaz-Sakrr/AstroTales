// Static pictures for the Launch screen. Nothing in here animates on its own: Launch moves the wrappers
// (transform/opacity only), so the browser paints each picture once and the GPU slides it around.
import type { CSSProperties } from 'react'

const CLOUD = 'M14 80 A22 22 0 0 1 28 42 A30 30 0 0 1 80 22 A36 36 0 0 1 142 30 A28 28 0 0 1 184 64 A10 10 0 0 1 186 80Z'
const TREES = `M0 30 V20${Array.from({ length: 20 }, (_, i) => ` Q${i * 20 + 10} ${6 + ((i * 7) % 9)} ${i * 20 + 20} 20`).join('')} V30Z`

// soft round smoke ball with a highlight, drawn by gradients so it needs no blur filter
export const PUFF =
  'radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.9), transparent 30%), radial-gradient(closest-side, #FFFFFF 0%, #EFE9E1 45%, #D6CDC2 80%, rgb(214 205 194 / 0) 100%)'

// flat postcard cloud: a pale-blue underside peeking out below the white
export function Cloud({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 84" className={className} style={style} aria-hidden="true">
      <path d={CLOUD} fill="#D3E1F4" />
      <path d={CLOUD} fill="#fff" transform="translate(0 -6)" />
    </svg>
  )
}

export function Ground() {
  return (
    <svg viewBox="0 0 1000 140" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <path d="M0 8 C250 0 750 0 1000 8 V140 H0Z" fill="#2E5A4A" />
      <path d="M0 44 C300 34 700 34 1000 44 V140 H0Z" fill="#24473C" />
      <path d="M0 8 C250 0 750 0 1000 8" stroke="#5B9A76" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function Treeline() {
  return (
    <svg viewBox="0 0 400 30" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <path d={TREES} fill="#2F5D50" />
    </svg>
  )
}

// launch tower: lattice with an orange-red top and an antenna (the beacon light is a div in Launch)
export function Tower() {
  const bays = Array.from({ length: 14 }, (_, i) => 10 + i * 14)
  return (
    <svg viewBox="0 0 42 215" className="h-full w-full overflow-visible" aria-hidden="true">
      <line x1="21" y1="4" x2="21" y2="-16" stroke="#8A90A6" strokeWidth="1.5" />
      <g stroke="#8A90A6" strokeWidth="1.4">
        {bays.map((y) => (
          <g key={y} stroke={y < 52 ? '#D9573F' : undefined}>
            <line x1="5" y1={y} x2="37" y2={y} />
            <line x1="7" y1={y} x2="35" y2={y + 14} />
            <line x1="35" y1={y} x2="7" y2={y + 14} />
          </g>
        ))}
      </g>
      <rect x="3" y="8" width="4" height="207" fill="#8A90A6" />
      <rect x="35" y="8" width="4" height="207" fill="#8A90A6" />
      <rect x="0" y="2" width="42" height="7" rx="1.5" fill="#D9573F" />
      <rect x="-3" y="209" width="48" height="6" fill="#5D6378" />
    </svg>
  )
}

// engine flame with shock diamonds down the middle; the top edge sits on the nozzles
export function Plume() {
  return (
    <svg viewBox="0 0 100 260" className="block w-full" aria-hidden="true">
      <path d="M12 0 C2 70 30 180 50 260 C70 180 98 70 88 0Z" fill="#FF7A3D" opacity="0.85" />
      <path d="M24 0 C18 56 38 150 50 205 C62 150 82 56 76 0Z" fill="#FFB347" />
      <path d="M35 0 C33 40 44 104 50 145 C56 104 67 40 65 0Z" fill="#FFF3B0" />
      {[26, 58, 90].map((y, i) => {
        const w = 7 - i * 1.5
        return <path key={y} d={`M50 ${y} l${w} 12 l-${w} 12 l-${w} -12Z`} fill="#fff" opacity="0.9" />
      })}
    </svg>
  )
}

// white shroud of condensed air that flashes round a rocket as it nears the speed of sound
export function VaporCone() {
  return (
    <svg viewBox="0 0 200 80" className="block w-full" aria-hidden="true">
      <defs>
        <linearGradient id="vapor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d="M100 0 C70 6 26 40 0 80 Q100 62 200 80 C174 40 130 6 100 0Z" fill="url(#vapor)" />
    </svg>
  )
}

// the top of a huge Earth, so only its curved horizon shows at the bottom of the screen
export function Earth() {
  return (
    <div
      className="absolute left-1/2 aspect-square w-(--d) -translate-x-1/2 overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_0%,#79B8FF_0%,#2F6FDB_22%,#1B4BA8_45%,#0B1D3A_75%)] shadow-[0_0_0_2px_rgb(170_225_255/0.8),0_0_24px_10px_rgb(90_170_255/0.55),0_0_80px_36px_rgb(47_111_219/0.3)]"
      style={{ '--d': 'max(260vw, 170svh)', bottom: 'calc(26svh - var(--d))' } as CSSProperties}
    >
      <svg viewBox="0 0 400 100" preserveAspectRatio="xMidYMin slice" className="absolute left-1/2 top-0 h-[26svh] w-[max(100vw,60svh)] -translate-x-1/2" aria-hidden="true">
        <path d="M60 30 C80 10 130 14 150 30 C170 44 140 60 110 56 C90 70 50 60 60 30Z" fill="#5FAE6E" />
        <path d="M250 18 C280 6 330 12 340 30 C350 50 300 70 270 52 C240 44 230 28 250 18Z" fill="#5FAE6E" />
        <path d="M285 22 C300 18 318 24 316 34 C306 40 290 36 285 22Z" fill="#E7C98A" />
        <g stroke="#fff" strokeLinecap="round" fill="none" opacity="0.7">
          <path d="M20 70 C80 60 120 80 190 66" strokeWidth="6" />
          <path d="M210 84 C260 74 300 92 380 76" strokeWidth="5" />
          <path d="M170 24 C190 18 210 22 226 16" strokeWidth="3" />
        </g>
      </svg>
    </div>
  )
}
