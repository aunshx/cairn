import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'

export type AuthResult = { error: string | null; notice: string | null }

export type Auth = {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const OK: AuthResult = { error: null, notice: null }

export function authErrorMessage(raw: string, status?: number): string {
  const m = raw.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return 'That email and password do not match an account. Check the password, or create an account below.'
  }
  if (m.includes('email not confirmed')) {
    return 'This account exists but the email is not confirmed yet. Open the confirmation link, or turn off email confirmation in Supabase → Authentication → Sign In / Providers.'
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'An account already exists for this email. Switch to Sign in.'
  }
  if (m.includes('password should be at least')) {
    const digits = raw.match(/\d+/)
    return `Password is too short. Supabase requires at least ${digits ? digits[0] : '6'} characters.`
  }
  if (m.includes('unable to validate email') || m.includes('invalid email')) {
    return 'That does not look like a valid email address.'
  }
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) {
    return 'Sign-ups are disabled on this Supabase project. Enable them in Authentication → Sign In / Providers.'
  }
  if (m.includes('email rate limit') || status === 429) {
    return 'Too many attempts in a short window. Wait a minute and try again.'
  }
  if (m.includes('failed to fetch') || m.includes('networkerror')) {
    return 'Could not reach Supabase. Check your connection, and that VITE_SUPABASE_URL points at a project that is not paused.'
  }
  return raw
}

export function useAuth(): Auth {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const supabase = getSupabase()

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted.current) return
        setSession(data.session)
      })
      .finally(() => {
        if (mounted.current) setLoading(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted.current) return
      setSession(next)
      setLoading(false)
    })

    return () => {
      mounted.current = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) return { error: authErrorMessage(error.message, error.status), notice: null }
    return OK
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await getSupabase().auth.signUp({ email: email.trim(), password })
    if (error) return { error: authErrorMessage(error.message, error.status), notice: null }
    if (!data.session) {
      return {
        error: null,
        notice: 'Account created. Confirm the email we sent, then sign in.',
      }
    }
    return OK
  }, [])

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut()
  }, [])

  return useMemo(
    () => ({ session, user: session?.user ?? null, loading, signIn, signUp, signOut }),
    [session, loading, signIn, signUp, signOut],
  )
}
