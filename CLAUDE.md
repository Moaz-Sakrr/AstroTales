# AstroTales — rules for Claude Code

- Read docs/PROJECT_PLAN.md before any task. It is the spec.
- Stack: Vite + React + TypeScript + Tailwind v4 + GSAP + Howler + Zustand. No backend, no router, no Next.js.
- Design system: "B · Postcards from space". Tokens live in `src/index.css` (`@theme`): primitives (`navy-900`, `paper`, `airmail-red`…) and semantic names (`bg-bg`, `text-text`, `bg-cta`, `text-on-cta`, `bg-fact`, `bg-cap`). UI uses semantic names; SVG illustrations may use literal art colors.
- Fonts: Lexend (UI, built for young readers) + Gochi Hand (`font-hand`, only for what devices "write").
- English only for now (Arabic is stretch). Still write text as `{ en: '...' }` (the `L10n` type) so Arabic can be added later.
- Content lives in src/content/**. Never hard-code story text, facts or UI strings inside components.
- Every fact in content must have a `source` URL (NSSDCA or NASA). Never invent facts.
- Two story views share one data model: StoryView (< 768px) and SceneView (>= 768px).
- Kids 8–12: buttons >= 44px, contrast >= 4.5:1, real <button> elements, aria-labels on icon buttons.
- No dark patterns: no streaks, no random rewards, no endless feeds, no personal data, no network calls at runtime except static assets.
- Respect prefers-reduced-motion.
- Wrap localStorage in try/catch.
- Keep components small. Explain non-obvious code with short comments.
- Before finishing a task: run `npm run build` and fix all type errors.
