import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Minus,
  Search,
  Building2,
  CheckSquare,
  Bell,
  Download,
} from 'lucide-react'

interface EntityField {
  label: string
  value: string
  source: string
  trend: 'up' | 'down' | null
}

interface MrrPoint {
  month: string
  value: number
}

interface RelatedEntity {
  name: string
  type: string
  role: string
}

interface Entity {
  id: string
  name: string
  type: string
  tier: string
  since: string
  riskLevel: 'High' | 'Medium' | 'Low'
  notes: string
  fields: EntityField[]
  mrrHistory: MrrPoint[]
  relatedEntities: RelatedEntity[]
}

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_ENTITIES: Entity[] = [
  {
    id: 'e1',
    name: 'Meridian Corp',
    type: 'Enterprise Client',
    tier: 'Tier 1',
    since: 'Jan 2022',
    riskLevel: 'High',
    notes: '',
    fields: [
      { label: 'MRR', value: '$48,200', source: 'Stripe', trend: 'down' },
      { label: 'ARR', value: '$578,400', source: 'Stripe', trend: 'down' },
      { label: 'NPS', value: '34', source: 'Intercom', trend: 'down' },
      { label: 'Health Score', value: '42/100', source: 'Platform', trend: 'down' },
      { label: 'Last Login', value: '8 days ago', source: 'Auth0', trend: null },
      { label: 'Open Tickets', value: '5', source: 'Zendesk', trend: 'up' },
    ],
    mrrHistory: [
      { month: 'Nov', value: 52000 },
      { month: 'Dec', value: 51000 },
      { month: 'Jan', value: 50000 },
      { month: 'Feb', value: 49500 },
      { month: 'Mar', value: 48800 },
      { month: 'Apr', value: 48200 },
    ],
    relatedEntities: [
      { name: 'Atlas Manufacturing', type: 'Account', role: 'Partner' },
      { name: 'Sarah Kim', type: 'Owner', role: 'CSM' },
    ],
  },
  {
    id: 'e2',
    name: 'Atlas Manufacturing',
    type: 'Mid-Market Client',
    tier: 'Tier 2',
    since: 'Mar 2022',
    riskLevel: 'Medium',
    notes: '',
    fields: [
      { label: 'MRR', value: '$21,600', source: 'Stripe', trend: null },
      { label: 'ARR', value: '$259,200', source: 'Stripe', trend: null },
      { label: 'NPS', value: '52', source: 'Intercom', trend: 'up' },
      { label: 'Health Score', value: '61/100', source: 'Platform', trend: 'up' },
      { label: 'Last Login', value: '2 days ago', source: 'Auth0', trend: null },
      { label: 'Open Tickets', value: '2', source: 'Zendesk', trend: null },
    ],
    mrrHistory: [
      { month: 'Nov', value: 20000 },
      { month: 'Dec', value: 20500 },
      { month: 'Jan', value: 21000 },
      { month: 'Feb', value: 21200 },
      { month: 'Mar', value: 21400 },
      { month: 'Apr', value: 21600 },
    ],
    relatedEntities: [],
  },
  {
    id: 'e3',
    name: 'Vantage Logistics',
    type: 'Enterprise Client',
    tier: 'Tier 1',
    since: 'Jun 2021',
    riskLevel: 'High',
    notes: '',
    fields: [
      { label: 'MRR', value: '$62,100', source: 'Stripe', trend: 'down' },
      { label: 'ARR', value: '$745,200', source: 'Stripe', trend: 'down' },
      { label: 'NPS', value: '28', source: 'Intercom', trend: 'down' },
      { label: 'Health Score', value: '38/100', source: 'Platform', trend: 'down' },
      { label: 'Last Login', value: '12 days ago', source: 'Auth0', trend: null },
      { label: 'Open Tickets', value: '8', source: 'Zendesk', trend: 'up' },
    ],
    mrrHistory: [
      { month: 'Nov', value: 68000 },
      { month: 'Dec', value: 66000 },
      { month: 'Jan', value: 64000 },
      { month: 'Feb', value: 63000 },
      { month: 'Mar', value: 62500 },
      { month: 'Apr', value: 62100 },
    ],
    relatedEntities: [],
  },
  {
    id: 'e4',
    name: 'BrightPath Education',
    type: 'SMB Client',
    tier: 'Tier 3',
    since: 'Sep 2023',
    riskLevel: 'Low',
    notes: '',
    fields: [
      { label: 'MRR', value: '$4,800', source: 'Stripe', trend: 'up' },
      { label: 'NPS', value: '78', source: 'Intercom', trend: 'up' },
      { label: 'Health Score', value: '88/100', source: 'Platform', trend: 'up' },
      { label: 'Last Login', value: 'Today', source: 'Auth0', trend: null },
      { label: 'Open Tickets', value: '0', source: 'Zendesk', trend: null },
    ],
    mrrHistory: [
      { month: 'Nov', value: 3200 },
      { month: 'Dec', value: 3800 },
      { month: 'Jan', value: 4100 },
      { month: 'Feb', value: 4400 },
      { month: 'Mar', value: 4600 },
      { month: 'Apr', value: 4800 },
    ],
    relatedEntities: [],
  },
  {
    id: 'e5',
    name: 'NovaTech Solutions',
    type: 'Growth Client',
    tier: 'Tier 2',
    since: 'Feb 2023',
    riskLevel: 'Low',
    notes: '',
    fields: [
      { label: 'MRR', value: '$15,400', source: 'Stripe', trend: 'up' },
      { label: 'NPS', value: '71', source: 'Intercom', trend: 'up' },
      { label: 'Health Score', value: '79/100', source: 'Platform', trend: 'up' },
      { label: 'Last Login', value: 'Yesterday', source: 'Auth0', trend: null },
      { label: 'Open Tickets', value: '1', source: 'Zendesk', trend: null },
    ],
    mrrHistory: [
      { month: 'Nov', value: 11000 },
      { month: 'Dec', value: 12000 },
      { month: 'Jan', value: 13000 },
      { month: 'Feb', value: 14000 },
      { month: 'Mar', value: 14800 },
      { month: 'Apr', value: 15400 },
    ],
    relatedEntities: [],
  },
]

