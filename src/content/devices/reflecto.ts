import type { Device } from '../types'
import { t, voice } from '../l10n'
import { SRC } from '../sources'

export const reflecto: Device = {
  id: 'reflecto',
  world: 'moon',
  name: 'Apollo 11 Laser Ranging Retroreflector',
  nickname: 'Reflecto',
  handle: 'reflecto.on.moon',
  nssdcaId: '1969-059C',
  location: { label: 'Tranquility Base, Sea of Tranquility', lat: 0.674, lon: 23.473 },
  mapPos: { x: 63, y: 56 },
  live: true,
  status: t('Still bouncing lasers back to Earth'),
  bio: t('A mirror panel on the Moon. 100 tiny prisms. Sending light home since 1969.'),
  stats: [
    { value: '100', label: t('mirror prisms') },
    { value: '46 cm', label: t('panel size') },
    { value: '2.5 s', label: t('laser round trip') },
  ],
  science: [
    { text: t('I hold 100 corner-cube prisms in a 46 cm square aluminum panel.'), source: SRC.retroreflectorJpl },
    { text: t('A corner cube sends a light beam straight back toward where it came from.'), source: SRC.moonDistanceGsfc },
    { text: t('Lunar laser ranging is the only Moon experiment that has kept running since Apollo.'), source: SRC.retroreflectorJpl },
    { text: t('A laser pulse takes about 2.5 seconds to reach the Moon and come back.'), source: SRC.laserRanging },
    { text: t('Laser timing showed the Moon drifts away from Earth by about 3.8 cm every year.'), source: SRC.laserRanging },
  ],
  story: [
    { kicker: t("POV: you're a mirror on the Moon"), line: t("Psst… look down. I'm the shiny panel right next to your boots."), audio: voice('reflecto', 0), scene: { pointer: true } },
    { kicker: t('July 1969'), line: t("Buzz Aldrin set me up here during Apollo 11. I've been working ever since."), audio: voice('reflecto', 1) },
    { kicker: t('My daily job'), line: t('Scientists on Earth shoot lasers at me. My 100 tiny prisms bounce the light straight back home.'), audio: voice('reflecto', 2), scene: { beam: true } },
    { kicker: t('Your turn'), line: t('Timing that bounce tells us exactly how far away the Moon is. Want to try?'), audio: voice('reflecto', 3), scene: { beam: true } },
  ],
  quiz: [
    { statement: t("I'm made of 100 tiny mirror prisms."), isFact: true, why: t('100 corner cubes, each sending light back the way it came.'), hint: t('Look at the stats on my profile.') },
    { statement: t('A laser takes 2 minutes to reach me and come back.'), isFact: false, why: t('The whole round trip takes only about 2.5 seconds.'), hint: t('Remember the timer in your laser mission.') },
    { statement: t('The Moon is slowly drifting away from Earth.'), isFact: true, why: t('About 3.8 cm a year. Laser timing showed it.'), hint: t('Check "The Science" on my profile.') },
  ],
  miniGame: 'laser',
  collectible: { power: t('Light Bouncer'), superpower: t('Sends any laser straight back home'), distanceHome: '≈385,000 km from Earth', rarity: 3 },
  credits: ['NASA', 'NASA/JPL'],
}
