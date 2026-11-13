import { useCallback, useEffect, useRef, useState } from 'react'
import type { Device } from '../../content/types'
import { TYPE_MS_PER_CHAR } from '../../content/voice'
import { playVoice, stopVoice } from '../../audio/voice'
import { sfx } from '../../audio/sfx'
import { useProgress } from '../../store/progress'

// Shared logic for StoryView (phones) and SceneView (wide screens):
// which card we're on, how much of the line is typed, and voice playback.
export function useStory(device: Device) {
  const { muted, go } = useProgress()
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const card = device.story[index]
  const line = card.line.en
  const typing = typed < line.length
  const last = index === device.story.length - 1

  // Start the voice and the typewriter whenever the card changes.
  useEffect(() => {
    playVoice(card.audio.en, muted)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(line.length)
      return
    }
    setTyped(0)
    const timings = card.timings?.en
    const start = performance.now()
    timer.current = setInterval(() => {
      const elapsed = performance.now() - start
      // With ElevenLabs timings, show every character whose time has passed; otherwise type evenly.
      const n = timings ? timings.filter((ms) => ms <= elapsed).length : Math.floor(elapsed / TYPE_MS_PER_CHAR)
      setTyped(Math.min(n, line.length))
      if (n >= line.length) clearInterval(timer.current)
    }, 30)
    return () => clearInterval(timer.current)
    // muted is read once per card on purpose: toggling sound mid-line shouldn't restart the line.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, device.id])

  useEffect(() => () => stopVoice(), [])

  const finish = useCallback(() => go(device.miniGame ? 'mini' : 'profile'), [device.miniGame, go])

  // First tap finishes the line; the next tap moves on.
  const next = useCallback(() => {
    if (typing) {
      clearInterval(timer.current) // stop the typewriter so it can't overwrite the full line
      setTyped(line.length)
      return
    }
    sfx.tap()
    if (!last) setIndex((i) => i + 1)
    else finish()
  }, [typing, last, line.length, finish])

  const back = useCallback(() => {
    if (index > 0) {
      sfx.tap()
      setIndex((i) => i - 1)
    }
  }, [index])

  return { card, index, total: device.story.length, text: line.slice(0, typed), typing, last, next, back, finish }
}
