import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Button from '../../components/Button'
import DeviceArt from '../../components/art/DeviceArt'
import { en } from '../../content/i18n/en'
import { sfx } from '../../audio/sfx'

const t = en.laser
// Real average round trip for a laser pulse to the Moon (laserRanging source in content/sources.ts).
const ROUND_TRIP_S = 2.5

// Fire a pulse from Earth, watch it bounce off Reflecto, and time the trip.
export default function LaserGame({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const timer = useRef<HTMLSpanElement>(null)
  const [phase, setPhase] = useState<'ready' | 'flying' | 'done'>('ready')

  const { contextSafe } = useGSAP({ scope: root })

  const fire = contextSafe(() => {
    sfx.laser()
    setPhase('flying')
    const clock = { s: 0 }
    const show = () => {
      if (timer.current) timer.current.textContent = clock.s.toFixed(2)
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clock.s = ROUND_TRIP_S
      show()
      setPhase('done')
      return
    }
    gsap
      .timeline({ onComplete: () => { sfx.right(); setPhase('done') } })
      .to(clock, { s: ROUND_TRIP_S, duration: ROUND_TRIP_S, ease: 'none', onUpdate: show }, 0)
      .fromTo('.js-photon', { left: '12%', top: '78%', opacity: 1 }, { left: '80%', top: '22%', duration: ROUND_TRIP_S / 2, ease: 'none' }, 0)
      .call(() => sfx.beep(), [], ROUND_TRIP_S / 2)
      .to('.js-reflecto', { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1 }, ROUND_TRIP_S / 2)
      .to('.js-photon', { left: '12%', top: '78%', duration: ROUND_TRIP_S / 2, ease: 'none' }, ROUND_TRIP_S / 2)
      .set('.js-photon', { opacity: 0 })
  })

  return (
    <div ref={root} className="flex flex-col items-center gap-5">
      <div className="relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-3xl bg-navy-950 ring-2 ring-white/10">
        {/* Earth (bottom-left) and Moon with Reflecto (top-right) */}
        <svg viewBox="0 0 100 100" className="absolute bottom-[6%] left-[2%] w-[24%]" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#2F6FDB" />
          <path d="M26 30 Q40 20 48 34 Q44 48 30 46 Q20 40 26 30Z M58 52 Q74 44 80 60 Q70 76 58 68Z" fill="#2E9E6B" />
        </svg>
        <svg viewBox="0 0 100 100" className="absolute right-[2%] top-[4%] w-[30%]" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#CFCFD8" />
          <circle cx="36" cy="40" r="10" fill="#A9AEBF" />
          <circle cx="62" cy="64" r="7" fill="#A9AEBF" />
        </svg>
        <div className="js-reflecto absolute right-[12%] top-[14%] w-[12%]">
          <DeviceArt id="reflecto" className="h-auto w-full" />
        </div>
        {/* the beam path */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <line x1="14" y1="80" x2="82" y2="24" stroke="#FF4D4D" strokeOpacity={phase === 'ready' ? 0.25 : 0.7} strokeDasharray="1.5 1.5" strokeWidth="0.6" />
        </svg>
        <span className="js-photon absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flag opacity-0 shadow-[0_0_20px_6px_#FF4D4D]" aria-hidden="true" />

        {/* stopwatch */}
        <div className="absolute left-4 top-4 rounded-2xl bg-black/50 px-4 py-2 font-bold tabular-nums">
          <span ref={timer} className="text-4xl text-coin">0.00</span>
          <span className="ml-1 text-lg text-text-muted">s</span>
        </div>
      </div>

      <div className="flex min-h-28 max-w-xl flex-col items-center gap-3 text-center" aria-live="polite">
        {phase === 'ready' && <Button size="lg" variant="cap" onClick={fire}>{t.fire}</Button>}
        {phase === 'flying' && <p className="text-xl font-semibold text-flag">{t.flying}</p>}
        {phase === 'done' && (
          <>
            <p className="text-2xl font-bold text-coin">{t.result(ROUND_TRIP_S.toFixed(1))}</p>
            <p className="text-text-muted">{t.explain}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="ghost" onClick={fire}>{t.again}</Button>
              <Button onClick={onDone}>{t.done}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
