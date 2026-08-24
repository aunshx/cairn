import { setGymMinutes, toggleGymActivity, useTracker } from '../../hooks/useTracker'
import { GYM_ACTIVITIES, GYM_DEFAULT_MINUTES, type DayRecord, type GymActivity } from '../../lib/types'

type GymSelectProps = {
  day: number
  taskId: string
  record: DayRecord
}

export function GymSelect({ day, taskId, record }: GymSelectProps) {
  const { update } = useTracker()
  const picked = record.gym[taskId] ?? []
  const minutes = record.gymMinutes[taskId] ?? GYM_DEFAULT_MINUTES

  return (
    <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={`Activities for ${taskId}`}>
      {GYM_ACTIVITIES.map((activity) => {
        const on = picked.includes(activity)
        return (
          <button
            key={activity}
            type="button"
            aria-pressed={on}
            onClick={() => update(toggleGymActivity(day, taskId, activity as GymActivity))}
            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-all active:scale-95 ${
              on
                ? 'border-signal/50 bg-signal/15 text-signal'
                : 'border-rule bg-panel-2/50 text-muted hover:border-dim hover:text-ink'
            }`}
          >
            {activity}
          </button>
        )
      })}

      <label className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-rule bg-panel-2/50 px-2.5 py-1">
        <span className="sr-only">Minutes for {taskId}</span>
        <input
          type="number"
          min={0}
          max={600}
          step={5}
          value={minutes}
          onChange={(e) => update(setGymMinutes(day, taskId, Number(e.target.value)))}
          className="w-9 border-0 bg-transparent p-0 text-right font-mono text-[10px] tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-dim">min</span>
      </label>
    </div>
  )
}
