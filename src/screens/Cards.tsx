import { useState } from 'react'
import Starfield from '../components/Starfield'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import HoloCard from '../components/HoloCard'
import { IconLock } from '../components/icons'
import { allDeviceIds, devices } from '../content/devices'
import { worlds } from '../content/worlds'
import { en } from '../content/i18n/en'
import { useProgress } from '../store/progress'
import { sfx } from '../audio/sfx'

const t = en.cards

// The card library: every machine's collectible, earned by finishing its journey.
export default function Cards() {
  const { visited, go } = useProgress()
  const [open, setOpen] = useState<string | null>(null)
  const owned = allDeviceIds.filter((id) => visited.includes(id))

  return (
    <main className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar onBack={() => go('map')} title={t.title} showCards={false} />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-10">
        <p className="text-center text-lg text-text-muted">{t.sub(owned.length, allDeviceIds.length)}</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {allDeviceIds.map((id) => {
            const d = devices[id]
            const have = visited.includes(id)
            return have ? (
              <button
                key={id}
                type="button"
                onClick={() => { sfx.tap(); setOpen(id) }}
                className="rounded-[1.4rem] text-left transition hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact"
                aria-label={d.nickname}
              >
                <HoloCard device={d} />
              </button>
            ) : (
              <div key={id} className="flex aspect-[5/7] flex-col items-center justify-center gap-2 rounded-[1.4rem] border-2 border-dashed border-white/20 bg-navy-950/50 p-4 text-center">
                <IconLock className="h-8 w-8 text-faint" />
                <p className="font-semibold text-faint">{worlds[d.world].name.en}</p>
                <p className="text-sm text-faint">{t.empty}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* enlarged card */}
      {open && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-navy-950/85 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={devices[open].nickname} onClick={() => setOpen(null)}>
          <div className="w-[min(80vw,340px)]" onClick={(e) => e.stopPropagation()}>
            <HoloCard device={devices[open]} tilt />
          </div>
          <Button variant="ghost" onClick={() => setOpen(null)} autoFocus>{t.close}</Button>
        </div>
      )}
    </main>
  )
}
