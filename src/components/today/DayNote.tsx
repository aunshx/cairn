import { setDayNote, useTracker } from '../../hooks/useTracker'
import type { DayRecord } from '../../lib/types'
import { Card } from '../ui/Card'
import { NoteField } from './NoteField'

type DayNoteProps = {
  day: number
  record: DayRecord
}

export function DayNote({ day, record }: DayNoteProps) {
  const { update } = useTracker()
  return (
    <Card title="Day note">
      <NoteField
        label="How it went"
        rows={4}
        placeholder="How it went. What broke. What to change tomorrow."
        value={record.note}
        onChange={(next) => update(setDayNote(day, next))}
      />
    </Card>
  )
}
