import { useEffect, useMemo, useRef, useState } from 'react'
import { en } from '../../content/i18n/en'
import { useMedia } from '../../hooks/useMedia'
import { useRaf } from '../../hooks/useRaf'
import type { GameProps } from './MiniGame'
import { sfx, thrust } from '../../audio/engine'

const t = en.mini.lander
// World units. Gravity is weak (the Moon!) and fuel is limited, like Armstrong's real landing.
const GRAVITY = 24
const THRUST = 60
const SIDE = 26
const BURN = 7 // fuel per second of main engine (~14 s of thrust: forgiving for 8-year-olds)
const SIDE_BURN = 4
const SAFE_VY = 42 // softest touchdown that counts as a landing
const SAFE_VX = 22
const FOOT = 25 // half the distance between the landing pads
const M_PER_UNIT = 1 / 16 // shown speeds in m/s

// Craggy terrain with a boulder field and one flat landing spot. Same layout every time.
function makeTerrain(W: number, H: number) {
  const ground = H - 110
  const pad = { x0: Math.round(W * 0.64), x1: Math.round(W * 0.64) + 140, y: ground - 8 }
  const pts: [number, number][] = []
  for (let x = 0; x <= W; x += 25) {
    if (x >= pad.x0 && x <= pad.x1) {
      pts.push([x, pad.y])
      continue
    }
    const rocky = x > W * 0.26 && x < W * 0.56
    const y = ground - 18 * Math.sin(x * 0.013) - 10 * Math.sin(x * 0.041 + 1) - (rocky ? 22 * Math.abs(Math.sin(x * 0.09)) : 0)
    pts.push([x, y])
  }
  // make sure the pad edges exist exactly
  pts.push([pad.x0, pad.y], [pad.x1, pad.y])
  pts.sort((a, b) => a[0] - b[0])
  const boulders = Array.from({ length: 9 }, (_, i) => {
    const x = W * 0.28 + i * W * 0.032
    return { x, r: 7 + ((i * 5) % 9), y: heightAt(pts, x) }
  })
  return { pts, pad, ground, boulders }
}
function heightAt(pts: [number, number][], x: number) {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    if (x <= x1) return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
  }
  return pts[pts.length - 1][1]
}

type Mode = 'flying' | 'landed' | 'crashed'
type Puff = { x: number; y: number; vx: number; vy: number; life: number }

