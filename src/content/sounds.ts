// Real NASA recordings (US government works, public domain). Each one replaces a synth effect once its file
// is in public/audio/nasa/. Until then `file` is left out and the game plays the synth version instead.
export type NasaClip = {
  file?: string // '/audio/nasa/liftoff.mp3' once the file is in the repo
  title: string
  source: string // where NASA publishes it
  volume?: number
}

export const nasaClips = {
  liftoff: {
    title: 'Apollo 11: We have lift-off',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
  rocket: {
    title: 'Atlas V launch',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
  eagleLanded: {
    title: 'Apollo 11: The Eagle has landed',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
  smallStep: {
    title: "Apollo 11: That's one small step for (a) man",
    source: 'https://www.nasa.gov/historical-sounds/',
  },
  quindar: {
    title: 'Quindar tone (Apollo radio beep)',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
  sputnik: {
    title: 'Sputnik beep',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
  marsWind: {
    title: "Perseverance's SuperCam records wind on Mars",
    source: 'https://www.nasa.gov/sounds-from-beyond/',
  },
  ingenuity: {
    title: "Ingenuity Mars Helicopter in flight, heard by Perseverance",
    source: 'https://www.nasa.gov/sounds-from-beyond/',
  },
  laser: {
    title: 'First acoustic recording of laser shots on Mars',
    source: 'https://www.nasa.gov/sounds-from-beyond/',
  },
  dustDevil: {
    title: 'Perseverance records a Martian dust devil',
    source: 'https://www.nasa.gov/sounds-from-beyond/',
  },
  keplerStar: {
    title: 'Kepler: a star’s light curve turned into sound',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
  interstellar: {
    title: 'Voyager: interstellar plasma sounds',
    source: 'https://www.nasa.gov/historical-sounds/',
  },
} satisfies Record<string, NasaClip>

export type NasaClipId = keyof typeof nasaClips
