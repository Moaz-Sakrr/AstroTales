import type { Device } from '../content/types'

// What each device does on its four story cards: says hi, talks, wonders, then cheers the kid into the quiz.
export type MascotPose = 'wave' | 'talk' | 'think' | 'happy' | 'surprised' | 'celebrate'
export const STORY_POSES: readonly MascotPose[] = ['wave', 'talk', 'think', 'happy']
const POSES: readonly MascotPose[] = ['wave', 'talk', 'think', 'happy', 'surprised', 'celebrate']

// Fetch every pose up front so a pose change never flashes empty.
export function preloadMascot(device: Device) {
  if (device.mascot) for (const p of POSES) new Image().src = `/images/mascots/${device.mascot}/${p}.webp`
}

// A device in the game: its character art (public/images/mascots/<mascot>/<pose>.webp) when it has one,
// otherwise its first NASA photo. The two need different fits, so each place passes a class for each.
export default function DeviceArt({ device, pose, photoClass = '', mascotClass = '', alt = '' }: { device: Device; pose: MascotPose; photoClass?: string; mascotClass?: string; alt?: string }) {
  const m = device.mascot
  return (
    <img
      src={m ? `/images/mascots/${m}/${pose}.webp` : device.photos[0].src}
      alt={alt}
      draggable={false}
      className={m ? `object-contain ${mascotClass}` : `object-cover ${photoClass}`}
    />
  )
}
