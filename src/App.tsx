import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useStore, useToastStore, flushPendingSync, type Ledger } from './store'
import { useAuth } from './lib/use-auth'
import { closingBalance, ledgerBalance, yearTransactions } from './finance'

import { Sidebar, type TabKey } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { MobileNav } from './components/layout/MobileNav'
import { BottomNav } from './components/layout/BottomNav'
import { CommandPalette } from './components/layout/CommandPalette'

import { QuickTxModal } from './components/modals/QuickTxModal'
import { TransferModal } from './components/modals/TransferModal'
import { YearModal } from './components/modals/YearModal'

import { ToastStack, type ToastItem } from './components/common/ToastStack'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Skeleton, SkeletonRows } from './components/common/Skeleton'
import { kasLabel } from './components/common/format'

const DashboardView = lazy(() => import('./components/views/DashboardView').then((m) => ({ default: m.DashboardView })))
const TransaksiView = lazy(() => import('./components/views/TransaksiView').then((m) => ({ default: m.TransaksiView })))
const RabView = lazy(() => import('./components/views/RabView').then((m) => ({ default: m.RabView })))
const CashflowView = lazy(() => import('./components/views/CashflowView').then((m) => ({ default: m.CashflowView })))
const RariView = lazy(() => import('./components/views/RariView').then((m) => ({ default: m.RariView })))
const AssetView = lazy(() => import('./components/views/AssetView').then((m) => ({ default: m.AssetView })))
const DepresiasiView = lazy(() => import('./components/views/DepresiasiView').then((m) => ({ default: m.DepresiasiView })))
const ScheduleView = lazy(() => import('./components/views/ScheduleView').then((m) => ({ default: m.ScheduleView })))
const PiutangView = lazy(() => import('./components/views/PiutangView').then((m) => ({ default: m.PiutangView })))
const NeracaView = lazy(() => import('./components/views/NeracaView').then((m) => ({ default: m.NeracaView })))
const SettingsView = lazy(() => import('./components/views/SettingsView').then((m) => ({ default: m.SettingsView })))

