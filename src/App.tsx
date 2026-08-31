import { useState, useEffect, useMemo, useCallback } from 'react'
import { useStore, type Ledger } from './store'
import { useAuth } from './lib/auth-context'
import { exportExcel } from './export'
import { ledgerBalance, yearTransactions } from './finance'

import { Sidebar, type TabKey } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { MobileNav } from './components/layout/MobileNav'
import { BottomNav } from './components/layout/BottomNav'
import { CommandPalette } from './components/layout/CommandPalette'

import { QuickTxModal } from './components/modals/QuickTxModal'
import { TransferModal } from './components/modals/TransferModal'
import { YearModal } from './components/modals/YearModal'

import { ToastStack, type ToastItem } from './components/common/ToastStack'

import { DashboardView } from './components/views/DashboardView'
import { TransaksiView } from './components/views/TransaksiView'
import { RabView } from './components/views/RabView'
import { CashflowView } from './components/views/CashflowView'
import { RariView } from './components/views/RariView'
import { AssetView } from './components/views/AssetView'
import { DepresiasiView } from './components/views/DepresiasiView'
import { ScheduleView } from './components/views/ScheduleView'
import { PiutangView } from './components/views/PiutangView'
import { NeracaView } from './components/views/NeracaView'

export default function App() {
  const store = useStore()
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
    void store.loadFromServer()
  }, [])

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
    () => store.piutangs.filter((p) => p.terbit > p.lunas).length,
    [store.piutangs]
  )
  const masterBalance = useMemo(
    () => ledgerBalance(txCurrentYear, 'master', store.saldoAwal),
    [txCurrentYear, store.saldoAwal]
  )

  const handleOpenQuickTx = (defaultLedger: Ledger = 'master') => {
    setDefaultQuickTxLedger(defaultLedger)
    setQuickTxOpen(true)
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
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
    } catch (err: any) {
      console.error('Export error:', err)
      addToast('Gagal mengekspor file Excel: ' + (err?.message || 'Unknown error'), 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f8f5] flex text-slate-800 antialiased font-sans selection:bg-emerald-700 selection:text-white">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        txCount={txCurrentYear.length}
        unpaidPiutangCount={unpaidPiutangCount}
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

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              store={store}
              onNavigate={setActiveTab}
              onOpenQuickTx={handleOpenQuickTx}
              onOpenTransfer={() => setTransferOpen(true)}
            />
          )}

          {activeTab === 'transaksi' && (
            <TransaksiView
              store={store}
              onOpenQuickTx={handleOpenQuickTx}
              onOpenTransfer={() => setTransferOpen(true)}
            />
          )}

          {activeTab === 'rab' && <RabView store={store} />}
          {activeTab === 'cashflow' && <CashflowView store={store} />}
          {activeTab === 'rari' && <RariView store={store} />}
          {activeTab === 'aset' && <AssetView store={store} />}
          {activeTab === 'depresiasi' && <DepresiasiView store={store} />}
          {activeTab === 'schedule' && <ScheduleView store={store} />}
          {activeTab === 'piutang' && <PiutangView store={store} />}
          {activeTab === 'neraca' && <NeracaView store={store} />}
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
          addToast(`Transaksi berhasil dicatat ke Ledger ${tx.ledger.toUpperCase()}`, 'success')
        }}
      />

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        maxMasterBalance={masterBalance}
        onTransfer={(to, amount, tanggal, uraian) => {
          store.transferDropping('master', to, amount, tanggal, uraian)
          addToast(`Dropping kas Rp ${new Intl.NumberFormat('id-ID').format(amount)} ke Ledger ${to.toUpperCase()} berhasil!`, 'success')
        }}
      />

      <YearModal
        open={yearModalOpen}
        onClose={() => setYearModalOpen(false)}
        year={store.year}
        saldoAwal={store.saldoAwal}
        onSave={(year, saldoAwal) => {
          store.setYear(year)
          store.setSaldoAwal(saldoAwal)
          addToast(`Pengaturan tahun fiskal ${year} dan saldo awal berhasil disimpan.`, 'success')
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

      <ToastStack toasts={toasts} remove={removeToast} />
    </div>
  )
}
