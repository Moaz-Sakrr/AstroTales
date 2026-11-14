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
  model3d: '/models/mer.glb',
  card: { image: '/images/cards/opportunity.jpg' },
  miniGame: 'dust',
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
  mascot: 'ingenuity',
  model3d: '/models/ingenuity.glb',
  card: { image: '/images/cards/ingenuity.jpg' },
  verified: false,
}

const VIKING1 = 'https://science.nasa.gov/mission/viking-1/'
const INSIGHT = 'https://science.nasa.gov/mission/insight/'

export const pathfinder: Device = {
  id: 'pathfinder',
  world: 'mars',
  name: 'Mars Pathfinder lander and Sojourner rover',
  nickname: 'Pathfinder',
  handle: 'pathfinder.went.boing',
  location: { label: 'Ares Vallis', lat: 19.13, lon: -33.22 },
  joined: 'July 1997',
  status: L('Last heard from: September 27, 1997'),
  active: false,
  bio: L('I bounced onto Mars in giant airbags, then let out Sojourner, the first rover to drive on Mars.'),
  stats: [
    { value: '1st', label: L('Rover on Mars') },
    { value: '16,500+', label: L('Lander photos') },
    { value: '1997', label: L('Landed') },
  ],
  science: [
    { text: L('Landed in Ares Vallis on July 4, 1997, cushioned by airbags.'), source: PATHFINDER },
    { text: L('Carried Sojourner, the first rover to drive on Mars, about the size of a microwave oven.'), source: PATHFINDER },
    { text: L('Sent back more than 16,500 pictures from the lander and 550 from the rover.'), source: PATHFINDER },
    { text: L('The lander was renamed the Carl Sagan Memorial Station.'), source: PATHFINDER },
  ],
  story: [
    { kicker: L('POV: you found a bouncy lander'), line: L('Boing! I landed on Mars wrapped in giant airbags, bouncing like a beach ball.') },
    { kicker: L('July 4, 1997'), line: L('When I stopped rolling, I opened up like a flower in Ares Vallis.') },
    { kicker: L('My little buddy'), line: L('Then my rover Sojourner rolled down a ramp. The first rover ever on Mars!') },
    { kicker: L('Snap, snap'), line: L('Together we sent home thousands of pictures. Ready for my quiz?') },
  ],
  quiz: [
    { statement: L('I landed on Mars using giant airbags.'), isFact: true, why: L('The airbags let me bounce safely until I stopped.'), hint: L('Remember the beach ball?') },
    { statement: L('Sojourner was as big as a school bus.'), isFact: false, why: L('It was about the size of a microwave oven!'), hint: L('Was my buddy big or little?') },
    { statement: L('Sojourner was the first rover to drive on Mars.'), isFact: true, why: L('1997, years before Spirit and Opportunity.'), hint: L('Look at my stats.') },
  ],
  photos: [
    nasaPhoto('pathfinder-1.jpg', 'PIA01551', 'Sojourner just after rolling off my ramp onto Mars.', JPL),
    nasaPhoto('pathfinder-2.jpg', 'PIA01121', 'Sojourner took this picture of me, the lander.', JPL),
  ],
  card: { image: '/images/cards/pathfinder.jpg' },
  verified: false,
}

export const spirit: Device = {
  id: 'spirit',
  world: 'mars',
  name: 'Mars Exploration Rover A (Spirit)',
  nickname: 'Spirit',
  handle: 'spirit.oppys.twin',
  location: { label: 'Gusev Crater', lat: -14.57, lon: 175.47 },
  joined: 'January 2004',
  status: L('Last heard from: March 22, 2010'),
  active: false,
  bio: L("Opportunity's twin. I explored Gusev Crater for more than six years, even with a broken wheel."),
  stats: [
    { value: '90', label: L('Days planned') },
    { value: '6+', label: L('Years worked') },
    { value: '7.7 km', label: L('Driven') },
  ],
  science: [
    { text: L('Landed in Gusev Crater on January 4, 2004.'), source: MER },
    { text: L('Planned for 90 Mars days, kept working for more than six years.'), source: MER },
    { text: L('Its stuck wheel scraped up silica-rich soil, a clue to ancient hot springs or steam vents.'), source: MER },
    { text: L('Got stuck in soft soil in 2009 and was last heard from in March 2010.'), source: MER },
  ],
  story: [
    { kicker: L("POV: you met Oppy's twin"), line: L("Hi! I'm Spirit. Opportunity is my twin. We landed three weeks apart.") },
    { kicker: L('January 4, 2004'), line: L('I bounced down in Gusev Crater inside airbags, just like my twin.') },
    { kicker: L('Lucky accident'), line: L('My broken wheel dragged and dug up bright white soil. A clue of old hot springs!') },
    { kicker: L('Stuck'), line: L('In 2009 I got stuck in soft sand and could not get out. Quiz time?') },
  ],
  quiz: [
    { statement: L('Opportunity is my twin.'), isFact: true, why: L('Two identical rovers, landed three weeks apart.'), hint: L('Read my bio.') },
    { statement: L('I drove more than 45 kilometers.'), isFact: false, why: L('That was Oppy! I drove about 7.7 km.'), hint: L('Which twin holds the record?') },
    { statement: L('A broken wheel helped me find clues of water.'), isFact: true, why: L('It dragged and scraped up bright, silica-rich soil.'), hint: L('Remember my lucky accident.') },
  ],
  photos: [nasaPhoto('spirit-1.jpg', 'PIA05040', 'My first look at Mars, right after landing. That is my deck and my deflated airbags.', JPL)],
  model3d: '/models/mer.glb',
  card: { image: '/images/cards/spirit.jpg' },
  verified: false,
}

