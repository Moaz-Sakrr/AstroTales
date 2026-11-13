# AstroTales

The things NASA left on the Moon and Mars tell their own stories: an interactive storytelling site for kids 8–12.

**NASA Space Apps Challenge 2026 (Cairo) · Team AstroPy**
Challenge: [Abandoned but not Forgotten](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/)

## Run it

```bash
git clone https://github.com/Moaz-Sakrr/AstroTales.git
cd AstroTales
npm install
npm run dev
```

## Where things live

- `docs/PROJECT_PLAN.md`: the spec. Read it first.
- `src/content/**`: story text, facts, quiz cards (content people edit only this).
- `src/screens/**`, `src/components/**`: the app (code people).
- `public/audio`, `public/images`, `public/models`: static assets.

## How we work

One branch per task (`feat/map`, `content/opportunity`), open a PR, check the Vercel preview, merge. `main` always works.

## Credits

- Data and media: NASA / NSSDCA (see `docs/SOURCES.md`). No NASA endorsement implied.
- Device photos: NASA and NASA/JPL-Caltech via images.nasa.gov (public domain). Each photo links to its source in the app.
- Planet textures: [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0), based on NASA imagery.
- Voices generated with ElevenLabs.
- Fonts: Baloo 2 (Google Fonts, OFL).
- Libraries: React, Vite, Tailwind CSS, GSAP, three.js, Howler.js, Zustand.

## License

Apache 2.0
