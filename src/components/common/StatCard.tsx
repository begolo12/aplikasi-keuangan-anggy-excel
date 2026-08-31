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
  const borderVariants = {
    default: 'border-[#dbeae0] bg-white',
    income: 'border-[#c7e8d5] bg-gradient-to-br from-white via-white to-[#f0f9f3]',
    expense: 'border-rose-200 bg-gradient-to-br from-white via-white to-rose-50/40',
    brand: 'border-[#c2e4ce] bg-gradient-to-br from-white via-white to-[#eaf5ee]',
    warning: 'border-amber-200 bg-gradient-to-br from-white via-white to-amber-50/40',
  }

  const textVariants = {
    default: 'text-[#0f291e]',
    income: 'text-[#136149]',
    expense: 'text-rose-700',
    brand: 'text-[#1c543c]',
    warning: 'text-amber-800',
  }

  return (
    <Card className={`p-4 sm:p-5 card-hover transition-all duration-200 ${borderVariants[variant]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <h3 className={`mt-1.5 text-xl sm:text-2xl font-black tracking-tight num truncate ${textVariants[variant]}`}>
            {value}
          </h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium truncate">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-[#eaf4ed] text-[#1c543c] shrink-0 border border-[#d2e8d9]">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-[#edf4ef] flex items-center gap-1.5 text-xs">
          <span className={`font-bold ${trend.isPositive ? 'text-emerald-700' : 'text-slate-500'}`}>
            {trend.label}
          </span>
        </div>
      )}
    </Card>
  )
}
