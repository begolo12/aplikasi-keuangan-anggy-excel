import React from 'react'

export type BadgeVariant =
  | 'brand'
  | 'success'
  | 'danger'
  | 'warning'
  | 'neutral'
  | 'accent'
  | 'indigo'
  | 'pastel'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    brand: 'bg-[#e7f4ec] text-[#1c543c] border-[#c7e4d2] font-bold',
    success: 'bg-[#e4f6ef] text-[#136149] border-[#bfe8d7] font-bold',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80 font-bold',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80 font-bold',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80 font-semibold',
    accent: 'bg-[#d6f0df] text-[#0f3d2a] border-[#b5e4c4] font-extrabold',
    indigo: 'bg-[#e0f1ee] text-[#164e43] border-[#bee3db] font-bold',
    pastel: 'bg-[#edf7f1] text-[#1c543c] border-[#d2eadb] font-bold',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] border tracking-tight transition ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
