import { nasaClips, type NasaClip, type NasaClipId } from '../content/sounds'
import type { WorldId } from '../content/types'
import { useSound } from '../store/sound'
import { startTrack, type Track } from './music'
import { noiseBuffer, RECIPES, type SfxName } from './synth'

// One AudioContext for music + effects:  master → music bus / effects bus.
// Story voices play through Howler on their own and are never muted by the switches; they only duck the music.
// Browsers block sound until the kid's first tap, so the context is created on the first pointerdown / keydown.

export type { SfxName } from './synth'
export type { Track } from './music'

const MASTER = 0.8
const MUSIC = 0.55
const DUCKED = 0.25 // music level while a device is talking
// NASA recordings that play quietly under a world's music, once their file exists
const BEDS: Partial<Record<Track, NasaClipId>> = { mars: 'marsWind', deep: 'voyager' }

let ac: AudioContext | null = null
let musicBus: GainNode
let fxBus: GainNode
let ducked = false
let wanted: Track | null = null
let current: ReturnType<typeof startTrack> | null = null
let engine: { src: AudioBufferSourceNode; gain: GainNode } | null = null
const buffers = new Map<NasaClipId, AudioBuffer>()
const clipsPlaying = new Map<AudioBufferSourceNode, GainNode>()

const running = (): AudioContext | null => (ac && ac.state === 'running' ? ac : null)
const ramp = (p: AudioParam, v: number, tau = 0.15) => {
  const now = ac!.currentTime
  p.cancelScheduledValues(now)
  p.setTargetAtTime(v, now, tau)
}

function create() {
  ac = new AudioContext({ latencyHint: 'interactive' })
  const master = ac.createGain()
  master.gain.value = MASTER
  master.connect(ac.destination)
  musicBus = ac.createGain()
  fxBus = ac.createGain()
  musicBus.connect(master)
  fxBus.connect(master)
  applyLevels()
  // NASA files are static assets in /public; decode them now so they play without delay later
  for (const [id, clip] of Object.entries(nasaClips) as [NasaClipId, NasaClip][]) {
    if (!clip.file) continue
    fetch(clip.file)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
      .then((b) => ac!.decodeAudioData(b))
      .then((buf) => buffers.set(id, buf))
      .catch(() => {}) // missing or broken file: the synth fallback keeps playing
  }
}

function applyLevels() {
  if (!ac) return
  const { music, effects } = useSound.getState()
  ramp(musicBus.gain, music ? MUSIC * (ducked ? DUCKED : 1) : 0, 0.25)
  ramp(fxBus.gain, effects ? 1 : 0, 0.03)
  syncMusic()
}

// Plays the track the screen asked for, but only while music is on (no hidden generator burning CPU).
function syncMusic() {
  const target = useSound.getState().music && running() ? wanted : null
  if ((current?.track ?? null) === target) return
  current?.stop()
  current = null
  if (target) {
    const bed = BEDS[target]
    current = startTrack(ac!, musicBus, target, bed ? () => buffers.get(bed) : undefined)
  }
}

// Call once at startup.
export function initAudio() {
  const unlock = () => {
    if (!ac) create()
    // also brings back a context the phone suspended (call, lock screen, tab switch)
    if (ac!.state !== 'running') ac!.resume().then(syncMusic, () => {})
  }
  addEventListener('pointerdown', unlock, { capture: true })
  addEventListener('keydown', unlock, { capture: true })
  useSound.subscribe(applyLevels)
}

/** Plays a synth effect. `delay` in seconds. Silent before the first tap or with effects off. */
export function sfx(name: SfxName, delay = 0) {
  const ctx = running()
  if (!ctx || !useSound.getState().effects) return
  RECIPES[name]({ ac: ctx, out: fxBus, t: ctx.currentTime + 0.005 + delay })
}

/** A short phone buzz for game moments. Android only (iOS Safari has no vibrate); follows the effects switch. */
export function buzz(pattern: number | number[]) {
  if (useSound.getState().effects) navigator.vibrate?.(pattern)
}

/**
 * Plays a NASA recording, or `fallback` while its file isn't in the repo yet.
 * Returns how long the NASA clip lasts in seconds (0 if it didn't play).
 */
