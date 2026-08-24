import type { ReactNode } from 'react'

type Direction = 'up' | 'down' | null

type StatBlockProps = {
  label: string
  value: string
  reading: string
  detail?: ReactNode
  direction?: Direction
  directionGood?: 'up' | 'down'
}

function Arrow({ direction, good }: { direction: Direction; good: 'up' | 'down' }) {
  if (!direction) return null
  const positive = direction === good
  return (
    <span
      aria-hidden="true"
      className={`ml-2 font-mono text-[13px] leading-none ${positive ? 'text-signal' : 'text-flag'}`}
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
}: StatBlockProps) {
  return (
    <div className="flex flex-col border border-rule bg-panel p-4">
      <p className="micro">{label}</p>
      <p className="mt-2 flex items-baseline font-mono text-[28px] leading-none tabular-nums text-ink">
        {value}
        <Arrow direction={direction} good={directionGood} />
      </p>
      {detail && <p className="mt-1.5 font-mono text-[11px] text-muted">{detail}</p>}
      <p className="mt-auto pt-3 text-[12px] leading-snug text-muted">{reading}</p>
    </div>
  )
}
