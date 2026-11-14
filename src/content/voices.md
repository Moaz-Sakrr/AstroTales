# AstroTales voice scripts (ElevenLabs, English)

One voice per device. One MP3 per story card: `public/audio/en/{deviceId}/{cardIndex}.mp3` (cards 0–3).

## How to generate

- **Model:** Eleven v3. Stability: **Creative** (most expressive) or **Natural** if a voice starts to wobble.
- **Voices:** make each one with **Voice Design** using the prompt under each device, then save it to your library and reuse it for all 4 cards of that device.
- **The spoken words are exactly the on-screen line** from `src/content/devices/*.ts`, so the typewriter subtitles match. Only the `[tags]` are added; v3 acts them out and does not say them. If you change a line here, change it in the device file too.
- Paste one card at a time (everything inside the code block). Regenerate 2–3 times and keep the most fun take.
- **Energy rule for every voice:** big smile, fast-ish but clear, like talking to a 9-year-old friend. Each card must stay under ~10 seconds.
- Never clone a real child's voice. Credit "Voices by ElevenLabs".

---

## 🌙 Moon

### Rumble — `rumble`
**Voice Design prompt:** A warm, curious young voice, like a friendly cartoon detective who loves secrets. Starts soft and whispery, then bursts with excitement. Clear American English, playful and upbeat.

| Card | File | Script |
|---|---|---|
| 0 | `rumble/0.mp3` | `[whispers] Shh! Hear that? [excited] I'm Rumble. I listen to the Moon and feel every little shake.` |
| 1 | `rumble/1.mp3` | `[proudly] Pete Conrad and Alan Bean set me up in the Ocean of Storms, [playful] near an old robot.` |
| 2 | `rumble/2.mp3` | `[dramatic] After they left, their empty lander crashed on purpose. [excited] I felt the first moonquake ever made by people!` |
| 3 | `rumble/3.mp3` | `[warmly] A nuclear battery kept me listening for eight years. [excited] Ready for my quiz?` |

### Eagle — `eagle`
**Voice Design prompt:** A warm, brave, energetic teenage voice, like a fun big brother who loves adventure. Confident, friendly, full of excitement. American English.

| Card | File | Script |
|---|---|---|
| 0 | `eagle/0.mp3` | `[excited] Hey, astronaut! See my gold coat? [cheerful] It is thin foil that protected me from heat.` |
| 1 | `eagle/1.mp3` | `[proudly] I carried two astronauts down from orbit and landed right here, on four legs.` |
| 2 | `eagle/2.mp3` | `[dramatic] When it was time to go home, my top half blasted off. [proudly] I was the launch pad.` |
| 3 | `eagle/3.mp3` | `[warmly] There's a plaque on my leg with a message for everyone. [excited] Quiz time?` |

### Falcon — `falcon`
**Voice Design prompt:** A cheerful, bouncy, super-energetic young voice, like a cartoon race-car fan. Fast, playful, always grinning. American English.

| Card | File | Script |
|---|---|---|
| 0 | `falcon/0.mp3` | `[excited] Hey! I'm Falcon. I brought something to the Moon nobody had brought before: [shouts] a car!` |
| 1 | `falcon/1.mp3` | `[amazed] I landed between tall mountains and a giant canyon called Hadley Rille.` |
| 2 | `falcon/2.mp3` | `[cheerful] Dave Scott and Jim Irwin unfolded the rover from my side and drove off. [laughs] Vroom!` |
| 3 | `falcon/3.mp3` | `[proudly] They stayed almost three days, longer than any crew before. [excited] Ready for my quiz?` |

### Surveyor 3 (secret) — `surveyor3`
**Voice Design prompt:** A small, sneaky, giggly robot voice, like a friendly little robot sharing a secret. Soft and mischievous, then bursting with excitement. American English, slightly robotic edge.

| Card | File | Script |
|---|---|---|
| 0 | `surveyor3/0.mp3` | `[whispers] Shh. [excited] You found me! [mischievously] I'm a robot that got here before any human did.` |
| 1 | `surveyor3/1.mp3` | `[cheerful] I landed all alone, took photos, and dug in the dirt with my little scoop.` |
| 2 | `surveyor3/2.mp3` | `[excited] Two years later, Apollo 12 astronauts walked over and said hello.` |
| 3 | `surveyor3/3.mp3` | `[laughs] They took my camera home to Earth. [excited] Ready for my questions?` |

