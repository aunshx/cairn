import { useState } from 'react'
import { removeApplication, updateApplication, useTracker } from '../../hooks/useTracker'
import { applicationStats } from '../../lib/metrics'
import { formatShortDate } from '../../lib/schedule'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, type ApplicationStatus } from '../../lib/types'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { StatusSelect } from '../ui/StatusSelect'

type Filter = ApplicationStatus | 'all'

export function JobsCatalog() {
  const { state, update } = useTracker()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const stats = applicationStats(state)
  const needle = query.trim().toLowerCase()

  const rows = state.applications
    .map((app, index) => ({ app, index }))
    .filter(({ app }) => (filter === 'all' ? true : app.status === filter))
    .filter(({ app }) =>
      needle === '' ? true : `${app.company} ${app.role}`.toLowerCase().includes(needle),
    )
    .sort((a, b) => b.app.day - a.app.day || a.app.company.localeCompare(b.app.company))

  return (
    <Card
      title="Companies and roles"
      meta={`${stats.total} applied · ${stats.inFlight} in flight · ${stats.offers} offers`}
      actions={
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          aria-label="Filter applications"
          className="field w-32 font-mono text-[11px] sm:w-48"
        />
      }
      bodyClassName=""
    >
      <div className="flex flex-wrap gap-1.5 border-b border-rule/70 px-4 py-3 sm:px-5">
        {(['all', ...APPLICATION_STATUSES] as Filter[]).map((value) => {
          const count = value === 'all' ? stats.total : stats.byStatus[value]
          const active = filter === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={active}
              className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
                active
                  ? 'border-signal/50 bg-signal/15 text-signal'
                  : 'border-rule bg-panel-2/50 text-muted hover:text-ink'
              }`}
            >
              {value === 'all' ? 'All' : APPLICATION_STATUS_LABEL[value]}
              <span className="ml-1.5 text-dim">{count}</span>
            </button>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <div className="p-4 sm:p-5">
          <EmptyState
            title={stats.total === 0 ? 'No applications yet' : 'Nothing matches'}
            body={
              stats.total === 0
                ? 'Add company, position and job URL on the applications row in Today. Everything you send lands here, and you move it along as you hear back.'
                : 'No application matches this filter. Clear it to see all of them.'
            }
          />
        </div>
      ) : (
        <ul>
          {rows.map(({ app, index }) => (
            <li
              key={`${app.company}-${index}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-rule/50 px-4 py-3 transition-colors last:border-b-0 hover:bg-panel-2/40 sm:px-5"
            >
              <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-dim">d{app.day}</span>

              <div className="flex min-w-0 flex-1 flex-col">
                {app.url ? (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="truncate text-[13px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-signal hover:decoration-signal"
                  >
                    {app.company}
                  </a>
                ) : (
                  <span className="truncate text-[13px] text-ink">{app.company}</span>
                )}
                <span className="truncate text-[11px] text-muted">
                  {app.role || 'No position recorded'}
                  <span className="ml-2 font-mono text-[10px] text-dim">
                    {formatShortDate(state.start, app.day)}
                  </span>
                </span>
              </div>

              <StatusSelect
                status={app.status}
                label={`Status for ${app.company}`}
                onChange={(status) => update(updateApplication(index, { status }))}
              />

              <button
                type="button"
                onClick={() => update(removeApplication(index))}
                aria-label={`Delete ${app.company}`}
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
