import { finishedDays, percent, slips } from '../../lib/metrics'
import type { TrackerState } from '../../lib/types'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

type SlipListProps = {
  state: TrackerState
}

export function SlipList({ state }: SlipListProps) {
  const rows = slips(state)
  const days = finishedDays(state).length

  return (
    <Card title="What slips first" meta={days > 0 ? `${days} finished days` : undefined}>
      {rows.length === 0 ? (
        <EmptyState
          title="Nothing has slipped yet"
          body="Once you mark days finished, the five tasks you skip most often show here, ranked by the share of days they were available and left unchecked."
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((slip) => (
            <li key={slip.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[13px] text-ink">{slip.label}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-flag">{percent(slip.rate)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-2">
                <div className="h-full rounded-full bg-gradient-to-r from-flag/70 to-bad/70" style={{ width: `${slip.rate * 100}%` }} />
              </div>
              <p className="mt-1 font-mono text-[10px] text-dim">
                missed {slip.missed} of {slip.available}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
