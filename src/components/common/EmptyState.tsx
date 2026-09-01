import React from 'react'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="p-8 sm:p-10 text-center rounded-3xl border border-dashed border-[#c4c7c5] bg-white my-3 animate-in">
      <div className="w-12 h-12 rounded-full bg-[#f1f3f4] flex items-center justify-center mx-auto text-[#444746]">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-medium text-[#1f1f1f]">{title}</h3>
      <p className="mt-1.5 text-xs text-[#747775] max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-medium md-elevation-1 transition cursor-pointer">
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
