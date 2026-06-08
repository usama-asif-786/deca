import { useState, useEffect } from 'react'
import { useGetSourcesQuery } from '@/app/services/api'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setView, setSearch, setTypeFilter, setTenantFilter, setPage } from './sourcesSlice'
import { MOCK_TENANTS } from '@/lib/mockData'
import type { DataSource, ConnectorCatalogItem } from '@/lib/mockData'
import SourceTable from './components/SourceTable'
import SourceCard from './components/SourceCard'
import SyncHistory from './components/SyncHistory'
import AddSourceModal from './components/AddSourceModal'
import ConnectWizardModal from './components/ConnectWizardModal'
import ManageSourceModal from './components/ManageSourceModal'
import SearchInput from '@/components/common/SearchInput'
import Pagination from '@/components/common/Pagination'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const PER_PAGE = 8

const TABS = ['Sources', 'Enterprise', 'Streaming & Ingestion']

// TODO: Replace with RTK Query for enterprise connector catalog — see src/app/services/api.ts
const MOCK_ENTERPRISE = [
  { name: 'Snowflake', abbr: 'SF', bg: '#29B5E8', fg: '#fff', category: 'Data Warehouse', status: 'connected', tables: 124, rows: '18.4M', lastSync: '5 min ago', health: 99, syncFreq: 'Every 15 min', nextRun: 'in 10 min', cdcEnabled: true, cdcMode: 'Log-based', cdcLag: '2s', errorRate: '0.01%', avgQuery: '120ms', uptime: '99.9%', lastIncident: '18 days ago' },
  { name: 'Databricks', abbr: 'DB', bg: '#FF3621', fg: '#fff', category: 'Lakehouse', status: 'connected', tables: 89, rows: '42.1M', lastSync: '1 hr ago', health: 94, syncFreq: 'Every 1 hr', nextRun: 'in 5 min', cdcEnabled: true, cdcMode: 'Trigger-based', cdcLag: '5s', errorRate: '0.12%', avgQuery: '340ms', uptime: '98.2%', lastIncident: '3 days ago' },
  { name: 'Oracle DB', abbr: 'OR', bg: '#F80000', fg: '#fff', category: 'Database', status: 'disconnected', tables: 0, rows: '—', lastSync: '—', health: 0, syncFreq: 'Manual', nextRun: '—', cdcEnabled: false, cdcMode: '—', cdcLag: '—', errorRate: '—', avgQuery: '—', uptime: '—', lastIncident: '—' },
  { name: 'SAP HANA', abbr: 'SAP', bg: '#0070B1', fg: '#fff', category: 'ERP', status: 'disconnected', tables: 0, rows: '—', lastSync: '—', health: 0, syncFreq: 'Manual', nextRun: '—', cdcEnabled: false, cdcMode: '—', cdcLag: '—', errorRate: '—', avgQuery: '—', uptime: '—', lastIncident: '—' },
  { name: 'BigQuery', abbr: 'BQ', bg: '#4285F4', fg: '#fff', category: 'Data Warehouse', status: 'connected', tables: 212, rows: '91.2M', lastSync: '30 min ago', health: 97, syncFreq: 'Every 30 min', nextRun: 'in 22 min', cdcEnabled: false, cdcMode: '—', cdcLag: '—', errorRate: '0.04%', avgQuery: '210ms', uptime: '99.5%', lastIncident: '7 days ago' },
]

const ENT_TABS = ['Sources', 'Health Dashboard', 'Scheduling', 'Change Detection']

// TODO: Replace with RTK Query + WebSocket for streaming pipeline metrics — see src/app/services/api.ts
const MOCK_KAFKA_TOPICS = [
  { t: 'user-events', p: 12, r: 3, m: '4.2K', sz: '28 GB', ret: '7d' },
  { t: 'transactions', p: 8, r: 3, m: '3.1K', sz: '42 GB', ret: '30d' },
  { t: 'clickstream', p: 16, r: 2, m: '2.8K', sz: '18 GB', ret: '3d' },
  { t: 'audit-log', p: 4, r: 3, m: '1.1K', sz: '12 GB', ret: '90d' },
  { t: 'model-predictions', p: 6, r: 2, m: '890', sz: '5 GB', ret: '7d' },
  { t: 'dlq-events', p: 2, r: 3, m: '42', sz: '1.2 GB', ret: '14d' },
]

