// Friendly illustrations of the six machines, drawn on a 200×200 grid, standing on y≈190.
// Lit from the left like the rest of the art. shortcut: simplified shapes, not engineering drawings.

type Props = { id: string; className?: string; dust?: number; title?: string }

const GOLD = ['#F7D774', '#D9A93A', '#A8741F']

function Reflecto() {
  const cells = []
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++) cells.push(<circle key={`${r}-${c}`} cx={52 + c * 10.4} cy={70 + r * 7.6} r={3.6} fill="url(#rf-cube)" />)
  return (
    <g>
      <defs>
        <radialGradient id="rf-cube" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#E9F6FF" />
          <stop offset="0.5" stopColor="#5AA8F0" />
          <stop offset="1" stopColor="#1B2F5E" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="188" rx="70" ry="8" fill="#000" opacity="0.25" />
      {/* legs */}
      <path d="M60 150 L52 188 M140 150 L150 188" stroke="#9DA2B6" strokeWidth="6" strokeLinecap="round" />
      <rect x="44" y="148" width="112" height="10" rx="3" fill="#B9BDCC" />
      {/* tilted panel */}
      <g transform="skewX(-8) translate(18 0)">
        <rect x="40" y="58" width="122" height="88" rx="6" fill="#CFCFD8" stroke="#8E93A8" strokeWidth="3" />
        {cells}
        <path d="M46 62 L100 62" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
      </g>
      <circle cx="150" cy="70" r="4" fill="#fff" className="glint" />
    </g>
  )
}

function Eagle() {
  return (
    <g>
      <defs>
        <linearGradient id="eg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD[0]} />
          <stop offset="0.5" stopColor={GOLD[1]} />
          <stop offset="1" stopColor={GOLD[2]} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="190" rx="90" ry="8" fill="#000" opacity="0.25" />
      {/* legs + footpads */}
      <path d="M48 112 L18 180 M152 112 L182 180 M74 120 L62 184 M126 120 L138 184" stroke="#B9BDCC" strokeWidth="6" strokeLinecap="round" />
      {[18, 62, 138, 182].map((x) => <ellipse key={x} cx={x} cy={184} rx="13" ry="5" fill="#9DA2B6" />)}
      {/* octagonal gold body with foil wrinkles */}
      <path d="M44 74 L70 58 L130 58 L156 74 L156 118 L130 134 L70 134 L44 118 Z" fill="url(#eg-gold)" stroke="#8A5E17" strokeWidth="2" />
      <path d="M58 80 L80 96 M98 70 L110 100 M128 82 L140 110 M66 108 L92 122" stroke="#FFF1B8" strokeWidth="2" opacity="0.6" />
      {/* engine bell */}
      <path d="M86 134 L114 134 L120 152 L80 152 Z" fill="#4A4F63" />
      {/* ladder with plaque */}
      <path d="M92 134 L84 184 M108 134 L116 184" stroke="#CFCFD8" strokeWidth="3" />
      {[146, 158, 170].map((y) => <path key={y} d={`M${88 - (y - 140) * 0.12} ${y} L${112 + (y - 140) * 0.12} ${y}`} stroke="#CFCFD8" strokeWidth="3" />)}
      <rect x="91" y="138" width="18" height="8" rx="1.5" fill="#E8ECF5" stroke="#8E93A8" />
    </g>
  )
}

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy="162" r="22" fill="#6F7590" />
      <circle cx={cx} cy="162" r="22" fill="url(#rv-mesh)" />
      <circle cx={cx} cy="162" r="22" fill="none" stroke="#3F4458" strokeWidth="3" />
      <circle cx={cx} cy="162" r="6" fill="#3F4458" />
    </g>
  )
}

function Rover() {
  return (
    <g>
      <defs>
        <pattern id="rv-mesh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 L0 6 M0 0 L6 0" stroke="#B9BDCC" strokeWidth="1.2" />
        </pattern>
      </defs>
      <ellipse cx="100" cy="188" rx="92" ry="7" fill="#000" opacity="0.25" />
      {/* chassis */}
      <rect x="22" y="128" width="156" height="12" rx="4" fill="#9DA2B6" />
      <path d="M26 128 Q46 106 70 128 M130 128 Q154 106 174 128" fill="#CFCFD8" stroke="#8E93A8" strokeWidth="2" />
      {/* seats */}
      <rect x="78" y="104" width="22" height="24" rx="4" fill="#4A6FB5" />
      <rect x="104" y="104" width="22" height="24" rx="4" fill="#4A6FB5" />
      {/* console + camera */}
      <rect x="62" y="96" width="10" height="32" fill="#8E93A8" />
      <rect x="56" y="88" width="22" height="12" rx="2" fill="#E8ECF5" />
      <rect x="48" y="86" width="12" height="9" rx="2" fill="#1B2440" />
      {/* umbrella antenna */}
      <path d="M150 128 L150 72" stroke="#8E93A8" strokeWidth="3" />
      <path d="M126 70 Q150 40 174 70 Z" fill="#E8ECF5" stroke="#8E93A8" strokeWidth="2" />
      <Wheel cx={48} />
      <Wheel cx={152} />
    </g>
  )
}

