import { useState } from 'react'
import Starfield from '../components/Starfield'
import Button from '../components/Button'
import WorldGlobe from '../components/art/WorldGlobe'
import { en } from '../content/i18n/en'
import { useProgress } from '../store/progress'

const t = en.end

// A gentle ending that sends the kid back to the real sky.
export default function End() {
  const { go, reset } = useProgress()
  const [confirm, setConfirm] = useState(false)

  return (
    <main className="space-sky relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Starfield />
      <div className="relative z-10 flex max-w-lg flex-col items-center gap-4">
        <WorldGlobe world="moon" className="float-slow w-40 drop-shadow-[0_0_50px_rgb(207_226_255/0.5)]" />
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <p className="font-hand text-3xl leading-snug text-paper">{t.line}</p>
        <p className="text-text-muted">{t.calm}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button onClick={() => go('map')}>{t.again}</Button>
          <Button variant="ghost" onClick={() => go('credits')}>{t.credits}</Button>
        </div>
        {confirm ? (
          <div className="mt-4 flex flex-wrap justify-center gap-3" role="alertdialog" aria-label={t.reset}>
            <Button variant="cap" onClick={reset}>{t.resetConfirm}</Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>{t.cancel}</Button>
          </div>
        ) : (
          <button type="button" className="mt-4 min-h-11 text-sm text-faint underline" onClick={() => setConfirm(true)}>
            {t.reset}
          </button>
        )}
      </div>
    </main>
  )
}
