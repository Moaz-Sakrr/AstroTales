# AstroTales — rules for Claude Code

- Read docs/PROJECT_PLAN.md before any task. It is the spec.
- Stack: Vite + React + TypeScript + Tailwind v4 + GSAP + Howler + Zustand. No backend, no router, no Next.js.
- Design tokens live in `src/index.css` (`@theme`): use `bg-space`, `text-coin`, `bg-fact`, etc. Don't hard-code hex in components.
- Content lives in src/content/**. Never hard-code story text, facts or UI strings inside components.
- Every fact in content must have a `source` URL (NSSDCA or NASA). Never invent facts.
- Two story views share one data model: StoryView (< 768px) and SceneView (>= 768px).
- Kids 8–12: buttons >= 44px, contrast >= 4.5:1, real <button> elements, aria-labels on icon buttons.
- No dark patterns: no streaks, no random rewards, no endless feeds, no personal data, no network calls at runtime except static assets.
- Respect prefers-reduced-motion.
- Wrap localStorage in try/catch.
- Keep components small. Explain non-obvious code with short comments.
- Before finishing a task: run `npm run build` and fix all type errors.
