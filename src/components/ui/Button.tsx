import type { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'accent' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const VARIANTS: Record<Variant, string> = {
  default: 'border-rule bg-panel-2 text-ink hover:border-dim hover:bg-rule/50',
  accent:
    'border-transparent bg-gradient-to-r from-signal to-accent text-ground font-semibold hover:brightness-110',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-panel-2 hover:text-ink',
  danger: 'border-bad/50 bg-bad/10 text-bad hover:bg-bad/20',
}

const SIZES: Record<Size, string> = {
  sm: 'rounded-md px-2.5 py-1 text-[10px] tracking-[0.12em]',
  md: 'rounded-lg px-3.5 py-2 text-[11px] tracking-[0.1em]',
}

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 border font-mono uppercase transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  )
}
