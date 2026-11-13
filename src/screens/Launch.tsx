import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Rocket from '../components/Rocket'
import Astronaut from '../components/Astronaut'
import Starfield from '../components/Starfield'
import { suits } from '../content/suits'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'

gsap.registerPlugin(useGSAP)
const t = en.launch
const PUFFS = Array.from({ length: 14 }, (_, i) => ({ x: (i - 7) * 7 + 50, size: 70 + ((i * 37) % 60) }))

// Three cloud layers the rocket punches through. Near layers are bigger and rush past faster.
const CLOUDS = [0, 1, 2].map((layer) =>
  Array.from({ length: 4 + layer }, (_, i) => ({ x: ((i * 61 + layer * 23) % 100) - 10, y: (i * 37 + layer * 19) % 100, w: 140 + layer * 90 + ((i * 47) % 80) })),
)

function Cloud({ w }: { w: number }) {
  return (
    <svg viewBox="0 0 200 90" width={w} aria-hidden="true">
      <g fill="#FFFFFF">
        <ellipse cx="60" cy="58" rx="52" ry="28" />
        <ellipse cx="105" cy="42" rx="46" ry="36" />
        <ellipse cx="148" cy="60" rx="44" ry="24" />
        <rect x="18" y="58" width="168" height="26" rx="13" />
      </g>
    </svg>
  )
}


