import { burnUp } from '../../lib/metrics'
import type { TrackerState } from '../../lib/types'

import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

const W = 680
const H = 260
const PAD = { top: 16, right: 16, bottom: 28, left: 44 }

const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

type BurnUpChartProps = {
  state: TrackerState
}

export function BurnUpChart({ state }: BurnUpChartProps) {
  const { points, target: dsaTarget } = burnUp(state, state.day)
  const totalDays = state.totalDays
  const solved = points.at(-1)?.actual ?? 0

  const x = (day: number) => PAD.left + (day / totalDays) * PLOT_W
  const y = (value: number) => PAD.top + PLOT_H - (value / dsaTarget) * PLOT_H

  const line = points.map((p) => `${x(p.day).toFixed(1)},${y(p.actual).toFixed(1)}`).join(' ')
  const area = `${PAD.left},${y(0)} ${line} ${x(points.at(-1)?.day ?? 0).toFixed(1)},${y(0)}`

  const onPace = points.at(-1)
  const gap = onPace ? onPace.actual - onPace.target : 0

  return (
    <Card
      title="DSA burn-up"
      meta={`${solved} of ${dsaTarget}`}
      actions={
        solved > 0 && (
          <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${gap >= 0 ? 'text-signal' : 'text-flag'}`}>
            {gap >= 0 ? '+' : ''}
            {Math.round(gap)} vs pace
          </span>
        )
      }
    >
      {solved === 0 ? (
        <EmptyState
          title="No problems logged yet"
          body={`Tick the DSA counters as you go and this shows whether your pace clears ${dsaTarget} by day ${totalDays}. The dashed rule is the straight line you have to stay above.`}
        />
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Cumulative DSA problems: ${solved} of ${dsaTarget} by day ${state.day}`}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(dsaTarget * t)}
                y2={y(dsaTarget * t)}
                stroke="var(--color-rule)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y(dsaTarget * t)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--color-dim)"
                className="font-mono text-[10px]"
              >
                {Math.round(dsaTarget * t)}
              </text>
            </g>
          ))}

          {[7, 14, 21, 28, 35, 42].map((d) => (
            <text
              key={d}
              x={x(d)}
              y={H - 8}
              textAnchor="middle"
              fill="var(--color-dim)"
              className="font-mono text-[10px]"
            >
              {d}
            </text>
          ))}

          <line
            x1={x(0)}
            y1={y(0)}
            x2={x(totalDays)}
            y2={y(dsaTarget)}
            stroke="var(--color-dim)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          <polygon points={area} fill="var(--color-signal)" opacity="0.12" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--color-signal)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
    </Card>
  )
}
