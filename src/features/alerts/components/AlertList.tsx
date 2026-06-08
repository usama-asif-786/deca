import type { Alert } from '@/lib/mockData'
import AlertItem from './AlertItem'
import EmptyState from '@/components/common/EmptyState'
import { BellOff } from 'lucide-react'

interface AlertListProps {
  alerts: Alert[]
  expandedAlert: string | null
  onExpand: (id: string) => void
  onSnooze: (id: string, duration: string) => void
}

export default function AlertList({ alerts, expandedAlert, onExpand, onSnooze }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={BellOff}
        title="No alerts"
        description="All clear — no alerts match your current filter."
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          isExpanded={expandedAlert === alert.id}
          onExpand={(id) => onExpand(expandedAlert === id ? '' : id)}
          onSnooze={onSnooze}
        />
      ))}
    </div>
  )
}
