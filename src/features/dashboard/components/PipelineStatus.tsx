const PIPELINE_STAGES = [
  { name: 'Ingestion', status: 'done' as const, duration: '2m 14s', rows: '1,234,820', progress: 100 },
  { name: 'Transform', status: 'done' as const, duration: '4m 52s', rows: '1,234,018', progress: 100 },
  { name: 'Embed & Link', status: 'running' as const, duration: '–', rows: '–', progress: 67 },
]

export default function PipelineStatus() {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Pipeline Run #47</div>
        <span className="pill pill-blue">Running</span>
      </div>

      <div className="pipe-stages">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.name} className={`pipe-stage ${stage.status}`}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{stage.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'none', letterSpacing: 0, marginTop: 4 }}>
              {stage.status === 'done'
                ? `Complete — ${stage.duration}`
                : stage.status === 'running'
                ? `Running… ${stage.progress}%`
                : 'Pending'}
            </div>
            {stage.rows !== '–' && (
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'none', letterSpacing: 0, marginTop: 2, color: 'var(--text3)' }}>
                {stage.rows} rows
              </div>
            )}
            {stage.status === 'running' && (
              <div style={{ marginTop: 8 }}>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${stage.progress}%`, background: 'var(--cyan)' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
        {[
          { label: 'Sources', value: '8' },
          { label: 'Tables', value: '142' },
          { label: 'Speed', value: '18.4K r/s' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{ padding: '8px', background: 'var(--bg3)', borderRadius: 'var(--radius)', textAlign: 'center' }}
          >
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)' }}>{stat.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
