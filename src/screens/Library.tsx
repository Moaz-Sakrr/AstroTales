import Starfield from '../components/Starfield'
import Button from '../components/Button'
import DeviceCard from '../components/DeviceCard'
import CharacterFace from '../components/CharacterFace'
import { allDevices, worlds } from '../content/worlds'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'
import { useMedia } from '../hooks/useMedia'

const t = en.library

export default function Library() {
  const done = useGame((s) => s.done)
  const character = useGame((s) => s.character)
  const { go, open, back } = useGame.getState()
  const collected = allDevices.filter((d) => done.includes(d.id)).length
  const phone = !useMedia('(min-width: 640px)')
  // jump to a world's shelf; no smooth scroll for kids who asked for less motion
  const jump = (id: string) =>
    document.getElementById(`shelf-${id}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

  return (
    <main className="space-sky relative min-h-svh overflow-x-hidden px-4 py-5 sm:px-8">
      <Starfield />
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between">
        <Button variant="ghost" className="min-h-11 px-4 text-base" onClick={() => go(back === 'profile' ? 'level' : back)}>{t.back}</Button>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="flex min-w-16 items-center justify-end gap-2 font-semibold text-text-muted">
          <CharacterFace kind={character} mood={collected === allDevices.length ? 'excited' : 'happy'} className="h-10 w-10 ring-2 ring-cta" />
          {collected}/{allDevices.length}
        </p>
      </header>

      {/* phones: how far along you are + one tap to each world's shelf */}
      <div className="relative z-10 mt-5 sm:hidden">
        <div className="h-2.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label={t.progress(collected, allDevices.length)} aria-valuemin={0} aria-valuemax={allDevices.length} aria-valuenow={collected}>
          <div className="h-full rounded-full bg-cta" style={{ width: `${(collected / allDevices.length) * 100}%` }} />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {Object.values(worlds).map((w) => (
            <button key={w.id} type="button" onClick={() => jump(w.id)} className="min-h-11 shrink-0 rounded-full border-2 border-white/20 bg-white/5 px-4 font-semibold hover:bg-white/10">
              {w.name}
            </button>
          ))}
        </div>
      </div>

      {Object.values(worlds).map((w) => (
        <section key={w.id} id={`shelf-${w.id}`} className="relative z-10 mx-auto mt-7 max-w-5xl scroll-mt-4 sm:mt-8">
          <h2 className="mb-3 text-xl font-semibold sm:mb-4">{w.name}</h2>
          <ul className="grid grid-cols-3 gap-x-2 gap-y-3 sm:gap-4 lg:grid-cols-4">
            {[...w.levels, ...w.secrets].map((d) => (
              <li key={d.id} className="flex justify-center">
                {done.includes(d.id) ? (
                  <button type="button" onClick={() => open('profile', d.id)} className="rounded-[1.1em] transition hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact" aria-label={`${d.nickname}: open profile`}>
                    <DeviceCard device={d} size={phone ? 'xs' : 'sm'} />
                  </button>
                ) : (
                  // card back: you can see a slot is waiting, not what's in it
                  <div className="grid aspect-[955/1280] w-[104px] place-items-center rounded-[11px] border-2 border-dashed border-white/25 bg-navy-900/60 p-2 text-center text-sm text-faint sm:aspect-[5/7] sm:w-[162px] sm:p-3">
                    <div>
                      <span className="mb-1 block text-3xl font-bold text-white/30 sm:mb-2 sm:text-4xl">?</span>
                      {/* phones show just the name; the full sentence stays for screen readers */}
                      <span className="sm:hidden" aria-hidden="true">{d.secret ? t.secret : d.nickname}</span>
                      <span className="max-sm:sr-only">{d.secret ? t.secret : t.locked(d.nickname)}</span>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
