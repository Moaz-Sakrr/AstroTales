import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Rocket from '../components/Rocket'
import Astronaut from '../components/Astronaut'
import Starfield from '../components/Starfield'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'
import { clip, sfx, stopClips } from '../audio/engine'

gsap.registerPlugin(useGSAP)
const t = en.launch
const PUFFS = Array.from({ length: 14 }, (_, i) => ({ x: (i - 7) * 7 + 50, size: 70 + ((i * 37) % 60) }))

export default function Launch() {
  const root = useRef<HTMLElement>(null)
  const kind = useGame((s) => s.character)
  const go = useGame((s) => s.go)
  const [count, setCount] = useState<string | null>(null)

  useGSAP(
    () => {
      const done = () => go('space')
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {
        const id = setTimeout(done, 800)
        return () => clearTimeout(id)
      })
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ onComplete: done })
        // 1. walk to the rocket and climb in
        tl.from('.js-kid', { x: '-40vw', duration: 1.6, ease: 'power1.inOut' })
          .to('.js-kid', { y: -10, repeat: 5, yoyo: true, duration: 0.13, ease: 'sine.inOut' }, 0)
          .to('.js-kid', { x: 110, y: -90, scale: 0.3, opacity: 0, duration: 0.7, ease: 'power2.in' }) // into the hatch
        // 2. countdown
        t.countdown.forEach((n, i) =>
          tl.call(() => {
            setCount(n)
            if (i === t.countdown.length - 1) sfx('go')
            else clip('quindar', 'beep')
          }).to({}, { duration: 0.75 }),
        )
        // 3. ignition: flame on, rocket shakes, smoke billows
        tl.call(() => {
          setCount(null)
          clip('liftoff')
          clip('rocket', 'rumble')
        })
          .fromTo('.js-flame', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)' })
          .to('.js-rocket', { x: '+=3', repeat: 11, yoyo: true, duration: 0.05 }, '<')
          .set('.js-puff', { scale: 0.2, opacity: 0.9 }, '<')
          .to('.js-puff', { scale: 1.6, opacity: 0, x: (i) => (i - 7) * 26, duration: 2.2, stagger: 0.04, ease: 'power2.out' }, '<')
          // 4. liftoff: accelerate up, the sky turns to space, stars appear
          .to('.js-rocket', { y: '-130vh', duration: 2.6, ease: 'power3.in' }, '-=1.6')
          .to('.js-ground', { y: '40vh', duration: 2.6, ease: 'power3.in' }, '<')
          .to('.js-dawn', { opacity: 0, duration: 2.2 }, '<')
          .from('.js-stars', { opacity: 0, duration: 2 }, '<0.4')
        gsap.to('.js-flame', { scaleY: 0.85, repeat: -1, yoyo: true, duration: 0.08 })
      })
      return stopClips // a long NASA launch recording stops when we leave
    },
    { scope: root },
  )

  return (
    <main ref={root} className="relative h-svh overflow-hidden bg-navy-950">
      <div className="js-stars absolute inset-0">
        <Starfield />
      </div>
      {/* dawn sky over Earth, fades away as we climb */}
      <div className="js-dawn absolute inset-0 bg-[linear-gradient(180deg,#0B1D3A_0%,#2B3F7A_45%,#C46A5A_78%,#F4A261_100%)]" />

      <div className="js-ground absolute inset-x-0 bottom-0 h-[24%]">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0 60 C 200 20 380 50 520 34 C 700 14 860 40 1000 28 L1000 200 L0 200Z" fill="#20372E" />
          <path d="M0 110 C 240 80 600 100 1000 84 L1000 200 L0 200Z" fill="#162A23" />
        </svg>
        {/* launch pad + tower */}
        <div className="absolute bottom-[38%] left-1/2 h-4 w-48 -translate-x-1/2 rounded-sm bg-[#5D6378]" />
        <div className="absolute bottom-[38%] left-[calc(50%-120px)] h-[min(46vh,360px)] w-6 bg-[repeating-linear-gradient(45deg,#8A90A6_0_3px,transparent_3px_12px),repeating-linear-gradient(-45deg,#8A90A6_0_3px,transparent_3px_12px)] outline-2 outline-[#8A90A6]" />
      </div>

      {PUFFS.map((p, i) => (
        <div
          key={i}
          className="js-puff absolute bottom-[18%] rounded-full bg-[#E8E4E0] opacity-0 blur-[2px]"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, marginLeft: -p.size / 2 }}
        />
      ))}

      {/* pad top = 38% up a 24%-tall ground strip ≈ 9.1% of the screen, + the 16px pad */}
      <div className="js-rocket absolute bottom-[calc(9.1%+16px)] left-1/2 w-[min(28vw,150px)] -translate-x-1/2">
        {/* the bottom 28.6% of the rocket SVG is room for the flame; sink it so the fins sit on the pad */}
        <div className="translate-y-[28.6%]">
          <Rocket flame />
        </div>
      </div>

      <div className="js-kid absolute bottom-[calc(9.1%+16px)] left-[calc(50%-150px)] w-20">
        <Astronaut kind={kind} pose="threeq" width={80} />
      </div>

      {count && (
        <p key={count} aria-live="assertive" className="absolute inset-x-0 top-[22%] text-center text-7xl font-bold text-cta drop-shadow-[0_4px_0_rgb(0_0_0/0.4)] sm:text-8xl">
          {count}
        </p>
      )}

      <button type="button" onClick={() => go('space')} className="absolute right-4 top-4 min-h-11 rounded-full bg-white/10 px-5 font-semibold text-text hover:bg-white/20">
        {t.skip}
      </button>
    </main>
  )
}
