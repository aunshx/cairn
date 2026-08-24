import { Button } from './ui/Button'

type LoadFailureProps = {
  message: string
  onRetry: () => void
  onSignOut: () => void
}

export function LoadFailure({ message, onRetry, onSignOut }: LoadFailureProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border border-bad/50 bg-panel">
        <header className="border-b border-rule px-4 py-3">
          <h1 className="micro text-bad">Could not load your tracker</h1>
        </header>
        <div className="space-y-4 p-4">
          <p className="text-[13px] leading-relaxed text-ink">{message}</p>
          <p className="text-[12px] leading-relaxed text-muted">
            Nothing is being rendered from empty state on purpose. If the app opened blank, the next
            save would overwrite good data with nothing.
          </p>
          <div className="flex gap-2">
            <Button variant="accent" onClick={onRetry}>
              Retry
            </Button>
            <Button variant="ghost" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
