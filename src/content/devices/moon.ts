import type { Device } from '../types'
import { L, nasaPhoto } from '../l10n'

// Moon devices. verified:false = the content team still has to check each fact against its source.
const LM11 = 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C'
const APOLLO11 = 'https://www.nasa.gov/mission/apollo-11/'
const LRV = 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C'
const SURVEYOR3 = 'https://science.nasa.gov/mission/surveyor-3/'
const TRANQUILITY = { label: 'Tranquility Base, Sea of Tranquility', lat: 0.674, lon: 23.473 }

export const reflecto: Device = {
  id: 'reflecto',
  world: 'moon',
  name: 'Apollo 11 Laser Ranging Retroreflector',
  nickname: 'Reflecto',
  handle: 'reflecto.on.moon',
  nssdcaId: '1969-059C',
  location: TRANQUILITY,
  joined: 'July 1969',
  status: L('Still working: scientists bounce lasers off me'),
  active: true,
  bio: L('A panel of 100 mirror prisms. I bounce laser light straight back to Earth so scientists can measure the Moon.'),
  stats: [
    { value: '100', label: L('Mirror prisms') },
    { value: '0', label: L('Batteries needed') },
    { value: '2.5 s', label: L('Laser round trip') },
  ],
  science: [
    { text: L('Apollo 11 astronauts set me up on the Moon on July 21, 1969.'), source: LM11 },
    { text: L('I am made of 100 corner-cube prisms. Each one sends light back the way it came.'), source: LM11 },
    { text: L('I need no power, and scientists still use me for lunar laser ranging.'), source: APOLLO11 },
    { text: L('A laser pulse takes about 2.5 seconds to reach me and come back.'), source: APOLLO11 },
  ],
  story: [
    { kicker: L('POV: you are a mirror on the Moon'), line: L("Psst… look down. I'm the shiny box right next to your boots.") },
    { kicker: L('July 21, 1969'), line: L("Neil Armstrong and Buzz Aldrin set me up right here. I've been waiting ever since.") },
    { kicker: L('My daily job'), line: L('Scientists on Earth shoot lasers at me. I bounce them straight back home.') },
    { kicker: L('Your turn'), line: L("That's how they know exactly how far away the Moon is. Ready for my quiz?") },
  ],
  quiz: [
    { statement: L("I'm made of 100 little mirror prisms."), isFact: true, why: L('100 corner cubes, each sends light back the way it came.'), hint: L('Look at the stats on my profile.') },
    { statement: L('A laser takes 2 minutes to reach me.'), isFact: false, why: L('About 1.3 seconds one way, about 2.5 seconds there and back.'), hint: L('Think: seconds or minutes?') },
    { statement: L('Scientists still bounce lasers off me today.'), isFact: true, why: L('Still in use, and no batteries needed.'), hint: L('Check my status on my profile.') },
  ],
  photos: [
    nasaPhoto('reflecto-1.jpg', 'as11-40-5948', 'Buzz Aldrin by the Apollo 11 experiments. I sit behind the seismometer, left of center. Eagle waits in the back.'),
  ],
  card: { style: 'light', type: 'Light', stat: { value: '100', label: 'Prisms' }, power: L('Bounces any laser straight home'), superpower: L('Works for 50+ years with no batteries') },
  verified: false,
}

export const eagle: Device = {
  id: 'eagle',
  world: 'moon',
  name: 'Apollo 11 Lunar Module descent stage',
  nickname: 'Eagle',
  handle: 'eagle.has.landed',
  nssdcaId: '1969-059C',
  location: TRANQUILITY,
  joined: 'July 1969',
  status: L('Resting at Tranquility Base'),
  active: false,
  bio: L('I carried Neil Armstrong and Buzz Aldrin down to the Moon. Then I became their launch pad home.'),
  stats: [
    { value: '1st', label: L('Crewed Moon landing') },
    { value: '2', label: L('Astronauts carried') },
    { value: '4', label: L('Landing legs') },
  ],
  science: [
    { text: L('Landed in the Sea of Tranquility on July 20, 1969.'), source: LM11 },
    { text: L('The top half (the ascent stage) launched from me to take the astronauts back to orbit. I stayed behind.'), source: LM11 },
    { text: L('A plaque on my leg says: "We came in peace for all mankind."'), source: APOLLO11 },
  ],
  story: [
    { kicker: L('POV: you met a launch pad'), line: L('Hey, astronaut! See my gold coat? It is thin foil that protected me from heat.') },
    { kicker: L('July 20, 1969'), line: L('I carried two astronauts down from orbit and landed right here, on four legs.') },
    { kicker: L('My big moment'), line: L('When it was time to go home, my top half blasted off. I was the launch pad.') },
    { kicker: L('Read my leg'), line: L("There's a plaque on my leg with a message for everyone. Quiz time?") },
  ],
  quiz: [
    { statement: L('I landed on the Moon with two astronauts inside.'), isFact: true, why: L('Neil Armstrong and Buzz Aldrin rode me down. Michael Collins stayed in orbit.'), hint: L('Count the astronauts in my story.') },
    { statement: L('I flew back to Earth after the mission.'), isFact: false, why: L('Only my top half left the Moon. I stayed as the launch pad.'), hint: L('Who was the launch pad?') },
    { statement: L('My plaque says "We came in peace for all mankind."'), isFact: true, why: L("It's on the leg by the ladder."), hint: L('Remember the message on my leg.') },
  ],
  photos: [
    nasaPhoto('eagle-1.jpg', 'as11-40-5927', 'Me on the Moon, July 1969. Gold foil and all.'),
    nasaPhoto('eagle-2.jpg', 'as11-40-5902', 'Buzz Aldrin walking near my leg.'),
  ],
  card: { style: 'thrust', type: 'Thrust', stat: { value: '4', label: 'Legs' }, power: L('Lands softly on four legs'), superpower: L('Turns into a launch pad') },
  verified: false,
}

