import ProgressBar from '@/components/common/ProgressBar'

const SCORE = 87
const DIMS = [
  { name: 'Data Coverage', value: 92, color: 'var(--green)' },
  { name: 'Data Quality', value: 84, color: 'var(--amber)' },
  { name: 'Mapping Completeness', value: 87, color: 'var(--green)' },
  { name: 'Freshness', value: 79, color: 'var(--amber)' },
  { name: 'AI Readiness', value: 91, color: 'var(--green)' },
]

export default function ReadinessScore() {
  const circumference = 2 * Math.PI * 50
  const offset = circumference - (SCORE / 100) * circumference
  const scoreColor = SCORE >= 90 ? 'var(--green)' : SCORE >= 75 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="flex gap-16 items-start">
      {/* SVG Gauge */}
      <div className="readiness-gauge">
        <svg width="120" height="120" aria-label={`Readiness score: ${SCORE}/100`}>
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="var(--bg4)"
            strokeWidth="8"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="readiness-score">
          <div className="score" style={{ color: scoreColor }}>{SCORE}</div>
          <div className="of">/ 100</div>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="readiness-bars">
        {DIMS.map((dim) => (
          <div key={dim.name} className="rbar">
            <div className="rbar-label">
              <span style={{ color: 'var(--text2)' }}>{dim.name}</span>
              <span style={{ fontWeight: 600, color: dim.value >= 85 ? 'var(--green)' : 'var(--amber)' }}>{dim.value}%</span>
            </div>
            <ProgressBar value={dim.value} color={dim.color} showPercent={false} />
          </div>
        ))}
      </div>
    </div>
  )
}