const MOCK_CONSUMER_GROUPS = [
  { g: 'analytics-consumer', tp: 'user-events, clickstream', lag: '340', st: 'Stable', m: 4 },
  { g: 'fraud-detector', tp: 'transactions', lag: '12', st: 'Stable', m: 2 },
  { g: 'audit-processor', tp: 'audit-log', lag: '0', st: 'Stable', m: 1 },
  { g: 'ml-ingest-pipeline', tp: 'user-events, transactions', lag: '1,204', st: 'Rebalancing', m: 3 },
]

const MOCK_SCHEMAS = [
  { s: 'user-events-value', v: 5, c: 'BACKWARD', f: 'Avro' },
  { s: 'transactions-value', v: 3, c: 'FULL', f: 'Avro' },
  { s: 'clickstream-value', v: 8, c: 'BACKWARD', f: 'Avro' },
  { s: 'audit-log-value', v: 2, c: 'NONE', f: 'JSON' },
  { s: 'model-predictions-key', v: 1, c: 'BACKWARD', f: 'Protobuf' },
]

const MOCK_DLQ = [
  { tp: 'transactions', e: 'Schema validation failed', ts: '2026-04-15 08:42', r: 3, p: '{"user_id":"u-442","amt":...}' },
  { tp: 'clickstream', e: 'Deserialization error', ts: '2026-04-15 08:38', r: 2, p: '{"sid":"s-991","page":...}' },
  { tp: 'user-events', e: 'Null key not allowed', ts: '2026-04-15 08:12', r: 3, p: '{"event":"login","ip":...}' },
  { tp: 'transactions', e: 'Timeout downstream', ts: '2026-04-15 07:55', r: 5, p: '{"user_id":"u-118","amt":...}' },
  { tp: 'audit-log', e: 'Partition assignment lost', ts: '2026-04-15 07:30', r: 1, p: '{"action":"delete","obj":...}' },
]

function SubTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
      {tabs.map((t) => (
        <button key={t} className={`btn btn-xs ${active === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onChange(t)} type="button">{t}</button>
      ))}
    </div>
  )
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

function categoryClass(cat: string): string {
  const map: Record<string, string> = {
    'Data Warehouse': 'pill pill-blue',
    Lakehouse: 'pill pill-purple',
    Database: 'pill pill-cyan',
    ERP: 'pill pill-amber',
  }
  return map[cat] ?? 'pill'
}

export default function SourcesPage() {
  const dispatch = useAppDispatch()
  const { view, search, typeFilter, tenantFilter, page } = useAppSelector((s) => s.sources)
  const { data: sources = [], isLoading } = useGetSourcesQuery()
  const [activeTab, setActiveTab] = useState('Sources')
  const [streamInner, setStreamInner] = useState('Topics')
  const [streamExpandTopic, setStreamExpandTopic] = useState<number | null>(null)
  const [entTab, setEntTab] = useState('Sources')
  const [entExpanded, setEntExpanded] = useState<string | null>(null)

  // Local sources state — allows adding new sources and updating existing ones
  // TODO: Replace with RTK Query cache invalidation after mutations
  const [localSources, setLocalSources] = useState<DataSource[]>([])
  useEffect(() => {
    if (sources.length > 0 && localSources.length === 0) setLocalSources(sources)
  }, [sources]) // eslint-disable-line react-hooks/exhaustive-deps
  const effectiveSources = localSources.length > 0 ? localSources : sources

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [connectingSource, setConnectingSource] = useState<DataSource | null>(null)
  const [managingSource, setManagingSource] = useState<DataSource | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  function toast(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  function handleAddConnector(connector: ConnectorCatalogItem) {
    const newSrc: DataSource = {
      id: `src-new-${Date.now()}`,
      name: connector.name,
      label: '',
      abbr: connector.abbr,
      type: connector.type,
      bg: connector.bg,
      fg: connector.fg,
      connected: false,
    }
    setLocalSources((prev) => [...prev, newSrc])
    setShowAddModal(false)
    setConnectingSource(newSrc)
  }

  function handleConnected(updated: DataSource) {
    setLocalSources((prev) => prev.map((s) => s.id === updated.id ? updated : s))
    setConnectingSource(null)
    toast(`${updated.label || updated.name} connected successfully!`)
  }

  function handleSaved(updated: DataSource) {
    setLocalSources((prev) => prev.map((s) => s.id === updated.id ? updated : s))
    setManagingSource(null)
    toast(`${updated.label || updated.name} settings saved.`)
  }

  function handleDisconnect(id: string) {
    setLocalSources((prev) => prev.map((s) => s.id === id ? {
      ...s, connected: false, rows: undefined, lastSync: undefined, nextSync: undefined, health: undefined,
    } : s))
    toast('Source disconnected.')
  }

  const allTypes = Array.from(new Set(effectiveSources.map((s) => s.type))).sort()

  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'disconnected'>('all')

  const filtered = effectiveSources.filter((s) => {
    const matchSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.label ?? '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || s.type === typeFilter
    const matchTenant = tenantFilter === 'all' || s.tenant === tenantFilter
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'connected' && s.connected) ||
      (statusFilter === 'disconnected' && !s.connected)
    return matchSearch && matchType && matchTenant && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const connectedCount = effectiveSources.filter((s) => s.connected).length
  const overdueCount = effectiveSources.filter((s) => s.connected && s.nextSync === 'Overdue').length
  const totalRows = effectiveSources.filter((s) => s.connected && s.rows).reduce((acc, s) => acc + (s.rows ?? 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            Data Connectors
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
            {effectiveSources.length} sources · {connectedCount} connected · {effectiveSources.length - connectedCount} disconnected
            {overdueCount > 0 && <span style={{ color: 'var(--amber)', marginLeft: 6 }}>· {overdueCount} overdue</span>}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={14} />
          Add Source
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--green)', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

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

      {/* Sources tab */}
      {activeTab === 'Sources' && (
        <div>
          {/* Stats */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Connected', value: `${connectedCount} of ${effectiveSources.length}`, color: 'var(--green)' },
              { label: 'Total Rows', value: totalRows > 1_000_000 ? `${(totalRows / 1_000_000).toFixed(1)}M` : totalRows > 1_000 ? `${Math.round(totalRows / 1_000)}K` : String(totalRows), color: 'var(--text)' },
              { label: 'Disconnected', value: effectiveSources.length - connectedCount, color: 'var(--text3)' },
              { label: 'Overdue', value: overdueCount, color: overdueCount > 0 ? 'var(--amber)' : 'var(--text3)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            {/* Status filter buttons */}
            <div style={{ display: 'flex', gap: 4 }}>
              {([
                { id: 'all', label: `All (${effectiveSources.length})` },
                { id: 'connected', label: `Connected (${connectedCount})` },
                { id: 'disconnected', label: `Disconnected (${effectiveSources.length - connectedCount})` },
              ] as const).map((b) => (
                <button
                  key={b.id}
                  className={`btn btn-xs ${statusFilter === b.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => { setStatusFilter(b.id); dispatch(setPage(1)) }}
                  type="button"
                >
                  {b.label}
                </button>
              ))}
            </div>
            <SearchInput value={search} onChange={(v) => dispatch(setSearch(v))} placeholder="Search sources…" />
            <select className="form-input" style={{ width: 'auto', minWidth: 130 }} value={typeFilter} onChange={(e) => dispatch(setTypeFilter(e.target.value))}>
              <option value="all">All Types</option>
              {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="form-input" style={{ width: 'auto', minWidth: 150 }} value={tenantFilter} onChange={(e) => dispatch(setTenantFilter(e.target.value))}>
              <option value="all">All Tenants</option>
              {MOCK_TENANTS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button className={`btn btn-xs ${view === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => dispatch(setView('table'))} aria-label="Table view">
                <List size={13} />
              </button>
              <button className={`btn btn-xs ${view === 'card' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => dispatch(setView('card'))} aria-label="Card view">
                <LayoutGrid size={13} />
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
              <span className="spinner" style={{ marginRight: 8 }} />
              Loading sources…
            </div>
          ) : view === 'table' ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
              <SourceTable
                sources={paged}
                onConnect={(src) => setConnectingSource(src)}
                onManage={(src) => setManagingSource(src)}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 14 }}>
              {paged.map((src) => <SourceCard key={src.id} source={src} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ marginBottom: 24 }}>
              <Pagination page={page} totalPages={totalPages} onChange={(p) => dispatch(setPage(p))} total={filtered.length} perPage={PER_PAGE} />
            </div>
          )}

          <div className="card" style={{ marginTop: 8 }}>
            <SyncHistory />
          </div>
        </div>
      )}

      {/* Enterprise tab */}
      {activeTab === 'Enterprise' && (
        <div>
          {/* KPI stats */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Connected', value: `${MOCK_ENTERPRISE.filter(e => e.status === 'connected').length} of ${MOCK_ENTERPRISE.length}`, color: 'var(--green)' },
              { label: 'Total Tables', value: MOCK_ENTERPRISE.reduce((a, e) => a + e.tables, 0), color: 'var(--text)' },
              { label: 'Total Rows', value: '152.1M', color: 'var(--cyan)' },
              { label: 'Avg Sync Freq', value: '28 min', color: 'var(--text)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Sub-tabs + Connect button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SubTabs tabs={ENT_TABS} active={entTab} onChange={setEntTab} />
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Add enterprise connector coming soon')}>
              <Plus size={13} /> Connect Enterprise Source
            </button>
          </div>

          {/* Sources sub-tab */}
          {entTab === 'Sources' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 28 }} />
                    <th>Source</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Tables</th>
                    <th>Rows</th>
                    <th>Last Sync</th>
                    <th>Health</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ENTERPRISE.map((e) => {
                    const isExp = entExpanded === e.name
                    return (
                      <>
                        <tr key={e.name} style={{ cursor: 'pointer' }} onClick={() => setEntExpanded(isExp ? null : e.name)}>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{isExp ? '▼' : '▶'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 26, height: 26, borderRadius: 6, background: e.bg, color: e.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{e.abbr}</div>
                              <span style={{ fontWeight: 600 }}>{e.name}</span>
                            </div>
                          </td>
                          <td><span className={categoryClass(e.category)} style={{ fontSize: 10 }}>{e.category}</span></td>
                          <td><span className={e.status === 'connected' ? 'pill pill-green' : 'pill'} style={{ fontSize: 10 }}>{e.status}</span></td>
                          <td style={{ fontWeight: 600 }}>{e.tables || '—'}</td>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{e.rows}</td>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{e.lastSync}</td>
                          <td>
                            {e.status === 'connected' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 56, height: 5, background: 'var(--border)', borderRadius: 3 }}>
                                  <div style={{ width: `${e.health}%`, height: '100%', background: e.health >= 95 ? 'var(--green)' : e.health >= 80 ? 'var(--amber)' : 'var(--red)', borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: 11, color: e.health >= 95 ? 'var(--green)' : e.health >= 80 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>{e.health}%</span>
                              </div>
                            ) : <span style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>—</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-xs btn-ghost" onClick={(ev) => { ev.stopPropagation(); showToast(`Syncing ${e.name}…`) }}>Sync</button>
                              <button className="btn btn-xs btn-ghost" onClick={(ev) => { ev.stopPropagation(); showToast('Configure coming soon') }}>Configure</button>
                            </div>
                          </td>
                        </tr>
                        {isExp && (
                          <tr key={`${e.name}-detail`}>
                            <td colSpan={9} style={{ padding: 0 }}>
                              <div style={{ background: 'var(--bg3)', padding: 14, fontSize: 'var(--text-xs)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                                  {[
                                    { label: 'Uptime', value: e.uptime },
                                    { label: 'Avg Query Time', value: e.avgQuery },
                                    { label: 'Error Rate', value: e.errorRate },
                                    { label: 'Last Incident', value: e.lastIncident },
                                  ].map((m) => (
                                    <div key={m.label} style={{ background: 'var(--bg)', borderRadius: 6, padding: '8px 10px' }}>
                                      <div style={{ color: 'var(--text3)', marginBottom: 2 }}>{m.label}</div>
                                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{m.value || '—'}</div>
                                    </div>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button className="btn btn-xs btn-primary" onClick={() => showToast(`Force-syncing ${e.name}…`)}>Force Sync</button>
                                  <button className="btn btn-xs btn-ghost" onClick={() => showToast('Viewing sync history…')}>Sync History</button>
                                  <button className="btn btn-xs btn-ghost" onClick={() => showToast('Editing schedule…')}>Edit Schedule</button>
                                  {e.status === 'connected' && <button className="btn btn-xs btn-ghost" style={{ color: 'var(--red)' }} onClick={() => showToast(`Disconnecting ${e.name}…`)}>Disconnect</button>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Health Dashboard sub-tab */}
          {entTab === 'Health Dashboard' && (
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Source</th><th>Status</th><th>Uptime</th><th>Avg Query</th><th>Error Rate</th><th>Health</th><th>Last Incident</th></tr>
                  </thead>
                  <tbody>
                    {MOCK_ENTERPRISE.map((e) => (
                      <tr key={e.name}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 5, background: e.bg, color: e.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{e.abbr}</div>
                            <span style={{ fontWeight: 600 }}>{e.name}</span>
                          </div>
                        </td>
                        <td><span className={e.status === 'connected' ? 'pill pill-green' : 'pill'} style={{ fontSize: 10 }}>{e.status}</span></td>
                        <td style={{ fontWeight: 600 }}>{e.uptime || '—'}</td>
                        <td style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)' }}>{e.avgQuery || '—'}</td>
                        <td style={{ color: e.errorRate !== '—' && parseFloat(e.errorRate) > 0.1 ? 'var(--amber)' : 'var(--text)', fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)' }}>{e.errorRate || '—'}</td>
                        <td>
                          {e.status === 'connected' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 72, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                                <div style={{ width: `${e.health}%`, height: '100%', background: e.health >= 95 ? 'var(--green)' : e.health >= 80 ? 'var(--amber)' : 'var(--red)', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11, color: e.health >= 95 ? 'var(--green)' : e.health >= 80 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>{e.health}%</span>
                            </div>
                          ) : <span style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>offline</span>}
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{e.lastIncident || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card" style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Health Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Healthy (≥95%)', count: MOCK_ENTERPRISE.filter(e => e.health >= 95).length, color: 'var(--green)' },
                    { label: 'Degraded (80–94%)', count: MOCK_ENTERPRISE.filter(e => e.health > 0 && e.health < 95).length, color: 'var(--amber)' },
                    { label: 'Offline', count: MOCK_ENTERPRISE.filter(e => e.health === 0).length, color: 'var(--text3)' },
                  ].map((s) => (
                    <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{s.label}</span>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: s.color }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scheduling sub-tab */}
          {entTab === 'Scheduling' && (
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Source</th><th>Sync Frequency</th><th>Next Run</th><th>Last Sync</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {MOCK_ENTERPRISE.map((e) => (
                      <tr key={e.name}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 5, background: e.bg, color: e.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{e.abbr}</div>
                            <span style={{ fontWeight: 600 }}>{e.name}</span>
                          </div>
                        </td>
                        <td>
                          <select
                            className="form-input"
                            defaultValue={e.syncFreq}
                            style={{ width: 'auto', fontSize: 'var(--text-xs)', padding: '3px 6px' }}
                            disabled={e.status !== 'connected'}
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <option>Manual</option>
                            <option>Every 5 min</option>
                            <option>Every 15 min</option>
                            <option>Every 30 min</option>
                            <option>Every 1 hr</option>
                            <option>Every 6 hr</option>
                            <option>Daily</option>
                            <option>Weekly</option>
                          </select>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--cyan)' }}>{e.nextRun}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{e.lastSync}</td>
                        <td><span className={e.status === 'connected' ? 'pill pill-green' : 'pill'} style={{ fontSize: 10 }}>{e.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-xs btn-primary" onClick={() => showToast(`Scheduling saved for ${e.name}`)} disabled={e.status !== 'connected'}>Save</button>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Force-syncing ${e.name}…`)} disabled={e.status !== 'connected'}>Run Now</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Global Schedule Settings</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="form-label">Sync Window Start</label>
                    <input className="form-input" type="time" defaultValue="02:00" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label className="form-label">Sync Window End</label>
                    <input className="form-input" type="time" defaultValue="06:00" style={{ width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input type="checkbox" id="ent-backfill" defaultChecked />
                  <label htmlFor="ent-backfill" style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>Enable backfill on reconnect</label>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Global schedule settings saved')}>Save Global Settings</button>
              </div>
            </div>
          )}

          {/* Change Detection (CDC) sub-tab */}
          {entTab === 'Change Detection' && (
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Source</th><th>CDC Enabled</th><th>Mode</th><th>Replication Lag</th><th>Tables Tracked</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {MOCK_ENTERPRISE.map((e) => (
                      <tr key={e.name}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 5, background: e.bg, color: e.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{e.abbr}</div>
                            <span style={{ fontWeight: 600 }}>{e.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={e.cdcEnabled ? 'pill pill-green' : 'pill'} style={{ fontSize: 10 }}>
                            {e.cdcEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: e.cdcMode !== '—' ? 'var(--cyan)' : 'var(--text3)' }}>{e.cdcMode}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: e.cdcLag !== '—' ? 'var(--green)' : 'var(--text3)', fontWeight: 600 }}>{e.cdcLag}</td>
                        <td style={{ color: 'var(--text2)' }}>{e.cdcEnabled ? `${Math.floor(e.tables * 0.6)} of ${e.tables}` : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {e.status === 'connected' && (
                              <button className="btn btn-xs btn-ghost" onClick={() => showToast(`${e.cdcEnabled ? 'Disabling' : 'Enabling'} CDC for ${e.name}…`)}>
                                {e.cdcEnabled ? 'Disable' : 'Enable'}
                              </button>
                            )}
                            {e.cdcEnabled && (
                              <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Configure CDC for ${e.name}`)}>Configure</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>CDC Overview</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                  {[
                    { label: 'CDC-Enabled Sources', value: MOCK_ENTERPRISE.filter(e => e.cdcEnabled).length, color: 'var(--green)' },
                    { label: 'Avg Replication Lag', value: '3.5s', color: 'var(--cyan)' },
                    { label: 'Change Events / hr', value: '142K', color: 'var(--text)' },
                  ].map((s) => (
                    <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{s.label}</span>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                  CDC captures row-level changes (INSERT, UPDATE, DELETE) in real time using database transaction logs or trigger-based mechanisms, enabling near-zero latency data replication.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Streaming & Ingestion tab */}
      {activeTab === 'Streaming & Ingestion' && (
        <div>
          {/* TODO: Connect via WebSocket for real-time streaming metrics — see src/app/services/api.ts */}
          {/* Stats */}
          <div className="stat-grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: 'Kafka Topics', value: 24, color: 'var(--text)' },
              { label: 'Throughput', value: '12.4K msg/s', color: 'var(--cyan)' },
              { label: 'Consumer Groups', value: 8, color: 'var(--text)' },
              { label: 'DLQ Messages', value: 142, color: 'var(--amber)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <SubTabs
            tabs={['Topics', 'Consumer Groups', 'Schema Registry', 'Dead Letter Queue']}
            active={streamInner}
            onChange={setStreamInner}
          />

          {/* Topics */}
          {streamInner === 'Topics' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 28 }} />
                    <th>Topic Name</th>
                    <th>Partitions</th>
                    <th>Replication</th>
                    <th>Msg/sec</th>
                    <th>Size</th>
                    <th>Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_KAFKA_TOPICS.map((row, idx) => {
                    const isExp = streamExpandTopic === idx
                    return (
                      <>
                        <tr
                          key={row.t}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setStreamExpandTopic(isExp ? null : idx)}
                        >
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{isExp ? '▼' : '▶'}</td>
                          <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{row.t}</td>
                          <td>{row.p}</td>
                          <td>{row.r}</td>
                          <td style={{ fontWeight: 600, color: 'var(--cyan)' }}>{row.m}</td>
                          <td>{row.sz}</td>
                          <td>{row.ret}</td>
                        </tr>
                        {isExp && (
                          <tr key={`${row.t}-detail`}>
                            <td colSpan={7} style={{ padding: 0 }}>
                              <div style={{ background: 'var(--bg3)', padding: 12, fontSize: 'var(--text-xs)' }}>
                                <div style={{ color: 'var(--text)', marginBottom: 8, fontSize: 'var(--text-sm)' }}>
                                  Partition Detail for <strong>{row.t}</strong>
                                </div>
                                <table className="data-table" style={{ margin: 0 }}>
                                  <thead>
                                    <tr><th>Partition</th><th>Leader</th><th>ISR</th><th>Offset</th><th>Messages</th></tr>
                                  </thead>
                                  <tbody>
                                    {Array.from({ length: Math.min(row.p, 4) }, (_, pi) => (
                                      <tr key={pi}>
                                        <td>{pi}</td>
                                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>broker-{(pi % 3) + 1}</td>
                                        <td>{row.r}/{row.r}</td>
                                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{1240000 + pi * 32000}</td>
                                        <td>{Math.floor(parseInt(row.m) * 100 / row.p)}</td>
                                      </tr>
                                    ))}
                                    {row.p > 4 && (
                                      <tr>
                                        <td colSpan={5} style={{ color: 'var(--text3)', textAlign: 'center', fontSize: 'var(--text-xs)' }}>
                                          ... and {row.p - 4} more partitions
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Consumer Groups */}
          {streamInner === 'Consumer Groups' && (
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Group ID</th><th>Topics</th><th>Lag</th><th>State</th><th>Members</th></tr>
                  </thead>
                  <tbody>
                    {MOCK_CONSUMER_GROUPS.map((r) => (
                      <tr key={r.g}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)' }}>{r.g}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{r.tp}</td>
                        <td style={{ fontWeight: 600 }}>{r.lag}</td>
                        <td>
                          <span className={`pill pill-${r.st === 'Stable' ? 'green' : 'amber'}`} style={{ fontSize: 10 }}>{r.st}</span>
                        </td>
                        <td>{r.m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div className="card-title">Add Consumer Group</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label className="form-label">Group ID</label>
                    <input className="form-input" placeholder="my-consumer-group" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label className="form-label">Subscribe Topics</label>
                    <input className="form-input" placeholder="topic1, topic2" style={{ width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label className="form-label">Offset Reset</label>
                    <select className="form-input" style={{ width: '100%' }}>
                      <option>earliest</option>
                      <option>latest</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Max Poll Records</label>
                    <input className="form-input" type="number" defaultValue={500} style={{ width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => showToast('Consumer group created')}>Create Consumer Group</button>
                  <button className="btn btn-ghost btn-sm">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Schema Registry */}
          {streamInner === 'Schema Registry' && (
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ padding: '12px 16px 0' }}>
                  <input className="form-input" placeholder="Search schemas..." style={{ width: '100%', maxWidth: 400, marginBottom: 12 }} />
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Subject</th><th>Version</th><th>Compatibility</th><th>Format</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {MOCK_SCHEMAS.map((r) => (
                      <tr key={r.s}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)' }}>{r.s}</td>
                        <td>v{r.v}</td>
                        <td><span className="pill pill-blue" style={{ fontSize: 10 }}>{r.c}</span></td>
                        <td>{r.f}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Viewing ${r.s}`)}>View</button>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Diff for ${r.s}`)}>Diff</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div className="card-title">Schema Diff Viewer</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Subject</label>
                    <select className="form-input" style={{ width: '100%' }}>
                      <option>user-events-value</option>
                      <option>transactions-value</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Compare Versions</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select className="form-input" style={{ width: '50%' }}><option>v4</option><option>v3</option></select>
                      <select className="form-input" style={{ width: '50%' }}><option>v5</option></select>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 10, fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>
                    <div style={{ color: 'var(--text3)', marginBottom: 6 }}>v4 (before)</div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`{"type":"record","fields":[
  {"name":"user_id","type":"string"},
  {"name":"event","type":"string"},
  {"name":"ts","type":"long"}
]}`}</pre>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 10, fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>
                    <div style={{ color: 'var(--text3)', marginBottom: 6 }}>v5 (after)</div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`{"type":"record","fields":[
  {"name":"user_id","type":"string"},
  {"name":"event","type":"string"},
  {"name":"ts","type":"long"},`}<span style={{ color: 'var(--green)' }}>
  {`+ {"name":"source","type":["null","string"]}`}</span>
{`]}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dead Letter Queue */}
          {streamInner === 'Dead Letter Queue' && (
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Origin Topic</th><th>Error</th><th>Timestamp</th><th>Retries</th><th>Payload</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {MOCK_DLQ.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)' }}>{r.tp}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>{r.e}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{r.ts}</td>
                        <td>{r.r}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--text3)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.p}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                            <button className="btn btn-xs btn-primary" onClick={() => showToast(`Retrying message from ${r.tp}…`)}>Retry</button>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast('Message dismissed')}>Dismiss</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Retrying all failed messages…')}>Retry All Failed</button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('DLQ purged')}>Purge DLQ</button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Exporting to CSV…')}>Export to CSV</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddSourceModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        existingSources={effectiveSources}
        onAdd={handleAddConnector}
      />
      <ConnectWizardModal
        open={!!connectingSource}
        source={connectingSource}
        onClose={() => setConnectingSource(null)}
        onConnected={handleConnected}
      />
      <ManageSourceModal
        open={!!managingSource}
        source={managingSource}
        onClose={() => setManagingSource(null)}
        onSaved={handleSaved}
        onDisconnect={handleDisconnect}
        onReconfigure={(src) => setConnectingSource(src)}
      />
    </div>
  )
}
