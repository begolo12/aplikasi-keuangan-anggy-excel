import { Plus, Menu } from 'lucide-react'
import { ALL_NAV_ITEMS, BOTTOM_TABS, TAB_ICONS, type TabKey } from './navConfig'

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
  const isOtherActive = !BOTTOM_TABS.includes(activeTab)
  const tabs = BOTTOM_TABS.map((id) => {
    const meta = ALL_NAV_ITEMS.find((i) => i.id === id)
    const Icon = TAB_ICONS[id]
    return { id, label: meta?.shortLabel || meta?.label || id, Icon, dot: id === 'transaksi' && txCount > 0 }
  })

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border px-1 py-1.5 safe-area-bottom md-elevation-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as TabKey)}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center py-1 px-3 min-w-[64px] relative transition cursor-pointer"
            >
              <span className={`px-3.5 py-1 rounded-full transition-colors ${isActive ? 'bg-accent-soft text-text' : 'text-text-muted'}`}>
                <tab.Icon size={20} />
              </span>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-semibold text-text' : 'font-medium text-text-subtle'}`}>
                {tab.label}
              </span>
              {tab.dot && <span className="absolute top-1 right-3.5 w-2 h-2 bg-positive rounded-full border border-white" />}
            </button>
          )
        })}
        <button onClick={onOpenQuickTx} className="flex flex-col items-center justify-center gap-0.5 -mt-3 cursor-pointer">
          <span className="w-12 h-12 rounded-lg bg-accent hover:bg-accent-hover text-white flex items-center justify-center md-elevation-2 active:scale-95 transition-transform"><Plus size={22} /></span>
          <span className="text-[10px] font-medium text-accent">Tambah</span>
        </button>
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-3 min-w-[64px] transition cursor-pointer"
        >
          <span className={`px-3.5 py-1 rounded-full transition-colors ${isOtherActive ? 'bg-accent-soft text-text' : 'text-text-muted'}`}>
            <Menu size={20} />
          </span>
          <span className={`text-[10px] mt-0.5 tracking-tight ${isOtherActive ? 'font-semibold text-text' : 'font-medium text-text-subtle'}`}>
            Menu
          </span>
        </button>
      </div>
    </div>
  )
}
