import type { Device } from '../types'
import { t, voice } from '../l10n'
import { SRC } from '../sources'

export const ingenuity: Device = {
  id: 'ingenuity',
  world: 'mars',
  name: 'Ingenuity Mars Helicopter',
  nickname: 'Ginny',
  handle: 'ingenuity.flies',
  nssdcaId: '2020-052A',
  location: { label: 'Jezero Crater', lat: 18.44, lon: 77.45 },
  mapPos: { x: 76, y: 37 },
  live: false,
  status: t('Last flight: January 18, 2024'),
  bio: t('Tiny helicopter. First aircraft to fly on another planet. Planned 5 flights, flew 72.'),
  stats: [
    { value: '72', label: t('flights on Mars') },
    { value: '2+ h', label: t('in the air') },
    { value: '5', label: t('flights planned') },
  ],
  science: [
    { text: t('I made the first powered, controlled flight on another planet on April 19, 2021.'), source: SRC.ingenuityEnd },
    { text: t('I reached Mars on Feb. 18, 2021, attached to the belly of the Perseverance rover.'), source: SRC.ingenuityEnd },
    { text: t('I was planned for up to 5 test flights over 30 days. I flew 72 times.'), source: SRC.ingenuityEnd },
    { text: t('I carry a swatch from the original Wright Flyer, the first airplane.'), source: SRC.ingenuityEnd },
    { text: t('My rotor blades were damaged on flight 72, so I can no longer fly.'), source: SRC.ingenuityEnd },
  ],
  story: [
    { kicker: t('Bzzzzz!'), line: t("I'm Ingenuity, a tiny helicopter. I rode to Mars tucked under Perseverance's belly!"), audio: voice('ingenuity', 0), scene: { pointer: true } },
    { kicker: t('April 19, 2021'), line: t('I made the first powered, controlled flight on another planet. Like the Wright brothers, but on Mars!'), audio: voice('ingenuity', 1) },
    { kicker: t('My secret'), line: t("I carry a tiny swatch from the Wright brothers' first airplane. A lucky charm!"), audio: voice('ingenuity', 2) },
    { kicker: t('The plan: 5 flights'), line: t('I was meant to fly 5 times. I flew 72! Now I rest on Mars.'), audio: voice('ingenuity', 3) },
  ],
  quiz: [
    { statement: t('I was the first aircraft to fly on another planet.'), isFact: true, why: t('April 19, 2021, on Mars.'), hint: t('Remember my second story card.') },
    { statement: t('I was built to fly 100 times.'), isFact: false, why: t('Only 5 test flights were planned. I flew 72!'), hint: t('Look at my stats.') },
    { statement: t("I carry a piece of the Wright brothers' airplane."), isFact: true, why: t('A small swatch from the original Wright Flyer.'), hint: t('What was my secret?') },
  ],
  collectible: { power: t('Sky Scout'), superpower: t('Flies where the air is super thin'), distanceHome: 'Mars · 228 million km from the Sun', rarity: 3 },
  credits: ['NASA/JPL-Caltech'],
}
