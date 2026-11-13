import { useGame } from '../store/progress'

export function Coin({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#FFC93C" stroke="#C9971F" strokeWidth="2" />
      <path d="M10 5.5l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="#FFF3B0" />
    </svg>
  )
}

export default function CoinBadge({ className = '' }: { className?: string }) {
  const coins = useGame((s) => s.coins)
  return (
    <p className={`flex min-h-11 items-center gap-2 rounded-full bg-black/40 px-4 font-bold text-cta backdrop-blur-sm ${className}`} aria-label={`${coins} coins`}>
      <Coin />
      <span className="js-coins tabular-nums">{coins}</span>
    </p>
  )
}
