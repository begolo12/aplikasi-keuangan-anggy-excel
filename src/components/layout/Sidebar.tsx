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
      className={`hidden lg:flex flex-col h-screen sticky top-0 overflow-y-auto overscroll-contain bg-white border-r border-[#e0e2e0] transition-all duration-200 select-none shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-[264px]'
      }`}
    >
      {/* Material 3 App Header */}
      <div className="h-[64px] flex items-center gap-3 px-4 shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-base tracking-tight shrink-0">
          F
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[17px] font-medium tracking-tight text-[#1f1f1f] leading-none">FinSheet</h1>
              <span className="text-[10px] font-semibold text-[#1a73e8] bg-[#e8f0fe] px-1.5 py-0.5 rounded-md">PRO</span>
            </div>
            <p className="text-[11px] text-[#747775] leading-none mt-1 truncate">
              Manajemen Kas & Aset
            </p>
          </div>
        )}
      </div>

      {/* Material 3 Cash Card Widget */}
      {!collapsed ? (
        <div className="px-3 pb-2 shrink-0">
          <div className="rounded-2xl bg-[#f8f9fa] border border-[#e0e2e0] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-[#747775] uppercase">
                <Wallet size={13} className="text-[#747775]" />
                Posisi Kas
              </span>
              <span className="text-[11px] font-semibold text-[#1a73e8]">{totalKas > 0 ? `Rp ${formatRibuan(totalKas)}` : '—'}</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: ledgerLabels.master, hint: 'Uang utama / kas pusat', value: masterBalance, dot: 'bg-[#1a73e8]' },
                { label: ledgerLabels.operasional, hint: 'Untuk operasional / usaha', value: opBalance, dot: 'bg-[#137333]' },
                { label: ledgerLabels.keluarga, hint: 'Untuk keluarga / rumah tangga', value: kelBalance, dot: 'bg-[#b06000]' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs" title={row.hint}>
                  <span className="flex items-center gap-2 text-[#444746] truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${row.dot}`} />
                    <span className="truncate">{row.label}</span>
                  </span>
                  <span className="font-semibold text-[#1f1f1f] num shrink-0">
                    {row.value ? `Rp ${formatRibuan(row.value)}` : 'Rp 0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-[#e0e2e0] flex flex-col items-center gap-1 text-[10px] font-semibold text-[#747775] shrink-0">
          <Wallet size={14} className="text-[#747775]" />
          <span className="num text-xs font-semibold text-[#1f1f1f]">{totalKas ? formatRibuan(totalKas).slice(0, 5) : '0'}</span>
        </div>
      )}

      {/* Material Navigation Rail / Drawer */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 px-2">
        <div className="space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!collapsed ? (
                <div className="px-3 mb-1.5 text-[11px] font-medium tracking-wider text-[#747775] uppercase">
                  {group.title}
                </div>
              ) : (
                <div className="mx-2 mb-1.5 h-px bg-[#e0e2e0]" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id
                  const badge = getBadgeValue(item.badgeKey)
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => onSelectTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                          isActive
                            ? 'bg-[#c2e7ff] text-[#001d35] font-semibold'
                            : 'text-[#444746] hover:bg-[#f1f3f4] hover:text-[#1f1f1f]'
                        } ${collapsed ? 'justify-center !px-0' : 'justify-between'}`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className={`shrink-0 ${isActive ? 'text-[#001d35]' : 'text-[#444746]'}`}>
                            {(() => { const Icon = TAB_ICONS[item.id]; return <Icon size={20} /> })()}
                          </span>
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </span>
                        {!collapsed && badge !== undefined && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium leading-none shrink-0 ${
                              isActive ? 'bg-[#001d35] text-white' : 'bg-[#e0e2e0] text-[#1f1f1f]'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                      {collapsed && (
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1f1f1f] text-white text-xs font-medium rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                          {item.label}
                          {badge !== undefined && (
                            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">{badge}</span>
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
      <div className="p-2 border-t border-[#e0e2e0] shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-full hover:bg-[#f1f3f4] text-[#444746] hover:text-[#1f1f1f] transition text-xs font-medium cursor-pointer"
          aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Ringkas Menu</span></>}
        </button>
      </div>
    </aside>
  )
}
