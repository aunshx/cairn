import { useEffect, useState } from 'react'
import { goToDay, useTracker } from '../hooks/useTracker'
import type { ViewKey } from '../lib/types'
import { CatalogView } from './catalog/CatalogView'
import { Footer } from './Footer'
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
    update(goToDay(Math.min(state.totalDays, Math.max(1, day))))
    setView('today')
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]')) return
      if (event.key === 'ArrowLeft') jump(state.day - 1)
      if (event.key === 'ArrowRight') jump(state.day + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        state={state}
        saveState={saveState}
        view={view}
        onView={setView}
        onJump={jump}
        email={email}
        onOpenSettings={() => setSettingsOpen(true)}
        onSignOut={onSignOut}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {view === 'today' && <TodayView />}
        {view === 'metrics' && <MetricsView />}
        {view === 'catalog' && <CatalogView />}
      </main>

      <Footer />

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        email={email}
        onSignOut={onSignOut}
      />
    </div>
  )
}
