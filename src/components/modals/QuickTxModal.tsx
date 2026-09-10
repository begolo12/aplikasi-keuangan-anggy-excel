import React, { useState, useMemo, useEffect } from 'react'
import { X, PlusCircle } from 'lucide-react'
import { RupiahInput } from '../common/RupiahInput'
import { Autocomplete } from '../common/Autocomplete'
import { todayLocal } from '../../finance'
import { useModalA11y } from '../../lib/useModalA11y'
import { useStore, type Ledger, type Tx } from '../../store'

interface QuickTxModalProps {
  open: boolean
  onClose: () => void
  defaultLedger?: Ledger
  onAddTx: (tx: Omit<Tx, 'id'>) => void
}

export function QuickTxModal({ open, onClose, defaultLedger = 'master', onAddTx }: QuickTxModalProps) {
  const [tanggal, setTanggal] = useState(() => todayLocal())
  const [ledger, setLedger] = useState<Ledger>(defaultLedger)
  const [jenis, setJenis] = useState<'masuk' | 'keluar'>('keluar')
  const [nsb, setNsb] = useState('ANGGY')
  const [pos, setPos] = useState('')
  const [uraian, setUraian] = useState('')
  const [nominal, setNominal] = useState(0)
  const store = useStore()

  const nsbSuggestions = useMemo(() => {
    const fromTx = store.txs.map((t) => t.nsb)
    const fromPiutang = store.piutangs.map((p) => p.nsb)
    const fromAsset = store.assets.map((a) => a.atasNama)
    const fromCustom = store.customNsbList || []
    return Array.from(new Set([...fromCustom, ...fromTx, ...fromPiutang, ...fromAsset])).filter(Boolean)
  }, [store.txs, store.piutangs, store.assets, store.customNsbList])

  const posSuggestions = useMemo(() => {
    const fromTx = store.txs.map((t) => t.pos).filter((p) => p !== 'PINDAH SALDO' && p !== 'DROPPING' && p !== 'PINDAH')
    const fromCustom = (store.customPosList || []).filter((p) => p !== 'PINDAH SALDO' && p !== 'DROPPING' && p !== 'PINDAH')
    return Array.from(new Set([...fromCustom, ...fromTx, 'RUTIN', 'GAJI', 'BELANJA', 'ASET', 'PIUTANG', 'PAJAK', 'SERVIS'])).filter(Boolean)
  }, [store.txs, store.customPosList])

  useEffect(() => {
    if (open) {
      setLedger(defaultLedger)
      setTanggal(todayLocal())
      setJenis('keluar')
      setNsb('ANGGY')
      setPos('')
      setUraian('')
      setNominal(0)
    }
  }, [open, defaultLedger])

  const dialogRef = useModalA11y(open, onClose)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uraian.trim() || nominal <= 0) return

    onAddTx({
      tanggal,
      nsb: nsb.trim() || 'ANGGY',
      pos: pos.trim() || 'RUTIN',
      uraian: uraian.trim(),
      penerimaan: jenis === 'masuk' ? nominal : 0,
      pengeluaran: jenis === 'keluar' ? nominal : 0,
      ledger,
    })

    setUraian('')
    setNominal(0)
    setPos('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="quicktx-title" ref={dialogRef}>
      <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-lg rounded-lg md-elevation-3 p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
              <PlusCircle size={18} />
            </div>
            <h3 id="quicktx-title" className="font-medium text-base text-text tracking-tight">Tambah Transaksi Baru</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-sunken text-text-subtle transition">
            <X size={18} />
          </button>
        </div>
        <p className="mt-3 text-xs text-text-subtle">Pilih dompet kas tujuan, lalu isi pihak terkait dan keperluannya.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Simpan di</label>
              <select
                value={ledger}
                onChange={(e) => setLedger(e.target.value as Ledger)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              >
                <option value="master">{store.ledgerLabels?.master || 'Kas Utama'} — uang masuk pertama</option>
                <option value="operasional">{store.ledgerLabels?.operasional || 'Kas Usaha'} — untuk operasional</option>
                <option value="keluarga">{store.ledgerLabels?.keluarga || 'Kas Keluarga'} — untuk rumah tangga</option>
              </select>
              <p className="mt-1 text-[11px] text-text-subtle">Kas Utama = pusat, bisa dipindah ke Usaha/Keluarga</p>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface border border-border-strong rounded-lg text-xs font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-sunken rounded-lg">
              <button
                type="button"
                onClick={() => setJenis('keluar')}
                className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  jenis === 'keluar'
                    ? 'bg-negative text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Pengeluaran (-)
              </button>
              <button
                type="button"
                onClick={() => setJenis('masuk')}
                className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  jenis === 'masuk'
                    ? 'bg-positive text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Pemasukan (+)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Siapa yang terlibat? <span className="text-negative">*</span></label>
              <Autocomplete value={nsb} onChange={setNsb} suggestions={nsbSuggestions} placeholder="Ketik nama orang — mis. ANGGY" />
              <p className="mt-1 text-[11px] text-text-subtle">Nama orang yang mengeluarkan/menerima</p>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Kategori</label>
              <Autocomplete value={pos} onChange={setPos} suggestions={posSuggestions} placeholder="Mis. GAJI, BELANJA, RUTIN" allowCreate />
              <p className="mt-1 text-[11px] text-text-subtle">Kelompok pos pengeluaran/pemasukan</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Keterangan</label>
            <input
              type="text"
              required
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Contoh: Belanja bahan dapur / Bensin"
              className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Jumlah Uang (Rp)</label>
            <RupiahInput
              required
              value={nominal}
              onChange={setNominal}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-sm font-medium num text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
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
              className="px-6 py-2.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white md-elevation-1 hover:md-elevation-2 transition cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
