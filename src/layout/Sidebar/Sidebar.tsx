import { Diamond, ChevronUp } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setScreen } from '@/app/slices/uiSlice'
import { NAV_ITEMS } from '@/lib/constants'
import SidebarSection from './SidebarSection'
import SidebarItem from './SidebarItem'

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const activeScreen = useAppSelector((s) => s.ui.activeScreen)
  const currentUser = useAppSelector((s) => s.auth.currentUser)
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount)

  const handleNav = (id: string) => {
    dispatch(setScreen(id))
  }

  // Group nav items by section
  const sections: string[] = []
  NAV_ITEMS.forEach((item) => {
    if (!sections.includes(item.section)) sections.push(item.section)
  })

  const getBadge = (badgeKey?: string): number | undefined => {
    if (!badgeKey) return undefined
    if (badgeKey === 'alerts') return unreadCount > 0 ? unreadCount : undefined
    return undefined
  }

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <Diamond size={18} aria-hidden="true" />
        Fulcrum Hub
        <small
          style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
            padding: '2px 8px',
            borderRadius: '100px',
            fontSize: 'var(--text-xs)',
          }}
        >
          v6
        </small>
      </div>

      {/* Navigation sections */}
      {sections.map((section) => (
        <div key={section}>
          <SidebarSection label={section} />
          {NAV_ITEMS.filter((item) => item.section === section).map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              iconName={item.icon}
              isActive={activeScreen === item.id}
              badge={getBadge(item.badgeKey)}
              onClick={handleNav}
            />
          ))}
        </div>
      ))}

      {/* User profile */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div
            className="sidebar-avatar"
            style={{ background: currentUser.color, color: '#fff' }}
            aria-hidden="true"
          >
            {currentUser.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)' }} className="truncate">
              {currentUser.name}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }} className="truncate">
              {currentUser.role}
            </div>
          </div>
          <ChevronUp size={12} style={{ color: 'var(--text3)', flexShrink: 0 }} aria-hidden="true" />
        </div>
      </div>
    </nav>
  )
}
