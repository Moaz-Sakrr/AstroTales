// The kid characters (boy "Tawad" and girl), cut from the design team's character sheets.
// Art lives in public/images/characters/<kind>/<pose>.webp (full body) and face-<mood>.webp (head).
export type Kind = 'boy' | 'girl'
export type Pose = 'stand' | 'threeq' | 'point' | 'think' | 'jump'
export type Mood = 'happy' | 'laugh' | 'surprised' | 'curious' | 'determined' | 'worried' | 'excited'

// [width, height] of each cutout in px, and how tall it is drawn in a 300-unit box.
// Each pose was rendered at its own scale, so drawn heights are set from the helmet width
// to keep the kid the same size in every pose.
export const POSES: Record<Kind, Record<Pose, readonly [number, number, number]>> = {
  boy: { stand: [342, 900, 255], threeq: [333, 900, 264], point: [488, 900, 245], think: [589, 900, 180], jump: [811, 900, 212] },
  girl: { stand: [315, 900, 255], threeq: [304, 900, 272], point: [451, 900, 249], think: [595, 900, 158], jump: [831, 900, 206] },
}

export const poseSrc = (kind: Kind, pose: Pose) => `/images/characters/${kind}/${pose}.webp`
export const faceSrc = (kind: Kind, mood: Mood) => `/images/characters/${kind}/face-${mood}.webp`

// How the kid reacts to each of the four story cards.
export const REACTIONS: readonly { pose: Pose; mood: Mood }[] = [
  { pose: 'point', mood: 'surprised' }, // "That's me!"
  { pose: 'stand', mood: 'happy' },
  { pose: 'think', mood: 'curious' },
  { pose: 'jump', mood: 'excited' }, // ready for the quiz
]

// Fetch every image of one kid up front so a pose or mood change never flashes empty.
export function preloadCharacter(kind: Kind) {
  for (const pose of Object.keys(POSES[kind]) as Pose[]) new Image().src = poseSrc(kind, pose)
  for (const mood of ['happy', 'laugh', 'surprised', 'curious', 'determined', 'worried', 'excited'] as Mood[]) new Image().src = faceSrc(kind, mood)
}
