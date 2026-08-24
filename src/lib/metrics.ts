import { CATALOGS, countDone, decodePick } from './catalogs'
import { NEETCODE_250, type Difficulty } from './neetcode'
import { ALL_DAYS, dayType, isMechanismDay, tasksFor, type Task } from './schedule'
import {
  APPS_TARGET,
  DSA_TARGET,
  MECH_TARGET,
  MOCK_TARGET,
  TOTAL_DAYS,
  emptyDay,
  type CatalogKey,
  type DayRecord,
  type DayType,
  type Delta,
  type Redo,
  type TrackerState,
} from './types'

export type TrackKey = CatalogKey | 'dsa' | 'apps' | 'mock'

export const TRACK_ORDER: TrackKey[] = ['hld', 'lld', 'gfe', 'mech', 'beh', 'dsa', 'apps', 'mock']

export const TRACK_LABEL: Record<TrackKey, string> = {
  hld: 'HLD',
  lld: 'LLD',
  gfe: 'GFE',
  mech: 'Mechanisms',
  beh: 'Behavioral',
  dsa: 'DSA',
  apps: 'Applications',
  mock: 'Mocks',
}

const EMPTY = emptyDay()

export function dayRecord(state: TrackerState, day: number): DayRecord {
  return state.days[String(day)] ?? EMPTY
}

export function dsaCount(record: DayRecord): number {
  return (record.n.dsa1 ?? 0) + (record.n.dsa2 ?? 0)
}

export function isDone(record: DayRecord, taskId: string): boolean {
  return record.done[taskId] === true
}

export function dayCompletion(state: TrackerState, day: number): { done: number; total: number; rate: number } {
  const tasks = tasksFor(day)
  const record = dayRecord(state, day)
  const done = tasks.reduce((n, t) => (isDone(record, t.id) ? n + 1 : n), 0)
  return { done, total: tasks.length, rate: tasks.length === 0 ? 0 : done / tasks.length }
}

export function finishedDays(state: TrackerState): number[] {
  return ALL_DAYS.filter((d) => dayRecord(state, d).finished)
}

export function currentStreak(state: TrackerState): number {
  const finished = finishedDays(state)
  const last = finished.at(-1)
  if (last === undefined) return 0
  let streak = 0
  for (let d = last; d >= 1; d -= 1) {
    if (!dayRecord(state, d).finished) break
    streak += 1
  }
  return streak
}

export function habitStreak(state: TrackerState, taskId: string, upTo: number): number {
  let streak = 0
  for (let d = upTo; d >= 1; d -= 1) {
    if (!isDone(dayRecord(state, d), taskId)) break
    streak += 1
  }
  return streak
}

export function habitTotal(state: TrackerState, taskId: string): number {
  return ALL_DAYS.reduce((n, d) => (isDone(dayRecord(state, d), taskId) ? n + 1 : n), 0)
}

export function completionRate(state: TrackerState): { done: number; total: number; rate: number | null } {
  let done = 0
  let total = 0
  for (const day of finishedDays(state)) {
    const c = dayCompletion(state, day)
    done += c.done
    total += c.total
  }
  return { done, total, rate: total === 0 ? null : done / total }
}

function windowDays(day: number, span: number, offset = 0): number[] {
  const end = day - offset
  const start = Math.max(1, end - span + 1)
  const out: number[] = []
  for (let d = start; d <= end; d += 1) out.push(d)
  return out
}

export type Missed = { missed: number; total: number; rate: number | null; days: number }

export function missedTasks(state: TrackerState): Missed {
  let missed = 0
  let total = 0
  const days = finishedDays(state)
  for (const day of days) {
    const c = dayCompletion(state, day)
    missed += c.total - c.done
    total += c.total
  }
  return { missed, total, rate: total === 0 ? null : missed / total, days: days.length }
}

export type FlagRate = {
  rate: number | null
  previous: number | null
  delta: number | null
  logged: number
  flagged: number
}

