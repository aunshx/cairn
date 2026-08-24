import type { ReactNode } from 'react'

type Direction = 'up' | 'down' | null
type Tone = 'neutral' | 'good' | 'warn' | 'bad'

type StatBlockProps = {
  label: string
  value: string
  reading: string
  detail?: ReactNode
  direction?: Direction
  directionGood?: 'up' | 'down'
  tone?: Tone
}

const TONE: Record<Tone, string> = {
  neutral: 'from-signal/60 to-accent/60',
  good: 'from-signal to-signal/40',
  warn: 'from-flag to-flag/40',
  bad: 'from-bad to-bad/40',
}

const VALUE_TONE: Record<Tone, string> = {
  neutral: 'text-ink',
  good: 'text-signal',
  warn: 'text-flag',
  bad: 'text-bad',
}

function Arrow({ direction, good }: { direction: Direction; good: 'up' | 'down' }) {
  if (!direction) return null
  const positive = direction === good
  return (
    <span
      aria-hidden="true"
      className={`ml-2 font-mono text-[15px] leading-none ${positive ? 'text-signal' : 'text-flag'}`}
    >
      {direction === 'up' ? '↑' : '↓'}
    </span>
  )
}

export function StatBlock({
  label,
  value,
  reading,
  detail,
  direction = null,
  directionGood = 'up',
  tone = 'neutral',
}: StatBlockProps) {
  return (
    <div className="surface relative flex flex-col overflow-hidden p-4 sm:p-5">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${TONE[tone]}`} />
      <p className="micro">{label}</p>
      <p
        className={`mt-2.5 flex items-baseline font-mono text-[26px] leading-none font-semibold tabular-nums ${VALUE_TONE[tone]}`}
      >
        {value}
        <Arrow direction={direction} good={directionGood} />
      </p>
      {detail && <p className="mt-1.5 font-mono text-[11px] text-dim">{detail}</p>}
      <p className="mt-auto pt-3.5 text-[12px] leading-snug text-muted">{reading}</p>
    </div>
  )
}
