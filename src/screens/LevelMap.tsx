import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Button from '../components/Button'
import DeviceArt from '../components/DeviceArt'
import CoinBadge, { Coin } from '../components/CoinBadge'
import Rocket from '../components/Rocket'
import Astronaut from '../components/Astronaut'
import { worlds } from '../content/worlds'
import type { Device } from '../content/types'
import { en } from '../content/i18n/en'
import { useGame, worldComplete } from '../store/progress'
import SoundButton from '../components/SoundButton'
import { sfx } from '../audio/engine'
import Landing from './level/Landing'
import { Sky, Terrain } from './level/scenery'

gsap.registerPlugin(useGSAP)
const t = en.level

// Level spots in % of the map, zigzagging from the near ground (bottom) up to the horizon, for any number of levels.
const ZIGZAG = [28, 70, 34, 66, 30, 68]
const NEAR = 90
const FAR = 26
type Spot = { x: number; y: number }
const spotsFor = (n: number): Spot[] => Array.from({ length: n }, (_, i) => ({ x: ZIGZAG[i % ZIGZAG.length], y: NEAR - i * ((NEAR - FAR) / Math.max(n - 1, 1)) }))
// The secret sits beside the last stop, on the other side. When stops are close together (Mars) it moves up towards
// the horizon, so its taller stack (button + label + coin price) clears the stop below it.
const secretSpotFor = (last: Spot, gap: number) => ({ x: last.x < 50 ? 74 : 26, y: last.y - Math.max(0, 22 - gap) })
// further away (higher up the map) = drawn smaller, so the trail runs off towards the horizon
const depth = (y: number) => 0.72 + (0.28 * (y - FAR)) / (NEAR - FAR)
const DOTS = '#FFF1D6' // trail ahead; walked parts are gold, the way to the secret is purple
const segment = (a: Spot, b: Spot) => `M${a.x},${a.y} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y}`
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
  const gap = levels.length > 1 ? spots[0].y - spots[1].y : 30
  const secretSpot = secretSpotFor(last, gap)
  const complete = worldComplete(world.id, done)
  const trail = [
    ...spots.slice(1).map((b, i) => ({ a: spots[i], b, color: done.includes(levels[i].id) ? '#FFC93C' : DOTS })),
    ...(world.secrets.length ? [{ a: last, b: secretSpot, color: '#C9A7FF' }] : []),
  ]

  // the landing plays once per arrival
  useEffect(() => {
    if (justLanded) useGame.setState({ justLanded: false })
  }, [justLanded])

  // after the landing, the stops pop up along the trail one by one
  const popIn = useRef(landing)
  useGSAP(
    () => {
      if (!popIn.current) return
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        if (landing) return void gsap.set('.js-node', { opacity: 0, scale: 0.4 })
        popIn.current = false
        gsap.to('.js-node', { opacity: 1, scale: 1, duration: 0.5, stagger: 0.09, ease: 'back.out(2)' })
      })
    },
    { scope: root, dependencies: [landing] },
  )

  const state = (d: Device, i: number) => (done.includes(d.id) ? 'done' : i === current ? 'current' : 'locked')

  const onSecret = (d: Device) => {
    if (secrets.includes(d.id)) {
      sfx('pop')
      return done.includes(d.id) ? open('profile', d.id) : playDevice(d.id)
    }
    const cost = d.secret!.cost
    if (!unlockSecret(d.id, cost)) {
      sfx('locked')
      setMsg(t.needCoins(cost - coins))
    } else {
      sfx('unlock')
      setMsg(null)
    }
  }

  return (
    <main ref={root} className="relative flex h-svh flex-col overflow-hidden bg-navy-950">
      {/* standing on the world: its sky above the horizon, its real surface running back to it */}
      <Sky world={worldId} />
      <Terrain world={worldId} className="absolute inset-x-0 bottom-0 top-[24%]" />

      <header className="relative z-10 flex items-center justify-between gap-2 p-3 sm:p-4">
        {/* compact pills, not <Button>: four controls must fit a 375px phone */}
        <button type="button" onClick={() => go('space')} aria-label={t.back} className={PILL}>
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
          <span className="hidden sm:inline">{t.back}</span>
        </button>
        <h1 className="truncate rounded-full bg-black/40 px-3 py-1.5 text-lg font-bold backdrop-blur-sm sm:px-4 sm:text-xl">{world.name}</h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => open('library')} className={`${PILL} ${complete ? '' : 'max-md:hidden'}`}>{t.cards}</button>
          <SoundButton />
          <CoinBadge />
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-xl flex-1">
        {/* the trail: a dark track with a dotted line, narrowing into the distance; the part you've walked turns gold */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {trail.map(({ a, b, color }, i) => {
            const w = 24 * depth((a.y + b.y) / 2)
            return (
              <g key={i} fill="none" strokeLinecap="round">
                <path d={segment(a, b)} stroke="rgb(20 10 5 / 0.35)" strokeWidth={w} vectorEffect="non-scaling-stroke" />
                <path d={segment(a, b)} stroke={color} strokeOpacity={color === DOTS ? 0.6 : 0.95} strokeWidth={w * 0.3} strokeDasharray={`0.1 ${w * 0.75}`} vectorEffect="non-scaling-stroke" />
              </g>
            )
          })}
        </svg>

        {/* our ship, parked where we landed */}
        <div className="pointer-events-none absolute bottom-[1%] right-[3%] w-14 sm:w-16" aria-hidden="true">
          <div className="absolute bottom-0 left-1/2 h-3 w-[150%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-black/45 blur-[3px]" />
          <div className="translate-y-[24.7%]">
            <Rocket legs className="relative block w-full" />
          </div>
        </div>

        {levels.map((d, i) => {
          const s = state(d, i)
          const p = spots[i]
          return (
            <div key={d.id} className="js-node absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              {/* the kid stands beside the next stop, on the side facing the middle of the map, feet level with the button */}
              {s === 'current' && (
                <Astronaut
                  kind={character}
                  pose="threeq"
                  width={80}
                  className={`pointer-events-none absolute -top-10 h-auto w-20 motion-safe:animate-[kid-idle_2.6s_ease-in-out_infinite] sm:-top-12 sm:w-24 ${p.x < 50 ? 'left-[calc(50%+24px)] -scale-x-100' : 'right-[calc(50%+24px)]'}`}
                />
              )}
              <LevelButton device={d} index={i + 1} state={s} scale={depth(p.y)} onClick={() => {
                if (s === 'locked') return
                sfx('pop')
                if (s === 'done') open('profile', d.id)
                else playDevice(d.id)
              }} />
            </div>
          )
        })}

        {world.secrets.map((d) => {
          const unlocked = secrets.includes(d.id)
          return (
            <div key={d.id} className="js-node absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${secretSpot.x}%`, top: `${secretSpot.y}%` }}>
              <LevelButton device={d} state={done.includes(d.id) ? 'done' : unlocked ? 'current' : 'secret'} scale={depth(secretSpot.y)} onClick={() => onSecret(d)} />
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

      {landing && <Landing world={worldId} kind={character} onDone={() => setLanding(false)} />}
    </main>
  )
}

type LevelState = 'done' | 'current' | 'locked' | 'secret'

function LevelButton({ device, index, state, scale, onClick }: { device: Device; index?: number; state: LevelState; scale: number; onClick: () => void }) {
  const ring = { done: 'ring-cta', current: 'ring-fact', locked: 'ring-white/20', secret: 'ring-[#C9A7FF]' }[state]
  return (
    <>
      {/* only the button shrinks with distance (towards its base, so it stays on the trail); the name stays readable */}
      <div className="relative origin-bottom" style={{ scale: String(scale) }}>
      <span className="absolute -bottom-2 left-1/2 h-5 w-[110%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-[3px]" aria-hidden="true" />
      <button
        type="button"
        onClick={onClick}
        disabled={state === 'locked'}
        aria-label={`${device.nickname}${state === 'locked' ? ' (locked)' : state === 'done' ? ' (done, open profile)' : ''}`}
        className={`relative h-20 w-20 rounded-full ring-[6px] ${ring} bg-navy-900 shadow-[0_8px_0_rgb(0_0_0/0.35)] transition hover:scale-105 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact disabled:hover:scale-100 sm:h-24 sm:w-24 ${
          state === 'current' ? 'motion-safe:animate-[pulse-ring_1.6s_ease-out_infinite]' : ''
        }`}
      >
        <DeviceArt
          device={device}
          pose={state === 'current' ? 'wave' : 'talk'}
          photoClass={`h-full w-full rounded-full ${state === 'locked' || state === 'secret' ? 'opacity-40 grayscale' : ''}`}
          // the character pops a little out of its bubble so wide devices (rotors, solar wings) still read at map size
          mascotClass={`h-full w-full scale-[1.3] drop-shadow-[0_4px_6px_rgb(0_0_0/0.6)] ${state === 'locked' || state === 'secret' ? 'opacity-40 grayscale' : ''}`}
        />
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
      </div>
      <span className="relative mt-2 whitespace-nowrap rounded-full bg-black/50 px-3 py-0.5 text-sm font-semibold backdrop-blur-sm">{state === 'secret' ? en.level.secret : device.nickname}</span>
    </>
  )
}
