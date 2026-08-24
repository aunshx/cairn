type CounterControlProps = {
  value: number
  cap: number
  label: string
  onChange: (next: number) => void
}

const STEP =
  'flex size-7 items-center justify-center rounded-md border border-rule bg-panel-2 font-mono text-[14px] leading-none text-muted transition-all hover:border-signal/50 hover:text-signal active:scale-90 disabled:cursor-not-allowed disabled:opacity-25 disabled:active:scale-100'

export function CounterControl({ value, cap, label, onChange }: CounterControlProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className={STEP}
        disabled={value <= 0}
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span
        className={`min-w-11 text-center font-mono text-[12px] tabular-nums ${
          value >= cap ? 'text-signal' : 'text-muted'
        }`}
      >
        {value}/{cap}
      </span>
      <button
        type="button"
        className={STEP}
        disabled={value >= cap}
        aria-label={`Increase ${label}`}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
