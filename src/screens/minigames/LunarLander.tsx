import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { en } from '../../content/i18n/en'
import { useRaf } from '../../hooks/useRaf'
import type { GameProps } from './MiniGame'
import { buzz, sfx, thrust } from '../../audio/engine'
import { EagleArt, Scenery, heightAt, makeWorld } from './LunarScenery'

const t = en.mini.lander
// World units. Gravity is weak (the Moon!) and fuel is limited, like Armstrong's real landing.
const GRAVITY = 24
const THRUST = 60
const SIDE = 26
const DRIFT_DAMP = 0.3 // let go of the arrows and the "autopilot" slowly stops sideways drift (the real LM held its attitude)
const MAX_VX = 70
const BURN = 7 // fuel per second of main engine (~14 s of thrust: forgiving for 8-year-olds)
const SIDE_BURN = 4
const SAFE_VY = 42 // softest touchdown that counts as a landing
const SAFE_VX = 22
const M_PER_UNIT = 1 / 16 // shown speeds in m/s
const HUD_PX = 128 // screen px under the header + instruments, kept clear for the start
const DUST = 40

type Mode = 'flying' | 'landed' | 'crashed'
type Keys = { up: boolean; left: boolean; right: boolean }
type Puff = { x: number; y: number; vx: number; vy: number; life: number }

