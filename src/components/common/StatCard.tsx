import React from 'react'
import { Card } from './Card'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'income' | 'expense' | 'brand' | 'warning'
  trend?: { label: string; isPositive?: boolean }
}

export function StatCard({ title, value, subtitle, icon, variant = 'default', trend }: StatCardProps) {
  const styles = {
    default: { value: 'text-text', icon: 'bg-surface-sunken text-text-muted' },
    income: { value: 'text-positive', icon: 'bg-positive-soft text-positive' },
    expense: { value: 'text-negative', icon: 'bg-negative-soft text-negative' },
    brand: { value: 'text-accent', icon: 'bg-accent-soft text-accent' },
    warning: { value: 'text-warning', icon: 'bg-warning-soft text-warning' },
  }
  const s = styles[variant]

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wider text-text-subtle uppercase truncate">{title}</p>
          <p className={`mt-1.5 text-[22px] font-bold tracking-tight num truncate leading-tight ${s.value}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-text-subtle truncate">{subtitle}</p>}
        </div>
        {icon && <div className={`p-2.5 rounded-lg shrink-0 flex items-center justify-center ${s.icon}`}>{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-border flex items-center gap-1.5 text-xs">
          <span className={trend.isPositive ? 'text-positive font-medium' : 'text-text-subtle'}>{trend.label}</span>
        </div>
      )}
    </Card>
  )
}
