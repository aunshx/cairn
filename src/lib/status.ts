import type { ApplicationStatus } from './types'

export const STATUS_TONE: Record<ApplicationStatus, string> = {
  applied: 'border-rule bg-panel-2/70 text-muted',
  screen: 'border-accent/40 bg-accent/10 text-accent',
  onsite: 'border-signal/40 bg-signal/10 text-signal',
  offer: 'border-signal/60 bg-signal/20 text-signal',
  rejected: 'border-bad/40 bg-bad/10 text-bad',
  ghosted: 'border-dim/40 bg-panel-2/40 text-dim',
}

export const STATUS_BAR: Record<ApplicationStatus, string> = {
  applied: 'bg-muted/50',
  screen: 'bg-accent',
  onsite: 'bg-signal',
  offer: 'bg-gradient-to-r from-signal to-accent',
  rejected: 'bg-bad/70',
  ghosted: 'bg-dim/50',
}
