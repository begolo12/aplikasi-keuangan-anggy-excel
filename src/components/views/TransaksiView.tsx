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
import { RupiahInput, formatRibuan } from '../common/RupiahInput'
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

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTx) return
    s.updTx(editingTx.id, {
      tanggal: editingTx.tanggal,
      nsb: editingTx.nsb,
      pos: editingTx.pos,
      uraian: editingTx.uraian,
      penerimaan: Number(editingTx.penerimaan) || 0,
      pengeluaran: Number(editingTx.pengeluaran) || 0,
      ledger: editingTx.ledger,
    })
    setEditingTx(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* 3 Ledger Selection Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <button
          onClick={() => setSelectedLedger(selectedLedger === 'master' ? 'all' : 'master')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition active:scale-98 ${
            selectedLedger === 'master'
              ? 'bg-[#e8f5e9] border-[#52b788] ring-2 ring-[#52b788]/20 shadow-xs'
              : 'bg-white border-[#e2ece5] hover:border-[#cbdcd2]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">0 — Master</span>
            <Badge variant="brand">Master</Badge>
          </div>
          <p className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-black text-[#1b4332] num truncate">
            Rp {formatRibuan(balMaster) || '0'}
          </p>
        </button>

        <button
          onClick={() => setSelectedLedger(selectedLedger === 'operasional' ? 'all' : 'operasional')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition active:scale-98 ${
            selectedLedger === 'operasional'
              ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/20 shadow-xs'
              : 'bg-white border-[#e2ece5] hover:border-[#cbdcd2]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">1 — Operasional</span>
            <Badge variant="success">Operasional</Badge>
          </div>
          <p className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-black text-teal-800 num truncate">
            Rp {formatRibuan(balOperasional) || '0'}
          </p>
        </button>

        <button
          onClick={() => setSelectedLedger(selectedLedger === 'keluarga' ? 'all' : 'keluarga')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition active:scale-98 ${
            selectedLedger === 'keluarga'
              ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
              : 'bg-white border-[#e2ece5] hover:border-[#cbdcd2]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">2 — Keluarga</span>
            <Badge variant="accent">Keluarga</Badge>
          </div>
          <p className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-black text-[#2d6a4f] num truncate">
            Rp {formatRibuan(balKeluarga) || '0'}
          </p>
        </button>
      </div>

      {/* Control Bar */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedLedger('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedLedger === 'all'
                  ? 'bg-[#1b4332] text-white shadow-xs'
                  : 'bg-[#edf6f0] text-slate-700 hover:bg-[#e0efe5]'
              }`}
            >
              Semua
            </button>
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari uraian / pos..."
                className="w-full pl-9 pr-3 py-2 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2d6a4f]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenTransfer}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-[#edf6f0] hover:bg-[#e0efe5] text-[#2d6a4f] text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <ArrowLeftRight size={14} />
              <span>Transfer</span>
            </button>
            <button
              onClick={() => onOpenQuickTx(selectedLedger === 'all' ? 'master' : selectedLedger)}
              className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-black shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Catat</span>
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
              <Card key={tx.id} className="p-4 border-[#e2ece5] bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-[#e4f6ef] text-[#136149]' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                    </div>
                    <div>
                      <Badge
                        variant={
                          tx.ledger === 'master'
                            ? 'brand'
                            : tx.ledger === 'operasional'
                            ? 'success'
                            : 'accent'
                        }
                      >
                        {tx.ledger}
                      </Badge>
                      <span className="text-[11px] text-slate-400 ml-2 font-medium">{tx.tanggal}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-black text-sm num ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isIncome ? `+Rp ${formatRibuan(tx.penerimaan)}` : `-Rp ${formatRibuan(tx.pengeluaran)}`}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold num">Saldo: Rp {formatRibuan(bal)}</p>
                  </div>
                </div>

                <p className="mt-2 text-xs font-bold text-[#0f291e] line-clamp-2">{tx.uraian}</p>

                <div className="mt-3 pt-2.5 border-t border-[#f0f6f2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    {tx.pos && <span className="bg-[#f2f7f4] px-2 py-0.5 rounded-md font-bold text-slate-600">{tx.pos}</span>}
                    {tx.nsb && <span className="text-slate-400">{tx.nsb}</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTx(tx)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-[#1c543c] hover:bg-[#edf6f0] transition"
                      title="Edit"
                      aria-label="Edit Transaksi"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(tx.id)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
      <Card className="hidden sm:block overflow-hidden border border-[#e2ece5]">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8faf9] border-b border-[#e2ece5] text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Ledger</th>
                <th className="px-4 py-3">NSB</th>
                <th className="px-4 py-3">Pos</th>
                <th className="px-4 py-3">Uraian Transaksi</th>
                <th className="px-4 py-3 text-right">Penerimaan (+)</th>
                <th className="px-4 py-3 text-right">Pengeluaran (-)</th>
                <th className="px-4 py-3 text-right">Saldo Kas</th>
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
                    <tr key={tx.id} className="hover:bg-[#f4f8f5]/60 transition group">
                      <td className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{tx.tanggal}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            tx.ledger === 'master'
                              ? 'brand'
                              : tx.ledger === 'operasional'
                              ? 'success'
                              : 'accent'
                          }
                        >
                          {tx.ledger}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">{tx.nsb}</td>
                      <td className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">{tx.pos}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs truncate">{tx.uraian}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 num whitespace-nowrap">
                        {tx.penerimaan > 0 ? `Rp ${formatRibuan(tx.penerimaan)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-700 num whitespace-nowrap">
                        {tx.pengeluaran > 0 ? `Rp ${formatRibuan(tx.pengeluaran)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-[#1b4332] num whitespace-nowrap bg-[#edf6f0]/40">
                        Rp {formatRibuan(bal)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#2d6a4f] hover:bg-[#edf6f0] transition"
                            title="Edit Transaksi"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Hapus Transaksi Kas"
        message="Apakah Anda yakin ingin menghapus catatan mutasi kas ini? Perhitungan saldo berjalan akan disesuaikan otomatis."
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteTargetId) s.delTx(deleteTargetId)
          setDeleteTargetId(null)
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setEditingTx(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#e2ece5] p-5 sm:p-6 z-10 animate-scale max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base sm:text-lg text-[#132a22] tracking-tight pb-3 border-b border-slate-100">
              Edit Catatan Transaksi
            </h3>
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={editingTx.tanggal}
                    onChange={(e) => setEditingTx({ ...editingTx, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2d6a4f]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Ledger</label>
                  <select
                    value={editingTx.ledger}
                    onChange={(e) => setEditingTx({ ...editingTx, ledger: e.target.value as Ledger })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2d6a4f]"
                  >
                    <option value="master">0 — Master</option>
                    <option value="operasional">1 — Operasional</option>
                    <option value="keluarga">2 — Keluarga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">NSB</label>
                  <input
                    type="text"
                    value={editingTx.nsb}
                    onChange={(e) => setEditingTx({ ...editingTx, nsb: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2d6a4f]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Pos</label>
                  <input
                    type="text"
                    value={editingTx.pos}
                    onChange={(e) => setEditingTx({ ...editingTx, pos: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Uraian</label>
                <input
                  type="text"
                  required
                  value={editingTx.uraian}
                  onChange={(e) => setEditingTx({ ...editingTx, uraian: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2d6a4f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Penerimaan (Rp)</label>
                  <RupiahInput
                    value={editingTx.penerimaan}
                    onChange={(v) => setEditingTx({ ...editingTx, penerimaan: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs font-bold num text-emerald-700 outline-none focus:bg-white focus:border-[#2d6a4f]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Pengeluaran (Rp)</label>
                  <RupiahInput
                    value={editingTx.pengeluaran}
                    onChange={(v) => setEditingTx({ ...editingTx, pengeluaran: v })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs font-bold num text-rose-700 outline-none focus:bg-white focus:border-[#2d6a4f]"
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
