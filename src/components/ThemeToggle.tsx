import { useEffect } from 'react'
import { setTheme, useTracker } from '../hooks/useTracker'
import { THEMES, type Theme } from '../lib/types'

const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }

const LABEL: Record<Theme, string> = { system: 'System', light: 'Light', dark: 'Dark' }

function Icon({ theme }: { theme: Theme }) {
  if (theme === 'light') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
        <circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.4 4.4l1.4 1.4M14.2 14.2l1.4 1.4M15.6 4.4l-1.4 1.4M5.8 14.2l-1.4 1.4" />
        </g>
      </svg>
    )
  }
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
        <path
          d="M16 12.2A6.6 6.6 0 0 1 7.8 4a6.8 6.8 0 1 0 8.2 8.2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
      <rect x="2.5" y="4" width="15" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function ThemeToggle() {
  const { state, update } = useTracker()
  const theme = state.theme

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      onClick={() => update(setTheme(NEXT[theme]))}
      title={`Theme: ${LABEL[theme]}. Click for ${LABEL[NEXT[theme]]}.`}
      aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[NEXT[theme]]}`}
      className="flex size-9 items-center justify-center rounded-full border border-rule bg-panel-2 text-muted transition-colors hover:border-signal/50 hover:text-signal"
    >
      <Icon theme={theme} />
      <span className="sr-only">
        {THEMES.map((t) => LABEL[t]).join(', ')}
      </span>
    </button>
  )
}
