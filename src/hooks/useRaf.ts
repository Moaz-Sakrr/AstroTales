import { useEffect, useRef } from 'react'

// Calls `tick(dt, now)` every animation frame while `active`. dt is in seconds, capped so a
// background tab coming back doesn't teleport the game.
export function useRaf(tick: (dt: number, now: number) => void, active = true) {
  const ref = useRef(tick)
  ref.current = tick
  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      ref.current(Math.min((now - last) / 1000, 0.05), now)
      last = now
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])
}
