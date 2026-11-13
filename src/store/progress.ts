import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { WorldId } from '../content/types'
import { deviceById, worlds } from '../content/worlds'

export type Screen = 'home' | 'character' | 'launch' | 'space' | 'level' | 'story' | 'quiz' | 'mini' | 'card' | 'library' | 'profile'
export type Character = 'boy' | 'girl'

type Progress = {
  character: Character
  name: string // optional first name, never leaves the device
  coins: number
  shipAt: 'earth' | WorldId
  done: string[] // devices whose quiz is finished = cards collected
  secrets: string[] // secret levels unlocked with coins
}

type Session = {
  screen: Screen
  back: Screen // where Library/Profile return to
  world: WorldId
  travelTo: WorldId | null // Space flies here as soon as it opens
  justLanded: boolean // LevelMap plays the touchdown once
  deviceId: string
}

type Actions = {
  go: (screen: Screen) => void
  open: (screen: 'library' | 'profile', deviceId?: string) => void
  setCharacter: (character: Character, name: string) => void
  travel: (world: WorldId) => void
  land: (world: WorldId) => void
  playDevice: (deviceId: string) => void
  completeDevice: (deviceId: string, coins: number) => void
  unlockSecret: (deviceId: string, cost: number) => boolean
  reset: () => void
}

const fresh: Progress = { character: 'boy', name: '', coins: 0, shipAt: 'earth', done: [], secrets: [] }

export const useGame = create<Progress & Session & Actions>()(
  persist(
    (set, get) => ({
      ...fresh,
      screen: 'home',
      back: 'home',
      world: 'moon',
      travelTo: null,
      justLanded: false,
      deviceId: 'reflecto',

      go: (screen) => set({ screen }),
      open: (screen, deviceId) => set((s) => ({ screen, back: s.screen, deviceId: deviceId ?? s.deviceId })),
      setCharacter: (character, name) => set({ character, name: name.trim().slice(0, 16), screen: 'launch' }),
      travel: (world) => set({ travelTo: world, screen: 'space' }),
      land: (world) => set({ world, shipAt: world, travelTo: null, justLanded: true, screen: 'level' }),
      playDevice: (deviceId) => set({ deviceId, screen: 'story' }),
      completeDevice: (deviceId, coins) =>
        set((s) => ({
          coins: s.coins + coins,
          done: s.done.includes(deviceId) ? s.done : [...s.done, deviceId],
          screen: deviceById[deviceId].miniGame ? 'mini' : 'card', // mini-game sits between quiz and card
        })),
      unlockSecret: (deviceId, cost) => {
        if (get().coins < cost) return false
        set((s) => ({ coins: s.coins - cost, secrets: [...s.secrets, deviceId] }))
        return true
      },
      reset: () => set({ ...fresh, screen: 'home', world: 'moon' }),
    }),
    {
      name: 'astrotales-progress',
      // createJSONStorage swallows a blocked localStorage (private mode); the game still runs, just unsaved.
      storage: createJSONStorage(() => localStorage),
      partialize: ({ character, name, coins, shipAt, done, secrets }) => ({ character, name, coins, shipAt, done, secrets }),
    },
  ),
)

// Dev only: jump around while testing, e.g. __game.setState({ screen: 'space' })
if (import.meta.env.DEV) Object.assign(window, { __game: useGame })

export const worldComplete =(world: WorldId, done: string[]) => worlds[world].levels.every((d) => done.includes(d.id))
