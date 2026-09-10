import {
  ArrowUpRight,
  ArrowDownRight,
  HandCoins,
  Plus,
  ArrowLeftRight,
  ChevronRight,
  CreditCard,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { Card } from '../common/Card'
import { StatCard } from '../common/StatCard'
import { Badge } from '../common/Badge'
import { formatRibuan } from '../common/format'
import { BarChart, DonutChart, type MonthBarData, type CategoryDonutData } from '../common/Charts'
import type { State, Ledger } from '../../store'
import type { TabKey } from '../layout/Sidebar'
import {
  closingBalance,
  consolidatedExpense,
  consolidatedIncome,
  isBudgetRealization,
  outstandingPiutang,
  rabMonthlyTotals,
  yearTransactions,
  monthlyTotals,
} from '../../finance'

interface DashboardViewProps {
  store: State
  onNavigate: (tab: TabKey) => void
  onOpenQuickTx: (defaultLedger?: Ledger) => void
  onOpenTransfer: () => void
}

export function DashboardView({ store: s, onNavigate, onOpenQuickTx, onOpenTransfer }: DashboardViewProps) {
  const currentMonthIdx = new Date().getMonth()
  const txCurrentYear = yearTransactions(s.txs, s.year)

  const balMaster = closingBalance(s.txs, 'master', s.year, s.saldoAwal)
  const balOperasional = closingBalance(s.txs, 'operasional', s.year)
  const balKeluarga = closingBalance(s.txs, 'keluarga', s.year)
  const totalKasTersedia = balMaster + balOperasional + balKeluarga

  const totalIncome = consolidatedIncome(txCurrentYear)
  const totalExpense = consolidatedExpense(txCurrentYear)
  const totalPiutang = outstandingPiutang(s.piutangs)

  const riOperasional = txCurrentYear
    .filter((t) => t.ledger === 'operasional' && Number(t.tanggal.slice(5, 7)) === currentMonthIdx + 1 && isBudgetRealization(t))
    .reduce((sum, t) => sum + t.pengeluaran, 0)

  const riKeluarga = txCurrentYear
    .filter((t) => t.ledger === 'keluarga' && Number(t.tanggal.slice(5, 7)) === currentMonthIdx + 1 && isBudgetRealization(t))
    .reduce((sum, t) => sum + t.pengeluaran, 0)

  const raOperasional = rabMonthlyTotals(s.rabAnggy)[currentMonthIdx] || 0
  const raKeluarga = rabMonthlyTotals(s.rabKeluarga)[currentMonthIdx] || 0

  const devOp = raOperasional - riOperasional
  const devKel = raKeluarga - riKeluarga

  const recentTxs = [...txCurrentYear].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 6)

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

  const mTotals = monthlyTotals(s.txs, s.year)

  const barData: MonthBarData[] = monthNames.map((name, i) => ({
    month: name,
    income: mTotals.income[i] || 0,
    expense: mTotals.expense[i] || 0,
  }))

  // Category breakdown for donut chart
  const categoryMap = new Map<string, number>()
  txCurrentYear.forEach((tx) => {
    if (tx.pengeluaran > 0 && isBudgetRealization(tx)) {
      const kat = tx.kategori || 'LAIN-LAIN'
      categoryMap.set(kat, (categoryMap.get(kat) || 0) + tx.pengeluaran)
    }
  })

  const palette = ['var(--c-chart-1)', 'var(--c-chart-2)', 'var(--c-chart-3)', 'var(--c-chart-4)', 'var(--c-chart-5)', 'var(--c-chart-6)', 'var(--c-chart-7)']
  const donutData: CategoryDonutData[] = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], idx) => ({
      label,
      value,
      color: palette[idx % palette.length],
    }))

  const opPercent = raOperasional > 0 ? Math.min(100, Math.round((riOperasional / raOperasional) * 100)) : 0
  const kelPercent = raKeluarga > 0 ? Math.min(100, Math.round((riKeluarga / raKeluarga) * 100)) : 0

  return (
    <div className="space-y-5 sm:space-y-6 animate-in">
      {/* Page intro */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-accent-soft text-accent text-[11px] font-medium tracking-wide">Tahun Buku {s.year}</span>
            <span className="text-xs text-text-subtle">{monthNames[currentMonthIdx]} · {s.year}</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-medium tracking-tight text-text leading-none">Ringkasan Keuangan</h1>
          <p className="text-[13px] text-text-subtle mt-1.5 max-w-xl">Pantau posisi ledger kas, realisasi anggaran bulanan, dan aset secara real-time.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onOpenTransfer} className="px-4 py-2 rounded-lg border border-border-strong bg-surface hover:bg-surface-sunken text-text text-xs font-medium transition inline-flex items-center gap-1.5 cursor-pointer">
            <ArrowLeftRight size={14} /> Transfer Kas
          </button>
          <button onClick={() => onOpenQuickTx('master')} className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium md-elevation-1 hover:md-elevation-2 transition inline-flex items-center gap-1.5 cursor-pointer">
            <Plus size={16} /> Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Hero + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-surface border border-border rounded-lg p-5 flex flex-col justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <CreditCard size={13} /> Total Kas Tersedia
            </p>
            <p className="mt-2.5 text-[28px] sm:text-[32px] font-semibold tracking-tight num leading-none text-text">Rp {formatRibuan(totalKasTersedia) || '0'}</p>
            <p className="mt-2 text-[11px] text-text-subtle">Akumulasi 3 kas · per {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 pt-3.5 border-t border-border">
            {[
              { label: 'Master', value: balMaster },
              { label: 'Operasional', value: balOperasional },
              { label: 'Keluarga', value: balKeluarga },
            ].map((r) => (
              <div key={r.label}>
                <p className="eyebrow">{r.label}</p>
                <p className="mt-1 text-xs font-semibold num truncate text-text">Rp {formatRibuan(r.value) || '0'}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Masuk" value={`Rp ${formatRibuan(totalIncome) || '0'}`} subtitle={`Jan–Des ${s.year}`} variant="income" icon={<ArrowDownRight size={18} />} />
          <StatCard title="Total Keluar" value={`Rp ${formatRibuan(totalExpense) || '0'}`} subtitle={`Jan–Des ${s.year}`} variant="expense" icon={<ArrowUpRight size={18} />} />
          <StatCard title="Piutang Berjalan" value={`Rp ${formatRibuan(totalPiutang) || '0'}`} subtitle={`${s.piutangs.filter((p) => p.terbit > p.lunas).length} tagihan aktif`} variant="warning" icon={<HandCoins size={18} />} />
        </div>
      </div>

      {/* Ledger ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'master' as const, badge: 'Master', desc: 'Kas pusat', value: balMaster, hint: 'Sumber pindah saldo' },
          { id: 'operasional' as const, badge: 'Operasional', desc: 'Anggaran operasional', value: balOperasional, hint: 'RAB Usaha' },
          { id: 'keluarga' as const, badge: 'Keluarga', desc: 'Anggaran keluarga', value: balKeluarga, hint: 'RAB Keluarga' },
        ].map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-center justify-between">
              <Badge variant="brand">{c.badge}</Badge>
              <span className="text-[11px] text-text-subtle">{c.hint}</span>
            </div>
            <p className="mt-3 text-xs text-text-subtle">{c.desc}</p>
            <p className="mt-1 text-[22px] font-bold tracking-tight num truncate text-text">Rp {formatRibuan(c.value) || '0'}</p>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <button onClick={() => onNavigate('transaksi')} className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1 cursor-pointer">
                Lihat transaksi <ChevronRight size={14} />
              </button>
              <button onClick={() => onOpenQuickTx(c.id)} className="px-3 py-1 rounded-lg bg-surface-sunken hover:bg-border-strong text-text text-xs font-medium cursor-pointer">
                Tambah
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Tren & komposisi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text flex items-center gap-2"><BarChart3 size={14} className="text-text-muted" /> Arus Kas Bulanan</h3>
                <p className="text-xs font-medium text-text-muted">Perbandingan kas masuk dan keluar · {s.year}</p>
              </div>
            </div>
            <BarChart data={barData} height={210} />
          </Card>
        </div>
        <div className="lg:col-span-5">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text flex items-center gap-2"><PieChartIcon size={14} className="text-text-muted" /> Komposisi Pengeluaran</h3>
                <p className="text-xs font-medium text-text-muted">Distribusi kategori · {s.year}</p>
              </div>
            </div>
            <DonutChart data={donutData} size={150} />
          </Card>
        </div>
      </div>

      {/* Anggaran & transaksi terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-text">Anggaran · {monthNames[currentMonthIdx]}</h3>
                <p className="text-xs font-medium text-text-muted">Realisasi vs rencana</p>
              </div>
              <button onClick={() => onNavigate('rari')} className="text-xs font-semibold text-text-muted hover:text-text cursor-pointer">Detail</button>
            </div>
            <div className="mt-4 space-y-5">
              {[
                { label: 'Operasional', ri: riOperasional, ra: raOperasional, pct: opPercent, dev: devOp },
                { label: 'Keluarga', ri: riKeluarga, ra: raKeluarga, pct: kelPercent, dev: devKel },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-text-muted">{r.label}</span>
                    <span className="font-semibold num text-text">Rp {formatRibuan(r.ri)} / {formatRibuan(r.ra)} · {r.pct}%</span>
                  </div>
                  <div className="w-full bg-surface-sunken rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${r.ra > 0 && r.ri > r.ra ? 'bg-negative' : 'bg-accent'}`} style={{ width: `${Math.min(100, r.ra > 0 ? (r.ri / r.ra) * 100 : 0)}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] font-medium text-text-muted">
                    <span>Sisa anggaran</span>
                    <span className={r.dev >= 0 ? 'text-positive font-semibold' : 'text-negative font-semibold'}>{r.dev >= 0 ? `+ Rp ${formatRibuan(r.dev)}` : `- Rp ${formatRibuan(Math.abs(r.dev))}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-7">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-text">Transaksi Terbaru</h3>
                <p className="text-xs font-medium text-text-muted">Aktivitas kas terkini</p>
              </div>
              <button onClick={() => onNavigate('transaksi')} className="text-xs font-semibold text-text-muted hover:text-text inline-flex items-center gap-1 cursor-pointer">Lihat semua <ChevronRight size={14} /></button>
            </div>
            <div className="mt-3 divide-y divide-border">
              {recentTxs.length === 0 ? (
                <div className="py-10 text-center text-xs font-medium text-text-muted">Belum ada transaksi di tahun {s.year}.</div>
              ) : (
                recentTxs.map((tx) => {
                  const isIncome = tx.penerimaan > 0
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isIncome ? 'bg-positive-soft text-positive border-positive' : 'bg-negative-soft text-negative border-negative'}`}>
                          {isIncome ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-text truncate">{tx.uraian}</p>
                          <p className="text-[11px] font-medium text-text-muted mt-0.5 truncate">{tx.tanggal} · <span className="uppercase tracking-wide font-semibold">{tx.ledger}</span></p>
                        </div>
                      </div>
                      <p className={`text-[13px] font-semibold num shrink-0 ${isIncome ? 'text-positive' : 'text-text'}`}>{isIncome ? `+ Rp ${formatRibuan(tx.penerimaan)}` : `- Rp ${formatRibuan(tx.pengeluaran)}`}</p>
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
