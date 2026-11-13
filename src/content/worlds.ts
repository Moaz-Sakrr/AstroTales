import type { Device, WorldId } from './types'
import { eagle, falcon, reflecto, surveyor3 } from './devices/moon'
import { ingenuity, insight, opportunity, pathfinder, spirit, viking1 } from './devices/mars'
import { dawn, kepler, near, pioneer10 } from './devices/deep'

export type World = {
  id: WorldId
  name: string
  texture: string
  levels: Device[] // main path, in play order
  secrets: Device[] // off-path, unlocked with coins
  next?: WorldId
}

export const worlds: Record<WorldId, World> = {
  // levels are in the order they arrived, so the path doubles as a timeline
  moon: { id: 'moon', name: 'The Moon', texture: '/textures/2k_moon.jpg', levels: [reflecto, eagle, falcon], secrets: [surveyor3], next: 'mars' },
  mars: { id: 'mars', name: 'Mars', texture: '/textures/2k_mars.jpg', levels: [pathfinder, spirit, opportunity, insight, ingenuity], secrets: [viking1], next: 'deep' },
  deep: { id: 'deep', name: 'Deep space', texture: '/textures/2k_stars_milky_way.jpg', levels: [pioneer10, near, dawn], secrets: [kepler] },
}

// The world you must finish before this one opens (Moon → Mars → Deep space).
export const previousWorld = (id: WorldId) => (Object.values(worlds).find((w) => w.next === id)?.id ?? null)

export const allDevices: Device[] = Object.values(worlds).flatMap((w) => [...w.levels, ...w.secrets])
export const deviceById = Object.fromEntries(allDevices.map((d) => [d.id, d])) as Record<string, Device>

// Content self-check: catches a broken device file at load time instead of mid-demo.
for (const d of allDevices) {
  console.assert(d.story.length === 4 && d.quiz.length === 3 && d.stats.length === 3 && d.photos.length > 0, `content: ${d.id} is incomplete`)
}
