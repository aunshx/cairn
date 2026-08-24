import { useState, type FormEvent } from 'react'
import type { Auth } from '../hooks/useAuth'
import { Button } from './ui/Button'

type AuthGateProps = {
  auth: Auth
  heldWork?: boolean
}

const FIELD =
  'w-full border border-rule bg-panel-2 px-3 py-2 text-[14px] text-ink outline-none focus:border-signal'

export function AuthGate({ auth, heldWork = false }: AuthGateProps) {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const creating = mode === 'up'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (!email.trim()) {
      setError('Enter the email address for your account.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }
    if (creating && password.length < 6) {
      setError('Password is too short. Use at least 6 characters.')
      return
    }

    setBusy(true)
    const result = creating ? await auth.signUp(email, password) : await auth.signIn(email, password)
    setBusy(false)
    setError(result.error)
    setNotice(result.notice)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h1 className="font-mono text-[13px] uppercase tracking-[0.3em] text-signal">cairn</h1>
          <p className="mt-1 font-mono text-[11px] text-dim">42-day interview prep · logbook</p>
        </div>

        <form onSubmit={submit} className="border border-rule bg-panel">
          <div className="border-b border-rule px-4 py-3">
            <h2 className="micro">{creating ? 'Create account' : 'Sign in'}</h2>
          </div>

          <div className="space-y-4 p-4">
            {heldWork && (
              <p className="border border-flag/50 bg-flag/10 px-3 py-2 text-[12px] leading-relaxed text-flag">
                Your session expired. Unsaved changes are still held in this tab and will be written
                as soon as you sign back in.
              </p>
            )}

            <div>
              <label htmlFor="email" className="micro mb-1.5 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="password" className="micro mb-1.5 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={creating ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={FIELD}
              />
            </div>

            {error && (
              <p role="alert" className="border border-bad/50 bg-bad/10 px-3 py-2 text-[12px] leading-relaxed text-bad">
                {error}
              </p>
            )}

            {notice && (
              <p role="status" className="border border-signal/40 bg-signal/10 px-3 py-2 text-[12px] leading-relaxed text-signal">
                {notice}
              </p>
            )}

            <Button type="submit" variant="accent" disabled={busy} className="w-full py-2">
              {busy ? 'Working…' : creating ? 'Create account' : 'Sign in'}
            </Button>
          </div>

          <div className="border-t border-rule px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setMode(creating ? 'in' : 'up')
                setError(null)
                setNotice(null)
              }}
              className="font-mono text-[11px] text-muted underline-offset-4 hover:text-signal hover:underline"
            >
              {creating ? 'Already have an account? Sign in' : 'No account yet? Create one'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
