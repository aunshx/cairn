import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getSupabase, TRACKER_TABLE } from '../lib/supabase'
import { emptyState, validateState, type SaveState, type TrackerState } from '../lib/types'

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

  userIdRef.current = userId

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
      timerRef.current = window.setTimeout(() => void flush(), RETRY_MS)
      return
    }

    setNeedsAuth(false)
    savedRef.current = snapshot

    if (stateRef.current !== snapshot) {
      setDirtyState('unsaved')
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => void flush(), DEBOUNCE_MS)
      return
    }
    setDirtyState('saved')
  }, [setDirtyState, write])

  const schedule = useCallback(
    (delay: number) => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => void flush(), delay)
    },
    [flush],
  )

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

  const dirty = state !== null && state !== savedRef.current

  useEffect(() => {
    if (!dirty) return
    const id = window.setInterval(() => void flush(), HEARTBEAT_MS)
    return () => window.clearInterval(id)
  }, [dirty, flush])

  useEffect(() => {
    if (!dirty) return
    const onOnline = () => void flush()
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('online', onOnline)
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [dirty, flush])

  const tracker = useMemo<Tracker | null>(() => {
    if (!state) return null
    return { state, saveState, dirty, update, replace, flushNow, retryLoad }
  }, [state, saveState, dirty, update, replace, flushNow, retryLoad])

  if (!userId) return { status: 'idle', dirty }
  if (loadError) return { status: 'error', message: loadError, retry: retryLoad }
  if (!tracker) return { status: 'loading' }
  return { status: 'ready', tracker, needsAuth }
}
