import { ALL_DAYS, dayType, formatShortDate } from '../lib/schedule'
import { dayCompletion, dayRecord } from '../lib/metrics'
import type { TrackerState } from '../lib/types'

type DayStripProps = {
  state: TrackerState
  onJump: (day: number) => void
}

export function DayStrip({ state, onJump }: DayStripProps) {
  return (
    <div className="flex items-end gap-px overflow-x-auto py-1" role="group" aria-label="Jump to day">
      {ALL_DAYS.map((day) => {
        const type = dayType(day)
        const record = dayRecord(state, day)
        const current = day === state.day
        const mock = type === 'M'
        const completion = dayCompletion(state, day)

        const solid = record.finished ? 'bg-signal' : completion.done > 0 ? 'bg-signal/30' : 'bg-rule/50'
        const outlined = record.finished
          ? 'border border-signal bg-signal/40'
          : completion.done > 0
            ? 'border border-signal/60 bg-signal/10'
            : 'border border-dim bg-transparent'
        const fill = mock ? outlined : solid

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
            className="group flex min-w-0 flex-1 shrink flex-col items-center justify-end gap-1 py-1"
          >
            <span
              className={`h-7 w-full min-w-[3px] transition-colors ${fill} ${
                current ? 'outline outline-1 outline-offset-1 outline-signal' : 'group-hover:bg-dim'
              }`}
            />
            <span
              className={`font-mono text-[8px] leading-none ${
                current ? 'text-signal' : 'text-dim opacity-0 group-hover:opacity-100'
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
