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
    default: { value: 'text-[#1f1f1f]', icon: 'bg-[#f1f3f4] text-[#444746]' },
    income: { value: 'text-[#137333]', icon: 'bg-[#e6f4ea] text-[#137333]' },
    expense: { value: 'text-[#c5221f]', icon: 'bg-[#fce8e6] text-[#c5221f]' },
    brand: { value: 'text-[#1a73e8]', icon: 'bg-[#e8f0fe] text-[#1a73e8]' },
    warning: { value: 'text-[#b06000]', icon: 'bg-[#fef7e0] text-[#b06000]' },
  }
  const s = styles[variant]

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wider text-[#747775] uppercase truncate">{title}</p>
          <p className={`mt-1.5 text-[22px] font-bold tracking-tight num truncate leading-tight ${s.value}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-[#747775] truncate">{subtitle}</p>}
        </div>
        {icon && <div className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center ${s.icon}`}>{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-[#f1f3f4] flex items-center gap-1.5 text-xs">
          <span className={trend.isPositive ? 'text-[#137333] font-medium' : 'text-[#747775]'}>{trend.label}</span>
        </div>
      )}
    </Card>
  )
}
