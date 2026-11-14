import { useEffect, useRef, useState, type MouseEvent } from 'react'
import Astronaut from './Astronaut'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'

// Landing scene on a 1440×900 canvas, lit from the left: the Apollo 12 site in the Ocean of Storms, November 1969.
// Rumble (the ALSEP science station) is the star: nuclear battery, seismometer, and an antenna talking to Earth.
// Wide screens see all of it behind the text; phones see a crop around the astronaut, Rumble and Earth.
// Tap the ground: a ripple runs out and Rumble's seismometer feels it (onTap gets the shake size, 0..1).
// Motion hooks: js-ground, js-earth, js-link, js-astronaut, js-astro-shadow.

const t = en.landing.rumble
const EARTH = { x: 1290, y: 300, r: 64 }
const STATION = { x: 1135, y: 742, s: 1.45 }
const SEISMO = { x: 1285, y: 806 }
const RTG = { x: 1020, y: 786, s: 1.35 }
// antenna pivot on top of the sunshade, aimed at Earth
const PIVOT = { x: STATION.x + 28 * STATION.s, y: STATION.y - 98 * STATION.s }
const AIM = Math.atan2(EARTH.y - PIVOT.y, EARTH.x - PIVOT.x)
const TIP = { x: PIVOT.x + Math.cos(AIM) * 58 * STATION.s, y: PIVOT.y + Math.sin(AIM) * 58 * STATION.s }
const LINK = { x1: TIP.x + Math.cos(AIM) * 10, y1: TIP.y + Math.sin(AIM) * 10, x2: EARTH.x - Math.cos(AIM) * (EARTH.r + 4), y2: EARTH.y - Math.sin(AIM) * (EARTH.r + 4) }
const LINK_LEN = Math.hypot(LINK.x2 - LINK.x1, LINK.y2 - LINK.y1)
const deg = (r: number) => (r * 180) / Math.PI

const CRATERS = [
  [180, 770, 80, 16], [520, 840, 120, 24], [760, 722, 46, 9], [1110, 856, 95, 18],
  [1400, 862, 60, 12], [930, 800, 36, 7], [300, 720, 40, 8],
]
const ROCKS = [[640, 760, 10], [1190, 836, 7], [860, 690, 6], [1430, 760, 12], [420, 825, 8], [1000, 862, 9]]
const SURFACE = 'M0 680 C 300 640 620 660 900 648 C 1120 640 1300 630 1440 642'

type Ripple = { id: number; x: number; y: number; big: boolean }

