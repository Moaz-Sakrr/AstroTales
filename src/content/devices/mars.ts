import type { Device } from '../types'
import { L, nasaPhoto } from '../l10n'

// Mars devices. verified:false = the content team still has to check each fact against its source.
const MER = 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/'
const INGENUITY = 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/'
const PATHFINDER = 'https://science.nasa.gov/mission/mars-pathfinder/'
const JPL = 'NASA/JPL-Caltech'

export const opportunity: Device = {
  id: 'opportunity',
  world: 'mars',
  name: 'Mars Exploration Rover B (Opportunity)',
  nickname: 'Opportunity',
  handle: 'oppy.on.mars',
  location: { label: 'Meridiani Planum', lat: -1.946, lon: -5.527 },
  joined: 'January 2004',
  status: L('Last heard from: June 10, 2018'),
  active: false,
  bio: L('Planned to work for 90 Mars days. I kept exploring for almost 15 years.'),
  stats: [
    { value: '90', label: L('Days planned') },
    { value: '~15', label: L('Years worked') },
    { value: '45 km', label: L('Driven') },
  ],
  science: [
    { text: L('Landed on Mars on January 25, 2004.'), source: MER },
    { text: L('Planned for 90 Mars days, worked for nearly 15 years.'), source: MER },
    { text: L('Drove more than 45 kilometers, the longest drive on another world.'), source: MER },
    { text: L('Contact was lost during a planet-wide dust storm in June 2018.'), source: MER },
  ],
  story: [
    { kicker: L('POV: you met a legend'), line: L("Hi, I'm Oppy. Mind the dust. It gets everywhere on Mars.") },
    { kicker: L('January 2004'), line: L('I bounced down inside giant airbags and rolled into a tiny crater.') },
    { kicker: L('Bonus time'), line: L('My job was 90 days. I kept going for almost 15 years!') },
    { kicker: L('The big storm'), line: L('In 2018 a huge dust storm covered my solar panels. Now I rest here. Quiz?') },
  ],
  quiz: [
    { statement: L('I was planned to work for 90 Mars days.'), isFact: true, why: L('90 planned, almost 15 years done.'), hint: L('Remember my bonus time.') },
    { statement: L('My last words were "My battery is low and it\'s getting dark."'), isFact: false, why: L('That is a poem someone wrote from my data. I only sent numbers. Always check what goes viral!'), hint: L('Do robots send sentences, or data?') },
    { statement: L('I drove more than 45 kilometers on Mars.'), isFact: true, why: L('A record for driving on another world.'), hint: L('Look at my stats.') },
  ],
  photos: [
    // illustration first: it reads better as a portrait and card; the real selfie is grainy black and white
    nasaPhoto('opportunity-2.jpg', 'PIA04413', "NASA artist's picture of a rover like me on Mars.", JPL),
    nasaPhoto('opportunity-1.jpg', 'PIA22222', 'My first selfie, taken with my own arm camera.', JPL),
  ],
  card: { style: 'dust', type: 'Dust', stat: { value: '15', label: 'Years' }, power: L('Never gives up'), superpower: L('Turned 90 days into 15 years') },
  verified: false,
}

