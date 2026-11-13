import Starfield from '../components/Starfield'
import TopBar from '../components/TopBar'
import { IconLink } from '../components/icons'
import { SRC } from '../content/sources'
import { en } from '../content/i18n/en'
import { useProgress } from '../store/progress'

const t = en.credits

export default function Credits() {
  const go = useProgress((s) => s.go)
  return (
    <main className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar onBack={() => go('end')} title={t.title} showCards={false} />
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-3 px-4 pb-10 text-text-muted">
        <p>{t.team}</p>
        <p>{t.nasa}</p>
        <p>{t.fonts}</p>
        <p>{t.code}</p>
        <h2 className="mt-4 text-xl font-bold text-text">{t.sources}</h2>
        <ul className="flex flex-col gap-1">
          {Object.values(SRC).map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 break-all text-fact underline">
                {url.replace(/^https:\/\//, '')} <IconLink />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
