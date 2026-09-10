import {
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  TrendingUp,
  PieChart,
  Building2,
  Scale,
  CalendarClock,
  HandCoins,
  FileSpreadsheet,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type TabKey =
  | 'dashboard'
  | 'transaksi'
  | 'rab'
  | 'cashflow'
  | 'rari'
  | 'aset'
  | 'depresiasi'
  | 'schedule'
  | 'piutang'
  | 'neraca'
  | 'settings'

export interface NavItemDef {
  id: TabKey
  label: string
  shortLabel?: string
  badgeKey?: 'txCount' | 'unpaidPiutangCount'
}

export interface NavGroupDef {
  title: string
  items: NavItemDef[]
}

export const NAV_GROUPS: NavGroupDef[] = [
  {
    title: 'Ringkasan',
    items: [
      { id: 'dashboard', label: 'Ringkasan', shortLabel: 'Ringkasan' },
    ],
  },
  {
    title: 'Uang Keluar Masuk',
    items: [
      { id: 'transaksi', label: 'Keluar Masuk Uang', shortLabel: 'Uang', badgeKey: 'txCount' },
      { id: 'rab', label: 'Rencana Anggaran', shortLabel: 'Anggaran' },
      { id: 'cashflow', label: 'Arus Kas Bulanan', shortLabel: 'Arus Kas' },
      { id: 'rari', label: 'Anggaran vs Realisasi', shortLabel: 'Realisasi' },
    ],
  },
  {
    title: 'Harta & Barang',
    items: [
      { id: 'aset', label: 'Daftar Aset', shortLabel: 'Aset' },
      { id: 'depresiasi', label: 'Penyusutan Aset', shortLabel: 'Susut' },
      { id: 'schedule', label: 'Jadwal & Pajak', shortLabel: 'Jadwal' },
    ],
  },
  {
    title: 'Tagihan & Pengaturan',
    items: [
      { id: 'piutang', label: 'Piutang', shortLabel: 'Piutang', badgeKey: 'unpaidPiutangCount' },
      { id: 'neraca', label: 'Kekayaan Bersih', shortLabel: 'Kekayaan' },
      { id: 'settings', label: 'Pengaturan Master', shortLabel: 'Master' },
    ],
  },
]

export const ALL_NAV_ITEMS: NavItemDef[] = NAV_GROUPS.flatMap((g) => g.items)

export const TAB_ICONS: Record<TabKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  transaksi: ArrowLeftRight,
  rab: Calculator,
  cashflow: TrendingUp,
  rari: PieChart,
  aset: Building2,
  depresiasi: Scale,
  schedule: CalendarClock,
  piutang: HandCoins,
  neraca: FileSpreadsheet,
  settings: Settings,
}

export const TAB_TITLES: Record<TabKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Ringkasan', subtitle: 'Ringkasan uang masuk, keluar, dan sisa kas' },
  transaksi: { title: 'Keluar Masuk Uang', subtitle: 'Catat setiap uang masuk dan keluar di 3 kas' },
  rab: { title: 'Rencana Anggaran', subtitle: 'Atur rencana pengeluaran bulanan' },
  cashflow: { title: 'Arus Kas Bulanan', subtitle: 'Lihat uang masuk dan keluar setiap bulan' },
  rari: { title: 'Anggaran vs Realisasi', subtitle: 'Bandingkan rencana dengan yang benar-benar keluar' },
  aset: { title: 'Daftar Aset', subtitle: 'Rumah, kendaraan, dan barang berharga yang dimiliki' },
  depresiasi: { title: 'Penyusutan Aset', subtitle: 'Lihat penurunan nilai barang dari waktu ke waktu' },
  schedule: { title: 'Jadwal & Pajak', subtitle: 'Pengingat bayar pajak dan servis rutin' },
  piutang: { title: 'Piutang', subtitle: 'Uang yang dipinjamkan ke orang lain dan status kembalinya' },
  neraca: { title: 'Kekayaan Bersih', subtitle: 'Total harta dikurangi total hutang' },
  settings: { title: 'Pengaturan Master', subtitle: 'Kelola nasabah, pos transaksi, dan label kas' },
}

export const BOTTOM_TABS: TabKey[] = ['dashboard', 'transaksi', 'rab']
