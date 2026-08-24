import type { CatalogKey, DayType } from './types'
import { TOTAL_DAYS } from './types'

export type Task = {
  id: string
  label: string
  sub?: string
  time?: string
  cap?: number
  pick?: CatalogKey[]
  dsa?: boolean
  apps?: boolean
  gym?: boolean
}

export type Session = {
  title: string
  range?: string
  tasks: Task[]
}

export const CYCLE = 4

export function dayType(day: number): DayType {
  if (day % CYCLE === 0) return 'M'
  return workIndex(day) % 2 === 1 ? 'A' : 'B'
}

export function dayTypeLabel(type: DayType): string {
  if (type === 'A') return 'A · HLD'
  if (type === 'B') return 'B · HLD + LLD'
  return 'M · Mock'
}

export const DAY_TYPES: DayType[] = ['A', 'B', 'M']

const BREAK_GYM: Session = {
  title: 'Break + Gym 1',
  range: '11:15 – 12:15',
  tasks: [{ id: 'gym1', label: 'Strength', gym: true }],
}

const BREAK_GYM_2: Session = {
  title: 'Break + Gym 2',
  range: '18:00 – 19:00',
  tasks: [{ id: 'gym2', label: 'Cardio', gym: true }],
}

const EVENING_AB: Session = {
  title: 'Evening',
  range: '19:00 – 21:00',
  tasks: [
    { id: 'rev', label: 'Revision block', sub: 'logs → 1 DSA redo → blank-page recall', time: '19:45' },
    { id: 'walk', label: 'Walk, 20 min' },
    { id: 'bed', label: 'Screens off 20:30, bed 21:00' },
  ],
}

const EVENING_M: Session = {
  title: 'Evening',
  range: '19:00 – 21:00',
  tasks: [
    { id: 'rev', label: 'Revision block', sub: "blank-page recall on today's HLD", time: '19:45' },
    { id: 'walk', label: 'Walk, 20 min' },
    { id: 'bed', label: 'Screens off 20:30, bed 21:00' },
  ],
}

const BUILD_AGENTIC: Task = { id: 'build', label: 'Agentic build, hard 2h cap', time: '13:00' }

const BUILD_MECH: Task = {
  id: 'build',
  label: 'HLD mechanism, hard 2h cap',
  sub: 'from scratch, one mechanism, not a whole system',
  time: '13:00',
  pick: ['mech'],
}

const HABITS: Session = {
  title: 'Every day',
  range: 'No exceptions',
  tasks: [
    { id: 'nodrink', label: 'No drinking', sub: 'tick it before bed, not in the morning' },
    { id: 'nosmoke', label: 'No smoking', sub: 'tick it before bed, not in the morning' },
  ],
}

const DESIGN_SUB = 'reqs → 40m cold → answer key → delta'
const LLD_SUB = 'reqs → class diagram → code core → delta'

const DAY_A: Session[] = [
  {
    title: 'Session 1',
    range: '05:30 – 11:00',
    tasks: [
      { id: 'dsa1', label: '4 DSA', sub: '25-min cap each', time: '06:45', cap: 4, dsa: true },
      { id: 'design', label: 'HLD problem', sub: DESIGN_SUB, time: '07:15', pick: ['hld', 'lld'] },
      { id: 'dsa2', label: '3 DSA', sub: 'interleaved, not slabbed', time: '08:35', cap: 3, dsa: true },
      { id: 'quiz', label: '10 GFE quiz', time: '09:55' },
    ],
  },
  BREAK_GYM,
  {
    title: 'Session 2',
    range: '13:00 – 18:00',
    tasks: [
      { id: 'gfe', label: 'GFE component, timed 2h', sub: 'no AI, no docs tab', time: '13:00', pick: ['gfe'] },
      {
        id: 'apps',
        label: '3 applications',
        sub: '2 A-tier max, rest assembly',
        time: '15:00',
        cap: 3,
        apps: true,
      },
      { id: 'beh', label: 'Behavioral, 15 min', time: '17:00', pick: ['beh'] },
    ],
  },
  BREAK_GYM_2,
  EVENING_AB,
  HABITS,
]

