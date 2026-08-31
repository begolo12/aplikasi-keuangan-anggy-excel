import React, { useState, useEffect } from 'react'
import { X, PlusCircle } from 'lucide-react'
import { RupiahInput } from '../common/RupiahInput'
import type { Ledger, Tx } from '../../store'

interface QuickTxModalProps {
  open: boolean
  onClose: () => void
  defaultLedger?: Ledger
  onAddTx: (tx: Omit<Tx, 'id'>) => void
}

export function QuickTxModal({ open, onClose, defaultLedger = 'master', onAddTx }: QuickTxModalProps) {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [ledger, setLedger] = useState<Ledger>(defaultLedger)
  const [jenis, setJenis] = useState<'masuk' | 'keluar'>('keluar')
  const [nsb, setNsb] = useState('ANGGY')
  const [pos, setPos] = useState('')
  const [uraian, setUraian] = useState('')
  const [nominal, setNominal] = useState(0)

  useEffect(() => {
    if (open) {
      setLedger(defaultLedger)
      setTanggal(new Date().toISOString().slice(0, 10))
    }
  }, [open, defaultLedger])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#dbeae0] p-5 sm:p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#edf4ef]">
          <div className="flex items-center gap-2">
            <PlusCircle className="text-[#1c543c]" size={20} />
            <h3 className="font-black text-base sm:text-lg text-[#0f291e] tracking-tight">Catat Mutasi Kas Baru</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Buku Kas (Ledger)</label>
              <select
                value={ledger}
                onChange={(e) => setLedger(e.target.value as Ledger)}
                className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
              >
                <option value="master">0 — Master (Kas Utama)</option>
                <option value="operasional">1 — Operasional (RAB Anggy)</option>
                <option value="keluarga">2 — Keluarga (RAB Keluarga)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Mutasi</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setJenis('keluar')}
                className={`py-2.5 rounded-xl text-xs font-bold transition active:scale-98 ${
                  jenis === 'keluar'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[#f8faf9] text-slate-600 hover:bg-slate-100 border border-[#dbeae0]'
                }`}
              >
                Pengeluaran (-)
              </button>
              <button
                type="button"
                onClick={() => setJenis('masuk')}
                className={`py-2.5 rounded-xl text-xs font-bold transition active:scale-98 ${
                  jenis === 'masuk'
                    ? 'bg-[#1c543c] text-white shadow-xs'
                    : 'bg-[#f8faf9] text-slate-600 hover:bg-slate-100 border border-[#dbeae0]'
                }`}
              >
                Pemasukan (+)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">NSB (Nama Sumber / Orang)</label>
              <input
                type="text"
                value={nsb}
                onChange={(e) => setNsb(e.target.value)}
                placeholder="ANGGY / IBU / DLL"
                className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Pos / Kategori</label>
              <input
                type="text"
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                placeholder="RUTIN / ASSET / DLL"
                className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Uraian Transaksi</label>
            <input
              type="text"
              required
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Contoh: Belanja bahan dapur / Bensin"
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nominal (Rp)</label>
            <RupiahInput
              required
              value={nominal}
              onChange={setNominal}
              placeholder="0"
              className="w-full px-3 py-2.5 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-sm font-bold num text-[#0f291e] outline-none focus:bg-white focus:border-[#1c543c]"
            />
          </div>

          <div className="pt-3 flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#dbeae0] bg-[#f8faf9] hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#1c543c] hover:bg-[#15422f] text-white text-xs font-black shadow-xs transition active:scale-95"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
