import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { RupiahInput, formatRibuan } from '../common/RupiahInput'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { State, AssetRow } from '../../store'

interface AssetViewProps {
  store: State
}

export function AssetView({ store: s }: AssetViewProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newAsset, setNewAsset] = useState<Omit<AssetRow, 'id'>>({
    jenis: 'PROPERTY',
    nama: '',
    atasNama: 'ANGGY',
    tgl: new Date().toISOString().slice(0, 10),
    nilai: 0,
    dp: 0,
    bunga: 0.08,
    tenor: 120,
    nilaiPasar: 0,
    tambah: 0,
  })

  const totalNilaiPerolehan = s.assets.reduce((sum, a) => sum + a.nilai, 0)
  const totalNilaiPasar = s.assets.reduce((sum, a) => sum + a.nilaiPasar, 0)
  const totalHutang = s.assets.reduce((sum, a) => {
    const pokok = a.nilai - a.dp
    const bungaTotal = pokok * (a.bunga || 0.08) * ((a.tenor || 120) / 12)
    return sum + pokok + bungaTotal
  }, 0)

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAsset.nama.trim() || newAsset.nilai <= 0) return
    s.addAsset({
      ...newAsset,
      nilaiPasar: newAsset.nilaiPasar || newAsset.nilai,
    })
    setIsAdding(false)
    setNewAsset({
      jenis: 'PROPERTY',
      nama: '',
      atasNama: 'ANGGY',
      tgl: new Date().toISOString().slice(0, 10),
      nilai: 0,
      dp: 0,
      bunga: 0.08,
      tenor: 120,
      nilaiPasar: 0,
      tambah: 0,
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 border-[#c7e4d2] bg-gradient-to-br from-white via-white to-[#f0f9f3]">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Nilai Perolehan</p>
          <h3 className="mt-1 text-2xl font-black text-[#0f291e] num">
            Rp {formatRibuan(totalNilaiPerolehan) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">{s.assets.length} aset terdaftar</p>
        </Card>

        <Card className="p-4 sm:p-5 border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/20">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taksiran Nilai Pasar</p>
          <h3 className="mt-1 text-2xl font-black text-emerald-700 num">
            Rp {formatRibuan(totalNilaiPasar) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Estimasi valuasi harga saat ini</p>
        </Card>

        <Card className="p-4 sm:p-5 border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/20">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Liabilitas / Hutang</p>
          <h3 className="mt-1 text-2xl font-black text-amber-800 num">
            Rp {formatRibuan(totalHutang) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Pokok sisa KPR/KKB + estimasi bunga</p>
        </Card>
      </div>

      <Card className="p-4 sm:p-5 border-[#dbeae0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-[#0f291e]">Daftar Portofolio Aset</h3>
            <p className="text-xs text-slate-500 font-medium">Pencatatan kepemilikan aset properti, kendaraan, dan gadget</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#1c543c] hover:bg-[#15422f] text-white text-xs font-black shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Tambah Aset</span>
          </button>
        </div>
      </Card>

      {/* Mobile Card List (< 768px) */}
      <div className="block md:hidden space-y-3">
        {s.assets.map((a) => (
          <Card key={a.id} className="p-4 border-[#dbeae0] bg-white">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant={a.jenis === 'PROPERTY' ? 'brand' : a.jenis === 'KENDARAAN' ? 'success' : 'accent'}>
                  {a.jenis}
                </Badge>
                <h4 className="mt-1 text-sm font-black text-[#0f291e]">{a.nama}</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  a.n {a.atasNama} • Beli: {a.tgl}
                </p>
              </div>

              <button
                onClick={() => setDeleteTargetId(a.id)}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Hapus Aset"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#edf4ef] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Nilai Beli</span>
                <span className="font-bold text-slate-800 num">Rp {formatRibuan(a.nilai)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Nilai Pasar</span>
                <span className="font-black text-[#1c543c] num">Rp {formatRibuan(a.nilaiPasar)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">DP / Uang Muka</span>
                <span className="font-bold text-emerald-700 num">Rp {formatRibuan(a.dp)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Tenor Cicilan</span>
                <span className="font-semibold text-slate-700">{a.tenor} bulan</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <Card className="hidden md:block overflow-hidden border border-[#dbeae0]">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8faf9] border-b border-[#dbeae0] text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Nama Aset</th>
                <th className="px-4 py-3">Atas Nama</th>
                <th className="px-4 py-3">Tgl Beli</th>
                <th className="px-4 py-3 text-right">Nilai Beli</th>
                <th className="px-4 py-3 text-right">DP / Uang Muka</th>
                <th className="px-4 py-3 text-center">Tenor</th>
                <th className="px-4 py-3 text-right">Nilai Pasar</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.assets.map((a) => (
                <tr key={a.id} className="hover:bg-[#f4f9f6]/60 transition">
                  <td className="px-4 py-3">
                    <Badge variant={a.jenis === 'PROPERTY' ? 'brand' : a.jenis === 'KENDARAAN' ? 'success' : 'accent'}>
                      {a.jenis}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{a.nama}</td>
                  <td className="px-4 py-3 font-medium text-slate-600">{a.atasNama}</td>
                  <td className="px-4 py-3 text-slate-500 font-semibold">{a.tgl}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800 num">Rp {formatRibuan(a.nilai)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700 num">Rp {formatRibuan(a.dp)}</td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-600">{a.tenor} bln</td>
                  <td className="px-4 py-3 text-right font-black text-[#1c543c] num bg-[#edf6f0]/40">Rp {formatRibuan(a.nilaiPasar)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDeleteTargetId(a.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Hapus Aset"
        message="Apakah Anda yakin ingin menghapus data aset ini dari daftar?"
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteTargetId) s.delAsset(deleteTargetId)
          setDeleteTargetId(null)
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#dbeae0] p-5 sm:p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-base sm:text-lg text-[#0f291e] tracking-tight pb-3 border-b border-slate-100">
              Tambah Aset Baru
            </h3>
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Jenis Aset</label>
                  <select
                    value={newAsset.jenis}
                    onChange={(e) => setNewAsset({ ...newAsset, jenis: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  >
                    <option value="PROPERTY">PROPERTY</option>
                    <option value="KENDARAAN">KENDARAAN</option>
                    <option value="GADGET">GADGET</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nama Aset</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rumah Cluster Magnolia"
                    value={newAsset.nama}
                    onChange={(e) => setNewAsset({ ...newAsset, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Atas Nama</label>
                  <input
                    type="text"
                    value={newAsset.atasNama}
                    onChange={(e) => setNewAsset({ ...newAsset, atasNama: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Perolehan / Beli</label>
                  <input
                    type="date"
                    required
                    value={newAsset.tgl}
                    onChange={(e) => setNewAsset({ ...newAsset, tgl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nilai Beli / Pokok (Rp)</label>
                  <RupiahInput
                    value={newAsset.nilai}
                    onChange={(v) => setNewAsset({ ...newAsset, nilai: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-bold num text-[#1c543c] outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">DP / Uang Muka (Rp)</label>
                  <RupiahInput
                    value={newAsset.dp}
                    onChange={(v) => setNewAsset({ ...newAsset, dp: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-bold num text-emerald-700 outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tenor (Bulan)</label>
                  <input
                    type="number"
                    min="0"
                    value={newAsset.tenor}
                    onChange={(e) => setNewAsset({ ...newAsset, tenor: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Bunga Tahunan (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={Math.round(newAsset.bunga * 100)}
                    onChange={(e) => setNewAsset({ ...newAsset, bunga: (Number(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Taksiran Pasar (Rp)</label>
                  <RupiahInput
                    value={newAsset.nilaiPasar}
                    onChange={(v) => setNewAsset({ ...newAsset, nilaiPasar: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-bold num text-[#1c543c] outline-none focus:bg-white focus:border-[#1c543c]"
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
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
