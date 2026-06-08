import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Key, Webhook, Code2, Store, Layout, Terminal, Plus, Star, RefreshCw } from 'lucide-react'

const TABS = ['Developer API', 'Webhooks', 'Embedded Analytics', 'Marketplace', 'Templates', 'Connector SDK']

// TODO: Replace with RTK Query for API usage metrics — see src/app/services/api.ts
const MOCK_API_KEYS = [
  { name: 'Production Key', key: 'fh_prod_sk_...a4f2', created: 'Jan 12, 2026', lastUsed: '2 min ago', calls: '892,441', status: 'active' },
  { name: 'Staging Key', key: 'fh_stg_sk_...b8c1', created: 'Mar 5, 2026', lastUsed: '1 hr ago', calls: '24,102', status: 'active' },
  { name: 'Dev Key', key: 'fh_dev_sk_...x9d3', created: 'Apr 1, 2026', lastUsed: 'Yesterday', calls: '1,204', status: 'active' },
]

const MOCK_API_ENDPOINTS = [
  { method: 'GET', path: '/v1/entities', desc: 'List all entity cards', auth: 'API Key', rateLimit: '1000/hr' },
  { method: 'POST', path: '/v1/query', desc: 'Natural language query', auth: 'API Key', rateLimit: '100/hr' },
  { method: 'GET', path: '/v1/alerts', desc: 'Get active alerts', auth: 'API Key', rateLimit: '1000/hr' },
  { method: 'POST', path: '/v1/tasks', desc: 'Create a task', auth: 'API Key', rateLimit: '500/hr' },
  { method: 'GET', path: '/v1/sources', desc: 'List data sources', auth: 'API Key', rateLimit: '1000/hr' },
]

// TODO: Replace with RTK Query for webhook management — see src/app/services/api.ts
const MOCK_WEBHOOKS = [
  { name: 'Slack #alerts', url: 'https://hooks.slack.com/...', events: ['alert.created', 'alert.critical'], status: 'active', lastDelivery: '5 min ago' },
  { name: 'PagerDuty', url: 'https://events.pagerduty.com/...', events: ['alert.critical'], status: 'active', lastDelivery: '2 hr ago' },
  { name: 'Custom CRM', url: 'https://api.company.com/...', events: ['entity.updated', 'task.completed'], status: 'inactive', lastDelivery: 'Never' },
]

const WEBHOOK_LOG = [
  { time: '5 min ago', webhook: 'Slack #alerts', event: 'alert.critical', status: 'success', statusCode: 200 },
  { time: '2 hr ago', webhook: 'PagerDuty', event: 'alert.critical', status: 'success', statusCode: 200 },
  { time: '3 hr ago', webhook: 'Slack #alerts', event: 'alert.created', status: 'success', statusCode: 200 },
  { time: '1 day ago', webhook: 'Custom CRM', event: 'entity.updated', status: 'failed', statusCode: 503 },
]

// TODO: Replace with RTK Query for marketplace catalog — see src/app/services/api.ts
const MOCK_MARKETPLACE = [
  { name: 'Snowflake Connector', category: 'Database', installs: '2.4K', rating: 4.8, installed: true, desc: 'Native Snowflake warehouse connector with CDC support' },
  { name: 'dbt Integration', category: 'Transformation', installs: '1.8K', rating: 4.9, installed: true, desc: 'Sync dbt models and lineage into Fulcrum Hub' },
  { name: 'Monte Carlo DQ', category: 'Quality', installs: '892', rating: 4.6, installed: false, desc: 'Import Monte Carlo data quality incidents' },
  { name: 'Slack Actions', category: 'Notifications', installs: '3.1K', rating: 4.7, installed: true, desc: 'Send alerts and actions to Slack channels' },
  { name: 'Tableau Sync', category: 'BI', installs: '1.2K', rating: 4.5, installed: false, desc: 'Sync Tableau workbooks to catalog lineage' },
  { name: 'Great Expectations', category: 'Quality', installs: '680', rating: 4.4, installed: false, desc: 'Import GE data validation results' },
]

// TODO: Replace with RTK Query for template catalog — see src/app/services/api.ts
const MOCK_TEMPLATES = [
  { name: 'Churn Analysis Pipeline', category: 'ML', uses: 234, desc: 'End-to-end churn prediction pipeline with feature engineering' },
  { name: 'Revenue Attribution', category: 'Analytics', uses: 189, desc: 'Multi-touch attribution model for revenue reporting' },
  { name: 'GDPR Compliance Scan', category: 'Governance', uses: 156, desc: 'Automated PII detection and data subject request handling' },
  { name: 'Federated Customer 360', category: 'Data', uses: 142, desc: 'Privacy-preserving customer profile across tenants' },
]

