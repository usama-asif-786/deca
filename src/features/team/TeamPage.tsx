import { useState } from 'react'
import { useGetTeamQuery } from '@/app/services/api'
import type { TeamMember } from '@/lib/mockData'
import TeamGrid from './components/TeamGrid'
import Pill from '@/components/common/Pill'
import { UserPlus, Mail, LayoutGrid, List, RefreshCw, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const PENDING_INVITES = [
  { id: 'inv-1', email: 'james.wilson@acme.com', role: 'Analyst', sentBy: 'Sarah Chen', sentAt: '2 days ago' },
  { id: 'inv-2', email: 'lisa.park@globex.com', role: 'Viewer', sentBy: 'Marcus Webb', sentAt: '4 days ago' },
  { id: 'inv-3', email: 'tom.harris@initech.com', role: 'Manager', sentBy: 'Sarah Chen', sentAt: '1 week ago' },
]

const ROLE_PERMISSIONS = [
  { role: 'Admin', perms: { connect: true, mapping: true, pipeline: true, dashboard: true, alerts: true, askAi: true, actions: true, team: true } },
  { role: 'Manager', perms: { connect: true, mapping: true, pipeline: true, dashboard: true, alerts: true, askAi: true, actions: false, team: false } },
  { role: 'Analyst', perms: { connect: false, mapping: true, pipeline: true, dashboard: true, alerts: true, askAi: true, actions: false, team: false } },
  { role: 'Viewer', perms: { connect: false, mapping: false, pipeline: false, dashboard: true, alerts: false, askAi: false, actions: false, team: false } },
]

const PERM_MODULES = ['connect', 'mapping', 'pipeline', 'dashboard', 'alerts', 'askAi', 'actions', 'team'] as const
const MODULE_LABELS: Record<typeof PERM_MODULES[number], string> = {
  connect: 'Connect', mapping: 'Mapping', pipeline: 'Pipeline', dashboard: 'Dashboard',
  alerts: 'Alerts', askAi: 'Ask AI', actions: 'Actions', team: 'Team',
}

const RECENT_ACTIVITY = [
  { id: 'act-1', initials: 'SC', color: '#6366f1', name: 'Sarah Chen', action: 'Invited james.wilson@acme.com as Analyst', time: '2 days ago' },
  { id: 'act-2', initials: 'MW', color: '#f59e0b', name: 'Marcus Webb', action: 'Updated role for Lisa Park: Viewer → Analyst', time: '3 days ago' },
  { id: 'act-3', initials: 'SC', color: '#6366f1', name: 'Sarah Chen', action: 'Removed Jordan Lee from the team', time: '5 days ago' },
  { id: 'act-4', initials: 'RJ', color: '#10b981', name: 'Rachel Johnson', action: 'Accepted invite and joined as Manager', time: '1 week ago' },
  { id: 'act-5', initials: 'MW', color: '#f59e0b', name: 'Marcus Webb', action: 'Resent invite to tom.harris@initech.com', time: '1 week ago' },
]

const STATUS_VARIANT: Record<TeamMember['status'], 'green' | 'amber' | 'gray'> = {
  active: 'green',
  away: 'amber',
  offline: 'gray',
}

const PERMISSION_VARIANT: Record<string, 'red' | 'cyan' | 'blue'> = {
  admin: 'red',
  write: 'cyan',
  read: 'blue',
}

type ViewMode = 'card' | 'table'

export default function TeamPage() {
  const { data: team = [], isLoading } = useGetTeamQuery()
  const [view, setView] = useState<ViewMode>('card')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = team.filter((m) => {
    if (statusFilter === 'all') return true
    return m.status === statusFilter
  })

  const activeCount = team.filter((m) => m.status === 'active').length
  const awayCount = team.filter((m) => m.status === 'away').length
  const offlineCount = team.filter((m) => m.status === 'offline').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            Team & Users
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
            {team.length} members · {activeCount} active · {awayCount} away · {offlineCount} offline
          </p>
        </div>
        <button className="btn btn-primary btn-sm">
          <UserPlus size={14} />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid-4" style={{ marginBottom: 18 }}>
        {[
          { label: 'Total Members', value: team.length, color: 'var(--text)' },
          { label: 'Active Now', value: activeCount, color: 'var(--green)' },
          { label: 'Admins', value: team.filter((m) => m.permissions.includes('admin')).length, color: 'var(--orange)' },
          { label: 'Read-Only', value: team.filter((m) => !m.permissions.includes('write')).length, color: 'var(--text3)' },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-8" style={{ marginBottom: 14 }}>
        {/* Status filters */}
        <div className="flex gap-4">
          {(['all', 'active', 'away', 'offline'] as const).map((s) => (
            <button
              key={s}
              className={cn('btn btn-xs', statusFilter === s ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button
            className={cn('btn btn-xs', view === 'card' ? 'btn-primary' : 'btn-ghost')}
            onClick={() => setView('card')}
            aria-label="Card view"
          >
            <LayoutGrid size={13} />
          </button>
          <button
            className={cn('btn btn-xs', view === 'table' ? 'btn-primary' : 'btn-ghost')}
            onClick={() => setView('table')}
            aria-label="Table view"
          >
            <List size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
          <span className="spinner" style={{ marginRight: 8 }} />
          Loading team…
        </div>
      ) : view === 'card' ? (
        <TeamGrid members={filtered} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Permissions</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: m.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 11,
                          flexShrink: 0,
                        }}
                      >
                        {m.initials}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>{m.role}</td>
                  <td>
                    <a
                      href={`mailto:${m.email}`}
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Mail size={11} />
                      {m.email}
                    </a>
                  </td>
                  <td>
                    <Pill variant={STATUS_VARIANT[m.status]}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </Pill>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {m.permissions.map((p) => (
                        <Pill key={p} variant={PERMISSION_VARIANT[p] ?? 'gray'}>
                          {p}
                        </Pill>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-xs btn-ghost">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Invites */}
      {PENDING_INVITES.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)' }}>
              Pending Invites <span style={{ color: 'var(--amber)', fontWeight: 400, fontSize: 'var(--text-sm)', marginLeft: 6 }}>({PENDING_INVITES.length})</span>
            </h2>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Sent By</th>
                  <th>Sent</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {PENDING_INVITES.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>{inv.email}</td>
                    <td><Pill variant="blue">{inv.role}</Pill></td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>{inv.sentBy}</td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)' }}>{inv.sentAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-xs btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <RefreshCw size={11} /> Resend
                        </button>
                        <button className="btn btn-xs btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)' }}>
                          <X size={11} /> Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Permissions */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
          Role Permissions
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                {PERM_MODULES.map((m) => (
                  <th key={m} style={{ textAlign: 'center' }}>{MODULE_LABELS[m]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_PERMISSIONS.map((row) => (
                <tr key={row.role}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{row.role}</td>
                  {PERM_MODULES.map((m) => (
                    <td key={m} style={{ textAlign: 'center' }}>
                      {row.perms[m] ? (
                        <Check size={14} style={{ color: 'var(--green)', margin: '0 auto' }} />
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: 'var(--text-sm)' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
          Recent Activity
        </h2>
        <div className="card" style={{ padding: '4px 0' }}>
          {RECENT_ACTIVITY.map((act, i) => (
            <div
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: act.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 10,
                  flexShrink: 0,
                }}
              >
                {act.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{act.name}</span>
                <span style={{ color: 'var(--text2)', fontSize: 'var(--text-sm)', marginLeft: 6 }}>{act.action}</span>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', flexShrink: 0 }}>{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
