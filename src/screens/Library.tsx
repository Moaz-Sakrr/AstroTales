import Starfield from '../components/Starfield'
import Button from '../components/Button'
import DeviceCard from '../components/DeviceCard'
import CharacterFace from '../components/CharacterFace'
import { allDevices, worlds } from '../content/worlds'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'

const t = en.library

export default function Library() {
  const done = useGame((s) => s.done)
  const character = useGame((s) => s.character)
  const { go, open, back } = useGame.getState()
  const collected = allDevices.filter((d) => done.includes(d.id)).length

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

      {Object.values(worlds).map((w) => (
        <section key={w.id} className="relative z-10 mx-auto mt-8 max-w-5xl">
          <h2 className="mb-4 text-xl font-semibold">{w.name}</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...w.levels, ...w.secrets].map((d) => (
              <li key={d.id} className="flex justify-center">
                {done.includes(d.id) ? (
                  <button type="button" onClick={() => open('profile', d.id)} className="rounded-[1.1em] transition hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact" aria-label={`${d.nickname}: open profile`}>
                    <DeviceCard device={d} size="sm" />
                  </button>
                ) : (
                  // card back: you can see a slot is waiting, not what's in it
                  <div className="grid aspect-[5/7] w-[162px] place-items-center rounded-[11px] border-2 border-dashed border-white/25 bg-navy-900/60 p-3 text-center text-sm text-faint">
                    <div>
                      <span className="mb-2 block text-4xl font-bold text-white/30">?</span>
                      {d.secret ? t.secret : t.locked(d.nickname)}
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
