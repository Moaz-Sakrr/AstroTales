import type { Device } from '../types'
import { t, voice } from '../l10n'
import { SRC } from '../sources'

export const near: Device = {
  id: 'near',
  world: 'secret',
  name: 'NEAR Shoemaker',
  nickname: 'NEAR',
  handle: 'near.on.eros',
  nssdcaId: '1996-008A',
  location: { label: 'Asteroid 433 Eros', lat: 0, lon: 0 },
  mapPos: { x: 55, y: 48 },
  live: false,
  status: t('Last contact: February 28, 2001'),
  bio: t('First spacecraft to orbit an asteroid, and the first to land on one.'),
  stats: [
    { value: '34 km', label: t('long: my asteroid') },
    { value: '69', label: t('landing photos') },
    { value: '−173 °C', label: t('at last contact') },
  ],
  science: [
    { text: t('I was the first spacecraft to orbit an asteroid and the first to land on one.'), source: SRC.near },
    { text: t('I launched on Feb. 17, 1996, and started orbiting Eros on Feb. 14, 2000.'), source: SRC.near },
    { text: t('I touched down on Eros on Feb. 12, 2001, at about 6.4 km per hour.'), source: SRC.near },
    { text: t('I took 69 high-resolution photos on my way down.'), source: SRC.near },
    { text: t('My last contact was Feb. 28, 2001, when it was about −173 °C.'), source: SRC.near },
  ],
  story: [
    { kicker: t('Secret place unlocked!'), line: t("I'm NEAR Shoemaker. I live on Eros, a rocky asteroid about 34 km long."), audio: voice('near', 0), scene: { pointer: true } },
    { kicker: t('Year 2000'), line: t('I was the first spacecraft ever to orbit an asteroid. I circled Eros for a whole year.'), audio: voice('near', 1) },
    { kicker: t('February 12, 2001'), line: t('Then I did something no spacecraft had done before: I landed on an asteroid!'), audio: voice('near', 2) },
    { kicker: t('Last contact'), line: t('I snapped 69 close-up photos on the way down. Then the deep cold put me to sleep.'), audio: voice('near', 3) },
  ],
  quiz: [
    { statement: t('I was the first spacecraft to land on an asteroid.'), isFact: true, why: t('February 12, 2001, on asteroid Eros.'), hint: t('What did I do that no one had done?') },
    { statement: t('Asteroid Eros is bigger than the Moon.'), isFact: false, why: t('Eros is about 34 km long. The Moon is thousands of km wide.'), hint: t('Look at my stats.') },
    { statement: t('I took 69 photos while landing.'), isFact: true, why: t('69 high-resolution photos on the way down.'), hint: t('Remember my last story card.') },
  ],
  collectible: { power: t('Asteroid Hugger'), superpower: t('Orbit, then land: a double first'), distanceHome: 'Asteroid 433 Eros', rarity: 3 },
  credits: ['NASA', 'JHU/APL'],
}
