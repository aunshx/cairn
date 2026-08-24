import type { SaveState } from '../lib/types'

const COPY: Record<SaveState, { label: string; className: string; dot: string }> = {
  unsaved: { label: 'Unsaved', className: 'text-flag border-flag/40 bg-flag/10', dot: 'bg-flag' },
  saving: { label: 'Saving', className: 'text-muted border-rule bg-panel-2/70', dot: 'bg-muted animate-pulse' },
  saved: { label: 'Saved', className: 'text-signal border-signal/30 bg-signal/10', dot: 'bg-signal' },
  failed: { label: 'Retrying', className: 'text-bad border-bad/40 bg-bad/10', dot: 'bg-bad animate-pulse' },
}

type SaveStatusProps = {
  state: SaveState
  onOpenSettings: () => void
}

export function SaveStatus({ state, onOpenSettings }: SaveStatusProps) {
  const copy = COPY[state]
  return (
    <button
      type="button"
      onClick={onOpenSettings}
      title="Open settings"
      aria-label={`Save status: ${copy.label}. Open settings`}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-150 hover:brightness-125 ${copy.className}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${copy.dot}`} />
      <span aria-live="polite">{copy.label}</span>
    </button>
  )
}
