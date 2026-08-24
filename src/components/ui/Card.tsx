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
    <section className={`border border-rule bg-panel ${className}`}>
      {hasHeader && (
        <header className="flex items-baseline justify-between gap-3 border-b border-rule px-4 py-2.5">
          <div className="flex items-baseline gap-3 min-w-0">
            {title && <h2 className="micro truncate">{title}</h2>}
            {meta && <div className="micro text-dim truncate">{meta}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName || 'p-4'}>{children}</div>
    </section>
  )
}
