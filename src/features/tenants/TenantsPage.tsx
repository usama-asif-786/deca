import { useState, useEffect } from 'react'
import { useGetTenantsQuery } from '@/app/services/api'
import type { Tenant } from '@/lib/mockData'
import TenantCard from './components/TenantCard'
import CreateTenantModal from './components/CreateTenantModal'
import ManageTenantModal from './components/ManageTenantModal'
import Tabs from '@/components/common/Tabs'
import SearchInput from '@/components/common/SearchInput'
import { Plus, DollarSign, Users, Building2, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const FILTER_TABS = [
  { id: 'all', label: 'All Tenants' },
  { id: 'active', label: 'Active' },
  { id: 'trial', label: 'Trial' },
]

const MAIN_TABS = ['Tenants', 'Alerts', 'Billing', 'Usage']

export default function TenantsPage() {
  // ─── TODO: Replace localTenants with RTK Query cache invalidation after mutations ───
  const { data: apiTenants = [], isLoading } = useGetTenantsQuery()
  const [localTenants, setLocalTenants] = useState<Tenant[]>([])

  useEffect(() => {
    if (apiTenants.length > 0 && localTenants.length === 0) {
      setLocalTenants(apiTenants)
    }
  }, [apiTenants]) // eslint-disable-line react-hooks/exhaustive-deps

  // Use local state if populated, otherwise fall back to RTK data
  const tenants = localTenants.length > 0 ? localTenants : apiTenants

  const [mainTab, setMainTab] = useState('Tenants')
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null)

  // Wizard modals
  const [showCreate, setShowCreate] = useState(false)
  const [managingTenant, setManagingTenant] = useState<Tenant | null>(null)

  // Toast-style success message
  const [successMsg, setSuccessMsg] = useState('')

  const filtered = tenants.filter((t) => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'active' && t.status === 'active') ||
      (activeTab === 'trial' && t.status === 'trial')
    const matchSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.industry.toLowerCase().includes(search.toLowerCase()) ||
      t.owner.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  // Aggregate MRR
  const totalMRR = tenants
    .filter((t) => t.status === 'active')
    .reduce((acc, t) => acc + t.billing.monthly, 0)

  const activeCount = tenants.filter((t) => t.status === 'active').length
  const trialCount = tenants.filter((t) => t.status === 'trial').length
  const pendingCount = tenants.filter((t) => t.status === 'pending').length
  const expiredCount = tenants.filter((t) => t.status === 'expired').length
  const totalUsers = tenants.reduce((acc, t) => acc + t.users, 0)
  const alertCount = tenants.reduce((a, ten) => a + (ten.alerts?.length ?? 0), 0)

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleStatusChange(id: string, status: Tenant['status']) {
    setLocalTenants((prev) => prev.map((t) => t.id === id ? { ...t, status } : t))
    setSuccessMsg(`Tenant status updated to ${status}.`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleDelete(id: string) {
    const t = tenants.find((x) => x.id === id)
    setLocalTenants((prev) => prev.filter((x) => x.id !== id))
    setSuccessMsg(`Tenant "${t?.name ?? ''}" deleted.`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleCreated(newTenant: Tenant) {
    // ─── TODO: Replace with RTK Query cache update after POST /api/tenants ───
    setLocalTenants((prev) => [newTenant, ...prev])
    setShowCreate(false)
    setSuccessMsg(
      `Tenant "${newTenant.name}" created! Welcome email sent to ${newTenant.ownerEmail}.`
    )
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  function handleSaved(updated: Partial<Tenant>) {
    // ─── TODO: Replace with RTK Query cache update after PATCH /api/tenants/:id ───
    setLocalTenants((prev) =>
      prev.map((t) => (t.id === managingTenant?.id ? { ...t, ...updated } : t))
    )
    setManagingTenant(null)
    setSuccessMsg(
      `Tenant "${updated.name ?? managingTenant?.name ?? ''}" updated successfully.`
    )
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div>
          <h1
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: 'var(--text)',
            }}
          >
            Tenants
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
            {tenants.length} organizations · {activeCount} active · {trialCount} on trial
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          New Tenant
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div
          style={{
            background: 'var(--green-bg)',
            border: '1px solid var(--green)',
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 'var(--text-sm)',
            color: 'var(--green)',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Tenants', value: tenants.length, color: 'var(--text)' },
          { label: 'Active', value: activeCount, color: 'var(--green)' },
          { label: 'Trial', value: trialCount, color: 'var(--amber)' },
          { label: 'Pending', value: pendingCount, color: 'var(--text2)' },
          { label: 'Expired', value: expiredCount, color: 'var(--text3)' },
          { label: 'Total MRR', value: `$${totalMRR.toLocaleString()}`, color: 'var(--orange)' },
          { label: 'Alerts', value: alertCount, color: alertCount > 0 ? 'var(--red)' : 'var(--text3)' },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {MAIN_TABS.map((t) => (
          <button key={t} className={cn('tab', mainTab === t && 'active')} onClick={() => setMainTab(t)} type="button">
            {t}
            {t === 'Alerts' && (() => {
              const cnt = tenants.reduce((a, ten) => a + (ten.alerts?.length ?? 0), 0)
              return cnt > 0 ? <span style={{ marginLeft: 4, background: 'var(--red-bg)', color: 'var(--red)', fontSize: 10, padding: '1px 6px', borderRadius: 100 }}>{cnt}</span> : null
            })()}
          </button>
        ))}
      </div>

      {/* Tenants tab */}
      {mainTab === 'Tenants' && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-10" style={{ marginBottom: 16 }}>
            <Tabs
              tabs={FILTER_TABS.map((t) => ({
                ...t,
                count:
                  t.id === 'all'
                    ? tenants.length
                    : t.id === 'active'
                    ? activeCount
                    : trialCount,
              }))}
              active={activeTab}
              onChange={setActiveTab}
            />
            <div style={{ marginLeft: 'auto' }}>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search tenants…"
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
              <span className="spinner" style={{ marginRight: 8 }} />
              Loading tenants…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text3)' }}>
              No tenants match your filters.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  isExpanded={expandedTenant === tenant.id}
                  onExpand={() =>
                    setExpandedTenant(expandedTenant === tenant.id ? null : tenant.id)
                  }
                  onManage={(t) => setManagingTenant(t)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Alerts tab */}
      {mainTab === 'Alerts' && (() => {
        const allAlerts = tenants.flatMap((t) => (t.alerts ?? []).map((al) => ({ tenant: t, alert: al })))
          .sort((a, b) => (a.alert.type === 'critical' ? -1 : b.alert.type === 'critical' ? 1 : 0))
        return (
          <div>
            <div className="stat-grid-4" style={{ marginBottom: 16 }}>
              {[
                { label: 'Total Alerts', value: allAlerts.length, color: 'var(--text)' },
                { label: 'Critical', value: allAlerts.filter(a => a.alert.type === 'critical').length, color: 'var(--red)' },
                { label: 'Warning', value: allAlerts.filter(a => a.alert.type === 'warn').length, color: 'var(--amber)' },
                { label: 'Info', value: allAlerts.filter(a => a.alert.type === 'info').length, color: 'var(--cyan)' },
              ].map((s) => <div key={s.label} className="stat"><div className="stat-label">{s.label}</div><div className="stat-value" style={{ color: s.color }}>{s.value}</div></div>)}
            </div>
            {allAlerts.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text3)' }}>No active alerts across all tenants.</div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>Tenant</th><th>Severity</th><th>Message</th><th>Time</th><th /></tr></thead>
                  <tbody>
                    {allAlerts.map(({ tenant, alert }, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: tenant.color, marginRight: 6 }} />
                          {tenant.name}
                        </td>
                        <td>
                          <span className={alert.type === 'critical' ? 'pill pill-red' : alert.type === 'warn' ? 'pill pill-amber' : 'pill pill-blue'}>
                            {alert.type}
                          </span>
                        </td>
                        <td style={{ fontSize: 'var(--text-sm)' }}>{alert.msg}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{alert.time}</td>
                        <td>
                          <button className="btn btn-xs btn-ghost" onClick={() => setManagingTenant(tenant)}>View Tenant</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })()}

      {/* Billing tab */}
      {mainTab === 'Billing' && (
        <div>
          <div className="stat-grid-4" style={{ marginBottom: 16 }}>
            {[
              { label: 'Total MRR', value: `$${totalMRR.toLocaleString()}`, color: 'var(--orange)' },
              { label: 'Active Subscriptions', value: activeCount, color: 'var(--green)' },
              { label: 'Trial Tenants', value: trialCount, color: 'var(--amber)' },
              { label: 'Avg MRR', value: activeCount > 0 ? `$${Math.round(totalMRR / activeCount).toLocaleString()}` : '—', color: 'var(--text)' },
            ].map((s) => <div key={s.label} className="stat"><div className="stat-label">{s.label}</div><div className="stat-value" style={{ color: s.color }}>{s.value}</div></div>)}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Tenant</th><th>Plan</th><th>Monthly</th><th>Next Invoice</th><th>Payment</th><th>Auto-Renew</th><th /></tr>
              </thead>
              <tbody>
                {tenants.map((t) => {
                  const b = t.billing
                  const payOk = !b.paymentMethod.toLowerCase().includes('expired') && !b.paymentMethod.toLowerCase().includes('not set') && !b.paymentMethod.toLowerCase().includes('pending')
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: t.color, marginRight: 6 }} />
                        {t.name}
                      </td>
                      <td><span className="pill">{b.plan}</span></td>
                      <td style={{ fontWeight: 600 }}>${b.monthly.toLocaleString()}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{b.nextInvoice}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: payOk ? 'var(--text2)' : 'var(--red)' }}>
                        {!payOk && <AlertTriangle size={11} style={{ marginRight: 4 }} />}{b.paymentMethod}
                      </td>
                      <td>{b.autoRenew !== false ? <span style={{ color: 'var(--green)' }}>✓</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                      <td>
                        <button className="btn btn-xs btn-ghost" onClick={() => setManagingTenant(t)}>Manage</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Usage tab */}
      {mainTab === 'Usage' && (
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Tenant</th><th>Storage</th><th>API Calls</th><th>Pipeline Runs</th><th>Users</th><th>Last Login</th></tr>
              </thead>
              <tbody>
                {tenants.map((t) => {
                  const u = t.usage
                  const stPct = Math.round((u.storageGB / Math.max(u.storageLimitGB, 1)) * 100)
                  const apiPct = Math.round((u.apiCalls / Math.max(u.apiLimitMonth, 1)) * 100)
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: t.color, marginRight: 6 }} />
                        {t.name}
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ fontSize: 'var(--text-xs)', marginBottom: 3 }}>{u.storageGB} / {u.storageLimitGB} GB</div>
                        <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2 }}>
                          <div style={{ height: 4, borderRadius: 2, width: `${stPct}%`, background: stPct > 90 ? 'var(--red)' : stPct > 70 ? 'var(--amber)' : 'var(--green)' }} />
                        </div>
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ fontSize: 'var(--text-xs)', marginBottom: 3 }}>{u.apiCalls.toLocaleString()} / {(u.apiLimitMonth / 1000).toFixed(0)}K</div>
                        <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2 }}>
                          <div style={{ height: 4, borderRadius: 2, width: `${apiPct}%`, background: apiPct > 90 ? 'var(--red)' : apiPct > 70 ? 'var(--amber)' : 'var(--green)' }} />
                        </div>
                      </td>
                      <td>{u.pipelineRuns?.toLocaleString() ?? '—'}</td>
                      <td>{t.users}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{u.lastLogin}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTenantModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />

      {managingTenant && (
        <ManageTenantModal
          open={!!managingTenant}
          tenant={managingTenant}
          onClose={() => setManagingTenant(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
