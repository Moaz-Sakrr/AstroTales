# Rumble — ElevenLabs voice script

Apollo 12 ALSEP (NSSDCA 1969-099C). One voice for everything Rumble says.

## How to generate
- **Model:** Eleven v3. Stability: **Creative** (or **Natural** if the voice starts to wobble).
- Words in square brackets like `[excited]` are emotion directions: v3 acts them out and does not say them. Paste everything inside the code text.
- The spoken words match the on-screen text exactly, so the subtitles line up. If you change a line here, change it in the app too.
- Big smile, fast-ish but clear, like talking to a 9-year-old friend. Story cards under ~10 seconds, short game lines under ~3 seconds.
- Regenerate 2–3 times and keep the most fun take. Credit "Voices by ElevenLabs".

**Voice Design prompt:**
> A warm, curious young voice, like a friendly cartoon detective who loves secrets. Starts soft and whispery, then bursts with excitement. Clear American English, playful and upbeat.

---

## Story (4 cards) → `public/audio/en/rumble/`

| Card | File | Script |
|---|---|---|
| 0 | `0.mp3` | `[whispers] Shh! Hear that? [excited] I'm Rumble. I listen to the Moon and feel every little shake.` |
| 1 | `1.mp3` | `[proudly] Pete Conrad and Alan Bean set me up in the Ocean of Storms, [playful] near an old robot.` |
| 2 | `2.mp3` | `[dramatic] After they left, their empty lander crashed on purpose. [excited] I felt the first moonquake ever made by people!` |
| 3 | `3.mp3` | `[warmly] A nuclear battery kept me listening for eight years. [excited] Ready for my quiz?` |

---

## Mini-game "Set up the station" → `public/audio/en/rumble/game/`

| Moment | File | Script |
|---|---|---|
| How to play | `intro.mp3` | `[excited] Pete Conrad and Alan Bean just landed me on the Moon. [playful] Help them switch me on: give me power, test my ears, [proudly] and aim my antenna at Earth!` |
| Fuel is stuck | `hammer.mp3` | `[worried] Uh-oh! My fuel is stuck in its can. [determined] Tap the can to bang it with the hammer!` |
| Hammer hit 1 | `bonk-4.mp3` | `[shouts] BONK! [hopeful] It moved a little… 4 more!` |
| Hammer hit 2 | `bonk-3.mp3` | `[shouts] BONK! [excited] It moved a little… 3 more!` |
| Hammer hit 3 | `bonk-2.mp3` | `[shouts] BONK! [excited] It moved a little… 2 more!` |
| Hammer hit 4 | `bonk-1.mp3` | `[shouts] BONK! [very excited] It moved a little… 1 more!` |
| Fuel is free | `loose.mp3` | `[relieved] It's loose! [excited] Drag the hot fuel rod into my battery, the one with fins.` |
| Fuel dropped in the wrong place | `miss-fuel.mp3` | `[playful] Not there! [helpful] The fuel goes in the battery with fins.` |
| Battery on | `powered.mp3` | `[sighs happily] Ahh, toasty! [proudly] About 4 kg of plutonium fuel gives me about 70 watts.` |
| Carry the seismometer | `seismo.mp3` | `[curious] Now carry my seismometer to the glowing spot. [whispers] It is my ears!` |
| Seismometer in the wrong place | `miss-seismo.mp3` | `[politely] Put it on the glowing spot, please!` |
| Start hopping | `stomp.mp3` | `[excited] Test my ears! Tap the ground to hop. [playful] Land close to me for a BIG shake.` |
| Small shake | `small.mp3` | `[unimpressed] Just a tiny wiggle. [encouraging] Hop closer to me!` |
| Big shake | `big.mp3` | `[gasps] WHOA! [laughs] I felt that one!` |
| Third big shake | `big-done.mp3` | `[proudly] My ears work! [happy] I can feel every shake.` |
| Aim the antenna | `aim.mp3` | `[determined] Last job: aim my antenna at Earth! [helpful] Drag in the sky, or use the turn buttons.` |
| Antenna locked | `locked.mp3` | `[overjoyed] Earth can hear me! [proudly] Sending my science home.` |
| Lander takes off | `liftoff.mp3` | `[warmly] Pete and Alan are flying back to orbit. [a little sad] Bye, Intrepid!` |
| Empty lander falls | `incoming.mp3` | `[nervous, building suspense] Here comes their empty lander… [dramatic] crashing back on purpose!` |
| Moonquake | `boom.mp3` | `[shouts] BOOM! [amazed] The first moonquake made by people, [laughs] and I felt ALL of it!` |
| Mission complete | `win.mp3` | `[proudly] You did what Pete Conrad and Alan Bean did on November 19, 1969, [laughs] hammer and all! [dramatic] The next day their empty lander crashed back on purpose, [amazed] and I felt the first moonquake ever made by people.` |