export default function LunarLander({ playing, onWin }: GameProps) {
  // The viewBox matches the play area exactly, so the scene always fills the screen (no black side bars).
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 375, h: 690 })
  useLayoutEffect(() => {
    const el = box.current!
    const measure = () => setSize({ w: el.clientWidth || 1, h: el.clientHeight || 1 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const wide = size.w >= size.h
  const W = wide ? 1000 : 480
  const k = W / size.w // world units per screen px
  const H = Math.round(size.h * k)
  const S = wide ? 1.15 : 1.35 // lander drawing scale: bigger on phones
  const FOOT = 25 * S // half the distance between the landing pads
  const world = useMemo(() => makeWorld(W, H, HUD_PX * k, H - (wide ? 70 : 80) * k, wide), [W, H, k, wide])

  // feet start low enough that the whole lander (~75 units tall) is below the instruments
  const ceiling = world.top + 80 * S
  const start = () => ({ x: W * 0.12, y: ceiling + 10, vx: 18, vy: 0, fuel: 100 })
  const ship = useRef(start())
  const keys = useRef<Keys>({ up: false, left: false, right: false })
  const [held, setHeld] = useState<Keys>({ up: false, left: false, right: false })
  const puffs = useRef<Puff[]>([])
  const el = useRef<{ [n: string]: SVGElement | HTMLElement | null }>({})
  const ref = (n: string) => (node: SVGElement | HTMLElement | null) => void (el.current[n] = node)
  const puffEls = useRef<(SVGCircleElement | null)[]>([])
  const [mode, setMode] = useState<Mode>('flying')
  const [msg, setMsg] = useState('')
  const [crashes, setCrashes] = useState(0)
  const [at, setAt] = useState({ x: 0, y: 0 }) // where the last landing or crash happened

  const reset = () => {
    ship.current = start()
    setMode('flying')
    setMsg('')
  }
  // a rotate changes the whole world: start the descent again
  useEffect(reset, [world]) // eslint-disable-line react-hooks/exhaustive-deps

  const spawn = (x: number, y: number, n: number, speed: number) => {
    for (let i = 0; i < n && puffs.current.length < DUST; i++)
      puffs.current.push({ x, y, vx: (Math.random() - 0.5) * speed * 2, vy: -Math.random() * speed * 0.5, life: 1 })
  }

  useRaf((dt) => {
    const s = ship.current
    const kk = keys.current
    const set = (n: string, a: string, v: string | number) => el.current[n]?.setAttribute(a, String(v))
    if (mode === 'flying') {
      const hasFuel = s.fuel > 0
      const up = kk.up && hasFuel
      const side = hasFuel ? (kk.right ? 1 : 0) - (kk.left ? 1 : 0) : 0
      s.vy += (GRAVITY - (up ? THRUST : 0)) * dt
      s.vx = side ? s.vx + side * SIDE * dt : s.vx * (1 - DRIFT_DAMP * dt)
      s.vx = Math.max(-MAX_VX, Math.min(MAX_VX, s.vx))
      s.fuel = Math.max(0, s.fuel - ((up ? BURN : 0) + (side ? SIDE_BURN : 0)) * dt)
      s.x += s.vx * dt
      s.y += s.vy * dt
      if (s.x < 30 || s.x > W - 30) {
        s.x = Math.min(W - 30, Math.max(30, s.x))
        s.vx *= -0.3
      }
      if (s.y < ceiling) s.vy = Math.max(s.vy, 0)

      const groundY = Math.min(heightAt(world.pts, s.x - FOOT), heightAt(world.pts, s.x + FOOT))
      // engine blasts moon dust sideways when you're close to the ground
      if (up && groundY - s.y < 120) spawn(s.x, heightAt(world.pts, s.x), 2, 120)

      if (s.y >= groundY) {
        s.y = groundY
        const onPad = s.x - FOOT >= world.pad.x0 && s.x + FOOT <= world.pad.x1
        const softY = s.vy <= SAFE_VY
        const softX = Math.abs(s.vx) <= SAFE_VX
        setAt({ x: s.x, y: s.y })
        if (onPad && softY && softX) {
          sfx('thud')
          buzz(40)
          setMode('landed')
          setMsg('')
          spawn(s.x, s.y, 16, 70)
          setTimeout(onWin, 2200)
        } else {
          sfx('crash')
          buzz(220)
          setMode('crashed')
          setMsg(!softY ? t.crashFast : !softX ? t.crashSide : t.crashRocky)
          setCrashes((c) => c + 1)
          spawn(s.x, s.y - 20, 30, 220)
          setTimeout(reset, 1900)
        }
      } else if (s.fuel === 0 && !msg) setMsg(t.empty)
    }

    // ---- draw ----
    const tilt = mode === 'crashed' ? 38 : Math.max(-14, Math.min(14, s.vx * 0.35))
    set('lander', 'transform', `translate(${s.x} ${s.y}) rotate(${tilt} 0 ${-35 * S}) scale(${S})`)
    const burning = mode === 'flying' && kk.up && s.fuel > 0
    thrust(burning) // engine roar follows the flame
    const flick = burning ? 0.85 + Math.random() * 0.45 : 0
    set('flame', 'transform', `translate(0 -13) scale(${burning ? 0.9 + Math.random() * 0.2 : 0} ${flick}) translate(0 13)`) // grows from the nozzle
    set('glow', 'opacity', burning ? 0.55 + Math.random() * 0.25 : 0)
    set('rcsL', 'opacity', mode === 'flying' && kk.right && s.fuel > 0 ? 0.95 : 0)
    set('rcsR', 'opacity', mode === 'flying' && kk.left && s.fuel > 0 ? 0.95 : 0)

    // shadow + drop line: where you'll touch down (green over the flat spot), sharper as you get close
    const below = heightAt(world.pts, s.x)
    const alt = Math.max(0, below - s.y)
    const near = 1 - Math.min(1, alt / 320)
    const overPad = s.x - FOOT >= world.pad.x0 && s.x + FOOT <= world.pad.x1
    set('shadow', 'cx', s.x)
    set('shadow', 'cy', below)
    set('shadow', 'rx', FOOT * (0.5 + 0.8 * near))
    set('shadow', 'opacity', mode === 'crashed' ? 0 : 0.12 + 0.3 * near)
    set('drop', 'x1', s.x)
    set('drop', 'x2', s.x)
    set('drop', 'y1', s.y + 4)
    set('drop', 'y2', below - 2)
    set('drop', 'stroke', overPad ? '#3DDC97' : '#FFFFFF')
    set('drop', 'opacity', mode === 'flying' && alt > 30 ? (overPad ? 0.8 : 0.3) : 0)

    puffs.current = puffs.current.filter((p) => (p.life -= dt * 1.1) > 0)
    puffEls.current.forEach((c, i) => {
      const p = puffs.current[i]
      if (!c) return
      if (!p) return c.setAttribute('opacity', '0')
      p.vy += 30 * dt
      p.vx *= 1 - 1.2 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      c.setAttribute('cx', String(p.x))
      c.setAttribute('cy', String(p.y))
      c.setAttribute('r', String(4 + (1 - p.life) * 12))
      c.setAttribute('opacity', String(p.life * 0.55))
    })

    // instruments: height, falling speed (with a green "gentle" zone) and fuel
    const vy = Math.max(0, s.vy)
    const danger = Math.max(vy / SAFE_VY, Math.abs(s.vx) / SAFE_VX) // 1 = edge of a safe landing
    const color = danger <= 1 ? '#3DDC97' : danger <= 1.5 ? '#FFC93C' : '#FF6B6B'
    const h = el.current.h
    if (h) h.textContent = `${Math.round(alt / 4)} m`
    const v = el.current.v as HTMLElement | null
    if (v) {
      v.textContent = `${(vy * M_PER_UNIT).toFixed(1)}`
      v.style.color = color
    }
    const needle = el.current.needle as HTMLElement | null
    if (needle) needle.style.left = `${Math.min(1, danger / 3) * 100}%`
    const fuel = el.current.fuel as HTMLElement | null
    if (fuel) {
      fuel.style.width = `${s.fuel}%`
      fuel.style.background = s.fuel > 30 ? '#FFC93C' : '#FF6B6B'
    }
  }, playing)

  const press = (key: keyof Keys, on: boolean) => {
    if (keys.current[key] === on) return
    keys.current[key] = on
    setHeld((h) => ({ ...h, [key]: on }))
  }
  // keyboard: ↑ / W / Space = thrust, ← → / A D = steer
  useEffect(() => {
    const map: Record<string, keyof Keys> = { ArrowUp: 'up', KeyW: 'up', Space: 'up', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' }
    const on = (v: boolean) => (e: KeyboardEvent) => {
      const key = map[e.code]
      if (!key) return
      e.preventDefault()
      press(key, v)
    }
    const down = on(true)
    const up = on(false)
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

  const hold = (key: keyof Keys) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      press(key, true)
    },
    onPointerUp: () => press(key, false),
    onPointerCancel: () => press(key, false),
    onLostPointerCapture: () => press(key, false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  })
  const pad = world.pad
  const steer = (on: boolean) =>
    `grid h-[72px] w-[72px] place-items-center transition-colors ${on ? 'bg-white/30 text-white' : 'text-white/85 active:bg-white/25'}`

  return (
    <div className={`absolute inset-0 bg-[#070D1C] ${mode === 'crashed' ? 'quake' : ''}`}>
      {/* phones: the scene stops above the control deck, so thumbs never cover the landing spot */}
      <div ref={box} className={`absolute inset-x-0 top-0 ${wide ? 'bottom-0' : 'bottom-[calc(7.5rem+env(safe-area-inset-bottom))]'}`}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="ll-flame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFF6C8" />
              <stop offset="0.4" stopColor="#FFB347" />
              <stop offset="1" stopColor="#FF5A2B" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="ll-glow">
              <stop offset="0" stopColor="#FFC56B" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FF7A3D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <Scenery world={world} />

          {/* bouncing arrow over the flat spot, until you land */}
          {mode !== 'landed' && (
            <g transform={`translate(${(pad.x0 + pad.x1) / 2} ${pad.y - 92})`}>
              <g className="bob">
                <rect x="-48" y="-46" width="96" height="28" rx="14" fill="#03060F" opacity="0.6" />
                <text y="-26" textAnchor="middle" fontSize="16" fontWeight="700" fill="#3DDC97">{t.pad}</text>
                <path d="M-14,-8 L0,8 L14,-8" fill="none" stroke="#3DDC97" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          )}

          {/* flag + a ring of light when you land */}
          <g style={{ transform: `translate(${pad.x1 - 16}px, ${pad.y}px) scaleY(${mode === 'landed' ? 1 : 0})`, transformOrigin: '0 0', transition: 'transform 0.7s cubic-bezier(.3,1.5,.5,1) 0.3s' }}>
            <line x1="0" y1="0" x2="0" y2="-50" stroke="#E8EAF0" strokeWidth="2.5" />
            {Array.from({ length: 5 }, (_, i) => (
              <rect key={i} x="1" y={-49 + i * 3.6} width="30" height="3.6" fill={i % 2 ? '#F4F4F6' : '#D8344A'} />
            ))}
            <rect x="1" y="-49" width="12" height="11" fill="#2D3E8C" />
          </g>
          {mode === 'landed' && (
            <g transform={`translate(${at.x} ${at.y})`}>
              <ellipse rx="60" ry="12" fill="none" stroke="#3DDC97" strokeWidth="4" className="ripple" />
              {[-1, -0.5, 0, 0.5, 1].map((d) => (
                <path key={d} d="M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2Z" transform={`translate(${d * 46} ${-70 - Math.abs(d) * -24})`} fill="#FFE27A" className="burst" style={{ ['--burst' as string]: 2.2, animationDelay: `${0.1 + Math.abs(d) * 0.15}s` }} />
              ))}
            </g>
          )}
          {mode === 'crashed' && <circle cx={at.x} cy={at.y - 20} r="26" fill="#FFB347" className="burst" style={{ ['--burst' as string]: 3 }} />}

          <line ref={ref('drop')} strokeWidth="2" strokeDasharray="4 7" strokeLinecap="round" opacity="0" />
          <ellipse ref={ref('shadow')} ry="5" fill="#000" opacity="0" />
          {Array.from({ length: DUST }, (_, i) => (
            <circle key={i} ref={(c) => void (puffEls.current[i] = c)} r="5" fill="#DDDFE7" opacity="0" />
          ))}

          {/* the lunar module */}
          <g ref={ref('lander')} transform={`translate(${ship.current.x} ${ship.current.y}) scale(${S})`}>
            <ellipse ref={ref('glow')} cy="4" rx="26" ry="30" fill="url(#ll-glow)" opacity="0" />
            <g ref={ref('flame')} transform="scale(0 0)">
              <path d="M-9,-13 Q0,36 9,-13Z" fill="url(#ll-flame)" />
              <path d="M-4.5,-13 Q0,12 4.5,-13Z" fill="#FFF8DC" />
            </g>
            <EagleArt />
            <ellipse ref={ref('rcsL')} cx="-25" cy="-51" rx="6" ry="2.6" fill="#fff" opacity="0" />
            <ellipse ref={ref('rcsR')} cx="25" cy="-51" rx="6" ry="2.6" fill="#fff" opacity="0" />
          </g>
        </svg>
      </div>

      {/* instruments */}
      <div className="pointer-events-none absolute inset-x-0 top-[60px] z-10 flex justify-center px-3">
        <div className="flex items-stretch gap-3 rounded-2xl bg-black/50 px-3 py-2 ring-1 ring-white/10 backdrop-blur-md sm:gap-5 sm:px-5">
          <p className="text-center">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-text-muted">{t.height}</span>
            <span ref={ref('h')} className="block text-lg font-bold tabular-nums leading-tight">0 m</span>
          </p>
          <div className="w-px bg-white/15" />
          <div className="text-center">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-text-muted">{t.speed}</span>
            <span className="block text-lg font-bold leading-tight">
              <span ref={ref('v')} className="tabular-nums">0.0</span> <span className="text-xs text-text-muted">m/s</span>
            </span>
            {/* green = gentle enough to land */}
            <div className="relative mx-auto mt-1 h-2 w-20 rounded-full bg-[linear-gradient(90deg,#3DDC97_0_33%,#FFC93C_33%_50%,#FF6B6B_50%)] sm:w-28">
              <span ref={ref('needle')} className="absolute -top-1 h-4 w-1.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_6px_rgb(0_0_0/0.6)]" style={{ left: '0%' }} />
            </div>
          </div>
          <div className="w-px bg-white/15" />
          <div className="flex flex-col items-center justify-center">
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              <svg viewBox="0 0 12 14" className="h-3 w-3" aria-hidden="true"><path d="M6 0C6 0 1 6 1 9a5 5 0 0 0 10 0C11 6 6 0 6 0z" fill="#FFC93C" /></svg>
              {t.fuel}
            </span>
            <div className="mt-1.5 h-3 w-16 overflow-hidden rounded-full bg-white/15 ring-1 ring-white/20 sm:w-28">
              <div ref={ref('fuel')} className="h-full rounded-full" style={{ width: '100%', background: '#FFC93C' }} />
            </div>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="absolute inset-x-4 top-[136px] z-10 mx-auto w-fit max-w-md animate-[pop_0.35s_ease-out] rounded-full bg-black/60 px-4 py-1.5 text-center font-semibold text-cta empty:hidden">
        {msg || (crashes >= 2 && mode === 'flying' ? t.tip : '')}
      </p>

      {/* control deck: hold to fire (also arrow keys / WASD / Space) */}
      <div
        className={`absolute inset-x-0 bottom-0 z-10 flex h-[calc(7.5rem+env(safe-area-inset-bottom))] items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] pb-[env(safe-area-inset-bottom)] ${
          wide ? 'pointer-events-none' : 'border-t border-white/10 bg-[linear-gradient(180deg,#0E1730,#070D1C)] shadow-[0_-8px_24px_rgb(0_0_0/0.4)]'
        }`}
      >
        <div className="pointer-events-auto flex overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/20 backdrop-blur-sm">
          <button type="button" aria-label={t.left} {...hold('left')} className={steer(held.left)}>
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true"><path d="M15 4L7 12l8 8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="w-px bg-white/20" />
          <button type="button" aria-label={t.right} {...hold('right')} className={steer(held.right)}>
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <button
          type="button"
          {...hold('up')}
          className={`pointer-events-auto flex h-[76px] min-w-40 items-center justify-center gap-2 rounded-3xl bg-cta px-6 text-xl font-bold text-on-cta transition-[transform,box-shadow] ${
            held.up ? 'translate-y-1 shadow-[0_2px_0_var(--color-cta-edge),0_0_28px_rgb(255_179_71/0.75)]' : 'shadow-[0_6px_0_var(--color-cta-edge)]'
          }`}
        >
          <svg viewBox="0 0 20 26" className={`h-7 w-6 ${held.up ? 'motion-safe:animate-pulse' : ''}`} aria-hidden="true">
            <path d="M10 1C10 1 3 9 3 15.5a7 7 0 0 0 14 0C17 9 10 1 10 1z" fill="#FF6A2B" />
            <path d="M10 10c0 0-3.5 4-3.5 7a3.5 3.5 0 0 0 7 0c0-3-3.5-7-3.5-7z" fill="#FFF0B3" />
          </svg>
          {t.thrust}
        </button>
      </div>
    </div>
  )
}
