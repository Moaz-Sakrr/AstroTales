import { useEffect, type ComponentType } from 'react'
import { useProgress, type Screen } from './store/progress'
import { setSfxMuted } from './audio/sfx'
import { setVoiceMuted, stopVoice } from './audio/voice'
import Landing from './screens/Landing'
import ChooseAstronaut from './screens/ChooseAstronaut'
import Launch from './screens/Launch'
import WorldMap from './screens/WorldMap'
import Story from './screens/story/Story'
import MiniGame from './screens/minigames/MiniGame'
import Profile from './screens/Profile'
import Quiz from './screens/Quiz'
import Reward from './screens/Reward'
import Cards from './screens/Cards'
import Wrapped from './screens/Wrapped'
import End from './screens/End'
import Credits from './screens/Credits'

// Screen switcher (no router) — docs/PROJECT_PLAN.md §10.4.
const SCREENS: Record<Screen, ComponentType> = {
  landing: Landing,
  avatar: ChooseAstronaut,
  launch: Launch,
  map: WorldMap,
  story: Story,
  mini: MiniGame,
  profile: Profile,
  quiz: Quiz,
  reward: Reward,
  cards: Cards,
  wrapped: Wrapped,
  end: End,
  credits: Credits,
}

export default function App() {
  const screen = useProgress((s) => s.screen)
  const muted = useProgress((s) => s.muted)
  const Current = SCREENS[screen]

  useEffect(() => {
    setSfxMuted(muted)
    setVoiceMuted(muted)
  }, [muted])

  // New screen: stop any voice line and start at the top.
  useEffect(() => {
    stopVoice()
    window.scrollTo(0, 0)
  }, [screen])

  return (
    <div key={screen} className="screen-in min-h-svh">
      <Current />
    </div>
  )
}
