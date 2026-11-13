// The kid's ship. The window stays empty: the kid shows up beside the ship, never inside it. Flame group has class js-flame for animation.
// Leg feet end at y=214 (Launch sinks everything below that under the pad); `legs` extends the landing gear to y=226.
import type { ReactNode } from 'react'

type Props = { flame?: boolean; legs?: boolean; className?: string }

const NAVY = '#1E2740'
const CREAM = '#EFE8DA'
const ORANGE = '#F28C28'
const GLOW = '#FFB347'
const HULL = 'M60 14 C84 22 94 56 94 96 L94 168 Q94 174 88 174 L32 174 Q26 174 26 168 L26 96 C26 56 36 22 60 14Z'

// draws the left-side part, then its mirror on the right
const both = (el: ReactNode) => (
  <>
    {el}
    <g transform="matrix(-1 0 0 1 120 0)">{el}</g>
  </>
)

export default function Rocket({ flame = false, legs = false, className }: Props) {
  const foot = legs ? 222 : 210
  return (
    <svg viewBox="0 0 120 300" className={className} aria-hidden="true">
      <defs>
        <clipPath id="rocket-hull">
          <path d={HULL} />
        </clipPath>
      </defs>

      {/* back legs */}
      {both(
        <>
          <path d={`M33 170 L40 170 L38 ${foot} L32 ${foot}Z`} fill={NAVY} />
          <rect x="28" y={foot} width="14" height="4" rx="1.5" fill="#8A90A6" />
        </>,
      )}

      {flame && (
        <g className="js-flame" style={{ transformOrigin: '60px 196px', transformBox: 'view-box' }}>
          <path d="M32 194 Q60 320 88 194Z" fill="#FF7A3D" opacity="0.9" />
          <path d="M42 196 Q60 290 78 196Z" fill={GLOW} />
          <path d="M50 196 Q60 250 70 196Z" fill="#FFF3B0" />
        </g>
      )}

      {/* engine block + three nozzles */}
      <path d="M38 170 L82 170 L79 184 L41 184Z" fill="#2A3350" />
      {both(
        <>
          <path d="M37 182 L48 182 L50 194 L35 194Z" fill="#3B425A" />
          <rect x="37" y="182" width="11" height="3" fill="#5A6178" />
          <ellipse cx="42.5" cy="194" rx="7.5" ry="2" fill={GLOW} />
        </>,
      )}
      <path d="M50 182 L70 182 L74 198 L46 198Z" fill="#3B425A" />
      <rect x="50" y="182" width="20" height="4" fill="#5A6178" />
      <ellipse cx="60" cy="198" rx="14" ry="2.5" fill={GLOW} />

      {/* hull */}
      <path d={HULL} fill={CREAM} />
      <g clipPath="url(#rocket-hull)">
        <rect x="78" y="0" width="20" height="180" fill="#000" opacity="0.07" />
        <rect x="30" y="20" width="5" height="150" fill="#fff" opacity="0.45" />
        <rect x="0" y="0" width="120" height="34" fill={NAVY} />
        <rect x="0" y="34" width="120" height="3" fill={ORANGE} />
        <rect x="0" y="104" width="120" height="7" fill={NAVY} />
        <rect x="54" y="106" width="12" height="3" rx="1.5" fill={GLOW} />
        <rect x="0" y="162" width="120" height="12" fill={NAVY} />
        <rect x="44" y="166.5" width="32" height="3" rx="1.5" fill={GLOW} />
        <rect x="31" y="58" width="3" height="14" rx="1.5" fill={ORANGE} />
        <rect x="86" y="58" width="3" height="14" rx="1.5" fill={ORANGE} />
        <path d="M26 42 H94 M44 111 V162 M76 111 V162 M26 148 H94" stroke="#D3CAB8" strokeWidth="1" />
        {[38, 48, 72, 82].map((x) => <circle key={x} cx={x} cy="40" r="0.9" fill="#B8AE9C" />)}
        {[118, 130, 142].map((y) => (
          <g key={y} fill="#B8AE9C">
            <circle cx="41" cy={y} r="0.9" />
            <circle cx="79" cy={y} r="0.9" />
          </g>
        ))}
      </g>
      <path d="M50 22 Q55 18 60 17" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.35" />
      <line x1="60" y1="3" x2="60" y2="15" stroke="#8A90A6" strokeWidth="2" />
      <circle cx="60" cy="3" r="1.8" fill={ORANGE} />

      {/* star */}
      <path
        d="M60 119 L62.65 126.36 L70.46 126.6 L64.28 131.39 L66.47 138.9 L60 134.5 L53.53 138.9 L55.72 131.39 L49.54 126.6 L57.35 126.36Z"
        fill={ORANGE}
        stroke="#D9731A"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* glowing window */}
      <rect x="37" y="45" width="46" height="54" rx="19" fill={GLOW} opacity="0.35" />
      <rect x="40" y="48" width="40" height="48" rx="16" fill="#141B30" stroke={ORANGE} strokeWidth="2.5" />
      <path d="M46 64 Q47 55 55 52" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />

      <path d={HULL} fill="none" stroke={NAVY} strokeOpacity="0.5" strokeWidth="1.5" />

      {/* front armored legs */}
      {both(
        <g stroke={NAVY} strokeWidth="1.2" strokeLinejoin="round">
          <path d="M28 112 C14 128 8 152 8 178 L24 180 L30 152Z" fill={CREAM} />
          <path d="M22 120 L28 116 L29 132 L18 138Z" fill={ORANGE} />
          <path d="M8 178 L24 180 L22 188 L9 186Z" fill={ORANGE} />
          <path d={`M10 186 L21 188 L18 ${foot} L8 ${foot}Z`} fill="#2A3350" />
          <path d={`M2 ${foot} L22 ${foot} L20 ${foot + 4} L4 ${foot + 4}Z`} fill="#C9C0AE" />
          <rect x="7" y={foot + 1} width="10" height="1.5" fill={ORANGE} stroke="none" />
        </g>,
      )}
    </svg>
  )
}
