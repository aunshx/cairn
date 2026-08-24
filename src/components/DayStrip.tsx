import { ALL_DAYS, dayForToday, dayType, formatShortDate } from '../lib/schedule'
import { dayCompletion, dayRecord } from '../lib/metrics'
import type { TrackerState } from '../lib/types'

type DayStripProps = {
  state: TrackerState
  onJump: (day: number) => void
}

type Tone = { shell: string; fill: string; text: string }

const NEUTRAL: Tone = { shell: 'border-rule/50', fill: '', text: 'text-dim' }

const COMPLETE: Tone = {
  shell: 'border-signal/50',
  fill: 'bg-gradient-to-t from-signal to-accent',
  text: 'text-ground',
}

const SCALE: { upTo: number; tone: Tone }[] = [
  { upTo: 0, tone: { shell: 'border-bad/55 bg-bad/12', fill: '', text: 'text-bad' } },
  { upTo: 24, tone: { shell: 'border-bad/50', fill: 'bg-bad/75', text: 'text-bad' } },
  { upTo: 49, tone: { shell: 'border-bad/40', fill: 'bg-bad/55', text: 'text-bad' } },
  { upTo: 69, tone: { shell: 'border-flag/45', fill: 'bg-flag/70', text: 'text-flag' } },
  { upTo: 89, tone: { shell: 'border-flag/35', fill: 'bg-flag/50', text: 'text-flag' } },
  { upTo: 99, tone: { shell: 'border-signal/40', fill: 'bg-signal/65', text: 'text-signal' } },
]

function toneFor(pct: number, finished: boolean, isActive: boolean): Tone {
  if (finished || pct >= 100) return COMPLETE
  if (!isActive && pct === 0) return NEUTRAL
  return SCALE.find((step) => pct <= step.upTo)?.tone ?? NEUTRAL
}

export function DayStrip({ state, onJump }: DayStripProps) {
  const today = dayForToday(state.start) ?? state.day

  return (
    <div role="group" aria-label="Jump to day" className="flex min-w-max items-end gap-[3px] sm:min-w-0">
      {ALL_DAYS.map((day) => {
        const type = dayType(day)
        const record = dayRecord(state, day)
        const current = day === state.day
        const mock = type === 'M'
        const { done, total, rate } = dayCompletion(state, day)
        const pct = Math.round(rate * 100)
        const isPast = day < today
        const isToday = day === today
        const tone = toneFor(pct, record.finished, isPast || isToday)
        const showPct = rate > 0 || isPast

        return (
          <button
            key={day}
            type="button"
            onClick={() => onJump(day)}
            aria-label={`Day ${day}, ${formatShortDate(state.start, day)}, ${
              mock ? 'mock day' : `type ${type}`
            }, ${done} of ${total} done, ${pct}%${record.finished ? ', closed' : ''}${
              isPast && rate < 1 ? ', missed' : ''
            }`}
            aria-current={current ? 'true' : undefined}
            title={`Day ${day} · ${mock ? 'Mock' : type} · ${done}/${total} (${pct}%)${
              record.finished ? ' · closed' : ''
            } · ${formatShortDate(state.start, day)}`}
            className={`group relative h-10 w-[26px] shrink-0 overflow-hidden rounded-[3px] border transition-all duration-200 hover:brightness-125 sm:w-auto sm:min-w-[20px] sm:flex-1 ${
              tone.shell
            } ${mock ? 'border-dashed' : ''} ${
              current ? 'ring-2 ring-signal/80 ring-offset-1 ring-offset-ground' : ''
            }`}
          >
            {tone.fill && (
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-0 transition-all duration-500 ${tone.fill}`}
                style={{ height: `${Math.max(rate > 0 ? 10 : 0, pct)}%` }}
              />
            )}

            {isToday && !record.finished && (
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-signal" />
            )}

            <span
              className={`absolute inset-x-0 top-1 text-center font-mono text-[7px] leading-none tabular-nums ${
                current ? 'text-signal' : 'text-dim/80'
              }`}
            >
              {day}
            </span>

            <span
              className={`absolute inset-x-0 bottom-1 text-center font-mono text-[8px] leading-none font-medium tabular-nums ${tone.text}`}
            >
              {record.finished ? '✓' : showPct ? `${pct}%` : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}
