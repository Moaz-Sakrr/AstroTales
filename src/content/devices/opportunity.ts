import type { Device } from '../types'
import { t, voice } from '../l10n'
import { SRC } from '../sources'

export const opportunity: Device = {
  id: 'opportunity',
  world: 'mars',
  name: 'Mars Exploration Rover Opportunity',
  nickname: 'Oppy',
  handle: 'oppy.on.mars',
  nssdcaId: '2003-032A',
  location: { label: 'Perseverance Valley, Endeavour Crater', lat: -2.2, lon: 354.8 },
  mapPos: { x: 30, y: 54 },
  live: false,
  status: t('Last seen: June 10, 2018'),
  bio: t('Robot geologist. Planned for 90 days, explored for almost 15 years. Solar-powered.'),
  stats: [
    { value: '45 km', label: t('driven on Mars') },
    { value: '~15 yrs', label: t('of exploring') },
    { value: '217,000+', label: t('pictures sent home') },
  ],
  science: [
    { text: t('I was designed to last 90 Martian days and drive 1,000 m. I drove more than 45 km.'), source: SRC.opportunityEnd },
    { text: t('I landed in 2004 inside a cocoon of airbags that bounced across the ground.'), source: SRC.opportunityJpl },
    { text: t('I found hematite, a mineral that forms in water, right at my landing site.'), source: SRC.opportunityEnd },
    { text: t('I climbed a 32-degree slope, a record for driving off Earth.'), source: SRC.opportunityEnd },
    { text: t('My last message arrived June 10, 2018, during a dust storm that covered all of Mars.'), source: SRC.opportunityEnd },
  ],
  story: [
    { kicker: t('Hi from Mars!'), line: t("I'm Opportunity, a robot geologist. I bounced onto Mars in 2004, wrapped in giant airbags."), audio: voice('opportunity', 0), scene: { pointer: true } },
    { kicker: t('The plan: 90 days'), line: t('NASA hoped I would last 90 days. I kept exploring for almost 15 years!'), audio: voice('opportunity', 1) },
    { kicker: t('My big find'), line: t('I found hematite, a mineral that forms in water. Long ago, Mars was wet!'), audio: voice('opportunity', 2) },
    { kicker: t('Last seen: June 2018'), line: t('A giant dust storm covered my solar panels. Can you help wipe them clean?'), audio: voice('opportunity', 3) },
  ],
  quiz: [
    {
      statement: t("My last words were: 'My battery is low and it's getting dark.'"),
      isFact: false,
      why: t('I only sent data and numbers. Those famous words were a person\'s poetic summary of that data. Always check what goes viral!'),
      hint: t('Robots send data, not sentences.'),
    },
    { statement: t('I was built to last only 90 days.'), isFact: true, why: t('90 Martian days were planned. I lasted almost 15 years.'), hint: t('Remember my second story card.') },
    { statement: t('A gasoline engine powered me.'), isFact: false, why: t('Solar panels! That is why the dust storm was such a big problem.'), hint: t('What did you wipe clean in your mission?') },
  ],
  miniGame: 'dust',
  collectible: { power: t('Marathon Rover'), superpower: t('Never gives up'), distanceHome: 'Mars · 228 million km from the Sun', rarity: 3 },
  credits: ['NASA/JPL-Caltech'],
}