export const insight: Device = {
  id: 'insight',
  world: 'mars',
  name: 'InSight Mars Lander',
  nickname: 'InSight',
  handle: 'insight.is.listening',
  location: { label: 'Elysium Planitia', lat: 4.5, lon: 135.62 },
  joined: 'November 2018',
  status: L('Went quiet in December 2022'),
  active: false,
  bio: L('I stayed in one place and listened to Mars shake, to learn what is deep inside the planet.'),
  stats: [
    { value: '1,300+', label: L('Marsquakes felt') },
    { value: '4', label: L('Years listening') },
    { value: '0', label: L('Wheels') },
  ],
  science: [
    { text: L('Landed in Elysium Planitia on November 26, 2018.'), source: INSIGHT },
    { text: L('Its seismometer detected more than 1,300 marsquakes.'), source: INSIGHT },
    { text: L('Helped scientists measure the layers inside Mars, including its core.'), source: INSIGHT },
    { text: L('The mission ended in December 2022 after dust covered its solar panels.'), source: INSIGHT },
  ],
  story: [
    { kicker: L('POV: shh, listen'), line: L("Shh… hear that? I'm listening to Mars shake. I'm InSight!") },
    { kicker: L('November 26, 2018'), line: L('I landed on a flat, quiet plain. Perfect for listening.') },
    { kicker: L('Marsquakes'), line: L('My super-sensitive seismometer felt more than 1,300 marsquakes!') },
    { kicker: L('Dusty ending'), line: L('Dust slowly covered my solar panels, and in 2022 I went quiet. Quiz?') },
  ],
  quiz: [
    { statement: L('I felt more than 1,300 marsquakes.'), isFact: true, why: L('My seismometer was super sensitive.'), hint: L('Look at my stats.') },
    { statement: L('I was a rover that drove all over Mars.'), isFact: false, why: L('I was a lander. I stayed in one spot and listened.'), hint: L('How many wheels do I have?') },
    { statement: L('Dust on my solar panels ended my mission.'), isFact: true, why: L('Less sunlight meant less power, until I went quiet.'), hint: L('Remember my dusty ending.') },
  ],
  photos: [
    nasaPhoto('insight-1.jpg', 'PIA22876', 'My first selfie on Mars, December 2018. Clean solar panels!', JPL),
    nasaPhoto('insight-2.jpg', 'PIA25287', 'My last selfie, 2022. See how dusty I got?', JPL),
  ],
  model3d: '/models/insight.glb',
  card: { image: '/images/cards/insight.jpg' },
  verified: false,
}

export const viking1: Device = {
  id: 'viking1',
  world: 'mars',
  secret: { cost: 30 },
  name: 'Viking 1 Lander',
  nickname: 'Viking 1',
  handle: 'viking1.since.76',
  location: { label: 'Chryse Planitia', lat: 22.27, lon: -47.95 },
  joined: 'July 1976',
  status: L('Last heard from: November 1982'),
  active: false,
  bio: L('The first spacecraft to land on Mars and do its job. I took the first pictures from the surface.'),
  stats: [
    { value: '1976', label: L('Landed') },
    { value: '1st', label: L('Photo from the surface') },
    { value: '6+', label: L('Years working') },
  ],
  science: [
    { text: L('Landed in Chryse Planitia on July 20, 1976.'), source: VIKING1 },
    { text: L('The first spacecraft to land on Mars and carry out its mission.'), source: VIKING1 },
    { text: L('Took the first pictures from the surface of Mars.'), source: VIKING1 },
    { text: L('Kept working until November 1982.'), source: VIKING1 },
  ],
  story: [
    { kicker: L('POV: you found a Mars legend'), line: L("Shh, I'm the oldest one here. I landed way back in 1976!") },
    { kicker: L('July 20, 1976'), line: L('Exactly seven years after the first Moon landing, I touched down on Mars.') },
    { kicker: L('Say cheese'), line: L('I took the very first photo from the surface of Mars. It showed my own foot!') },
    { kicker: L('Life hunter'), line: L('I scooped up dirt to test it for tiny life. Quiz time?') },
  ],
  quiz: [
    { statement: L('I landed on Mars on July 20, the same date as the first Moon landing.'), isFact: true, why: L('Seven years later: 1969 on the Moon, 1976 on Mars.'), hint: L('Remember my landing date.') },
    { statement: L('My first photo was a selfie of my face.'), isFact: false, why: L('It showed my footpad on the ground.'), hint: L('What part of me was in the picture?') },
    { statement: L('I worked on Mars for more than six years.'), isFact: true, why: L('From 1976 to 1982.'), hint: L('Look at my stats.') },
  ],
  photos: [
    nasaPhoto('viking1-1.jpg', 'PIA00381', 'The first photo ever taken on the surface of Mars, July 20, 1976. That is my footpad!', JPL),
    nasaPhoto('viking1-2.jpg', 'PIA00563', 'My first color picture of Mars.', JPL),
  ],
  model3d: '/models/viking.glb',
  card: { image: '/images/cards/viking1.jpg' },
  verified: false,
}
