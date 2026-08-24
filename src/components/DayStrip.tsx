import { ALL_DAYS, dayType, formatShortDate } from '../lib/schedule'
import { dayCompletion, dayRecord } from '../lib/metrics'
import type { TrackerState } from '../lib/types'

type DayStripProps = {
  state: TrackerState
  onJump: (day: number) => void
}

export function DayStrip({ state, onJump }: DayStripProps) {
  return (
    <div className="flex items-end gap-[3px] py-1" role="group" aria-label="Jump to day">
      {ALL_DAYS.map((day) => {
        const type = dayType(day)
        const record = dayRecord(state, day)
        const current = day === state.day
        const mock = type === 'M'
        const completion = dayCompletion(state, day)

        const fill = record.finished
          ? 'bg-gradient-to-t from-signal to-accent'
          : completion.done > 0
            ? 'bg-signal/40'
            : 'bg-rule/60'

        const mockFill = record.finished
          ? 'border-signal bg-signal/30'
          : completion.done > 0
            ? 'border-signal/50 bg-signal/10'
            : 'border-dim/70 bg-transparent'

        return (
          <button
            key={day}
            type="button"
            onClick={() => onJump(day)}
            aria-label={`Day ${day}, ${formatShortDate(state.start, day)}, ${
              mock ? 'mock day' : `type ${type}`
            }${record.finished ? ', finished' : ''}`}
            aria-current={current ? 'true' : undefined}
            title={`Day ${day} · ${mock ? 'Mock' : type} · ${formatShortDate(state.start, day)}`}
            className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5 pt-1"
          >
            <span
              className={`h-8 w-full min-w-[4px] rounded-[3px] transition-all duration-200 group-hover:brightness-150 ${
                mock ? `border ${mockFill}` : fill
              } ${current ? 'ring-2 ring-signal ring-offset-2 ring-offset-ground' : ''}`}
            />
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
