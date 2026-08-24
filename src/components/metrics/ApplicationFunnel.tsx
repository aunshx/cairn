import { applicationStats, percent, planTargets } from '../../lib/metrics'
import { STATUS_BAR } from '../../lib/status'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, type TrackerState } from '../../lib/types'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

type ApplicationFunnelProps = {
  state: TrackerState
}

export function ApplicationFunnel({ state }: ApplicationFunnelProps) {
  const stats = applicationStats(state)
  const appsTarget = planTargets(state).apps

  return (
    <Card
      title="Applications"
      meta={stats.total > 0 ? `${stats.total} of ${appsTarget} sent` : undefined}
      actions={
        stats.total > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
            {percent(stats.responseRate)} answered
          </span>
        )
      }
    >
      {stats.total === 0 ? (
        <EmptyState
          title="Nothing sent yet"
          body="Log company, position and job URL on the applications row in Today. This panel then shows where each one stands and what share of them ever answer."
        />
      ) : (
        <>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-panel-2">
            {APPLICATION_STATUSES.map((status) => {
              const count = stats.byStatus[status]
              if (count === 0) return null
              return (
                <div
                  key={status}
                  className={STATUS_BAR[status]}
                  style={{ width: `${(count / stats.total) * 100}%` }}
                  title={`${APPLICATION_STATUS_LABEL[status]}: ${count}`}
                />
              )
            })}
          </div>

          <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {APPLICATION_STATUSES.map((status) => (
              <li key={status} className="flex items-center gap-2">
                <span aria-hidden="true" className={`size-2 rounded-full ${STATUS_BAR[status]}`} />
                <span className="flex-1 text-[12px] text-muted">{APPLICATION_STATUS_LABEL[status]}</span>
                <span className="font-mono text-[12px] tabular-nums text-ink">{stats.byStatus[status]}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 max-w-prose text-[12px] leading-relaxed text-muted">
            {stats.inFlight} still open, {stats.offers} at offer. Answered counts anything that came
            back: screen, onsite, offer or rejection. Ghosted is the pile that never replied.
          </p>
        </>
      )}
    </Card>
  )
}
