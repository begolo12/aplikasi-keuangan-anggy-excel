import { TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '../common/Card'
import { StatCard } from '../common/StatCard'
import { formatRibuan } from '../common/format'
import type { State } from '../../store'
import { monthlyTotals } from '../../finance'

interface CashflowViewProps {
  store: State
}

export function CashflowView({ store: s }: CashflowViewProps) {
  const totals = monthlyTotals(s.txs, s.year)

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

  const totalIn = totals.income.reduce((a, b) => a + b, 0)
  const totalOut = totals.expense.reduce((a, b) => a + b, 0)
  const totalNet = totalIn - totalOut

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Total Uang Masuk" value={`Rp ${formatRibuan(totalIn) || '0'}`} subtitle={`Jan–Des ${s.year}`} variant="income" icon={<ArrowDownRight size={16} />} />
        <StatCard title="Total Uang Keluar" value={`Rp ${formatRibuan(totalOut) || '0'}`} subtitle={`Jan–Des ${s.year}`} variant="expense" icon={<ArrowUpRight size={16} />} />
        <StatCard title="Sisa Bersih Setahun" value={`Rp ${formatRibuan(totalNet) || '0'}`} subtitle={totalNet >= 0 ? 'Masih sisa' : 'Lebih banyak keluar'} variant={totalNet >= 0 ? 'brand' : 'warning'} icon={<TrendingUp size={16} />} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">Rincian Bulanan — {s.year}</h3>
            <p className="text-xs font-medium text-text-muted">Berapa masuk, berapa keluar, dan sisanya tiap bulan</p>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border text-text-muted font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Bulan</th>
                <th className="px-4 py-3 text-right">Uang Masuk</th>
                <th className="px-4 py-3 text-right">Uang Keluar</th>
                <th className="px-4 py-3 text-right">Sisa</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthNames.map((name, idx) => {
                const inc = totals.income[idx] || 0
                const exp = totals.expense[idx] || 0
                const net = totals.net[idx] || 0
                return (
                  <tr key={name} className="hover:bg-accent-soft transition">
                    <td className="px-4 py-3 font-bold text-text">{name}</td>
                    <td className="px-4 py-3 text-right font-bold text-accent num">
                      {inc > 0 ? `Rp ${formatRibuan(inc)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-negative num">
                      {exp > 0 ? `Rp ${formatRibuan(exp)}` : '—'}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-black num ${
                        net > 0 ? 'text-accent' : net < 0 ? 'text-negative' : 'text-text-subtle'
                      }`}
                    >
                      {net !== 0 ? `Rp ${formatRibuan(net)}` : 'Rp 0'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          net > 0
                            ? 'bg-accent-soft text-accent border border-accent'
                            : net < 0
                            ? 'bg-negative-soft text-negative border border-negative'
                            : 'bg-surface-sunken text-text-muted'
                        }`}
                      >
                        {net > 0 ? 'Surplus' : net < 0 ? 'Defisit' : 'Nol'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-accent text-white font-semibold text-xs">
                <td className="px-4 py-3">TOTAL SETAHUN</td>
                <td className="px-4 py-3 text-right num">Rp {formatRibuan(totalIn)}</td>
                <td className="px-4 py-3 text-right num text-negative-soft">Rp {formatRibuan(totalOut)}</td>
                <td className="px-4 py-3 text-right num">Rp {formatRibuan(totalNet)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
