import { STATUS_TONE } from '../../lib/status'
import { APPLICATION_STATUS_LABEL, type ApplicationStatus } from '../../lib/types'

type StatusBadgeProps = {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${STATUS_TONE[status]} ${className}`}
    >
      {APPLICATION_STATUS_LABEL[status]}
    </span>
  )
}
