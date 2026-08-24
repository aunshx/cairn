import type { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'accent' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const VARIANTS: Record<Variant, string> = {
  default: 'border-rule bg-panel-2 text-ink hover:border-dim hover:bg-rule/40',
  accent: 'border-signal/60 bg-signal/10 text-signal hover:bg-signal/20',
  ghost: 'border-transparent bg-transparent text-muted hover:border-rule hover:text-ink',
  danger: 'border-bad/60 bg-bad/10 text-bad hover:bg-bad/20',
}

const SIZES: Record<Size, string> = {
  sm: 'px-2 py-1 text-[10px] tracking-[0.14em]',
  md: 'px-3 py-1.5 text-[11px] tracking-[0.12em]',
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
      className={`inline-flex items-center justify-center gap-1.5 border font-mono uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  )
}
