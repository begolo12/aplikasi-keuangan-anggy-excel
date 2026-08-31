import React, { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { RupiahInput } from '../common/RupiahInput'

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

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(selectedYear, initialBalance)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl border border-[#dbeae0] p-5 sm:p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#edf4ef] pb-3">
          <div className="flex items-center gap-2 text-[#0f291e]">
            <Calendar size={18} className="text-[#1c543c]" />
            <h3 className="font-black text-base tracking-tight">Pengaturan Periode & Saldo</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Tahun Finansial</label>
            <input
              type="number"
              min={2020}
              max={2040}
              required
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10) || year)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-sm font-bold text-[#0f291e] outline-none focus:bg-white focus:border-[#1c543c] num"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Saldo Awal Master (1 Jan {selectedYear})</label>
            <RupiahInput
              value={initialBalance}
              onChange={(v) => setInitialBalance(v)}
              placeholder="0"
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-sm font-bold text-[#0f291e] outline-none focus:bg-white focus:border-[#1c543c] num"
            />
          </div>

          <div className="pt-3 flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#dbeae0] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#1c543c] hover:bg-[#15422f] text-white text-xs font-black shadow-xs transition active:scale-95"
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
