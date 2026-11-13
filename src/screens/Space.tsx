import { useEffect, useRef, useState } from 'react'
import { BODIES, createSolarSystem, type BodyId } from '../space/solarSystem'
import Button from '../components/Button'
import CoinBadge from '../components/CoinBadge'
import { en } from '../content/i18n/en'
import type { WorldId } from '../content/types'
import { previousWorld, worlds } from '../content/worlds'
import { useGame, worldComplete } from '../store/progress'

const t = en.space
type Phase = 'loading' | 'intro' | 'free' | 'flight' | 'arrived'
const isWorld = (id: BodyId): id is WorldId => id in worlds

export default function Space() {
  const mount = useRef<HTMLDivElement>(null)
  const labels = useRef<HTMLDivElement>(null)
  const engine = useRef<ReturnType<typeof createSolarSystem> | null>(null)
  const done = useGame((s) => s.done)
  const land = useGame((s) => s.land)
  const [phase, setPhase] = useState<Phase>('loading')
  const [target, setTarget] = useState<WorldId | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [fading, setFading] = useState(false)

  // a world opens once the one before it is finished
  const playable = (id: BodyId) => {
    if (!isWorld(id)) return false
    const prev = previousWorld(id)
    return !prev || worldComplete(prev, done)
  }

  const pick = (id: BodyId) => {
    if (!isWorld(id)) return setToast(`${BODIES.find((b) => b.id === id)!.name}: ${t.later}`)
    if (!playable(id)) return setToast(t.locked(worlds[previousWorld(id)!].name))
    setToast(null)
    setTarget(id)
    setPhase('flight')
    engine.current?.flyTo(id)
  }
  const pickRef = useRef(pick)
  pickRef.current = pick

  useEffect(() => {
    const { shipAt, travelTo } = useGame.getState()
    const sys = createSolarSystem({
      parent: mount.current!,
      labels: labels.current!,
      shipAt,
      skipIntro: travelTo !== null || shipAt !== 'earth',
      onReady: () => setPhase('intro'),
      onIntroDone: () => {
        setPhase('free')
        if (travelTo) pickRef.current(travelTo)
      },
      onArrive: () => setPhase('arrived'),
      onPick: (id) => pickRef.current(id),
    })
    engine.current = sys
    return sys.dispose
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(id)
  }, [toast])

  const worldName = target ? BODIES.find((b) => b.id === target)!.name : ''

  return (
    <main className="relative h-svh overflow-hidden bg-black">
      <div ref={mount} className="absolute inset-0" />

      {/* planet name tags, positioned every frame by the engine */}
      <div ref={labels} className="pointer-events-none absolute inset-0" aria-label="Planets">
        {BODIES.map((b) => {
          const isPlayable = playable(b.id)
          const isWorldBody = isWorld(b.id)
          return (
            <div key={b.id} data-body={b.id} className="absolute left-0 top-0 invisible py-2">
              <button
                type="button"
                onClick={() => pick(b.id)}
                className={`pointer-events-auto flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-semibold backdrop-blur-sm transition ${
                  isPlayable
                    ? 'bg-cta text-on-cta shadow-[0_0_0_4px_rgb(255_201_60/0.3)] motion-safe:animate-pulse'
                    : isWorldBody
                      ? 'bg-navy-900/70 text-text'
                      : 'bg-black/30 text-text-muted hover:text-text'
                }`}
                aria-label={isPlayable ? `${b.name}. ${t.playable}` : isWorldBody ? `${b.name}. ${t.locked(worlds[previousWorld(b.id as WorldId)!].name)}` : `${b.name}. ${t.later}`}
              >
                {isWorldBody && !isPlayable && (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
                    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" fill="none" />
                  </svg>
                )}
                {b.name}
              </button>
            </div>
          )
        })}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
        <p aria-live="polite" className="max-w-xs rounded-2xl bg-black/40 px-4 py-2 text-sm text-text backdrop-blur-sm sm:text-base">
          {phase === 'intro' && t.leaving}
          {phase === 'free' && t.hint}
          {phase === 'flight' && t.flying(worldName)}
          {phase === 'arrived' && worldName}
        </p>
        <CoinBadge className="pointer-events-auto" />
      </header>

      {toast && (
        <p role="status" className="absolute inset-x-0 top-20 mx-auto w-fit max-w-[90vw] rounded-full bg-navy-900/90 px-5 py-2.5 text-center font-semibold">
          {toast}
        </p>
      )}

      {phase === 'arrived' && target && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-6 pb-10">
          <Button
            className="text-xl"
            onClick={() => {
              setFading(true)
              setTimeout(() => land(target), 700)
            }}
          >
            {t.land(worldName)}
          </Button>
        </div>
      )}

      <p className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-white/40">Planet textures: Solar System Scope (CC BY 4.0), based on NASA data</p>

      {phase === 'loading' && <div className="absolute inset-0 grid place-items-center bg-black text-text-muted">{t.loading}</div>}
      <div className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-700 ${fading ? 'opacity-100' : 'opacity-0'}`} />
    </main>
  )
}
