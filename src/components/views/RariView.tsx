import { useState } from 'react'
import { Card } from '../common/Card'
import { StatCard } from '../common/StatCard'
import { Badge } from '../common/Badge'
import { formatRibuan } from '../common/format'
import { Calculator, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react'
import type { State } from '../../store'
import { isBudgetRealization, rabMonthlyTotals, yearTransactions } from '../../finance'

interface RariViewProps {
  store: State
}

export function RariView({ store: s }: RariViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth())
  const txCurrentYear = yearTransactions(s.txs, s.year)

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

  const raOp = rabMonthlyTotals(s.rabAnggy)[selectedMonth] || 0
  const raKel = rabMonthlyTotals(s.rabKeluarga)[selectedMonth] || 0
  const totalRA = raOp + raKel

  const riOp = txCurrentYear
    .filter((t) => t.ledger === 'operasional' && Number(t.tanggal.slice(5, 7)) === selectedMonth + 1 && isBudgetRealization(t))
    .reduce((sum, t) => sum + t.pengeluaran, 0)

  const riKel = txCurrentYear
    .filter((t) => t.ledger === 'keluarga' && Number(t.tanggal.slice(5, 7)) === selectedMonth + 1 && isBudgetRealization(t))
    .reduce((sum, t) => sum + t.pengeluaran, 0)

  const totalRI = riOp + riKel

  const devOp = raOp - riOp
  const devKel = raKel - riKel
  const totalDev = totalRA - totalRI

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-text">Rencana vs Realisasi — {monthNames[selectedMonth]} {s.year}</h3>
            <p className="text-xs font-medium text-text-muted">Berapa yang direncanakan vs berapa yang benar-benar keluar</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-muted">Bulan:</span>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))} className="px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium outline-none focus:border-accent focus:ring-1 focus:ring-accent">
              {monthNames.map((name, idx) => (<option key={name} value={idx}>{name} {s.year}</option>))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Rencana Bulan Ini" value={`Rp ${formatRibuan(totalRA) || '0'}`} subtitle="Target pengeluaran" variant="brand" icon={<Calculator size={16} />} />
        <StatCard title="Sudah Terpakai" value={`Rp ${formatRibuan(totalRI) || '0'}`} subtitle="Uang yang sudah keluar" variant="expense" icon={<ArrowUpRight size={16} />} />
        <StatCard title="Sisa Anggaran" value={`Rp ${formatRibuan(totalDev) || '0'}`} subtitle={totalDev >= 0 ? 'Masih ada sisa' : 'Kelebihan pakai'} variant={totalDev >= 0 ? 'income' : 'expense'} icon={totalDev >= 0 ? <TrendingUp size={16} /> : <AlertTriangle size={16} />} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text">Rincian per Kas — {monthNames[selectedMonth]} {s.year}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border text-text-muted font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Kas</th>
                <th className="px-4 py-3 text-right">Rencana</th>
                <th className="px-4 py-3 text-right">Terpakai</th>
                <th className="px-4 py-3 text-right">Sisa</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-canvas transition">
                <td className="px-4 py-3 font-medium text-text-muted">Kas Usaha</td>
                <td className="px-4 py-3 text-right font-semibold num text-text-muted">Rp {formatRibuan(raOp)}</td>
                <td className="px-4 py-3 text-right font-semibold num text-negative">Rp {formatRibuan(riOp)}</td>
                <td className={`px-4 py-3 text-right font-bold num ${devOp >= 0 ? 'text-positive' : 'text-negative'}`}>Rp {formatRibuan(devOp)}</td>
                <td className="px-4 py-3 text-center"><Badge variant={devOp >= 0 ? 'success' : 'danger'}>{devOp >= 0 ? 'Aman' : 'Kelebihan'}</Badge></td>
              </tr>
              <tr className="hover:bg-canvas transition">
                <td className="px-4 py-3 font-medium text-text-muted">Kas Keluarga</td>
                <td className="px-4 py-3 text-right font-semibold num text-text-muted">Rp {formatRibuan(raKel)}</td>
                <td className="px-4 py-3 text-right font-semibold num text-negative">Rp {formatRibuan(riKel)}</td>
                <td className={`px-4 py-3 text-right font-bold num ${devKel >= 0 ? 'text-positive' : 'text-negative'}`}>Rp {formatRibuan(devKel)}</td>
                <td className="px-4 py-3 text-center"><Badge variant={devKel >= 0 ? 'success' : 'danger'}>{devKel >= 0 ? 'Aman' : 'Kelebihan'}</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
