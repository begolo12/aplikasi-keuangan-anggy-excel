import { useState } from 'react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { formatRibuan } from '../common/RupiahInput'
import type { State } from '../../store'
import { isTransfer, rabMonthlyTotals, yearTransactions } from '../../finance'

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
    .filter((t) => t.ledger === 'operasional' && Number(t.tanggal.slice(5, 7)) === selectedMonth + 1 && !isTransfer(t))
    .reduce((sum, t) => sum + t.pengeluaran, 0)

  const riKel = txCurrentYear
    .filter((t) => t.ledger === 'keluarga' && Number(t.tanggal.slice(5, 7)) === selectedMonth + 1 && !isTransfer(t))
    .reduce((sum, t) => sum + t.pengeluaran, 0)

  const totalRI = riOp + riKel

  const devOp = raOp - riOp
  const devKel = raKel - riKel
  const totalDev = totalRA - totalRI

  return (
    <div className="space-y-6 animate-in">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Pilih Bulan Evaluasi</h3>
            <p className="text-xs text-slate-500 font-medium">Realisasi (RI) vs Rencana Anggaran (RA)</p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-600"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx}>
                {name} {s.year}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-blue-200/80 bg-blue-50/20">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rencana Anggaran (RA)</p>
          <h3 className="mt-1 text-2xl font-black text-[#1E3A5F] num">
            Rp {formatRibuan(totalRA) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total plafon budget bulan ini</p>
        </Card>

        <Card className="p-5 border-rose-200/80 bg-rose-50/20">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Realisasi Pengeluaran (RI)</p>
          <h3 className="mt-1 text-2xl font-black text-rose-700 num">
            Rp {formatRibuan(totalRI) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total aktual pengeluaran tercatat</p>
        </Card>

        <Card className="p-5 border-emerald-200/80 bg-emerald-50/20">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sisa / Deviasi Budget</p>
          <h3 className={`mt-1 text-2xl font-black num ${totalDev >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            Rp {formatRibuan(totalDev) || '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {totalDev >= 0 ? 'Surplus hemat anggaran' : 'Peringatan overbudget'}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">
            Rincian Realisasi per Sektor ({monthNames[selectedMonth]})
          </h3>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3">Sektor Anggaran</th>
              <th className="px-4 py-3 text-right">Rencana (RA)</th>
              <th className="px-4 py-3 text-right">Realisasi (RI)</th>
              <th className="px-4 py-3 text-right">Deviasi (RA - RI)</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3.5 font-bold text-slate-800">1. Pengeluaran Operasional</td>
              <td className="px-4 py-3.5 text-right font-bold text-slate-700 num">Rp {formatRibuan(raOp)}</td>
              <td className="px-4 py-3.5 text-right font-bold text-rose-700 num">Rp {formatRibuan(riOp)}</td>
              <td className={`px-4 py-3.5 text-right font-black num ${devOp >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Rp {formatRibuan(devOp)}
              </td>
              <td className="px-4 py-3.5 text-center">
                <Badge variant={devOp >= 0 ? 'success' : 'danger'}>
                  {devOp >= 0 ? 'Sesuai Plafon' : 'Overbudget'}
                </Badge>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3.5 font-bold text-slate-800">2. Pengeluaran Rumah Tangga & Keluarga</td>
              <td className="px-4 py-3.5 text-right font-bold text-slate-700 num">Rp {formatRibuan(raKel)}</td>
              <td className="px-4 py-3.5 text-right font-bold text-rose-700 num">Rp {formatRibuan(riKel)}</td>
              <td className={`px-4 py-3.5 text-right font-black num ${devKel >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Rp {formatRibuan(devKel)}
              </td>
              <td className="px-4 py-3.5 text-center">
                <Badge variant={devKel >= 0 ? 'success' : 'danger'}>
                  {devKel >= 0 ? 'Sesuai Plafon' : 'Overbudget'}
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}