export default function LunarLander({ playing, onWin }: GameProps) {
  const wide = useMedia('(min-aspect-ratio: 1/1)')
  const W = wide ? 1000 : 600
  const H = wide ? 620 : 900
  const world = useMemo(() => makeTerrain(W, H), [W, H])
  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ x: (i * 137.5) % W, y: (i * 71.3) % (H * 0.6), r: 0.5 + ((i * 7) % 10) / 9 })), [W, H])

  const ship = useRef({ x: W * 0.14, y: 70, vx: 30, vy: 0, fuel: 100 })
  const keys = useRef({ up: false, left: false, right: false })
  const puffs = useRef<Puff[]>([])
  const lander = useRef<SVGGElement>(null)
  const flame = useRef<SVGGElement>(null)
  const rcsL = useRef<SVGCircleElement>(null)
  const rcsR = useRef<SVGCircleElement>(null)
  const puffEls = useRef<(SVGCircleElement | null)[]>([])
  const hud = useRef<{ h: HTMLElement | null; v: HTMLElement | null; fuel: HTMLElement | null }>({ h: null, v: null, fuel: null })
  const [mode, setMode] = useState<Mode>('flying')
  const [msg, setMsg] = useState('')
  const [crashes, setCrashes] = useState(0)

  const reset = () => {
    ship.current = { x: W * 0.14, y: 70, vx: 30, vy: 0, fuel: 100 }
    setMode('flying')
    setMsg('')
  }

  const spawn = (x: number, y: number, n: number, speed: number) => {
    for (let i = 0; i < n && puffs.current.length < 40; i++)
      puffs.current.push({ x, y, vx: (Math.random() - 0.5) * speed * 2, vy: -Math.random() * speed * 0.5, life: 1 })
  }

  useRaf((dt) => {
    const s = ship.current
    const k = keys.current
    if (mode === 'flying') {
      const hasFuel = s.fuel > 0
      const up = k.up && hasFuel
      const side = (k.right ? 1 : 0) - (k.left ? 1 : 0)
      s.vy += (GRAVITY - (up ? THRUST : 0)) * dt
      if (hasFuel) s.vx += side * SIDE * dt
      s.fuel = Math.max(0, s.fuel - ((up ? BURN : 0) + (side && hasFuel ? SIDE_BURN : 0)) * dt)
      s.x += s.vx * dt
      s.y += s.vy * dt
      if (s.x < 30 || s.x > W - 30) {
        s.x = Math.min(W - 30, Math.max(30, s.x))
        s.vx *= -0.3
      }
      if (s.y < 20) s.vy = Math.max(s.vy, 0)

      const groundY = Math.min(heightAt(world.pts, s.x - FOOT), heightAt(world.pts, s.x + FOOT))
      // engine blasts moon dust sideways when you're close to the ground
      if (up && groundY - s.y < 110) spawn(s.x, heightAt(world.pts, s.x), 2, 120)

      if (s.y >= groundY) {
        s.y = groundY
        const onPad = s.x - FOOT >= world.pad.x0 && s.x + FOOT <= world.pad.x1
        const soft = s.vy <= SAFE_VY && Math.abs(s.vx) <= SAFE_VX
        if (onPad && soft) {
          sfx('thud')
          setMode('landed')
          setMsg('')
          spawn(s.x, s.y, 14, 70)
          setTimeout(onWin, 2000)
        } else {
          sfx('crash')
          setMode('crashed')
          setMsg(!soft ? t.crashFast : t.crashRocky)
          setCrashes((c) => c + 1)
          spawn(s.x, s.y - 20, 30, 220)
          setTimeout(reset, 1700)
        }
      } else if (s.fuel === 0 && !msg) setMsg(t.empty)
    }

    // draw
    const tilt = mode === 'crashed' ? 35 : Math.max(-14, Math.min(14, s.vx * 0.35))
    lander.current?.setAttribute('transform', `translate(${s.x} ${s.y}) rotate(${tilt})`)
    const burning = mode === 'flying' && k.up && s.fuel > 0
    thrust(burning) // engine roar follows the flame
    flame.current?.setAttribute('transform', `translate(0 -14) scale(1 ${burning ? 0.85 + Math.random() * 0.4 : 0}) translate(0 14)`) // grow from the nozzle
    rcsL.current?.setAttribute('opacity', mode === 'flying' && k.right && s.fuel > 0 ? '0.9' : '0')
    rcsR.current?.setAttribute('opacity', mode === 'flying' && k.left && s.fuel > 0 ? '0.9' : '0')
    puffs.current = puffs.current.filter((p) => (p.life -= dt * 1.2) > 0)
    puffEls.current.forEach((el, i) => {
      const p = puffs.current[i]
      if (!el) return
      if (!p) return el.setAttribute('opacity', '0')
      p.vy += 30 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      el.setAttribute('cx', String(p.x))
      el.setAttribute('cy', String(p.y))
      el.setAttribute('r', String(4 + (1 - p.life) * 10))
      el.setAttribute('opacity', String(p.life * 0.6))
    })
    const height = Math.max(0, heightAt(world.pts, s.x) - s.y)
    if (hud.current.h) hud.current.h.textContent = `${Math.round(height / 4)} m`
    if (hud.current.v) {
      hud.current.v.textContent = `${(Math.max(0, s.vy) * M_PER_UNIT).toFixed(1)} m/s`
      hud.current.v.style.color = s.vy <= SAFE_VY ? '#3DDC97' : '#FF6B6B'
    }
    if (hud.current.fuel) {
      hud.current.fuel.style.width = `${s.fuel}%`
      hud.current.fuel.style.background = s.fuel > 30 ? '#FFC93C' : '#FF6B6B'
    }
  }, playing)

  // keyboard: ↑ / W / Space = thrust, ← → / A D = steer
  useEffect(() => {
    const map: Record<string, 'up' | 'left' | 'right'> = { ArrowUp: 'up', KeyW: 'up', Space: 'up', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' }
    const set = (on: boolean) => (e: KeyboardEvent) => {
      const k = map[e.code]
      if (!k) return
      e.preventDefault()
      keys.current[k] = on
    }
    const down = set(true)
    const up = set(false)
    addEventListener('keydown', down)
    addEventListener('keyup', up)
    return () => {
      removeEventListener('keydown', down)
      removeEventListener('keyup', up)
    }
  }, [])

  // the engine never keeps roaring after the game pauses or closes
  useEffect(() => {
    if (!playing) thrust(false)
    return () => thrust(false)
  }, [playing])

  const hold = (k: 'up' | 'left' | 'right') => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      keys.current[k] = true
    },
    onPointerUp: () => (keys.current[k] = false),
    onPointerCancel: () => (keys.current[k] = false),
    onLostPointerCapture: () => (keys.current[k] = false),
  })
  const terrainPath = `M0,${H} ` + world.pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L${W},${H} Z`
  const ridge = world.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')

  return (
    <div className="absolute inset-0 bg-[#02060F]">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="ll-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D2D3DB" />
            <stop offset="0.4" stopColor="#A6AABB" />
            <stop offset="1" stopColor="#5D6378" />
          </linearGradient>
          <linearGradient id="ll-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F7D774" />
            <stop offset="0.5" stopColor="#D9A93A" />
            <stop offset="1" stopColor="#9C6A1C" />
          </linearGradient>
          <linearGradient id="ll-flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF6C8" />
            <stop offset="0.45" stopColor="#FFB347" />
            <stop offset="1" stopColor="#FF6A2B" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="ll-earth" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#7DC1F7" />
            <stop offset="0.6" stopColor="#2F6FDB" />
            <stop offset="1" stopColor="#123275" />
          </radialGradient>
          <filter id="ll-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="#030814" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity="0.8" />
        ))}
        {/* Earth hangs in the black sky */}
        <g transform={`translate(${W * 0.82} ${H * 0.16})`}>
          <circle r="44" fill="#6FB8FF" opacity="0.3" filter="url(#ll-glow)" />
          <circle r="34" fill="url(#ll-earth)" />
          <path d="M-12,-26 c10,-4 18,4 14,12 c-4,6 -12,6 -14,14 c-8,-6 -10,-18 0,-26z" fill="#4FAF6A" />
          <path d="M0,-34 A34,34 0 0 1 0,34 A20,34 0 0 0 0,-34Z" fill="#030814" opacity="0.75" />
        </g>

        {/* terrain */}
        <path d={terrainPath} fill="url(#ll-ground)" />
        <path d={ridge} fill="none" stroke="#F0F1F6" strokeWidth="2" opacity="0.7" />
        {[0.1, 0.2, 0.86, 0.95].map((f) => (
          <ellipse key={f} cx={W * f} cy={heightAt(world.pts, W * f) + 30} rx="34" ry="7" fill="#8E93A8" opacity="0.7" />
        ))}
        {world.boulders.map((b) => (
          <g key={b.x}>
            <ellipse cx={b.x + b.r * 0.8} cy={b.y + 2} rx={b.r * 1.4} ry={b.r * 0.35} fill="#000" opacity="0.3" />
            <ellipse cx={b.x} cy={b.y - b.r * 0.55} rx={b.r} ry={b.r * 0.75} fill="#7D8299" />
            <ellipse cx={b.x - b.r * 0.3} cy={b.y - b.r * 0.85} rx={b.r * 0.4} ry={b.r * 0.25} fill="#C9CDD8" />
          </g>
        ))}

        {/* landing spot: blinking lights + label, flag goes up when you land */}
        <line x1={world.pad.x0} y1={world.pad.y + 1} x2={world.pad.x1} y2={world.pad.y + 1} stroke="#3DDC97" strokeWidth="3" strokeDasharray="8 7" opacity="0.8" />
        {[world.pad.x0, world.pad.x1].map((x) => (
          <circle key={x} cx={x} cy={world.pad.y - 4} r="4" fill="#3DDC97" className="motion-safe:animate-pulse" />
        ))}
        <text x={(world.pad.x0 + world.pad.x1) / 2} y={world.pad.y + 26} textAnchor="middle" fontSize="15" fontWeight="600" fill="#3DDC97">{t.pad}</text>
        <g transform={`translate(${world.pad.x1 - 14} ${world.pad.y})`} className="transition-transform duration-700" style={{ transform: `translate(${world.pad.x1 - 14}px, ${world.pad.y}px) scaleY(${mode === 'landed' ? 1 : 0})`, transformOrigin: '0 0' }}>
          <line x1="0" y1="0" x2="0" y2="-46" stroke="#E8EAF0" strokeWidth="2.5" />
          <line x1="0" y1="-45" x2="28" y2="-45" stroke="#E8EAF0" strokeWidth="1.5" />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x="1" y={-45 + i * 3.4} width="27" height="3.4" fill={i % 2 ? '#F4F4F6' : '#D8344A'} />
          ))}
          <rect x="1" y="-45" width="11" height="10" fill="#2D3E8C" />
        </g>

        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} ref={(el) => void (puffEls.current[i] = el)} r="5" fill="#D9DAE2" opacity="0" />
        ))}

        {/* the lunar module: gold descent stage, silver ascent stage, four legs */}
        <g ref={lander} transform={`translate(${ship.current.x} ${ship.current.y})`}>
          <g ref={flame} transform="scale(1 0)">
            <path d="M-8,-14 Q0,34 8,-14Z" fill="url(#ll-flame)" />
            <path d="M-4,-14 Q0,14 4,-14Z" fill="#FFF6C8" />
          </g>
          <g stroke="#C9CDD8" strokeWidth="3" strokeLinecap="round">
            <line x1="-14" y1="-22" x2="-24" y2="-2" />
            <line x1="14" y1="-22" x2="24" y2="-2" />
          </g>
          <ellipse cx="-25" cy="-1" rx="7" ry="2.2" fill="#C9CDD8" />
          <ellipse cx="25" cy="-1" rx="7" ry="2.2" fill="#C9CDD8" />
          <path d="M-6,-20 L6,-20 L8,-14 L-8,-14Z" fill="#6B7186" />
          <rect x="-18" y="-36" width="36" height="17" rx="2" fill="url(#ll-gold)" />
          <path d="M-12,-36 L-14,-50 L-6,-58 L8,-58 L14,-50 L12,-36Z" fill="#DADDE6" stroke="#8A90A6" strokeWidth="1.5" />
          <path d="M-6,-50 L0,-55 L5,-50Z" fill="#1B2440" />
          <line x1="8" y1="-58" x2="14" y2="-66" stroke="#C9CDD8" strokeWidth="1.5" />
          <circle cx="14" cy="-67" r="2.5" fill="#E8EAF0" />
          <circle ref={rcsL} cx="-19" cy="-46" r="5" fill="#fff" opacity="0" />
          <circle ref={rcsR} cx="19" cy="-46" r="5" fill="#fff" opacity="0" />
        </g>
      </svg>

      {/* HUD */}
      <div className="absolute inset-x-0 top-16 z-10 flex justify-center gap-2 px-2">
        <p className="rounded-xl bg-black/50 px-3 py-1.5 text-center backdrop-blur-sm">
          <span className="block text-[11px] font-semibold text-text-muted">{t.height}</span>
          <span ref={(el) => void (hud.current.h = el)} className="font-bold tabular-nums">0 m</span>
        </p>
        <p className="rounded-xl bg-black/50 px-3 py-1.5 text-center backdrop-blur-sm">
          <span className="block text-[11px] font-semibold text-text-muted">{t.speed}</span>
          <span ref={(el) => void (hud.current.v = el)} className="font-bold tabular-nums">0.0 m/s</span>
        </p>
        <div className="rounded-xl bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <span className="block text-center text-[11px] font-semibold text-text-muted">{t.fuel}</span>
          <div className="mt-1 h-3 w-24 overflow-hidden rounded-full bg-white/15 sm:w-32">
            <div ref={(el) => void (hud.current.fuel = el)} className="h-full rounded-full" style={{ width: '100%', background: '#FFC93C' }} />
          </div>
        </div>
      </div>

      <p aria-live="polite" className="absolute inset-x-4 top-36 z-10 mx-auto w-fit max-w-md rounded-full bg-black/55 px-4 py-1.5 text-center font-semibold text-cta empty:hidden">
        {msg || (crashes >= 2 && mode === 'flying' ? t.tip : '')}
      </p>

      {/* hold-to-fire controls (also: arrow keys / WASD / Space) */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 pb-6">
        <div className="flex gap-3">
          <button type="button" aria-label={t.left} {...hold('left')} className="grid h-16 w-16 place-items-center rounded-2xl bg-white/12 text-3xl ring-2 ring-white/25 backdrop-blur-sm active:scale-95 active:bg-white/25">◀</button>
          <button type="button" aria-label={t.right} {...hold('right')} className="grid h-16 w-16 place-items-center rounded-2xl bg-white/12 text-3xl ring-2 ring-white/25 backdrop-blur-sm active:scale-95 active:bg-white/25">▶</button>
        </div>
        <button type="button" {...hold('up')} className="h-20 min-w-36 rounded-3xl bg-cta px-6 text-xl font-bold text-on-cta shadow-[0_6px_0_var(--color-cta-edge)] active:translate-y-1 active:shadow-[0_2px_0_var(--color-cta-edge)]">
          {t.thrust}
        </button>
      </div>
    </div>
  )
}
