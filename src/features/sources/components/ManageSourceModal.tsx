import { useState, useEffect } from 'react'
import ModalWrapper from '@/components/common/ModalWrapper'
import { MOCK_TENANTS, MOCK_SYNC_HISTORY } from '@/lib/mockData'
import type { DataSource } from '@/lib/mockData'
import { CheckCircle } from 'lucide-react'

interface ManageSourceModalProps {
  open: boolean
  source: DataSource | null
  onClose: () => void
  onSaved: (updated: DataSource) => void
  onDisconnect: (id: string) => void
  onReconfigure: (source: DataSource) => void
}

const FREQ_OPTIONS = [
  { value: '15min', label: 'Every 15 minutes' },
  { value: '1hr', label: 'Every 1 hour' },
  { value: '6hr', label: 'Every 6 hours' },
  { value: '24hr', label: 'Daily' },
]

export default function ManageSourceModal({ open, source, onClose, onSaved, onDisconnect, onReconfigure }: ManageSourceModalProps) {
  const [tab, setTab] = useState<'settings' | 'connection' | 'history'>('settings')
  const [label, setLabel] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [freq, setFreq] = useState('1hr')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  useEffect(() => {
    if (open && source) {
      setTab('settings')
      setLabel(source.label ?? '')
      setTenantId(source.tenant ?? '')
      setFreq(source.syncFreq ?? '1hr')
      setTesting(false)
      setTestResult(null)
      setShowDisconnectConfirm(false)
    }
  }, [open, source])

  if (!source) return null

  const isDb = source.type === 'Database'
  const isSaaS = source.type.startsWith('SaaS')
  const isSheet = source.type === 'Spreadsheet'
  const isFile = source.type === 'File'
  const isApi = source.type === 'API'

  const syncHistory = MOCK_SYNC_HISTORY.filter((h) => h.source === source.name)
  const displayHistory = syncHistory.length > 0 ? syncHistory : MOCK_SYNC_HISTORY.slice(0, 4)

  function handleTestConnection() {
    setTesting(true)
    setTestResult(null)
    setTimeout(() => {
      setTesting(false)
      setTestResult('ok')
    }, 1500)
  }

  function handleSave() {
    const updated: DataSource = {
      ...source!,
      label: label || source!.label,
      tenant: tenantId || undefined,
      syncFreq: freq,
      nextSync: FREQ_OPTIONS.find((f) => f.value === freq)?.label.replace('Every ', '') ?? source!.nextSync,
    }
    onSaved(updated)
  }

  if (showDisconnectConfirm) {
    return (
      <ModalWrapper open={open} onClose={onClose} title="Disconnect Source" size="sm">
        <div style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>Disconnect {source.name}?</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 8 }}>This will:</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', lineHeight: 1.8, marginBottom: 16 }}>
          · Stop all scheduled syncs for {source.name}<br />
          · Remove stored credentials<br />
          · <strong>Not</strong> delete data already imported into Fulcrum<br />
          · You can reconnect anytime
        </div>
        <div style={{ background: 'var(--amber-bg, #fef3c7)', border: '1px solid var(--amber)', borderRadius: 'var(--radius)', padding: 12, fontSize: 'var(--text-xs)', color: 'var(--amber)', marginBottom: 16 }}>
          ⚠ Downstream pipelines depending on {source.name} data will continue using the last synced snapshot.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setShowDisconnectConfirm(false)}>Cancel</button>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }}
            onClick={() => { onDisconnect(source.id); onClose() }}
          >
            Disconnect {source.name}
          </button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title={`Manage — ${source.label || source.name}`} size="lg">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: source.bg, color: source.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 600, flexShrink: 0 }}>
          {source.abbr}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text)' }}>
            {source.name}{source.label ? <span style={{ fontWeight: 400, color: 'var(--text2)' }}> — {source.label}</span> : null}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{source.type} · Connected</div>
        </div>
        <span className="pill pill-green" style={{ padding: '6px 14px' }}>✓ Connected</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Rows', value: source.rows?.toLocaleString() ?? '—' },
          { label: 'Health', value: `${source.health ?? 99}%`, color: (source.health ?? 99) >= 99 ? 'var(--green)' : 'var(--amber)' },
          { label: 'Last Sync', value: source.lastSync ?? '—' },
          { label: 'Next Sync', value: source.nextSync ?? '—', color: source.nextSync === 'Overdue' ? 'var(--amber)' : undefined },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 'var(--text-base)', color: s.color ?? 'var(--text)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Inner tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {(['settings', 'connection', 'history'] as const).map((t) => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)} type="button">
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Settings tab */}
      {tab === 'settings' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="form-label">Instance Label</label>
              <input className="form-input" style={{ width: '100%' }} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. prod-crm" />
            </div>
            <div>
              <label className="form-label">Sync Frequency</label>
              <select className="form-input" style={{ width: '100%' }} value={freq} onChange={(e) => setFreq(e.target.value)}>
                {FREQ_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Data Tenant <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(optional — leave empty for platform-wide connector)</span></label>
            <select className="form-input" style={{ width: '100%', maxWidth: 400 }} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
              <option value="">◆ Platform (shared across all tenants)</option>
              {MOCK_TENANTS.filter((t) => t.status === 'active' || t.status === 'trial').map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {t.industry}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="form-label">Sync Mode</label>
              <select className="form-input" style={{ width: '100%' }}><option>Incremental</option><option>Full Refresh</option></select>
            </div>
            {isDb && (
              <div>
                <label className="form-label">Schema Filter</label>
                <input className="form-input" style={{ width: '100%' }} defaultValue="public" />
              </div>
            )}
            {isSaaS && (
              <div>
                <label className="form-label">Environment</label>
                <select className="form-input" style={{ width: '100%' }}><option>Production</option><option>Sandbox</option></select>
              </div>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text2)', cursor: 'pointer', marginBottom: 6 }}>
            <input type="checkbox" defaultChecked /> Auto-detect schema changes
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text2)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked /> Send alerts on sync failure
          </label>
        </div>
      )}

      {/* Connection tab */}
      {tab === 'connection' && (
        <div>
          {isDb && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Host</label><input className="form-input" style={{ width: '100%' }} defaultValue="db.acmecorp.com" /></div>
                <div><label className="form-label">Port</label><input className="form-input" style={{ width: '100%' }} defaultValue={source.name === 'PostgreSQL' ? '5432' : '3306'} /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label className="form-label">Database</label><input className="form-input" style={{ width: '100%' }} defaultValue="production" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Username</label><input className="form-input" style={{ width: '100%' }} defaultValue="fulcrum_readonly" /></div>
                <div><label className="form-label">Password</label><input className="form-input" type="password" style={{ width: '100%' }} defaultValue="••••••••" /></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">SSL Mode</label>
                <select className="form-input" style={{ width: '100%', maxWidth: 200 }}><option>Require</option><option>Verify Full</option><option>Prefer</option><option>Disable</option></select>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 10, fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 12 }}>
                <strong>Connection string:</strong><br />
                <code>{`${source.name === 'PostgreSQL' ? 'postgresql' : 'mysql'}://fulcrum_readonly:***@db.acmecorp.com:${source.name === 'PostgreSQL' ? '5432' : '3306'}/production?sslmode=require`}</code>
              </div>
            </>
          )}
          {(isSaaS || isSheet) && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ padding: 16, background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--green)', fontWeight: 500, marginBottom: 4 }}>
                  <CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                  OAuth Token Active
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>Account: admin@acmecorp.com</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 4 }}>Token expires: Dec 2026 · Auto-refresh enabled</div>
              </div>
              <button className="btn btn-sm btn-ghost">Re-authorize</button>
            </div>
          )}
          {isFile && (
            <div style={{ padding: 16, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>📄</span>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>data_export.csv</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Uploaded · 2.4 MB · {(source.rows ?? 4200).toLocaleString()} rows</div>
                </div>
              </div>
              <button className="btn btn-sm btn-primary">Upload New Version</button>
            </div>
          )}
          {isApi && (
            <>
              <div style={{ marginBottom: 12 }}><label className="form-label">Base URL</label><input className="form-input" style={{ width: '100%' }} defaultValue="https://api.example.com/v1/data" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Method</label><select className="form-input" style={{ width: '100%' }}><option>GET</option><option>POST</option></select></div>
                <div><label className="form-label">Auth</label><select className="form-input" style={{ width: '100%' }}><option>API Key</option><option>Bearer</option><option>Basic</option></select></div>
              </div>
              <div style={{ marginBottom: 12 }}><label className="form-label">API Key</label><input className="form-input" type="password" style={{ width: '100%' }} defaultValue="sk_live_mock_1234" /></div>
            </>
          )}
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-sm btn-ghost" onClick={handleTestConnection} disabled={testing}>
              {testing ? <><span className="spinner" style={{ width: 12, height: 12, display: 'inline-block', marginRight: 6 }} />Testing…</> : '⚡ Test Connection'}
            </button>
            {testResult === 'ok' && (
              <span style={{ marginLeft: 12, color: 'var(--green)', fontSize: 'var(--text-sm)' }}>✓ Connection OK <span style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>(48ms)</span></span>
            )}
          </div>
        </div>
      )}

      {/* Sync History tab */}
      {tab === 'history' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Time</th><th>Rows</th><th>Duration</th><th>Status</th></tr>
            </thead>
            <tbody>
              {displayHistory.map((h, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{h.time}</td>
                  <td>{h.rows}</td>
                  <td>{h.duration}</td>
                  <td><span className={`pill pill-${h.status === 'ok' ? 'green' : 'amber'}`}>{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-sm btn-ghost"
            style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={() => setShowDisconnectConfirm(true)}
          >
            Disconnect
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => { onClose(); onReconfigure(source) }}>
            Reconfigure
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </ModalWrapper>
  )
}
