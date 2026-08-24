import { percent, revisionHealth } from '../../lib/metrics'
import type { TrackerState } from '../../lib/types'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

type RevisionHealthProps = {
  state: TrackerState
}

export function RevisionHealth({ state }: RevisionHealthProps) {
  const health = revisionHealth(state, state.day)
  const hasData = state.redos.length > 0

  return (
    <Card title="Revision health">
      {!hasData ? (
        <EmptyState
          title="No redos scheduled"
          body="Flag a DSA problem and it is scheduled at +3, +10 and +30 days. This panel then shows whether the flagged ones actually get cleared, and how long they sit."
        />
      ) : (
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="micro">Cleared on time</dt>
            <dd className="mt-1.5 font-mono text-[24px] leading-none tabular-nums text-ink">
              {percent(health.firstTryRate)}
            </dd>
            <p className="mt-1 font-mono text-[10px] text-dim">
              {health.firstTryCleared} of {health.firstTryEligible} due
            </p>
            <p className="mt-2 text-[12px] leading-snug text-muted">
              Share cleared on or before their first scheduled day.
            </p>
          </div>

          <div>
            <dt className="micro">Open redos</dt>
            <dd className="mt-1.5 font-mono text-[24px] leading-none tabular-nums text-ink">{health.open}</dd>
            <p className={`mt-1 font-mono text-[10px] ${health.overdue > 0 ? 'text-bad' : 'text-dim'}`}>
              {health.overdue} overdue
            </p>
            <p className="mt-2 text-[12px] leading-snug text-muted">
              Still carrying at least one uncleared interval.
            </p>
          </div>

          <div>
            <dt className="micro">Flag to first clear</dt>
            <dd className="mt-1.5 font-mono text-[24px] leading-none tabular-nums text-ink">
              {health.averageGap === null ? '--' : `${health.averageGap.toFixed(1)}d`}
            </dd>
            <p className="mt-1 font-mono text-[10px] text-dim">scheduled at +3d</p>
            <p className="mt-2 text-[12px] leading-snug text-muted">
              Average days from flagging a problem to clearing it once.
            </p>
          </div>
        </dl>
      )}
    </Card>
  )
}
