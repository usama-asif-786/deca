import { useState } from 'react'
import IssueItem, { type DataIssue } from './IssueItem'
import EmptyState from '@/components/common/EmptyState'
import { CheckCircle2 } from 'lucide-react'

const MOCK_ISSUES: DataIssue[] = [
  { id: 'qi-1', title: 'Null values in customer_email field', source: 'Salesforce CRM', count: 284, category: 'null_values', severity: 'high', time: '6h ago' },
  { id: 'qi-2', title: 'Duplicate transaction IDs detected', source: 'Stripe', count: 17, category: 'duplicate', severity: 'high', time: '1d ago' },
  { id: 'qi-3', title: 'New columns without ontology mapping', source: 'PostgreSQL', count: 3, category: 'schema_drift', severity: 'medium', time: '1d ago' },
  { id: 'qi-4', title: 'Revenue values outside expected range', source: 'HubSpot', count: 42, category: 'range_violation', severity: 'medium', time: '2d ago' },
  { id: 'qi-5', title: 'Phone number format errors', source: 'Zendesk', count: 128, category: 'format_error', severity: 'low', time: '3d ago' },
  { id: 'qi-6', title: 'Missing product_sku in order records', source: 'MySQL', count: 9, category: 'null_values', severity: 'medium', time: '4d ago' },
]

export default function IssueList() {
  const [issues, setIssues] = useState<DataIssue[]>(MOCK_ISSUES)

  const handleResolve = (id: string) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, resolved: true } : iss))
    )
  }

  const activeCount = issues.filter((i) => !i.resolved).length

  if (MOCK_ISSUES.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No data quality issues"
        description="All sources are passing validation checks."
      />
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
        {activeCount} active issue{activeCount !== 1 ? 's' : ''} across {MOCK_SOURCES_COUNT} sources
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {issues.map((issue) => (
          <IssueItem key={issue.id} issue={issue} onResolve={handleResolve} />
        ))}
      </div>
    </div>
  )
}

const MOCK_SOURCES_COUNT = new Set(MOCK_ISSUES.map((i) => i.source)).size
