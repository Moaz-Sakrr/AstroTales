import { useEffect, useState } from 'react'
import { Howl } from 'howler'
import Starfield from '../components/Starfield'
import Astronaut from '../components/Astronaut'
import Button from '../components/Button'
import CharacterFace from '../components/CharacterFace'
import { preloadCharacter, REACTIONS } from '../content/characters'
import { deviceById, worlds } from '../content/worlds'
import { tx } from '../content/l10n'
import { en } from '../content/i18n/en'
import { useMedia } from '../hooks/useMedia'
import { useGame } from '../store/progress'
import { useTypewriter } from './story/useTypewriter'
import { clip, duck, sfx } from '../audio/engine'

const t = en.story

// One story, two layouts: Stories (phones) and a game scene (laptops). Same data, same controls.
export default function Story() {
  const deviceId = useGame((s) => s.deviceId)
  const character = useGame((s) => s.character)
  const go = useGame((s) => s.go)
  const wide = useMedia('(min-width: 768px)')
  const device = deviceById[deviceId]
  const [i, setI] = useState(0)
  const card = device.story[i]
  const [msPerChar, setMsPerChar] = useState(32)
  const { shown, done, finish } = useTypewriter(tx(card.line), msPerChar)

  // Play this card's voice; stretch the typing over the clip so text and voice end together.
  // A NASA radio "quindar" beep opens the line (once its file exists), and the music ducks while the device talks.
  useEffect(() => {
    const voice = new Howl({ src: [`/audio/en/${device.id}/${i}.mp3`] })
    voice.once('load', () => setMsPerChar((voice.duration() * 1000) / tx(card.line).length))
    voice.on('play', () => duck(true))
    voice.on('end', () => duck(false))
    const lead = Math.min(clip('quindar'), 0.6)
    const id = setTimeout(() => voice.play(), lead * 1000)
    return () => {
      clearTimeout(id)
      voice.unload()
      duck(false)
    }
  }, [device.id, i, card])
  const reaction = REACTIONS[i % REACTIONS.length] // how the kid reacts to this card
  useEffect(() => preloadCharacter(character), [character])

  const next = () => {
    if (!done) return finish()
    sfx('swipe')
    if (i < device.story.length - 1) setI(i + 1)
    else go('quiz')
  }
  const back = () => {
    if (i === 0) return
    sfx('swipe')
    setI(i - 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') back()
      else if (e.key === 'Escape') go('level')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const portrait = (cls: string) => (
    <div className={`relative ${cls}`}>
      <div className={`absolute -inset-3 rounded-full bg-cta/40 blur-xl transition-opacity duration-500 ${done ? 'opacity-30' : 'opacity-100 motion-safe:animate-pulse'}`} />
      <img src={device.photos[0].src} alt={device.name} className="relative h-full w-full rounded-full object-cover ring-4 ring-cta" />
      {i === 0 && <span className="absolute -right-2 top-0 rotate-6 rounded-full bg-cap px-3 py-1 text-sm font-bold text-white">That's me!</span>}
    </div>
  )
  const wave = (
    <span className={`flex h-5 items-end gap-0.5 ${done ? 'opacity-30' : ''}`} aria-label={done ? undefined : t.speaking}>
      {[0, 1, 2, 3].map((b) => (
        <span key={b} className="w-1 rounded-full bg-current motion-safe:animate-[wave_0.8s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: `${b * 0.12}s`, animationPlayState: done ? 'paused' : 'running' }} />
      ))}
    </span>
  )
  const close = (
    <button type="button" onClick={() => go('level')} aria-label={t.close} className="grid h-11 w-11 place-items-center rounded-full bg-black/40 text-text backdrop-blur-sm hover:bg-black/60">
      <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
    </button>
  )

  if (!wide) {
    // ---- StoryView: phone, Instagram-style ----
    return (
      <main className="space-sky relative flex h-svh flex-col overflow-hidden">
        <Starfield />
        <div className="relative z-10 flex gap-1.5 px-3 pt-3">
          {device.story.map((_, k) => (
            <span key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <span className="block h-full bg-white transition-[width] duration-300" style={{ width: k < i ? '100%' : k === i ? (done ? '100%' : '50%') : '0%' }} />
            </span>
          ))}
        </div>
        <div className="relative z-10 flex items-center justify-between px-3 pt-3">
          <p className="font-semibold">{device.nickname} <span className="font-normal text-text-muted">@{device.handle}</span></p>
          {close}
        </div>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <div className="relative">
            {portrait('h-[min(64vw,16rem)] w-[min(64vw,16rem)]')}
            <CharacterFace kind={character} mood={reaction.mood} className="absolute -bottom-3 -left-5 h-20 w-20 ring-4 ring-cta" />
          </div>
          <p className="rounded-full bg-black/40 px-4 py-1 text-sm font-semibold text-cta">{tx(card.kicker)}</p>
        </div>
        <div className="relative z-10 m-3 rounded-3xl bg-paper p-5 text-ink shadow-2xl">
          <div className="mb-1 flex items-center gap-2 text-airmail-red">{wave}</div>
          <p className="min-h-[5.5rem] font-hand text-2xl leading-snug" aria-live="polite">{shown}</p>
          {/* tells the kid the page is waiting for a tap, only once the line is fully typed */}
          <p className={`mt-2 flex items-center justify-between text-sm font-semibold text-ink/60 transition-opacity ${done ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
            <span>{i + 1} / {device.story.length}</span>
            <span className="flex items-center gap-1 text-airmail-blue">
              {i < device.story.length - 1 ? t.tapNext : t.tapQuiz}
              <svg viewBox="0 0 20 20" className="h-4 w-4 motion-safe:animate-pulse"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
            </span>
          </p>
        </div>
        {/* tap zones: left = back, right = next */}
        <button type="button" onClick={back} aria-label={t.back} className="absolute inset-y-24 left-0 z-20 w-1/3" />
        <button type="button" onClick={next} aria-label={t.next} className="absolute inset-y-24 right-0 z-20 w-2/3" />
      </main>
    )
  }

  // ---- SceneView: laptop, game scene ----
  return (
    <main className="space-sky relative h-svh overflow-hidden">
      <Starfield />
      <div className="absolute inset-x-[-10%] bottom-0 h-[42%] rounded-[50%_50%_0_0/18%_18%_0_0] bg-cover bg-center shadow-[inset_0_20px_40px_rgb(0_0_0/0.4)]" style={{ backgroundImage: `url(${worlds[device.world].texture})` }} />
      <div className="absolute right-4 top-4 z-10">{close}</div>

      <div className="absolute bottom-[33%] right-[12%]">{portrait('h-[min(26vw,280px)] w-[min(26vw,280px)]')}</div>

      <section className="absolute inset-x-0 bottom-6 mx-auto w-[min(92%,900px)] rounded-3xl bg-paper p-6 pt-8 text-ink shadow-2xl">
        {/* the kid stands on top of the text box, clear of its name tag, however tall the box grows */}
        <div className="absolute bottom-full left-[4%] mb-8 w-[min(18vw,200px)]">
          <Astronaut kind={character} pose={reaction.pose} width={200} className="h-auto w-full" />
          <CharacterFace kind={character} mood={reaction.mood} className="absolute -left-8 -top-2 h-[min(8vw,80px)] w-[min(8vw,80px)] ring-4 ring-cta" />
        </div>
        <div className="absolute -top-5 left-6 flex items-center gap-3 rounded-full bg-navy-900 py-1.5 pl-1.5 pr-4 text-text">
          <img src={device.photos[0].src} alt="" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-semibold">{device.nickname}</span>
          <span className="text-cta">{wave}</span>
        </div>
        <p className="text-sm font-semibold text-airmail-blue">{tx(card.kicker)}</p>
        <p className="mt-1 min-h-[4.5rem] font-hand text-3xl leading-snug" aria-live="polite">{shown}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-ink/60">{i + 1} / {device.story.length}</span>
          <div className="flex gap-3">
            <Button variant="ghost" sound={null} className="border-ink/20 text-ink hover:bg-ink/5" onClick={back} disabled={i === 0}>{t.back}</Button>
            <Button sound={null} onClick={next}>{t.next}</Button>
          </div>
        </div>
      </section>
    </main>
  )
}