export default function MoonScene({ wide, onTap }: { wide: boolean; onTap?: (amp: number) => void }) {
  const kind = useGame((s) => s.character)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [react, setReact] = useState<'idle' | 'big' | 'small'>('idle')
  const calm = useRef(0)
  useEffect(() => () => clearTimeout(calm.current), [])

  // tap the Moon: closer to the seismometer = bigger shake
  const tap = (e: MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse())
    if (p.y < 650) return // that's the sky
    const amp = Math.min(1, Math.max(0.12, 1.15 - Math.hypot(p.x - SEISMO.x, p.y - SEISMO.y) / 480))
    const big = amp > 0.6
    const id = e.timeStamp
    setRipples((r) => [...r.slice(-4), { id, x: p.x, y: p.y, big }])
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 1000)
    setReact(big ? 'big' : 'small')
    clearTimeout(calm.current)
    calm.current = window.setTimeout(() => setReact('idle'), 2600)
    onTap?.(amp)
  }

  return (
    <svg
      viewBox={wide ? '0 0 1440 900' : '860 200 580 700'}
      preserveAspectRatio={wide ? 'xMidYMax slice' : 'xMidYMax meet'}
      className="h-full w-full cursor-pointer select-none"
      aria-hidden="true"
      onClick={tap}
    >
      <defs>
        <linearGradient id="ms-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCDCE5" />
          <stop offset="0.5" stopColor="#B9BDCC" />
          <stop offset="1" stopColor="#8E93A8" />
        </linearGradient>
        <linearGradient id="ms-ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9DA2B6" />
          <stop offset="1" stopColor="#6F7590" />
        </linearGradient>
        <radialGradient id="ms-ocean" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#5AA8F0" />
          <stop offset="0.55" stopColor="#2F6FDB" />
          <stop offset="1" stopColor="#173B8C" />
        </radialGradient>
        <linearGradient id="ms-shade" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0.45" stopColor="#08152B" stopOpacity="0" />
          <stop offset="1" stopColor="#08152B" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id="ms-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7D774" />
          <stop offset="0.45" stopColor="#D9A93A" />
          <stop offset="1" stopColor="#A8741F" />
        </linearGradient>
        <linearGradient id="ms-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F6FB" />
          <stop offset="0.4" stopColor="#BFC5D3" />
          <stop offset="0.7" stopColor="#E6E9F1" />
          <stop offset="1" stopColor="#8E95A9" />
        </linearGradient>
        <radialGradient id="ms-heat">
          <stop offset="0" stopColor="#FFB45A" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FF5A3D" stopOpacity="0" />
        </radialGradient>
        <clipPath id="ms-earth">
          <circle r="64" />
        </clipPath>
        <filter id="ms-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="ms-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* Mars, far away: the next world */}
      <g transform="translate(1100 330)">
        <circle r="16" fill="#E0703A" opacity="0.3" filter="url(#ms-glow)" />
        <circle r="8" fill="#E0703A" />
        <circle r="8" fill="url(#ms-shade)" />
        <ellipse cy="-6" rx="3.5" ry="1.6" fill="#fff" opacity="0.8" />
      </g>

      {/* Earth */}
      <g className="js-earth" transform={`translate(${EARTH.x} ${EARTH.y})`}>
        <circle r="76" fill="#6FB8FF" opacity="0.35" filter="url(#ms-glow)" />
        <circle r="64" fill="url(#ms-ocean)" />
        <g clipPath="url(#ms-earth)">
          <path d="M-40,-50 C-20,-62 0,-40 -6,-20 C-10,0 -30,6 -34,26 C-46,10 -56,-22 -40,-50Z" fill="#4FAF6A" />
          <path d="M10,-30 C30,-42 56,-24 50,-4 C45,12 25,6 20,22 C8,10 -2,-14 10,-30Z" fill="#5DBB72" />
          <path d="M-10,38 C6,32 26,44 16,60 C0,66 -16,54 -10,38Z" fill="#E9D9A6" />
          <ellipse cx="-20" cy="-30" rx="26" ry="5" fill="#fff" opacity="0.7" transform="rotate(-18)" />
          <ellipse cx="18" cy="16" rx="30" ry="5" fill="#fff" opacity="0.6" transform="rotate(12)" />
          <ellipse cx="-28" cy="44" rx="18" ry="4" fill="#fff" opacity="0.55" />
          <circle r="64" fill="url(#ms-shade)" />
        </g>
        <circle r="64" fill="none" stroke="#BFE3FF" strokeWidth="1.5" opacity="0.5" />
      </g>

      <g className="js-ground">
        <path d="M0 600 C 220 560 420 590 640 570 C 860 548 1080 585 1300 560 C 1370 552 1410 556 1440 560 L1440 900 L0 900 Z" fill="url(#ms-ridge)" />
        <path d={`${SURFACE} L1440 900 L0 900 Z`} fill="url(#ms-ground)" />
        <path d={SURFACE} fill="none" stroke="#F2F3F8" strokeWidth="2" opacity="0.55" />

        {CRATERS.map(([cx, cy, rx, ry]) => (
          <g key={cx}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#EEF0F5" opacity="0.7" />
            <ellipse cx={cx} cy={cy + ry * 0.25} rx={rx * 0.92} ry={ry * 0.8} fill="#A3A8BB" />
            <ellipse cx={cx + rx * 0.15} cy={cy + ry * 0.35} rx={rx * 0.6} ry={ry * 0.45} fill="#9298AD" />
          </g>
        ))}
        {ROCKS.map(([x, y, r]) => (
          <g key={x}>
            <ellipse cx={x + r * 1.2} cy={y + r * 0.5} rx={r * 1.6} ry={r * 0.4} fill="#000" opacity="0.18" />
            <path d={`M${x - r},${y + r * 0.4} Q${x - r * 0.8},${y - r} ${x},${y - r} Q${x + r},${y - r * 0.6} ${x + r},${y + r * 0.4}Z`} fill="#8E93A8" />
            <path d={`M${x - r * 0.7},${y} Q${x - r * 0.5},${y - r * 0.8} ${x},${y - r * 0.85}`} stroke="#E4E5EC" strokeWidth="2" fill="none" />
          </g>
        ))}

        {/* Surveyor 3, waiting in its crater since 1967 (a secret level) */}
        <g transform="translate(760 716)">
          <ellipse rx="46" ry="9" fill="#9298AD" />
          <g stroke="#C9CDD8" strokeWidth="2" strokeLinecap="round">
            <line x1="-4" y1="-14" x2="-18" y2="2" />
            <line x1="4" y1="-14" x2="18" y2="2" />
            <line x1="0" y1="-14" x2="2" y2="4" />
            <line x1="0" y1="-18" x2="0" y2="-38" />
          </g>
          <polygon points="-8,-20 8,-20 5,-10 -5,-10" fill="#E6E9F1" stroke="#8E95A9" />
          <rect x="-12" y="-46" width="16" height="9" fill="#2F6FDB" stroke="#BFE3FF" strokeWidth="1" transform="rotate(-12 -4 -41)" />
        </g>

        {/* boot prints from the lander past the station */}
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={1290 - i * 24} y={694 + i * 1.6 + (i % 2 ? 4 : -4)} width="10" height="5" rx="2.5" fill="#9298AD" />
        ))}

        {/* Intrepid, the Apollo 12 lander */}
        <g transform="translate(1352 668) scale(0.78)">
          <ellipse cx="10" cy="8" rx="128" ry="12" fill="#000" opacity="0.22" />
          <g stroke="#C9CDD8" strokeWidth="4" strokeLinecap="round">
            <line x1="-54" y1="-52" x2="-96" y2="2" />
            <line x1="-38" y1="-44" x2="-96" y2="2" />
            <line x1="54" y1="-52" x2="96" y2="2" />
            <line x1="38" y1="-44" x2="96" y2="2" />
          </g>
          <ellipse cx="-98" cy="4" rx="16" ry="4.5" fill="#C9CDD8" />
          <ellipse cx="98" cy="4" rx="16" ry="4.5" fill="#C9CDD8" />
          <polygon points="-16,-44 16,-44 22,-30 -22,-30" fill="#6B7186" />
          <polygon points="-58,-100 58,-100 66,-90 66,-52 58,-42 -58,-42 -66,-52 -66,-90" fill="url(#ms-gold)" />
          <polyline points="-46,-90 -32,-80 -40,-66 -24,-56" stroke="#FFF2B0" strokeWidth="1.5" fill="none" opacity="0.6" />
          <polyline points="18,-94 30,-84 22,-72 38,-60" stroke="#FFF2B0" strokeWidth="1.5" fill="none" opacity="0.5" />
          <polygon points="-48,-100 -54,-128 -38,-158 38,-158 54,-128 48,-100" fill="url(#ms-foil)" stroke="#7E849A" strokeWidth="1.5" />
          <polygon points="-38,-128 -24,-148 -16,-128" fill="#1B2440" />
          <polygon points="38,-128 24,-148 16,-128" fill="#1B2440" />
          <rect x="-10" y="-124" width="20" height="18" rx="2" fill="#7E849A" />
          <rect x="-60" y="-136" width="8" height="8" fill="#8E95A9" />
          <rect x="52" y="-136" width="8" height="8" fill="#8E95A9" />
          <line x1="30" y1="-158" x2="40" y2="-176" stroke="#C9CDD8" strokeWidth="2" />
          <circle cx="42" cy="-180" r="7" fill="#E6E9F1" stroke="#8E95A9" />
        </g>

        {/* flag, with the horizontal rod Apollo flags used */}
        <g transform="translate(1222 664) scale(0.8)">
          <line x1="0" y1="0" x2="44" y2="7" stroke="#000" strokeWidth="3" opacity="0.18" />
          <line x1="0" y1="0" x2="0" y2="-98" stroke="#E8EAF0" strokeWidth="3" />
          <line x1="0" y1="-97" x2="54" y2="-97" stroke="#E8EAF0" strokeWidth="2" />
          <g transform="translate(1 -96) skewY(-4)">
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} y={i * 5} width="52" height="5" fill={i % 2 ? '#F4F4F6' : '#D8344A'} />
            ))}
            <rect width="22" height="18" fill="#2D3E8C" />
          </g>
        </g>

        {/* orange flat cables, like in the real Apollo 12 photos */}
        <g fill="none" stroke="#D9772E" strokeWidth="4" opacity="0.9">
          <path d={`M${RTG.x + 18} ${RTG.y - 6} Q ${(RTG.x + STATION.x) / 2} ${RTG.y + 18} ${STATION.x - 52} ${STATION.y - 8}`} />
          <path d={`M${STATION.x + 52} ${STATION.y - 8} Q ${(STATION.x + SEISMO.x) / 2} ${SEISMO.y + 20} ${SEISMO.x - 32} ${SEISMO.y - 2}`} />
        </g>

        {/* Rumble: the central station, sunshade up */}
        <g transform={`translate(${STATION.x} ${STATION.y}) scale(${STATION.s})`}>
          <ellipse cy="4" rx="66" ry="9" fill="#000" opacity="0.2" />
          <line x1="-30" y1="-8" x2="-34" y2="2" stroke="#8E95A9" strokeWidth="3" />
          <line x1="30" y1="-8" x2="34" y2="2" stroke="#8E95A9" strokeWidth="3" />
          <line x1="-36" y1="-44" x2="-36" y2="-98" stroke="#BFC5D3" strokeWidth="3" />
          <line x1="36" y1="-44" x2="36" y2="-98" stroke="#BFC5D3" strokeWidth="3" />
          <rect x="-42" y="-100" width="84" height="54" rx="2" fill="url(#ms-foil)" stroke="#fff" strokeWidth="1.5" />
          <path d="M-30 -86 L-6 -60 M4 -92 L26 -66" stroke="#fff" strokeWidth="2" opacity="0.6" />
          <rect x="-38" y="-40" width="76" height="32" rx="2" fill="url(#ms-foil)" stroke="#fff" strokeWidth="1.5" />
          {[-22, -10, 2].map((x, i) => (
            <circle key={x} cx={x} cy="-24" r="3.5" fill="#3DDC97" className="twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </g>
        {/* helical antenna, aimed at Earth */}
        <g transform={`translate(${PIVOT.x} ${PIVOT.y}) rotate(${deg(AIM) + 90}) scale(${STATION.s})`}>
          <line x1="0" y1="0" x2="0" y2="-58" stroke="#C9CDD8" strokeWidth="4" strokeLinecap="round" />
          {[-12, -22, -32, -42, -52].map((y) => (
            <path key={y} d={`M-7 ${y + 4} L7 ${y - 4}`} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          ))}
        </g>
        <circle cx={PIVOT.x} cy={PIVOT.y} r="6" fill="#8E95A9" />

        {/* nuclear battery: warm all day and night */}
        <g transform={`translate(${RTG.x} ${RTG.y}) scale(${RTG.s})`}>
          <ellipse cy="-24" rx="56" ry="54" fill="url(#ms-heat)" className="motion-safe:animate-pulse" />
          <ellipse cy="2" rx="40" ry="6" fill="#000" opacity="0.22" />
          {[-30, -22, 9, 17].map((x) => (
            <rect key={x} x={x} y="-44" width="13" height="40" rx="2" fill="#B9876A" stroke="#5D6378" />
          ))}
          <rect x="-13" y="-48" width="26" height="46" rx="4" fill="#7A5A4E" />
          <ellipse cy="-48" rx="13" ry="4" fill="#FF9A3D" />
        </g>

        {/* the seismometer: Rumble's ears, on its foil skirt */}
        <g transform={`translate(${SEISMO.x} ${SEISMO.y}) scale(1.5)`}>
          <ellipse rx="40" ry="9" fill="url(#ms-foil)" stroke="#fff" />
          <rect x="-12" y="-34" width="24" height="32" rx="4" fill="url(#ms-foil)" stroke="#7E849A" strokeWidth="1.5" />
          <ellipse cy="-34" rx="12" ry="4" fill="#E6E9F1" stroke="#7E849A" />
          <circle cy="-20" r="3" fill="#3DDC97" className="twinkle" />
        </g>

        {ripples.map((r) => (
          <ellipse key={r.id} cx={r.x} cy={r.y} rx={r.big ? 170 : 110} ry={r.big ? 32 : 20} fill="none" stroke={r.big ? '#2EC4B6' : '#F4F6FB'} strokeWidth="5" className="ripple" />
        ))}

        {/* astronaut + its shadow */}
        <ellipse className="js-astro-shadow" cx="958" cy="712" rx="44" ry="8" fill="#000" opacity="0.22" />
        <g className="js-astronaut">
          <Astronaut kind={kind} pose="point" x={870} y={458} width={170} />
        </g>
      </g>

      {/* Rumble's radio link to Earth: data pulses flying home */}
      <g>
        <line {...LINK} className="js-link" stroke="#2EC4B6" strokeWidth="9" opacity="0.3" filter="url(#ms-soft)" strokeDasharray={LINK_LEN} />
        <line {...LINK} className="js-link" stroke="#6BC8FF" strokeWidth="2" strokeDasharray={LINK_LEN} />
        <line {...LINK} className="laser-pulse" stroke="#E6FBFF" strokeWidth="3" />
        <g transform={`translate(${TIP.x} ${TIP.y}) rotate(${deg(AIM)})`} fill="none" stroke="#6BC8FF" strokeWidth="3" strokeLinecap="round">
          {[16, 28, 40].map((r, i) => (
            <path key={r} className="radio" style={{ animationDelay: `${i * 0.35}s` }} d={`M${r * 0.77} ${-r * 0.64} A${r} ${r} 0 0 1 ${r * 0.77} ${r * 0.64}`} />
          ))}
        </g>
      </g>

      {/* Rumble talks: a paper tag over the station */}
      <g transform="translate(1008 476)">
        <g key={react} className="tag-pop">
        <path d="M0 10 Q0 0 10 0 H162 Q172 0 172 10 V58 Q172 68 162 68 H106 L118 92 L88 68 H10 Q0 68 0 58Z" fill="#FFF1D6" stroke="#1B2440" strokeOpacity="0.15" />
        <text x="86" y="29" textAnchor="middle" fontSize="21" fill="#1B2440" style={{ fontFamily: 'var(--font-hand)' }}>
          {t[react][0]}
        </text>
        <text x="86" y="54" textAnchor="middle" fontSize="21" fill={react === 'big' ? '#136B63' : '#1B2440'} style={{ fontFamily: 'var(--font-hand)' }}>
          {t[react][1]}
        </text>
        </g>
      </g>
    </svg>
  )
}
