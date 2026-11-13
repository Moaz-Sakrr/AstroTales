import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import Astronaut from '../components/Astronaut'
import WorldGlobe from '../components/art/WorldGlobe'
import Button from '../components/Button'
import { suits } from '../content/suits'
import { en } from '../content/i18n/en'
import { useProgress } from '../store/progress'
import { sfx } from '../audio/sfx'

gsap.registerPlugin(useGSAP)
const t = en.launch

// Seeded positions for the warp-speed star streaks.
const WARP = Array.from({ length: 34 }, (_, i) => ({ left: (i * 37) % 100, h: 40 + ((i * 53) % 90), delay: ((i * 17) % 10) / 10 }))

function Rocket() {
  const { character, suit } = useProgress()
  return (
    <svg viewBox="0 0 200 380" className="h-full w-full" overflow="visible">
      <defs>
        <linearGradient id="rk-body" x1="0" x2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#E8ECF5" />
          <stop offset="1" stopColor="#AEB6CC" />
        </linearGradient>
        <linearGradient id="rk-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF8E7" />
          <stop offset="0.3" stopColor="#FFC93C" />
          <stop offset="0.75" stopColor="#FF4D4D" />
          <stop offset="1" stopColor="#FF4D4D" stopOpacity="0" />
        </linearGradient>
        <clipPath id="rk-window">
          <circle cx="100" cy="122" r="23" />
        </clipPath>
      </defs>
      {/* smoke puffs, hidden until liftoff */}
      {[-70, -40, -10, 20, 50, 80].map((dx, i) => (
        <circle key={dx} className="js-smoke" cx={100 + dx} cy={300 + (i % 2) * 14} r="34" fill="#E8ECF5" opacity="0" />
      ))}
      {/* flame */}
      <g className="js-flame" style={{ transformOrigin: '100px 268px' }}>
        <path d="M74 268 Q100 390 126 268 Z" fill="url(#rk-flame)" />
        <path d="M86 268 Q100 330 114 268 Z" fill="#FFF8E7" />
      </g>
      {/* fins */}
      <path d="M58 200 L22 262 L62 252 Z" fill="#E5484D" />
      <path d="M142 200 L178 262 L138 252 Z" fill="#E5484D" />
      {/* body + nose */}
      <path d="M100 12 C140 48 146 120 142 252 L58 252 C54 120 60 48 100 12 Z" fill="url(#rk-body)" stroke="#8E93A8" strokeWidth="2" />
      <path d="M100 12 C122 30 132 52 136 74 L64 74 C68 52 78 30 100 12 Z" fill="#E5484D" />
      <rect x="62" y="192" width="76" height="12" fill="#2F6FDB" />
      <path d="M84 252 L116 252 L122 270 L78 270 Z" fill="#4A4F63" />
      {/* window with the kid's astronaut inside */}
      <circle cx="100" cy="122" r="29" fill="#FFC93C" />
      <circle cx="100" cy="122" r="23" fill="#0E1A3A" />
      <g clipPath="url(#rk-window)">
        <Astronaut suit={suits[suit]} kind={character ?? 'boy'} x={52} y={89} width={96} />
      </g>
      <circle cx="92" cy="112" r="5" fill="#fff" opacity="0.5" />
      <path d="M100,218 L104,228 L114,230 L104,232 L100,242 L96,232 L86,230 L96,228Z" fill="#FFC93C" />
    </svg>
  )
}

function Ground() {
  return (
    <svg viewBox="0 0 800 260" preserveAspectRatio="xMidYMin slice" className="h-full w-full">
      <path d="M0 60 C160 30 300 70 420 50 C560 28 680 60 800 44 L800 260 L0 260 Z" fill="#2E9E6B" />
      <path d="M0 110 C200 80 400 120 800 96 L800 260 L0 260 Z" fill="#238056" />
      <path d="M0 170 C220 150 520 186 800 160 L800 260 L0 260 Z" fill="#2F6FDB" />
    </svg>
  )
}

