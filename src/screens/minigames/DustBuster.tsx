import { useEffect, useRef, useState } from 'react'
import { en } from '../../content/i18n/en'
import { useRaf } from '../../hooks/useRaf'
import type { GameProps } from './MiniGame'
import { clip, sfx } from '../../audio/engine'

const t = en.mini.dust
const W = 800 // canvas works in this fixed space; CSS stretches it to the panel
const H = 400
const COLS = 32
const ROWS = 16
const BRUSH = 38
const GOAL = 90

type Fleck = { x: number; y: number; vx: number; vy: number; life: number; c: string }
const BRUSH_GAP = 110 // ms between wipe sounds, so a fast scrub stays soft
const DUST = ['#9E5530', '#C98250', '#D99A68', '#8A4626', '#B8693A']

export default function DustBuster({ playing, onWin }: GameProps) {
  const dustRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)
  const clean = useRef(new Uint8Array(COLS * ROWS))
  const flecks = useRef<Fleck[]>([])
  const last = useRef<{ x: number; y: number } | null>(null)
  const lastBrush = useRef(0)
  const devil = useRef<{ x: number; y: number; phase: number } | null>(null)
  const nextDevil = useRef(5)
  const [power, setPower] = useState(0)
  const [devilOn, setDevilOn] = useState(false)
  const [won, setWon] = useState(false)

  // paint a thick, speckled layer of Mars dust
  useEffect(() => {
    const ctx = dustRef.current!.getContext('2d')!
    ctx.fillStyle = '#B8693A'
    ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 2600; i++) {
      ctx.globalAlpha = 0.4 + Math.random() * 0.5
      ctx.fillStyle = DUST[(Math.random() * DUST.length) | 0]
      ctx.beginPath()
      ctx.arc(Math.random() * W, Math.random() * H, 0.6 + Math.random() * 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      const g = ctx.createRadialGradient(x, y, 0, x, y, 30 + Math.random() * 50)
      g.addColorStop(0, 'rgba(140,70,35,0.45)')
      g.addColorStop(1, 'rgba(140,70,35,0)')
      ctx.globalAlpha = 1
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    }
  }, [])

  const stamp = (x: number, y: number, r: number) => {
    const ctx = dustRef.current!.getContext('2d')!
    ctx.globalCompositeOperation = 'destination-out'
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(0.6, 'rgba(0,0,0,0.9)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    // a cell counts as clean once a stamp's solid middle covers its center
    const cw = W / COLS
    const ch = H / ROWS
    for (let cy = Math.max(0, Math.floor((y - r) / ch)); cy <= Math.min(ROWS - 1, Math.floor((y + r) / ch)); cy++)
      for (let cx = Math.max(0, Math.floor((x - r) / cw)); cx <= Math.min(COLS - 1, Math.floor((x + r) / cw)); cx++)
        if (Math.hypot((cx + 0.5) * cw - x, (cy + 0.5) * ch - y) < r * 0.75) clean.current[cy * COLS + cx] = 1
    for (let i = 0; i < 2; i++)
      flecks.current.push({ x, y, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 160, life: 1, c: DUST[(Math.random() * DUST.length) | 0] })
  }

  const wipeTo = (x: number, y: number) => {
    const now = performance.now()
    if (now - lastBrush.current > BRUSH_GAP) {
      lastBrush.current = now
      sfx('brush')
    }
    const from = last.current ?? { x, y }
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / 8))
    for (let i = 1; i <= steps; i++) stamp(from.x + ((x - from.x) * i) / steps, from.y + ((y - from.y) * i) / steps, BRUSH)
    last.current = { x, y }
  }

  const toCanvas = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
  }

  useRaf((dt) => {
    // dust devil: the real "cleaning event" that rescued Opportunity again and again
    nextDevil.current -= dt
    if (!devil.current && nextDevil.current <= 0 && !won) {
      devil.current = { x: -60, y: 80 + Math.random() * (H - 160), phase: 0 }
      setDevilOn(true)
      clip('dustDevil', 'whoosh')
    }
    if (devil.current) {
      const d = devil.current
      d.x += 340 * dt
      d.phase += dt * 6
      stamp(d.x, d.y + Math.sin(d.phase) * 50, 52)
      if (d.x > W + 60) {
        devil.current = null
        nextDevil.current = 6 + Math.random() * 3
        setDevilOn(false)
      }
    }

    const fx = fxRef.current!.getContext('2d')!
    fx.clearRect(0, 0, W, H)
    flecks.current = flecks.current.filter((f) => (f.life -= dt * 1.6) > 0)
    for (const f of flecks.current) {
      f.vy += 500 * dt
      f.x += f.vx * dt
      f.y += f.vy * dt
      fx.globalAlpha = f.life
      fx.fillStyle = f.c
      fx.beginPath()
      fx.arc(f.x, f.y, 2.2, 0, Math.PI * 2)
      fx.fill()
    }
    if (devil.current) {
      const d = devil.current
      for (let i = 0; i < 14; i++) {
        const a = d.phase * 2 + i
        fx.globalAlpha = 0.35
        fx.fillStyle = '#E2A672'
        fx.beginPath()
        fx.arc(d.x + Math.cos(a) * (10 + i * 2), d.y + Math.sin(d.phase) * 50 - i * 9, 6 + i * 0.6, 0, Math.PI * 2)
        fx.fill()
      }
    }

    const pct = Math.round((clean.current.reduce((a, b) => a + b, 0) / clean.current.length) * 100)
    if (pct !== power) setPower(pct)
    if (pct >= GOAL && !won) {
      setWon(true)
      setTimeout(onWin, 1300)
    }
  }, playing)

  const barColor = power < 40 ? '#FF4D4D' : power < 75 ? '#FFC93C' : '#3DDC97'

  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#C98A63_0%,#E2B48C_45%,#D49A6A_62%,#A9603A_100%)]">
      {/* distant Martian hills */}
      <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[45%] w-full" aria-hidden="true">
        <path d="M0 120 C 120 80 220 110 320 90 C 450 60 560 100 680 80 C 800 60 900 95 1000 85 L1000 400 L0 400Z" fill="#B87346" />
        <path d="M0 200 C 200 170 420 190 640 175 C 800 165 900 180 1000 172 L1000 400 L0 400Z" fill="#9A5530" />
      </svg>

      {/* power meter */}
      <div className="absolute inset-x-0 top-16 z-10 flex justify-center">
        <div className="flex items-center gap-3 rounded-full bg-black/45 px-4 py-2 backdrop-blur-sm" role="meter" aria-valuenow={power} aria-valuemin={0} aria-valuemax={100} aria-label={t.power}>
          <svg viewBox="0 0 16 16" className="h-5 w-5" aria-hidden="true"><path d="M9 1L3 9h4l-1 6 6-8H8z" fill={barColor} /></svg>
          <div className="relative h-5 w-44 overflow-hidden rounded-md border-2 border-white/70 sm:w-60">
            <div className="h-full transition-[width] duration-200" style={{ width: `${power}%`, background: barColor }} />
            <div className="absolute inset-y-0 border-l-2 border-dashed border-white/80" style={{ left: `${GOAL}%` }} />
          </div>
          <span className="w-20 font-bold tabular-nums">{power}%</span>
        </div>
      </div>
      {devilOn && <p className="absolute inset-x-0 top-32 z-10 mx-auto w-fit animate-[pop_0.4s_ease-out] rounded-full bg-black/50 px-4 py-1.5 font-semibold text-cta">{t.devil}</p>}

      {/* Opportunity: mast camera peeking over its solar panel deck */}
      <div className="absolute left-1/2 top-[54%] w-[min(94vw,820px)] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="320 0 160 140" className="mx-auto -mb-1 w-[18%]" aria-hidden="true">
          <rect x="390" y="30" width="20" height="110" rx="6" fill="#D9DCE6" />
          <rect x="340" y="6" width="120" height="40" rx="10" fill="#E8EAF0" stroke="#8A90A6" strokeWidth="3" />
          <circle cx="372" cy="26" r="11" fill="#1B2440" />
          <circle cx="428" cy="26" r="11" fill="#1B2440" />
          <circle cx="375" cy="23" r="3.5" fill="#fff" />
          <circle cx="431" cy="23" r="3.5" fill="#fff" />
        </svg>
        <div className={`relative aspect-[2/1] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgb(0_0_0/0.4)] ring-4 ring-[#8A90A6] transition ${won ? 'ring-[#3DDC97]' : ''}`}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="db-cell" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3E6FD8" />
                <stop offset="1" stopColor="#1C3A86" />
              </linearGradient>
              <linearGradient id="db-glint" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
                <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width={W} height={H} fill="#2B2F45" />
            {Array.from({ length: 8 * 4 }, (_, i) => (
              <rect key={i} x={10 + (i % 8) * 97.5} y={10 + Math.floor(i / 8) * 97.5} width="92" height="92" rx="4" fill="url(#db-cell)" />
            ))}
            <rect width={W} height={H} fill="url(#db-glint)" className={won ? 'animate-[pop_0.6s_ease-out]' : ''} />
          </svg>
          <canvas
            ref={dustRef}
            width={W}
            height={H}
            className={`absolute inset-0 h-full w-full ${playing && !won ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onPointerDown={(e) => {
              if (!playing || won) return
              e.currentTarget.setPointerCapture(e.pointerId)
              last.current = null
              const p = toCanvas(e)
              wipeTo(p.x, p.y)
            }}
            onPointerMove={(e) => {
              if (!playing || won || !e.currentTarget.hasPointerCapture(e.pointerId)) return
              const p = toCanvas(e)
              wipeTo(p.x, p.y)
            }}
            onPointerUp={() => (last.current = null)}
          />
          <canvas ref={fxRef} width={W} height={H} className="pointer-events-none absolute inset-0 h-full w-full" />
        </div>
      </div>
    </div>
  )
}
