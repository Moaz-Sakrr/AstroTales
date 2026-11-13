import { useEffect, useState, type CSSProperties } from 'react'
import type { CardStyle, Device } from '../content/types'
import { allDevices, worlds } from '../content/worlds'
import { tx } from '../content/l10n'

// Trading card. Each style has its own frame, colors and background pattern.
const STYLES: Record<CardStyle, { frame: string; ink: string; bg: string }> = {
  light: { frame: '#2F6FDB', ink: '#0B2A5B', bg: 'repeating-conic-gradient(from 0deg at 50% 0%, rgb(255 255 255/.28) 0 5deg, transparent 5deg 16deg), linear-gradient(160deg,#D8F0FF,#5AA8F0)' },
  thrust: { frame: '#A8741F', ink: '#3D2604', bg: 'repeating-linear-gradient(135deg, rgb(255 255 255/.2) 0 10px, transparent 10px 22px), linear-gradient(160deg,#FFEDB3,#D9A93A)' },
  wheels: { frame: '#1D8A6A', ink: '#073D2E', bg: 'radial-gradient(circle, rgb(255 255 255/.35) 2px, transparent 2.5px) 0 0/16px 16px, linear-gradient(160deg,#D2FAEA,#5FE0B2)' },
  dust: { frame: '#B5482A', ink: '#4A160A', bg: 'repeating-radial-gradient(circle at 15% 110%, rgb(255 255 255/.2) 0 6px, transparent 6px 16px), linear-gradient(160deg,#FFE0C7,#FF9E6B)' },
  air: { frame: '#3A7BD5', ink: '#0B2A5B', bg: 'repeating-linear-gradient(0deg, rgb(255 255 255/.4) 0 2px, transparent 2px 14px), linear-gradient(160deg,#F0FCFF,#9EE7FF)' },
  secret: { frame: '#6B4BD8', ink: '#24104F', bg: 'conic-gradient(from 200deg at 30% 30%, #FFC6E9, #C9A7FF, #9EE7FF, #C6F4B0, #FFE7A3, #FFC6E9)' },
}

const ICONS: Record<CardStyle, string> = {
  light: 'M10 3v3M10 14v3M3 10h3M14 10h3M5 5l2 2M13 13l2 2M15 5l-2 2M7 13l-2 2M10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  thrust: 'M10 2c3 3 3 7 0 11-3-4-3-8 0-11zM7 13l-2 4M13 13l2 4M10 14v4',
  wheels: 'M5 13a2.5 2.5 0 1 0 0 .1M15 13a2.5 2.5 0 1 0 0 .1M3 10h14M6 10l2-4h4l2 4',
  dust: 'M3 13c2-2 4 2 6 0s4 2 6 0M3 8c2-2 4 2 6 0s4 2 6 0',
  air: 'M3 7h9a2.5 2.5 0 1 0-2.5-2.5M3 11h12a2.5 2.5 0 1 1-2.5 2.5M3 15h6',
  secret: 'M10 2l2.2 5 5.3.5-4 3.6 1.2 5.3L10 13.6 5.3 16.4l1.2-5.3-4-3.6 5.3-.5z',
}

type Props = { device: Device; size?: 'lg' | 'sm'; interactive?: boolean }

export default function DeviceCard({ device: d, size = 'lg', interactive = false }: Props) {
  const s = STYLES[d.card.style]
  const [tilt, setTilt] = useState({ x: 0.5, y: 0.5 })
  const number = String(allDevices.indexOf(d) + 1).padStart(2, '0')

  // On phones, tilting the device moves the shine and the tilt (no permission prompt: browsers that need one just skip it).
  useEffect(() => {
    if (!interactive || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const clamp = (n: number) => Math.min(1, Math.max(0, n))
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return
      setTilt({ x: clamp(0.5 + e.gamma / 50), y: clamp(0.5 + (e.beta - 40) / 50) })
    }
    addEventListener('deviceorientation', onTilt)
    return () => removeEventListener('deviceorientation', onTilt)
  }, [interactive])
  const style = {
    fontSize: size === 'lg' ? 16 : 10,
    '--mx': `${tilt.x * 100}%`,
    transform: interactive ? `perspective(800px) rotateY(${(tilt.x - 0.5) * 16}deg) rotateX(${(0.5 - tilt.y) * 16}deg)` : undefined,
  } as CSSProperties

  return (
    <article
      className="relative aspect-[5/7] w-[16.25em] select-none rounded-[1.1em] p-[0.55em] shadow-[0_1.2em_2.5em_rgb(0_0_0/0.45)] transition-transform duration-150"
      style={{ ...style, background: s.frame }}
      onPointerMove={interactive ? (e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setTilt({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
      } : undefined}
      onPointerLeave={interactive ? () => setTilt({ x: 0.5, y: 0.5 }) : undefined}
      aria-label={`${d.nickname} card`}
    >
      <div className="flex h-full flex-col gap-[0.45em] overflow-hidden rounded-[0.7em] p-[0.7em]" style={{ background: s.bg, color: s.ink }}>
        <header className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[1.3em] font-bold leading-none">{d.nickname}</h3>
            <span className="mt-[0.35em] inline-flex items-center gap-[0.3em] rounded-full bg-white/60 px-[0.55em] py-[0.15em] text-[0.7em] font-semibold">
              <svg viewBox="0 0 20 20" className="h-[1.2em] w-[1.2em]" aria-hidden="true"><path d={ICONS[d.card.style]} stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {d.card.type}
            </span>
          </div>
          <p className="text-right leading-none">
            <span className="block text-[1.5em] font-bold">{d.card.stat.value}</span>
            <span className="text-[0.65em] font-semibold opacity-80">{d.card.stat.label}</span>
          </p>
        </header>

        <div className="aspect-[4/3] overflow-hidden rounded-[0.5em] ring-[0.25em] ring-white/80">
          <img src={d.photos[0].src} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <p className="rounded-[0.3em] bg-white/50 px-[0.5em] py-[0.15em] text-center text-[0.62em] font-semibold">
          On {worlds[d.world].name.replace('The ', 'the ')} since {d.joined}
        </p>

        <dl className="flex flex-1 flex-col justify-center gap-[0.4em] text-[0.72em] leading-snug">
          <div><dt className="font-bold">Power</dt><dd>{tx(d.card.power)}</dd></div>
          <div className="border-t border-current/20 pt-[0.4em]"><dt className="font-bold">Superpower</dt><dd>{tx(d.card.superpower)}</dd></div>
        </dl>

        <footer className="flex items-center justify-between text-[0.62em] font-semibold opacity-80">
          <span>#{number} / {String(allDevices.length).padStart(2, '0')}</span>
          <span>{d.secret ? 'Secret' : worlds[d.world].name}</span>
        </footer>
      </div>

      {/* light sweep that follows the pointer; rainbow foil on secret cards */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-[1.1em] ${d.secret ? 'mix-blend-color-dodge opacity-60' : 'mix-blend-soft-light opacity-70'}`}
        style={{ background: 'linear-gradient(115deg, transparent calc(var(--mx) - 25%), rgb(255 255 255/.75) var(--mx), transparent calc(var(--mx) + 25%))' }}
      />
    </article>
  )
}
