import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import Button from '../components/Button'
import DeviceCard from '../components/DeviceCard'
import { deviceById } from '../content/worlds'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'

gsap.registerPlugin(useGSAP)
const t = en.card

const CONFETTI_COLORS = ['#FFC93C', '#2EC4B6', '#FF4D4D', '#8B6CF0', '#FFF1D6', '#5AA8F0']
const CONFETTI = Array.from({ length: 48 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w: 6 + ((i * 7) % 6),
  h: 10 + ((i * 11) % 8),
}))
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export default function CardReward() {
  const root = useRef<HTMLElement>(null)
  const device = deviceById[useGame((s) => s.deviceId)]
  const { go, open } = useGame.getState()
  // 'pack' = sealed pack waiting for a tap; 'open' = the card is out (texts and buttons show)
  const [phase, setPhase] = useState<'pack' | 'opening' | 'open'>(() => (reducedMotion() ? 'open' : 'pack'))
  // Start face-down inside the pack (set before the first paint, so the face never flashes).
  const { contextSafe } = useGSAP(
    () => {
      if (phase === 'pack') gsap.set('.js-flip', { rotationY: 180, scale: 0.92 })
    },
    { scope: root },
  )

  const tear = contextSafe(() => {
    if (phase !== 'pack') return
    setPhase('opening')
    gsap
      .timeline({ onComplete: () => setPhase('open') })
      // the pack wiggles, the top strip rips off
      .to('.js-pack', { rotation: 4, duration: 0.06, yoyo: true, repeat: 7, ease: 'none' })
      .set('.js-pack', { rotation: 0 })
      .to('.js-pack-top', { x: 70, y: -90, rotation: 35, opacity: 0, duration: 0.5, ease: 'power2.out' })
      // the card slides up out of the pack, the pack drops away
      .to('.js-flip', { yPercent: -62, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .to('.js-pack', { y: '70vh', rotation: 12, opacity: 0, duration: 0.7, ease: 'power2.in' }, '+=0.1')
      // the card drops to center while flipping to show its face
      .to('.js-flip', { yPercent: 0, rotationY: 0, scale: 1, duration: 0.9, ease: 'back.out(1.3)' }, '<')
      .fromTo('.js-ray', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, '<0.3')
      // confetti pops up and rains down
      .set('.js-confetti', { x: 0, y: 0, opacity: 1 }, '<0.2')
      .to('.js-confetti', { x: () => gsap.utils.random(-45, 45) + 'vw', y: () => gsap.utils.random(-45, -20) + 'vh', rotation: () => gsap.utils.random(-360, 360), duration: 0.6, ease: 'power2.out' }, '<')
      .to('.js-confetti', { y: '+=80vh', rotation: '+=360', opacity: 0, duration: 1.8, ease: 'power1.in', stagger: 0.01 })
  })

  useGSAP(
    () => {
      if (phase !== 'open') return
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.js-text', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 })
        gsap.to('.js-ray', { rotation: 360, duration: 40, repeat: -1, ease: 'none' })
      })
    },
    { scope: root, dependencies: [phase] },
  )

  return (
    <main ref={root} className="space-sky relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8 text-center">
      <Starfield />
      <div className={`js-ray pointer-events-none absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 bg-[repeating-conic-gradient(rgb(255_201_60/0.12)_0_8deg,transparent_8deg_24deg)] ${phase === 'pack' ? 'opacity-0' : ''}`} />

      <h1 className={`js-text relative text-3xl font-bold tracking-tight sm:text-4xl ${phase === 'open' ? '' : 'invisible'}`}>{t.earned(device.nickname)}</h1>

      <div className="relative [perspective:1000px]">
        {/* the card: front and back faces, flipped in 3D */}
        <div className="js-flip relative [transform-style:preserve-3d]">
          <div className="[backface-visibility:hidden]">
            <DeviceCard device={device} interactive={phase === 'open'} />
          </div>
          <div className="absolute inset-0 grid place-items-center rounded-[1.1em] bg-[radial-gradient(circle_at_50%_40%,#2F6FDB,#0B1D3A_70%)] ring-8 ring-inset ring-cta [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden="true">
            <svg viewBox="0 0 20 20" className="h-20 w-20 text-cta"><path d="M10 1l2.6 6.2 6.7.6-5.1 4.4 1.6 6.6L10 15.3 4.2 18.8l1.6-6.6L.7 7.8l6.7-.6z" fill="currentColor" /></svg>
          </div>
        </div>

        {/* the sealed foil pack, in front of the card until it's torn open */}
        {phase !== 'open' && (
          <button
            type="button"
            onClick={tear}
            disabled={phase !== 'pack'}
            aria-label={t.openPack}
            className="js-pack absolute -inset-x-3 -bottom-4 -top-3 rounded-2xl bg-[linear-gradient(135deg,#C9CDD8_0%,#FFFFFF_25%,#9FE3FF_45%,#C9A7FF_60%,#FFFFFF_75%,#C9CDD8_100%)] shadow-[0_20px_50px_rgb(0_0_0/0.5)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact"
          >
            {/* tear-off strip with a zigzag edge */}
            <span className="js-pack-top absolute inset-x-0 top-0 block h-10 rounded-t-2xl bg-[#B5BACA] [clip-path:polygon(0_0,100%_0,100%_70%,95%_100%,90%_70%,85%_100%,80%_70%,75%_100%,70%_70%,65%_100%,60%_70%,55%_100%,50%_70%,45%_100%,40%_70%,35%_100%,30%_70%,25%_100%,20%_70%,15%_100%,10%_70%,5%_100%,0_70%)]" />
            <span className="flex h-full flex-col items-center justify-center gap-3 px-6 text-navy-900">
              <svg viewBox="0 0 20 20" className="h-16 w-16 text-airmail-red motion-safe:animate-pulse" aria-hidden="true"><path d="M10 1l2.6 6.2 6.7.6-5.1 4.4 1.6 6.6L10 15.3 4.2 18.8l1.6-6.6L.7 7.8l6.7-.6z" fill="currentColor" /></svg>
              <span className="text-2xl font-bold">{en.landing.brand}</span>
              <span className="text-sm font-semibold uppercase tracking-widest">{t.pack}</span>
              <span className="mt-6 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-text">{t.openPack}</span>
            </span>
          </button>
        )}
      </div>

      {phase === 'open' && (
        <>
          <p className="js-text relative text-text-muted">{t.note}</p>
          <div className="js-text relative flex flex-wrap justify-center gap-3">
            <Button onClick={() => open('profile', device.id)}>{t.profile(device.nickname)}</Button>
            <Button variant="ghost" onClick={() => go('level')}>{t.map}</Button>
          </div>
        </>
      )}

      {/* confetti */}
      <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span key={i} className="js-confetti absolute block rounded-sm opacity-0" style={{ width: c.w, height: c.h, background: c.color }} />
        ))}
      </div>
    </main>
  )
}