---

## 🔴 Mars

### Opportunity — `opportunity`
**Voice Design prompt:** A warm, wise, grandparent-like robot voice with a twinkle of fun. Slow and kind, a little tired, but proud and excited to tell stories to kids. American English.

| Card | File | Script |
|---|---|---|
| 0 | `opportunity/0.mp3` | `[warmly] Hi, I'm Oppy. [laughs] Mind the dust. It gets everywhere on Mars.` |
| 1 | `opportunity/1.mp3` | `[excited] I bounced down inside giant airbags and rolled into a tiny crater.` |
| 2 | `opportunity/2.mp3` | `[proudly] My job was 90 days. [excited] I kept going for almost 15 years!` |
| 3 | `opportunity/3.mp3` | `[softly] In 2018 a huge dust storm covered my solar panels. Now I rest here. [warmly] Quiz?` |

### Spirit — `spirit`
**Voice Design prompt:** A bright, curious, adventurous young voice, like a brave explorer kid. Lively, a little cheeky, very friendly. American English.

| Card | File | Script |
|---|---|---|
| 0 | `spirit/0.mp3` | `[excited] Hi! I'm Spirit. Opportunity is my twin. [cheerful] We landed three weeks apart.` |
| 1 | `spirit/1.mp3` | `[playful] I bounced down in Gusev Crater inside airbags, just like my twin.` |
| 2 | `spirit/2.mp3` | `[curious] My broken wheel dragged and dug up bright white soil. [amazed] A clue of old hot springs!` |
| 3 | `spirit/3.mp3` | `[sighs] In 2009 I got stuck in soft sand and could not get out. [cheerful] Quiz time?` |

### Ingenuity — `ingenuity`
**Voice Design prompt:** A tiny, high-energy, giggly voice, like a little flying toy that just learned to fly. Fast, squeaky-bright, bursting with joy. American English.

| Card | File | Script |
|---|---|---|
| 0 | `ingenuity/0.mp3` | `[excited] Bzzz! Up here! [giggles] I'm the tiny helicopter of Mars.` |
| 1 | `ingenuity/1.mp3` | `[whispers] Nobody had ever flown on another planet. [excited] Then I lifted off. [shouts] History!` |
| 2 | `ingenuity/2.mp3` | `[fast] Mars air is super thin, so my blades have to spin really, really fast.` |
| 3 | `ingenuity/3.mp3` | `[proudly] They hoped for 5 flights. I did 72. [playful] Think you can beat my quiz?` |

### Pathfinder — `pathfinder`
**Voice Design prompt:** A goofy, bouncy, cheerful voice, like a happy cartoon character on a trampoline. Big smile, playful sound effects energy. American English.

| Card | File | Script |
|---|---|---|
| 0 | `pathfinder/0.mp3` | `[laughs] Boing! [excited] I landed on Mars wrapped in giant airbags, bouncing like a beach ball.` |
| 1 | `pathfinder/1.mp3` | `[amazed] When I stopped rolling, I opened up like a flower in Ares Vallis.` |
| 2 | `pathfinder/2.mp3` | `[warmly] Then my rover Sojourner rolled down a ramp. [excited] The first rover ever on Mars!` |
| 3 | `pathfinder/3.mp3` | `[cheerful] Together we sent home thousands of pictures. [excited] Ready for my quiz?` |

### InSight — `insight`
**Voice Design prompt:** A calm, curious, gentle young voice, like a kid listening to a secret sound. Starts soft and quiet, then lights up with wonder. American English.

| Card | File | Script |
|---|---|---|
| 0 | `insight/0.mp3` | `[whispers] Shh… hear that? I'm listening to Mars shake. [excited] I'm InSight!` |
| 1 | `insight/1.mp3` | `[calm] I landed on a flat, quiet plain. [cheerful] Perfect for listening.` |
| 2 | `insight/2.mp3` | `[amazed] My super-sensitive seismometer felt more than 1,300 marsquakes!` |
| 3 | `insight/3.mp3` | `[softly] Dust slowly covered my solar panels, and in 2022 I went quiet. [warmly] Quiz?` |

