# Sound plan (branch `feat/sound`)

Status: built (branch `feat/sound-nasa`). Engine, synth effects, generated music, the sound button and the real NASA
recordings are all in, so every sound plays as soon as the site is used: nothing to download or set up.
A clip without a `file` in `src/content/sounds.ts` falls back to its synth sound.

## Rules
- No sound before the kid's first tap (browsers block autoplay): resume the AudioContext on the first pointerdown/keydown.
- One sound button (Landing, Level map, Space headers) opens two switches: Music, Sound effects. Saved in `useSound`.
- Device voices (Story) are never muted by these switches; music ducks to ~25% while a voice plays.
- UI sounds < 250 ms, quiet, never harsh (wrong answer = soft "bonk").
- Every NASA file goes in `public/audio/nasa/`, converted to small MP3/OGG (ffmpeg, mono, 64–96 kbps, trimmed).
  Set `file` on its entry in `src/content/sounds.ts`; the engine plays the synth fallback while `file` is missing.

## Engine
- `src/audio/engine.ts`: one AudioContext, buses master → music / effects. `sfx(name)`, `setMusic(track)`, `duck(on)`, `thrust(on)`, `cruise(on)`,
  `clip(nasaId, fallback)` (NASA file, or the synth fallback while it's missing), `loopClip(nasaId)`, `stopClips()`.
  `<Button sound="…">` picks a button's tap sound (`null` when the screen plays its own).
- `src/audio/synth.ts`: Web Audio effects: tap, pop, whoosh, warp, beep, go, rumble, thud, ding, coin, bonk, pling,
  stamp, flip, rip, sparkle, fanfare, step, unlock, locked, pew, ping, brush, crash, blip, swipe, scan.
- `src/audio/music.ts`: soft generated ambient loop per track: home, space, moon, mars, deep, play (quiz + mini-games).
  Mars plays NASA Mars wind under it, deep space plays Voyager plasma waves.
- App picks the track from the screen + world.

## Where each sound goes
| Screen | Event | Sound |
|---|---|---|
| All | any `<Button>` | tap |
| Character | pick boy/girl | pop |
| Launch | each countdown number | beep (NASA quindar when ready) |
| Launch | ignition + liftoff | rumble / NASA "We have lift-off" + Atlas V |
| Space | leaving Earth + flying to a world | engine rumble (`cruise`, fades out on arrival) |
| Space | pick a world | warp; locked world = locked; planet tag = blip (NASA Sputnik) |
| Level map | ship comes down / touchdown | soft engine hum (`cruise`) → thud + "landed" chime (the NASA voice was removed: kids found it annoying) |
| Level map | level tap / secret unlocked / not enough coins | pop / unlock / locked |
| Story | next card | swipe (+ NASA quindar before the voice) |
| Quiz | right / wrong / hint / next | ding + coin / bonk / pling / swipe |
| Laser Ping | fire / caught / miss | pew (NASA laser) / ping + ding / bonk |
| Dust Buster | wiping / dust devil | brush (throttled) / whoosh (NASA dust devil) |
| Planet Hunter | transit found / noise | blip + ding / bonk (NASA Kepler star as the star's hum) |
| Lunar Lander | engine / landed / crashed | thrust loop / thud / crash |
| Mini-game | won | fanfare |
| Card reward | card appears | rip → flip → sparkle + fanfare (Eagle: NASA "one small step") |

## NASA files (shipped in `public/audio/nasa/`, ~2.6 MB, all load on the kid's first tap)
Downloaded from NASA and set in `src/content/sounds.ts`. The MP3s are NASA's own files; for long ones `start` / `length`
pick the useful part. The big WAVs were cut, made mono and resampled to 16-bit 16–22 kHz (Python + SciPy).

| id | NASA file | what ships |
|---|---|---|
| liftoff | historical-sounds: 590320main_ringtone_apollo11_countdown.mp3 | whole file, plays from 16 s ("…Lift-off!") |
| rocket | historical-sounds: 590329main_ringtone_SDO_launchNats.mp3 | whole file, first 8 s |
| smallStep | historical-sounds: 590331main_ringtone_smallStep.mp3 | whole file |
| quindar | historical-sounds: 578628main_hskquindar.mp3 | whole file, one beep at 2.42 s (0.3 s) |
| sputnik | historical-sounds: 578626main_sputnik-beep.mp3 | whole file, first 1.2 s |
| keplerStar | historical-sounds: 578358main_kepler_star_KIC12268220C.mp3 | whole file (loops in Planet Hunter) |
| voyager | historical-sounds: 603921main_voyager_jupiter_lightning.mp3 | whole file (deep-space music bed). Replaces `interstellar.mp3`, which NASA no longer serves (404). |
| marsWind | sounds-from-beyond: scam-mic-sol004-run001.wav | 18–34 s, 16 kHz mono, seamless loop (Mars music bed) |
| laser | sounds-from-beyond: scam-mic-sol012-run001.wav | 0.96–1.95 s (3 zaps), 22 kHz mono |
| dustDevil | sounds-from-beyond: pia25657.wav | 9.6–16.5 s (the gust), 22 kHz mono |
| ingenuity | sounds-from-beyond: jpl-20210506-…-flies-on-mars.wav | not shipped: no screen uses it yet |

`start` points were found by measuring the audio (loudness and the 2525 Hz quindar tone), not by ear: listen once and
nudge `start` / `length` in `src/content/sounds.ts` if a cut lands mid-word.
