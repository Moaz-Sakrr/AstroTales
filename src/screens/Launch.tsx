import { useEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Rocket from '../components/Rocket'
import Astronaut from '../components/Astronaut'
import Starfield from '../components/Starfield'
import { Cloud, Earth, Ground, Plume, PUFF, Tower, Treeline, VaporCone } from './launch/art'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'
import { buzz, clip, sfx, stopClips } from '../audio/engine'

gsap.registerPlugin(useGSAP)
const t = en.launch

// clouds the rocket climbs through: left (%), how many screens above the start, width (vmax)
const CLOUDS = [
  [4, 1.05, 34],
  [56, 1.3, 40],
  [-12, 1.65, 46],
  [48, 1.95, 52],
  [8, 2.25, 40],
  [60, 2.55, 36],
  [18, 2.85, 48],
] as const
const PUFFS = 28
const STREAKS = 12
const SPARKLE = 'M0 -1 L0.2 -0.2 L1 0 L0.2 0.2 L0 1 L-0.2 0.2 L-1 0 L-0.2 -0.2Z'
// fixed pseudo-random 0..1 per puff, so x, height and size of one puff can depend on each other
const rnd = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return v - Math.floor(v)
}
// --rw = rocket width. The whole pad is sized from it, so phones and laptops show the same picture.
const VARS = { '--rw': 'min(28vw, 150px, 16svh)', '--ground': '14%', '--pad': 'calc(14% + var(--rw) * 0.2)' } as CSSProperties

