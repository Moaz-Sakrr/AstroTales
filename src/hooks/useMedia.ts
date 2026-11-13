import { useSyncExternalStore } from 'react'

// True while the media query matches, e.g. useMedia('(min-width: 1024px)').
export function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const m = matchMedia(query)
      m.addEventListener('change', onChange)
      return () => m.removeEventListener('change', onChange)
    },
    () => matchMedia(query).matches,
  )
}
