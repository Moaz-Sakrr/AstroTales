import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../../components/Button'
import { en } from '../../content/i18n/en'
import { useRaf } from '../../hooks/useRaf'
import type { GameProps } from './MiniGame'
import { buzz, loopClip, sfx } from '../../audio/engine'

const t = en.mini.transit
const FIRST = 2.4 // s: first transit starts
const PERIOD = 3.6 // s between transits (a planet repeats: that's how you know it's real)
const DURATION = 1.1 // s a transit lasts
const DEPTH = 0.14 // shortcut: real dips are ~0.01% to 1%, exaggerated so a kid can see it
const SPAN = 7 // seconds of history shown on the graph
const NEED = 3

// brightness at time s: flat star + gentle noise, minus a trapezoid dip during each transit
function brightness(s: number) {
  const noise = 0.014 * Math.sin(s * 13.1) + 0.009 * Math.sin(s * 29.7 + 1.3) + 0.006 * Math.sin(s * 51.3 + 0.4)
  const k = Math.floor((s - FIRST) / PERIOD)
  const u = (s - FIRST - k * PERIOD) / DURATION
  if (k < 0 || u < 0 || u > 1) return 1 + noise
  const edge = 0.22
  const shape = u < edge ? u / edge : u > 1 - edge ? (1 - u) / edge : 1
  return 1 + noise - DEPTH * shape
}
const transitIndex = (s: number) => {
  const k = Math.floor((s - FIRST) / PERIOD)
  const into = s - FIRST - k * PERIOD
  return k >= 0 && into <= DURATION + 0.7 ? k : -1 // a little grace after the dip for reaction time
}

