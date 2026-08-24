import { useState } from 'react'
import { addDsa, removeDsa, toggleDsaFlag, useTracker } from '../../hooks/useTracker'
import type { DayRecord } from '../../lib/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

type DsaLogProps = {
  day: number
  record: DayRecord
}

export function DsaLog({ day, record }: DsaLogProps) {
  const { update } = useTracker()
  const [name, setName] = useState('')

  function add() {
    if (!name.trim()) return
    update(addDsa(day, name))
    setName('')
  }

  const flagged = record.dsa.filter((e) => e.flag).length

  return (
    <Card
      title="DSA log"
      meta={record.dsa.length > 0 ? `${record.dsa.length} logged · ${flagged} flagged` : undefined}
      bodyClassName=""
    >
      <div className="flex gap-2 border-b border-rule p-3 sm:p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Problem name"
          aria-label="Problem name"
          className="min-w-0 flex-1 border border-rule bg-panel-2 px-3 py-1.5 text-[13px] outline-none focus:border-signal"
        />
        <Button onClick={add} disabled={!name.trim()}>
          Add
        </Button>
      </div>

      {record.dsa.length === 0 ? (
        <div className="p-3 sm:p-4">
          <EmptyState
            title="Nothing logged today"
            body="Name each problem as you finish it. Flag the ones you did not get cleanly — flagging schedules a redo at +3, +10 and +30 days."
          />
        </div>
      ) : (
        <ul>
          {record.dsa.map((entry, index) => (
            <li
              key={`${entry.name}-${index}`}
              className="flex items-center gap-3 border-b border-rule/60 px-3 py-2 last:border-b-0 sm:px-4"
            >
              <span className="font-mono text-[10px] tabular-nums text-dim">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{entry.name}</span>
              <Button
                size="sm"
                variant={entry.flag ? 'default' : 'ghost'}
                aria-pressed={entry.flag}
                className={entry.flag ? 'border-flag/60 bg-flag/10 text-flag' : ''}
                onClick={() => update(toggleDsaFlag(day, index))}
              >
                Flag
              </Button>
              <button
                type="button"
                onClick={() => update(removeDsa(day, index))}
                aria-label={`Delete ${entry.name}`}
                className="font-mono text-[13px] leading-none text-dim hover:text-bad"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
