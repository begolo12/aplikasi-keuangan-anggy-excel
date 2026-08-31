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
    <div className="p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 my-4 animate-in">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto text-slate-500">
        {icon}
      </div>
      <h3 className="mt-3.5 font-bold text-slate-800 text-base">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
        >
          <Plus size={14} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