export default function Launch() {
  const root = useRef<HTMLElement>(null)
  const live = useRef<HTMLParagraphElement>(null)
  const kind = useGame((s) => s.character)
  const go = useGame((s) => s.go)

  // fetch three.js while the rocket flies, so Space opens without a long wait
  useEffect(() => {
    import('./Space').catch(() => {})
  }, [])

  useGSAP(
    () => {
      const el = root.current!
      const q = gsap.utils.selector(el)
      const W = el.clientWidth
      const H = el.clientHeight
      const rw = el.querySelector<HTMLElement>('.js-rocket')!.offsetWidth
      const say = (n: string) => (live.current!.textContent = n)
      const done = () => go('space')
      const ignite = () => {
        say(t.countdown[3])
        sfx('go')
        clip('liftoff')
        clip('rocket', 'rumble')
        buzz(400)
      }
      const mm = gsap.matchMedia()

      // calm version: no movement, only fades. Countdown, flame on, the pad fades into space.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        const tl = gsap.timeline({ onComplete: done })
        tl.to('.js-kid', { opacity: 0, duration: 0.5 }, 0.4)
        t.countdown.forEach((n, i) => {
          const at = 1 + i * 0.9
          tl.call(() => {
            if (i < 3) {
              say(n)
              clip('quindar', 'beep')
            } else ignite()
          }, [], at)
            .to(`.js-n${i}`, { opacity: 1, duration: 0.25 }, at)
            .to(`.js-n${i}`, { opacity: 0, duration: 0.3 }, at + (i < 3 ? 0.6 : 1.4))
        })
        tl.to('.js-plume', { opacity: 1, duration: 0.4 }, 3.7)
          .to('.js-earthside', { opacity: 0, duration: 1.4 }, 5)
          .to('.js-stars, .js-earth', { opacity: 1, duration: 1.4 }, 5)
          .to('.js-fade', { opacity: 1, duration: 0.6 }, 7.2)
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const C = 2 // countdown starts
        const I = C + 3 // ignition
        const L = I + 0.6 // the rocket lets go of the pad
        const UP = 5.2 // the climb, pad → space
        const M = L + 2.4 // max-Q: vapour cone + sonic boom, as it reaches the clouds
        const S = L + UP // in space

        gsap.set('.js-puff', { xPercent: -50, yPercent: 50, scale: 0.2 })
        gsap.set('.js-plume', { scaleY: 0, transformOrigin: '50% 0%' })
        gsap.set('.js-trail', { opacity: 1, scaleY: 0, transformOrigin: '50% 0%' })
        gsap.set('.js-earth', { opacity: 1, y: H * 0.5 })
        gsap.set('.js-rocket', { transformOrigin: '50% 60%' })
        gsap.set('.js-cam', { transformOrigin: '50% 75%' })

        // these run on their own: cold vapour drifting off the fuelled rocket, the flame's flicker, clouds drifting
        const vent = gsap.fromTo(
          '.js-wisp',
          { x: 0, y: 0, scale: 0.4, opacity: 0.7 },
          { x: (i) => (i % 2 ? 1 : -1) * rw * 0.6, y: -rw * 0.2, scale: 1.8, opacity: 0, duration: 2, ease: 'power1.out', stagger: { each: 0.35, repeat: -1 } },
        )
        gsap.to('.js-flicker', { scaleY: 'random(0.85, 1.12)', scaleX: 'random(0.93, 1.07)', duration: 0.07, ease: 'none', repeat: -1, repeatRefresh: true, transformOrigin: '50% 0%' })
        gsap.to('.js-drift', { x: '+=60', duration: 30, ease: 'none' })

        const tl = gsap.timeline({ onComplete: done })

        // 1. the kid runs to the rocket and hops in through the window
        tl.from('.js-kid', { x: -W * 0.6, duration: 1.2, ease: 'power2.out' }, 0)
          .to('.js-kid-bob', { y: -7, duration: 0.12, repeat: 9, yoyo: true, ease: 'sine.inOut' }, 0)
          .set('.js-pose-walk', { opacity: 0 }, 1.3)
          .set('.js-pose-jump', { opacity: 1 }, 1.3)
          .call(() => sfx('pop'), [], 1.3)
          .to('.js-kid', { x: rw * 1.4, duration: 0.55, ease: 'power1.in' }, 1.3)
          .to('.js-kid', { y: -(rw * 1.385 - 60), duration: 0.55, ease: 'back.out(1.6)' }, 1.3)
          .to('.js-kid', { scale: 0.15, opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.55)
          .fromTo('.js-window', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, 1.8)
          .call(() => sfx('ding'), [], 1.85)

        // 2. countdown: the camera creeps in, the tower arms swing away, the engines start to growl
        tl.to('.js-cam', { scale: 1.1, duration: 3.4, ease: 'power1.inOut' }, C)
        t.countdown.slice(0, 3).forEach((n, i) => {
          tl.call(() => {
            say(n)
            clip('quindar', 'beep')
          }, [], C + i)
            .fromTo(`.js-n${i}`, { opacity: 0, scale: 1.9 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, C + i)
            .to(`.js-n${i}`, { opacity: 0, scale: 0.6, duration: 0.25, ease: 'power2.in' }, C + i + 0.72)
            .fromTo('.js-ring', { opacity: 0.7, scale: 0.5 }, { opacity: 0, scale: 2.2, duration: 0.9, ease: 'power2.out', immediateRender: false }, C + i)
        })
        tl.to('.js-arm', { rotate: 72, duration: 0.8, stagger: 0.2, ease: 'power2.inOut' }, C + 1.1)
          .call(() => sfx('rumble'), [], C + 2)
          .to('.js-plume', { opacity: 1, scaleY: 0.18, duration: 0.25 }, C + 2.4)
          .to('.js-shake', { x: 'random(-1.5, 1.5)', duration: 0.05, repeat: 11, repeatRefresh: true, ease: 'none' }, C + 2.4)

        // 3. ignition: flash, roar, smoke bursts sideways out of the flame trench, everything shakes
        tl.call(ignite, [], I)
          .call(() => vent.kill(), [], I)
          .to('.js-wisp', { opacity: 0, duration: 0.3 }, I)
          .to('.js-flash', { opacity: 1, duration: 0.08, ease: 'none' }, I)
          .to('.js-flash', { opacity: 0, duration: 1, ease: 'power2.out' }, I + 0.08)
          .to('.js-plume', { scaleY: 1, duration: 0.5, ease: 'back.out(2.5)' }, I)
          .to('.js-glow', { opacity: 1, duration: 0.15 }, I)
          .to(
            '.js-puff',
            {
              opacity: 1,
              x: (i) => (i % 2 ? 1 : -1) * (0.04 + 0.6 * rnd(i, 1)) * W,
              y: (i) => -(0.02 + 0.2 * (1 - rnd(i, 1)) * rnd(i, 2)) * H, // puffs near the rocket billow higher
              scale: (i) => 1 + 1.2 * rnd(i, 1) + 0.6 * rnd(i, 3),
              duration: (i) => 1.8 + 1.6 * rnd(i, 1),
              ease: 'power3.out',
              stagger: 0.02,
            },
            I + 0.05,
          )
          .fromTo('.js-n3', { opacity: 0, scale: 0.3, rotate: -10 }, { opacity: 1, scale: 1, rotate: -4, duration: 0.5, ease: 'back.out(3)' }, I)
          .to('.js-n3', { opacity: 0, y: -30, duration: 0.45, ease: 'power2.in' }, I + 1.7)
          .to('.js-shake', { x: 'random(-7, 7)', y: 'random(-4, 4)', duration: 0.05, repeat: 35, repeatRefresh: true, ease: 'none' }, I)
          .to('.js-shake', { x: 'random(-2.5, 2.5)', y: 'random(-1.5, 1.5)', duration: 0.05, repeat: 47, repeatRefresh: true, ease: 'none' }, I + 1.8)
          .to('.js-shake', { x: 0, y: 0, duration: 0.3 }, I + 4.2)

        // 4. liftoff: one smooth climb. The rocket rises on screen to ~40% up, then the camera follows it and
        // the world falls away below. Nearer layers fall faster (parallax); the smoke trail stretches back to the pad.
        const k = H * 0.4
        const ride = { alt: 0 }
        const setY = (sel: string) => gsap.quickSetter(q(sel), 'y', 'px') as (v: number) => void
        const [rocketY, worldY, midY, farY, cloudsY, frontY] = ['.js-rocket', '.js-world', '.js-mid', '.js-far', '.js-clouds', '.js-cloud-front'].map(setY)
        const trail = gsap.quickSetter(q('.js-trail'), 'scaleY') as (v: number) => void
        tl.to(
          ride,
          {
            alt: H * 4.2,
            duration: UP,
            ease: 'power2.inOut',
            onUpdate() {
              const s = k * Math.tanh(ride.alt / k) // how far up the screen the rocket is; the camera takes the rest
              const cam = ride.alt - s
              rocketY(-s)
              worldY(cam)
              midY(cam * 0.6)
              farY(cam * 0.3)
              cloudsY(cam)
              frontY(cam * 1.8)
              trail(Math.min(1, ride.alt / (H * 1.4)))
            },
          },
          L,
        )
          .to('.js-glow', { opacity: 0, duration: 1.2 }, L + 0.6)
          .to('.js-cam', { scale: 1, duration: 2.2, ease: 'power2.inOut' }, L + 0.4)
          // the sky turns from morning blue to deep indigo to black
          .to('.js-sky-day', { opacity: 0, duration: 2.2, ease: 'none' }, L + 2)
          .to('.js-sky-high', { opacity: 0, duration: 1.8, ease: 'power1.in' }, L + 3.8)
          .to('.js-stars', { opacity: 1, duration: 1.8 }, L + 4.1)
          .call(() => sfx('sparkle'), [], L + 4.5)
          // thin air: the smoke trail fades and the flame spreads wider
          .to('.js-trail', { opacity: 0, duration: 1.4 }, L + 3.4)
          .to('.js-plume', { scaleX: 1.5, scaleY: 1.2, duration: 1.8, ease: 'power1.inOut' }, L + 3.2)
          .call(() => sfx('whoosh'), [], L + 3) // the big cloud rushing past

        // 5. max-Q: speed lines, the vapour cone flashes round the rocket and the sonic boom thumps
        tl.to('.js-streaks', { opacity: 1, duration: 0.3 }, M - 0.2)
          .fromTo('.js-streak', { y: -H * 0.5 }, { y: H * 1.3, duration: 0.42, ease: 'none', repeat: 5, stagger: { each: 0.05, from: 'random' }, immediateRender: false }, M - 0.2)
          .to('.js-streaks', { opacity: 0, duration: 0.6 }, M + 2)
          .fromTo('.js-cone', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.25, immediateRender: false }, M)
          .to('.js-cone', { opacity: 0, scale: 1.3, duration: 0.7, ease: 'power1.in' }, M + 0.45)
          .fromTo('.js-shock', { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 4.5, duration: 1, immediateRender: false }, M + 0.12)
          .call(() => {
            sfx('thud')
            sfx('whoosh')
            buzz(70)
          }, [], M + 0.12)
          .to('.js-cam', { scale: 1.04, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' }, M + 0.12)

        // 6. space: Earth's curve rises into view, the rocket tips over and zooms off to become a star
        tl.to('.js-earth', { y: 0, duration: 2.6, ease: 'power2.out' }, L + 3.9)
          .to('.js-rocket', { rotate: 7, duration: 1.2, ease: 'sine.inOut' }, S - 0.6)
          .to('.js-rocket', { y: `-=${H * 0.15}`, x: W * 0.22, scale: 0.12, rotate: 28, duration: 1.1, ease: 'power2.in' }, S + 0.3)
          .call(
            () => {
              const r = q('.js-hull')[0].getBoundingClientRect()
              const m = el.getBoundingClientRect()
              gsap.set('.js-twinkle', { left: r.left + r.width / 2 - m.left, top: r.top + r.height / 2 - m.top })
              sfx('ping')
            },
            [],
            S + 1.4,
          )
          .fromTo('.js-twinkle', { opacity: 1, scale: 0, rotate: 0 }, { scale: 1, rotate: 90, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, S + 1.4)
          .to('.js-fade', { opacity: 1, duration: 0.6, ease: 'power1.in' }, S + 1.8)
        // dev only: scrub it in the console, e.g. __launch.pause().seek(9)
        if (import.meta.env.DEV) Object.assign(window, { __launch: tl })
      })
      return stopClips // a long NASA launch recording stops when we leave
    },
    { scope: root },
  )

  return (
    <main ref={root} style={VARS} className="relative h-svh overflow-hidden bg-navy-950">
      <div className="js-stars absolute inset-0 opacity-0">
        <Starfield />
      </div>
      {/* sky: morning → upper air → space. Each is one fixed gradient; only its opacity changes. */}
      <div className="js-sky-high js-earthside absolute inset-0 bg-[linear-gradient(180deg,#08152B_0%,#13285A_55%,#2F4F9A_100%)]" />
      <div className="js-sky-day js-earthside absolute inset-0 bg-[linear-gradient(180deg,#1C4596_0%,#3F78CF_38%,#86B4EA_68%,#FFD9A3_100%)]" />

      <div className="js-cam absolute inset-0">
        <div className="js-shake absolute inset-0">
          {/* far: sunrise over the sea and the rocket hangar on the shore (moves slowest) */}
          <div className="js-far js-earthside absolute inset-x-[-6%] bottom-0 h-full">
            <div className="absolute bottom-[19%] right-[16%] aspect-square w-[34vmin] translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#FFF8E7_35%,rgb(255_201_60/0.45)_60%,transparent)]" />
            <Cloud className="js-drift absolute bottom-[52%] left-[8%] w-[22vmax] opacity-80" />
            <Cloud className="js-drift absolute bottom-[66%] left-[62%] w-[16vmax] opacity-60" />
            <div className="absolute inset-x-0 bottom-[14%] h-[8%] border-t-2 border-[#CFE3FA] bg-[linear-gradient(#6A9BDD,#3F72BC)]" />
            <div className="absolute bottom-[17%] left-[14%] h-[min(12vw,9svh)] w-[min(15vw,11svh)] bg-[#7189B4] shadow-[inset_-10px_0_0_rgb(0_0_0/0.12)]" />
          </div>
          <div className="js-mid js-earthside absolute inset-x-[-6%] bottom-[13%] h-[7%]">
            <Treeline />
          </div>
          <div className="js-clouds js-earthside absolute inset-0">
            {CLOUDS.map(([x, y, w], i) => (
              <Cloud key={i} className="absolute" style={{ left: `${x}%`, top: `${-y * 100}%`, width: `${w}vmax` }} />
            ))}
          </div>
          <div className="js-earth absolute inset-0 opacity-0">
            <Earth />
          </div>

          {/* ground, pad and tower: behind the rocket */}
          <div className="js-world js-earthside absolute inset-0">
            <div className="absolute inset-x-[-6%] -bottom-[6%] h-[20%]">
              <Ground />
            </div>
            <div className="absolute bottom-(--ground) left-1/2 h-[calc(var(--rw)*0.2)] w-[calc(var(--rw)*3.4)] -translate-x-1/2 rounded-t-md bg-[#5D6378] shadow-[inset_0_3px_0_#8A90A6]">
              <div className="absolute bottom-0 left-1/2 h-[60%] w-[34%] -translate-x-1/2 rounded-t-sm bg-[#1E2740]" />
            </div>
            <div className="absolute bottom-(--pad) left-[calc(50%+var(--rw)*0.62)] h-[calc(var(--rw)*2.15)] w-[calc(var(--rw)*0.42)]">
              <Tower />
              {[62, 38].map((b) => (
                <div key={b} className="js-arm absolute right-[88%] h-[calc(var(--rw)*0.07)] w-[calc(var(--rw)*0.4)] origin-right rounded-l-sm border-y-2 border-[#5D6378] bg-[#9AA0B6]" style={{ bottom: `${b}%` }} />
              ))}
              <div className="absolute -top-[calc(var(--rw)*0.17)] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-flag shadow-[0_0_8px_3px_rgb(255_77_77/0.6)] motion-safe:animate-pulse" />
            </div>
          </div>

          <div className="js-rocket js-earthside absolute bottom-(--pad) left-[calc(50%-var(--rw)/2)] w-(--rw)">
            {/* the rocket art has room for a flame below the feet; sink it so the feet stand on the pad */}
            <div className="relative translate-y-[28.6%]">
              {/* soft on both sides (across) and fading out towards the ground (down), so it reads as smoke, not a beam */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="js-trail absolute left-1/2 top-[64%] h-[140svh] w-[260%] -translate-x-1/2 opacity-0" aria-hidden="true">
                <defs>
                  <linearGradient id="trail-x">
                    <stop offset="0" stopColor="#E6DED3" stopOpacity="0" />
                    <stop offset="0.3" stopColor="#EDE7DF" stopOpacity="0.75" />
                    <stop offset="0.5" stopColor="#FFF8E7" />
                    <stop offset="0.7" stopColor="#EDE7DF" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#E6DED3" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="trail-y" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff" />
                    <stop offset="0.45" stopColor="#fff" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                  <mask id="trail-fade">
                    <rect width="100" height="100" fill="url(#trail-y)" />
                  </mask>
                </defs>
                <path d="M38 0 H62 C70 30 86 60 100 100 H0 C14 60 30 30 38 0Z" fill="url(#trail-x)" mask="url(#trail-fade)" />
              </svg>
              <div className="js-plume absolute left-1/2 top-[64%] w-[62%] -translate-x-1/2 opacity-0">
                <div className="js-flicker">
                  <Plume />
                </div>
              </div>
              <Rocket className="js-hull relative block w-full" />
              <div className="js-window absolute left-1/2 top-[24%] aspect-square w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_243_176/0.95),rgb(255_179_71/0.45)_50%,transparent)] opacity-0" />
              {[[16, 30], [84, 34], [14, 46], [86, 50], [20, 58], [80, 60]].map(([x, y], i) => (
                <div key={i} className="js-wisp absolute aspect-square w-[26%] -translate-x-1/2 -translate-y-1/2 opacity-0" style={{ left: `${x}%`, top: `${y}%`, background: PUFF }} />
              ))}
              <div className="js-cone absolute left-1/2 top-[11%] w-[230%] -translate-x-1/2 opacity-0">
                <VaporCone />
              </div>
              <div className="js-shock absolute left-1/2 top-[44%] aspect-[3/1] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] border-white/80 opacity-0" />
            </div>
          </div>

          {/* smoke, the flame's glow and the kid: in front of the rocket */}
          <div className="js-world js-earthside absolute inset-0">
            {Array.from({ length: PUFFS }, (_, i) => (
              <div key={i} className="js-puff absolute bottom-(--ground) left-1/2 aspect-square w-[calc(var(--rw)*1.1)] opacity-0" style={{ background: PUFF }} />
            ))}
            <div className="js-glow absolute bottom-(--ground) left-1/2 aspect-square w-[calc(var(--rw)*6)] -translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_179_71/0.6),rgb(255_122_61/0.22)_55%,transparent)] opacity-0" />
            <div className="js-kid absolute bottom-(--ground) left-[calc(50%-var(--rw)*1.4-40px)] w-20">
              <div className="js-kid-bob relative">
                <Astronaut kind={kind} pose="threeq" width={80} className="js-pose-walk block" />
                <Astronaut kind={kind} pose="jump" width={80} className="js-pose-jump absolute inset-0 opacity-0" />
              </div>
            </div>
          </div>

          {/* a big cloud bank that whips past in front of the rocket; a flipped copy hides the flat underside */}
          <div className="js-cloud-front js-earthside absolute inset-0">
            <div className="absolute left-[-30%] top-[-450%] w-[130vmax]">
              <Cloud className="block w-full" />
              <Cloud className="relative -z-10 -mt-[10%] block w-full -scale-y-100" />
            </div>
          </div>
          <div className="js-streaks absolute inset-0 opacity-0">
            {Array.from({ length: STREAKS }, (_, i) => (
              <div key={i} className="js-streak absolute top-0 w-0.5 rounded-full bg-linear-to-b from-transparent via-white/60 to-transparent" style={{ left: `${(i * 37 + 11) % 100}%`, height: `${14 + ((i * 7) % 16)}svh` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="js-flash pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_82%,#FFF8E7_0%,rgb(255_201_60/0.75)_28%,rgb(255_122_61/0.25)_55%,transparent_75%)] opacity-0" />
      <svg viewBox="-1 -1 2 2" className="js-twinkle absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 opacity-0" aria-hidden="true">
        <path d={SPARKLE} fill="#FFF8E7" />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-[12%] grid place-items-center" aria-hidden="true">
        <div className="js-ring col-start-1 row-start-1 size-[clamp(7rem,30vw,11rem)] rounded-full border-4 border-cta/70 opacity-0" />
        {t.countdown.map((n, i) => (
          <p
            key={n}
            className={`js-n${i} col-start-1 row-start-1 font-display font-extrabold leading-none text-cta opacity-0 [text-shadow:0_6px_0_#0B1D3A,0_0_30px_rgb(11_29_58/0.5)] ${i === 3 ? 'text-[clamp(3.5rem,16vw,7rem)]' : 'text-[clamp(6rem,30vw,10rem)]'}`}
          >
            {n}
          </p>
        ))}
      </div>
      <p ref={live} aria-live="assertive" className="sr-only" />

      <div className="js-fade pointer-events-none absolute inset-0 bg-black opacity-0" />
      <button
        type="button"
        onClick={() => go('space')}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] min-h-11 rounded-full bg-navy-950/70 px-5 font-semibold text-text hover:bg-navy-950/90 focus-visible:outline-2 focus-visible:outline-cta"
      >
        {t.skip}
      </button>
    </main>
  )
}
