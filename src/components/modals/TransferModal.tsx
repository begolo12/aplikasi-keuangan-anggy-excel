import React, { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan, kasLabel } from '../common/format'
import { todayLocal } from '../../finance'
import { Modal } from '../common/Modal'

interface TransferModalProps {
  open: boolean
  onClose: () => void
  onTransfer: (to: 'operasional' | 'keluarga', amount: number, tanggal: string, uraian: string) => void
  maxMasterBalance: number
  ledgerLabels?: Partial<Record<'master' | 'operasional' | 'keluarga', string>>
}

export function TransferModal({ open, onClose, onTransfer, maxMasterBalance, ledgerLabels }: TransferModalProps) {
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
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Pindah Saldo Antar Kas"
      description={`Pindahkan saldo dari ${kasLabel('master', ledgerLabels)} ke ${kasLabel('operasional', ledgerLabels)} atau ${kasLabel('keluarga', ledgerLabels)} tanpa mengubah total kekayaan.`}
    >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 bg-surface-sunken border border-border rounded-lg flex items-center justify-between">
            <span className="text-xs text-text-subtle">Sisa di {kasLabel('master', ledgerLabels)}:</span>
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
                    ? 'bg-accent text-on-fill'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {kasLabel('operasional', ledgerLabels)}
              </button>
              <button
                type="button"
                onClick={() => setTo('keluarga')}
                className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  to === 'keluarga'
                    ? 'bg-accent text-on-fill'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {kasLabel('keluarga', ledgerLabels)}
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

          {isOverBalance && <p className="text-xs text-negative">Jumlah melebihi saldo di {kasLabel('master', ledgerLabels)}</p>}

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
              className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-fill text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Pindahkan <ArrowRight size={14} />
            </button>
          </div>
        </form>
    </Modal>
  )
}
