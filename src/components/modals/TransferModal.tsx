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
      <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md rounded-lg md-elevation-3 p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
              <ArrowLeftRight size={16} />
            </div>
            <h3 id="transfer-title" className="font-medium text-base text-text tracking-tight">Pindah Saldo Antar Kas</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-sunken text-text-subtle transition"><X size={18} /></button>
        </div>
        <p className="mt-3 text-xs text-text-subtle">Pindahkan saldo dari Kas Utama ke Kas Usaha atau Kas Keluarga tanpa mengubah total kekayaan.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3.5 bg-surface-sunken border border-border rounded-lg flex items-center justify-between">
            <span className="text-xs text-text-subtle">Sisa di Kas Utama:</span>
            <span className="font-semibold num text-sm text-accent">Rp {formatRibuan(maxMasterBalance)}</span>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Pindahkan ke</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-sunken rounded-lg">
              <button
                type="button"
                onClick={() => setTo('operasional')}
                className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  to === 'operasional'
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Kas Usaha
              </button>
              <button
                type="button"
                onClick={() => setTo('keluarga')}
                className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  to === 'keluarga'
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Kas Keluarga
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Tanggal Pindah</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface border border-border-strong rounded-lg text-xs font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Jumlah (Rp)</label>
              <RupiahInput
                required
                value={amount}
                onChange={(v) => setAmount(v)}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 bg-surface border rounded-lg text-sm font-medium num outline-none transition ${
                  isOverBalance ? 'border-negative text-negative' : 'border-border-strong text-text focus:border-accent focus:ring-2 focus:ring-accent/20'
                }`}
              />
            </div>
          </div>

          {isOverBalance && <p className="text-xs text-negative">Jumlah melebihi saldo di Kas Utama</p>}

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Catatan (opsional)</label>
            <input
              type="text"
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Mis. Untuk operasional bulan ini"
              className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
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
              disabled={isOverBalance || amount <= 0}
              className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-medium md-elevation-1 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Pindahkan <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
