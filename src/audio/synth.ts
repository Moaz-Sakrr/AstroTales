// Every game sound as a tiny Web Audio recipe: a few oscillators or a burst of filtered noise.
// No files to download, and each one doubles as the fallback for a NASA clip that isn't in the repo yet.
// UI sounds stay under 250 ms and quiet; nothing harsh (a wrong answer is a soft "bonk", not a buzzer).

type Out = { ac: AudioContext; out: AudioNode; t: number }

let noise: AudioBuffer | null = null
// One second of white noise, shared by every noisy sound.
export function noiseBuffer(ac: BaseAudioContext) {
  if (noise && noise.sampleRate === ac.sampleRate) return noise
  noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return noise
}

// Gain envelope: quick rise to `peak`, exponential fade to silence at t + dur.
function envelope(c: Out, t: number, dur: number, peak: number, attack: number) {
  const g = c.ac.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  g.connect(c.out)
  return g
}

type ToneOpts = { f: number; to?: number; type?: OscillatorType; dur: number; gain: number; at?: number; attack?: number }
function tone(c: Out, { f, to, type = 'sine', dur, gain, at = 0, attack = 0.005 }: ToneOpts) {
  const t = c.t + at
  const osc = c.ac.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(f, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  osc.connect(envelope(c, t, dur, gain, attack))
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

type NoiseOpts = { f: number; to?: number; filter?: BiquadFilterType; q?: number; dur: number; gain: number; at?: number; attack?: number }
function hiss(c: Out, { f, to, filter = 'bandpass', q = 1, dur, gain, at = 0, attack = 0.005 }: NoiseOpts) {
  const t = c.t + at
  const src = c.ac.createBufferSource()
  src.buffer = noiseBuffer(c.ac)
  src.loop = true
  const bq = c.ac.createBiquadFilter()
  bq.type = filter
  bq.Q.value = q
  bq.frequency.setValueAtTime(f, t)
  if (to) bq.frequency.exponentialRampToValueAtTime(to, t + dur)
  src.connect(bq).connect(envelope(c, t, dur, gain, attack))
  src.start(t, Math.random() * 0.5)
  src.stop(t + dur + 0.05)
}

const notes = (c: Out, freqs: number[], step: number, o: Omit<ToneOpts, 'f' | 'at'>) => freqs.forEach((f, i) => tone(c, { ...o, f, at: i * step }))

export const RECIPES = {
  // --- UI ---
  tap: (c: Out) => tone(c, { f: 900, to: 620, type: 'triangle', dur: 0.06, gain: 0.12 }),
  pop: (c: Out) => tone(c, { f: 380, to: 900, dur: 0.09, gain: 0.22 }),
  swipe: (c: Out) => hiss(c, { f: 700, to: 2600, dur: 0.16, gain: 0.16, attack: 0.05 }),
  beep: (c: Out) => tone(c, { f: 880, dur: 0.16, gain: 0.18 }),
  go: (c: Out) => tone(c, { f: 1320, dur: 0.4, gain: 0.2 }),
  blip: (c: Out) => notes(c, [1200, 1800], 0.07, { dur: 0.06, gain: 0.13 }),
  scan: (c: Out) => tone(c, { f: 600, to: 1800, type: 'triangle', dur: 0.22, gain: 0.08 }),
  step: (c: Out) => hiss(c, { f: 420, filter: 'lowpass', dur: 0.06, gain: 0.18 }),
  locked: (c: Out) => notes(c, [220, 165], 0.1, { dur: 0.1, gain: 0.18 }),
  unlock: (c: Out) => {
    hiss(c, { f: 3000, filter: 'highpass', dur: 0.03, gain: 0.12 })
    notes(c, [660, 990], 0.08, { type: 'triangle', dur: 0.14, gain: 0.14 })
  },

  // --- feedback ---
  ding: (c: Out) => {
    tone(c, { f: 1568, dur: 0.24, gain: 0.15 })
    tone(c, { f: 2093, dur: 0.2, gain: 0.08, at: 0.05 })
  },
  coin: (c: Out) => notes(c, [988, 1319], 0.07, { type: 'triangle', dur: 0.15, gain: 0.1 }),
  bonk: (c: Out) => {
    tone(c, { f: 230, to: 140, dur: 0.18, gain: 0.22 })
    tone(c, { f: 340, to: 210, type: 'triangle', dur: 0.12, gain: 0.05 })
  },
  pling: (c: Out) => {
    tone(c, { f: 2093, dur: 0.2, gain: 0.1 })
    tone(c, { f: 3136, dur: 0.14, gain: 0.05, at: 0.04 })
  },
  ping: (c: Out) => tone(c, { f: 1760, dur: 0.24, gain: 0.16 }),
  stamp: (c: Out) => {
    hiss(c, { f: 900, filter: 'lowpass', dur: 0.08, gain: 0.35 })
    tone(c, { f: 160, to: 90, dur: 0.1, gain: 0.25 })
  },

  // --- cards ---
  rip: (c: Out) => hiss(c, { f: 1800, to: 3800, q: 0.7, dur: 0.32, gain: 0.25, attack: 0.02 }),
  flip: (c: Out) => {
    hiss(c, { f: 2500, to: 1200, q: 1.5, dur: 0.1, gain: 0.2 })
    hiss(c, { f: 2200, to: 1000, q: 1.5, dur: 0.1, gain: 0.16, at: 0.08 })
  },
  sparkle: (c: Out) => notes(c, [2637, 3520, 3136, 4186, 3951, 4699], 0.055, { dur: 0.25, gain: 0.05 }),
  fanfare: (c: Out) => {
    notes(c, [523, 659, 784], 0.12, { type: 'triangle', dur: 0.16, gain: 0.14 })
    tone(c, { f: 1047, type: 'triangle', dur: 0.7, gain: 0.15, at: 0.36 })
    tone(c, { f: 784, dur: 0.7, gain: 0.07, at: 0.36 })
    tone(c, { f: 659, dur: 0.7, gain: 0.06, at: 0.36 })
  },

  // --- flight + games ---
  whoosh: (c: Out) => hiss(c, { f: 300, to: 2400, q: 0.8, dur: 0.7, gain: 0.3, attack: 0.25 }),
  warp: (c: Out) => {
    tone(c, { f: 110, to: 1400, dur: 1.2, gain: 0.12, attack: 0.3 })
    hiss(c, { f: 200, to: 4000, q: 0.6, dur: 1.2, gain: 0.18, attack: 0.4 })
  },
  rumble: (c: Out) => {
    hiss(c, { f: 140, filter: 'lowpass', dur: 2.6, gain: 0.55, attack: 0.4 })
    tone(c, { f: 46, dur: 2.6, gain: 0.25, attack: 0.3 })
  },
  thud: (c: Out) => {
    tone(c, { f: 140, to: 45, dur: 0.35, gain: 0.45 })
    hiss(c, { f: 300, filter: 'lowpass', dur: 0.2, gain: 0.25 })
  },
  crash: (c: Out) => {
    hiss(c, { f: 2000, to: 200, filter: 'lowpass', dur: 0.9, gain: 0.45 })
    tone(c, { f: 90, to: 40, dur: 0.6, gain: 0.35 })
  },
  pew: (c: Out) => tone(c, { f: 1600, to: 220, type: 'triangle', dur: 0.22, gain: 0.16 }),
  brush: (c: Out) => hiss(c, { f: 1200, q: 0.6, dur: 0.09, gain: 0.1, attack: 0.03 }),
}

export type SfxName = keyof typeof RECIPES
