import React, { useState } from 'react'
import { Plus, Trash2, HandCoins } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { RupiahInput, formatRibuan } from '../common/RupiahInput'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { PelunasanModal } from '../modals/PelunasanModal'
import type { State, PiutangRow } from '../../store'
import { outstandingPiutang } from '../../finance'

interface PiutangViewProps {
  store: State
}

export function PiutangView({ store: s }: PiutangViewProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [pelunasanTarget, setPelunasanTarget] = useState<PiutangRow | null>(null)

  const [newPiutang, setNewPiutang] = useState<Omit<PiutangRow, 'id'>>({
    tgl: new Date().toISOString().slice(0, 10),
    nsb: '',
    uraian: '',
    terbit: 0,
    lunas: 0,
    keterangan: '',
  })

  const totalOutstanding = outstandingPiutang(s.piutangs)
  const totalTerbit = s.piutangs.reduce((sum, p) => sum + p.terbit, 0)
  const totalLunas = s.piutangs.reduce((sum, p) => sum + p.lunas, 0)

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPiutang.nsb.trim() || !newPiutang.uraian.trim() || newPiutang.terbit <= 0) return
    s.addPiutang(newPiutang)
    setIsAdding(false)
    setNewPiutang({
      tgl: new Date().toISOString().slice(0, 10),
      nsb: '',
      uraian: '',
      terbit: 0,
      lunas: 0,
      keterangan: '',
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 border-[#c7e4d2] bg-gradient-to-br from-white via-white to-[#f0f9f3]">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Piutang Diterbitkan</p>
          <h3 className="mt-1 text-2xl font-black text-[#0f291e] num">
            Rp {formatRibuan(totalTerbit) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">{s.piutangs.length} catatan total</p>
        </Card>

        <Card className="p-4 sm:p-5 border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/20">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Telah Dilunasi</p>
          <h3 className="mt-1 text-2xl font-black text-emerald-700 num">
            Rp {formatRibuan(totalLunas) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Tercatat masuk kembali ke kas</p>
        </Card>

        <Card className="p-4 sm:p-5 border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/20">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sisa Piutang Tertagih</p>
          <h3 className="mt-1 text-2xl font-black text-amber-800 num">
            Rp {formatRibuan(totalOutstanding) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Saldo hak tagih aktif</p>
        </Card>
      </div>

      <Card className="p-4 sm:p-5 border-[#dbeae0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-[#0f291e]">Buku Piutang Pribadi</h3>
            <p className="text-xs text-slate-500 font-medium">Tracking pinjaman yang diberikan ke pihak lain & status pelunasan</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#1c543c] hover:bg-[#15422f] text-white text-xs font-black shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Terbitkan Piutang</span>
          </button>
        </div>
      </Card>

      {/* Mobile Card List (< 768px) */}
      <div className="block md:hidden space-y-3">
        {s.piutangs.map((p) => {
          const sisa = Math.max(0, p.terbit - p.lunas)
          const isLunas = sisa === 0 && p.terbit > 0
          return (
            <Card key={p.id} className="p-4 border-[#dbeae0] bg-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isLunas ? 'success' : sisa < p.terbit ? 'warning' : 'danger'}>
                      {isLunas ? 'Lunas' : sisa < p.terbit ? 'Sebagian' : 'Belum Lunas'}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-medium">{p.tgl}</span>
                  </div>
                  <h4 className="mt-1 text-sm font-black text-[#0f291e]">{p.nsb}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{p.uraian}</p>
                </div>

                <button
                  onClick={() => setDeleteTargetId(p.id)}
                  className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Hapus Piutang"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#edf4ef] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Nominal Pinjaman</span>
                  <span className="font-bold text-slate-800 num">Rp {formatRibuan(p.terbit)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Sisa Tagihan</span>
                  <span className={`font-black text-sm num ${isLunas ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Rp {formatRibuan(sisa)}
                  </span>
                </div>
              </div>

              {!isLunas && (
                <div className="mt-3 pt-2.5 border-t border-[#edf4ef]">
                  <button
                    onClick={() => setPelunasanTarget(p)}
                    className="w-full py-2 px-3 bg-[#eaf5ee] hover:bg-[#d8eedf] text-[#1c543c] border border-[#c6e3d0] rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <HandCoins size={14} />
                    <span>Catat Pembayaran / Pelunasan</span>
                  </button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <Card className="hidden md:block overflow-hidden border border-[#dbeae0]">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8faf9] border-b border-[#dbeae0] text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Nama Peminjam</th>
                <th className="px-4 py-3">Uraian / Keperluan</th>
                <th className="px-4 py-3 text-right">Nominal Pinjaman</th>
                <th className="px-4 py-3 text-right">Total Dilunasi</th>
                <th className="px-4 py-3 text-right font-black">Sisa Tagihan</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.piutangs.map((p) => {
                const sisa = Math.max(0, p.terbit - p.lunas)
                const isLunas = sisa === 0 && p.terbit > 0
                return (
                  <tr key={p.id} className="hover:bg-[#f4f9f6]/60 transition">
                    <td className="px-4 py-3 font-semibold text-slate-600">{p.tgl}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{p.nsb}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{p.uraian}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800 num">
                      {p.terbit > 0 ? `Rp ${formatRibuan(p.terbit)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 num">
                      {p.lunas > 0 ? `Rp ${formatRibuan(p.lunas)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-rose-700 num bg-rose-50/20">
                      Rp {formatRibuan(sisa)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={isLunas ? 'success' : sisa < p.terbit ? 'warning' : 'danger'}>
                        {isLunas ? 'Lunas' : sisa < p.terbit ? 'Sebagian' : 'Belum Lunas'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isLunas && (
                          <button
                            onClick={() => setPelunasanTarget(p)}
                            className="px-2.5 py-1 bg-[#eaf5ee] hover:bg-[#d8eedf] text-[#1c543c] border border-[#c6e3d0] rounded-xl font-bold text-[11px] transition"
                            title="Catat Pelunasan"
                          >
                            Bayar
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTargetId(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <PelunasanModal
        open={Boolean(pelunasanTarget)}
        piutang={pelunasanTarget}
        onClose={() => setPelunasanTarget(null)}
        onCatatPelunasan={(id, nominal, tanggal) => s.catatPelunasan(id, nominal, tanggal)}
      />

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Hapus Catatan Piutang"
        message="Apakah Anda yakin ingin menghapus data piutang ini?"
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteTargetId) s.delPiutang(deleteTargetId)
          setDeleteTargetId(null)
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#dbeae0] p-5 sm:p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-base sm:text-lg text-[#0f291e] tracking-tight pb-3 border-b border-slate-100">
              Terbitkan Piutang Baru
            </h3>
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newPiutang.tgl}
                    onChange={(e) => setNewPiutang({ ...newPiutang, tgl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nama Peminjam</label>
                  <input
                    type="text"
                    required
                    value={newPiutang.nsb}
                    onChange={(e) => setNewPiutang({ ...newPiutang, nsb: e.target.value })}
                    placeholder="Nama pihak/orang"
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Uraian / Keperluan Pinjaman</label>
                <input
                  type="text"
                  required
                  value={newPiutang.uraian}
                  onChange={(e) => setNewPiutang({ ...newPiutang, uraian: e.target.value })}
                  placeholder="Contoh: Talangan operasional sementara"
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nominal Pinjaman (Rp)</label>
                <RupiahInput
                  required
                  value={newPiutang.terbit}
                  onChange={(v) => setNewPiutang({ ...newPiutang, terbit: v })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-bold num text-[#1c543c] outline-none focus:bg-white focus:border-[#1c543c]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1c543c] hover:bg-[#15422f] text-white text-xs font-black shadow-xs transition"
                >
                  Terbitkan Piutang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
