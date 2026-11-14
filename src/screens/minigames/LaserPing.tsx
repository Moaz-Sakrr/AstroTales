import { useEffect, useRef, useState } from 'react'
import Starfield from '../../components/Starfield'
import Button from '../../components/Button'
import { en } from '../../content/i18n/en'
import { useMedia } from '../../hooks/useMedia'
import { useRaf } from '../../hooks/useRaf'
import type { GameProps } from './MiniGame'
import { clip, sfx } from '../../audio/engine'

const t = en.mini.laser
const ONE_WAY = 1.28 // seconds: real Earth → Moon light travel time
const ROUND_TRIP = ONE_WAY * 2
const WINDOW = 0.3 // how close to the real arrival a catch must be

// Two layouts so Earth and Moon both stay on screen: side by side on wide screens, stacked on phones.
const LAYOUT = {
  wide: { vb: '0 0 1000 600', earth: { x: 150, y: 660, r: 280 }, scope: { x: 215, y: 385 }, moon: { x: 820, y: 160, r: 82 } },
  tall: { vb: '0 0 600 1000', earth: { x: 300, y: 1000, r: 360 }, scope: { x: 300, y: 642 }, moon: { x: 400, y: 200, r: 82 } }, // Earth sits above the HUD
}

type Mode = 'ready' | 'flying' | 'caught'

