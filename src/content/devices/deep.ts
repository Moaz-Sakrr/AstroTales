import type { Device } from '../types'
import { L, nasaPhoto } from '../l10n'

// Deep space: machines left on asteroids or drifting far away.
// verified:false = the content team still has to check each fact against its source.
const NEAR = 'https://science.nasa.gov/mission/near-shoemaker/'
const DAWN = 'https://science.nasa.gov/mission/dawn/'
const PIONEER10 = 'https://science.nasa.gov/mission/pioneer-10/'
const KEPLER = 'https://science.nasa.gov/mission/kepler/'
const JPL = 'NASA/JPL-Caltech'

export const near: Device = {
  id: 'near',
  world: 'deep',
  name: 'NEAR Shoemaker',
  nickname: 'NEAR',
  handle: 'near.on.eros',
  location: { label: 'On asteroid 433 Eros' },
  joined: 'February 2001',
  status: L('Resting on asteroid Eros since 2001'),
  active: false,
  bio: L('The first spacecraft to orbit an asteroid, and the first to land on one, even though I was never built to land.'),
  stats: [
    { value: '1st', label: L('Asteroid landing') },
    { value: '~160,000', label: L('Photos of Eros') },
    { value: '1', label: L('Surprise landing') },
  ],
  science: [
    { text: L('Became the first spacecraft to orbit an asteroid, Eros, on February 14, 2000.'), source: NEAR },
    { text: L('Landed on Eros on February 12, 2001, the first landing on an asteroid.'), source: NEAR },
    { text: L('It was not designed to land, but kept sending data from the surface.'), source: NEAR },
    { text: L('Sent back about 160,000 pictures of Eros.'), source: NEAR },
  ],
  story: [
    { kicker: L('POV: you landed on a space potato'), line: L("Welcome to Eros! It's a giant space potato, and I live on it.") },
    { kicker: L("Valentine's Day, 2000"), line: L('On February 14, I started circling asteroid Eros. Eros, the god of love. Get it?') },
    { kicker: L('Surprise landing'), line: L('I was never built to land. But in February 2001, I touched down anyway!') },
    { kicker: L('Still here'), line: L('I kept talking from the surface for about two weeks. Now I rest here. Quiz?') },
  ],
  quiz: [
    { statement: L('I was the first spacecraft to land on an asteroid.'), isFact: true, why: L('Eros, February 12, 2001.'), hint: L('Look at my stats.') },
    { statement: L('I was built to be a lander.'), isFact: false, why: L('I was built to orbit. Landing was a bonus!'), hint: L('Remember my surprise landing.') },
    { statement: L("I started orbiting Eros on Valentine's Day."), isFact: true, why: L('February 14, 2000.'), hint: L('What day is February 14?') },
  ],
  photos: [nasaPhoto('near-1.jpg', 'PIA18177', "NASA artist's picture of me arriving at asteroid Eros.", JPL)],
  card: { image: '/images/cards/near.jpg' },
  verified: false,
}

export const dawn: Device = {
  id: 'dawn',
  world: 'deep',
  name: 'Dawn',
  nickname: 'Dawn',
  handle: 'dawn.circles.ceres',
  location: { label: 'In orbit around dwarf planet Ceres' },
  joined: 'March 2015',
  status: L('Out of fuel, still circling Ceres'),
  active: false,
  bio: L('I visited two worlds in the asteroid belt, Vesta and Ceres, pushed by gentle glowing ion engines.'),
  stats: [
    { value: '2', label: L('Worlds orbited') },
    { value: '11', label: L('Years flying') },
    { value: 'Ion', label: L('Engines') },
  ],
  science: [
    { text: L('Orbited the giant asteroid Vesta, then the dwarf planet Ceres.'), source: DAWN },
    { text: L('The first spacecraft to orbit two different worlds beyond Earth.'), source: DAWN },
    { text: L('Used ion engines, which push very gently but for a very long time.'), source: DAWN },
    { text: L('Ran out of fuel in 2018 and stays in orbit around Ceres.'), source: DAWN },
  ],
  story: [
    { kicker: L('POV: you met a gentle pusher'), line: L("Hi, I'm Dawn. My ion engines glow blue and push me super gently.") },
    { kicker: L('Two worlds'), line: L('First I circled giant asteroid Vesta. Then I flew on to dwarf planet Ceres.') },
    { kicker: L('Bright spots'), line: L('On Ceres I found mysterious bright spots. They turned out to be salty minerals!') },
    { kicker: L('Still circling'), line: L('In 2018 my fuel ran out. I still circle Ceres today. Quiz?') },
  ],
  quiz: [
    { statement: L('I orbited two different worlds.'), isFact: true, why: L('Vesta, then Ceres.'), hint: L('Count the worlds in my story.') },
    { statement: L('My ion engines push me really hard, all at once.'), isFact: false, why: L('They push very gently, but they keep going for years.'), hint: L('How did I describe my push?') },
    { statement: L('I am still circling Ceres.'), isFact: true, why: L('Out of fuel, but still in orbit.'), hint: L('Read my status.') },
  ],
  photos: [
    nasaPhoto('dawn-1.jpg', 'PIA19167', 'Dwarf planet Ceres, as I saw it on my way in.', JPL),
    nasaPhoto('dawn-2.jpg', 'KSC-07PD-0859', 'Me being prepared for launch at Kennedy Space Center, 2007.'),
  ],
  card: { image: '/images/cards/dawn.jpg' },
  verified: false,
}

