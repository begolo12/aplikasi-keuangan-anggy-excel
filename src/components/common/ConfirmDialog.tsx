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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 animate-scale border border-slate-200">
        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95 ${
              variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#1E3A5F] hover:bg-[#152a45]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
