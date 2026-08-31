import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { formatRibuan } from '../common/RupiahInput'
import type { State } from '../../store'
import {
  ledgerBalance,
  outstandingPiutang,
  straightLineValue,
  yearTransactions,
} from '../../finance'

interface NeracaViewProps {
  store: State
}

export function NeracaView({ store: s }: NeracaViewProps) {
  const txCurrentYear = yearTransactions(s.txs, s.year)

  const kasMaster = ledgerBalance(txCurrentYear, 'master', s.saldoAwal)
  const kasOperasional = ledgerBalance(txCurrentYear, 'operasional', 0)
  const kasKeluarga = ledgerBalance(txCurrentYear, 'keluarga', 0)
  const totalKasLancar = kasMaster + kasOperasional + kasKeluarga

  const totalPiutang = outstandingPiutang(s.piutangs)

  const todayStr = new Date().toISOString().slice(0, 10)
  const totalAsetTetap = s.assets.reduce((sum, a) => sum + (a.nilaiPasar || a.nilai), 0)
  const totalNilaiBukuDep = s.deps.reduce((sum, d) => sum + straightLineValue(d, todayStr).bookValue, 0)

  const totalAktiva = totalKasLancar + totalPiutang + totalAsetTetap + totalNilaiBukuDep

  const totalHutangKredit = s.assets.reduce((sum, a) => {
    const pokok = a.nilai - a.dp
    const bungaTotal = pokok * (a.bunga || 0.08) * ((a.tenor || 120) / 12)
    return sum + pokok + bungaTotal
  }, 0)

  const ekuitasBersih = totalAktiva - totalHutangKredit
  const totalPassiva = totalHutangKredit + ekuitasBersih

  const isBalanced = totalAktiva === totalPassiva

  return (
    <div className="space-y-6 animate-in">
      <Card
        className={`p-5 border ${
          isBalanced
            ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
            : 'border-amber-200 bg-amber-50/40 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isBalanced ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {isBalanced ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
          </div>
          <div>
            <h3 className="font-extrabold text-base">
              {isBalanced ? 'Status Neraca: Seimbang (Balanced)' : 'Status Neraca: Perlu Rekonsiliasi'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Prinsip Akuntansi: Total Aktiva (Harta & Piutang) = Total Passiva (Kewajiban Hutang + Ekuitas Modal Bersih)
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden border border-slate-200">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="font-extrabold text-base tracking-tight">AKTIVA (HARTA & KEKAYAAN)</h3>
            <Badge variant="accent">Aktiva</Badge>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-2">1. Kas & Setara Kas (Likuid)</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Buku Kas 0 — Master</span>
                  <span className="font-bold text-slate-800 num">Rp {formatRibuan(kasMaster)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Buku Kas 1 — Operasional</span>
                  <span className="font-bold text-slate-800 num">Rp {formatRibuan(kasOperasional)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Buku Kas 2 — Keluarga</span>
                  <span className="font-bold text-slate-800 num">Rp {formatRibuan(kasKeluarga)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-[#1E3A5F]">
                  <span>Subtotal Kas Lancar</span>
                  <span className="num">Rp {formatRibuan(totalKasLancar)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-2">2. Piutang</p>
              <div className="flex justify-between pl-2 font-bold text-slate-800">
                <span className="text-slate-600 font-normal">Hak Tagih Piutang Aktif</span>
                <span className="num">Rp {formatRibuan(totalPiutang)}</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-2">3. Aset Tetap & Properti</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Valuasi Aset Properti & Kendaraan</span>
                  <span className="font-bold text-slate-800 num">Rp {formatRibuan(totalAsetTetap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Nilai Buku Aset Terdepresiasi</span>
                  <span className="font-bold text-slate-800 num">Rp {formatRibuan(totalNilaiBukuDep)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-black text-sm text-[#1E3A5F]">
            <span>TOTAL AKTIVA :</span>
            <span className="num text-base">Rp {formatRibuan(totalAktiva)}</span>
          </div>
        </Card>

        <Card className="overflow-hidden border border-slate-200">
          <div className="p-4 bg-[#1E3A5F] text-white flex items-center justify-between">
            <h3 className="font-extrabold text-base tracking-tight">PASSIVA (KEWAJIBAN & MODAL)</h3>
            <Badge variant="brand">Passiva</Badge>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-2">1. Kewajiban Jangka Panjang</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Tanggungan Hutang & Cicilan KPR/KKB</span>
                  <span className="font-bold text-rose-700 num">Rp {formatRibuan(totalHutangKredit)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-2">2. Ekuitas / Modal Bersih (Net Worth)</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kekayaan Bersih Pribadi (Net Asset)</span>
                  <span className="font-black text-emerald-700 num text-sm">Rp {formatRibuan(ekuitasBersih)}</span>
                </div>
                <p className="text-[11px] text-slate-400 italic">Dihitung dari Total Aktiva dikurangi Total Kewajiban Hutang</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-black text-sm text-[#1E3A5F]">
            <span>TOTAL PASSIVA :</span>
            <span className="num text-base">Rp {formatRibuan(totalPassiva)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
