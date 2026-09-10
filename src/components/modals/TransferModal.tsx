import React, { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan } from '../common/format'
import { todayLocal } from '../../finance'
import { useModalA11y } from '../../lib/useModalA11y'

interface TransferModalProps {
  open: boolean
  onClose: () => void
  onTransfer: (to: 'operasional' | 'keluarga', amount: number, tanggal: string, uraian: string) => void
  maxMasterBalance: number
}

export function TransferModal({ open, onClose, onTransfer, maxMasterBalance }: TransferModalProps) {
  const [to, setTo] = useState<'operasional' | 'keluarga'>('operasional')
  const [amount, setAmount] = useState(0)
  const [tanggal, setTanggal] = useState(() => todayLocal())
  const [uraian, setUraian] = useState('')

  useEffect(() => {
    if (open) {
      setTanggal(todayLocal())
      setAmount(0)
      setUraian('')
    }
  }, [open])

  const dialogRef = useModalA11y(open, onClose)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="transfer-title" ref={dialogRef}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl md-elevation-3 p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#e0e2e0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <ArrowLeftRight size={16} />
            </div>
            <h3 id="transfer-title" className="font-medium text-base text-[#1f1f1f] tracking-tight">Pindah Saldo Antar Kas</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#747775] transition"><X size={18} /></button>
        </div>
        <p className="mt-3 text-xs text-[#747775]">Pindahkan saldo dari Kas Utama ke Kas Usaha atau Kas Keluarga tanpa mengubah total kekayaan.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3.5 bg-[#f8f9fa] border border-[#e0e2e0] rounded-2xl flex items-center justify-between">
            <span className="text-xs text-[#747775]">Sisa di Kas Utama:</span>
            <span className="font-semibold num text-sm text-[#1a73e8]">Rp {formatRibuan(maxMasterBalance)}</span>
          </div>

          <div>
            <label className="text-xs font-medium text-[#444746] block mb-1.5">Pindahkan ke</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f1f3f4] rounded-full">
              <button
                type="button"
                onClick={() => setTo('operasional')}
                className={`py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                  to === 'operasional'
                    ? 'bg-[#1a73e8] text-white shadow-xs'
                    : 'text-[#444746] hover:text-[#1f1f1f]'
                }`}
              >
                Kas Usaha
              </button>
              <button
                type="button"
                onClick={() => setTo('keluarga')}
                className={`py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                  to === 'keluarga'
                    ? 'bg-[#1a73e8] text-white shadow-xs'
                    : 'text-[#444746] hover:text-[#1f1f1f]'
                }`}
              >
                Kas Keluarga
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#444746] block mb-1">Tanggal Pindah</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#747775] rounded-xl text-xs font-normal outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#444746] block mb-1">Jumlah (Rp)</label>
              <RupiahInput
                required
                value={amount}
                onChange={(v) => setAmount(v)}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium num outline-none transition ${
                  isOverBalance ? 'border-[#c5221f] text-[#c5221f]' : 'border-[#747775] text-[#1f1f1f] focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20'
                }`}
              />
            </div>
          </div>

          {isOverBalance && <p className="text-xs text-[#c5221f]">Jumlah melebihi saldo di Kas Utama</p>}

          <div>
            <label className="text-xs font-medium text-[#444746] block mb-1">Catatan (opsional)</label>
            <input
              type="text"
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Mis. Untuk operasional bulan ini"
              className="w-full px-3.5 py-2.5 bg-white border border-[#747775] rounded-xl text-xs font-normal outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition"
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
              disabled={isOverBalance || amount <= 0}
              className="px-6 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white text-xs font-medium md-elevation-1 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Pindahkan <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
