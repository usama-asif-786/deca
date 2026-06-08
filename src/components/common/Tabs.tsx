import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export default function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('tabs', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn('tab', active === tab.id && 'active')}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{ marginLeft: 4, color: 'var(--text3)', fontWeight: 400 }}>({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}
