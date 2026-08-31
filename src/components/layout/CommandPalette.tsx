import { useState, useEffect, useRef } from 'react'
import {
  Search,
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  TrendingUp,
  Building2,
  CalendarClock,
  HandCoins,
  FileSpreadsheet,
  Scale,
  Plus,
  Download,
  Calendar,
  X,
  PieChart,
} from 'lucide-react'
import type { TabKey } from './Sidebar'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onSelectTab: (tab: TabKey) => void
  onOpenQuickTx: () => void
  onOpenTransfer: () => void
  onOpenYearModal: () => void
  onExportExcel: () => void
}

export function CommandPalette({
  open,
  onClose,
  onSelectTab,
  onOpenQuickTx,
  onOpenTransfer,
  onOpenYearModal,
  onExportExcel,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) onClose()
      }
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const actions = [
    { id: 'quick-tx', label: 'Catat Mutasi / Transaksi Baru', icon: <Plus size={16} className="text-emerald-600" />, run: () => { onClose(); onOpenQuickTx() } },
    { id: 'transfer', label: 'Transfer Dropping Kas (Master ke Operasional/Keluarga)', icon: <ArrowLeftRight size={16} className="text-blue-600" />, run: () => { onClose(); onOpenTransfer() } },
    { id: 'year', label: 'Ganti Tahun Finansial Aktif', icon: <Calendar size={16} className="text-amber-600" />, run: () => { onClose(); onOpenYearModal() } },
    { id: 'export', label: 'Export Seluruh Sheet ke Format Excel (.xlsx)', icon: <Download size={16} className="text-emerald-600" />, run: () => { onClose(); onExportExcel() } },
    { id: 'nav-dash', label: 'Buka Dashboard Finansial', icon: <LayoutDashboard size={16} />, run: () => { onClose(); onSelectTab('dashboard') } },
    { id: 'nav-tx', label: 'Buka Buku Kas (3 Ledger)', icon: <ArrowLeftRight size={16} />, run: () => { onClose(); onSelectTab('transaksi') } },
    { id: 'nav-rab', label: 'Buka RAB Anggaran (Anggy & Keluarga)', icon: <Calculator size={16} />, run: () => { onClose(); onSelectTab('rab') } },
    { id: 'nav-cf', label: 'Buka Cash Flow Tahunan', icon: <TrendingUp size={16} />, run: () => { onClose(); onSelectTab('cashflow') } },
    { id: 'nav-rari', label: 'Buka Realisasi vs Anggaran (RA-RI)', icon: <PieChart size={16} />, run: () => { onClose(); onSelectTab('rari') } },
    { id: 'nav-aset', label: 'Buka Monitoring Aset & Properti', icon: <Building2 size={16} />, run: () => { onClose(); onSelectTab('aset') } },
    { id: 'nav-dep', label: 'Buka Depresiasi Nilai Buku Aset', icon: <Scale size={16} />, run: () => { onClose(); onSelectTab('depresiasi') } },
    { id: 'nav-sched', label: 'Buka Jadwal Pajak & Servis Berkala', icon: <CalendarClock size={16} />, run: () => { onClose(); onSelectTab('schedule') } },
    { id: 'nav-piutang', label: 'Buka Buku Piutang Pribadi', icon: <HandCoins size={16} />, run: () => { onClose(); onSelectTab('piutang') } },
    { id: 'nav-neraca', label: 'Buka Neraca Total (Aktiva vs Passiva)', icon: <FileSpreadsheet size={16} />, run: () => { onClose(); onSelectTab('neraca') } },
  ]

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale">
        <div className="p-3.5 border-b border-slate-100 flex items-center gap-3">
          <Search size={18} className="text-slate-400 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ketik perintah atau nama modul..."
            className="flex-1 text-sm font-semibold outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs font-semibold text-slate-400">
              Tidak ada hasil yang cocok dengan &quot;{search}&quot;
            </div>
          ) : (
            filtered.map((action) => (
              <button
                key={action.id}
                onClick={action.run}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition group"
              >
                <span className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-white text-slate-600 group-hover:text-blue-700 transition">
                  {action.icon}
                </span>
                <span className="flex-1 truncate">{action.label}</span>
              </button>
            ))
          )}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold px-4">
          <span>Navigasi Cepat</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-bold">ESC untuk tutup</kbd>
        </div>
      </div>
    </div>
  )
}
