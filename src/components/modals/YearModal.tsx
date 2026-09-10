import React, { useState, useEffect } from 'react'
import { RupiahInput } from '../common/RupiahInput'
import { kasLabel } from '../common/format'
import { Modal } from '../common/Modal'

interface YearModalProps {
  open: boolean
  onClose: () => void
  year: number
  saldoAwal: number
  ledgerLabels?: Partial<Record<'master' | 'operasional' | 'keluarga', string>>
  onSave: (year: number, saldoAwal: number) => void
}

export function YearModal({ open, onClose, year, saldoAwal, ledgerLabels, onSave }: YearModalProps) {
  const [selectedYear, setSelectedYear] = useState(year)
  const [initialBalance, setInitialBalance] = useState(saldoAwal)

  useEffect(() => {
    if (open) {
      setSelectedYear(year)
      setInitialBalance(saldoAwal)
    }
  }, [open, year, saldoAwal])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(selectedYear, initialBalance)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm" title="Pengaturan Tahun Buku">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">Tahun Finansial</label>
          <input
            type="number"
            min={2020}
            max={2040}
            required
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10) || year)}
            className="w-full px-3.5 py-2 bg-surface border border-border-strong rounded-lg text-sm font-medium text-text outline-none focus:border-accent transition num"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">Saldo Awal {kasLabel('master', ledgerLabels)} (1 Jan {selectedYear})</label>
          <RupiahInput
            value={initialBalance}
            onChange={(v) => setInitialBalance(v)}
            placeholder="0"
            className="w-full px-3.5 py-2 bg-surface border border-border-strong rounded-lg text-sm font-medium text-text outline-none focus:border-accent transition num"
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
            className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-on-fill text-xs font-medium transition cursor-pointer"
          >
            Terapkan
          </button>
        </div>
      </form>
    </Modal>
  )
}
