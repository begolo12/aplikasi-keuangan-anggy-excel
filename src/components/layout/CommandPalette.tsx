import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Download, Calendar, X, ArrowLeftRight } from 'lucide-react'
import { ALL_NAV_ITEMS, TAB_ICONS, type TabKey } from './navConfig'

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
    { id: 'quick-tx', label: 'Tambah transaksi baru', icon: <Plus size={18} className="text-accent" />, run: () => { onClose(); onOpenQuickTx() } },
    { id: 'transfer', label: 'Pindah saldo antar kas', icon: <ArrowLeftRight size={18} className="text-text-muted" />, run: () => { onClose(); onOpenTransfer() } },
    { id: 'year', label: 'Ganti tahun buku', icon: <Calendar size={18} className="text-warning" />, run: () => { onClose(); onOpenYearModal() } },
    { id: 'export', label: 'Export ke Excel', icon: <Download size={18} className="text-positive" />, run: () => { onClose(); onExportExcel() } },
    ...ALL_NAV_ITEMS.map((item) => {
      const Icon = TAB_ICONS[item.id]
      return { id: `nav-${item.id}`, label: `Buka ${item.label}`, icon: <Icon size={18} />, run: () => { onClose(); onSelectTab(item.id) } }
    }),
  ]

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-[var(--c-overlay)] backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-xl rounded-lg md-elevation-3 overflow-hidden z-10 animate-scale">
        <div className="flex items-center px-4 py-3 border-b border-border bg-canvas">
          <Search size={20} className="text-text-subtle mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari perintah atau halaman..."
            className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-subtle"
          />
          <button onClick={onClose} className="p-1 rounded-full text-text-subtle hover:bg-border-strong transition">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length > 0 ? (
            filtered.map((action) => (
              <button
                key={action.id}
                onClick={action.run}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-sunken text-left transition cursor-pointer text-text text-xs font-medium"
              >
                <div className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted shrink-0">
                  {action.icon}
                </div>
                <span className="flex-1">{action.label}</span>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-text-subtle">Tidak ada hasil pencarian.</div>
          )}
        </div>
      </div>
    </div>
  )
}
