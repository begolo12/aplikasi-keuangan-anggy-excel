import { useMemo } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { formatRibuan } from '../common/format'
import type { State } from '../../store'
import { ledgerBalance, outstandingPiutang, straightLineValue, yearTransactions } from '../../finance'

interface NeracaViewProps {
  store: State
}

export function NeracaView({ store: s }: NeracaViewProps) {
  const txCurrentYear = useMemo(() => yearTransactions(s.txs, s.year), [s.txs, s.year])
  const { kasMaster, kasOperasional, kasKeluarga, totalKasLancar } = useMemo(() => {
    const m = ledgerBalance(txCurrentYear, 'master', s.saldoAwal)
    const o = ledgerBalance(txCurrentYear, 'operasional', 0)
    const k = ledgerBalance(txCurrentYear, 'keluarga', 0)
    return { kasMaster: m, kasOperasional: o, kasKeluarga: k, totalKasLancar: m + o + k }
  }, [txCurrentYear, s.saldoAwal])
  const totalPiutang = useMemo(() => outstandingPiutang(s.piutangs), [s.piutangs])
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const { totalAsetTetap, totalNilaiBukuDep } = useMemo(() => {
    const aset = s.assets.reduce((sum, a) => sum + (a.nilaiPasar || a.nilai), 0)
    const dep = s.deps.reduce((sum, d) => sum + straightLineValue(d, todayStr).bookValue, 0)
    return { totalAsetTetap: aset, totalNilaiBukuDep: dep }
  }, [s.assets, s.deps, todayStr])
  const totalAktiva = totalKasLancar + totalPiutang + totalAsetTetap + totalNilaiBukuDep
  const totalHutangKredit = useMemo(() => s.assets.reduce((sum, a) => {
    const pokok = a.nilai - a.dp
    const bungaTotal = pokok * (a.bunga || 0.08) * ((a.tenor || 120) / 12)
    return sum + pokok + bungaTotal
  }, 0), [s.assets])
  const ekuitasBersih = totalAktiva - totalHutangKredit
  const totalPassiva = totalHutangKredit + ekuitasBersih
  const isBalanced = totalAktiva === totalPassiva

  return (
    <div className="space-y-5 animate-in">
      <Card className={`p-4 border ${isBalanced ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isBalanced ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
            {isBalanced ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{isBalanced ? 'Seimbang — harta sama dengan hutang + modal' : 'Belum seimbang — cek lagi angka harta dan hutang'}</h3>
            <p className="text-xs font-medium text-slate-600 mt-0.5">Rumus sederhana: Total Harta = Total Hutang + Kekayaan Bersih</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight">Yang Dimiliki (Harta)</h3>
            <Badge variant="neutral">Harta</Badge>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Uang Tunai di 3 Kas</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between"><span className="font-medium text-slate-600">Kas Utama</span><span className="font-semibold num text-slate-900">Rp {formatRibuan(kasMaster)}</span></div>
                <div className="flex justify-between"><span className="font-medium text-slate-600">Kas Usaha</span><span className="font-semibold num text-slate-900">Rp {formatRibuan(kasOperasional)}</span></div>
                <div className="flex justify-between"><span className="font-medium text-slate-600">Kas Keluarga</span><span className="font-semibold num text-slate-900">Rp {formatRibuan(kasKeluarga)}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-semibold text-slate-900"><span>Total Uang Tunai</span><span className="num">Rp {formatRibuan(totalKasLancar)}</span></div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Uang Dipinjamkan ke Orang Lain</p>
              <div className="flex justify-between pl-2 font-semibold text-slate-900"><span className="font-medium text-slate-600">Piutang yang belum kembali</span><span className="num">Rp {formatRibuan(totalPiutang)}</span></div>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Barang Berharga</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between"><span className="font-medium text-slate-600">Harga pasar rumah & kendaraan</span><span className="font-semibold num text-slate-900">Rp {formatRibuan(totalAsetTetap)}</span></div>
                <div className="flex justify-between"><span className="font-medium text-slate-600">Nilai barang yang menyusut</span><span className="font-semibold num text-slate-900">Rp {formatRibuan(totalNilaiBukuDep)}</span></div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
            <span>TOTAL HARTA</span><span className="num text-emerald-700">Rp {formatRibuan(totalAktiva)}</span>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight">Yang Harus Dibayar & Sisa Kekayaan</h3>
            <Badge variant="neutral">Hutang + Modal</Badge>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Hutang & Cicilan</p>
              <div className="flex justify-between pl-2"><span className="font-medium text-slate-600">Total cicilan & KPR yang masih berjalan</span><span className="font-semibold text-rose-600 num">Rp {formatRibuan(totalHutangKredit)}</span></div>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Kekayaan Bersih</p>
              <div className="space-y-1 pl-2">
                <div className="flex justify-between"><span className="font-medium text-slate-600">Harta dikurangi hutang</span><span className="font-bold text-emerald-700 num">Rp {formatRibuan(ekuitasBersih)}</span></div>
                <p className="text-[11px] text-slate-500">Ini sisa kekayaan bersih milik Anda</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
            <span>TOTAL HUTANG + KEKAYAAN</span><span className="num text-emerald-700">Rp {formatRibuan(totalPassiva)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
