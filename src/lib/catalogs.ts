import type { CatalogKey } from './types'

export type CatalogItem = {
  name: string
  tag: string
  measure?: string
}

export type Catalog = {
  key: CatalogKey
  label: string
  short: string
  tagLabel: string
  items: CatalogItem[]
}

const HLD: CatalogItem[] = [
  { name: 'Bitly', tag: '' },
  { name: 'Rate Limiter', tag: 'Redis' },
  { name: 'Distributed Cache', tag: 'Consistent Hashing' },
  { name: 'LeetCode', tag: 'PostgreSQL' },
  { name: 'WhatsApp', tag: 'Real-time Updates' },
  { name: 'Tinder', tag: 'Proximity Search' },
  { name: 'Yelp', tag: 'Elasticsearch' },
  { name: 'Instagram', tag: 'Scaling Reads' },
  { name: 'FB News Feed', tag: 'Large Blobs' },
  { name: 'Ticketmaster', tag: 'Contention' },
  { name: 'Online Auction', tag: 'DynamoDB' },
  { name: 'Job Scheduler', tag: 'Long Running Tasks' },
  { name: 'Notification System', tag: 'Kafka' },
  { name: 'YouTube', tag: 'Large Blobs' },
  { name: 'Dropbox', tag: '' },
  { name: 'Web Crawler', tag: 'Scaling Writes' },
  { name: 'FB Post Search', tag: 'Elasticsearch' },
  { name: 'Payment System', tag: 'Multi-step' },
  { name: 'YouTube Top K', tag: 'Big Data DS' },
  { name: 'Metrics Monitoring', tag: 'Time Series DB' },
  { name: 'Price Tracking', tag: 'Change Data Capture' },
  { name: 'Local Delivery', tag: 'Cassandra' },
  { name: 'Strava', tag: '' },
  { name: 'Uber', tag: 'Proximity Search' },
  { name: 'Ad Click Aggregator', tag: 'Flink' },
  { name: 'Robinhood', tag: 'ZooKeeper' },
  { name: 'Google Docs', tag: 'Real-time Updates' },
  { name: 'Online Chess', tag: '' },
  { name: 'ChatGPT', tag: 'Vector DBs' },
  { name: 'News Aggregator', tag: '' },
  { name: 'FB Live Comments', tag: 'Real-time' },
]

const LLD: CatalogItem[] = [
  { name: 'Parking Lot', tag: 'HI' },
  { name: 'Connect Four', tag: 'HI' },
  { name: 'Amazon Locker', tag: 'HI' },
  { name: 'Elevator', tag: 'HI' },
  { name: 'Movie Ticket Booking', tag: 'HI' },
  { name: 'Inventory Management', tag: 'HI concurrency first' },
  { name: 'File System', tag: 'HI' },
  { name: 'Logging Service', tag: 'HI' },
  { name: 'Rate Limiter', tag: 'HI' },
  { name: 'LRU Cache', tag: 'LC' },
  { name: 'Underground System', tag: 'LC' },
  { name: 'Hit Counter', tag: 'LC' },
  { name: 'Browser History', tag: 'LC' },
  { name: 'Twitter', tag: 'LC' },
  { name: 'Search Autocomplete', tag: 'LC' },
  { name: 'In-Memory File System', tag: 'LC' },
  { name: 'Snake Game', tag: 'LC' },
  { name: 'Text Editor', tag: 'LC' },
  { name: 'Tic Tac Toe', tag: 'LC' },
]

const GFE: CatalogItem[] = [
  { name: 'Accordion', tag: 'state' },
  { name: 'Tabs', tag: 'state' },
  { name: 'Modal / Dialog', tag: 'focus trap' },
  { name: 'Tooltip', tag: 'positioning' },
  { name: 'Star Rating', tag: 'state' },
  { name: 'Progress Bar', tag: 'animation' },
  { name: 'Todo List', tag: 'CRUD' },
  { name: 'Digital Clock', tag: 'timers' },
  { name: 'Autocomplete', tag: 'debounce + async' },
  { name: 'Data Table sort/filter', tag: 'derived state' },
  { name: 'Pagination', tag: 'async' },
  { name: 'Infinite Scroll', tag: 'IntersectionObserver' },
  { name: 'File Upload with progress', tag: 'async' },
  { name: 'Image Carousel', tag: 'preload' },
  { name: 'Virtualized List', tag: 'windowing' },
  { name: 'Drag and Drop List', tag: 'pointer events' },
  { name: 'Nested Comments', tag: 'recursion' },
  { name: 'Poll Widget', tag: 'optimistic update' },
]

