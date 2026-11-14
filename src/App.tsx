import { lazy, Suspense, useCallback, useEffect, useState, type ComponentType } from 'react'
import { useGame, type Screen } from './store/progress'
import Landing from './screens/Landing'
import Character from './screens/Character'
import Launch from './screens/Launch'
import LevelMap from './screens/LevelMap'
import Story from './screens/Story'
import Quiz from './screens/Quiz'
import MiniGame from './screens/minigames/MiniGame'
import CardReward from './screens/CardReward'
import Library from './screens/Library'
import Profile from './screens/Profile'
import { deviceById } from './content/worlds'
import { en } from './content/i18n/en'
import { setMusic, trackFor } from './audio/engine'
import IntroVideo from './components/IntroVideo'
import { shouldPlayIntro } from './components/introSeen'

// three.js is big: only download it when the kid reaches space.
const Space = lazy(() => import('./screens/Space'))
const ArView = lazy(() => import('./screens/ArView'))

// ?ar=<id> comes from the QR on a laptop. Only a known device with a model counts; anything else starts the app as normal.
const arParam = new URLSearchParams(location.search).get('ar')
const arDevice = arParam && Object.hasOwn(deviceById, arParam) && deviceById[arParam].model3d ? deviceById[arParam] : null

const screens: Record<Screen, ComponentType> = {
  home: Landing,
  character: Character,
  launch: Launch,
  space: Space,
  level: LevelMap,
  story: Story,
  quiz: Quiz,
  mini: MiniGame,
  card: CardReward,
  library: Library,
  profile: Profile,
}

export default function App() {
  const screen = useGame((s) => s.screen)
  const world = useGame((s) => s.world)
  const Current = screens[screen]
  // 'play': only the intro video is on screen; 'leave': it fades out over the freshly mounted site; 'off': gone.
  // AR links from the QR skip it.
  const [intro, setIntro] = useState<'play' | 'leave' | 'off'>(() => (!arDevice && shouldPlayIntro() ? 'play' : 'off'))
  const leaveIntro = useCallback(() => setIntro('leave'), [])
  const endIntro = useCallback(() => setIntro('off'), [])
  // background music follows the screen (and the world on the map + story); silent while the intro plays
  useEffect(() => setMusic(arDevice || intro === 'play' ? null : trackFor(screen, world)), [screen, world, intro])
  if (arDevice) {
    return (
      <Suspense fallback={<div className="grid min-h-svh place-items-center bg-navy-950 text-text-muted">{en.ar.loading}</div>}>
        <ArView device={arDevice} />
      </Suspense>
    )
  }
  return (
    <>
      {intro !== 'play' && (
        <Suspense fallback={<div className="grid min-h-svh place-items-center bg-navy-950 text-text-muted">Loading space…</div>}>
          <Current key={screen} />
        </Suspense>
      )}
      {intro !== 'off' && <IntroVideo onLeave={leaveIntro} onDone={endIntro} />}
    </>
  )
}
