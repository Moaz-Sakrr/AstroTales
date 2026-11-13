import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import Astronaut from '../components/Astronaut'
import WorldGlobe from '../components/art/WorldGlobe'
import DeviceArt from '../components/art/DeviceArt'
import { Coin, IconCheck, IconLock, IconRocket, IconSpark } from '../components/icons'
import { worlds, worldOrder } from '../content/worlds'
import { devices } from '../content/devices'
import { suits } from '../content/suits'
import type { WorldId } from '../content/types'
import { en } from '../content/i18n/en'
import { isWorldOpen, levelState, useProgress } from '../store/progress'
import { sfx } from '../audio/sfx'

gsap.registerPlugin(useGSAP)
const t = en.map

// Where the astronaut stands before visiting any flag in a world (% of the globe square).
const BASE: Record<WorldId, { x: number; y: number }> = {
  moon: { x: 40, y: 74 },
  mars: { x: 50, y: 76 },
  secret: { x: 28, y: 44 },
}

function Flag({ state }: { state: 'done' | 'next' | 'locked' }) {
  const color = state === 'done' ? '#2EC4B6' : state === 'next' ? '#FF4D4D' : '#8E9BC0'
  return (
    <svg viewBox="0 0 40 52" className="h-11 w-9 drop-shadow-[0_3px_2px_rgb(0_0_0/0.4)]" aria-hidden="true">
      <rect x="8" y="4" width="3.5" height="46" rx="1.5" fill="#E8ECF5" />
      <path d="M11.5 5 L36 12 L11.5 22 Z" fill={color} />
      <ellipse cx="10" cy="50" rx="8" ry="2.5" fill="#000" opacity="0.3" />
    </svg>
  )
}

