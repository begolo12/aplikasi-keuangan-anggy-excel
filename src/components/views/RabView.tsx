import React, { useState } from 'react'
import { Plus, Trash2, LayoutGrid, List } from 'lucide-react'
import { Card } from '../common/Card'
import { RupiahInput, formatRibuan } from '../common/RupiahInput'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { State, RabRow } from '../../store'

interface RabViewProps {
  store: State
}

export function RabView({ store: s }: RabViewProps) {
  const [target, setTarget] = useState<'anggy' | 'keluarga'>('anggy')
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newRow, setNewRow] = useState<Omit<RabRow, 'id'>>({
    group: 'RUTIN',
    uraian: '',
    sat: 'bln',
    vol: 1,
    hs: 0,
    w: [0, 0, 0, 0],
    months: Array(12).fill(0),
    total: 0,
  })

  const currentRab = target === 'anggy' ? s.rabAnggy : s.rabKeluarga
  const grandTotal = currentRab.reduce((sum, r) => sum + r.total, 0)

  const monthShorts = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRow.uraian.trim()) return

    const total = newRow.months.reduce((sum, v) => sum + v, 0)
    s.addRab(target, { ...newRow, total })
    setNewRow({
      group: 'RUTIN',
      uraian: '',
      sat: 'bln',
      vol: 1,
      hs: 0,
      w: [0, 0, 0, 0],
      months: Array(12).fill(0),
      total: 0,
    })
    setIsAdding(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* Target Selector & Mode Toolbar */}
      <Card className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setTarget('anggy')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-98 ${
                target === 'anggy'
                  ? 'bg-[#1c543c] text-white shadow-xs'
                  : 'bg-[#edf6f0] text-slate-700 hover:bg-[#e0efe5]'
              }`}
            >
              RAB-01 Operasional
            </button>
            <button
              onClick={() => setTarget('keluarga')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-98 ${
                target === 'keluarga'
                  ? 'bg-[#2d6a4f] text-white shadow-xs'
                  : 'bg-[#edf6f0] text-slate-700 hover:bg-[#e0efe5]'
              }`}
            >
              RAB-02 Keluarga
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="hidden sm:flex items-center bg-[#edf6f0] p-1 rounded-xl border border-[#e2ece5]">
              <button
                onClick={() => setViewMode('single')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'single' ? 'bg-white shadow-xs text-[#132a22]' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Mingguan & Ringkas"
              >
                <List size={14} />
                <span>Ringkas</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-[#132a22]' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Grid 12 Bulan"
              >
                <LayoutGrid size={14} />
                <span>12 Bulan</span>
              </button>
            </div>

            <button
              onClick={() => setIsAdding(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1c543c] hover:bg-[#15422f] text-white text-xs font-black shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus size={15} />
              <span>Tambah Pos</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 border-[#c7e4d2] bg-gradient-to-br from-white via-white to-[#f0f9f3]">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Anggaran ({target === 'anggy' ? 'Operasional' : 'Keluarga'})
          </p>
          <h3 className="mt-1 text-2xl font-black text-[#0f291e] num">
            Rp {formatRibuan(grandTotal) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">{currentRab.length} pos anggaran terdaftar</p>
        </Card>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {currentRab.map((row) => (
          <Card key={row.id} className="p-4 border-[#dbeae0] bg-white">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-[#edf6f0] text-[#1c543c] text-[10px] font-extrabold uppercase">
                  {row.group}
                </span>
                <h4 className="mt-1 text-sm font-black text-[#0f291e]">{row.uraian}</h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {row.vol} {row.sat} × Rp {formatRibuan(row.hs)}
                </p>
              </div>

              <button
                onClick={() => setDeleteTargetId(row.id)}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Hapus Pos"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#edf4ef] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Total Anggaran Tahun Ini:</span>
              <span className="font-black text-[#1c543c] text-sm num">Rp {formatRibuan(row.total)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <Card className="hidden md:block overflow-hidden border border-[#e2ece5]">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8faf9] border-b border-[#e2ece5] text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="px-3 py-3">Group</th>
                <th className="px-3 py-3 min-w-[200px]">Uraian Anggaran</th>
                <th className="px-3 py-3 text-center">Vol</th>
                <th className="px-3 py-3 text-center">Sat</th>
                <th className="px-3 py-3 text-right">Harga Satuan (HS)</th>
                {viewMode === 'single' ? (
                  <>
                    <th className="px-3 py-3 text-right">W-1</th>
                    <th className="px-3 py-3 text-right">W-2</th>
                    <th className="px-3 py-3 text-right">W-3</th>
                    <th className="px-3 py-3 text-right">W-4</th>
                  </>
                ) : (
                  monthShorts.map((m) => (
                    <th key={m} className="px-2 py-3 text-right min-w-[90px]">{m}</th>
                  ))
                )}
                <th className="px-3 py-3 text-right bg-[#edf6f0]/60 font-black">Total Anggaran</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRab.map((row) => (
                <tr key={row.id} className="hover:bg-[#f4f8f5]/50 transition">
                  <td className="px-3 py-2.5 font-bold text-slate-600 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#edf6f0] text-[#1b4332] text-[10px] font-extrabold uppercase">
                      {row.group}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{row.uraian}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-slate-600">{row.vol}</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">{row.sat}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-700 num">
                    Rp {formatRibuan(row.hs)}
                  </td>

                  {viewMode === 'single' ? (
                    <>
                      <td className="px-3 py-2.5 text-right num text-slate-600">{formatRibuan(row.w[0]) || '—'}</td>
                      <td className="px-3 py-2.5 text-right num text-slate-600">{formatRibuan(row.w[1]) || '—'}</td>
                      <td className="px-3 py-2.5 text-right num text-slate-600">{formatRibuan(row.w[2]) || '—'}</td>
                      <td className="px-3 py-2.5 text-right num text-slate-600">{formatRibuan(row.w[3]) || '—'}</td>
                    </>
                  ) : (
                    row.months.map((val, idx) => (
                      <td key={idx} className="px-2 py-2.5 text-right num text-slate-600">
                        {val > 0 ? formatRibuan(val) : '—'}
                      </td>
                    ))
                  )}

                  <td className="px-3 py-2.5 text-right font-black text-[#1b4332] bg-[#edf6f0]/40 num">
                    Rp {formatRibuan(row.total)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setDeleteTargetId(row.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 size={14} />
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
        title="Hapus Pos Anggaran"
        message="Apakah Anda yakin ingin menghapus pos anggaran RAB ini?"
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteTargetId) s.delRab(target, deleteTargetId)
          setDeleteTargetId(null)
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#dbeae0] p-5 sm:p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-base sm:text-lg text-[#0f291e] tracking-tight pb-3 border-b border-slate-100">
              Tambah Pos RAB ({target === 'anggy' ? 'Operasional' : 'Keluarga'})
            </h3>
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Group Pos</label>
                  <select
                    value={newRow.group}
                    onChange={(e) => setNewRow({ ...newRow, group: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  >
                    <option value="RUTIN">RUTIN</option>
                    <option value="PERIODIK">PERIODIK</option>
                    <option value="INSIDENTAL">INSIDENTAL</option>
                    <option value="CICILAN">CICILAN</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={newRow.sat}
                    onChange={(e) => setNewRow({ ...newRow, sat: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Uraian Anggaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Dapur Mingguan"
                  value={newRow.uraian}
                  onChange={(e) => setNewRow({ ...newRow, uraian: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Volume</label>
                  <input
                    type="number"
                    min="1"
                    value={newRow.vol}
                    onChange={(e) => setNewRow({ ...newRow, vol: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#dbeae0] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1c543c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Harga Satuan / Anggaran Bulanan (Rp)</label>
                  <RupiahInput
                    value={newRow.hs}
                    onChange={(v) => {
                      const months = Array(12).fill(v * (newRow.vol || 1))
                      setNewRow({ ...newRow, hs: v, months })
                    }}
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
                  Simpan Pos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
