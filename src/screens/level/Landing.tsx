import { useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Rocket from '../../components/Rocket'
import Astronaut from '../../components/Astronaut'
import Starfield from '../../components/Starfield'
import type { Kind } from '../../content/characters'
import type { WorldId } from '../../content/types'
import { en } from '../../content/i18n/en'
import { buzz, clip, sfx, thrust } from '../../audio/engine'
import { Plume } from '../launch/art'
import { dustBall, groundBg, LOOK, Sky } from './scenery'

gsap.registerPlugin(useGSAP)
const t = en.level
const DUST = 22
// --rw = ship width, --kw = kid width; everything else is sized from them so phones and laptops match
const VARS = { '--rw': 'min(30vw, 150px, 17svh)', '--kw': 'min(36vw, 18svh)' } as CSSProperties

/**
 * Arriving on a world (~6.6 s): the planet swells under the ship and its horizon flattens, the sky takes the planet's
 * colour, the ship brakes on its engine and blasts the dust sideways, touches down, and the kid jumps out beside it.
 * Then the scene fades away to the level map. Transform/opacity only.
 */
export default function Landing({ world, kind, onDone }: { world: WorldId; kind: Kind; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const look = LOOK[world]

  useGSAP(
    () => {
      const el = root.current!
      const W = el.clientWidth
      const H = el.clientHeight
      const rw = el.querySelector<HTMLElement>('.js-ship')!.offsetWidth
      const kw = el.querySelector<HTMLElement>('.js-kid')!.offsetWidth
      const landed = () => {
        sfx('thud')
        buzz(120)
        if (world === 'moon') clip('eagleLanded', undefined, 0.4)
      }
      const mm = gsap.matchMedia()

      // calm version: already landed; the kid and the word fade in, then the map
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.js-space, .js-plume, .js-pose-jump', { opacity: 0 })
        gsap.set('.js-pose-point', { opacity: 1 })
        gsap
          .timeline({ onComplete: onDone })
          .call(landed, [], 0.3)
          .fromTo('.js-text', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.3)
          .fromTo('.js-kid', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.7)
          .to(el, { opacity: 0, duration: 0.6 }, 2.6)
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const D = 3.4 // the descent
        gsap.set('.js-ground', { scale: 0.32, y: H * 0.28, transformOrigin: '50% 0%' })
        gsap.set('.js-ship', { y: -H * 0.8 })
        gsap.set('.js-shadow', { scale: 0.2, opacity: 0 })
        gsap.set('.js-dust', { xPercent: -50, yPercent: 50, scale: 0.2 })
        gsap.set('.js-plume', { transformOrigin: '50% 0%' })
        gsap.set('.js-kid', { opacity: 0 })
        gsap.to('.js-flicker', { scaleY: 'random(0.85, 1.12)', scaleX: 'random(0.93, 1.07)', duration: 0.07, ease: 'none', repeat: -1, repeatRefresh: true, transformOrigin: '50% 0%' })

        const tl = gsap.timeline({ onComplete: onDone })
        tl.call(() => thrust(true), [], 0)
          // 1. from orbit: the planet swells beneath us and its horizon flattens; space gives way to the planet's sky
          .to('.js-ground', { scale: 1, y: 0, duration: D, ease: 'power2.inOut' }, 0)
          .to('.js-space', { opacity: 0, duration: 1.8 }, 0.8)
          // 2. the ship drops in fast and brakes hard for the last metres, rocking a little as it steers
          .to('.js-ship', { y: 0, duration: D + 0.2, ease: 'power3.out' }, 0)
          .fromTo('.js-sway', { rotate: -3 }, { rotate: 3, duration: 0.7, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0)
          .to('.js-sway', { rotate: 0, duration: 0.5, ease: 'sine.out' }, 2.8)
          .to('.js-shadow', { scale: 1, opacity: 0.55, duration: 1.4, ease: 'power2.in' }, D - 1.2)
          .to('.js-plume', { scaleY: 0.55, duration: 1, ease: 'power1.in' }, D - 0.8)
          // 3. the engine blast hits the ground and sprays dust out sideways; it settles slowly after touchdown
          .to(
            '.js-dust',
            {
              opacity: 1,
              x: (i) => (i % 2 ? 1 : -1) * (0.08 + 0.5 * ((i * 0.37) % 1)) * W,
              y: (i) => -((i * 0.53) % 1) * H * 0.07,
              scale: (i) => 1 + 1.4 * ((i * 0.71) % 1),
              duration: 1.8,
              ease: 'power2.out',
              stagger: 0.03,
            },
            D - 0.9,
          )
          .to('.js-dust', { opacity: 0, duration: 1.4, stagger: 0.02 }, D + 1)
          // 4. touchdown: engine off, the legs squash, a thud and a shake
          .call(() => {
            thrust(false)
            landed()
          }, [], D + 0.2)
          .to('.js-plume', { scaleY: 0, opacity: 0, duration: 0.25 }, D + 0.2)
          .to('.js-squash', { scaleY: 0.93, scaleX: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: '50% 100%' }, D + 0.2)
          .to('.js-shake', { x: 'random(-5, 5)', y: 'random(-3, 3)', duration: 0.05, repeat: 7, repeatRefresh: true, ease: 'none' }, D + 0.2)
          .to('.js-shake', { x: 0, y: 0, duration: 0.1 }, D + 0.6)
          .fromTo('.js-text', { opacity: 0, scale: 0.4, rotate: -8 }, { opacity: 1, scale: 1, rotate: -3, duration: 0.5, ease: 'back.out(3)' }, D + 0.3)
          // 5. the kid jumps out of the ship and lands beside it
          .call(() => sfx('pop'), [], D + 1)
          .set('.js-kid', { opacity: 1 }, D + 1)
          .fromTo('.js-kid', { x: rw * 0.55 + kw / 2, scale: 0.3 }, { x: 0, scale: 1, duration: 0.7, ease: 'power1.out' }, D + 1)
          .fromTo('.js-kid', { y: -rw * 1.2 }, { y: -rw * 1.5, duration: 0.3, ease: 'power2.out' }, D + 1)
          .to('.js-kid', { y: 0, duration: 0.4, ease: 'power2.in' }, D + 1.3)
          .set('.js-pose-jump', { opacity: 0 }, D + 1.7)
          .set('.js-pose-point', { opacity: 1 }, D + 1.7)
          .call(() => sfx('step'), [], D + 1.7)
          .fromTo('.js-kid-dust', { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 1.6, duration: 0.7, ease: 'power2.out', immediateRender: false }, D + 1.7)
          .to('.js-kid', { scaleY: 0.94, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: '50% 100%' }, D + 1.7)
          .to('.js-text', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, D + 2.4)
          .to(el, { opacity: 0, duration: 0.6 }, D + 2.6)
        // dev only: scrub it in the console, e.g. __land.pause().seek(3, false)
        if (import.meta.env.DEV) Object.assign(window, { __land: tl })
      })
      return () => thrust(false) // never leave the engine roaring (skip, or leaving mid-landing)
    },
    { scope: root },
  )

  return (
    <div ref={root} style={VARS} className="absolute inset-0 z-20 overflow-hidden bg-navy-950">
      <Sky world={world} />
      <div className="js-space absolute inset-0 bg-[#02060F]">
        <Starfield />
      </div>

      <div className="js-shake absolute inset-0">
        {/* the planet: a huge disc whose top edge is the horizon; seen from orbit at first, then from just above */}
        <div
          className="js-ground absolute left-1/2 top-[64%] h-[90svh] w-[300vw] -translate-x-1/2 overflow-hidden rounded-t-[50%_40%]"
          style={{ ...groundBg(look), boxShadow: look.rim }}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${look.haze} 0%, transparent 12%, rgb(8 21 43 / 0.45) 100%)` }} />
        </div>

        <div className="js-shadow absolute bottom-[22%] left-1/2 h-[calc(var(--rw)*0.25)] w-[calc(var(--rw)*1.7)] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-black/70 blur-sm" />
        <div className="js-ship absolute bottom-[22%] left-[calc(50%-var(--rw)/2)] w-(--rw)">
          <div className="js-sway origin-[50%_80%]">
            <div className="js-squash">
              {/* the art has room under the feet; sink it so the feet sit on the ground line */}
              <div className="relative translate-y-[24.7%]">
                <div className="js-plume absolute left-1/2 top-[64%] w-[62%] -translate-x-1/2">
                  <div className="js-flicker">
                    <Plume />
                  </div>
                </div>
                <Rocket legs className="relative block w-full" />
              </div>
            </div>
          </div>
        </div>
        {Array.from({ length: DUST }, (_, i) => (
          <div key={i} className="js-dust absolute bottom-[22%] left-1/2 aspect-square w-[calc(var(--rw)*1)] opacity-0" style={{ background: dustBall(look.dust) }} />
        ))}

        <div className="js-kid absolute bottom-[19%] left-[calc(50%-var(--rw)*0.6-var(--kw))] w-(--kw)">
          <div className="js-kid-dust absolute -bottom-[4%] left-1/2 aspect-[3/1] w-[120%] -translate-x-1/2 opacity-0" style={{ background: dustBall(look.dust) }} />
          <Astronaut kind={kind} pose="jump" width={200} className="js-pose-jump block h-auto w-full" />
          <Astronaut kind={kind} pose="point" width={200} className="js-pose-point absolute inset-0 h-auto w-full opacity-0" />
        </div>
      </div>

      <p className="js-text pointer-events-none absolute inset-x-0 top-[14%] text-center font-display text-[clamp(3rem,14vw,6rem)] font-extrabold leading-none text-cta opacity-0 [text-shadow:0_6px_0_#0B1D3A,0_0_30px_rgb(11_29_58/0.5)]" aria-live="assertive">
        {t.touchdown}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] min-h-11 rounded-full bg-navy-950/70 px-5 font-semibold text-text hover:bg-navy-950/90 focus-visible:outline-2 focus-visible:outline-cta"
      >
        {en.launch.skip}
      </button>
    </div>
  )
}