export default function WorldMap() {
  const store = useProgress()
  const { world, coins, visited, character, suit, name } = store
  const [selected, setSelected] = useState<string | null>(null)
  const [nudge, setNudge] = useState<WorldId | null>(null)
  const [flying, setFlying] = useState(false)
  const root = useRef<HTMLElement>(null)
  const astro = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDivElement>(null)

  const w = worlds[world]
  const done = w.devices.filter((id) => visited.includes(id))
  const lastDone = done.length ? devices[done[done.length - 1]].mapPos : BASE[world]
  const pathPts = [BASE[world], ...w.devices.map((id) => devices[id].mapPos)]

  const { contextSafe } = useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.js-globe', { scale: 0.85, opacity: 0, duration: 0.8, ease: 'power3.out' })
        gsap.from('.js-flag', { y: -30, opacity: 0, stagger: 0.12, duration: 0.5, ease: 'bounce.out', delay: 0.3 })
        gsap.from('.js-level', { x: 30, opacity: 0, stagger: 0.08, duration: 0.5, delay: 0.2 })
        gsap.to('.js-globe-spin', { rotation: 3, yoyo: true, repeat: -1, duration: 6, ease: 'sine.inOut' })
      })
    },
    { scope: root, dependencies: [world], revertOnUpdate: true },
  )

  // Hop the astronaut to the flag, then open the device's story.
  const visit = contextSafe((id: string) => {
    if (flying) return
    const to = devices[id].mapPos
    setFlying(true)
    sfx.whoosh()
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !astro.current) {
      store.openDevice(id)
      return
    }
    gsap
      .timeline({ onComplete: () => store.openDevice(id) })
      .to(astro.current, { left: `${to.x}%`, top: `${to.y}%`, duration: 1.3, ease: 'power2.inOut' }, 0)
      .to(astro.current, { y: -50, duration: 0.65, ease: 'power2.out', yoyo: true, repeat: 1 }, 0)
      .to(astro.current, { scale: 1.3, duration: 0.3, yoyo: true, repeat: 1 }, 1.1)
  })

  const choose = (id: string) => {
    const st = levelState(id, visited)
    if (st === 'locked') {
      sfx.wrong()
      return
    }
    sfx.tap()
    setSelected(id)
    // On phones the card sits under the list: bring it into view.
    requestAnimationFrame(() =>
      dialog.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }),
    )
  }

  const pickWorld = (id: WorldId) => {
    if (id === world) return
    if (!isWorldOpen(id, coins)) {
      sfx.wrong()
      setNudge(id)
      setTimeout(() => setNudge(null), 600)
      return
    }
    store.flyTo(id)
  }

  const sel = selected ? devices[selected] : null

  return (
    <main ref={root} className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar title={w.name.en} />

      {/* World tabs */}
      <nav className="relative z-10 mx-auto flex max-w-3xl flex-wrap justify-center gap-2 px-3" aria-label={t.worldsNav}>
        {worldOrder.map((id) => {
          const open = isWorldOpen(id, coins)
          const here = id === world
          const fresh = open && !here && worlds[id].devices.every((d) => !visited.includes(d))
          return (
            <button
              key={id}
              type="button"
              onClick={() => pickWorld(id)}
              aria-current={here ? 'page' : undefined}
              aria-disabled={!open}
              className={`relative flex min-h-12 items-center gap-2 rounded-full px-4 font-semibold ring-2 transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fact ${
                here ? 'bg-paper text-ink ring-paper' : open ? 'bg-surface text-text ring-white/20 hover:ring-coin' : 'bg-navy-950/60 text-faint ring-white/10'
              } ${nudge === id ? 'shake' : ''}`}
            >
              {open ? here ? null : <IconRocket className="h-5 w-5" /> : <IconLock className="h-5 w-5" />}
              {worlds[id].name.en}
              {!open && (
                <span className="flex items-center gap-1 text-sm text-coin">
                  <Coin className="h-4 w-4" />
                  {coins}/{worlds[id].unlockCoins}
                </span>
              )}
              {fresh && (
                <span className="absolute -right-1 -top-2 rounded-full bg-coin px-2 text-xs font-bold text-on-cta">{t.newBadge}</span>
              )}
            </button>
          )
        })}
      </nav>
      {nudge && <p className="relative z-10 mt-2 text-center font-semibold text-coin" role="status">{t.worldLocked(worlds[nudge].unlockCoins)}</p>}

      <div className="relative z-10 mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        {/* Globe with flags */}
        <div className="js-globe relative mx-auto aspect-square w-full max-w-[min(92vw,600px)]">
          <div className="js-globe-spin absolute inset-0">
            <WorldGlobe world={world} className="h-full w-full drop-shadow-[0_0_40px_rgb(207_226_255/0.25)]" />
          </div>
          {/* dashed road linking the levels */}
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <polyline points={pathPts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#FFF8E7" strokeWidth="0.8" strokeDasharray="2 2" strokeLinecap="round" opacity="0.8" />
          </svg>

          {w.devices.map((id, i) => {
            const d = devices[id]
            const st = levelState(id, visited)
            return (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                aria-label={`${t.level(i + 1)}: ${d.nickname}${st === 'locked' ? ` (${en.common.locked})` : st === 'done' ? ` (${t.visited})` : ''}`}
                className="js-flag absolute flex min-h-12 min-w-12 -translate-x-[30%] -translate-y-[90%] flex-col items-center focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fact"
                // the playable flag always sits on top, so a locked neighbour can't steal the tap
                style={{ left: `${d.mapPos.x}%`, top: `${d.mapPos.y}%`, zIndex: st === 'next' ? 3 : st === 'done' ? 2 : 1 }}
              >
                {st === 'next' && <span className="pulse-ring absolute left-1 top-6 h-8 w-8 rounded-full bg-flag/50" />}
                <Flag state={st} />
                <span className={`-mt-1 flex items-center gap-0.5 rounded-full px-2 text-xs font-bold ${st === 'done' ? 'bg-fact text-navy-950' : st === 'next' ? 'bg-flag text-navy-950' : 'bg-navy-950/80 text-faint'}`}>
                  {st === 'done' ? <IconCheck className="h-3 w-3" /> : st === 'locked' ? <IconLock className="h-3 w-3" /> : null}
                  {i + 1}
                </span>
              </button>
            )
          })}

          {/* the kid's astronaut standing on the world */}
          <div
            ref={astro}
            className="pointer-events-none absolute w-[12%] -translate-x-[115%] -translate-y-full"
            style={{ left: `${lastDone.x}%`, top: `${lastDone.y}%` }}
            aria-hidden="true"
          >
            <Astronaut suit={suits[suit]} kind={character ?? 'boy'} emblem={suit} width={60} className="h-auto w-full" />
          </div>
        </div>

        {/* Level list */}
        <section className="flex min-w-0 flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold">{t.hello(name)}</h1>
            <p className="mt-1 text-text-muted">{t.pickFlag}</p>
            <p className="mt-1 text-sm font-semibold text-fact">{t.progress(done.length, w.devices.length)}</p>
          </div>
          {w.devices.map((id, i) => {
            const d = devices[id]
            const st = levelState(id, visited)
            return (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                aria-disabled={st === 'locked'}
                className={`js-level flex min-h-16 items-center gap-3 rounded-2xl p-2 pr-4 text-left ring-2 transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fact ${
                  selected === id ? 'bg-surface ring-coin' : st === 'locked' ? 'bg-navy-950/50 ring-white/5' : 'bg-surface/70 ring-white/10 hover:ring-white/30'
                }`}
              >
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${st === 'locked' ? 'bg-navy-950' : 'bg-navy-950/70'}`}>
                  {st === 'locked' ? <IconLock className="h-6 w-6 text-faint" /> : <DeviceArt id={id} className="h-12 w-12" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-faint">{t.level(i + 1)}</span>
                  <span className={`block truncate text-lg font-bold ${st === 'locked' ? 'text-faint' : ''}`}>{st === 'locked' ? '???' : d.nickname}</span>
                  <span className="block truncate text-sm text-text-muted">{st === 'locked' ? t.lockedLevel : d.location.label}</span>
                </span>
                {st === 'done' && <span className="rounded-full bg-fact/20 px-2 py-1 text-xs font-bold text-fact">{t.visited}</span>}
                {st === 'next' && <span className="rounded-full bg-flag/20 px-2 py-1 text-xs font-bold text-flag">{t.next}</span>}
              </button>
            )
          })}

          {sel && (
            <div ref={dialog} className="mt-2 flex flex-wrap items-center gap-3 rounded-3xl bg-paper p-4 text-ink shadow-xl" role="dialog" aria-label={sel.nickname}>
              <DeviceArt id={sel.id} className="h-20 w-20 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-hand text-2xl leading-tight">{sel.nickname}</p>
                <p className="text-sm text-ink/70">{sel.name}</p>
              </div>
              <Button onClick={() => visit(sel.id)} disabled={flying}>
                <IconRocket className="h-5 w-5" /> {t.go}
              </Button>
            </div>
          )}

          {visited.length > 0 && (
            <Button variant="ghost" className="mt-2 self-start" onClick={() => store.go('wrapped')}>
              <IconSpark className="h-5 w-5 text-coin" /> {t.wrapped}
            </Button>
          )}
        </section>
      </div>
    </main>
  )
}
