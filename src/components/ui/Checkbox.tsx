type CheckboxProps = {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  className?: string
}

export function Checkbox({ checked, onChange, label, className = '' }: CheckboxProps) {
  return (
    <span className={`relative inline-flex size-4 shrink-0 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
        className="peer absolute inset-0 size-full cursor-pointer appearance-none border border-rule bg-panel-2 checked:border-signal checked:bg-signal/20 hover:border-dim"
      />
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full text-signal opacity-0 peer-checked:opacity-100"
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 5" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  )
}
