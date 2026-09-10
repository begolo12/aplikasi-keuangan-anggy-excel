import React from 'react'

export type BadgeVariant = 'brand' | 'success' | 'danger' | 'warning' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  /* Satu status, satu warna. Tidak ada varian yang tampilannya sama. */
  const variantStyles: Record<BadgeVariant, string> = {
    brand: 'bg-accent-soft text-accent border-accent',
    success: 'bg-positive-soft text-positive border-positive',
    danger: 'bg-negative-soft text-negative border-negative',
    warning: 'bg-warning-soft text-warning border-warning',
    neutral: 'bg-surface-sunken text-text-muted border-border',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium leading-tight tracking-tight whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
