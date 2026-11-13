// The kid's ship. The kid's face shows in the window. Flame group has class js-flame for animation.
type Props = { kind?: 'boy' | 'girl'; flame?: boolean; legs?: boolean; className?: string }

export default function Rocket({ kind = 'boy', flame = false, legs = false, className }: Props) {
  return (
    <svg viewBox="0 0 120 300" className={className} aria-hidden="true">
      {legs && (
        <g className="js-legs" stroke="#C9CDD8" strokeWidth="4" strokeLinecap="round">
          <line x1="30" y1="180" x2="10" y2="226" />
          <line x1="90" y1="180" x2="110" y2="226" />
          <line x1="2" y1="226" x2="18" y2="226" />
          <line x1="102" y1="226" x2="118" y2="226" />
        </g>
      )}
      {flame && (
        <g className="js-flame" style={{ transformOrigin: '60px 192px', transformBox: 'view-box' }}>
          <path d="M34 192 Q60 320 86 192Z" fill="#FF7A3D" opacity="0.9" />
          <path d="M42 192 Q60 290 78 192Z" fill="#FFB347" />
          <path d="M50 192 Q60 250 70 192Z" fill="#FFF3B0" />
        </g>
      )}
      <path d="M40 170 L80 170 L86 194 L34 194Z" fill="#6B7186" />
      <path d="M28 128 L4 188 L4 214 L32 186Z" fill="#E5484D" />
      <path d="M92 128 L116 188 L116 214 L88 186Z" fill="#E5484D" />
      <path d="M60 6 C 90 40 96 90 94 172 L 26 172 C 24 90 30 40 60 6Z" fill="#F2F4FA" />
      <path d="M60 6 C 90 40 96 90 94 172 L 78 172 C 80 90 76 40 60 6Z" fill="#000" opacity="0.07" />
      <path d="M60 6 C 74 22 82 38 86 56 L 34 56 C 38 38 46 22 60 6Z" fill="#E5484D" />
      <rect x="27" y="140" width="66" height="9" fill="#2F6FDB" />
      <circle cx="60" cy="98" r="20" fill="#1B2440" stroke="#C9CDD8" strokeWidth="5" />
      <circle cx="60" cy="104" r="10" fill="#9A6040" />
      {(kind === 'girl' ? [[50, 96, 6], [70, 96, 6], [60, 92, 6]] : [[54, 94, 6], [62, 92, 6], [68, 97, 5]]).map(([cx, cy, r]) => (
        <circle key={cx} cx={cx} cy={cy} r={r} fill="#2B1A12" />
      ))}
      <circle cx="56" cy="105" r="1.4" fill="#1B1B1B" />
      <circle cx="64" cy="105" r="1.4" fill="#1B1B1B" />
      <path d="M56 109 Q60 112 64 109" stroke="#3A1E10" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M48 88 Q54 82 62 82" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
