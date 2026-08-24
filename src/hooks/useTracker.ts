import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { decodePick } from '../lib/catalogs'
import { capFor } from '../lib/schedule'
import { findNeetcodeBySlug, findNeetcodeIndex, NEETCODE_250 } from '../lib/neetcode'
import { parseProblemInput } from '../lib/problems'
import { getSupabase, TRACKER_TABLE } from '../lib/supabase'
import {
  emptyDay,
  emptyState,
  validateState,
  type CatalogKey,
  type DayRecord,
  type Delta,
  type DsaEntry,
  type Redo,
  type SaveState,
  type TrackerState,
} from '../lib/types'

const DEBOUNCE_MS = 700
const RETRY_MS = 5_000
const HEARTBEAT_MS = 20_000

export type Tracker = {
  state: TrackerState
  saveState: SaveState
  dirty: boolean
  update: (recipe: (state: TrackerState) => TrackerState) => void
  replace: (next: TrackerState) => void
  flushNow: () => void
  retryLoad: () => void
}

export type TrackerStore =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'ready'; tracker: Tracker; needsAuth: boolean }
  | { status: 'idle'; dirty: boolean }

export const TrackerContext = createContext<Tracker | null>(null)

export function useTracker(): Tracker {
  const value = useContext(TrackerContext)
  if (!value) throw new Error('useTracker must be used inside a TrackerContext provider')
  return value
}

function isAuthFailure(status: number, code?: string): boolean {
  return status === 401 || code === 'PGRST301' || code === 'PGRST303'
}

function loadErrorMessage(message: string, status: number): string {
  if (status === 404 || message.includes('does not exist') || message.includes('schema cache')) {
    return 'The tracker table is missing from this Supabase project. Run the SQL from the README, then retry.'
  }
  if (message.toLowerCase().includes('failed to fetch')) {
    return 'Could not reach Supabase. Free projects pause after about a week idle; check the dashboard, then retry.'
  }
  return message
}

