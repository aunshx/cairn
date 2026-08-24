import { useState } from 'react'
import { useTracker } from '../../hooks/useTracker'
import { CATALOGS, CATALOG_ORDER, countDone } from '../../lib/catalogs'
import type { CatalogKey } from '../../lib/types'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { Tabs } from '../ui/Tabs'
import { CatalogRow } from './CatalogRow'
import { JobsCatalog } from './JobsCatalog'

export function CatalogView() {
  const { state } = useTracker()
  const [active, setActive] = useState<CatalogKey | 'jobs'>('dsa')
  const [query, setQuery] = useState('')

  const catalog = active === 'jobs' ? null : CATALOGS[active]
  const needle = query.trim().toLowerCase()
  const rows = (catalog?.items ?? [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      needle === ''
        ? true
        : `${item.name} ${item.tag} ${item.measure ?? ''}`.toLowerCase().includes(needle),
    )

  const tabs: { key: CatalogKey | 'jobs'; label: string; meta: string }[] = [
    ...CATALOG_ORDER.map((key) => ({
      key: key as CatalogKey | 'jobs',
      label: CATALOGS[key].short,
      meta: `${countDone(state[key], key)}/${CATALOGS[key].items.length}`,
    })),
    { key: 'jobs', label: 'Jobs', meta: `${state.applications.length}` },
  ]

  return (
    <div className="space-y-4">
      <Tabs items={tabs} active={active} onChange={setActive} label="Catalogs" />

      {active === 'jobs' || !catalog ? (
        <JobsCatalog />
      ) : (
      <Card
        title={catalog.label}
        meta={`${countDone(state[catalog.key], catalog.key)} of ${catalog.items.length} done`}
        actions={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter"
            aria-label={`Filter ${catalog.label}`}
            className="field w-32 font-mono text-[11px] sm:w-48"
          />
        }
        bodyClassName=""
      >
        {rows.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              title="Nothing matches"
              body={`No entry in ${catalog.short} matches "${query.trim()}". Clear the filter to see all ${catalog.items.length}.`}
            />
          </div>
        ) : (
          <ul>
            {rows.map(({ item, index }) => (
              <CatalogRow key={`${catalog.key}-${index}`} catalog={catalog.key} index={index} item={item} />
            ))}
          </ul>
        )}
      </Card>
      )}
    </div>
  )
}
