import { dayType, dayTypeLabel, formatDayDate } from '../lib/schedule'
import { dayCompletion, finishedDays } from '../lib/metrics'
import { TOTAL_DAYS, type DayType, type SaveState, type TrackerState, type ViewKey } from '../lib/types'
import { DayStrip } from './DayStrip'
import { SaveStatus } from './SaveStatus'
import { ThemeToggle } from './ThemeToggle'
import { Tabs } from './ui/Tabs'

const VIEWS = [
  { key: 'today' as const, label: 'Today' },
  { key: 'metrics' as const, label: 'Metrics' },
  { key: 'catalog' as const, label: 'Catalog' },
]

const BADGE: Record<DayType, string> = {
  A: 'border-signal/40 bg-signal/10 text-signal',
  B: 'border-accent/40 bg-accent/10 text-accent',
  M: 'border-flag/40 bg-flag/10 text-flag',
}

type HeaderProps = {
  state: TrackerState
  saveState: SaveState
  view: ViewKey
  email: string
  onView: (view: ViewKey) => void
  onJump: (day: number) => void
  onOpenSettings: () => void
  onSignOut: () => void
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 18
  const c = 2 * Math.PI * r
  return (
    <div className="relative flex size-11 items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute size-full -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-rule)" strokeWidth="3" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-signal)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-mono text-[10px] tabular-nums text-ink">{label}</span>
    </div>
  )
}

export function Header({
  state,
  saveState,
  view,
  email,
  onView,
  onJump,
  onOpenSettings,
  onSignOut,
}: HeaderProps) {
  const type = dayType(state.day)
  const finished = finishedDays(state).length
  const today = dayCompletion(state, state.day)

  return (
    <header className="sticky top-0 z-20 border-b border-rule/60 bg-ground/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="flex items-center gap-4">
            <p className="accent-text font-mono text-[38px] leading-none font-semibold tracking-tight sm:text-[46px]">
              {String(state.day).padStart(2, '0')}
              <span className="text-dim opacity-60">/{TOTAL_DAYS}</span>
            </p>
            <div className="space-y-1.5">
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${BADGE[type]}`}
              >
                {dayTypeLabel(type)}
              </span>
              <p className="font-mono text-[11px] text-muted">{formatDayDate(state.start, state.day)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <ProgressRing value={today.total === 0 ? 0 : today.done / today.total} label={`${today.done}`} />
              <div className="leading-tight">
                <p className="micro">Today</p>
                <p className="font-mono text-[11px] text-muted">
                  {finished} of {TOTAL_DAYS} closed
                </p>
              </div>
            </div>

            <SaveStatus state={saveState} onOpenSettings={onOpenSettings} />

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={onOpenSettings}
                title={email}
                aria-label={`Signed in as ${email}. Open settings`}
                className="flex size-9 items-center justify-center rounded-full border border-rule bg-panel-2 font-mono text-[12px] uppercase text-muted transition-colors hover:border-signal/50 hover:text-signal"
              >
                {email.slice(0, 1) || '?'}
              </button>
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out"
                aria-label="Sign out"
                className="flex size-9 items-center justify-center rounded-full border border-transparent text-dim transition-colors hover:border-bad/40 hover:bg-bad/10 hover:text-bad"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
                  <path
                    d="M12 3H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 7l3 3-3 3M17 10H9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <DayStrip state={state} onJump={onJump} />
        </div>

        <Tabs
          items={VIEWS}
          active={view}
          onChange={onView}
          label="Views"
          className="mt-3 mb-3 w-full sm:w-auto sm:min-w-80"
        />
      </div>
    </header>
  )
}
