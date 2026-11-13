import { Howl, Howler } from 'howler'
import { VOICE_FILES_READY } from '../content/voice'

// One voice line at a time. Howler handles the mobile audio unlock on the first tap (Launch screen).
let current: Howl | null = null

export function playVoice(src: string, muted: boolean, onEnd?: () => void) {
  stopVoice()
  if (!VOICE_FILES_READY || muted) return
  current = new Howl({ src: [src], html5: false, onend: onEnd, onloaderror: () => (current = null) })
  current.play()
}

export function stopVoice() {
  current?.stop()
  current?.unload()
  current = null
}

export function setVoiceMuted(muted: boolean) {
  Howler.mute(muted)
}
