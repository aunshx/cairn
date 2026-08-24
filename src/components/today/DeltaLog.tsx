import { useState } from 'react'
import { appendDelta, useTracker } from '../../hooks/useTracker'
import type { Delta } from '../../lib/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

const FIELDS = [
  { key: 'missed', label: 'What I missed' },
  { key: 'wrong', label: 'What I got wrong' },
  { key: 'ask', label: "What I didn't think to ask" },
] as const

const BLANK = { prob: '', missed: '', wrong: '', ask: '' }

type DeltaLogProps = {
  day: number
}

export function DeltaLog({ day }: DeltaLogProps) {
  const { state, update } = useTracker()
  const [draft, setDraft] = useState(BLANK)

  const filled = Object.values(draft).some((v) => v.trim() !== '')
  const recent = state.deltas.slice(-6).reverse()

  function save() {
    if (!filled) return
    const delta: Delta = { day, ...draft }
    update(appendDelta(delta))
    setDraft(BLANK)
  }

  return (
    <Card title="Delta log" meta={state.deltas.length > 0 ? `${state.deltas.length} total` : undefined} bodyClassName="">
      <div className="space-y-3 border-b border-rule p-3 sm:p-4">
        <input
          value={draft.prob}
          onChange={(e) => setDraft({ ...draft, prob: e.target.value })}
          placeholder="Problem name"
          aria-label="Problem name"
          className="w-full border border-rule bg-panel-2 px-3 py-1.5 text-[13px] outline-none focus:border-signal"
        />
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="micro mb-1.5 block">{field.label}</span>
            <textarea
              rows={2}
              value={draft[field.key]}
              onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
              className="w-full resize-y border border-rule bg-panel-2 px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-signal"
            />
          </label>
        ))}
        <Button variant="accent" onClick={save} disabled={!filled}>
          Save to day {day}
        </Button>
      </div>

      {recent.length === 0 ? (
        <div className="p-3 sm:p-4">
          <EmptyState
            title="No deltas yet"
            body="After each design problem, write the gap between your answer and the key. This is the panel you reread on mock days."
          />
        </div>
      ) : (
        <ul>
          {recent.map((delta, index) => (
            <li key={`${delta.day}-${index}`} className="border-b border-rule/60 px-3 py-3 last:border-b-0 sm:px-4">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] tabular-nums text-dim">d{delta.day}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{delta.prob || 'Untitled'}</span>
              </div>
              <dl className="mt-1.5 space-y-1">
                {FIELDS.map((field) =>
                  delta[field.key].trim() ? (
                    <div key={field.key} className="flex gap-2 text-[12px] leading-snug">
                      <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-dim">
                        {field.key}
                      </dt>
                      <dd className="min-w-0 flex-1 text-muted">{delta[field.key]}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
