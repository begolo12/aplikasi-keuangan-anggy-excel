import { useState } from 'react'
import { Plus, Trash2, HandCoins, CheckCircle2, Clock } from 'lucide-react'
import { useMemo } from 'react'
import { Card } from '../common/Card'
import { StatCard } from '../common/StatCard'
import { Badge } from '../common/Badge'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan } from '../common/format'
import { Autocomplete } from '../common/Autocomplete'
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

  const nsbSuggestions = useMemo(() => {
    const fromPiutang = s.piutangs.map((p) => p.nsb)
    const fromTx = s.txs.map((t) => t.nsb)
    const fromAsset = s.assets.map((a) => a.atasNama)
    const fromCustom = s.customNsbList || []
    return Array.from(new Set([...fromCustom, ...fromPiutang, ...fromTx, ...fromAsset])).filter(Boolean)
  }, [s.piutangs, s.txs, s.assets, s.customNsbList])

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedNsb = newPiutang.nsb.trim().toUpperCase()
    if (!normalizedNsb || !newPiutang.uraian.trim() || newPiutang.terbit <= 0) return
    s.addPiutang({ ...newPiutang, nsb: normalizedNsb })
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
        <StatCard title="Total Dipinjamkan" value={`Rp ${formatRibuan(totalTerbit) || '0'}`} subtitle={`${s.piutangs.length} pinjaman`} variant="brand" icon={<HandCoins size={16} />} />
        <StatCard title="Sudah Kembali" value={`Rp ${formatRibuan(totalLunas) || '0'}`} subtitle="Uang yang sudah dibayar kembali" variant="income" icon={<CheckCircle2 size={16} />} />
        <StatCard title="Sisa Belum Kembali" value={`Rp ${formatRibuan(totalOutstanding) || '0'}`} subtitle="Masih dipinjam orang lain" variant="warning" icon={<Clock size={16} />} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Piutang — Uang Dipinjamkan</h3>
            <p className="text-xs font-medium text-slate-500">Catat siapa yang pinjam, berapa, dan sudah dibayar berapa</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="self-start sm:self-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} /> Catat Pinjaman Baru
          </button>
        </div>
      </Card>

      {/* Mobile Card List (< 768px) */}
      <div className="block md:hidden space-y-3">
        {s.piutangs.map((p) => {
          const sisa = Math.max(0, p.terbit - p.lunas)
          const isLunas = sisa === 0 && p.terbit > 0
          return (
            <Card key={p.id} className="p-4 border-slate-200/80 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isLunas ? 'success' : sisa < p.terbit ? 'warning' : 'danger'}>
                      {isLunas ? 'Lunas' : sisa < p.terbit ? 'Sebagian' : 'Belum Lunas'}
                    </Badge>
                    <span className="text-[11px] text-slate-500 font-semibold">{p.tgl}</span>
                  </div>
                  <h4 className="mt-1 text-sm font-black text-slate-900">{p.nsb}</h4>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">{p.uraian}</p>
                </div>

                <button
                  onClick={() => setDeleteTargetId(p.id)}
                  className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                  title="Hapus Piutang"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium text-[11px] block">Dipinjamkan</span>
                  <span className="font-semibold text-slate-900 num">Rp {formatRibuan(p.terbit)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium text-[11px] block">Sisa Belum Kembali</span>
                  <span className={`font-bold text-sm num ${isLunas ? 'text-emerald-700' : 'text-rose-600'}`}>Rp {formatRibuan(sisa)}</span>
                </div>
              </div>

              {!isLunas && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <button onClick={() => setPelunasanTarget(p)} className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <HandCoins size={14} /> Catat Pembayaran Kembali
                  </button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <Card className="hidden md:block overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Nama Peminjam</th>
                <th className="px-4 py-3">Keperluan</th>
                <th className="px-4 py-3 text-right">Dipinjamkan</th>
                <th className="px-4 py-3 text-right">Sudah Kembali</th>
                <th className="px-4 py-3 text-right">Sisa Belum Kembali</th>
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-5 z-10 animate-scale max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 tracking-tight pb-3 border-b border-slate-100">Catat Pinjaman Baru</h3>
            <p className="mt-2 text-xs font-medium text-slate-500">Siapa yang pinjam, untuk apa, dan berapa jumlahnya.</p>
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal Pinjam</label>
                  <input type="date" required value={newPiutang.tgl} onChange={(e) => setNewPiutang({ ...newPiutang, tgl: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Peminjam <span className="text-rose-500">*</span></label>
                  <Autocomplete value={newPiutang.nsb} onChange={(v) => setNewPiutang({ ...newPiutang, nsb: v })} suggestions={nsbSuggestions} placeholder="Pilih atau ketik nama" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Untuk keperluan apa?</label>
                <input type="text" required value={newPiutang.uraian} onChange={(e) => setNewPiutang({ ...newPiutang, uraian: e.target.value })} placeholder="Mis. Talangan usaha sementara" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Jumlah Dipinjamkan (Rp)</label>
                <RupiahInput
                  required
                  value={newPiutang.terbit}
                  onChange={(v) => setNewPiutang({ ...newPiutang, terbit: v })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold num text-[#1c543c] outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
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
