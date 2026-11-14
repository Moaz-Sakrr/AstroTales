import { Howl } from 'howler'
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import Astronaut from '../../components/Astronaut'
import Seismograph from '../../components/Seismograph'
import { quake, type Quake } from '../../components/quake'
import type { Pose } from '../../content/characters'
import { en } from '../../content/i18n/en'
import { useMedia } from '../../hooks/useMedia'
import { useRaf } from '../../hooks/useRaf'
import { useGame } from '../../store/progress'
import { useSound } from '../../store/sound'
import { duck } from '../../audio/engine'
import type { GameProps } from './MiniGame'

// Apollo 12, November 19, 1969, as a 3-step mission: power (hammer the stuck fuel loose, like Pete Conrad did),
// listen (place the seismometer, hop to test it), phone home (aim the antenna at Earth).
// Finale: the empty ascent stage crashes back and Rumble feels the first human-made moonquake.
// Facts: NSSDCA 1969-099C, and the ALSJ "Hit and Pull for Science" page for the hammer.

const t = en.mini.station
const VO = '/audio/en/rumble/game/' // Rumble's voice for every message (ElevenLabs)
type Stage = 'hammer' | 'fuel' | 'seismo' | 'stomp' | 'aim' | 'finale'
type Pt = { x: number; y: number }

const HITS = 5 // hammer taps to free the fuel
const STOMPS = 3 // big shakes needed
const BIG = 0.5 // shake size that counts as big (trace units, 0..1)
const LOCK = 6 // degrees from Earth that locks the antenna

// The scene is measured, not cropped: the viewBox matches the screen, and the props are arranged inside the free
// area (below the speech bubble, above the seismograph strip). Offsets are from the center (dx) and from the
// ground line just above the strip (dy). Portrait phones get the compact TALL arrangement.
const TALL = { minW: 356, minH: 330, horizon: -215, floor: -10, kidW: 96, earthR: 40, earthX: 20, crashX: 8, lm: [-100, -140, 0.7], rtg: [-10, -70], station: [88, -128], spot: [120, -30], kid: [-122, -12] } as const
const WIDE = { minW: 820, minH: 320, horizon: -199, floor: -14, kidW: 116, earthR: 44, earthX: 320, crashX: 360, lm: [-290, -117, 1], rtg: [-45, -79], station: [90, -95], spot: [245, -49], kid: [-165, -29] } as const
type Box = { w: number; h: number; x0: number; y0: number } // screen size + top-left corner of the free area, in px

function layout({ w, h, x0, y0 }: Box, stripPx: number) {
  const fw = w - x0
  const A = fw / (h - y0) > 1.15 ? WIDE : TALL
  const k = Math.max(0.2, Math.min(fw / A.minW, (h - y0 - stripPx) / A.minH)) // px per scene unit
  const cx = (x0 + fw / 2) / k
  const bot = (h - stripPx) / k
  const top = y0 / k
  const depth = Math.min(1.45, Math.max(1, (bot - top) / A.minH)) // tall phones: spread props back toward the horizon
  const horizon = bot + A.horizon * depth
  const sky = horizon - top
  const r = Math.max(16, Math.min(A.earthR, sky * 0.34))
  const at = ([dx, dy]: readonly number[]) => ({ x: cx + dx, y: bot + dy * depth })
  return {
    W: w / k,
    H: h / k,
    x0: x0 / k,
    cx,
    bot,
    horizon,
    floor: bot + A.floor,
    kidW: A.kidW,
    earth: { x: Math.min(cx + A.earthX, w / k - r - 14), y: top + sky * 0.46, r },
    lm: { ...at(A.lm), s: A.lm[2] },
    rtg: at(A.rtg),
    station: at(A.station),
    spot: at(A.spot),
    kid: at(A.kid),
    crash: { x: cx + A.crashX, y: horizon - 4 },
  }
}

const deg = (r: number) => (r * 180) / Math.PI
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)

// Tiny synth for feedback sounds. No files, no network; silently does nothing if audio is blocked.
let audio: AudioContext | null = null
function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, slideTo?: number) {
  if (!useSound.getState().effects) return // the sound button's effects switch
  try {
    audio ??= new AudioContext()
    const o = audio.createOscillator()
    const g = audio.createGain()
    const at = audio.currentTime
    o.type = type
    o.frequency.setValueAtTime(freq, at)
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, at + dur)
    g.gain.setValueAtTime(vol, at)
    g.gain.exponentialRampToValueAtTime(0.001, at + dur)
    o.connect(g).connect(audio.destination)
    o.start(at)
    o.stop(at + dur)
  } catch {
    /* no audio: the game still works */
  }
}

