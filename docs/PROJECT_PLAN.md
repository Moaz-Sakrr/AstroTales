# AstroTales — Project Plan & Build Spec

**Team:** AstroPy · **Event:** NASA Space Apps Challenge 2026 (Cairo) · **Started:** Fri 13 Nov 2026
**Challenge:** *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*
**Prototype (clickable, mobile + web):** https://claude.ai/artifact/Eq9G8em2vaFof9QgHbxNmM

> **Decision (13 Nov):** the MVP is **English only**. Egyptian Arabic moved to stretch (Section 13). Content keeps the `{ en: … }` shape so Arabic can be added later without rewriting files.

> This file is the single source of truth for the team and for Claude Code.
> Read it top to bottom once. Then work through **Section 12 (Build Order)**.
> When something here conflicts with a chat message, update this file first, then build.

---

## Table of contents

1. [Step 1 — Create the team repo](#1-step-1--create-the-team-repo)
2. [The idea in one minute](#2-the-idea-in-one-minute)
3. [Hackathon rules we must follow](#3-hackathon-rules-we-must-follow)
4. [Who it's for and how we design for them](#4-who-its-for-and-how-we-design-for-them)
5. [The kid's journey (11 screens)](#5-the-kids-journey-11-screens)
6. [Devices and content](#6-devices-and-content)
7. [Mobile vs web](#7-mobile-vs-web)
8. [Design system](#8-design-system)
9. [Voice-over (ElevenLabs)](#9-voice-over-elevenlabs)
10. [Tech stack and architecture](#10-tech-stack-and-architecture)
11. [Data schemas](#11-data-schemas)
12. [Build order and team roles](#12-build-order-and-team-roles)
13. [Stretch features (only after MVP works)](#13-stretch-features-only-after-mvp-works)
14. [Demo video and pitch](#14-demo-video-and-pitch)
15. [Risks and how we handle them](#15-risks-and-how-we-handle-them)
16. [Definition of done](#16-definition-of-done)
17. [Credits and licensing checklist](#17-credits-and-licensing-checklist)
18. [FAQ](#18-faq)
19. [Links](#19-links)

---

## 1. Step 1 — Create the team repo

Do this **before anything else**. One person (the repo owner) does steps 1.1–1.4; everyone else does 1.5.

### 1.1 Create the repo (public, open-source)

Space Apps requires the code to be public and open-source. If we don't pick a license, NASA distributes our work under Apache 2.0 anyway, so we pick it ourselves.

**Option A — GitHub website**
1. github.com → **New repository**
2. Name: `astrotales` · Description: `AstroTales — the things we left on the Moon and Mars tell their own stories. NASA Space Apps 2026 · Team AstroPy`
3. **Public** · Add README · `.gitignore`: **Node** · License: **Apache License 2.0**
4. Create.

**Option B — GitHub CLI**
```bash
gh repo create astrotales --public --license apache-2.0 --gitignore Node \
  --description "AstroTales — NASA Space Apps 2026 · Team AstroPy" --clone
cd astrotales
```

### 1.2 Add teammates
Repo → **Settings → Collaborators → Add people** (give everyone *Write*).
Or with the CLI (replace the username):
```bash
gh api -X PUT repos/<OWNER>/astrotales/collaborators/<TEAMMATE_USERNAME> -f permission=push
```

### 1.3 Scaffold the app
```bash
# inside the repo folder
npm create vite@latest . -- --template react-ts
npm install
npm install gsap @gsap/react howler zustand
npm install -D @types/howler tailwindcss @tailwindcss/vite
```
Add Tailwind to `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({ plugins: [react(), tailwindcss()] })
```
And at the top of `src/index.css`:
```css
@import "tailwindcss";
```
Then create the folders from **Section 10.3**, copy this file to `docs/PROJECT_PLAN.md`, and create `CLAUDE.md` (Section 10.5).

```bash
git add -A && git commit -m "chore: scaffold AstroTales (Vite + React + TS + Tailwind + GSAP)"
git push
```

### 1.4 Connect Vercel (free deploy)
1. vercel.com → sign in with GitHub → **Add New → Project** → import `astrotales`.
2. Framework: **Vite** (auto-detected) → **Deploy**.
3. From now on: every push to `main` deploys the live site; every branch/PR gets its own preview link.

### 1.5 Everyone: clone and run
```bash
git clone https://github.com/<OWNER>/astrotales.git
cd astrotales && npm install && npm run dev
```

### 1.6 How we work in Git
- `main` = always working. Never push broken code to `main`.
- One branch per task: `feat/map`, `feat/story-scene`, `content/opportunity`, `fix/audio-autoplay`.
- Open a Pull Request → check the Vercel preview link → merge.
- Small commits, clear messages (`feat:`, `fix:`, `content:`, `chore:`).
- **Content and code are separate**: content people edit `src/content/**` only, so they never conflict with the code people.

---

## 2. The idea in one minute

**AstroTales** is an interactive storytelling website for kids about equipment NASA left on the Moon and Mars.

- The kid **is the astronaut**: picks a boy or girl character and customizes the suit.
- On the Moon or Mars map there are **red flags** at the real landing sites.
- The kid picks a flag → the astronaut **flies there** → the **device appears and tells its own story** in first person, with voice and subtitles.
- After the story: an **envelope** (the device's profile with the real science and NASA sources) and a **treasure chest** that only opens if the kid answers correctly (**Fact or Cap?** cards).
- The chest gives **coins**. Coins unlock **Mars**, **new suits**, and **secret places** (deep-space devices).
- At the end: a shareable **Mission Wrapped** card, and a gentle ending: *"Tonight, look up at the real Moon."*

**One-line pitch:** *Gen Alpha kids are trained for short, swipeable content. Instead of fighting the scroll, AstroTales gives it a destination.*

---

## 3. Hackathon rules we must follow

| Rule | What it means for us |
|---|---|
| **Demo** = video **≤ 30 seconds** OR slides **≤ 7** (incl. title) | Exceeding these limits = not eligible for Global Judging. Our earlier 87 s proposal video is **not** the final demo. |
| Video demos need **English subtitles**; slide decks must be in **English** | Burn English subtitles into the video. |
| Demo must be hosted externally with a **public link** (YouTube, Drive, GitHub…) | Can't upload to the Space Apps site. |
| Solution must directly address the challenge | Every device must be **NASA** equipment (no Lunokhod — it's Soviet). |
| Code open-source (OSI license); Apache 2.0 by default | Repo is public with Apache 2.0. |
| Third-party materials must be freely available / openly licensed | Fonts from Google Fonts, NASA media per NASA guidelines, royalty-free music, voice credit for ElevenLabs. |
| **Judging criteria:** Impact · Creativity · Validity · Relevance · Presentation | Every feature below is tagged with the criteria it serves. |

**Still to do (owner: team lead):** paste the challenge's **Details tab** (objectives) into `docs/CHALLENGE.md` and check every feature against it. Relevance is judged against that text.

---

## 4. Who it's for and how we design for them

### 4.1 Audience
- **Kids 8–12** (they are **Gen Alpha**, born 2010–2024 — not Gen Z). Egypt first, global second.
- Research we're using:
  - The "can't focus" stereotype is wrong: they're trained for **rapid context switching** and can focus intensely when engaged.
  - Under-10s prefer **2–3 minute** videos over 20-minute episodes.
  - ~64% of kids 8–12 use YouTube and TikTok **every day**.
  - Egypt: 30.2% of households say kids 5–12 spend **2–4 hours/day** online.
  - NASA's own social team found **first-person** rover posts got more engagement than third-person — same as our "device tells its story" concept.
  - Retrieval practice with **hints** helps kids 8–13 remember science facts; multiple-choice **with immediate feedback** removes the risk of learning wrong answers.

### 4.2 Design principles (non-negotiable)
1. **Short chunks.** Every story card ≤ ~10 seconds of voice. Every device ≤ ~2 minutes total.
2. **The kid has agency.** They pick the flag, the character, the suit. They are in every scene.
3. **Facts are separate from storytelling.** The story is the device "talking"; the envelope is the official science with sources.
4. **Instant feedback.** Every quiz answer shows right/wrong immediately, with a hint and a retry. Never lock the kid out.
5. **No dark patterns.** No endless feed, no streak guilt, no loot boxes / random rewards, no ads, no real money, no personal data. Rewards are **earned, not random**.
6. **A natural ending.** The mission ends and sends the kid back to the real world ("look at the Moon tonight").
7. **Slang: one touch, not a costume.** "Fact or Cap?" is the only slang feature. No brainrot memes.

---

## 5. The kid's journey (11 screens)

Same journey on mobile and web. The clickable prototype shows all 11.

| # | Screen | What happens | Notes |
|---|---|---|---|
| 1 | **Launch** | Logo, "Let's go" | The tap unlocks audio (browsers block autoplay). |
| 2 | **Choose astronaut** | Boy or Girl · 4 suits · optional first name | Classic + Mars suits free; Ocean = 30 coins; Galaxy = 50 coins. Name is optional, first name only, never sent anywhere. |
| 3 | **Map** | Moon map with red flags at **real** landing sites. Mars tab locked until 50 coins. | Use real NASA imagery + coordinates. Visited flags show "visited". |
| 4 | **Flight** | Astronaut flies to the flag (≈2.4 s) | GSAP MotionPath. |
| 5 | **Story** | Device tells its story in 4 cards (voice + subtitles) | Mobile = Stories. Web = Game Scene. See Section 7. |
| 6 | **Mini-mission** | One interactive science moment per device | Reflecto: fire a laser, timer shows ≈2.5 s round trip → distance ≈384,400 km. |
| 7 | **Envelope = Device Profile** | Handle, bio, status, stats, "The Science", **NSSDCA ID + source links** | Like a social profile. Opportunity gets **"Last seen: June 10, 2018"** (verify). |
| 8 | **Chest = Fact or Cap?** | 3 statement cards. Mobile: swipe. Web: click Cap (left) / Fact (right). | +10 coins per correct answer. Wrong → hint → retry. |
| 9 | **Reward** | Coins, collectible card (holo effect), "Ocean suit unlocked → Wear it" | Card says "earned, not random". |
| 10 | **Mission Wrapped** | 9:16 shareable card: name, distance, devices met, facts mastered, "space personality" | No account, no photo, no personal data. "Save card" downloads a PNG. |
| 11 | **Mission complete** | "Tonight, look up at the real Moon…" + Play again | "No streaks, no pressure." |

---

## 6. Devices and content

### 6.1 Source of truth: NSSDCA
The challenge names the **NASA Space Science Data Coordinated Archive (NSSDCA)** as the definitive catalog for each spacecraft's mission parameters, final resting place and status.
- Every fact in an envelope must come from NSSDCA or an official NASA page, with the link stored in the content file.
- Every device profile shows its **NSSDCA ID** (e.g. `1969-059C`).
- No facts from memory or from AI without a source link. If it can't be sourced, it doesn't ship.

### 6.2 Device list (from the challenge resources)

**MVP = 3 Moon + 2 Mars + 1 secret place.** Everything else is stretch.

| World | Device | MVP? | Why it's good for kids | NASA 3D model? | Resource link |
|---|---|---|---|---|---|
| 🌕 Moon | **Reflecto** — Apollo 11 Laser Ranging Retroreflector (part of the Apollo surface experiments) | ✅ | Still used today; laser mini-game | ❌ (build simple one in Blender) | ALSEP / NSSDCA |
| 🌕 Moon | **Eagle** — Apollo 11 Lunar Module descent stage | ✅ | "I was the launch pad for the astronauts going home" | ✅ Apollo Lunar Module | NSSDCA `1969-059C` |
| 🌕 Moon | **Lunar Roving Vehicle** (Apollo 15) | ✅ | A car on the Moon! Bouncy driving | ❌ | NSSDCA `1971-063C` |
| 🌕 Moon | Surveyor 3 | stretch | Apollo 12 astronauts visited it and took parts home | — | science.nasa.gov/mission/surveyor-3 |
| 🔴 Mars | **Opportunity** | ✅ | Planned 90 days, worked ~15 years; dust-cleaning mini-game; "Last seen" | ✅ Spirit & Opportunity / MER-B | science.nasa.gov MER page |
| 🔴 Mars | **Ingenuity** | ✅ | First aircraft on another planet; 72 flights 2021–2024 | ✅ | science.nasa.gov Ingenuity page |
| 🔴 Mars | Sojourner | stretch | First rover on Mars (1997), tiny | — | Mars Pathfinder page |
| 🔴 Mars | Spirit · Viking 1 & 2 · Phoenix · InSight | stretch | | InSight ✅ | challenge resources |
| ✨ Secret | **NEAR Shoemaker** (on asteroid 433 Eros) | ✅ (pick one) | "I landed on an asteroid and stayed" | — | NEAR Shoemaker page |
| ✨ Secret | Pioneer 10 / 11 · Dawn (Ceres) · Kepler | stretch | Drifting in deep space | — | challenge resources |

> ⚠️ **Removed:** Lunokhod 2 — it's Soviet, and the challenge is about **NASA** equipment.

### 6.3 Reflecto — reference content (template for every device)
Use this as the pattern. **Every fact below must be re-checked against NSSDCA/NASA before shipping** (marked ✔︎ when verified).

**Story cards (English):**
1. *POV: you are a mirror on the Moon* — "Psst… look down. I'm the shiny box right next to your boots."
2. *July 21, 1969* — "Neil Armstrong and Buzz Aldrin set me up right here. I've been waiting ever since."
3. *My daily job* — "Scientists on Earth shoot lasers at me. I bounce them straight back home."
4. *Your turn* — "That's how they know exactly how far away the Moon is. Want to try?"

**Envelope facts (to verify):** deployed July 21, 1969 · 100 corner-cube prisms · no power needed · still used for lunar laser ranging · laser round trip ≈2.5 s · average distance ≈384,400 km · Moon recedes ≈3.8 cm/year.

**Fact or Cap? cards:**
| Statement | Answer | Why | Hint |
|---|---|---|---|
| I'm made of 100 little mirror prisms. | Fact | 100 corner cubes, each sends light back the way it came. | Look at the stats on my profile. |
| A laser takes 2 minutes to reach me. | Cap | ≈1.3 s one way, ≈2.5 s round trip. | Remember your laser mini mission. |
| Scientists still bounce lasers off me today. | Fact | Still in use, no batteries needed. | Check my status dot on my profile. |

**Opportunity extra card idea:** *"Opportunity said 'My battery is low and it's getting dark' — Fact or Cap?"* → **Cap**: it's a poetic translation of real data, not its literal words. Teaches kids to check what goes viral.

### 6.4 Writing rules for story text
- First person, short sentences, ≤ 20 words per card.
- One idea per card. 4 cards per device.
- Card 1 = hook ("look down", "guess what"). Card 4 = invitation to the mini-mission.
- English only for the MVP (Arabic is stretch, Section 13).

---

## 7. Mobile vs web

**One content file, two views.** The app picks the view by screen width:

| Width | Story view | How the kid advances |
|---|---|---|
| **< 768 px** (phones, portrait tablets) | **StoryView** — Instagram-style Stories, full-screen scene, progress bars on top, caption panel | Tap right = next / skip typing · tap left = back |
| **≥ 768 px** (laptops, landscape tablets) | **SceneView** — game scene: Moon surface, Earth in the sky, the kid's astronaut on the left, device on the right, **dialogue box** at the bottom with the device's portrait and name tag | **Next** / **Back** buttons + **Space / Arrow keys** |

Shared on both:
- Text types out in sync with the voice (tap / Next completes the line first).
- Device glows + sound-wave icon while speaking.
- Card 1: "That's me!" pointer on the device. Card 3 (Reflecto): red laser beam from Earth to the device.
- Same voice, same words, same colors, same character.

Other screens just re-flow: map + device list side by side on web; quiz buttons on the sides on web; Wrapped card stays 9:16 on both.

---

## 8. Design system

### 8.1 Colors
| Use | Hex |
|---|---|
| Space background | `#0B1D3A` |
| Cards / second layer | `#1B2F5E` |
| Deep sky (scenes) | `#08152B` |
| Moon | `#CFCFD8` / craters `#A9AEBF`, `#B4B8C8` |
| Mars | `#E0703A` / `#B5482A` |
| Flags / laser / "Cap" | `#FF4D4D` |
| Coins / main buttons | `#FFC93C` |
| Interactive / "Fact" / links | `#2EC4B6` |
| Envelope paper | `#FFF1D6` |
| Text | `#FFF8E7` · muted `#B9C4E0` · faint `#8E9BC0` |

Rules: never pure black; one bright accent per screen; text contrast ≥ 4.5:1; touch targets ≥ 44 px; real `<button>` elements; `aria-label` on icon-only buttons.

### 8.2 Type
- Font: being re-chosen (see UI options). Placeholder: **Baloo 2** (Google Fonts).
- If Arabic is added later: pick a font with an Arabic twin and set `dir="rtl"` on the root.

### 8.3 Characters
- 2 astronauts: **Boy** (the team's finished design: curly hair, astronaut helmet) and **Girl** (draw in the same style: curly puffs).
- 4 suits each → 8 looks. Each suit sets `suit`, `rim` (helmet rim + boots + gloves), `accent` (backpack + details):

| Suit | suit | rim | accent | Cost |
|---|---|---|---|---|
| Classic | `#E8ECF5` | `#FFC93C` | `#2EC4B6` | free |
| Mars | `#E0703A` | `#B5482A` | `#FFC93C` | free |
| Ocean | `#2EC4B6` | `#1B2F5E` | `#FFF8E7` | 30 coins |
| Galaxy | `#8B6CF0` | `#FF8FB1` | `#FFC93C` | 50 coins |

- Build the character as **one SVG with color variables** (or layered PNGs) so suits are a color swap, not 8 separate drawings.
- Icons: simple stroke SVGs, no emoji in the UI.

### 8.4 Motion
- GSAP for: flight path, float/idle, coin pop, chest open, holo card shine, dots/progress.
- Respect `prefers-reduced-motion` (turn off float and shine).

---

## 9. Voice-over (ElevenLabs)

- **Model:** Eleven v3 (supports audio tags like `[curious]`, `[whispers]`, `[excited]`, `[laughs]`).
- **Pre-generate everything** as MP3 files and ship them in `public/audio/`. Never call the API from the website (protects the key, no delay, saves credits).
- **Sync subtitles:** if generating via API, use the text-to-speech **with timestamps** endpoint and save the character timings next to each MP3, so the typewriter text matches the voice exactly. If using the web app, fall back to an even typing speed.
- **Character cards** (one voice per device, written in `src/content/voices.md`):
  - Reflecto: calm, precise, a bit proud.
  - Eagle: brave, warm, "big brother".
  - Lunar Rover: cheerful, bouncy.
  - Opportunity: old, wise, tired but proud.
  - Ingenuity: tiny, excited, giggly.
  - Narrator (if any): warm, friendly.
- **Language:** English only for the MVP. Egyptian Arabic voice is stretch (Section 13).
- **Free plan:** ≈10,000 credits/month (≈10 min of speech), non-commercial, **attribution required** → "Voices by ElevenLabs" in credits. Split generation across team accounts.
- **Audio files:** MP3, 64–96 kbps, one file per card: `public/audio/{lang}/{deviceId}/{cardIndex}.mp3`.
- **Never** clone a real child's voice.

---

## 10. Tech stack and architecture

### 10.1 Stack
| Layer | Choice | Why |
|---|---|---|
| Build | **Vite + React + TypeScript** | Fast, simple, no backend needed |
| Styling | **Tailwind CSS v4** | Fast to build, design tokens in one place |
| Animation | **GSAP** (+ `@gsap/react`, MotionPathPlugin) | Cinematic flights and scenes; all plugins are free |
| Audio | **Howler.js** | Reliable playback + mobile unlock |
| State | **Zustand** + `localStorage` | Coins, suits, progress; no backend |
| 3D / AR (stretch) | **`@google/model-viewer`** | One tag for 3D + AR on Android and iOS |
| Deploy | **Vercel** (Hobby, free) | Auto deploy on push, preview per branch, HTTPS |

No Next.js, no backend, no database, no login.

### 10.2 State (Zustand, persisted to localStorage)
```ts
type Progress = {
  lang: 'en'                   // add 'ar-EG' if Arabic ships
  character: 'boy' | 'girl'
  suit: 'classic' | 'mars' | 'ocean' | 'galaxy'
  name: string                 // optional, first name only, stays on device
  coins: number
  visited: string[]            // device ids
  mastered: Record<string, number> // deviceId -> correct answers
  unlocked: { mars: boolean; secret: string[]; suits: string[] }
}
```
Wrap every `localStorage` read/write in `try/catch` (it can be blocked).

### 10.3 Folder structure
```
astrotales/
├─ CLAUDE.md                     # rules for Claude Code (Section 10.5)
├─ docs/
│  ├─ PROJECT_PLAN.md            # this file
│  ├─ CHALLENGE.md               # challenge Details tab, pasted
│  └─ SOURCES.md                 # every NASA/NSSDCA link we used
├─ public/
│  ├─ audio/en/{deviceId}/{0..3}.mp3
│  ├─ images/maps/{moon,mars}.webp
│  ├─ images/devices/{deviceId}.webp
│  └─ models/{deviceId}.glb      # stretch (AR)
└─ src/
   ├─ content/
   │  ├─ devices/{deviceId}.ts   # one file per device (schema in Section 11)
   │  ├─ worlds.ts               # moon, mars, secret places
   │  ├─ suits.ts
   │  └─ i18n/en.ts             # UI strings
   ├─ store/progress.ts          # Zustand store
   ├─ hooks/useIsWide.ts         # matchMedia('(min-width: 768px)')
   ├─ audio/player.ts            # Howler wrapper + unlock on first tap
   ├─ components/
   │  ├─ Astronaut.tsx           # SVG character, props: kind, suit
   │  ├─ CoinBadge.tsx  ProgressSteps.tsx  LangToggle.tsx
   │  └─ DeviceArt.tsx
   └─ screens/
      ├─ Launch.tsx  ChooseAstronaut.tsx  Map.tsx  Flight.tsx
      ├─ story/StoryView.tsx      # mobile
      ├─ story/SceneView.tsx      # web
      ├─ story/useTypewriter.ts   # shared typing + audio sync
      ├─ minigames/LaserGame.tsx  # one file per mini-game
      ├─ Profile.tsx  Quiz.tsx  Reward.tsx  Wrapped.tsx  End.tsx
```

### 10.4 Routing
Keep it simple: one `screen` value in the store (`'launch' | 'avatar' | 'map' | 'flight' | 'story' | 'mini' | 'profile' | 'quiz' | 'reward' | 'wrapped' | 'end'`) plus `currentDeviceId`. No router needed for the hackathon.

### 10.5 `CLAUDE.md` (create this in the repo root)
```md
# AstroTales — rules for Claude Code

- Read docs/PROJECT_PLAN.md before any task. It is the spec.
- Stack: Vite + React + TypeScript + Tailwind v4 + GSAP + Howler + Zustand. No backend, no router, no Next.js.
- Content lives in src/content/**. Never hard-code story text, facts or UI strings inside components.
- Every fact in content must have a `source` URL (NSSDCA or NASA). Never invent facts.
- Two story views share one data model: StoryView (< 768px) and SceneView (>= 768px).
- Kids 8–12: buttons >= 44px, contrast >= 4.5:1, real <button> elements, aria-labels on icon buttons.
- No dark patterns: no streaks, no random rewards, no endless feeds, no personal data, no network calls at runtime except static assets.
- Respect prefers-reduced-motion.
- Wrap localStorage in try/catch.
- Keep components small. Explain non-obvious code with short comments.
- Before finishing a task: run `npm run build` and fix all type errors.
```

---

## 11. Data schemas

```ts
// src/content/types.ts
export type Lang = 'en' // add 'ar-EG' later: TS then flags every missing string
export type L10n = Record<Lang, string>

export type StoryCard = {
  kicker: L10n          // small label, e.g. "POV: you are a mirror on the Moon"
  line: L10n            // what the device says (≤ 20 words)
  audio: Record<Lang, string>        // '/audio/en/reflecto/0.mp3'
  timings?: Record<Lang, number[]>   // optional per-character times (ms) from ElevenLabs
  scene?: { pointer?: boolean; beam?: boolean }  // per-card scene effects
}

export type Fact = { text: L10n; source: string }   // source = NSSDCA / NASA URL

export type QuizCard = {
  statement: L10n
  isFact: boolean
  why: L10n
  hint: L10n
}

export type Device = {
  id: string                    // 'reflecto'
  world: 'moon' | 'mars' | 'secret'
  name: string                  // 'Apollo 11 Laser Ranging Retroreflector'
  nickname: string              // 'Reflecto'
  handle: string                // 'reflecto.on.moon'
  nssdcaId?: string             // '1969-059C'
  location: { label: string; lat: number; lon: number }   // real coordinates
  mapPos: { x: number; y: number }                       // % position on our map image
  status: L10n                  // 'Still in use by scientists' / 'Last seen: June 10, 2018'
  bio: L10n
  stats: { value: string; label: L10n }[]                // 3 stats
  science: Fact[]
  story: StoryCard[]            // exactly 4
  quiz: QuizCard[]              // exactly 3
  miniGame?: 'laser' | 'dust' | 'fly' | 'drive'
  model3d?: string              // '/models/opportunity.glb' (stretch)
  collectible: { power: L10n; superpower: L10n; distanceHome: string }
  credits: string[]             // image/model credits, e.g. 'NASA/JPL-Caltech'
}
```

---

## 12. Build order and team roles

### 12.1 Roles (adjust to team size)
| Role | Owns |
|---|---|
| **Content / Science** | Device files in `src/content/devices/**`, NSSDCA links, quiz cards, `docs/SOURCES.md` |
| **Design / Art** | Boy + girl characters (SVG, recolorable), device art, map images, icons |
| **Frontend 1** | Launch, Choose Astronaut, Map, Flight, SceneView (web), animations |
| **Frontend 2** | StoryView (mobile), typewriter + audio, Mini-games, Profile, Quiz, Reward, Wrapped, store |
| **Voice + Video** | ElevenLabs lines, audio files, 30 s demo video, project page text |

### 12.2 Build order (MVP first, in this order)
**Phase 0 — Setup (first 1–2 h)**
1. Repo + Vercel live (Section 1). A "Hello AstroTales" page is online.
2. Paste challenge Details into `docs/CHALLENGE.md`.
3. Add fonts, colors (Tailwind theme), `CLAUDE.md`, folder structure, types.

**Phase 1 — One device end-to-end (Reflecto)**
4. Store + screen switcher.
5. Launch → Choose Astronaut (boy/girl, 4 suits, name) → Map (one flag) → Flight.
6. StoryView (mobile) with typewriter + audio + tap zones.
7. Laser mini-game.
8. Profile (envelope) with NSSDCA/NASA sources.
9. Fact or Cap quiz → Reward → Wrapped → End.
10. **Checkpoint:** the whole journey works on a real phone on the Vercel link.

**Phase 2 — Web + content**
11. SceneView (web) using the same data. `useIsWide` switch at 768 px.
12. Add Eagle + Lunar Rover (Moon), Opportunity + Ingenuity (Mars), 1 secret place.
13. Mars unlock at 50 coins, suit unlocks, secret place unlock.

**Phase 3 — Polish**
15. Real NASA map imagery, device art, sound effects, reduced-motion, accessibility pass.
16. Opportunity dust mini-game (if time).
17. Record the 30 s demo, write the project page, final deploy.

**Phase 4 — Stretch (only if Phase 1–3 are done):** Section 13.

### 12.3 Content checklist per device
- [ ] 4 story cards
- [ ] 3 quiz cards with why + hint
- [ ] 3 stats, bio, status, science facts **with source URLs**
- [ ] Real coordinates + map position
- [ ] Audio for each card
- [ ] Art (and 3D model if AR)
- [ ] Credits filled

---

## 13. Stretch features (only after MVP works)

| Feature | What | Effort | Criteria |
|---|---|---|---|
| **AR "See it in your room"** (2 devices: Opportunity + Ingenuity) | `<model-viewer ar ar-scale="fixed">` with NASA GLB models. Web shows 3D + QR code "open on your phone". | ~3–5 h per device | Creativity, Presentation |
| **Then & Now slider** | Apollo-era photo vs today's orbital photo of the same site (hardware still visible) | Low | Validity, Relevance |
| **Mini-game per device** | Opportunity: wipe dust off solar panels · Ingenuity: fly in thin air · Rover: low-gravity driving | Medium each | Creativity, Impact |
| **Ask Reflecto** | Pre-written question chips ("Are you cold?") answered in the device's voice. No open chat for kids. | Low–Medium | Creativity |
| **Sounds of Mars** | Real Perseverance recordings (wind, Ingenuity flying) as Mars ambience | Low | Impact |
| **Leave a message for future explorers** | Kid designs a mission patch + one line; downloadable | Medium | Impact |
| **Challenge a friend** | Share link with the same quiz encoded in the URL ("Can you beat 3/3?") | Low–Medium | Impact |
| **Egyptian Arabic** (UI + story + voice) | Add `ar-EG` to `Lang`, fill every string, RTL, Arabic font, Egyptian voice (test 3 lines first: v3 may drift into MSA) | Medium | Impact |
| **Classroom mode** (pitch only) | Web version on a projector + printable worksheet | Pitch slide | Impact |

### 13.1 AR quick guide
1. Download GLBs from NASA 3D Resources (Opportunity / Spirit & Opportunity, Ingenuity). If only `.blend` is available: open in Blender → **File → Export → glTF 2.0** → Format **glTF Binary (.glb)**, enable **Compression**. Check real size (Opportunity ≈1.6 m).
2. Compress:
   ```bash
   npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress webp
   ```
   Target < 3 MB. Check it in modelviewer.dev/editor.
3. Use:
   ```html
   <model-viewer src="/models/opportunity.glb" ar ar-modes="webxr scene-viewer quick-look"
     ar-scale="fixed" camera-controls auto-rotate alt="NASA Opportunity rover"></model-viewer>
   ```
4. Android needs ARCore (Android 7+); iOS uses Quick Look (USDZ auto-generated, or make one with Reality Converter for best results). Laptops have no AR → show 3D + QR code.
5. **Record AR on a real phone for the demo video.** Don't rely on it working live.
6. Credit NASA for every model.

---

## 14. Demo video and pitch

### 14.1 The 30-second demo (English, English subtitles burned in)
| Time | Shot | Voice/subtitle |
|---|---|---|
| 0:00–0:03 | Team intro card | "We're Team AstroPy." |
| 0:03–0:08 | Map → flag tap → astronaut flies | "NASA left hundreds of machines on the Moon and Mars." |
| 0:08–0:15 | Device speaks (Reflecto or Opportunity) | Device line in its own voice |
| 0:15–0:21 | Laser game + Fact or Cap swipe | "Kids explore, play, and learn the real science…" |
| 0:21–0:26 | Reward + Wrapped card (+ AR shot if ready) | "…with sources straight from NASA." |
| 0:26–0:30 | Logo + link | "AstroTales — abandoned, but never forgotten." |

### 14.2 Pitch line for the project page
> Gen Alpha kids aren't unable to focus — they're trained for short, fast, swipeable content. Instead of fighting the scroll, AstroTales gives it a destination: every swipe is a real story from a machine NASA left on the Moon or Mars, told in first person (a voice NASA itself found more engaging), checked against official NASA sources (NSSDCA), and designed without dark patterns: no endless feed, no guilt streaks, no loot boxes. The mission ends, and the kid looks up at the real Moon.

Add: "Built for the device in the kid's hand — Stories on phones, a game scene on laptops." and the Egypt stat (30.2% of households: 2–4 h/day online for kids 5–12).

---

## 15. Risks and how we handle them

| Risk | Mitigation |
|---|---|
| Scope too big for 48 h | MVP = 1 device end-to-end first, then add devices. Stretch only after Phase 3. |
| Wrong facts (Validity) | Every fact has a source URL. Content person verifies. No AI-written facts without a source. |
| Story vs facts confusion | Story = device's voice. Envelope = sourced science. |
| Audio autoplay blocked | Start on a tap (Launch screen). Unlock Howler on first interaction. |
| ElevenLabs credits run out | Generate once, offline. Split across team accounts. English first. |
| Kid gets stuck on the quiz | Hint + unlimited retries. Never lock progress. |
| Slow on cheap phones | WebP images, compressed audio, lazy-load models, < 3 MB per GLB. |
| Git conflicts | Content and code in separate folders; one branch per task; small PRs. |
| Licensing | Section 17 checklist. No NASA logo. |
| Demo over 30 s | Script in 14.1 is timed. Cut, don't speed up. |

---

## 16. Definition of done

**MVP is done when:**
- [ ] Live on Vercel with a public link.
- [ ] Full 11-screen journey works on a real phone **and** a laptop.
- [ ] 3 Moon devices + 2 Mars devices + 1 secret place, each with 4 story cards, a sourced envelope, 3 quiz cards.
- [ ] Coins unlock Mars, suits and the secret place; progress survives a page refresh.
- [ ] English voice for all cards.
- [ ] Every fact has a NASA/NSSDCA link; credits page complete.
- [ ] 30 s demo with English subtitles, hosted publicly.
- [ ] Repo public, Apache 2.0, README with how to run + credits.

---

## 17. Credits and licensing checklist

- [ ] **NASA media/models:** credit NASA (and JPL-Caltech where listed). Do **not** imply NASA endorsement. Do **not** use the NASA logo/insignia.
- [ ] **NSSDCA / NASA pages:** linked in every envelope and in `docs/SOURCES.md`.
- [ ] **Voices:** "Voices generated with ElevenLabs" (free plan requires attribution).
- [ ] **Fonts:** final font (Google Fonts, OFL).
- [ ] **Music/SFX:** royalty-free only, with license links.
- [ ] **Code libraries:** list in README (all MIT/Apache-compatible).
- [ ] **Our code:** Apache 2.0.

---

## 18. FAQ

**Why no backend?**
Everything is static content. Progress lives in the kid's browser. No backend = nothing to break during judging, no personal data, free hosting.

**Why two story views instead of one responsive layout?**
A 9:16 Stories card looks lost on a laptop, and a game scene is cramped on a phone. One content file feeds both, so it's two layouts, not two products.

**Why English only if we're in Egypt?**
Global judges and the project page are English, and one language halves the content and voice work. Egyptian Arabic is a stretch feature: cheap to add later because the text is short and the data shape already supports it.

**Can we use ChatGPT/Claude to write the device facts?**
Use AI to help *write* the story lines, but every **fact** must be checked against NSSDCA or a NASA page and stored with its source URL.

**Why "Fact or Cap" and not a normal quiz?**
It's the kids' own language, it's a swipe (a gesture they already know), and it lets us teach "don't believe everything that goes viral" (Opportunity's "battery is low" meme).

**What if we run out of time?**
Ship fewer devices, not a broken journey. One perfect device beats six half-done ones. AR and extra mini-games are the first things to cut.

**Can we write code before the hackathon starts?**
Research, design and boilerplate are fine. Check local event rules with the Cairo lead for anything more.

**Where do I ask Claude Code to start?**
"Read docs/PROJECT_PLAN.md and CLAUDE.md. Do Phase 1, step 4 (store + screen switcher)." Then go step by step.

---

## 19. Links

**Hackathon**
- Challenge: https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/
- Project submission guide: https://www.spaceappschallenge.org/resources/project-submission-guide/
- Participant terms: https://www.spaceappschallenge.org/legal/

**NASA data (from the challenge resources)**
- NSSDCA: https://nssdc.gsfc.nasa.gov/
- Apollo Lunar Module (Apollo 11 descent stage): https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C
- Lunar Roving Vehicle (Apollo 15): https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C
- ALSEP: https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C
- Surveyor 3: https://science.nasa.gov/mission/surveyor-3/
- Mars Pathfinder / Sojourner: https://science.nasa.gov/mission/mars-pathfinder/
- Spirit & Opportunity: https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/
- Viking 1: https://science.nasa.gov/mission/viking-1/
- InSight: https://science.nasa.gov/mission/insight/
- Ingenuity: https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/
- NEAR Shoemaker: https://science.nasa.gov/mission/near-shoemaker/
- Dawn: https://science.nasa.gov/mission/dawn/
- Pioneer 10: https://science.nasa.gov/mission/pioneer-10/
- Kepler: https://science.nasa.gov/mission/kepler/

**3D / AR**
- NASA 3D Resources: https://science.nasa.gov/3d-resources/
- NASA 3D on GitHub: https://github.com/nasa/NASA-3D-Resources
- Spirit & Opportunity model: https://nasa3d.arc.nasa.gov/detail/spirit
- Ingenuity model: https://science.nasa.gov/resource/mars-ingenuity-helicopter-3d-model/
- model-viewer: https://modelviewer.dev/ · editor: https://modelviewer.dev/editor/

**Tools**
- ElevenLabs v3 audio tags: https://elevenlabs.io/docs/help-center/product/speech-synthesis/text-to-speech/how-do-audio-tags-work-with-eleven-v3-alpha
- Vercel: https://vercel.com · Vite: https://vite.dev · GSAP: https://gsap.com · Howler: https://howlerjs.com · Zustand: https://zustand.docs.pmnd.rs
- Blender (free): https://www.blender.org/download/