export function useTrackerStore(userId: string | null): TrackerStore {
  const [state, setState] = useState<TrackerState | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [loadToken, setLoadToken] = useState(0)

  const stateRef = useRef<TrackerState | null>(null)
  const savedRef = useRef<TrackerState | null>(null)
  const savingRef = useRef(false)
  const userIdRef = useRef<string | null>(null)
  const ownerRef = useRef<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const aliveRef = useRef(true)
  const flushRef = useRef<() => void>(() => {})

  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  const setDirtyState = useCallback((next: SaveState) => {
    if (aliveRef.current) setSaveState(next)
  }, [])

  const write = useCallback(async (snapshot: TrackerState) => {
    const supabase = getSupabase()
    const payload = { data: snapshot, updated_at: new Date().toISOString() }
    let result = await supabase.from(TRACKER_TABLE).upsert(payload, { onConflict: 'user_id' })

    if (isAuthFailure(result.status, result.error?.code)) {
      const refreshed = await supabase.auth.refreshSession()
      if (!refreshed.error && refreshed.data.session) {
        result = await supabase.from(TRACKER_TABLE).upsert(payload, { onConflict: 'user_id' })
      }
    }
    return result
  }, [])

  const flush = useCallback(async () => {
    if (savingRef.current) return
    if (!userIdRef.current) return
    const snapshot = stateRef.current
    if (!snapshot || snapshot === savedRef.current) return

    savingRef.current = true
    setDirtyState('saving')

    const { error, status } = await write(snapshot)
    savingRef.current = false

    if (!aliveRef.current) return

    if (error) {
      if (isAuthFailure(status, error.code)) {
        setNeedsAuth(true)
        setDirtyState('unsaved')
        return
      }
      setDirtyState('failed')
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => flushRef.current(), RETRY_MS)
      return
    }

    setNeedsAuth(false)
    savedRef.current = snapshot

    if (stateRef.current !== snapshot) {
      setDirtyState('unsaved')
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => flushRef.current(), DEBOUNCE_MS)
      return
    }
    setDirtyState('saved')
  }, [setDirtyState, write])

  useEffect(() => {
    flushRef.current = () => void flush()
  }, [flush])

  const schedule = useCallback((delay: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => flushRef.current(), delay)
  }, [])

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    if (ownerRef.current && ownerRef.current !== userId) {
      stateRef.current = null
      savedRef.current = null
      setState(null)
    }

    if (ownerRef.current === userId && stateRef.current) {
      setNeedsAuth(false)
      schedule(0)
      return
    }

    let cancelled = false
    setLoadError(null)

    void (async () => {
      const supabase = getSupabase()
      const { data, error, status } = await supabase
        .from(TRACKER_TABLE)
        .select('data')
        .maybeSingle()

      if (cancelled || !aliveRef.current) return

      if (error) {
        setLoadError(loadErrorMessage(error.message, status))
        return
      }

      let next: TrackerState
      if (!data) {
        next = emptyState()
        const seeded = await write(next)
        if (cancelled || !aliveRef.current) return
        if (seeded.error) {
          setLoadError(loadErrorMessage(seeded.error.message, seeded.status))
          return
        }
      } else {
        next = validateState((data as { data: unknown }).data)
      }

      ownerRef.current = userId
      stateRef.current = next
      savedRef.current = next
      setState(next)
      setSaveState('saved')
      setNeedsAuth(false)
    })()

    return () => {
      cancelled = true
    }
  }, [userId, loadToken, schedule, write])

  const update = useCallback(
    (recipe: (current: TrackerState) => TrackerState) => {
      const current = stateRef.current
      if (!current) return
      const next = recipe(current)
      if (next === current) return
      stateRef.current = next
      setState(next)
      setDirtyState(savingRef.current ? 'saving' : 'unsaved')
      schedule(DEBOUNCE_MS)
    },
    [schedule, setDirtyState],
  )

  const replace = useCallback(
    (next: TrackerState) => {
      stateRef.current = next
      setState(next)
      setDirtyState('unsaved')
      schedule(0)
    },
    [schedule, setDirtyState],
  )

  const flushNow = useCallback(() => schedule(0), [schedule])
  const retryLoad = useCallback(() => setLoadToken((n) => n + 1), [])

  const dirty = saveState !== 'saved'

  useEffect(() => {
    if (!dirty) return
    const id = window.setInterval(() => flushRef.current(), HEARTBEAT_MS)
    return () => window.clearInterval(id)
  }, [dirty])

  useEffect(() => {
    if (!dirty) return
    const onOnline = () => flushRef.current()
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('online', onOnline)
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [dirty])

  return useMemo<TrackerStore>(() => {
    if (!userId) return { status: 'idle', dirty }
    if (loadError) return { status: 'error', message: loadError, retry: retryLoad }
    if (!state) return { status: 'loading' }
    return {
      status: 'ready',
      tracker: { state, saveState, dirty, update, replace, flushNow, retryLoad },
      needsAuth,
    }
  }, [
    userId,
    loadError,
    state,
    saveState,
    dirty,
    needsAuth,
    update,
    replace,
    flushNow,
    retryLoad,
  ])
}

export type Recipe = (state: TrackerState) => TrackerState

function withDay(state: TrackerState, day: number, edit: (record: DayRecord) => DayRecord): TrackerState {
  const key = String(day)
  const current = state.days[key] ?? emptyDay()
  const next = edit(current)
  if (next === current) return state
  return { ...state, days: { ...state.days, [key]: next } }
}

export const goToDay =
  (day: number): Recipe =>
  (state) =>
    state.day === day ? state : { ...state, day }

export const setCount =
  (day: number, taskId: string, value: number, cap: number): Recipe =>
  (state) => {
    const n = Math.max(0, Math.min(cap, value))
    return withDay(state, day, (record) => ({
      ...record,
      n: { ...record.n, [taskId]: n },
      done: { ...record.done, [taskId]: n >= cap },
    }))
  }

export const toggleTask =
  (day: number, taskId: string, cap: number | null): Recipe =>
  (state) => {
    const record = state.days[String(day)] ?? emptyDay()
    const next = record.done[taskId] !== true
    if (cap === null) {
      return withDay(state, day, (r) => ({ ...r, done: { ...r.done, [taskId]: next } }))
    }
    return setCount(day, taskId, next ? cap : 0, cap)(state)
  }

export const setPick =
  (day: number, taskId: string, value: string): Recipe =>
  (state) => {
    const record = state.days[String(day)] ?? emptyDay()
    const previous = decodePick(record.picks[taskId])
    const next = decodePick(value)

    let out = withDay(state, day, (r) => ({ ...r, picks: { ...r.picks, [taskId]: value } }))

    if (record.done[taskId] === true) {
      if (previous?.kind === 'catalog') out = setCatalog(previous.catalog, previous.index, false)(out)
      if (next?.kind === 'catalog') out = setCatalog(next.catalog, next.index, true)(out)
    }
    return out
  }

