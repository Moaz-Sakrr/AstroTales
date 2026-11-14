import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { useRaf } from '../hooks/useRaf'
import { now, reading, type Quake } from './quake'

// Rumble's seismograph: red ink on a strip of paper that feeds right to left.
// Shared by the landing page and the "Set up the station" mini-game.

const SPAN = 6 // seconds of paper on screen

// position it from outside: pass relative/absolute in className (the label is placed inside it)
type Props = {
  quakes: RefObject<Quake[]>
  label: string
  live?: boolean // false = seismometer not set up yet: flat line
  band?: number | null // dashed lines at ± this height (0..1)
  active?: boolean // false = paper stops (game paused, or reduced motion)
  className?: string
  canvasClassName?: string
  style?: CSSProperties
}

export default function Seismograph({ quakes, label, live = true, band = null, active = true, className = '', canvasClassName = 'h-16 sm:h-24', style }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const samples = useRef<{ s: number; v: number }[]>([])

  const draw = () => {
    const s = now()
    samples.current.push({ s, v: live ? reading(s, quakes.current) : 0 })
    while (samples.current.length && samples.current[0].s < s - SPAN) samples.current.shift()

    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const w = c.width
    const h = c.height
    const k = devicePixelRatio
    const mid = h / 2
    const amp = h * 0.42
    const penX = w - 34 * k
    const toX = (ts: number) => penX - ((s - ts) / SPAN) * (penX - 8 * k)
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#FFF1D6'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(184, 50, 50, 0.12)'
    ctx.lineWidth = k
    const step = Math.max(40 * k, w / 14)
    for (let x = penX - ((s * 60 * k) % step); x > 0; x -= step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (const y of [mid - amp / 2, mid, mid + amp / 2]) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    if (band) {
      ctx.setLineDash([6 * k, 6 * k])
      ctx.strokeStyle = 'rgba(19, 107, 99, 0.7)'
      for (const y of [mid - amp * band, mid + amp * band]) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }
    const pts = samples.current
    ctx.strokeStyle = '#E5484D'
    ctx.lineWidth = 2.2 * k
    ctx.lineJoin = 'round'
    ctx.beginPath()
    pts.forEach((p, i) => {
      const y = mid - Math.max(-1.1, Math.min(1.1, p.v)) * amp
      if (i) ctx.lineTo(toX(p.s), y)
      else ctx.moveTo(toX(p.s), y)
    })
    ctx.stroke()
    // the pen
    const last = pts[pts.length - 1]
    const penY = mid - Math.max(-1.1, Math.min(1.1, last?.v ?? 0)) * amp
    ctx.fillStyle = '#1B2440'
    ctx.beginPath()
    ctx.moveTo(penX, penY)
    ctx.lineTo(penX + 18 * k, penY - 7 * k)
    ctx.lineTo(penX + 18 * k, penY + 7 * k)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(penX + 18 * k, penY - 2 * k, w, 4 * k)
  }

  // a stopped strip (paused game, reduced motion) still shows its paper: draw once after each render and resize
  const paint = useRef(() => {})
  useEffect(() => {
    paint.current = draw
    if (!active) draw()
  })
  // keep the canvas sharp at any size
  useEffect(() => {
    const c = canvas.current!
    const ro = new ResizeObserver(() => {
      c.width = c.clientWidth * devicePixelRatio
      c.height = c.clientHeight * devicePixelRatio
      paint.current()
    })
    ro.observe(c)
    return () => ro.disconnect()
  }, [])
  useRaf(draw, active)

  return (
    <div className={`overflow-hidden rounded-xl shadow-[0_6px_0_rgb(0_0_0/0.35)] ring-1 ring-black/20 ${className}`} style={style}>
      <canvas ref={canvas} className={`block w-full ${canvasClassName}`} aria-hidden="true" />
      <span className="absolute left-2 top-1.5 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper">{label}</span>
    </div>
  )
}
