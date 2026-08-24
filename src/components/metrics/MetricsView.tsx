import { goToDay, useTracker } from '../../hooks/useTracker'
import {
  applicationStats,
  completionRate,
  currentStreak,
  flagRate,
  habitStreak,
  habitTotal,
  gymStats,
  missedTasks,
  mocksCompleted,
  percent,
  planTargets,
  worstProjection,
} from '../../lib/metrics'

import { ApplicationFunnel } from './ApplicationFunnel'
import { BurnUpChart } from './BurnUpChart'
import { GymBreakdown } from './GymBreakdown'
import { Heatmap } from './Heatmap'
import { RecentNotes } from './RecentNotes'
import { RevisionHealth } from './RevisionHealth'
import { SlipList } from './SlipList'
import { StatBlock } from './StatBlock'
import { TrackCoverage } from './TrackCoverage'

export function MetricsView() {
  const { state, update } = useTracker()
  const day = state.day

  const streak = currentStreak(state)
  const completion = completionRate(state)
  const flags = flagRate(state, day)
  const worst = worstProjection(state, day)
  const mocks = mocksCompleted(state)
  const missed = missedTasks(state)
  const apps = applicationStats(state)
  const gym = gymStats(state)
  const targets = planTargets(state)
  const habits = [
    { id: 'nodrink', label: 'Alcohol-free run' },
    { id: 'nosmoke', label: 'Smoke-free run' },
  ].map((h) => ({
    ...h,
    streak: habitStreak(state, h.id, day),
    total: habitTotal(state, h.id),
  }))

  const jump = (target: number) => update(goToDay(target))

  const projection =
    worst === null
      ? 'All tracks complete'
      : worst.projectedDay === null
        ? `${worst.label} stalled`
        : `${worst.label} d${worst.projectedDay}`

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatBlock
          label="Current streak"
          value={`${streak}`}
          detail={streak === 1 ? 'day' : 'days'}
          reading={
            streak === 0
              ? 'No finished days ending at the most recent one. Mark a day finished to start it.'
              : 'Consecutive finished days ending at the most recent one you closed.'
          }
        />

        <StatBlock
          label="Completion rate"
          value={percent(completion.rate)}
          detail={completion.total > 0 ? `${completion.done}/${completion.total} tasks` : 'no finished days'}
          tone={completion.rate === null ? 'neutral' : completion.rate >= 0.9 ? 'good' : completion.rate >= 0.7 ? 'warn' : 'bad'}
          reading={
            completion.rate === null
              ? 'Checked tasks over available tasks, counted only across days you marked finished.'
              : 'Of everything available on the days you closed, this much got checked.'
          }
        />

        <StatBlock
          label="Flag rate · 7d"
          value={percent(flags.rate)}
          detail={flags.logged > 0 ? `${flags.flagged}/${flags.logged} logged` : 'nothing logged'}
          direction={flags.delta === null || flags.delta === 0 ? null : flags.delta > 0 ? 'up' : 'down'}
          directionGood="down"
          reading={
            flags.rate === null
              ? 'Flagged DSA over total DSA logged in the last 7 days. Falling means retention is improving.'
              : flags.delta === null
                ? 'Flagged over logged, last 7 days. No prior week to compare against yet.'
                : `${flags.delta > 0 ? 'Up' : 'Down'} ${percent(Math.abs(flags.delta))} against the previous 7 days. Falling means retention is improving.`
          }
        />

        <StatBlock
          label="Projected finish"
          value={projection}
          detail={worst?.projectedDay ? `at ${worst.weeklyRate}/week` : 'furthest behind pace'}
          reading={
            worst === null
              ? 'Every track has reached its target.'
              : worst.projectedDay === null
                ? `Nothing logged for ${worst.label} in the last 7 days, so there is no rate to project from.`
                : worst.projectedDay > state.totalDays
                  ? `At the current 7-day rate ${worst.label} lands past day ${state.totalDays}. It is the track furthest behind.`
                  : `At the current 7-day rate ${worst.label} is the last track to land, and it lands in time.`
          }
        />

        <StatBlock
          label="Mocks completed"
          value={`${mocks}`}
          detail={`of ${targets.mock}`}
          tone={mocks >= targets.mock ? 'good' : 'neutral'}
          reading={`Two mocks on every mock day. ${Math.max(0, targets.mock - mocks)} left to record.`}
        />

        <StatBlock
          label="Tasks missed"
          value={`${missed.missed}`}
          detail={missed.total > 0 ? `${percent(missed.rate)} of ${missed.total}` : 'no closed days'}
          tone={missed.rate === null ? 'neutral' : missed.rate > 0.2 ? 'bad' : missed.rate > 0 ? 'warn' : 'good'}
          reading={
            missed.rate === null
              ? 'Tasks that were available on a day you closed and never got checked. Nothing to count until you close a day.'
              : missed.missed === 0
                ? `Nothing dropped across ${missed.days} closed ${missed.days === 1 ? 'day' : 'days'}.`
                : `Left unchecked on the ${missed.days} ${missed.days === 1 ? 'day' : 'days'} you closed. See what slips first below.`
          }
        />

        <StatBlock
          label="Applications out"
          value={`${apps.total}`}
          detail={apps.total > 0 ? `${apps.inFlight} in flight` : `of ${targets.apps}`}
          tone={apps.offers > 0 ? 'good' : 'neutral'}
          reading={
            apps.total === 0
              ? 'Company, position and job URL, logged on the applications row in Today.'
              : `${percent(apps.responseRate)} have answered. ${apps.offers} at offer, ${apps.byStatus.rejected} rejected, ${apps.byStatus.ghosted} silent.`
          }
        />

        <StatBlock
          label="Training sessions"
          value={`${gym.sessions}`}
          detail={gym.sessions > 0 ? `${Math.round(gym.totalMinutes / 60)}h logged` : 'strength and cardio'}
          tone={gym.sessions > 0 ? 'good' : 'neutral'}
          reading={
            gym.sessions === 0
              ? 'Pick what you did on the Gym 1 and Gym 2 rows and the split shows up below.'
              : `${Math.round(gym.totalMinutes)} min across ${gym.daysTrained} days, averaging ${Math.round(gym.averageMinutes ?? 0)} min a session.`
          }
        />

        {habits.map((habit) => (
          <StatBlock
            key={habit.id}
            label={habit.label}
            value={`${habit.streak}`}
            detail={habit.streak === 1 ? 'day' : 'days'}
            tone={habit.streak > 0 ? 'good' : 'neutral'}
            reading={
              habit.streak === 0
                ? `Consecutive clean days ending at day ${day}. Tick it on the day itself to keep the run alive.`
                : `Unbroken to day ${day}. ${habit.total} clean ${habit.total === 1 ? 'day' : 'days'} in total.`
            }
          />
        ))}
      </div>

      <BurnUpChart state={state} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationFunnel state={state} />
        <GymBreakdown state={state} />
      </div>

      <Heatmap state={state} onJump={jump} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TrackCoverage state={state} />
        <SlipList state={state} />
      </div>

      <RevisionHealth state={state} />

      <RecentNotes state={state} onJump={jump} />
    </div>
  )
}
