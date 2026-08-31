import React from 'react'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  TrendingUp,
  Scale,
  Building2,
  CalendarClock,
  HandCoins,
  FileSpreadsheet,
  PieChart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
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

interface SidebarProps {
  activeTab: TabKey
  onSelectTab: (tab: TabKey) => void
  collapsed: boolean
  onToggleCollapse: () => void
  txCount: number
  unpaidPiutangCount: number
}

export function Sidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  txCount,
  unpaidPiutangCount,
}: SidebarProps) {
  const menuItems: { id: TabKey; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'transaksi', label: 'Buku Kas (3 Ledger)', icon: <ArrowLeftRight size={18} />, badge: txCount > 0 ? txCount : undefined },
    { id: 'rab', label: 'RAB Anggaran', icon: <Calculator size={18} /> },
    { id: 'cashflow', label: 'Cash Flow Tahunan', icon: <TrendingUp size={18} /> },
    { id: 'rari', label: 'Realisasi vs Anggaran', icon: <PieChart size={18} /> },
    { id: 'aset', label: 'Monitoring Aset', icon: <Building2 size={18} /> },
    { id: 'depresiasi', label: 'Depresiasi Aset', icon: <Scale size={18} /> },
    { id: 'schedule', label: 'Jadwal Pajak & Servis', icon: <CalendarClock size={18} /> },
    { id: 'piutang', label: 'Buku Piutang', icon: <HandCoins size={18} />, badge: unpaidPiutangCount > 0 ? unpaidPiutangCount : undefined },
    { id: 'neraca', label: 'Neraca Keuangan', icon: <FileSpreadsheet size={18} /> },
  ]

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white text-slate-700 border-r border-[#dbeae0] transition-all duration-300 relative select-none ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#dbeae0]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1c543c] to-[#40916c] flex items-center justify-center text-white font-black text-lg shadow-xs shrink-0">
            F
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-black text-[#0f291e] text-base tracking-tight leading-none truncate">
                FinSheet Pro
              </h1>
              <p className="text-[10px] text-[#2d6a4f] font-extrabold tracking-wider uppercase mt-1">
                Cash Flow & Asset
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin">
        {!collapsed && (
          <div className="px-3 pb-1.5 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative ${
                isActive
                  ? 'bg-[#e7f4ec] text-[#123828] font-black shadow-xs border border-[#c5e4d1]'
                  : 'text-slate-600 hover:bg-[#f2f8f4] hover:text-[#1c543c]'
              } ${collapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`shrink-0 ${isActive ? 'text-[#1c543c]' : 'text-slate-400 group-hover:text-[#2d6a4f]'}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                    isActive ? 'bg-[#1c543c] text-white' : 'bg-[#eaf5ee] text-[#1c543c] border border-[#d2eadb]'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {collapsed && isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#1c543c] rounded-r-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#dbeae0] space-y-2">
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-[#f4f9f6] border border-[#dbeae0] flex items-center gap-2 text-[11px] text-[#1c543c] font-bold">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span className="truncate">Formula Excel 100% Valid</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl hover:bg-[#edf6f0] text-slate-500 hover:text-[#1c543c] transition text-xs font-semibold"
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Ciutkan</span></>}
        </button>
      </div>
    </aside>
  )
}
