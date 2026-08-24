import { useState } from 'react'
import { setCatalog, setCount, setMechResult, setTaskNote, toggleTask, useTracker } from '../../hooks/useTracker'
import type { SlotResolution, Task } from '../../lib/schedule'
import type { DayRecord } from '../../lib/types'
import { Checkbox } from '../ui/Checkbox'
import { CounterControl } from './CounterControl'
import { NoteField } from './NoteField'

type TaskRowProps = {
  task: Task
  day: number
  record: DayRecord
  slot?: SlotResolution
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
      <path
        d="M11.5 2.5 13.5 4.5 5.5 12.5 2.5 13.5 3.5 10.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TaskRow({ task, day, record, slot }: TaskRowProps) {
  const { state, update } = useTracker()
  const [open, setOpen] = useState(false)

  const done = record.done[task.id] === true
  const count = record.n[task.id] ?? 0
  const note = record.notes[task.id] ?? ''
  const isMech = task.catalog === 'mech' && slot?.catalog === 'mech'
  const mechValue = slot ? (state.mechResults[slot.index] ?? '') : ''
  const label = slot?.relabel ?? task.label
  const subtitle = slot?.item.measure ?? task.sub

  function toggle(next: boolean) {
    update((s) => {
      const withTask = toggleTask(day, task.id, task.cap ?? null)(s)
      return slot ? setCatalog(slot.catalog, slot.index, next)(withTask) : withTask
    })
  }

  return (
    <div
      className={`group border-t border-rule/50 transition-colors first:border-t-0 hover:bg-panel-2/40 ${
        done ? 'bg-signal/[0.04]' : ''
      }`}
    >
      <div className="flex items-start gap-3.5 px-4 py-3 sm:px-5">
        <div className="pt-0.5">
          <Checkbox checked={done} onChange={toggle} label={label} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[14px] leading-snug transition-colors ${
              done ? 'text-muted line-through decoration-rule' : 'text-ink'
            }`}
          >
            {label}
          </p>

          {slot && (
            <p className="mt-1 inline-flex flex-wrap items-center gap-x-2 rounded-md bg-panel-2/70 px-2 py-0.5 font-mono text-[11px] text-signal">
              <span className="text-dim">{String(slot.index + 1).padStart(2, '0')}</span>
              {slot.item.name}
              {slot.item.tag && <span className="text-dim">· {slot.item.tag}</span>}
            </p>
          )}

          {subtitle && <p className="mt-0.5 text-[12px] leading-snug text-muted">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {task.cap !== undefined ? (
            <CounterControl
              value={count}
              cap={task.cap}
              label={task.label}
              onChange={(next) => update(setCount(day, task.id, next, task.cap ?? 0))}
            />
          ) : (
            task.time && <span className="font-mono text-[11px] tabular-nums text-dim">{task.time}</span>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? 'Hide' : 'Add'} note for ${label}`}
            className={`flex size-7 items-center justify-center rounded-md border transition-all ${
              note || (isMech && mechValue)
                ? 'border-flag/40 bg-flag/10 text-flag'
                : 'border-transparent text-dim opacity-60 hover:bg-panel-2 hover:text-ink group-hover:opacity-100'
            }`}
          >
            <PencilIcon />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-t border-rule/50 bg-ground/40 px-4 py-4 sm:px-5">
          {isMech && slot && (
            <label className="block">
              <span className="micro mb-1.5 block">The number</span>
              <input
                value={mechValue}
                onChange={(e) => update(setMechResult(slot.index, e.target.value))}
                placeholder={slot.item.measure ?? 'what you measured'}
                className="field font-mono text-[12px]"
              />
            </label>
          )}
          <NoteField
            value={note}
            onChange={(next) => update(setTaskNote(day, task.id, next))}
            label="Note"
            placeholder="Scoped to this day"
          />
        </div>
      )}
    </div>
  )
}
