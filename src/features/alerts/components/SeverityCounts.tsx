import type { Alert } from '@/lib/mockData'

interface SeverityCountsProps {
  alerts: Alert[]
}

export default function SeverityCounts({ alerts }: SeverityCountsProps) {
  const critical = alerts.filter((a) => a.severity === 'critical').length
  const warn = alerts.filter((a) => a.severity === 'warn').length
  const info = alerts.filter((a) => a.severity === 'info').length

  const counts = [
    { label: 'Critical', count: critical, color: 'var(--red)' },
    { label: 'Warning', count: warn, color: 'var(--amber)' },
    { label: 'Info', count: info, color: 'var(--cyan)' },
    { label: 'Total', count: alerts.length, color: 'var(--text3)' },
  ]

  return (
    <div className="severity-counts">
      {counts.map((c) => (
        <div key={c.label} className="sev-count">
          <span className="sev-dot" style={{ background: c.color }} />
          <span style={{ fontWeight: 600, color: c.color }}>{c.count}</span>
          <span style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}
