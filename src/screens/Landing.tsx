import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import MoonScene from '../components/MoonScene'
import Postcard from '../components/Postcard'
import { en } from '../content/i18n/en'
import { useMedia } from '../hooks/useMedia'

gsap.registerPlugin(useGSAP)

const t = en.landing

export default function Landing() {
  const root = useRef<HTMLElement>(null)
  const wide = useMedia('(min-width: 1024px)')

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
          .from('.js-laser', { strokeDashoffset: (_i: number, el: Element) => Number(el.getAttribute('stroke-dasharray')), duration: 1, ease: 'power2.in' }, 2)
          .from('.laser-pulse', { opacity: 0, duration: 0.4 }, 3)

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

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pb-6 sm:px-8 lg:min-h-svh lg:px-16">
        <header className="js-intro flex items-center gap-2 py-5">
          <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
            <circle cx="16" cy="16" r="9" fill="#CFCFD8" />
            <circle cx="13" cy="13" r="2.5" fill="#A9AEBF" />
            <ellipse cx="16" cy="16" rx="15" ry="5" fill="none" stroke="#FFC93C" strokeWidth="2" transform="rotate(-20 16 16)" />
          </svg>
          <span className="text-xl font-bold tracking-tight">{t.brand}</span>
        </header>

        <div className="flex max-w-xl flex-col gap-5 pt-4 lg:pt-6">
          <h1 className="js-intro text-[2.6rem] font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {t.title}
          </h1>
          <p className="js-intro max-w-md text-lg leading-relaxed text-text-muted">{t.sub}</p>
          <div className="js-intro flex flex-col items-start gap-3">
            {/* Wired to Choose Astronaut in Phase 1 (screen switcher). */}
            <button
              type="button"
              className="min-h-12 rounded-full bg-cta px-7 py-3 text-lg font-semibold text-on-cta shadow-[0_5px_0_var(--color-cta-edge)] transition hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_var(--color-cta-edge)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact"
            >
              {t.cta}
            </button>
            <p className="text-sm text-faint">{t.trust}</p>
          </div>
          <Postcard className="js-postcard mt-4" />
        </div>
      </div>

      {/* Phones: scene sits under the content. Wide screens: one screen-tall backdrop pinned to the bottom. */}
      <div className="relative -mt-16 aspect-[580/700] w-full lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:aspect-auto lg:h-svh">
        <MoonScene wide={wide} />
      </div>
    </main>
  )
}
