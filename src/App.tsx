import { lazy, Suspense, type ComponentType } from 'react'
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

// three.js is big: only download it when the kid reaches space.
const Space = lazy(() => import('./screens/Space'))

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
  const Current = screens[screen]
  return (
    <Suspense fallback={<div className="grid min-h-svh place-items-center bg-navy-950 text-text-muted">Loading space…</div>}>
      <Current key={screen} />
    </Suspense>
  )
}
