import { useState } from 'react'
import Starfield from '../components/Starfield'
import Astronaut from '../components/Astronaut'
import Button from '../components/Button'
import { suits } from '../content/suits'
import { en } from '../content/i18n/en'
import { useGame, type Character as Kind } from '../store/progress'

const t = en.character

export default function Character() {
  const setCharacter = useGame((s) => s.setCharacter)
  const [kind, setKind] = useState<Kind>(() => useGame.getState().character)
  const [name, setName] = useState(() => useGame.getState().name)

  return (
    <main className="space-sky relative grid min-h-svh place-items-center overflow-hidden px-4 py-10">
      <Starfield />
      <form
        className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8"
        onSubmit={(e) => {
          e.preventDefault()
          setCharacter(kind, name)
        }}
      >
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">{t.title}</h1>

        <fieldset className="grid w-full grid-cols-2 gap-4 sm:gap-6">
          <legend className="sr-only">{t.title}</legend>
          {(['boy', 'girl'] as const).map((k) => (
            <label
              key={k}
              className={`group relative flex cursor-pointer flex-col items-center rounded-3xl border-2 p-4 pb-5 transition has-focus-visible:outline-3 has-focus-visible:outline-offset-4 has-focus-visible:outline-fact ${
                kind === k ? 'border-cta bg-surface/80' : 'border-white/15 bg-surface/30 hover:border-white/40'
              }`}
            >
              <input type="radio" name="character" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              <Astronaut suit={suits.classic} kind={k} width={150} className={`transition ${kind === k ? 'scale-105' : 'opacity-70 group-hover:opacity-100'}`} />
              <span className="mt-2 text-xl font-semibold">{t[k]}</span>
            </label>
          ))}
        </fieldset>

        <div className="flex w-full max-w-sm flex-col gap-2">
          <label htmlFor="astro-name" className="font-semibold">{t.nameLabel}</label>
          <input
            id="astro-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            autoComplete="off"
            placeholder={t.namePlaceholder}
            className="min-h-12 rounded-2xl border-2 border-white/20 bg-navy-950/60 px-4 text-lg text-text placeholder:text-faint focus:border-fact focus:outline-none"
          />
          <p className="text-sm text-faint">{t.nameNote}</p>
        </div>

        <Button type="submit">{t.go}</Button>
      </form>
    </main>
  )
}
