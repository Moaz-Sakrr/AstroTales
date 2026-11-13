import type { Device } from '../types'
import { t, voice } from '../l10n'
import { SRC } from '../sources'

export const rover: Device = {
  id: 'rover',
  world: 'moon',
  name: 'Apollo 15 Lunar Roving Vehicle',
  nickname: 'Moon Buggy',
  handle: 'moonbuggy.apollo15',
  nssdcaId: '1971-063C',
  location: { label: 'Hadley–Apennine', lat: 26.13, lon: 3.63 },
  mapPos: { x: 53, y: 30 },
  live: false,
  status: t('Parked at Hadley since August 1971'),
  bio: t('Electric. Open-top. Steel-mesh wheels. The first wheels astronauts drove on the Moon.'),
  stats: [
    { value: '27.8 km', label: t('driven on the Moon') },
    { value: '210 kg', label: t('my weight on Earth') },
    { value: '3 h 2 min', label: t('total driving time') },
  ],
  science: [
    { text: t('On Apollo 15, I was driven 27.8 km in 3 hours and 2 minutes of driving time.'), source: SRC.lrvNssdca },
    { text: t('I weighed 210 kg but was designed to carry a 490 kg load.'), source: SRC.lrvNssdca },
    { text: t('My tires were woven from zinc-coated steel strands, with titanium treads.'), source: SRC.lrvNssdca },
    { text: t('Two 36-volt batteries powered me. They could not be recharged.'), source: SRC.lrvNssdca },
    { text: t('My TV camera let people on Earth watch a Moon liftoff live for the first time.'), source: SRC.apollo15Home },
  ],
  story: [
    { kicker: t('Beep beep!'), line: t("I'm the Moon Buggy: an electric car built to drive on the Moon. No roof needed!"), audio: voice('rover', 0), scene: { pointer: true } },
    { kicker: t('Summer 1971'), line: t('Dave Scott and Jim Irwin drove me at Hadley, next to tall mountains and a long winding valley.'), audio: voice('rover', 1) },
    { kicker: t('How I roll'), line: t('My wheels are woven steel wire, like a mesh basket. No air inside, so no flat tires!'), audio: voice('rover', 2) },
    { kicker: t('My last job'), line: t('Before they left, my camera filmed their rocket blasting off, live on TV for Earth!'), audio: voice('rover', 3) },
  ],
  quiz: [
    { statement: t('My tires were full of air.'), isFact: false, why: t('They were woven steel mesh, not rubber balloons.'), hint: t('How did I roll?') },
    { statement: t('I was driven more than 27 km on the Moon.'), isFact: true, why: t('27.8 km in about 3 hours of driving.'), hint: t('Look at my stats.') },
    { statement: t('Batteries powered me, not gasoline.'), isFact: true, why: t('Two 36-volt batteries. No gas engine.'), hint: t('Check "The Science" on my profile.') },
  ],
  collectible: { power: t('Moon Wheels'), superpower: t('Drives where no car has driven before'), distanceHome: '≈385,000 km from Earth', rarity: 2 },
  credits: ['NASA'],
}
