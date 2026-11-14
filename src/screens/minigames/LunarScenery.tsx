import { memo } from 'react'

// Static art for "Land the Eagle": sky, Earth, far hills, the ground with craters, and the Eagle itself.
// Everything is drawn once; only the lander, flame, shadow and dust move (in LunarLander).

export type Pt = [number, number]
export type World = {
  W: number
  H: number
  top: number // first row of sky not covered by the HUD
  pts: Pt[] // the ridge you can land on
  pad: { x0: number; x1: number; y: number }
  boulders: { x: number; y: number; r: number }[]
  far: Pt[]
  near: Pt[]
  wide: boolean
}

// cheap deterministic "random" so the scene looks hand-placed but never changes between renders
export const rnd = (i: number, k = 0) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453
  return v - Math.floor(v)
}

export function heightAt(pts: Pt[], x: number) {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    if (x <= x1) return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
  }
  return pts[pts.length - 1][1]
}

// Craggy terrain with a boulder field and one flat landing spot. Same layout every time.
// Phones keep the pad left of the Thrust button; wide screens keep it between the two control groups.
export function makeWorld(W: number, H: number, top: number, groundY: number, wide: boolean): World {
  const x0 = Math.round(W * (wide ? 0.56 : 0.58))
  const pad = { x0, x1: x0 + 150, y: groundY - 8 }
  const rock = wide ? [0.24, 0.5] : [0.2, 0.53]
  const pts: Pt[] = []
  for (let x = 0; x <= W; x += 20) {
    if (x >= pad.x0 && x <= pad.x1) continue
    const rocky = x > W * rock[0] && x < W * rock[1]
    pts.push([x, groundY - 16 * Math.sin(x * 0.013) - 9 * Math.sin(x * 0.041 + 1) - (rocky ? 26 * Math.abs(Math.sin(x * 0.09)) : 0)])
  }
  pts.push([pad.x0, pad.y], [pad.x1, pad.y])
  pts.sort((a, b) => a[0] - b[0])
  const span = W * (rock[1] - rock[0])
  const boulders = Array.from({ length: 9 }, (_, i) => {
    const x = W * rock[0] + span * (0.06 + i * 0.11)
    return { x, r: 7 + ((i * 5) % 9), y: heightAt(pts, x) }
  })
  const ridge = (base: number, a: number, f: number, seed: number) =>
    Array.from({ length: Math.ceil(W / 30) + 2 }, (_, i): Pt => {
      const x = i * 30
      return [x, base - a * (0.6 * Math.sin(x * f + seed) + 0.3 * Math.sin(x * f * 2.7 + seed * 2) + 0.1 * Math.sin(x * f * 6.1))]
    })
  return { W, H, top, pts, pad, boulders, far: ridge(groundY - 70, 46, 0.009, 1.3), near: ridge(groundY - 34, 24, 0.014, 4.1), wide }
}

const fill = (pts: Pt[], H: number, W: number) => `M0,${H} ${pts.map(([x, y]) => `L${x},${y}`).join(' ')} L${W},${H}Z`
const line = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')

