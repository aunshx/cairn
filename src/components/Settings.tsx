import { useRef, useState } from 'react'
import { useTracker } from '../hooks/useTracker'
import { emptyState, validateState } from '../lib/types'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

const CONFIRM_WORD = 'reset'

type SettingsProps = {
  open: boolean
  onClose: () => void
  email: string
  onSignOut: () => void
}

export function Settings({ open, onClose, email, onSignOut }: SettingsProps) {
  const { state, replace, saveState } = useTracker()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cairn-${state.start}.json`
    a.click()
    URL.revokeObjectURL(url)
    setError(null)
    setMessage('Exported.')
  }

  async function importJson(file: File) {
    setMessage(null)
    setError(null)
    try {
      const parsed: unknown = JSON.parse(await file.text())
      replace(validateState(parsed))
      setMessage('Imported and pushed. Anything the file was missing was filled with defaults.')
    } catch {
      setError('That file is not valid JSON. Nothing was changed.')
    }
  }

  function reset() {
    replace({ ...emptyState(), start: state.start })
    setConfirm('')
    setMessage('Everything cleared. The start date was kept.')
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <p className="micro">Signed in as</p>
          <p className="mt-1 font-mono text-[13px] text-ink break-all">{email}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
            Save status · {saveState}
          </p>
          <Button variant="ghost" className="mt-3" onClick={onSignOut}>
            Sign out
          </Button>
        </div>

        <div className="border-t border-rule/70 pt-5">
          <p className="micro">Your data</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={exportJson}>Export JSON</Button>
            <Button onClick={() => fileRef.current?.click()}>Import JSON</Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void importJson(file)
                e.target.value = ''
              }}
            />
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            Import replaces everything in this account and pushes immediately.
          </p>
        </div>

        <div className="border-t border-rule/70 pt-5">
          <p className="micro text-bad">Reset</p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            Clears all 42 days, catalogs, notes, deltas and redos. Type{' '}
            <span className="font-mono text-ink">{CONFIRM_WORD}</span> to enable it.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-label={`Type ${CONFIRM_WORD} to confirm`}
              placeholder={CONFIRM_WORD}
              className="field w-32 font-mono text-[12px]"
            />
            <Button variant="danger" disabled={confirm.trim().toLowerCase() !== CONFIRM_WORD} onClick={reset}>
              Reset everything
            </Button>
          </div>
        </div>

        {message && (
          <p role="status" className="rounded-lg border border-signal/40 bg-signal/10 px-3 py-2.5 text-[12px] text-signal">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2.5 text-[12px] text-bad">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}
