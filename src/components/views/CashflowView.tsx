import { TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '../common/Card'
import { StatCard } from '../common/StatCard'
import { formatRibuan } from '../common/RupiahInput'
import type { State } from '../../store'
import { monthlyTotals, yearTransactions } from '../../finance'

interface CashflowViewProps {
  store: State
}

export function CashflowView({ store: s }: CashflowViewProps) {
  const txCurrentYear = yearTransactions(s.txs, s.year)
  const totals = monthlyTotals(txCurrentYear, s.year)

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

  const totalIn = totals.income.reduce((a, b) => a + b, 0)
  const totalOut = totals.expense.reduce((a, b) => a + b, 0)
  const totalNet = totalIn - totalOut

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Cash In (Pemasukan)"
          value={`Rp ${formatRibuan(totalIn) || '0'}`}
          subtitle={`Akumulasi tahun ${s.year}`}
          variant="income"
          icon={<ArrowDownRight size={20} className="text-emerald-600" />}
        />
        <StatCard
          title="Total Cash Out (Pengeluaran)"
          value={`Rp ${formatRibuan(totalOut) || '0'}`}
          subtitle={`Akumulasi tahun ${s.year}`}
          variant="expense"
          icon={<ArrowUpRight size={20} className="text-rose-600" />}
        />
        <StatCard
          title="Net Cash Flow Tahunan"
          value={`Rp ${formatRibuan(totalNet) || '0'}`}
          subtitle={totalNet >= 0 ? 'Surplus Finansial' : 'Defisit Finansial'}
          variant={totalNet >= 0 ? 'brand' : 'warning'}
          icon={<TrendingUp size={20} className="text-blue-600" />}
        />
      </div>

      <Card className="overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Matriks Cash Flow Bulanan ({s.year})</h3>
            <p className="text-xs text-slate-500 font-medium">Rekap pergerakan arus kas bulanan riil</p>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Bulan</th>
                <th className="px-4 py-3 text-right">Pemasukan (Cash In)</th>
                <th className="px-4 py-3 text-right">Pengeluaran (Cash Out)</th>
                <th className="px-4 py-3 text-right font-black">Net Cash Flow</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthNames.map((name, idx) => {
                const inc = totals.income[idx] || 0
                const exp = totals.expense[idx] || 0
                const net = totals.net[idx] || 0
                return (
                  <tr key={name} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-bold text-slate-800">{name}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 num">
                      {inc > 0 ? `Rp ${formatRibuan(inc)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-700 num">
                      {exp > 0 ? `Rp ${formatRibuan(exp)}` : '—'}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-black num ${
                        net > 0 ? 'text-emerald-700' : net < 0 ? 'text-rose-700' : 'text-slate-400'
                      }`}
                    >
                      {net !== 0 ? `Rp ${formatRibuan(net)}` : 'Rp 0'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          net > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : net < 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-500'
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
              <tr className="bg-slate-900 text-white font-black text-xs">
                <td className="px-4 py-3">TOTAL TAHUNAN :</td>
                <td className="px-4 py-3 text-right num text-emerald-400">Rp {formatRibuan(totalIn)}</td>
                <td className="px-4 py-3 text-right num text-rose-400">Rp {formatRibuan(totalOut)}</td>
                <td className="px-4 py-3 text-right num text-cyan-300 font-extrabold">Rp {formatRibuan(totalNet)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
