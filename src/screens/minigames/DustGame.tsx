import { useEffect, useRef, useState, type PointerEvent } from 'react'
import Button from '../../components/Button'
import DeviceArt from '../../components/art/DeviceArt'
import { en } from '../../content/i18n/en'
import { sfx } from '../../audio/sfx'

const t = en.dust
const COLS = 8
const DONE_AT = 0.9 // 90% clean is "clean enough"

// Rub the dust off Opportunity's solar panels. Each column of panel holds its own dust (1 = dirty, 0 = clean).
export default function DustGame({ onDone }: { onDone: () => void }) {
  const [dust, setDust] = useState<number[]>(() => Array(COLS).fill(1))
  const area = useRef<HTMLDivElement>(null)
  const clean = 1 - dust.reduce((a, b) => a + b, 0) / COLS
  const finished = clean >= DONE_AT

  const wipe = (col: number, amount: number) => {
    setDust((d) => {
      if (d[col] <= 0) return d
      const copy = [...d]
      copy[col] = Math.max(0, copy[col] - amount)
      return copy
    })
  }

  // A little ding each time a whole column gets clean.
  const cleanCols = dust.filter((d) => d === 0).length
  const prevClean = useRef(0)
  useEffect(() => {
    if (cleanCols > prevClean.current) sfx.coin()
    prevClean.current = cleanCols
  }, [cleanCols])

  // Map the pointer's x to a panel column. The panel spans 6%–94% of the art's width.
  const rub = (e: PointerEvent<HTMLDivElement>, amount: number) => {
    const box = area.current?.getBoundingClientRect()
    if (!box) return
    const fx = (e.clientX - box.left) / box.width
    const col = Math.floor(((fx - 0.06) / 0.88) * COLS)
    if (col >= 0 && col < COLS) wipe(col, amount)
  }

  // Keyboard / switch users: wipe the dirtiest column.
  const wipeNext = () => {
    const col = dust.indexOf(Math.max(...dust))
    wipe(col, 0.5)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={area}
        className="relative aspect-square w-full max-w-md touch-none select-none rounded-3xl bg-[linear-gradient(#E0703A,#8E3A1F)] p-4 ring-2 ring-white/10"
        onPointerDown={(e) => rub(e, 0.35)}
        onPointerMove={(e) => (e.buttons || e.pointerType === 'touch') && rub(e, 0.08)}
        aria-hidden="true"
      >
        <div className="relative h-full w-full">
          <DeviceArt id="opportunity" className="h-full w-full" />
          {dust.map((d, i) => (
            <span
              key={i}
              className="absolute rounded-sm bg-[radial-gradient(circle,#D9965A_0%,#A8642E_100%)] transition-opacity"
              style={{ left: `${6 + (i * 88) / COLS}%`, width: `${88 / COLS + 0.4}%`, top: '46.5%', height: '11.5%', opacity: d * 0.92 }}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm font-semibold">
          <span>{t.battery}</span>
          <span className="tabular-nums">{Math.round(clean * 100)}%</span>
        </div>
        <div className="mt-1 h-5 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20" role="progressbar" aria-valuenow={Math.round(clean * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={t.battery}>
          <div className={`h-full rounded-full transition-all ${finished ? 'bg-fact' : 'bg-coin'}`} style={{ width: `${clean * 100}%` }} />
        </div>
      </div>

      <div className="flex min-h-16 flex-col items-center gap-3 text-center" aria-live="polite">
        {finished ? (
          <>
            <p className="text-2xl font-bold text-fact">{t.done}</p>
            <Button onClick={onDone}>{t.next}</Button>
          </>
        ) : (
          <Button variant="ghost" onClick={wipeNext}>{t.wipe}</Button>
        )}
      </div>
    </div>
  )
}
