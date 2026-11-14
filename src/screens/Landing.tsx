import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import MoonScene from '../components/MoonScene'
import Postcard from '../components/Postcard'
import Seismograph from '../components/Seismograph'
import { quake, type Quake } from '../components/quake'
import { en } from '../content/i18n/en'
import { useMedia } from '../hooks/useMedia'
import { useGame } from '../store/progress'
import Button from '../components/Button'
import SoundButton from '../components/SoundButton'

gsap.registerPlugin(useGSAP)

const t = en.landing

export default function Landing() {
  const root = useRef<HTMLElement>(null)
  const wide = useMedia('(min-width: 1024px)')
  const go = useGame((s) => s.go)
  const calm = useMedia('(prefers-reduced-motion: reduce)')
  const quakes = useRef<Quake[]>([])
  // the Moon is never perfectly still: a small natural moonquake now and then
  useEffect(() => {
    if (calm) return
    const id = setInterval(() => quakes.current.push(quake(0.12 + Math.random() * 0.12, 1.4, 4, 0.3)), 6500)
    return () => clearInterval(id)
  }, [calm])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // One orchestrated moment: the camera drifts down from the stars and lands on the Moon.
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.js-stars-0', { y: 60, duration: 2.4 }, 0)
          .from('.js-stars-1', { y: 130, duration: 2.4 }, 0)
          .from('.js-stars-2', { y: 220, duration: 2.4 }, 0)
          .from('.js-ground', { y: 240, duration: 2.2 }, 0)
          .from('.js-earth', { scale: 0.5, opacity: 0, svgOrigin: '1290 300', duration: 1.6 }, 0.3)
          .from('.js-intro', { y: 24, opacity: 0, stagger: 0.12, duration: 0.9 }, 0.7)
          .from('.js-postcard', { y: 90, rotation: 9, opacity: 0, duration: 1.1, ease: 'back.out(1.4)' }, 1.2)
          .from('.js-link', { strokeDashoffset: (_i: number, el: Element) => Number(el.getAttribute('stroke-dasharray')), duration: 1, ease: 'power2.inOut' }, 2)
          .from('.laser-pulse', { opacity: 0, duration: 0.4 }, 3)
          .from('.js-strip', { y: 40, opacity: 0, duration: 0.8 }, 2.2)

        gsap.to('.js-astronaut', { y: -12, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
        gsap.to('.js-astro-shadow', { scale: 0.8, opacity: 0.12, svgOrigin: '958 712', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })

        // Pointer parallax: near stars move more than far ones. Mouse only.
        if (!matchMedia('(pointer: fine)').matches) return
        const layers = [0, 1, 2].map((i) => ({
          x: gsap.quickTo(`.js-par-${i}`, 'x', { duration: 1.2, ease: 'power3' }),
          y: gsap.quickTo(`.js-par-${i}`, 'y', { duration: 1.2, ease: 'power3' }),
          depth: [6, 14, 26][i],
        }))
        const onMove = (e: PointerEvent) => {
          const dx = e.clientX / innerWidth - 0.5
          const dy = e.clientY / innerHeight - 0.5
          layers.forEach((l) => {
            l.x(-dx * l.depth)
            l.y(-dy * l.depth)
          })
        }
        addEventListener('pointermove', onMove)
        return () => removeEventListener('pointermove', onMove)
      })
    },
    { scope: root },
  )

  return (
    <main ref={root} className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />

      <div className="pointer-events-none relative z-10 mx-auto flex max-w-7xl flex-col px-4 pb-6 sm:px-8 lg:min-h-svh lg:px-16">
        <header className="js-intro pointer-events-auto flex items-center justify-between gap-2 py-5">
          <div className="flex items-center gap-2">
            <img src="/brand/mark.png" alt="" className="h-9 w-auto" />
            <span className="text-xl font-bold tracking-tight">
              {t.brand.slice(0, 5)}<span className="text-brand">{t.brand.slice(5)}</span>
            </span>
          </div>
          <SoundButton />
        </header>

        <div className="pointer-events-auto flex max-w-xl flex-col gap-5 pt-4 lg:pt-6">
          <h1 className="js-intro text-[2.6rem] font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {t.title}
          </h1>
          <p className="js-intro max-w-md text-lg leading-relaxed text-text-muted">{t.sub}</p>
          <div className="js-intro flex flex-col items-start gap-3">
            <Button className="w-full sm:w-auto" onClick={() => go('character')}>{t.cta}</Button>
            <p className="text-sm text-faint">{t.trust}</p>
          </div>
          <Postcard className="js-postcard mt-4" />
        </div>
      </div>

      {/* Phones: scene sits under the content, seismograph under the scene.
          Wide screens: one screen-tall backdrop behind the hero, seismograph tape along its bottom edge. */}
      <div className="relative -mt-16 lg:absolute lg:inset-x-0 lg:top-0 lg:mt-0 lg:h-svh">
        <div className="aspect-[580/700] w-full lg:aspect-auto lg:h-full">
          <MoonScene wide={wide} onTap={(amp) => quakes.current.push(quake(amp, 1.1, 6))} />
        </div>
        <Seismograph
          quakes={quakes}
          active={!calm}
          label={`${t.rumble.strip} · ${t.rumble.listening}`}
          className="js-strip relative mx-3 -mt-3 mb-6 lg:absolute lg:bottom-0 lg:left-[max(44%,36rem)] lg:right-0 lg:m-0 lg:rounded-none lg:rounded-tl-xl lg:ring-0"
          canvasClassName="h-16 lg:h-[4.5rem]"
        />
      </div>

      {/* What the site is about, for kids and grown-ups who scroll before they tap. */}
      <section className="relative z-10 border-t border-white/10 bg-navy-950/85 px-4 py-10 sm:py-14 backdrop-blur-sm sm:px-8 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.infoTitle}</h2>
          <ol className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 md:grid-cols-3">
            {t.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4 md:flex-col">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cta text-lg font-bold text-on-cta">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 leading-relaxed text-text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-faint">{t.grownups}</p>
            <Button className="w-full sm:w-auto" onClick={() => go('character')}>{t.cta}</Button>
          </div>
        </div>
      </section>
    </main>
  )
}
