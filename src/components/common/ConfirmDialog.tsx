import { useRef, useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    cancelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md rounded-3xl md-elevation-3 p-6 z-10 animate-scale">
        <h3 className="font-medium text-lg text-[#1f1f1f] tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-[#444746] mt-2 leading-relaxed">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white transition cursor-pointer ${
              variant === 'danger' ? 'bg-[#c5221f] hover:bg-[#a50e0e]' : 'bg-[#1a73e8] hover:bg-[#1557b0]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
