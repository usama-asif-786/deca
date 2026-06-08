import { useState } from 'react'
import type { Tenant } from '@/lib/mockData'
import Pill from '@/components/common/Pill'
import ProgressBar from '@/components/common/ProgressBar'
import { Users, DollarSign, AlertTriangle, Bell, XCircle, CheckCircle, Trash2 } from 'lucide-react'

interface TenantCardProps {
  tenant: Tenant
  isExpanded: boolean
  onExpand: () => void
  onManage: (tenant: Tenant) => void
  onStatusChange?: (id: string, status: Tenant['status']) => void
  onDelete?: (id: string) => void
}

const STATUS_VARIANT: Record<Tenant['status'], 'green' | 'amber' | 'blue' | 'red' | 'gray'> = {
  active: 'green',
  trial: 'amber',
  pending: 'blue',
  suspended: 'red',
  expired: 'gray',
}

const SEV_COLOR: Record<'critical' | 'warn' | 'info', string> = {
  critical: 'var(--red)',
  warn: 'var(--amber)',
  info: 'var(--cyan)',
}

function showToast(msg: string, type: 'success' | 'warn' | 'info' = 'success') {
  const el = document.createElement('div')
  el.textContent = msg
  const bg = type === 'warn' ? 'var(--amber)' : type === 'info' ? 'var(--cyan)' : 'var(--green)'
  Object.assign(el.style, {
    position: 'fixed', bottom: '24px', right: '24px',
    background: bg, color: '#fff',
    padding: '10px 18px', borderRadius: '6px',
    fontSize: '13px', zIndex: '9999',
  })
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2800)
}

