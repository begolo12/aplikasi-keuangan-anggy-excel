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
  ShieldCheck,
  Plus,
} from 'lucide-react'
import type { TabKey } from './Sidebar'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  activeTab: TabKey
  onSelectTab: (tab: TabKey) => void
  txCount: number
  unpaidPiutangCount: number
  onOpenQuickTx: () => void
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

  const menuItems: { id: TabKey; label: string; icon: React.ReactNode; badge?: number; group?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'transaksi', label: 'Buku Kas (3 Ledger)', icon: <ArrowLeftRight size={18} />, badge: txCount },
    { id: 'rab', label: 'RAB Anggaran', icon: <Calculator size={18} /> },
    { id: 'cashflow', label: 'Cash Flow Tahunan', icon: <TrendingUp size={18} /> },
    { id: 'rari', label: 'Realisasi vs Anggaran', icon: <PieChart size={18} /> },
    { id: 'aset', label: 'Monitoring Aset', icon: <Building2 size={18} /> },
    { id: 'depresiasi', label: 'Depresiasi Aset', icon: <Scale size={18} /> },
    { id: 'schedule', label: 'Jadwal Pajak & Servis', icon: <CalendarClock size={18} /> },
    { id: 'piutang', label: 'Buku Piutang', icon: <HandCoins size={18} />, badge: unpaidPiutangCount },
    { id: 'neraca', label: 'Neraca Keuangan', icon: <FileSpreadsheet size={18} /> },
  ]

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#0f291e]/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-4/5 max-w-xs bg-white text-slate-800 h-full flex flex-col shadow-2xl z-10 animate-in border-r border-[#dbeae0]">
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#dbeae0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1c543c] to-[#40916c] flex items-center justify-center text-white font-black text-base shadow-xs">
              F
            </div>
            <div>
              <h2 className="font-black text-[#0f291e] text-sm tracking-tight">FinSheet Pro</h2>
              <p className="text-[10px] text-[#2d6a4f] font-extrabold tracking-wider uppercase">Cash Flow & Asset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#edf6f0] transition"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Add CTA inside Drawer */}
        <div className="p-3 border-b border-[#edf4ef]">
          <button
            onClick={() => {
              onClose()
              onOpenQuickTx()
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#1c543c] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs active:scale-98 transition"
          >
            <Plus size={16} />
            <span>Catat Mutasi Kas Baru</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
            Semua Modul
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id)
                  onClose()
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#e7f4ec] text-[#123828] font-black border border-[#c5e4d1] shadow-xs'
                    : 'text-slate-600 hover:bg-[#f4f9f6] hover:text-[#1c543c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#1c543c]' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-[#1c543c] text-white' : 'bg-[#eaf5ee] text-[#1c543c] border border-[#d2eadb]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="p-3.5 border-t border-[#dbeae0] bg-[#f8faf9] flex items-center gap-2 text-[11px] text-[#1c543c] font-bold">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>Formula Excel 100% Valid</span>
        </div>
      </div>
    </div>
  )
}
