import { devices } from '../../content/devices'
import { useMedia } from '../../hooks/useMedia'
import { useProgress } from '../../store/progress'
import StoryView from './StoryView'
import SceneView from './SceneView'

// Same content, two layouts: Stories on phones, a game scene on wide screens (PROJECT_PLAN §7).
export default function Story() {
  const id = useProgress((s) => s.deviceId)
  const wide = useMedia('(min-width: 768px)')
  const device = id ? devices[id] : null
  if (!device) return null
  return wide ? <SceneView key={device.id} device={device} /> : <StoryView key={device.id} device={device} />
}
