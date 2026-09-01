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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e0e2e0] px-1 py-1.5 safe-area-bottom md-elevation-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {([
          { id: 'dashboard' as const, icon: <LayoutDashboard size={20} />, label: 'Ringkasan' },
          { id: 'transaksi' as const, icon: <ArrowLeftRight size={20} />, label: 'Transaksi', dot: txCount > 0 },
          { id: 'rab' as const, icon: <Calculator size={20} />, label: 'Anggaran' },
        ] as const).map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as TabKey)}
              className="flex flex-col items-center justify-center py-1 px-3 min-w-[64px] relative transition cursor-pointer"
            >
              <span className={`px-3.5 py-1 rounded-full transition-colors ${isActive ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#444746]'}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-semibold text-[#001d35]' : 'font-medium text-[#747775]'}`}>
                {tab.label}
              </span>
              {'dot' in tab && tab.dot && <span className="absolute top-1 right-3.5 w-2 h-2 bg-[#137333] rounded-full border border-white" />}
            </button>
          )
        })}
        <button onClick={onOpenQuickTx} className="flex flex-col items-center justify-center gap-0.5 -mt-3 cursor-pointer">
          <span className="w-12 h-12 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center md-elevation-2 active:scale-95 transition-transform"><Plus size={22} /></span>
          <span className="text-[10px] font-medium text-[#1a73e8]">Tambah</span>
        </button>
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-3 min-w-[64px] transition cursor-pointer"
        >
          <span className={`px-3.5 py-1 rounded-full transition-colors ${isOtherActive ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#444746]'}`}>
            <Menu size={20} />
          </span>
          <span className={`text-[10px] mt-0.5 tracking-tight ${isOtherActive ? 'font-semibold text-[#001d35]' : 'font-medium text-[#747775]'}`}>
            Menu
          </span>
        </button>
      </div>
    </div>
  )
}
