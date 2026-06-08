import { useState } from 'react'
import { cn } from '@/lib/utils'
import TeamPage from '@/features/team/TeamPage'
import { UserPlus, Shield, CheckCircle2, Clock, ChevronDown, ChevronRight } from 'lucide-react'

const TABS = ['Team', 'Platform Users', 'Access Policies', 'Access Review']

const PLATFORM_ROLES = [
  { id: 'platform_admin', name: 'Platform Admin', color: '#ef4444', desc: 'Full platform access including billing, tenants, and user management' },
  { id: 'workspace_admin', name: 'Workspace Admin', color: '#f59e0b', desc: 'Manage workspace settings, sources, and pipelines. No billing or tenant access' },
  { id: 'data_engineer', name: 'Data Engineer', color: '#06b6d4', desc: 'Connect sources, build pipelines, manage mappings and alerts' },
  { id: 'decision_maker', name: 'Decision Maker', color: '#8b5cf6', desc: 'View dashboards, run actions, access Ask AI and data cards' },
  { id: 'analyst', name: 'Analyst', color: '#10b981', desc: 'Read-only access to dashboards, AI insights, and data cards' },
  { id: 'viewer', name: 'Viewer', color: '#6b7280', desc: 'Dashboard-only access, no data modification or pipeline access' },
]

const PERM_MODULES = ['sources', 'pipeline', 'mapping', 'dashboard', 'alerts', 'actions', 'askai', 'datacards', 'team', 'tenants', 'billing']

const MOCK_PLATFORM_USERS: {
  id: string; name: string; email: string; initials: string; color: string;
  role: string; status: string; mfa: boolean; lastLogin: string; sessions: number;
  logins: number; created: string; sso: boolean; perms: string[];
  invitedBy?: string; tenants: string[]
}[] = [
  { id: 'usr-001', name: 'Sarah Kim', email: 'sarah@co.com', initials: 'SK', color: '#6366f1', role: 'Platform Admin', status: 'active', mfa: true, lastLogin: 'Today', sessions: 2, logins: 142, created: 'Jan 2025', sso: true, perms: ['sources', 'pipeline', 'dashboard', 'alerts', 'actions', 'team', 'tenants', 'billing'], tenants: [] },
  { id: 'usr-002', name: 'Raj Desai', email: 'raj@co.com', initials: 'RD', color: '#f59e0b', role: 'Data Engineer', status: 'active', mfa: true, lastLogin: '2 days ago', sessions: 1, logins: 87, created: 'Mar 2025', sso: false, perms: ['sources', 'pipeline', 'mapping', 'alerts'], tenants: [] },
  { id: 'usr-003', name: 'Lisa Chen', email: 'lisa@co.com', initials: 'LC', color: '#10b981', role: 'Analyst', status: 'active', mfa: false, lastLogin: 'Today', sessions: 1, logins: 63, created: 'May 2025', sso: false, perms: ['dashboard', 'askai', 'datacards', 'alerts'], tenants: [] },
  { id: 'usr-004', name: 'Mike Johnson', email: 'mike@co.com', initials: 'MJ', color: '#8b5cf6', role: 'Decision Maker', status: 'active', mfa: true, lastLogin: 'Yesterday', sessions: 1, logins: 211, created: 'Jan 2025', sso: true, perms: ['dashboard', 'alerts', 'actions', 'askai'], tenants: [] },
  { id: 'usr-005', name: 'Tom Baker', email: 'tom@co.com', initials: 'TB', color: '#06b6d4', role: 'Workspace Admin', status: 'active', mfa: true, lastLogin: '3 days ago', sessions: 0, logins: 44, created: 'Jun 2025', sso: false, perms: ['sources', 'pipeline', 'mapping', 'dashboard', 'alerts', 'actions', 'team'], tenants: [] },
  { id: 'usr-006', name: 'Ana Rodriguez', email: 'ana@co.com', initials: 'AR', color: '#ec4899', role: 'Analyst', status: 'active', mfa: false, lastLogin: 'Today', sessions: 1, logins: 28, created: 'Aug 2025', sso: false, perms: ['dashboard', 'askai', 'datacards'], tenants: [] },
  { id: 'usr-007', name: 'Klaus Weber', email: 'Klaus@co.com', initials: 'KW', color: '#f97316', role: 'Workspace Admin', status: 'active', mfa: true, lastLogin: '1 day ago', sessions: 1, logins: 76, created: 'Feb 2025', sso: false, perms: ['sources', 'pipeline', 'dashboard', 'alerts', 'team'], tenants: [] },
  { id: 'usr-008', name: 'David Park', email: 'david@co.com', initials: 'DP', color: '#84cc16', role: 'Analyst', status: 'invited', mfa: false, lastLogin: '—', sessions: 0, logins: 0, created: 'Apr 2026', sso: false, perms: [], invitedBy: 'Sarah Kim', tenants: [] },
  { id: 'usr-009', name: 'Emma Stone', email: 'emma@co.com', initials: 'ES', color: '#a855f7', role: 'Data Engineer', status: 'invited', mfa: false, lastLogin: '—', sessions: 0, logins: 0, created: 'Apr 2026', sso: false, perms: [], invitedBy: 'Sarah Kim', tenants: [] },
  { id: 'usr-010', name: 'Old Account', email: 'old@co.com', initials: 'OA', color: '#6b7280', role: 'Analyst', status: 'suspended', mfa: false, lastLogin: '32 days ago', sessions: 0, logins: 12, created: 'Jan 2025', sso: false, perms: [], tenants: [] },
]

