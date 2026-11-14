export const SEEN_KEY = 'astrotales:intro-seen'

/** Play the intro only once per visit (tab session), never for reduced-motion users. */
export function shouldPlayIntro(): boolean {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  // dev testing links (?play=<deviceId>) jump straight to a mini-game
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('play')) return false
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true // storage blocked: still show it, it just may repeat on reload
  }
}
