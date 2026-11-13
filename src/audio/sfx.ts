// Tiny sound effects made with the Web Audio API, so we ship no extra files.
// The AudioContext is created on the first call, which always comes from a tap.

let ctx: AudioContext | null = null
let muted = false

export function setSfxMuted(m: boolean) {
  muted = m
}

function audio() {
  if (muted) return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

// One oscillator note with a quick fade-out.
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15, endFreq?: number) {
  const a = audio()
  if (!a) return
  const t0 = a.currentTime + start
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur)
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  o.connect(g).connect(a.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

// Filtered noise for rocket rumble and whooshes.
function noise(dur: number, vol = 0.2, from = 400, to = 80) {
  const a = audio()
  if (!a) return
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(from, a.currentTime)
  f.frequency.exponentialRampToValueAtTime(to, a.currentTime + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(vol, a.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start()
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.08),
  coin: () => {
    tone(988, 0, 0.09, 'square', 0.06)
    tone(1319, 0.08, 0.25, 'square', 0.06)
  },
  right: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle', 0.1)),
  wrong: () => tone(220, 0, 0.3, 'sawtooth', 0.06, 140),
  beep: () => tone(880, 0, 0.12, 'sine', 0.12),
  laser: () => tone(1800, 0, 0.35, 'sawtooth', 0.05, 300),
  whoosh: () => noise(0.7, 0.15, 2000, 200),
  rocket: () => noise(3.2, 0.35, 900, 60),
  unlock: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.35, 'triangle', 0.1)),
  chest: () => {
    noise(0.4, 0.15, 3000, 600)
    ;[784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.15 + i * 0.08, 0.4, 'sine', 0.08))
  },
}
