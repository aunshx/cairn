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
      className="m-auto w-[min(34rem,calc(100vw-2rem))] border border-rule bg-panel p-0 text-ink backdrop:bg-ground/80"
    >
      <header className="flex items-center justify-between gap-4 border-b border-rule px-4 py-3">
        <h2 className="micro">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="font-mono text-[11px] text-muted hover:text-ink"
        >
          ESC
        </button>
      </header>
      <div className="p-4">{children}</div>
    </dialog>
  )
}