const MOCK_POLICIES = [
  { role: 'Data Engineer', resource: 'All Tables', permission: 'Read/Write', condition: 'Tenant-scoped', enabled: true },
  { role: 'Data Scientist', resource: 'Feature Store', permission: 'Read/Execute', condition: 'Project-scoped', enabled: true },
  { role: 'Analyst', resource: 'BI Views', permission: 'Read Only', condition: 'Row-level security', enabled: true },
  { role: 'ML Ops', resource: 'Models, Pipelines', permission: 'Full Access', condition: 'Namespace-scoped', enabled: true },
  { role: 'Auditor', resource: 'Audit Logs', permission: 'Read Only', condition: 'Time-bounded', enabled: true },
  { role: 'External API', resource: 'Public Endpoints', permission: 'Read Only', condition: 'Rate-limited', enabled: false },
]

const MOCK_AUDIT_LOG = [
  { user: 'Sarah Kim', tenant: 'Acme', event: 'Login', type: 'auth', time: '2 min ago' },
  { user: 'Mike Johnson', tenant: 'Acme', event: 'Login', type: 'auth', time: '15 min ago' },
  { user: 'Raj Desai', tenant: 'Acme', event: 'Pipeline #47 triggered', type: 'action', time: '1 hr ago' },
  { user: 'Lisa Chen', tenant: 'Acme', event: 'CSV export: customers', type: 'export', time: '3 hr ago' },
  { user: 'System', tenant: 'Acme', event: 'MFA reminder sent to Lisa Chen', type: 'security', time: '3 hr ago' },
  { user: 'Klaus Weber', tenant: 'Atlas', event: 'Connected Stripe', type: 'action', time: '2 days ago' },
  { user: 'System', tenant: 'Beta', event: 'Account suspended', type: 'security', time: '15 days ago' },
  { user: 'James Wright', tenant: 'Meridian', event: 'Last login (stale)', type: 'auth', time: '18 days ago' },
]

const MOCK_ACCESS_REVIEW = [
  { user: 'Lisa Chen', role: 'Data Scientist', resource: 'Feature Store', lastUsed: 'Today', certifier: 'Raj Desai', status: 'pending' },
  { user: 'Tom Baker', role: 'Platform Engineer', resource: 'All Infrastructure', lastUsed: '3 days ago', certifier: 'Sarah Kim', status: 'approved' },
  { user: 'Ana Rodriguez', role: 'Analyst', resource: 'BI Views', lastUsed: 'Today', certifier: 'Mike Johnson', status: 'pending' },
  { user: 'Klaus Weber', role: 'CISO', resource: 'Full Platform Access', lastUsed: '1 day ago', certifier: 'Board Review', status: 'approved' },
  { user: 'Old User', role: 'Analyst', resource: 'BI Views', lastUsed: '45 days ago', certifier: 'Mike Johnson', status: 'pending' },
]

function rolePillClass(role: string): string {
  const map: Record<string, string> = {
    'Platform Admin': 'pill pill-red',
    'Workspace Admin': 'pill pill-amber',
    'Data Engineer': 'pill pill-cyan',
    'Data Scientist': 'pill pill-purple',
    'Analyst': 'pill pill-green',
    'Decision Maker': 'pill pill-blue',
    'Viewer': 'pill',
  }
  return map[role] ?? 'pill'
}

