import { useEffect, useRef, useState } from 'react'
import Starfield from '../components/Starfield'
import CharacterFace from '../components/CharacterFace'
import { preloadCharacter } from '../content/characters'
import Button from '../components/Button'
import { Coin } from '../components/CoinBadge'
import { deviceById } from '../content/worlds'
import { tx } from '../content/l10n'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'
import { sfx } from '../audio/engine'

const t = en.quiz
const COINS_PER_ANSWER = 10
const SWIPE = 90 // px of drag that counts as an answer

// Fact or Cap? Right on the first try = +10 coins. Wrong = hint + retry, never locked out.
export default function Quiz() {
  const deviceId = useGame((s) => s.deviceId)
  const completeDevice = useGame((s) => s.completeDevice)
  const go = useGame((s) => s.go)
  const character = useGame((s) => s.character)
  useEffect(() => preloadCharacter(character), [character])
  const device = deviceById[deviceId]
  const [qi, setQi] = useState(0)
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [firstTry, setFirstTry] = useState(true)
  const [earned, setEarned] = useState(0)
  const [hintOpen, setHintOpen] = useState(false) // the Hint button shows the hint before answering
  const [dx, setDx] = useState(0) // how far the card is being dragged
  const start = useRef<number | null>(null)
  const card = device.quiz[qi]
  const last = qi === device.quiz.length - 1

  const answer = (saysFact: boolean) => {
    if (result === 'right') return
    setDx(0)
    if (saysFact === card.isFact) {
      sfx('ding')
      if (firstTry) {
        sfx('coin', 0.18)
        setEarned((e) => e + COINS_PER_ANSWER)
      }
      setResult('right')
    } else {
      sfx('bonk')
      setFirstTry(false)
      setResult('wrong')
    }
  }

  const advance = () => {
    if (last) return completeDevice(device.id, earned)
    setQi(qi + 1)
    setResult(null)
    setFirstTry(true)
    setHintOpen(false)
  }

  const showHint = hintOpen || result === 'wrong'
  const answerLabel = card.isFact ? t.fact : t.cap

  // Design "C · Card Stack": a stack of cards, the top one holds the question; round Cap / Fact buttons below.
  return (
    <main className="relative flex min-h-svh flex-col items-center overflow-hidden bg-[radial-gradient(50%_60%_at_50%_55%,var(--color-navy-700)_0%,var(--color-navy-900)_70%)] px-4 pb-6 pt-3 sm:px-10">
      <Starfield />
      {/* phones: a flex row (title shrinks to fit beside the face + coins); wider: centered title in a 3-column grid */}
      <header className="relative z-10 flex w-full max-w-5xl items-center gap-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-0">
        <button type="button" onClick={() => go('level')} aria-label={t.back} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 justify-self-start rounded-full text-text-muted hover:text-text sm:px-3">
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
          <span className="hidden sm:inline">{t.back}</span>
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center font-display text-[1.65rem] font-extrabold leading-none sm:text-5xl">{t.title}</h1>
        <div className="flex shrink-0 items-center gap-1.5 justify-self-end sm:gap-2">
          {/* the kid reacts to each answer */}
          <CharacterFace kind={character} mood={result === 'right' ? 'laugh' : result === 'wrong' ? 'worried' : 'curious'} className="h-10 w-10 ring-2 ring-cta sm:h-11 sm:w-11" />
          <p className="flex min-h-11 items-center gap-1.5 rounded-full bg-black/30 px-3 font-display text-xl font-extrabold text-cta sm:px-4" aria-label={`${earned} coins earned`}>
            <Coin className="h-6 w-6" /> <span className="tabular-nums">{earned}</span>
          </p>
        </div>
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
        <div className="relative h-[min(560px,64svh)] w-[min(86vw,460px)]">
          <div className="absolute inset-0 translate-y-3.5 -rotate-[7deg] rounded-[2rem] bg-[#8B6CF0]" aria-hidden="true" />
          <div className="absolute inset-0 translate-y-2 rotate-[5deg] rounded-[2rem] bg-fact" aria-hidden="true" />
          <div
            className={`absolute inset-0 flex touch-pan-y select-none flex-col overflow-hidden rounded-[2rem] bg-paper text-ink shadow-[0_24px_50px_rgb(0_0_0/0.45)] transition-[transform,box-shadow] ${start.current === null ? 'duration-300' : 'duration-0'} ${
              result === 'right' ? 'ring-[6px] ring-fact' : result === 'wrong' ? 'ring-[6px] ring-cap' : ''
            }`}
            style={{ transform: `translateX(${dx}px) rotate(${dx / 18}deg)` }}
            onPointerDown={(e) => {
              if (result === 'right') return
              start.current = e.clientX
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => start.current !== null && setDx(e.clientX - start.current)}
            onPointerUp={() => {
              if (start.current === null) return
              start.current = null
              if (dx > SWIPE) answer(true)
              else if (dx < -SWIPE) answer(false)
              else setDx(0)
            }}
          >
            {/* the photo gets most of the card, edge to edge */}
            <img src={device.photos[0].src} alt="" draggable={false} className="h-[60%] min-h-40 w-full shrink-0 object-cover" />
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 pb-4 pt-3 sm:px-7">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink/70">{t.says(device.nickname)}</span>
                <span className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-paper" aria-label={`Question ${qi + 1} of ${device.quiz.length}`}>{qi + 1} / {device.quiz.length}</span>
              </div>
              <p className={`text-[1.4rem] font-semibold leading-tight sm:text-[1.9rem] ${result === 'right' ? 'text-ink/60' : ''}`}>{tx(card.statement)}</p>
              {result === 'right' && <p className="text-base leading-snug sm:text-lg">{tx(card.why)}</p>}
              {showHint && result !== 'right' && (
                <p className="flex items-start gap-2 rounded-2xl bg-cta/25 p-3 text-base leading-snug">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-cta-edge" aria-hidden="true"><path d="M7 16h6M8 18h4M10 2a6 6 0 0 0-3.5 10.9V14h7v-1.1A6 6 0 0 0 10 2z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" /></svg>
                  <span>{result === 'wrong' && <strong>{t.wrong} </strong>}<strong>{t.hint}:</strong> {tx(card.hint)}</span>
                </p>
              )}
            </div>

            {/* rubber stamp on a right answer */}
            {result === 'right' && (
              <div className="absolute right-4 top-[calc(60%-5.5rem)] -rotate-12 rounded-xl border-[5px] border-fact-ink bg-paper/90 px-3.5 py-1 text-center font-display leading-none text-fact-ink">
                <span className="block text-3xl font-extrabold">{answerLabel.toUpperCase()}</span>
                <span className="block text-sm font-bold">{t.gotIt}</span>
              </div>
            )}

            {Math.abs(dx) > 30 && (
              <span className={`absolute top-4 -rotate-6 rounded-lg px-3 py-1 font-display text-2xl font-extrabold ${dx > 0 ? 'right-4 bg-fact text-navy-900' : 'left-4 bg-cap text-white'}`}>{dx > 0 ? t.fact.toUpperCase() : t.cap.toUpperCase()}</span>
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
            <Button sound="swipe" className="w-full font-display text-xl font-extrabold sm:w-auto sm:min-w-64" onClick={advance}>{last ? t.finish : t.next}</Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-6 sm:gap-9">
              <RoundAnswer kind="cap" onClick={() => answer(false)} />
              <button
                type="button"
                onClick={() => {
                  sfx('pling')
                  setHintOpen(true)
                }}
                disabled={showHint}
                className="flex min-h-14 transition items-center gap-2 rounded-full border-2 border-white/25 bg-white/5 px-5 text-lg text-text hover:bg-white/10 disabled:opacity-40"
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
      className={`flex h-20 transition hover:brightness-110 w-20 items-center justify-center rounded-full text-ink active:translate-y-1 sm:h-26 sm:w-26 ${
        fact ? 'bg-fact shadow-[0_8px_0_var(--color-fact-edge)]' : 'bg-cap shadow-[0_8px_0_var(--color-cap-edge)]'
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true">
        {fact ? <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /> : <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
      </svg>
    </button>
  )
}
