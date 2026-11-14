// Real NASA recordings (US government works, public domain), shipped in public/audio/nasa/ so they play as soon as
// the site loads. A clip with no `file` falls back to its synth sound. Big WAVs were trimmed and made mono (see docs/sound-plan.md).
export type NasaClip = {
  file?: string
  title: string
  source: string // where NASA publishes it
  volume?: number
  start?: number // seconds into the file where the useful part begins
  length?: number // seconds to play from `start` (whole rest of the file if left out)
}

export const nasaClips = {
  liftoff: {
    file: '/audio/nasa/liftoff.mp3',
    title: 'Apollo 11: We have lift-off',
    source: 'https://www.nasa.gov/historical-sounds/',
    start: 16, // the end of the countdown: "…all engines running. Lift-off!"
    volume: 0.9,
  },
  rocket: {
    file: '/audio/nasa/rocket.mp3',
    title: 'Atlas V launch',
    source: 'https://www.nasa.gov/historical-sounds/',
    length: 8,
    volume: 1,
  },
  smallStep: {
    file: '/audio/nasa/smallStep.mp3',
    title: "Apollo 11: That's one small step for (a) man",
    source: 'https://www.nasa.gov/historical-sounds/',
    volume: 0.9,
  },
  quindar: {
    file: '/audio/nasa/quindar.mp3',
    title: 'Quindar tone (Apollo radio beep)',
    source: 'https://www.nasa.gov/historical-sounds/',
    start: 2.42, // the file is 24 s of radio; this is one clean beep
    length: 0.3,
    volume: 0.8,
  },
  sputnik: {
    file: '/audio/nasa/sputnik.mp3',
    title: 'Sputnik beep',
    source: 'https://www.nasa.gov/historical-sounds/',
    length: 1.2,
    volume: 0.6,
  },
  marsWind: {
    file: '/audio/nasa/marsWind.wav',
    title: "Perseverance's SuperCam records wind on Mars",
    source: 'https://www.nasa.gov/sounds-from-beyond/',
  },
  ingenuity: {
    // not used by any screen yet, so not shipped
    title: 'Ingenuity Mars Helicopter in flight, heard by Perseverance',
    source: 'https://www.nasa.gov/sounds-from-beyond/',
  },
  laser: {
    file: '/audio/nasa/laser.wav',
    title: 'First acoustic recording of laser shots on Mars',
    source: 'https://www.nasa.gov/sounds-from-beyond/',
    volume: 0.8,
  },
  dustDevil: {
    file: '/audio/nasa/dustDevil.wav',
    title: 'Perseverance records a Martian dust devil',
    source: 'https://www.nasa.gov/sounds-from-beyond/',
  },
  keplerStar: {
    file: '/audio/nasa/keplerStar.mp3',
    title: 'Kepler: a star’s light curve turned into sound',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
  voyager: {
    // NASA's "interstellar plasma" link is gone (404); this is Voyager's other plasma-wave recording on the same page
    file: '/audio/nasa/voyager.mp3',
    title: 'Voyager: lightning "whistlers" at Jupiter (plasma wave sounds)',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
} satisfies Record<string, NasaClip>

export type NasaClipId = keyof typeof nasaClips