export default function Launch() {
  const root = useRef<HTMLElement>(null)
  const countEl = useRef<HTMLParagraphElement>(null)
  const kind = useGame((s) => s.character)
  const go = useGame((s) => s.go)

  useGSAP(
    () => {
      const done = () => go('space')
      // The countdown text is set directly (not through React state) so GSAP can animate it the same frame.
      const say = (text: string) => {
        if (countEl.current) countEl.current.textContent = text
      }
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

        // 2. countdown: each number punches in, the screen shudders a little more, the glow under the rocket grows
        const numbers = t.countdown.slice(0, -1)
        numbers.forEach((n, k) => {
          const power = (k + 1) / numbers.length
          tl.call(() => say(n))
            .fromTo('.js-count', { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(3)' })
            .to('.js-glow', { opacity: 0.25 + power * 0.55, scale: 0.7 + power * 0.6, duration: 0.3 }, '<')
            .fromTo('.js-shake', { x: -2 - power * 4 }, { x: 2 + power * 4, duration: 0.04, repeat: 5, yoyo: true, ease: 'none' }, '<')
            .set('.js-shake', { x: 0 })
            .to({}, { duration: 0.45 })
        })

        // 3. ignition: "Liftoff!", flame on, big rumble, smoke billows
        tl.call(() => say(t.countdown[t.countdown.length - 1]))
          .fromTo('.js-count', { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(3)' })
          .fromTo('.js-flame', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)' }, '<')
          .to('.js-glow', { opacity: 1, scale: 1.8, duration: 0.4 }, '<')
          .fromTo('.js-shake', { x: -7, y: 2 }, { x: 7, y: -2, repeat: 13, yoyo: true, duration: 0.045, ease: 'none' }, '<')
          .set('.js-puff', { scale: 0.2, opacity: 0.9 }, '<')
          .to('.js-puff', { scale: 1.6, opacity: 0, x: (i) => (i - 7) * 26, duration: 2.2, stagger: 0.04, ease: 'power2.out' }, '<')
          .set('.js-shake', { x: 0, y: 0 })
          .to('.js-count', { opacity: 0, y: -30, duration: 0.4 }, '+=0.2')

        // 4. climb: the camera follows the rocket, so the world moves instead of the ship
        tl.addLabel('climb', '-=1.4')
          .to('.js-rocket', { y: '-32vh', duration: 2, ease: 'power2.in' }, 'climb')
          .to('.js-ground', { y: '75vh', duration: 2.4, ease: 'power2.in' }, 'climb')
          .to('.js-glow', { opacity: 0, duration: 0.8 }, 'climb+=0.6')
          // clouds rush past, nearest layer fastest
          .fromTo('.js-cloud-0', { y: '-130vh' }, { y: '140vh', duration: 2.6, ease: 'none' }, 'climb+=0.7')
          .fromTo('.js-cloud-1', { y: '-130vh' }, { y: '140vh', duration: 2, ease: 'none' }, 'climb+=0.9')
          .fromTo('.js-cloud-2', { y: '-130vh' }, { y: '140vh', duration: 1.5, ease: 'none' }, 'climb+=1.1')
          // blue sky → purple → black space with stars
          .to('.js-sky-purple', { opacity: 1, duration: 1.3 }, 'climb+=1.4')
          .to('.js-sky-space', { opacity: 1, duration: 1.4 }, 'climb+=2.6')
          // the curve of the Earth rises from below
          .fromTo('.js-earth', { y: '45vh' }, { y: '0vh', duration: 2, ease: 'power2.out' }, 'climb+=2.8')
          // and off we go
          .to('.js-rocket', { y: '-150vh', duration: 1.3, ease: 'power3.in' }, 'climb+=4.6')

        gsap.to('.js-flame', { scaleY: 0.85, repeat: -1, yoyo: true, duration: 0.08 })
      })
    },
    { scope: root },
  )

  return (
    <main ref={root} className="relative h-svh overflow-hidden bg-navy-950">
      <div className="js-shake absolute inset-0">
        {/* sky stages: day blue → purple → black space */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#2F6FDB_0%,#5AA8F0_55%,#CFE9FF_100%)]" />
        <div className="js-sky-purple absolute inset-0 bg-[linear-gradient(180deg,#120E3A_0%,#3A1F78_50%,#8A4FB8_100%)] opacity-0" />
        <div className="js-sky-space space-sky absolute inset-0 opacity-0">
          <Starfield />
        </div>

        {/* the curve of the Earth, waiting below the screen */}
        <div
          className="js-earth absolute left-1/2 top-[74%] aspect-square w-[280vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_7%_1.6%_at_38%_2.2%,#2E9E6B_60%,transparent),radial-gradient(ellipse_5%_1.2%_at_62%_3%,#2E9E6B_55%,transparent),radial-gradient(ellipse_9%_0.8%_at_52%_1.2%,rgb(255_255_255/0.7),transparent),radial-gradient(circle_at_50%_2%,#7FD1FF_0%,#2F6FDB_6%,#1E5BB8_20%,#173B8C_45%)] shadow-[0_0_60px_25px_rgb(111_184_255/0.55)]"
          style={{ transform: 'translateY(45vh)' }}
        />

        {CLOUDS.map((layer, l) => (
          <div key={l} className={`js-cloud-${l} pointer-events-none absolute inset-0`} style={{ transform: 'translateY(-130vh)', opacity: 0.55 + l * 0.2 }} aria-hidden="true">
            {layer.map((c, i) => (
              <div key={i} className="absolute" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                <Cloud w={c.w} />
              </div>
            ))}
          </div>
        ))}

        <div className="js-ground absolute inset-x-0 bottom-0 h-[24%]">
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d="M0 60 C 200 20 380 50 520 34 C 700 14 860 40 1000 28 L1000 200 L0 200Z" fill="#2E7D4F" />
            <path d="M0 110 C 240 80 600 100 1000 84 L1000 200 L0 200Z" fill="#23633E" />
          </svg>
          {/* launch pad + tower */}
          <div className="absolute bottom-[38%] left-1/2 h-4 w-48 -translate-x-1/2 rounded-sm bg-[#5D6378]" />
          <div className="absolute bottom-[38%] left-[calc(50%-120px)] h-[min(46vh,360px)] w-6 bg-[repeating-linear-gradient(45deg,#8A90A6_0_3px,transparent_3px_12px),repeating-linear-gradient(-45deg,#8A90A6_0_3px,transparent_3px_12px)] outline-2 outline-[#8A90A6]" />
          {/* orange glow under the engine that grows with each count */}
          <div className="js-glow pointer-events-none absolute bottom-[20%] left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_170_60/0.95),rgb(255_110_40/0.5)_45%,transparent)] opacity-0 blur-md" />
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
            <Rocket kind={kind} flame />
          </div>
        </div>

        <div className="js-kid absolute bottom-[calc(9.1%+16px)] left-[calc(50%-150px)] w-20">
          <Astronaut suit={suits.classic} kind={kind} width={80} />
        </div>
      </div>

      <p ref={countEl} aria-live="assertive" className="js-count pointer-events-none absolute inset-x-0 top-[18%] text-center text-7xl font-bold text-cta opacity-0 drop-shadow-[0_4px_0_rgb(0_0_0/0.4)] sm:text-8xl" />

      <button type="button" onClick={() => go('space')} className="absolute right-4 top-4 min-h-11 rounded-full bg-black/25 px-5 font-semibold text-text hover:bg-black/40">
        {t.skip}
      </button>
    </main>
  )
}
