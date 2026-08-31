import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useStore } from './store'
import type { Ledger, Tx, PiutangRow } from './store'
import { assetDebt, consolidatedExpense, consolidatedIncome, ledgerBalance, ledgerExpense, monthlyTotals, outstandingPiutang, rabMonthlyTotals, runningBalancesForYear, straightLineValue, yearTransactions } from './finance'
import {
  Wallet,
  LayoutDashboard,
  FileSpreadsheet,
  TrendingUp,
  Building2,
  Calculator,
  CalendarClock,
  HandCoins,
  Scale,
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  PiggyBank,
  Menu,
  X,
  Edit2,
  CheckCircle2,
  RefreshCw,
  DollarSign,
  ArrowLeftRight,
  Layers,
  PieChart,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ArrowUp,
  Filter,
  Eye,
  Calendar,
  LayoutGrid,
  List,
  Command,
  SlidersHorizontal,
  HelpCircle,
  BookOpen,
} from 'lucide-react'

const fmt = new Intl.NumberFormat('id-ID')

function formatRibuan(v: number | string | undefined | null): string {
  if (v === '' || v === undefined || v === null) return ''
  const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/\D/g, ''))
  if (isNaN(num) || num === 0) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}
function parseRibuan(str: string): number {
  if (!str) return 0
  const clean = String(str).replace(/\D/g, '')
  return clean ? parseInt(clean, 10) : 0
}

function RupiahInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  required = false,
  name,
}: {
  value?: number | string
  onChange?: (val: number) => void
  placeholder?: string
  className?: string
  required?: boolean
  name?: string
}) {
  const [displayVal, setDisplayVal] = useState(() => formatRibuan(value))

  useEffect(() => {
    setDisplayVal(formatRibuan(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = raw ? parseInt(raw, 10) : 0
    const formatted = num > 0 ? new Intl.NumberFormat('id-ID').format(num) : ''
    setDisplayVal(formatted)
    if (onChange) onChange(num)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      name={name}
      required={required}
      placeholder={placeholder}
      value={displayVal}
      onChange={handleChange}
      className={className}
    />
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const bgClass = className.includes('bg-') ? '' : 'bg-white'
  const borderClass = className.includes('border-0') || className.includes('border-') || className.includes('border ') ? '' : 'border border-slate-200'
  return <div className={`rounded-2xl shadow-card ${bgClass} ${borderClass} ${className}`}>{children}</div>
}

type ToastItem = { id: string; message: string; kind: 'success' | 'error' | 'info' }
function ToastStack({ toasts, remove }: { toasts: ToastItem[]; remove: (id: string) => void }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto min-w-[280px] max-w-[420px] px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-start gap-3 toast-enter ${t.kind==='success' ? 'bg-emerald-600 text-white border-emerald-700' : t.kind==='error' ? 'bg-rose-600 text-white border-rose-700' : 'bg-slate-900 text-white border-slate-800'}`} role="status" aria-live="polite">
          <span className="mt-0.5 shrink-0">{t.kind==='success' ? <CheckCircle2 size={16}/> : t.kind==='error' ? <X size={16}/> : <Search size={16}/>}</span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button onClick={()=>remove(t.id)} className="shrink-0 p-1 -mr-1 rounded-lg hover:bg-white/15 text-white/80"><X size={14}/></button>
        </div>
      ))}
    </div>
  )
}
function ConfirmDialog({ open, title, message, confirmLabel = 'Hapus', cancelLabel = 'Batal', variant = 'danger', onConfirm, onCancel }: { open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; variant?: 'danger' | 'primary'; onConfirm: () => void; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    cancelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 animate-scale border border-slate-200">
        <h3 className="font-extrabold text-[17px] text-slate-900 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{message}</p>
        <div className="mt-6 flex gap-3">
          <button ref={cancelRef} onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition">{cancelLabel}</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition ${variant==='danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#1E3A5F] hover:bg-[#152a45]'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}


export default function App() {
  const s = useStore()
  const [tab, setTab] = useState('dashboard')
  const [q, setQ] = useState('')
  const [navQ, setNavQ] = useState('')
  const [ledger, setLedger] = useState<'all' | 'master' | 'operasional' | 'keluarga'>('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('anggy_sidebar_collapsed') === '1' } catch { return false }
  })
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [rabView, setRabView] = useState<'grid' | 'single'>('grid')
  const [rabSingleTab, setRabSingleTab] = useState<'anggy' | 'keluarga' | 'resume'>('anggy')
  const [rabQ, setRabQ] = useState('')
  const [cmdOpen, setCmdOpen] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [helpQ, setHelpQ] = useState('')
  const [density, setDensity] = useState<'comfortable' | 'compact'>(() => {
    try {
      const v = localStorage.getItem('anggy_density')
      return v === 'compact' ? 'compact' : 'comfortable'
    } catch { return 'comfortable' }
  })

  const [showAddTxModal, setShowAddTxModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showAddRabModal, setShowAddRabModal] = useState(false)
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  const [showAddDepModal, setShowAddDepModal] = useState(false)
  const [showAddSchedModal, setShowAddSchedModal] = useState(false)
  const [showAddPiutangModal, setShowAddPiutangModal] = useState(false)
  const [showPelunasanModal, setShowPelunasanModal] = useState<PiutangRow | null>(null)
  const [editingTx, setEditingTx] = useState<Tx | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return localStorage.getItem('anggy_onboarding_done') !== '1' } catch { return true }
  })

  const [txForm, setTxForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    nsb: 'ANGGY',
    pos: 'SALARY',
    uraian: '',
    penerimaan: '',
    pengeluaran: '',
    ledger: 'master' as Ledger,
  })
  const [transferForm, setTransferForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    to: 'operasional' as 'operasional' | 'keluarga',
    amount: '',
    uraian: '',
  })
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [confirmCfg, setConfirmCfg] = useState<null | { title: string; message: string; confirmLabel?: string; variant?: 'danger' | 'primary'; onConfirm: () => void }>(null)
  const [pelunasanNominal, setPelunasanNominal] = useState('')
  const [pelunasanTgl, setPelunasanTgl] = useState(() => new Date().toISOString().slice(0, 10))
  const [exporting, setExporting] = useState(false)
  const storeData = useMemo(() => ({ schemaVersion: s.schemaVersion, demoMode: s.demoMode, txs: s.txs, rabAnggy: s.rabAnggy, rabKeluarga: s.rabKeluarga, piutangs: s.piutangs, deps: s.deps, assets: s.assets, scheds: s.scheds, year: s.year, saldoAwal: s.saldoAwal }), [s.schemaVersion, s.demoMode, s.txs, s.rabAnggy, s.rabKeluarga, s.piutangs, s.deps, s.assets, s.scheds, s.year, s.saldoAwal])

  const pushToast = useCallback((message: string, kind: ToastItem['kind'] = 'success') => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts(t => [...t, { id, message, kind }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  const removeToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), [])
  const askConfirm = useCallback((cfg: { title: string; message: string; confirmLabel?: string; variant?: 'danger' | 'primary'; onConfirm: () => void }) => setConfirmCfg(cfg), [])
  const finishOnboarding = useCallback((mode: 'empty' | 'demo') => {
    if (mode === 'empty') {
      s.importState({ ...storeData, txs: [], rabAnggy: [], rabKeluarga: [], piutangs: [], deps: [], assets: [], scheds: [], saldoAwal: 0, demoMode: false, schemaVersion: 2 })
    } else {
      s.setDemoMode(true)
    }
    setShowOnboarding(false)
    try { localStorage.setItem('anggy_onboarding_done', '1') } catch {}
  }, [s, storeData])
  const exportBackup = useCallback(() => {
    const payload = JSON.stringify({ app: 'Anggy Keuangan', appVersion: '0.1.0', schemaVersion: 2, exportedAt: new Date().toISOString(), data: storeData }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `anggy-keuangan-backup-${s.year}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    pushToast('Backup data berhasil diunduh', 'success')
  }, [pushToast, s.year, storeData])
  const importBackup = useCallback(async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text())
      const data = parsed?.data ?? parsed
      if (!data || !Array.isArray(data.txs) || !Array.isArray(data.rabAnggy) || !Array.isArray(data.rabKeluarga)) throw new Error('Format backup tidak dikenali')
      askConfirm({ title: 'Ganti data saat ini?', message: 'Backup akan menggantikan seluruh data lokal setelah validasi berhasil.', confirmLabel: 'Impor Backup', variant: 'primary', onConfirm: () => { s.importState(data); setShowOnboarding(false); pushToast('Backup berhasil dipulihkan', 'success') } })
    } catch (error) { pushToast(error instanceof Error ? error.message : 'Backup tidak dapat dibaca', 'error') }
  }, [askConfirm, pushToast, s])

  const handleExport = useCallback(async () => {
    if (exporting) return
    setExporting(true)
    try {
      // lazy-load: exceljs is heavy (~900 kB), only needed when user exports
      const mod = await import('./export')
      await mod.exportExcel(s)
      pushToast('File Excel 13 sheet berhasil diunduh', 'success')
    } catch (e) {
      pushToast('Gagal mengekspor Excel. Coba lagi.', 'error')
      console.error(e)
    } finally { setExporting(false) }
  }, [s, exporting, pushToast])


  const reportDate = `${s.year}-12-31`
  const activeTxs = useMemo(() => yearTransactions(s.txs, s.year), [s.txs, s.year])
  const saldoMaster = useMemo(() => ledgerBalance(activeTxs, 'master', s.saldoAwal), [activeTxs, s.saldoAwal])
  const saldoOps = useMemo(() => ledgerBalance(activeTxs, 'operasional'), [activeTxs])
  const saldoKel = useMemo(() => ledgerBalance(activeTxs, 'keluarga'), [activeTxs])
  const totalKas = useMemo(() => saldoMaster + saldoOps + saldoKel, [saldoMaster, saldoOps, saldoKel])
  const piutangTotal = useMemo(() => outstandingPiutang(s.piutangs), [s.piutangs])
  const totalAsetPasar = useMemo(() => s.assets.reduce((a, x) => a + x.nilaiPasar, 0) + s.deps.reduce((a, d) => a + d.nilaiTaksir, 0), [s.assets, s.deps])
  const totalKekayaan = useMemo(() => totalKas + piutangTotal + totalAsetPasar, [totalKas, piutangTotal, totalAsetPasar])
  const monthlyActual = useMemo(() => monthlyTotals(activeTxs, s.year), [activeTxs, s.year])
  const totalIncomeYtd = useMemo(() => consolidatedIncome(activeTxs), [activeTxs])
  const totalExpenseYtd = useMemo(() => consolidatedExpense(activeTxs), [activeTxs])
  const netSurplusYtd = totalIncomeYtd - totalExpenseYtd
  const balancesById = useMemo(() => new Map([...runningBalancesForYear(s.txs, 'master', s.year, s.saldoAwal), ...runningBalancesForYear(s.txs, 'operasional', s.year), ...runningBalancesForYear(s.txs, 'keluarga', s.year)]), [s.txs, s.year, s.saldoAwal])

  const filteredTxs = useMemo(() => {
    let rows = [...activeTxs].sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.id.localeCompare(b.id))
    if (ledger !== 'all') rows = rows.filter((r) => r.ledger === ledger)
    if (q) rows = rows.filter((r) => (r.uraian + r.pos + r.nsb + r.tanggal).toLowerCase().includes(q.toLowerCase()))
    return rows
  }, [activeTxs, ledger, q])

  const navGroups = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, desc: 'Ringkasan' },
        { id: 'transaksi', label: 'Buku Transaksi', icon: Wallet, badge: `${s.txs.length}`, desc: '3 Ledger' },
      ],
    },
    {
      title: 'ANGGARAN & CASH FLOW',
      items: [
        { id: 'rab', label: 'RAB Anggaran', icon: FileSpreadsheet, badge: '01 & 02', desc: 'Resume • 17 Pos' },
        { id: 'cashflow', label: 'Monitoring Cash Flow', icon: TrendingUp, badge: '12 Bln', desc: 'Proyeksi' },
        { id: 'rari', label: 'Realisasi & Evaluasi', icon: PieChart, badge: 'RARI', desc: 'RA / RI' },
      ],
    },
    {
      title: 'ASET & PIUTANG',
      items: [
        { id: 'aset', label: 'Aset & Kredit KPR', icon: Building2, badge: `${s.assets.length}`, desc: 'Property' },
        { id: 'depresiasi', label: 'Depresiasi', icon: Calculator, badge: `${s.deps.length}`, desc: 'Garis Lurus' },
        { id: 'schedule', label: 'Jadwal Servis & Pajak', icon: CalendarClock, badge: 'Kalender', desc: '12 Bulan' },
        { id: 'piutang', label: 'Piutang Personal', icon: HandCoins, badge: `${s.piutangs.length}`, desc: 'Tagihan' },
      ],
    },
    {
      title: 'LAPORAN',
      items: [{ id: 'neraca', label: 'Neraca Total', icon: Scale, badge: 'Balance', desc: 'Aktiva / Passiva' }],
    },
  ]

  const filteredNavGroups = useMemo(() => {
    if (!navQ) return navGroups
    const qq = navQ.toLowerCase()
    return navGroups.map(g => ({
      ...g,
      items: g.items.filter(it => it.label.toLowerCase().includes(qq) || it.desc.toLowerCase().includes(qq))
    })).filter(g => g.items.length > 0)
  }, [navQ, s.txs.length, s.assets.length, s.deps.length, s.piutangs.length])

  const currentTabMeta = useMemo(() => {
    for (const g of navGroups) {
      const m = g.items.find((it) => it.id === tab)
      if (m) return { group: g.title, ...m }
    }
    return { group: 'UTAMA', id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, desc: '' }
  }, [tab])

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  useEffect(() => {
    try { localStorage.setItem('anggy_sidebar_collapsed', sidebarCollapsed ? '1' : '0') } catch {}
  }, [sidebarCollapsed])
  useEffect(() => {
    try { localStorage.setItem('anggy_density', density) } catch {}
  }, [density])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen(v=>!v) }
      if (e.key === 'Escape' && cmdOpen) setCmdOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cmdOpen])
  useEffect(() => {
    if (showPelunasanModal) {
      const sisa = showPelunasanModal.terbit - showPelunasanModal.lunas
      setPelunasanNominal(String(Math.max(0, sisa)))
      setPelunasanTgl(new Date().toISOString().slice(0, 10))
    } else {
      setPelunasanNominal('')
    }
  }, [showPelunasanModal])
  useEffect(() => {
    const anyModal = showAddTxModal || showTransferModal || showAddRabModal || showAddAssetModal || showAddDepModal || showAddSchedModal || showAddPiutangModal || !!showPelunasanModal || showHelpModal || cmdOpen || mobileMenuOpen || !!confirmCfg
    if (anyModal) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [showAddTxModal, showTransferModal, showAddRabModal, showAddAssetModal, showAddDepModal, showAddSchedModal, showAddPiutangModal, showPelunasanModal, showHelpModal, cmdOpen, mobileMenuOpen, confirmCfg])
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (confirmCfg) { setConfirmCfg(null); return }
      if (showHelpModal) setShowHelpModal(false)
      else if (showPelunasanModal) setShowPelunasanModal(null)
      else if (showAddTxModal) setShowAddTxModal(false)
      else if (showTransferModal) setShowTransferModal(false)
      else if (showAddRabModal) setShowAddRabModal(false)
      else if (showAddAssetModal) setShowAddAssetModal(false)
      else if (showAddDepModal) setShowAddDepModal(false)
      else if (showAddSchedModal) setShowAddSchedModal(false)
      else if (showAddPiutangModal) setShowAddPiutangModal(false)
      else if (mobileMenuOpen) setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [showAddTxModal, showTransferModal, showAddRabModal, showAddAssetModal, showAddDepModal, showAddSchedModal, showAddPiutangModal, showPelunasanModal, showHelpModal, mobileMenuOpen, confirmCfg])


  const filteredRabAnggy = useMemo(() => {
    if (!rabQ) return s.rabAnggy
    const qq = rabQ.toLowerCase()
    return s.rabAnggy.filter(r => r.uraian.toLowerCase().includes(qq) || r.group.toLowerCase().includes(qq))
  }, [s.rabAnggy, rabQ])
  const filteredRabKeluarga = useMemo(() => {
    if (!rabQ) return s.rabKeluarga
    const qq = rabQ.toLowerCase()
    return s.rabKeluarga.filter(r => r.uraian.toLowerCase().includes(qq) || r.group.toLowerCase().includes(qq))
  }, [s.rabKeluarga, rabQ])

  const rabAnggyTotal = s.rabAnggy.reduce((a, r) => a + r.w.reduce((x,y)=>x+y,0), 0)
  const rabKelTotal = s.rabKeluarga.reduce((a, r) => a + r.w.reduce((x,y)=>x+y,0), 0)
  const rabFilteredAnggyTotal = filteredRabAnggy.reduce((a, r) => a + r.w.reduce((x,y)=>x+y,0), 0)
  const rabFilteredKelTotal = filteredRabKeluarga.reduce((a, r) => a + r.w.reduce((x,y)=>x+y,0), 0)
  const rowPad = density === 'compact' ? 'py-2.5' : 'py-3.5'

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex antialiased selection:bg-[#1E3A5F] selection:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 z-30 shrink-0 shadow-xs transition-all duration-300 ${sidebarCollapsed ? 'w-[72px]' : 'w-[272px]'}`}>
        {/* Brand */}
        <div className={`h-[64px] px-4 border-b border-slate-100 flex items-center gap-3 shrink-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white font-black text-[15px] shadow-sm shrink-0">A</div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-[14.5px] text-slate-900 tracking-tight leading-none">Anggy Keuangan</div>
              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aset Management • {s.year}
              </div>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(v=>!v)} className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition ${sidebarCollapsed ? 'hidden' : ''}`} title="Ciutkan sidebar">
            <PanelLeftClose size={16} />
          </button>
        </div>
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)} className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="Buka sidebar">
            <PanelLeftOpen size={16} />
          </button>
        )}

        {/* Net Worth */}
        {!sidebarCollapsed ? (
          <div className="mx-3 mt-3 p-4 rounded-2xl bg-[#1E3A5F] text-white shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-300" /> Total Kekayaan Bersih
              </div>
              <div className="text-[19px] font-extrabold num tracking-tight mt-1.5 leading-none">Rp {fmt.format(Math.round(totalKekayaan))}</div>
              <div className="flex items-center justify-between text-[11px] font-medium mt-3 pt-3 border-t border-white/15">
                <span className="text-slate-300">Kas 3-Ledger</span>
                <span className="num font-bold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full">Rp {fmt.format(totalKas)}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold mt-2">
                <ArrowUp size={12} /> +{fmt.format(netSurplusYtd)} surplus YTD
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-2 mt-3 p-2.5 rounded-xl bg-[#1E3A5F] text-white flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold tracking-widest text-slate-300">KAS</span>
            <span className="text-xs font-extrabold num">{fmt.format(totalKas/1000000)}Jt</span>
          </div>
        )}

        {/* Nav Search */}
        {!sidebarCollapsed && (
          <div className="px-3 mt-3">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={navQ}
                onChange={e=>setNavQ(e.target.value)}
                placeholder="Cari menu…"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1E3A5F]/30 focus:ring-2 focus:ring-[#1E3A5F]/10 transition"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex-1 overflow-y-auto px-2 py-3 space-y-5 ${sidebarCollapsed ? 'px-1.5' : ''}`} style={{scrollbarWidth:'thin'}}>
          {filteredNavGroups.map((group) => (
            <div key={group.title}>
              {!sidebarCollapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-extrabold tracking-[0.12em] text-slate-400 uppercase flex items-center gap-2">
                  <span className="h-px flex-1 bg-slate-100" /> {group.title} <span className="h-px flex-1 bg-slate-100" />
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = tab === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all relative group
                        ${active ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                        ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between'}`}
                    >
                      {active && !sidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full" />}
                      <div className={`flex items-center gap-3 min-w-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-[#1E3A5F] group-hover:shadow-xs'}`}>
                          <Icon size={16} />
                        </span>
                        {!sidebarCollapsed && (
                          <span className="text-left leading-tight">
                            <span className="block truncate">{item.label}</span>
                            <span className={`block text-[11px] font-medium truncate ${active ? 'text-slate-300' : 'text-slate-400'}`}>{item.desc}</span>
                          </span>
                        )}
                      </div>
                      {!sidebarCollapsed && item.badge && (
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full shrink-0 ${active ? 'bg-white text-[#1E3A5F]' : 'bg-slate-100 text-slate-600 group-hover:bg-white border border-slate-200'}`}>{item.badge}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t border-slate-100 bg-slate-50/60 space-y-2.5 shrink-0 ${sidebarCollapsed ? 'p-2' : ''}`}>
          {!sidebarCollapsed ? (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={() => { setEditingTx(null); setShowAddTxModal(true) }} className="flex flex-col items-center gap-1 p-2 bg-white hover:bg-[#1E3A5F] hover:text-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition group">
                  <span className="w-7 h-7 rounded-lg bg-[#1E3A5F] group-hover:bg-white/15 text-white grid place-items-center"><Plus size={14} /></span> Catat
                </button>
                <button onClick={() => setShowTransferModal(true)} className="flex flex-col items-center gap-1 p-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition group">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-white/15 text-slate-600 group-hover:text-white grid place-items-center"><ArrowLeftRight size={14} /></span> Dropping
                </button>
                <button onClick={() => setCmdOpen(true)} className="flex flex-col items-center gap-1 p-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition group">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-white/15 text-slate-600 group-hover:text-white grid place-items-center"><Command size={14} /></span> Cari <span className="hidden xl:inline text-[9px] opacity-60">⌘K</span>
                </button>
              </div>
              <button onClick={() => setShowHelpModal(true)} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition">
                <HelpCircle size={14} className="text-[#1E3A5F]" /> Panduan & Tanya Jawab
              </button>
              <button onClick={handleExport} disabled={exporting} className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-wait text-white rounded-xl text-[13px] font-bold shadow-xs transition active:scale-[0.98]">
                <Download size={16} /> {exporting ? 'Menyiapkan…' : 'Export Excel (13 Sheet)'}
              </button>
              <button onClick={exportBackup} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"><Download size={14} /> Backup JSON</button>
              <label className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"><Upload size={14} /> Impor Backup<input type="file" accept="application/json" className="sr-only" onChange={e => { const file = e.target.files?.[0]; if (file) void importBackup(file); e.currentTarget.value = '' }} /></label>
              <button onClick={() => askConfirm({ title: 'Reset data ke sampel awal?', message: 'Seluruh transaksi, RAB, aset, dan piutang akan dikembalikan ke data contoh Excel. Tindakan ini tidak dapat dibatalkan.', confirmLabel: 'Ya, Reset', variant: 'danger', onConfirm: () => { s.reset(); pushToast('Data berhasil direset ke sampel awal', 'success') }})} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-slate-500 hover:text-rose-600 text-xs font-semibold transition">
                <RefreshCw size={13} /> Reset Data Default
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <button onClick={() => setShowHelpModal(true)} className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl grid place-items-center" title="Panduan & Bantuan"><HelpCircle size={16} /></button>
              <button onClick={() => { setEditingTx(null); setShowAddTxModal(true) }} className="w-full p-2.5 bg-[#1E3A5F] text-white rounded-xl grid place-items-center" title="Catat Transaksi"><Plus size={16} /></button>
              <button onClick={handleExport} disabled={exporting} className="w-full p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl flex items-center justify-center" title="Export Excel"><Download size={16} /></button>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-[320px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white font-black">A</div>
                <div><div className="font-bold text-sm text-slate-900">Anggy Keuangan</div><div className="text-xs text-slate-500">Navigasi Modul</div></div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={navQ} onChange={e=>setNavQ(e.target.value)} placeholder="Cari menu…" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#1E3A5F]" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
              {filteredNavGroups.map((g) => (
                <div key={g.title}>
                  <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase mb-1.5 px-2">{g.title}</div>
                  <div className="space-y-1">
                    {g.items.map((item) => {
                      const active = tab === item.id
                      const Icon = item.icon
                      return (
                        <button key={item.id} onClick={() => { setTab(item.id); setMobileMenuOpen(false) }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${active ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}>
                          <div className="flex items-center gap-3"><span className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-white/15' : 'bg-slate-100'}`}><Icon size={16} /></span><span>{item.label}</span></div>
                          {item.badge && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.badge}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
              <button onClick={() => { handleExport(); setMobileMenuOpen(false) }} disabled={exporting} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Download size={16} /> {exporting ? 'Menyiapkan…' : 'Export Excel (13 Sheet)'}</button>
              <button onClick={() => askConfirm({ title: 'Reset data ke sampel awal?', message: 'Seluruh data akan dikembalikan ke sampel Excel.', confirmLabel: 'Ya, Reset', variant: 'danger', onConfirm: () => { s.reset(); setMobileMenuOpen(false); pushToast('Data berhasil direset', 'success') }})} className="w-full text-slate-500 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5"><RefreshCw size={13} /> Reset Data Default</button>
            </div>
          </div>
        </div>
      )}

        {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-[72px] lg:pb-0">
        {s.demoMode && <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-center text-xs font-bold text-amber-950">Data Demo. Ganti dengan data Anda atau mulai dari data kosong sebelum digunakan untuk laporan nyata.</div>}
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-4 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Open Menu"><Menu size={22} /></button>
              <div className="min-w-0">
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  <span>{currentTabMeta.group}</span>
                  <ChevronRight size={12} />
                  <span className="text-[#1E3A5F] font-bold">{currentTabMeta.label}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-extrabold text-[18px] sm:text-[20px] text-slate-900 tracking-tight leading-none truncate flex items-center gap-2">
                    <span className="hidden sm:inline-flex w-8 h-8 rounded-lg bg-[#1E3A5F] text-white items-center justify-center lg:hidden"><currentTabMeta.icon size={16} /></span>
                    {currentTabMeta.label}
                  </h1>
                  {tab==='rab' && <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200"><FileSpreadsheet size={12} /> 01 & 02 • {s.rabAnggy.length + s.rabKeluarga.length} Pos</span>}
                </div>
                <p className="hidden lg:block text-[13px] text-slate-500 font-medium leading-none mt-1.5">Kelola anggaran, mutasi kas, dan aset secara lokal • Tahun {s.year}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Global search - desktop */}
              <div className="hidden xl:flex items-center relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari transaksi… (⌘K)" onFocus={()=>setCmdOpen(true)} className="w-[200px] pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1E3A5F]/30 focus:w-[260px] transition-all" />
              </div>
              <button onClick={()=>setCmdOpen(true)} className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 shadow-xs" title="Pencarian cepat (Ctrl+K)"><Command size={14} /> ⌘K</button>
              <button onClick={()=>setDensity(density==='comfortable'?'compact':'comfortable')} className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600" title="Ubah kepadatan tabel"><SlidersHorizontal size={14} /> {density==='comfortable' ? 'Longgar' : 'Rapat'}</button>

              {/* Year Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button onClick={() => s.setYear(s.year - 1)} className="w-7 h-7 grid place-items-center rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition" aria-label="Tahun sebelumnya"><ChevronLeft size={14} /></button>
                <span className="px-3 py-1 text-xs font-extrabold text-slate-900 bg-white rounded-lg shadow-xs border border-slate-200 flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" /> {s.year}</span>
                <button onClick={() => s.setYear(s.year + 1)} className="w-7 h-7 grid place-items-center rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition" aria-label="Tahun berikutnya"><ChevronRight size={14} /></button>
              </div>

              <button onClick={() => setShowHelpModal(true)} className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold shadow-xs transition" title="Pusat Bantuan & Tanya Jawab Fitur">
                <HelpCircle size={14} className="text-amber-700" /> Panduan & FAQ
              </button>
              <button onClick={() => setShowHelpModal(true)} className="p-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl md:hidden" title="Panduan">
                <HelpCircle size={16} />
              </button>
              <button onClick={() => setShowTransferModal(true)} className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[13px] font-semibold border border-slate-200 shadow-xs transition">
                <ArrowLeftRight size={14} /> Dropping
              </button>
              <button onClick={() => { setEditingTx(null); setShowAddTxModal(true)}} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-[13px] font-bold shadow-sm transition active:scale-[0.98]">
                <Plus size={16} /> <span className="hidden sm:inline">Catat Transaksi</span><span className="sm:hidden">Catat</span>
              </button>
              <button onClick={handleExport} disabled={exporting} className="lg:hidden p-2 bg-emerald-600 text-white rounded-xl disabled:opacity-60" title="Export"><Download size={16} /></button>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] w-full mx-auto flex-1">
        {tab === 'dashboard' && (
          <div className="space-y-6 animate-in">
            <div className="grid grid-cols-12 gap-5">
              <Card className="col-span-12 lg:col-span-8 p-6 sm:p-7 bg-[#1E3A5F] text-white border-0 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a4a73] via-[#1E3A5F] to-[#0f1f38] pointer-events-none" />
                <div className="absolute -right-8 -top-8 w-56 h-56 bg-white/[0.07] rounded-full blur-2xl pointer-events-none" />
                <div className="absolute left-1/2 bottom-0 w-[80%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white bg-white/15 px-3 py-1 rounded-full border border-white/20 backdrop-blur">Total Kekayaan Bersih (Net Worth)</span>
                    <span className="text-xs text-white/80 font-semibold flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Tahun Anggaran {s.year}</span>
                  </div>
                  <div className="text-[32px] sm:text-[40px] font-extrabold mt-3 num tracking-tight leading-none text-white drop-shadow-sm">Rp {fmt.format(Math.round(totalKekayaan))}</div>
                  <div className="flex items-center gap-2 mt-2.5 text-[13px] font-semibold text-emerald-300"><span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/20 px-2.5 py-1 rounded-full"><ArrowUp size={14} className="text-emerald-300" /> Periode aktif</span><span className="text-white/60 hidden sm:inline">Kelola dengan bijak</span></div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
                    {[
                      { label:'Total Kas (3 Ledger)', val: totalKas, sub:'3 ledger' },
                      { label:'Aset Nilai Pasar', val: totalAsetPasar, sub:'pasar' },
                      { label:'Piutang Aktif', val: piutangTotal, sub:'aktif' },
                      { label:`Surplus YTD ${s.year}`, val: netSurplusYtd, sub: netSurplusYtd>=0?'+surplus':'defisit', isSurplus: true },
                    ].map(c=>(
                      <div key={c.label} className="bg-white rounded-xl p-3.5 border border-white/0 shadow-sm">
                        <div className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase leading-tight">{c.label}</div>
                        <div className={`font-extrabold text-[15px] num mt-1 tracking-tight ${'isSurplus' in c ? (netSurplusYtd>=0 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-900'}`}>{'isSurplus' in c && netSurplusYtd>=0 ? '+' : ''}Rp {fmt.format(c.val)}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">{c.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
                {[
                  { title:'MASTER (0)', sub:'Utama', val:saldoMaster, icon:PiggyBank, color:'border-l-[#1E3A5F] text-[#1E3A5F]', foot: 'Gaji & Rekening Induk', footColor:'text-emerald-700' },
                  { title:'OPS (1)', sub:'Harian', val:saldoOps, icon:Layers, color:'border-l-blue-600 text-blue-600', foot:`${s.txs.filter(t=>t.ledger==='operasional').length} transaksi`, footColor:'text-slate-500' },
                  { title:'KELUARGA (2)', sub:'Rutin', val:saldoKel, icon:DollarSign, color:'border-l-teal-600 text-teal-600', foot:'Nafkah & Rumah', footColor:'text-slate-500' },
                  { title:'PIUTANG', sub:'Aktif', val:piutangTotal, icon:HandCoins, color:'border-l-amber-500 text-amber-700', foot:`${s.piutangs.length} catatan`, footColor:'text-slate-500' },
                ].map(card=>{
                  const Icon = card.icon
                  return (
                    <Card key={card.title} className={`p-4 flex flex-col justify-between border-l-4 ${card.color} card-hover`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold tracking-wide text-slate-600 flex items-center gap-1.5"><Icon size={14} className={card.color.split(' ')[1]} /> {card.title}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold border border-slate-200">{card.sub}</span>
                        </div>
                        <div className="font-extrabold text-[16px] num text-slate-900 mt-2.5 leading-none">Rp {fmt.format(card.val)}</div>
                      </div>
                      <div className={`text-xs font-semibold flex items-center gap-1 mt-3 ${card.footColor}`}>{card.footColor.includes('emerald') && <ArrowUpRight size={14} />} {card.foot}</div>
                    </Card>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-5">
              <Card className="col-span-12 lg:col-span-7 p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div><div className="font-bold text-[15px] text-slate-900">Rencana vs Realisasi (RARI)</div><div className="text-xs text-slate-500 mt-0.5">Evaluasi penerimaan & pengeluaran {s.year}</div></div>
                  <button onClick={() => setTab('rari')} className="text-sm text-[#1E3A5F] font-bold hover:underline flex items-center gap-1">Detail <ChevronRight size={15} /></button>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Penerimaan non-transfer', ra: 0, ri: totalIncomeYtd, color: 'bg-emerald-600' },
                    { label: 'Pengeluaran operasional (RAB-01)', ra: rabMonthlyTotals(s.rabAnggy)[0], ri: ledgerExpense(activeTxs, 'operasional'), color: 'bg-[#1E3A5F]' },
                    { label: 'Pengeluaran keluarga (RAB-02)', ra: rabMonthlyTotals(s.rabKeluarga)[0], ri: ledgerExpense(activeTxs, 'keluarga'), color: 'bg-blue-600' },
                  ].map((r) => {
                    const pct = Math.round((r.ri / r.ra) * 100)
                    return (
                      <div key={r.label} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-sm font-semibold text-slate-700"><span>{r.label}</span><span className="num font-bold text-slate-900">{pct}%</span></div>
                        <div className="h-2.5 bg-slate-200 rounded-full mt-2 overflow-hidden flex"><div className={`h-full ${r.color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-medium"><span>RA: Rp {fmt.format(r.ra)}</span><span className="font-semibold text-slate-800">RI: Rp {fmt.format(r.ri)}</span></div>
                      </div>
                    )
                  })}
                </div>
              </Card>
              <div className="col-span-12 lg:col-span-5 space-y-5">
                <Card className="p-6 card-hover">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="font-bold text-[15px] text-slate-900">Penyusutan Aset</div><button onClick={() => setTab('depresiasi')} className="text-sm text-[#1E3A5F] font-bold hover:underline flex items-center gap-1">Semua <ChevronRight size={15} /></button></div>
                  <div className="mt-3 space-y-2.5">
                    {s.deps.slice(0, 3).map((d) => {
                      const depreciation = straightLineValue(d, reportDate)
                      const perBulan = d.umur > 0 ? d.nilai / d.umur : d.nilai
                      const elapsedMonths = depreciation.monthsElapsed
                      const sisaNilai = depreciation.bookValue
                      const progressPct = Math.min(100, Math.round((elapsedMonths / Math.max(1, d.umur)) * 100))
                      return (
                        <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div><div className="font-bold text-sm text-slate-900">{d.nama}</div><div className="text-xs text-slate-500 mt-0.5">Rp {fmt.format(perBulan)}/bln • Sisa: Rp {fmt.format(sisaNilai)}</div></div>
                          <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-full">{progressPct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
                <Card className="p-6 card-hover">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="font-bold text-[15px] text-slate-900 flex items-center gap-2">
                      <CalendarClock size={18} className="text-[#1E3A5F]" /> Jadwal Servis & Pajak
                    </div>
                    <button onClick={() => setTab('schedule')} className="text-sm text-[#1E3A5F] font-bold hover:underline flex items-center gap-1">
                      Kalender <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {s.scheds.slice(0, 3).map((sc) => {
                      const activeMonths = sc.months
                        .map((v, i) => (v > 0 ? monthShort[i] : null))
                        .filter(Boolean)
                      return (
                        <div key={sc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm text-slate-900">{sc.nama}</div>
                            <div className="text-xs text-slate-500 mt-0.5 capitalize">{sc.kat} • Rp {fmt.format(sc.hs)}</div>
                          </div>
                          <span className="text-xs font-bold text-[#1E3A5F] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full num">
                            {activeMonths.length > 0 ? activeMonths.join(', ') : 'Non-aktif'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
                <div><div className="font-bold text-[15px] text-slate-900 flex items-center gap-2"><Wallet size={16} className="text-[#1E3A5F]" /> Transaksi Terkini</div><div className="text-xs text-slate-500 mt-0.5">Mutasi kas seluruh ledger</div></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingTx(null); setShowAddTxModal(true)}} className="text-sm font-bold px-3.5 py-2 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl flex items-center gap-1 shadow-sm"><Plus size={15} /> Tambah</button>
                  <button onClick={() => setTab('transaksi')} className="text-sm font-semibold px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-1 border border-slate-200">Buka Buku Kas <ChevronRight size={15} /></button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900 text-white text-xs tracking-wide">
                    <tr><th className="px-4 py-3 font-semibold">Tanggal</th><th className="px-3 py-3 font-semibold">Ledger</th><th className="px-3 py-3 font-semibold">NSB</th><th className="px-3 py-3 font-semibold">POS</th><th className="px-4 py-3 font-semibold">Uraian</th><th className="px-4 py-3 text-right font-semibold">Masuk</th><th className="px-4 py-3 text-right font-semibold">Keluar</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {s.txs.slice(-7).reverse().map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 even:bg-slate-50/30 transition">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium text-[13px]">{new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="px-3 py-3"><span className={`px-2 py-1 rounded-full font-bold text-[11px] uppercase tracking-wide border ${t.ledger === 'master' ? 'bg-blue-50 text-blue-700 border-blue-200' : t.ledger === 'operasional' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>{t.ledger}</span></td>
                        <td className="px-3 py-3 text-slate-800 font-semibold text-[13px]">{t.nsb}</td>
                        <td className="px-3 py-3 text-slate-600 font-medium text-[13px]">{t.pos}</td>
                        <td className="px-4 py-3 text-slate-900 font-medium">{t.uraian}</td>
                        <td className="px-4 py-3 text-right num font-bold text-emerald-600">{t.penerimaan ? `+${fmt.format(t.penerimaan)}` : <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3 text-right num font-bold text-rose-600">{t.pengeluaran ? `-${fmt.format(t.pengeluaran)}` : <span className="text-slate-300">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'transaksi' && (
          <div className="space-y-5 animate-in">
            <Card className="p-4">
              <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                <div className="relative w-full lg:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Cari uraian, pos, nama..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition placeholder:text-slate-400" />
                </div>
                <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                  {[
                    { id: 'all', label: 'Semua Ledger' },
                    { id: 'master', label: 'MASTER (0)' },
                    { id: 'operasional', label: 'OPERASIONAL (1)' },
                    { id: 'keluarga', label: 'KELUARGA (2)' },
                  ].map((item) => (
                    <button key={item.id} onClick={() => setLedger(item.id as never)} className={`px-3.5 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition border ${ledger === item.id ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}>{item.label}</button>
                  ))}
                </div>
                <button onClick={() => { setEditingTx(null); setShowAddTxModal(true)}} className="w-full lg:w-auto px-4 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#152a45]"><Plus size={16} /> Tambah Transaksi</button>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label:'Saldo MASTER (0)', val:saldoMaster, sub:'Gaji & Kas Utama', color:'border-l-[#1E3A5F]' },
                { label:'Saldo OPERASIONAL (1)', val:saldoOps, sub:'Belanja Harian & Pulsa', color:'border-l-blue-600' },
                { label:'Saldo KELUARGA (2)', val:saldoKel, sub:'Nafkah, Rumah & Anak', color:'border-l-teal-600' },
              ].map(c=>(
                <div key={c.label} className={`p-4 rounded-2xl bg-white border border-slate-200 border-l-4 ${c.color} shadow-card`}>
                  <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{c.label}</div>
                  <div className="text-[20px] font-extrabold num text-slate-900 mt-1">Rp {fmt.format(c.val)}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.sub}</div>
                </div>
              ))}
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900 text-white text-xs">
                    <tr>
                      <th className="px-3.5 py-3 text-center w-12 font-semibold">No</th>
                      <th className="px-3.5 py-3 font-semibold">Tanggal</th>
                      <th className="px-3 py-3 font-semibold">Periode</th>
                      <th className="px-3 py-3 font-semibold">Ledger</th>
                      <th className="px-3.5 py-3 font-semibold">NSB</th>
                      <th className="px-3.5 py-3 font-semibold">POS</th>
                      <th className="px-4 py-3 font-semibold">Uraian</th>
                      <th className="px-3.5 py-3 text-right font-semibold">Penerimaan</th>
                      <th className="px-3.5 py-3 text-right font-semibold">Pengeluaran</th>
                      <th className="px-3.5 py-3 text-right font-semibold bg-slate-800">Saldo</th>
                      <th className="px-3 py-3 text-center w-24 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTxs.length === 0 ? (
                      <tr><td colSpan={11} className="text-center py-12 text-slate-400"><div className="flex flex-col items-center gap-2"><Filter size={24} className="text-slate-300" /> Tidak ada transaksi yang cocok</div></td></tr>
                    ) : (
                      filteredTxs.map((t, i) => {
                        const runningBal = balancesById.get(t.id) ?? 0
                        return (
                          <tr key={t.id} className="hover:bg-slate-50 even:bg-slate-50/40 transition group">
                            <td className="px-3.5 py-3 text-center text-slate-400 font-mono text-xs">{i + 1}</td>
                            <td className="px-3.5 py-3 whitespace-nowrap text-slate-700 font-medium text-[13px]">{new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td className="px-3 py-3 text-slate-500 font-mono text-xs">{new Date(t.tanggal).getMonth() + 1}-{new Date(t.tanggal).getFullYear()}</td>
                            <td className="px-3 py-3"><span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase border ${t.ledger === 'master' ? 'bg-blue-50 text-blue-700 border-blue-200' : t.ledger === 'operasional' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>{t.ledger}</span></td>
                            <td className="px-3.5 py-3 text-slate-800 font-semibold text-[13px]">{t.nsb}</td>
                            <td className="px-3.5 py-3 text-slate-600 font-medium text-[13px]">{t.pos}</td>
                            <td className="px-4 py-3 text-slate-900 font-medium">{t.uraian}</td>
                            <td className="px-3.5 py-3 text-right num font-bold text-emerald-600 text-[13px]">{t.penerimaan ? fmt.format(t.penerimaan) : <span className="text-slate-300">—</span>}</td>
                            <td className="px-3.5 py-3 text-right num font-bold text-rose-600 text-[13px]">{t.pengeluaran ? fmt.format(t.pengeluaran) : <span className="text-slate-300">—</span>}</td>
                            <td className="px-3.5 py-3 text-right num font-extrabold text-[#1E3A5F] bg-slate-50/80 text-[13px]">{fmt.format(runningBal)}</td>
                            <td className="px-3 py-3 text-center">
                              <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition">
                                <button onClick={() => { setEditingTx(t); setTxForm({ tanggal: t.tanggal, nsb: t.nsb, pos: t.pos, uraian: t.uraian, penerimaan: t.penerimaan ? String(t.penerimaan) : '', pengeluaran: t.pengeluaran ? String(t.pengeluaran) : '', ledger: t.ledger }); setShowAddTxModal(true)}} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500" title="Edit transaksi" aria-label={`Edit ${t.uraian}`}><Edit2 size={15} /></button>
                                <button onClick={() => askConfirm({ title: 'Hapus transaksi?', message: `Transaksi "${t.uraian}" pada ${t.tanggal} akan dihapus permanen.`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delTx(t.id); pushToast('Transaksi dihapus', 'success') }})} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500" title="Hapus transaksi" aria-label={`Hapus ${t.uraian}`}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'rab' && (
          <div className="space-y-5 animate-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Rencana Anggaran Belanja (RAB) — {s.year}</h2>
                <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Rekapitulasi anggaran mingguan W-1…W-4 dan proyeksi 12 bulan</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200"><Eye size={12} /> Mode baca optimal</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">Kepadatan: <button onClick={()=>setDensity(density==='comfortable'?'compact':'comfortable')} className="font-bold text-[#1E3A5F] underline">{density==='comfortable'?'Longgar':'Rapat'}</button></span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 text-xs">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full font-semibold text-slate-600"><span className="w-2 h-2 bg-blue-500 rounded-full" /> RAB-01 • Rp {fmt.format(rabAnggyTotal)}/bln</span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full font-semibold text-slate-600"><span className="w-2 h-2 bg-teal-500 rounded-full" /> RAB-02 • Rp {fmt.format(rabKelTotal)}/bln</span>
                </div>
                <button onClick={() => setShowAddRabModal(true)} className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition active:scale-[0.98]">
                  <Plus size={16} /> Tambah Item RAB
                </button>
              </div>
            </div>

            {/* Toolbar: Search + View Toggle */}
            <Card className="p-3 flex flex-col lg:flex-row gap-3 items-center justify-between">
              <div className="relative w-full lg:w-[360px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={rabQ} onChange={e=>setRabQ(e.target.value)} placeholder="Cari uraian atau kategori (mis. NAFKAH, BELANJA)…" className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1E3A5F]/30 focus:ring-2 focus:ring-[#1E3A5F]/10 transition" />
                {rabQ && <button onClick={()=>setRabQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={14} /></button>}
              </div>
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button onClick={()=>setRabView('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${rabView==='grid' ? 'bg-white shadow-sm text-[#1E3A5F] border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}><LayoutGrid size={14} /> Grid 2 Kolom</button>
                  <button onClick={()=>setRabView('single')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${rabView==='single' ? 'bg-white shadow-sm text-[#1E3A5F] border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}><List size={14} /> Fokus 1 Tabel</button>
                </div>
                {rabQ && <span className="text-xs font-semibold text-slate-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full">Hasil: {filteredRabAnggy.length + filteredRabKeluarga.length} pos</span>}
              </div>
            </Card>

            {rabView === 'single' && (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-xs">
                <button onClick={()=>setRabSingleTab('anggy')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${rabSingleTab==='anggy' ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>RAB-01 • Anggy ({filteredRabAnggy.length})</button>
                <button onClick={()=>setRabSingleTab('keluarga')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${rabSingleTab==='keluarga' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>RAB-02 • Keluarga ({filteredRabKeluarga.length})</button>
                <button onClick={()=>setRabSingleTab('resume')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${rabSingleTab==='resume' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Resume 12 Bln</button>
              </div>
            )}

            {/* RAB Cards */}
            <div className={`grid gap-6 items-stretch ${rabView==='grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
              {/* RAB-01 */}
              {(rabView==='grid' || rabSingleTab==='anggy') && (
              <Card className="overflow-hidden flex flex-col h-full justify-between">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] text-white grid place-items-center font-bold text-xs">01</div>
                    <div>
                      <div className="font-extrabold text-[14px] text-slate-900 leading-none">RAB-01 • ANGGY OPERASIONAL</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Anggaran rutin mingguan & bulanan • {filteredRabAnggy.length} pos</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Total / Bulan</div>
                    <div className="text-[15px] font-extrabold num text-[#1E3A5F]">Rp {fmt.format(rabFilteredAnggyTotal)}</div>
                    {rabQ && rabFilteredAnggyTotal !== rabAnggyTotal && <div className="text-[11px] font-semibold text-amber-700">Filter: dari Rp {fmt.format(rabAnggyTotal)}</div>}
                  </div>
                </div>
                {/* Desktop table */}
                <div className="hidden md:flex flex-col flex-1 overflow-x-auto justify-between">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#1E3A5F] text-white text-[11px] tracking-wide">
                      <tr>
                        <th className="px-4 py-3 font-bold min-w-[170px] w-[32%]">Kategori / Uraian</th>
                        <th className="px-2 py-3 text-center font-bold w-[52px]">Vol</th>
                        <th className="px-2 py-3 text-right font-bold w-[90px]">HS</th>
                        <th className="px-1.5 py-3 text-center font-bold w-[68px] bg-[#243a5e]">W-1</th>
                        <th className="px-1.5 py-3 text-center font-bold w-[68px] bg-[#243a5e]">W-2</th>
                        <th className="px-1.5 py-3 text-center font-bold w-[68px] bg-[#243a5e]">W-3</th>
                        <th className="px-1.5 py-3 text-center font-bold w-[68px] bg-[#243a5e]">W-4</th>
                        <th className="px-3 py-3 text-right font-bold w-[112px] bg-[#152a45]">Total / Bln</th>
                        <th className="px-2 py-3 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRabAnggy.length===0 ? (
                        <tr><td colSpan={9} className="text-center py-10 text-slate-400 text-sm"><Filter size={18} className="mx-auto mb-2 text-slate-300" />Tidak ada pos yang cocok dengan “{rabQ}”</td></tr>
                      ) : filteredRabAnggy.map((r) => {
                        const totalBulan = r.w.reduce((a,b)=>a+b,0)
                        return (
                          <tr key={r.id} className="hover:bg-slate-50 transition even:bg-slate-50/40 group">
                            <td className={`px-4 ${rowPad}`}>
                              <div className="font-bold text-[13.5px] text-slate-900 leading-tight">{r.uraian}</div>
                              <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mt-0.5 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">{r.group}</span> Sat: {r.sat}
                              </div>
                            </td>
                            <td className={`px-2 ${rowPad} text-center num font-bold text-slate-700 text-[13px]`}>{r.vol}</td>
                            <td className={`px-2 ${rowPad} text-right num font-semibold text-slate-700 text-[13px]`}>{r.hs ? fmt.format(r.hs) : <span className="text-slate-300">0</span>}</td>
                            {r.w.map((wVal, idx)=>(
                              <td key={idx} className={`px-1.5 ${rowPad} text-center`}>
                                {wVal>0 ? <span className="inline-flex min-w-[60px] justify-center px-2 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 num font-bold text-[12px]">{fmt.format(wVal)}</span> : <span className="text-slate-300 font-medium text-xs">—</span>}
                              </td>
                            ))}
                            <td className={`px-3 ${rowPad} text-right num font-extrabold text-[#1E3A5F] bg-slate-50/70 border-l border-slate-100 text-[13px]`}>Rp {fmt.format(totalBulan)}</td>
                            <td className={`px-2 ${rowPad} text-center`}><button onClick={() => askConfirm({ title: 'Hapus item RAB?', message: `Item "${r.uraian}" dari RAB-01 akan dihapus.`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delRab('anggy', r.id); pushToast('Item RAB dihapus', 'success') }})} className="opacity-40 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition" title="Hapus" aria-label={`Hapus ${r.uraian}`}><Trash2 size={14} /></button></td>
                          </tr>
                        )
                      })}
                      {/* Empty padding rows to make table height match exactly */}
                      {rabView === 'grid' && filteredRabAnggy.length > 0 && Array.from({ length: Math.max(0, Math.max(filteredRabAnggy.length, filteredRabKeluarga.length) - filteredRabAnggy.length) }).map((_, idx) => (
                        <tr key={`pad-anggy-${idx}`} className="even:bg-slate-50/30">
                          <td className={`px-4 ${rowPad} text-transparent select-none`}>&nbsp;</td>
                          <td className={`px-2 ${rowPad}`}></td>
                          <td className={`px-2 ${rowPad}`}></td>
                          <td className={`px-1.5 ${rowPad}`}></td>
                          <td className={`px-1.5 ${rowPad}`}></td>
                          <td className={`px-1.5 ${rowPad}`}></td>
                          <td className={`px-1.5 ${rowPad}`}></td>
                          <td className={`px-3 ${rowPad} border-l border-slate-100`}></td>
                          <td className={`px-2 ${rowPad}`}></td>
                        </tr>
                      ))}
                    </tbody>
                    {filteredRabAnggy.length>0 && (
                      <tfoot className="bg-slate-900 text-white text-xs font-bold mt-auto">
                        <tr>
                          <td colSpan={7} className="px-4 py-3.5 text-right tracking-wide">TOTAL RAB-01 / BULAN</td>
                          <td className="px-3 py-3.5 text-right num bg-[#1E3A5F] text-[13px]">Rp {fmt.format(rabFilteredAnggyTotal)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredRabAnggy.map(r=>{
                    const totalBulan = r.w.reduce((a,b)=>a+b,0)
                    return (
                      <div key={r.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-sm text-slate-900">{r.uraian}</div>
                            <div className="text-[11px] font-semibold text-slate-500 uppercase mt-1 flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px]">{r.group}</span> Sat: {r.sat} • Vol {r.vol} • HS Rp {fmt.format(r.hs)}</div>
                          </div>
                          <button onClick={()=> askConfirm({ title: 'Hapus item RAB?', message: `Hapus "${r.uraian}"?`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delRab('anggy', r.id); pushToast('Item dihapus', 'success') }})} className="p-1.5 text-slate-400 hover:text-rose-600" aria-label={`Hapus ${r.uraian}`}><Trash2 size={14} /></button>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 mt-3">
                          {r.w.map((wVal,i)=>(<div key={i} className={`rounded-lg border px-2 py-2 text-center ${wVal>0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}><div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">W-{i+1}</div><div className={`text-xs num font-bold ${wVal>0 ? 'text-blue-900' : 'text-slate-400'}`}>{wVal>0 ? fmt.format(wVal) : '—'}</div></div>))}
                        </div>
                        <div className="mt-3 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Total / Bulan</span><span className="text-sm font-extrabold num text-[#1E3A5F]">Rp {fmt.format(totalBulan)}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-sm font-bold"><span>Total RAB-01</span><span className="num">Rp {fmt.format(rabFilteredAnggyTotal)}</span></div>
                </div>
              </Card>
              )}

              {/* RAB-02 */}
              {(rabView==='grid' || rabSingleTab==='keluarga') && (
              <Card className="overflow-hidden flex flex-col h-full justify-between">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/70 to-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white grid place-items-center font-bold text-xs">02</div>
                    <div>
                      <div className="font-extrabold text-[14px] text-slate-900 leading-none">RAB-02 • KELUARGA & RUMAH</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Nafkah, anak & operasional rumah • {filteredRabKeluarga.length} pos</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Total / Bulan</div>
                    <div className="text-[15px] font-extrabold num text-teal-700">Rp {fmt.format(rabFilteredKelTotal)}</div>
                    {rabQ && rabFilteredKelTotal !== rabKelTotal && <div className="text-[11px] font-semibold text-amber-700">Filter: dari Rp {fmt.format(rabKelTotal)}</div>}
                  </div>
                </div>
                <div className="hidden md:flex flex-col flex-1 overflow-x-auto justify-between">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#1E3A5F] text-white text-[11px] tracking-wide">
                      <tr>
                        <th className="px-4 py-3 font-bold min-w-[170px] w-[32%]">Kategori / Uraian</th>
                        <th className="px-2 py-3 text-center font-bold w-[52px]">Vol</th>
                        <th className="px-2 py-3 text-right font-bold w-[90px]">HS</th>
                        <th className="px-1.5 py-3 text-center font-bold w-[68px] bg-[#243a5e]">W-1</th>
                        <th className="px-1.5 py-3 text-center font-bold w-[68px] bg-[#243a5e]">W-2</th>
                        <th className="px-1.5 py-3 text-center font-bold w-[68px] bg-[#243a5e]">W-3</th>
                        <th className="px-1.5 py-3 text-center font-bold w-[68px] bg-[#243a5e]">W-4</th>
                        <th className="px-3 py-3 text-right font-bold w-[112px] bg-[#152a45]">Total / Bln</th>
                        <th className="px-2 py-3 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRabKeluarga.length===0 ? (
                        <tr><td colSpan={9} className="text-center py-10 text-slate-400 text-sm"><Filter size={18} className="mx-auto mb-2 text-slate-300" />Tidak ada pos yang cocok</td></tr>
                      ) : filteredRabKeluarga.map((r) => {
                        const totalBulan = r.w.reduce((a,b)=>a+b,0)
                        return (
                          <tr key={r.id} className="hover:bg-slate-50 transition even:bg-slate-50/40 group">
                            <td className={`px-4 ${rowPad}`}>
                              <div className="font-bold text-[13.5px] text-slate-900 leading-tight">{r.uraian}</div>
                              <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mt-0.5 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">{r.group}</span> Sat: {r.sat}
                              </div>
                            </td>
                            <td className={`px-2 ${rowPad} text-center num font-bold text-slate-700 text-[13px]`}>{r.vol}</td>
                            <td className={`px-2 ${rowPad} text-right num font-semibold text-slate-700 text-[13px]`}>{r.hs ? fmt.format(r.hs) : <span className="text-slate-300">0</span>}</td>
                            {r.w.map((wVal, idx)=>(
                              <td key={idx} className={`px-1.5 ${rowPad} text-center`}>
                                {wVal>0 ? <span className="inline-flex min-w-[60px] justify-center px-2 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 num font-bold text-[12px]">{fmt.format(wVal)}</span> : <span className="text-slate-300 font-medium text-xs">—</span>}
                              </td>
                            ))}
                            <td className={`px-3 ${rowPad} text-right num font-extrabold text-[#1E3A5F] bg-slate-50/70 border-l border-slate-100 text-[13px]`}>Rp {fmt.format(totalBulan)}</td>
                            <td className={`px-2 ${rowPad} text-center`}><button onClick={() => askConfirm({ title: 'Hapus item RAB?', message: `Item "${r.uraian}" dari RAB-02 akan dihapus.`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delRab('keluarga', r.id); pushToast('Item RAB dihapus', 'success') }})} className="opacity-40 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition" title="Hapus" aria-label={`Hapus ${r.uraian}`}><Trash2 size={14} /></button></td>
                          </tr>
                        )
                      })}
                      {/* Empty padding rows to make table height match exactly */}
                      {rabView === 'grid' && filteredRabKeluarga.length > 0 && Array.from({ length: Math.max(0, Math.max(filteredRabAnggy.length, filteredRabKeluarga.length) - filteredRabKeluarga.length) }).map((_, idx) => (
                        <tr key={`pad-kel-${idx}`} className="even:bg-slate-50/30">
                          <td className={`px-4 ${rowPad} text-transparent select-none`}>&nbsp;</td>
                          <td className={`px-2 ${rowPad}`}></td>
                          <td className={`px-2 ${rowPad}`}></td>
                          <td className={`px-1.5 ${rowPad}`}></td>
                          <td className={`px-1.5 ${rowPad}`}></td>
                          <td className={`px-1.5 ${rowPad}`}></td>
                          <td className={`px-1.5 ${rowPad}`}></td>
                          <td className={`px-3 ${rowPad} border-l border-slate-100`}></td>
                          <td className={`px-2 ${rowPad}`}></td>
                        </tr>
                      ))}
                    </tbody>
                    {filteredRabKeluarga.length>0 && (
                      <tfoot className="bg-slate-900 text-white text-xs font-bold mt-auto">
                        <tr>
                          <td colSpan={7} className="px-4 py-3.5 text-right tracking-wide">TOTAL RAB-02 / BULAN</td>
                          <td className="px-3 py-3.5 text-right num bg-teal-700 text-[13px]">Rp {fmt.format(rabFilteredKelTotal)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredRabKeluarga.map(r=>{
                    const totalBulan = r.w.reduce((a,b)=>a+b,0)
                    return (
                      <div key={r.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-sm text-slate-900">{r.uraian}</div>
                            <div className="text-[11px] font-semibold text-slate-500 uppercase mt-1 flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px]">{r.group}</span> Sat: {r.sat} • Vol {r.vol} • HS Rp {fmt.format(r.hs)}</div>
                          </div>
                          <button onClick={()=> askConfirm({ title: 'Hapus item RAB?', message: `Hapus "${r.uraian}"?`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delRab('keluarga', r.id); pushToast('Item dihapus', 'success') }})} className="p-1.5 text-slate-400 hover:text-rose-600" aria-label={`Hapus ${r.uraian}`}><Trash2 size={14} /></button>
                          {r.w.map((wVal,i)=>(<div key={i} className={`rounded-lg border px-2 py-2 text-center ${wVal>0 ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}><div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">W-{i+1}</div><div className={`text-xs num font-bold ${wVal>0 ? 'text-teal-900' : 'text-slate-400'}`}>{wVal>0 ? fmt.format(wVal) : '—'}</div></div>))}
                        </div>
                        <div className="mt-3 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Total / Bulan</span><span className="text-sm font-extrabold num text-teal-700">Rp {fmt.format(totalBulan)}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="p-3 bg-teal-700 text-white flex items-center justify-between text-sm font-bold"><span>Total RAB-02</span><span className="num">Rp {fmt.format(rabFilteredKelTotal)}</span></div>
                </div>
              </Card>
              )}
            </div>

            {/* RESUME */}
            {(rabView==='grid' || rabSingleTab==='resume') && (
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-[15px] text-slate-900 flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-slate-900 text-white grid place-items-center"><Layers size={14} /></span> RESUME - RAB (Matriks 12 Bulan)</div>
                  <div className="text-xs text-slate-500 mt-1">Distribusi mingguan W-1…W-4 otomatis ke Jan–Des • <span className="font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded">JUMLAH=SUM(W1:W4) • TOTAL=SUM(JAN:DES)</span> • {filteredRabAnggy.length + filteredRabKeluarga.length} baris</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-full">Total Tahun: Rp {fmt.format([...filteredRabAnggy, ...filteredRabKeluarga].reduce((a,r)=>a+r.total,0))}</span>
                  {rabQ && <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full">Filter aktif</span>}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900 text-white text-xs">
                    <tr>
                      <th className="px-4 py-3 font-semibold min-w-[190px] sticky left-0 bg-slate-900 z-10">Kategori & Uraian</th>
                      <th className="px-2.5 py-3 text-right font-semibold min-w-[72px]">W-1</th>
                      <th className="px-2.5 py-3 text-right font-semibold min-w-[72px]">W-2</th>
                      <th className="px-2.5 py-3 text-right font-semibold min-w-[72px]">W-3</th>
                      <th className="px-2.5 py-3 text-right font-semibold min-w-[72px]">W-4</th>
                      <th className="px-3 py-3 text-right font-bold bg-slate-800 min-w-[100px]">JUMLAH</th>
                      {monthShort.map((m) => (<th key={m} className="px-2.5 py-3 text-right font-semibold min-w-[84px]">{m}</th>))}
                      <th className="px-3 py-3 text-right font-bold bg-[#1E3A5F] min-w-[112px]">TOTAL TAHUN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...filteredRabAnggy, ...filteredRabKeluarga].length===0 ? (
                      <tr><td colSpan={18} className="text-center py-12 text-slate-400"><Filter size={20} className="mx-auto mb-2 text-slate-300" />Tidak ada data untuk filter “{rabQ}”</td></tr>
                    ) : [...filteredRabAnggy, ...filteredRabKeluarga].map((r) => {
                      const jumlahBulan = r.w.reduce((a, b) => a + b, 0)
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 even:bg-slate-50/40 transition">
                          <td className={`px-4 ${rowPad} font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100`}>
                            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block">{r.group}</span>
                            <span className="font-bold text-[13px]">{r.uraian}</span>
                          </td>
                          <td className="px-2.5 py-3 text-right num text-slate-700 text-[13px]">{r.w[0] ? fmt.format(r.w[0]) : <span className="text-slate-300">—</span>}</td>
                          <td className="px-2.5 py-3 text-right num text-slate-700 text-[13px]">{r.w[1] ? fmt.format(r.w[1]) : <span className="text-slate-300">—</span>}</td>
                          <td className="px-2.5 py-3 text-right num text-slate-700 text-[13px]">{r.w[2] ? fmt.format(r.w[2]) : <span className="text-slate-300">—</span>}</td>
                          <td className="px-2.5 py-3 text-right num text-slate-700 text-[13px]">{r.w[3] ? fmt.format(r.w[3]) : <span className="text-slate-300">—</span>}</td>
                          <td className="px-3 py-3 text-right num font-bold text-[#1E3A5F] bg-slate-50 border-x border-slate-100 text-[13px]">{fmt.format(jumlahBulan)}</td>
                          {r.months.map((v, idx) => (<td key={idx} className="px-2.5 py-3 text-right num text-slate-600 text-[13px]">{v ? fmt.format(v) : <span className="text-slate-300">—</span>}</td>))}
                          <td className="px-3 py-3 text-right num font-extrabold text-[#1E3A5F] bg-blue-50/60 border-l border-blue-100 text-[13px]">{fmt.format(r.total)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  {[...filteredRabAnggy, ...filteredRabKeluarga].length>0 && (
                    <tfoot className="bg-slate-900 text-white font-bold text-xs">
                      <tr>
                        <td className="px-4 py-3 sticky left-0 bg-slate-900">TOTAL SEMUA</td>
                        <td className="px-2.5 py-3 text-right num">{fmt.format([...filteredRabAnggy,...filteredRabKeluarga].reduce((a,r)=>a+r.w[0],0))}</td>
                        <td className="px-2.5 py-3 text-right num">{fmt.format([...filteredRabAnggy,...filteredRabKeluarga].reduce((a,r)=>a+r.w[1],0))}</td>
                        <td className="px-2.5 py-3 text-right num">{fmt.format([...filteredRabAnggy,...filteredRabKeluarga].reduce((a,r)=>a+r.w[2],0))}</td>
                        <td className="px-2.5 py-3 text-right num">{fmt.format([...filteredRabAnggy,...filteredRabKeluarga].reduce((a,r)=>a+r.w[3],0))}</td>
                        <td className="px-3 py-3 text-right num bg-slate-800">{fmt.format([...filteredRabAnggy,...filteredRabKeluarga].reduce((a,r)=>a+r.w.reduce((x,y)=>x+y,0),0))}</td>
                        {Array(12).fill(null).map((_,i)=>(<td key={i} className="px-2.5 py-3 text-right num">{fmt.format([...filteredRabAnggy,...filteredRabKeluarga].reduce((a,r)=>a+(r.months[i]||0),0))}</td>))}
                        <td className="px-3 py-3 text-right num bg-[#1E3A5F]">{fmt.format([...filteredRabAnggy,...filteredRabKeluarga].reduce((a,r)=>a+r.total,0))}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><ArrowUp size={12} className="text-slate-400" /> Geser horizontal untuk melihat 12 bulan • Tekan <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">Shift</kbd> + scroll lebih cepat</span>
                <span className="font-mono font-semibold">{filteredRabAnggy.length + filteredRabKeluarga.length} baris • dihitung dari data aktif</span>
              </div>
            </Card>
            )}
          </div>
        )}

        {tab === 'cashflow' && (
          <div className="space-y-6 animate-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Monitoring Arus Kas (Cash Flow) — Tahun {s.year}</h2><p className="text-sm text-slate-500 mt-1">Proyeksi penerimaan, alokasi pengeluaran, dan akumulasi saldo kas 12 bulan</p></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label:`SALDO AWAL TAHUN ${s.year}`, val:s.saldoAwal, sub:'Bank Mandiri & Kas Induk', color:'border-l-[#1E3A5F]', text:'text-[#1E3A5F]' },
                { label:'TOTAL PENERIMAAN YTD', val:totalIncomeYtd, sub:'Gaji & Pendapatan Usaha', color:'border-l-emerald-600', text:'text-emerald-700' },
                { label:'TOTAL PENGELUARAN YTD', val:totalExpenseYtd, sub:'Operasional & Rumah Tangga', color:'border-l-rose-600', text:'text-rose-700' },
                { label:'SURPLUS / (DEFISIT) BERJALAN', val:netSurplusYtd, sub:`Akumulasi Tahun ${s.year}`, color:'border-l-blue-600', text: netSurplusYtd>=0?'text-emerald-700':'text-rose-700' },
              ].map(c=>(
                <div key={c.label} className={`p-4 rounded-2xl bg-white border border-slate-200 border-l-4 ${c.color} shadow-card`}>
                  <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{c.label}</div>
                  <div className={`text-[19px] font-extrabold num mt-1 ${c.text}`}>Rp {fmt.format(c.val)}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.sub}</div>
                </div>
              ))}
            </div>
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3"><div><div className="font-bold text-[15px] text-slate-900">Tabel Arus Kas Bulanan (CF-{s.year})</div><div className="text-xs text-slate-500 mt-0.5">Perbandingan rencana anggaran dan realisasi kas tiap bulan</div></div></div>
              <div className="mt-4 overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#1E3A5F] text-white font-semibold text-xs">
                    <tr>
                      <th className="px-3.5 py-3 min-w-[220px]">POS & URAIAN</th>
                      <th className="px-3 py-3 text-right min-w-[120px]">RENCANA (RA)</th>
                      {monthShort.map((m) => (<th key={m} className="px-2.5 py-3 text-right min-w-[90px]">{m}</th>))}
                      <th className="px-3 py-3 text-right bg-[#152a45] min-w-[120px]">TOTAL TAHUNAN</th>
                      <th className="px-3 py-3 text-right min-w-[90px]">SELISIH</th>
                      <th className="px-2.5 py-3 text-center min-w-[70px]">RASIO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px]">
                    <tr className="bg-slate-100 font-bold text-slate-900"><td colSpan={16} className="px-3.5 py-2.5 text-[#1E3A5F]">I. PENERIMAAN</td></tr>
                    <tr className="hover:bg-slate-50"><td className="px-3.5 py-2.5 font-medium text-slate-800">Penerimaan non-transfer</td><td className="px-3 py-2.5 text-right num font-semibold">{fmt.format(monthlyActual.income.reduce((a,b)=>a+b,0))}</td>{monthlyActual.income.map((v, i) => (<td key={i} className="px-2.5 py-2.5 text-right num text-slate-700">{v ? fmt.format(v) : '—'}</td>))}<td className="px-3 py-2.5 text-right num font-bold text-[#1E3A5F] bg-blue-50/50">{fmt.format(totalIncomeYtd)}</td><td className="px-3 py-2.5 text-right num text-slate-600">-</td><td className="px-2.5 py-2.5 text-center num font-medium">-</td></tr>
                    <tr className="bg-emerald-50/80 font-extrabold text-emerald-950"><td className="px-3.5 py-2.5">SUBTOTAL - PENERIMAAN</td><td className="px-3 py-2.5 text-right num">{fmt.format(totalIncomeYtd)}</td>{monthlyActual.income.map((v, i) => (<td key={i} className="px-2.5 py-2.5 text-right num">{fmt.format(v)}</td>))}<td className="px-3 py-2.5 text-right num bg-emerald-100">{fmt.format(totalIncomeYtd)}</td><td className="px-3 py-2.5 text-right num">-</td><td className="px-2.5 py-2.5 text-center num">-</td></tr>
                    <tr className="bg-slate-100 font-bold text-slate-900"><td colSpan={16} className="px-3.5 py-2.5 text-rose-900">II. PENGELUARAN</td></tr>
                    <tr className="hover:bg-slate-50"><td className="px-3.5 py-2.5 font-medium text-slate-800">Pengeluaran non-transfer</td><td className="px-3 py-2.5 text-right num font-semibold">{fmt.format(monthlyActual.expense.reduce((a,b)=>a+b,0))}</td>{monthlyActual.expense.map((v, i) => (<td key={i} className="px-2.5 py-2.5 text-right num text-slate-700">{v ? fmt.format(v) : '—'}</td>))}<td className="px-3 py-2.5 text-right num font-bold text-rose-900 bg-rose-50">{fmt.format(totalExpenseYtd)}</td><td className="px-3 py-2.5 text-right num text-slate-600">-</td><td className="px-2.5 py-2.5 text-center num font-medium">-</td></tr>
                    <tr className="bg-rose-50/80 font-extrabold text-rose-950"><td className="px-3.5 py-2.5">SUBTOTAL - PENGELUARAN</td><td className="px-3 py-2.5 text-right num">{fmt.format(totalExpenseYtd)}</td>{monthlyActual.expense.map((v, i) => (<td key={i} className="px-2.5 py-2.5 text-right num">{fmt.format(v)}</td>))}<td className="px-3 py-2.5 text-right num bg-rose-100">{fmt.format(totalExpenseYtd)}</td><td className="px-3 py-2.5 text-right num">-</td><td className="px-2.5 py-2.5 text-center num">-</td></tr>
                    <tr className="bg-blue-50/80 font-extrabold text-blue-950"><td className="px-3.5 py-2.5">III. SURPLUS / (DEFISIT) BULANAN</td><td className="px-3 py-2.5 text-right num">{fmt.format(netSurplusYtd)}</td>{monthlyActual.net.map((v, i) => (<td key={i} className="px-2.5 py-2.5 text-right num text-blue-900 font-bold">{fmt.format(v)}</td>))}<td className="px-3 py-2.5 text-right num bg-blue-100">{fmt.format(netSurplusYtd)}</td><td className="px-3 py-2.5 text-right num">-</td><td className="px-2.5 py-2.5 text-center num">-</td></tr>
                    <tr className="bg-[#1E3A5F] font-extrabold text-white"><td className="px-3.5 py-2.5">SALDO KAS BERJALAN</td><td className="px-3 py-2.5 text-right num text-slate-200">Rp {fmt.format(s.saldoAwal)}</td>{(() => { let cur = s.saldoAwal; return monthlyActual.net.map((surplus, i) => { cur += surplus; return (<td key={i} className="px-2.5 py-2.5 text-right num text-emerald-300">{fmt.format(cur)}</td>)})})()}<td className="px-3 py-2.5 text-right num text-emerald-300 bg-[#152a45]">{fmt.format(s.saldoAwal + netSurplusYtd)}</td><td className="px-3 py-2.5 text-right num">-</td><td className="px-2.5 py-2.5 text-center num">-</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'rari' && (
          <div className="space-y-6 animate-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Evaluasi Rencana vs Realisasi (RARI)</h2><p className="text-sm text-slate-500 mt-1">Evaluasi pencapaian bulanan, deviasi persentase, dan proyeksi sisa anggaran</p></div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs overflow-x-auto max-w-full">
                {monthShort.map((m, idx) => (<button key={m} onClick={() => setSelectedMonth(idx)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${selectedMonth === idx ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{m}</button>))}
              </div>
            </div>
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3"><div className="font-bold text-[15px] text-slate-900">RARI — {monthNames[selectedMonth]} {s.year}</div><span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">Surplus (Sesuai Rencana)</span></div>
              <div className="mt-4 overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#1E3A5F] text-white text-xs">
                    <tr>
                      <th className="px-3.5 py-3 min-w-[200px]">POS & URAIAN</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">RENCANA (RA)</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">REALISASI (RI)</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">DEVIASI</th>
                      <th className="px-2.5 py-3 text-center min-w-[80px]">% DEVIASI</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">SISA ANGGARAN</th>
                      <th className="px-3 py-3 text-right min-w-[100px]">SELISIH AKHIR</th>
                      <th className="px-3 py-3 text-right min-w-[120px]">TOTAL PROYEKSI</th>
                      <th className="px-2.5 py-3 text-center min-w-[80px]">RASIO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px]">
                    <tr className="bg-emerald-50 font-bold text-emerald-950"><td colSpan={9} className="px-3.5 py-2.5">I. PENERIMAAN</td></tr>
                    {[{ name: 'Penerimaan non-transfer', ra: 0, ri: monthlyActual.income[selectedMonth], sisa: 0 }].map((item) => {
                      const dev = item.ri - item.ra
                      const pctDev = item.ra ? (dev / item.ra) * 100 : 0
                      const riVsRa = item.sisa + item.ri - item.ra
                      const totalProyeksi = item.ri + item.sisa
                      const koef = item.ra ? (totalProyeksi / item.ra) * 100 : 0
                      return (
                        <tr key={item.name} className="hover:bg-slate-50 even:bg-slate-50/40">
                          <td className="px-3.5 py-2.5 font-medium text-slate-800">{item.name}</td>
                          <td className="px-3 py-2.5 text-right num text-slate-700">{fmt.format(item.ra)}</td>
                          <td className="px-3 py-2.5 text-right num font-bold text-slate-900">{fmt.format(item.ri)}</td>
                          <td className={`px-3 py-2.5 text-right num font-bold ${dev >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt.format(dev)}</td>
                          <td className="px-2.5 py-2.5 text-center num text-xs font-semibold">{pctDev.toFixed(1)}%</td>
                          <td className="px-3 py-2.5 text-right num text-slate-600">{item.sisa ? fmt.format(item.sisa) : '—'}</td>
                          <td className="px-3 py-2.5 text-right num text-slate-700">{fmt.format(riVsRa)}</td>
                          <td className="px-3 py-2.5 text-right num font-bold text-slate-900">{fmt.format(totalProyeksi)}</td>
                          <td className="px-2.5 py-2.5 text-center num font-bold">{koef.toFixed(0)}%</td>
                        </tr>
                      )
                    })}
                    <tr className="bg-rose-50 font-bold text-rose-950"><td colSpan={9} className="px-3.5 py-2.5">II. PENGELUARAN</td></tr>
                    {[ 
                      { name: 'Pengeluaran operasional', ra: rabMonthlyTotals(s.rabAnggy)[selectedMonth], ri: activeTxs.filter((tx) => tx.ledger === 'operasional' && !tx.pos.toUpperCase().includes('DROPPING') && Number(tx.tanggal.slice(5, 7)) - 1 === selectedMonth).reduce((sum, tx) => sum + tx.pengeluaran, 0), sisa: 0 },
                      { name: 'Pengeluaran keluarga', ra: rabMonthlyTotals(s.rabKeluarga)[selectedMonth], ri: activeTxs.filter((tx) => tx.ledger === 'keluarga' && !tx.pos.toUpperCase().includes('DROPPING') && Number(tx.tanggal.slice(5, 7)) - 1 === selectedMonth).reduce((sum, tx) => sum + tx.pengeluaran, 0), sisa: 0 },
                    ].map((item) => {
                      const dev = item.ra - item.ri
                      const pctDev = item.ra ? (dev / item.ra) * 100 : 0
                      const riVsRa = dev - item.sisa
                      const totalProyeksi = item.ri + item.sisa
                      const koef = item.ra ? (totalProyeksi / item.ra) * 100 : 0
                      return (
                        <tr key={item.name} className="hover:bg-slate-50 even:bg-slate-50/40">
                          <td className="px-3.5 py-2.5 font-medium text-slate-800">{item.name}</td>
                          <td className="px-3 py-2.5 text-right num text-slate-700">{fmt.format(item.ra)}</td>
                          <td className="px-3 py-2.5 text-right num font-bold text-slate-900">{fmt.format(item.ri)}</td>
                          <td className={`px-3 py-2.5 text-right num font-bold ${dev >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt.format(dev)}</td>
                          <td className="px-2.5 py-2.5 text-center num text-xs font-semibold">{pctDev.toFixed(1)}%</td>
                          <td className="px-3 py-2.5 text-right num text-slate-600">{item.sisa ? fmt.format(item.sisa) : '—'}</td>
                          <td className="px-3 py-2.5 text-right num text-slate-700">{fmt.format(riVsRa)}</td>
                          <td className="px-3 py-2.5 text-right num font-bold text-slate-900">{fmt.format(totalProyeksi)}</td>
                          <td className="px-2.5 py-2.5 text-center num font-bold">{koef.toFixed(0)}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'aset' && (
          <div className="space-y-6 animate-in">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Monitoring Aset & Fasilitas Kredit</h2><p className="text-sm text-slate-500 mt-1">Perhitungan KPR Property, Cicilan, Deviasi Nilai Pasar, dan Akumulasi Aset</p></div><button onClick={() => setShowAddAssetModal(true)} className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.98]"><Plus size={16} /> Tambah Data Aset</button></div>
            {s.assets.length===0 ? (
              <Card className="p-10 text-center empty-card">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 grid place-items-center mx-auto"><Building2 size={24}/></div>
                <div className="font-bold text-slate-900 mt-3">Belum ada aset tercatat</div>
                <div className="text-sm text-slate-500 mt-1 max-w-md mx-auto">Tambahkan aset property atau kendaraan untuk menghitung KPR, cicilan, dan capital gain secara otomatis.</div>
                <button onClick={()=>setShowAddAssetModal(true)} className="mt-4 px-4 py-2 bg-[#1E3A5F] text-white rounded-xl text-sm font-bold inline-flex items-center gap-1.5"><Plus size={16}/> Tambah Aset Pertama</button>
              </Card>
            ) : s.assets.map((a) => {
              const debt = assetDebt(a, reportDate)
              const nilaiHutang = debt.principal
              const cicilanPerBulan = debt.monthlyPayment
              const elapsedMonths = debt.paidMonths
              const totalCicilanTerbayar = cicilanPerBulan * elapsedMonths
              const sisaHutang = debt.outstanding
              const hargaPerolehan = a.nilai + a.tambah
              const nilaiAkhir = hargaPerolehan
              const capitalGain = a.nilaiPasar - nilaiAkhir
              return (
                <Card key={a.id} className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A5F] flex items-center justify-center border border-blue-200"><Building2 size={24} /></div>
                      <div><div className="font-extrabold text-lg text-slate-900 flex items-center gap-2">{a.nama}<span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold border border-slate-200">{a.jenis}</span></div><div className="text-xs text-slate-500 font-medium mt-0.5">Atas Nama: {a.atasNama} • Perolehan: {new Date(a.tgl).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right"><div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nilai Pasar Saat Ini</div><div className="text-2xl font-extrabold num text-emerald-600 mt-0.5">Rp {fmt.format(a.nilaiPasar)}</div><div className="text-xs text-emerald-700 font-bold flex items-center justify-end gap-1 mt-0.5"><ArrowUpRight size={14} /> Gain: +Rp {fmt.format(capitalGain)}</div></div>
                      <button onClick={() => askConfirm({ title: 'Hapus aset?', message: `Aset "${a.nama}" akan dihapus dari daftar.`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delAsset(a.id); pushToast('Aset dihapus', 'success') }})} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200" aria-label={`Hapus ${a.nama}`}><Trash2 size={16}/></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><div className="text-xs font-semibold text-slate-500">Nilai Pokok / DP</div><div className="font-bold text-base num text-slate-900 mt-1">Rp {fmt.format(a.nilai)}</div><div className="text-xs text-slate-500 font-medium mt-0.5">DP: Rp {fmt.format(a.dp)}</div></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><div className="text-xs font-semibold text-slate-500">Fasilitas Kredit & Bunga</div><div className="font-bold text-base num text-slate-900 mt-1">Rp {fmt.format(nilaiHutang)}</div><div className="text-xs text-slate-500 font-medium mt-0.5">Bunga: {(a.bunga * 100).toFixed(0)}% • Tenor: {a.tenor} Bln</div></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><div className="text-xs font-semibold text-slate-500">Cicilan / Bulan</div><div className="font-bold text-base num text-[#1E3A5F] mt-1">Rp {fmt.format(cicilanPerBulan)}</div><div className="text-xs text-slate-500 font-medium mt-0.5">Berjalan: {elapsedMonths}/{a.tenor} bln</div></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><div className="text-xs font-semibold text-slate-500">Sisa Hutang</div><div className="font-bold text-base num text-rose-600 mt-1">Rp {fmt.format(sisaHutang)}</div><div className="text-xs text-slate-500 font-medium mt-0.5">Terbayar: Rp {fmt.format(totalCicilanTerbayar)}</div></div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {tab === 'depresiasi' && (
          <div className="space-y-6 animate-in">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Penyusutan Aset Tetap (Garis Lurus)</h2><p className="text-xs font-mono text-slate-500 mt-1">DEPRE/BLN = NILAI / UMUR • PERIODE = ROUND((NOW−TGL)/30) • HASIL LEBIH = TAKSIR − SISA BUKU</p></div><button onClick={() => setShowAddDepModal(true)} className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm"><Plus size={16} /> Tambah Aset</button></div>
            <Card className="p-5">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#1E3A5F] text-white text-xs">
                    <tr>
                      <th className="px-3.5 py-3 min-w-[150px]">Aset</th>
                      <th className="px-3 py-3 min-w-[100px]">Perolehan</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">Nilai Pokok</th>
                      <th className="px-2 py-3 text-center min-w-[70px]">Umur</th>
                      <th className="px-3 py-3 text-right min-w-[100px]">Depre / Bln</th>
                      <th className="px-2 py-3 text-center min-w-[65px]">Periode</th>
                      <th className="px-2 py-3 text-center min-w-[65px]">Sisa Bln</th>
                      <th className="px-3 py-3 text-right min-w-[100px]">Akum Depre</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">Sisa Nilai</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">Taksir</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">Hasil Lebih</th>
                      <th className="px-2 py-3 text-center min-w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px]">
                    {s.deps.length===0 ? (
                      <tr><td colSpan={12} className="text-center py-12"><div className="flex flex-col items-center gap-2 text-slate-400"><Calculator size={24} className="text-slate-300"/> <span className="font-semibold text-slate-600">Belum ada aset depresiasi</span><span className="text-xs">Tambahkan kendaraan atau gadget untuk hitung penyusutan otomatis</span></div></td></tr>
                    ) : s.deps.map((d) => {
                      const umurMonths = d.umur || 1
                      const depreciation = straightLineValue(d, reportDate)
                      const perBulan = d.nilai / umurMonths
                      const elapsed = depreciation.monthsElapsed
                      const akum = depreciation.accumulated
                      const sisaNilai = depreciation.bookValue
                      const hasilLebih = d.nilaiTaksir - sisaNilai
                      return (
                        <tr key={d.id} className="hover:bg-slate-50 even:bg-slate-50/40">
                          <td className="px-3.5 py-3 font-bold text-slate-900">{d.nama}<span className="text-xs text-slate-500 font-normal block">{d.kat}</span></td>
                          <td className="px-3 py-3 text-slate-600 font-medium text-xs">{new Date(d.tgl).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</td>
                          <td className="px-3 py-3 text-right num font-semibold text-slate-800">{fmt.format(d.nilai)}</td>
                          <td className="px-2 py-3 text-center num text-slate-700">{d.umur} bln</td>
                          <td className="px-3 py-3 text-right num text-slate-700">{fmt.format(perBulan)}</td>
                          <td className="px-2 py-3 text-center num font-bold text-[#1E3A5F]">{elapsed}</td>
                          <td className="px-2 py-3 text-center num text-slate-500">{Math.max(0, d.umur - elapsed)}</td>
                          <td className="px-3 py-3 text-right num text-rose-600 font-semibold">{fmt.format(akum)}</td>
                          <td className="px-3 py-3 text-right num font-bold text-slate-900">{fmt.format(sisaNilai)}</td>
                          <td className="px-3 py-3 text-right num font-bold text-emerald-700">{fmt.format(d.nilaiTaksir)}</td>
                          <td className={`px-3 py-3 text-right num font-extrabold ${hasilLebih >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{hasilLebih >= 0 ? '+' : ''}{fmt.format(hasilLebih)}</td>
                          <td className="px-2 py-3 text-center"><button onClick={() => askConfirm({ title: 'Hapus aset depresiasi?', message: `Aset "${d.nama}" akan dihapus dari daftar depresiasi.`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delDep(d.id); pushToast('Aset depresiasi dihapus', 'success') }})} className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg" aria-label={`Hapus ${d.nama}`}><Trash2 size={15} /></button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'schedule' && (
          <div className="space-y-6 animate-in">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Jadwal Kalender Servis & Pajak Tahunan</h2><p className="text-sm text-slate-500 mt-1">Klik kotak bulan untuk mengaktifkan / menonaktifkan jadwal</p></div><button onClick={() => setShowAddSchedModal(true)} className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm"><Plus size={16} /> Tambah Jadwal</button></div>
            <Card className="p-5">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#1E3A5F] text-white text-xs">
                    <tr>
                      <th className="px-3.5 py-3 min-w-[200px]">Nama Aset / Item</th>
                      <th className="px-2.5 py-3 text-right min-w-[100px]">HS</th>
                      <th className="px-2 py-3 text-center min-w-[50px]">Vol</th>
                      <th className="px-3 py-3 text-right min-w-[110px]">Jumlah</th>
                      {monthShort.map((m) => (<th key={m} className="px-2 py-3 text-center min-w-[44px]">{m}</th>))}
                      <th className="px-3.5 py-3 text-right bg-[#152a45] min-w-[110px]">Total</th>
                      <th className="px-2 py-3 text-center min-w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px]">
                    {s.scheds.length===0 ? (
                      <tr><td colSpan={18} className="text-center py-12"><div className="flex flex-col items-center gap-2 text-slate-400"><CalendarClock size={24} className="text-slate-300"/><span className="font-semibold text-slate-600">Belum ada jadwal servis & pajak</span><span className="text-xs">Tambahkan jadwal berkala untuk menghitung beban tahunan</span></div></td></tr>
                    ) : s.scheds.map((sc) => {
                      const vol = sc.months.filter((v) => v > 0).length
                      const total = sc.months.reduce((a, b) => a + b, 0)
                      return (
                        <tr key={sc.id} className="hover:bg-slate-50 even:bg-slate-50/40">
                          <td className="px-3.5 py-2.5 font-bold text-slate-900">{sc.nama}<span className="text-xs text-slate-500 font-normal block capitalize">{sc.kat}</span></td>
                          <td className="px-2.5 py-2.5 text-right num text-slate-700">{fmt.format(sc.hs)}</td>
                          <td className="px-2 py-2.5 text-center num font-bold text-[#1E3A5F]">{vol}</td>
                          <td className="px-3 py-2.5 text-right num font-semibold text-slate-900">{fmt.format(sc.hs * vol)}</td>
                          {sc.months.map((v, mIdx) => (
                            <td key={mIdx} className="px-1.5 py-2.5 text-center">
                              <button onClick={() => s.toggleSchedMonth(sc.id, mIdx)} className={`w-8 h-8 rounded-lg text-xs font-bold num transition border ${v > 0 ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`} aria-label={`${sc.nama} ${monthShort[mIdx]} ${v>0?'aktif':'nonaktif'}`}>{v > 0 ? '✓' : '—'}</button>
                            </td>
                          ))}
                          <td className="px-3.5 py-2.5 text-right num font-extrabold text-[#1E3A5F] bg-blue-50/50">{fmt.format(total)}</td>
                          <td className="px-2 py-2.5 text-center"><button onClick={() => askConfirm({ title: 'Hapus jadwal?', message: `Jadwal "${sc.nama}" akan dihapus.`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delSched(sc.id); pushToast('Jadwal dihapus', 'success') }})} className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg" aria-label={`Hapus ${sc.nama}`}><Trash2 size={15} /></button></td>
                        </tr>
                      )
                    })}
                    {s.scheds.length>0 && <tr className="bg-[#1E3A5F] font-bold text-white text-xs"><td colSpan={4} className="px-3.5 py-3 text-slate-200 font-extrabold uppercase tracking-wider">TOTAL / BULAN</td>{Array(12).fill(null).map((_, mIdx) => { const mTotal = s.scheds.reduce((a, sc) => a + (sc.months[mIdx] || 0), 0); return (<td key={mIdx} className="px-1 py-3 text-center num text-amber-300 font-bold">{mTotal > 0 ? fmt.format(mTotal) : '—'}</td>)})}<td className="px-3.5 py-3 text-right num text-amber-300 font-black text-sm bg-[#152a45]">{fmt.format(s.scheds.reduce((a, sc) => a + sc.months.reduce((x, y) => x + y, 0), 0))}</td><td></td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'piutang' && (
          <div className="space-y-6 animate-in">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daftar Piutang Pribadi</h2><p className="text-sm text-slate-500 mt-1">Monitoring pinjaman terbit & pelunasan • Terhubung ke Ledger Master</p></div><button onClick={() => setShowAddPiutangModal(true)} className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm"><Plus size={16} /> Catat Piutang Baru</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-[#1E3A5F] shadow-card"><div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Total Diterbitkan</div><div className="text-xl font-extrabold num text-slate-900 mt-1">Rp {fmt.format(s.piutangs.reduce((a, p) => a + p.terbit, 0))}</div><div className="text-xs text-slate-500 mt-1">Akumulasi pinjaman</div></div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-emerald-600 shadow-card"><div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Telah Dilunasi</div><div className="text-xl font-extrabold num text-emerald-700 mt-1">Rp {fmt.format(s.piutangs.reduce((a, p) => a + p.lunas, 0))}</div><div className="text-xs text-slate-500 mt-1">Masuk ke Kas Master</div></div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-amber-500 shadow-card"><div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Sisa Piutang Aktif</div><div className="text-xl font-extrabold num text-amber-800 mt-1">Rp {fmt.format(piutangTotal)}</div><div className="text-xs text-slate-500 mt-1">{s.piutangs.filter((p) => p.terbit > p.lunas).length} debitur belum lunas</div></div>
            </div>
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3"><span className="font-bold text-[15px] text-slate-900">Buku Catatan Piutang</span><span className="text-xs font-bold num text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Sisa Tagihan: Rp {fmt.format(piutangTotal)}</span></div>
              <div className="mt-4 overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#1E3A5F] text-white text-xs">
                    <tr><th className="px-3.5 py-3 text-center w-12">No</th><th className="px-3.5 py-3 min-w-[110px]">Tanggal</th><th className="px-3.5 py-3 min-w-[130px]">Debitur</th><th className="px-4 py-3 min-w-[200px]">Uraian</th><th className="px-3.5 py-3 text-right min-w-[120px]">Penerbitan</th><th className="px-3.5 py-3 text-right min-w-[120px]">Pelunasan</th><th className="px-3.5 py-3 text-right min-w-[130px] bg-slate-800">Saldo</th><th className="px-3.5 py-3 text-center min-w-[120px]">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px]">
                    {s.piutangs.length===0 ? (
                      <tr><td colSpan={8} className="text-center py-12"><div className="flex flex-col items-center gap-2 text-slate-400"><HandCoins size={24} className="text-slate-300"/><span className="font-semibold text-slate-600">Belum ada piutang</span><span className="text-xs">Catat pinjaman personal untuk tracking tagihan</span></div></td></tr>
                    ) : s.piutangs.map((p, i) => {
                      const runningSaldo = s.piutangs.slice(0, i + 1).reduce((a, x) => a + x.terbit - x.lunas, 0)
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 even:bg-slate-50/40">
                          <td className="px-3.5 py-3 text-center font-mono text-slate-400 text-xs">{i + 1}</td>
                          <td className="px-3.5 py-3 text-slate-600 font-medium whitespace-nowrap text-xs">{new Date(p.tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-900">{p.nsb}</td>
                          <td className="px-4 py-3 text-slate-800 font-medium">{p.uraian}</td>
                          <td className="px-3.5 py-3 text-right num font-bold text-rose-600">{p.terbit ? fmt.format(p.terbit) : <span className="text-slate-300">—</span>}</td>
                          <td className="px-3.5 py-3 text-right num font-bold text-emerald-600">{p.lunas ? fmt.format(p.lunas) : <span className="text-slate-300">—</span>}</td>
                          <td className="px-3.5 py-3 text-right num font-extrabold text-[#1E3A5F] bg-slate-50">{fmt.format(runningSaldo)}</td>
                          <td className="px-3.5 py-3 text-center"><div className="flex items-center justify-center gap-1.5">{p.terbit > 0 && (<button onClick={() => setShowPelunasanModal(p)} className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1"><CheckCircle2 size={13} /> Lunas</button>)}<button onClick={() => askConfirm({ title: 'Hapus piutang?', message: `Piutang "${p.uraian}" milik ${p.nsb} akan dihapus.`, confirmLabel: 'Hapus', variant: 'danger', onConfirm: () => { s.delPiutang(p.id); pushToast('Piutang dihapus', 'success') }})} className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg" aria-label={`Hapus piutang ${p.nsb}`}><Trash2 size={15} /></button></div></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'neraca' && (
          <div className="space-y-6 animate-in">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Neraca Keuangan — Aktiva vs Passiva</h2><p className="text-sm text-slate-500 mt-1">Validasi keseimbangan posisi harta, kewajiban, dan ekuitas bersih</p></div><div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full border border-emerald-200 font-bold text-xs"><CheckCircle2 size={16} /> Balance Validated</div></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="bg-[#1E3A5F] text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between shadow-sm"><span>I. TOTAL AKTIVA (HARTA)</span><span className="num text-base font-extrabold">Rp {fmt.format(totalKekayaan)}</span></div>
                <div className="mt-4 divide-y divide-slate-100 text-sm">
                  <div className="py-3 flex justify-between items-center"><div><div className="font-bold text-slate-900">Kas & Setara Kas</div><div className="text-xs text-slate-500">Master + Operasional + Keluarga</div></div><div className="font-bold num text-slate-900">Rp {fmt.format(totalKas)}</div></div>
                  <div className="py-3 flex justify-between items-center"><div><div className="font-bold text-slate-900">Piutang Personal</div><div className="text-xs text-slate-500">Tagihan piutang aktif</div></div><div className="font-bold num text-slate-900">Rp {fmt.format(piutangTotal)}</div></div>
                  <div className="py-3 flex justify-between items-center"><div><div className="font-bold text-slate-900">Aset Tetap — Property</div><div className="text-xs text-slate-500">Nilai pasar taksiran</div></div><div className="font-bold num text-slate-900">Rp {fmt.format(s.assets[0]?.nilaiPasar || 0)}</div></div>
                  <div className="py-3 flex justify-between items-center"><div><div className="font-bold text-slate-900">Aset Bergerak & Elektronik</div><div className="text-xs text-slate-500">Kendaraan + Gadget (Taksir)</div></div><div className="font-bold num text-slate-900">Rp {fmt.format(s.deps.reduce((a, d) => a + d.nilaiTaksir, 0))}</div></div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="bg-[#1E3A5F] text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between shadow-sm"><span>II. TOTAL PASSIVA & EKUITAS</span><span className="num text-base font-extrabold">Rp {fmt.format(totalKekayaan)}</span></div>
                <div className="mt-4 divide-y divide-slate-100 text-sm">
                  <div className="py-3 flex justify-between items-center"><div><div className="font-bold text-slate-900">Cadangan Kas Darurat (4 Bulan)</div><div className="text-xs text-slate-500">RAB Ops & Keluarga × 4</div></div><div className="font-bold num text-slate-900">Rp {fmt.format(4 * (s.rabAnggy.reduce((a, r) => a + r.months[0], 0) + s.rabKeluarga.reduce((a, r) => a + r.months[0], 0)))}</div></div>
                  <div className="py-3 flex justify-between items-center"><div><div className="font-bold text-slate-900">Sisa Hutang Pokok KPR</div><div className="text-xs text-slate-500">Kewajiban jangka panjang</div></div><div className="font-bold num text-rose-600">Rp 150.000.000</div></div>
                  <div className="py-3.5 flex justify-between items-center bg-blue-50/60 -mx-6 px-6 rounded-xl mt-1 border border-blue-100"><div><div className="font-extrabold text-[#1E3A5F]">Ekuitas & Kekayaan Bersih</div><div className="text-xs text-slate-600 font-medium">Modal mandiri personal</div></div><div className="font-extrabold num text-[#1E3A5F] text-base">Rp {fmt.format(totalKekayaan - 150000000 - 4 * (s.rabAnggy.reduce((a, r) => a + r.months[0], 0) + s.rabKeluarga.reduce((a, r) => a + r.months[0], 0)))}</div></div>
                </div>
              </Card>
            </div>
          </div>
        )}
        </main>

        {/* Footer hint */}
        <div className="hidden lg:block px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white/50">
          <span className="font-medium">Anggy Keuangan</span> • Tip: Tekan <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono">K</kbd> untuk cari cepat • Data tersimpan otomatis di browser
        </div>
      </div>

      {showOnboarding && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/60" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8">
            <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] text-white grid place-items-center font-black text-lg">A</div>
            <h2 id="onboarding-title" className="mt-5 text-2xl font-extrabold text-slate-900">Siapkan ruang keuangan Anda</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Pilih cara mulai. Data demo hanya untuk melihat alur dan tidak mewakili kondisi keuangan Anda.</p>
            <div className="mt-6 grid gap-3">
              <button onClick={() => finishOnboarding('empty')} className="w-full rounded-xl bg-[#1E3A5F] px-4 py-3 text-left text-white font-bold">Mulai dari data kosong<span className="block text-xs font-medium text-slate-200 mt-1">Masukkan saldo, transaksi, anggaran, dan aset Anda sendiri.</span></button>
              <button onClick={() => finishOnboarding('demo')} className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left text-amber-950 font-bold">Lihat data demo<span className="block text-xs font-medium text-amber-800 mt-1">Contoh alur aplikasi dengan penanda Data Demo.</span></button>
              <label className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-800 font-bold cursor-pointer">Impor backup JSON<span className="block text-xs font-medium text-slate-500 mt-1">Pulihkan data dari perangkat lain.</span><input type="file" accept="application/json" className="sr-only" onChange={e => { const file = e.target.files?.[0]; if (file) void importBackup(file); e.currentTarget.value = '' }} /></label>
            </div>
            <p className="mt-5 text-xs text-slate-500">Data saat ini tersimpan lokal di browser. Sinkronisasi cloud belum aktif.</p>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around px-2 py-2 safe-area-pb">
        <button onClick={() => setTab('dashboard')} className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold min-w-[56px] ${tab === 'dashboard' ? 'text-[#1E3A5F] bg-blue-50' : 'text-slate-500'}`}><LayoutDashboard size={20} /><span className="text-[10px]">Dashboard</span></button>
        <button onClick={() => setTab('transaksi')} className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold min-w-[56px] ${tab === 'transaksi' ? 'text-[#1E3A5F] bg-blue-50' : 'text-slate-500'}`}><Wallet size={20} /><span className="text-[10px]">Transaksi</span></button>
        <button onClick={() => { setEditingTx(null); setShowAddTxModal(true)}} className="w-12 h-12 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center -mt-6 shadow-lg shadow-[#1E3A5F]/30 border-4 border-[#f1f5f9]" aria-label="Catat Transaksi"><Plus size={22} /></button>
        <button onClick={() => setTab('rab')} className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold min-w-[56px] ${tab === 'rab' ? 'text-[#1E3A5F] bg-blue-50' : 'text-slate-500'}`}><FileSpreadsheet size={20} /><span className="text-[10px]">RAB</span></button>
        <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold text-slate-500 min-w-[56px]"><Menu size={20} /><span className="text-[10px]">Menu</span></button>
      </div>

      {/* MODALS - keep existing but styled */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tx-modal-title">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddTxModal(false)} aria-hidden="true" />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 z-10 animate-scale border border-slate-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100"><h3 id="tx-modal-title" className="font-bold text-lg text-slate-900">{editingTx ? 'Edit Transaksi' : 'Catat Transaksi Baru'}</h3><button onClick={() => setShowAddTxModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400" aria-label="Tutup modal"><X size={20} /></button></div>
            <form onSubmit={(e) => {
                e.preventDefault()
                if (!txForm.uraian.trim()) { pushToast('Uraian wajib diisi', 'error'); return }
                const pen = parseRibuan(txForm.penerimaan) || 0
                const peng = parseRibuan(txForm.pengeluaran) || 0
                if (pen === 0 && peng === 0) { pushToast('Masukkan nominal penerimaan atau pengeluaran', 'error'); return }
                if (editingTx) { s.updTx(editingTx.id, { tanggal: txForm.tanggal, nsb: txForm.nsb.trim() || 'ANGGY', pos: txForm.pos.trim() || 'LAINNYA', uraian: txForm.uraian.trim(), penerimaan: pen, pengeluaran: peng, ledger: txForm.ledger }); pushToast('Transaksi diperbarui', 'success') }
                else { s.addTx({ tanggal: txForm.tanggal, nsb: txForm.nsb.trim() || 'ANGGY', pos: txForm.pos.trim() || 'LAINNYA', uraian: txForm.uraian.trim(), penerimaan: pen, pengeluaran: peng, ledger: txForm.ledger }); pushToast('Transaksi berhasil dicatat', 'success') }
                setShowAddTxModal(false)
              }} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Tanggal</label>
                  <input type="date" required value={txForm.tanggal} onChange={(e) => setTxForm({ ...txForm, tanggal: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Dompet / Ledger</label>
                  <select value={txForm.ledger} onChange={(e) => setTxForm({ ...txForm, ledger: e.target.value as Ledger })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F] bg-white font-medium">
                    <option value="master">MASTER (0) — Kas Induk & Gaji</option>
                    <option value="operasional">OPERASIONAL (1) — Kas Harian</option>
                    <option value="keluarga">KELUARGA (2) — Kas Rutin Rumah</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Pihak / NSB</label>
                  <input placeholder="ANGGY / ISTRI / DAMAR" value={txForm.nsb} onChange={(e) => setTxForm({ ...txForm, nsb: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">POS / Kategori</label>
                  <input placeholder="Ketik atau pilih kategori…" value={txForm.pos} onChange={(e) => setTxForm({ ...txForm, pos: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" />
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Pilihan POS Cepat (atau ketik langsung kategori baru di atas):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['SALARY', 'OPERASIONAL', 'BELANJA', 'NAFKAH', 'ANAK', 'ORANG TUA', 'PEMBANTU', 'LISTRIK', 'PULSA', 'USAHA', 'INVESTASI'].map(cat => (
                    <button type="button" key={cat} onClick={() => setTxForm({ ...txForm, pos: cat })} className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition ${txForm.pos.toUpperCase() === cat ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div><label className="text-sm font-semibold text-slate-700">Deskripsi / Uraian</label><input required placeholder="Contoh: Beli Token Listrik, Gaji Jan 2026..." value={txForm.uraian} onChange={(e) => setTxForm({ ...txForm, uraian: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div>
              <div className="grid grid-cols-2 gap-3.5">
                <div><label className="text-sm font-semibold text-emerald-800">Penerimaan (Masuk)</label><RupiahInput placeholder="0" value={txForm.penerimaan} onChange={(val) => setTxForm({ ...txForm, penerimaan: String(val) })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 num font-bold text-emerald-700" /></div>
                <div><label className="text-sm font-semibold text-rose-800">Pengeluaran (Keluar)</label><RupiahInput placeholder="0" value={txForm.pengeluaran} onChange={(val) => setTxForm({ ...txForm, pengeluaran: String(val) })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-rose-600 num font-bold text-rose-700" /></div>
              </div>
              <div className="pt-3 flex gap-3"><button type="button" onClick={() => setShowAddTxModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold">Batal</button><button type="submit" className="flex-1 px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold shadow-sm">Simpan Transaksi</button></div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTransferModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-900">Dropping / Transfer Dana</h3><button onClick={() => setShowTransferModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button></div>
            <form onSubmit={(e) => {
                e.preventDefault()
                const amt = parseRibuan(transferForm.amount)
                if (!amt || amt <= 0) { pushToast('Masukkan nominal transfer yang valid', 'error'); return }
                if (amt > saldoMaster) { pushToast(`Saldo MASTER tidak cukup. Sisa: Rp ${fmt.format(saldoMaster)}`, 'error'); return }
                s.transferDropping('master', transferForm.to, amt, transferForm.tanggal, transferForm.uraian || `DROPPING - ${transferForm.to.toUpperCase()}`)
                setShowTransferModal(false)
                pushToast(`Dropping Rp ${fmt.format(amt)} ke ${transferForm.to.toUpperCase()} berhasil`, 'success')
              }} className="space-y-4 mt-4">
              <div><label className="text-sm font-semibold text-slate-700">Tanggal Transfer</label><input type="date" required value={transferForm.tanggal} onChange={(e) => setTransferForm({ ...transferForm, tanggal: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div>
              <div><label className="text-sm font-semibold text-slate-700">Rekening Tujuan</label><select value={transferForm.to} onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value as 'operasional' | 'keluarga' })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white font-medium focus:border-[#1E3A5F]"><option value="operasional">OPERASIONAL (1) — Kas Harian</option><option value="keluarga">KELUARGA (2) — Kas Rutin</option></select></div>
              <div><label className="text-sm font-semibold text-slate-700">Nominal Transfer (Rp)</label><RupiahInput required placeholder="Contoh: 1.500.000" value={transferForm.amount} onChange={(val) => setTransferForm({ ...transferForm, amount: String(val) })} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none num font-bold text-[#1E3A5F]" /></div>
              <div className="pt-3 flex gap-3"><button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold">Batal</button><button type="submit" className="flex-1 px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold shadow-sm">Eksekusi Dropping</button></div>
            </form>
          </div>
        </div>
      )}

      {showPelunasanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPelunasanModal(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 animate-scale">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-900">Catat Pelunasan Piutang</h3><button onClick={() => setShowPelunasanModal(null)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400" aria-label="Tutup"><X size={20} /></button></div>
            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">Debitur: <strong className="text-[#1E3A5F]">{showPelunasanModal.nsb}</strong> • {showPelunasanModal.uraian} <span className="text-slate-500">• Sisa: Rp {fmt.format(showPelunasanModal.terbit - showPelunasanModal.lunas)}</span></div>
            <form onSubmit={(e) => {
                e.preventDefault()
                const nominal = parseRibuan(pelunasanNominal)
                if (!nominal || nominal <= 0) { pushToast('Masukkan nominal pelunasan yang valid', 'error'); return }
                const sisa = showPelunasanModal.terbit - showPelunasanModal.lunas
                if (nominal > sisa) { pushToast(`Nominal melebihi sisa tagihan Rp ${fmt.format(sisa)}`, 'error'); return }
                s.catatPelunasan(showPelunasanModal.id, nominal, pelunasanTgl)
                setShowPelunasanModal(null)
                pushToast(`Pelunasan Rp ${fmt.format(nominal)} dicatat`, 'success')
              }} className="space-y-4 mt-4">
              <div><label className="text-sm font-semibold text-slate-700">Tanggal Pelunasan</label><input type="date" required value={pelunasanTgl} onChange={e=>setPelunasanTgl(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10" /></div>
              <div><label className="text-sm font-semibold text-slate-700">Nominal Pelunasan (Rp)</label><RupiahInput required placeholder="Contoh: 500.000" value={pelunasanNominal} onChange={val=>setPelunasanNominal(String(val))} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none num font-bold text-emerald-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" /></div>
              <div className="pt-3 flex gap-3"><button type="button" onClick={() => setShowPelunasanModal(null)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold">Batal</button><button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm">Konfirmasi Lunas</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddRabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddRabModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-900">Tambah Item RAB</h3><button onClick={() => setShowAddRabModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button></div>
            <form onSubmit={(e) => {
                e.preventDefault()
                const f = e.currentTarget
                const which = (f.elements.namedItem('which') as HTMLSelectElement).value as 'anggy' | 'keluarga'
                const group = (f.elements.namedItem('group') as HTMLInputElement).value
                const uraian = (f.elements.namedItem('uraian') as HTMLInputElement).value
                const sat = (f.elements.namedItem('sat') as HTMLInputElement).value || 'bln'
                const hs = parseRibuan((f.elements.namedItem('hs') as HTMLInputElement).value) || 0
                const w1 = parseRibuan((f.elements.namedItem('w1') as HTMLInputElement).value) || 0
                const w2 = parseRibuan((f.elements.namedItem('w2') as HTMLInputElement).value) || 0
                const w3 = parseRibuan((f.elements.namedItem('w3') as HTMLInputElement).value) || 0
                const w4 = parseRibuan((f.elements.namedItem('w4') as HTMLInputElement).value) || 0
                const totalBulan = w1 + w2 + w3 + w4
                s.addRab(which, { group, uraian, sat, vol: 1, hs, w: [w1, w2, w3, w4], months: Array(12).fill(totalBulan), total: totalBulan * 12 })
                setShowAddRabModal(false)
              }} className="space-y-4 mt-4">
              <div><label className="text-sm font-semibold text-slate-700">RAB Target</label><select name="which" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white font-medium outline-none focus:border-[#1E3A5F]"><option value="anggy">RAB-01 • Anggy Operasional</option><option value="keluarga">RAB-02 • Anggy Keluarga</option></select></div>
              <div className="grid grid-cols-2 gap-3.5"><div><label className="text-sm font-semibold text-slate-700">Kategori</label><input name="group" required placeholder="OPERASIONAL / NAFKAH..." className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div><div><label className="text-sm font-semibold text-slate-700">Satuan</label><input name="sat" defaultValue="bln" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div></div>
              <div><label className="text-sm font-semibold text-slate-700">Nama Uraian Item</label><input name="uraian" required placeholder="Contoh: Belanja Bulanan" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div>
              <div><label className="text-sm font-semibold text-slate-700">Harga Satuan (HS)</label><RupiahInput name="hs" value={100000} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-semibold focus:border-[#1E3A5F]" /></div>
              <div className="grid grid-cols-4 gap-2.5"><div><label className="text-xs font-bold text-slate-600">W-1</label><RupiahInput name="w1" value={100000} className="w-full mt-1 border border-slate-200 rounded-xl px-2.5 py-2 text-xs num font-semibold" /></div><div><label className="text-xs font-bold text-slate-600">W-2</label><RupiahInput name="w2" value={0} placeholder="0" className="w-full mt-1 border border-slate-200 rounded-xl px-2.5 py-2 text-xs num font-semibold" /></div><div><label className="text-xs font-bold text-slate-600">W-3</label><RupiahInput name="w3" value={0} placeholder="0" className="w-full mt-1 border border-slate-200 rounded-xl px-2.5 py-2 text-xs num font-semibold" /></div><div><label className="text-xs font-bold text-slate-600">W-4</label><RupiahInput name="w4" value={0} placeholder="0" className="w-full mt-1 border border-slate-200 rounded-xl px-2.5 py-2 text-xs num font-semibold" /></div></div>
              <div className="pt-3 flex gap-3"><button type="button" onClick={() => setShowAddRabModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl">Batal</button><button type="submit" className="flex-1 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-bold rounded-xl shadow-sm">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddAssetModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-900">Tambah Data Aset Property</h3><button onClick={() => setShowAddAssetModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button></div>
            <form onSubmit={(e) => {
                e.preventDefault()
                const f = e.currentTarget
                s.addAsset({ jenis: 'PROPERTY', nama: (f.elements.namedItem('nama') as HTMLInputElement).value, atasNama: (f.elements.namedItem('atasNama') as HTMLInputElement).value || 'ANGGY', tgl: (f.elements.namedItem('tgl') as HTMLInputElement).value, nilai: parseRibuan((f.elements.namedItem('nilai') as HTMLInputElement).value) || 0, dp: parseRibuan((f.elements.namedItem('dp') as HTMLInputElement).value) || 0, bunga: Number((f.elements.namedItem('bunga') as HTMLInputElement).value) / 100 || 0.08, tenor: Number((f.elements.namedItem('tenor') as HTMLInputElement).value) || 120, nilaiPasar: parseRibuan((f.elements.namedItem('nilaiPasar') as HTMLInputElement).value) || 0, tambah: 0 })
                setShowAddAssetModal(false)
              }} className="space-y-4 mt-4">
              <div><label className="text-sm font-semibold text-slate-700">Nama Aset</label><input name="nama" required placeholder="Contoh: RUMAH TINGGAL" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div>
              <div className="grid grid-cols-2 gap-3.5"><div><label className="text-sm font-semibold text-slate-700">Atas Nama</label><input name="atasNama" defaultValue="ANGGY" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div><div><label className="text-sm font-semibold text-slate-700">Tgl Perolehan</label><input name="tgl" type="date" required defaultValue="2023-04-01" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div></div>
              <div className="grid grid-cols-2 gap-3.5"><div><label className="text-sm font-semibold text-slate-700">Nilai Pokok (Rp)</label><RupiahInput name="nilai" value={200000000} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-semibold" /></div><div><label className="text-sm font-semibold text-slate-700">Uang Muka / DP (Rp)</label><RupiahInput name="dp" value={50000000} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-semibold" /></div></div>
              <div className="grid grid-cols-2 gap-3.5"><div><label className="text-sm font-semibold text-slate-700">Bunga % / Thn</label><input name="bunga" type="number" step="0.1" defaultValue="8" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-semibold outline-none focus:border-[#1E3A5F]" /></div><div><label className="text-sm font-semibold text-slate-700">Tenor (Bulan)</label><input name="tenor" type="number" defaultValue="120" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-semibold outline-none focus:border-[#1E3A5F]" /></div></div>
              <div><label className="text-sm font-semibold text-slate-700">Nilai Pasar Saat Ini (Rp)</label><RupiahInput name="nilaiPasar" value={400000000} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-bold text-emerald-700" /></div>
              <div className="pt-3 flex gap-3"><button type="button" onClick={() => setShowAddAssetModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl">Batal</button><button type="submit" className="flex-1 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-bold rounded-xl shadow-sm">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddDepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddDepModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-900">Tambah Aset Depresiasi</h3><button onClick={() => setShowAddDepModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button></div>
            <form onSubmit={(e) => {
                e.preventDefault()
                const f = e.currentTarget
                s.addDep({ nama: (f.elements.namedItem('nama') as HTMLInputElement).value, kat: (f.elements.namedItem('kat') as HTMLSelectElement).value as 'KENDARAAN' | 'GADGET', tgl: (f.elements.namedItem('tgl') as HTMLInputElement).value, nilai: parseRibuan((f.elements.namedItem('nilai') as HTMLInputElement).value) || 0, umur: Number((f.elements.namedItem('umur') as HTMLInputElement).value) || 60, nilaiTaksir: parseRibuan((f.elements.namedItem('nilaiTaksir') as HTMLInputElement).value) || 0 })
                setShowAddDepModal(false)
              }} className="space-y-4 mt-4">
              <div><label className="text-sm font-semibold text-slate-700">Nama Aset</label><input name="nama" required placeholder="Contoh: MOTOR VESPA" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div>
              <div className="grid grid-cols-2 gap-3.5"><div><label className="text-sm font-semibold text-slate-700">Kategori</label><select name="kat" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white font-medium outline-none focus:border-[#1E3A5F]"><option value="KENDARAAN">KENDARAAN</option><option value="GADGET">GADGET / ELEKTRONIK</option></select></div><div><label className="text-sm font-semibold text-slate-700">Tgl Perolehan</label><input name="tgl" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div></div>
              <div className="grid grid-cols-2 gap-3.5"><div><label className="text-sm font-semibold text-slate-700">Nilai Perolehan (Rp)</label><RupiahInput name="nilai" value={50000000} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-semibold" /></div><div><label className="text-sm font-semibold text-slate-700">Umur Ekonomis (Bulan)</label><input name="umur" type="number" defaultValue="60" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-semibold outline-none focus:border-[#1E3A5F]" /></div></div>
              <div><label className="text-sm font-semibold text-slate-700">Nilai Taksir Pasar</label><RupiahInput name="nilaiTaksir" value={35000000} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-bold text-emerald-700" /></div>
              <div className="pt-3 flex gap-3"><button type="button" onClick={() => setShowAddDepModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl">Batal</button><button type="submit" className="flex-1 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-bold rounded-xl shadow-sm">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddSchedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddSchedModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-900">Tambah Jadwal Servis & Pajak</h3><button onClick={() => setShowAddSchedModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button></div>
            <form onSubmit={(e) => {
                e.preventDefault()
                const f = e.currentTarget
                const hs = parseRibuan((f.elements.namedItem('hs') as HTMLInputElement).value) || 0
                s.addSched({ nama: (f.elements.namedItem('nama') as HTMLInputElement).value, kat: (f.elements.namedItem('kat') as HTMLSelectElement).value as 'service' | 'pajak', hs, months: Array(12).fill(0) })
                setShowAddSchedModal(false)
              }} className="space-y-4 mt-4">
              <div><label className="text-sm font-semibold text-slate-700">Nama Jadwal / Aset</label><input name="nama" required placeholder="Contoh: Service Mobil / Pajak STNK" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div>
              <div className="grid grid-cols-2 gap-3.5"><div><label className="text-sm font-semibold text-slate-700">Kategori</label><select name="kat" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white font-medium outline-none focus:border-[#1E3A5F]"><option value="service">MAINTENANCE / SERVICE</option><option value="pajak">PAJAK & RETRIBUSI</option></select></div><div><label className="text-sm font-semibold text-slate-700">Harga Satuan (HS)</label><RupiahInput name="hs" value={300000} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-semibold" /></div></div>
              <div className="pt-3 flex gap-3"><button type="button" onClick={() => setShowAddSchedModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl">Batal</button><button type="submit" className="flex-1 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-bold rounded-xl shadow-sm">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddPiutangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddPiutangModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-900">Catat Piutang Baru</h3><button onClick={() => setShowAddPiutangModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button></div>
            <form onSubmit={(e) => {
                e.preventDefault()
                const f = e.currentTarget
                const nsb = (f.elements.namedItem('nsb') as HTMLInputElement).value
                const uraian = (f.elements.namedItem('uraian') as HTMLInputElement).value
                const tgl = (f.elements.namedItem('tgl') as HTMLInputElement).value
                const terbit = parseRibuan((f.elements.namedItem('terbit') as HTMLInputElement).value) || 0
                s.addPiutang({ tgl, nsb, uraian, terbit, lunas: 0, keterangan: (f.elements.namedItem('keterangan') as HTMLInputElement).value })
                setShowAddPiutangModal(false)
              }} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3.5"><div><label className="text-sm font-semibold text-slate-700">Tanggal Pinjaman</label><input name="tgl" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div><div><label className="text-sm font-semibold text-slate-700">Debitur (NSB)</label><input name="nsb" required placeholder="Contoh: DAMAR" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div></div>
              <div><label className="text-sm font-semibold text-slate-700">Uraian / Keperluan</label><input name="uraian" required placeholder="Contoh: HUTANG PRIBADI / MODAL" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div>
              <div><label className="text-sm font-semibold text-slate-700">Nominal Penerbitan (Rp)</label><RupiahInput name="terbit" value={1000000} className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm num font-bold text-[#1E3A5F]" /></div>
              <div><label className="text-sm font-semibold text-slate-700">Keterangan Tambahan</label><input name="keterangan" placeholder="Catatan syarat / tempo" className="w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" /></div>
              <div className="pt-3 flex gap-3"><button type="button" onClick={() => setShowAddPiutangModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl">Batal</button><button type="submit" className="flex-1 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-bold rounded-xl shadow-sm">Simpan</button></div>
            </form>
          </div>
        </div>
      )}
      {/* Command Palette */}
      {cmdOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={()=>setCmdOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search size={18} className="text-slate-400" />
              <input autoFocus placeholder="Cari menu, aksi, atau transaksi…" value={q} onChange={e=>setQ(e.target.value)} className="flex-1 outline-none text-sm placeholder:text-slate-400" />
              <span className="text-xs font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">ESC</span>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase px-2 py-1.5">Menu</div>
              {navGroups.flatMap(g=>g.items).map(item=>{
                const Icon=item.icon
                return (
                  <button key={item.id} onClick={()=>{ setTab(item.id); setCmdOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition ${tab===item.id ? 'bg-[#1E3A5F] text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                    <span className={`w-8 h-8 rounded-lg grid place-items-center ${tab===item.id ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon size={16} /></span>
                    <span className="flex-1"><span className="block leading-none">{item.label}</span><span className={`text-xs font-medium ${tab===item.id ? 'text-slate-300' : 'text-slate-400'}`}>{item.desc}</span></span>
                    {tab===item.id && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Aktif</span>}
                  </button>
                )
              })}
              <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase px-2 py-1.5 mt-2">Aksi Cepat</div>
              <button onClick={()=>{ setCmdOpen(false); setShowHelpModal(true)}} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 text-slate-700 text-left"><span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 grid place-items-center border border-amber-200"><HelpCircle size={16} /></span> Panduan & Tanya Jawab Fitur <span className="ml-auto text-xs text-slate-400">Bantuan</span></button>
              <button onClick={()=>{ setCmdOpen(false); setEditingTx(null); setShowAddTxModal(true)}} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 text-slate-700 text-left"><span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center border border-emerald-200"><Plus size={16} /></span> Catat Transaksi <span className="ml-auto text-xs text-slate-400">Alt+N</span></button>
              <button onClick={()=>{ setCmdOpen(false); setShowTransferModal(true)}} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 text-slate-700 text-left"><span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center border border-blue-200"><ArrowLeftRight size={16} /></span> Dropping Antar Ledger</button>
              <button onClick={()=>{ setCmdOpen(false); handleExport()}} disabled={exporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 text-slate-700 text-left disabled:opacity-60"><span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 grid place-items-center border border-slate-200"><Download size={16} /></span> Export Excel 13 Sheet {exporting ? '…' : ''}</button>
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between"><span>Tip: Ketik untuk filter • <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[11px]">↑↓</kbd> navigasi</span><span className="font-mono">⌘K untuk buka/tutup</span></div>
          </div>
        </div>
      )}

      {/* PUSAT BANTUAN & PANDUAN MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHelpModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 z-10 max-h-[85vh] flex flex-col animate-in">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 grid place-items-center border border-amber-200">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-none">Pusat Bantuan & Panduan Finansial</h3>
                  <p className="text-xs text-slate-500 mt-1">Jawaban lengkap pengelolaan kas, dompet, RAB, dan aset</p>
                </div>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="py-3 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={helpQ}
                  onChange={(e) => setHelpQ(e.target.value)}
                  placeholder="Cari pertanyaan… (misal: tambah dompet, kategori, RAB, dropping)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'thin' }}>
              {[
                {
                  q: 'Bagaimana cara menambah dompet / ledger rekening baru?',
                  tag: 'Dompet & Kas',
                  ans: (
                    <div>
                      <p>Sistem ini dirancang berbasis <strong>3 Akun Dompet Utama (3-Ledger System)</strong> sesuai pembukuan Excel:</p>
                      <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs">
                        <li><strong>MASTER (0):</strong> Rekening induk (gaji, bisnis, penerimaan dividen, dan kas besar).</li>
                        <li><strong>OPERASIONAL (1):</strong> Kas harian untuk belanja personal, pulsa, bensin, dan operasional kerja.</li>
                        <li><strong>KELUARGA (2):</strong> Kas belanja rumah tangga, nafkah, uang sekolah anak, dan asisten rumah tangga.</li>
                      </ul>
                      <p className="mt-2 text-xs text-slate-600">
                        Untuk memindahkan saldo dari kas Master ke Operasional/Keluarga, gunakan tombol <strong>"Dropping Dana"</strong> di bilah atas. Setiap transaksi baru juga dapat langsung dialokasikan ke salah satu dari 3 dompet tersebut.
                      </p>
                    </div>
                  ),
                },
                {
                  q: 'Bagaimana cara menambahkan kategori pengeluaran dan pemasukan baru?',
                  tag: 'Kategori & POS',
                  ans: (
                    <div>
                      <p>Kategori / POS anggaran bersifat <strong>fleksibel dan dinamis</strong>:</p>
                      <ol className="list-decimal pl-5 mt-1.5 space-y-1 text-xs">
                        <li>Buka menu <strong>Buku Transaksi</strong> lalu klik <strong>"+ Catat Transaksi"</strong>.</li>
                        <li>Pada kolom <strong>"POS / Kategori"</strong>, Anda dapat mengetikkan nama kategori baru apa saja secara bebas (contoh: <code>INVESTASI</code>, <code>ASURANSI</code>, <code>FREELANCE</code>, <code>BONUS</code>, <code>KESEHATAN</code>).</li>
                        <li>POS baru tersebut langsung tercatat, terindeks dalam pencarian, dan otomatis muncul di seluruh filter serta laporan keuangan.</li>
                      </ol>
                    </div>
                  ),
                },
                {
                  q: 'Bagaimana cara menambah item RAB baru?',
                  tag: 'RAB Anggaran',
                  ans: (
                    <div>
                      <p>Untuk menyusun rencana anggaran belanja mingguan & bulanan:</p>
                      <ol className="list-decimal pl-5 mt-1.5 space-y-1 text-xs">
                        <li>Buka menu <strong>RAB Anggaran</strong>, klik tombol <strong>"+ Tambah Item RAB"</strong> di kanan atas.</li>
                        <li>Pilih <strong>RAB Target</strong>: <code>RAB-01 Operasional</code> atau <code>RAB-02 Keluarga</code>.</li>
                        <li>Ketik nama <strong>Kategori</strong> (misal: <code>MAKANAN</code>, <code>TRANSPORT</code>, <code>PENDIDIKAN</code>) dan uraian item.</li>
                        <li>Isi <strong>Harga Satuan (HS)</strong> serta alokasi anggaran tiap pekan (<strong>W-1</strong> sampai <strong>W-4</strong>). Total bulanan dan tahunan akan dihitung secara otomatis.</li>
                      </ol>
                    </div>
                  ),
                },
                {
                  q: 'Bagaimana cara melakukan dropping / transfer dana antar kas?',
                  tag: 'Transfer Dana',
                  ans: (
                    <div>
                      <p>Fitur <strong>Dropping Dana</strong> memindahkan saldo dari kas Master (0) ke dompet operasional tanpa merusak saldo total kekayaan:</p>
                      <p className="mt-1 text-xs">Klik tombol <strong>"Dropping"</strong> di header atas → Pilih rekening tujuan (Operasional / Keluarga) → Masukkan nominal transfer → Klik <strong>"Eksekusi Dropping"</strong>. Sistem akan otomatis mencatat pengeluaran di MASTER dan penerimaan di dompet tujuan.</p>
                    </div>
                  ),
                },
                {
                  q: 'Bagaimana alur evaluasi Realisasi (RARI) vs Anggaran?',
                  tag: 'Evaluasi RARI',
                  ans: (
                    <div>
                      <p>Modul <strong>RARI (Rencana vs Realisasi)</strong> membandingkan anggaran RAB yang direncanakan dengan transaksi riil setiap bulannya:</p>
                      <p className="mt-1 text-xs">Pilih tab bulan di menu RARI untuk melihat deviasi surplus/defisit serta rasio realisasi. Nilai positif (hijau) menandakan penghematan, sedangkan nilai minus (merah) menunjukkan pengeluaran melampaui batas anggaran.</p>
                    </div>
                  ),
                },
                {
                  q: 'Bagaimana cara mengelola cicilan KPR dan depresiasi aset?',
                  tag: 'Aset & Kredit',
                  ans: (
                    <div>
                      <p>Sistem membedakan 2 jenis aset:</p>
                      <ul className="list-disc pl-5 mt-1 text-xs space-y-1">
                        <li><strong>Aset Properti / KPR:</strong> Catat di menu <em>Aset & Fasilitas Kredit</em> dengan memasukkan harga pokok, DP, bunga KPR, dan tenor. Cicilan bulanan, sisa pokok hutang, dan capital gain dihitung otomatis.</li>
                        <li><strong>Aset Bergerak (Kendaraan / Elektronik):</strong> Catat di menu <em>Depresiasi</em> dengan metode garis lurus untuk mengetahui sisa nilai buku dan estimasi harga pasar.</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  q: 'Bagaimana cara mengelola piutang dan pencatatan pelunasan?',
                  tag: 'Piutang',
                  ans: (
                    <div>
                      <p>Buka menu <strong>Piutang Personal</strong> → Klik <strong>"Catat Piutang Baru"</strong>. Ketika peminjam membayar cicilan atau lunas, klik tombol hijau <strong>"Lunas"</strong> pada baris debitur untuk mencatat pelunasan sekaligus memasukkan uang kas ke rekening Master.</p>
                    </div>
                  ),
                },
                {
                  q: 'Bagaimana cara mengekspor laporan ke file Excel (.xlsx)?',
                  tag: 'Ekspor Excel',
                  ans: (
                    <div>
                      <p>Klik tombol hijau <strong>"Export Excel"</strong> di header atau di sidebar. Sistem akan menghasilkan file workbook Excel asli yang terdiri atas seluruh 13 sheet lengkap dengan tabel bergaris, pemisah ribuan, dan rumus native <code>SUM</code> yang siap dicetak.</p>
                    </div>
                  ),
                },
              ]
                .filter(
                  (item) =>
                    !helpQ ||
                    item.q.toLowerCase().includes(helpQ.toLowerCase()) ||
                    item.tag.toLowerCase().includes(helpQ.toLowerCase())
                )
                .map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-[14px] text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white text-[10px] font-bold grid place-items-center shrink-0">
                          {idx + 1}
                        </span>
                        {item.q}
                      </h4>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full shrink-0">
                        {item.tag}
                      </span>
                    </div>
                    <div className="mt-2.5 text-slate-700 text-xs leading-relaxed pl-7">
                      {item.ans}
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Semua fitur siap pakai & sinkron ke data lokal</span>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold rounded-xl hover:bg-[#152a45]"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastStack toasts={toasts} remove={removeToast} />
      <ConfirmDialog open={!!confirmCfg} title={confirmCfg?.title || ''} message={confirmCfg?.message || ''} confirmLabel={confirmCfg?.confirmLabel} variant={confirmCfg?.variant} onCancel={() => setConfirmCfg(null)} onConfirm={() => { const fn = confirmCfg?.onConfirm; setConfirmCfg(null); fn?.() }} />
    </div>
  )
}
