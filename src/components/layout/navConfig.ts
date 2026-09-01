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
