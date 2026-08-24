import { ALL_DAYS, dayType, formatShortDate } from '../lib/schedule'
import { dayCompletion, dayRecord } from '../lib/metrics'
import type { TrackerState } from '../lib/types'

type DayStripProps = {
  state: TrackerState
  onJump: (day: number) => void
}

function fillClass(rate: number, finished: boolean): string {
  if (rate >= 1) return 'bg-gradient-to-t from-signal to-accent'
  if (finished) return rate >= 0.66 ? 'bg-flag/80' : 'bg-bad/70'
  if (rate >= 0.66) return 'bg-signal/80'
  if (rate > 0) return 'bg-signal/45'
  return ''
}

export function DayStrip({ state, onJump }: DayStripProps) {
  return (
    <div className="flex items-end gap-[3px] px-1 py-2" role="group" aria-label="Jump to day">
      {ALL_DAYS.map((day) => {
        const type = dayType(day)
        const record = dayRecord(state, day)
        const current = day === state.day
        const mock = type === 'M'
        const { done, total, rate } = dayCompletion(state, day)
        const pct = Math.round(rate * 100)

        return (
          <button
            key={day}
            type="button"
            onClick={() => onJump(day)}
            aria-label={`Day ${day}, ${formatShortDate(state.start, day)}, ${
              mock ? 'mock day' : `type ${type}`
            }, ${done} of ${total} checked${record.finished ? ', closed' : ''}`}
            aria-current={current ? 'true' : undefined}
            title={`Day ${day} · ${mock ? 'Mock' : type} · ${done}/${total} (${pct}%)${
              record.finished ? ' · closed' : ''
            } · ${formatShortDate(state.start, day)}`}
            className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5 pt-1"
          >
            <span
              className={`relative flex h-9 w-full min-w-[4px] items-end overflow-hidden rounded-[3px] transition-all duration-200 group-hover:brightness-150 ${
                mock ? 'border border-dashed border-dim/70 bg-transparent' : 'bg-rule/35'
              } ${current ? 'ring-2 ring-signal ring-offset-2 ring-offset-ground' : ''}`}
            >
              <span
                className={`w-full rounded-[2px] transition-all duration-300 ${fillClass(rate, record.finished)}`}
                style={{ height: `${Math.max(rate > 0 ? 8 : 0, pct)}%` }}
              />
            </span>
            <span
              className={`font-mono text-[8px] leading-none transition-opacity ${
                current ? 'text-signal opacity-100' : 'text-dim opacity-0 group-hover:opacity-100'
              }`}
            >
              {day}
            </span>
          </button>
        )
      })}
    </div>
  )
}
