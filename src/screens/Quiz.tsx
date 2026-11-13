import { useRef, useState } from 'react'
import gsap from 'gsap'
import Starfield from '../components/Starfield'
import Button from '../components/Button'
import { Coin } from '../components/CoinBadge'
import { deviceById } from '../content/worlds'
import { tx } from '../content/l10n'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'

const t = en.quiz
const COINS_PER_ANSWER = 10
const SWIPE = 90 // px of drag that counts as an answer
const FLYING_COINS = 6
const COIN_SVG =
  '<svg viewBox="0 0 20 20" width="28" height="28"><circle cx="10" cy="10" r="9" fill="#FFC93C" stroke="#C9971F" stroke-width="2"/><path d="M10 5.5l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="#FFF3B0"/></svg>'
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Fact or Cap? Right on the first try = +10 coins. Wrong = hint + retry, never locked out.
export default function Quiz() {
  const deviceId = useGame((s) => s.deviceId)
  const completeDevice = useGame((s) => s.completeDevice)
  const go = useGame((s) => s.go)
  const device = deviceById[deviceId]
  const [qi, setQi] = useState(0)
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [firstTry, setFirstTry] = useState(true)
  const [earned, setEarned] = useState(0)
  const [hintOpen, setHintOpen] = useState(false) // the Hint button shows the hint before answering
  const [shownCoins, setShownCoins] = useState(0) // counter in the header; counts up when the flying coins land
  const [lean, setLean] = useState<-1 | 0 | 1>(0) // which way the card is being dragged (shows the Fact / Cap tag)
  const start = useRef<number | null>(null)
  const dragX = useRef(0)
  const busy = useRef(false) // true while the card is flying, so double taps don't answer twice
  const cardEl = useRef<HTMLDivElement>(null)
  const fx = useRef<HTMLDivElement>(null) // layer the flying coins live in
  const coinTarget = useRef<HTMLSpanElement>(null)
  const counter = useRef({ v: 0 })
  const card = device.quiz[qi]
  const last = qi === device.quiz.length - 1

  // Coins burst out of the card, fly up to the counter, and the number rolls up as they land.
  const flyCoins = (total: number) => {
    const from = cardEl.current?.getBoundingClientRect()
    const to = coinTarget.current?.getBoundingClientRect()
    if (!from || !to || !fx.current) return setShownCoins(total)
    const sx = from.left + from.width / 2 - 14
    const sy = from.top + from.height / 3 - 14
    const tx2 = to.left + to.width / 2 - 14
    const ty = to.top + to.height / 2 - 14
    for (let k = 0; k < FLYING_COINS; k++) {
      const node = document.createElement('div')
      node.className = 'absolute left-0 top-0'
      node.innerHTML = COIN_SVG
      fx.current.appendChild(node)
      const a = (k / FLYING_COINS) * Math.PI * 2
      gsap
        .timeline({
          delay: k * 0.07,
          onComplete: () => {
            node.remove()
            if (k !== FLYING_COINS - 1) return
            gsap.to(counter.current, { v: total, duration: 0.5, ease: 'power1.out', onUpdate: () => setShownCoins(Math.round(counter.current.v)) })
            gsap.fromTo('.js-quiz-coins', { scale: 1.35 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
          },
        })
        .set(node, { x: sx, y: sy, scale: 0.6 })
        .to(node, { x: sx + Math.cos(a) * 70, y: sy + Math.sin(a) * 50 - 30, scale: 1.1, duration: 0.28, ease: 'power2.out' })
        .to(node, { x: tx2, duration: 0.55, ease: 'power1.in' })
        .to(node, { y: ty, scale: 0.7, duration: 0.55, ease: 'power2.in' }, '<')
    }
  }

  // Wrong: the card shakes and flashes red.
  const wrongFx = () => {
    gsap.fromTo(cardEl.current, { x: -12 }, { x: 12, duration: 0.05, repeat: 5, yoyo: true, ease: 'none', onComplete: () => void gsap.set(cardEl.current, { x: 0 }) })
    gsap.fromTo('.js-red', { opacity: 0.55 }, { opacity: 0, duration: 0.7, ease: 'power1.out' })
  }

  const answer = (saysFact: boolean) => {
    if (result === 'right' || busy.current) return
    const right = saysFact === card.isFact
    const pays = right && firstTry
    const total = earned + (pays ? COINS_PER_ANSWER : 0)
    const reveal = () => {
      setLean(0)
      if (right) {
        setEarned(total)
        setResult('right')
      } else {
        setFirstTry(false)
        setResult('wrong')
      }
    }
    const el = cardEl.current
    if (reducedMotion() || !el) {
      reveal()
      setShownCoins(total)
      return
    }
    // The card flies off the side you chose (like Tinder), then comes back showing the answer.
    busy.current = true
    const side = saysFact ? 1 : -1
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .to(el, { x: side * Math.max(innerWidth * 0.7, 420), rotation: side * 28, opacity: 0, duration: 0.35, ease: 'power2.in' })
      .call(reveal)
      .set(el, { x: 0, rotation: 0 })
      .fromTo(el, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' })
      .call(() => (right ? pays && flyCoins(total) : wrongFx()))
  }

  const advance = () => {
    if (last) return completeDevice(device.id, earned)
    setQi(qi + 1)
    setResult(null)
    setFirstTry(true)
    setHintOpen(false)
    if (!reducedMotion()) gsap.fromTo(cardEl.current, { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)' })
  }

  const showHint = hintOpen || result === 'wrong'
  const answerLabel = card.isFact ? t.fact : t.cap

  // Design "C · Card Stack": a stack of cards, the top one holds the question; round Cap / Fact buttons below.
  return (
    <main className="relative flex min-h-svh flex-col items-center overflow-hidden bg-[radial-gradient(50%_60%_at_50%_55%,var(--color-navy-700)_0%,var(--color-navy-900)_70%)] px-4 pb-6 pt-3 sm:px-10">
      <Starfield />
      <header className="relative z-10 grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center">
        <button type="button" onClick={() => go('level')} aria-label={t.back} className="flex min-h-11 items-center gap-2 justify-self-start rounded-full px-3 text-text-muted hover:text-text">
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
          <span className="hidden sm:inline">{t.back}</span>
        </button>
        <h1 className="font-display text-3xl font-extrabold leading-none sm:text-5xl">{t.title}</h1>
        <p className="js-quiz-coins flex min-h-11 items-center gap-1.5 justify-self-end rounded-full bg-black/30 px-4 font-display text-xl font-extrabold text-cta" aria-label={`${shownCoins} coins earned`}>
          <Coin className="h-6 w-6" /> <span ref={coinTarget} className="tabular-nums">{shownCoins}</span>
        </p>
      </header>

      <div className="relative z-10 flex w-full max-w-5xl flex-1 items-center justify-center py-6">
        {/* swipe direction cues (wide screens) */}
        <div className="absolute left-[6%] top-1/2 hidden -translate-y-1/2 flex-col items-center gap-1 font-display text-3xl font-extrabold text-[#FF8A8A] opacity-85 md:flex" aria-hidden="true">
          <svg viewBox="0 0 20 20" className="h-11 w-11"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>
          {t.cap.toUpperCase()}
        </div>
        <div className="absolute right-[6%] top-1/2 hidden -translate-y-1/2 flex-col items-center gap-1 font-display text-3xl font-extrabold text-[#5FE0D2] opacity-85 md:flex" aria-hidden="true">
          <svg viewBox="0 0 20 20" className="h-11 w-11"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>
          {t.fact.toUpperCase()}
        </div>

        {/* the stack */}
        <div className="relative h-[min(470px,58svh)] w-[min(86vw,460px)]">
          <div className="absolute inset-0 translate-y-3.5 -rotate-[7deg] rounded-[2rem] bg-[#8B6CF0]" aria-hidden="true" />
          <div className="absolute inset-0 translate-y-2 rotate-[5deg] rounded-[2rem] bg-fact" aria-hidden="true" />
          <div
            ref={cardEl}
            className={`absolute inset-0 flex touch-pan-y select-none flex-col overflow-hidden rounded-[2rem] bg-paper text-ink shadow-[0_24px_50px_rgb(0_0_0/0.45)] transition-shadow ${
              result === 'right' ? 'ring-[6px] ring-fact' : result === 'wrong' ? 'ring-[6px] ring-cap' : ''
            }`}
            onPointerDown={(e) => {
              if (result === 'right' || busy.current) return
              start.current = e.clientX
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (start.current === null) return
              // the card leans the way it's dragged
              const x = e.clientX - start.current
              dragX.current = x
              gsap.set(e.currentTarget, { x, rotation: x / 18 })
              const l = x > 30 ? 1 : x < -30 ? -1 : 0
              if (l !== lean) setLean(l)
            }}
            onPointerUp={(e) => {
              if (start.current === null) return
              start.current = null
              const x = dragX.current
              dragX.current = 0
              if (x > SWIPE) answer(true)
              else if (x < -SWIPE) answer(false)
              else {
                setLean(0)
                gsap.to(e.currentTarget, { x: 0, rotation: 0, duration: 0.35, ease: 'back.out(2)' })
              }
            }}
          >
            <img src={device.photos[0].src} alt="" draggable={false} className="h-[30%] min-h-28 w-full shrink-0 object-cover" />
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 pb-6 pt-4 sm:px-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink/70">{t.says(device.nickname)}</span>
                <span className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-paper" aria-label={`Question ${qi + 1} of ${device.quiz.length}`}>{qi + 1} / {device.quiz.length}</span>
              </div>
              <p className={`text-[1.7rem] font-semibold leading-tight sm:text-[2.35rem] ${result === 'right' ? 'text-ink/60' : ''}`}>{tx(card.statement)}</p>
              {result === 'right' && <p className="text-lg leading-snug">{tx(card.why)}</p>}
              {showHint && result !== 'right' && (
                <p className="flex items-start gap-2 rounded-2xl bg-cta/25 p-3 text-base leading-snug">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-cta-edge" aria-hidden="true"><path d="M7 16h6M8 18h4M10 2a6 6 0 0 0-3.5 10.9V14h7v-1.1A6 6 0 0 0 10 2z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" /></svg>
                  <span>{result === 'wrong' && <strong>{t.wrong} </strong>}<strong>{t.hint}:</strong> {tx(card.hint)}</span>
                </p>
              )}
            </div>

            {/* rubber stamp on a right answer */}
            {result === 'right' && (
              <div className="absolute right-4 top-[13%] -rotate-12 rounded-xl border-[5px] border-fact-ink bg-paper/90 px-3.5 py-1 text-center font-display leading-none text-fact-ink">
                <span className="block text-3xl font-extrabold">{answerLabel.toUpperCase()}</span>
                <span className="block text-sm font-bold">{t.gotIt}</span>
              </div>
            )}

            <span className="js-red pointer-events-none absolute inset-0 bg-cap opacity-0" aria-hidden="true" />
            {lean !== 0 && (
              <span className={`absolute top-4 -rotate-6 rounded-lg px-3 py-1 font-display text-2xl font-extrabold ${lean > 0 ? 'right-4 bg-fact text-navy-900' : 'left-4 bg-cap text-white'}`}>{lean > 0 ? t.fact.toUpperCase() : t.cap.toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-28 w-full max-w-md flex-col items-center justify-center gap-3" aria-live="polite">
        {result === 'right' ? (
          <>
            {firstTry && (
              <p className="flex items-center gap-2 font-display text-3xl font-extrabold text-cta">
                <Coin className="h-9 w-9" /> {t.coins(COINS_PER_ANSWER)}
              </p>
            )}
            <Button className="w-full font-display text-xl font-extrabold sm:w-auto sm:min-w-64" onClick={advance}>{last ? t.finish : t.next}</Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-6 sm:gap-9">
              <RoundAnswer kind="cap" onClick={() => answer(false)} />
              <button
                type="button"
                onClick={() => setHintOpen(true)}
                disabled={showHint}
                className="jelly flex min-h-14 items-center gap-2 rounded-full border-2 border-white/25 bg-white/5 px-5 text-lg text-text hover:bg-white/10 disabled:opacity-40"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5 text-cta" aria-hidden="true"><path d="M7 16h6M8 18h4M10 2a6 6 0 0 0-3.5 10.9V14h7v-1.1A6 6 0 0 0 10 2z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" /></svg>
                {t.hint}
              </button>
              <RoundAnswer kind="fact" onClick={() => answer(true)} />
            </div>
            <p className="text-sm text-faint md:hidden">{t.swipe}</p>
          </>
        )}
      </div>

      {/* flying coins */}
      <div ref={fx} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true" />
    </main>
  )
}

// Big round answer button: red ✕ for Cap, teal ✓ for Fact.
function RoundAnswer({ kind, onClick }: { kind: 'fact' | 'cap'; onClick: () => void }) {
  const fact = kind === 'fact'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={fact ? t.fact : t.cap}
      className={`jelly flex h-20 w-20 items-center justify-center rounded-full text-ink active:translate-y-1 sm:h-26 sm:w-26 ${
        fact ? 'bg-fact shadow-[0_8px_0_var(--color-fact-edge)]' : 'bg-cap shadow-[0_8px_0_var(--color-cap-edge)]'
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true">
        {fact ? <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /> : <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
      </svg>
    </button>
  )
}
