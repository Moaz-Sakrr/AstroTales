import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Button from '../components/Button'
import CoinBadge, { Coin } from '../components/CoinBadge'
import Rocket from '../components/Rocket'
import Astronaut from '../components/Astronaut'
import { worlds } from '../content/worlds'
import type { Device } from '../content/types'
import { en } from '../content/i18n/en'
import { useGame, worldComplete } from '../store/progress'

gsap.registerPlugin(useGSAP)
const t = en.level

// Level spots in % of the map, zigzagging bottom → top like a candy-crush path, for any number of levels.
const ZIGZAG = [28, 70, 34, 66, 30, 68]
const spotsFor = (n: number) => Array.from({ length: n }, (_, i) => ({ x: ZIGZAG[i % ZIGZAG.length], y: 86 - i * (72 / Math.max(n - 1, 1)) }))
// The secret sits beside the last stop, on the other side, so it never overlaps the path. A bit lower, not higher:
// its stack (button + label + coin price) is taller, and higher up it would slide under the header on a phone.
const secretSpotFor = (last: { x: number; y: number }) => ({ x: last.x < 50 ? 74 : 26, y: last.y + 6 })
const PILL = 'flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-black/40 px-3 font-semibold text-text backdrop-blur-sm hover:bg-black/60 focus-visible:outline-3 focus-visible:outline-fact'

