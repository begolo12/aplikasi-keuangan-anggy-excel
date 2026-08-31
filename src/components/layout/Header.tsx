import {
  Menu,
  Sparkles,
  Download,
  Calendar,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  Plus,
  ArrowLeftRight,
} from 'lucide-react'
import type { SyncStatus } from '../../store'
import type { TabKey } from './Sidebar'

interface HeaderProps {
  activeTab: TabKey
  onOpenMobileMenu: () => void
  onOpenCmd: () => void
  onOpenQuickTx: () => void
  onOpenTransfer: () => void
  onOpenYearModal: () => void
  onExportExcel: () => void
  isExporting: boolean
  syncStatus: SyncStatus
  onSyncManual: () => void
  currentYear: number
  userEmail?: string
  onLogout: () => void
}

export function Header({
  activeTab,
  onOpenMobileMenu,
  onOpenCmd,
  onOpenQuickTx,
  onOpenTransfer,
  onOpenYearModal,
  onExportExcel,
  isExporting,
  syncStatus,
  onSyncManual,
  currentYear,
  userEmail,
  onLogout,
}: HeaderProps) {
  const titles: Record<TabKey, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Ikhtisar kas, mutasi, dan posisi aset' },
    transaksi: { title: 'Buku Kas (3 Ledger)', subtitle: 'Pencatatan mutasi Master, Operasional, Keluarga' },
    rab: { title: 'RAB Anggaran', subtitle: 'Alokasi budget mingguan & bulanan tahun berjalan' },
    cashflow: { title: 'Cash Flow Tahunan', subtitle: 'Monitoring arus kas Jan — Des beserta deviasi' },
    rari: { title: 'Realisasi vs Anggaran', subtitle: 'Evaluasi deviasi realisasi anggaran bulan aktif' },
    aset: { title: 'Monitoring Aset', subtitle: 'Daftar aset tetap, nilai pasar, dan cicilan' },
    depresiasi: { title: 'Penyusutan Aset', subtitle: 'Metode depresiasi garis lurus untuk kendaraan & gadget' },
    schedule: { title: 'Jadwal Pajak & Servis', subtitle: 'Kalender checklist pemeliharaan dan pajak berkala' },
    piutang: { title: 'Buku Piutang', subtitle: 'Daftar pinjaman pihak lain & histori pelunasan' },
    neraca: { title: 'Neraca Keuangan', subtitle: 'Validasi keseimbangan Aktiva (Harta) vs Passiva' },
  }

  const { title, subtitle } = titles[activeTab] || titles.dashboard

  return (
    <header className="h-14 sm:h-16 lg:h-20 bg-white/90 backdrop-blur-md border-b border-[#dbeae0] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-[#edf6f0] transition shrink-0"
          aria-label="Buka menu navigasi"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="font-black text-[#0f291e] text-sm sm:text-lg lg:text-xl tracking-tight truncate">
              {title}
            </h2>
            <button
              onClick={onOpenYearModal}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eaf5ee] hover:bg-[#ddede2] text-[#1c543c] text-[11px] sm:text-xs font-black transition shrink-0 border border-[#d2eadb]"
              title="Ganti Tahun Fiskal"
            >
              <Calendar size={11} className="text-[#2d6a4f]" />
              <span>{currentYear}</span>
            </button>
          </div>
          <p className="hidden md:block text-xs text-slate-500 font-medium truncate mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick Search Shortcut (Desktop/Tablet) */}
        <button
          onClick={onOpenCmd}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#dbeae0] bg-[#f8faf9] hover:bg-[#edf6f0] text-slate-600 text-xs font-semibold transition"
          title="Buka Command Palette (Ctrl+K)"
        >
          <Sparkles size={13} className="text-[#1c543c]" />
          <span>Cari</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-[#dbeae0] rounded-md text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Cloud Sync Status Pill */}
        <button
          onClick={onSyncManual}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition active:scale-95 ${
            syncStatus === 'synced'
              ? 'bg-[#eaf5ee] text-[#1c543c] border-[#c7e4d2] hover:bg-[#ddede2]'
              : syncStatus === 'syncing'
              ? 'bg-teal-50 text-teal-800 border-teal-200 animate-pulse'
              : syncStatus === 'offline'
              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
          title="Status Sinkronisasi Database"
        >
          {syncStatus === 'syncing' ? (
            <RefreshCw size={13} className="animate-spin text-teal-600" />
          ) : syncStatus === 'synced' ? (
            <Cloud size={13} className="text-[#1c543c]" />
          ) : (
            <CloudOff size={13} className="text-slate-500" />
          )}
          <span className="hidden sm:inline">
            {syncStatus === 'syncing'
              ? 'Sinkron…'
              : syncStatus === 'synced'
              ? 'Tersinkron'
              : syncStatus === 'offline'
              ? 'Offline'
              : 'Gagal Sync'}
          </span>
        </button>

        {/* Transfer Button (Desktop/Tablet) */}
        <button
          onClick={onOpenTransfer}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#edf6f0] hover:bg-[#ddede2] text-[#1c543c] border border-[#d2eadb] rounded-xl text-xs font-bold transition active:scale-95"
          title="Transfer Dropping Antar Ledger"
        >
          <ArrowLeftRight size={13} />
          <span>Transfer</span>
        </button>

        {/* Quick Add Mutation Button (Desktop) */}
        <button
          onClick={onOpenQuickTx}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1c543c] hover:bg-[#15422f] text-white rounded-xl text-xs font-black shadow-xs transition active:scale-95"
        >
          <Plus size={14} />
          <span>Catat Mutasi</span>
        </button>

        {/* Excel Export */}
        <button
          onClick={onExportExcel}
          disabled={isExporting}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#c7e4d2] bg-[#eaf5ee] hover:bg-[#ddede2] text-[#1c543c] text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-60 shrink-0"
          title="Export ke Format Excel (13 Sheet Live Formula)"
        >
          <Download size={14} />
          <span className="hidden md:inline">{isExporting ? 'Ekspor…' : 'Export Excel'}</span>
        </button>

        <div className="h-5 w-px bg-[#dbeae0] mx-0.5 hidden sm:block" />

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
          title={`Keluar (${userEmail || 'Akun'})`}
          aria-label="Keluar akun"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
