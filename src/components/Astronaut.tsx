import { POSES, poseSrc, type Kind, type Pose } from '../content/characters'

type Props = { kind?: Kind; pose?: Pose; x?: number; y?: number; width?: number; className?: string }

// The kid, from the design team's character art. Drawn on a 200×300 grid with the feet on the bottom edge,
// so callers can keep sizing it by width (height = 1.5 × width). Works as a standalone <svg> or nested in a scene.
export default function Astronaut({ kind = 'boy', pose = 'stand', x, y, width = 200, className }: Props) {
  const [w, h, drawH] = POSES[kind][pose]
  const drawW = (drawH * w) / h
  return (
    <svg x={x} y={y} width={width} height={width * 1.5} viewBox="0 0 200 300" className={className} style={{ overflow: 'visible' }} aria-hidden="true">
      <image href={poseSrc(kind, pose)} x={(200 - drawW) / 2} y={300 - drawH} width={drawW} height={drawH} />
    </svg>
  )
}
