import {
  Menu,
  Download,
  Calendar,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  Plus,
  ArrowLeftRight,
  Printer,
  Search,
} from 'lucide-react'
import type { SyncStatus } from '../../store'
import { TAB_TITLES, type TabKey } from './navConfig'
import { printCurrentReport } from '../../print'

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
  const { title, subtitle } = TAB_TITLES[activeTab] || TAB_TITLES.dashboard

  return (
    <header className="h-[64px] bg-white border-b border-[#e0e2e0] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-full text-[#444746] hover:bg-[#f1f3f4] hover:text-[#1f1f1f] transition shrink-0 cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[19px] font-medium tracking-tight text-[#1f1f1f] leading-none truncate">
              {title}
            </h2>
            <button
              onClick={onOpenYearModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f3f4] hover:bg-[#e0e2e0] text-[#1f1f1f] text-xs font-medium transition shrink-0 cursor-pointer"
              title="Pilih tahun buku"
            >
              <Calendar size={13} className="text-[#444746]" />
              <span>{currentYear}</span>
            </button>
            <span
              className={`hidden sm:inline-flex w-2.5 h-2.5 rounded-full shrink-0 ${
                syncStatus === 'synced' ? 'bg-[#137333]' : syncStatus === 'syncing' ? 'bg-[#f29900] animate-pulse' : syncStatus === 'offline' ? 'bg-[#bdc1c6]' : 'bg-[#c5221f]'
              }`}
              title={syncStatus}
            />
          </div>
          <p className="hidden md:block text-[12px] text-[#747775] leading-none mt-1 truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenCmd}
          className="hidden lg:flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#444746] text-xs font-medium transition cursor-pointer border-none"
        >
          <Search size={14} className="text-[#747775]" />
          <span>Cari fitur / menu</span>
          <kbd className="ml-1 px-2 py-0.5 text-[10px] font-semibold bg-white rounded-md text-[#444746] shadow-xs">⌘K</kbd>
        </button>

        <button
          onClick={onSyncManual}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#f1f3f4] text-[#444746] text-xs font-medium transition cursor-pointer"
          title="Sinkronisasi"
        >
          {syncStatus === 'syncing' ? <RefreshCw size={15} className="animate-spin" /> : syncStatus === 'synced' ? <Cloud size={15} className="text-[#137333]" /> : <CloudOff size={15} />}
          <span className="hidden xl:inline">
            {syncStatus === 'syncing' ? 'Menyinkronkan' : syncStatus === 'synced' ? 'Tersinkron' : syncStatus === 'offline' ? 'Offline' : 'Gagal'}
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={onOpenTransfer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#747775] hover:bg-[#f1f3f4] text-[#1f1f1f] text-xs font-medium transition cursor-pointer"
          >
            <ArrowLeftRight size={14} />
            Transfer
          </button>
          <button
            onClick={printCurrentReport}
            className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] hover:text-[#1f1f1f] transition cursor-pointer"
            title="Cetak"
          >
            <Printer size={17} />
          </button>
          <button
            onClick={onExportExcel}
            disabled={isExporting}
            className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] hover:text-[#1f1f1f] transition disabled:opacity-50 cursor-pointer"
            title="Export Excel"
          >
            <Download size={17} />
          </button>
        </div>

        {/* Material Filled Button with Ripple feel */}
        <button
          onClick={onOpenQuickTx}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium md-elevation-1 hover:md-elevation-2 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Transaksi</span>
          <span className="sm:hidden">Tambah</span>
        </button>

        <div className="h-6 w-px bg-[#e0e2e0] mx-1 hidden sm:block" />
        <button
          onClick={onLogout}
          className="p-2 rounded-full text-[#747775] hover:text-[#1f1f1f] hover:bg-[#f1f3f4] transition cursor-pointer"
          title={userEmail || 'Keluar'}
          aria-label="Keluar"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
