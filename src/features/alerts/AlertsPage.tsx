import { useState } from 'react'
import { useGetAlertsQuery } from '@/app/services/api'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setActiveTab, setExpandedAlert } from './alertsSlice'
import type { Alert } from '@/lib/mockData'
import SeverityCounts from './components/SeverityCounts'
import AlertList from './components/AlertList'
import IssueList from './components/IssueList'
import Tabs from '@/components/common/Tabs'
import { Bell, AlertTriangle, Clock, Filter } from 'lucide-react'

const TABS = [
  { id: 'alerts', label: 'Alerts' },
  { id: 'rules', label: 'Alert Rules' },
  { id: 'issues', label: 'Data Quality Issues' },
  { id: 'timeline', label: 'Timeline' },
]

// TODO: Replace with RTK Query mutation for alert rule management — see src/app/services/api.ts
const MOCK_ALERT_RULES = [
  { name: 'Churn Rate Exceeded', metric: 'churn_rate', operator: '>', threshold: '4.0%', severity: 'critical', recipients: 'ceo@co.com, sales@co.com', enabled: true },
  { name: 'API Rate Limit Warning', metric: 'api_usage_pct', operator: '>', threshold: '90%', severity: 'warn', recipients: 'platform@co.com', enabled: true },
  { name: 'Source Sync Overdue', metric: 'sync_lag_min', operator: '>', threshold: '30 min', severity: 'warn', recipients: 'data-eng@co.com', enabled: true },
  { name: 'Data Quality Drop', metric: 'dq_score_pct', operator: '<', threshold: '85%', severity: 'critical', recipients: 'data-eng@co.com', enabled: true },
  { name: 'ML Model Drift', metric: 'model_accuracy', operator: '<', threshold: '80%', severity: 'warn', recipients: 'ml-team@co.com', enabled: true },
  { name: 'Storage Threshold', metric: 'storage_pct', operator: '>', threshold: '80%', severity: 'info', recipients: 'infra@co.com', enabled: false },
  { name: 'Revenue Pipeline Stall', metric: 'pipeline_idle_min', operator: '>', threshold: '15 min', severity: 'critical', recipients: 'ceo@co.com', enabled: true },
  { name: 'Failed Login Attempts', metric: 'login_failures', operator: '>', threshold: '5 in 10 min', severity: 'critical', recipients: 'security@co.com', enabled: true },
]

const SEV_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'warn', label: 'Warning' },
  { id: 'info', label: 'Info' },
]

interface TimelineEvent {
  id: string
  title: string
  desc: string
  time: string
  type: 'alert' | 'resolve' | 'snooze' | 'ack'
}

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: 'tl-1', title: 'Alert fired: Churn Rate Exceeded', desc: 'Critical alert fired — churn rate at 4.8%', time: '12 min ago', type: 'alert' },
  { id: 'tl-2', title: 'Alert fired: API Rate Limit Warning', desc: 'FinCore tenant at 92% API usage', time: '2h ago', type: 'alert' },
  { id: 'tl-3', title: 'Alert snoozed: Source Sync Overdue', desc: 'Snoozed for 4 hours by Sarah Kim', time: '3h ago', type: 'snooze' },
  { id: 'tl-4', title: 'Alert acknowledged: Revenue Pipeline Stalled', desc: 'Acknowledged by Mike Johnson', time: '4h ago', type: 'ack' },
  { id: 'tl-5', title: 'Alert fired: Data Quality Score Dropped', desc: 'Quality score fell to 87%', time: '6h ago', type: 'alert' },
  { id: 'tl-6', title: 'Alert resolved: PostgreSQL Sync Lag', desc: 'Auto-resolved after sync completed', time: '12h ago', type: 'resolve' },
  { id: 'tl-7', title: 'Alert fired: Model Drift Detected', desc: 'Churn model accuracy below 80%', time: '12h ago', type: 'alert' },
  { id: 'tl-8', title: 'Alert fired: Storage Approaching Limit', desc: 'Pinnacle Energy at 68% storage', time: '1d ago', type: 'alert' },
]

const TIMELINE_ICON_COLOR: Record<TimelineEvent['type'], string> = {
  alert: 'var(--red)',
  resolve: 'var(--green)',
  snooze: 'var(--amber)',
  ack: 'var(--cyan)',
}

const TIMELINE_LABEL: Record<TimelineEvent['type'], string> = {
  alert: 'Alert',
  resolve: 'Resolved',
  snooze: 'Snoozed',
  ack: 'Acknowledged',
}

