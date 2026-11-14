import { useState, type ComponentType } from 'react'
import Button from '../../components/Button'
import CharacterFace from '../../components/CharacterFace'
import DeviceArt from '../../components/DeviceArt'
import { deviceById } from '../../content/worlds'
import type { MiniGameId } from '../../content/types'
import { en } from '../../content/i18n/en'
import { useGame } from '../../store/progress'
import LaserPing from './LaserPing'
import DustBuster from './DustBuster'
import PlanetHunter from './PlanetHunter'
import LunarLander from './LunarLander'
import StationSetup from './StationSetup'
import { buzz, sfx } from '../../audio/engine'

export type GameProps = { playing: boolean; onWin: () => void }

const GAMES: Record<MiniGameId, ComponentType<GameProps>> = {
  laser: LaserPing,
  dust: DustBuster,
  transit: PlanetHunter,
  lander: LunarLander,
  station: StationSetup,
}

// Shared frame for every mini-game: how-to card → play → "mission complete" with the real science.
// Never a fail state: kids can retry forever or skip straight to their card.
export default function MiniGame() {
  const device = deviceById[useGame((s) => s.deviceId)]
  const go = useGame((s) => s.go)
  const character = useGame((s) => s.character)
  const kind = device.miniGame!
  const text = en.mini[kind]
  const [phase, setPhase] = useState<'intro' | 'play' | 'won'>('intro')
  const [round, setRound] = useState(0)
  const Game = GAMES[kind]

  return (
    // no long-press menus or text selection while a finger holds a control
    <main className="relative h-svh touch-none select-none overflow-hidden bg-navy-950 [-webkit-touch-callout:none]">
      <Game key={round} playing={phase === 'play'} onWin={() => {
          sfx('fanfare')
          buzz([40, 60, 40, 60, 120])
          setPhase('won')
        }} />

      {/* safe-area padding keeps Skip clear of the notch on landscape iPhones */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-3 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
        <p className="flex min-w-0 items-center gap-2 rounded-full bg-black/45 py-1 pl-1 pr-4 backdrop-blur-sm">
          <DeviceArt device={device} pose="talk" photoClass="h-9 w-9 rounded-full" mascotClass="h-9 w-9" />
          <span className="truncate font-semibold">{text.title}</span>
        </p>
        <button
          type="button"
          onClick={() => go('card')}
          className="pointer-events-auto min-h-11 shrink-0 whitespace-nowrap rounded-full bg-black/45 px-4 font-semibold text-text-muted backdrop-blur-sm hover:text-text focus-visible:outline-3 focus-visible:outline-fact"
        >
          {en.mini.skip}
        </button>
      </header>

      {phase !== 'play' && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-navy-950/55 p-4 backdrop-blur-[3px]">
          <section className="relative w-full max-w-md animate-[pop_0.45s_cubic-bezier(.2,1.4,.4,1)] rounded-3xl bg-navy-900/95 p-6 text-center shadow-2xl ring-1 ring-white/10">
            <CharacterFace kind={character} mood={phase === 'won' ? 'laugh' : 'determined'} className="absolute -top-8 right-6 h-16 w-16 ring-4 ring-cta" />
            <DeviceArt device={device} pose={phase === 'won' ? 'celebrate' : 'talk'} photoClass="mx-auto -mt-14 mb-3 h-20 w-20 rounded-full ring-4 ring-cta" mascotClass="mx-auto -mt-16 mb-2 h-24 w-24 drop-shadow-[0_8px_12px_rgb(0_0_0/0.5)]" />
            <h1 className="text-3xl font-bold tracking-tight">{phase === 'won' ? en.mini.won : text.title}</h1>
            <p className="mt-3 text-lg leading-relaxed text-text-muted">{phase === 'won' ? text.fact : text.howTo}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              {phase === 'won' ? (
                <>
                  <Button className="w-full sm:w-auto" onClick={() => go('card')}>{en.mini.collect}</Button>
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setRound((r) => r + 1)
                      setPhase('play')
                    }}
                  >
                    {en.mini.again}
                  </Button>
                </>
              ) : (
                <Button className="w-full sm:w-auto" onClick={() => setPhase('play')}>{en.mini.start}</Button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
