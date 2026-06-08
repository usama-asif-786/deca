import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, RefreshCw, Database, Clock } from 'lucide-react'

const TABS = ['Feature Engineering', 'Online/Offline Store', 'Feature Drift', 'Feature Registry']

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_FEATURES = [
  { name: 'days_since_login', type: 'Numeric', source: 'Auth0', formula: 'DATEDIFF(NOW(), last_login)', status: 'active', usage: 4 },
  { name: 'avg_support_resolution_time', type: 'Numeric', source: 'Zendesk', formula: 'AVG(resolution_time) OVER 30d', status: 'active', usage: 2 },
  { name: 'mrr_growth_rate', type: 'Numeric', source: 'Stripe', formula: '(mrr_current - mrr_prev) / mrr_prev', status: 'active', usage: 6 },
  { name: 'customer_tier', type: 'Categorical', source: 'Salesforce', formula: 'CASE WHEN mrr > 50000 THEN "Enterprise"…', status: 'active', usage: 8 },
  { name: 'nps_bucket', type: 'Categorical', source: 'Intercom', formula: 'CASE WHEN nps >= 70 THEN "Promoter"…', status: 'draft', usage: 0 },
]

// TODO: Replace with RTK Query for drift detection results — see src/app/services/api.ts
const MOCK_DRIFT = [
  { feature: 'days_since_login', baseline: '4.2 days', current: '8.1 days', drift: 'high', psi: 0.42 },
  { feature: 'mrr_growth_rate', baseline: '3.2%', current: '2.8%', drift: 'low', psi: 0.08 },
  { feature: 'avg_support_resolution_time', baseline: '2.1 hr', current: '5.4 hr', drift: 'high', psi: 0.61 },
  { feature: 'customer_tier', baseline: '68% Ent', current: '65% Ent', drift: 'low', psi: 0.05 },
]

