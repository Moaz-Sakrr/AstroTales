import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Starfield from '../components/Starfield'
import Button from '../components/Button'
import DeviceCard from '../components/DeviceCard'
import { deviceById } from '../content/worlds'
import { en } from '../content/i18n/en'
import { useGame } from '../store/progress'

gsap.registerPlugin(useGSAP)
const t = en.card

export default function CardReward() {
  const root = useRef<HTMLElement>(null)
  const device = deviceById[useGame((s) => s.deviceId)]
  const { go, open } = useGame.getState()

  useGSAP(
    () => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.timeline()
          .from('.js-card', { rotationY: 180, scale: 0.4, opacity: 0, duration: 1.1, ease: 'back.out(1.6)' })
          .from('.js-ray', { scale: 0, opacity: 0, duration: 0.8 }, 0.3)
          .from('.js-text', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, 0.8)
        gsap.to('.js-ray', { rotation: 360, duration: 40, repeat: -1, ease: 'none' })
      })
    },
    { scope: root },
  )

  return (
    <main ref={root} className="space-sky relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8 text-center">
      <Starfield />
      <div className="js-ray pointer-events-none absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 bg-[repeating-conic-gradient(rgb(255_201_60/0.12)_0_8deg,transparent_8deg_24deg)]" />
      <h1 className="js-text relative text-3xl font-bold tracking-tight sm:text-4xl">{t.earned(device.nickname)}</h1>
      <div className="js-card relative">
        <DeviceCard device={device} interactive />
      </div>
      <p className="js-text relative text-text-muted">{t.note}</p>
      <div className="js-text relative flex flex-wrap justify-center gap-3">
        <Button onClick={() => open('profile', device.id)}>{t.profile(device.nickname)}</Button>
        <Button variant="ghost" onClick={() => go('level')}>{t.map}</Button>
      </div>
    </main>
  )
}
