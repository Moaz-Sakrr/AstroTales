// The look of each world's surface, shared by the landing and the level map. All static: callers only move wrappers.
import type { CSSProperties } from 'react'
import Starfield from '../../components/Starfield'
import type { WorldId } from '../../content/types'

type Look = {
  sky: string // CSS background of the sky
  stars: boolean
  ground: string // surface texture
  groundFilter?: string
  far: string // the ground's average colour, seen far away
  haze: string // colour of the air near the horizon
  rim: string // glow on the planet's edge, seen from orbit
  dust: string // "r g b" of the dust the engine kicks up
}

export const LOOK: Record<WorldId, Look> = {
  moon: {
    sky: 'linear-gradient(180deg,#02060F 0%,#08152B 100%)',
    stars: true,
    ground: '/textures/2k_moon.jpg',
    far: '#928D8F',
    haze: 'rgb(200 205 225 / 0.18)',
    rim: '0 0 0 2px rgb(230 232 245 / 0.5), 0 0 30px 8px rgb(200 210 255 / 0.25)',
    dust: '207 207 216',
  },
  mars: {
    // Mars by day: a butterscotch sky, dusky overhead
    sky: 'linear-gradient(180deg,#2B1B2E 0%,#7A4334 40%,#C9835A 75%,#EBB98C 100%)',
    stars: false,
    ground: '/textures/2k_mars.jpg',
    far: '#AD573E',
    haze: 'rgb(235 180 135 / 0.45)',
    rim: '0 0 0 3px rgb(255 190 140 / 0.55), 0 0 40px 14px rgb(230 140 90 / 0.45)',
    dust: '217 138 91',
  },
  deep: {
    // a dark, rocky asteroid under the Milky Way
    sky: 'url(/textures/2k_stars_milky_way.jpg) center / cover, #02060F',
    stars: true,
    ground: '/textures/2k_moon.jpg',
    far: '#928D8F',
    groundFilter: 'sepia(1) saturate(1.4) hue-rotate(-12deg) brightness(0.55)',
    haze: 'rgb(170 150 130 / 0.15)',
    rim: '0 0 0 2px rgb(200 180 160 / 0.35), 0 0 24px 6px rgb(160 140 120 / 0.2)',
    dust: '168 154 138',
  },
}

/** dust or smoke ball drawn with a gradient (no blur filter), in a world's dust colour */
export const dustBall = (rgb: string) => `radial-gradient(closest-side, rgb(${rgb} / 0.95) 0%, rgb(${rgb} / 0.7) 50%, rgb(${rgb} / 0) 100%)`

/** The world's sky with what you'd see in it: Earth over the Moon, a small pale Sun over Mars, the Milky Way out deep. */
export function Sky({ world, className = 'absolute inset-0' }: { world: WorldId; className?: string }) {
  const look = LOOK[world]
  return (
    <div className={className} style={{ background: look.sky }} aria-hidden="true">
      {look.stars && <Starfield />}
      {world === 'moon' && (
        <div className="absolute right-[12%] top-[13%] aspect-square w-[min(13vmin,90px)] overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_35%,#A9D8FF,#2F6FDB_55%,#0E2E6E)] shadow-[0_0_20px_5px_rgb(120_180_255/0.35)]">
          <div className="absolute left-[18%] top-[30%] h-[30%] w-[40%] rounded-[50%] bg-[#5FAE6E]" />
          <div className="absolute right-[12%] top-[52%] h-[22%] w-[28%] rounded-[50%] bg-[#E7C98A]" />
          <div className="absolute inset-0 rounded-full bg-[linear-gradient(110deg,transparent_55%,rgb(2_6_15/0.75)_80%)]" />
        </div>
      )}
      {world === 'mars' && (
        <div className="absolute left-[16%] top-[12%] aspect-square w-[min(9vmin,60px)] rounded-full bg-[#FFF6E0] shadow-[0_0_30px_14px_rgb(255_236_200/0.45)]" />
      )}
    </div>
  )
}

// the texture's middle latitudes only: its top and bottom rows are polar ice and stretched poles
export const groundBg = (look: Look): CSSProperties => ({
  backgroundImage: `url(${look.ground})`,
  backgroundSize: 'auto 200%',
  backgroundPosition: '50% 50%',
  filter: look.groundFilter,
})

/**
 * Flat ground running back to the horizon. The eye sits on the horizon (perspective-origin at the top edge) and the
 * texture lies on the floor (rotated -90° about its near edge), so it shrinks into the distance. Static: drawn once.
 */
export function Terrain({ world, className, style }: { world: WorldId; className?: string; style?: CSSProperties }) {
  const look = LOOK[world]
  return (
    // the floor can't run all the way to the horizon; behind its far edge sits the texture's average colour, so it fades into it
    <div
      className={`overflow-hidden [perspective-origin:50%_0%] [perspective:220px] ${className}`}
      style={{ ...style, filter: look.groundFilter, backgroundColor: look.far }}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-full h-[1300px] w-[600vw] -translate-x-1/2 origin-top [transform:rotateX(-90deg)]" style={{ ...groundBg(look), filter: undefined }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${look.haze} 0%, ${look.haze} 10%, transparent 35%, rgb(8 21 43 / 0.15) 60%, rgb(8 21 43 / 0.55) 100%)` }} />
      <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
    </div>
  )
}
