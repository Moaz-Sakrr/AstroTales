// Decorative planets, a constellation and a comet for the landing sky. Pure decoration (aria-hidden).
// Each piece has a js- hook so Landing can animate it in; .float-* classes give a gentle bob.

function Saturn() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" overflow="visible">
      <defs>
        <radialGradient id="pl-sat" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFE7B0" />
          <stop offset="0.6" stopColor="#E8B85C" />
          <stop offset="1" stopColor="#9C6B23" />
        </radialGradient>
        {/* clip in the ring's rotated space: keeps only the half of the ring in front of the planet */}
        <clipPath id="pl-sat-front">
          <rect x="0" y="62" width="200" height="60" />
        </clipPath>
      </defs>
      <g transform="rotate(-14 100 62)">
        <ellipse cx="100" cy="62" rx="92" ry="20" fill="none" stroke="#F3D9A0" strokeWidth="7" opacity="0.5" />
      </g>
      <circle cx="100" cy="60" r="38" fill="url(#pl-sat)" />
      <path d="M66 48 Q100 40 134 48 M63 62 Q100 54 137 62 M68 76 Q100 70 132 76" stroke="#C99A47" strokeWidth="4" fill="none" opacity="0.6" />
      <g transform="rotate(-14 100 62)" clipPath="url(#pl-sat-front)">
        <ellipse cx="100" cy="62" rx="92" ry="20" fill="none" stroke="#FFF1D6" strokeWidth="7" />
      </g>
    </svg>
  )
}

function Jupiter() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <clipPath id="pl-jup">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <radialGradient id="pl-jup-shade" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <g clipPath="url(#pl-jup)">
        <rect width="100" height="100" fill="#E9C9A0" />
        {[14, 30, 44, 60, 74, 86].map((y, i) => (
          <rect key={y} x="0" y={y} width="100" height={i % 2 ? 7 : 10} fill={i % 2 ? '#C98F5E' : '#B5704A'} opacity="0.8" />
        ))}
        <ellipse cx="64" cy="64" rx="10" ry="6" fill="#C4523A" />
        <circle cx="50" cy="50" r="46" fill="url(#pl-jup-shade)" />
      </g>
    </svg>
  )
}

function SmallPlanet({ from, to }: { from: string; to: string }) {
  const id = `pl-${from.slice(1)}`
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full">
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#${id})`} />
    </svg>
  )
}

// A little "Big Dipper" so kids can spot a real star shape.
const DIPPER = [[0, 30], [26, 26], [48, 34], [70, 40], [78, 64], [108, 70], [114, 44]]

function Constellation() {
  const pts = DIPPER.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <svg viewBox="-6 16 128 64" className="h-full w-full" overflow="visible">
      <polyline points={`${pts} 70,40`} fill="none" stroke="#CFE2FF" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      {DIPPER.map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill="#FFF8E7" className="twinkle" style={{ animationDelay: `${(x % 7) * 0.4}s` }} />
      ))}
    </svg>
  )
}

export default function Planets() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="js-planet absolute right-[3%] top-[1%] w-24 sm:top-[8%] sm:w-40 lg:right-[8%] lg:top-[7%] lg:w-56">
        <div className="float-slow">
        <Saturn />
      </div>
      </div>
      <div className="js-planet absolute right-[34%] top-[5%] hidden w-14 md:block lg:w-20">
        <div className="float-mid">
        <Jupiter />
      </div>
      </div>
      <div className="js-planet absolute right-[26%] top-[30%] w-6 sm:w-8">
        <div className="float-fast">
        <SmallPlanet from="#F59A5E" to="#8E3A1F" />
      </div>
      </div>
      <div className="js-planet absolute left-[52%] top-[44%] hidden w-5 lg:block">
        <div className="float-mid">
        <SmallPlanet from="#9FE3FF" to="#2F6FDB" />
      </div>
      </div>
      <div className="js-planet absolute right-[40%] top-[17%] hidden w-36 lg:block">
        <Constellation />
      </div>
      <div className="comet absolute left-[8%] top-[4%] h-1 w-24" />
    </div>
  )
}
