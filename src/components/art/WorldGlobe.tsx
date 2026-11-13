import type { WorldId } from '../../content/types'

// The big globe on the map screen, 100×100 grid. Flags are HTML buttons placed on top (WorldMap),
// using each device's mapPos in % of this square.
// Moon maria are placed roughly where they are on the near side, so Apollo flags sit in the right seas.

function Moon() {
  const maria: [number, number, number, number][] = [
    [28, 46, 13, 18], [41, 31, 10, 8], [58, 35, 7, 6], [67, 49, 8, 7], [81, 40, 5, 5],
    [74, 61, 6, 7], [45, 63, 8, 6], [60, 58, 5, 4], [36, 58, 5, 6],
  ]
  return (
    <g>
      <defs>
        <radialGradient id="wg-moon" cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#F2F2F6" />
          <stop offset="0.6" stopColor="#CFCFD8" />
          <stop offset="1" stopColor="#8E93A8" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#wg-moon)" />
      {maria.map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#9DA2B6" opacity="0.75" transform={`rotate(${i * 23} ${x} ${y})`} />
      ))}
      {/* Tycho with rays */}
      <circle cx="45" cy="83" r="2.4" fill="#F7F7FA" />
      {[0, 40, 80, 130, 200, 250, 300].map((a) => (
        <path key={a} d={`M45 83 L${45 + Math.cos((a * Math.PI) / 180) * 18} ${83 + Math.sin((a * Math.PI) / 180) * 18}`} stroke="#F7F7FA" strokeWidth="0.7" opacity="0.5" />
      ))}
      {[[40, 45, 2.2], [22, 30, 1.6], [70, 76, 2], [84, 62, 1.4], [55, 18, 1.8]].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="none" stroke="#8E93A8" strokeWidth="0.6" />
      ))}
    </g>
  )
}

function Mars() {
  return (
    <g>
      <defs>
        <radialGradient id="wg-mars" cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#F59A5E" />
          <stop offset="0.6" stopColor="#E0703A" />
          <stop offset="1" stopColor="#8E3A1F" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#wg-mars)" />
      <path d="M30 10 Q50 2 70 10 Q60 16 50 14 Q40 16 30 10Z" fill="#FFF8E7" opacity="0.9" />
      {[[62, 44, 9, 14], [36, 60, 12, 6], [20, 40, 6, 9], [72, 66, 8, 5], [48, 30, 7, 4]].map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#9E4426" opacity="0.55" transform={`rotate(${i * 31} ${x} ${y})`} />
      ))}
      {/* Valles Marineris */}
      <path d="M18 56 Q34 52 48 56" stroke="#7A2F17" strokeWidth="1.6" fill="none" opacity="0.7" />
      {[[30, 72, 2], [58, 22, 1.6], [84, 50, 1.8]].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="none" stroke="#7A2F17" strokeWidth="0.6" />
      ))}
    </g>
  )
}

function Eros() {
  return (
    <g>
      <defs>
        <radialGradient id="wg-eros" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#D8C3A5" />
          <stop offset="0.7" stopColor="#A08868" />
          <stop offset="1" stopColor="#5E4E3C" />
        </radialGradient>
      </defs>
      {/* peanut shape: two lobes and a saddle */}
      <path d="M10 52 C8 30 30 22 44 32 C52 38 58 38 66 30 C82 18 98 36 92 56 C88 74 70 80 58 70 C52 66 46 66 40 72 C26 84 12 72 10 52 Z" fill="url(#wg-eros)" />
      {[[30, 50, 6], [72, 46, 7], [52, 54, 3], [80, 64, 3], [22, 64, 2.5]].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#5E4E3C" opacity="0.35" />
      ))}
    </g>
  )
}

export default function WorldGlobe({ world, className }: { world: WorldId; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="49" fill={world === 'mars' ? '#E0703A' : '#CFE2FF'} opacity="0.12" />
      {world === 'moon' && <Moon />}
      {world === 'mars' && <Mars />}
      {world === 'secret' && <Eros />}
    </svg>
  )
}
