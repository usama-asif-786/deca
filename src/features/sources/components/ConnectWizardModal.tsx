import { useState, useEffect } from 'react'
import ModalWrapper from '@/components/common/ModalWrapper'
import { MOCK_TENANTS } from '@/lib/mockData'
import type { DataSource } from '@/lib/mockData'
import { Check } from 'lucide-react'

interface DiscoveredTable { name: string; rows: string; cols: number; selected: boolean }

interface ConnectWizardModalProps {
  open: boolean
  source: DataSource | null
  onClose: () => void
  onConnected: (updated: DataSource) => void
}

const FREQ_LABELS: Record<string, string> = {
  '15min': 'Every 15 minutes',
  '1hr': 'Every 1 hour',
  '6hr': 'Every 6 hours',
  '24hr': 'Daily',
}

const SAMPLE_TABLES: Record<string, DiscoveredTable[]> = {
  Database: [
    { name: 'customers', rows: '142,580', cols: 14, selected: true },
    { name: 'orders', rows: '892,400', cols: 18, selected: true },
    { name: 'products', rows: '4,200', cols: 10, selected: true },
    { name: 'invoices', rows: '54,200', cols: 12, selected: false },
    { name: 'users', rows: '8,900', cols: 9, selected: true },
    { name: 'audit_log', rows: '2,100,000', cols: 7, selected: false },
  ],
  'Data Warehouse': [
    { name: 'fact_sales', rows: '4,200,000', cols: 22, selected: true },
    { name: 'dim_customer', rows: '142,000', cols: 18, selected: true },
    { name: 'dim_product', rows: '8,400', cols: 12, selected: true },
    { name: 'dim_date', rows: '3,650', cols: 8, selected: false },
    { name: 'mart_revenue', rows: '840,000', cols: 16, selected: true },
  ],
  default: [
    { name: 'contacts', rows: '34,200', cols: 12, selected: true },
    { name: 'deals', rows: '8,400', cols: 16, selected: true },
    { name: 'activities', rows: '186,900', cols: 9, selected: false },
  ],
}

function getTables(type: string): DiscoveredTable[] {
  const tmpl = SAMPLE_TABLES[type] ?? SAMPLE_TABLES.default
  return tmpl.map((t) => ({ ...t }))
}

