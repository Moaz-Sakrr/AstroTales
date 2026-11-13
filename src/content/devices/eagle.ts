import type { Device } from '../types'
import { t, voice } from '../l10n'
import { SRC } from '../sources'

export const eagle: Device = {
  id: 'eagle',
  world: 'moon',
  name: 'Apollo 11 Lunar Module "Eagle" (descent stage)',
  nickname: 'Eagle',
  handle: 'eagle.has.landed',
  nssdcaId: '1969-059C',
  location: { label: 'Tranquility Base, Sea of Tranquility', lat: 0.674, lon: 23.473 },
  mapPos: { x: 75, y: 44 },
  live: false,
  status: t('Resting at Tranquility Base since 1969'),
  bio: t('Bottom half of the first spaceship to land people on the Moon. Also: a launch pad.'),
  stats: [
    { value: '2', label: t('astronauts landed') },
    { value: '1969', label: t('touchdown year') },
    { value: '6', label: t('Apollo sites like mine') },
  ],
  science: [
    { text: t('Eagle (lunar module LM-5) landed Neil Armstrong and Buzz Aldrin on the Moon in July 1969.'), source: SRC.apollo11Summary },
    { text: t('My lower half, the descent stage, stayed behind and served as the launch pad for the trip home.'), source: SRC.apolloLandingSites },
    { text: t('A stainless steel plaque is attached to the ladder on my landing leg.'), source: SRC.apollo11Plaque },
    { text: t('Every one of the six Apollo landing sites still has its descent stage.'), source: SRC.apolloLandingSites },
  ],
  story: [
    { kicker: t('Look up: big gold legs!'), line: t("I'm the bottom half of Eagle, the first spaceship to land people on the Moon."), audio: voice('eagle', 0), scene: { pointer: true } },
    { kicker: t('July 20, 1969'), line: t("Neil and Buzz rode me all the way down. Then the radio said: 'The Eagle has landed.'"), audio: voice('eagle', 1) },
    { kicker: t('My big job'), line: t('When it was time to go home, I became their launch pad. My top half blasted off!'), audio: voice('eagle', 2) },
    { kicker: t('Read my leg'), line: t("A plaque on my ladder still says: 'We came in peace for all mankind.'"), audio: voice('eagle', 3), scene: { pointer: true } },
  ],
  quiz: [
    { statement: t('My top half flew back up into space.'), isFact: true, why: t('The ascent stage blasted off, using me as its launch pad.'), hint: t('What happened when it was time to go home?') },
    { statement: t('Apollo 11 brought me back to Earth.'), isFact: false, why: t("Descent stages were left on the Moon. I'm still there."), hint: t('Check my status on my profile.') },
    { statement: t('There is a plaque on my ladder.'), isFact: true, why: t("It reads: 'We came in peace for all mankind.'"), hint: t('Remember my last story card.') },
  ],
  collectible: { power: t('Launch Pad'), superpower: t('Lands softly, then helps you fly home'), distanceHome: '≈385,000 km from Earth', rarity: 3 },
  credits: ['NASA'],
}
