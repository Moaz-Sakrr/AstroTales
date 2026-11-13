import { useRef, type PointerEvent } from 'react'
import type { Device, WorldId } from '../content/types'
import { worlds } from '../content/worlds'
import { allDeviceIds } from '../content/devices'
import { en } from '../content/i18n/en'
import DeviceArt from './art/DeviceArt'
import { IconSpark } from './icons'

const t = en.cards

// Frame colors per world (art colors for the card illustration).
const FRAME: Record<WorldId, { edge: string; sky: string }> = {
  moon: { edge: 'from-[#E8ECF5] via-[#9DA2B6] to-[#E8ECF5]', sky: 'from-[#1B2F5E] to-[#5AA8F0]' },
  mars: { edge: 'from-[#FFC93C] via-[#E0703A] to-[#FFC93C]', sky: 'from-[#8E3A1F] to-[#F59A5E]' },
  secret: { edge: 'from-[#FF8FB1] via-[#8B6CF0] to-[#9FE3FF]', sky: 'from-[#2A1B5E] to-[#8B6CF0]' },
}

type Props = { device: Device; tilt?: boolean; className?: string }

// Pokémon-style collectible card with a holographic shine that follows the pointer.
export default function HoloCard({ device, tilt = false, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const f = FRAME[device.world]
  const number = allDeviceIds.indexOf(device.id) + 1

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ref.current.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 18}deg) rotateX(${(0.5 - py) * 18}deg)`
    ref.current.style.setProperty('--mx', `${px * 100}%`)
    ref.current.style.setProperty('--my', `${py * 100}%`)
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative aspect-[5/7] rounded-[1.4rem] bg-linear-to-br p-[6px] shadow-[0_20px_50px_rgb(0_0_0/0.5)] transition-transform duration-200 ${f.edge} ${className}`}
    >
      <div className="flex h-full flex-col rounded-[1.1rem] bg-paper p-2.5 text-ink">
        {/* name row */}
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="truncate text-lg font-bold leading-tight">{device.nickname}</p>
          <span className="flex shrink-0 text-coin" aria-label={`${device.collectible.rarity} / 3`}>
            {Array.from({ length: device.collectible.rarity }, (_, i) => <IconSpark key={i} className="h-4 w-4" />)}
          </span>
        </div>
        {/* art window */}
        <div className={`relative mt-1.5 flex flex-[1.25] items-end justify-center overflow-hidden rounded-xl bg-linear-to-b ring-2 ring-ink/20 ${f.sky}`}>
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-black/20" />
          <DeviceArt id={device.id} className="relative h-[88%] w-auto" />
        </div>
        <p className="mt-1 truncate px-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink/60">
          {worlds[device.world].name.en}{device.nssdcaId ? ` · ${device.nssdcaId}` : ''}
        </p>
        {/* abilities */}
        <div className="mt-1 flex flex-1 flex-col justify-center gap-1 rounded-xl bg-ink/5 px-2.5 py-1.5 text-sm leading-snug">
          <p><span className="font-bold">{t.power}:</span> {device.collectible.power.en}</p>
          <p><span className="font-bold">{t.superpower}:</span> {device.collectible.superpower.en}</p>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-1 text-center">
          {device.stats.map((s) => (
            <div key={s.label.en} className="rounded-lg bg-ink/5 py-1">
              <p className="text-sm font-bold leading-none">{s.value}</p>
              <p className="truncate px-0.5 text-[0.6rem] leading-tight text-ink/60">{s.label.en}</p>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between px-1 text-[0.65rem] text-ink/60">
          <span className="truncate">{t.home}: {device.collectible.distanceHome}</span>
          <span className="shrink-0 font-semibold">#{number}/{allDeviceIds.length}</span>
        </div>
      </div>
      {/* holographic layer on top of everything */}
      <div className="holo pointer-events-none absolute inset-0 rounded-[1.4rem] opacity-80" aria-hidden="true" />
    </div>
  )
}
