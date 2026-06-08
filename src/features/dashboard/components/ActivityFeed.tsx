const ACTIVITIES = [
  { id: 1, user: 'Mike Johnson', action: 'fixed PostgreSQL sync schedule', meta: 'Connector resolved', time: '1d ago', color: '#2d6a4f' },
  { id: 2, user: 'Sarah Kim', action: 'created task "Investigate churn Q1 anomaly"', meta: 'Task', time: '2d ago', color: '#1e1f23' },
  { id: 3, user: 'System', action: 'Pipeline run #47 completed — 1.2M rows processed', meta: 'Pipeline', time: '6h ago', color: '#006778' },
  { id: 4, user: 'Raj Desai', action: 'deployed churn model v1.3 to staging', meta: 'ML Ops', time: '3d ago', color: '#6a4c93' },
  { id: 5, user: 'Tom Baker', action: 'approved ontology v2.3 for Pinnacle Energy', meta: 'Governance', time: '4d ago', color: '#9c6400' },
  { id: 6, user: 'Amy Liu', action: 'added 3 new NPS survey segments', meta: 'Analytics', time: '5d ago', color: '#9c6400' },
]

export default function ActivityFeed() {
  return (
    <div>
      {ACTIVITIES.map((act, i) => (
        <div key={act.id} className="timeline-item" style={{ paddingBottom: i < ACTIVITIES.length - 1 ? 12 : 0 }}>
          <div style={{ flex: 1 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: act.color,
                color: '#fff',
                fontSize: 8,
                fontWeight: 600,
                marginRight: 6,
                flexShrink: 0,
              }}
            >
              {act.user.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </span>
            <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{act.user}</strong>
            {' '}
            {act.action}
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text3)',
                  background: 'var(--bg3)',
                  padding: '1px 6px',
                  borderRadius: '100px',
                }}
              >
                {act.meta}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{act.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
