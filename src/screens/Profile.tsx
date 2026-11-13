import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import TopBar from '../components/TopBar'
import Button from '../components/Button'
import DeviceArt from '../components/art/DeviceArt'
import { IconCheck, IconLink } from '../components/icons'
import { devices } from '../content/devices'
import { en } from '../content/i18n/en'
import { useProgress } from '../store/progress'
import { sfx } from '../audio/sfx'

gsap.registerPlugin(useGSAP)
const t = en.profile
const nssdcaUrl = (id: string) => `https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=${id}`

// The envelope: the device's "social profile" with the real, sourced science.
export default function Profile() {
  const { deviceId, go } = useProgress()
  const device = deviceId ? devices[deviceId] : null
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLElement>(null)
  const { contextSafe } = useGSAP({ scope: root })

  const openEnvelope = contextSafe(() => {
    sfx.chest()
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOpen(true)
      return
    }
    gsap
      .timeline({ onComplete: () => setOpen(true) })
      .to('.js-flap', { rotationX: 180, duration: 0.45, ease: 'power2.in', transformOrigin: '50% 0%' })
      .to('.js-letter', { y: -120, duration: 0.45, ease: 'power2.out' })
      .to('.js-envelope', { opacity: 0, scale: 0.9, duration: 0.3 })
  })

  useGSAP(
    () => {
      if (!open) return
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.js-card', { y: 60, opacity: 0, duration: 0.6, ease: 'back.out(1.4)' })
        gsap.from('.js-row', { y: 20, opacity: 0, stagger: 0.06, duration: 0.4, delay: 0.3 })
      })
    },
    { scope: root, dependencies: [open] },
  )

  if (!device) return null

  return (
    <main ref={root} className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar onBack={() => go('map')} title={device.nickname} />

      {!open ? (
        <div className="relative z-10 flex flex-col items-center gap-6 px-4 pt-6">
          <p className="text-2xl font-bold">{t.envelope}</p>
          <button
            type="button"
            onClick={openEnvelope}
            className="js-envelope relative h-56 w-80 [perspective:800px] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact sm:h-64 sm:w-96"
            aria-label={t.open}
          >
            <div className="js-letter absolute inset-x-6 top-4 h-40 rounded-md bg-paper shadow" />
            <div className="airmail absolute inset-0 rounded-xl p-2 shadow-[0_24px_60px_rgb(0_0_0/0.45)]">
              <div className="h-full w-full rounded-lg bg-paper" />
            </div>
            <div className="js-flap absolute inset-x-0 top-0 h-1/2 origin-top [clip-path:polygon(0_0,100%_0,50%_100%)] bg-paper-flap" />
            <span className="absolute left-1/2 top-[40%] flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full bg-airmail-red ring-4 ring-cap-edge">
              <DeviceArt id={device.id} className="h-14 w-14" />
            </span>
            <span className="absolute inset-x-0 bottom-5 font-hand text-2xl text-ink">{t.open}</span>
          </button>
        </div>
      ) : (
        <div className="relative z-10 mx-auto max-w-3xl px-4 pb-10">
          <article className="js-card rounded-3xl bg-paper p-5 text-ink shadow-[0_24px_60px_rgb(0_0_0/0.45)] sm:p-8">
            {/* header */}
            <div className="js-row flex items-center gap-4">
              <span className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-navy-900 ring-4 ring-coin sm:h-24 sm:w-24">
                <DeviceArt id={device.id} className="h-16 w-16 sm:h-20 sm:w-20" />
                <span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full ring-4 ring-paper ${device.live ? 'bg-live' : 'bg-faint'}`} />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold sm:text-3xl">{device.nickname}</h1>
                <p className="truncate text-ink/70">@{device.handle}</p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-fact/20 px-2 py-0.5 text-xs font-semibold text-fact-ink">
                  <IconCheck className="h-3.5 w-3.5" /> {t.checked}
                </p>
              </div>
            </div>

            <p className="js-row mt-4 font-semibold">
              <span className={device.live ? 'text-live-ink' : 'text-ink/70'}>{device.live ? t.live : t.resting}:</span> {device.status.en}
            </p>
            <p className="js-row mt-2 font-hand text-2xl leading-snug">{device.bio.en}</p>

            {/* stats */}
            <dl className="js-row mt-5 grid grid-cols-3 gap-2 text-center">
              {device.stats.map((s) => (
                <div key={s.label.en} className="rounded-2xl bg-ink/5 px-2 py-3">
                  <dt className="sr-only">{s.label.en}</dt>
                  <dd className="text-xl font-bold sm:text-2xl">{s.value}</dd>
                  <dd className="text-xs text-ink/70 sm:text-sm">{s.label.en}</dd>
                </div>
              ))}
            </dl>

            {/* the science */}
            <h2 className="js-row mt-6 text-xl font-bold">{t.science}</h2>
            <p className="js-row text-sm text-ink/70">{t.storyNote}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {device.science.map((f) => (
                <li key={f.text.en} className="js-row flex flex-col gap-1 rounded-2xl bg-white/70 p-3 ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between">
                  <span>{f.text.en}</span>
                  <a href={f.source} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-1 self-start rounded-full px-2 text-sm font-semibold text-airmail-blue underline-offset-2 hover:underline sm:self-center">
                    {en.common.source} <IconLink />
                  </a>
                </li>
              ))}
            </ul>

            {/* where + ID + credits */}
            <dl className="js-row mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-ink/70">{t.where}</dt>
                <dd>{device.location.label}</dd>
              </div>
              {device.nssdcaId && (
                <div>
                  <dt className="font-semibold text-ink/70">{t.nssdca}</dt>
                  <dd>
                    <a href={nssdcaUrl(device.nssdcaId)} target="_blank" rel="noopener noreferrer" className="font-semibold text-airmail-blue underline">
                      {device.nssdcaId}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-ink/70">{t.credits}</dt>
                <dd>{device.credits.join(', ')}</dd>
              </div>
            </dl>
          </article>

          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={() => go('quiz')}>{t.toQuiz}</Button>
          </div>
        </div>
      )}
    </main>
  )
}