export function flagRate(state: TrackerState, day: number): FlagRate {
  const measure = (days: number[]) => {
    let logged = 0
    let flagged = 0
    for (const d of days) {
      const record = dayRecord(state, d)
      logged += record.dsa.length
      flagged += record.dsa.reduce((n, e) => (e.flag ? n + 1 : n), 0)
    }
    return { logged, flagged, rate: logged === 0 ? null : flagged / logged }
  }

  const current = measure(windowDays(day, 7))
  const previous = measure(windowDays(day, 7, 7))
  const delta = current.rate !== null && previous.rate !== null ? current.rate - previous.rate : null

  return {
    rate: current.rate,
    previous: previous.rate,
    delta,
    logged: current.logged,
    flagged: current.flagged,
  }
}

const FIXED_TARGET: Partial<Record<TrackKey, number>> = {
  dsa: DSA_TARGET,
  apps: APPS_TARGET,
  mock: MOCK_TARGET,
  mech: MECH_TARGET,
}

export function mockCount(record: DayRecord): number {
  return (isDone(record, 'mock1') ? 1 : 0) + (isDone(record, 'mock2') ? 1 : 0)
}

export function mocksCompleted(state: TrackerState): number {
  return ALL_DAYS.reduce((n, d) => (dayType(d) === 'M' ? n + mockCount(dayRecord(state, d)) : n), 0)
}

export function trackTotal(track: TrackKey): number {
  const fixed = FIXED_TARGET[track]
  if (fixed !== undefined) return fixed
  return CATALOGS[track as CatalogKey].items.length
}

export function trackDone(state: TrackerState, track: TrackKey): number {
  if (track === 'dsa') return ALL_DAYS.reduce((n, d) => n + dsaCount(dayRecord(state, d)), 0)
  if (track === 'apps') return ALL_DAYS.reduce((n, d) => n + (dayRecord(state, d).n.apps ?? 0), 0)
  if (track === 'mock') return mocksCompleted(state)
  return countDone(state[track], track)
}

function trackDoneOnDay(state: TrackerState, track: TrackKey, day: number): number {
  const type = dayType(day)
  const record = dayRecord(state, day)
  if (track === 'dsa') return dsaCount(record)
  if (track === 'apps') return record.n.apps ?? 0
  if (track === 'mock') return type === 'M' ? mockCount(record) : 0
  if (track === 'beh') return isDone(record, 'beh') ? 1 : 0
  if (track === 'mech') return isMechanismDay(day) && isDone(record, 'build') ? 1 : 0
  if (track === 'gfe') return type === 'A' && isDone(record, 'gfe') ? 1 : 0
  if (track === 'hld') return isDone(record, 'design') ? 1 : 0
  return type === 'B' && isDone(record, 'lld') ? 1 : 0
}

export type TrackProgress = {
  track: TrackKey
  label: string
  done: number
  total: number
  ratio: number
  expected: number
  expectedRatio: number
  behind: boolean
  weeklyRate: number
  projectedDay: number | null
}

export function trackProgress(state: TrackerState, day: number, track: TrackKey): TrackProgress {
  const total = trackTotal(track)
  const done = trackDone(state, track)
  const expected = (total * Math.min(day, TOTAL_DAYS)) / TOTAL_DAYS
  const weeklyRate = windowDays(day, 7).reduce((n, d) => n + trackDoneOnDay(state, track, d), 0)
  const remaining = Math.max(0, total - done)

  let projectedDay: number | null = null
  if (remaining === 0) projectedDay = day
  else if (weeklyRate > 0) projectedDay = day + Math.ceil(remaining / (weeklyRate / 7))

  return {
    track,
    label: TRACK_LABEL[track],
    done,
    total,
    ratio: total === 0 ? 0 : done / total,
    expected,
    expectedRatio: total === 0 ? 0 : expected / total,
    behind: done < Math.floor(expected),
    weeklyRate,
    projectedDay,
  }
}