export const Scenery = memo(function Scenery({ world }: { world: World }) {
  const { W, H, top, pts, pad, boulders, far, near, wide } = world
  const earth = { x: W * (wide ? 0.84 : 0.8), y: top + (wide ? 70 : 120), r: wide ? 40 : 32 }
  const stars = Array.from({ length: wide ? 150 : 110 }, (_, i) => ({ x: rnd(i, 1) * W, y: rnd(i, 2) * (pad.y - 60), r: 0.5 + rnd(i, 3) ** 3 * 1.6, o: 0.35 + rnd(i, 4) * 0.6 }))
  const sparkles = stars.filter((s) => s.r > 1.5).slice(0, 6)
  const pebbles = Array.from({ length: 80 }, (_, i) => {
    const x = rnd(i, 5) * W
    const g = heightAt(pts, x)
    const d = rnd(i, 6)
    return { x, y: g + 10 + d * (H - g - 14), r: 1.2 + d * 3.8, light: rnd(i, 7) > 0.6 }
  })
  // foreground craters sit in the ground below the ridge, so they never block the landing
  const craters = [
    [0.12, 0.35, 34],
    [0.42, 0.62, 52],
    [0.86, 0.48, 30],
    [0.7, 0.85, 44],
  ].map(([fx, fy, rx]) => {
    const x = W * fx
    const g = heightAt(pts, x)
    return { x, y: g + (H - g) * fy, rx }
  })

  return (
    <>
      <defs>
        <linearGradient id="ll-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#03060F" />
          <stop offset="0.65" stopColor="#0A1330" />
          <stop offset="1" stopColor="#18234A" />
        </linearGradient>
        <radialGradient id="ll-band" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8E7CFF" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#4F7BFF" stopOpacity="0.1" />
          <stop offset="1" stopColor="#4F7BFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ll-sun" cx="0" cy="0" r="1">
          <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFE9B8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ll-atmo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor="#6FB8FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#6FB8FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ll-earth" cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#7DC1F7" />
          <stop offset="0.6" stopColor="#2F6FDB" />
          <stop offset="1" stopColor="#123275" />
        </radialGradient>
        <linearGradient id="ll-night" x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0.5" stopColor="#03060F" stopOpacity="0" />
          <stop offset="1" stopColor="#03060F" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="ll-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A5478" />
          <stop offset="1" stopColor="#262E4D" />
        </linearGradient>
        <linearGradient id="ll-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A82A0" />
          <stop offset="1" stopColor="#4A5274" />
        </linearGradient>
        <linearGradient id="ll-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DADCE5" />
          <stop offset="0.35" stopColor="#AEB3C4" />
          <stop offset="1" stopColor="#6A7089" />
        </linearGradient>
        <linearGradient id="ll-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3DDC97" stopOpacity="0.4" />
          <stop offset="1" stopColor="#3DDC97" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ll-beacon">
          <stop offset="0" stopColor="#3DDC97" stopOpacity="0.9" />
          <stop offset="1" stopColor="#3DDC97" stopOpacity="0" />
        </radialGradient>
        <clipPath id="ll-earth-clip">
          <circle cx={earth.x} cy={earth.y} r={earth.r} />
        </clipPath>
      </defs>

      {/* sky: deep space, a faint Milky Way, sunlight from the upper left */}
      <rect width={W} height={H} fill="url(#ll-sky)" />
      <ellipse cx={W * 0.45} cy={top + (pad.y - top) * 0.35} rx={W * 0.8} ry={70} fill="url(#ll-band)" transform={`rotate(-24 ${W * 0.45} ${top + (pad.y - top) * 0.35})`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFF8E7" opacity={s.o} className={i % 7 ? undefined : 'twinkle'} style={i % 7 ? undefined : { animationDelay: `${rnd(i, 8) * 3}s` }} />
      ))}
      {sparkles.map((s, i) => (
        <path key={i} d={`M${s.x},${s.y - 6}L${s.x + 1.2},${s.y - 1.2}L${s.x + 6},${s.y}L${s.x + 1.2},${s.y + 1.2}L${s.x},${s.y + 6}L${s.x - 1.2},${s.y + 1.2}L${s.x - 6},${s.y}L${s.x - 1.2},${s.y - 1.2}Z`} fill="#FFF8E7" className="twinkle" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      <circle cx="0" cy="0" r={W * 0.7} fill="url(#ll-sun)" />

      {/* Earth, half in daylight */}
      <circle cx={earth.x} cy={earth.y} r={earth.r * 1.55} fill="url(#ll-atmo)" />
      <circle cx={earth.x} cy={earth.y} r={earth.r} fill="url(#ll-earth)" />
      {/* clip on the outer group: a clipPath on a transformed group would be transformed too */}
      <g clipPath="url(#ll-earth-clip)">
        <g transform={`translate(${earth.x} ${earth.y}) scale(${earth.r / 34})`}>
          <path d="M-14,-28 c10,-5 20,3 16,12 c-4,7 -13,6 -15,15 c-9,-6 -12,-19 -1,-27z" fill="#4FAF6A" />
          <path d="M6,4 c8,-3 16,4 12,12 c-3,6 -10,4 -14,10 c-5,-6 -5,-17 2,-22z" fill="#5DBB72" />
          <ellipse cx="-6" cy="-12" rx="16" ry="3" fill="#fff" opacity="0.7" transform="rotate(-15)" />
          <ellipse cx="8" cy="18" rx="14" ry="2.5" fill="#fff" opacity="0.55" transform="rotate(10)" />
          <rect x="-34" y="-34" width="68" height="68" fill="url(#ll-night)" />
        </g>
      </g>

      {/* far crater rims, then the near ridge: depth for free */}
      <path d={fill(far, H, W)} fill="url(#ll-far)" />
      <path d={line(far)} fill="none" stroke="#8C95BC" strokeWidth="1.5" opacity="0.5" />
      <path d={fill(near, H, W)} fill="url(#ll-near)" />
      <path d={line(near)} fill="none" stroke="#B6BCD6" strokeWidth="1.5" opacity="0.5" />

      {/* the ground you land on */}
      <path d={fill(pts, H, W)} fill="url(#ll-ground)" />
      {craters.map((c) => (
        <g key={c.x}>
          <ellipse cx={c.x} cy={c.y + 3} rx={c.rx} ry={c.rx * 0.24} fill="#E6E8EF" opacity="0.8" />
          <ellipse cx={c.x} cy={c.y} rx={c.rx * 0.94} ry={c.rx * 0.22} fill="#868CA3" />
          <ellipse cx={c.x + c.rx * 0.12} cy={c.y + c.rx * 0.04} rx={c.rx * 0.7} ry={c.rx * 0.15} fill="#9CA2B7" />
        </g>
      ))}
      {pebbles.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.55} fill={p.light ? '#C8CCD8' : '#8A90A6'} opacity="0.8" />
      ))}
      <path d={line(pts)} fill="none" stroke="#F4F5F9" strokeWidth="2.5" strokeLinejoin="round" opacity="0.85" />
      {boulders.map((b) => (
        <g key={b.x}>
          <ellipse cx={b.x + b.r * 0.9} cy={b.y + 2} rx={b.r * 1.5} ry={b.r * 0.35} fill="#000" opacity="0.28" />
          <path d={`M${b.x - b.r},${b.y} Q${b.x - b.r},${b.y - b.r * 1.4} ${b.x},${b.y - b.r * 1.45} Q${b.x + b.r * 1.1},${b.y - b.r * 1.3} ${b.x + b.r},${b.y}Z`} fill="#7D8299" />
          <path d={`M${b.x - b.r * 0.75},${b.y - b.r * 0.5} Q${b.x - b.r * 0.6},${b.y - b.r * 1.25} ${b.x},${b.y - b.r * 1.3}`} fill="none" stroke="#D2D6E0" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        </g>
      ))}

      {/* the flat spot: a soft green beam you can see from high up */}
      <rect x={pad.x0} y={pad.y - 190} width={pad.x1 - pad.x0} height="190" fill="url(#ll-beam)" className="motion-safe:animate-pulse" />
      <rect x={pad.x0 - 4} y={pad.y - 1} width={pad.x1 - pad.x0 + 8} height="10" rx="3" fill="#B9BED0" />
      <line x1={pad.x0} y1={pad.y + 1} x2={pad.x1} y2={pad.y + 1} stroke="#3DDC97" strokeWidth="4" strokeDasharray="12 8" strokeLinecap="round" />
      {[pad.x0, pad.x1].map((x) => (
        <g key={x}>
          <circle cx={x} cy={pad.y - 5} r="16" fill="url(#ll-beacon)" className="motion-safe:animate-pulse" />
          <circle cx={x} cy={pad.y - 5} r="4.5" fill="#E9FFF4" />
        </g>
      ))}
    </>
  )
})

