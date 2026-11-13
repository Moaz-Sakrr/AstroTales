import type { ReactNode } from 'react'
import { useProgress } from '../store/progress'
import { en } from '../content/i18n/en'
import { IconButton } from './Button'
import { Coin, IconBack, IconCards, IconHome, IconSound } from './icons'
import { sfx } from '../audio/sfx'

const t = en.common

type Props = { onBack?: () => void; title?: ReactNode; showCards?: boolean }

// Shared header: back/home, title, coins, card library, sound toggle.
export default function TopBar({ onBack, title, showCards = true }: Props) {
  const { coins, muted, go, toggleMute } = useProgress()
  return (
    <header className="relative z-20 flex items-center gap-2 px-3 py-3 sm:px-6">
      {onBack ? (
        <IconButton aria-label={t.back} onClick={onBack}>
          <IconBack />
        </IconButton>
      ) : (
        <IconButton aria-label={t.home} onClick={() => go('landing')}>
          <IconHome />
        </IconButton>
      )}
      <div className="min-w-0 flex-1 truncate px-1 text-lg font-bold">{title}</div>
      <div className="js-coins flex h-12 items-center gap-1.5 rounded-full bg-black/25 pl-2 pr-4 ring-1 ring-coin/40" aria-label={`${coins} ${t.coins}`}>
        <Coin className="js-coin-icon h-7 w-7" />
        <span className="text-lg font-bold tabular-nums text-coin">{coins}</span>
      </div>
      {showCards && (
        <IconButton aria-label={t.cards} onClick={() => { sfx.tap(); go('cards') }}>
          <IconCards />
        </IconButton>
      )}
      <IconButton aria-label={muted ? t.soundOff : t.soundOn} aria-pressed={!muted} onClick={toggleMute}>
        <IconSound off={muted} />
      </IconButton>
    </header>
  )
}
