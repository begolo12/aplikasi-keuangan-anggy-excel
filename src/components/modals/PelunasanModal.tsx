import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan } from '../common/format'
import { Modal } from '../common/Modal'
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
    <Modal open={open} onClose={onClose} size="md" title="Catat Pelunasan Piutang">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-surface border border-border rounded-lg space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted font-semibold">Peminjam:</span>
            <span className="font-semibold text-text">{piutang.nsb}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted font-semibold">Keperluan:</span>
            <span className="font-medium text-text-muted truncate max-w-[200px]">{piutang.uraian}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-border">
            <span className="text-text-muted font-semibold">Sisa Piutang:</span>
            <span className="font-semibold text-negative num text-sm">
              Rp {formatRibuan(sisa)}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-muted block mb-1">Tanggal Pelunasan</label>
          <input
            type="date"
            required
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs sm:text-sm font-medium outline-none focus:border-accent transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-text-muted">Nominal Diterima (Rp)</label>
            <button
              type="button"
              onClick={() => setNominal(sisa)}
              className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
            >
              Lunaskan Semua
            </button>
          </div>
          <RupiahInput
            required
            value={nominal}
            onChange={(v) => setNominal(v)}
            placeholder="0"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs sm:text-sm font-medium num text-text outline-none focus:border-accent transition"
          />
        </div>

        <div className="pt-3 flex gap-2 sm:gap-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border-strong bg-surface text-text-muted hover:text-text text-xs font-medium transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={nominal <= 0 || nominal > sisa}
            className="flex-1 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-fill text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            Simpan Pelunasan
          </button>
        </div>
      </form>
    </Modal>
  )
}