export function allTrackProgress(state: TrackerState, day: number): TrackProgress[] {
  return TRACK_ORDER.map((t) => trackProgress(state, day, t))
}

export function worstProjection(state: TrackerState, day: number): TrackProgress | null {
  const tracks = allTrackProgress(state, day)
  const unfinished = tracks.filter((t) => t.done < t.total)
  if (unfinished.length === 0) return null
  const stalled = unfinished.filter((t) => t.projectedDay === null)
  if (stalled.length > 0) {
    return stalled.reduce((worst, t) => (t.ratio < worst.ratio ? t : worst))
  }
  return unfinished.reduce((worst, t) => ((t.projectedDay ?? 0) > (worst.projectedDay ?? 0) ? t : worst))
}

export type BurnUpPoint = { day: number; actual: number; target: number }

export function burnUp(state: TrackerState, day: number): { points: BurnUpPoint[]; target: number } {
  const points: BurnUpPoint[] = [{ day: 0, actual: 0, target: 0 }]
  let running = 0
  for (const d of ALL_DAYS) {
    running += dsaCount(dayRecord(state, d))
    if (d <= day) points.push({ day: d, actual: running, target: (DSA_TARGET * d) / TOTAL_DAYS })
  }
  return { points, target: DSA_TARGET }
}

export type HeatCell = { day: number; type: DayType; rate: number; done: number; total: number; started: boolean }

export function heatmap(state: TrackerState): HeatCell[] {
  return ALL_DAYS.map((day) => {
    const c = dayCompletion(state, day)
    const record = dayRecord(state, day)
    return {
      day,
      type: dayType(day),
      rate: c.rate,
      done: c.done,
      total: c.total,
      started: record.finished || c.done > 0,
    }
  })
}

export type Slip = { id: string; label: string; missed: number; available: number; rate: number }

export function slips(state: TrackerState, limit = 5): Slip[] {
  const labels = new Map<string, string>()
  const stats = new Map<string, { missed: number; available: number }>()
  const register = (task: Task) => {
    if (!labels.has(task.id)) labels.set(task.id, task.label)
  }

  for (const day of finishedDays(state)) {
    const record = dayRecord(state, day)
    for (const task of tasksFor(day)) {
      register(task)
      const entry = stats.get(task.id) ?? { missed: 0, available: 0 }
      entry.available += 1
      if (!isDone(record, task.id)) entry.missed += 1
      stats.set(task.id, entry)
    }
  }

  return [...stats.entries()]
    .map(([id, s]) => ({
      id,
      label: labels.get(id) ?? id,
      missed: s.missed,
      available: s.available,
      rate: s.available === 0 ? 0 : s.missed / s.available,
    }))
    .filter((s) => s.missed > 0)
    .sort((a, b) => b.rate - a.rate || b.missed - a.missed || a.label.localeCompare(b.label))
    .slice(0, limit)
}

export function nextDue(redo: Redo): number | null {
  return redo.due[redo.cleared.length] ?? null
}

export function isOpen(redo: Redo): boolean {
  return nextDue(redo) !== null
}

export function openRedos(state: TrackerState): Redo[] {
  return state.redos
    .filter(isOpen)
    .slice()
    .sort((a, b) => (nextDue(a) ?? 0) - (nextDue(b) ?? 0) || a.name.localeCompare(b.name))
}

export function flagDay(redo: Redo): number {
  return (redo.due[0] ?? 1) - 3
}

export type RevisionHealth = {
  firstTryRate: number | null
  firstTryCleared: number
  firstTryEligible: number
  open: number
  overdue: number
  averageGap: number | null
}

