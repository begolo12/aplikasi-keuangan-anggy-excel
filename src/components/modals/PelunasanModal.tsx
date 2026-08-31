import React, { useState } from 'react'
import { X, CheckCircle2, HandCoins } from 'lucide-react'
import { RupiahInput, formatRibuan } from '../common/RupiahInput'
import type { PiutangRow } from '../../store'

interface PelunasanModalProps {
  open: boolean
  onClose: () => void
  piutang: PiutangRow | null
  onCatatPelunasan: (id: string, nominal: number, tanggal: string) => void
}

export function PelunasanModal({ open, onClose, piutang, onCatatPelunasan }: PelunasanModalProps) {
  const [nominal, setNominal] = useState(0)
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))

  if (!open || !piutang) return null

  const sisa = Math.max(0, piutang.terbit - piutang.lunas)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nominal <= 0 || nominal > sisa) return
    onCatatPelunasan(piutang.id, nominal, tanggal)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#dbeae0] p-5 sm:p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#edf4ef] pb-3">
          <div className="flex items-center gap-2 text-[#0f291e]">
            <HandCoins size={18} className="text-[#1c543c]" />
            <h3 className="font-black text-base sm:text-lg tracking-tight">Catat Pelunasan Piutang</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3.5 bg-[#f8faf9] border border-[#dbeae0] rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Peminjam:</span>
              <span className="font-black text-[#0f291e]">{piutang.nsb}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Keperluan:</span>
              <span className="font-medium text-slate-700 truncate max-w-[200px]">{piutang.uraian}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-[#edf4ef]">
              <span className="text-slate-500 font-bold">Sisa Piutang:</span>
              <span className="font-black text-rose-700 num text-sm">
                Rp {formatRibuan(sisa)}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Pelunasan</label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600">Nominal Diterima (Rp)</label>
              <button
                type="button"
                onClick={() => setNominal(sisa)}
                className="text-[11px] font-black text-[#1c543c] hover:underline"
              >
                Lunaskan Semua
              </button>
            </div>
            <RupiahInput
              required
              value={nominal}
              onChange={(v) => setNominal(v)}
              placeholder="0"
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs sm:text-sm font-bold num text-[#0f291e] outline-none focus:bg-white focus:border-[#1c543c]"
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
              disabled={nominal <= 0 || nominal > sisa}
              className="flex-1 py-2.5 rounded-xl bg-[#1c543c] hover:bg-[#15422f] disabled:opacity-50 text-white text-xs font-black shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              Simpan Pelunasan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
