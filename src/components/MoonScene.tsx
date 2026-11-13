import Astronaut from './Astronaut'
import { useGame } from '../store/progress'

// Landing scene on a 1440×900 canvas, lit from the left.
// Wide screens see all of it behind the text; phones see a crop around the astronaut, Reflecto and Earth.
// Motion hooks: js-ground, js-earth, js-laser, js-astronaut, js-astro-shadow.

const LASER = { x1: 1062, y1: 728, x2: 1290, y2: 300 }
const LASER_LEN = Math.hypot(LASER.x2 - LASER.x1, LASER.y2 - LASER.y1)

const CRATERS = [
  [180, 770, 80, 16], [520, 840, 120, 24], [760, 722, 46, 9], [1110, 852, 95, 18],
  [1395, 805, 60, 12], [940, 790, 36, 7], [300, 720, 40, 8], [1240, 800, 30, 6],
]
const ROCKS = [[640, 760, 10], [1190, 830, 7], [860, 690, 6], [1420, 865, 12], [420, 825, 8], [1000, 860, 9]]
const SURFACE = 'M0 680 C 300 640 620 660 900 648 C 1120 640 1300 630 1440 642'

export default function MoonScene({ wide }: { wide: boolean }) {
  const kind = useGame((s) => s.character)
  return (
    <svg
      viewBox={wide ? '0 0 1440 900' : '860 200 580 700'}
      preserveAspectRatio={wide ? 'xMidYMax slice' : 'xMidYMax meet'}
      className="h-full w-full"
      aria-hidden="true"
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

      {/* Mars, far away */}
      <g transform="translate(1100 330)">
        <circle r="16" fill="#E0703A" opacity="0.3" filter="url(#ms-glow)" />
        <circle r="8" fill="#E0703A" />
        <circle r="8" fill="url(#ms-shade)" />
        <ellipse cy="-6" rx="3.5" ry="1.6" fill="#fff" opacity="0.8" />
      </g>

      {/* Earth */}
      <g className="js-earth" transform="translate(1290 300)">
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

        {/* Lunar Roving Vehicle */}
        <g transform="translate(620 798)">
          <ellipse cx="22" cy="22" rx="84" ry="8" fill="#000" opacity="0.2" />
          <rect x="-72" y="-20" width="144" height="10" rx="3" fill="#C9CDD8" />
          <path d="M-70,-12 Q-48,-34 -26,-12 M26,-12 Q48,-34 70,-12" stroke="#E8EAF0" strokeWidth="4" fill="none" />
          {[-48, 48].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="2" r="17" fill="#5D6378" stroke="#C9CDD8" strokeWidth="3" />
              <circle cx={cx} cy="2" r="9" fill="none" stroke="#8A90A6" strokeWidth="2" />
            </g>
          ))}
          <rect x="-22" y="-38" width="15" height="18" rx="3" fill="#3A4060" />
          <rect x="4" y="-38" width="15" height="18" rx="3" fill="#3A4060" />
          <line x1="-44" y1="-20" x2="-44" y2="-52" stroke="#C9CDD8" strokeWidth="3" />
          <path d="M-66,-56 Q-44,-82 -22,-56 Z" fill="#E8EAF0" />
          <line x1="44" y1="-20" x2="56" y2="-66" stroke="#C9CDD8" strokeWidth="2" />
        </g>

        {/* footprints from the lander to the astronaut */}
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={1262 - i * 22} y={772 - i * 4 + (i % 2 ? 4 : -4)} width="10" height="5" rx="2.5" fill="#9298AD" />
        ))}

        {/* Eagle, Apollo 11 descent stage */}
        <g transform="translate(1335 735)">
          <ellipse cx="34" cy="12" rx="112" ry="10" fill="#000" opacity="0.22" />
          <g stroke="#C9CDD8" strokeWidth="4" strokeLinecap="round">
            <line x1="-46" y1="-34" x2="-92" y2="4" />
            <line x1="-34" y1="-26" x2="-92" y2="4" />
            <line x1="46" y1="-34" x2="92" y2="4" />
            <line x1="34" y1="-26" x2="92" y2="4" />
          </g>
          <g stroke="#C9CDD8" strokeWidth="2">
            {[-80, -72, -64].map((x, i) => (
              <line key={x} x1={x} y1={-4 - i * 7} x2={x + 10} y2={-4 - i * 7} />
            ))}
          </g>
          <ellipse cx="-94" cy="6" rx="15" ry="4" fill="#C9CDD8" />
          <ellipse cx="94" cy="6" rx="15" ry="4" fill="#C9CDD8" />
          <polygon points="-14,-24 14,-24 20,-10 -20,-10" fill="#6B7186" />
          <rect x="-56" y="-78" width="112" height="9" rx="2" fill="#C9CDD8" />
          <rect x="-50" y="-70" width="100" height="46" rx="3" fill="url(#ms-gold)" />
          <polyline points="-40,-60 -28,-52 -34,-40 -20,-32" stroke="#FFF2B0" strokeWidth="1.5" fill="none" opacity="0.6" />
          <polyline points="20,-64 32,-54 26,-44 40,-34" stroke="#FFF2B0" strokeWidth="1.5" fill="none" opacity="0.5" />
          <rect x="-14" y="-64" width="28" height="18" rx="2" fill="#2B2F45" />
        </g>

        {/* flag, with the horizontal rod Apollo flags used */}
        <g transform="translate(1238 722)">
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

        {/* astronaut + its shadow */}
        <ellipse className="js-astro-shadow" cx="958" cy="712" rx="44" ry="8" fill="#000" opacity="0.22" />
        <g className="js-astronaut">
          <Astronaut kind={kind} pose="point" x={870} y={458} width={170} />
        </g>

        {/* Reflecto, Apollo 11 laser ranging retroreflector, right by the boots */}
        <g transform="translate(1062 752)">
          <ellipse cx="18" cy="6" rx="52" ry="6" fill="#000" opacity="0.25" />
          <g stroke="#6B7186" strokeWidth="3">
            <line x1="-30" y1="-6" x2="-35" y2="6" />
            <line x1="30" y1="-6" x2="35" y2="6" />
            <line x1="-20" y1="-10" x2="-22" y2="2" />
            <line x1="20" y1="-10" x2="22" y2="2" />
          </g>
          <polygon points="-44,-6 44,-6 36,-28 -36,-28" fill="#7A8098" stroke="#4E546B" strokeWidth="2" />
          {[0, 1].map((row) =>
            Array.from({ length: 8 }, (_, i) => (
              <circle key={`${row}-${i}`} cx={-31 + i * 8.9 - row * 1.4} cy={-21 + row * 8} r="3.3" fill="#CDEBFF" />
            )),
          )}
          <path className="glint" d="M-10,-34 L-8,-26 L0,-24 L-8,-22 L-10,-14 L-12,-22 L-20,-24 L-12,-26Z" fill="#fff" />
        </g>
      </g>

      {/* laser from Earth to Reflecto */}
      <g className="js-laser-group">
        <line {...LASER} className="js-laser" stroke="#FF4D4D" strokeWidth="7" opacity="0.35" filter="url(#ms-soft)" strokeDasharray={LASER_LEN} />
        <line {...LASER} className="js-laser" stroke="#FF6B6B" strokeWidth="2" strokeDasharray={LASER_LEN} />
        <line {...LASER} className="laser-pulse" stroke="#FFE1E1" strokeWidth="2.5" />
      </g>
    </svg>
  )
}