export default function AlertsPage() {
  const dispatch = useAppDispatch()
  const { activeTab, expandedAlert } = useAppSelector((s) => s.alerts)
  const { data: alerts = [], isLoading } = useGetAlertsQuery()
  const [sevFilter, setSevFilter] = useState('all')
  const [snoozedAlerts, setSnoozedAlerts] = useState<Set<string>>(new Set())

  const handleSnooze = (id: string, _duration: string) => {
    setSnoozedAlerts((prev) => new Set([...prev, id]))
  }

  const alertsWithSnooze: Alert[] = alerts.map((a) => ({
    ...a,
    snoozed: snoozedAlerts.has(a.id),
  }))

  const filteredAlerts = alertsWithSnooze.filter((a) => {
    if (sevFilter === 'all') return true
    return a.severity === sevFilter
  })

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const warnCount = alerts.filter((a) => a.severity === 'warn').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            Alerts & Monitoring
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
            {criticalCount > 0 && (
              <span style={{ color: 'var(--red)', fontWeight: 600, marginRight: 8 }}>
                {criticalCount} critical
              </span>
            )}
            {warnCount > 0 && (
              <span style={{ color: 'var(--amber)', marginRight: 8 }}>{warnCount} warnings</span>
            )}
            {criticalCount === 0 && warnCount === 0 && 'No critical issues'}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="card" style={{ marginBottom: 18, padding: '14px 18px' }}>
        <SeverityCounts alerts={alerts} />
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 16 }}>
        <Tabs
          tabs={TABS.map((t) => ({
            ...t,
            count:
              t.id === 'alerts' ? alerts.length
              : t.id === 'rules' ? MOCK_ALERT_RULES.filter(r => r.enabled).length
              : t.id === 'issues' ? 6
              : MOCK_TIMELINE.length,
          }))}
          active={activeTab}
          onChange={(id) => dispatch(setActiveTab(id))}
        />
      </div>

      {/* Alerts tab */}
      {activeTab === 'alerts' && (
        <div>
          {/* Severity filter */}
          <div className="flex items-center gap-8" style={{ marginBottom: 14 }}>
            <Filter size={13} style={{ color: 'var(--text3)' }} />
            <div className="flex gap-4">
              {SEV_FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`btn btn-xs ${sevFilter === f.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSevFilter(f.id)}
                >
                  {f.label}
                  {f.id !== 'all' && (
                    <span style={{ marginLeft: 4, opacity: 0.75 }}>
                      ({alerts.filter((a) => a.severity === f.id).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
              <span className="spinner" style={{ marginRight: 8 }} />
              Loading alerts…
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <AlertList
                alerts={filteredAlerts}
                expandedAlert={expandedAlert}
                onExpand={(id) => dispatch(setExpandedAlert(expandedAlert === id ? null : id))}
                onSnooze={handleSnooze}
              />
            </div>
          )}
        </div>
      )}

      {/* Alert Rules tab */}
      {activeTab === 'rules' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>{MOCK_ALERT_RULES.length} rules configured</span>
            <button className="btn btn-primary btn-sm" onClick={() => alert('Create Rule')}>+ Create Rule</button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Rule Name</th><th>Metric</th><th>Condition</th><th>Severity</th><th>Recipients</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {MOCK_ALERT_RULES.map((r) => (
                  <tr key={r.name}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)' }}>{r.metric}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{r.operator} {r.threshold}</td>
                    <td><span className={r.severity === 'critical' ? 'pill pill-red' : r.severity === 'warn' ? 'pill pill-amber' : 'pill pill-blue'}>{r.severity}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.recipients}</td>
                    <td><span className={r.enabled ? 'pill pill-green' : 'pill'}>{r.enabled ? 'Active' : 'Disabled'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-xs btn-ghost">Edit</button>
                        <button className="btn btn-xs btn-ghost">{r.enabled ? 'Disable' : 'Enable'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issues tab */}
      {activeTab === 'issues' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px' }}>
            <IssueList />
          </div>
        </div>
      )}

      {/* Timeline tab */}
      {activeTab === 'timeline' && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {MOCK_TIMELINE.map((event, idx) => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  paddingBottom: idx < MOCK_TIMELINE.length - 1 ? 20 : 0,
                  position: 'relative',
                }}
              >
                {/* Line */}
                {idx < MOCK_TIMELINE.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 7,
                      top: 18,
                      bottom: 0,
                      width: 1,
                      background: 'var(--border)',
                    }}
                  />
                )}

                {/* Dot */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: TIMELINE_ICON_COLOR[event.type],
                    flexShrink: 0,
                    marginTop: 2,
                    position: 'relative',
                    zIndex: 1,
                    opacity: 0.85,
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: TIMELINE_ICON_COLOR[event.type],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {TIMELINE_LABEL[event.type]}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                      {event.time}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 2 }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{event.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
