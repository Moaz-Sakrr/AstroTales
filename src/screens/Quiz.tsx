import { useRef, useState } from 'react'
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
  const [dx, setDx] = useState(0)
  const start = useRef<number | null>(null)
  const card = device.quiz[qi]
  const last = qi === device.quiz.length - 1

  const answer = (saysFact: boolean) => {
    if (result) return
    setDx(0)
    if (saysFact === card.isFact) {
      if (firstTry) setEarned((e) => e + COINS_PER_ANSWER)
      setResult('right')
    } else {
      setFirstTry(false)
      setResult('wrong')
    }
  }
  const advance = () => {
    if (last) return completeDevice(device.id, earned)
    setQi(qi + 1)
    setResult(null)
    setFirstTry(true)
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
        <p className="flex items-center gap-1.5 font-bold text-cta"><Coin /> +{earned}</p>
      </header>

      <h1 className="relative z-10 mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{t.title}</h1>
      <p className="relative z-10 mt-1 text-text-muted">{device.nickname} asks:</p>

      <div className="relative z-10 mt-8 flex w-full max-w-3xl flex-1 flex-col items-center gap-6 md:flex-row md:items-center md:justify-center">
        <AnswerButton kind="cap" onClick={() => answer(false)} disabled={!!result} className="hidden md:flex" />

        <div
          className={`relative w-full max-w-sm touch-pan-y select-none rounded-3xl bg-paper p-7 text-ink shadow-2xl transition-[transform,box-shadow] ${start.current === null ? 'duration-300' : 'duration-0'} ${
            result === 'right' ? 'ring-8 ring-fact' : result === 'wrong' ? 'ring-8 ring-cap' : ''
          }`}
          style={{ transform: `translateX(${dx}px) rotate(${dx / 18}deg)` }}
          onPointerDown={(e) => {
            if (result) return
            start.current = e.clientX
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => start.current !== null && setDx(e.clientX - start.current)}
          onPointerUp={() => {
            const moved = dx
            start.current = null
            if (moved > SWIPE) answer(true)
            else if (moved < -SWIPE) answer(false)
            else setDx(0)
          }}
        >
          {dx !== 0 && (
            <span className={`absolute top-4 rounded-lg px-3 py-1 text-lg font-bold ${dx > 0 ? 'right-4 bg-fact text-navy-900' : 'left-4 bg-cap text-white'}`}>{dx > 0 ? t.fact : t.cap}</span>
          )}
          <p className="pt-8 font-hand text-3xl leading-snug">{tx(card.statement)}</p>
          <p className="mt-6 flex items-center gap-2 text-sm text-ink/60">
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
      className={`min-h-14 items-center justify-center gap-2 rounded-2xl px-7 text-xl font-bold transition hover:brightness-110 active:translate-y-1 disabled:opacity-40 md:h-28 md:w-28 md:flex-col md:rounded-full ${
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
