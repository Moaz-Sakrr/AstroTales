import { useEffect, useRef, useState, type PointerEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import Chest from '../components/art/Chest'
import { Coin } from '../components/icons'
import { devices } from '../content/devices'
import { en } from '../content/i18n/en'
import { useProgress } from '../store/progress'
import { sfx } from '../audio/sfx'

gsap.registerPlugin(useGSAP)
const t = en.quiz
const SWIPE_PX = 90

// Fact or Cap? Retrieval practice with instant feedback: wrong answers get a hint and a retry, never a lock-out.
export default function Quiz() {
  const { deviceId, go, answer, completeDevice } = useProgress()
  const device = deviceId ? devices[deviceId] : null
  const [idx, setIdx] = useState(0)
  const [status, setStatus] = useState<'ask' | 'right' | 'wrong'>('ask')
  const [gained, setGained] = useState(0)
  const [dragX, setDragX] = useState(0)
  const drag = useRef<{ x: number; id: number } | null>(null)
  const root = useRef<HTMLElement>(null)
  const { contextSafe } = useGSAP({ scope: root })

  const quiz = device?.quiz ?? []
  const card = quiz[idx]
  const solved = status === 'right' ? idx + 1 : idx
  const allDone = solved === quiz.length

  const respond = (saidFact: boolean) => {
    if (!device || status === 'right') return
    if (saidFact === card.isFact) {
      const got = answer(device.id, idx)
      setGained(got)
      setStatus('right')
      sfx.right()
      if (got) setTimeout(() => sfx.coin(), 250)
    } else {
      setStatus('wrong')
      sfx.wrong()
    }
    setDragX(0)
  }

  const nextCard = () => {
    sfx.tap()
    setIdx((i) => i + 1)
    setStatus('ask')
    setGained(0)
  }

  const openChest = contextSafe(() => {
    sfx.chest()
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      completeDevice()
      return
    }
    gsap
      .timeline({ onComplete: completeDevice })
      .to('.js-chest', { scale: 1.1, duration: 0.2, yoyo: true, repeat: 3 })
      .to('.js-lid', { rotation: -35, y: -18, duration: 0.5, ease: 'back.out(2)' })
      .to('.js-chest-glow', { opacity: 0.9, scale: 1.6, svgOrigin: '100 66', duration: 0.5 }, '<')
  })

  // Keyboard: ← Cap, → Fact.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== 'ask' && status !== 'wrong') return
      if (e.key === 'ArrowLeft') respond(false)
      if (e.key === 'ArrowRight') respond(true)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  // Swipe: drag the card left (Cap) or right (Fact).
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (status === 'right') return
    drag.current = { x: e.clientX, id: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) setDragX(e.clientX - drag.current.x)
  }
  const onUp = () => {
    if (!drag.current) return
    drag.current = null
    if (Math.abs(dragX) > SWIPE_PX) respond(dragX > 0)
    else setDragX(0)
  }

  if (!device || !card) return null

  const tint = status === 'right' ? 'ring-fact' : status === 'wrong' ? 'ring-cap' : dragX > 30 ? 'ring-fact/70' : dragX < -30 ? 'ring-cap/70' : 'ring-transparent'

  return (
    <main ref={root} className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar onBack={() => go('profile')} title={t.title} />

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 pb-10">
        <div className="js-chest w-40 sm:w-48">
          <Chest solved={solved} total={quiz.length} className="h-auto w-full" />
        </div>
        <h1 className="mt-1 text-3xl font-bold">{t.title}</h1>
        <p className="text-center text-text-muted">{t.sub}</p>

        <>
            <p className="mt-4 text-sm font-semibold text-faint">{t.count(idx + 1, quiz.length)}</p>
            {/* the statement card */}
            <div
              className={`mt-2 w-full cursor-grab touch-pan-y select-none rounded-3xl bg-paper p-6 text-center text-ink shadow-xl ring-4 transition-[box-shadow] active:cursor-grabbing ${tint} ${status === 'wrong' ? 'shake' : ''}`}
              style={{ transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)` }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              aria-live="polite"
            >
              <p className="font-hand text-3xl leading-snug">“{card.statement.en}”</p>
              {status === 'right' && (
                <div className="mt-4 rounded-2xl bg-fact/15 p-3">
                  <p className="text-lg font-bold text-fact-ink">{t.correct} {card.isFact ? t.fact : t.cap}</p>
                  <p>{card.why.en}</p>
                </div>
              )}
              {status === 'wrong' && (
                <div className="mt-4 rounded-2xl bg-cap/15 p-3">
                  <p className="font-bold text-cap-ink">{t.wrong}</p>
                  <p>{card.hint.en}</p>
                </div>
              )}
            </div>
            {status === 'ask' && <p className="mt-2 text-sm text-faint md:hidden">{t.swipeHint}</p>}

            {status === 'right' ? (
              <div className="mt-5 flex items-center gap-4">
                {gained > 0 && (
                  <span className="flex items-center gap-1 text-2xl font-bold text-coin">
                    <Coin className="h-8 w-8" /> {t.plus(gained)}
                  </span>
                )}
                {allDone ? (
                  <Button size="lg" onClick={openChest}>{t.open}</Button>
                ) : (
                  <Button onClick={nextCard}>{t.next}</Button>
                )}
              </div>
            ) : (
              <div className="mt-5 grid w-full grid-cols-2 gap-3">
                <Button variant="cap" size="lg" onClick={() => respond(false)}>← {t.cap}</Button>
                <Button variant="fact" size="lg" onClick={() => respond(true)}>{t.fact} →</Button>
              </div>
            )}
        </>
      </div>
    </main>
  )
}