### Viking 1 (secret) — `viking1`
**Voice Design prompt:** A playful old-timer robot voice, like a fun grandpa who loves showing off old photos. Proud, chuckly, full of wonder. American English.

| Card | File | Script |
|---|---|---|
| 0 | `viking1/0.mp3` | `[whispers] Shh, [proudly] I'm the oldest one here. [excited] I landed way back in 1976!` |
| 1 | `viking1/1.mp3` | `[amazed] Exactly seven years after the first Moon landing, I touched down on Mars.` |
| 2 | `viking1/2.mp3` | `[excited] I took the very first photo from the surface of Mars. [laughs] It showed my own foot!` |
| 3 | `viking1/3.mp3` | `[curious] I scooped up dirt to test it for tiny life. [cheerful] Quiz time?` |

---

## 🌌 Deep space

### NEAR Shoemaker — `near`
**Voice Design prompt:** A silly, joke-loving young voice, like a class clown who is also really smart. Bright, cheeky, laughs at its own jokes. American English.

| Card | File | Script |
|---|---|---|
| 0 | `near/0.mp3` | `[excited] Welcome to Eros! [laughs] It's a giant space potato, and I live on it.` |
| 1 | `near/1.mp3` | `[cheerful] On February 14, I started circling asteroid Eros. Eros, the god of love. [playful] Get it?` |
| 2 | `near/2.mp3` | `[mischievously] I was never built to land. [excited] But in February 2001, I touched down anyway!` |
| 3 | `near/3.mp3` | `[proudly] I kept talking from the surface for about two weeks. [softly] Now I rest here. [cheerful] Quiz?` |

### Dawn — `dawn`
**Voice Design prompt:** A gentle, glowing, friendly young voice, like a kind space explorer. Soft and smooth, with sparkling excitement when sharing discoveries. American English.

| Card | File | Script |
|---|---|---|
| 0 | `dawn/0.mp3` | `[warmly] Hi, I'm Dawn. [excited] My ion engines glow blue and push me super gently.` |
| 1 | `dawn/1.mp3` | `[cheerful] First I circled giant asteroid Vesta. [excited] Then I flew on to dwarf planet Ceres.` |
| 2 | `dawn/2.mp3` | `[curious] On Ceres I found mysterious bright spots. [amazed] They turned out to be salty minerals!` |
| 3 | `dawn/3.mp3` | `[softly] In 2018 my fuel ran out. [warmly] I still circle Ceres today. [cheerful] Quiz?` |

### Pioneer 10 — `pioneer10`
**Voice Design prompt:** A brave, adventurous voice that sounds far away, like an explorer calling from a distant land. Bold, excited, a little echoey and dreamy. American English.

| Card | File | Script |
|---|---|---|
| 0 | `pioneer10/0.mp3` | `[excited] Hello from far, far away! [proudly] I'm Pioneer 10, still flying away from the Sun.` |
| 1 | `pioneer10/1.mp3` | `[dramatic] In 1972 nobody knew if the asteroid belt was safe to cross. [proudly] I went first!` |
| 2 | `pioneer10/2.mp3` | `[amazed] In December 1973 I became the first spacecraft to visit Jupiter.` |
| 3 | `pioneer10/3.mp3` | `[warmly] I carry a plaque with a picture of people, in case anyone finds me. [cheerful] Quiz?` |

### Kepler (secret) — `kepler`
**Voice Design prompt:** A sharp, super-excited, nerdy young voice, like a kid detective who just cracked the case. Quick, enthusiastic, full of wonder. American English.

| Card | File | Script |
|---|---|---|
| 0 | `kepler/0.mp3` | `[excited] You unlocked me! [proudly] I'm Kepler, the planet hunter.` |
| 1 | `kepler/1.mp3` | `[playful] I stared at the same patch of sky for years, watching thousands of stars.` |
| 2 | `kepler/2.mp3` | `[curious] When a planet passes its star, the star dims a tiny bit. [excited] I spotted those blinks.` |
| 3 | `kepler/3.mp3` | `[shouts] I found 2,662 planets! [amazed] Some might be a bit like Earth. [cheerful] Quiz?` |
