import type { L10n } from './types'

// L('text') builds an L10n value; tx(value) reads it in the current language.
export const L = (en: string): L10n => ({ en })
export const tx = (value: L10n) => value.en

// Photo from images.nasa.gov (public domain), saved in public/images/devices/.
export const nasaPhoto = (file: string, nasaId: string, caption: string, credit = 'NASA') => ({
  src: `/images/devices/${file}`,
  caption: L(caption),
  credit,
  source: `https://images.nasa.gov/details/${nasaId}`,
})