function Opportunity({ dust = 0 }: { dust?: number }) {
  const cells = []
  for (let i = 0; i < 9; i++) cells.push(<rect key={i} x={18 + i * 18} y={98} width={15} height={14} rx="1.5" fill="#1F3E86" />)
  return (
    <g>
      <ellipse cx="100" cy="190" rx="92" ry="7" fill="#000" opacity="0.25" />
      {/* rocker-bogie legs + six wheels */}
      <path d="M40 126 L26 164 M40 126 L68 164 M160 126 L132 164 M160 126 L174 164" stroke="#8E93A8" strokeWidth="5" strokeLinecap="round" />
      {[26, 68, 100, 132, 174].map((x) => (
        <g key={x}>
          <circle cx={x} cy="172" r="13" fill="#3F4458" />
          <circle cx={x} cy="172" r="5" fill="#9DA2B6" />
        </g>
      ))}
      {/* body */}
      <rect x="54" y="112" width="92" height="30" rx="5" fill="#E8ECF5" stroke="#8E93A8" strokeWidth="2" />
      {/* solar deck */}
      <rect x="12" y="94" width="176" height="22" rx="3" fill="#2B4C9A" stroke="#8E93A8" strokeWidth="2" />
      {cells}
      {/* dust on the panels (dust mini-game shows this fading) */}
      <rect x="12" y="94" width="176" height="22" rx="3" fill="#C9844A" opacity={dust * 0.85} />
      {/* mast + camera head */}
      <rect x="140" y="40" width="6" height="56" fill="#CFCFD8" />
      <rect x="126" y="28" width="34" height="16" rx="4" fill="#E8ECF5" stroke="#8E93A8" strokeWidth="2" />
      <circle cx="136" cy="36" r="4" fill="#1B2440" />
      <circle cx="150" cy="36" r="4" fill="#1B2440" />
      {/* antenna */}
      <path d="M60 94 L56 52" stroke="#CFCFD8" strokeWidth="2.5" />
      <circle cx="56" cy="50" r="3" fill="#CFCFD8" />
    </g>
  )
}

function Ingenuity() {
  return (
    <g>
      <ellipse cx="100" cy="190" rx="50" ry="6" fill="#000" opacity="0.25" />
      {/* legs */}
      <path d="M84 132 L60 186 M116 132 L140 186 M92 134 L84 186 M108 134 L116 186" stroke="#CFCFD8" strokeWidth="3" strokeLinecap="round" />
      {/* body */}
      <rect x="80" y="110" width="40" height="28" rx="4" fill="#E8ECF5" stroke="#8E93A8" strokeWidth="2" />
      <rect x="84" y="116" width="14" height="8" rx="2" fill="#C9971F" />
      {/* mast */}
      <rect x="97" y="40" width="6" height="72" fill="#9DA2B6" />
      {/* two rotors (spin class animates them) */}
      <g className="rotor" style={{ transformOrigin: '100px 86px' }}>
        <path d="M18 86 L182 86" stroke="#4A4F63" strokeWidth="6" strokeLinecap="round" />
      </g>
      <g className="rotor rotor-rev" style={{ transformOrigin: '100px 64px' }}>
        <path d="M24 64 L176 64" stroke="#6F7590" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* solar panel on top */}
      <rect x="80" y="30" width="40" height="10" rx="2" fill="#2B4C9A" stroke="#8E93A8" strokeWidth="1.5" />
    </g>
  )
}

function Near() {
  return (
    <g transform="rotate(-12 100 120)">
      <ellipse cx="100" cy="186" rx="80" ry="7" fill="#000" opacity="0.25" />
      {/* four solar panels */}
      {[
        [10, 104, 54, 30],
        [136, 104, 54, 30],
      ].map(([x, y, w, h]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={h} rx="3" fill="#2B4C9A" stroke="#8E93A8" strokeWidth="2" />
          <path d={`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}`} stroke="#5AA8F0" strokeWidth="1.5" />
        </g>
      ))}
      <rect x="84" y="150" width="32" height="30" rx="3" fill="#2B4C9A" stroke="#8E93A8" strokeWidth="2" />
      {/* gold octagon body */}
      <path d="M70 100 L84 88 L116 88 L130 100 L130 140 L116 152 L84 152 L70 140 Z" fill="#D9A93A" stroke="#8A5E17" strokeWidth="2" />
      <path d="M80 104 L96 118 M108 96 L118 130" stroke="#FFF1B8" strokeWidth="2" opacity="0.6" />
      {/* dish antenna */}
      <path d="M62 86 Q100 36 138 86 Z" fill="#E8ECF5" stroke="#8E93A8" strokeWidth="2" />
      <path d="M100 74 L100 52" stroke="#8E93A8" strokeWidth="2.5" />
      <circle cx="100" cy="50" r="3.5" fill="#8E93A8" />
    </g>
  )
}

export default function DeviceArt({ id, className, dust, title }: Props) {
  return (
    <svg viewBox="0 0 200 200" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} overflow="visible">
      {id === 'reflecto' && <Reflecto />}
      {id === 'eagle' && <Eagle />}
      {id === 'rover' && <Rover />}
      {id === 'opportunity' && <Opportunity dust={dust} />}
      {id === 'ingenuity' && <Ingenuity />}
      {id === 'near' && <Near />}
    </svg>
  )
}
