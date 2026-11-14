import { useEffect, useId, useRef, useState } from 'react'
import { sfx } from '../audio/engine'
import { en } from '../content/i18n/en'
import { useSound } from '../store/sound'

const t = en.sound

// One speaker button that opens two switches: Music and Sound effects. Device voices are never muted here.
export default function SoundButton({ className = '' }: { className?: string }) {
  const { music, effects, toggleMusic, toggleEffects } = useSound()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const panel = useId()

  // close on a tap outside or Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', onDown)
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('pointerdown', onDown)
      removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={box} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={t.button}
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => {
          sfx('tap')
          setOpen((o) => !o)
        }}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/40 text-text backdrop-blur-sm hover:bg-black/60 focus-visible:outline-3 focus-visible:outline-fact"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
          <path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor" />
          {music || effects ? (
            <path d="M13 7a4 4 0 0 1 0 6M15.5 4.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M13 7.5l5 5M18 7.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <div id={panel} className="absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl bg-navy-900/95 p-2 text-text shadow-2xl ring-1 ring-white/15 backdrop-blur-sm">
          <Switch label={t.music} on={music} onToggle={toggleMusic} />
          <Switch
            label={t.effects}
            on={effects}
            onToggle={() => {
              toggleEffects()
              sfx('pop') // only heard when effects just came back on
            }}
          />
        </div>
      )}
    </div>
  )
}

function Switch({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3 text-left font-semibold hover:bg-white/5 focus-visible:outline-3 focus-visible:outline-fact"
    >
      <span>{label}</span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-fact' : 'bg-white/20'}`} aria-hidden="true">
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-[left] ${on ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  )
}
