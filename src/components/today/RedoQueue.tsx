import { useState } from 'react'
import { addRedo, clearRedo, removeRedo, useTracker } from '../../hooks/useTracker'
import { nextDue } from '../../lib/metrics'
import type { Redo } from '../../lib/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

type RedoQueueProps = {
  day: number
}

type Entry = { redo: Redo; index: number; due: number }

function dueLabel(due: number, day: number): { text: string; className: string } {
  if (due < day) return { text: 'Overdue', className: 'border-bad/40 bg-bad/10 text-bad' }
  if (due === day) return { text: 'Due', className: 'border-flag/40 bg-flag/10 text-flag' }
  return { text: `d${due}`, className: 'border-rule bg-panel-2/60 text-dim' }
}

export function RedoQueue({ day }: RedoQueueProps) {
  const { state, update } = useTracker()
  const [name, setName] = useState('')

  const entries: Entry[] = state.redos
    .map((redo, index) => ({ redo, index, due: nextDue(redo) ?? -1 }))
    .filter((e) => e.due >= 0)
    .sort((a, b) => a.due - b.due || a.redo.name.localeCompare(b.redo.name))

  const overdue = entries.filter((e) => e.due < day).length

  function add() {
    if (!name.trim()) return
    update(addRedo(name, day))
    setName('')
  }

  return (
    <Card
      title="Redo queue"
      meta={entries.length > 0 ? `${entries.length} open${overdue ? ` · ${overdue} overdue` : ''}` : undefined}
      bodyClassName=""
    >
      <div className="flex gap-2 border-b border-rule/70 p-4 sm:p-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Add a problem to redo"
          aria-label="Add a problem to redo"
          className="field min-w-0 flex-1 text-[13px]"
        />
        <Button onClick={add} disabled={!name.trim()}>
          Add
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="p-4 sm:p-5">
          <EmptyState
            title="Queue is empty"
            body="Flag a problem in the DSA log and it lands here at +3, +10 and +30 days. Clearing one advances it to the next interval."
          />
        </div>
      ) : (
        <ul>
          {entries.map(({ redo, index, due }) => {
            const label = dueLabel(due, day)
            return (
              <li
                key={`${redo.name}-${index}`}
                className="flex items-center gap-3 border-b border-rule/50 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-panel-2/40 sm:px-5"
              >
                <span
                  className={`w-[4.5rem] shrink-0 rounded-full border px-2 py-0.5 text-center font-mono text-[9px] uppercase tracking-[0.1em] ${label.className}`}
                >
                  {label.text}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{redo.name}</span>
                <span className="hidden font-mono text-[10px] text-dim sm:inline">
                  {redo.cleared.length}/{redo.due.length}
                </span>
                <Button size="sm" variant="accent" onClick={() => update(clearRedo(index, day))}>
                  Clear
                </Button>
                <button
                  type="button"
                  onClick={() => update(removeRedo(index))}
                  aria-label={`Delete ${redo.name}`}
                  className="rounded-md px-1.5 py-0.5 font-mono text-[15px] leading-none text-dim transition-colors hover:bg-bad/10 hover:text-bad"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
