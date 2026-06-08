interface ChartDataPoint {
  label: string
  value: number
  secondary?: number
}

interface ChartProps {
  data: ChartDataPoint[]
  title?: string
  height?: number
}

export default function Chart({ data, title, height = 160 }: ChartProps) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.secondary ?? 0)))

  return (
    <div>
      {title && (
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>
          {title}
        </div>
      )}
      <div className="chart-bars" style={{ height }}>
        {data.map((d) => {
          const barH = Math.round((d.value / maxVal) * (height - 20))
          const secH = d.secondary ? Math.round((d.secondary / maxVal) * (height - 20)) : 0

          return (
            <div key={d.label} className="chart-col">
              <div
                style={{ display: 'flex', alignItems: 'flex-end', gap: 3, flex: 1, width: '100%', justifyContent: 'center' }}
              >
                <div
                  className="chart-bar"
                  style={{ height: barH, flex: 1 }}
                  title={`${d.label}: ${d.value}`}
                />
                {d.secondary !== undefined && (
                  <div
                    style={{
                      height: secH,
                      flex: 1,
                      background: 'var(--bg4)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: 4,
                    }}
                    title={`${d.label} (secondary): ${d.secondary}`}
                  />
                )}
              </div>
              <div className="chart-label">{d.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
