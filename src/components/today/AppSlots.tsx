import { useState } from 'react'
import { addApplication, removeApplication, updateApplication, useTracker } from '../../hooks/useTracker'
import { applicationsForDay } from '../../lib/metrics'
import { Button } from '../ui/Button'
import { StatusSelect } from '../ui/StatusSelect'

type AppSlotsProps = {
  day: number
  cap: number
}

const BLANK = { company: '', role: '', url: '' }

export function AppSlots({ day, cap }: AppSlotsProps) {
  const { state, update } = useTracker()
  const [draft, setDraft] = useState(BLANK)

  const rows = applicationsForDay(state, day)
  const full = rows.length >= cap

  function add() {
    if (!draft.company.trim()) return
    update(addApplication(day, draft.company, draft.role, draft.url))
    setDraft(BLANK)
  }

  return (
    <div className="mt-2 space-y-1.5">
      {rows.map(({ app, index }, position) => (
        <div
          key={`${app.company}-${index}`}
          className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-rule/60 bg-panel-2/50 px-2.5 py-1.5"
        >
          <span className="font-mono text-[10px] tabular-nums text-dim">{position + 1}</span>
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
            {app.url ? (
              <a
                href={app.url}
                target="_blank"
                rel="noreferrer noopener"
                className="truncate text-[12px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
              >
                {app.company}
              </a>
            ) : (
              <span className="truncate text-[12px] text-ink">{app.company}</span>
            )}
            {app.role && <span className="truncate text-[11px] text-muted">{app.role}</span>}
          </div>
          <StatusSelect
            status={app.status}
            label={`Status for ${app.company}`}
            onChange={(status) => update(updateApplication(index, { status }))}
          />
          <button
            type="button"
            onClick={() => update(removeApplication(index))}
            aria-label={`Remove ${app.company}`}
            className="rounded-md px-1 font-mono text-[14px] leading-none text-dim transition-colors hover:bg-bad/10 hover:text-bad"
          >
            ×
          </button>
        </div>
      ))}

      {!full && (
        <div className="flex flex-wrap gap-2">
          <input
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            placeholder={`Company ${rows.length + 1} of ${cap}`}
            aria-label="Company"
            className="field min-w-0 flex-1 py-1 text-[12px] sm:flex-[1.2]"
          />
          <input
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            placeholder="Position"
            aria-label="Position"
            className="field min-w-0 flex-1 py-1 text-[12px]"
          />
          <input
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            placeholder="Job URL"
            aria-label="Job URL"
            className="field min-w-0 flex-1 py-1 font-mono text-[11px]"
          />
          <Button size="sm" onClick={add} disabled={!draft.company.trim()}>
            Add
          </Button>
        </div>
      )}
    </div>
  )
}