function dayBSessions(build: Task): Session[] {
  return [
  {
    title: 'Session 1',
    range: '05:30 – 11:00',
    tasks: [
      { id: 'dsa1', label: '3 DSA', sub: '25-min cap each', time: '06:45', cap: 3, dsa: true },
      { id: 'design', label: 'HLD problem', sub: DESIGN_SUB, time: '07:15', pick: ['hld', 'lld'] },
      { id: 'dsa2', label: '2 DSA', time: '08:35', cap: 2, dsa: true },
      { id: 'lld', label: 'LLD problem', sub: LLD_SUB, time: '09:25', pick: ['lld'] },
    ],
  },
    BREAK_GYM,
    {
      title: 'Session 2',
      range: '13:00 – 18:00',
      tasks: [
        build,
        { id: 'apps', label: '3 applications', time: '15:00', cap: 3, apps: true },
        {
          id: 'read',
          label: 'Read 1 Key Tech page + blank-page recall',
          sub: 'close it, write what you remember',
          time: '16:00',
        },
        { id: 'beh', label: 'Behavioral, 15 min', time: '17:00', pick: ['beh'] },
      ],
    },
    BREAK_GYM_2,
    EVENING_AB,
    HABITS,
  ]
}

const DAY_B_AGENTIC = dayBSessions(BUILD_AGENTIC)
const DAY_B_MECH = dayBSessions(BUILD_MECH)

const DAY_M: Session[] = [
  {
    title: 'Session 1',
    range: '05:30 – 11:00',
    tasks: [
      { id: 'dsa1', label: '4 DSA', sub: 'redos from the queue first', time: '06:45', cap: 4, dsa: true },
      { id: 'design', label: 'HLD problem', sub: DESIGN_SUB, time: '07:15', pick: ['hld', 'lld'] },
      { id: 'dsa2', label: '3 DSA', time: '08:35', cap: 3, dsa: true },
      {
        id: 'revise',
        label: 'Revise the last 3 days',
        sub: 'every problem logged or picked since the last mock day',
        time: '09:55',
      },
      { id: 'logs', label: 'Reread every delta log to date', time: '10:30' },
    ],
  },
  BREAK_GYM,
  {
    title: 'Session 2',
    range: '13:00 – 18:00',
    tasks: [
      { id: 'mock1', label: 'Mock: system design, 45 min', sub: 'recorded, camera on', time: '13:00' },
      { id: 'mock2', label: 'Mock: coding or behavioral', sub: 'recorded, camera on', time: '14:00' },
      { id: 'redo', label: 'One past LLD cold, code included', time: '15:00' },
      { id: 'li', label: 'Batch 3 LinkedIn posts', sub: 'schedule Mon/Wed/Fri morning', time: '16:00' },
    ],
  },
  BREAK_GYM_2,
  EVENING_M,
  HABITS,
]

export function workIndex(day: number): number {
  return day - Math.floor((day - 1) / CYCLE)
}

export function bDayOrdinal(day: number): number | null {
  if (dayType(day) !== 'B') return null
  return workIndex(day) / 2
}

export function isMechanismDay(day: number): boolean {
  const ordinal = bDayOrdinal(day)
  return ordinal !== null && ordinal % 2 === 0
}

export function sessionsFor(day: number): Session[] {
  const type = dayType(day)
  if (type === 'A') return DAY_A
  if (type === 'M') return DAY_M
  return isMechanismDay(day) ? DAY_B_MECH : DAY_B_AGENTIC
}

export function tasksFor(day: number): Task[] {
  return sessionsFor(day).flatMap((s) => s.tasks)
}

export function taskById(day: number, id: string): Task | null {
  return tasksFor(day).find((t) => t.id === id) ?? null
}

export function capFor(day: number, id: string): number | null {
  return taskById(day, id)?.cap ?? null
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
