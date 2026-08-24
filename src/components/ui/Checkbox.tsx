type CheckboxProps = {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  className?: string
}

export function Checkbox({ checked, onChange, label, className = '' }: CheckboxProps) {
  return (
    <span className={`relative inline-flex size-[18px] shrink-0 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
        className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-md border border-rule bg-panel-2 transition-all duration-150 checked:border-transparent checked:bg-gradient-to-br checked:from-signal checked:to-accent hover:border-dim"
      />
      <svg
        viewBox="0 0 18 18"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full scale-75 text-ground opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100"
      >
        <path
          d="M4.5 9.5 7.5 12.5 13.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
