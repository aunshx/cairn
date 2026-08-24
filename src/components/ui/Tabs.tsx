export type TabItem<T extends string> = {
  key: T
  label: string
  meta?: string
}

type TabsProps<T extends string> = {
  items: TabItem<T>[]
  active: T
  onChange: (key: T) => void
  label: string
  className?: string
}

export function Tabs<T extends string>({ items, active, onChange, label, className = '' }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`flex gap-1 overflow-x-auto rounded-xl border border-rule/70 bg-panel/60 p-1 backdrop-blur ${className}`}
    >
      {items.map((item) => {
        const selected = item.key === active
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-150 ${
              selected
                ? 'bg-gradient-to-r from-signal/20 to-accent/20 text-ink shadow-[0_0_0_1px_var(--color-rule)]'
                : 'text-muted hover:bg-panel-2/70 hover:text-ink'
            }`}
          >
            {item.label}
            {item.meta && (
              <span className={`ml-2 tracking-normal ${selected ? 'text-signal' : 'text-dim'}`}>{item.meta}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