export const setTaskNote =
  (day: number, taskId: string, note: string): Recipe =>
  (state) =>
    withDay(state, day, (record) => ({ ...record, notes: { ...record.notes, [taskId]: note } }))

export const setDayNote =
  (day: number, note: string): Recipe =>
  (state) =>
    withDay(state, day, (record) => ({ ...record, note }))

export const setFinished =
  (day: number, finished: boolean): Recipe =>
  (state) =>
    withDay(state, day, (record) => ({
      ...record,
      finished,
      finishedAt: finished ? new Date().toISOString() : null,
    }))

export const addDsa =
  (day: number, raw: string, slot?: string): Recipe =>
  (state) => {
    const parsed = parseProblemInput(raw)
    if (!parsed.name) return state

    const nc = (parsed.slug ? findNeetcodeBySlug(parsed.slug) : null) ?? findNeetcodeIndex(parsed.name)
    const listed = nc === null ? null : NEETCODE_250[nc]

    const entry: DsaEntry = {
      name: listed ? listed.name : parsed.name,
      flag: false,
      solved: true,
      ...(parsed.url ?? listed?.url ? { url: parsed.url ?? listed?.url } : {}),
      ...(nc === null ? {} : { nc }),
      ...(slot ? { slot } : {}),
    }

    let out = withDay(state, day, (record) => ({ ...record, dsa: [...record.dsa, entry] }))

    if (slot) {
      const cap = capFor(day, slot) ?? 0
      const logged = (out.days[String(day)]?.dsa ?? []).filter((e) => e.slot === slot).length
      const current = out.days[String(day)]?.n[slot] ?? 0
      if (logged > current) out = setCount(day, slot, Math.min(cap, logged), cap)(out)
    }

    return nc === null ? out : setCatalog('dsa', nc, true)(out)
  }

export const removeDsa =
  (day: number, index: number): Recipe =>
  (state) =>
    withDay(state, day, (record) => ({
      ...record,
      dsa: record.dsa.filter((_, i) => i !== index),
    }))

export function redoFor(name: string, day: number): Redo {
  return { name, due: [day + 3, day + 10, day + 30], cleared: [] }
}

export const toggleDsaFlag =
  (day: number, index: number): Recipe =>
  (state) => {
    const record = state.days[String(day)] ?? emptyDay()
    const entry = record.dsa[index]
    if (!entry) return state
    const flag = !entry.flag

    const withFlag = withDay(state, day, (r) => ({
      ...r,
      dsa: r.dsa.map((e, i) => (i === index ? { ...e, flag } : e)),
    }))

    if (flag) {
      const exists = withFlag.redos.some((r) => r.name === entry.name && r.cleared.length === 0)
      if (exists) return withFlag
      return { ...withFlag, redos: [...withFlag.redos, redoFor(entry.name, day)] }
    }
    return {
      ...withFlag,
      redos: withFlag.redos.filter((r) => !(r.name === entry.name && r.cleared.length === 0)),
    }
  }

export const addRedo =
  (name: string, day: number): Recipe =>
  (state) => {
    const trimmed = name.trim()
    if (!trimmed) return state
    return { ...state, redos: [...state.redos, redoFor(trimmed, day)] }
  }

export const clearRedo =
  (index: number, day: number): Recipe =>
  (state) => ({
    ...state,
    redos: state.redos.map((r, i) =>
      i === index && r.cleared.length < r.due.length ? { ...r, cleared: [...r.cleared, day] } : r,
    ),
  })

export const removeRedo =
  (index: number): Recipe =>
  (state) => ({ ...state, redos: state.redos.filter((_, i) => i !== index) })

export const appendDelta =
  (delta: Delta): Recipe =>
  (state) => ({ ...state, deltas: [...state.deltas, delta] })

export const toggleCatalog =
  (key: CatalogKey, index: number): Recipe =>
  (state) => {
    const map = state[key]
    const id = String(index)
    return { ...state, [key]: { ...map, [id]: !map[id] } }
  }

export const setCatalog =
  (key: CatalogKey, index: number, value: boolean): Recipe =>
  (state) => ({ ...state, [key]: { ...state[key], [String(index)]: value } })

export const setCatalogNote =
  (key: CatalogKey, index: number, note: string): Recipe =>
  (state) => ({ ...state, notes: { ...state.notes, [`${key}:${index}`]: note } })

export const setMechResult =
  (index: number, value: string): Recipe =>
  (state) => ({ ...state, mechResults: { ...state.mechResults, [index]: value } })

export const setStart =
  (start: string): Recipe =>
  (state) => ({ ...state, start })