export function clip(id: NasaClipId, fallback?: SfxName, delay = 0) {
  const ctx = running()
  const buf = buffers.get(id)
  if (!ctx || !useSound.getState().effects) return 0
  if (!buf) {
    if (fallback) sfx(fallback, delay)
    return 0
  }
  const { volume = 1, start = 0, length = buf.duration - start } = nasaClips[id] as NasaClip
  const src = ctx.createBufferSource()
  src.buffer = buf
  const g = ctx.createGain()
  const t = ctx.currentTime + delay
  // short fades so a clip cut out of a longer recording doesn't click
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(volume, t + 0.01)
  g.gain.setValueAtTime(volume, t + Math.max(0.01, length - 0.05))
  g.gain.linearRampToValueAtTime(0, t + length)
  src.connect(g).connect(fxBus)
  src.onended = () => clipsPlaying.delete(src)
  clipsPlaying.set(src, g)
  src.start(t, start, length)
  return length
}

/** Loops a NASA recording until the returned function is called. Does nothing while the file is missing. */
export function loopClip(id: NasaClipId, volume = 0.4) {
  const ctx = running()
  const buf = buffers.get(id)
  if (!ctx || !buf) return () => {}
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.8)
  src.connect(g).connect(fxBus)
  src.start()
  return () => {
    ramp(g.gain, 0, 0.1)
    src.stop(ctx.currentTime + 0.5)
  }
}

/** Cuts any NASA clip still playing (e.g. a long launch recording when the kid skips ahead). */
export function stopClips() {
  const now = ac?.currentTime ?? 0
  for (const [src, g] of clipsPlaying) {
    g.gain.cancelScheduledValues(now)
    g.gain.setTargetAtTime(0, now, 0.08) // quick fade, no click
    src.stop(now + 0.4)
  }
  clipsPlaying.clear()
}

/** Picks the background track. `null` = silence. */
export function setMusic(track: Track | null) {
  wanted = track
  if (ac) syncMusic()
}

/** Lowers the music to ~25% while a device voice plays. */
export function duck(on: boolean) {
  if (ducked === on) return
  ducked = on
  applyLevels()
}

let ship: { stop: () => void } | null = null
/**
 * The ship's engines while it flies through space: a deep, steady rumble with a slow "breathing" hum.
 * Fades in when the flight starts and out when the ship arrives. Calling it twice with the same value does nothing.
 */
export function cruise(on: boolean) {
  const ctx = running()
  if (on && !ship && ctx) {
    const t = ctx.currentTime
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, t)
    out.gain.exponentialRampToValueAtTime(0.9, t + 0.8)
    out.connect(fxBus)
    // rumble: low-passed noise, open enough to be heard on laptop and phone speakers
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer(ctx)
    noise.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 520
    noise.connect(lp).connect(out)
    // hum: low tones, gently swelling (an LFO on their volume). 110/165 Hz carry on small speakers that can't play 55 Hz.
    const hum = ctx.createGain()
    hum.gain.value = 0.22
    const lfo = ctx.createOscillator()
    const depth = ctx.createGain()
    lfo.frequency.value = 0.35
    depth.gain.value = 0.1
    lfo.connect(depth).connect(hum.gain)
    const tones = [55, 110, 165].map((f) => {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = f
      o.connect(hum)
      return o
    })
    hum.connect(out)
    const nodes = [noise, lfo, ...tones]
    nodes.forEach((n) => n.start(t))
    ship = {
      stop() {
        const now = ctx.currentTime
        out.gain.cancelScheduledValues(now)
        out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), now)
        out.gain.exponentialRampToValueAtTime(0.0001, now + 1.2) // engines wind down as the ship arrives
        nodes.forEach((n) => n.stop(now + 1.3))
      },
    }
  } else if (!on && ship) {
    ship.stop()
    ship = null
  }
}

/** Lunar Lander engine: a looping rocket roar. Safe to call every frame; only changes start or stop it. */
export function thrust(on: boolean) {
  const ctx = running()
  if (on && !engine && ctx) {
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(ctx)
    src.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 480
    const gain = ctx.createGain()
    gain.gain.value = 0
    src.connect(lp).connect(gain).connect(fxBus)
    src.start()
    ramp(gain.gain, 0.35, 0.05)
    engine = { src, gain }
  } else if (!on && engine) {
    ramp(engine.gain.gain, 0, 0.06)
    engine.src.stop(engine.src.context.currentTime + 0.4)
    engine = null
  }
}

// Which track each screen plays. The world screens use that world's own track.
export function trackFor(screen: string, world: WorldId): Track | null {
  switch (screen) {
    case 'launch':
      return null // the countdown and the rocket carry this one
    case 'space':
      return 'space'
    case 'level':
    case 'story':
      return world
    case 'quiz':
    case 'mini':
    case 'card':
      return 'play'
    default:
      return 'home'
  }
}
