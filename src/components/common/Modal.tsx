import React from 'react'
import { X } from 'lucide-react'
import { useModalA11y } from '../../lib/useModalA11y'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: ModalSize
  footer?: React.ReactNode
  children: React.ReactNode
}

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

/**
 * Satu scaffold dialog: overlay, panel, focus trap, Escape, restore fokus.
 * Menggantikan 10 scaffold manual yang punya 3 tingkat kepekatan overlay dan
 * 2 nilai radius berbeda, dan menutup 4 dialog yang sebelumnya tanpa trap.
 */
export function Modal({ open, onClose, title, description, size = 'lg', footer, children }: ModalProps) {
  const ref = useModalA11y(open, onClose)
  const titleId = React.useId()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="fixed inset-0" style={{ backgroundColor: 'var(--c-overlay)' }} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className={`relative w-full ${sizes[size]} bg-surface border border-border sm:rounded-lg rounded-t-lg max-h-[92vh] flex flex-col z-10 animate-scale md-elevation-3`}
      >
        <div className="flex items-start justify-between gap-4 px-4 sm:px-5 py-3.5 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="text-sm font-semibold text-text truncate">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[11px] text-text-subtle">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="shrink-0 -mr-1 p-1.5 rounded-md text-text-subtle hover:bg-surface-sunken hover:text-text transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 sm:px-5 py-4 overflow-y-auto scrollbar-thin flex-1">{children}</div>

        {footer && <div className="px-4 sm:px-5 py-3 border-t border-border flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