export default function StationSetup({ playing, onWin }: GameProps) {
  const root = useRef<HTMLDivElement>(null)
  const hud = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<Box>({ w: 375, h: 667, x0: 0, y0: 220 })
  // re-measure on resize/rotate; the bubble has a fixed height, so new messages never move the scene
  useLayoutEffect(() => {
    const measure = () => {
      const c = root.current!.getBoundingClientRect()
      const b = hud.current!.getBoundingClientRect()
      const side = b.height > c.height * 0.6 // short landscape: the bubble is a column on the left
      setBox({ w: c.width, h: c.height, x0: side ? b.right - c.left : 0, y0: side ? 56 : b.bottom - c.top })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root.current!)
    ro.observe(hud.current!)
    return () => ro.disconnect()
  }, [])
  const short = useMedia('(max-height: 500px) and (orientation: landscape)')
  const sm = useMedia('(min-width: 640px)')
  const L = layout(box, short ? 76 : sm ? 120 : 84) // strip height + its margins, matching the classes below
  const kind = useGame((s) => s.character)

  const cask = { x: L.lm.x + 66 * L.lm.s, y: L.lm.y - 70 * L.lm.s }
  const rtgTop = { x: L.rtg.x, y: L.rtg.y - 46 }
  const base = { x: L.station.x + 28, y: L.station.y - 98 } // antenna pivot
  const earthDeg = deg(Math.atan2(L.earth.y - base.y, L.earth.x - base.x))
  const folded = { x: L.station.x - 14, y: L.station.y + 34 }

  const [stage, setStage] = useState<Stage>('hammer')
  const [say, setSay] = useState<string>(t.say.hammer)
  const [hits, setHits] = useState(0)
  const [rod, setRod] = useState<Pt | null>(null) // null = in the can
  const [rodIn, setRodIn] = useState(false)
  const [seismo, setSeismo] = useState<Pt | null>(null) // null = folded by the station
  const [placed, setPlaced] = useState(false)
  const [drag, setDrag] = useState<'rod' | 'seismo' | 'antenna' | null>(null)
  const [kidOff, setKidOff] = useState<Pt | null>(null)
  const [pose, setPose] = useState<Pose>('stand')
  const [hops, setHops] = useState(0)
  const [hopping, setHopping] = useState(false)
  const [ripples, setRipples] = useState<(Pt & { id: number; big: boolean })[]>([])
  const [stomps, setStomps] = useState(0)
  const [aimed, setAngle] = useState<number | null>(null)
  const [launched, setLaunched] = useState(false)
  const [meteor, setMeteor] = useState<'off' | 'start' | 'fall' | 'boom'>('off')

  const svg = useRef<SVGSVGElement>(null)
  const watt = useRef<HTMLSpanElement>(null)
  const clock = useRef(0)
  const quakes = useRef<Quake[]>([])
  const power = useRef(0)
  const down = useRef<Pt | null>(null)
  const keys = useRef({ left: false, right: false })
  const lastBeep = useRef(0)
  const finale = useRef(false)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => void timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Rumble reads every message out loud; a new line cuts off the last one
  const voice = useRef<Howl | null>(null)
  const speak = (file: string) => {
    voice.current?.unload()
    voice.current = new Howl({ src: [`${VO}${file}.mp3`], onplay: () => duck(true), onend: () => duck(false) })
    voice.current.play()
  }
  const talk = (file: string, text: string) => {
    setSay(text)
    speak(file)
  }
  // how-to card before play, first instruction on start, mission recap when won (playing turns false again)
  useEffect(() => {
    voice.current?.unload()
    voice.current = new Howl({ src: [`${VO}${playing ? 'hammer' : finale.current ? 'win' : 'intro'}.mp3`], onplay: () => duck(true), onend: () => duck(false) })
    voice.current.play()
  }, [playing])
  useEffect(
    () => () => {
      voice.current?.unload()
      duck(false)
    },
    [],
  )

  const kid = kidOff ? { x: L.cx + kidOff.x, y: L.bot + kidOff.y } : L.kid
  const angle = aimed ?? (earthDeg < -90 ? -25 : -155) // start pointing away from Earth
  const powered = rodIn
  const live = placed // the seismograph only draws once the seismometer is on the ground
  const off = ((angle - earthDeg + 540) % 360) - 180
  const signal = Math.max(0, 1 - Math.abs(off) / 50)
  const locked = stage === 'finale'
  const shake = (amp: number, tau = 0.9, f = 7, rise = 0.03) => quakes.current.push(quake(amp, tau, f, rise))

  // ---- step 1: power ----
  const hit = () => {
    if (stage !== 'hammer') return
    tone(880, 0.08, 'square', 0.07)
    tone(1320, 0.06, 'triangle', 0.05)
    const n = hits + 1
    setHits(n)
    if (n < HITS) return talk(`bonk-${HITS - n}`, t.say.bonk(HITS - n))
    tone(520, 0.25, 'sine', 0.1, 1040)
    setPose('point')
    setStage('fuel')
    talk('loose', t.say.loose)
  }
  const insertRod = () => {
    if (stage !== 'fuel' || rodIn) return
    setDrag(null)
    setRod(rtgTop)
    later(() => {
      setRodIn(true)
      tone(70, 1.4, 'sawtooth', 0.08, 220)
      talk('powered', t.say.powered)
    }, 450)
    later(() => {
      setStage('seismo')
      setPose('stand')
      talk('seismo', t.say.seismo)
    }, 3400)
  }

  // ---- step 2: listen ----
  const placeSeismo = () => {
    if (stage !== 'seismo') return
    setDrag(null)
    setSeismo(L.spot)
    later(() => {
      setPlaced(true)
      tone(660, 0.12)
      later(() => tone(990, 0.2), 120)
      setStage('stomp')
      talk('stomp', t.say.stomp)
    }, 450)
  }
  const hop = (to: Pt) => {
    if (stage !== 'stomp' || hopping) return
    const land = { x: Math.min(L.W - 40, Math.max(L.x0 + 40, to.x)), y: Math.max(L.horizon + 40, Math.min(L.floor, to.y)) }
    setHopping(true)
    setPose('jump')
    setKidOff({ x: land.x - L.cx, y: land.y - L.bot })
    setHops((h) => h + 1)
    later(() => {
      setHopping(false)
      setPose('stand')
      const amp = Math.min(1, Math.max(0.08, 1.12 - dist(land, L.spot) / 250))
      const big = amp >= BIG
      shake(amp, 0.8, 6)
      tone(110, 0.3, 'sine', 0.25, 45)
      const id = clock.current
      setRipples((r) => [...r, { ...land, id, big }])
      later(() => setRipples((r) => r.filter((x) => x.id !== id)), 1000)
      if (!big) return talk('small', t.say.small)
      const n = stomps + 1
      setStomps(n)
      talk(n < STOMPS ? 'big' : 'big-done', n < STOMPS ? t.say.big : t.say.bigDone)
      if (n >= STOMPS)
        later(() => {
          setStage('aim')
          setPose('point')
          talk('aim', t.say.aim)
        }, 1600)
    }, 800)
  }

  // ---- step 3: phone home, then the finale ----
  const aim = (a: number) => {
    if (stage !== 'aim') return
    const d = ((a - earthDeg + 540) % 360) - 180
    setAngle(a)
    const now = clock.current
    if (now - lastBeep.current > 0.13) {
      lastBeep.current = now
      tone(240 + 760 * Math.max(0, 1 - Math.abs(d) / 50), 0.06, 'square', 0.035)
    }
    if (Math.abs(d) <= LOCK) lockOn()
  }
  const lockOn = () => {
    if (finale.current) return // pointer moves can arrive twice before the re-render
    finale.current = true
    setStage('finale')
    setDrag(null)
    keys.current = { left: false, right: false }
    setAngle(earthDeg)
    setPose('jump')
    talk('locked', t.say.locked)
    tone(660, 0.15)
    later(() => tone(880, 0.15), 140)
    later(() => tone(1320, 0.35), 280)
    later(() => {
      setPose('stand')
      setLaunched(true)
      shake(0.32, 1.4, 9, 0.2)
      tone(120, 2.4, 'sawtooth', 0.07, 50)
      talk('liftoff', t.say.liftoff)
    }, 3000)
    later(() => {
      setMeteor('start')
      talk('incoming', t.say.incoming)
    }, 6400)
    later(() => setMeteor('fall'), 6460)
    later(() => {
      setMeteor('boom')
      setPose('jump')
      shake(1.15, 6, 1.7, 0.9) // slow build, long ring: the Moon kept shaking long after the hit
      tone(70, 2, 'sawtooth', 0.22, 24)
      tone(42, 2.6, 'sine', 0.35, 20)
      talk('boom', t.say.boom)
    }, 7900)
    later(onWin, 12400)
  }

  // ---- input ----
  const toSvg = (e: PointerEvent): Pt => {
    const m = svg.current!.getScreenCTM()!.inverse()
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m)
    return { x: p.x, y: p.y }
  }
  const rodAt = rod ?? { x: cask.x + 10, y: cask.y - 26 }
  const seismoAt = seismo ?? folded

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (!playing) return
    const p = toSvg(e)
    down.current = p
    let d: typeof drag = null
    if (stage === 'hammer' && dist(p, cask) < 70) hit()
    else if (stage === 'fuel' && dist(p, rodAt) < 60) d = 'rod'
    else if (stage === 'seismo' && dist(p, seismoAt) < 60) d = 'seismo'
    else if (stage === 'aim') {
      d = 'antenna'
      aim(deg(Math.atan2(p.y - base.y, p.x - base.x)))
    } else if (stage === 'stomp') hop(p)
    if (!d) return
    setDrag(d)
    svg.current!.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag) return
    const p = toSvg(e)
    if (drag === 'rod') setRod(p)
    else if (drag === 'seismo') setSeismo(p)
    else aim(deg(Math.atan2(p.y - base.y, p.x - base.x)))
  }
  const onUp = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag) return
    const p = toSvg(e)
    const tap = down.current && dist(p, down.current) < 8 // a tap sends the part straight home
    if (drag === 'rod') {
      if (tap || dist(p, rtgTop) < 85) insertRod()
      else {
        setRod(null)
        talk('miss-fuel', t.say.missFuel)
      }
    } else if (drag === 'seismo') {
      if (tap || dist(p, L.spot) < 85) placeSeismo()
      else {
        setSeismo(null)
        talk('miss-seismo', t.say.missSeismo)
      }
    }
    setDrag(null)
  }
  // keyboard: Enter/Space does this step's action, arrows turn the antenna
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!playing) return
    const action = e.key === 'Enter' || e.key === ' '
    if (action) e.preventDefault()
    if (action && stage === 'hammer') hit()
    else if (action && stage === 'fuel') insertRod()
    else if (action && stage === 'seismo') placeSeismo()
    else if (action && stage === 'stomp') hop({ x: L.spot.x - 70 - (hops % 3) * 18, y: L.spot.y + 20 })
    else if (stage === 'aim' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault()
      aim(angle + (e.key === 'ArrowRight' ? 3 : -3))
    }
  }
  const hold = (k: 'left' | 'right') => ({
    onPointerDown: () => (keys.current[k] = true),
    onPointerUp: () => (keys.current[k] = false),
    onPointerLeave: () => (keys.current[k] = false),
    onPointerCancel: () => (keys.current[k] = false),
    onKeyDown: (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && aim(angle + (k === 'right' ? 3 : -3)),
  })

  useRaf((dt) => {
    clock.current += dt
    if (stage === 'aim' && (keys.current.left || keys.current.right)) aim(angle + (keys.current.right ? 70 : -70) * dt)
    if (powered && power.current < 70) power.current = Math.min(70, power.current + dt * 45)
    if (watt.current) watt.current.textContent = `${Math.round(power.current)} W`
  }, playing)

  const tip = { x: base.x + Math.cos((angle * Math.PI) / 180) * 58, y: base.y + Math.sin((angle * Math.PI) / 180) * 58 }
  const beam = (len: number, spread: number) => {
    const a = (angle * Math.PI) / 180
    const sp = (spread * Math.PI) / 180
    return `M${tip.x},${tip.y} L${tip.x + Math.cos(a - sp) * len},${tip.y + Math.sin(a - sp) * len} L${tip.x + Math.cos(a + sp) * len},${tip.y + Math.sin(a + sp) * len}Z`
  }
  const steps = [
    { label: t.steps.power, done: powered, now: stage === 'hammer' || stage === 'fuel' },
    { label: t.steps.listen, done: stomps >= STOMPS, now: stage === 'seismo' || stage === 'stomp' },
    { label: t.steps.phone, done: locked, now: stage === 'aim' },
  ]

  return (
    <div ref={root} className={`absolute inset-0 overflow-hidden bg-[#02060F] ${meteor === 'boom' ? 'quake' : ''}`}>
      <svg
        ref={svg}
        viewBox={`0 0 ${L.W} ${L.H}`}
        preserveAspectRatio="xMidYMid meet"
        className={`absolute inset-0 h-full w-full focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-fact ${drag ? 'cursor-grabbing' : stage === 'aim' ? 'cursor-crosshair' : 'cursor-pointer'}`}
        tabIndex={0}
        role="application"
        aria-label={`${t.scene}. ${say}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      >
        <defs>
          <radialGradient id="ss-ocean" cx="0.35" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#5AA8F0" />
            <stop offset="0.55" stopColor="#2F6FDB" />
            <stop offset="1" stopColor="#173B8C" />
          </radialGradient>
          <linearGradient id="ss-shade" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0.45" stopColor="#08152B" stopOpacity="0" />
            <stop offset="1" stopColor="#08152B" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="ss-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C9CCD8" />
            <stop offset="0.5" stopColor="#A9AEC0" />
            <stop offset="1" stopColor="#7E849A" />
          </linearGradient>
          <linearGradient id="ss-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F7D774" />
            <stop offset="0.45" stopColor="#D9A93A" />
            <stop offset="1" stopColor="#A8741F" />
          </linearGradient>
          <linearGradient id="ss-foil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F4F6FB" />
            <stop offset="0.4" stopColor="#BFC5D3" />
            <stop offset="0.7" stopColor="#E6E9F1" />
            <stop offset="1" stopColor="#8E95A9" />
          </linearGradient>
          <radialGradient id="ss-heat">
            <stop offset="0" stopColor="#FFB45A" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FF5A3D" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ss-flash">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.35" stopColor="#FFE7B0" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FF9A3D" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ss-flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.4" stopColor="#FFD08A" />
            <stop offset="1" stopColor="#FF7A3D" stopOpacity="0" />
          </linearGradient>
          <clipPath id="ss-earth">
            <circle r="64" />
          </clipPath>
          <filter id="ss-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* stars */}
        {Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={(i * 137.5) % L.W} cy={(i * 71.3) % (L.horizon - 20)} r={0.6 + ((i * 7) % 10) / 9} fill="#FFF8E7" opacity={0.35 + ((i * 13) % 10) / 16} className={i % 9 ? undefined : 'twinkle'} />
        ))}

        {/* Earth: where the antenna has to point */}
        <g transform={`translate(${L.earth.x} ${L.earth.y}) scale(${L.earth.r / 64})`}>
          <circle r="80" fill="#6FB8FF" opacity={locked ? 0.7 : 0.3} filter="url(#ss-glow)" className={locked ? 'motion-safe:animate-pulse' : undefined} />
          <circle r="64" fill="url(#ss-ocean)" />
          <g clipPath="url(#ss-earth)">
            <path d="M-40,-50 C-20,-62 0,-40 -6,-20 C-10,0 -30,6 -34,26 C-46,10 -56,-22 -40,-50Z" fill="#4FAF6A" />
            <path d="M10,-30 C30,-42 56,-24 50,-4 C45,12 25,6 20,22 C8,10 -2,-14 10,-30Z" fill="#5DBB72" />
            <path d="M-10,38 C6,32 26,44 16,60 C0,66 -16,54 -10,38Z" fill="#E9D9A6" />
            <ellipse cx="-20" cy="-30" rx="26" ry="5" fill="#fff" opacity="0.7" transform="rotate(-18)" />
            <ellipse cx="18" cy="16" rx="30" ry="5" fill="#fff" opacity="0.6" transform="rotate(12)" />
            <circle r="64" fill="url(#ss-shade)" />
          </g>
          <circle r="64" fill="none" stroke="#BFE3FF" strokeWidth="1.5" opacity="0.5" />
        </g>

        {/* far hills, then the crash far away on the horizon */}
        <path d={`M-600 ${L.horizon + 20} C ${L.W * 0.2} ${L.horizon - 24} ${L.W * 0.55} ${L.horizon + 8} ${L.W * 0.78} ${L.horizon - 14} S ${L.W + 300} ${L.horizon} ${L.W + 600} ${L.horizon - 6} V ${L.H + 600} H -600Z`} fill="#8E93A8" />
        {meteor !== 'off' && meteor !== 'boom' && (
          <g
            style={{
              transform: `translate(${meteor === 'start' ? L.crash.x - 420 : L.crash.x}px, ${meteor === 'start' ? -80 : L.crash.y}px)`,
              transition: meteor === 'fall' ? 'transform 1.4s cubic-bezier(.4,0,1,1)' : 'none',
            }}
          >
            <line x1="0" y1="0" x2={-150} y2={-(L.crash.y + 80) * (150 / 420)} stroke="#FFD08A" strokeWidth="5" strokeLinecap="round" opacity="0.55" filter="url(#ss-glow)" />
            <line x1="0" y1="0" x2={-110} y2={-(L.crash.y + 80) * (110 / 420)} stroke="#FFF1D6" strokeWidth="2.5" strokeLinecap="round" />
            <circle r="5" fill="#fff" />
          </g>
        )}
        {meteor === 'boom' && (
          <g transform={`translate(${L.crash.x} ${L.crash.y})`}>
            <circle r="40" fill="url(#ss-flash)" className="burst" style={{ ['--burst' as string]: 5 }} />
            <ellipse rx="70" ry="14" fill="none" stroke="#FFF1D6" strokeWidth="3" className="burst" style={{ ['--burst' as string]: 4 }} />
            {[-1, 0, 1].map((i) => (
              <circle key={i} cx={i * 18} cy={-10} r="16" fill="#C9CCD8" opacity="0.8" className="puff" style={{ animationDelay: `${0.15 * (i + 1)}s` }} />
            ))}
          </g>
        )}

        {/* the ground we stand on */}
        <path d={`M-600 ${L.horizon + 40} C ${L.W * 0.25} ${L.horizon + 18} ${L.W * 0.6} ${L.horizon + 46} ${L.W + 600} ${L.horizon + 24} V ${L.H + 600} H -600Z`} fill="url(#ss-ground)" />
        {[
          [0.12, 0.78, 70, 14],
          [0.62, 0.9, 110, 20],
          [0.9, 0.7, 50, 10],
          [0.38, 0.66, 36, 7],
        ].map(([fx, fy, rx, ry]) => {
          const cx = L.W * fx
          const cy = L.horizon + (L.H - L.horizon) * fy
          return (
            <g key={fx}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#E4E6EE" opacity="0.6" />
              <ellipse cx={cx} cy={cy + ry * 0.25} rx={rx * 0.9} ry={ry * 0.78} fill="#959BB0" />
            </g>
          )
        })}
        {/* boot prints from the lander to the station */}
        {Array.from({ length: 9 }, (_, i) => {
          const u = (i + 1) / 10
          return <rect key={i} x={L.lm.x + (L.station.x - L.lm.x) * u} y={L.lm.y + 30 + (L.station.y - L.lm.y) * u + (i % 2 ? 5 : -5)} width="9" height="4.5" rx="2" fill="#8A90A6" />
        })}

        {/* Intrepid, the Apollo 12 lander */}
        <g transform={`translate(${L.lm.x} ${L.lm.y}) scale(${L.lm.s})`}>
          <ellipse cx="10" cy="8" rx="128" ry="12" fill="#000" opacity="0.22" />
          <g stroke="#C9CDD8" strokeWidth="4" strokeLinecap="round">
            <line x1="-54" y1="-52" x2="-96" y2="2" />
            <line x1="-38" y1="-44" x2="-96" y2="2" />
            <line x1="54" y1="-52" x2="96" y2="2" />
            <line x1="38" y1="-44" x2="96" y2="2" />
          </g>
          <ellipse cx="-98" cy="4" rx="16" ry="4.5" fill="#C9CDD8" />
          <ellipse cx="98" cy="4" rx="16" ry="4.5" fill="#C9CDD8" />
          <polygon points="-16,-44 16,-44 22,-30 -22,-30" fill="#6B7186" />
          <polygon points="-58,-100 58,-100 66,-90 66,-52 58,-42 -58,-42 -66,-52 -66,-90" fill="url(#ss-gold)" />
          <polyline points="-46,-90 -32,-80 -40,-66 -24,-56" stroke="#FFF2B0" strokeWidth="1.5" fill="none" opacity="0.6" />
          <polyline points="18,-94 30,-84 22,-72 38,-60" stroke="#FFF2B0" strokeWidth="1.5" fill="none" opacity="0.5" />
          {/* the fuel can, bolted to the side */}
          <g transform="translate(66 -70) rotate(-35)">
            <g key={`can${hits}`} className={stage === 'hammer' && hits ? 'can-rattle' : undefined}>
              <rect x="-9" y="-28" width="18" height="56" rx="7" fill="#3A4060" stroke="#8A90A6" strokeWidth="2" />
              <rect x="-9" y="-12" width="18" height="4" fill="#8A90A6" />
              <rect x="-9" y="10" width="18" height="4" fill="#8A90A6" />
            </g>
          </g>
          {/* ascent stage: flies home at the end */}
          <g style={{ transform: launched ? 'translateY(-1300px)' : 'none', transition: 'transform 3s cubic-bezier(.55,0,.9,.5)' }}>
            {launched && <path d="M-16,-100 L16,-100 L6,-20 L-6,-20Z" fill="url(#ss-flame)" className="motion-safe:animate-pulse" />}
            <polygon points="-48,-100 -54,-128 -38,-158 38,-158 54,-128 48,-100" fill="url(#ss-foil)" stroke="#7E849A" strokeWidth="1.5" />
            <polygon points="-38,-128 -24,-148 -16,-128" fill="#1B2440" />
            <polygon points="38,-128 24,-148 16,-128" fill="#1B2440" />
            <rect x="-10" y="-124" width="20" height="18" rx="2" fill="#7E849A" />
            <rect x="-60" y="-136" width="8" height="8" fill="#8E95A9" />
            <rect x="52" y="-136" width="8" height="8" fill="#8E95A9" />
            <line x1="30" y1="-158" x2="40" y2="-176" stroke="#C9CDD8" strokeWidth="2" />
            <circle cx="42" cy="-180" r="7" fill="#E6E9F1" stroke="#8E95A9" />
          </g>
        </g>

        {/* orange flat cables, like in the real photos */}
        <path d={`M${L.rtg.x + 14} ${L.rtg.y - 4} Q ${(L.rtg.x + L.station.x) / 2} ${L.rtg.y + 16} ${L.station.x - 36} ${L.station.y - 6}`} fill="none" stroke="#D9772E" strokeWidth="3" opacity="0.85" />
        {placed && <path d={`M${L.station.x + 36} ${L.station.y - 6} Q ${(L.station.x + L.spot.x) / 2} ${L.spot.y + 18} ${L.spot.x - 22} ${L.spot.y - 2}`} fill="none" stroke="#D9772E" strokeWidth="3" opacity="0.85" />}

        {/* nuclear battery (RTG): fins, and a hot glow once the fuel is in */}
        <g transform={`translate(${L.rtg.x} ${L.rtg.y})`}>
          {powered && <ellipse cy="-24" rx="58" ry="56" fill="url(#ss-heat)" className="motion-safe:animate-pulse" />}
          <ellipse cy="2" rx="40" ry="6" fill="#000" opacity="0.22" />
          {[-30, -22, 9, 17].map((x) => (
            <rect key={x} x={x} y="-44" width="13" height="40" rx="2" fill={powered ? '#B9876A' : '#8A90A6'} stroke="#5D6378" />
          ))}
          <rect x="-13" y="-48" width="26" height="46" rx="4" fill={powered ? '#7A5A4E' : '#5D6378'} />
          <ellipse cy="-48" rx="13" ry="4" fill="#2B2F45" />
          {stage === 'fuel' && !rodIn && <circle cy="-48" r="22" fill="none" stroke="#2EC4B6" strokeWidth="3" strokeDasharray="5 5" className="motion-safe:animate-pulse" />}
        </g>

        {/* central station + antenna */}
        <g transform={`translate(${L.station.x} ${L.station.y})`}>
          <ellipse cy="4" rx="64" ry="9" fill="#000" opacity="0.2" />
          <line x1="-30" y1="-8" x2="-34" y2="2" stroke="#8E95A9" strokeWidth="3" />
          <line x1="30" y1="-8" x2="34" y2="2" stroke="#8E95A9" strokeWidth="3" />
          <line x1="-36" y1="-44" x2="-36" y2="-98" stroke="#BFC5D3" strokeWidth="3" />
          <line x1="36" y1="-44" x2="36" y2="-98" stroke="#BFC5D3" strokeWidth="3" />
          <rect x="-42" y="-100" width="84" height="54" rx="2" fill="url(#ss-foil)" stroke="#fff" strokeWidth="1.5" opacity="0.95" />
          <path d="M-30 -86 L-6 -60 M4 -92 L26 -66" stroke="#fff" strokeWidth="2" opacity="0.6" />
          <rect x="-38" y="-40" width="76" height="32" rx="2" fill="url(#ss-foil)" stroke="#fff" strokeWidth="1.5" />
          {[-22, -10, 2].map((x, i) => (
            <circle key={x} cx={x} cy="-24" r="3.5" fill={powered ? '#3DDC97' : '#4E546B'} className={powered ? 'twinkle' : undefined} style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </g>
        {stage === 'aim' && <path d={beam(Math.max(L.W, L.H), 7)} fill={signal > 0.85 ? '#2EC4B6' : '#B9C4E0'} opacity={0.1 + signal * 0.3} />}
        {locked && <line x1={tip.x} y1={tip.y} x2={L.earth.x} y2={L.earth.y} stroke="#6BC8FF" strokeWidth="3" className="laser-pulse" />}
        <g transform={`translate(${base.x} ${base.y}) rotate(${angle + 90})`}>
          <line x1="0" y1="0" x2="0" y2="-58" stroke="#C9CDD8" strokeWidth="4" strokeLinecap="round" />
          {[-12, -22, -32, -42, -52].map((y) => (
            <path key={y} d={`M-7 ${y + 4} L7 ${y - 4}`} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          ))}
          {stage === 'aim' && <circle cy="-58" r="12" fill="none" stroke="#2EC4B6" strokeWidth="3" className="motion-safe:animate-pulse" />}
        </g>
        <circle cx={base.x} cy={base.y} r="5" fill="#8E95A9" />

        {/* seismometer: Rumble's ears */}
        {stage === 'seismo' && (
          <ellipse cx={L.spot.x} cy={L.spot.y} rx="44" ry="12" fill="#2EC4B6" fillOpacity="0.2" stroke="#2EC4B6" strokeWidth="3" strokeDasharray="7 6" className="motion-safe:animate-pulse" />
        )}
        <g
          style={{
            transform: `translate(${seismoAt.x}px, ${seismoAt.y}px) scale(${placed || seismo ? 1 : 0.8})`,
            transition: drag === 'seismo' ? 'none' : 'transform 0.45s cubic-bezier(.3,1.4,.5,1)',
          }}
        >
          {placed && <ellipse rx="40" ry="9" fill="url(#ss-foil)" stroke="#fff" />}
          {!placed && <ellipse cy="2" rx="22" ry="5" fill="#000" opacity="0.2" />}
          <rect x="-12" y="-34" width="24" height="32" rx="4" fill="url(#ss-foil)" stroke="#7E849A" strokeWidth="1.5" />
          <ellipse cy="-34" rx="12" ry="4" fill="#E6E9F1" stroke="#7E849A" />
          <circle cy="-20" r="3" fill={placed ? '#3DDC97' : '#4E546B'} className={placed ? 'twinkle' : undefined} />
          {stage === 'seismo' && !seismo && <circle cy="-18" r="30" fill="none" stroke="#2EC4B6" strokeWidth="3" strokeDasharray="5 5" className="motion-safe:animate-pulse" />}
        </g>

        {/* hammer + the stuck fuel rod */}
        {stage === 'hammer' && (
          <g transform={`translate(${cask.x} ${cask.y})`}>
            <circle r="40" fill="#2EC4B6" fillOpacity="0.12" stroke="#2EC4B6" strokeWidth="3" strokeDasharray="5 6" className={hits ? undefined : 'motion-safe:animate-pulse'} />
            <circle r="40" fill="none" stroke="#FFC93C" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(hits / HITS) * 251} 251`} transform="rotate(-90)" />
            <g transform="translate(20 -44)">
              <g key={`ham${hits}`} className={hits ? 'hammer-swing' : undefined}>
                <rect x="-3" y="0" width="6" height="40" rx="3" fill="#8A6A4A" transform="rotate(35)" />
                <rect x="-14" y="-8" width="28" height="12" rx="3" fill="#C9CDD8" stroke="#5D6378" transform="rotate(35)" />
              </g>
            </g>
            {hits > 0 && <path key={`spark${hits}`} className="burst" style={{ ['--burst' as string]: 1.6 }} d="M0,-14 L4,-4 L14,0 L4,4 L0,14 L-4,4 L-14,0 L-4,-4Z" fill="#FFF1D6" />}
          </g>
        )}
        {stage === 'fuel' && !rodIn && (
          <g
            style={{
              transform: `translate(${rodAt.x}px, ${rodAt.y}px) rotate(${rod ? 0 : -35}deg)`,
              transition: drag === 'rod' ? 'none' : 'transform 0.45s cubic-bezier(.3,1.3,.5,1)',
            }}
          >
            <circle r="30" fill="url(#ss-heat)" className="motion-safe:animate-pulse" />
            <rect x="-6" y="-24" width="12" height="44" rx="5" fill="#5D6378" stroke="#C9CDD8" strokeWidth="1.5" />
            <rect x="-3.5" y="-18" width="7" height="32" rx="3" fill="#FF9A3D" />
            <rect x="-2" y="-40" width="4" height="18" fill="#C9CDD8" />
            <rect x="-9" y="-44" width="18" height="6" rx="3" fill="#C9CDD8" />
          </g>
        )}

        {/* hop ripples */}
        {ripples.map((r) => (
          <ellipse key={r.id} cx={r.x} cy={r.y} rx={r.big ? 150 : 90} ry={r.big ? 34 : 20} fill="none" stroke={r.big ? '#2EC4B6' : '#E4E6EE'} strokeWidth="4" className="ripple" />
        ))}

        {/* the kid */}
        <g style={{ transform: `translate(${kid.x}px, ${kid.y}px)`, transition: 'transform 0.8s linear' }}>
          <ellipse rx="34" ry="7" fill="#000" opacity="0.25" />
          <g key={hops} className={hopping ? 'kid-hop' : undefined}>
            <Astronaut kind={kind} pose={pose} x={-L.kidW / 2} y={-L.kidW * 1.5} width={L.kidW} />
          </g>
        </g>
      </svg>

      {/* steps + what Rumble says (a column on the left on short landscape screens) */}
      <div
        ref={hud}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-2 px-3 pb-2 pt-[60px] sm:gap-3 sm:pt-16 short:inset-x-auto short:bottom-0 short:left-0 short:w-72 short:justify-center"
      >
        <ol className="flex items-center gap-1 sm:gap-2">
          {steps.map((s, i) => (
            <li key={s.label} className="flex items-center gap-1 sm:gap-2">
              {i > 0 && <span className={`h-0.5 w-3 sm:w-8 short:w-1.5! ${steps[i - 1].done ? 'bg-teal' : 'bg-white/25'}`} />}
              <span
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm transition sm:px-3 sm:text-sm short:px-2! short:text-xs! ${
                  s.done ? 'bg-teal text-navy-950' : s.now ? 'bg-cta text-on-cta' : 'bg-black/45 text-text-muted'
                }`}
              >
                {s.done ? '✓' : i + 1} {s.label}
              </span>
            </li>
          ))}
        </ol>

        <div key={say} className="relative w-full max-w-md animate-[pop_0.35s_cubic-bezier(.2,1.4,.4,1)] rounded-2xl bg-paper px-3.5 pb-1 pt-2 text-ink shadow-[0_6px_0_rgb(0_0_0/0.3)] sm:px-4 sm:pt-2.5">
          <p aria-live="polite" className="min-h-[2.5em] font-hand text-lg leading-tight sm:text-2xl">
            {say}
          </p>
          {/* fixed-height footer: same bubble size every step, so the scene never jumps */}
          <div className="flex h-11 items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-fact-ink">
            {stage === 'aim' ? (
              <>
                <button type="button" aria-label={t.left} {...hold('left')} className="pointer-events-auto grid h-11 w-14 place-items-center rounded-xl bg-ink text-2xl text-paper active:scale-95 focus-visible:outline-3 focus-visible:outline-fact">
                  ↺
                </button>
                <span className="flex items-end gap-1" aria-label={`${t.signal} ${Math.round(signal * 100)}%`}>
                  {t.signal}
                  {[1, 2, 3, 4, 5].map((b) => (
                    <span key={b} className={`w-2 rounded-sm transition-colors ${signal * 5 >= b - 0.3 ? 'bg-fact-ink' : 'bg-ink/20'}`} style={{ height: 4 + b * 4 }} />
                  ))}
                </span>
                <button type="button" aria-label={t.right} {...hold('right')} className="pointer-events-auto grid h-11 w-14 place-items-center rounded-xl bg-ink text-2xl text-paper active:scale-95 focus-visible:outline-3 focus-visible:outline-fact">
                  ↻
                </button>
              </>
            ) : (
              <>
                <span>Rumble</span>
                {stage === 'stomp' && <span>{t.bigShakes(stomps)}</span>}
                {(powered || stage === 'fuel') && stage !== 'stomp' && (
                  <span>
                    {t.power} <span ref={watt}>0 W</span>
                  </span>
                )}
              </>
            )}
          </div>
          <span className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 bg-paper" />
        </div>
      </div>

      {/* the seismograph strip */}
      <Seismograph
        quakes={quakes}
        live={live}
        band={stage === 'stomp' ? BIG : null}
        active={playing}
        label={`${t.strip} · ${live ? t.listening : t.off}`}
        className="absolute bottom-3 right-3 z-10 mx-auto max-w-3xl sm:bottom-4 short:bottom-3"
        canvasClassName="h-16 sm:h-24 short:h-14"
        style={{ left: box.x0 + 12 }}
      />
    </div>
  )
}
