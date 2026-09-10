import React, { useState } from 'react'
import { Plus, Trash2, Check, Calendar } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan } from '../common/format'
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
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-text">Pengingat Bayar Rutin — {s.year}</h3>
            <p className="text-xs font-medium text-text-muted">Jadwal pajak, servis, dan tagihan yang datang tiap bulan</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="self-start sm:self-auto px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold  transition flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} /> Tambah Pengingat
          </button>
        </div>
      </Card>

      {/* Mobile Card List with Large Touch Toggle (< 768px) */}
      <div className="block md:hidden space-y-3">
        {s.scheds.map((sc) => {
          const rowTotal = sc.months.reduce((a, b) => a + b, 0)
          const activeMonthsCount = sc.months.filter((v) => v > 0).length
          return (
            <Card key={sc.id} className="p-4 border-border bg-surface">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant={sc.kat === 'pajak' ? 'warning' : 'brand'}>{sc.kat}</Badge>
                  <h4 className="mt-1.5 text-sm font-black text-text">{sc.nama}</h4>
                  <p className="text-xs font-semibold text-text-muted mt-0.5">
                    Biaya per jadwal: <span className="text-accent font-black num">Rp {formatRibuan(sc.hs)}</span>
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTargetId(sc.id)}
                  className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-text-subtle hover:text-negative hover:bg-negative-soft transition"
                  title="Hapus Jadwal"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Month Selector Grid (4x3 for Easy Tap) */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[11px] font-bold text-text-muted mb-2 flex items-center gap-1">
                  <Calendar size={12} className="text-accent" />
                  <span>Bulan Terjadwal ({activeMonthsCount}/12 bulan):</span>
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {sc.months.map((val, mIdx) => {
                    const isActive = val > 0
                    return (
                      <button
                        key={mIdx}
                        onClick={() => s.toggleSchedMonth(sc.id, mIdx)}
                        className={`min-h-[40px] py-1.5 px-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-positive text-white shadow-xs'
                            : 'bg-canvas text-text-muted border border-border hover:bg-positive-soft hover:text-positive'
                        }`}
                      >
                        <span className="text-[10px] font-bold">{monthShorts[mIdx]}</span>
                        <span className="text-[11px] font-extrabold">{isActive ? '✓' : '—'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted font-semibold">Total Anggaran Tahun {s.year}:</span>
                <span className="font-black text-positive text-sm num">Rp {formatRibuan(rowTotal)}</span>
              </div>
            </Card>
          )
        })}

        {/* Mobile Grand Total Card */}
        <div className="p-4 rounded-lg bg-accent text-white flex items-center justify-between shadow-xs border border-positive">
          <span className="text-xs font-bold text-positive uppercase tracking-wider">TOTAL ESTIMASI PEMELIHARAAN:</span>
          <span className="text-base font-black text-white num">Rp {formatRibuan(grandTotal)}</span>
        </div>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <Card className="hidden md:block overflow-hidden border border-border">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border text-text-muted font-bold text-[11px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-border">
              {s.scheds.map((sc) => {
                const rowTotal = sc.months.reduce((a, b) => a + b, 0)
                return (
                  <tr key={sc.id} className="hover:bg-surface-sunken transition">
                    <td className="px-3 py-2.5">
                      <Badge variant={sc.kat === 'pajak' ? 'warning' : 'brand'}>{sc.kat}</Badge>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-text">{sc.nama}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-text-muted num">
                      Rp {formatRibuan(sc.hs)}
                    </td>
                    {sc.months.map((val, mIdx) => {
                      const isActive = val > 0
                      return (
                        <td key={mIdx} className="px-2 py-2.5 text-center">
                          <button
                            onClick={() => s.toggleSchedMonth(sc.id, mIdx)}
                            className={`w-8 h-8 rounded-lg text-xs font-black inline-flex items-center justify-center transition active:scale-90 cursor-pointer ${
                              isActive
                                ? 'bg-positive text-white shadow-xs'
                                : 'bg-surface-sunken text-text-subtle hover:bg-positive-soft hover:text-positive border border-border'
                            }`}
                            title={isActive ? `Aktif: Rp ${formatRibuan(val)}` : 'Klik untuk aktifkan'}
                          >
                            {isActive ? <Check size={14} /> : '·'}
                          </button>
                        </td>
                      )
                    })}
                    <td className="px-3 py-2.5 text-right font-black text-positive num bg-positive-soft/40">
                      Rp {formatRibuan(rowTotal)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => setDeleteTargetId(sc.id)}
                        className="p-1.5 text-text-subtle hover:text-negative hover:bg-negative-soft rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-accent text-white font-extrabold text-xs">
                <td colSpan={15} className="px-4 py-3 text-right">TOTAL ESTIMASI PEMELIHARAAN :</td>
                <td className="px-3 py-3 text-right font-black num text-positive">
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
          <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-xs" onClick={() => setIsAdding(false)} />
          <div className="relative bg-surface w-full max-w-md rounded-lg md-elevation-3 border border-border p-5 sm:p-6 z-10 animate-scale">
            <h3 className="font-black text-base sm:text-lg text-text tracking-tight pb-3 border-b border-border">
              Tambah Jadwal Pemeliharaan / Pajak
            </h3>
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Kategori</label>
                <select value={newSched.kat} onChange={(e) => setNewSched({ ...newSched, kat: e.target.value as SchedRow['kat'] })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent focus:ring-1 focus:ring-accent">
                  <option value="service">Servis Kendaraan / AC / Gadget</option>
                  <option value="pajak">Pajak Kendaraan (PKB) / PBB</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Nama Item / Jadwal</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pajak Tahunan Motor Vario"
                  value={newSched.nama}
                  onChange={(e) => setNewSched({ ...newSched, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Estimasi Biaya per Kegiatan (Rp)</label>
                <RupiahInput
                  value={newSched.hs}
                  onChange={(v) => setNewSched({ ...newSched, hs: v })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-bold num text-accent outline-none focus:bg-surface focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-text-muted hover:bg-surface-sunken transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-black shadow-xs transition"
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
