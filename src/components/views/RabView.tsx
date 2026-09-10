import React, { useState } from 'react'
import { Plus, Trash2, LayoutGrid, List } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan, kasLabel } from '../common/format'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { Modal } from '../common/Modal'
import type { State, RabRow } from '../../store'

interface RabViewProps {
  store: State
}

/** Pecah rata-rata bulanan menjadi 4 pekan (sisa pembulatan di W4). */
function splitWeekly(months: number[]): [number, number, number, number] {
  const avg = months.length ? months.reduce((a, b) => a + (Number(b) || 0), 0) / months.length : 0
  const base = Math.floor(avg / 4)
  return [base, base, base, Math.max(0, Math.round(avg - base * 3))]
}

export function RabView({ store: s }: RabViewProps) {
  const [target, setTarget] = useState<'anggy' | 'keluarga'>('anggy')
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [bulanAktif, setBulanAktif] = useState(12)
  const [bulanMulai, setBulanMulai] = useState(0)
  /** Bangun distribusi bulanan: nominal mengisi N bulan sejak bulan mulai, sisanya 0. */
  const buildMonths = (hs: number, vol: number, start: number, n: number): number[] =>
    Array.from({ length: 12 }, (_, i) => (i >= start && i < start + n ? hs * vol : 0))

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

  /** RAB 'anggy' memakai dompet operasional, 'keluarga' memakai dompet keluarga. */
  const rabKas = (t: 'anggy' | 'keluarga') => kasLabel(t === 'anggy' ? 'operasional' : 'keluarga', s.ledgerLabels)

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRow.uraian.trim()) return

    const total = newRow.months.reduce((sum, v) => sum + v, 0)
    const w = (newRow.w.some((v) => v > 0) ? newRow.w : splitWeekly(newRow.months)) as [number, number, number, number]
    s.addRab(target, { ...newRow, w, total })
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
    setBulanAktif(12)
    setBulanMulai(0)
    setIsAdding(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* Target Selector & Mode Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setTarget('anggy')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                target === 'anggy'
                  ? 'bg-accent text-on-fill'
                  : 'bg-surface-sunken text-text-muted hover:text-text'
              }`}
            >
              {rabKas('anggy')}
            </button>
            <button
              onClick={() => setTarget('keluarga')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                target === 'keluarga'
                  ? 'bg-accent text-on-fill'
                  : 'bg-surface-sunken text-text-muted hover:text-text'
              }`}
            >
              {rabKas('keluarga')}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="hidden sm:flex items-center bg-accent-soft p-1 rounded-lg border border-border">
              <button
                onClick={() => setViewMode('single')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'single' ? 'bg-surface text-text' : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Mingguan & Ringkas"
              >
                <List size={14} />
                <span>Ringkas</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-surface text-text' : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Grid 12 Bulan"
              >
                <LayoutGrid size={14} />
                <span>12 Bulan</span>
              </button>
            </div>

            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
              Tambah Anggaran
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="eyebrow">Total Rencana — {rabKas(target)}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight num text-text">Rp {formatRibuan(grandTotal) || '0'}</p>
          <p className="text-xs font-medium text-text-muted mt-1">{currentRab.length} rencana pengeluaran</p>
        </Card>
      </div>

      {currentRab.length === 0 && (
        <EmptyState
          icon={<Plus size={20} />}
          title="Belum ada pos anggaran"
          description={`Susun rencana pengeluaran ${rabKas(target)} supaya realisasi bisa dibandingkan dengan rencana.`}
          actionLabel="Tambah Anggaran"
          onAction={() => setIsAdding(true)}
        />
      )}

      {/* Mobile Card View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {currentRab.map((row) => (
          <Card key={row.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-positive-soft text-positive border border-positive text-[10px] font-semibold uppercase">
                  {row.group}
                </span>
                <h4 className="mt-1 text-sm font-semibold text-text">{row.uraian}</h4>
                <p className="text-xs font-semibold text-text-muted mt-0.5">
                  {row.vol} {row.sat} × Rp {formatRibuan(row.hs)}
                </p>
              </div>

              <button
                onClick={() => setDeleteTargetId(row.id)}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-text-muted hover:text-negative hover:bg-negative-soft transition cursor-pointer"
                title="Hapus Pos"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Total tahun ini:</span>
              <span className="font-semibold text-text text-sm num">Rp {formatRibuan(row.total)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-head">
                <th className="px-3 py-3">Group</th>
                <th className="px-3 py-3 min-w-[200px]">Keterangan Anggaran</th>
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
                <th className="px-3 py-3 text-right bg-surface-sunken font-semibold text-text">Total Setahun</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentRab.map((row) => (
                <tr key={row.id} className="transition">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-surface-sunken text-text-muted border border-border text-[10px] font-semibold uppercase">{row.group}</span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-text">{row.uraian}</td>
                  <td className="px-3 py-2.5 text-center font-semibold text-text-muted">{row.vol}</td>
                  <td className="px-3 py-2.5 text-center text-text-muted">{row.sat}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-text-muted num">
                    Rp {formatRibuan(row.hs)}
                  </td>

                  {viewMode === 'single' ? (
                    <>
                      <td className="px-3 py-2.5 text-right num text-text-muted">{formatRibuan(row.w[0]) || '—'}</td>
                      <td className="px-3 py-2.5 text-right num text-text-muted">{formatRibuan(row.w[1]) || '—'}</td>
                      <td className="px-3 py-2.5 text-right num text-text-muted">{formatRibuan(row.w[2]) || '—'}</td>
                      <td className="px-3 py-2.5 text-right num text-text-muted">{formatRibuan(row.w[3]) || '—'}</td>
                    </>
                  ) : (
                    row.months.map((val, idx) => (
                      <td key={idx} className="px-2 py-2.5 text-right num text-text-muted">
                        {val > 0 ? formatRibuan(val) : '—'}
                      </td>
                    ))
                  )}

                  <td className="px-3 py-2.5 text-right font-semibold text-text num">Rp {formatRibuan(row.total)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setDeleteTargetId(row.id)}
                      className="p-1 text-text-subtle hover:text-negative hover:bg-negative-soft rounded-lg transition"
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

      <ConfirmDialog open={Boolean(deleteTargetId)} title="Hapus rencana" message="Hapus rencana anggaran ini?" confirmLabel="Ya, Hapus" onConfirm={() => { if (deleteTargetId) s.delRab(target, deleteTargetId); setDeleteTargetId(null) }} onCancel={() => setDeleteTargetId(null)} />

      {isAdding && (
        <Modal
          open
          onClose={() => setIsAdding(false)}
          size="lg"
          title={`Tambah Rencana Anggaran — ${rabKas(target)}`}
        >
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Jenis Pengeluaran</label>
                  <select value={newRow.group} onChange={(e) => {
                      const group = e.target.value
                      const start = group === 'CICILAN' ? bulanMulai : 0
                      if (group !== 'CICILAN') setBulanMulai(0)
                      const months = buildMonths(newRow.hs, newRow.vol || 1, start, bulanAktif)
                      setNewRow({ ...newRow, group, months, w: splitWeekly(months) })
                    }} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium outline-none focus:border-accent">
                    <option value="RUTIN">Rutin — tiap bulan ada</option>
                    <option value="PERIODIK">Periodik — kadang-kadang</option>
                    <option value="INSIDENTAL">Incidental — tidak terduga</option>
                    <option value="CICILAN">Cicilan — bayar hutang</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Satuan</label>
                  <input type="text" value={newRow.sat} onChange={(e) => setNewRow({ ...newRow, sat: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium outline-none focus:border-accent" placeholder="bln, kali, unit" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Untuk apa?</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Belanja Dapur Mingguan"
                  value={newRow.uraian}
                  onChange={(e) => setNewRow({ ...newRow, uraian: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Volume</label>
                  <input
                    type="number"
                    min="1"
                    value={newRow.vol}
                    onChange={(e) => {
                      const vol = Number(e.target.value) || 1
                      const months = buildMonths(newRow.hs, vol, newRow.group === 'CICILAN' ? bulanMulai : 0, bulanAktif)
                      setNewRow({ ...newRow, vol, months, w: splitWeekly(months) })
                    }}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Harga Satuan / Anggaran Bulanan (Rp)</label>
                  <RupiahInput
                    value={newRow.hs}
                    onChange={(v) => {
                      const months = buildMonths(v, newRow.vol || 1, newRow.group === 'CICILAN' ? bulanMulai : 0, bulanAktif)
                      setNewRow({ ...newRow, hs: v, months, w: splitWeekly(months) })
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                {newRow.group === 'CICILAN' ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-text-muted block mb-1">Cicilan mulai bulan</label>
                      <select
                        value={bulanMulai}
                        onChange={(e) => {
                          const start = Number(e.target.value)
                          const sampai = Math.min(11, Math.max(start, bulanMulai + bulanAktif - 1))
                          setBulanMulai(start)
                          setBulanAktif(sampai - start + 1)
                          const months = buildMonths(newRow.hs, newRow.vol || 1, start, sampai - start + 1)
                          setNewRow({ ...newRow, months, w: splitWeekly(months) })
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:border-accent"
                      >
                        {monthShorts.map((m, i) => (<option key={m} value={i}>{m}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-muted block mb-1">Sampai bulan</label>
                      <select
                        value={bulanMulai + bulanAktif - 1}
                        onChange={(e) => {
                          const sampai = Math.max(bulanMulai, Number(e.target.value))
                          setBulanAktif(sampai - bulanMulai + 1)
                          const months = buildMonths(newRow.hs, newRow.vol || 1, bulanMulai, sampai - bulanMulai + 1)
                          setNewRow({ ...newRow, months, w: splitWeekly(months) })
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:border-accent"
                      >
                        {monthShorts.map((m, i) => (<option key={m} value={i} disabled={i < bulanMulai}>{m}</option>))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-text-muted block mb-1">Berlaku berapa bulan dalam setahun?</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={bulanAktif}
                      onChange={(e) => {
                        const n = Math.max(1, Math.min(12, Math.round(Number(e.target.value) || 12)))
                        setBulanAktif(n)
                        setBulanMulai(0)
                        const months = buildMonths(newRow.hs, newRow.vol || 1, 0, n)
                        setNewRow({ ...newRow, months, w: splitWeekly(months) })
                      }}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent"
                    />
                  </div>
                )}
                <div className="rounded-lg bg-surface-sunken border border-border px-3 py-2 sm:col-span-2">
                  <p className="text-[11px] font-medium text-text-muted">{newRow.group === 'CICILAN' ? `Total cicilan (${bulanAktif} bulan × Rp ${formatRibuan((newRow.vol || 1) * newRow.hs)})` : 'Total setahun (otomatis)'}</p>
                  <p className="text-sm font-semibold text-text num">Rp {formatRibuan(newRow.months.reduce((sum, v) => sum + v, 0))}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-text-muted hover:bg-surface-sunken transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-on-fill text-xs font-semibold transition"
                >
                  Simpan Pos
                </button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  )
}
