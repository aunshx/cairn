import { useEffect, useRef, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="surface m-auto w-[min(36rem,calc(100vw-2rem))] p-0 text-ink backdrop:bg-ground/70 backdrop:backdrop-blur-sm"
    >
      <header className="flex items-center justify-between gap-4 border-b border-rule/70 px-5 py-4">
        <h2 className="micro text-ink/90">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:bg-panel-2 hover:text-ink"
        >
          ESC
        </button>
      </header>
      <div className="p-5">{children}</div>
    </dialog>
  )
}
