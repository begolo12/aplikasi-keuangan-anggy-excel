import {
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  Plus,
  Menu,
} from 'lucide-react'
import type { TabKey } from './Sidebar'

interface BottomNavProps {
  activeTab: TabKey
  onSelectTab: (tab: TabKey) => void
  onOpenMobileMenu: () => void
  onOpenQuickTx: () => void
  txCount: number
}

export function BottomNav({
  activeTab,
  onSelectTab,
  onOpenMobileMenu,
  onOpenQuickTx,
  txCount,
}: BottomNavProps) {
  const isOtherActive = !['dashboard', 'transaksi', 'rab'].includes(activeTab)

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#dbeae0] px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[58px] transition ${
            activeTab === 'dashboard'
              ? 'text-[#1c543c] font-black'
              : 'text-slate-500 font-semibold hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-[#eaf5ee]' : ''}`}>
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
        </button>

        {/* 2. Transaksi */}
        <button
          onClick={() => onSelectTab('transaksi')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[58px] relative transition ${
            activeTab === 'transaksi'
              ? 'text-[#1c543c] font-black'
              : 'text-slate-500 font-semibold hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'transaksi' ? 'bg-[#eaf5ee]' : ''}`}>
            <ArrowLeftRight size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Buku Kas</span>
          {txCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-emerald-600 rounded-full" />
          )}
        </button>

        {/* 3. Floating Quick Add Mutasi Button */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            onClick={onOpenQuickTx}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1c543c] to-[#2d6a4f] text-white flex items-center justify-center shadow-md active:scale-90 transition transform"
            aria-label="Catat Mutasi Kas"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
          <span className="text-[10px] mt-1 font-bold text-[#1c543c]">Catat</span>
        </div>

        {/* 4. RAB */}
        <button
          onClick={() => onSelectTab('rab')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[58px] transition ${
            activeTab === 'rab'
              ? 'text-[#1c543c] font-black'
              : 'text-slate-500 font-semibold hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'rab' ? 'bg-[#eaf5ee]' : ''}`}>
            <Calculator size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">RAB</span>
        </button>

        {/* 5. Menu Lainnya */}
        <button
          onClick={onOpenMobileMenu}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[58px] transition ${
            isOtherActive
              ? 'text-[#1c543c] font-black'
              : 'text-slate-500 font-semibold hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${isOtherActive ? 'bg-[#eaf5ee]' : ''}`}>
            <Menu size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Lainnya</span>
        </button>
      </div>
    </div>
  )
}
