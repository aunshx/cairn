import { useState } from 'react'
import { setCatalog, setCatalogNote, useTracker } from '../../hooks/useTracker'
import type { CatalogItem } from '../../lib/catalogs'
import { noteKey } from '../../lib/catalogs'
import type { CatalogKey } from '../../lib/types'
import { Checkbox } from '../ui/Checkbox'
import { NoteField } from '../today/NoteField'

type CatalogRowProps = {
  catalog: CatalogKey
  index: number
  item: CatalogItem
}

export function CatalogRow({ catalog, index, item }: CatalogRowProps) {
  const { state, update } = useTracker()
  const [open, setOpen] = useState(false)

  const done = state[catalog][String(index)] === true
  const note = state.notes[noteKey(catalog, index)] ?? ''
  const result = catalog === 'mech' ? (state.mechResults[index] ?? '').trim() : ''

  return (
    <li className={`border-b border-rule/60 last:border-b-0 ${done ? 'bg-signal/[0.03]' : ''}`}>
      <div className="flex items-start gap-3 px-3 py-2.5 sm:px-4">
        <span className="w-5 shrink-0 pt-0.5 font-mono text-[10px] tabular-nums text-dim">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="pt-0.5">
          <Checkbox
            checked={done}
            onChange={(next) => update(setCatalog(catalog, index, next))}
            label={item.name}
          />
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="block w-full text-left"
          >
            <span className={`text-[14px] leading-snug ${done ? 'text-muted' : 'text-ink'}`}>{item.name}</span>
          </button>
          {item.measure && <p className="mt-0.5 text-[12px] leading-snug text-muted">{item.measure}</p>}
        </div>

        {result && (
          <span className="hidden max-w-40 shrink-0 truncate pt-0.5 font-mono text-[11px] text-signal sm:block" title={result}>
            {result}
          </span>
        )}

        {item.tag && (
          <span className="hidden shrink-0 pt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-dim sm:block">
            {item.tag}
          </span>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Add'} note for ${item.name}`}
          className={`flex size-6 shrink-0 items-center justify-center border transition-colors ${
            note ? 'border-flag/50 text-flag' : 'border-transparent text-dim hover:border-rule hover:text-ink'
          }`}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
            <path
              d="M11.5 2.5 13.5 4.5 5.5 12.5 2.5 13.5 3.5 10.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-rule/60 bg-panel-2/40 px-3 py-3 sm:px-4">
          {result && (
            <p className="mb-3 font-mono text-[11px] text-signal sm:hidden">{result}</p>
          )}
          <NoteField
            label="Note · kept across all 42 days"
            value={note}
            onChange={(next) => update(setCatalogNote(catalog, index, next))}
            placeholder={item.tag ? `${item.tag}` : undefined}
          />
        </div>
      )}
    </li>
  )
}
