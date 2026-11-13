import { useEffect, useState } from 'react'

// Reveals `text` one character at a time. `finish()` shows the whole line at once (tap to skip).
// shortcut: even speed; switch to ElevenLabs per-character timings once the voice files exist.
export function useTypewriter(text: string, msPerChar = 32) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(0)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setCount(text.length)
    const id = setInterval(() => setCount((c) => (c >= text.length ? c : c + 1)), msPerChar)
    return () => clearInterval(id)
  }, [text, msPerChar])
  return { shown: text.slice(0, count), done: count >= text.length, finish: () => setCount(text.length) }
}
