export function Booting({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="micro" role="status">
        {label}
        <span className="ml-1 text-dim">…</span>
      </p>
    </div>
  )
}
