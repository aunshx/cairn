import { dayForToday, dayType, daysOf, formatShortDate } from '../lib/schedule'
import { dayCompletion, dayRecord } from '../lib/metrics'
import { planOf, type TrackerState } from '../lib/types'

type DayStripProps = {
  state: TrackerState
  onJump: (day: number) => void
}

type Tone = { shell: string; fill: string; text: string }

const NEUTRAL: Tone = { shell: 'bg-rule/45', fill: '', text: 'text-dim' }

const IN_PROGRESS: Tone = { shell: 'bg-rule/45', fill: 'bg-signal/85', text: 'text-signal' }

const COMPLETE: Tone = {
  shell: 'bg-rule/45',
  fill: 'bg-gradient-to-t from-signal to-accent',
  text: 'text-ground',
}

const SCALE: { upTo: number; tone: Tone }[] = [
  { upTo: 0, tone: { shell: 'bg-bad/25', fill: '', text: 'text-bad' } },
  { upTo: 24, tone: { shell: 'bg-rule/45', fill: 'bg-bad/85', text: 'text-bad' } },
  { upTo: 49, tone: { shell: 'bg-rule/45', fill: 'bg-bad/65', text: 'text-bad' } },
  { upTo: 69, tone: { shell: 'bg-rule/45', fill: 'bg-flag/85', text: 'text-flag' } },
  { upTo: 89, tone: { shell: 'bg-rule/45', fill: 'bg-flag/65', text: 'text-flag' } },
  { upTo: 99, tone: { shell: 'bg-rule/45', fill: 'bg-signal/80', text: 'text-signal' } },
]

function toneFor(pct: number, finished: boolean, isPast: boolean): Tone {
  if (finished || pct >= 100) return COMPLETE
  if (!isPast) return pct > 0 ? IN_PROGRESS : NEUTRAL
  return SCALE.find((step) => pct <= step.upTo)?.tone ?? NEUTRAL
}

export function DayStrip({ state, onJump }: DayStripProps) {
  const today = dayForToday(planOf(state)) ?? state.day

  return (
    <div role="group" aria-label="Jump to day" className="flex min-w-max items-end gap-[3px] sm:min-w-0">
      {daysOf(state.totalDays).map((day: number) => {
        const type = dayType(day, state.cycle)
        const record = dayRecord(state, day)
        const current = day === state.day
        const mock = type === 'M'
        const { done, total, rate } = dayCompletion(state, day)
        const pct = Math.round(rate * 100)
        const isPast = day < today
        const isToday = day === today
        const tone = toneFor(pct, record.finished, isPast)
        const showPct = isPast || rate > 0

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
            className={`group relative h-10 w-[26px] shrink-0 overflow-hidden rounded-[3px] transition-all duration-200 hover:brightness-150 sm:w-auto sm:min-w-[20px] sm:flex-1 ${
              tone.shell
            } ${mock ? 'outline-1 outline-dashed outline-dim/60 -outline-offset-1' : ''} ${
              current ? 'ring-1 ring-signal ring-offset-1 ring-offset-ground' : ''
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
                current ? 'text-signal' : 'text-muted'
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
