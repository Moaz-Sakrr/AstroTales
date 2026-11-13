import Starfield from '../components/Starfield'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import Astronaut from '../components/Astronaut'
import DeviceArt from '../components/art/DeviceArt'
import { devices } from '../content/devices'
import { worldOrder } from '../content/worlds'
import { suits } from '../content/suits'
import type { WorldId } from '../content/types'
import { en } from '../content/i18n/en'
import { masteredCount, useProgress } from '../store/progress'

const t = en.wrapped

// Shareable 9:16 summary. No account, no photo, no personal data beyond the optional first name.
export default function Wrapped() {
  const { visited, mastered, coins, name, character, suit, go } = useProgress()
  const worldsSeen = worldOrder.filter((w) => visited.some((id) => devices[id].world === w))
  // Personality = the world where the kid met the most machines (ties go to the farther world).
  const fav: WorldId = worldOrder.reduce<WorldId>(
    (best, w) => (visited.filter((id) => devices[id].world === w).length >= visited.filter((id) => devices[id].world === best).length ? w : best),
    'moon',
  )

  const stats = [
    { value: visited.length, label: t.devices },
    { value: masteredCount(mastered), label: t.facts },
    { value: worldsSeen.length, label: t.worlds },
    { value: coins, label: t.coins },
  ]

  return (
    <main className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar onBack={() => go('map')} title={t.title} />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-4 pb-10">
        <article className="relative aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-[2rem] bg-linear-160 from-galaxy via-navy-700 to-navy-950 p-6 shadow-[0_24px_60px_rgb(0_0_0/0.5)] ring-2 ring-white/20">
          <p className="text-sm font-semibold uppercase tracking-widest text-coin">{en.landing.brand}</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight">{t.title}</h1>
          {name && <p className="font-hand text-3xl text-coin">{name}</p>}

          <div className="mt-4 grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-3">
                <p className="text-4xl font-bold leading-none">{s.value}</p>
                <p className="mt-1 text-sm text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex -space-x-3">
            {visited.map((id) => (
              <span key={id} className="flex h-12 w-12 items-center justify-center rounded-full bg-paper ring-2 ring-navy-900">
                <DeviceArt id={id} className="h-10 w-10" />
              </span>
            ))}
          </div>

          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-fact">{t.personality}</p>
          <p className="text-lg font-semibold leading-snug">{t.personalities[fav]}</p>

          <div className="absolute -bottom-4 right-2 w-28">
            <Astronaut suit={suits[suit]} kind={character ?? 'boy'} emblem={suit} width={112} className="h-auto w-full" />
          </div>
        </article>

        <Button size="lg" className="mt-6" onClick={() => go('end')}>{t.finish}</Button>
      </div>
    </main>
  )
}
