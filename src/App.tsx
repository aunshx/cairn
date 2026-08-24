import { AppShell } from './components/AppShell'
import { AuthGate } from './components/AuthGate'
import { Booting } from './components/Booting'
import { LoadFailure } from './components/LoadFailure'
import { SetupNotice } from './components/SetupNotice'
import { useAuth } from './hooks/useAuth'
import { TrackerContext, useTrackerStore } from './hooks/useTracker'
import { isConfigured } from './lib/supabase'

export default function App() {
  if (!isConfigured) return <SetupNotice />
  return <Root />
}

function Root() {
  const auth = useAuth()
  const store = useTrackerStore(auth.user?.id ?? null)

  if (auth.loading) return <Booting label="Restoring session" />

  if (!auth.session) {
    return <AuthGate auth={auth} heldWork={store.status === 'idle' && store.dirty} />
  }

  if (store.status === 'error') {
    return (
      <LoadFailure message={store.message} onRetry={store.retry} onSignOut={() => void auth.signOut()} />
    )
  }

  if (store.status !== 'ready') return <Booting label="Loading your tracker" />

  if (store.needsAuth) return <AuthGate auth={auth} heldWork />

  return (
    <TrackerContext.Provider value={store.tracker}>
      <AppShell email={auth.user?.email ?? ''} onSignOut={() => void auth.signOut()} />
    </TrackerContext.Provider>
  )
}
