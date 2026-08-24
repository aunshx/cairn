import { useState } from 'react'
import { addDsa, removeDsa, toggleDsaFlag, useTracker } from '../../hooks/useTracker'
import { NEETCODE_250 } from '../../lib/neetcode'
import type { DayRecord } from '../../lib/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DifficultyBadge } from '../ui/DifficultyBadge'
import { NEETCODE_LIST_ID } from './NeetcodeDatalist'

type DsaLogProps = {
  day: number
  record: DayRecord
}

export function DsaLog({ day, record }: DsaLogProps) {
  const { update } = useTracker()
  const [name, setName] = useState('')

  const rows = record.dsa
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => !entry.slot)

  const flagged = record.dsa.filter((e) => e.flag).length

  function add() {
    if (!name.trim()) return
    update(addDsa(day, name))
    setName('')
  }

  return (
    <Card
      title="Extra DSA"
      meta={`${record.dsa.length} today · ${flagged} flagged`}
      bodyClassName=""
    >
      <div className="flex gap-2 border-b border-rule/70 p-4 sm:p-5">
        <input
          list={NEETCODE_LIST_ID}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Anything beyond the session blocks"
          aria-label="Add an extra problem"
          className="field min-w-0 flex-1 text-[13px]"
        />
        <Button onClick={add} disabled={!name.trim()}>
          Add
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="p-4 text-[12px] leading-relaxed text-muted sm:p-5">
          Problems you do inside the 4 DSA and 3 DSA blocks are logged on those rows above. This is
          for anything extra — a redo from the queue, or a problem outside the plan.
        </p>
      ) : (
        <ul>
          {rows.map(({ entry, index }) => {
            const listed = entry.nc === undefined ? undefined : NEETCODE_250[entry.nc]
            return (
              <li
                key={`${entry.name}-${index}`}
                className="flex items-center gap-3 border-b border-rule/50 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-panel-2/40 sm:px-5"
              >
                {entry.url ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="min-w-0 flex-1 truncate text-[13px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
                  >
                    {entry.name}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{entry.name}</span>
                )}
                {listed && <DifficultyBadge difficulty={listed.difficulty} />}
                <Button
                  size="sm"
                  variant={entry.flag ? 'default' : 'ghost'}
                  aria-pressed={entry.flag}
                  title={
                    entry.flag
                      ? 'Flagged — scheduled for a redo. Click to unschedule.'
                      : "Didn't get it cleanly? Flag it to schedule a redo at +3, +10 and +30 days."
                  }
                  aria-label={`${entry.flag ? 'Unflag' : 'Flag'} ${entry.name} for a redo`}
                  className={entry.flag ? 'border-flag/50 bg-flag/15 text-flag' : ''}
                  onClick={() => update(toggleDsaFlag(day, index))}
                >
                  Flag
                </Button>
                <button
                  type="button"
                  onClick={() => update(removeDsa(day, index))}
                  aria-label={`Delete ${entry.name}`}
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
