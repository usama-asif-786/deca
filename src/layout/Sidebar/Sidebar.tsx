import { Diamond, ChevronUp } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { NAV_ITEMS } from '@/lib/constants'
import SidebarSection from './SidebarSection'
import SidebarItem from './SidebarItem'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentUser = useAppSelector((s) => s.auth.user)
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount)

  // current path (for active state)
  const activePath = location.pathname

  const handleNav = (path: string) => {
    navigate(path)
  }

  // group sections
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

      {/* Navigation */}
      {sections.map((section) => (
        <div key={section}>
          <SidebarSection label={section} />

          {NAV_ITEMS.filter((item) => item.section === section).map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              iconName={item.icon}
              badge={getBadge(item.badgeKey)}
              onClick={() => handleNav(item.path)} // ✅ IMPORTANT CHANGE
              isActive={activePath === item.path}   // ✅ URL-based active state
            />
          ))}
        </div>
      ))}

      {/* User */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div
            className="sidebar-avatar"
            style={{
              background: currentUser?.color || '#333',
              color: '#fff',
            }}
          >
            {currentUser?.initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="truncate" style={{ fontWeight: 500 }}>
              {currentUser?.name}
            </div>
            <div className="truncate" style={{ fontSize: 'var(--text-xs)' }}>
              {currentUser?.role}
            </div>
          </div>

          <ChevronUp size={12} style={{ color: 'var(--text3)' }} />
        </div>
      </div>
    </nav>
  )
}