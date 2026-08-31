import React, { useState } from 'react'
import { X, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { RupiahInput, formatRibuan } from '../common/RupiahInput'

interface TransferModalProps {
  open: boolean
  onClose: () => void
  onTransfer: (to: 'operasional' | 'keluarga', amount: number, tanggal: string, uraian: string) => void
  maxMasterBalance: number
}

export function TransferModal({ open, onClose, onTransfer, maxMasterBalance }: TransferModalProps) {
  const [to, setTo] = useState<'operasional' | 'keluarga'>('operasional')
  const [amount, setAmount] = useState(0)
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [uraian, setUraian] = useState('')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0 || amount > maxMasterBalance) return

    onTransfer(to, amount, tanggal, uraian.trim())
    setAmount(0)
    setUraian('')
    onClose()
  }

  const isOverBalance = amount > maxMasterBalance

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#dbeae0] p-5 sm:p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#edf4ef] pb-3">
          <div className="flex items-center gap-2 text-[#0f291e]">
            <ArrowLeftRight size={18} className="text-[#1c543c]" />
            <h3 className="font-black text-base sm:text-lg tracking-tight">Transfer Dropping Kas</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3.5 bg-[#f0f9f3] border border-[#c7e4d2] rounded-xl text-xs text-[#1c543c] flex items-center justify-between">
            <span className="font-bold text-slate-600">Saldo Master Tersedia:</span>
            <span className="font-black num text-sm text-[#0f291e]">
              Rp {formatRibuan(maxMasterBalance)}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Tujuan Dropping</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTo('operasional')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                  to === 'operasional'
                    ? 'bg-[#e7f4ec] border-[#52b788] text-[#123828] font-black shadow-xs'
                    : 'border-[#dbeae0] bg-[#f8faf9] text-slate-600 hover:bg-[#edf6f0]'
                }`}
              >
                1 — Operasional
              </button>
              <button
                type="button"
                onClick={() => setTo('keluarga')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                  to === 'keluarga'
                    ? 'bg-[#e7f4ec] border-[#52b788] text-[#123828] font-black shadow-xs'
                    : 'border-[#dbeae0] bg-[#f8faf9] text-slate-600 hover:bg-[#edf6f0]'
                }`}
              >
                2 — Keluarga
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Nominal (Rp)</label>
              <RupiahInput
                required
                value={amount}
                onChange={(v) => setAmount(v)}
                placeholder="0"
                className={`w-full px-3 py-2 bg-[#f8faf9] border rounded-xl text-xs sm:text-sm font-bold num outline-none focus:bg-white ${
                  isOverBalance ? 'border-rose-500 text-rose-700 focus:border-rose-600' : 'border-[#dbeae0] text-[#0f291e] focus:border-[#1c543c]'
                }`}
              />
            </div>
          </div>

          {isOverBalance && (
            <p className="text-xs font-bold text-rose-600">
              Nominal transfer melebihi sisa saldo Master!
            </p>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Keterangan (Opsional)</label>
            <input
              type="text"
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder={`DROPPING - ${to.toUpperCase()}`}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
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
              disabled={isOverBalance || amount <= 0}
              className="flex-1 py-2.5 rounded-xl bg-[#1c543c] hover:bg-[#15422f] disabled:opacity-50 text-white text-xs font-black shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Kirim Dropping</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
