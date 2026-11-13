// Simple stroke icons (no emoji in the UI). All decorative: the button around them carries the label.
type P = { className?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const IconBack = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M15 5l-7 7 7 7" /></svg>
)
export const IconHome = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" /></svg>
)
export const IconCards = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <rect x="7" y="3" width="13" height="17" rx="2" />
    <path d="M4 7v12a2 2 0 0 0 2 2h10" />
  </svg>
)
export const IconSound = ({ className = 'h-6 w-6', off = false }: P & { off?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M4 9h4l5-4v14l-5-4H4z" />
    {off ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a8.5 8.5 0 0 1 0 13" />}
  </svg>
)
export const IconLock = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)
export const IconCheck = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
)
export const IconX = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const IconNext = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M9 5l7 7-7 7" /></svg>
)
export const IconLink = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
)
export const IconRocket = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M12 2c3 2 5 6 5 10l-2 4H9l-2-4c0-4 2-8 5-10z" />
    <circle cx="12" cy="10" r="2" />
    <path d="M9 16l-3 4M15 16l3 4M12 17v4" />
  </svg>
)
export const IconSpark = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="currentColor" />
  </svg>
)

export function Coin({ className = 'h-6 w-6' }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#C9971F" />
      <circle cx="12" cy="11" r="9" fill="#FFC93C" />
      <circle cx="12" cy="11" r="6" fill="none" stroke="#C9971F" strokeWidth="1.6" />
      <path d="M12 7.5l1.1 2.4 2.6.3-1.9 1.8.5 2.6-2.3-1.3-2.3 1.3.5-2.6-1.9-1.8 2.6-.3z" fill="#C9971F" />
    </svg>
  )
}
