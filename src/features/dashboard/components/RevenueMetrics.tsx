const REVENUE_DATA = [
  { label: 'Enterprise', value: '$842K', pct: 68, color: 'var(--accent)' },
  { label: 'Mid-Market', value: '$289K', pct: 23, color: 'var(--green)' },
  { label: 'SMB', value: '$109K', pct: 9, color: 'var(--cyan)' },
]

export default function RevenueMetrics() {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em' }}>
            $1.24M
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Revenue MTD</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--green)' }}>+5.1%</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>vs last month</div>
        </div>
      </div>

      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
        {REVENUE_DATA.map((d) => (
          <div key={d.label} style={{ flex: d.pct, background: d.color }} title={`${d.label}: ${d.pct}%`} />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {REVENUE_DATA.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>{d.label}</span>
            </div>
            <div className="flex items-center gap-8">
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)' }}>{d.value}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 28, textAlign: 'right' }}>
                {d.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
