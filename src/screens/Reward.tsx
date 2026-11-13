import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import HoloCard from '../components/HoloCard'
import Astronaut from '../components/Astronaut'
import { Coin, IconRocket, IconSpark } from '../components/icons'
import { devices } from '../content/devices'
import { worlds } from '../content/worlds'
import { characterNames, suits } from '../content/suits'
import { en } from '../content/i18n/en'
import { useProgress } from '../store/progress'
import { sfx } from '../audio/sfx'

gsap.registerPlugin(useGSAP)
const t = en.reward

export default function Reward() {
  const { lastReward, character, go, flyTo } = useProgress()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline()
          .from('.js-rays', { scale: 0, opacity: 0, duration: 0.8, ease: 'power3.out' })
          .from('.js-title', { y: 30, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, 0.2)
          .fromTo('.js-card', { rotationY: 180, scale: 0.6, opacity: 0 }, { rotationY: 0, scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.4)' }, 0.5)
          .from('.js-unlock', { y: 20, opacity: 0, stagger: 0.15, duration: 0.4 }, 1.3)
          .call(() => sfx.unlock(), [], 1.3)
        gsap.to('.js-rays', { rotation: 360, duration: 40, repeat: -1, ease: 'none' })
      })
    },
    { scope: root },
  )

  if (!lastReward) return null
  const device = devices[lastReward.card]

  return (
    <main ref={root} className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar onBack={() => go('map')} />

      {/* light rays behind the card */}
      <svg viewBox="-100 -100 200 200" className="js-rays pointer-events-none absolute left-1/2 top-[38%] w-[160vmin] -translate-x-1/2 -translate-y-1/2 opacity-40" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M0 0 L-8 -100 L8 -100 Z" fill="#FFC93C" transform={`rotate(${i * 22.5})`} opacity={i % 2 ? 0.5 : 0.25} />
        ))}
      </svg>

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 pb-10 text-center">
        <h1 className="js-title text-4xl font-bold">{t.title}</h1>
        <p className="js-title mt-1 flex items-center gap-2 text-xl font-semibold text-coin">
          <Coin className="h-7 w-7" /> {t.coinsWon(lastReward.coins)}
        </p>

        <div className="js-card mt-6 w-64 [transform-style:preserve-3d] sm:w-72">
          <HoloCard device={device} tilt />
        </div>
        <p className="js-unlock mt-4 text-lg font-bold">{t.newCard}</p>
        <p className="js-unlock text-sm text-faint">{t.earned}</p>

        {lastReward.suits.map((s) => (
          <div key={s} className="js-unlock mt-4 flex items-center gap-3 rounded-2xl bg-surface px-4 py-2 ring-2 ring-coin">
            <Astronaut suit={suits[s]} kind={character ?? 'boy'} emblem={s} width={48} className="h-16 w-auto" />
            <p className="font-semibold">{t.unlockSuit(characterNames[s].en)}</p>
          </div>
        ))}
        {lastReward.worlds.map((w) => (
          <div key={w} className="js-unlock mt-4 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-2 ring-fact">
            <IconSpark className="h-6 w-6 text-fact" />
            <p className="font-semibold">{t.unlockWorld(worlds[w].name.en)}</p>
            <Button variant="fact" onClick={() => flyTo(w)}>
              <IconRocket className="h-5 w-5" /> {en.map.fly}
            </Button>
          </div>
        ))}

        <div className="js-unlock mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="ghost" onClick={() => go('cards')}>{t.toCards}</Button>
          <Button onClick={() => go('map')}>{t.toMap}</Button>
        </div>
      </div>
    </main>
  )
}
