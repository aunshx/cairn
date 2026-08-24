import { useState } from 'react'
import { goToDay, useTracker } from '../hooks/useTracker'
import type { ViewKey } from '../lib/types'
import { CatalogView } from './catalog/CatalogView'
import { Header } from './Header'
import { MetricsView } from './metrics/MetricsView'
import { Settings } from './Settings'
import { TodayView } from './today/TodayView'

type AppShellProps = {
  email: string
  onSignOut: () => void
}

export function AppShell({ email, onSignOut }: AppShellProps) {
  const { state, saveState, update } = useTracker()
  const [view, setView] = useState<ViewKey>('today')
  const [settingsOpen, setSettingsOpen] = useState(false)

  function jump(day: number) {
    update(goToDay(day))
    setView('today')
  }

  return (
    <div className="min-h-dvh">
      <Header
        state={state}
        saveState={saveState}
        view={view}
        onView={setView}
        onJump={jump}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {view === 'today' && <TodayView />}
        {view === 'metrics' && <MetricsView />}
        {view === 'catalog' && <CatalogView />}
      </main>

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        email={email}
        onSignOut={onSignOut}
      />
    </div>
  )
}
