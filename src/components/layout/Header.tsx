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
  Moon,
  Sun,
} from 'lucide-react'
import type { SyncStatus } from '../../store'
import { TAB_TITLES, type TabKey } from './navConfig'
import { printCurrentReport } from '../../print'
import { useTheme } from '../../lib/theme'

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
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <header className="h-[64px] bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-text-muted hover:bg-surface-sunken hover:text-text transition shrink-0 cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[19px] font-medium tracking-tight text-text leading-none truncate">
              {title}
            </h2>
            <button
              onClick={onOpenYearModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-sunken hover:bg-border-strong text-text text-xs font-medium transition shrink-0 cursor-pointer"
              title="Pilih tahun buku"
            >
              <Calendar size={13} className="text-text-muted" />
              <span>{currentYear}</span>
            </button>
            <span
              className={`hidden sm:inline-flex w-2.5 h-2.5 rounded-full shrink-0 ${
                syncStatus === 'synced' ? 'bg-positive' : syncStatus === 'syncing' ? 'bg-warning animate-pulse' : syncStatus === 'offline' ? 'bg-border-strong' : 'bg-negative'
              }`}
              title={syncStatus}
            />
          </div>
          <p className="hidden md:block text-[12px] text-text-subtle leading-none mt-1 truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenCmd}
          className="hidden lg:flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-lg bg-surface-sunken hover:bg-surface-sunken text-text-muted text-xs font-medium transition cursor-pointer border-none"
        >
          <Search size={14} className="text-text-subtle" />
          <span>Cari fitur / menu</span>
          <kbd className="ml-1 px-2 py-0.5 text-[10px] font-semibold bg-surface rounded-md text-text-muted shadow-xs">⌘K</kbd>
        </button>

        <button
          onClick={onSyncManual}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-sunken text-text-muted text-xs font-medium transition cursor-pointer"
          title="Sinkronisasi"
        >
          {syncStatus === 'syncing' ? <RefreshCw size={15} className="animate-spin" /> : syncStatus === 'synced' ? <Cloud size={15} className="text-positive" /> : <CloudOff size={15} />}
          <span className="hidden xl:inline">
            {syncStatus === 'syncing' ? 'Menyinkronkan' : syncStatus === 'synced' ? 'Tersinkron' : syncStatus === 'offline' ? 'Offline' : 'Gagal'}
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={onOpenTransfer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-strong hover:bg-surface-sunken text-text text-xs font-medium transition cursor-pointer"
          >
            <ArrowLeftRight size={14} />
            Transfer
          </button>
          <button
            onClick={printCurrentReport}
            className="p-2 rounded-lg hover:bg-surface-sunken text-text-muted hover:text-text transition cursor-pointer"
            title="Cetak"
          >
            <Printer size={17} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-sunken text-text-muted hover:text-text transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={onExportExcel}
            disabled={isExporting}
            className="p-2 rounded-lg hover:bg-surface-sunken text-text-muted hover:text-text transition-colors disabled:opacity-50 cursor-pointer"
            title="Export Excel"
          >
            <Download size={17} />
          </button>
        </div>

        {/* Material Filled Button with Ripple feel */}
        <button
          onClick={onOpenQuickTx}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium md-elevation-1 hover:md-elevation-2 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Tambah Transaksi</span>
          <span className="sm:hidden">Tambah</span>
        </button>

        <div className="h-6 w-px bg-border-strong mx-1 hidden sm:block" />
        <button
          onClick={onLogout}
          className="p-2 rounded-lg text-text-subtle hover:text-text hover:bg-surface-sunken transition cursor-pointer"
          title={userEmail || 'Keluar'}
          aria-label="Keluar"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
