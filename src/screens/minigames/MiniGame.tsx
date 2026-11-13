import { useState, type ComponentType } from 'react'
import Button from '../../components/Button'
import { deviceById } from '../../content/worlds'
import type { MiniGameId } from '../../content/types'
import { en } from '../../content/i18n/en'
import { useGame } from '../../store/progress'
import LaserPing from './LaserPing'
import DustBuster from './DustBuster'
import PlanetHunter from './PlanetHunter'
import LunarLander from './LunarLander'

export type GameProps = { playing: boolean; onWin: () => void }

const GAMES: Record<MiniGameId, ComponentType<GameProps>> = {
  laser: LaserPing,
  dust: DustBuster,
  transit: PlanetHunter,
  lander: LunarLander,
}

// Shared frame for every mini-game: how-to card → play → "mission complete" with the real science.
// Never a fail state: kids can retry forever or skip straight to their card.
export default function MiniGame() {
  const device = deviceById[useGame((s) => s.deviceId)]
  const go = useGame((s) => s.go)
  const kind = device.miniGame!
  const text = en.mini[kind]
  const [phase, setPhase] = useState<'intro' | 'play' | 'won'>('intro')
  const [round, setRound] = useState(0)
  const Game = GAMES[kind]

  return (
    <main className="relative h-svh touch-none select-none overflow-hidden bg-navy-950">
      <Game key={round} playing={phase === 'play'} onWin={() => setPhase('won')} />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-3">
        <p className="flex items-center gap-2 rounded-full bg-black/45 py-1 pl-1 pr-4 backdrop-blur-sm">
          <img src={device.photos[0].src} alt="" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-semibold">{text.title}</span>
        </p>
        <button
          type="button"
          onClick={() => go('card')}
          className="pointer-events-auto min-h-11 rounded-full bg-black/45 px-4 font-semibold text-text-muted backdrop-blur-sm hover:text-text focus-visible:outline-3 focus-visible:outline-fact"
        >
          {en.mini.skip}
        </button>
      </header>

      {phase !== 'play' && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-navy-950/55 p-4 backdrop-blur-[3px]">
          <section className="w-full max-w-md animate-[pop_0.45s_cubic-bezier(.2,1.4,.4,1)] rounded-3xl bg-navy-900/95 p-6 text-center shadow-2xl ring-1 ring-white/10">
            <img src={device.photos[0].src} alt="" className="mx-auto -mt-14 mb-3 h-20 w-20 rounded-full object-cover ring-4 ring-cta" />
            <h1 className="text-3xl font-bold tracking-tight">{phase === 'won' ? en.mini.won : text.title}</h1>
            <p className="mt-3 text-lg leading-relaxed text-text-muted">{phase === 'won' ? text.fact : text.howTo}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {phase === 'won' ? (
                <>
                  <Button onClick={() => go('card')}>{en.mini.collect}</Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRound((r) => r + 1)
                      setPhase('play')
                    }}
                  >
                    {en.mini.again}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setPhase('play')}>{en.mini.start}</Button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
