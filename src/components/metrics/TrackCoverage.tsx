import { allTrackProgress, percent } from '../../lib/metrics'
import type { TrackerState } from '../../lib/types'
import { Card } from '../ui/Card'

type TrackCoverageProps = {
  state: TrackerState
}

export function TrackCoverage({ state }: TrackCoverageProps) {
  const tracks = allTrackProgress(state, state.day)

  return (
    <Card title="Track coverage" meta={`by day ${state.day}`}>
      <ul className="space-y-4">
        {tracks.map((track) => {
          const ahead = track.ratio >= track.expectedRatio
          return (
            <li key={track.track}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink">{track.label}</span>
                <span className="font-mono text-[11px] tabular-nums text-muted">
                  {track.done}
                  <span className="text-dim">/{track.total}</span>
                </span>
              </div>

              <div className="relative mt-2 h-2.5 overflow-hidden rounded-full border border-rule/70 bg-panel-2">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    ahead ? 'bg-gradient-to-r from-signal to-accent' : 'bg-gradient-to-r from-flag to-flag/60'
                  }`}
                  style={{ width: `${Math.min(100, track.ratio * 100)}%` }}
                />
                <div
                  aria-hidden="true"
                  className="absolute -top-1 -bottom-1 z-10 w-0.5 rounded-full bg-ink/80"
                  style={{ left: `${Math.min(100, track.expectedRatio * 100)}%` }}
                />
              </div>

              <p className="mt-1 font-mono text-[10px] text-dim">
                {percent(track.ratio)} done · pace marker at {percent(track.expectedRatio)}
                {track.projectedDay !== null && track.done < track.total
                  ? ` · lands day ${
                      track.projectedDay > state.totalDays
                        ? `${track.projectedDay} (past ${state.totalDays})`
                        : track.projectedDay
                    }`
                  : track.done >= track.total
                    ? ' · complete'
                    : ' · no rate yet'}
              </p>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 max-w-prose text-[12px] leading-relaxed text-muted">
        The hairline on each bar is where you need to be today to finish by day {state.totalDays}. Amber
        means the bar
        has not reached it.
      </p>
    </Card>
  )
}
