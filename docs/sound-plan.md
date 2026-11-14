# Sound plan (branch `feat/sound`)

Status: started. Only `src/store/sound.ts` (music / effects on-off, saved on the device) and
`src/content/sounds.ts` (NASA clip list with sources) exist so far. Nothing is wired yet.

## Rules
- No sound before the kid's first tap (browsers block autoplay): resume the AudioContext on the first pointerdown/keydown.
- One sound button (Landing, Level map, Space headers) opens two switches: Music, Sound effects. Saved in `useSound`.
- Device voices (Story) are never muted by these switches; music ducks to ~25% while a voice plays.
- UI sounds < 250 ms, quiet, never harsh (wrong answer = soft "bonk").
- Every NASA file goes in `public/audio/nasa/`, converted to small MP3/OGG (ffmpeg, mono, 64–96 kbps, trimmed).
  Set `file` on its entry in `src/content/sounds.ts`; the engine plays the synth fallback while `file` is missing.

## Engine (to build)
- `src/audio/engine.ts`: one AudioContext, buses master → music / effects. `sfx(name)`, `setMusic(track)`, `duck(on)`, `thrust(on)`.
- `src/audio/synth.ts`: Web Audio effects: tap, pop, whoosh, warp, beep, go, rumble, thud, ding, coin, bonk, pling,
  stamp, flip, rip, sparkle, fanfare, step, unlock, locked, pew, ping, brush, crash, blip, swipe, scan.
- `src/audio/music.ts`: soft generated ambient loop per track: home, space, moon, mars, deep, play (quiz + mini-games).
  Mars plays NASA Mars wind under it, deep space plays Voyager plasma / Kepler star once those files exist.
- App picks the track from the screen + world.

## Where each sound goes
| Screen | Event | Sound |
|---|---|---|
| All | any `<Button>` | tap |
| Character | pick boy/girl | pop |
| Launch | each countdown number | beep (NASA quindar when ready) |
| Launch | ignition + liftoff | rumble / NASA "We have lift-off" + Atlas V |
| Space | fly to a world | warp; locked world = locked; planet tag = blip (NASA Sputnik) |
| Level map | lander comes down / touchdown | rumble → thud; on the Moon then NASA "The Eagle has landed" |
| Level map | level tap / secret unlocked / not enough coins | pop / unlock / locked |
| Story | next card | swipe (+ NASA quindar before the voice) |
| Quiz | right / wrong / hint / next | ding + coin / bonk / pling / swipe |
| Laser Ping | fire / caught / miss | pew (NASA laser) / ping + ding / bonk |
| Dust Buster | wiping / dust devil | brush (throttled) / whoosh (NASA dust devil) |
| Planet Hunter | transit found / noise | blip + ding / bonk (NASA Kepler star as the star's hum) |
| Lunar Lander | engine / landed / crashed | thrust loop / thud / crash |
| Mini-game | won | fanfare |
| Card reward | card appears | rip → flip → sparkle + fanfare (Eagle: NASA "one small step") |

## NASA files to add (download by hand: the build server can't reach nasa.gov)
From https://www.nasa.gov/historical-sounds/
- liftoff: https://www.nasa.gov/wp-content/uploads/2015/01/590320main_ringtone_apollo11_countdown.mp3
- rocket: https://www.nasa.gov/wp-content/uploads/2015/01/590329main_ringtone_SDO_launchNats.mp3
- eagleLanded: https://www.nasa.gov/wp-content/uploads/2015/01/569462main_eagle_has_landed.mp3
- smallStep: https://www.nasa.gov/wp-content/uploads/2015/01/590331main_ringtone_smallStep.mp3
- quindar: https://www.nasa.gov/wp-content/uploads/2015/01/578628main_hskquindar.mp3
- sputnik: https://www.nasa.gov/wp-content/uploads/2015/01/578626main_sputnik-beep.mp3
- keplerStar: https://www.nasa.gov/wp-content/uploads/2015/01/578358main_kepler_star_KIC12268220C.mp3
- interstellar: https://www.nasa.gov/externalflash/interstellar.mp3

From https://www.nasa.gov/sounds-from-beyond/
- marsWind: https://www.nasa.gov/wp-content/uploads/2024/05/scam-mic-sol004-run001.wav
- ingenuity: https://www.nasa.gov/wp-content/uploads/2024/05/jpl-20210506-listen-to-nasas-ingenuity-helicopter-as-it-flies-on-mars.wav
- laser: https://www.nasa.gov/wp-content/uploads/2024/05/scam-mic-sol012-run001.wav
- dustDevil: https://www.nasa.gov/wp-content/uploads/2024/05/pia25657.wav
