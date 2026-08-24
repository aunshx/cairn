import { toggleTask, useTracker } from '../../hooks/useTracker'
import { revisionKey, revisionQueue } from '../../lib/metrics'
import { formatShortDate } from '../../lib/schedule'
import type { DayRecord } from '../../lib/types'
import { Card } from '../ui/Card'
import { Checkbox } from '../ui/Checkbox'
import { DifficultyBadge } from '../ui/DifficultyBadge'
import { EmptyState } from '../ui/EmptyState'

const KIND_TONE: Record<string, string> = {
  DSA: 'border-accent/40 bg-accent/10 text-accent',
  HLD: 'border-signal/40 bg-signal/10 text-signal',
  LLD: 'border-signal/40 bg-signal/10 text-signal',
  GFE: 'border-rule bg-panel-2/60 text-muted',
  Behavioral: 'border-rule bg-panel-2/60 text-muted',
  Mechanism: 'border-flag/40 bg-flag/10 text-flag',
}

type RevisionPanelProps = {
  day: number
  record: DayRecord
}

export function RevisionPanel({ day, record }: RevisionPanelProps) {
  const { state, update } = useTracker()
  const items = revisionQueue(state, day)
  const revised = items.filter((item) => record.done[revisionKey(item)] === true).length

  const byDay = new Map<number, typeof items>()
  for (const item of items) {
    const bucket = byDay.get(item.day) ?? []
    bucket.push(item)
    byDay.set(item.day, bucket)
  }

  return (
    <Card
      title="Revise · last 3 days"
      meta={items.length > 0 ? `${revised}/${items.length} revised` : undefined}
      actions={
        items.length > 0 && (
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-panel-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-signal to-accent transition-all duration-500"
              style={{ width: `${(revised / items.length) * 100}%` }}
            />
          </div>
        )
      }
      bodyClassName=""
    >
      {items.length === 0 ? (
        <div className="p-4 sm:p-5">
          <EmptyState
            title="Nothing to revise yet"
            body="Everything you log or pick on the three days before a mock day collects here, so the mock day starts with a single pass back over all of it."
          />
        </div>
      ) : (
        [...byDay.entries()].map(([sourceDay, bucket]) => (
          <section key={sourceDay}>
            <div className="flex items-baseline justify-between gap-3 border-b border-rule/50 bg-panel-2/40 px-4 py-2 sm:px-5">
              <h3 className="micro text-ink/80">Day {sourceDay}</h3>
              <span className="font-mono text-[10px] text-dim">{formatShortDate(state.start, sourceDay)}</span>
            </div>
            <ul>
              {bucket.map((item) => {
                const key = revisionKey(item)
                const done = record.done[key] === true
                return (
                  <li
                    key={item.key}
                    className={`flex items-center gap-3 border-b border-rule/40 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-panel-2/40 sm:px-5 ${
                      done ? 'bg-signal/[0.04]' : ''
                    }`}
                  >
                    <Checkbox
                      checked={done}
                      onChange={() => update(toggleTask(day, key, null))}
                      label={`Revised ${item.name}`}
                    />
                    <span
                      className={`w-20 shrink-0 rounded-full border px-2 py-0.5 text-center font-mono text-[9px] uppercase tracking-[0.1em] ${
                        KIND_TONE[item.kind] ?? 'border-rule bg-panel-2/60 text-muted'
                      }`}
                    >
                      {item.kind}
                    </span>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`min-w-0 flex-1 truncate text-[13px] underline decoration-rule underline-offset-4 transition-colors hover:text-signal hover:decoration-signal ${
                          done ? 'text-muted' : 'text-ink'
                        }`}
                      >
                        {item.name}
                      </a>
                    ) : (
                      <span className={`min-w-0 flex-1 truncate text-[13px] ${done ? 'text-muted' : 'text-ink'}`}>
                        {item.name}
                      </span>
                    )}
                    {item.difficulty && <DifficultyBadge difficulty={item.difficulty} />}
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </Card>
  )
}
