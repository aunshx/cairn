import { heatmap } from '../../lib/metrics'
import { formatShortDate } from '../../lib/schedule'
import type { TrackerState } from '../../lib/types'
import { Card } from '../ui/Card'

type HeatmapProps = {
  state: TrackerState
  onJump: (day: number) => void
}

export function Heatmap({ state, onJump }: HeatmapProps) {
  const cells = heatmap(state)
  const anyStarted = cells.some((c) => c.started)

  return (
    <Card
      title="Completion heatmap"
      meta="6 weeks"
      actions={
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-dim">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] border border-dashed border-dim" />M
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-signal/30" />
            part
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-gradient-to-br from-signal to-accent" />
            full
          </span>
        </div>
      }
    >
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        <div
          className="grid w-max shrink-0 grid-cols-7 gap-1"
          role="group"
          aria-label="Completion by day"
        >
          {cells.map((cell) => {
            const mock = cell.type === 'M'
            const full = cell.rate >= 1
            return (
              <button
                key={cell.day}
                type="button"
                onClick={() => onJump(cell.day)}
                title={`Day ${cell.day} · ${mock ? 'M' : cell.type} · ${cell.done}/${cell.total} · ${formatShortDate(state.start, cell.day)}`}
                aria-label={`Day ${cell.day}, ${mock ? 'mock day' : `type ${cell.type}`}, ${cell.done} of ${cell.total} checked`}
                aria-current={cell.day === state.day ? 'true' : undefined}
                className={`relative size-6 rounded-[3px] transition-all duration-150 hover:scale-110 ${
                  mock ? 'border border-dashed border-dim/70' : cell.rate === 0 ? 'border border-rule/50' : ''
                } ${cell.day === state.day ? 'ring-1 ring-signal ring-offset-1 ring-offset-panel' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-[2px] ${
                    full ? 'bg-gradient-to-br from-signal to-accent' : 'bg-signal'
                  }`}
                  style={full ? undefined : { opacity: cell.rate === 0 ? 0 : 0.12 + cell.rate * 0.7 }}
                />
                <span className="relative font-mono text-[8px] leading-none text-ink/50">{cell.day}</span>
              </button>
            )
          })}
        </div>

        <p className="max-w-xs text-[12px] leading-relaxed text-muted">
          {anyStarted
            ? 'Each cell darkens with the share of that day you checked off. M days stay outlined so mock days read differently. Click any cell to jump to it.'
            : 'Each cell will fill in proportion to how much of that day you check off. M days stay outlined so mock days read differently from ordinary ones. Nothing here until the first day is worked.'}
        </p>
      </div>
    </Card>
  )
}
