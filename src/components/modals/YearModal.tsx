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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl md-elevation-3 p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#e0e2e0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <h3 className="font-medium text-base text-[#1f1f1f] tracking-tight">Pengaturan Tahun Buku</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-[#747775] hover:bg-[#f1f3f4] transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#444746] block mb-1">Tahun Finansial</label>
            <input
              type="number"
              min={2020}
              max={2040}
              required
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10) || year)}
              className="w-full px-3.5 py-2 bg-white border border-[#747775] rounded-xl text-sm font-medium text-[#1f1f1f] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition num"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#444746] block mb-1">Saldo Awal Master (1 Jan {selectedYear})</label>
            <RupiahInput
              value={initialBalance}
              onChange={(v) => setInitialBalance(v)}
              placeholder="0"
              className="w-full px-3.5 py-2 bg-white border border-[#747775] rounded-xl text-sm font-medium text-[#1f1f1f] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition num"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#e0e2e0]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe] transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium md-elevation-1 hover:md-elevation-2 transition cursor-pointer"
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
