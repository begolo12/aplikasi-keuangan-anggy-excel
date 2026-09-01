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
  // Material 3 tonal & status chips style
  const variantStyles: Record<BadgeVariant, string> = {
    brand: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] font-medium',
    success: 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-medium',
    danger: 'bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] font-medium',
    warning: 'bg-[#fef7e0] text-[#b06000] border border-[#feefc3] font-medium',
    neutral: 'bg-[#f1f3f4] text-[#444746] border border-[#e0e2e0] font-medium',
    accent: 'bg-[#f3e8fd] text-[#9334e6] border border-[#e9d2fd] font-medium',
    indigo: 'bg-[#e8eaed] text-[#3c4043] border border-[#dadce0] font-medium',
    pastel: 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-medium',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] leading-tight tracking-tight ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
