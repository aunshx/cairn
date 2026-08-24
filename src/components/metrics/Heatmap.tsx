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
      meta="6 weeks · 7 days"
      actions={
        <div className="flex items-center gap-3 font-mono text-[10px] text-dim">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 border border-dim" />M day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 bg-signal" />
            full
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Completion by day">
        {cells.map((cell) => {
          const mock = cell.type === 'M'
          const style = mock
            ? { borderColor: cell.rate > 0 ? 'var(--color-signal)' : 'var(--color-rule)', opacity: cell.rate > 0 ? 0.4 + cell.rate * 0.6 : 1 }
            : { backgroundColor: 'var(--color-signal)', opacity: cell.rate === 0 ? 0 : 0.15 + cell.rate * 0.85 }

          return (
            <button
              key={cell.day}
              type="button"
              onClick={() => onJump(cell.day)}
              title={`Day ${cell.day} · ${mock ? 'M' : cell.type} · ${cell.done}/${cell.total} · ${formatShortDate(state.start, cell.day)}`}
              aria-label={`Day ${cell.day}, ${mock ? 'mock day' : `type ${cell.type}`}, ${cell.done} of ${cell.total} checked`}
              aria-current={cell.day === state.day ? 'true' : undefined}
              className={`relative aspect-square border ${
                mock ? 'border-dim bg-transparent' : cell.rate === 0 ? 'border-rule/50' : 'border-transparent'
              } ${cell.day === state.day ? 'outline outline-1 outline-offset-1 outline-signal' : ''}`}
            >
              <span aria-hidden="true" className="absolute inset-0" style={style} />
              <span className="relative font-mono text-[9px] leading-none text-dim">{cell.day}</span>
            </button>
          )
        })}
      </div>

      {!anyStarted && (
        <p className="mt-4 max-w-prose text-[12px] leading-relaxed text-muted">
          Each cell fills in proportion to how much of that day you checked off. M days stay outlined so
          mock days read differently from ordinary ones. Nothing here until the first day is worked.
        </p>
      )}
    </Card>
  )
}
