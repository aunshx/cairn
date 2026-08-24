import { useState, type MouseEvent } from 'react'
import {
  setCatalog,
  setCount,
  setMechResult,
  setPick,
  setTaskNote,
  toggleTask,
  useTracker,
} from '../../hooks/useTracker'
import { decodePick } from '../../lib/catalogs'
import { CatalogPicker } from './CatalogPicker'
import { AppSlots } from './AppSlots'
import { DsaSlots } from './DsaSlots'
import { GymSelect } from './GymSelect'
import type { Task } from '../../lib/schedule'
import type { DayRecord } from '../../lib/types'
import { Checkbox } from '../ui/Checkbox'
import { CounterControl } from './CounterControl'
import { NoteField } from './NoteField'

type TaskRowProps = {
  task: Task
  day: number
  record: DayRecord
}

const INTERACTIVE = 'button, a, input, select, textarea, label, [data-row-interactive]'

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

export function TaskRow({ task, day, record }: TaskRowProps) {
  const { state, update } = useTracker()
  const [open, setOpen] = useState(false)

  const done = record.done[task.id] === true
  const count = record.n[task.id] ?? 0
  const note = record.notes[task.id] ?? ''
  const picked = decodePick(record.picks[task.id])
  const isMech = picked?.kind === 'catalog' && picked.catalog === 'mech'
  const mechIndex = isMech ? picked.index : null
  const mechValue = mechIndex === null ? '' : (state.mechResults[mechIndex] ?? '')
  const label = task.label
  const subtitle = (picked?.kind === 'catalog' ? picked.item.measure : undefined) ?? task.sub

  function toggle(next: boolean) {
    update((s) => {
      const withTask = toggleTask(day, task.id, task.cap ?? null)(s)
      if (picked?.kind === 'catalog') return setCatalog(picked.catalog, picked.index, next)(withTask)
      return withTask
    })
  }

  function onRowClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest(INTERACTIVE)) return
    toggle(!done)
  }

  return (
    <div
      className={`group border-t border-rule/50 transition-colors first:border-t-0 hover:bg-panel-2/40 ${
        done ? 'bg-signal/[0.04]' : ''
      }`}
    >
      <div
        onClick={onRowClick}
        className="flex cursor-pointer items-start gap-3.5 px-4 py-3 sm:px-5"
      >
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

          {task.pick && (
            <div data-row-interactive>
              <CatalogPicker
              catalogs={task.pick}
              value={record.picks[task.id]}
              checked={{
                hld: state.hld,
                lld: state.lld,
                gfe: state.gfe,
                mech: state.mech,
                beh: state.beh,
                dsa: state.dsa,
              }}
                label={`${task.label} for day ${day}`}
                onChange={(next) => update(setPick(day, task.id, next))}
              />
            </div>
          )}

          {subtitle && <p className="mt-1 text-[12px] leading-snug text-muted">{subtitle}</p>}

          {task.dsa && task.cap !== undefined && (
            <div data-row-interactive>
              <DsaSlots day={day} slot={task.id} cap={task.cap} record={record} />
            </div>
          )}

          {task.apps && task.cap !== undefined && (
            <div data-row-interactive>
              <AppSlots day={day} cap={task.cap} />
            </div>
          )}

          {task.gym && (
            <div data-row-interactive>
              <GymSelect day={day} taskId={task.id} record={record} />
            </div>
          )}
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
          {isMech && mechIndex !== null && (
            <label className="block">
              <span className="micro mb-1.5 block">The number</span>
              <input
                value={mechValue}
                onChange={(e) => update(setMechResult(mechIndex, e.target.value))}
                placeholder={picked.item.measure ?? 'what you measured'}
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
