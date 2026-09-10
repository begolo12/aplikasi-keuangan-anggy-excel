import { useState, useMemo } from 'react'
import { Plus, Trash2, Building2, TrendingUp, CreditCard } from 'lucide-react'
import { Card } from '../common/Card'
import { StatCard } from '../common/StatCard'
import { Badge } from '../common/Badge'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan } from '../common/format'
import { Autocomplete } from '../common/Autocomplete'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { Modal } from '../common/Modal'
import type { State, AssetRow } from '../../store'
import { assetDebt } from '../../finance'

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
    bunga: 0,
    tenor: 120,
    nilaiPasar: 0,
    tambah: 0,
  })

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const totalNilaiPerolehan = s.assets.reduce((sum, a) => sum + a.nilai, 0)
  const totalNilaiPasar = s.assets.reduce((sum, a) => sum + (a.nilaiPasar || a.nilai), 0)
  const totalHutang = s.assets.reduce((sum, a) => sum + assetDebt(a, todayStr).outstanding, 0)

  const atasNamaSuggestions = useMemo(() => {
    const fromAsset = s.assets.map((a) => a.atasNama)
    const fromTx = s.txs.map((t) => t.nsb)
    const fromPiutang = s.piutangs.map((p) => p.nsb)
    const fromCustom = s.customNsbList || []
    return Array.from(new Set([...fromCustom, ...fromAsset, ...fromTx, ...fromPiutang, 'ANGGY'])).filter(Boolean)
  }, [s.assets, s.txs, s.piutangs, s.customNsbList])

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAsset.nama.trim() || newAsset.nilai <= 0) return
    const normalizedAtasNama = newAsset.atasNama.trim().toUpperCase() || 'ANGGY'
    s.addAsset({
      ...newAsset,
      atasNama: normalizedAtasNama,
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
      bunga: 0,
      tenor: 120,
      nilaiPasar: 0,
      tambah: 0,
    })
  }

  const liveDebt = useMemo(() => {
    return assetDebt({
      id: 'preview',
      jenis: newAsset.jenis,
      nama: newAsset.nama,
      atasNama: newAsset.atasNama,
      tgl: newAsset.tgl,
      nilai: newAsset.nilai,
      dp: newAsset.dp,
      bunga: newAsset.bunga,
      tenor: newAsset.tenor,
      nilaiPasar: newAsset.nilaiPasar,
      tambah: 0,
    }, todayStr)
  }, [newAsset, todayStr])

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Harga Beli Semua Aset" value={`Rp ${formatRibuan(totalNilaiPerolehan) || '0'}`} subtitle={`${s.assets.length} barang`} variant="brand" icon={<Building2 size={16} />} />
        <StatCard title="Perkiraan Harga Sekarang" value={`Rp ${formatRibuan(totalNilaiPasar) || '0'}`} subtitle="Jika dijual hari ini" variant="income" icon={<TrendingUp size={16} />} />
        <StatCard title="Sisa Hutang Aset" value={`Rp ${formatRibuan(totalHutang) || '0'}`} subtitle="Otomatis berkurang sesuai bulan berjalan" variant="warning" icon={<CreditCard size={16} />} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-text">Daftar Aset & Cicilan KPR / Kendaraan</h3>
            <p className="text-xs font-medium text-text-muted">Sistem otomatis menghitung bulan berjalan, cicilan terbayar, dan sisa hutang per hari ini</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="self-start sm:self-auto px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-on-fill text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer">
            <Plus size={15} />
            <span>Tambah Aset</span>
          </button>
        </div>
      </Card>

      {s.assets.length === 0 ? (
        <EmptyState
          icon={<Building2 size={24} />}
          title="Belum Ada Aset Terdaftar"
          description="Catat rumah, KPR, kendaraan, atau barang berharga untuk memonitor sisa hutang dan kekayaan bersih otomatis."
          actionLabel="Tambah Aset Baru"
          onAction={() => setIsAdding(true)}
        />
      ) : (
        <>
          {/* Mobile Card List (< 768px) */}
          <div className="block md:hidden space-y-3">
            {s.assets.map((a) => {
              const debt = assetDebt(a, todayStr)
              const sudahTerbayar = debt.paidMonths * debt.monthlyPayment
              const isLunas = debt.paidMonths >= a.tenor || debt.outstanding === 0
              const progressPercent = a.tenor > 0 ? Math.min(100, Math.round((debt.paidMonths / a.tenor) * 100)) : 100

              return (
                <Card key={a.id} className="p-4 border-border bg-surface">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={a.jenis === 'PROPERTY' ? 'brand' : a.jenis === 'KENDARAAN' ? 'success' : 'neutral'}>
                          {a.jenis}
                        </Badge>
                        <Badge variant={isLunas ? 'success' : 'warning'}>
                          {isLunas ? 'Lunas' : `Berjalan ${debt.paidMonths}/${a.tenor} bln`}
                        </Badge>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold text-text">{a.nama}</h4>
                      <p className="text-xs text-text-muted font-medium mt-0.5">
                        a.n {a.atasNama} • Mulai: {a.tgl}
                      </p>
                    </div>

                    <button
                      onClick={() => setDeleteTargetId(a.id)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-text-muted hover:text-negative hover:bg-negative-soft transition cursor-pointer"
                      title="Hapus Aset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Progress Cicilan */}
                  <div className="mt-3 pt-2 border-t border-border">
                    <div className="flex justify-between text-[11px] text-text-muted mb-1">
                      <span>Progres Cicilan ({progressPercent}%)</span>
                      <span className="font-semibold text-text-muted">{debt.paidMonths} dari {a.tenor} bln</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-sunken rounded-full overflow-hidden">
                      <div className="h-full bg-positive rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-muted font-medium text-[11px] block">Cicilan / Bulan</span>
                      <span className="font-semibold text-text num">Rp {formatRibuan(debt.monthlyPayment)}</span>
                    </div>
                    <div>
                      <span className="text-text-muted font-medium text-[11px] block">Sisa Hutang Riil</span>
                      <span className={`font-semibold text-sm num ${isLunas ? 'text-positive' : 'text-negative'}`}>
                        Rp {formatRibuan(debt.outstanding)}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted font-medium text-[11px] block">Sudah Terbayar</span>
                      <span className="font-semibold text-positive num">Rp {formatRibuan(sudahTerbayar)}</span>
                    </div>
                    <div>
                      <span className="text-text-muted font-medium text-[11px] block">Nilai Pasar</span>
                      <span className="font-semibold text-text num">Rp {formatRibuan(a.nilaiPasar)}</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <Card className="hidden md:block overflow-hidden border border-border">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="table-head">
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Nama Aset</th>
                    <th className="px-4 py-3">Mulai Akad</th>
                    <th className="px-4 py-3 text-right">Nilai Pokok</th>
                    <th className="px-4 py-3 text-right">Cicilan / Bln</th>
                    <th className="px-4 py-3 text-center">Bulan Berjalan</th>
                    <th className="px-4 py-3 text-right">Sudah Terbayar</th>
                    <th className="px-4 py-3 text-right font-semibold">Sisa Hutang Riil</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {s.assets.map((a) => {
                    const debt = assetDebt(a, todayStr)
                    const sudahTerbayar = debt.paidMonths * debt.monthlyPayment
                    const isLunas = debt.paidMonths >= a.tenor || debt.outstanding === 0

                    return (
                      <tr key={a.id} className="hover:bg-surface-sunken/60 transition">
                        <td className="px-4 py-3">
                          <Badge variant={a.jenis === 'PROPERTY' ? 'brand' : a.jenis === 'KENDARAAN' ? 'success' : 'neutral'}>
                            {a.jenis}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-text">{a.nama}</td>
                        <td className="px-4 py-3 text-text-muted font-semibold">{a.tgl}</td>
                        <td className="px-4 py-3 text-right font-semibold text-text num">Rp {formatRibuan(a.nilai)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-text-muted num">Rp {formatRibuan(debt.monthlyPayment)}</td>
                        <td className="px-4 py-3 text-center font-semibold text-text-muted">
                          {debt.paidMonths} / {a.tenor} bln
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-positive num">Rp {formatRibuan(sudahTerbayar)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-negative num bg-negative-soft/20">Rp {formatRibuan(debt.outstanding)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={isLunas ? 'success' : 'warning'}>
                            {isLunas ? 'Lunas' : 'Berjalan'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setDeleteTargetId(a.id)}
                            className="p-1.5 text-text-subtle hover:text-negative hover:bg-negative-soft rounded-lg transition"
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
        </>
      )}

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
        <Modal
          open
          onClose={() => setIsAdding(false)}
          size="lg"
          title="Tambah Aset Baru"
        >
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Jenis Aset</label>
                  <select value={newAsset.jenis} onChange={(e) => setNewAsset({ ...newAsset, jenis: e.target.value as AssetRow['jenis'] })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent">
                    <option value="PROPERTY">PROPERTY</option>
                    <option value="KENDARAAN">KENDARAAN</option>
                    <option value="GADGET">GADGET</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Nama Aset</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rumah Cluster Magnolia"
                    value={newAsset.nama}
                    onChange={(e) => setNewAsset({ ...newAsset, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Atas Nama <span className="text-negative">*</span></label>
                  <Autocomplete value={newAsset.atasNama} onChange={(v) => setNewAsset({ ...newAsset, atasNama: v })} suggestions={atasNamaSuggestions} placeholder="Pilih pemilik aset" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Tanggal Perolehan / Beli</label>
                  <input
                    type="date"
                    required
                    value={newAsset.tgl}
                    onChange={(e) => setNewAsset({ ...newAsset, tgl: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Nilai Beli / Pokok (Rp)</label>
                  <RupiahInput
                    value={newAsset.nilai}
                    onChange={(v) => setNewAsset({ ...newAsset, nilai: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold num text-accent outline-none focus:bg-surface focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">DP / Uang Muka (Rp)</label>
                  <RupiahInput
                    value={newAsset.dp}
                    onChange={(v) => setNewAsset({ ...newAsset, dp: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold num text-positive outline-none focus:bg-surface focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Tenor (Bulan)</label>
                  <input
                    type="number"
                    min="0"
                    value={newAsset.tenor}
                    onChange={(e) => setNewAsset({ ...newAsset, tenor: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Bunga Tahunan (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={Math.round(newAsset.bunga * 100)}
                    onChange={(e) => setNewAsset({ ...newAsset, bunga: (Number(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold outline-none focus:bg-surface focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Taksiran Pasar (Rp)</label>
                  <RupiahInput
                    value={newAsset.nilaiPasar}
                    onChange={(v) => setNewAsset({ ...newAsset, nilaiPasar: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold num text-accent outline-none focus:bg-surface focus:border-accent"
                  />
                </div>
              </div>

              {newAsset.nilai > 0 && newAsset.tenor > 0 && (
                <div className="p-3.5 bg-surface-sunken border border-border rounded-lg text-xs space-y-1.5 animate-in">
                  <div className="flex justify-between font-semibold text-text-muted">
                    <span>Cicilan per Bulan:</span>
                    <span className="num font-semibold text-text">Rp {formatRibuan(liveDebt.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Bulan Sudah Berjalan:</span>
                    <span className="font-semibold text-text">{liveDebt.paidMonths} dari {newAsset.tenor} bulan</span>
                  </div>
                  <div className="flex justify-between text-positive font-semibold">
                    <span>Otomatis Terbayar:</span>
                    <span className="num font-semibold">Rp {formatRibuan(liveDebt.paidMonths * liveDebt.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border text-negative font-semibold">
                    <span>Sisa Hutang Riil Hari Ini:</span>
                    <span className="num text-sm">Rp {formatRibuan(liveDebt.outstanding)}</span>
                  </div>
                </div>
              )}

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
                  Simpan Aset
                </button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  )
}
