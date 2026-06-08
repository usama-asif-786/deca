import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Search, Eye, Lock, ShieldAlert } from 'lucide-react'

const TABS = ['Data Catalog', 'Lineage Graph', 'PII Detection']

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_CATALOG = [
  { name: 'customers', schema: 'crm', connector: 'Salesforce', columns: 24, rows: '48,291', lastUpdated: '5 min ago', owner: 'Raj Desai', tags: ['pii', 'core'] },
  { name: 'transactions', schema: 'billing', connector: 'Stripe', columns: 12, rows: '892,441', lastUpdated: '1 hr ago', owner: 'Raj Desai', tags: ['financial'] },
  { name: 'support_tickets', schema: 'support', connector: 'Zendesk', columns: 18, rows: '24,102', lastUpdated: '2 hr ago', owner: 'Tom Baker', tags: ['pii'] },
  { name: 'employees', schema: 'hr', connector: 'Rippling', columns: 31, rows: '247', lastUpdated: '6 hr ago', owner: 'Sarah Kim', tags: ['pii', 'sensitive'] },
  { name: 'campaigns', schema: 'marketing', connector: 'HubSpot', columns: 15, rows: '1,204', lastUpdated: '30 min ago', owner: 'Mike Johnson', tags: ['marketing'] },
  { name: 'feature_store_v2', schema: 'ml', connector: 'Internal', columns: 44, rows: '48,291', lastUpdated: '1 hr ago', owner: 'Lisa Chen', tags: ['ml', 'features'] },
]

// TODO: Replace with RTK Query endpoint for PII scan results — see src/app/services/api.ts
const MOCK_PII = [
  { table: 'customers', field: 'email', type: 'Email', confidence: 99, encrypted: true, masked: true },
  { table: 'customers', field: 'phone', type: 'Phone', confidence: 97, encrypted: true, masked: false },
  { table: 'employees', field: 'ssn', type: 'SSN', confidence: 99, encrypted: true, masked: true },
  { table: 'employees', field: 'salary', type: 'Financial', confidence: 95, encrypted: true, masked: true },
  { table: 'support_tickets', field: 'customer_name', type: 'Name', confidence: 88, encrypted: false, masked: false },
  { table: 'support_tickets', field: 'ip_address', type: 'IP Address', confidence: 94, encrypted: false, masked: false },
]

