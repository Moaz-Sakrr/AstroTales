import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Button from '../components/Button'
import CoinBadge, { Coin } from '../components/CoinBadge'
import Rocket from '../components/Rocket'
import Astronaut from '../components/Astronaut'
import { suits } from '../content/suits'
import { worlds } from '../content/worlds'
import type { Device } from '../content/types'
import { en } from '../content/i18n/en'
import { useGame, worldComplete } from '../store/progress'

gsap.registerPlugin(useGSAP)
const t = en.level

// Level spots in % of the map, bottom → top like a candy-crush path. Secrets branch off to the side.
const PATH = [
  { x: 28, y: 82 },
  { x: 70, y: 60 },
  { x: 34, y: 36 },
  { x: 66, y: 14 },
]
const SECRET_SPOT = { x: 84, y: 34 }
type Spot = { x: number; y: number }

// The road between two level spots: an S-curve (same shape for the dashed path and the walking kid).
const road = (a: Spot, b: Spot) => {
  const mid = (a.y + b.y) / 2
  return `M${a.x},${a.y} C${a.x},${mid} ${b.x},${mid} ${b.x},${b.y}`
}
function roadPoint(a: Spot, b: Spot, t: number): Spot {
  const mid = (a.y + b.y) / 2
  const u = 1 - t
  return {
    x: u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * mid + 3 * u * t * t * mid + t * t * t * b.y,
  }
}
const BURST = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2)
const ROAD_DOTS = Array.from({ length: 13 }, (_, i) => (i + 1) / 14) // dots of the road that draws itself

