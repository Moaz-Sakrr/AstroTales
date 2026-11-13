// The kid characters (boy "Tawad" and girl), cut from the design team's character sheets.
// Art lives in public/images/characters/<kind>/<pose>.webp (full body) and face-<mood>.webp (head).
export type Kind = 'boy' | 'girl'
export type Pose = 'stand' | 'threeq' | 'point' | 'think' | 'jump'
export type Mood = 'happy' | 'laugh' | 'surprised' | 'curious' | 'determined' | 'worried' | 'excited'

// [width, height] of each cutout in px, and how tall it is drawn in a 300-unit box.
// The sheets draw the action poses at a different scale than the turnaround, so drawn heights are set by eye
// to keep the kid the same size in every pose.
export const POSES: Record<Kind, Record<Pose, readonly [number, number, number]>> = {
  boy: { stand: [115, 294, 255], threeq: [115, 294, 255], point: [115, 193, 288], think: [120, 144, 190], jump: [157, 150, 215] },
  girl: { stand: [113, 288, 255], threeq: [128, 293, 255], point: [110, 206, 235], think: [110, 155, 175], jump: [104, 172, 215] },
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