export default function ConnectWizardModal({ open, source, onClose, onConnected }: ConnectWizardModalProps) {
  const [step, setStep] = useState(1)
  const [oauthDone, setOauthDone] = useState(false)
  const [fileReady, setFileReady] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testDone, setTestDone] = useState(false)
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [tables, setTables] = useState<DiscoveredTable[]>([])
  const [freq, setFreq] = useState('1hr')
  const [displayName, setDisplayName] = useState('')
  const [tenantId, setTenantId] = useState('')

  useEffect(() => {
    if (open && source) {
      setStep(1)
      setOauthDone(false)
      setFileReady(false)
      setTesting(false)
      setTestDone(false)
      setCheckedItems([])
      setTables(getTables(source.type))
      setFreq(source.syncFreq ?? '1hr')
      setDisplayName(source.label ?? source.name + ' - Production')
      setTenantId(source.tenant ?? '')
    }
  }, [open, source])

  if (!source) return null

  const isDb = source.type === 'Database'
  const isSaaS = source.type.startsWith('SaaS')
  const isSheet = source.type === 'Spreadsheet'
  const isFile = source.type === 'File'
  const isApi = source.type === 'API'

  const totalSteps = isFile ? 3 : 4
  const stepNames = isFile
    ? ['Upload File', 'Configure', 'Sync & Finish']
    : isSaaS || isSheet
    ? ['Authorize', 'Verify & Discover', 'Select Data', 'Sync & Finish']
    : ['Credentials', 'Test & Discover', 'Select Data', 'Sync & Finish']

  function canAdvanceStep1() {
    if (isSaaS || isSheet) return oauthDone
    if (isFile) return fileReady
    return true
  }

  function canAdvanceStep2() {
    return testDone
  }

  function handleNext() {
    if (step < totalSteps) setStep(step + 1)
    if (step === 1 && (isFile ? fileReady : true)) {
      // step 2 = test, kick off simulation
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  function startTest() {
    setTesting(true)
    setCheckedItems([])
    const checks = isFile
      ? ['Parsing file', 'Detecting columns', 'Validating data types', 'Building preview']
      : ['Resolving host', 'Authenticating', 'Checking permissions', 'Discovering schema', 'Counting rows']
    let i = 0
    const interval = setInterval(() => {
      i++
      setCheckedItems(checks.slice(0, i))
      if (i >= checks.length) {
        clearInterval(interval)
        setTesting(false)
        setTestDone(true)
        setTables(getTables(source!.type))
      }
    }, 500)
  }

  function toggleTable(idx: number) {
    setTables((prev) => prev.map((t, i) => i === idx ? { ...t, selected: !t.selected } : t))
  }

  function handleFinish() {
    const selectedTables = tables.filter((t) => t.selected)
    const totalRows = selectedTables.reduce((acc, t) => acc + parseInt(t.rows.replace(/,/g, '')) || 0, 0)
    const connected: DataSource = {
      ...source!,
      connected: true,
      label: displayName !== source!.name + ' - Production' ? displayName : source!.label,
      tenant: tenantId || undefined,
      syncFreq: freq,
      rows: totalRows || 142580,
      lastSync: 'Just now',
      nextSync: FREQ_LABELS[freq]?.replace('Every ', '') ?? '1 hr',
      health: 99,
    }
    onConnected(connected)
  }

  const allChecks = isFile
    ? ['Parsing file', 'Detecting columns', 'Validating data types', 'Building preview']
    : ['Resolving host', 'Authenticating', 'Checking permissions', 'Discovering schema', 'Counting rows']

  const tenant = MOCK_TENANTS.find((t) => t.id === tenantId)

  return (
    <ModalWrapper open={open} onClose={onClose} title={`Connect ${source.name}`} size="lg">
      {/* Source header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: source.bg, color: source.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 600, flexShrink: 0 }}>
          {source.abbr}
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text)' }}>{source.name}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{source.type}</div>
        </div>
      </div>

      {/* Tenant picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', whiteSpace: 'nowrap' }}>Tenant:</span>
        <select
          className="form-input"
          style={{ flex: 1, fontSize: 'var(--text-xs)', padding: '4px 8px' }}
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
        >
          <option value="">◆ Platform (shared across tenants)</option>
          {MOCK_TENANTS.filter((t) => t.status === 'active' || t.status === 'trial').map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        {tenantId && tenant && (
          <span style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: tenant.color }} />
            {tenant.name}
          </span>
        )}
        {!tenantId && (
          <span className="pill pill-cyan" style={{ fontSize: 10, whiteSpace: 'nowrap' }}>Available to all tenants</span>
        )}
      </div>

      {/* Step bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {stepNames.map((name, i) => {
          const si = i + 1
          const done = si < step
          const active = si === step
          return (
            <div key={name} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 2, background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg4)', marginBottom: 6 }} />
              <div style={{ fontSize: 'var(--text-xs)', color: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--text3)', fontWeight: active ? 600 : 400 }}>{name}</div>
            </div>
          )
        })}
      </div>

      {/* Step 1: Credentials / Auth */}
      {step === 1 && (
        <div>
          {isDb && (
            <>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16, fontSize: 'var(--text-xs)', color: 'var(--text2)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>🗄 Database Credentials</strong><br />
                We recommend a dedicated <code>fulcrum_readonly</code> user with SELECT-only permissions.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div><label className="form-label">Host / Endpoint</label><input className="form-input" style={{ width: '100%' }} placeholder="db.company.com" defaultValue="db.acmecorp.com" /></div>
                <div><label className="form-label">Port</label><input className="form-input" style={{ width: '100%' }} defaultValue={source.name === 'PostgreSQL' ? '5432' : '3306'} /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label className="form-label">Database Name</label><input className="form-input" style={{ width: '100%' }} defaultValue="production" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="form-label">Username</label><input className="form-input" style={{ width: '100%' }} defaultValue="fulcrum_readonly" /></div>
                <div><label className="form-label">Password</label><input className="form-input" type="password" style={{ width: '100%' }} defaultValue="••••••••" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">SSL Mode</label>
                  <select className="form-input" style={{ width: '100%' }}><option>Require (recommended)</option><option>Verify Full</option><option>Prefer</option><option>Disable</option></select>
                </div>
                <div><label className="form-label">SSH Tunnel</label>
                  <select className="form-input" style={{ width: '100%' }}><option>None</option><option>SSH Bastion</option></select>
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 10, fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                <strong>Connection string preview:</strong><br />
                <code>{`${source.name === 'PostgreSQL' ? 'postgresql' : 'mysql'}://fulcrum_readonly:***@db.acmecorp.com:${source.name === 'PostgreSQL' ? '5432' : '3306'}/production`}</code>
              </div>
            </>
          )}

          {(isSaaS || isSheet) && (
            <>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16, fontSize: 'var(--text-xs)', color: 'var(--text2)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>{isSheet ? '📄 Google Sheets' : '🔗 OAuth 2.0 Authorization'}</strong><br />
                {isSheet ? 'Sign in with your Google account. We only request read-only access to Sheets & Drive.' : `Click below to sign in to your ${source.name} account. Fulcrum requests read-only access only.`}
              </div>
              <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 16 }}>
                {!oauthDone ? (
                  <>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{isSheet ? '📝' : source.name === 'Salesforce' ? '☁' : '🏦'}</div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginBottom: 12 }}
                      onClick={() => {
                        setTimeout(() => setOauthDone(true), 1200)
                      }}
                    >
                      🔒 {isSheet ? 'Sign in with Google' : `Authorize with ${source.name}`}
                    </button>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Opens {source.name} login in a new window</div>
                  </>
                ) : (
                  <div style={{ padding: 12, background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', color: 'var(--green)', fontSize: 'var(--text-sm)' }}>
                    ✓ Authorized — {source.name} account linked<br />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>Account: admin@acmecorp.com · Org: Acme Corp</span>
                  </div>
                )}
              </div>
              {!isSheet && (
                <div style={{ marginBottom: 12 }}>
                  <label className="form-label">Environment</label>
                  <select className="form-input" style={{ width: '100%', maxWidth: 200 }}><option>Production</option><option>Sandbox</option></select>
                </div>
              )}
            </>
          )}

          {isFile && (
            <>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16, fontSize: 'var(--text-xs)', color: 'var(--text2)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>📁 File Upload</strong><br />
                Supports .csv, .xlsx, .json, .tsv up to 100MB. We auto-detect delimiters, encoding, and column types.
              </div>
              {!fileReady ? (
                <div
                  style={{ textAlign: 'center', padding: 40, border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 16, cursor: 'pointer' }}
                  onClick={() => setTimeout(() => setFileReady(true), 800)}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 4 }}>Drag & drop files here</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>or click to browse</div>
                </div>
              ) : (
                <div style={{ padding: 16, border: '1px solid var(--green)', borderRadius: 'var(--radius-lg)', marginBottom: 16, background: 'var(--green-bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--green)' }}>data_export.csv</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>2.4 MB · 4,200 rows · 12 columns · UTF-8</div>
                    </div>
                    <span className="pill pill-green">Ready</span>
                  </div>
                </div>
              )}
            </>
          )}

          {isApi && (
            <>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16, fontSize: 'var(--text-xs)', color: 'var(--text2)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>🔌 REST API</strong><br />
                Fulcrum polls your API on schedule, parses JSON, and flattens nested objects into tables.
              </div>
              <div style={{ marginBottom: 12 }}><label className="form-label">Base URL</label><input className="form-input" style={{ width: '100%' }} defaultValue="https://api.example.com/v1/data" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Method</label><select className="form-input" style={{ width: '100%' }}><option>GET</option><option>POST</option></select></div>
                <div><label className="form-label">Auth Type</label><select className="form-input" style={{ width: '100%' }}><option>API Key</option><option>Bearer Token</option><option>Basic Auth</option><option>None</option></select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Header Name</label><input className="form-input" style={{ width: '100%' }} defaultValue="X-API-Key" /></div>
                <div><label className="form-label">Key Value</label><input className="form-input" type="password" style={{ width: '100%' }} defaultValue="sk_live_mock_1234" /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label className="form-label">Response JSONPath</label><input className="form-input" style={{ width: '100%' }} defaultValue="$.data" /></div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Test & Discover */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 16 }}>Testing Connection & Discovering Schema</div>
          {!testing && !testDone && (
            <button className="btn btn-primary btn-sm" onClick={startTest}>
              ⚡ Run Connection Test
            </button>
          )}
          {(testing || testDone) && allChecks.map((label, i) => {
            const done = i < checkedItems.length
            const active = i === checkedItems.length && testing
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done ? <Check size={14} color="var(--green)" /> : active ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--bg4)', display: 'inline-block' }} />}
                </div>
                <span style={{ fontSize: 'var(--text-sm)', color: done ? 'var(--text2)' : 'var(--text3)' }}>{label}{active ? '…' : ''}</span>
              </div>
            )
          })}
          {testDone && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', color: 'var(--green)' }}>
              ✓ Connection successful · {tables.length} tables discovered
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Tables (skip for File) */}
      {step === 3 && !isFile && (
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 4 }}>Select Tables to Sync</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 12 }}>{tables.length} tables discovered. Uncheck any you don't need.</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button className="btn btn-xs btn-ghost" onClick={() => setTables((p) => p.map((t) => ({ ...t, selected: true })))}>Select All</button>
            <button className="btn btn-xs btn-ghost" onClick={() => setTables((p) => p.map((t) => ({ ...t, selected: false })))}>Deselect All</button>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            {tables.map((t, i) => (
              <label key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: i < tables.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                <input type="checkbox" checked={t.selected} onChange={() => toggleTable(i)} />
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text2)', minWidth: 160 }}>{t.name}</span>
                <span style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>{t.rows} rows · {t.cols} columns</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Final step: Sync Config */}
      {(step === totalSteps) && (
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 16 }}>Configure Sync & Connect</div>
          {tables.filter((t) => t.selected).length > 0 && (
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16, fontSize: 'var(--text-sm)', color: 'var(--green)' }}>
              ✓ {tables.filter((t) => t.selected).length} tables selected for sync
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="form-label">Sync Frequency</label>
              <select className="form-input" style={{ width: '100%' }} value={freq} onChange={(e) => setFreq(e.target.value)}>
                {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Sync Mode</label>
              <select className="form-input" style={{ width: '100%' }}><option>Incremental (recommended)</option><option>Full refresh</option></select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Display Name (optional)</label>
            <input className="form-input" style={{ width: '100%' }} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text2)', cursor: 'pointer', marginBottom: 6 }}>
            <input type="checkbox" defaultChecked /> Start first sync immediately after connecting
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text2)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked /> Send notification when first sync completes
          </label>
          <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 12, marginTop: 16, fontSize: 'var(--text-xs)', color: 'var(--text3)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>What happens next:</strong><br />
            1. Fulcrum connects to {source.name} using your credentials<br />
            2. First sync begins importing {tables.filter((t) => t.selected).length} tables<br />
            3. Data flows into the Scan → Map → Pipeline workflow<br />
            4. You'll get a notification when sync finishes
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
        {step === 1 ? (
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        ) : (
          <button className="btn btn-ghost" onClick={handleBack}>← Back</button>
        )}
        {step < totalSteps ? (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={
              (step === 1 && !canAdvanceStep1()) ||
              (step === 2 && !canAdvanceStep2())
            }
          >
            Next →
          </button>
        ) : (
          <button className="btn btn-primary" style={{ background: 'var(--green)', borderColor: 'var(--green)' }} onClick={handleFinish}>
            ✓ Connect & Start Sync
          </button>
        )}
      </div>
    </ModalWrapper>
  )
}
