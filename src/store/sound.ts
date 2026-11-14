import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// The kid's sound choices, kept on this device only.
type Sound = {
  music: boolean
  effects: boolean
  toggleMusic: () => void
  toggleEffects: () => void
}

export const useSound = create<Sound>()(
  persist(
    (set) => ({
      music: true,
      effects: true,
      toggleMusic: () => set((s) => ({ music: !s.music })),
      toggleEffects: () => set((s) => ({ effects: !s.effects })),
    }),
    {
      name: 'astrotales-sound',
      // createJSONStorage swallows a blocked localStorage (private mode): sound still works, the choice just isn't saved.
      storage: createJSONStorage(() => localStorage),
      partialize: ({ music, effects }) => ({ music, effects }),
    },
  ),
)
