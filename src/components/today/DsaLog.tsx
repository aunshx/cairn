import { useState } from 'react'
import { addDsa, removeDsa, toggleDsaFlag, useTracker } from '../../hooks/useTracker'
import { NEETCODE_250 } from '../../lib/neetcode'
import type { DayRecord } from '../../lib/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DifficultyBadge } from '../ui/DifficultyBadge'
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
      <div className="flex gap-2 border-b border-rule/70 p-4 sm:p-5">
        <input
          list="neetcode-250"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Start typing a NeetCode problem, or paste a URL"
          aria-label="Problem name or URL"
          className="field min-w-0 flex-1 text-[13px]"
        />
        <Button onClick={add} disabled={!name.trim()}>
          Add
        </Button>
        <datalist id="neetcode-250">
          {NEETCODE_250.map((p) => (
            <option key={p.name} value={p.name}>
              {p.category} · {p.difficulty}
            </option>
          ))}
        </datalist>
      </div>

      {record.dsa.length === 0 ? (
        <div className="p-4 sm:p-5">
          <EmptyState
            title="Nothing logged today"
            body="Start typing and the NeetCode 250 filters as you go, or paste a problem URL and the title is read off the link. Anything you log from the list is ticked off in the DSA catalog. Flag the ones you did not get cleanly — flagging schedules a redo at +3, +10 and +30 days."
          />
        </div>
      ) : (
        <ul>
          {record.dsa.map((entry, index) => (
            <li
              key={`${entry.name}-${index}`}
              className="flex items-center gap-3 border-b border-rule/50 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-panel-2/40 sm:px-5"
            >
              <span className="font-mono text-[10px] tabular-nums text-dim">
                {String(index + 1).padStart(2, '0')}
              </span>
              {entry.url ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={entry.url}
                  className="min-w-0 flex-1 truncate text-[13px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
                >
                  {entry.name}
                </a>
              ) : (
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{entry.name}</span>
              )}
              {entry.nc !== undefined && NEETCODE_250[entry.nc] && (
                <>
                  <span className="hidden shrink-0 rounded-full border border-rule bg-panel-2/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-dim lg:block">
                    {NEETCODE_250[entry.nc]?.category}
                  </span>
                  <DifficultyBadge difficulty={NEETCODE_250[entry.nc]!.difficulty} />
                </>
              )}
              <Button
                size="sm"
                variant={entry.flag ? 'default' : 'ghost'}
                aria-pressed={entry.flag}
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
          ))}
        </ul>
      )}
    </Card>
  )
}