// The Eagle, feet at (0, 0). Sunlight from the left: right sides are shaded.
export function EagleArt() {
  return (
    <>
      <defs>
        <linearGradient id="ll-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FCE38A" />
          <stop offset="0.45" stopColor="#E0B040" />
          <stop offset="1" stopColor="#9C6A1C" />
        </linearGradient>
        <linearGradient id="ll-silver" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#F4F6FB" />
          <stop offset="0.55" stopColor="#C3C8D6" />
          <stop offset="1" stopColor="#8A90A6" />
        </linearGradient>
      </defs>
      <g stroke="#C9CDD8" strokeLinecap="round">
        <line x1="-15" y1="-24" x2="-26" y2="-2" strokeWidth="3" />
        <line x1="15" y1="-24" x2="26" y2="-2" strokeWidth="3" />
        <line x1="-9" y1="-19" x2="-24" y2="-6" strokeWidth="2" stroke="#9AA0B4" />
        <line x1="9" y1="-19" x2="24" y2="-6" strokeWidth="2" stroke="#9AA0B4" />
      </g>
      <ellipse cx="-26" cy="-1" rx="7.5" ry="2.6" fill="#E1E4EC" />
      <ellipse cx="26" cy="-1" rx="7.5" ry="2.6" fill="#C9CDD8" />
      <path d="M-6,-20 L6,-20 L9,-13 L-9,-13Z" fill="#565C73" />
      <ellipse cx="0" cy="-13" rx="9" ry="2" fill="#2B2F45" />
      <polygon points="-19,-37 19,-37 22,-33 22,-23 19,-19 -19,-19 -22,-23 -22,-33" fill="url(#ll-gold)" />
      <rect x="10" y="-36" width="11" height="16" fill="#7A4E12" opacity="0.3" />
      <polyline points="-16,-33 -10,-28 -14,-24 -7,-21" fill="none" stroke="#FFF4C2" strokeWidth="1.2" opacity="0.7" />
      <polyline points="2,-35 7,-30 3,-26 9,-22" fill="none" stroke="#FFF4C2" strokeWidth="1.2" opacity="0.5" />
      <path d="M-15,-37 L-17,-50 L-10,-60 L9,-60 L16,-52 L15,-37Z" fill="url(#ll-silver)" stroke="#7E849A" strokeWidth="1.2" />
      <path d="M-10,-50 L-5,-56.5 L-3,-49Z" fill="#1B2440" />
      <path d="M3,-49 L5,-56.5 L10,-50Z" fill="#1B2440" />
      <path d="M-8.5,-51 L-6,-54" stroke="#9FD3FF" strokeWidth="1" strokeLinecap="round" />
      <rect x="-3" y="-46" width="6" height="7" rx="1" fill="#9EA4B8" />
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${d * 18} -51)`} fill="#8E95A9">
          <rect x="-2" y="-2" width="4" height="4" />
          <rect x={d * 2} y="-1" width="3" height="2" />
          <rect x="-1" y="-5" width="2" height="3" />
        </g>
      ))}
      <line x1="7" y1="-60" x2="11" y2="-67" stroke="#C9CDD8" strokeWidth="1.5" />
      <ellipse cx="12" cy="-69" rx="4.5" ry="3" fill="#E8EAF0" stroke="#8A90A6" strokeWidth="1" />
      <line x1="-6" y1="-60" x2="-10" y2="-72" stroke="#C9CDD8" strokeWidth="1" />
      <circle cx="-10" cy="-72.5" r="1.6" fill="#FFC93C" />
    </>
  )
}
