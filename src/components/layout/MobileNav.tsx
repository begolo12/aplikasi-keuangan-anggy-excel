import React from 'react'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  CalendarClock,
  HandCoins,
  Scale,
  PieChart,
  X,
  Plus,
  Settings,
} from 'lucide-react'
import { NAV_GROUPS, type TabKey } from './navConfig'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  activeTab: TabKey
  onSelectTab: (tab: TabKey) => void
  txCount: number
  unpaidPiutangCount: number
  onOpenQuickTx: () => void
}

const TAB_ICONS: Record<TabKey, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  transaksi: <ArrowLeftRight size={20} />,
  rab: <Calculator size={20} />,
  cashflow: <TrendingUp size={20} />,
  rari: <PieChart size={20} />,
  aset: <Building2 size={20} />,
  depresiasi: <Scale size={20} />,
  schedule: <CalendarClock size={20} />,
  piutang: <HandCoins size={20} />,
  neraca: <FileSpreadsheet size={20} />,
  settings: <Settings size={20} />,
}

export function MobileNav({
  open,
  onClose,
  activeTab,
  onSelectTab,
  txCount,
  unpaidPiutangCount,
  onOpenQuickTx,
}: MobileNavProps) {
  if (!open) return null

  const getBadgeValue = (key?: 'txCount' | 'unpaidPiutangCount') => {
    if (key === 'txCount' && txCount > 0) return txCount
    if (key === 'unpaidPiutangCount' && unpaidPiutangCount > 0) return unpaidPiutangCount
    return undefined
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Material Modal Navigation Drawer */}
      <div className="relative w-[320px] max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 animate-in rounded-r-3xl border-r border-[#e0e2e0]">
        <div className="h-[64px] flex items-center justify-between px-5 border-b border-[#e0e2e0] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-base">F</div>
            <div>
              <h2 className="text-[17px] font-medium tracking-tight text-[#1f1f1f] leading-none">FinSheet <span className="text-[#1a73e8]">PRO</span></h2>
              <p className="text-[11px] text-[#747775] leading-none mt-1">Keuangan & Aset Terpadu</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-[#444746] hover:bg-[#f1f3f4] transition cursor-pointer" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <button onClick={() => { onClose(); onOpenQuickTx() }} className="w-full py-3 px-4 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium flex items-center justify-center gap-2 md-elevation-1 transition cursor-pointer">
            <Plus size={18} /> Tambah Transaksi
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="px-3 mb-1.5 text-[11px] font-medium tracking-wider text-[#747775] uppercase">{group.title}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id
                  const badge = getBadgeValue(item.badgeKey)
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSelectTab(item.id); onClose() }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-[13px] transition cursor-pointer ${isActive ? 'bg-[#c2e7ff] text-[#001d35] font-semibold' : 'text-[#444746] hover:bg-[#f1f3f4] hover:text-[#1f1f1f] font-medium'}`}
                    >
                      <span className="flex items-center gap-3"><span className={isActive ? 'text-[#001d35]' : 'text-[#444746]'}>{TAB_ICONS[item.id]}</span>{item.label}</span>
                      {badge !== undefined && <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-[#001d35] text-white' : 'bg-[#e0e2e0] text-[#1f1f1f]'}`}>{badge}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
