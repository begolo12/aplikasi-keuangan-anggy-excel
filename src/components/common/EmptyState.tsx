import React from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  /** `false` untuk keadaan kosong di dalam kartu, yang border-nya sudah ada. */
  dashed?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  dashed = true,
}: EmptyStateProps) {
  return (
    <div
      className={`p-8 sm:p-10 text-center rounded-lg bg-surface my-3 animate-in ${
        dashed ? 'border border-dashed border-border-strong' : 'border border-border'
      }`}
    >
      <div className="w-11 h-11 rounded-full bg-surface-sunken flex items-center justify-center mx-auto text-text-muted">
        {icon}
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-text">{title}</h3>
      <p className="mt-1.5 text-xs text-text-subtle max-w-sm mx-auto leading-relaxed">{description}</p>
      {((actionLabel && onAction) || (secondaryLabel && onSecondary)) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondary && (
            <Button variant="outline" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
