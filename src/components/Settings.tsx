import { useRef, useState } from 'react'
import { setPlan, useTracker } from '../hooks/useTracker'
import { planTargets } from '../lib/metrics'
import { daysOf, dayType, endDateIso, parseIso } from '../lib/schedule'
import {
  MAX_CYCLE,
  MAX_TOTAL_DAYS,
  MIN_CYCLE,
  MIN_TOTAL_DAYS,
  emptyState,
  planOf,
  validateState,
  type TrackerState,
} from '../lib/types'
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
  const { state, update, replace, flushNow, saveState } = useTracker()

  const [draft, setDraft] = useState({
    start: state.start,
    end: endDateIso(planOf(state)),
    cycle: state.cycle,
  })
  const [confirmPlan, setConfirmPlan] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const draftDays = Math.round(
    (parseIso(draft.end).getTime() - parseIso(draft.start).getTime()) / 86_400_000 + 1,
  )
  const daysValid =
    Number.isFinite(draftDays) && draftDays >= MIN_TOTAL_DAYS && draftDays <= MAX_TOTAL_DAYS
  const planDirty =
    draft.start !== state.start || draftDays !== state.totalDays || draft.cycle !== state.cycle

  const preview: TrackerState = daysValid
    ? { ...state, start: draft.start, totalDays: draftDays, cycle: draft.cycle }
    : state

  const targets = planTargets(preview)
  const counts = daysOf(preview.totalDays).reduce(
    (acc, d) => {
      acc[dayType(d, preview.cycle)] += 1
      return acc
    },
    { A: 0, B: 0, M: 0 } as Record<'A' | 'B' | 'M', number>,
  )

  const recordedDays = Object.keys(state.days).length

  function savePlan() {
    if (!daysValid) return
    update(setPlan({ start: draft.start, totalDays: draftDays, cycle: draft.cycle }))
    flushNow()
    setConfirmPlan(false)
    setError(null)
    setMessage(
      `Programme saved. ${draftDays} days, ${draft.cycle - 1} work days per mock day. The timeline was cleared.`,
    )
  }

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
    replace({
      ...emptyState(),
      start: state.start,
      totalDays: state.totalDays,
      cycle: state.cycle,
      theme: state.theme,
    })
    setConfirm('')
    setMessage('Everything cleared. The programme shape and theme were kept.')
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
          <Button className="mt-3" onClick={onSignOut}>
            Sign out
          </Button>
        </div>

        <div className="border-t border-rule/70 pt-5">
          <p className="micro">Programme</p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">
            Every target below is recalculated from this shape. Nothing is hard-coded.
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="micro mb-1.5 block">Start date</span>
              <input
                type="date"
                value={draft.start}
                onChange={(e) => {
                  setDraft({ ...draft, start: e.target.value })
                  setConfirmPlan(false)
                }}
                className="field font-mono text-[12px]"
              />
            </label>

            <label className="block">
              <span className="micro mb-1.5 block">End date</span>
              <input
                type="date"
                value={draft.end}
                min={draft.start}
                onChange={(e) => {
                  setDraft({ ...draft, end: e.target.value })
                  setConfirmPlan(false)
                }}
                className="field font-mono text-[12px]"
              />
            </label>

            <label className="block">
              <span className="micro mb-1.5 block">Split · work days per mock</span>
              <input
                type="number"
                min={MIN_CYCLE - 1}
                max={MAX_CYCLE - 1}
                value={draft.cycle - 1}
                onChange={(e) => {
                  setDraft({ ...draft, cycle: Number(e.target.value) + 1 })
                  setConfirmPlan(false)
                }}
                className="field font-mono text-[12px]"
              />
            </label>

            <div>
              <span className="micro mb-1.5 block">Total days</span>
              <p
                className={`field flex items-center font-mono text-[12px] ${
                  daysValid ? 'text-ink' : 'text-bad'
                }`}
              >
                {Number.isFinite(draftDays) ? draftDays : '--'}
                <span className="ml-2 text-dim">from the dates</span>
              </p>
            </div>
          </div>

          {!daysValid && (
            <p className="mt-2 text-[12px] leading-snug text-bad">
              The end date must be after the start date, and the programme has to run between{' '}
              {MIN_TOTAL_DAYS} and {MAX_TOTAL_DAYS} days.
            </p>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-rule/60 pt-3 sm:grid-cols-3">
            {[
              ['Days', `${counts.A} A · ${counts.B} B · ${counts.M} M`],
              ['DSA', `${targets.dsa}`],
              ['Applications', `${targets.apps}`],
              ['Mocks', `${targets.mock}`],
              ['Mechanisms', `${targets.mech}`],
              ['Behavioral', `${targets.beh}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-dim">{label}</dt>
                <dd className="font-mono text-[11px] tabular-nums text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant={confirmPlan ? 'danger' : 'accent'}
              disabled={!daysValid || !planDirty}
              onClick={() => (confirmPlan ? savePlan() : setConfirmPlan(true))}
            >
              {confirmPlan ? 'Yes, save it' : 'Save programme'}
            </Button>

            {confirmPlan && (
              <Button onClick={() => setConfirmPlan(false)}>Cancel</Button>
            )}

            {planDirty && !confirmPlan && (
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-flag">
                Unsaved changes
              </span>
            )}
          </div>

          {confirmPlan && (
            <p className="mt-2 max-w-prose text-[12px] leading-relaxed text-flag">
              This rewrites the shape of the whole programme. Day types are recalculated and{' '}
              <span className="text-bad">the timeline is cleared</span>. Every tick, counter, pick
              and note on all {state.totalDays} day rows goes, because a given day no longer falls on the
              same date or carries the same tasks.
              {recordedDays > 0
                ? ` ${recordedDays} recorded ${recordedDays === 1 ? 'day' : 'days'} will be erased.`
                : ' Nothing is recorded yet, so nothing is lost.'}{' '}
              Catalogs, applications, delta logs and the redo queue are kept. Export first if you
              want a copy.
            </p>
          )}
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
            Clears all {state.totalDays} days, plus catalogs, notes, deltas, redos and applications. Type{' '}
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
