import { useState } from 'react'
import Button from '../components/Button'
import Astronaut from '../components/Astronaut'
import DeviceModel from '../components/DeviceModel'
import { deviceById, worlds } from '../content/worlds'
import { tx } from '../content/l10n'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'

const t = en.profile
const coord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? pos : neg}`

// The device's "social media account": real NASA photos + sourced science.
export default function Profile() {
  const device = deviceById[useGame((s) => s.deviceId)]
  const { go, back, playDevice, character } = useGame.getState()
  const [tab, setTab] = useState<'photos' | 'science' | 'model'>('photos')
  const d = device
  const tabs: ('photos' | 'science' | 'model')[] = d.model3d ? ['photos', 'science', 'model'] : ['photos', 'science']

  return (
    <main className="min-h-svh bg-navy-950 pb-12">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-navy-950/90 px-3 py-2 backdrop-blur">
        <button type="button" onClick={() => go(back === 'profile' ? 'level' : back)} aria-label={t.back} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10">
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
        </button>
        <p className="font-semibold">@{d.handle}</p>
      </header>

      <div className="mx-auto max-w-2xl">
        <div className="relative h-36 bg-cover bg-center sm:h-48 sm:rounded-b-3xl" style={{ backgroundImage: `linear-gradient(transparent, rgb(8 21 43 / .6)), url(${worlds[d.world].texture})` }}>
          {/* the kid visiting the device */}
          <Astronaut kind={character} width={80} className="absolute bottom-2 right-4 sm:right-8" />
        </div>

        <section className="px-4">
          <div className="-mt-14 flex items-end justify-between gap-3">
            <img src={d.photos[0].src} alt={d.name} className="h-28 w-28 rounded-full object-cover ring-4 ring-navy-950" />
            <Button variant="ghost" className="mb-1 min-h-11 px-4 text-base" onClick={() => playDevice(d.id)}>{t.replay}</Button>
          </div>

          <h1 className="mt-3 flex flex-wrap items-center gap-2 text-2xl font-bold">
            {d.nickname}
            <span className="inline-flex items-center gap-1 rounded-full bg-fact px-2.5 py-0.5 text-xs font-semibold text-navy-900">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
              {t.badge}
            </span>
          </h1>
          <p className="text-text-muted">@{d.handle}</p>
          <p className="text-sm text-faint">{d.name}</p>
          <p className="mt-3 text-lg leading-relaxed">{tx(d.bio)}</p>

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-muted">
            <li className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${d.active ? 'bg-[#3DDC97]' : 'bg-coin'}`} aria-hidden="true" />
              {tx(d.status)}
            </li>
            <li>
              {d.location.label}
              {d.location.lat !== undefined && d.location.lon !== undefined && ` (${coord(d.location.lat, 'N', 'S')}, ${coord(d.location.lon, 'E', 'W')})`}
            </li>
            <li>{t.joined(d.joined)}</li>
          </ul>

          <dl className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-surface/60 p-4 text-center">
            {d.stats.map((s) => (
              <div key={tx(s.label)} className="flex flex-col-reverse">
                <dt className="text-xs text-text-muted">{tx(s.label)}</dt>
                <dd className="text-2xl font-bold text-cta">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div role="tablist" className="mt-6 flex border-b border-white/10">
          {tabs.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`min-h-12 flex-1 font-semibold ${tab === k ? 'border-b-4 border-cta text-text' : 'text-text-muted hover:text-text'}`}
            >
              {t[k]}
            </button>
          ))}
        </div>

        {tab === 'model' ? (
          <DeviceModel device={d} className="h-[65svh] p-4" />
        ) : tab === 'photos' ? (
          <ul className="grid gap-4 p-4 sm:grid-cols-2">
            {d.photos.map((p) => (
              <li key={p.src} className="overflow-hidden rounded-2xl bg-surface/60">
                <img src={p.src} alt={tx(p.caption)} className="aspect-square w-full object-cover" loading="lazy" />
                <div className="p-3">
                  <p className="leading-snug">{tx(p.caption)}</p>
                  <a href={p.source} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-fact underline underline-offset-2">
                    {p.credit}, images.nasa.gov
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-3 p-4">
            {d.science.map((f) => (
              <li key={tx(f.text)} className="rounded-2xl bg-surface/60 p-4">
                <p className="leading-relaxed">{tx(f.text)}</p>
                <a href={f.source} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-fact underline underline-offset-2">{t.source}</a>
              </li>
            ))}
            {d.nssdcaId && (
              <li className="px-1 text-sm text-text-muted">
                NSSDCA ID{' '}
                <a href={`https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=${d.nssdcaId}`} target="_blank" rel="noopener noreferrer" className="text-fact underline underline-offset-2">
                  {d.nssdcaId}
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
    </main>
  )
}
