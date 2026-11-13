import type { ButtonHTMLAttributes } from 'react'

type Variant = 'cta' | 'ghost' | 'fact' | 'cap' | 'paper'

// The chunky "pressable" look: a solid edge under the button that disappears when pressed.
const styles: Record<Variant, string> = {
  cta: 'bg-cta text-on-cta shadow-[0_5px_0_var(--color-cta-edge)] active:shadow-[0_1px_0_var(--color-cta-edge)]',
  fact: 'bg-fact text-navy-950 shadow-[0_5px_0_var(--color-fact-edge)] active:shadow-[0_1px_0_var(--color-fact-edge)]',
  cap: 'bg-cap text-navy-950 shadow-[0_5px_0_var(--color-cap-edge)] active:shadow-[0_1px_0_var(--color-cap-edge)]',
  paper: 'bg-paper text-ink shadow-[0_5px_0_var(--color-paper-edge)] active:shadow-[0_1px_0_var(--color-paper-edge)]',
  ghost: 'bg-white/10 text-text ring-1 ring-white/20 hover:bg-white/15',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'md' | 'lg' }

export default function Button({ variant = 'cta', size = 'md', className = '', type = 'button', ...rest }: Props) {
  const pad = size === 'lg' ? 'min-h-14 px-8 text-xl' : 'min-h-12 px-6 text-lg'
  const press = variant === 'ghost' ? '' : 'active:translate-y-1'
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact ${pad} ${press} ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}

// Round icon-only button. Always pass an aria-label.
export function IconButton({ className = '', type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-label': string }) {
  return (
    <button
      type={type}
      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-text ring-1 ring-white/20 transition hover:bg-white/20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fact ${className}`}
      {...rest}
    />
  )
}
