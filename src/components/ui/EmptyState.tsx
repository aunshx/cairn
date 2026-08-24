type EmptyStateProps = {
  title: string
  body: string
  className?: string
}

export function EmptyState({ title, body, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-rule/80 bg-panel-2/30 px-4 py-6 sm:px-5 ${className}`}
    >
      <p className="micro">{title}</p>
      <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  )
}
