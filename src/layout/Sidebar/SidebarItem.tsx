import {
  BarChart2, Bell, Sparkles, CreditCard, Building2, Plug, Settings,
  BookOpen, Dice6, Tags, Rocket, Bot, Globe, Zap, Monitor, Cloud, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  BarChart2, Bell, Sparkles, CreditCard, Building2, Plug, Settings,
  BookOpen, Dice6, Tags, Rocket, Bot, Globe, Zap, Monitor, Cloud, Users,
}

interface SidebarItemProps {
  id: string
  label: string
  iconName: string
  isActive: boolean
  badge?: number | string
  badgeDot?: boolean
  onClick: (id: string) => void
}

export default function SidebarItem({ id, label, iconName, isActive, badge, badgeDot, onClick }: SidebarItemProps) {
  const Icon = iconMap[iconName] ?? BarChart2

  return (
    <div
      className={cn('sidebar-item', isActive && 'active')}
      onClick={() => onClick(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(id) }}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <span>{label}</span>
      {badge !== undefined && (
        <span className="badge badge-count">{badge}</span>
      )}
      {badgeDot && !badge && (
        <span className="badge-dot" aria-label="Has updates" />
      )}
    </div>
  )
}
