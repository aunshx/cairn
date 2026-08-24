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
    <div role="tablist" aria-label={label} className={`flex flex-wrap gap-px border border-rule bg-rule ${className}`}>
      {items.map((item) => {
        const selected = item.key === active
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.key)}
            className={`flex-1 whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
              selected ? 'bg-panel-2 text-signal' : 'bg-panel text-muted hover:text-ink'
            }`}
          >
            {item.label}
            {item.meta && <span className="ml-2 text-dim normal-case tracking-normal">{item.meta}</span>}
          </button>
        )
      })}
    </div>
  )
}
