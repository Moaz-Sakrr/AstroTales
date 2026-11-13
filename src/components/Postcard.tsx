import { en } from '../content/i18n/en'

const t = en.landing.postcard

// Airmail postcard "written" by a device. Handwriting = the device's voice.
export default function Postcard({ className = '' }: { className?: string }) {
  return (
    <article className={`airmail w-full max-w-[30rem] -rotate-2 rounded-md p-2 shadow-[0_24px_60px_rgb(0_0_0/0.45)] ${className}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-sm bg-paper p-4 text-ink sm:gap-5 sm:p-5">
        <div className="flex flex-col justify-between gap-3 border-r border-ink/15 pr-3 sm:pr-5">
          <p className="font-hand text-[1.35rem] leading-snug sm:text-2xl">{t.message}</p>
          <p className="font-hand text-lg text-airmail-red">
            — {t.from}
            <span className="block text-sm text-ink/60">{t.fromPlace}</span>
          </p>
        </div>

        <div className="relative flex w-24 flex-col gap-3 sm:w-28">
          {/* stamp: dotted outline in paper color reads as perforation */}
          <div className="ml-auto flex h-24 w-20 flex-col items-center justify-center gap-1 bg-navy-700 outline-[3px] outline-dotted -outline-offset-2 outline-paper">
            <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
              <circle cx="20" cy="20" r="16" fill="#CFCFD8" />
              <circle cx="14" cy="15" r="4" fill="#A9AEBF" />
              <circle cx="25" cy="25" r="3" fill="#A9AEBF" />
              <circle cx="24" cy="12" r="2" fill="#A9AEBF" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#FFC93C" strokeWidth="1.5" />
            </svg>
            <span className="text-[0.6rem] font-semibold text-coin">{t.stamp}</span>
          </div>

          {/* postmark over the stamp corner */}
          <svg viewBox="0 0 120 70" className="pointer-events-none absolute -left-10 top-14 w-32 -rotate-12 text-airmail-blue opacity-80" aria-hidden="true">
            <defs>
              <path id="pm-arc" d="M18,35 a22,22 0 1,1 44,0" />
            </defs>
            <circle cx="40" cy="35" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="40" cy="35" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
            <text fontSize="6.5" fontWeight="600" fill="currentColor" letterSpacing="0.5">
              <textPath href="#pm-arc" startOffset="50%" textAnchor="middle">{t.postmarkPlace}</textPath>
            </text>
            <text x="40" y="41" fontSize="7" fontWeight="700" fill="currentColor" textAnchor="middle">{t.postmarkDate}</text>
            {[20, 30, 40, 50].map((y) => (
              <path key={y} d={`M70,${y} q6,-4 12,0 t12,0 t12,0 t12,0`} fill="none" stroke="currentColor" strokeWidth="1.6" />
            ))}
          </svg>

          <div className="mt-auto font-hand text-lg leading-tight">
            {t.to.map((line) => (
              <p key={line} className="border-b border-ink/25 pb-0.5">{line}</p>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
