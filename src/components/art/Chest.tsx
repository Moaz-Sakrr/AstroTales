// Treasure chest with one lock light per quiz card. Lid is its own group so it can swing open.
export default function Chest({ solved, total, className }: { solved: number; total: number; className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true" overflow="visible">
      <defs>
        <linearGradient id="ch-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B5704A" />
          <stop offset="1" stopColor="#7A4528" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="144" rx="80" ry="6" fill="#000" opacity="0.3" />
      {/* glow that appears when the lid opens */}
      <ellipse className="js-chest-glow" cx="100" cy="66" rx="70" ry="30" fill="#FFC93C" opacity="0" />
      {/* base */}
      <rect x="24" y="66" width="152" height="76" rx="8" fill="url(#ch-wood)" stroke="#5E331C" strokeWidth="3" />
      <rect x="24" y="66" width="152" height="14" fill="#C9971F" />
      <rect x="40" y="66" width="12" height="76" fill="#C9971F" />
      <rect x="148" y="66" width="12" height="76" fill="#C9971F" />
      {/* lock lights */}
      {Array.from({ length: total }, (_, i) => (
        <circle key={i} cx={100 + (i - (total - 1) / 2) * 22} cy="104" r="8" fill={i < solved ? '#FFC93C' : '#3F2A1C'} stroke="#C9971F" strokeWidth="2.5" />
      ))}
      {/* lid */}
      <g className="js-lid" style={{ transformOrigin: '100px 66px' }}>
        <path d="M24 66 L24 46 Q100 6 176 46 L176 66 Z" fill="url(#ch-wood)" stroke="#5E331C" strokeWidth="3" />
        <path d="M40 66 L40 36 M160 66 L160 36" stroke="#C9971F" strokeWidth="12" />
        <rect x="88" y="54" width="24" height="20" rx="4" fill="#C9971F" />
      </g>
    </svg>
  )
}
