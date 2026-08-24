import { mechanismResults, recentNotes } from '../../lib/metrics'
import type { TrackerState } from '../../lib/types'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

type RecentNotesProps = {
  state: TrackerState
  onJump: (day: number) => void
}

export function RecentNotes({ state, onJump }: RecentNotesProps) {
  const items = recentNotes(state)
  const mechs = mechanismResults(state)

  return (
    <Card title="Recent notes" meta={items.length > 0 ? 'newest first' : undefined}>
      {items.length === 0 ? (
        <EmptyState
          title="Nothing written yet"
          body="Delta log entries and day notes collect here, newest first, so the last week of thinking is one scroll away. Click any line to jump to that day."
        />
      ) : (
        <ul className="divide-y divide-rule/60">
          {items.map((item, index) => (
            <li key={`${item.kind}-${item.day}-${index}`}>
              <button
                type="button"
                onClick={() => onJump(item.day)}
                className="block w-full py-2.5 text-left first:pt-0 hover:bg-panel-2/50"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] tabular-nums text-dim">d{item.day}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                    {item.kind === 'delta' ? 'delta' : 'day note'}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink">
                  {item.kind === 'delta'
                    ? [item.delta.prob, item.delta.missed, item.delta.wrong, item.delta.ask]
                        .filter((s) => s.trim())
                        .join(' · ')
                    : item.note}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 border-t border-rule pt-4">
        <p className="micro">Mechanism numbers</p>
        {mechs.length === 0 ? (
          <p className="mt-2 max-w-prose text-[12px] leading-relaxed text-muted">
            Every second B day is a mechanism build. The number you measure gets recorded on the task and
            collects here, because these are the figures worth rereading before an interview.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {mechs.map((mech) => (
              <li key={mech.index} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-mono text-[10px] tabular-nums text-dim">
                  {String(mech.index + 1).padStart(2, '0')}
                </span>
                <span className="text-[12px] text-ink">{mech.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-dim">{mech.ties}</span>
                <span className="ml-auto font-mono text-[11px] text-signal">{mech.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
