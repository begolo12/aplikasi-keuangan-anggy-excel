import React, { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import { RupiahInput } from '../common/RupiahInput'
import { useModalA11y } from '../../lib/useModalA11y'

interface YearModalProps {
  open: boolean
  onClose: () => void
  year: number
  saldoAwal: number
  onSave: (year: number, saldoAwal: number) => void
}

export function YearModal({ open, onClose, year, saldoAwal, onSave }: YearModalProps) {
  const [selectedYear, setSelectedYear] = useState(year)
  const [initialBalance, setInitialBalance] = useState(saldoAwal)

  useEffect(() => {
    if (open) {
      setSelectedYear(year)
      setInitialBalance(saldoAwal)
    }
  }, [open, year, saldoAwal])

  const dialogRef = useModalA11y(open, onClose)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(selectedYear, initialBalance)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="year-title" ref={dialogRef}>
      <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-sm rounded-lg md-elevation-3 p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <h3 id="year-title" className="font-medium text-base text-text tracking-tight">Pengaturan Tahun Buku</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-text-subtle hover:bg-surface-sunken transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Tahun Finansial</label>
            <input
              type="number"
              min={2020}
              max={2040}
              required
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10) || year)}
              className="w-full px-3.5 py-2 bg-surface border border-border-strong rounded-lg text-sm font-medium text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition num"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Saldo Awal Master (1 Jan {selectedYear})</label>
            <RupiahInput
              value={initialBalance}
              onChange={(v) => setInitialBalance(v)}
              placeholder="0"
              className="w-full px-3.5 py-2 bg-surface border border-border-strong rounded-lg text-sm font-medium text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition num"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-xs font-medium text-accent hover:bg-accent-soft transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium md-elevation-1 hover:md-elevation-2 transition cursor-pointer"
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
