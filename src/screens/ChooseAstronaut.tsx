import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import Astronaut from '../components/Astronaut'
import { Coin, IconLock, IconRocket } from '../components/icons'
import { characterNames, suitOrder, suits, type Kind, type SuitId } from '../content/suits'
import { en } from '../content/i18n/en'
import { isSuitOpen, useProgress } from '../store/progress'
import { sfx } from '../audio/sfx'

gsap.registerPlugin(useGSAP)
const t = en.avatar

export default function ChooseAstronaut() {
  const store = useProgress()
  const [kind, setKind] = useState<Kind | null>(store.character)
  const [suit, setSuit] = useState<SuitId>(store.suit)
  const [name, setName] = useState(store.name)
  const [shaking, setShaking] = useState<SuitId | null>(null)
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.js-pop', { y: 40, opacity: 0, scale: 0.9, stagger: 0.08, duration: 0.6, ease: 'back.out(1.7)' })
      })
    },
    { scope: root, dependencies: [kind === null] },
  )

  const pickKind = (k: Kind) => {
    sfx.tap()
    setKind(k)
  }

  const pickSuit = (s: SuitId) => {
    if (!isSuitOpen(s, store.coins)) {
      sfx.wrong()
      setShaking(s)
      setTimeout(() => setShaking(null), 500)
      return
    }
    sfx.tap()
    setSuit(s)
  }

  return (
    <main ref={root} className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar onBack={kind ? () => setKind(null) : () => store.go('landing')} showCards={false} />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-10">
        {kind === null ? (
          <>
            <p className="js-pop text-sm font-semibold uppercase tracking-widest text-fact">{t.step1}</p>
            <h1 className="js-pop mt-2 text-center text-4xl font-bold sm:text-5xl">{t.whoTitle}</h1>
            <div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-4 sm:gap-6">
              {(['boy', 'girl'] as Kind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => pickKind(k)}
                  className="js-pop group flex flex-col items-center rounded-3xl bg-surface/80 p-4 pb-6 ring-2 ring-white/10 transition hover:-translate-y-1 hover:ring-coin focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact"
                >
                  <div className="flex h-48 items-end justify-center sm:h-64">
                    <Astronaut suit={suits.classic} kind={k} emblem="classic" width={130} className="h-full w-auto transition group-hover:scale-105" />
                  </div>
                  <span className="mt-3 text-2xl font-bold">{k === 'boy' ? t.boy : t.girl}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="js-pop text-sm font-semibold uppercase tracking-widest text-fact">{t.step2}</p>
            <h1 className="js-pop mt-2 text-center text-4xl font-bold sm:text-5xl">{t.pickTitle}</h1>
            <p className="js-pop mt-2 max-w-md text-center text-text-muted">{t.pickSub}</p>

            <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {suitOrder.map((s) => {
                const open = isSuitOpen(s, store.coins)
                const selected = suit === s
                const cost = suits[s].cost
                return (
                  <button
                    key={s}
                    type="button"
                    aria-disabled={!open}
                    aria-pressed={selected}
                    onClick={() => pickSuit(s)}
                    className={`js-pop relative flex flex-col items-center rounded-3xl p-3 pb-4 text-left ring-2 transition focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact ${
                      selected ? 'bg-surface ring-coin' : 'bg-surface/60 ring-white/10 hover:ring-white/30'
                    } ${shaking === s ? 'shake' : ''}`}
                  >
                    <div className={`flex h-40 items-end justify-center sm:h-48 ${open ? '' : 'opacity-40 grayscale'}`}>
                      <Astronaut suit={suits[s]} kind={kind} emblem={s} width={110} className="h-full w-auto" />
                    </div>
                    <span className="mt-2 text-center text-base font-bold leading-tight sm:text-lg">{characterNames[s].en}</span>
                    {open ? (
                      <span className="mt-1 rounded-full bg-fact/20 px-3 py-0.5 text-sm font-semibold text-fact">{cost === 0 ? t.free : t.unlocked}</span>
                    ) : (
                      <>
                        <span className="absolute left-1/2 top-16 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-navy-950/80 ring-2 ring-coin">
                          <IconLock className="h-7 w-7 text-coin" />
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-coin">
                          <Coin className="h-5 w-5" /> {store.coins}/{cost}
                        </span>
                        <span className="sr-only">{en.common.collect(cost)}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            <label className="js-pop mt-8 flex w-full max-w-sm flex-col gap-1">
              <span className="font-semibold">{t.nameLabel}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                autoComplete="off"
                placeholder={t.namePlaceholder}
                className="min-h-12 rounded-2xl bg-white/10 px-4 text-lg text-text ring-2 ring-white/15 placeholder:text-faint focus:outline-none focus:ring-fact"
              />
              <span className="text-sm text-faint">{t.nameHint}</span>
            </label>

            <Button size="lg" className="js-pop mt-6" onClick={() => { sfx.whoosh(); store.chooseCharacter(kind, suit, name) }}>
              <IconRocket className="h-6 w-6" /> {t.launch}
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
