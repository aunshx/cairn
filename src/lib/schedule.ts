import type { CatalogKey, DayType } from './types'
import { TOTAL_DAYS } from './types'

export type TaskCatalog = 'design' | CatalogKey

export type Task = {
  id: string
  label: string
  sub?: string
  time?: string
  cap?: number
  catalog?: TaskCatalog
}

export type Session = {
  title: string
  range?: string
  tasks: Task[]
}

export function dayType(day: number): DayType {
  if (day % 7 === 0) return 'rest'
  const workIndex = day - Math.floor((day - 1) / 7)
  return workIndex % 2 === 1 ? 'A' : 'B'
}

export function dayTypeLabel(type: DayType): string {
  if (type === 'A') return 'A · HLD'
  if (type === 'B') return 'B · LLD'
  return 'Rest'
}

const GYM_EVENING: Task[] = [
  { id: 'gym2', label: 'Cardio, 45 min' },
  { id: 'rev', label: 'Revision block', sub: 'logs → 1 DSA redo → blank-page recall', time: '19:45' },
  { id: 'beh', label: 'Behavioral, 15 min', catalog: 'beh' },
  { id: 'walk', label: 'Walk, 20 min' },
  { id: 'bed', label: 'Screens off 20:30, bed 21:00' },
]

const DAY_A: Session[] = [
  {
    title: 'Session 1',
    range: '05:30 – 11:00',
    tasks: [
      { id: 'dsa1', label: '4 DSA', sub: '25-min cap each', time: '06:45', cap: 4 },
      {
        id: 'design',
        label: 'HLD problem',
        sub: 'reqs → 40m cold → answer key → delta',
        time: '07:15',
        catalog: 'design',
      },
      { id: 'dsa2', label: '3 DSA', sub: 'interleaved, not slabbed', time: '08:35', cap: 3 },
      { id: 'quiz', label: '10 GFE quiz', time: '09:55' },
    ],
  },
  {
    title: 'Break + Gym 1',
    range: '11:15 – 12:15',
    tasks: [{ id: 'gym1', label: 'Weights, 60 min' }],
  },
  {
    title: 'Session 2',
    range: '13:00 – 18:00',
    tasks: [
      {
        id: 'gfe',
        label: 'GFE component, timed 2h',
        sub: 'no AI, no docs tab',
        time: '13:00',
        catalog: 'gfe',
      },
      { id: 'apps', label: '3 applications', sub: '2 A-tier max, rest assembly', time: '15:00', cap: 3 },
    ],
  },
  { title: 'Evening', range: '18:00 – 21:00', tasks: GYM_EVENING },
]

const DAY_B: Session[] = [
  {
    title: 'Session 1',
    range: '05:30 – 11:00',
    tasks: [
      { id: 'dsa1', label: '4 DSA', sub: '25-min cap each', time: '06:45', cap: 4 },
      {
        id: 'design',
        label: 'LLD problem',
        sub: 'reqs → class diagram → code core → delta',
        time: '07:15',
        catalog: 'design',
      },
      { id: 'dsa2', label: '3 DSA', sub: 'interleaved, not slabbed', time: '08:35', cap: 3 },
      {
        id: 'read',
        label: 'Read 1 Key Tech page + blank-page recall',
        sub: 'close it, write what you remember',
        time: '09:55',
      },
    ],
  },
  {
    title: 'Break + Gym 1',
    range: '11:15 – 12:15',
    tasks: [{ id: 'gym1', label: 'Weights, 60 min' }],
  },
  {
    title: 'Session 2',
    range: '13:00 – 18:00',
    tasks: [
      { id: 'build', label: 'Agentic build, hard 2h cap', time: '13:00' },
      { id: 'apps', label: '3 applications', time: '15:00', cap: 3 },
      { id: 'build2', label: 'Second build hour or overflow', time: '16:00' },
    ],
  },
  { title: 'Evening', range: '18:00 – 21:00', tasks: GYM_EVENING },
]

const DAY_REST: Session[] = [
  {
    title: 'Rest day',
    range: 'Nothing is owed today',
    tasks: [
      { id: 'wake', label: 'Wake 05:00 anyway', sub: 'the anchor holds on rest days too' },
      { id: 'li', label: 'Batch 3 LinkedIn posts, 30 min', sub: 'schedule Mon/Wed/Fri morning' },
      { id: 'gym1', label: 'Walk or light cardio' },
      { id: 'logs', label: 'Skim delta logs, 15 min' },
      { id: 'off', label: 'Rest. Actually rest.' },
    ],
  },
]

export function sessionsFor(type: DayType): Session[] {
  if (type === 'A') return DAY_A
  if (type === 'B') return DAY_B
  return DAY_REST
}

export function tasksFor(type: DayType): Task[] {
  return sessionsFor(type).flatMap((s) => s.tasks)
}

export function catalogFor(task: Task, type: DayType): CatalogKey | null {
  if (!task.catalog) return null
  if (task.catalog !== 'design') return task.catalog
  if (type === 'A') return 'hld'
  if (type === 'B') return 'lld'
  return null
}

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function dateForDay(start: string, day: number): Date {
  const d = parseIso(start)
  d.setDate(d.getDate() + (day - 1))
  return d
}

const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

const SHORT_DATE = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' })

export function formatDayDate(start: string, day: number): string {
  return LONG_DATE.format(dateForDay(start, day))
}

export function formatShortDate(start: string, day: number): string {
  return SHORT_DATE.format(dateForDay(start, day))
}

export function dayForToday(start: string, now = new Date()): number | null {
  const a = parseIso(start)
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000)
  if (diff < 0 || diff >= TOTAL_DAYS) return null
  return diff + 1
}

export const ALL_DAYS: number[] = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1)
