import type { Device, WorldId } from './types'
import { eagle, reflecto, rover, surveyor3 } from './devices/moon'
import { ingenuity, opportunity, sojourner } from './devices/mars'

export type World = {
  id: WorldId
  name: string
  texture: string
  levels: Device[] // main path, in play order
  secrets: Device[] // off-path, unlocked with coins
  next?: WorldId
}

export const worlds: Record<WorldId, World> = {
  moon: { id: 'moon', name: 'The Moon', texture: '/textures/2k_moon.jpg', levels: [reflecto, eagle, rover], secrets: [surveyor3], next: 'mars' },
  mars: { id: 'mars', name: 'Mars', texture: '/textures/2k_mars.jpg', levels: [opportunity, ingenuity], secrets: [sojourner] },
}

export const allDevices: Device[] = Object.values(worlds).flatMap((w) => [...w.levels, ...w.secrets])
export const deviceById = Object.fromEntries(allDevices.map((d) => [d.id, d])) as Record<string, Device>

// Content self-check: catches a broken device file at load time instead of mid-demo.
for (const d of allDevices) {
  console.assert(d.story.length === 4 && d.quiz.length === 3 && d.stats.length === 3 && d.photos.length > 0, `content: ${d.id} is incomplete`)
}
