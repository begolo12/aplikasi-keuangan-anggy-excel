import {
  ArrowUpRight,
  ArrowDownRight,
  HandCoins,
  Plus,
  ArrowLeftRight,
  ChevronRight,
  CreditCard,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { formatRibuan } from '../common/RupiahInput'
import type { State, Ledger } from '../../store'
import {
  consolidatedExpense,
  consolidatedIncome,
  isTransfer,
  ledgerBalance,
  outstandingPiutang,
  rabMonthlyTotals,
  yearTransactions,
} from '../../finance'

interface DashboardViewProps {
  store: State
  onNavigate: (tab: any) => void
  onOpenQuickTx: (defaultLedger?: Ledger) => void
  onOpenTransfer: () => void
}

export function DashboardView({ store: s, onNavigate, onOpenQuickTx, onOpenTransfer }: DashboardViewProps) {
  const currentMonthIdx = new Date().getMonth()
  const txCurrentYear = yearTransactions(s.txs, s.year)

  const balMaster = ledgerBalance(txCurrentYear, 'master', s.saldoAwal)
  const balOperasional = ledgerBalance(txCurrentYear, 'operasional', 0)
  const balKeluarga = ledgerBalance(txCurrentYear, 'keluarga', 0)
  const totalKasTersedia = balMaster + balOperasional + balKeluarga

  const totalIncome = consolidatedIncome(txCurrentYear)
  const totalExpense = consolidatedExpense(txCurrentYear)

  const totalPiutang = outstandingPiutang(s.piutangs)

  const riOperasional = txCurrentYear
    .filter((t) => t.ledger === 'operasional' && Number(t.tanggal.slice(5, 7)) === currentMonthIdx + 1 && !isTransfer(t))
    .reduce((sum, t) => sum + t.pengeluaran, 0)

  const riKeluarga = txCurrentYear
    .filter((t) => t.ledger === 'keluarga' && Number(t.tanggal.slice(5, 7)) === currentMonthIdx + 1 && !isTransfer(t))
    .reduce((sum, t) => sum + t.pengeluaran, 0)

  const raOperasional = rabMonthlyTotals(s.rabAnggy)[currentMonthIdx] || 0
  const raKeluarga = rabMonthlyTotals(s.rabKeluarga)[currentMonthIdx] || 0

  const devOp = raOperasional - riOperasional
  const devKel = raKeluarga - riKeluarga

  const recentTxs = [...txCurrentYear].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 6)

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* 1. Header Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#dbeae0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5ec] text-[#1c543c] text-[10px] sm:text-[11px] font-black border border-[#c6e3d0]">
              Tahun Fiskal {s.year}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Bulan: {monthNames[currentMonthIdx]}</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#0f291e]">
            Ikhtisar Keuangan & Kas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Monitoring saldo 3 buku kas, realisasi anggaran belanja, dan aset.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pt-1 sm:pt-0">
          <button
            onClick={onOpenTransfer}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#f4f9f6] hover:bg-[#e6f2eb] text-[#1c543c] border border-[#dbeae0] text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
          >
            <ArrowLeftRight size={14} />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => onOpenQuickTx('master')}
            className="flex-1 sm:flex-none justify-center px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#1c543c] hover:bg-[#15422f] text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={15} />
            <span>Catat Mutasi</span>
          </button>
        </div>
      </div>

      {/* 2. 4-Column Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Likuiditas Kas */}
        <Card className="p-4 sm:p-5 border-[#c7e8d5] bg-gradient-to-br from-white via-white to-[#f0f9f3]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Kas Tersedia</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#e8f5ec] text-[#1c543c] border border-[#c6e3d0]">
              <CreditCard size={16} />
            </div>
          </div>
          <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-[#0f291e] num truncate">
            Rp {formatRibuan(totalKasTersedia) || '0'}
          </h3>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#edf4ef] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">3 Ledger Aktif</span>
            <span className="font-bold text-[#1c543c] bg-[#eaf5ee] px-2 py-0.5 rounded-md text-[10px]">
              Likuid 100%
            </span>
          </div>
        </Card>

        {/* Stat 2: Total Penerimaan */}
        <Card className="p-4 sm:p-5 border-[#cde5d6] bg-gradient-to-br from-white via-white to-[#f4faf6]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Penerimaan</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-emerald-700 num truncate">
            Rp {formatRibuan(totalIncome) || '0'}
          </h3>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#edf4ef] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Tahun {s.year}</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
              Cash In
            </span>
          </div>
        </Card>

        {/* Stat 3: Total Pengeluaran */}
        <Card className="p-4 sm:p-5 border-rose-200 bg-gradient-to-br from-white via-white to-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-rose-700 num truncate">
            Rp {formatRibuan(totalExpense) || '0'}
          </h3>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#edf4ef] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Tahun {s.year}</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">
              Cash Out
            </span>
          </div>
        </Card>

        {/* Stat 4: Piutang Tertagih */}
        <Card className="p-4 sm:p-5 border-amber-200 bg-gradient-to-br from-white via-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Piutang Aktif</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <HandCoins size={16} />
            </div>
          </div>
          <h3 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-amber-800 num truncate">
            Rp {formatRibuan(totalPiutang) || '0'}
          </h3>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#edf4ef] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {s.piutangs.filter((p) => p.terbit > p.lunas).length} catatan aktif
            </span>
            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[10px]">
              Outstanding
            </span>
          </div>
        </Card>
      </div>

      {/* 3. 3 Ledgers Cards Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        <Card className="p-4 sm:p-5 border-[#cde5d6] bg-white">
          <div className="flex items-center justify-between">
            <Badge variant="brand">0 — Master</Badge>
            <span className="text-[11px] font-bold text-slate-400">Pusat Dropping</span>
          </div>
          <p className="mt-2.5 sm:mt-3 text-xs font-semibold text-slate-500">Saldo Master</p>
          <h3 className="mt-1 text-xl sm:text-2xl font-black text-[#0f291e] num truncate">
            Rp {formatRibuan(balMaster) || '0'}
          </h3>
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#edf4ef] flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('transaksi')}
              className="font-bold text-[#1c543c] hover:underline inline-flex items-center gap-1"
            >
              Lihat Mutasi <ChevronRight size={14} />
            </button>
            <button
              onClick={() => onOpenQuickTx('master')}
              className="px-2.5 py-1 bg-[#eaf5ee] hover:bg-[#d8eedf] rounded-lg font-bold text-[#1c543c] text-[11px]"
            >
              + Catat
            </button>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-[#c2e4d2] bg-white">
          <div className="flex items-center justify-between">
            <Badge variant="success">1 — Operasional</Badge>
            <span className="text-[11px] font-bold text-slate-400">RAB Anggy</span>
          </div>
          <p className="mt-2.5 sm:mt-3 text-xs font-semibold text-slate-500">Saldo Operasional</p>
          <h3 className="mt-1 text-xl sm:text-2xl font-black text-[#0f291e] num truncate">
            Rp {formatRibuan(balOperasional) || '0'}
          </h3>
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#edf4ef] flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('transaksi')}
              className="font-bold text-[#136149] hover:underline inline-flex items-center gap-1"
            >
              Lihat Mutasi <ChevronRight size={14} />
            </button>
            <button
              onClick={() => onOpenQuickTx('operasional')}
              className="px-2.5 py-1 bg-[#e4f6ef] hover:bg-[#d0f0e3] rounded-lg font-bold text-[#136149] text-[11px]"
            >
              + Catat
            </button>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 border-[#cbe6d5] bg-white">
          <div className="flex items-center justify-between">
            <Badge variant="accent">2 — Keluarga</Badge>
            <span className="text-[11px] font-bold text-slate-400">RAB Keluarga</span>
          </div>
          <p className="mt-2.5 sm:mt-3 text-xs font-semibold text-slate-500">Saldo Keluarga</p>
          <h3 className="mt-1 text-xl sm:text-2xl font-black text-[#0f291e] num truncate">
            Rp {formatRibuan(balKeluarga) || '0'}
          </h3>
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#edf4ef] flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('transaksi')}
              className="font-bold text-[#2d6a4f] hover:underline inline-flex items-center gap-1"
            >
              Lihat Mutasi <ChevronRight size={14} />
            </button>
            <button
              onClick={() => onOpenQuickTx('keluarga')}
              className="px-2.5 py-1 bg-[#eaf5ee] hover:bg-[#d8eedf] rounded-lg font-bold text-[#1c543c] text-[11px]"
            >
              + Catat
            </button>
          </div>
        </Card>
      </div>

      {/* 4. Budget Comparison & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 sm:p-6 border-[#dbeae0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf4ef]">
              <div>
                <h3 className="font-black text-sm sm:text-base text-[#0f291e]">
                  Anggaran Bulan {monthNames[currentMonthIdx]}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Realisasi (RI) vs Rencana Anggaran (RA)</p>
              </div>
              <button
                onClick={() => onNavigate('rari')}
                className="text-xs font-bold text-[#1c543c] hover:underline"
              >
                Detail
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Operasional (Anggy)</span>
                  <span className="text-[#0f291e] num">
                    Rp {formatRibuan(riOperasional)} / {formatRibuan(raOperasional)}
                  </span>
                </div>
                <div className="w-full bg-[#eef5f0] rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      raOperasional > 0 && riOperasional > raOperasional ? 'bg-rose-500' : 'bg-[#40916c]'
                    }`}
                    style={{ width: `${Math.min(100, raOperasional > 0 ? (riOperasional / raOperasional) * 100 : 0)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Deviasi:</span>
                  <span className={devOp >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {devOp >= 0 ? `Surplus Rp ${formatRibuan(devOp)}` : `Overbudget Rp ${formatRibuan(Math.abs(devOp))}`}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Keluarga</span>
                  <span className="text-[#0f291e] num">
                    Rp {formatRibuan(riKeluarga)} / {formatRibuan(raKeluarga)}
                  </span>
                </div>
                <div className="w-full bg-[#eef5f0] rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      raKeluarga > 0 && riKeluarga > raKeluarga ? 'bg-rose-500' : 'bg-[#52b788]'
                    }`}
                    style={{ width: `${Math.min(100, raKeluarga > 0 ? (riKeluarga / raKeluarga) * 100 : 0)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Deviasi:</span>
                  <span className={devKel >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {devKel >= 0 ? `Surplus Rp ${formatRibuan(devKel)}` : `Overbudget Rp ${formatRibuan(Math.abs(devKel))}`}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 sm:p-6 border-[#dbeae0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf4ef]">
              <div>
                <h3 className="font-black text-sm sm:text-base text-[#0f291e]">Mutasi Kas Terbaru</h3>
                <p className="text-xs text-slate-500 font-medium">Histori transaksi kas keluar & masuk</p>
              </div>
              <button
                onClick={() => onNavigate('transaksi')}
                className="text-xs font-bold text-[#1c543c] hover:underline inline-flex items-center gap-1"
              >
                Lihat Semua <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-3 divide-y divide-[#f2f7f4]">
              {recentTxs.length === 0 ? (
                <div className="py-8 text-center text-xs font-medium text-slate-400">
                  Belum ada transaksi di tahun {s.year}.
                </div>
              ) : (
                recentTxs.map((tx) => {
                  const isIncome = tx.penerimaan > 0
                  return (
                    <div key={tx.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div
                          className={`w-7 sm:w-8 h-7 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome ? 'bg-[#e4f6ef] text-[#136149]' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {isIncome ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{tx.uraian}</p>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                            <span>{tx.tanggal}</span>
                            <span>•</span>
                            <span className="uppercase font-bold text-[#1c543c]">{tx.ledger}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`font-black num text-xs sm:text-sm ${
                            isIncome ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isIncome ? `+Rp ${formatRibuan(tx.penerimaan)}` : `-Rp ${formatRibuan(tx.pengeluaran)}`}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
