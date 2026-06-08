import KPICard from './KPICard'
import type { KPIStats } from '@/lib/mockData'

interface KPIGridProps {
  stats: KPIStats[]
}

export default function KPIGrid({ stats }: KPIGridProps) {
  return (
    <div className="kpi-grid">
      {stats.slice(0, 4).map((stat) => (
        <KPICard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          sub={stat.sub}
          delta={stat.delta}
          deltaType={stat.deltaType}
        />
      ))}
    </div>
  )
}
