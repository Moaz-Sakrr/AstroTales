// Data model for all content — docs/PROJECT_PLAN.md §11.
// English only for the MVP. To add Arabic: add 'ar-EG' here and TS flags every missing string.
export type Lang = 'en'
export type L10n = Record<Lang, string>

export type WorldId = 'moon' | 'mars' | 'secret'

export type StoryCard = {
  kicker: L10n // small label, e.g. "POV: you are a mirror on the Moon"
  line: L10n // what the device says (≤ 20 words)
  audio: Record<Lang, string> // '/audio/en/reflecto/0.mp3'
  timings?: Record<Lang, number[]> // optional per-character times (ms) from ElevenLabs
  scene?: { pointer?: boolean; beam?: boolean } // per-card scene effects
}

export type Fact = { text: L10n; source: string } // source = NSSDCA / NASA URL

export type QuizCard = {
  statement: L10n
  isFact: boolean
  why: L10n
  hint: L10n
}

export type Device = {
  id: string // 'reflecto'
  world: WorldId
  name: string // 'Apollo 11 Laser Ranging Retroreflector'
  nickname: string // 'Reflecto'
  handle: string // 'reflecto.on.moon'
  nssdcaId?: string // '1969-059C'
  location: { label: string; lat: number; lon: number } // real coordinates
  mapPos: { x: number; y: number } // % position on our map image
  live: boolean // true = still in use / still talking to Earth
  status: L10n // 'Still in use by scientists' / 'Last seen: June 10, 2018'
  bio: L10n
  stats: { value: string; label: L10n }[] // 3 stats
  science: Fact[]
  story: StoryCard[] // exactly 4
  quiz: QuizCard[] // exactly 3
  miniGame?: 'laser' | 'dust' | 'fly' | 'drive'
  model3d?: string // '/models/opportunity.glb' (stretch)
  collectible: { power: L10n; superpower: L10n; distanceHome: string; rarity: 1 | 2 | 3 }
  credits: string[] // image/model credits, e.g. 'NASA/JPL-Caltech'
}

export type World = {
  id: WorldId
  name: L10n
  unlockCoins: number // total coins earned needed to open this world (0 = open)
  devices: string[] // device ids in level order
  distance: Fact // how far it is from Earth, sourced
}
