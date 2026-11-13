import Starfield from '../../components/Starfield'
import TopBar from '../../components/TopBar'
import { devices } from '../../content/devices'
import { en } from '../../content/i18n/en'
import { useProgress } from '../../store/progress'
import LaserGame from './LaserGame'
import DustGame from './DustGame'

// One interactive science moment per device (PROJECT_PLAN §5, screen 6).
export default function MiniGame() {
  const { deviceId, go } = useProgress()
  const device = deviceId ? devices[deviceId] : null
  if (!device?.miniGame) return null
  const title = device.miniGame === 'laser' ? en.laser.title : en.dust.title
  const sub = device.miniGame === 'laser' ? en.laser.sub : en.dust.sub
  const done = () => go('profile')

  return (
    <main className="space-sky relative min-h-svh overflow-hidden">
      <Starfield />
      <TopBar onBack={() => go('story')} title={title} showCards={false} />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 pb-10">
        <p className="text-center text-lg text-text-muted">{sub}</p>
        {device.miniGame === 'laser' && <LaserGame onDone={done} />}
        {device.miniGame === 'dust' && <DustGame onDone={done} />}
      </div>
    </main>
  )
}