const MECH: CatalogItem[] = [
  { name: 'Token bucket in Redis', tag: 'Rate Limiter', measure: 'allowed under burst vs sustained' },
  {
    name: 'Consistent hashing ring',
    tag: 'Distributed Cache',
    measure: '% keys remapped at 1 vs 150 vnodes',
  },
  {
    name: 'Optimistic lock vs SELECT FOR UPDATE',
    tag: 'Ticketmaster',
    measure: 'double-bookings per 1000 attempts',
  },
  {
    name: 'Append-only log with offsets',
    tag: 'Notification System',
    measure: 'throughput and restart behaviour',
  },
  { name: 'Bloom filter', tag: 'Web Crawler', measure: 'false positive rate vs bits per element' },
  {
    name: 'Count-min sketch + min-heap',
    tag: 'YouTube Top K',
    measure: 'memory vs exact, error at p99',
  },
  { name: 'Geohash vs quadtree', tag: 'Tinder / Uber', measure: 'query latency at 1M points' },
  {
    name: 'Idempotency keys + outbox',
    tag: 'Payment System',
    measure: 'duplicate charges under retry storm',
  },
  { name: 'Presigned multipart upload', tag: 'Dropbox', measure: 'time to first byte, server memory' },
  {
    name: 'WebSocket fan-out with rooms',
    tag: 'FB Live Comments',
    measure: 'connections before degradation',
  },
  {
    name: 'LWW register then a small CRDT',
    tag: 'Google Docs',
    measure: 'convergence after concurrent edits',
  },
  { name: 'Cosine brute force vs HNSW', tag: 'ChatGPT', measure: 'recall vs latency at 100k vectors' },
]

const BEH: CatalogItem[] = [
  { name: 'Why the Behavioral Matters', tag: 'course' },
  { name: 'Decode: How Interviews Work', tag: 'course' },
  { name: 'Select: Choosing Responses', tag: 'course' },
  { name: 'Deliver: Telling a Good Story', tag: 'course' },
  { name: 'The Big Three Questions', tag: 'course' },
  { name: 'Adapting to Big Tech', tag: 'course' },
  { name: 'Practicing', tag: 'course' },
  { name: 'Common Pitfalls', tag: 'course' },
  { name: 'Special Interview Types', tag: 'course' },
  { name: 'Answering AI Questions', tag: 'course' },
  { name: 'Resume story · 90 seconds', tag: 'story' },
  { name: 'Hardest technical problem', tag: 'story' },
  { name: 'Disagreement', tag: 'story' },
  { name: 'Failure', tag: 'story' },
  { name: 'Ambiguity', tag: 'story' },
  { name: 'Leading without authority', tag: 'story' },
  { name: 'Impact on people', tag: 'story' },
  { name: 'Shipping under constraint', tag: 'story' },
  { name: 'Why this company', tag: 'story' },
]

export const CATALOGS: Record<CatalogKey, Catalog> = {
  hld: { key: 'hld', label: 'High level design', short: 'HLD', tagLabel: 'Read first', items: HLD },
  lld: { key: 'lld', label: 'Low level design', short: 'LLD', tagLabel: 'Source', items: LLD },
  gfe: { key: 'gfe', label: 'Frontend components', short: 'GFE', tagLabel: 'Concept', items: GFE },
  mech: { key: 'mech', label: 'Mechanisms', short: 'Mechanisms', tagLabel: 'Ties to', items: MECH },
  beh: { key: 'beh', label: 'Behavioral', short: 'Behavioral', tagLabel: 'Kind', items: BEH },
}

export const CATALOG_ORDER: CatalogKey[] = ['hld', 'lld', 'gfe', 'mech', 'beh']

export function catalogSize(key: CatalogKey): number {
  return CATALOGS[key].items.length
}

export function noteKey(key: CatalogKey, index: number): string {
  return `${key}:${index}`
}

export type Pick =
  | { kind: 'catalog'; catalog: CatalogKey; index: number; item: CatalogItem }
  | { kind: 'free'; name: string }

export const FREE_PREFIX = 'free:'

export function encodeCatalogPick(catalog: CatalogKey, index: number): string {
  return noteKey(catalog, index)
}

export function encodeFreePick(name: string): string {
  return `${FREE_PREFIX}${name}`
}

export function decodePick(value: string | undefined): Pick | null {
  if (!value) return null
  if (value.startsWith(FREE_PREFIX)) {
    const name = value.slice(FREE_PREFIX.length).trim()
    return name === '' ? null : { kind: 'free', name }
  }
  const [key, raw] = value.split(':')
  if (!key || raw === undefined) return null
  if (!(key in CATALOGS)) return null
  const catalog = key as CatalogKey
  const index = Number(raw)
  if (!Number.isInteger(index)) return null
  const item = CATALOGS[catalog].items[index]
  return item ? { kind: 'catalog', catalog, index, item } : null
}

export function nextUnchecked(
  key: CatalogKey,
  checked: Record<string, boolean>,
  claimed?: ReadonlySet<string>,
): { index: number; item: CatalogItem } | null {
  const items = CATALOGS[key].items
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (!item || checked[String(i)]) continue
    if (claimed?.has(noteKey(key, i))) continue
    return { index: i, item }
  }
  return null
}

export function countDone(checked: Record<string, boolean>, key: CatalogKey): number {
  let n = 0
  for (let i = 0; i < CATALOGS[key].items.length; i += 1) if (checked[String(i)]) n += 1
  return n
}