interface RelatedAlert {
  title: string
  desc: string
  sev: 'critical' | 'warn'
  time: string
}

const HIGH_RISK_ALERTS: RelatedAlert[] = [
  { title: 'Churn Rate Above Target', desc: '4.8% vs 4.0% threshold — customer at risk', sev: 'critical', time: '2h ago' },
  { title: 'Usage Drop Detected', desc: 'Login frequency dropped 65% in the last 14 days', sev: 'warn', time: '1d ago' },
]

const MEDIUM_RISK_ALERTS: RelatedAlert[] = [
  { title: 'Payment Delayed', desc: 'Invoice overdue by 12 days', sev: 'warn', time: '3d ago' },
]

function getRelatedAlerts(riskLevel: Entity['riskLevel']): RelatedAlert[] {
  if (riskLevel === 'High') return HIGH_RISK_ALERTS
  if (riskLevel === 'Medium') return MEDIUM_RISK_ALERTS
  return []
}

const RISK_PILL: Record<Entity['riskLevel'], string> = {
  High: 'pill pill-red',
  Medium: 'pill pill-amber',
  Low: 'pill pill-green',
}

const DETAIL_TABS = ['Fields', 'History', 'Related', 'Notes']

function TrendIcon({ trend }: { trend: 'up' | 'down' | null }) {
  if (trend === 'up') return <ArrowUp size={12} style={{ color: 'var(--green)', display: 'inline' }} />
  if (trend === 'down') return <ArrowDown size={12} style={{ color: 'var(--red)', display: 'inline' }} />
  return <Minus size={12} style={{ color: 'var(--text3)', display: 'inline' }} />
}

function showToast(msg: string) {
  const el = document.createElement('div')
  el.textContent = msg
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: 'var(--accent)',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '6px',
    fontSize: '13px',
    zIndex: 9999,
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
  })
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2800)
}

