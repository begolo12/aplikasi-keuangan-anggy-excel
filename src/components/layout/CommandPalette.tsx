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
  const [lastOpen, setLastOpen] = useState(false)
  if (open && !lastOpen) {
    setLastOpen(true)
    setSearch('')
  } else if (!open && lastOpen) {
    setLastOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(id)
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
    { id: 'quick-tx', label: 'Tambah transaksi baru', icon: <Plus size={18} className="text-[#1a73e8]" />, run: () => { onClose(); onOpenQuickTx() } },
    { id: 'transfer', label: 'Pindah saldo antar kas', icon: <ArrowLeftRight size={18} className="text-[#444746]" />, run: () => { onClose(); onOpenTransfer() } },
    { id: 'year', label: 'Ganti tahun buku', icon: <Calendar size={18} className="text-[#b06000]" />, run: () => { onClose(); onOpenYearModal() } },
    { id: 'export', label: 'Export ke Excel', icon: <Download size={18} className="text-[#137333]" />, run: () => { onClose(); onExportExcel() } },
    { id: 'nav-dash', label: 'Buka Ringkasan', icon: <LayoutDashboard size={18} />, run: () => { onClose(); onSelectTab('dashboard') } },
    { id: 'nav-tx', label: 'Buka Keluar Masuk Uang', icon: <ArrowLeftRight size={18} />, run: () => { onClose(); onSelectTab('transaksi') } },
    { id: 'nav-rab', label: 'Buka Rencana Anggaran', icon: <Calculator size={18} />, run: () => { onClose(); onSelectTab('rab') } },
    { id: 'nav-cf', label: 'Buka Arus Kas Bulanan', icon: <TrendingUp size={18} />, run: () => { onClose(); onSelectTab('cashflow') } },
    { id: 'nav-rari', label: 'Buka Anggaran vs Realisasi', icon: <PieChart size={18} />, run: () => { onClose(); onSelectTab('rari') } },
    { id: 'nav-aset', label: 'Buka Daftar Aset', icon: <Building2 size={18} />, run: () => { onClose(); onSelectTab('aset') } },
    { id: 'nav-dep', label: 'Buka Penyusutan Aset', icon: <Scale size={18} />, run: () => { onClose(); onSelectTab('depresiasi') } },
    { id: 'nav-sched', label: 'Buka Jadwal & Pajak', icon: <CalendarClock size={18} />, run: () => { onClose(); onSelectTab('schedule') } },
    { id: 'nav-piutang', label: 'Buka Piutang', icon: <HandCoins size={18} />, run: () => { onClose(); onSelectTab('piutang') } },
    { id: 'nav-neraca', label: 'Buka Kekayaan Bersih', icon: <FileSpreadsheet size={18} />, run: () => { onClose(); onSelectTab('neraca') } },
    { id: 'nav-settings', label: 'Buka Pengaturan Master Data', icon: <Search size={18} />, run: () => { onClose(); onSelectTab('settings') } },
  ]

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-3xl md-elevation-3 overflow-hidden z-10 animate-scale">
        <div className="flex items-center px-4 py-3 border-b border-[#e0e2e0] bg-[#f8f9fa]">
          <Search size={20} className="text-[#747775] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari perintah atau halaman..."
            className="w-full bg-transparent border-none outline-none text-sm text-[#1f1f1f] placeholder:text-[#747775]"
          />
          <button onClick={onClose} className="p-1 rounded-full text-[#747775] hover:bg-[#e0e2e0] transition">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length > 0 ? (
            filtered.map((action) => (
              <button
                key={action.id}
                onClick={action.run}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#f1f3f4] text-left transition cursor-pointer text-[#1f1f1f] text-xs font-medium"
              >
                <div className="w-8 h-8 rounded-full bg-[#f1f3f4] flex items-center justify-center text-[#444746] shrink-0">
                  {action.icon}
                </div>
                <span className="flex-1">{action.label}</span>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-[#747775]">Tidak ada hasil pencarian.</div>
          )}
        </div>
      </div>
    </div>
  )
}