export default function TenantCard({ tenant, isExpanded, onExpand, onManage, onStatusChange, onDelete }: TenantCardProps) {
  const storagePercent = Math.round((tenant.usage.storageGB / Math.max(tenant.usage.storageLimitGB, 1)) * 100)
  const apiPercent = Math.round((tenant.usage.apiCalls / Math.max(tenant.usage.apiLimitMonth, 1)) * 100)
  const critCount = tenant.alerts.filter((a) => a.type === 'critical').length
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  // Derive initials from owner name
  const ownerInitials = tenant.owner.split(' ').map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase()

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${tenant.color}`,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── Header row (always visible, clickable) ── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
        onClick={onExpand}
      >
        {/* Left: Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{tenant.name}</span>
            <Pill variant={STATUS_VARIANT[tenant.status]}>{tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}</Pill>
            {critCount > 0 && <Pill variant="red">⚠ {critCount} critical</Pill>}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{tenant.industry} · {tenant.region}</div>
        </div>

        {/* Center: Key metrics */}
        <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}><Users size={10} /> Users</div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>{tenant.users}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}><DollarSign size={10} /> MRR</div>
            <div style={{ fontWeight: 700, color: 'var(--green)' }}>{tenant.mrr}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Plan</div>
            <div style={{ fontWeight: 700, color: 'var(--text2)', fontSize: 'var(--text-xs)' }}>{tenant.plan}</div>
          </div>
        </div>

        {/* Expand chevron */}
        <span style={{ color: 'var(--text3)', fontSize: 10, flexShrink: 0 }}>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {/* ── Collapsed footer ── */}
      {!isExpanded && (
        <div style={{ padding: '0 16px 12px', fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
          Owner: <strong style={{ color: 'var(--text2)' }}>{tenant.owner}</strong>
          {tenant.ownerTitle && <span> · {tenant.ownerTitle}</span>}
          <span style={{ marginLeft: 8 }}>Last login: {tenant.usage.lastLogin}</span>
        </div>
      )}

      {/* ── Expanded detail ── */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', padding: 16 }}>

          {/* 4-stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            <div className="stat">
              <div className="stat-label">Sources</div>
              <div className="stat-value" style={{ fontSize: 'var(--text-base)' }}>— / {tenant.sourcesQuota}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Storage</div>
              <div className="stat-value" style={{ fontSize: 'var(--text-base)', color: storagePercent > 80 ? 'var(--amber)' : 'var(--green)' }}>
                {tenant.usage.storageGB}GB / {tenant.usage.storageLimitGB}GB
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Team</div>
              <div className="stat-value" style={{ fontSize: 'var(--text-base)' }}>{(tenant.managers?.length ?? 0) + 1}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>1 owner + {tenant.managers?.length ?? 0} manager{(tenant.managers?.length ?? 0) !== 1 ? 's' : ''}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Last Login</div>
              <div className="stat-value" style={{ fontSize: 'var(--text-sm)' }}>{tenant.usage.lastLogin}</div>
            </div>
          </div>

          {/* Usage bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>
                <span>Storage</span><span style={{ fontWeight: 600 }}>{storagePercent}%</span>
              </div>
              <ProgressBar value={storagePercent} color={storagePercent > 80 ? 'var(--amber)' : 'var(--green)'} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>
                <span>API Calls</span><span style={{ fontWeight: 600 }}>{apiPercent}%</span>
              </div>
              <ProgressBar value={apiPercent} color={apiPercent > 80 ? 'var(--amber)' : 'var(--green)'} />
            </div>
          </div>

          {/* People section */}
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>People</div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 16, overflow: 'hidden' }}>
            {/* Primary owner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: tenant.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{ownerInitials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text)' }}>{tenant.owner}</span>
                  <span className="pill pill-blue" style={{ fontSize: 9 }}>Primary Owner</span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                  {tenant.ownerEmail}{tenant.ownerTitle && ` · ${tenant.ownerTitle}`}
                </div>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', flexShrink: 0 }}>Since {tenant.since}</span>
            </div>
            {/* Managers */}
            {(tenant.managers ?? []).map((m, i) => {
              const roleColor = m.role === 'Co-Admin' ? 'pill-amber' : m.role === 'Technical Lead' ? 'pill-green' : m.role === 'Billing Contact' ? 'pill-cyan' : 'pill-blue'
              const mInit = m.name.split(' ').map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase()
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: i < (tenant.managers ?? []).length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg4)', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{mInit}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text)' }}>{m.name}</span>
                      <span className={`pill ${roleColor}`} style={{ fontSize: 9 }}>{m.role}</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                      {m.email}{m.title && ` · ${m.title}`}
                    </div>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', flexShrink: 0 }}>Since {m.since}</span>
                </div>
              )
            })}
            {(tenant.managers ?? []).length === 0 && (
              <div style={{ padding: '10px 14px', fontSize: 'var(--text-xs)', color: 'var(--text3)', fontStyle: 'italic' }}>
                No additional managers — only the primary owner manages this tenant.
              </div>
            )}
          </div>

          {/* Alerts */}
          {tenant.alerts.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Alerts ({tenant.alerts.length})</div>
              {tenant.alerts.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 4, background: 'var(--bg2)' }}>
                  <AlertTriangle size={12} style={{ color: SEV_COLOR[a.type], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{a.msg}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{a.time}</span>
                  <button className="btn btn-xs btn-ghost" onClick={(e) => { e.stopPropagation(); showToast('Alert acknowledged') }}>Ack</button>
                </div>
              ))}
            </div>
          )}

          {/* Recent Activity */}
          {tenant.activity.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Recent Activity</div>
              {tenant.activity.map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 'var(--text-xs)', borderBottom: i < tenant.activity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--text3)', minWidth: 70, flexShrink: 0 }}>{act.time}</span>
                  <span style={{ fontWeight: 500, color: 'var(--text2)' }}>{act.user}</span>
                  <span style={{ color: 'var(--text3)' }}>{act.action}</span>
                </div>
              ))}
            </div>
          )}

          {/* Billing summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Plan', value: tenant.billing.plan },
              { label: 'Monthly', value: `$${tenant.billing.monthly.toLocaleString()}`, color: 'var(--green)' },
              { label: 'Next Invoice', value: tenant.billing.nextInvoice },
              { label: 'Payment', value: tenant.billing.paymentMethod },
            ].map((b) => (
              <div key={b.label} style={{ padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}>
                <div style={{ color: 'var(--text3)', marginBottom: 2 }}>{b.label}</div>
                <div style={{ fontWeight: 600, color: b.color ?? 'var(--text2)' }}>{b.value}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); onManage(tenant) }}>Manage</button>
            <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); showToast('View Sources coming soon', 'info') }}>View Sources</button>
            <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); showToast('Billing portal opening...', 'info') }}>Billing</button>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button
                className="btn btn-xs btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={(e) => { e.stopPropagation(); showToast(`Notification sent to ${tenant.name}`) }}
              >
                <Bell size={11} /> Notify
              </button>

              {(tenant.status === 'active' || tenant.status === 'trial') && onStatusChange && (
                <button
                  className="btn btn-xs btn-ghost"
                  style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={(e) => { e.stopPropagation(); onStatusChange(tenant.id, 'suspended'); showToast(`${tenant.name} suspended`, 'warn') }}
                >
                  <XCircle size={11} /> Suspend
                </button>
              )}

              {tenant.status === 'suspended' && onStatusChange && (
                <button
                  className="btn btn-xs btn-ghost"
                  style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={(e) => { e.stopPropagation(); onStatusChange(tenant.id, 'active'); showToast(`${tenant.name} reactivated`) }}
                >
                  <CheckCircle size={11} /> Reactivate
                </button>
              )}

              {tenant.status === 'pending' && onStatusChange && (
                <button
                  className="btn btn-xs btn-ghost"
                  style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={(e) => { e.stopPropagation(); onStatusChange(tenant.id, 'active'); showToast(`${tenant.name} approved and activated`) }}
                >
                  <CheckCircle size={11} /> Approve
                </button>
              )}

              {onDelete && !confirmDelete && (
                <button
                  className="btn btn-xs btn-ghost"
                  style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
                >
                  <Trash2 size={11} /> Delete
                </button>
              )}

              {onDelete && confirmDelete && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                  <input
                    className="form-input"
                    style={{ width: 140, fontSize: 11, padding: '3px 6px' }}
                    placeholder={`Type "${tenant.name}" to confirm`}
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="btn btn-xs btn-ghost"
                    style={{ color: 'var(--red)' }}
                    onClick={() => {
                      if (deleteInput === tenant.name) { onDelete(tenant.id) }
                      else { showToast('Name does not match', 'warn') }
                    }}
                  >
                    Confirm
                  </button>
                  <button className="btn btn-xs btn-ghost" onClick={() => { setConfirmDelete(false); setDeleteInput('') }}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
