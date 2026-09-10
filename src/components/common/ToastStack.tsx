import { CheckCircle2, X, AlertTriangle, Info } from 'lucide-react'

export type ToastItem = { id: string; message: string; kind: 'success' | 'error' | 'info' | 'warning' }

export function ToastStack({ toasts, remove }: { toasts: ToastItem[]; remove: (id: string) => void }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto min-w-[280px] max-w-[420px] px-4 py-3 rounded-lg md-elevation-3 bg-text text-on-fill text-xs font-normal flex items-center gap-3 animate-in"
          role="status"
          aria-live="polite"
        >
          <span className="shrink-0 text-on-fill">
            {t.kind === 'success' ? (
              <CheckCircle2 size={16} className="text-positive" />
            ) : t.kind === 'error' ? (
              <X size={16} className="text-negative" />
            ) : t.kind === 'warning' ? (
              <AlertTriangle size={16} className="text-warning" />
            ) : (
              <Info size={16} className="text-accent" />
            )}
          </span>
          <span className="flex-1 leading-normal">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="shrink-0 px-2 py-1 text-xs font-medium text-accent hover:bg-surface/10 rounded-lg transition cursor-pointer"
            aria-label="Tutup"
          >
            Tutup
          </button>
        </div>
      ))}
    </div>
  )
}
