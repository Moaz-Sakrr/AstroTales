// Three star layers (far → near). Each layer is its own div so it can move at its own parallax speed.
// Layer i has classes js-par-i (pointer parallax) and js-stars-i (intro motion).

// Small seeded PRNG (mulberry32) so the sky looks the same on every load.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TINTS = ['#FFFFFF', '#FFFFFF', '#FFF8E7', '#FFE7B0', '#CFE2FF']
const LAYERS = [
  { n: 180, r: [0.5, 1.1], o: [0.25, 0.7] },
  { n: 70, r: [0.9, 1.7], o: [0.5, 0.9] },
  { n: 24, r: [1.5, 2.5], o: [0.85, 1] },
]

const STARS = LAYERS.map((l, i) => {
  const rand = rng(i + 7)
  return Array.from({ length: l.n }, () => ({
    x: rand() * 1600,
    y: rand() * 1000,
    r: l.r[0] + rand() * (l.r[1] - l.r[0]),
    o: l.o[0] + rand() * (l.o[1] - l.o[0]),
    c: TINTS[Math.floor(rand() * TINTS.length)],
    delay: rand() * 4,
  }))
})

const SPARKLE = 'M0,-1 L0.22,-0.22 L1,0 L0.22,0.22 L0,1 L-0.22,0.22 L-1,0 L-0.22,-0.22Z'

export default function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="milky-way absolute -left-[20%] top-[8%] h-[38%] w-[140%] -rotate-12" />
      {STARS.map((layer, i) => (
        <div key={i} className={`js-par-${i} absolute -inset-[6%]`}>
          <svg className={`js-stars-${i} h-full w-full`} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
            {layer.map((s, j) => (
              <circle
                key={j}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill={s.c}
                opacity={s.o}
                className={i === 2 ? 'twinkle' : undefined}
                style={i === 2 ? { animationDelay: `${s.delay}s` } : undefined}
              />
            ))}
            {i === 2 &&
              layer.slice(0, 7).map((s, j) => (
                <path key={j} d={SPARKLE} fill="#fff" transform={`translate(${s.x} ${s.y}) scale(${s.r * 3.2})`} opacity="0.8" />
              ))}
          </svg>
        </div>
      ))}
      <div className="shooting-star" />
    </div>
  )
}