export const ingenuity: Device = {
  id: 'ingenuity',
  world: 'mars',
  name: 'Ingenuity Mars Helicopter',
  nickname: 'Ingenuity',
  handle: 'ginny.flies',
  location: { label: 'Jezero Crater', lat: 18.44, lon: 77.45 },
  joined: 'February 2021',
  status: L('Retired in January 2024 after 72 flights'),
  active: false,
  bio: L('The first aircraft to fly on another planet. I rode to Mars under the belly of the Perseverance rover.'),
  stats: [
    { value: '72', label: L('Flights') },
    { value: '5', label: L('Flights planned') },
    { value: '1st', label: L('Flight on another planet') },
  ],
  science: [
    { text: L('Made the first powered, controlled flight on another planet on April 19, 2021.'), source: INGENUITY },
    { text: L('Planned for up to 5 test flights, and made 72.'), source: INGENUITY },
    { text: L('Traveled to Mars attached to the belly of the Perseverance rover.'), source: INGENUITY },
    { text: L('The mission ended in January 2024 after a rotor blade was damaged.'), source: INGENUITY },
  ],
  story: [
    { kicker: L('POV: something is buzzing'), line: L("Bzzz! Up here! I'm the tiny helicopter of Mars.") },
    { kicker: L('April 19, 2021'), line: L('Nobody had ever flown on another planet. Then I lifted off. History!') },
    { kicker: L('Thin air'), line: L('Mars air is super thin, so my blades have to spin really, really fast.') },
    { kicker: L('Overachiever'), line: L('They hoped for 5 flights. I did 72. Think you can beat my quiz?') },
  ],
  quiz: [
    { statement: L('I was the first aircraft to fly on another planet.'), isFact: true, why: L('April 19, 2021, in Jezero Crater.'), hint: L('Remember my history moment.') },
    { statement: L('I was planned to make 72 flights.'), isFact: false, why: L('Only up to 5 were planned. I did 72!'), hint: L('Was 72 the plan or the result?') },
    { statement: L('I traveled to Mars under the Perseverance rover.'), isFact: true, why: L('I rode on its belly the whole way.'), hint: L('Read my bio.') },
  ],
  photos: [
    nasaPhoto('ingenuity-1.jpg', 'PIA24542', 'Perseverance took a selfie with me in Jezero Crater. I am the small helicopter on the left.', JPL),
    nasaPhoto('ingenuity-2.jpg', 'PIA23882', 'Me on Earth, before the trip.', JPL),
  ],
  card: { style: 'air', type: 'Air', stat: { value: '72', label: 'Flights' }, power: L('Flies in super-thin air'), superpower: L('First flight on another planet') },
  verified: false,
}

export const sojourner: Device = {
  id: 'sojourner',
  world: 'mars',
  secret: { cost: 30 },
  name: 'Sojourner rover (Mars Pathfinder)',
  nickname: 'Sojourner',
  handle: 'sojourner.the.og',
  location: { label: 'Ares Vallis', lat: 19.13, lon: -33.22 },
  joined: 'July 1997',
  status: L('Resting near the Pathfinder lander'),
  active: false,
  bio: L('The very first rover on Mars, about the size of a microwave oven.'),
  stats: [
    { value: '1st', label: L('Rover on Mars') },
    { value: '1997', label: L('Landed') },
    { value: '6', label: L('Wheels') },
  ],
  science: [
    { text: L('Landed on Mars on July 4, 1997, with the Mars Pathfinder lander.'), source: PATHFINDER },
    { text: L('The first rover to drive on Mars.'), source: PATHFINDER },
    { text: L('About the size of a microwave oven.'), source: PATHFINDER },
  ],
  story: [
    { kicker: L('POV: you found the OG'), line: L('Psst. Before Oppy, before Ingenuity, there was me. Tiny but brave.') },
    { kicker: L('July 4, 1997'), line: L('My lander bounced down on airbags, then I rolled down a ramp onto Mars.') },
    { kicker: L('Small but mighty'), line: L("I'm about as big as a microwave oven, with six wheels.") },
    { kicker: L('Rock reporter'), line: L('I checked rocks to learn what they are made of. Quiz time?') },
  ],
  quiz: [
    { statement: L('I was the first rover on Mars.'), isFact: true, why: L('1997, years before Opportunity.'), hint: L('Who came before Oppy?') },
    { statement: L("I'm as big as a school bus."), isFact: false, why: L('More like a microwave oven!'), hint: L('Small but mighty…') },
    { statement: L('I landed on Mars in 1997.'), isFact: true, why: L('July 4, 1997.'), hint: L('Check my stats.') },
  ],
  photos: [
    nasaPhoto('sojourner-1.jpg', 'PIA01551', 'Just rolled off my ramp onto Mars.', JPL),
    nasaPhoto('sojourner-2.jpg', 'PIA01121', 'My view of the Pathfinder lander.', JPL),
  ],
  card: { style: 'secret', type: 'Secret', stat: { value: '1997', label: 'Landed' }, power: L('Reads what rocks are made of'), superpower: L('First wheels on Mars') },
  verified: false,
}
