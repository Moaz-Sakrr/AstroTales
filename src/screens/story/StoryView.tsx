import type { Device } from '../../content/types'
import { en } from '../../content/i18n/en'
import { useProgress } from '../../store/progress'
import { IconButton } from '../../components/Button'
import Button from '../../components/Button'
import DeviceArt from '../../components/art/DeviceArt'
import { IconX } from '../../components/icons'
import StoryScene from './StoryScene'
import { useStory } from './useStory'

const t = en.story

// Phones (< 768px): Instagram-style Stories. Tap right = next, tap left = back.
export default function StoryView({ device }: { device: Device }) {
  const go = useProgress((s) => s.go)
  const s = useStory(device)
  const progress = (i: number) => (i < s.index ? 1 : i > s.index ? 0 : s.typing ? s.text.length / s.card.line.en.length : 1)

  return (
    <main className="fixed inset-0 overflow-hidden bg-navy-950">
      <StoryScene device={device} speaking={s.typing} pointer={s.card.scene?.pointer} beam={s.card.scene?.beam} layout="tall" />

      {/* progress bars */}
      <div className="absolute inset-x-3 top-3 z-20 flex gap-1.5" aria-hidden="true">
        {device.story.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress(i) * 100}%` }} />
          </div>
        ))}
      </div>

      {/* header: who is talking */}
      <div className="absolute inset-x-3 top-7 z-20 flex items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper ring-2 ring-coin">
          <DeviceArt id={device.id} className="h-9 w-9" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="font-bold">{device.nickname}</p>
          <p className="truncate text-sm text-text-muted">@{device.handle}</p>
        </div>
        <IconButton aria-label={en.common.home} onClick={() => go('map')}>
          <IconX />
        </IconButton>
      </div>

      {/* tap zones over the scene */}
      <button type="button" aria-label={en.common.back} onClick={s.back} className="absolute bottom-[34%] left-0 top-24 z-10 w-[30%]" />
      <button type="button" aria-label={en.common.next} onClick={s.next} className="absolute bottom-[34%] right-0 top-24 z-10 w-[70%]" />

      {/* caption panel */}
      <section className="absolute inset-x-0 bottom-0 z-20 rounded-t-3xl bg-paper px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-ink shadow-[0_-10px_40px_rgb(0_0_0/0.4)]" aria-live="polite">
        <p className="inline-block rounded-full bg-ink px-3 py-1 text-sm font-semibold text-paper">{s.card.kicker.en}</p>
        <button type="button" onClick={s.next} className="mt-2 block min-h-24 w-full text-left font-hand text-[1.7rem] leading-snug">
          <span className={s.typing ? 'typing-caret' : ''}>{s.text}</span>
        </button>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="whitespace-nowrap text-sm text-ink/60">{s.index + 1} / {s.total}</span>
          {s.last && !s.typing ? (
            <Button onClick={s.finish}>{device.miniGame ? t.toMission : t.toProfile}</Button>
          ) : (
            <span className="text-sm text-ink/60">{t.tapHint}</span>
          )}
        </div>
      </section>
    </main>
  )
}
