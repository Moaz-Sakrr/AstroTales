import type { World, WorldId } from './types'
import { t } from './l10n'
import { SRC } from './sources'

// Coins are earned (never spent): a world opens once the kid's total reaches unlockCoins.
// Moon = 3 devices × 3 questions × 10 coins = 90 coins available.
export const worlds: Record<WorldId, World> = {
  moon: {
    id: 'moon',
    name: t('The Moon'),
    unlockCoins: 0,
    devices: ['reflecto', 'eagle', 'rover'],
    distance: { text: t('The Moon is about 385,000 km from Earth.'), source: SRC.laserRanging },
  },
  mars: {
    id: 'mars',
    name: t('Mars'),
    unlockCoins: 50,
    devices: ['opportunity', 'ingenuity'],
    distance: { text: t('Mars orbits the Sun at about 228 million km, 1.5 times farther out than Earth.'), source: SRC.marsFacts },
  },
  secret: {
    id: 'secret',
    name: t('Secret place'),
    unlockCoins: 120,
    devices: ['near'],
    distance: { text: t('Eros is an asteroid about 34 km long.'), source: SRC.near },
  },
}

export const worldOrder: WorldId[] = ['moon', 'mars', 'secret']
export const COINS_PER_ANSWER = 10
