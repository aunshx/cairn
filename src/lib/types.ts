export type CatalogKey = 'hld' | 'lld' | 'gfe' | 'mech' | 'beh' | 'dsa'

export type DayType = 'A' | 'B' | 'M'

export type DsaEntry = {
  name: string
  flag: boolean
  solved: boolean
  url?: string
  nc?: number
  slot?: string
}

export type Redo = {
  name: string
  due: number[]
  cleared: number[]
}

export const APPLICATION_STATUSES = [
  'applied',
  'screen',
  'onsite',
  'offer',
  'rejected',
  'ghosted',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screen: 'Screen',
  onsite: 'Onsite',
  offer: 'Offer',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
}

export type Application = {
  day: number
  company: string
  role: string
  url?: string
  status: ApplicationStatus
}

export type Delta = {
  day: number
  prob: string
  missed: string
  wrong: string
  ask: string
}

export type DayRecord = {
  done: Record<string, boolean>
  n: Record<string, number>
  dsa: DsaEntry[]
  notes: Record<string, string>
  picks: Record<string, string>
  gym: Record<string, string[]>
  gymMinutes: Record<string, number>
  note: string
  finished: boolean
  finishedAt: string | null
}

export type TrackerState = {
  start: string
  day: number
  days: Record<string, DayRecord>
  hld: Record<string, boolean>
  lld: Record<string, boolean>
  gfe: Record<string, boolean>
  mech: Record<string, boolean>
  beh: Record<string, boolean>
  dsa: Record<string, boolean>
  mechResults: Record<number, string>
  notes: Record<string, string>
  deltas: Delta[]
  redos: Redo[]
  applications: Application[]
  theme: Theme
  totalDays: number
  cycle: number
}

export const GYM_ACTIVITIES = ['CST', 'BB', 'LA', 'Cycling', 'Run', 'Inc Walk'] as const

export type GymActivity = (typeof GYM_ACTIVITIES)[number]

export const DEFAULT_TOTAL_DAYS = 42

export const DEFAULT_CYCLE = 4

export const MIN_TOTAL_DAYS = 7

export const MAX_TOTAL_DAYS = 180

export const MIN_CYCLE = 2

export const MAX_CYCLE = 14

export type Plan = {
  start: string
  totalDays: number
  cycle: number
}

export const GYM_DEFAULT_MINUTES = 45

export const THEMES = ['system', 'light', 'dark'] as const

export type Theme = (typeof THEMES)[number]

export type SaveState = 'saved' | 'unsaved' | 'saving' | 'failed'

export type ViewKey = 'today' | 'metrics' | 'catalog'






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

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
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

function gymMap(v: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  if (!isRecord(v)) return out
  for (const [k, val] of Object.entries(v)) {
    if (!Array.isArray(val)) continue
    const picked = val.filter(
      (a): a is GymActivity => typeof a === 'string' && (GYM_ACTIVITIES as readonly string[]).includes(a),
    )
    if (picked.length > 0) out[k] = picked
  }
  return out
}

function indexedStrMap(v: unknown): Record<number, string> {
  const out: Record<number, string> = {}
  if (!isRecord(v)) return out
  for (const [k, val] of Object.entries(v)) {
    const n = Number(k)
    if (Number.isInteger(n) && n >= 0 && typeof val === 'string') out[n] = val
  }
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

export function todayIso(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function emptyDay(): DayRecord {
  return {
    done: {},
    n: {},
    dsa: [],
    notes: {},
    picks: {},
    gym: {},
    gymMinutes: {},
    note: '',
    finished: false,
    finishedAt: null,
  }
}

export function emptyState(): TrackerState {
  return {
    start: todayIso(),
    day: 1,
    days: {},
    hld: {},
    lld: {},
    gfe: {},
    mech: {},
    beh: {},
    dsa: {},
    mechResults: {},
    notes: {},
    deltas: [],
    redos: [],
    applications: [],
    theme: 'system',
    totalDays: DEFAULT_TOTAL_DAYS,
    cycle: DEFAULT_CYCLE,
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
      .map((e) => {
        const url = typeof e.url === 'string' && e.url !== '' ? { url: e.url } : {}
        const nc =
          typeof e.nc === 'number' && Number.isInteger(e.nc) && e.nc >= 0 ? { nc: e.nc } : {}
        const slot = typeof e.slot === 'string' && e.slot !== '' ? { slot: e.slot } : {}
        return { name: str(e.name), flag: bool(e.flag), solved: bool(e.solved), ...url, ...nc, ...slot }
      })
      .filter((e) => e.name !== ''),
    notes: strMap(v.notes),
    picks: strMap(v.picks),
    gym: gymMap(v.gym),
    gymMinutes: numMap(v.gymMinutes),
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
      if (!Number.isInteger(n) || n < 1 || n > MAX_TOTAL_DAYS) continue
      days[String(n)] = validateDay(v)
    }
  }

  const start = str(raw.start, base.start)

  return {
    start: ISO_DATE.test(start) ? start : base.start,
    day: Math.max(1, int(raw.day, 1)),
    days,
    hld: boolMap(raw.hld),
    lld: boolMap(raw.lld),
    gfe: boolMap(raw.gfe),
    mech: boolMap(raw.mech),
    beh: boolMap(raw.beh),
    dsa: boolMap(raw.dsa),
    mechResults: indexedStrMap(raw.mechResults),
    notes: strMap(raw.notes),
    deltas: arr(raw.deltas)
      .filter(isRecord)
      .map((d) => ({
        day: Math.max(1, int(d.day, 1)),
        prob: str(d.prob),
        missed: str(d.missed),
        wrong: str(d.wrong),
        ask: str(d.ask),
      })),
    redos: arr(raw.redos)
      .filter(isRecord)
      .map((r) => ({ name: str(r.name), due: dayNumbers(r.due), cleared: dayNumbers(r.cleared) }))
      .filter((r) => r.name !== '' && r.due.length > 0),
    applications: arr(raw.applications)
      .filter(isRecord)
      .map((a) => {
        const status = str(a.status, 'applied')
        const url = typeof a.url === 'string' && a.url !== '' ? { url: a.url } : {}
        return {
          day: Math.max(1, int(a.day, 1)),
          company: str(a.company),
          role: str(a.role),
          status: (APPLICATION_STATUSES as readonly string[]).includes(status)
            ? (status as ApplicationStatus)
            : 'applied',
          ...url,
        }
      })
      .filter((a) => a.company !== ''),
    theme: (THEMES as readonly string[]).includes(str(raw.theme))
      ? (str(raw.theme) as Theme)
      : 'system',
    totalDays: clamp(int(raw.totalDays, DEFAULT_TOTAL_DAYS), MIN_TOTAL_DAYS, MAX_TOTAL_DAYS),
    cycle: clamp(int(raw.cycle, DEFAULT_CYCLE), MIN_CYCLE, MAX_CYCLE),
  }
}

export function planOf(state: TrackerState): Plan {
  return { start: state.start, totalDays: state.totalDays, cycle: state.cycle }
}