const CONNECTOR_SDK_CODE = `// TODO: This will link to live SDK documentation and connector registry
import { FulcrumConnector, ConnectorConfig, SyncResult } from '@fulcrum/sdk'

export class MyCustomConnector extends FulcrumConnector {
  name = 'my_connector'
  version = '1.0.0'

  async connect(config: ConnectorConfig): Promise<void> {
    // Initialize connection to your data source
    this.client = await initializeClient(config)
  }

  async sync(): Promise<SyncResult> {
    const records = await this.client.fetchAll()
    return {
      records,
      schema: this.inferSchema(records),
      metadata: { source: this.name, timestamp: new Date() }
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close()
  }
}`

function methodClass(method: string): string {
  switch (method) {
    case 'GET': return 'pill pill-green'
    case 'POST': return 'pill pill-blue'
    case 'PUT': return 'pill pill-amber'
    case 'DELETE': return 'pill pill-red'
    default: return 'pill'
  }
}

function categoryClass(category: string): string {
  const map: Record<string, string> = {
    ML: 'pill pill-purple',
    Analytics: 'pill pill-blue',
    Governance: 'pill pill-amber',
    Data: 'pill pill-cyan',
    Database: 'pill pill-cyan',
    Transformation: 'pill pill-green',
    Quality: 'pill pill-amber',
    Notifications: 'pill pill-blue',
    BI: 'pill pill-purple',
  }
  return map[category] ?? 'pill'
}

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

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState('Developer API')
  const [installedApps, setInstalledApps] = useState<Set<string>>(
    () => new Set(MOCK_MARKETPLACE.filter((m) => m.installed).map((m) => m.name)),
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Developer & Marketplace
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          API management, webhooks, embedded analytics, marketplace, and connector SDK
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
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

      {/* Developer API */}
      {activeTab === 'Developer API' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>
              <Key size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--orange)' }} />
              API Keys
            </div>
            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Key generated — copy it now!')}>
              <Plus size={13} /> Generate Key
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Total Calls</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_API_KEYS.map((k) => (
                  <tr key={k.name}>
                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{k.key}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{k.created}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{k.lastUsed}</td>
                    <td style={{ fontWeight: 600 }}>{k.calls}</td>
                    <td>
                      <span className={k.status === 'active' ? 'pill pill-green' : 'pill pill-red'} style={{ fontSize: '10px' }}>
                        {k.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-xs btn-ghost" onClick={() => showToast('Key revoked')}>Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
            <Terminal size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--cyan)' }} />
            API Reference
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Description</th>
                  <th>Auth</th>
                  <th>Rate Limit</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_API_ENDPOINTS.map((ep) => (
                  <tr key={ep.path}>
                    <td>
                      <span className={methodClass(ep.method)} style={{ fontSize: '10px', fontFamily: 'var(--mono)' }}>
                        {ep.method}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>{ep.path}</td>
                    <td style={{ color: 'var(--text2)' }}>{ep.desc}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{ep.auth}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{ep.rateLimit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Webhooks */}
      {activeTab === 'Webhooks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>
              <Webhook size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--orange)' }} />
              Webhook Endpoints
            </div>
            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Add webhook dialog coming soon')}>
              <Plus size={13} /> Add Webhook
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Events</th>
                  <th>Status</th>
                  <th>Last Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_WEBHOOKS.map((w) => (
                  <tr key={w.name}>
                    <td style={{ fontWeight: 600 }}>{w.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.url}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {w.events.map((ev) => (
                          <span key={ev} className="pill" style={{ fontSize: '10px', fontFamily: 'var(--mono)' }}>{ev}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={w.status === 'active' ? 'pill pill-green' : 'pill'} style={{ fontSize: '10px' }}>
                        {w.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{w.lastDelivery}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Retrying delivery…')}>
                          <RefreshCw size={10} /> Retry
                        </button>
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Webhook deleted')}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Delivery Log</div>
          <div className="card">
            {WEBHOOK_LOG.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: i < WEBHOOK_LOG.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 'var(--text-xs)' }}>
                <span className={log.status === 'success' ? 'pill pill-green' : 'pill pill-red'} style={{ fontSize: '10px' }}>{log.statusCode}</span>
                <span style={{ fontWeight: 600, flex: 1 }}>{log.webhook}</span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{log.event}</span>
                <span style={{ color: 'var(--text3)' }}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded Analytics */}
      {activeTab === 'Embedded Analytics' && (
        <div>
          {/* TODO: Replace with embed token generation API — see src/app/services/api.ts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                <Layout size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--cyan)' }} />
                Embed Code
              </div>
              <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', overflow: 'auto', marginBottom: 14, lineHeight: 1.6 }}>
                {`<iframe
  src="https://app.fulcrumhub.ai/embed/dashboard"
  data-token="fh_embed_token_abc123"
  data-theme="light"
  data-filters="tenant_id=my_tenant"
  width="100%"
  height="600"
  frameborder="0"
/>`}
              </pre>
              {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Embed token generated')}>
                <Key size={12} /> Generate Embed Token
              </button>
            </div>

            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                Configuration
              </div>
              {[
                { label: 'Theme', options: ['Light', 'Dark', 'System'], selected: 'Light' },
                { label: 'Filter Mode', options: ['Tenant-scoped', 'Full Access', 'Row-level'], selected: 'Tenant-scoped' },
              ].map((config) => (
                <div key={config.label} className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">{config.label}</label>
                  <select className="form-input">
                    {config.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Allowed Domains</label>
                <input className="form-input" defaultValue="app.company.com, dashboard.company.com" />
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => showToast('Config saved')}>Save Config</button>
            </div>
          </div>
        </div>
      )}

      {/* Marketplace */}
      {activeTab === 'Marketplace' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {MOCK_MARKETPLACE.map((app) => {
              const isInstalled = installedApps.has(app.name)
              return (
                <div key={app.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 4 }}>{app.name}</div>
                      <span className={categoryClass(app.category)} style={{ fontSize: '10px' }}>{app.category}</span>
                    </div>
                    {isInstalled && (
                      <span className="pill pill-green" style={{ fontSize: '10px', flexShrink: 0 }}>Installed</span>
                    )}
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', lineHeight: 1.5, flex: 1 }}>{app.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                      <Star size={10} style={{ display: 'inline', marginRight: 3, color: 'var(--amber)' }} />
                      {app.rating} · {app.installs} installs
                    </div>
                    {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                    <button
                      className={cn('btn btn-xs', isInstalled ? 'btn-ghost' : 'btn-primary')}
                      onClick={() => {
                        setInstalledApps((prev) => {
                          const next = new Set(prev)
                          if (isInstalled) next.delete(app.name)
                          else next.add(app.name)
                          return next
                        })
                        showToast(isInstalled ? `Uninstalled ${app.name}` : `Installed ${app.name}`)
                      }}
                    >
                      {isInstalled ? 'Uninstall' : 'Install'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Templates */}
      {activeTab === 'Templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {MOCK_TEMPLATES.map((t) => (
            <div key={t.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{t.name}</div>
                <span className={categoryClass(t.category)} style={{ fontSize: '10px', flexShrink: 0 }}>{t.category}</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', lineHeight: 1.5, flex: 1 }}>{t.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{t.uses} uses</span>
                {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                <button className="btn btn-xs btn-primary" onClick={() => showToast(`Template "${t.name}" applied`)}>
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connector SDK */}
      {activeTab === 'Connector SDK' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                <Code2 size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--orange)' }} />
                Connector Interface
              </div>
              <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', overflow: 'auto', lineHeight: 1.6, marginBottom: 14, whiteSpace: 'pre-wrap' }}>
                {CONNECTOR_SDK_CODE}
              </pre>
              <div style={{ display: 'flex', gap: 8 }}>
                {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Connector submitted for review')}>
                  Submit for Review
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Opening SDK docs…')}>
                  View Docs
                </button>
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                Development Guide
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { step: 1, title: 'Install SDK', desc: 'npm install @fulcrum/connector-sdk', done: true },
                  { step: 2, title: 'Implement Interface', desc: 'Extend FulcrumConnector with your logic', done: true },
                  { step: 3, title: 'Test Locally', desc: 'Run fulcrum test-connector ./my-connector', done: false },
                  { step: 4, title: 'Submit for Review', desc: 'Upload to marketplace for approval', done: false },
                  { step: 5, title: 'Publish', desc: 'Available in the Fulcrum Marketplace', done: false },
                ].map((s) => (
                  <div key={s.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: s.done ? 'var(--green)' : 'var(--bg3)',
                      border: s.done ? 'none' : '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: s.done ? '#fff' : 'var(--text3)',
                    }}>
                      {s.done ? '✓' : s.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text)' }}>{s.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
