import { useState, useMemo } from 'react'
import { Plus, Trash2, HandCoins, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '../common/Card'
import { StatCard } from '../common/StatCard'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan, kasLabel } from '../common/format'
import { Autocomplete } from '../common/Autocomplete'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { PelunasanModal } from '../modals/PelunasanModal'
import type { State, PiutangRow } from '../../store'
import { outstandingPiutang } from '../../finance'
import { Modal } from '../common/Modal'

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
            <h3 className="text-sm font-semibold text-text">Piutang — Uang Dipinjamkan</h3>
            <p className="text-xs font-medium text-text-muted">Mencatat pinjaman mengurangi {kasLabel('master', s.ledgerLabels)}; pelunasan menambah {kasLabel('master', s.ledgerLabels)} dan tidak dihitung sebagai pendapatan.</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="self-start sm:self-auto px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-on-fill text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} /> Catat Pinjaman Baru
          </button>
        </div>
      </Card>

      {s.piutangs.length === 0 ? (
        <EmptyState
          icon={<HandCoins size={24} />}
          title="Belum Ada Catatan Piutang"
          description="Catatan peminjaman uang ke pihak lain atau pengembalian pinjaman akan muncul di sini."
          actionLabel="Catat Pinjaman Baru"
          onAction={() => setIsAdding(true)}
        />
      ) : (
        <>
          {/* Mobile Card List (< 768px) */}
          <div className="block md:hidden space-y-3">
            {s.piutangs.map((p) => {
              const isRepayment = p.terbit === 0 && p.lunas > 0
              const sisa = isRepayment ? 0 : Math.max(0, p.terbit - p.lunas)
              const isLunas = !isRepayment && sisa === 0 && p.terbit > 0
              return (
                <Card key={p.id} className="p-4 border-border bg-surface">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isRepayment ? 'success' : isLunas ? 'success' : sisa < p.terbit ? 'warning' : 'danger'}>
                          {isRepayment ? 'Pelunasan' : isLunas ? 'Lunas' : sisa < p.terbit ? 'Sebagian' : 'Belum Lunas'}
                        </Badge>
                        <span className="text-[11px] text-text-muted font-semibold">{p.tgl}</span>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold text-text">{p.nsb}</h4>
                      <p className="text-xs text-text-muted font-medium mt-0.5">{p.uraian}</p>
                    </div>

                    <button
                      onClick={() => setDeleteTargetId(p.id)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-text-muted hover:text-negative hover:bg-negative-soft transition cursor-pointer"
                      title="Hapus Piutang"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-muted font-medium text-[11px] block">{isRepayment ? 'Pelunasan Diterima' : 'Dipinjamkan'}</span>
                      <span className="font-semibold text-text num">Rp {formatRibuan(isRepayment ? p.lunas : p.terbit)}</span>
                    </div>
                    <div>
                      <span className="text-text-muted font-medium text-[11px] block">{isRepayment ? 'Status' : 'Sisa Belum Kembali'}</span>
                      <span className={`font-semibold text-sm num ${isRepayment || isLunas ? 'text-positive' : 'text-negative'}`}>
                        {isRepayment ? 'Tercatat' : `Rp ${formatRibuan(sisa)}`}
                      </span>
                    </div>
                  </div>

                  {!isRepayment && !isLunas && (
                    <div className="mt-3 pt-2.5 border-t border-border">
                      <button onClick={() => setPelunasanTarget(p)} className="w-full py-2 px-3 bg-accent hover:bg-accent-hover text-on-fill rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                        <HandCoins size={14} /> Catat Pembayaran Kembali
                      </button>
                    </div>
                  )}
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
                <tbody className="divide-y divide-border">
                  {s.piutangs.map((p) => {
                    const isRepayment = p.terbit === 0 && p.lunas > 0
                    const sisa = isRepayment ? 0 : Math.max(0, p.terbit - p.lunas)
                    const isLunas = !isRepayment && sisa === 0 && p.terbit > 0
                    return (
                      <tr key={p.id} className="hover:bg-surface-sunken/60 transition">
                        <td className="px-4 py-3 font-semibold text-text-muted">{p.tgl}</td>
                        <td className="px-4 py-3 font-semibold text-text">{p.nsb}</td>
                        <td className="px-4 py-3 font-medium text-text-muted">{p.uraian}</td>
                        <td className="px-4 py-3 text-right font-semibold text-text num">
                          {p.terbit > 0 ? `Rp ${formatRibuan(p.terbit)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-positive num">
                          {p.lunas > 0 ? `Rp ${formatRibuan(p.lunas)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-negative num bg-negative-soft/20">
                          {isRepayment ? '—' : `Rp ${formatRibuan(sisa)}`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={isRepayment ? 'success' : isLunas ? 'success' : sisa < p.terbit ? 'warning' : 'danger'}>
                            {isRepayment ? 'Pelunasan' : isLunas ? 'Lunas' : sisa < p.terbit ? 'Sebagian' : 'Belum Lunas'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isRepayment && !isLunas && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPelunasanTarget(p)}
                                title="Catat Pelunasan"
                              >
                                Bayar
                              </Button>
                            )}
                            <button
                              onClick={() => setDeleteTargetId(p.id)}
                              className="p-1.5 text-text-subtle hover:text-negative hover:bg-negative-soft rounded-lg transition"
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
        </>
      )}

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
        <Modal
          open
          onClose={() => setIsAdding(false)}
          size="md"
          title="Catat Pinjaman Baru"
          description="Siapa yang pinjam, untuk apa, dan berapa jumlahnya."
        >
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Tanggal Pinjam</label>
                  <input type="date" required value={newPiutang.tgl} onChange={(e) => setNewPiutang({ ...newPiutang, tgl: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Nama Peminjam <span className="text-negative">*</span></label>
                  <Autocomplete value={newPiutang.nsb} onChange={(v) => setNewPiutang({ ...newPiutang, nsb: v })} suggestions={nsbSuggestions} placeholder="Pilih atau ketik nama" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Untuk keperluan apa?</label>
                <input type="text" required value={newPiutang.uraian} onChange={(e) => setNewPiutang({ ...newPiutang, uraian: e.target.value })} placeholder="Mis. Talangan usaha sementara" className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium outline-none focus:border-accent" />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Jumlah Dipinjamkan (Rp)</label>
                <RupiahInput
                  required
                  value={newPiutang.terbit}
                  onChange={(v) => setNewPiutang({ ...newPiutang, terbit: v })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-semibold num text-accent outline-none focus:bg-surface focus:border-accent"
                />
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
                  Terbitkan Piutang
                </button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  )
}