export default function LevelMap() {
  const root = useRef<HTMLElement>(null)
  const { world: worldId, done, secrets, coins, justLanded, character } = useGame()
  const { go, open, playDevice, unlockSecret, travel } = useGame.getState()
  const world = worlds[worldId]
  const [msg, setMsg] = useState<string | null>(null)
  const [landing, setLanding] = useState(justLanded)

  const levels = world.levels
  const current = levels.findIndex((d) => !done.includes(d.id)) // -1 = all done
  const spots = spotsFor(levels.length)
  const last = spots[spots.length - 1]
  const secretSpot = secretSpotFor(last)
  const complete = worldComplete(world.id, done)

  useGSAP(
    () => {
      if (!landing) return
      useGame.setState({ justLanded: false })
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => setLanding(false))
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ onComplete: () => setLanding(false) })
          .from('.js-lander', { y: '-110vh', duration: 2.2, ease: 'power2.out' })
          .to('.js-flame', { scaleY: 0, duration: 0.3 }, '-=0.3')
          .fromTo('.js-dust', { scale: 0.2, opacity: 0.8 }, { scale: 2.2, opacity: 0, x: (i) => (i - 3) * 40, duration: 1.2, stagger: 0.03 }, '-=0.4')
          .from('.js-touchdown', { scale: 0.6, opacity: 0, duration: 0.4, ease: 'back.out(2)' }, '<')
          .to('.js-landing', { opacity: 0, duration: 0.6, delay: 0.6 })
        gsap.to('.js-flame', { scaleY: 0.8, repeat: -1, yoyo: true, duration: 0.07 })
      })
    },
    { scope: root },
  )

  const state = (d: Device, i: number) => (done.includes(d.id) ? 'done' : i === current ? 'current' : 'locked')

  const onSecret = (d: Device) => {
    if (secrets.includes(d.id)) return done.includes(d.id) ? open('profile', d.id) : playDevice(d.id)
    const cost = d.secret!.cost
    if (!unlockSecret(d.id, cost)) setMsg(t.needCoins(cost - coins))
    else setMsg(null)
  }

  return (
    <main ref={root} className="relative flex h-svh flex-col overflow-hidden bg-navy-950">
      {/* the world's real surface texture, darkened so the path pops */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${world.texture})` }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgb(8_21_43/0.75)_100%)]" />

      <header className="relative z-10 flex items-center justify-between gap-2 p-3 sm:p-4">
        {/* compact pills, not <Button>: four controls must fit a 375px phone */}
        <button type="button" onClick={() => go('space')} aria-label={t.back} className={PILL}>
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
          <span className="hidden sm:inline">{t.back}</span>
        </button>
        <h1 className="truncate rounded-full bg-black/40 px-3 py-1.5 text-lg font-bold backdrop-blur-sm sm:px-4 sm:text-xl">{world.name}</h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => open('library')} className={`${PILL} ${complete ? '' : 'max-md:hidden'}`}>{t.cards}</button>
          <CoinBadge />
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-xl flex-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d={spots.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `C${spots[i - 1].x},${(spots[i - 1].y + p.y) / 2} ${p.x},${(spots[i - 1].y + p.y) / 2} ${p.x},${p.y}`)).join(' ')}
            stroke="#FFF1D6" strokeWidth="1.6" strokeDasharray="1 16" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" opacity="0.8"
            style={{ strokeWidth: 8 }}
          />
          {world.secrets.length > 0 && (
            <path d={`M${last.x},${last.y} Q${(last.x + secretSpot.x) / 2},${last.y - 8} ${secretSpot.x},${secretSpot.y}`} stroke="#C9A7FF" fill="none" strokeDasharray="1 16" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 6 }} opacity="0.7" />
          )}
        </svg>

        {levels.map((d, i) => {
          const s = state(d, i)
          return (
            <div key={d.id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${spots[i].x}%`, top: `${spots[i].y}%` }}>
              {s === 'current' && (
                <Astronaut kind={character} pose="threeq" width={44} className="absolute -left-12 bottom-6 motion-safe:animate-bounce" />
              )}
              <LevelButton device={d} index={i + 1} state={s} onClick={() => (s === 'done' ? open('profile', d.id) : s === 'current' ? playDevice(d.id) : undefined)} />
            </div>
          )
        })}

        {world.secrets.map((d) => {
          const unlocked = secrets.includes(d.id)
          return (
            <div key={d.id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${secretSpot.x}%`, top: `${secretSpot.y}%` }}>
              <LevelButton device={d} state={done.includes(d.id) ? 'done' : unlocked ? 'current' : 'secret'} onClick={() => onSecret(d)} />
              {!unlocked && (
                <span className="mt-1 flex items-center gap-1 rounded-full bg-[#6B4BD8] px-2.5 py-0.5 text-sm font-bold">
                  <Coin className="h-4 w-4" /> {d.secret!.cost}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* phones: the next step sits under the thumb (laptops keep the header pill and tap the map) */}
      {!complete && (
        <nav className="relative z-10 flex items-center gap-3 bg-gradient-to-t from-navy-950 via-navy-950/85 to-transparent px-4 pb-5 pt-6 md:hidden">
          <button type="button" onClick={() => open('library')} className={`${PILL} min-h-12 px-4`}>
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true"><rect x="3" y="4" width="9" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.8" fill="none" /><path d="M14 6l3 1-3 11-2-.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" /></svg>
            {t.cards}
          </button>
          {current >= 0 && (
            <Button className="min-w-0 flex-1" onClick={() => playDevice(levels[current].id)}>
              <span className="truncate">{t.play(levels[current].nickname)}</span>
            </Button>
          )}
        </nav>
      )}

      {msg && <p role="status" className="absolute inset-x-4 bottom-24 z-10 mx-auto max-w-md rounded-2xl bg-navy-900/95 p-3 text-center font-semibold">{msg}</p>}

      {complete && (
        <footer className="relative z-10 flex flex-col items-center gap-3 bg-gradient-to-t from-navy-950 to-transparent p-5 pb-8 text-center">
          <p className="text-lg font-semibold">{world.next ? t.worldDone(world.name) : t.allDone}</p>
          {world.next ? <Button onClick={() => travel(world.next!)}>{t.flyNext(worlds[world.next].name)}</Button> : <Button onClick={() => open('library')}>{t.cards}</Button>}
        </footer>
      )}

      {landing && (
        <div className="js-landing pointer-events-none absolute inset-0 z-20 grid place-items-center">
          <div className="js-lander relative w-28">
            <Rocket flame legs />
          </div>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="js-dust absolute left-1/2 top-[62%] -ml-8 h-16 w-16 rounded-full bg-[#CFCFD8]/70 opacity-0 blur-sm" />
          ))}
          <p className="js-touchdown absolute top-[20%] text-5xl font-bold text-cta">{t.touchdown}</p>
        </div>
      )}
    </main>
  )
}

type LevelState = 'done' | 'current' | 'locked' | 'secret'

function LevelButton({ device, index, state, onClick }: { device: Device; index?: number; state: LevelState; onClick: () => void }) {
  const ring = { done: 'ring-cta', current: 'ring-fact', locked: 'ring-white/20', secret: 'ring-[#C9A7FF]' }[state]
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={state === 'locked'}
        aria-label={`${device.nickname}${state === 'locked' ? ' (locked)' : state === 'done' ? ' (done, open profile)' : ''}`}
        className={`relative h-20 w-20 rounded-full ring-[6px] ${ring} bg-navy-900 shadow-[0_8px_0_rgb(0_0_0/0.35)] transition hover:scale-105 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact disabled:hover:scale-100 sm:h-24 sm:w-24 ${
          state === 'current' ? 'motion-safe:animate-[pulse-ring_1.6s_ease-out_infinite]' : ''
        }`}
      >
        <img src={device.photos[0].src} alt="" className={`h-full w-full rounded-full object-cover ${state === 'locked' || state === 'secret' ? 'opacity-40 grayscale' : ''}`} />
        {index && <span className="absolute -left-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-navy-700 text-sm font-bold ring-2 ring-white/30">{index}</span>}
        {(state === 'locked' || state === 'secret') && (
          <svg viewBox="0 0 16 16" className="absolute inset-0 m-auto h-8 w-8 text-white" aria-hidden="true">
            <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
            <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" fill="none" />
          </svg>
        )}
        {state === 'done' && (
          <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-cta text-on-cta">
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
          </span>
        )}
      </button>
      <span className="mt-2 whitespace-nowrap rounded-full bg-black/50 px-3 py-0.5 text-sm font-semibold backdrop-blur-sm">{state === 'secret' ? en.level.secret : device.nickname}</span>
    </>
  )
}