function statusPillClass(status: string): string {
  const map: Record<string, string> = {
    active: 'pill pill-green',
    invited: 'pill pill-cyan',
    pending: 'pill pill-amber',
    suspended: 'pill pill-red',
  }
  return map[status] ?? 'pill'
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

function hasModuleAccess(roleId: string, mod: string): boolean {
  if (roleId === 'platform_admin') return true
  if (roleId === 'workspace_admin') return !['tenants', 'billing'].includes(mod)
  if (roleId === 'data_engineer') return ['sources', 'pipeline', 'mapping', 'alerts'].includes(mod)
  if (roleId === 'decision_maker') return ['dashboard', 'alerts', 'actions', 'askai'].includes(mod)
  if (roleId === 'analyst') return ['dashboard', 'askai', 'datacards', 'alerts'].includes(mod)
  if (roleId === 'viewer') return mod === 'dashboard'
  return false
}

export default function TeamUsersPage() {
  const [activeTab, setActiveTab] = useState('Team')
  const [userTab, setUserTab] = useState('All Users')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [users, setUsers] = useState(MOCK_PLATFORM_USERS)
  const [policyEnabled, setPolicyEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_POLICIES.map((p) => [`${p.role}-${p.resource}`, p.enabled])),
  )
  const [reviewActions, setReviewActions] = useState<Record<string, 'approved' | 'revoked' | null>>({})

  const active = users.filter((u) => u.status === 'active').length
  const invited = users.filter((u) => u.status === 'invited').length
  const susp = users.filter((u) => u.status === 'suspended').length
  const mfaOn = users.filter((u) => u.mfa).length
  const totalSessions = users.reduce((a, u) => a + u.sessions, 0)
  const noMfa = users.filter((u) => u.status === 'active' && !u.mfa).length
  const stale = users.filter((u) => u.status === 'active' && u.lastLogin.includes('day') && parseInt(u.lastLogin) > 14).length

  const USER_INNER_TABS = ['All Users', 'Roles & Permissions', `Sessions (${totalSessions})`, 'Security Log']

  function setUserStatus(uid: string, st: string) {
    setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, status: st, sessions: st === 'suspended' ? 0 : u.sessions } : u))
    showToast(st === 'suspended' ? 'User suspended' : 'User reactivated')
  }

  function killUserSessions(uid: string) {
    setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, sessions: 0 } : u))
    showToast('Sessions terminated')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Team & Access
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          Team members, platform users, access policies, and periodic access reviews
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t} className={cn('tab', activeTab === t && 'active')} onClick={() => setActiveTab(t)} type="button">
            {t}
          </button>
        ))}
      </div>

      {/* Team tab */}
      {activeTab === 'Team' && <TeamPage />}

      {/* Platform Users */}
      {activeTab === 'Platform Users' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'Total Users', value: users.length, color: 'var(--text)' },
              { label: 'Active', value: active, color: 'var(--green)' },
              { label: 'Invited', value: invited, color: 'var(--blue)' },
              { label: 'Suspended', value: susp, color: susp > 0 ? 'var(--amber)' : 'var(--text3)' },
              { label: 'MFA Enabled', value: `${mfaOn} / ${users.length}`, color: 'var(--text)' },
              { label: 'Sessions', value: totalSessions, color: 'var(--cyan)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Inner tabs + Invite button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {USER_INNER_TABS.map((t) => (
                <button key={t} className={cn('btn btn-xs', userTab === t ? 'btn-primary' : 'btn-ghost')} onClick={() => setUserTab(t)} type="button">{t}</button>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Invite dialog coming soon')}>
              <UserPlus size={13} /> Invite User
            </button>
          </div>

          {/* ── All Users sub-tab ── */}
          {userTab === 'All Users' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 28 }} />
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>MFA</th>
                    <th>Last Login</th>
                    <th style={{ textAlign: 'center' }}>Sessions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isExp = expandedUser === u.id
                    const loginWarn = u.lastLogin.includes('day') && parseInt(u.lastLogin) > 14
                    return (
                      <>
                        <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => setExpandedUser(isExp ? null : u.id)}>
                          <td style={{ color: 'var(--text3)', fontSize: 10 }}>
                            {isExp ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{u.initials}</div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{u.name}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={rolePillClass(u.role)} style={{ fontSize: 10 }}>{u.role}</span></td>
                          <td><span className={statusPillClass(u.status)} style={{ fontSize: 10 }}>{u.status}</span></td>
                          <td style={{ textAlign: 'center' }}>
                            {u.mfa ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> : <span style={{ color: 'var(--amber)', fontWeight: 700 }}>✗</span>}
                          </td>
                          <td style={{ fontSize: 'var(--text-xs)', color: loginWarn ? 'var(--amber)' : 'var(--text3)' }}>{u.lastLogin}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{u.sessions}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Editing ${u.name}`)}>Edit</button>
                          </td>
                        </tr>
                        {isExp && (
                          <tr key={`${u.id}-detail`}>
                            <td colSpan={8} style={{ padding: 0 }}>
                              <div style={{ background: 'var(--bg)', padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                  {/* Account */}
                                  <div style={{ padding: 10, background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>Account</div>
                                    <div style={{ fontSize: 'var(--text-xs)', lineHeight: 1.8 }}>
                                      Created: {u.created}<br />
                                      Logins: {u.logins}<br />
                                      SSO: {u.sso ? 'Yes' : 'No'}
                                      {u.invitedBy && <><br />Invited by: {u.invitedBy}</>}
                                    </div>
                                  </div>
                                  {/* Permissions */}
                                  <div style={{ padding: 10, background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>Permissions</div>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                      {u.perms.length > 0 ? u.perms.map((p) => (
                                        <span key={p} className="pill pill-blue" style={{ fontSize: 10 }}>{p}</span>
                                      )) : <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>None</span>}
                                    </div>
                                  </div>
                                  {/* Actions */}
                                  <div style={{ padding: 10, background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>Actions</div>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                      <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Editing ${u.name}`)}>Edit</button>
                                      <button className="btn btn-xs btn-ghost" onClick={() => showToast('Password reset link sent')}>Reset Password</button>
                                      {!u.mfa && <button className="btn btn-xs btn-ghost" onClick={() => showToast('MFA requirement enabled')}>Require MFA</button>}
                                      {u.sessions > 0 && <button className="btn btn-xs btn-ghost" style={{ color: 'var(--amber)' }} onClick={() => killUserSessions(u.id)}>Kill Sessions</button>}
                                      {u.status === 'active' && <button className="btn btn-xs btn-ghost" style={{ color: 'var(--red)' }} onClick={() => setUserStatus(u.id, 'suspended')}>Suspend</button>}
                                      {u.status === 'suspended' && <button className="btn btn-xs btn-ghost" style={{ color: 'var(--green)' }} onClick={() => setUserStatus(u.id, 'active')}>Reactivate</button>}
                                      <button className="btn btn-xs btn-ghost" style={{ color: 'var(--red)' }} onClick={() => { setUsers((prev) => prev.filter((x) => x.id !== u.id)); setExpandedUser(null); showToast('User deleted') }}>Delete</button>
                                    </div>
                                  </div>
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

          {/* ── Roles & Permissions sub-tab ── */}
          {userTab === 'Roles & Permissions' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 16 }}>
                Roles define what each user can access. Click Edit to customize permissions.
              </p>
              {PLATFORM_ROLES.map((r) => {
                const count = users.filter((u) => u.role === r.name).length
                return (
                  <div key={r.id} className="card" style={{ padding: '12px 16px', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${r.color}22`, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', flexShrink: 0 }}>{r.name.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{r.name} <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>({count} user{count !== 1 ? 's' : ''})</span></div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{r.desc}</div>
                      </div>
                      <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Edit ${r.name} role`)}>Edit</button>
                    </div>
                  </div>
                )
              })}

              {/* Permission Matrix */}
              <div className="card" style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)' }}>Permission Matrix</div>
                <table className="data-table" style={{ fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>Module</th>
                      {PLATFORM_ROLES.map((r) => (
                        <th key={r.id} style={{ textAlign: 'center', color: r.color, fontSize: 10 }}>{r.name.split(' ')[0]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERM_MODULES.map((mod) => (
                      <tr key={mod}>
                        <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>{mod}</td>
                        {PLATFORM_ROLES.map((r) => {
                          const has = hasModuleAccess(r.id, mod)
                          return (
                            <td key={r.id} style={{ textAlign: 'center', color: has ? 'var(--green)' : 'var(--text3)' }}>
                              {has ? '✓' : '—'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Sessions sub-tab ── */}
          {userTab.startsWith('Sessions') && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 10 }}>
                {totalSessions} active session{totalSessions !== 1 ? 's' : ''} across {users.filter((u) => u.sessions > 0).length} users.
              </p>
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--red)', marginBottom: 14, borderColor: 'var(--red)' }} onClick={() => { setUsers((prev) => prev.map((u) => ({ ...u, sessions: 0 }))); showToast('All sessions terminated') }}>
                Kill All Sessions
              </button>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>User</th><th>Sessions</th><th>Last Active</th><th>IP</th><th>Device</th><th /></tr>
                  </thead>
                  <tbody>
                    {users.filter((u) => u.sessions > 0).map((u, i) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: u.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 9, flexShrink: 0 }}>{u.initials}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>{u.name}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{u.sessions}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{u.lastLogin}</td>
                        <td style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--mono)' }}>192.168.1.{100 + i * 7}</td>
                        <td style={{ fontSize: 'var(--text-xs)' }}>Chrome / macOS</td>
                        <td>
                          <button className="btn btn-xs btn-ghost" style={{ color: 'var(--red)' }} onClick={() => killUserSessions(u.id)}>Kill</button>
                        </td>
                      </tr>
                    ))}
                    {users.filter((u) => u.sessions > 0).length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>No active sessions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Security Log sub-tab ── */}
          {userTab === 'Security Log' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'No MFA', value: noMfa, color: noMfa > 0 ? 'var(--amber)' : 'var(--green)', warn: noMfa > 0 },
                  { label: 'Stale (14d+)', value: stale, color: stale > 0 ? 'var(--amber)' : 'var(--green)', warn: stale > 0 },
                  { label: 'SSO Users', value: users.filter((u) => u.sso).length, color: 'var(--text)', warn: false },
                  { label: 'Failed Logins (24h)', value: 0, color: 'var(--green)', warn: false },
                ].map((s) => (
                  <div key={s.label} className="stat" style={{ borderColor: s.warn ? 'var(--amber)' : undefined }}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table" style={{ fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr><th>Time</th><th>User</th><th>Tenant</th><th>Event</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    {MOCK_AUDIT_LOG.map((l, i) => {
                      const tc = l.type === 'auth' ? 'pill-blue' : l.type === 'action' ? 'pill-cyan' : l.type === 'export' ? 'pill-amber' : 'pill-red'
                      return (
                        <tr key={i}>
                          <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>{l.time}</td>
                          <td style={{ fontWeight: 600 }}>{l.user}</td>
                          <td>{l.tenant}</td>
                          <td>{l.event}</td>
                          <td><span className={`pill ${tc}`} style={{ fontSize: 10 }}>{l.type}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Access Policies */}
      {activeTab === 'Access Policies' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text)' }}>
              <Shield size={14} style={{ color: 'var(--purple)' }} />
              OPA Access Policies
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Add policy dialog coming soon')}>Add Policy</button>
          </div>

          {/* Policy stats */}
          <div className="stat-grid-4" style={{ marginBottom: 16 }}>
            {[
              { label: 'Active Policies', value: MOCK_POLICIES.filter(p => p.enabled).length, color: 'var(--green)' },
              { label: 'Roles', value: MOCK_POLICIES.length, color: 'var(--text)' },
              { label: 'Denied (24h)', value: 3, color: 'var(--amber)' },
              { label: 'Last Review', value: '7 days ago', color: 'var(--text3)' },
            ].map((s) => <div key={s.label} className="stat"><div className="stat-label">{s.label}</div><div className="stat-value" style={{ color: s.color, fontSize: typeof s.value === 'string' ? 'var(--text-sm)' : undefined }}>{s.value}</div></div>)}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <table className="data-table">
              <thead>
                <tr><th>Role</th><th>Resource</th><th>Permission</th><th>Condition</th><th>Enabled</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {MOCK_POLICIES.map((p) => {
                  const key = `${p.role}-${p.resource}`
                  const enabled = policyEnabled[key] ?? p.enabled
                  return (
                    <tr key={key}>
                      <td style={{ fontWeight: 600 }}>{p.role}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{p.resource}</td>
                      <td><span className="pill pill-blue" style={{ fontSize: '10px' }}>{p.permission}</span></td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{p.condition}</td>
                      <td>
                        <button className={cn('btn btn-xs', enabled ? 'btn-primary' : 'btn-ghost')} onClick={() => { setPolicyEnabled((prev) => ({ ...prev, [key]: !prev[key] })); showToast(enabled ? `Policy disabled for ${p.role}` : `Policy enabled for ${p.role}`) }}>
                          {enabled ? 'On' : 'Off'}
                        </button>
                      </td>
                      <td><button className="btn btn-xs btn-ghost" onClick={() => showToast('Edit policy coming soon')}>Edit</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Recent Audit Events */}
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 10 }}>Recent Audit Events</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table" style={{ fontSize: 'var(--text-xs)' }}>
              <thead><tr><th>Time</th><th>User</th><th>Tenant</th><th>Event</th><th>Type</th></tr></thead>
              <tbody>
                {MOCK_AUDIT_LOG.slice(0, 5).map((l, i) => {
                  const tc = l.type === 'auth' ? 'pill-blue' : l.type === 'action' ? 'pill-cyan' : l.type === 'export' ? 'pill-amber' : 'pill-red'
                  return (
                    <tr key={i}>
                      <td style={{ color: 'var(--text3)' }}>{l.time}</td>
                      <td style={{ fontWeight: 600 }}>{l.user}</td>
                      <td>{l.tenant}</td>
                      <td>{l.event}</td>
                      <td><span className={`pill ${tc}`} style={{ fontSize: 10 }}>{l.type}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Access Review */}
      {activeTab === 'Access Review' && (
        <div>
          {/* Stats */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Pending Reviews', value: MOCK_ACCESS_REVIEW.filter((r) => (reviewActions[`${r.user}-${r.resource}`] ?? r.status) === 'pending').length, color: 'var(--amber)' },
              { label: 'Approved (30d)', value: MOCK_ACCESS_REVIEW.filter((r) => (reviewActions[`${r.user}-${r.resource}`] ?? r.status) === 'approved').length, color: 'var(--green)' },
              { label: 'Revoked (30d)', value: MOCK_ACCESS_REVIEW.filter((r) => (reviewActions[`${r.user}-${r.resource}`] ?? r.status) === 'revoked').length, color: 'var(--red)' },
              { label: 'Next Review', value: 'Jul 1, 2026', color: 'var(--text3)' },
            ].map((s) => <div key={s.label} className="stat"><div className="stat-label">{s.label}</div><div className="stat-value" style={{ color: s.color, fontSize: typeof s.value === 'string' ? 'var(--text-sm)' : undefined }}>{s.value}</div></div>)}
          </div>

          {/* Review Schedule card */}
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Quarterly Access Review</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Frequency: Quarterly · Next review: Jul 1, 2026 · Auto-Revoke: 45 days inactive · Notify via: Email</div>
            </div>
            <button className="btn btn-xs btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => showToast('Schedule settings saved')}>Edit Schedule</button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Resource</th><th>Last Used</th><th>Certifier</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {MOCK_ACCESS_REVIEW.map((r) => {
                  const key = `${r.user}-${r.resource}`
                  const currentStatus = reviewActions[key] ?? r.status
                  return (
                    <tr key={key}>
                      <td style={{ fontWeight: 600 }}>{r.user}</td>
                      <td><span className={rolePillClass(r.role)} style={{ fontSize: '10px' }}>{r.role}</span></td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>{r.resource}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: r.lastUsed.includes('45') ? 'var(--amber)' : 'var(--text3)' }}>{r.lastUsed}</td>
                      <td style={{ color: 'var(--text2)' }}>{r.certifier}</td>
                      <td>
                        <span className={currentStatus === 'approved' ? 'pill pill-green' : currentStatus === 'revoked' ? 'pill pill-red' : 'pill pill-amber'} style={{ fontSize: '10px' }}>{currentStatus}</span>
                      </td>
                      <td>
                        {currentStatus === 'pending' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-xs btn-primary" onClick={() => { setReviewActions((prev) => ({ ...prev, [key]: 'approved' })); showToast(`Access approved for ${r.user}`) }}>
                              <CheckCircle2 size={10} /> Approve
                            </button>
                            <button className="btn btn-xs btn-ghost" style={{ color: 'var(--red)' }} onClick={() => { setReviewActions((prev) => ({ ...prev, [key]: 'revoked' })); showToast(`Access revoked for ${r.user}`) }}>
                              Revoke
                            </button>
                          </div>
                        )}
                        {currentStatus !== 'pending' && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{currentStatus === 'approved' ? 'Certified' : 'Revoked'}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
