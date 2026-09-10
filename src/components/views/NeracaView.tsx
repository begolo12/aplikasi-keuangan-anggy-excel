import { useMemo } from 'react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { formatRibuan } from '../common/format'
import type { State } from '../../store'
import { assetDebt, closingBalance, outstandingPiutang, straightLineValue, todayLocal } from '../../finance'

interface NeracaViewProps {
  store: State
}

export function NeracaView({ store: s }: NeracaViewProps) {
  const { kasMaster, kasOperasional, kasKeluarga, totalKasLancar } = useMemo(() => {
    const m = closingBalance(s.txs, 'master', s.year, s.saldoAwal)
    const o = closingBalance(s.txs, 'operasional', s.year)
    const k = closingBalance(s.txs, 'keluarga', s.year)
    return { kasMaster: m, kasOperasional: o, kasKeluarga: k, totalKasLancar: m + o + k }
  }, [s.txs, s.year, s.saldoAwal])
  const totalPiutang = useMemo(() => outstandingPiutang(s.piutangs), [s.piutangs])
  const todayStr = useMemo(() => todayLocal(), [])
  const { totalAsetTetap, totalNilaiBukuDep } = useMemo(() => {
    const aset = s.assets.reduce((sum, a) => sum + (a.nilaiPasar || a.nilai), 0)
    const dep = s.deps.reduce((sum, d) => sum + straightLineValue(d, todayStr).bookValue, 0)
    return { totalAsetTetap: aset, totalNilaiBukuDep: dep }
  }, [s.assets, s.deps, todayStr])
  const totalAktiva = totalKasLancar + totalPiutang + totalAsetTetap + totalNilaiBukuDep
  const totalHutangKredit = useMemo(() => s.assets.reduce((sum, a) => sum + assetDebt(a, todayStr).outstanding, 0), [s.assets, todayStr])
  const ekuitasBersih = totalAktiva - totalHutangKredit
  const totalPassiva = totalHutangKredit + ekuitasBersih

  return (
    <div className="space-y-5 animate-in">
      <Card className="p-4 border border-border bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-accent text-on-fill">
            <span className="text-sm font-black">Rp</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">Komposisi harta tahun {s.year} (termasuk bawaan tahun lalu)</h3>
            <p className="text-xs font-medium text-text-muted mt-0.5">Total Harta = Kas 3 kas + Piutang + Nilai pasar aset + Nilai buku susut. Kekayaan bersih = Harta dikurangi sisa hutang.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Yang dimiliki (harta)</h3>
            <Badge variant="neutral">Harta</Badge>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div>
              <p className="eyebrow mb-2">Uang Tunai di 3 Kas</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between"><span className="font-medium text-text-muted">Kas Utama</span><span className="font-semibold num text-text">Rp {formatRibuan(kasMaster)}</span></div>
                <div className="flex justify-between"><span className="font-medium text-text-muted">Kas Usaha</span><span className="font-semibold num text-text">Rp {formatRibuan(kasOperasional)}</span></div>
                <div className="flex justify-between"><span className="font-medium text-text-muted">Kas Keluarga</span><span className="font-semibold num text-text">Rp {formatRibuan(kasKeluarga)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold text-text"><span>Total Uang Tunai</span><span className="num">Rp {formatRibuan(totalKasLancar)}</span></div>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-2">Uang Dipinjamkan ke Orang Lain</p>
              <div className="flex justify-between pl-2 font-semibold text-text"><span className="font-medium text-text-muted">Piutang yang belum kembali</span><span className="num">Rp {formatRibuan(totalPiutang)}</span></div>
            </div>
            <div>
              <p className="eyebrow mb-2">Barang Berharga</p>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between"><span className="font-medium text-text-muted">Harga pasar rumah & kendaraan</span><span className="font-semibold num text-text">Rp {formatRibuan(totalAsetTetap)}</span></div>
                <div className="flex justify-between"><span className="font-medium text-text-muted">Nilai barang yang menyusut</span><span className="font-semibold num text-text">Rp {formatRibuan(totalNilaiBukuDep)}</span></div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-sunken border-t border-border flex items-center justify-between font-bold text-sm text-text">
            <span>TOTAL HARTA</span><span className="num text-positive">Rp {formatRibuan(totalAktiva)}</span>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Yang harus dibayar &amp; sisa kekayaan</h3>
            <Badge variant="neutral">Hutang + Modal</Badge>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div>
              <p className="eyebrow mb-2">Hutang & Cicilan</p>
              <div className="flex justify-between pl-2"><span className="font-medium text-text-muted">Total cicilan & KPR yang masih berjalan</span><span className="font-semibold text-negative num">Rp {formatRibuan(totalHutangKredit)}</span></div>
            </div>
            <div>
              <p className="eyebrow mb-2">Kekayaan Bersih</p>
              <div className="space-y-1 pl-2">
                <div className="flex justify-between"><span className="font-medium text-text-muted">Harta dikurangi hutang</span><span className="font-bold text-positive num">Rp {formatRibuan(ekuitasBersih)}</span></div>
                <p className="text-[11px] text-text-muted">Ini sisa kekayaan bersih milik Anda</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-sunken border-t border-border flex items-center justify-between font-bold text-sm text-text">
            <span>TOTAL HUTANG + KEKAYAAN</span><span className="num">Rp {formatRibuan(totalPassiva)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