function Tower() {
  return (
    <svg viewBox="0 0 60 300" preserveAspectRatio="none" className="h-full w-full">
      <rect x="10" y="0" width="40" height="300" fill="none" stroke="#E5484D" strokeWidth="5" />
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M10 ${i * 30} L50 ${i * 30 + 30} M50 ${i * 30} L10 ${i * 30 + 30}`} stroke="#E5484D" strokeWidth="3" />
      ))}
    </svg>
  )
}

function Earth() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id="ln-earth" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#5AA8F0" />
          <stop offset="0.6" stopColor="#2F6FDB" />
          <stop offset="1" stopColor="#173B8C" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#ln-earth)" />
      <path d="M26 30 Q40 20 48 34 Q44 48 30 46 Q20 40 26 30Z M58 52 Q74 44 80 60 Q70 76 58 68Z M40 64 Q48 62 50 74 Q42 80 38 72Z" fill="#2E9E6B" />
      <path d="M20 22 Q50 10 80 24" stroke="#fff" strokeWidth="4" fill="none" opacity="0.6" strokeLinecap="round" />
    </svg>
  )
}

export default function Launch() {
  const { launchTo, go, setWorld } = useProgress()
  const root = useRef<HTMLElement>(null)
  const count = useRef<HTMLParagraphElement>(null)

  const finish = () => {
    setWorld(launchTo)
    go('map')
  }

  useGSAP(
    () => {
      const say = (text: string) => () => {
        if (count.current) count.current.textContent = text
      }
      const mm = gsap.matchMedia()

      // Short, calm version for kids who prefer less motion.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.js-space', { opacity: 1 })
        gsap.set('.js-ground, .js-rocket, .js-day', { opacity: 0 })
        gsap.set('.js-dest', { opacity: 1, y: '24vh', scale: 1.4 })
        gsap.timeline().call(say(t.to[launchTo])).call(finish, [], 2.2)
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
        tl.set('.js-flame', { scaleY: 0.2, opacity: 0 })
          // 3, 2, 1…
          .call(() => { say(t.countdown[0])(); sfx.beep() }, [], 0.2)
          .fromTo('.js-count', { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, 0.2)
          .call(() => { say(t.countdown[1])(); sfx.beep() }, [], 1.1)
          .fromTo('.js-count', { scale: 1.6 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, 1.1)
          .call(() => { say(t.countdown[2])(); sfx.beep() }, [], 2.0)
          .fromTo('.js-count', { scale: 1.6 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, 2.0)
          // Liftoff: flame, smoke, rumble
          .call(() => { say(t.liftoff)(); sfx.rocket() }, [], 2.9)
          .to('.js-flame', { scaleY: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }, 2.9)
          .to('.js-smoke', { opacity: 0.9, scale: 2.4, x: (i: number) => (i - 2.5) * 30, duration: 1.4, ease: 'power2.out', svgOrigin: '100 300' }, 2.9)
          .to('.js-rocket', { x: '+=3', yoyo: true, repeat: 9, duration: 0.05, ease: 'none' }, 2.9)
          .to('.js-count', { opacity: 0, y: -40, duration: 0.6 }, 3.8)
          // Climb: the camera follows the rocket, so the ground drops away
          .to('.js-rocket', { y: '-28vh', duration: 2.2, ease: 'power2.in' }, 3.2)
          .to('.js-ground', { y: '110vh', duration: 2.6, ease: 'power2.in' }, 3.4)
          .to('.js-smoke', { opacity: 0, duration: 0.8 }, 4.2)
          .to('.js-day', { opacity: 0, duration: 1.6 }, 4)
          .to('.js-space', { opacity: 1, duration: 1.6 }, 4)
          // Looking back at Earth while stars streak past
          .fromTo('.js-earth', { y: '30vh', scale: 1.4, opacity: 0 }, { y: '0vh', scale: 0.5, opacity: 1, duration: 2.4, ease: 'power1.out' }, 4.8)
          .to('.js-warp', { opacity: 1, duration: 0.4 }, 5)
          .call(() => { say(t.to[launchTo]) }, [], 5.2)
          .fromTo('.js-count', { opacity: 0, y: 20, scale: 0.8 }, { opacity: 1, y: 0, scale: 0.6, duration: 0.6 }, 5.2)
          .to('.js-earth', { y: '40vh', opacity: 0, duration: 1.2, ease: 'power2.in' }, 7)
          .to('.js-warp', { opacity: 0, duration: 0.6 }, 7.4)
          // Approach the destination and touch down
          .call(() => sfx.whoosh(), [], 7.2)
          .fromTo('.js-dest', { scale: 0.15, y: '-6vh', opacity: 0 }, { scale: 2.6, y: '26vh', opacity: 1, duration: 2.2, ease: 'power2.in' }, 7)
          .to('.js-rocket', { scale: 0.35, y: '-46vh', duration: 2.2, ease: 'power2.in' }, 7)
          .to('.js-count', { opacity: 0, duration: 0.4 }, 8.2)
          .to('.js-flash', { opacity: 1, duration: 0.35, ease: 'power1.in' }, 9)
          .call(() => { say(t.landed)(); sfx.unlock() }, [], 9.3)
          .fromTo('.js-count', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, color: '#0B1D3A', duration: 0.4, ease: 'back.out(2)' }, 9.3)
          .call(finish, [], 10.4)

        // Flame flicker runs on its own loop.
        gsap.to('.js-flame', { scaleX: 0.85, duration: 0.08, yoyo: true, repeat: -1, ease: 'none', delay: 2.9 })
      })
    },
    { scope: root },
  )

  return (
    <main ref={root} className="fixed inset-0 overflow-hidden" aria-live="polite">
      <div className="js-day absolute inset-0 bg-[linear-gradient(180deg,#2F6FDB_0%,#5AA8F0_55%,#CFE2FF_100%)]" />
      <div className="js-space space-sky absolute inset-0 opacity-0">
        <Starfield />
      </div>
      <div className="js-warp pointer-events-none absolute inset-0 opacity-0" aria-hidden="true">
        {WARP.map((w, i) => (
          <span key={i} className="warp-line warp-fall" style={{ left: `${w.left}%`, height: `${w.h}px`, animationDelay: `${w.delay}s` }} />
        ))}
      </div>

      <div className="js-dest absolute left-1/2 top-[2vh] w-[min(60vw,360px)] -translate-x-1/2 opacity-0" aria-hidden="true">
        <WorldGlobe world={launchTo} />
      </div>
      <div className="js-earth absolute bottom-[4vh] left-1/2 w-[min(50vw,280px)] -translate-x-1/2 opacity-0" aria-hidden="true">
        <Earth />
      </div>

      <div className="js-ground absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-[calc(20vh-2px)] left-1/2 h-[46vh] w-[min(8vw,44px)] translate-x-[calc(min(12vh,95px)+14px)]">
          <Tower />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[22vh]">
          <Ground />
        </div>
        {/* launch pad: its top edge is exactly 20vh up, where the rocket's nozzle rests */}
        <div className="absolute bottom-0 left-1/2 h-[20vh] w-[min(20vh,150px)] -translate-x-1/2 bg-[#4A4F63]" />
        <div className="absolute bottom-[calc(20vh-14px)] left-1/2 h-4 w-[min(30vh,230px)] -translate-x-1/2 rounded-md bg-[#6F7590]" />
      </div>

      <div className="js-rocket absolute bottom-[calc(20vh-min(46vh,360px)*0.29)] left-1/2 h-[min(46vh,360px)] w-[min(24vh,190px)] -translate-x-1/2" aria-hidden="true">
        <Rocket />
      </div>

      <p ref={count} className="js-count absolute inset-x-0 top-[16vh] text-center text-7xl font-bold text-text drop-shadow-[0_4px_0_rgb(0_0_0/0.3)] sm:text-8xl" />

      <div className="js-flash pointer-events-none absolute inset-0 bg-paper opacity-0" />

      <Button variant="ghost" className="absolute right-4 top-4 z-10" onClick={finish}>
        {t.skip}
      </Button>
    </main>
  )
}