export default function LaserPing({ playing, onWin }: GameProps) {
  const L = LAYOUT[useMedia('(min-aspect-ratio: 1/1)') ? 'wide' : 'tall']
  const reflecto = { x: L.moon.x - L.moon.r * 0.45, y: L.moon.y + L.moon.r * 0.3 }
  const beam = { x1: L.scope.x, y1: L.scope.y - 34 }
  const tiltDeg = (Math.atan2(reflecto.y - beam.y1, reflecto.x - beam.x1) * 180) / Math.PI

  const [mode, setMode] = useState<Mode>('ready')
  const [msg, setMsg] = useState('')
  const time = useRef(0)
  const pulse = useRef<SVGGElement>(null)
  const trail = useRef<SVGLineElement>(null)
  const timer = useRef<HTMLSpanElement>(null)

  const fire = () => {
    clip('laser', 'pew')
    time.current = 0
    setMsg('')
    setMode('flying')
  }
  const tryCatch = () => {
    const s = time.current
    if (s < ROUND_TRIP - WINDOW) {
      sfx('bonk')
      setMsg(t.early(s.toFixed(2)))
      setMode('ready')
    } else {
      sfx('ping')
      sfx('ding', 0.15)
      setMsg(t.caught(s.toFixed(2)))
      setMode('caught')
      setTimeout(onWin, 1500)
    }
  }

  useRaf((dt) => {
    if (mode !== 'flying') return
    time.current += dt
    const s = time.current
    if (s > ROUND_TRIP + WINDOW) {
      sfx('bonk')
      setMsg(t.late)
      setMode('ready')
    }
    // out to the Moon, then back; parks at Earth once home
    const p = s < ONE_WAY ? s / ONE_WAY : Math.max(0, 1 - (s - ONE_WAY) / ONE_WAY)
    const x = beam.x1 + (reflecto.x - beam.x1) * p
    const y = beam.y1 + (reflecto.y - beam.y1) * p
    pulse.current?.setAttribute('transform', `translate(${x} ${y})`)
    const from = s < ONE_WAY ? beam : { x1: reflecto.x, y1: reflecto.y }
    trail.current?.setAttribute('x1', String(from.x1))
    trail.current?.setAttribute('y1', String(from.y1))
    trail.current?.setAttribute('x2', String(x))
    trail.current?.setAttribute('y2', String(y))
    if (timer.current) timer.current.textContent = s.toFixed(2)
  }, playing)

  // Space bar = the big button
  useEffect(() => {
    if (!playing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (mode === 'ready') fire()
      else if (mode === 'flying') tryCatch()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const midX = (beam.x1 + reflecto.x) / 2
  const midY = (beam.y1 + reflecto.y) / 2

  return (
    <div className="space-sky absolute inset-0">
      <Starfield />
      <svg viewBox={L.vb} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="lp-ocean" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#6CB6F5" />
            <stop offset="0.5" stopColor="#2F6FDB" />
            <stop offset="1" stopColor="#123275" />
          </radialGradient>
          <radialGradient id="lp-moon" cx="0.35" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#F1F1F5" />
            <stop offset="0.7" stopColor="#C3C6D2" />
            <stop offset="1" stopColor="#8E93A8" />
          </radialGradient>
          <linearGradient id="lp-night" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.55" stopColor="#08152B" stopOpacity="0" />
            <stop offset="1" stopColor="#08152B" stopOpacity="0.85" />
          </linearGradient>
          <filter id="lp-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id="lp-earth-clip">
            <circle cx={L.earth.x} cy={L.earth.y} r={L.earth.r} />
          </clipPath>
        </defs>

        {/* Earth */}
        <circle cx={L.earth.x} cy={L.earth.y} r={L.earth.r + 16} fill="#6FB8FF" opacity="0.28" filter="url(#lp-glow)" />
        <circle cx={L.earth.x} cy={L.earth.y} r={L.earth.r} fill="url(#lp-ocean)" />
        <g clipPath="url(#lp-earth-clip)">
          <path d={`M${L.earth.x - 150},${L.earth.y - 250} c60,-30 130,0 120,50 c-10,40 -70,40 -80,90 c-40,-20 -90,-90 -40,-140z`} fill="#4FAF6A" />
          <path d={`M${L.earth.x + 40},${L.earth.y - 300} c70,-10 120,40 90,80 c-30,30 -80,0 -100,30 c-30,-30 -30,-90 10,-110z`} fill="#5DBB72" />
          <ellipse cx={L.earth.x - 40} cy={L.earth.y - 230} rx="110" ry="10" fill="#fff" opacity="0.6" />
          <ellipse cx={L.earth.x + 90} cy={L.earth.y - 180} rx="90" ry="8" fill="#fff" opacity="0.5" />
          <circle cx={L.earth.x} cy={L.earth.y} r={L.earth.r} fill="url(#lp-night)" />
        </g>

        {/* observatory with its telescope aimed at Reflecto */}
        <g transform={`translate(${L.scope.x} ${L.scope.y})`}>
          <rect x="-26" y="-16" width="52" height="22" rx="3" fill="#C9CDD8" />
          <path d="M-30,-14 A30,30 0 0 1 30,-14 Z" fill="#E8EAF0" />
          <g transform={`translate(0 -22) rotate(${tiltDeg})`}>
            <rect x="0" y="-5" width="34" height="10" rx="3" fill="#5D6378" />
            <rect x="30" y="-6.5" width="6" height="13" rx="2" fill="#2B2F45" />
          </g>
          <circle cx="0" cy="-22" r="5" fill="#2B2F45" />
        </g>

        {/* Moon + Reflecto */}
        <circle cx={L.moon.x} cy={L.moon.y} r={L.moon.r + 18} fill="#E6E8F0" opacity="0.18" filter="url(#lp-glow)" />
        <circle cx={L.moon.x} cy={L.moon.y} r={L.moon.r} fill="url(#lp-moon)" />
        {[[-28, -22, 14], [24, -30, 9], [30, 20, 16], [-8, 34, 8], [8, -2, 6]].map(([dx, dy, r]) => (
          <g key={`${dx}${dy}`}>
            <circle cx={L.moon.x + dx} cy={L.moon.y + dy} r={r} fill="#A3A8BB" />
            <circle cx={L.moon.x + dx + r * 0.2} cy={L.moon.y + dy + r * 0.2} r={r * 0.7} fill="#959AAE" />
          </g>
        ))}
        <circle cx={reflecto.x} cy={reflecto.y} r="16" fill="none" stroke="#FFC93C" strokeWidth="2.5" className="motion-safe:animate-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        <rect x={reflecto.x - 6} y={reflecto.y - 4} width="12" height="8" rx="1.5" fill="#CDEBFF" stroke="#5D6378" />
        <text x={reflecto.x} y={reflecto.y + 30} textAnchor="middle" fontSize="15" fontWeight="600" fill="#FFC93C">Reflecto</text>

        {/* path guide, the trail, and the light pulse */}
        <line x1={beam.x1} y1={beam.y1} x2={reflecto.x} y2={reflecto.y} stroke="#FF8080" strokeWidth="1.5" strokeDasharray="4 10" opacity="0.35" />
        <line ref={trail} x1={beam.x1} y1={beam.y1} x2={beam.x1} y2={beam.y1} stroke="#FF4D4D" strokeWidth="4" strokeLinecap="round" opacity={mode === 'flying' ? 0.9 : 0} filter="url(#lp-glow)" />
        <g ref={pulse} transform={`translate(${beam.x1} ${beam.y1})`} opacity={mode === 'ready' ? 0 : 1}>
          <circle r="20" fill="#FF4D4D" opacity="0.55" filter="url(#lp-glow)" />
          <circle r="7" fill="#FFF3F3" />
        </g>
        {mode === 'caught' && (
          <>
            <circle cx={beam.x1} cy={beam.y1} r="10" fill="none" stroke="#3DDC97" strokeWidth="4" className="motion-safe:animate-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
            <text x={midX} y={midY - 14} textAnchor="middle" fontSize="26" fontWeight="700" fill="#FFF8E7" className="animate-[pop_0.5s_ease-out]">
              {t.distance}
            </text>
          </>
        )}
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-5 pb-8">
        <p className="rounded-2xl bg-black/45 px-5 py-2 text-center backdrop-blur-sm">
          <span ref={timer} className="text-5xl font-bold tabular-nums text-text">0.00</span>
          <span className="ml-1 text-2xl text-text-muted">s</span>
        </p>
        <p aria-live="polite" className={`min-h-7 text-center text-lg font-semibold ${mode === 'caught' ? 'text-[#3DDC97]' : 'text-cta'}`}>{msg}</p>
        {mode !== 'caught' && (
          <Button sound={null} className="min-w-56 text-xl" onClick={mode === 'ready' ? fire : tryCatch} disabled={!playing}>
            {mode === 'ready' ? t.fire : t.catch}
          </Button>
        )}
      </div>
    </div>
  )
}
