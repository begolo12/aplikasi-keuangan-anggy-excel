import React, { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ArrowLeftRight,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { EmptyState } from '../common/EmptyState'
import { RupiahInput } from '../common/RupiahInput'
import { formatRibuan } from '../common/format'
import { Autocomplete } from '../common/Autocomplete'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { State, Tx, Ledger } from '../../store'
import { ledgerBalance, runningBalancesForYear, yearTransactions } from '../../finance'

interface TransaksiViewProps {
  store: State
  onOpenQuickTx: (defaultLedger?: Ledger) => void
  onOpenTransfer: () => void
}

export function TransaksiView({ store: s, onOpenQuickTx, onOpenTransfer }: TransaksiViewProps) {
  const [selectedLedger, setSelectedLedger] = useState<'all' | Ledger>('all')
  const [search, setSearch] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [editingTx, setEditingTx] = useState<Tx | null>(null)

  const txCurrentYear = useMemo(() => yearTransactions(s.txs, s.year), [s.txs, s.year])
  
  const runningMaster = useMemo(() => runningBalancesForYear(s.txs, 'master', s.year, s.saldoAwal), [s.txs, s.year, s.saldoAwal])
  const runningOp = useMemo(() => runningBalancesForYear(s.txs, 'operasional', s.year, 0), [s.txs, s.year])
  const runningKel = useMemo(() => runningBalancesForYear(s.txs, 'keluarga', s.year, 0), [s.txs, s.year])

  const getBal = (t: Tx) => {
    if (t.ledger === 'master') return runningMaster.get(t.id) ?? 0
    if (t.ledger === 'operasional') return runningOp.get(t.id) ?? 0
    return runningKel.get(t.id) ?? 0
  }

  const filteredTxs = useMemo(() => {
    let list = txCurrentYear
    if (selectedLedger !== 'all') {
      list = list.filter((t) => t.ledger === selectedLedger)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.uraian.toLowerCase().includes(q) ||
          t.nsb.toLowerCase().includes(q) ||
          t.pos.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  }, [txCurrentYear, selectedLedger, search])

  const balMaster = ledgerBalance(txCurrentYear, 'master', s.saldoAwal)
  const balOperasional = ledgerBalance(txCurrentYear, 'operasional', 0)
  const balKeluarga = ledgerBalance(txCurrentYear, 'keluarga', 0)

  const nsbSuggestions = useMemo(() => {
    const fromTx = s.txs.map((t) => t.nsb)
    const fromPiutang = s.piutangs.map((p) => p.nsb)
    const fromAsset = s.assets.map((a) => a.atasNama)
    const fromCustom = s.customNsbList || []
    return Array.from(new Set([...fromCustom, ...fromTx, ...fromPiutang, ...fromAsset])).filter(Boolean)
  }, [s.txs, s.piutangs, s.assets, s.customNsbList])
  const posSuggestions = useMemo(() => {
    const fromTx = s.txs.map((t) => t.pos)
    const fromCustom = s.customPosList || []
    return Array.from(new Set([...fromCustom, ...fromTx, 'RUTIN', 'PINDAH SALDO', 'GAJI', 'BELANJA', 'ASET', 'PIUTANG', 'PAJAK', 'SERVIS'])).filter(Boolean) as string[]
  }, [s.txs, s.customPosList])

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTx) return
    if (!editingTx.nsb.trim()) return
    s.updTx(editingTx.id, {
      tanggal: editingTx.tanggal,
      nsb: editingTx.nsb.trim().toUpperCase(),
      pos: editingTx.pos.trim().toUpperCase() || 'RUTIN',
      uraian: editingTx.uraian,
      penerimaan: Number(editingTx.penerimaan) || 0,
      pengeluaran: Number(editingTx.pengeluaran) || 0,
      ledger: editingTx.ledger,
    })
    setEditingTx(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* 3 Kas pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <button
          onClick={() => setSelectedLedger(selectedLedger === 'master' ? 'all' : 'master')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedLedger === 'master' ? 'bg-[#c2e7ff] border-[#c2e7ff] text-[#001d35]' : 'bg-white border-[#e0e2e0] hover:border-[#747775]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{s.ledgerLabels?.master || 'Kas Utama'}</span>
            <Badge variant="brand">Pusat</Badge>
          </div>
          <p className="mt-1.5 text-lg font-bold num truncate">Rp {formatRibuan(balMaster) || '0'}</p>
          <p className="text-[11px] text-[#747775]">Uang pusat, sebelum dibagi</p>
        </button>

        <button
          onClick={() => setSelectedLedger(selectedLedger === 'operasional' ? 'all' : 'operasional')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedLedger === 'operasional' ? 'bg-[#c2e7ff] border-[#c2e7ff] text-[#001d35]' : 'bg-white border-[#e0e2e0] hover:border-[#747775]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{s.ledgerLabels?.operasional || 'Kas Usaha'}</span>
            <Badge variant="success">Operasional</Badge>
          </div>
          <p className="mt-1.5 text-lg font-bold num truncate">Rp {formatRibuan(balOperasional) || '0'}</p>
          <p className="text-[11px] text-[#747775]">Untuk operasional harian</p>
        </button>

        <button
          onClick={() => setSelectedLedger(selectedLedger === 'keluarga' ? 'all' : 'keluarga')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition cursor-pointer ${
            selectedLedger === 'keluarga' ? 'bg-[#c2e7ff] border-[#c2e7ff] text-[#001d35]' : 'bg-white border-[#e0e2e0] hover:border-[#747775]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{s.ledgerLabels?.keluarga || 'Kas Keluarga'}</span>
            <Badge variant="warning">Keluarga</Badge>
          </div>
          <p className="mt-1.5 text-lg font-bold num truncate">Rp {formatRibuan(balKeluarga) || '0'}</p>
          <p className="text-[11px] text-[#747775]">Untuk rumah tangga</p>
        </button>
      </div>

      {/* Control Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => setSelectedLedger('all')} className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${selectedLedger === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Semua Kas</button>
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari keterangan atau kategori..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button onClick={onOpenTransfer} className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition inline-flex items-center gap-1.5 cursor-pointer">
              <ArrowLeftRight size={14} /> Pindah Saldo
            </button>
            <button onClick={() => onOpenQuickTx(selectedLedger === 'all' ? 'master' : selectedLedger)} className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer">
              <Plus size={14} /> Tambah Transaksi
            </button>
          </div>
        </div>
      </Card>

      {/* Mobile Card List (< 640px) */}
      <div className="block sm:hidden space-y-2.5">
        {filteredTxs.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={<Filter size={20} />}
              title="Tidak Ada Data Transaksi"
              description="Belum ada catatan mutasi kas yang sesuai dengan filter."
              actionLabel="Catat Transaksi"
              onAction={() => onOpenQuickTx('master')}
            />
          </Card>
        ) : (
          filteredTxs.map((tx) => {
            const bal = getBal(tx)
            const isIncome = tx.penerimaan > 0
            return (
              <Card key={tx.id} className="p-4 border-slate-200/80 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isIncome ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                    </div>
                    <div>
                      <Badge variant={tx.ledger === 'master' ? 'brand' : tx.ledger === 'operasional' ? 'success' : 'accent'}>
                        {tx.ledger === 'master' ? 'Kas Utama' : tx.ledger === 'operasional' ? 'Kas Usaha' : 'Kas Keluarga'}
                      </Badge>
                      <span className="text-[11px] text-slate-500 ml-2 font-medium">{tx.tanggal}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-sm num ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isIncome ? `+Rp ${formatRibuan(tx.penerimaan)}` : `-Rp ${formatRibuan(tx.pengeluaran)}`}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium num">Sisa: Rp {formatRibuan(bal)}</p>
                  </div>
                </div>

                <p className="mt-2 text-xs font-bold text-slate-900 line-clamp-2">{tx.uraian}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    {tx.pos && <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-700">{tx.pos}</span>}
                    {tx.nsb && <span className="text-slate-500">{tx.nsb}</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTx(tx)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition cursor-pointer"
                      title="Edit"
                      aria-label="Edit Transaksi"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(tx.id)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus"
                      aria-label="Hapus Transaksi"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Desktop Transaction Table (>= 640px) */}
      <Card className="hidden sm:block overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Dompet Kas</th>
                <th className="px-4 py-3">Nama Orang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Uang Masuk</th>
                <th className="px-4 py-3 text-right">Uang Keluar</th>
                <th className="px-4 py-3 text-right">Sisa Kas</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12">
                    <EmptyState
                      icon={<Filter size={20} />}
                      title="Tidak Ada Data Transaksi"
                      description="Belum ada catatan mutasi kas yang sesuai dengan filter atau kata kunci pencarian Anda."
                      actionLabel="Catat Transaksi Pertama"
                      onAction={() => onOpenQuickTx('master')}
                    />
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const bal = getBal(tx)
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition group">
                      <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{tx.tanggal}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={tx.ledger === 'master' ? 'brand' : tx.ledger === 'operasional' ? 'success' : 'accent'}>
                          {tx.ledger === 'master' ? 'Kas Utama' : tx.ledger === 'operasional' ? 'Kas Usaha' : 'Kas Keluarga'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{tx.nsb}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{tx.pos}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs truncate">{tx.uraian}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 num whitespace-nowrap">
                        {tx.penerimaan > 0 ? `Rp ${formatRibuan(tx.penerimaan)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-700 num whitespace-nowrap">
                        {tx.pengeluaran > 0 ? `Rp ${formatRibuan(tx.pengeluaran)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 num whitespace-nowrap">Rp {formatRibuan(bal)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition cursor-pointer"
                            title="Edit Transaksi"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(tx.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog open={Boolean(deleteTargetId)} title="Hapus Transaksi" message="Hapus transaksi ini? Sisa kas akan otomatis menyesuaikan." confirmLabel="Ya, Hapus" onConfirm={() => { if (deleteTargetId) s.delTx(deleteTargetId); setDeleteTargetId(null) }} onCancel={() => setDeleteTargetId(null)} />

      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingTx(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 p-5 z-10 animate-scale max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 tracking-tight pb-3 border-b border-slate-100">Ubah Transaksi</h3>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal</label>
                  <input type="date" required value={editingTx.tanggal} onChange={(e) => setEditingTx({ ...editingTx, tanggal: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Dompet Kas</label>
                  <select value={editingTx.ledger} onChange={(e) => setEditingTx({ ...editingTx, ledger: e.target.value as Ledger })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900">
                    <option value="master">Kas Utama — uang pusat</option>
                    <option value="operasional">Kas Usaha — operasional</option>
                    <option value="keluarga">Kas Keluarga — rumah tangga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Orang <span className="text-rose-500">*</span></label>
                  <Autocomplete value={editingTx.nsb} onChange={(v) => setEditingTx({ ...editingTx, nsb: v })} suggestions={nsbSuggestions} placeholder="Pilih orang" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Kategori</label>
                  <Autocomplete value={editingTx.pos} onChange={(v) => setEditingTx({ ...editingTx, pos: v })} suggestions={posSuggestions} placeholder="RUTIN, GAJI..." allowCreate />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Keterangan</label>
                <input
                  type="text"
                  required
                  value={editingTx.uraian}
                  onChange={(e) => setEditingTx({ ...editingTx, uraian: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Penerimaan (Rp)</label>
                  <RupiahInput
                    value={editingTx.penerimaan}
                    onChange={(v) => setEditingTx({ ...editingTx, penerimaan: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold num text-emerald-700 outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Pengeluaran (Rp)</label>
                  <RupiahInput
                    value={editingTx.pengeluaran}
                    onChange={(v) => setEditingTx({ ...editingTx, pengeluaran: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold num text-rose-700 outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-black shadow-xs transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
