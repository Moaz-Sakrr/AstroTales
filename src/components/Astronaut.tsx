import { useId } from 'react'
import type { Suit } from '../content/suits'

type Props = { suit: Suit; kind?: 'boy' | 'girl'; x?: number; y?: number; width?: number; className?: string }

// [cx, cy, r] curls visible through the visor
const HAIR = {
  boy: [[78, 62, 11], [89, 53, 12], [103, 51, 12], [116, 56, 11], [124, 68, 8], [75, 72, 8]],
  girl: [[70, 58, 13], [130, 58, 13], [84, 52, 12], [100, 49, 12], [116, 52, 12], [66, 74, 9], [134, 74, 9]],
}

// Kid astronaut, waving. Lit from the left. Drawn on a 200×300 grid.
// shortcut: placeholder art until the team's boy/girl designs land; keep the suit/rim/accent props.
export default function Astronaut({ suit: s, kind = 'boy', x, y, width = 200, className }: Props) {
  const visor = useId().replace(/\W/g, '') + 'visor'
  return (
    <svg x={x} y={y} width={width} height={width * 1.5} viewBox="0 0 200 300" className={className} aria-hidden="true">
      <defs>
        <clipPath id={visor}>
          <ellipse cx="100" cy="72" rx="40" ry="36" />
        </clipPath>
      </defs>
      {/* backpack */}
      <rect x="50" y="106" width="100" height="106" rx="22" fill={s.accent} />
      <rect x="50" y="106" width="100" height="106" rx="22" fill="#000" opacity="0.18" />
      {/* legs + boots */}
      <rect x="70" y="198" width="27" height="58" rx="12" fill={s.suit} />
      <rect x="103" y="198" width="27" height="58" rx="12" fill={s.suit} />
      <rect x="66" y="244" width="35" height="26" rx="11" fill={s.rim} />
      <rect x="99" y="244" width="35" height="26" rx="11" fill={s.rim} />
      {/* left arm, relaxed */}
      <g transform="rotate(14 47 124)">
        <rect x="34" y="120" width="26" height="70" rx="13" fill={s.suit} />
        <rect x="34" y="150" width="26" height="8" fill={s.rim} />
      </g>
      <circle cx="31" cy="192" r="14" fill={s.rim} />
      {/* body */}
      <rect x="58" y="110" width="84" height="106" rx="32" fill={s.suit} />
      <rect x="118" y="118" width="22" height="92" rx="11" fill="#000" opacity="0.08" />
      <rect x="60" y="186" width="80" height="9" fill={s.rim} />
      {/* chest panel */}
      <rect x="79" y="140" width="42" height="32" rx="8" fill="#1B2440" />
      <circle cx="90" cy="151" r="4" fill="#FF4D4D" />
      <circle cx="100" cy="151" r="4" fill="#FFC93C" />
      <circle cx="110" cy="151" r="4" fill="#2EC4B6" />
      <rect x="86" y="160" width="28" height="5" rx="2.5" fill="#B9C4E0" />
      {/* right arm, waving */}
      <g transform="rotate(26 152 122)">
        <rect x="139" y="56" width="26" height="70" rx="13" fill={s.suit} />
        <rect x="139" y="88" width="26" height="8" fill={s.rim} />
      </g>
      <circle cx="180" cy="66" r="14" fill={s.rim} />
      {/* helmet */}
      <ellipse cx="100" cy="116" rx="38" ry="10" fill={s.rim} />
      <circle cx="100" cy="68" r="54" fill={s.suit} />
      <circle cx="100" cy="68" r="54" fill="none" stroke="#000" strokeOpacity="0.08" strokeWidth="2" />
      <rect x="148" y="56" width="10" height="18" rx="4" fill={s.rim} />
      <ellipse cx="100" cy="72" rx="40" ry="36" fill="#0E1A3A" />
      <g clipPath={`url(#${visor})`}>
        <circle cx="100" cy="82" r="25" fill="#9A6040" />
        {/* curly hair */}
        {HAIR[kind].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#2B1A12" />
        ))}
        {kind === 'girl' && <rect x="78" y="56" width="44" height="5" rx="2.5" fill={s.rim} />}
        <circle cx="91" cy="83" r="3.2" fill="#1B1B1B" />
        <circle cx="109" cy="83" r="3.2" fill="#1B1B1B" />
        <circle cx="92" cy="82" r="1" fill="#fff" />
        <circle cx="110" cy="82" r="1" fill="#fff" />
        <circle cx="85" cy="91" r="4" fill="#FF8FB1" opacity="0.45" />
        <circle cx="115" cy="91" r="4" fill="#FF8FB1" opacity="0.45" />
        <path d="M92 93 Q100 100 108 93" stroke="#3A1E10" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="100" cy="72" rx="40" ry="36" fill="#4FA3E0" opacity="0.18" />
      </g>
      <path d="M72 60 Q82 42 104 40" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
      <circle cx="122" cy="50" r="4" fill="#fff" opacity="0.5" />
    </svg>
  )
}
