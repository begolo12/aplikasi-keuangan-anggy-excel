import { useId } from 'react'
import { X, Plus } from 'lucide-react'
import { NAV_GROUPS, TAB_ICONS, type TabKey } from './navConfig'
import { useModalA11y } from '../../lib/useModalA11y'

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
  const panelRef = useModalA11y(open, onClose)
  const titleId = useId()
  if (!open) return null

  const getBadgeValue = (key?: 'txCount' | 'unpaidPiutangCount') => {
    if (key === 'txCount' && txCount > 0) return txCount
    if (key === 'unpaidPiutangCount' && unpaidPiutangCount > 0) return unpaidPiutangCount
    return undefined
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="fixed inset-0" style={{ backgroundColor: 'var(--c-overlay)' }} onClick={onClose} aria-hidden="true" />

      <div ref={panelRef} className="relative w-[320px] max-w-[85vw] bg-surface h-full flex flex-col md-elevation-3 z-10 animate-in border-r border-border">
        <div className="h-[64px] flex items-center justify-between px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-base">F</div>
            <div>
              <h2 id={titleId} className="text-[17px] font-medium tracking-tight text-text leading-none">FinSheet <span className="text-accent">PRO</span></h2>
              <p className="text-[11px] text-text-subtle leading-none mt-1">Keuangan & Aset Terpadu</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-muted hover:bg-surface-sunken transition cursor-pointer" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <button onClick={() => { onClose(); onOpenQuickTx() }} className="w-full py-3 px-4 rounded-lg bg-accent hover:bg-accent-hover text-on-fill text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer">
            <Plus size={18} /> Tambah Transaksi
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="px-3 mb-1.5 text-[11px] font-medium tracking-wider text-text-subtle uppercase">{group.title}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id
                  const badge = getBadgeValue(item.badgeKey)
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSelectTab(item.id); onClose() }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-[13px] transition cursor-pointer ${isActive ? 'bg-accent-soft text-text font-semibold' : 'text-text-muted hover:bg-surface-sunken hover:text-text font-medium'}`}
                    >
                      <span className="flex items-center gap-3"><span className={isActive ? 'text-text' : 'text-text-muted'}>{(() => { const Icon = TAB_ICONS[item.id]; return <Icon size={20} /> })()}</span>{item.label}</span>
                      {badge !== undefined && <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-accent text-on-fill' : 'bg-border-strong text-text'}`}>{badge}</span>}
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