export default function App() {
  const store = useStore()
  const globalToasts = useToastStore((s) => s.toasts)
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('anggy_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  const [quickTxOpen, setQuickTxOpen] = useState(false)
  const [defaultQuickTxLedger, setDefaultQuickTxLedger] = useState<Ledger>('master')
  const [transferOpen, setTransferOpen] = useState(false)
  const [yearModalOpen, setYearModalOpen] = useState(false)

  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const addToast = useCallback((message: string, kind: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    setToasts((prev) => [...prev, { id, message, kind }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    void useStore.getState().loadFromServer()
    // Dipanggil sekali saat mount; getState() stabil dan tidak butuh dep.
  }, [])

  // PUT yang gagal (offline/error) dicoba ulang saat koneksi kembali.
  useEffect(() => {
    const onOnline = () => useStore.getState().retrySync()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  // Sync yang masih tertahan debounce dikirim saat tab disembunyikan/ditutup.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flushPendingSync()
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [])

  useEffect(() => {
    if (globalToasts.length === 0) return
    const id = setTimeout(() => {
      const current = useToastStore.getState().toasts
      current.forEach((t) => useToastStore.getState().dismiss(t.id))
    }, 4000)
    return () => clearTimeout(id)
  }, [globalToasts])
  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('anggy_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  const txCurrentYear = useMemo(() => yearTransactions(store.txs, store.year), [store.txs, store.year])
  const unpaidPiutangCount = useMemo(
    () => store.piutangs.filter((p) => (Number(p.terbit) || 0) > (Number(p.lunas) || 0)).length,
    [store.piutangs]
  )
  const masterBalance = useMemo(
    () => closingBalance(store.txs, 'master', store.year, store.saldoAwal),
    [store.txs, store.year, store.saldoAwal]
  )
  const opBalance = useMemo(
    () => closingBalance(store.txs, 'operasional', store.year),
    [store.txs, store.year]
  )
  const kelBalance = useMemo(
    () => closingBalance(store.txs, 'keluarga', store.year),
    [store.txs, store.year]
  )
  const fullMasterBalance = useMemo(
    () => ledgerBalance(store.txs, 'master', store.saldoAwal),
    [store.txs, store.saldoAwal]
  )

  const handleOpenQuickTx = (defaultLedger: Ledger = 'master') => {
    setDefaultQuickTxLedger(defaultLedger)
    setQuickTxOpen(true)
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const { exportExcel } = await import('./export')
      await exportExcel({
        txs: store.txs,
        rabAnggy: store.rabAnggy,
        rabKeluarga: store.rabKeluarga,
        piutangs: store.piutangs,
        deps: store.deps,
        assets: store.assets,
        scheds: store.scheds,
        year: store.year,
        saldoAwal: store.saldoAwal,
      })
      addToast('File Excel berhasil diekspor dengan 13 sheet live formula!', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      addToast(`Gagal mengekspor file Excel: ${message}`, 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex text-text antialiased font-sans selection:bg-accent selection:text-on-fill">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        txCount={txCurrentYear.length}
        unpaidPiutangCount={unpaidPiutangCount}
        masterBalance={masterBalance}
        opBalance={opBalance}
        kelBalance={kelBalance}
        ledgerLabels={store.ledgerLabels}
      />

      <MobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        txCount={txCurrentYear.length}
        unpaidPiutangCount={unpaidPiutangCount}
        onOpenQuickTx={() => handleOpenQuickTx('master')}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden pb-16 lg:pb-0">
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCmd={() => setCmdOpen(true)}
          onOpenQuickTx={() => handleOpenQuickTx('master')}
          onOpenTransfer={() => setTransferOpen(true)}
          onOpenYearModal={() => setYearModalOpen(true)}
          onExportExcel={handleExportExcel}
          isExporting={isExporting}
          syncStatus={store.syncStatus}
          onSyncManual={() => store.syncToServer()}
          currentYear={store.year}
          userEmail={user?.email}
          onLogout={logout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto">
          {(store.syncStatus === 'offline' || store.syncStatus === 'error') && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-warning bg-warning-soft px-3.5 py-2.5 text-xs text-warning"
            >
              <AlertTriangle size={15} className="shrink-0 mt-px" />
              <div>
                <p className="font-semibold">
                  {store.syncStatus === 'offline' ? 'Server belum tersambung' : 'Gagal menyimpan ke server'}
                </p>
                <p className="mt-0.5">
                  Perubahan tetap tersimpan di perangkat dan akan dikirim ulang otomatis.{' '}
                  <button onClick={() => store.retrySync()} className="font-semibold underline cursor-pointer">
                    Coba sekarang
                  </button>
                </p>
              </div>
            </div>
          )}
          <ErrorBoundary key={activeTab}>
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton className="h-[92px]" />
                    <Skeleton className="h-[92px]" />
                    <Skeleton className="h-[92px]" />
                  </div>
                  <SkeletonRows rows={6} />
                </div>
              }
            >
              {activeTab === 'dashboard' && <DashboardView store={store} onNavigate={setActiveTab} onOpenQuickTx={handleOpenQuickTx} onOpenTransfer={() => setTransferOpen(true)} />}
              {activeTab === 'transaksi' && <TransaksiView store={store} onOpenQuickTx={handleOpenQuickTx} onOpenTransfer={() => setTransferOpen(true)} />}
              {activeTab === 'rab' && <RabView store={store} />}
              {activeTab === 'cashflow' && <CashflowView store={store} />}
              {activeTab === 'rari' && <RariView store={store} />}
              {activeTab === 'aset' && <AssetView store={store} />}
              {activeTab === 'depresiasi' && <DepresiasiView store={store} />}
              {activeTab === 'schedule' && <ScheduleView store={store} />}
              {activeTab === 'piutang' && <PiutangView store={store} />}
              {activeTab === 'neraca' && <NeracaView store={store} />}
              {activeTab === 'settings' && <SettingsView store={store} />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenQuickTx={() => handleOpenQuickTx('master')}
        txCount={txCurrentYear.length}
      />

      <QuickTxModal
        open={quickTxOpen}
        onClose={() => setQuickTxOpen(false)}
        defaultLedger={defaultQuickTxLedger}
        onAddTx={(tx) => {
          store.addTx(tx)
          const kas = kasLabel(tx.ledger, store.ledgerLabels)
          addToast(`Transaksi berhasil dicatat di ${kas}`, 'success')
        }}
      />

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        maxMasterBalance={fullMasterBalance}
        ledgerLabels={store.ledgerLabels}
        onTransfer={(to, amount, tanggal, uraian) => {
          store.transferDropping('master', to, amount, tanggal, uraian)
          const tujuan = kasLabel(to, store.ledgerLabels)
          addToast(`Pindah saldo Rp ${new Intl.NumberFormat('id-ID').format(amount)} ke ${tujuan} berhasil`, 'success')
        }}
      />

      <YearModal
        open={yearModalOpen}
        onClose={() => setYearModalOpen(false)}
        year={store.year}
        saldoAwal={store.saldoAwal}
        ledgerLabels={store.ledgerLabels}
        onSave={(year, saldoAwal) => {
          store.setYear(year)
          store.setSaldoAwal(saldoAwal)
          addToast(`Tahun buku ${year} dan saldo awal berhasil disimpan.`, 'success')
        }}
      />

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelectTab={setActiveTab}
        onOpenQuickTx={() => handleOpenQuickTx('master')}
        onOpenTransfer={() => setTransferOpen(true)}
        onOpenYearModal={() => setYearModalOpen(true)}
        onExportExcel={handleExportExcel}
      />

      <ToastStack toasts={[...toasts, ...globalToasts]} remove={(id) => { removeToast(id); useToastStore.getState().dismiss(id) }} />
    </div>
  )
}
