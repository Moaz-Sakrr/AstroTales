import { faceSrc, type Kind, type Mood } from '../content/characters'

// Round head portrait showing one of the character's expressions.
export default function CharacterFace({ kind, mood, className = '' }: { kind: Kind; mood: Mood; className?: string }) {
  return <img src={faceSrc(kind, mood)} alt="" draggable={false} className={`rounded-full bg-navy-900 object-cover ${className}`} />
}
