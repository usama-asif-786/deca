import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string
  sub: string
  delta: string
  deltaType: 'up' | 'down' | 'flat'
}

export default function KPICard({ label, value, sub, delta, deltaType }: KPICardProps) {
  const DeltaIcon = deltaType === 'up' ? TrendingUp : deltaType === 'down' ? TrendingDown : Minus

  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {delta && (
        <div className={cn('kpi-delta flex items-center gap-4', deltaType)}>
          <DeltaIcon size={11} />
          {delta}
        </div>
      )}
    </div>
  )
}
