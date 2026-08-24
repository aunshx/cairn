import { useState } from 'react'
import { CATALOGS, decodePick, encodeFreePick, FREE_PREFIX } from '../../lib/catalogs'
import type { CatalogKey } from '../../lib/types'

const OTHER = '__other'

type CatalogPickerProps = {
  catalogs: CatalogKey[]
  value: string | undefined
  checked: Record<CatalogKey, Record<string, boolean>>
  label: string
  onChange: (next: string) => void
}

export function CatalogPicker({ catalogs, value, checked, label, onChange }: CatalogPickerProps) {
  const picked = decodePick(value)
  const isFree = value?.startsWith(FREE_PREFIX) ?? false
  const [freeMode, setFreeMode] = useState(isFree)

  const selectValue = freeMode || isFree ? OTHER : (value ?? '')

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2">
      <select
        value={selectValue}
        aria-label={label}
        onChange={(e) => {
          const next = e.target.value
          if (next === OTHER) {
            setFreeMode(true)
            onChange(encodeFreePick(picked?.kind === 'free' ? picked.name : ''))
            return
          }
          setFreeMode(false)
          onChange(next)
        }}
        className="field max-w-full min-w-0 py-1 font-mono text-[11px] sm:w-64"
      >
        <option value="">Choose what you did…</option>
        {catalogs.map((key) => (
          <optgroup key={key} label={CATALOGS[key].short}>
            {CATALOGS[key].items.map((item, index) => (
              <option key={`${key}-${index}`} value={`${key}:${index}`}>
                {String(index + 1).padStart(2, '0')} · {item.name}
                {checked[key][String(index)] ? ' ✓' : ''}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={OTHER}>Something else…</option>
      </select>

      {(freeMode || isFree) && (
        <input
          autoFocus
          value={picked?.kind === 'free' ? picked.name : ''}
          onChange={(e) => onChange(encodeFreePick(e.target.value))}
          placeholder="Problem name"
          aria-label={`${label}, custom problem`}
          className="field max-w-full min-w-0 py-1 text-[12px] sm:w-56"
        />
      )}

      {picked?.kind === 'catalog' && picked.item.tag && (
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-dim">{picked.item.tag}</span>
      )}
    </div>
  )
}
