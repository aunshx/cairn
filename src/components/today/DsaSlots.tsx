import { useState } from 'react'
import { addDsa, removeDsa, toggleDsaFlag, useTracker } from '../../hooks/useTracker'
import { NEETCODE_250 } from '../../lib/neetcode'
import type { DayRecord } from '../../lib/types'
import { Button } from '../ui/Button'
import { NEETCODE_LIST_ID } from './NeetcodeDatalist'
import { DifficultyBadge } from '../ui/DifficultyBadge'

type DsaSlotsProps = {
  day: number
  slot: string
  cap: number
  record: DayRecord
}

export function DsaSlots({ day, slot, cap, record }: DsaSlotsProps) {
  const { update } = useTracker()
  const [name, setName] = useState('')

  const rows = record.dsa
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.slot === slot)

  const full = rows.length >= cap

  function add() {
    if (!name.trim()) return
    update(addDsa(day, name, slot))
    setName('')
  }

  return (
    <div className="mt-2 space-y-1.5">
      {rows.map(({ entry, index }, position) => {
        const listed = entry.nc === undefined ? undefined : NEETCODE_250[entry.nc]
        return (
          <div
            key={`${entry.name}-${index}`}
            className="flex items-center gap-2 rounded-md border border-rule/60 bg-panel-2/50 px-2.5 py-1.5"
          >
            <span className="font-mono text-[10px] tabular-nums text-dim">{position + 1}</span>
            {entry.url ? (
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer noopener"
                className="min-w-0 flex-1 truncate text-[12px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
              >
                {entry.name}
              </a>
            ) : (
              <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{entry.name}</span>
            )}
            {listed && <DifficultyBadge difficulty={listed.difficulty} />}
            <Button
              size="sm"
              variant={entry.flag ? 'default' : 'ghost'}
              aria-pressed={entry.flag}
              title={
                entry.flag
                  ? 'Flagged, scheduled for a redo. Click to unschedule.'
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
              aria-label={`Remove ${entry.name}`}
              className="rounded-md px-1 font-mono text-[14px] leading-none text-dim transition-colors hover:bg-bad/10 hover:text-bad"
            >
              ×
            </button>
          </div>
        )
      })}

      {rows.length > 0 && (
        <p className="pt-0.5 text-[11px] leading-snug text-dim">
          Flag anything you did not get cleanly. It lands in the redo queue at +3, +10 and +30 days.
        </p>
      )}

      {!full && (
        <div className="flex gap-2">
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
            placeholder={`Problem ${rows.length + 1} of ${cap}, type or paste a URL`}
            aria-label={`Add problem to ${slot}`}
            className="field min-w-0 flex-1 py-1 text-[12px]"
          />
          <Button size="sm" onClick={add} disabled={!name.trim()}>
            Add
          </Button>
        </div>
      )}
    </div>
  )
}
