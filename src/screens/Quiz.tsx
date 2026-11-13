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
    if (result || busy.current) return
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
    if (!reducedMotion()) gsap.fromTo(cardEl.current, { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)' })
  }

  return (
    <main className="space-sky relative flex min-h-svh flex-col items-center overflow-hidden px-4 py-5">
      <Starfield />
      <header className="relative z-10 flex w-full max-w-3xl items-center justify-between">
        <button type="button" onClick={() => go('level')} className="min-h-11 rounded-full px-3 text-text-muted hover:text-text">{en.story.close}</button>
        <div className="flex gap-2" aria-label={`Card ${qi + 1} of ${device.quiz.length}`}>
          {device.quiz.map((_, k) => (
            <span key={k} className={`h-3 w-3 rounded-full ${k < qi || (k === qi && result === 'right') ? 'bg-fact' : k === qi ? 'bg-white' : 'bg-white/25'}`} />
          ))}
        </div>
        <p className="js-quiz-coins flex items-center gap-1.5 font-bold text-cta"><Coin /> <span ref={coinTarget} className="tabular-nums">+{shownCoins}</span></p>
      </header>

      <h1 className="relative z-10 mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{t.title}</h1>
      <p className="relative z-10 mt-1 text-text-muted">{device.nickname} asks:</p>

      <div className="relative z-10 mt-8 flex w-full max-w-3xl flex-1 flex-col items-center gap-6 md:flex-row md:items-center md:justify-center">
        <AnswerButton kind="cap" onClick={() => answer(false)} disabled={!!result} className="hidden md:flex" />

        <div
          ref={cardEl}
          className={`relative w-full max-w-sm touch-pan-y select-none overflow-hidden rounded-3xl bg-paper p-7 text-ink shadow-2xl transition-shadow ${
            result === 'right' ? 'ring-8 ring-fact' : result === 'wrong' ? 'ring-8 ring-cap' : ''
          }`}
          onPointerDown={(e) => {
            if (result || busy.current) return
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
          <span className="js-red pointer-events-none absolute inset-0 bg-cap opacity-0" aria-hidden="true" />
          {lean !== 0 && (
            <span className={`absolute top-4 rounded-lg px-3 py-1 text-lg font-bold ${lean > 0 ? 'right-4 bg-fact text-navy-900' : 'left-4 bg-cap text-white'}`}>{lean > 0 ? t.fact : t.cap}</span>
          )}
          <p className="relative pt-8 font-hand text-3xl leading-snug">{tx(card.statement)}</p>
          <p className="relative mt-6 flex items-center gap-2 text-sm text-ink/60">
            <img src={device.photos[0].src} alt="" className="h-7 w-7 rounded-full object-cover" /> {device.nickname}
          </p>
        </div>

        <AnswerButton kind="fact" onClick={() => answer(true)} disabled={!!result} className="hidden md:flex" />

        <div className="flex w-full max-w-sm gap-3 md:hidden">
          <AnswerButton kind="cap" onClick={() => answer(false)} disabled={!!result} className="flex flex-1" />
          <AnswerButton kind="fact" onClick={() => answer(true)} disabled={!!result} className="flex flex-1" />
        </div>
        {!result && <p className="text-sm text-faint md:hidden">{t.swipe}</p>}
      </div>

      {result && (
        <section role="status" className={`relative z-10 mt-6 w-full max-w-xl rounded-3xl p-5 ${result === 'right' ? 'bg-fact/20 ring-2 ring-fact' : 'bg-cap/15 ring-2 ring-cap'}`}>
          {result === 'right' ? (
            <>
              <p className="flex items-center gap-3 text-2xl font-bold">
                {t.right}
                {firstTry && <span className="flex items-center gap-1 text-cta motion-safe:animate-bounce"><Coin /> {t.coins(COINS_PER_ANSWER)}</span>}
              </p>
              <p className="mt-1 text-lg">{tx(card.why)}</p>
              <Button className="mt-4" onClick={advance}>{last ? t.finish : t.next}</Button>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold">{t.wrong}</p>
              <p className="mt-1 text-lg"><span className="font-semibold">{t.hint}:</span> {tx(card.hint)}</p>
              <Button className="mt-4" onClick={() => setResult(null)}>{t.tryAgain}</Button>
            </>
          )}
        </section>
      )}

      {/* flying coins */}
      <div ref={fx} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true" />
    </main>
  )
}

function AnswerButton({ kind, onClick, disabled, className = '' }: { kind: 'fact' | 'cap'; onClick: () => void; disabled: boolean; className?: string }) {
  const fact = kind === 'fact'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`jelly min-h-14 items-center justify-center gap-2 rounded-2xl px-7 text-xl font-bold transition hover:brightness-110 active:translate-y-1 disabled:opacity-40 md:h-28 md:w-28 md:flex-col md:rounded-full ${
        fact ? 'bg-fact text-navy-900 shadow-[0_5px_0_#1A8F84]' : 'bg-cap text-white shadow-[0_5px_0_#B5302F]'
      } ${className}`}
    >
      <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden="true">
        {fact ? <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /> : <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
      </svg>
      {fact ? t.fact : t.cap}
    </button>
  )
}