const TAG_CLASS: Record<string, string> = {
  pii: 'pill pill-red',
  sensitive: 'pill pill-red',
  financial: 'pill pill-amber',
  core: 'pill pill-blue',
  ml: 'pill pill-purple',
  features: 'pill pill-purple',
  marketing: 'pill pill-green',
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

// Lineage node types
const LINEAGE_LAYERS = [
  {
    label: 'Sources',
    nodes: ['Salesforce', 'Stripe', 'Zendesk'],
    color: 'var(--cyan-bg)',
    textColor: 'var(--cyan)',
  },
  {
    label: 'Transformations',
    nodes: ['normalize_id', 'enrich_customer', 'calculate_health'],
    color: 'var(--amber-bg)',
    textColor: 'var(--amber)',
  },
  {
    label: 'Datasets',
    nodes: ['customer_360', 'revenue_attribution'],
    color: 'var(--green-bg)',
    textColor: 'var(--green)',
  },
  {
    label: 'Consumers',
    nodes: ['BI Dashboard', 'Churn Model', 'API'],
    color: 'var(--purple-bg)',
    textColor: 'var(--purple)',
  },
]

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState('Data Catalog')
  const [search, setSearch] = useState('')

  const filteredCatalog = MOCK_CATALOG.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.schema.toLowerCase().includes(search.toLowerCase()) ||
      c.connector.toLowerCase().includes(search.toLowerCase()),
  )

  const totalPii = MOCK_PII.length
  const encrypted = MOCK_PII.filter((p) => p.encrypted).length
  const unmasked = MOCK_PII.filter((p) => !p.masked).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Catalog & Lineage
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          {MOCK_CATALOG.length} datasets · field-level lineage · PII detection
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

      {/* Data Catalog */}
      {activeTab === 'Data Catalog' && (
        <div>
          <div style={{ position: 'relative', maxWidth: 360, marginBottom: 14 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input
              className="search-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search catalog…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Schema</th>
                  <th>Connector</th>
                  <th>Columns</th>
                  <th>Rows</th>
                  <th>Last Updated</th>
                  <th>Owner</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCatalog.map((c) => (
                  <tr key={c.name}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>{c.schema}</td>
                    <td>{c.connector}</td>
                    <td>{c.columns}</td>
                    <td style={{ color: 'var(--text2)' }}>{c.rows}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{c.lastUpdated}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{c.owner}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {c.tags.map((tag) => (
                          <span key={tag} className={TAG_CLASS[tag] ?? 'pill'} style={{ fontSize: '10px' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-xs btn-ghost" onClick={() => showToast('Lineage graph loading…')}>
                        <Eye size={11} /> View Lineage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lineage Graph */}
      {activeTab === 'Lineage Graph' && (
        <div className="card">
          {/* TODO: Replace with real D3/ReactFlow lineage graph using lineage API */}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 16, fontStyle: 'italic' }}>
            TODO: Replace with real D3/ReactFlow lineage graph using lineage API
          </div>
          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', overflowX: 'auto' }}>
            {LINEAGE_LAYERS.map((layer, li) => (
              <div key={layer.label} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, textAlign: 'center', paddingLeft: 8, paddingRight: 8 }}>
                    {layer.label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, paddingRight: 8 }}>
                    {layer.nodes.map((node) => (
                      <div
                        key={node}
                        style={{
                          background: layer.color,
                          color: layer.textColor,
                          padding: '8px 14px',
                          borderRadius: 'var(--radius)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          border: `1px solid ${layer.textColor}33`,
                          whiteSpace: 'nowrap',
                          minWidth: 120,
                          textAlign: 'center',
                        }}
                      >
                        {node}
                      </div>
                    ))}
                  </div>
                </div>
                {li < LINEAGE_LAYERS.length - 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 4px', flexShrink: 0 }}>
                    <div style={{ color: 'var(--text3)', fontSize: 18, lineHeight: 1 }}>→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
            <strong>Note:</strong> This is a static preview. Connect the lineage API to render a fully interactive DAG with field-level tracking.
          </div>
        </div>
      )}

      {/* PII Detection */}
      {activeTab === 'PII Detection' && (
        <div>
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Total PII Fields', value: String(totalPii), color: 'var(--text)', icon: ShieldAlert },
              { label: 'Encrypted', value: String(encrypted), color: 'var(--green)', icon: Lock },
              { label: 'Unmasked Risk', value: String(unmasked), color: 'var(--red)', icon: ShieldAlert },
              { label: 'Tables Scanned', value: '6', color: 'var(--cyan)', icon: Eye },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <s.icon size={11} style={{ color: s.color }} />
                  {s.label}
                </div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Field</th>
                  <th>PII Type</th>
                  <th>Confidence</th>
                  <th>Encrypted</th>
                  <th>Masked</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PII.map((p) => (
                  <tr key={`${p.table}.${p.field}`}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{p.table}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{p.field}</td>
                    <td>
                      <span className="pill pill-purple" style={{ fontSize: '10px' }}>{p.type}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ flex: 1, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${p.confidence}%`, background: p.confidence >= 95 ? 'var(--red)' : 'var(--amber)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 28 }}>{p.confidence}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={p.encrypted ? 'pill pill-green' : 'pill pill-red'} style={{ fontSize: '10px' }}>
                        {p.encrypted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={p.masked ? 'pill pill-green' : 'pill pill-red'} style={{ fontSize: '10px' }}>
                        {p.masked ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                        {!p.masked && <button className="btn btn-xs btn-primary" onClick={() => showToast(`Masking ${p.field}…`)}>Mask</button>}
                        {!p.encrypted && <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Encrypting ${p.field}…`)}>Encrypt</button>}
                        {p.masked && p.encrypted && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)' }}>Compliant</span>}
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