export default function LevelMap() {
  const root = useRef<HTMLElement>(null)
  const { world: worldId, done, secrets, coins, justLanded, character } = useGame()
  const { go, open, playDevice, unlockSecret, travel } = useGame.getState()
  const world = worlds[worldId]
  const [msg, setMsg] = useState<string | null>(null)
  const [landing, setLanding] = useState(justLanded)

  const levels = world.levels
  const current = levels.findIndex((d) => !done.includes(d.id)) // -1 = all done
  const spots = levels.map((_, i) => PATH[i])
  const complete = worldComplete(world.id, done)
  const stand = current >= 0 ? current : levels.length - 1 // where the kid stands on the road
  const walker = useRef<HTMLDivElement>(null)
  // Just finished the level before the current one? Then the road draws itself and the kid walks to the new level.
  const [walkTo] = useState<number | null>(() => {
    const from = levels.findIndex((d) => d.id === useGame.getState().walkFrom)
    return from >= 0 && from + 1 === current && !justLanded ? current : null
  })
  const [walkDone, setWalkDone] = useState(walkTo === null)
  const standAt = !walkDone && walkTo !== null ? spots[walkTo - 1] : spots[stand]

  useGSAP(
    () => {
      if (!landing) return
      useGame.setState({ justLanded: false })
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => setLanding(false))
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const shake = root.current
        gsap
          .timeline({ onComplete: () => setLanding(false) })
          // fall fast, then a long retro-burn slows the ship down
          .set('.js-flame', { scaleY: 1.6 })
          .fromTo('.js-lander', { y: '-110vh' }, { y: '-22vh', duration: 1.2, ease: 'power1.in' })
          .to('.js-lander', { y: 0, duration: 1.5, ease: 'power2.out' })
          .to('.js-flame', { scaleY: 0.5, duration: 1.5 }, '<')
          // touchdown: legs squash and spring back, engine off, dust flies, the screen jolts
          .addLabel('touch')
          .to('.js-legs', { scaleY: 0.6, svgOrigin: '60 226', duration: 0.12, ease: 'power2.out' }, 'touch')
          .to('.js-lander-body', { yPercent: 5, duration: 0.12, ease: 'power2.out' }, 'touch')
          .to('.js-flame', { scaleY: 0, opacity: 0, duration: 0.2 }, 'touch')
          .to('.js-legs', { scaleY: 1, svgOrigin: '60 226', duration: 0.7, ease: 'elastic.out(1, 0.4)' }, 'touch+=0.12')
          .to('.js-lander-body', { yPercent: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }, 'touch+=0.12')
          .fromTo('.js-dust', { scale: 0.2, opacity: 0.85, x: 0, y: 0 }, { scale: 2.4, opacity: 0, x: (i) => (i - 3) * 50, y: -24, duration: 1.3, stagger: 0.02, ease: 'power2.out' }, 'touch')
          .fromTo(shake, { x: -8 }, { x: 8, duration: 0.05, repeat: 7, yoyo: true, ease: 'none' }, 'touch')
          .set(shake, { x: 0 })
          .from('.js-touchdown', { scale: 0.6, opacity: 0, duration: 0.4, ease: 'back.out(2)' }, 'touch')
          // the kid climbs out of the hatch and hops down to the ground
          .fromTo('.js-lander-kid', { x: -40, y: -110, scale: 0.4, opacity: 0 }, { opacity: 1, scale: 1, duration: 0.3 }, 'touch+=0.6')
          .to('.js-lander-kid', { x: 0, duration: 0.6, ease: 'none' })
          .to('.js-lander-kid', { y: -150, duration: 0.25, ease: 'power2.out' }, '<')
          .to('.js-lander-kid', { y: 0, duration: 0.35, ease: 'power2.in' }, '>')
          // walks over and plants the flag
          .to('.js-lander-kid', { x: 40, duration: 0.6, ease: 'none' })
          .to('.js-kid-hop', { y: -6, duration: 0.1, yoyo: true, repeat: 5 }, '<')
          .fromTo('.js-pole', { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'bounce.out' })
          .fromTo('.js-cloth', { scaleX: 0 }, { scaleX: 1, svgOrigin: '7 12', duration: 0.5, ease: 'back.out(2)' })
          .to('.js-kid-hop', { y: -16, duration: 0.2, yoyo: true, repeat: 1 }, '<') // a happy jump
          .to('.js-landing', { opacity: 0, duration: 0.6, delay: 0.8 })
        gsap.to('.js-flame', { scaleX: 0.8, repeat: -1, yoyo: true, duration: 0.07 })
      })
    },
    { scope: root },
  )

  useGSAP(
    () => {
      if (walkTo === null) return
      useGame.setState({ walkFrom: null })
      const a = spots[walkTo - 1]
      const b = spots[walkTo]
      const place = (pt: Spot) => {
        if (!walker.current) return
        walker.current.style.left = `${pt.x}%`
        walker.current.style.top = `${pt.y}%`
      }
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {
        place(b)
        setWalkDone(true)
      })
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const prog = { t: 0 }
        gsap
          .timeline({ delay: 0.4, onComplete: () => setWalkDone(true) })
          // 1. the road to the new level draws itself
          .fromTo('.js-road-dot', { opacity: 0, scale: 0 }, { opacity: 0.85, scale: 1, duration: 0.25, stagger: 0.06, ease: 'back.out(3)' })
          // 2. the kid hops along it (facing the way they walk)
          .set('.js-walker-flip', { scaleX: b.x < a.x ? -1 : 1 })
          .to(prog, {
            t: 1,
            duration: 1.8,
            ease: 'power1.inOut',
            onUpdate: () => {
              place(roadPoint(a, b, prog.t))
              gsap.set('.js-walker-hop', { y: -Math.abs(Math.sin(prog.t * Math.PI * 7)) * 14 })
            },
          })
          .set('.js-walker-hop', { y: 0 })
          .set('.js-walker-flip', { scaleX: 1 })
          // 3. the new level pops and bursts with stars
          .fromTo('.js-level-new', { scale: 1 }, { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' })
          .fromTo(
            '.js-burst',
            { x: 0, y: 0, scale: 0.4, opacity: 1 },
            { x: (i) => Math.cos(BURST[i]) * 80, y: (i) => Math.sin(BURST[i]) * 80, scale: 1, opacity: 0, rotation: 180, duration: 0.9, ease: 'power2.out' },
            '<',
          )
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
        <Button variant="ghost" className="min-h-11 px-4 text-base" onClick={() => go('space')} aria-label={t.back}>
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
          <span className="hidden sm:inline">{t.back}</span>
        </Button>
        <h1 className="rounded-full bg-black/40 px-4 py-1.5 text-xl font-bold backdrop-blur-sm">{world.name}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="min-h-11 px-4 text-base" onClick={() => open('library')}>{t.cards}</Button>
          <CoinBadge />
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-xl flex-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {spots.slice(1).map((b, k) => {
            const i = k + 1
            const open = current === -1 || i <= current
            if (i === walkTo && !walkDone) return null // drawn dot by dot below while it opens
            return (
              <path
                key={i}
                d={road(spots[i - 1], b)}
                stroke="#FFF1D6" strokeDasharray="1 16" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke"
                opacity={open ? 0.85 : 0.25}
                style={{ strokeWidth: 8 }}
              />
            )
          })}
          {world.secrets.length > 0 && spots[1] && (
            <path d={`M${spots[1].x},${spots[1].y} Q${SECRET_SPOT.x + 4},${spots[1].y - 10} ${SECRET_SPOT.x},${SECRET_SPOT.y}`} stroke="#C9A7FF" fill="none" strokeDasharray="1 16" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 6 }} opacity="0.7" />
          )}
        </svg>

        {walkTo !== null &&
          !walkDone &&
          ROAD_DOTS.map((t, k) => {
            const p = roadPoint(spots[walkTo - 1], spots[walkTo], t)
            return <span key={k} className="js-road-dot absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper opacity-0" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
          })}

        {levels.map((d, i) => {
          const s = state(d, i)
          return (
            <div key={d.id} className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ${i === walkTo ? 'js-level-new' : ''}`} style={{ left: `${spots[i].x}%`, top: `${spots[i].y}%` }}>
              {i === walkTo &&
                BURST.map((_, k) => (
                  <svg key={k} viewBox="0 0 20 20" className="js-burst pointer-events-none absolute left-1/2 top-10 -ml-3 h-6 w-6 text-cta opacity-0" aria-hidden="true">
                    <path d="M10 1l2.6 6.2 6.7.6-5.1 4.4 1.6 6.6L10 15.3 4.2 18.8l1.6-6.6L.7 7.8l6.7-.6z" fill="currentColor" />
                  </svg>
                ))}
              <LevelButton device={d} index={i + 1} state={s} onClick={() => (s === 'done' ? open('profile', d.id) : s === 'current' ? playDevice(d.id) : undefined)} />
            </div>
          )
        })}

        {world.secrets.map((d) => {
          const unlocked = secrets.includes(d.id)
          return (
            <div key={d.id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${SECRET_SPOT.x}%`, top: `${SECRET_SPOT.y}%` }}>
              <LevelButton device={d} state={done.includes(d.id) ? 'done' : unlocked ? 'current' : 'secret'} onClick={() => onSecret(d)} />
              {!unlocked && (
                <span className="mt-1 flex items-center gap-1 rounded-full bg-[#6B4BD8] px-2.5 py-0.5 text-sm font-bold">
                  <Coin className="h-4 w-4" /> {d.secret!.cost}
                </span>
              )}
            </div>
          )
        })}
        {/* the kid stands next to their level, and walks to the next one after a win */}
        <div ref={walker} className="pointer-events-none absolute -translate-x-[185%] -translate-y-[95%]" style={{ left: `${standAt.x}%`, top: `${standAt.y}%` }} aria-hidden="true">
          <div className="js-walker-hop">
            <div className={`js-walker-flip ${walkDone ? 'motion-safe:animate-bounce' : ''}`}>
              <Astronaut suit={suits.classic} kind={character} width={44} />
            </div>
          </div>
        </div>
      </div>

      {msg && <p role="status" className="absolute inset-x-4 bottom-24 z-10 mx-auto max-w-md rounded-2xl bg-navy-900/95 p-3 text-center font-semibold">{msg}</p>}

      {complete && (
        <footer className="relative z-10 flex flex-col items-center gap-3 bg-gradient-to-t from-navy-950 to-transparent p-5 pb-8 text-center">
          <p className="text-lg font-semibold">{world.next ? t.worldDone(world.name) : t.allDone}</p>
          {world.next ? <Button onClick={() => travel(world.next!)}>{t.flyNext(worlds[world.next].name)}</Button> : <Button onClick={() => open('library')}>{t.cards}</Button>}
        </footer>
      )}

      {landing && (
        <div className="js-landing absolute inset-0 z-20 bg-navy-950/75">
          {/* the world's ground, a gentle hill starting at the ground line */}
          <div className="absolute inset-x-[-20%] bottom-0 top-[62%] rounded-[50%_50%_0_0/12%_12%_0_0] bg-cover bg-center brightness-90" style={{ backgroundImage: `url(${world.texture})` }} />
          {/* everything stands on one ground line, 62% down the screen */}
          <div className="absolute left-1/2 top-[62%] h-0 w-0">
            <div className="js-lander absolute bottom-0 left-0 w-28 -translate-x-1/2">
              {/* the bottom ~25% of the rocket SVG is flame room; sink it so the feet touch the ground */}
              <div className="js-lander-body translate-y-[24.7%]">
                <Rocket kind={character} flame legs />
              </div>
            </div>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="js-dust absolute -bottom-6 -left-8 h-16 w-16 rounded-full bg-[#CFCFD8]/70 opacity-0 blur-sm" />
            ))}
            <div className="js-lander-kid absolute bottom-0 left-[60px] w-12 -translate-x-1/2 opacity-0">
              <div className="js-kid-hop">
                <Astronaut suit={suits.classic} kind={character} width={48} />
              </div>
            </div>
            <svg viewBox="0 0 40 80" className="absolute bottom-0 left-[132px] h-20 w-10 overflow-visible" aria-hidden="true">
              <g className="js-pole" opacity="0">
                <rect x="4" y="0" width="3" height="80" rx="1.5" fill="#E8ECF5" />
                <path className="js-cloth" d="M7 3 L37 12 L7 22 Z" fill="#FFC93C" />
              </g>
            </svg>
          </div>
          <p className="js-touchdown absolute inset-x-0 top-[16%] text-center text-5xl font-bold text-cta drop-shadow-[0_3px_0_rgb(0_0_0/0.4)]">{t.touchdown}</p>
          <button type="button" onClick={() => setLanding(false)} className="absolute right-4 top-20 min-h-11 rounded-full bg-black/40 px-5 font-semibold text-text backdrop-blur-sm hover:bg-black/60">
            {en.launch.skip}
          </button>
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
      <span className="mt-2 rounded-full bg-black/50 px-3 py-0.5 text-sm font-semibold backdrop-blur-sm">{state === 'secret' ? en.level.secret : device.nickname}</span>
    </>
  )
}
