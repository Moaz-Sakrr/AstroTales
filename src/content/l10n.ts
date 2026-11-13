import type { L10n } from './types'

// Shorthand for English-only strings. When Arabic ships, content files switch to { en, 'ar-EG' } objects.
export const t = (en: string): L10n => ({ en })

// Audio path for a story card: public/audio/{lang}/{deviceId}/{cardIndex}.mp3
export const voice = (deviceId: string, card: number) => ({ en: `/audio/en/${deviceId}/${card}.mp3` })
