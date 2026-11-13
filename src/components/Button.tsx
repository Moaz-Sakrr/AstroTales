import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

const base =
  'jelly inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-lg font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-fact disabled:cursor-not-allowed disabled:opacity-50'
const variants = {
  // candy-style 3D press: the edge shadow collapses on tap
  primary: 'bg-cta text-on-cta shadow-[0_5px_0_var(--color-cta-edge)] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_var(--color-cta-edge)]',
  ghost: 'border-2 border-white/25 bg-white/5 text-text hover:bg-white/10 active:translate-y-0.5',
}

export default function Button({ variant = 'primary', className = '', type = 'button', ...rest }: Props) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...rest} />
}
