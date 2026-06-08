import { useState } from 'react'
import { useGetMonitoringDataQuery, useGetAlertsQuery } from '@/app/services/api'
import ProgressBar from '@/components/common/ProgressBar'
import { Activity, Zap, Clock, AlertTriangle, CheckCircle2, Server } from 'lucide-react'
import Pill from '@/components/common/Pill'
import { cn } from '@/lib/utils'
import AlertsPage from '@/features/alerts/AlertsPage'

const TABS = ['Alerts', 'Drift Monitoring', 'Ground Truth', 'Retrain Triggers', 'System Health']

// TODO: Replace with RTK Query + WebSocket for real-time drift detection — see src/app/services/api.ts
const MOCK_DRIFT_DATA = [
  { model: 'churn_predictor', feature: 'days_since_login', baseline: 4.2, current: 8.1, psi: 0.42, status: 'drifted' },
  { model: 'churn_predictor', feature: 'mrr_growth_rate', baseline: 3.2, current: 2.8, psi: 0.08, status: 'stable' },
  { model: 'ltv_estimator', feature: 'avg_ticket_count', baseline: 2.1, current: 5.4, psi: 0.61, status: 'drifted' },
]

// TODO: Replace with ground truth collection pipeline API — see src/app/services/api.ts
const MOCK_GROUND_TRUTH = [
  { predictionId: 'pred-001', model: 'churn_predictor', predicted: 'High Risk', actual: 'Churned', correct: true, date: 'Apr 10, 2026' },
  { predictionId: 'pred-002', model: 'churn_predictor', predicted: 'Low Risk', actual: 'Retained', correct: true, date: 'Apr 11, 2026' },
  { predictionId: 'pred-003', model: 'churn_predictor', predicted: 'High Risk', actual: 'Retained', correct: false, date: 'Apr 12, 2026' },
  { predictionId: 'pred-004', model: 'ltv_estimator', predicted: '$48,200', actual: '$51,400', correct: true, date: 'Apr 13, 2026' },
  { predictionId: 'pred-005', model: 'support_classifier', predicted: 'bug', actual: 'billing', correct: false, date: 'Apr 14, 2026' },
]

// TODO: Replace with AutoML retraining scheduler API — see src/app/services/api.ts
const MOCK_TRIGGERS = [
  { model: 'churn_predictor', trigger: 'PSI > 0.2', status: 'fired', lastFired: '2 hr ago', action: 'Auto-retrain queued' },
  { model: 'ltv_estimator', trigger: 'Accuracy < 85%', status: 'monitoring', lastFired: 'Never', action: 'Notify Lisa Chen' },
  { model: 'support_classifier', trigger: 'Data drift detected', status: 'monitoring', lastFired: 'Apr 10', action: 'Alert + manual review' },
]

