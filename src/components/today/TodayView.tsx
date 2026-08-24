import { clearDay, setFinished, useTracker } from '../../hooks/useTracker'
import { dayCompletion, dayRecord } from '../../lib/metrics'
import { dayType, formatDayDate, sessionsFor } from '../../lib/schedule'
import { useState } from 'react'
import { Confetti } from '../Confetti'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DayNote } from './DayNote'
import { DeltaLog } from './DeltaLog'
import { DsaLog } from './DsaLog'
import { NeetcodeDatalist } from './NeetcodeDatalist'
import { RedoQueue } from './RedoQueue'
import { RevisionPanel } from './RevisionPanel'
import { TaskRow } from './TaskRow'

export function TodayView() {
  const { state, update } = useTracker()
  const day = state.day
  const record = dayRecord(state, day)
  const sessions = sessionsFor(day, state.cycle)
  const completion = dayCompletion(state, day)
  const isMockDay = dayType(day, state.cycle) === 'M'

  const [fire, setFire] = useState(0)
  const [confirmFor, setConfirmFor] = useState<number | null>(null)
  const confirmClear = confirmFor === day

  function toggleFinished() {
    const next = !record.finished
    update(setFinished(day, next))
    if (next) setFire((n) => n + 1)
  }

  return (
    <div className="space-y-6">
      <Confetti fire={fire} />
      <NeetcodeDatalist />
      <Card
        title="Schedule"
        meta={`${completion.done}/${completion.total} checked`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={confirmClear ? 'danger' : 'ghost'}
              onClick={() => {
                if (!confirmClear) {
                  setConfirmFor(day)
                  return
                }
                update(clearDay(day))
                setConfirmFor(null)
              }}
              onBlur={() => setConfirmFor(null)}
              title="Reset every tick, counter, pick and note on this day"
            >
              {confirmClear ? 'Clear day?' : 'Clear'}
            </Button>

            <Button
              variant={record.finished ? 'accent' : 'default'}
              aria-pressed={record.finished}
              onClick={toggleFinished}
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full border ${
                  record.finished ? 'border-ground bg-ground' : 'border-dim'
                }`}
              />
              Day finished
            </Button>
          </div>
        }
        bodyClassName=""
      >
        {sessions.map((session) => (
          <section key={session.title}>
            <div className="flex items-baseline justify-between gap-3 border-b border-rule bg-panel-2/50 px-3 py-2 sm:px-4">
              <h3 className="micro text-ink">{session.title}</h3>
              {session.range && <span className="font-mono text-[10px] text-dim">{session.range}</span>}
            </div>
            {session.tasks.map((task) => (
              <TaskRow key={task.id} task={task} day={day} record={record} />
            ))}
          </section>
        ))}

        <p className="border-t border-rule px-3 py-2.5 font-mono text-[10px] text-dim sm:px-4">
          {formatDayDate(state.start, day)}
          {record.finished && record.finishedAt
            ? ` · closed ${new Date(record.finishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : ''}
        </p>
      </Card>

      {isMockDay && <RevisionPanel day={day} record={record} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <DsaLog day={day} record={record} />
        <RedoQueue day={day} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DeltaLog day={day} />
        <DayNote day={day} record={record} />
      </div>
    </div>
  )
}
