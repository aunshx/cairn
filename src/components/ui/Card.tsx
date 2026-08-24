import type { ReactNode } from 'react'

type CardProps = {
  title?: string
  meta?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function Card({ title, meta, actions, children, className = '', bodyClassName = '' }: CardProps) {
  const hasHeader = Boolean(title || meta || actions)
  return (
    <section className={`surface overflow-hidden ${className}`}>
      {hasHeader && (
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule/70 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-baseline gap-3">
            {title && <h2 className="micro text-ink/90">{title}</h2>}
            {meta && <div className="truncate font-mono text-[11px] text-dim">{meta}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName || 'p-4 sm:p-5'}>{children}</div>
    </section>
  )
}
