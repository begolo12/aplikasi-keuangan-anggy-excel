import React, { useState } from 'react'
import { Plus, Trash2, Check, Calendar } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { RupiahInput, formatRibuan } from '../common/RupiahInput'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { State, SchedRow } from '../../store'

interface ScheduleViewProps {
  store: State
}

export function ScheduleView({ store: s }: ScheduleViewProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newSched, setNewSched] = useState<Omit<SchedRow, 'id'>>({
    nama: '',
    hs: 0,
    months: Array(12).fill(0),
    kat: 'service',
  })

  const monthShorts = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const grandTotal = s.scheds.reduce((sum, sc) => sum + sc.months.reduce((a, b) => a + b, 0), 0)

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSched.nama.trim()) return
    s.addSched(newSched)
    setIsAdding(false)
    setNewSched({
      nama: '',
      hs: 0,
      months: Array(12).fill(0),
      kat: 'service',
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      <Card className="p-4 sm:p-5 border-[#dbeae0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-[#0f291e]">
              Jadwal Pajak & Servis Berkala ({s.year})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Checklist dan estimasi biaya pemeliharaan bulanan
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#1c543c] hover:bg-[#15422f] text-white text-xs font-black shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </Card>

      {/* Mobile Card List with Large Touch Toggle (< 768px) */}
      <div className="block md:hidden space-y-3">
        {s.scheds.map((sc) => {
          const rowTotal = sc.months.reduce((a, b) => a + b, 0)
          const activeMonthsCount = sc.months.filter((v) => v > 0).length
          return (
            <Card key={sc.id} className="p-4 border-[#dbeae0] bg-white">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant={sc.kat === 'pajak' ? 'warning' : 'brand'}>{sc.kat}</Badge>
                  <h4 className="mt-1.5 text-sm font-black text-[#0f291e]">{sc.nama}</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Biaya per jadwal: <span className="text-[#1c543c] font-black num">Rp {formatRibuan(sc.hs)}</span>
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTargetId(sc.id)}
                  className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Hapus Jadwal"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Month Selector Grid (4x3 for Easy Tap) */}
              <div className="mt-3 pt-3 border-t border-[#edf4ef]">
                <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
                  <Calendar size={12} className="text-[#1c543c]" />
                  <span>Bulan Terjadwal ({activeMonthsCount}/12 bulan):</span>
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {sc.months.map((val, mIdx) => {
                    const isActive = val > 0
                    return (
                      <button
                        key={mIdx}
                        onClick={() => s.toggleSchedMonth(sc.id, mIdx)}
                        className={`min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition active:scale-95 ${
                          isActive
                            ? 'bg-[#1c543c] text-white shadow-xs'
                            : 'bg-[#f4f9f6] text-slate-500 border border-[#dbeae0] hover:bg-[#eaf5ee]'
                        }`}
                      >
                        <span className="text-[10px]">{monthShorts[mIdx]}</span>
                        <span className="text-[11px]">{isActive ? '✓' : '—'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#edf4ef] flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Total Anggaran Tahun {s.year}:</span>
                <span className="font-black text-[#1c543c] text-sm num">Rp {formatRibuan(rowTotal)}</span>
              </div>
            </Card>
          )
        })}

        {/* Mobile Grand Total Card */}
        <div className="p-4 rounded-2xl bg-[#0f291e] text-white flex items-center justify-between shadow-xs">
          <span className="text-xs font-bold text-slate-300">TOTAL ESTIMASI PEMELIHARAAN:</span>
          <span className="text-base font-black text-emerald-300 num">Rp {formatRibuan(grandTotal)}</span>
        </div>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <Card className="hidden md:block overflow-hidden border border-[#dbeae0]">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8faf9] border-b border-[#dbeae0] text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3 min-w-[180px]">Nama Jadwal / Item</th>
                <th className="px-3 py-3 text-right">Estimasi Biaya</th>
                {monthShorts.map((m) => (
                  <th key={m} className="px-2 py-3 text-center min-w-[50px]">{m}</th>
                ))}
                <th className="px-3 py-3 text-right font-black">Total Anggaran</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.scheds.map((sc) => {
                const rowTotal = sc.months.reduce((a, b) => a + b, 0)
                return (
                  <tr key={sc.id} className="hover:bg-[#f4f9f6]/60 transition">
                    <td className="px-3 py-2.5">
                      <Badge variant={sc.kat === 'pajak' ? 'warning' : 'brand'}>{sc.kat}</Badge>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{sc.nama}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-700 num">
                      Rp {formatRibuan(sc.hs)}
                    </td>
                    {sc.months.map((val, mIdx) => {
                      const isActive = val > 0
                      return (
                        <td key={mIdx} className="px-2 py-2.5 text-center">
                          <button
                            onClick={() => s.toggleSchedMonth(sc.id, mIdx)}
                            className={`w-8 h-8 rounded-xl text-xs font-black inline-flex items-center justify-center transition active:scale-90 ${
                              isActive
                                ? 'bg-[#1c543c] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-300 hover:bg-[#edf6f0] hover:text-[#1c543c]'
                            }`}
                            title={isActive ? `Aktif: Rp ${formatRibuan(val)}` : 'Klik untuk aktifkan'}
                          >
                            {isActive ? <Check size={14} /> : '·'}
                          </button>
                        </td>
                      )
                    })}
                    <td className="px-3 py-2.5 text-right font-black text-[#1c543c] num bg-[#edf6f0]/40">
                      Rp {formatRibuan(rowTotal)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => setDeleteTargetId(sc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#0f291e] text-white font-extrabold text-xs">
                <td colSpan={15} className="px-4 py-3 text-right">TOTAL ESTIMASI PEMELIHARAAN :</td>
                <td className="px-3 py-3 text-right font-black num text-emerald-300">
                  Rp {formatRibuan(grandTotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Hapus Jadwal"
        message="Apakah Anda yakin ingin menghapus jadwal pemeliharaan ini dari daftar?"
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteTargetId) s.delSched(deleteTargetId)
          setDeleteTargetId(null)
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#dbeae0] p-5 sm:p-6 z-10 animate-scale">
            <h3 className="font-black text-base sm:text-lg text-[#0f291e] tracking-tight pb-3 border-b border-slate-100">
              Tambah Jadwal Pemeliharaan / Pajak
            </h3>
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Kategori</label>
                <select
                  value={newSched.kat}
                  onChange={(e) => setNewSched({ ...newSched, kat: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                >
                  <option value="service">Servis Kendaraan / AC / Gadget</option>
                  <option value="pajak">Pajak Kendaraan (PKB) / PBB</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Item / Jadwal</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pajak Tahunan Motor Vario"
                  value={newSched.nama}
                  onChange={(e) => setNewSched({ ...newSched, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Estimasi Biaya per Kegiatan (Rp)</label>
                <RupiahInput
                  value={newSched.hs}
                  onChange={(v) => setNewSched({ ...newSched, hs: v })}
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