export default function DataCardsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'risk' | 'mrr' | 'alpha'>('risk')
  const [detailTab, setDetailTab] = useState('Fields')
  const [notes, setNotes] = useState<Record<string, string>>({})

  const entity = selectedId ? MOCK_ENTITIES.find((e) => e.id === selectedId) ?? null : null

  const filtered = MOCK_ENTITIES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()),
  ).sort((a, b) => {
    if (sort === 'alpha') return a.name.localeCompare(b.name)
    if (sort === 'risk') {
      const order = { High: 0, Medium: 1, Low: 2 }
      return order[a.riskLevel] - order[b.riskLevel]
    }
    // mrr — sort by first field value
    const mrrA = parseFloat((a.fields.find((f) => f.label === 'MRR')?.value ?? '$0').replace(/[$,]/g, ''))
    const mrrB = parseFloat((b.fields.find((f) => f.label === 'MRR')?.value ?? '$0').replace(/[$,]/g, ''))
    return mrrB - mrrA
  })

  if (entity) {
    const maxMrr = Math.max(...entity.mrrHistory.map((p) => p.value))
    const entityNotes = notes[entity.id] ?? entity.notes

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedId(null)}>
            <ArrowLeft size={14} />
            Back
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
              {entity.name}
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
              {entity.type} · {entity.tier} · Since {entity.since}
            </p>
          </div>
          <span className={RISK_PILL[entity.riskLevel]}>{entity.riskLevel} Risk</span>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 18 }}>
          {DETAIL_TABS.map((t) => (
            <button
              key={t}
              className={cn('tab', detailTab === t && 'active')}
              onClick={() => setDetailTab(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Fields */}
        {detailTab === 'Fields' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 20,
            }}
          >
            {entity.fields.map((f) => (
              <div key={f.label} className="card field-item" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {f.value}
                  <TrendIcon trend={f.trend} />
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 4 }}>
                  via {f.source}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {detailTab === 'History' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 18 }}>
              MRR History (6 months)
            </div>
            <div className="chart-bars" style={{ height: 140, alignItems: 'flex-end', gap: 10 }}>
              {entity.mrrHistory.map((p) => (
                <div key={p.month} className="chart-col">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(p.value / maxMrr) * 120}px`,
                      background: 'var(--orange)',
                      borderRadius: '3px 3px 0 0',
                      opacity: 0.85,
                    }}
                  />
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 4 }}>{p.month}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {detailTab === 'Related' && (
          <div className="card" style={{ marginBottom: 20 }}>
            {entity.relatedEntities.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '24px 0' }}>
                No related entities
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {entity.relatedEntities.map((r, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span className="pill pill-blue">{r.type}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', flex: 1 }}>{r.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{r.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {detailTab === 'Notes' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
              Account Notes
            </div>
            <textarea
              className="form-input"
              rows={6}
              placeholder="Add notes about this account…"
              value={entityNotes}
              onChange={(e) => setNotes((prev) => ({ ...prev, [entity.id]: e.target.value }))}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--font)' }}
            />
            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => showToast('Notes saved')}
            >
              Save Notes
            </button>
          </div>
        )}

        {/* Related Alerts */}
        {getRelatedAlerts(entity.riskLevel).length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
              Related Alerts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {getRelatedAlerts(entity.riskLevel).map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: idx < getRelatedAlerts(entity.riskLevel).length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      flexShrink: 0,
                      marginTop: 3,
                      background: alert.sev === 'critical' ? 'var(--red)' : 'var(--amber)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 2 }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', lineHeight: 1.5 }}>
                      {alert.desc}
                    </div>
                  </div>
                  <span
                    className={alert.sev === 'critical' ? 'pill pill-red' : 'pill pill-amber'}
                    style={{ fontSize: '10px', flexShrink: 0 }}
                  >
                    {alert.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Task created for ' + entity.name)}>
            <CheckSquare size={13} />
            Create Task
          </button>
          {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
          <button className="btn btn-ghost btn-sm" onClick={() => showToast('Notification sent to team')}>
            <Bell size={13} />
            Send Notification
          </button>
          {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
          <button className="btn btn-ghost btn-sm" onClick={() => showToast('Export started…')}>
            <Download size={13} />
            Export
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Data Cards
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          {MOCK_ENTITIES.length} entities · Click a card to view details
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search entities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 140 }}
          value={sort}
          onChange={(e) => setSort(e.target.value as 'risk' | 'mrr' | 'alpha')}
        >
          <option value="risk">Sort: Risk</option>
          <option value="mrr">Sort: MRR</option>
          <option value="alpha">Sort: A–Z</option>
        </select>
      </div>

      {/* Entity list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((e) => {
          const mrr = e.fields.find((f) => f.label === 'MRR')
          return (
            <div
              key={e.id}
              className="card"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}
              onClick={() => { setSelectedId(e.id); setDetailTab('Fields') }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: e.riskLevel === 'High' ? 'var(--red-bg)' : e.riskLevel === 'Medium' ? 'var(--amber-bg)' : 'var(--green-bg)',
                  color: e.riskLevel === 'High' ? 'var(--red)' : e.riskLevel === 'Medium' ? 'var(--amber)' : 'var(--green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {e.name.charAt(0)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{e.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 2 }}>
                  {e.type} · {e.tier} · Since {e.since}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                  {mrr?.value ?? '—'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>MRR</div>
              </div>

              <div style={{ flexShrink: 0 }}>
                <span className={RISK_PILL[e.riskLevel]}>{e.riskLevel}</span>
              </div>

              <Building2 size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
