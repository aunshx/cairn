export type CatalogKey = 'hld' | 'lld' | 'gfe' | 'beh'

export type DayType = 'A' | 'B' | 'rest'

export type DsaEntry = {
  name: string
  flag: boolean
  solved: boolean
}

/**
 * A flagged problem on a spaced-repetition schedule.
 * `due` holds the scheduled day numbers (flagDay + 3, +10, +30).
 * `cleared` holds the day numbers on which each occurrence was actually
 * cleared, in order, so `cleared.length` is the index of the next due date and
 * the gap between a flag and its first clear stays measurable.
 */
export type Redo = {
  name: string
  due: number[]
  cleared: number[]
}

export type Delta = {
  day: number
  prob: string
  missed: string
  wrong: string
  ask: string
}

export type DayRecord = {
  /** taskId -> checked */
  done: Record<string, boolean>
  /** taskId -> count, for counter tasks */
  n: Record<string, number>
  dsa: DsaEntry[]
  /** taskId -> note, scoped to this day */
  notes: Record<string, string>
  /** freeform day note */
  note: string
  finished: boolean
  finishedAt: string | null
}

export type TrackerState = {
  /** YYYY-MM-DD of day 1 */
  start: string
  /** the day currently in view, 1..42 */
  day: number
  /** day number as string -> record */
  days: Record<string, DayRecord>
  /** catalog index as string -> checked */
  hld: Record<string, boolean>
  lld: Record<string, boolean>
  gfe: Record<string, boolean>
  beh: Record<string, boolean>
  /** "hld:4" -> note, persists across all 42 days */
  notes: Record<string, string>
  deltas: Delta[]
  redos: Redo[]
}

export type SaveState = 'saved' | 'unsaved' | 'saving' | 'failed'

export type ViewKey = 'today' | 'metrics' | 'catalog'

export const TOTAL_DAYS = 42

/** dsa1 (4) + dsa2 (3) over 36 working days. */
export const DSA_TARGET = 252

/* ------------------------------------------------------------------ *
 * Validation
 *
 * The row in Postgres is a jsonb blob written by an older build, a hand
 * edit, or an imported file. Nothing about its shape is guaranteed, so
 * every read is walked field by field and missing or wrong-typed values
 * are replaced with defaults rather than trusted.
 * ------------------------------------------------------------------ */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback
}

function int(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : fallback
}

function boolMap(v: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  if (!isRecord(v)) return out
  for (const [k, val] of Object.entries(v)) if (typeof val === 'boolean') out[k] = val
  return out
}

function numMap(v: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (!isRecord(v)) return out
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === 'number' && Number.isFinite(val)) out[k] = Math.trunc(val)
  }
  return out
}

function strMap(v: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (!isRecord(v)) return out
  for (const [k, val] of Object.entries(v)) if (typeof val === 'string') out[k] = val
  return out
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function dayNumbers(v: unknown): number[] {
  return arr(v)
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
    .map((n) => Math.trunc(n))
}

/** Today in the local timezone as YYYY-MM-DD. */
export function todayIso(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function emptyDay(): DayRecord {
  return { done: {}, n: {}, dsa: [], notes: {}, note: '', finished: false, finishedAt: null }
}

export function emptyState(): TrackerState {
  return {
    start: todayIso(),
    day: 1,
    days: {},
    hld: {},
    lld: {},
    gfe: {},
    beh: {},
    notes: {},
    deltas: [],
    redos: [],
  }
}

function validateDay(v: unknown): DayRecord {
  if (!isRecord(v)) return emptyDay()
  const finishedAt = typeof v.finishedAt === 'string' ? v.finishedAt : null
  return {
    done: boolMap(v.done),
    n: numMap(v.n),
    dsa: arr(v.dsa)
      .filter(isRecord)
      .map((e) => ({ name: str(e.name), flag: bool(e.flag), solved: bool(e.solved) }))
      .filter((e) => e.name !== ''),
    notes: strMap(v.notes),
    note: str(v.note),
    finished: bool(v.finished),
    finishedAt,
  }
}

export function validateState(raw: unknown): TrackerState {
  const base = emptyState()
  if (!isRecord(raw)) return base

  const days: Record<string, DayRecord> = {}
  if (isRecord(raw.days)) {
    for (const [k, v] of Object.entries(raw.days)) {
      const n = Number(k)
      if (!Number.isInteger(n) || n < 1 || n > TOTAL_DAYS) continue
      days[String(n)] = validateDay(v)
    }
  }

  const start = str(raw.start, base.start)

  return {
    start: ISO_DATE.test(start) ? start : base.start,
    day: Math.min(TOTAL_DAYS, Math.max(1, int(raw.day, 1))),
    days,
    hld: boolMap(raw.hld),
    lld: boolMap(raw.lld),
    gfe: boolMap(raw.gfe),
    beh: boolMap(raw.beh),
    notes: strMap(raw.notes),
    deltas: arr(raw.deltas)
      .filter(isRecord)
      .map((d) => ({
        day: Math.min(TOTAL_DAYS, Math.max(1, int(d.day, 1))),
        prob: str(d.prob),
        missed: str(d.missed),
        wrong: str(d.wrong),
        ask: str(d.ask),
      })),
    redos: arr(raw.redos)
      .filter(isRecord)
      .map((r) => ({ name: str(r.name), due: dayNumbers(r.due), cleared: dayNumbers(r.cleared) }))
      .filter((r) => r.name !== '' && r.due.length > 0),
  }
}
