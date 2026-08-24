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
    <li className={`group border-b border-rule/50 transition-colors last:border-b-0 hover:bg-panel-2/40 ${done ? 'bg-signal/[0.04]' : ''}`}>
      <div className="flex items-start gap-3.5 px-4 py-3 sm:px-5">
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
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2">
            {item.measure && <span className="text-[12px] leading-snug text-muted">{item.measure}</span>}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-[10px] uppercase tracking-[0.1em] text-dim underline-offset-4 transition-colors hover:text-signal hover:underline"
              >
                Open
              </a>
            )}
          </div>
        </div>

        {result && (
          <span
            className="hidden max-w-40 shrink-0 truncate rounded-md bg-signal/10 px-2 py-0.5 font-mono text-[11px] text-signal sm:block"
            title={result}
          >
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
          className={`flex size-7 shrink-0 items-center justify-center rounded-md border transition-all ${
            note
              ? 'border-flag/40 bg-flag/10 text-flag'
              : 'border-transparent text-dim opacity-60 hover:bg-panel-2 hover:text-ink group-hover:opacity-100'
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
        <div className="border-t border-rule/50 bg-ground/40 px-4 py-4 sm:px-5">
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
