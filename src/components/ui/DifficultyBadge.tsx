import type { Difficulty } from '../../lib/neetcode'

const TONE: Record<Difficulty, string> = {
  Easy: 'border-signal/40 bg-signal/10 text-signal',
  Medium: 'border-flag/40 bg-flag/10 text-flag',
  Hard: 'border-bad/40 bg-bad/10 text-bad',
}

type DifficultyBadgeProps = {
  difficulty: Difficulty
  className?: string
}

export function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${TONE[difficulty]} ${className}`}
    >
      {difficulty}
    </span>
  )
}
