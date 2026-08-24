import type { SaveState } from '../lib/types'

const COPY: Record<SaveState, { label: string; className: string; dot: string }> = {
  unsaved: { label: 'Unsaved', className: 'text-flag border-flag/50', dot: 'bg-flag' },
  saving: { label: 'Saving…', className: 'text-muted border-rule', dot: 'bg-muted' },
  saved: { label: 'Saved', className: 'text-signal border-signal/40', dot: 'bg-signal' },
  failed: { label: 'Save failed — retrying', className: 'text-bad border-bad/50', dot: 'bg-bad' },
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
      aria-label={`Save status: ${copy.label}. Open settings`}
      className={`inline-flex items-center gap-2 border bg-panel px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors hover:bg-panel-2 ${copy.className}`}
    >
      <span aria-hidden="true" className={`size-1.5 ${copy.dot}`} />
      <span aria-live="polite">{copy.label}</span>
    </button>
  )
}
