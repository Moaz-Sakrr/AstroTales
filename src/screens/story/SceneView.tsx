import { useEffect } from 'react'
import type { Device } from '../../content/types'
import { en } from '../../content/i18n/en'
import { useProgress } from '../../store/progress'
import Button, { IconButton } from '../../components/Button'
import DeviceArt from '../../components/art/DeviceArt'
import { IconBack, IconNext, IconX } from '../../components/icons'
import StoryScene from './StoryScene'
import { useStory } from './useStory'

const t = en.story

// Wide screens (>= 768px): a game scene with a dialogue box. Next/Back buttons + Space / Arrow keys.
export default function SceneView({ device }: { device: Device }) {
  const go = useProgress((s) => s.go)
  const s = useStory(device)
  const { next, back } = s

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        next()
      }
      if (e.key === 'ArrowLeft') back()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [next, back])

  return (
    <main className="fixed inset-0 overflow-hidden bg-navy-950">
      <StoryScene device={device} speaking={s.typing} pointer={s.card.scene?.pointer} beam={s.card.scene?.beam} layout="wide" />

      <div className="absolute right-4 top-4 z-20">
        <IconButton aria-label={en.common.home} onClick={() => go('map')}>
          <IconX />
        </IconButton>
      </div>

      {/* dialogue box */}
      <section className="absolute inset-x-[6%] bottom-6 z-20 mx-auto flex max-w-5xl gap-5 rounded-3xl bg-paper p-5 text-ink shadow-[0_20px_60px_rgb(0_0_0/0.5)]" aria-live="polite">
        <div className="flex shrink-0 flex-col items-center">
          <span className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-navy-900 ring-4 ${s.typing ? 'ring-fact' : 'ring-coin'}`}>
            <DeviceArt id={device.id} className="h-20 w-20" />
          </span>
          <span className="-mt-3 rounded-full bg-coin px-3 py-0.5 text-sm font-bold text-on-cta">{device.nickname}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3">
            <p className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-paper">{s.card.kicker.en}</p>
            <span className="text-sm text-ink/60">{s.index + 1} / {s.total}</span>
          </div>
          <p className="mt-2 min-h-[4.5rem] font-hand text-3xl leading-snug">
            <span className={s.typing ? 'typing-caret' : ''}>{s.text}</span>
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm text-ink/60">{t.keysHint}</span>
            <div className="flex gap-2">
              <Button variant="paper" onClick={back} disabled={s.index === 0} aria-label={en.common.back}>
                <IconBack className="h-5 w-5" />
              </Button>
              {s.last && !s.typing ? (
                <Button onClick={s.finish}>{device.miniGame ? t.toMission : t.toProfile}</Button>
              ) : (
                <Button onClick={next}>
                  {en.common.next} <IconNext className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
