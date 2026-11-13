// Data model for all content. Every device file in src/content/devices/ follows `Device`.
// English only for the MVP. To add Arabic: add 'ar-EG' here and TS flags every missing string.
export type Lang = 'en'
export type L10n = Record<Lang, string>

export type WorldId = 'moon' | 'mars' | 'deep'

export type StoryCard = {
  kicker: L10n // small label, e.g. "POV: you are a mirror on the Moon"
  line: L10n // what the device says (≤ 20 words)
  audio?: Record<Lang, string> // '/audio/en/reflecto/0.mp3' once voice-over exists
}

export type Fact = { text: L10n; source: string } // source = NSSDCA / NASA URL

export type QuizCard = {
  statement: L10n
  isFact: boolean
  why: L10n
  hint: L10n
}

export type Photo = { src: string; caption: L10n; credit: string; source: string }

export type MiniGameId = 'laser' | 'dust' | 'transit' | 'lander'

export type CardStyle ='light' | 'thrust' | 'wheels' | 'dust' | 'air' | 'secret'

export type Device = {
  id: string
  world: WorldId
  secret?: { cost: number } // secret levels unlock with coins
  name: string // official name
  nickname: string
  handle: string
  nssdcaId?: string
  location: { label: string; lat?: number; lon?: number } // no coordinates for things flying through space
  joined: string // date it arrived, shown like "Joined July 1969"
  status: L10n
  active: boolean // still working today?
  bio: L10n
  stats: { value: string; label: L10n }[] // exactly 3
  science: Fact[]
  story: StoryCard[] // exactly 4
  quiz: QuizCard[] // exactly 3
  photos: Photo[]
  // The design team's card art (public/images/cards/<id>.jpg), or a generated card until the art exists.
  card:
    | { image: string }
    | {
        style: CardStyle
        type: string // shown on the card, e.g. "Light"
        stat: { value: string; label: string } // big number top-right
        power: L10n
        superpower: L10n
      }
  miniGame?: MiniGameId // played after the quiz, before the card
  verified: boolean // true once the content team checked every fact against its source
}
