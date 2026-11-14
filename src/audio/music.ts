// Soft generated background music: a slow chord pad, plus an optional arpeggio, bass pulse and star "twinkles".
// Nothing to download. Each track loops its chords forever; the engine crossfades between tracks.

export type Track = 'home' | 'space' | 'moon' | 'mars' | 'deep' | 'play'

type Spec = {
  bpm: number
  chords: number[][] // MIDI notes, one chord per bar
  pad: OscillatorType
  cutoff: number // lowpass on the whole track: lower = darker, softer
  arpEvery?: number // play a chord note every N eighth notes (1 = eighths, 2 = quarters)
  bass?: boolean
  twinkle?: number // chance per beat of a high "star" ping
}

const SPECS: Record<Track, Spec> = {
  // warm and friendly: Cmaj7 · Am7 · Fmaj7 · G6
  home: { bpm: 72, chords: [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]], pad: 'triangle', cutoff: 1500, arpEvery: 2 },
  // wide open and slow, lots of air
  space: { bpm: 56, chords: [[50, 57, 64, 69], [48, 55, 62, 67], [46, 53, 62, 65], [48, 55, 60, 67]], pad: 'sine', cutoff: 1200, twinkle: 0.18 },
  // calm, a little mysterious: Em9 · Cmaj7 · Am9 · Bsus
  moon: { bpm: 60, chords: [[40, 47, 54, 59, 66], [36, 43, 52, 59], [45, 52, 59, 60, 64], [47, 54, 59, 64]], pad: 'triangle', cutoff: 1100, arpEvery: 4 },
  // dusty and low: Dm · Bb · Gm · A
  mars: { bpm: 58, chords: [[38, 50, 53, 57], [34, 50, 53, 58], [43, 50, 55, 58], [45, 49, 52, 57]], pad: 'sawtooth', cutoff: 650, arpEvery: 4 },
  // deep space: a slow drone that barely moves
  deep: { bpm: 46, chords: [[33, 45, 52, 59], [33, 45, 52, 57], [31, 43, 50, 57], [33, 45, 52, 59]], pad: 'sine', cutoff: 800, twinkle: 0.1 },
  // quiz + mini-games: brighter, a light pulse that keeps things moving
  play: { bpm: 104, chords: [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]], pad: 'triangle', cutoff: 2000, arpEvery: 1, bass: true },
}

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)
const LOOKAHEAD = 0.5 // s of music scheduled ahead of time
const TICK = 120 // ms between scheduler runs

// Starts `track` into `out`. `bed` may return a looping NASA recording (Mars wind, Voyager plasma) once it has loaded.
export function startTrack(ac: AudioContext, out: AudioNode, track: Track, bed?: () => AudioBuffer | undefined) {
  const spec = SPECS[track]
  const eighth = 30 / spec.bpm
  const bar = eighth * 8

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(1, ac.currentTime + 2) // fade in
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = spec.cutoff
  filter.connect(gain).connect(out)

  const voice = (f: number, type: OscillatorType, t: number, dur: number, peak: number, attack: number, detune = 0) => {
    const osc = ac.createOscillator()
    osc.type = type
    osc.frequency.value = f
    osc.detune.value = detune
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(filter)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }

  let step = 0 // eighth notes since the start
  let next = ac.currentTime + 0.1
  let bedSrc: AudioBufferSourceNode | null = null

  const schedule = () => {
    // a NASA bed joins as soon as its file is decoded
    const buf = !bedSrc && bed?.()
    if (buf) {
      bedSrc = ac.createBufferSource()
      bedSrc.buffer = buf
      bedSrc.loop = true
      const g = ac.createGain()
      g.gain.value = 0.6
      bedSrc.connect(g).connect(gain) // after the filter: keep the real recording's detail
      bedSrc.start()
    }
    while (next < ac.currentTime + LOOKAHEAD) {
      const chord = spec.chords[Math.floor(step / 8) % spec.chords.length]
      const inBar = step % 8
      if (inBar === 0) {
        // pad: two slightly detuned voices per note, overlapping into the next bar
        for (const n of chord) {
          voice(hz(n), spec.pad, next, bar * 1.25, 0.035, bar * 0.35, -6)
          voice(hz(n), spec.pad, next, bar * 1.25, 0.035, bar * 0.35, 6)
        }
      }
      if (spec.arpEvery && inBar % spec.arpEvery === 0) {
        const n = chord[(step / spec.arpEvery) % chord.length] + 12
        voice(hz(n), 'sine', next, eighth * 1.8, 0.05, 0.01)
      }
      if (spec.bass && inBar % 4 === 0) voice(hz(chord[0] - 12), 'triangle', next, eighth * 1.5, 0.12, 0.01)
      if (spec.twinkle && inBar % 2 === 0 && Math.random() < spec.twinkle) {
        voice(hz(chord[Math.floor(Math.random() * chord.length)] + 24), 'sine', next, 1.4, 0.03, 0.01)
      }
      step++
      next += eighth
    }
  }
  schedule()
  const id = setInterval(schedule, TICK)

  return {
    track,
    stop() {
      clearInterval(id)
      const now = ac.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2) // fade out, then let go
      bedSrc?.stop(now + 1.3)
      setTimeout(() => gain.disconnect(), 1500)
    },
  }
}