export const pioneer10: Device = {
  id: 'pioneer10',
  world: 'deep',
  name: 'Pioneer 10',
  nickname: 'Pioneer 10',
  handle: 'pioneer10.far.away',
  location: { label: 'Heading out of the solar system' },
  joined: 'March 1972',
  status: L('Last heard from: January 2003'),
  active: false,
  bio: L('The first spacecraft through the asteroid belt and the first to visit Jupiter. I carry a message for anyone who finds me.'),
  stats: [
    { value: '1st', label: L('Jupiter visit') },
    { value: '30+', label: L('Years talking') },
    { value: '1', label: L('Message plaque') },
  ],
  science: [
    { text: L('The first spacecraft to fly through the asteroid belt.'), source: PIONEER10 },
    { text: L('The first spacecraft to fly past Jupiter, in December 1973.'), source: PIONEER10 },
    { text: L('Carries a plaque with a picture message about who sent it and where from.'), source: PIONEER10 },
    { text: L('Its last signal reached Earth in January 2003.'), source: PIONEER10 },
  ],
  story: [
    { kicker: L('POV: you met a far traveler'), line: L("Hello from far, far away! I'm Pioneer 10, still flying away from the Sun.") },
    { kicker: L('First through the belt'), line: L('In 1972 nobody knew if the asteroid belt was safe to cross. I went first!') },
    { kicker: L('Hello, Jupiter'), line: L('In December 1973 I became the first spacecraft to visit Jupiter.') },
    { kicker: L('A message'), line: L('I carry a plaque with a picture of people, in case anyone finds me. Quiz?') },
  ],
  quiz: [
    { statement: L('I was the first spacecraft to visit Jupiter.'), isFact: true, why: L('December 1973.'), hint: L('Remember "Hello, Jupiter".') },
    { statement: L('I still send messages to Earth today.'), isFact: false, why: L('My last signal arrived in 2003.'), hint: L('Read my status.') },
    { statement: L('I carry a picture message for anyone who finds me.'), isFact: true, why: L('A plaque showing people and where I came from.'), hint: L('What is on my plaque?') },
  ],
  photos: [nasaPhoto('pioneer10-1.jpg', 'ARC-1972-AC72-2135', 'Me being built, before my launch in 1972.', 'NASA Ames')],
  card: { image: '/images/cards/pioneer10.jpg' },
  verified: false,
}

export const kepler: Device = {
  id: 'kepler',
  world: 'deep',
  secret: { cost: 50 },
  name: 'Kepler Space Telescope',
  nickname: 'Kepler',
  handle: 'kepler.planet.hunter',
  location: { label: 'Drifting around the Sun, behind Earth' },
  joined: 'March 2009',
  status: L('Retired in October 2018'),
  active: false,
  bio: L('The planet hunter. I watched stars for tiny blinks and found thousands of planets around other stars.'),
  stats: [
    { value: '2,662', label: L('Planets found') },
    { value: '9', label: L('Years hunting') },
    { value: '2018', label: L('Retired') },
  ],
  science: [
    { text: L('Watched stars for tiny dips in light caused by planets passing in front of them.'), source: KEPLER },
    { text: L('Discovered 2,662 confirmed planets beyond our solar system.'), source: KEPLER },
    { text: L('Retired in October 2018 after running out of fuel.'), source: KEPLER },
    { text: L('Drifts around the Sun in an orbit that trails behind Earth.'), source: KEPLER },
  ],
  story: [
    { kicker: L('POV: you found the legend'), line: L("You unlocked me! I'm Kepler, the planet hunter.") },
    { kicker: L('Staring contest'), line: L('I stared at the same patch of sky for years, watching thousands of stars.') },
    { kicker: L('Tiny blinks'), line: L('When a planet passes its star, the star dims a tiny bit. I spotted those blinks.') },
    { kicker: L('Planet party'), line: L('I found 2,662 planets! Some might be a bit like Earth. Quiz?') },
  ],
  quiz: [
    { statement: L('I found planets by watching stars dim a tiny bit.'), isFact: true, why: L('A passing planet blocks a little starlight.'), hint: L('Remember the tiny blinks.') },
    { statement: L('I found 26 planets.'), isFact: false, why: L('I found 2,662!'), hint: L('Look at my stats.') },
    { statement: L('I now drift around the Sun, behind Earth.'), isFact: true, why: L('My orbit trails behind our planet.'), hint: L('Read where I live.') },
  ],
  photos: [
    nasaPhoto('kepler-1.jpg', 'PIA11825', "NASA artist's picture of me in space.", JPL),
    nasaPhoto('kepler-2.jpg', 'PIA11188', 'Me in a clean room before launch.', JPL),
  ],
  card: { image: '/images/cards/kepler.jpg' },
  miniGame: 'transit',
  verified: false,
}
