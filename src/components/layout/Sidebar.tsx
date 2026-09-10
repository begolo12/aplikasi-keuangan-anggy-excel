import { ChevronLeft, ChevronRight, Wallet } from 'lucide-react'
import { NAV_GROUPS, TAB_ICONS, type TabKey } from './navConfig'
import { formatRibuan } from '../common/format'

export type { TabKey }
interface SidebarProps {
  activeTab: TabKey
  onSelectTab: (tab: TabKey) => void
  collapsed: boolean
  onToggleCollapse: () => void
  txCount: number
  unpaidPiutangCount: number
  masterBalance?: number
  opBalance?: number
  kelBalance?: number
  ledgerLabels?: {
    master: string
    operasional: string
    keluarga: string
  }
}


export function Sidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  txCount,
  unpaidPiutangCount,
  masterBalance = 0,
  opBalance = 0,
  kelBalance = 0,
  ledgerLabels = { master: 'Kas Utama', operasional: 'Kas Usaha', keluarga: 'Kas Keluarga' },
}: SidebarProps) {
  const getBadgeValue = (key?: 'txCount' | 'unpaidPiutangCount') => {
    if (key === 'txCount' && txCount > 0) return txCount
    if (key === 'unpaidPiutangCount' && unpaidPiutangCount > 0) return unpaidPiutangCount
    return undefined
  }
  const totalKas = masterBalance + opBalance + kelBalance

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 overflow-y-auto overscroll-contain bg-surface border-r border-border transition-all duration-200 select-none shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-[264px]'
      }`}
    >
      {/* Material 3 App Header */}
      <div className="h-[64px] flex items-center gap-3 px-4 shrink-0">
        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center font-semibold text-base tracking-tight shrink-0">
          F
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[17px] font-medium tracking-tight text-text leading-none">FinSheet</h1>
              <span className="text-[10px] font-semibold text-accent bg-accent-soft px-1.5 py-0.5 rounded-md">PRO</span>
            </div>
            <p className="text-[11px] text-text-subtle leading-none mt-1 truncate">
              Manajemen Kas & Aset
            </p>
          </div>
        )}
      </div>

      {/* Material 3 Cash Card Widget */}
      {!collapsed ? (
        <div className="px-3 pb-2 shrink-0">
          <div className="rounded-lg bg-surface-sunken border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow flex items-center gap-1.5">
                <Wallet size={13} className="text-text-subtle" />
                Posisi Kas
              </span>
              <span className="text-[11px] font-semibold text-accent">{totalKas > 0 ? `Rp ${formatRibuan(totalKas)}` : '—'}</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: ledgerLabels.master, hint: 'Uang utama / kas pusat', value: masterBalance, dot: 'bg-accent' },
                { label: ledgerLabels.operasional, hint: 'Untuk operasional / usaha', value: opBalance, dot: 'bg-positive' },
                { label: ledgerLabels.keluarga, hint: 'Untuk keluarga / rumah tangga', value: kelBalance, dot: 'bg-warning' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs" title={row.hint}>
                  <span className="flex items-center gap-2 text-text-muted truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${row.dot}`} />
                    <span className="truncate">{row.label}</span>
                  </span>
                  <span className="font-semibold text-text num shrink-0">
                    {row.value ? `Rp ${formatRibuan(row.value)}` : 'Rp 0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-border flex flex-col items-center gap-1 text-[10px] font-semibold text-text-subtle shrink-0">
          <Wallet size={14} className="text-text-subtle" />
          <span className="num text-xs font-semibold text-text">{totalKas ? formatRibuan(totalKas).slice(0, 5) : '0'}</span>
        </div>
      )}

      {/* Material Navigation Rail / Drawer */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 px-2">
        <div className="space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!collapsed ? (
                <div className="eyebrow px-3 mb-1.5">
                  {group.title}
                </div>
              ) : (
                <div className="mx-2 mb-1.5 h-px bg-border-strong" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id
                  const badge = getBadgeValue(item.badgeKey)
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => onSelectTab(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                          isActive
                            ? 'bg-accent-soft text-text font-semibold'
                            : 'text-text-muted hover:bg-surface-sunken hover:text-text'
                        } ${collapsed ? 'justify-center !px-0' : 'justify-between'}`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className={`shrink-0 ${isActive ? 'text-text' : 'text-text-muted'}`}>
                            {(() => { const Icon = TAB_ICONS[item.id]; return <Icon size={20} /> })()}
                          </span>
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </span>
                        {!collapsed && badge !== undefined && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium leading-none shrink-0 ${
                              isActive ? 'bg-accent text-on-fill' : 'bg-border-strong text-text'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                      {collapsed && (
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-text text-on-fill text-xs font-medium rounded-lg md-elevation-3 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-20">
                          {item.label}
                          {badge !== undefined && (
                            <span className="ml-2 px-1.5 py-0.5 bg-surface/20 rounded-full text-[10px]">{badge}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-surface-sunken text-text-muted hover:text-text transition text-xs font-medium cursor-pointer"
          aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Ringkas Menu</span></>}
        </button>
      </div>
    </aside>
  )
}
