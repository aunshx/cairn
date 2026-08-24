import { dayType, dayTypeLabel, formatDayDate } from '../lib/schedule'
import { finishedDays } from '../lib/metrics'
import { TOTAL_DAYS, type DayType, type SaveState, type TrackerState, type ViewKey } from '../lib/types'
import { DayStrip } from './DayStrip'
import { SaveStatus } from './SaveStatus'
import { Tabs } from './ui/Tabs'

const VIEWS = [
  { key: 'today' as const, label: 'Today' },
  { key: 'metrics' as const, label: 'Metrics' },
  { key: 'catalog' as const, label: 'Catalog' },
]

const BADGE: Record<DayType, string> = {
  A: 'border-signal/50 text-signal',
  B: 'border-signal/50 text-signal',
  M: 'border-flag/60 text-flag',
}

type HeaderProps = {
  state: TrackerState
  saveState: SaveState
  view: ViewKey
  onView: (view: ViewKey) => void
  onJump: (day: number) => void
  onOpenSettings: () => void
}

export function Header({ state, saveState, view, onView, onJump, onOpenSettings }: HeaderProps) {
  const type = dayType(state.day)
  const finished = finishedDays(state).length

  return (
    <header className="border-b border-rule bg-ground/90 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="flex items-baseline gap-4">
            <p className="font-mono text-[34px] leading-none tracking-tight text-ink sm:text-[42px]">
              {String(state.day).padStart(2, '0')}
              <span className="text-dim">/{TOTAL_DAYS}</span>
            </p>
            <div className="space-y-1.5">
              <span
                className={`inline-block border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${BADGE[type]}`}
              >
                {dayTypeLabel(type)}
              </span>
              <p className="font-mono text-[11px] text-muted">{formatDayDate(state.start, state.day)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="micro">
              <span className="text-ink">{finished}</span> finished
            </p>
            <SaveStatus state={saveState} onOpenSettings={onOpenSettings} />
          </div>
        </div>

        <div className="mt-3">
          <DayStrip state={state} onJump={onJump} />
        </div>

        <Tabs
          items={VIEWS}
          active={view}
          onChange={onView}
          label="Views"
          className="mt-3 -mb-px w-full border-b-0 sm:w-auto sm:min-w-72"
        />
      </div>
    </header>
  )
}
