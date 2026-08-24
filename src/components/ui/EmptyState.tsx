type EmptyStateProps = {
  title: string
  body: string
  className?: string
}

export function EmptyState({ title, body, className = '' }: EmptyStateProps) {
  return (
    <div className={`border border-dashed border-rule px-4 py-6 ${className}`}>
      <p className="micro">{title}</p>
      <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  )
}
