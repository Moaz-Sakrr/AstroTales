import type { Device } from '../../content/types'
import { suits } from '../../content/suits'
import { en } from '../../content/i18n/en'
import { useProgress } from '../../store/progress'
import Astronaut from '../../components/Astronaut'
import DeviceArt from '../../components/art/DeviceArt'
import Starfield from '../../components/Starfield'

const GROUND: Record<Device['world'], [string, string]> = {
  moon: ['#CFCFD8', '#8E93A8'],
  mars: ['#E0703A', '#8E3A1F'],
  secret: ['#C2A887', '#5E4E3C'],
}

type Props = { device: Device; speaking: boolean; pointer?: boolean; beam?: boolean; layout: 'tall' | 'wide' }

// The shared stage: sky, the world's ground, the kid's astronaut and the talking device.
export default function StoryScene({ device, speaking, pointer, beam, layout }: Props) {
  const { character, suit } = useProgress()
  const [top, bottom] = GROUND[device.world]
  const wide = layout === 'wide'
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="space-sky absolute inset-0">
        <Starfield />
      </div>

      {/* Earth hangs in the Moon's sky; Mars and Eros show a tiny far-away Earth */}
      <svg viewBox="0 0 100 100" className={`absolute ${wide ? 'right-[8%] top-[6%] w-[12%]' : 'right-[8%] top-[12%] w-[22%]'} ${device.world === 'moon' ? '' : 'scale-50 opacity-80'}`}>
        <circle cx="50" cy="50" r="46" fill="#2F6FDB" />
        <path d="M26 30 Q40 20 48 34 Q44 48 30 46 Q20 40 26 30Z M58 52 Q74 44 80 60 Q70 76 58 68Z" fill="#2E9E6B" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#9FE3FF" strokeWidth="3" opacity="0.5" />
      </svg>

      {/* laser beam from Earth down to the device */}
      {beam && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <line x1={wide ? 86 : 80} y1={wide ? 12 : 20} x2={wide ? 71 : 50} y2={wide ? 62 : 62} stroke="#FF4D4D" strokeWidth="0.6" className="laser-pulse" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} />
        </svg>
      )}

      {/* ground */}
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full">
        <defs>
          <linearGradient id={`sg-${device.world}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={top} />
            <stop offset="1" stopColor={bottom} />
          </linearGradient>
        </defs>
        <path d="M0 20 C80 6 160 26 240 14 C310 4 360 18 400 12 L400 120 L0 120 Z" fill={`url(#sg-${device.world})`} />
        {[[60, 60, 26], [300, 80, 34], [190, 100, 18]].map(([x, y, r]) => (
          <ellipse key={x} cx={x} cy={y} rx={r} ry={r / 4} fill="#000" opacity="0.12" />
        ))}
      </svg>

      {/* the kid */}
      <div className={`absolute ${wide ? 'bottom-[30%] left-[10%] w-[10%] max-w-36' : 'bottom-[29%] left-[4%] w-[24%]'}`}>
        <Astronaut suit={suits[suit]} kind={character ?? 'boy'} emblem={suit} width={200} className="h-auto w-full" />
      </div>

      {/* the device */}
      <div className={`absolute ${wide ? 'bottom-[29%] right-[16%] w-[24%] max-w-[320px]' : 'bottom-[28%] right-[6%] w-[56%]'}`}>
        {pointer && (
          <div className="absolute left-1/2 top-[6%] -translate-x-1/2 -translate-y-full animate-bounce whitespace-nowrap rounded-full bg-coin px-3 py-1 text-sm font-bold text-on-cta">
            {en.story.thatsMe} ↓
          </div>
        )}
        <DeviceArt id={device.id} className={`h-auto w-full transition ${speaking ? 'speaking' : ''}`} />
      </div>
    </div>
  )
}