export const rover: Device = {
  id: 'rover',
  world: 'moon',
  name: 'Lunar Roving Vehicle (Apollo 15)',
  nickname: 'Rover',
  handle: 'rover.moon.drive',
  nssdcaId: '1971-063C',
  location: { label: 'Hadley–Apennine', lat: 26.132, lon: 3.634 },
  joined: 'July 1971',
  status: L('Parked at Hadley–Apennine'),
  active: false,
  bio: L('The first car driven on the Moon. Battery powered, folded flat for the trip, and ready to bounce.'),
  stats: [
    { value: '1st', label: L('Car on the Moon') },
    { value: '4', label: L('Wheel motors') },
    { value: '0', label: L('Gas stations') },
  ],
  science: [
    { text: L('First driven on the Moon by the Apollo 15 crew in 1971.'), source: LRV },
    { text: L('Ran on batteries, with an electric motor in each wheel.'), source: LRV },
    { text: L('Traveled to the Moon folded up on the side of the lunar module.'), source: LRV },
  ],
  story: [
    { kicker: L('POV: you found a car on the Moon'), line: L("Vroom! Well, not really. There's no air up here, so no vroom sound.") },
    { kicker: L('1971'), line: L('Apollo 15 astronauts unfolded me and drove me across hills and craters.') },
    { kicker: L('My engine'), line: L('No gas for me. Batteries, and a little electric motor in each wheel.') },
    { kicker: L('Bouncy ride'), line: L('Low gravity makes every bump a bounce. Ready for my quiz?') },
  ],
  quiz: [
    { statement: L('I had a motor in each of my wheels.'), isFact: true, why: L('Four wheels, four electric motors.'), hint: L('Count my motors.') },
    { statement: L('Astronauts filled me up with gas.'), isFact: false, why: L('I ran on batteries. No gas on the Moon!'), hint: L('What did I say about my engine?') },
    { statement: L('I rode to the Moon folded up.'), isFact: true, why: L('I was folded flat on the side of the lunar module.'), hint: L('How did a car fit in a spaceship?') },
  ],
  photos: [
    nasaPhoto('rover-1.jpg', 'as15-86-11603', 'James Irwin working by me during Apollo 15.'),
    nasaPhoto('rover-2.jpg', 'as15-86-11602', 'Parked at Hadley–Apennine, Apollo 15.'),
  ],
  card: { style: 'wheels', type: 'Wheels', stat: { value: '4', label: 'Motors' }, power: L('Drives over dust and craters'), superpower: L('Folds flat for space travel') },
  verified: false,
}

export const surveyor3: Device = {
  id: 'surveyor3',
  world: 'moon',
  secret: { cost: 30 },
  name: 'Surveyor 3',
  nickname: 'Surveyor',
  handle: 'surveyor3.was.here.first',
  location: { label: 'Ocean of Storms', lat: -3.0, lon: -23.4 },
  joined: 'April 1967',
  status: L('Waiting in the Ocean of Storms'),
  active: false,
  bio: L('A robot lander that reached the Moon before any human. Two years later, astronauts came to visit me.'),
  stats: [
    { value: '1967', label: L('Landed') },
    { value: '2', label: L('Astronaut visitors') },
    { value: '1', label: L('Camera taken home') },
  ],
  science: [
    { text: L('Landed on the Moon on April 20, 1967, in the Ocean of Storms.'), source: SURVEYOR3 },
    { text: L('In November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean walked over to me.'), source: SURVEYOR3 },
    { text: L('They brought my camera back to Earth so scientists could study it.'), source: SURVEYOR3 },
  ],
  story: [
    { kicker: L('POV: you found a secret'), line: L("Shh. You found me! I'm a robot that got here before any human did.") },
    { kicker: L('1967'), line: L('I landed all alone, took photos, and dug in the dirt with my little scoop.') },
    { kicker: L('Visitors!'), line: L('Two years later, Apollo 12 astronauts walked over and said hello.') },
    { kicker: L('Souvenir'), line: L('They took my camera home to Earth. Ready for my questions?') },
  ],
  quiz: [
    { statement: L('I landed on the Moon before any human.'), isFact: true, why: L('1967, two years before Apollo 11.'), hint: L('Which came first, 1967 or 1969?') },
    { statement: L('I brought the Apollo 12 astronauts to the Moon.'), isFact: false, why: L("I'm a robot lander. Apollo 12 came on its own and visited me."), hint: L('Did I have room for astronauts?') },
    { statement: L('Astronauts took my camera back to Earth.'), isFact: true, why: L('Scientists wanted to see what the Moon did to it.'), hint: L('Remember my souvenir.') },
  ],
  photos: [
    nasaPhoto('surveyor3-1.jpg', 'as12-48-7136', 'Apollo 12 astronauts visiting me, November 1969.'),
    nasaPhoto('surveyor3-2.jpg', 'as12-48-7121', 'Me in my crater.'),
    nasaPhoto('surveyor3-3.jpg', 'AS12-48-7133', 'Two US spacecraft on the Moon: me, and the Apollo 12 lander.'),
  ],
  card: { style: 'secret', type: 'Secret', stat: { value: '1967', label: 'Landed' }, power: L('Got to the Moon first'), superpower: L('Had real astronaut visitors') },
  verified: false,
}
