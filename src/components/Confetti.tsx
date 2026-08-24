import { useEffect, useMemo, useState } from 'react'

const COLORS = ['var(--color-signal)', 'var(--color-accent)', 'var(--color-flag)', 'var(--color-ink)']

const COUNT = 90

type Piece = {
  left: number
  delay: number
  duration: number
  drift: number
  color: string
  size: number
  rotate: number
}

function build(): Piece[] {
  return Array.from({ length: COUNT }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    duration: 1.6 + Math.random() * 1.1,
    drift: (Math.random() - 0.5) * 220,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0]!,
    size: 5 + Math.random() * 6,
    rotate: Math.random() * 720 - 360,
  }))
}

type ConfettiProps = {
  fire: number
}

export function Confetti({ fire }: ConfettiProps) {
  const [finished, setFinished] = useState(0)

  useEffect(() => {
    if (fire === 0) return
    const timer = window.setTimeout(() => setFinished(fire), 3000)
    return () => window.clearTimeout(timer)
  }, [fire])

  const pieces = useMemo(() => (fire === 0 ? [] : build()), [fire])

  if (fire === 0 || finished === fire || pieces.length === 0) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 1.6}px`,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ['--drift' as string]: `${piece.drift}px`,
            ['--spin' as string]: `${piece.rotate}deg`,
          }}
        />
      ))}
    </div>
  )
}
