import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { WorldId } from '../content/types'
import type { Kind, SuitId } from '../content/suits'
import { suits } from '../content/suits'
import { worlds, COINS_PER_ANSWER } from '../content/worlds'
import { devices } from '../content/devices'

// One screen value instead of a router — docs/PROJECT_PLAN.md §10.4.
export type Screen =
  | 'landing' | 'avatar' | 'launch' | 'map' | 'story' | 'mini' | 'profile'
  | 'quiz' | 'reward' | 'cards' | 'wrapped' | 'end' | 'credits'

// localStorage can throw (private mode, blocked storage). Never let that crash the app.
const safeStorage: StateStorage = {
  getItem: (k) => {
    try { return localStorage.getItem(k) } catch { return null }
  },
  setItem: (k, v) => {
    try { localStorage.setItem(k, v) } catch { /* storage blocked: progress lives in memory only */ }
  },
  removeItem: (k) => {
    try { localStorage.removeItem(k) } catch { /* ignore */ }
  },
}

type Saved = {
  character: Kind | null
  suit: SuitId
  name: string
  coins: number // total earned; never spent
  visited: string[] // devices whose full journey is done (card collected)
  mastered: Record<string, number[]> // deviceId -> quiz indexes answered right (coins paid once)
  muted: boolean
}

type Session = {
  screen: Screen
  world: WorldId
  deviceId: string | null
  launchTo: WorldId
  lastReward: { coins: number; card: string; suits: SuitId[]; worlds: WorldId[] } | null
  rewardStart: number // coins when the current device journey began
}

type Actions = {
  go: (s: Screen) => void
  chooseCharacter: (k: Kind, s: SuitId, name: string) => void
  setWorld: (w: WorldId) => void
  flyTo: (w: WorldId) => void
  openDevice: (id: string) => void
  answer: (deviceId: string, index: number) => number // returns coins gained
  completeDevice: () => void
  toggleMute: () => void
  reset: () => void
}

const initialSaved: Saved = { character: null, suit: 'classic', name: '', coins: 0, visited: [], mastered: {}, muted: false }

export const useProgress = create<Saved & Session & Actions>()(
  persist(
    (set, get) => ({
      ...initialSaved,
      screen: 'landing',
      world: 'moon',
      deviceId: null,
      launchTo: 'moon',
      lastReward: null,
      rewardStart: 0,

      go: (screen) => set({ screen }),
      chooseCharacter: (character, suit, name) => set({ character, suit, name: name.trim().slice(0, 20), launchTo: 'moon', screen: 'launch' }),
      setWorld: (world) => set({ world }),
      flyTo: (w) => set({ launchTo: w, screen: 'launch' }),
      openDevice: (id) => set({ deviceId: id, screen: 'story', rewardStart: get().coins }),

      answer: (deviceId, index) => {
        const done = get().mastered[deviceId] ?? []
        if (done.includes(index)) return 0 // already paid for this question: replays are free
        set({ coins: get().coins + COINS_PER_ANSWER, mastered: { ...get().mastered, [deviceId]: [...done, index] } })
        return COINS_PER_ANSWER
      },

      completeDevice: () => {
        const { deviceId, rewardStart, coins, visited } = get()
        if (!deviceId) return
        // What crossed a threshold during this journey?
        const newSuits = (Object.keys(suits) as SuitId[]).filter((s) => suits[s].cost > rewardStart && suits[s].cost <= coins)
        const newWorlds = (Object.keys(worlds) as WorldId[]).filter((w) => worlds[w].unlockCoins > rewardStart && worlds[w].unlockCoins <= coins)
        set({
          visited: visited.includes(deviceId) ? visited : [...visited, deviceId],
          lastReward: { coins: coins - rewardStart, card: deviceId, suits: newSuits, worlds: newWorlds },
          screen: 'reward',
        })
      },

      toggleMute: () => set({ muted: !get().muted }),
      reset: () => set({ ...initialSaved, screen: 'landing', world: 'moon', deviceId: null, lastReward: null }),
    }),
    {
      name: 'astrotales-progress',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      // Only progress is saved. Screen and session state start fresh on every visit.
      partialize: (s): Saved => ({
        character: s.character, suit: s.suit, name: s.name, coins: s.coins,
        visited: s.visited, mastered: s.mastered, muted: s.muted,
      }),
    },
  ),
)

// Derived helpers (pure, so components can call them with store values).
export const isWorldOpen = (w: WorldId, coins: number) => coins >= worlds[w].unlockCoins
export const isSuitOpen = (s: SuitId, coins: number) => coins >= suits[s].cost

// A level is open when it's the first in its world or the one before it is done.
export function levelState(id: string, visited: string[]): 'done' | 'next' | 'locked' {
  if (visited.includes(id)) return 'done'
  const list = worlds[devices[id].world].devices
  const i = list.indexOf(id)
  return i === 0 || visited.includes(list[i - 1]) ? 'next' : 'locked'
}

export const masteredCount = (m: Record<string, number[]>) => Object.values(m).reduce((n, a) => n + a.length, 0)
