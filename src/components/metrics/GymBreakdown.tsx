import { gymStats } from '../../lib/metrics'
import { GYM_ACTIVITIES, TOTAL_DAYS, type TrackerState } from '../../lib/types'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

type GymBreakdownProps = {
  state: TrackerState
}

export function GymBreakdown({ state }: GymBreakdownProps) {
  const stats = gymStats(state)
  const max = Math.max(1, ...GYM_ACTIVITIES.map((a) => stats.byActivity[a]))

  return (
    <Card
      title="Training"
      meta={
        stats.sessions > 0
          ? `${stats.sessions} sessions · ${Math.round(stats.totalMinutes / 60)}h ${Math.round(stats.totalMinutes % 60)}m`
          : undefined
      }
      actions={
        stats.topActivity && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
            most: {stats.topActivity}
          </span>
        )
      }
    >
      {stats.sessions === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          body="Pick what you actually did on the Gym 1 and Gym 2 rows — CST, BB, LA, Cycling, Run or Inc Walk. Selecting one ticks the session off, and the split shows up here."
        />
      ) : (
        <>
          <ul className="space-y-3">
            {GYM_ACTIVITIES.map((activity) => {
              const count = stats.byActivity[activity]
              return (
                <li key={activity}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink">{activity}</span>
                    <span className="font-mono text-[11px] tabular-nums text-muted">
                      {count}
                      <span className="ml-2 text-dim">{Math.round(stats.minutesByActivity[activity])}m</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-signal to-accent transition-all duration-500"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <p className="mt-4 max-w-prose text-[12px] leading-relaxed text-muted">
            {stats.sessions} sessions across {stats.daysTrained} of {TOTAL_DAYS} days, averaging{' '}
            {Math.round(stats.averageMinutes ?? 0)} min. A session with two activities counts once for
            each, and its minutes are split between them.
          </p>
        </>
      )}
    </Card>
  )
}
