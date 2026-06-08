import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export interface DataIssue {
  id: string
  title: string
  source: string
  count: number
  category: 'null_values' | 'duplicate' | 'schema_drift' | 'range_violation' | 'format_error'
  severity: 'high' | 'medium' | 'low'
  time: string
  resolved?: boolean
}

interface IssueItemProps {
  issue: DataIssue
  onResolve: (id: string) => void
}

const CATEGORY_LABELS: Record<DataIssue['category'], string> = {
  null_values: 'Null Values',
  duplicate: 'Duplicates',
  schema_drift: 'Schema Drift',
  range_violation: 'Range Violation',
  format_error: 'Format Error',
}

const SEV_COLOR: Record<DataIssue['severity'], string> = {
  high: 'var(--red)',
  medium: 'var(--amber)',
  low: 'var(--cyan)',
}

export default function IssueItem({ issue, onResolve }: IssueItemProps) {
  return (
    <div
      className="alert-item alert-item-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: issue.resolved ? 0.5 : 1,
      }}
    >
      {/* Severity indicator */}
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: SEV_COLOR[issue.severity],
          flexShrink: 0,
        }}
      />

      {/* Title + category */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            color: issue.resolved ? 'var(--text3)' : 'var(--text)',
            textDecoration: issue.resolved ? 'line-through' : 'none',
          }}
        >
          {issue.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text3)',
              background: 'var(--bg3)',
              padding: '1px 7px',
              borderRadius: 100,
            }}
          >
            {CATEGORY_LABELS[issue.category]}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
            {issue.source}
          </span>
        </div>
      </div>

      {/* Count + time */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: SEV_COLOR[issue.severity] }}>
          {issue.count.toLocaleString()} records
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{issue.time}</div>
      </div>

      {/* Action */}
      <button
        className="btn btn-xs btn-ghost"
        onClick={() => onResolve(issue.id)}
        style={{ flexShrink: 0, color: issue.resolved ? 'var(--green)' : undefined }}
        disabled={issue.resolved}
      >
        {issue.resolved ? (
          <>
            <CheckCircle2 size={12} /> Resolved
          </>
        ) : (
          <>
            <AlertTriangle size={12} /> Resolve
          </>
        )}
      </button>
    </div>
  )
}