// TODO: Replace with RTK Query endpoint for feature registry — see src/app/services/api.ts
const MOCK_REGISTRY = [
  { name: 'days_since_login', version: 'v1.2', owner: 'Lisa Chen', lastModified: 'Apr 18, 2026', models: ['churn_predictor', 'ltv_estimator'] },
  { name: 'mrr_growth_rate', version: 'v2.0', owner: 'Raj Desai', lastModified: 'Apr 10, 2026', models: ['churn_predictor', 'revenue_forecaster', 'ltv_estimator'] },
  { name: 'avg_support_resolution_time', version: 'v1.0', owner: 'Tom Baker', lastModified: 'Mar 28, 2026', models: ['churn_predictor'] },
  { name: 'customer_tier', version: 'v3.1', owner: 'Lisa Chen', lastModified: 'Apr 5, 2026', models: ['churn_predictor', 'support_classifier', 'ltv_estimator', 'anomaly_detector'] },
  { name: 'nps_bucket', version: 'v0.1', owner: 'Lisa Chen', lastModified: 'Apr 19, 2026', models: [] },
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

export default function FeatureStorePage() {
  const [activeTab, setActiveTab] = useState('Feature Engineering')
  const [registrySearch, setRegistrySearch] = useState('')

  const filteredRegistry = MOCK_REGISTRY.filter((f) =>
    f.name.toLowerCase().includes(registrySearch.toLowerCase()),
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Feature Store
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          Engineering, serving, drift monitoring, and versioning for ML features
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

      {/* Feature Engineering */}
      {activeTab === 'Feature Engineering' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
            <button className="btn btn-primary btn-sm" onClick={() => showToast('New feature dialog coming soon')}>
              <Plus size={13} /> New Feature
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Formula</th>
                  <th>Status</th>
                  <th>Model Usage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FEATURES.map((f) => (
                  <tr key={f.name}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{f.name}</td>
                    <td>
                      <span className={f.type === 'Numeric' ? 'pill pill-blue' : 'pill pill-purple'} style={{ fontSize: '10px' }}>
                        {f.type}
                      </span>
                    </td>
                    <td>{f.source}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.formula}
                    </td>
                    <td>
                      <span className={f.status === 'active' ? 'pill pill-green' : 'pill'} style={{ fontSize: '10px' }}>
                        {f.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{f.usage} models</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Edit feature coming soon')}>Edit</button>
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Feature deployed')}>Deploy</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Online/Offline Store */}
      {activeTab === 'Online/Offline Store' && (
        <div>
          {/* TODO: Connect via WebSocket for real-time store metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Online Store */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Online Store</span>
                <span className="pill pill-green" style={{ fontSize: '10px', marginLeft: 'auto' }}>Live</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: 'Backend', value: 'Redis Cluster' },
                  { label: 'Entities', value: '48,291' },
                  { label: 'Last Write', value: '2 min ago' },
                  { label: 'Target Latency', value: '< 10ms' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}>
                    <span style={{ color: 'var(--text3)' }}>{s.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat">
                  <div className="stat-label">Reads/sec</div>
                  <div className="stat-value" style={{ color: 'var(--cyan)' }}>4,218</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Write Latency</div>
                  <div className="stat-value" style={{ color: 'var(--green)' }}>3ms</div>
                </div>
              </div>
            </div>

            {/* Offline Store */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Database size={14} style={{ color: 'var(--cyan)' }} />
                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Offline Store</span>
                <span className="pill" style={{ fontSize: '10px', marginLeft: 'auto' }}>Historical</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: 'Backend', value: 'Parquet / S3' },
                  { label: 'Total Rows', value: '892M' },
                  { label: 'Last Materialized', value: '1 hr ago' },
                  { label: 'Point-in-Time', value: 'Enabled' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}>
                    <span style={{ color: 'var(--text3)' }}>{s.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat">
                  <div className="stat-label">Partitions</div>
                  <div className="stat-value" style={{ color: 'var(--cyan)' }}>2,840</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Storage</div>
                  <div className="stat-value" style={{ color: 'var(--text)' }}>1.4 TB</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Materialization started…')}>
              <RefreshCw size={13} /> Materialize Now
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('Cache flushed')}>
              <Clock size={13} /> Flush Cache
            </button>
          </div>
        </div>
      )}

      {/* Feature Drift */}
      {activeTab === 'Feature Drift' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Feature Distribution Drift</div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
              PSI (Population Stability Index) — values above 0.2 indicate significant drift
            </p>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Baseline</th>
                  <th>Current</th>
                  <th>PSI Score</th>
                  <th>Drift Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DRIFT.map((d) => (
                  <tr key={d.feature}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{d.feature}</td>
                    <td style={{ color: 'var(--text2)' }}>{d.baseline}</td>
                    <td style={{ fontWeight: 600, color: d.drift === 'high' ? 'var(--red)' : 'var(--green)' }}>{d.current}</td>
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
                      <span className={d.drift === 'high' ? 'pill pill-red' : 'pill pill-green'} style={{ fontSize: '10px' }}>
                        {d.drift}
                      </span>
                    </td>
                    <td>
                      {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => showToast(`Retrain alert sent for ${d.feature}`)}
                      >
                        Retrain Alert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feature Registry */}
      {activeTab === 'Feature Registry' && (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <input
              className="search-input"
              style={{ maxWidth: 280 }}
              placeholder="Search features…"
              value={registrySearch}
              onChange={(e) => setRegistrySearch(e.target.value)}
            />
            <div style={{ marginLeft: 'auto' }}>
              {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Register feature dialog coming soon')}>
                <Plus size={13} /> Register Feature
              </button>
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Version</th>
                  <th>Owner</th>
                  <th>Last Modified</th>
                  <th>Dependent Models</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistry.map((f) => (
                  <tr key={f.name}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{f.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>{f.version}</td>
                    <td>{f.owner}</td>
                    <td style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>{f.lastModified}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {f.models.length === 0 ? (
                          <span style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>None</span>
                        ) : (
                          f.models.map((m) => (
                            <span key={m} className="pill" style={{ fontSize: '10px' }}>{m}</span>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Feature details coming soon')}>View</button>
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Deprecation scheduled')}>Deprecate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
