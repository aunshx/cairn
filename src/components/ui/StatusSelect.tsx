import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, type ApplicationStatus } from '../../lib/types'
import { STATUS_TONE } from '../../lib/status'

type StatusSelectProps = {
  status: ApplicationStatus
  label: string
  onChange: (next: ApplicationStatus) => void
}

export function StatusSelect({ status, label, onChange }: StatusSelectProps) {
  return (
    <select
      value={status}
      aria-label={label}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className={`shrink-0 cursor-pointer rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] outline-none transition-colors ${STATUS_TONE[status]}`}
    >
      {APPLICATION_STATUSES.map((value) => (
        <option key={value} value={value} className="bg-panel text-ink normal-case tracking-normal">
          {APPLICATION_STATUS_LABEL[value]}
        </option>
      ))}
    </select>
  )
}