export function revisionHealth(state: TrackerState, day: number): RevisionHealth {
  let firstTryEligible = 0
  let firstTryCleared = 0
  let open = 0
  let overdue = 0
  let gapTotal = 0
  let gapCount = 0

  for (const redo of state.redos) {
    const firstDue = redo.due[0]
    const firstClear = redo.cleared[0]

    if (firstClear !== undefined || (firstDue !== undefined && firstDue <= day)) {
      firstTryEligible += 1
      if (firstClear !== undefined && firstDue !== undefined && firstClear <= firstDue) firstTryCleared += 1
    }

    if (firstClear !== undefined) {
      gapTotal += firstClear - flagDay(redo)
      gapCount += 1
    }

    const due = nextDue(redo)
    if (due !== null) {
      open += 1
      if (due < day) overdue += 1
    }
  }

  return {
    firstTryRate: firstTryEligible === 0 ? null : firstTryCleared / firstTryEligible,
    firstTryCleared,
    firstTryEligible,
    open,
    overdue,
    averageGap: gapCount === 0 ? null : gapTotal / gapCount,
  }
}

export type RevisionItem = {
  key: string
  day: number
  kind: string
  name: string
  url?: string
  difficulty?: Difficulty
}

const PICK_KIND: Record<string, string> = {
  design: 'HLD',
  lld: 'LLD',
  gfe: 'GFE',
  beh: 'Behavioral',
  build: 'Mechanism',
}

export function revisionQueue(state: TrackerState, day: number, lookback = 3): RevisionItem[] {
  const items: RevisionItem[] = []
  const from = Math.max(1, day - lookback)

  for (let d = from; d < day; d += 1) {
    const record = dayRecord(state, d)

    record.dsa.forEach((entry, i) => {
      const listed = entry.nc === undefined ? undefined : NEETCODE_250[entry.nc]
      items.push({
        key: `d${d}:dsa:${i}`,
        day: d,
        kind: 'DSA',
        name: entry.name,
        ...(entry.url ? { url: entry.url } : {}),
        ...(listed ? { difficulty: listed.difficulty } : {}),
      })
    })

    for (const [taskId, kind] of Object.entries(PICK_KIND)) {
      const picked = decodePick(record.picks[taskId])
      if (!picked) continue
      const name = picked.kind === 'catalog' ? picked.item.name : picked.name
      const url = picked.kind === 'catalog' ? picked.item.url : undefined
      items.push({
        key: `d${d}:${taskId}`,
        day: d,
        kind,
        name,
        ...(url ? { url } : {}),
      })
    }
  }

  return items
}

export function revisionKey(item: RevisionItem): string {
  return `revise:${item.key}`
}

export type NoteItem =
  | { kind: 'delta'; day: number; delta: Delta }
  | { kind: 'day'; day: number; note: string }

export function recentNotes(state: TrackerState, limit = 5): NoteItem[] {
  const items: NoteItem[] = []

  state.deltas
    .slice()
    .reverse()
    .forEach((delta) => {
      if (delta.prob || delta.missed || delta.wrong || delta.ask) {
        items.push({ kind: 'delta', day: delta.day, delta })
      }
    })

  for (const day of ALL_DAYS) {
    const note = dayRecord(state, day).note.trim()
    if (note) items.push({ kind: 'day', day, note })
  }

  return items.sort((a, b) => b.day - a.day).slice(0, limit)
}

export type MechResult = { index: number; name: string; ties: string; value: string }

export function mechanismResults(state: TrackerState): MechResult[] {
  const items = CATALOGS.mech.items
  return Object.entries(state.mechResults)
    .map(([key, value]) => ({ index: Number(key), value: value.trim() }))
    .filter((entry) => entry.value !== '' && Number.isInteger(entry.index))
    .sort((a, b) => a.index - b.index)
    .flatMap(({ index, value }) => {
      const item = items[index]
      return item ? [{ index, name: item.name, ties: item.tag, value }] : []
    })
}

export function percent(value: number | null, digits = 0): string {
  if (value === null || Number.isNaN(value)) return '—'
  return `${(value * 100).toFixed(digits)}%`
}
