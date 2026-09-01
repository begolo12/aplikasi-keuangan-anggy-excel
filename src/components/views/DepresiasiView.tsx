import { useState } from 'react'
import { Plus, Trash2, Scale, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { Card } from '../common/Card'
import { StatCard } from '../common/StatCard'
import { Badge } from '../common/Badge'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan } from '../common/format'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { State, DepRow } from '../../store'
import { straightLineValue } from '../../finance'

interface DepresiasiViewProps {
  store: State
}

export function DepresiasiView({ store: s }: DepresiasiViewProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newDep, setNewDep] = useState<Omit<DepRow, 'id'>>({
    nama: '',
    tgl: new Date().toISOString().slice(0, 10),
    nilai: 0,
    umur: 60,
    nilaiTaksir: 0,
    kat: 'KENDARAAN',
  })

  const todayStr = new Date().toISOString().slice(0, 10)

  const totalNilaiPerolehan = s.deps.reduce((sum, d) => sum + d.nilai, 0)
  const totalAkumulasi = s.deps.reduce((sum, d) => sum + straightLineValue(d, todayStr).accumulated, 0)
  const totalNilaiBuku = s.deps.reduce((sum, d) => sum + straightLineValue(d, todayStr).bookValue, 0)

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDep.nama.trim() || newDep.nilai <= 0) return
    s.addDep(newDep)
    setIsAdding(false)
    setNewDep({
      nama: '',
      tgl: new Date().toISOString().slice(0, 10),
      nilai: 0,
      umur: 60,
      nilaiTaksir: 0,
      kat: 'KENDARAAN',
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Harga Beli Awal" value={`Rp ${formatRibuan(totalNilaiPerolehan) || '0'}`} subtitle={`${s.deps.length} barang`} variant="brand" icon={<Scale size={16} />} />
        <StatCard title="Total Penyusutan" value={`Rp ${formatRibuan(totalAkumulasi) || '0'}`} subtitle="Berapa nilai sudah berkurang" variant="expense" icon={<ArrowUpRight size={16} />} />
        <StatCard title="Nilai Sekarang" value={`Rp ${formatRibuan(totalNilaiBuku) || '0'}`} subtitle="Perkiraan harga jual hari ini" variant="income" icon={<CheckCircle2 size={16} />} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Nilai Barang dari Waktu ke Waktu</h3>
            <p className="text-xs font-medium text-slate-500">Hitung berapa nilai barang turun setiap bulan</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="self-start sm:self-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Item Depresiasi</span>
          </button>
        </div>
      </Card>

      {/* Mobile Card List (< 768px) */}
      <div className="block md:hidden space-y-3">
        {s.deps.map((d) => {
          const calc = straightLineValue(d, todayStr)
          const depPerMonth = d.umur > 0 ? Math.round(d.nilai / d.umur) : 0
          return (
            <Card key={d.id} className="p-4 border-slate-200 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant={d.kat === 'KENDARAAN' ? 'brand' : 'accent'}>{d.kat}</Badge>
                  <h4 className="mt-1 text-sm font-black text-slate-900">{d.nama}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Beli: {d.tgl} • {calc.monthsElapsed} dari {d.umur} bln
                  </p>
                </div>

                <button
                  onClick={() => setDeleteTargetId(d.id)}
                  className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                  title="Hapus Depresiasi"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-600 font-semibold text-[11px] block">Nilai Beli Awal</span>
                  <span className="font-bold text-slate-900 num">Rp {formatRibuan(d.nilai)}</span>
                </div>
                <div>
                  <span className="text-slate-600 font-semibold text-[11px] block">Sisa Nilai Buku</span>
                  <span className="font-black text-emerald-800 num">Rp {formatRibuan(calc.bookValue)}</span>
                </div>
                <div>
                  <span className="text-slate-600 font-semibold text-[11px] block">Penyusutan / Bulan</span>
                  <span className="font-bold text-rose-700 num">Rp {formatRibuan(depPerMonth)}</span>
                </div>
                <div>
                  <span className="text-slate-600 font-semibold text-[11px] block">Akumulasi Depresiasi</span>
                  <span className="font-bold text-rose-700 num">Rp {formatRibuan(calc.accumulated)}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <Card className="hidden md:block overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Nama Barang</th>
                <th className="px-4 py-3">Tgl Beli</th>
                <th className="px-4 py-3 text-right">Nilai Awal</th>
                <th className="px-4 py-3 text-center">Masa Pakai</th>
                <th className="px-4 py-3 text-right">Penyusutan/Bln</th>
                <th className="px-4 py-3 text-right">Akumulasi Dep</th>
                <th className="px-4 py-3 text-right font-black">Nilai Buku</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.deps.map((d) => {
                const calc = straightLineValue(d, todayStr)
                const depPerMonth = d.umur > 0 ? Math.round(d.nilai / d.umur) : 0
                return (
                  <tr key={d.id} className="hover:bg-[#f4f9f6]/60 transition">
                    <td className="px-4 py-3">
                      <Badge variant={d.kat === 'KENDARAAN' ? 'brand' : 'accent'}>{d.kat}</Badge>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{d.nama}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{d.tgl}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800 num">Rp {formatRibuan(d.nilai)}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">
                      {calc.monthsElapsed} / {d.umur} bln
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-rose-600 num">
                      Rp {formatRibuan(depPerMonth)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-700 num">
                      Rp {formatRibuan(calc.accumulated)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-[#1c543c] num bg-[#edf6f0]/40">
                      Rp {formatRibuan(calc.bookValue)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteTargetId(d.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Hapus Item Depresiasi"
        message="Apakah Anda yakin ingin menghapus catatan penyusutan aset ini?"
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteTargetId) s.delDep(deleteTargetId)
          setDeleteTargetId(null)
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-5 z-10 animate-scale max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-base sm:text-lg text-[#0f291e] tracking-tight pb-3 border-b border-slate-100">
              Tambah Item Depresiasi
            </h3>
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Barang / Aset</label>
                <input
                  type="text"
                  required
                  value={newDep.nama}
                  onChange={(e) => setNewDep({ ...newDep, nama: e.target.value })}
                  placeholder="Contoh: MacBook Pro / Motor Honda Vario"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Kategori</label>
                  <select value={newDep.kat} onChange={(e) => setNewDep({ ...newDep, kat: e.target.value as DepRow['kat'] })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900">
                    <option value="KENDARAAN">KENDARAAN</option>
                    <option value="GADGET">GADGET</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Beli</label>
                  <input
                    type="date"
                    required
                    value={newDep.tgl}
                    onChange={(e) => setNewDep({ ...newDep, tgl: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nilai Beli (Rp)</label>
                  <RupiahInput
                    required
                    value={newDep.nilai}
                    onChange={(v) => setNewDep({ ...newDep, nilai: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold num text-[#1c543c] outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Masa Pakai (Bulan)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newDep.umur}
                    onChange={(e) => setNewDep({ ...newDep, umur: parseInt(e.target.value, 10) || 60 })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold num text-slate-700 outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