export default function PlanetHunter({ playing, onWin }: GameProps) {
  const time = useRef(0)
  const samples = useRef<{ s: number; b: number }[]>([])
  const caughtAt = useRef<number[]>([])
  const caughtK = useRef(new Set<number>())
  const graph = useRef<HTMLCanvasElement>(null)
  const star = useRef<SVGGElement>(null)
  const planet = useRef<SVGCircleElement>(null)
  const [found, setFound] = useState(0)
  const [msg, setMsg] = useState('')
  const [revealed, setRevealed] = useState(false)

  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ x: (i * 97.3) % 300, y: (i * 61.7) % 300, r: 0.4 + ((i * 7) % 10) / 10, o: 0.3 + ((i * 13) % 10) / 15 })), [])

  // keep the graph canvas sharp at any size
  useEffect(() => {
    const c = graph.current!
    const ro = new ResizeObserver(() => {
      c.width = c.clientWidth * devicePixelRatio
      c.height = c.clientHeight * devicePixelRatio
    })
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  const tap = () => {
    if (!playing || revealed) return
    const k = transitIndex(time.current)
    if (k < 0) {
      sfx('bonk')
      return setMsg(t.noise)
    }
    if (caughtK.current.has(k)) return
    caughtK.current.add(k)
    caughtAt.current.push(time.current)
    const n = caughtK.current.size
    sfx('blip')
    sfx('ding', 0.1)
    buzz(30)
    setFound(n)
    setMsg(t.nice)
    if (n >= NEED) {
      setRevealed(true)
      setMsg(t.reveal)
      setTimeout(onWin, 3200)
    }
  }

  // the star's real "song" from Kepler data hums while you watch (once the NASA file is in the repo)
  useEffect(() => (playing ? loopClip('keplerStar', 0.3) : undefined), [playing])

  useEffect(() => {
    if (!playing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        tap()
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  useRaf((dt) => {
    time.current += dt
    const s = time.current
    const b = brightness(s)
    samples.current.push({ s, b })
    while (samples.current.length && samples.current[0].s < s - SPAN) samples.current.shift()

    // the star itself dims (a bit more than the graph, so the eye can catch it too)
    star.current?.setAttribute('opacity', String(0.45 + (b - 0.8) * 2.6))

    if (revealed && planet.current) {
      const a = s * 1.6
      planet.current.setAttribute('cx', String(150 + Math.cos(a) * 112))
      planet.current.setAttribute('cy', String(150 + Math.sin(a) * 26))
      planet.current.setAttribute('opacity', Math.sin(a) > 0 ? '1' : '0.35') // dimmer when behind the star
    }

    const c = graph.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const w = c.width
    const h = c.height
    const pad = 12 * devicePixelRatio
    const toX = (ts: number) => w - pad - ((s - ts) / SPAN) * (w - pad * 2)
    const toY = (v: number) => pad + ((1.04 - v) / 0.24) * (h - pad * 2)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(185,196,224,0.35)'
    ctx.setLineDash([6 * devicePixelRatio, 8 * devicePixelRatio])
    ctx.lineWidth = devicePixelRatio
    ctx.beginPath()
    ctx.moveTo(pad, toY(1))
    ctx.lineTo(w - pad, toY(1))
    ctx.stroke()
    ctx.setLineDash([])

    const pts = samples.current
    if (pts.length > 1) {
      const fill = ctx.createLinearGradient(0, 0, 0, h)
      fill.addColorStop(0, 'rgba(107,200,255,0.35)')
      fill.addColorStop(1, 'rgba(107,200,255,0)')
      ctx.beginPath()
      pts.forEach((p, i) => (i ? ctx.lineTo(toX(p.s), toY(p.b)) : ctx.moveTo(toX(p.s), toY(p.b))))
      ctx.lineTo(toX(pts[pts.length - 1].s), h)
      ctx.lineTo(toX(pts[0].s), h)
      ctx.fillStyle = fill
      ctx.fill()
      ctx.beginPath()
      pts.forEach((p, i) => (i ? ctx.lineTo(toX(p.s), toY(p.b)) : ctx.moveTo(toX(p.s), toY(p.b))))
      ctx.strokeStyle = '#6BC8FF'
      ctx.lineWidth = 3 * devicePixelRatio
      ctx.shadowColor = '#6BC8FF'
      ctx.shadowBlur = 12 * devicePixelRatio
      ctx.stroke()
      ctx.shadowBlur = 0
    }
    // green markers on every dip the kid caught
    for (const ts of caughtAt.current) {
      if (ts < s - SPAN) continue
      ctx.fillStyle = '#3DDC97'
      ctx.beginPath()
      ctx.arc(toX(ts), toY(1 - DEPTH) + 22 * devicePixelRatio, 7 * devicePixelRatio, 0, Math.PI * 2)
      ctx.fill()
    }
  }, playing)

  return (
    // the eyepiece and the graph are tap targets too: a much bigger "Planet!" button for small hands
    <div className="space-sky absolute inset-0 flex flex-col items-center gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-20">
      {/* Kepler's eyepiece: one star, the planet hidden until you've proven it's there */}
      <div className="relative aspect-square w-[min(46svh,78vw)] shrink" onPointerDown={tap}>
        {found > 0 && <span key={found} className="ripple pointer-events-none absolute inset-0 rounded-full border-8 border-[#3DDC97]" />}
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-label={t.view}>
          <defs>
            <radialGradient id="ph-star" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.25" stopColor="#FFF4C9" />
              <stop offset="0.6" stopColor="#FFC56B" stopOpacity="0.6" />
              <stop offset="1" stopColor="#FF9A3D" stopOpacity="0" />
            </radialGradient>
            <clipPath id="ph-lens">
              <circle cx="150" cy="150" r="146" />
            </clipPath>
          </defs>
          <circle cx="150" cy="150" r="148" fill="#050B1A" />
          <g clipPath="url(#ph-lens)">
            {stars.map((st, i) => (
              <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#fff" opacity={st.o} />
            ))}
            {revealed && <ellipse cx="150" cy="150" rx="112" ry="26" fill="none" stroke="#6BC8FF" strokeDasharray="3 6" opacity="0.6" />}
            <g ref={star}>
              <circle cx="150" cy="150" r="70" fill="url(#ph-star)" />
              <circle cx="150" cy="150" r="16" fill="#FFFDF2" />
            </g>
            {revealed && <circle ref={planet} cx="262" cy="150" r="9" fill="#5AA8F0" stroke="#BFE3FF" strokeWidth="2" />}
          </g>
          <circle cx="150" cy="150" r="147" fill="none" stroke="#8A90A6" strokeWidth="5" />
        </svg>
        <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-0.5 text-xs font-semibold text-text-muted">{t.view}</span>
      </div>

      <div className="relative w-full max-w-3xl flex-1 rounded-2xl bg-navy-950/70 ring-1 ring-white/10" onPointerDown={tap}>
        <span className="absolute left-3 top-2 text-xs font-semibold text-text-muted">{t.graph}</span>
        <canvas ref={graph} className="h-full min-h-28 w-full" />
      </div>

      <div className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{t.found(found)}</p>
          <p aria-live="polite" className={`min-h-6 text-sm ${msg === t.noise ? 'text-text-muted' : 'text-[#3DDC97]'}`}>{msg}</p>
        </div>
        <Button sound={null} className="min-w-44 text-xl" onClick={tap} disabled={!playing || revealed}>
          {t.button}
        </Button>
      </div>
    </div>
  )
}
