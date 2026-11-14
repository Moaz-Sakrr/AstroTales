import { useEffect, useRef, useState } from 'react'
import { en } from '../content/i18n/en'
import { SEEN_KEY } from './introSeen'

const t = en.intro
const FADE_MS = 700 // each of the two fade steps

/*
  One file per screen shape, picked once when the intro opens. All H.264: hardware-decoded on every phone and laptop.
  - portrait (phones, tablets held upright): the vertical cut, 1080x1920
  - short landscape (a phone on its side): lighter 720p
  - everything else: 1080p
*/
function pickClip() {
  if (matchMedia('(orientation: portrait)').matches) return { src: '/video/intro-mobile.mp4', poster: '/video/intro-mobile-poster.jpg' }
  if (matchMedia('(max-height: 500px)').matches) return { src: '/video/intro-720.mp4', poster: '/video/intro-poster.jpg' }
  return { src: '/video/intro-1080.mp4', poster: '/video/intro-poster.jpg' }
}

/*
  Full-screen intro shown before the app.
  The site is NOT rendered while the video plays (its animations would steal frames and make the video stutter);
  `onLeave` tells App to mount it once the video starts fading.
  The videos end dark (black / deep purple), but the site is navy, so it leaves in two steps:
    1. 'settle': the video fades out while the backdrop eases from black to the site's navy.
    2. 'reveal': the whole navy layer fades away, showing the site.
  Starts muted, because browsers block autoplay with sound.
*/
export default function IntroVideo({ onLeave, onDone }: { onLeave: () => void; onDone: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = useState<'play' | 'settle' | 'reveal'>('play')
  const [muted, setMuted] = useState(true)
  const [clip] = useState(pickClip)

  const finish = () => setPhase((p) => (p === 'play' ? 'settle' : p))

  useEffect(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
    // autoplay can still be refused (e.g. phone battery saver): never leave the kid on a black screen
    // (it also rejects when no source can play, so a broken file can't block the site either)
    video.current?.play().catch(finish)
    // safety net if the video stalls on a slow connection
    const watchdog = setTimeout(finish, 15000)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish()
    addEventListener('keydown', onKey)
    return () => {
      clearTimeout(watchdog)
      removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (phase === 'play') return
    if (phase === 'settle') onLeave()
    const id = setTimeout(phase === 'settle' ? () => setPhase('reveal') : onDone, FADE_MS)
    return () => clearTimeout(id)
  }, [phase, onLeave, onDone])

  const leaving = phase !== 'play'

  return (
    <div
      role="dialog"
      aria-label={t.label}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      className={`fixed inset-0 z-[100] transition-[background-color,opacity] ease-out ${leaving ? 'bg-bg' : 'bg-black'} ${phase === 'reveal' ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <video
        ref={video}
        muted={muted}
        playsInline
        autoPlay
        preload="auto"
        src={clip.src}
        poster={clip.poster}
        onEnded={finish}
        onError={finish}
        aria-hidden="true"
        style={{ transitionDuration: `${FADE_MS}ms` }}
        className={`h-full w-full object-cover transition-opacity ease-out ${leaving ? 'opacity-0' : 'opacity-100'}`}
      />

      {!leaving && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            aria-label={muted ? t.soundOn : t.soundOff}
            aria-pressed={!muted}
            onClick={() => setMuted((m) => !m)}
            className="grid h-11 w-11 place-items-center rounded-full bg-black/55 text-text hover:bg-black/75 focus-visible:outline-3 focus-visible:outline-fact"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor" />
              {muted ? (
                <path d="M13 7.5l5 5M18 7.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M13 7a4 4 0 0 1 0 6M15.5 4.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              )}
            </svg>
          </button>
          <button
            type="button"
            onClick={finish}
            className="min-h-11 rounded-full bg-black/55 px-5 font-semibold text-text hover:bg-black/75 focus-visible:outline-3 focus-visible:outline-fact"
          >
            {t.skip}
          </button>
        </div>
      )}
    </div>
  )
}