function showToast(msg: string) {
  const el = document.createElement('div')
  el.textContent = msg
  Object.assign(el.style, {
    position: 'fixed', bottom: '24px', right: '24px',
    background: 'var(--accent)', color: '#fff',
    padding: '10px 18px', borderRadius: '6px',
    fontSize: '13px', zIndex: '9999',
  })
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2800)
}

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('Alerts')
  const { data: monitoring, isLoading } = useGetMonitoringDataQuery()
  const { data: alerts = [] } = useGetAlertsQuery()

  if (isLoading || !monitoring) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
        <span className="spinner" style={{ marginRight: 8 }} />
        Loading monitoring data…
      </div>
    )
  }

  const maxVal = Math.max(...monitoring.chartData.map((d) => Math.max(d.value, d.secondary)))
  const accuracy = Math.round((MOCK_GROUND_TRUTH.filter((r) => r.correct).length / MOCK_GROUND_TRUTH.length) * 100)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Monitoring & MLOps
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          Alerts, model drift, ground truth collection, retrain triggers, and system health
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={cn('tab', activeTab === t && 'active')}
            onClick={() => setActiveTab(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Alerts tab */}
      {activeTab === 'Alerts' && <AlertsPage />}

      {/* Drift Monitoring */}
      {activeTab === 'Drift Monitoring' && (
        <div>
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Features Monitored', value: '12', color: 'var(--text)' },
              { label: 'Drifted', value: String(MOCK_DRIFT_DATA.filter((d) => d.status === 'drifted').length), color: 'var(--red)' },
              { label: 'Stable', value: String(MOCK_DRIFT_DATA.filter((d) => d.status === 'stable').length), color: 'var(--green)' },
              { label: 'Last Scan', value: '15 min ago', color: 'var(--text3)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Feature</th>
                  <th>Baseline</th>
                  <th>Current</th>
                  <th>PSI Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DRIFT_DATA.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{d.model}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{d.feature}</td>
                    <td style={{ color: 'var(--text2)' }}>{d.baseline}</td>
                    <td style={{ fontWeight: 600, color: d.status === 'drifted' ? 'var(--red)' : 'var(--green)' }}>{d.current}</td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ flex: 1, height: 6 }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(d.psi / 0.8 * 100, 100)}%`,
                              background: d.psi > 0.2 ? 'var(--red)' : 'var(--green)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: d.psi > 0.2 ? 'var(--red)' : 'var(--green)', minWidth: 30 }}>
                          {d.psi.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={d.status === 'drifted' ? 'pill pill-red' : 'pill pill-green'} style={{ fontSize: '10px' }}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ground Truth */}
      {activeTab === 'Ground Truth' && (
        <div>
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Total Predictions', value: String(MOCK_GROUND_TRUTH.length), color: 'var(--text)' },
              { label: 'Actuals Collected', value: String(MOCK_GROUND_TRUTH.length), color: 'var(--cyan)' },
              { label: 'Overall Accuracy', value: `${accuracy}%`, color: accuracy >= 80 ? 'var(--green)' : 'var(--amber)' },
              { label: 'Incorrect Predictions', value: String(MOCK_GROUND_TRUTH.filter((r) => !r.correct).length), color: 'var(--red)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prediction ID</th>
                  <th>Model</th>
                  <th>Predicted</th>
                  <th>Actual</th>
                  <th>Correct</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_GROUND_TRUTH.map((r) => (
                  <tr key={r.predictionId}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>{r.predictionId}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{r.model}</td>
                    <td style={{ fontWeight: 600 }}>{r.predicted}</td>
                    <td style={{ color: 'var(--text2)' }}>{r.actual}</td>
                    <td>
                      <span className={r.correct ? 'pill pill-green' : 'pill pill-red'} style={{ fontSize: '10px' }}>
                        {r.correct ? 'Correct' : 'Wrong'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Retrain Triggers */}
      {activeTab === 'Retrain Triggers' && (
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Trigger Condition</th>
                  <th>Status</th>
                  <th>Last Fired</th>
                  <th>Action on Trigger</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRIGGERS.map((t) => (
                  <tr key={`${t.model}-${t.trigger}`}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{t.model}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{t.trigger}</td>
                    <td>
                      <span className={t.status === 'fired' ? 'pill pill-red' : 'pill pill-green'} style={{ fontSize: '10px' }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{t.lastFired}</td>
                    <td style={{ color: 'var(--text2)' }}>{t.action}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Edit trigger coming soon')}>Edit</button>
                        <button className="btn btn-xs btn-primary" onClick={() => showToast(`Manual retrain started for ${t.model}`)}>Retrain Now</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Health */}
      {activeTab === 'System Health' && (
        <div>
          {/* TODO: Replace with infrastructure monitoring WebSocket (Prometheus/Grafana) — see src/app/services/api.ts */}

          {/* KPI row */}
          <div className="stat-grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: 'Uptime', value: monitoring.uptime, icon: CheckCircle2, color: 'var(--green)' },
              { label: 'Active Connections', value: String(monitoring.activeConnections), icon: Server, color: 'var(--cyan)' },
              { label: 'Avg Latency', value: monitoring.avgLatency, icon: Clock, color: 'var(--text)' },
              { label: 'Error Rate', value: monitoring.errorRate, icon: AlertTriangle, color: 'var(--amber)' },
            ].map((m) => (
              <div key={m.label} className="stat">
                <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <m.icon size={11} style={{ color: m.color }} />
                  {m.label}
                </div>
                <div className="stat-value" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* System metrics cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'API Latency P50', value: '12ms', color: 'var(--green)' },
              { label: 'API Latency P95', value: '48ms', color: 'var(--cyan)' },
              { label: 'API Latency P99', value: '124ms', color: 'var(--amber)' },
              { label: 'Throughput', value: '4.2K req/s', color: 'var(--cyan)' },
              { label: 'Error Rate', value: monitoring.errorRate, color: 'var(--amber)' },
              { label: 'Cache Hit Rate', value: '91.4%', color: 'var(--green)' },
            ].map((m) => (
              <div key={m.label} className="stat">
                <div className="stat-label">{m.label}</div>
                <div className="stat-value" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Chart + source health */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, marginBottom: 20 }}>
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 18 }}>
                Pipeline Throughput — Last 7 Days
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
                {monitoring.chartData.map((d) => (
                  <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 3, width: '100%', alignItems: 'flex-end', height: 110 }}>
                      <div style={{ flex: 1, background: 'var(--orange)', borderRadius: '3px 3px 0 0', height: `${(d.value / maxVal) * 100}%`, opacity: 0.85 }} />
                      <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: '3px 3px 0 0', height: `${(d.secondary / maxVal) * 100}%`, border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{d.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
                Source Health
              </div>
              {SOURCE_HEALTH_DATA.map((s) => (
                <div key={s.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{s.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: s.health >= 98 ? 'var(--green)' : 'var(--amber)' }}>
                      {s.health}%
                    </span>
                  </div>
                  <ProgressBar value={s.health} color={s.health >= 98 ? 'var(--green)' : s.health >= 90 ? 'var(--amber)' : 'var(--red)'} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
                <Zap size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--orange)' }} />
                Resource Utilization
              </div>
              {RESOURCE_METRICS.map((r) => (
                <div key={r.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                    <span>{r.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{r.value}%</span>
                  </div>
                  <ProgressBar value={r.value} color={r.value > 80 ? 'var(--amber)' : 'var(--cyan)'} />
                </div>
              ))}
            </div>
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
                <Activity size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--cyan)' }} />
                Pipeline Run Summary
              </div>
              {PIPELINE_SUMMARY.map((p) => (
                <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>{p.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: p.color }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SOURCE_HEALTH_DATA = [
  { name: 'Salesforce CRM', abbr: 'SF', bg: '#00A1E0', health: 99 },
  { name: 'PostgreSQL', abbr: 'PG', bg: '#336791', health: 97 },
  { name: 'Snowflake', abbr: 'SN', bg: '#29B5E8', health: 94 },
  { name: 'Stripe', abbr: 'ST', bg: '#635BFF', health: 100 },
  { name: 'Google BigQuery', abbr: 'BQ', bg: '#4285F4', health: 100 },
  { name: 'Zendesk', abbr: 'ZD', bg: '#03363D', health: 96 },
]

const RESOURCE_METRICS = [
  { label: 'CPU Usage', value: 34 },
  { label: 'Memory', value: 58 },
  { label: 'Storage I/O', value: 22 },
  { label: 'Network Throughput', value: 47 },
]

const PIPELINE_SUMMARY = [
  { label: 'Total Runs (Today)', value: '47', color: 'var(--text)' },
  { label: 'Successful', value: '44', color: 'var(--green)' },
  { label: 'Warnings', value: '2', color: 'var(--amber)' },
  { label: 'Failed', value: '1', color: 'var(--red)' },
  { label: 'Avg Duration', value: '1m 42s', color: 'var(--cyan)' },
  { label: 'Total Rows Processed', value: '3.4M', color: 'var(--text)' },
]
