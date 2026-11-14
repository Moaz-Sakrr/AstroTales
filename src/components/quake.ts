// Shakes for Rumble's seismograph (see Seismograph.tsx). Times are in seconds on performance.now().
export type Quake = { t0: number; amp: number; tau: number; f: number; rise: number }
export const now = () => performance.now() / 1000
// A shake starting now: amp 0..1, rings down over `tau` seconds at `f` wiggles per second.
export const quake = (amp: number, tau = 0.9, f = 7, rise = 0.03): Quake => ({ t0: now(), amp, tau, f, rise })

// One seismometer reading: a quiet hum plus every shake so far, each ringing down on its own.
export function reading(s: number, quakes: Quake[]) {
  let v = 0.018 * Math.sin(s * 37) + 0.012 * Math.sin(s * 91 + 1)
  for (const q of quakes) {
    const u = s - q.t0
    if (u > 0 && u < q.tau * 8 + 1) v += q.amp * (1 - Math.exp(-u / q.rise)) * Math.exp(-u / q.tau) * Math.sin(u * q.f * 6.283)
  }
  return v
}
