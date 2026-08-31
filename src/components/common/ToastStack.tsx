import { CheckCircle2, X, AlertTriangle, Info } from 'lucide-react'

export type ToastItem = { id: string; message: string; kind: 'success' | 'error' | 'info' | 'warning' }

export function ToastStack({ toasts, remove }: { toasts: ToastItem[]; remove: (id: string) => void }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto min-w-[280px] max-w-[420px] px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-start gap-3 toast-enter ${
            t.kind === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : t.kind === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : t.kind === 'warning'
              ? 'bg-amber-600 text-white border-amber-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="mt-0.5 shrink-0">
            {t.kind === 'success' ? (
              <CheckCircle2 size={16} />
            ) : t.kind === 'error' ? (
              <X size={16} />
            ) : t.kind === 'warning' ? (
              <AlertTriangle size={16} />
            ) : (
              <Info size={16} />
            )}
          </span>
          <span className="flex-1 leading-snug text-xs sm:text-sm">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="shrink-0 p-1 -mr-1 rounded-lg hover:bg-white/20 text-white/80 transition"
            aria-label="Tutup"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
