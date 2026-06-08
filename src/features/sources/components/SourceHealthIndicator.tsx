interface SourceHealthIndicatorProps {
  health: number
}

function getHealthColor(health: number): string {
  if (health >= 98) return 'var(--green)'
  if (health >= 90) return 'var(--amber)'
  return 'var(--red)'
}

export default function SourceHealthIndicator({ health }: SourceHealthIndicatorProps) {
  const color = getHealthColor(health)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color }}>{health}%</span>
    </div>
  )
}
