// Phase 0 placeholder. Replaced by the screen switcher in Phase 1, step 4.
export default function App() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-5xl font-extrabold">
        Astro<span className="text-coin">Tales</span>
      </h1>
      <p className="max-w-sm text-lg text-muted">
        The things we left on the Moon and Mars tell their own stories.
      </p>
      <button
        type="button"
        className="min-h-11 rounded-full bg-coin px-8 py-3 text-lg font-bold text-space"
      >
        Let's go
      </button>
      <img
        src="/images/team-logo.png"
        alt="Team AstroPy, Cairo"
        className="mt-10 w-56 rounded-xl opacity-80"
      />
    </main>
  )
}
