import { ALL_DAYS, dayForToday, dayType, formatShortDate } from '../lib/schedule'
import { dayCompletion, dayRecord } from '../lib/metrics'
import type { TrackerState } from '../lib/types'

type DayStripProps = {
  state: TrackerState
  onJump: (day: number) => void
}

type Tone = {
  track: string
  fill: string
  text: string
}

function toneFor(rate: number, isPast: boolean, isToday: boolean): Tone {
  if (rate >= 1) {
    return {
      track: 'bg-rule/30',
      fill: 'bg-gradient-to-t from-signal to-accent',
      text: 'text-signal',
    }
  }
  if (isPast && rate === 0) {
    return {
      track: 'border border-bad/50 bg-bad/15',
      fill: '',
      text: 'text-bad',
    }
  }
  if (isPast) {
    return { track: 'bg-rule/30', fill: 'bg-flag/80', text: 'text-flag' }
  }
  if (isToday || rate > 0) {
    return { track: 'bg-rule/30', fill: 'bg-signal/70', text: 'text-muted' }
  }
  return { track: 'bg-rule/20', fill: '', text: 'text-dim' }
}

export function DayStrip({ state, onJump }: DayStripProps) {
  const today = dayForToday(state.start) ?? state.day

  return (
    <div
      role="group"
      aria-label="Jump to day"
      className="grid grid-cols-7 gap-x-1 gap-y-2 sm:grid-cols-14 lg:grid-cols-[repeat(21,minmax(0,1fr))] 2xl:grid-cols-[repeat(42,minmax(0,1fr))]"
    >
      {ALL_DAYS.map((day) => {
        const type = dayType(day)
        const record = dayRecord(state, day)
        const current = day === state.day
        const mock = type === 'M'
        const { done, total, rate } = dayCompletion(state, day)
        const pct = Math.round(rate * 100)
        const isPast = day < today
        const isToday = day === today
        const tone = toneFor(rate, isPast, isToday)

        return (
          <button
            key={day}
            type="button"
            onClick={() => onJump(day)}
            aria-label={`Day ${day}, ${formatShortDate(state.start, day)}, ${
              mock ? 'mock day' : `type ${type}`
            }, ${pct}% complete${isPast && rate < 1 ? ', missed' : ''}`}
            aria-current={current ? 'true' : undefined}
            title={`Day ${day} · ${mock ? 'Mock' : type} · ${done}/${total} (${pct}%)${
              record.finished ? ' · closed' : ''
            } · ${formatShortDate(state.start, day)}`}
            className="group flex min-w-0 flex-col items-center gap-1"
          >
            <span
              className={`relative flex h-9 w-full min-w-[6px] items-end overflow-hidden rounded-[3px] transition-all duration-200 group-hover:brightness-150 ${
                tone.track
              } ${mock ? 'ring-1 ring-dim/50 ring-inset' : ''} ${
                current ? 'ring-2 ring-signal ring-offset-2 ring-offset-ground' : ''
              }`}
            >
              {tone.fill && (
                <span
                  className={`w-full rounded-[2px] transition-all duration-300 ${tone.fill}`}
                  style={{ height: `${Math.max(rate > 0 ? 6 : 0, pct)}%` }}
                />
              )}
              {isToday && !current && (
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-signal" />
              )}
            </span>

            <span
              className={`font-mono text-[9px] leading-none tabular-nums ${
                current ? 'text-signal' : 'text-dim'
              }`}
            >
              {day}
            </span>
            <span className={`font-mono text-[9px] leading-none tabular-nums ${tone.text}`}>{pct}%</span>
          </button>
        )
      })}
    </div>
  )
}
