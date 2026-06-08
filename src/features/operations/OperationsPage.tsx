import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckSquare, Bell, RefreshCw, Zap, Calendar, Clock, Database, Plus } from 'lucide-react'
import TasksPage from '@/features/tasks/TasksPage'

const TABS = ['Actions', 'Sandbox', 'Write-Back', 'My Tasks']

// TODO: Replace with RTK Query for AI-generated action recommendations — see src/app/services/api.ts
const MOCK_ACTIONS = [
  { title: 'Outreach: At-Risk Customers', desc: 'Contact Meridian Corp, Atlas Manufacturing, and Vantage Logistics with personalized retention messaging. Combined revenue at risk: $516K ARR.', icon: '📞', urgency: 'high' },
  { title: 'Generate Q1 Churn Report', desc: 'Compile at-risk accounts, root causes, and recommended action plan for leadership review.', icon: '📄', urgency: 'medium' },
  { title: 'Sync QuickBooks Data', desc: 'QuickBooks data is 4 hours stale. Trigger a manual sync to refresh financial metrics.', icon: '🔄', urgency: 'medium' },
]

// TODO: Replace with RTK Query for AI suggestions — see src/app/services/api.ts
const MOCK_AI_SUGGESTIONS = [
  { title: 'Launch re-onboarding campaign for low-usage accounts', desc: '12 accounts have <30% seat utilization.', confidence: 87 },
  { title: 'Schedule QBR calls for Enterprise renewals due in 60 days', desc: '5 Enterprise accounts have renewals in the next 60 days.', confidence: 82 },
  { title: 'Investigate support response time degradation', desc: 'Average response time increased from 2.1hr to 5.4hr this quarter.', confidence: 79 },
]

// TODO: Replace with RTK Query for scheduled actions — see src/app/services/api.ts
const MOCK_SCHEDULED_ACTIONS = [
  { title: 'Weekly Churn Report', assignee: 'Sarah Kim', frequency: 'Every Monday 9am', nextRun: 'Mon Apr 22' },
  { title: 'Daily Data Freshness Check', assignee: 'Auto', frequency: 'Daily 6am', nextRun: 'Tomorrow 6am' },
]

const SANDBOX_QUERY = `-- TODO: Replace with sandbox execution API / Jupyter kernel WebSocket
SELECT
  c.name,
  c.mrr,
  c.health_score,
  c.days_since_login,
  CASE
    WHEN c.health_score < 50 THEN 'High Risk'
    WHEN c.health_score < 70 THEN 'Medium Risk'
    ELSE 'Healthy'
  END AS risk_category
FROM customer_360 c
WHERE c.mrr > 10000
ORDER BY c.health_score ASC
LIMIT 20;`

const SANDBOX_RESULTS = [
  { name: 'Vantage Logistics', mrr: 62100, health_score: 38, days_since_login: 12, risk_category: 'High Risk' },
  { name: 'Meridian Corp', mrr: 48200, health_score: 42, days_since_login: 8, risk_category: 'High Risk' },
  { name: 'Atlas Manufacturing', mrr: 21600, health_score: 61, days_since_login: 2, risk_category: 'Medium Risk' },
  { name: 'NovaTech Solutions', mrr: 15400, health_score: 79, days_since_login: 1, risk_category: 'Healthy' },
]

// TODO: Replace with write-back execution API — see src/app/services/api.ts
const MOCK_WRITEBACK_RULES = [
  { name: 'Churn Score → Salesforce', target: 'Salesforce.Account.churn_score', schedule: 'Hourly', lastRun: '45 min ago', status: 'active', records: '48,291' },
  { name: 'LTV → HubSpot Contact', target: 'HubSpot.Contact.ltv_estimate', schedule: 'Daily', lastRun: '3 hr ago', status: 'active', records: '12,440' },
  { name: 'Support Risk Flag → Zendesk', target: 'Zendesk.Ticket.risk_flag', schedule: 'Real-time', lastRun: '1 min ago', status: 'active', records: 'streaming' },
]

const WRITEBACK_LOG = [
  { time: '1 min ago', rule: 'Support Risk Flag → Zendesk', records: 12, status: 'success' },
  { time: '45 min ago', rule: 'Churn Score → Salesforce', records: 48291, status: 'success' },
  { time: '3 hr ago', rule: 'LTV → HubSpot Contact', records: 12440, status: 'success' },
  { time: '4 hr ago', rule: 'Churn Score → Salesforce', records: 48102, status: 'success' },
]

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

const WB_SUB_TABS = ['Targets', 'Execution Log', 'Weekly Chart', 'Retry Policy']

const WEEKLY_CHART_DATA = [
  { day: 'Mon', count: 18 },
  { day: 'Tue', count: 24 },
  { day: 'Wed', count: 22 },
  { day: 'Thu', count: 31 },
  { day: 'Fri', count: 28 },
  { day: 'Sat', count: 12 },
  { day: 'Sun', count: 8 },
]

function SubTabs({ tabs, active, onSelect }: { tabs: string[]; active: string; onSelect: (t: string) => void }) {
  return (
    <div className="tabs" style={{ marginBottom: 16 }}>
      {tabs.map((t) => (
        <button
          key={t}
          className={cn('tab', active === t && 'active')}
          onClick={() => onSelect(t)}
          type="button"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('Actions')
  const [queryResult, setQueryResult] = useState(false)
  const [sqlQuery, setSqlQuery] = useState(SANDBOX_QUERY)
  const [wbTab, setWbTab] = useState('Targets')
  const [retryMaxRetries, setRetryMaxRetries] = useState('3')
  const [retryBackoff, setRetryBackoff] = useState('Exponential')
  const [retryInitialDelay, setRetryInitialDelay] = useState('30')
  const [retryMaxDelay, setRetryMaxDelay] = useState('300')
  const [retryDlq, setRetryDlq] = useState(true)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Operations
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          AI-recommended actions, sandbox queries, write-back rules, and task management
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

      {/* Actions */}
      {activeTab === 'Actions' && (
        <div>
          {/* Priority Actions */}
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
            Priority Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {MOCK_ACTIONS.map((action, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '14px 18px' }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{action.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{action.title}</span>
                    <span className={action.urgency === 'high' ? 'pill pill-red' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                      {action.urgency}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>
                    {action.desc}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                    <button className="btn btn-primary btn-sm" onClick={() => showToast('Task created')}>
                      <CheckSquare size={12} /> Create Task
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => showToast('Team notified')}>
                      <Bell size={12} /> Notify Team
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Suggestions */}
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
            <Zap size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--purple)' }} />
            AI Recommendations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {MOCK_AI_SUGGESTIONS.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 18px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{s.desc}</div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <span className="pill pill-purple" style={{ fontSize: '10px', marginBottom: 6, display: 'block' }}>
                    {s.confidence}% confidence
                  </span>
                  {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                  <button className="btn btn-xs btn-ghost" onClick={() => showToast('Action queued')}>
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scheduled Actions */}
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
            <Calendar size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--cyan)' }} />
            Scheduled Actions
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Assignee</th>
                  <th>Frequency</th>
                  <th>Next Run</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCHEDULED_ACTIONS.map((s) => (
                  <tr key={s.title}>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td>{s.assignee}</td>
                    <td style={{ color: 'var(--text2)' }}>{s.frequency}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>
                        <Clock size={11} /> {s.nextRun}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-xs btn-ghost" onClick={() => showToast('Schedule edited')}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sandbox */}
      {activeTab === 'Sandbox' && (
        <div>
          <div className="card" style={{ marginBottom: 14, padding: '10px 16px', background: 'var(--amber-bg)', border: '1px solid var(--amber)33' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--amber)', fontWeight: 600 }}>
              Sandbox is isolated — changes do not affect production data
            </div>
          </div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
              Query Editor
            </div>
            <textarea
              className="form-input"
              rows={12}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.6, resize: 'vertical' }}
            />
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setQueryResult(true)
                  showToast('Query executed — 4 rows returned')
                }}
              >
                Run Query
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSqlQuery(SANDBOX_QUERY)}>
                Reset
              </button>
            </div>
          </div>

          {queryResult && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 18px', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--green)', borderBottom: '1px solid var(--border)' }}>
                4 rows returned · 23ms
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>name</th>
                    <th>mrr</th>
                    <th>health_score</th>
                    <th>days_since_login</th>
                    <th>risk_category</th>
                  </tr>
                </thead>
                <tbody>
                  {SANDBOX_RESULTS.map((row) => (
                    <tr key={row.name}>
                      <td style={{ fontWeight: 600 }}>{row.name}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>${row.mrr.toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: row.health_score < 50 ? 'var(--red)' : row.health_score < 70 ? 'var(--amber)' : 'var(--green)' }}>
                        {row.health_score}
                      </td>
                      <td>{row.days_since_login}</td>
                      <td>
                        <span className={row.risk_category === 'High Risk' ? 'pill pill-red' : row.risk_category === 'Medium Risk' ? 'pill pill-amber' : 'pill pill-green'} style={{ fontSize: '10px' }}>
                          {row.risk_category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Write-Back */}
      {activeTab === 'Write-Back' && (
        <div>
          {/* Write-Back header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SubTabs tabs={WB_SUB_TABS} active={wbTab} onSelect={setWbTab} />
            {wbTab === 'Targets' && (
              /* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Add rule dialog coming soon')} style={{ marginBottom: 16 }}>
                <Plus size={13} /> Add Rule
              </button>
            )}
          </div>

          {/* Targets sub-tab */}
          {wbTab === 'Targets' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Target</th>
                    <th>Destination</th>
                    <th>Schedule</th>
                    <th>Last Run</th>
                    <th>Records</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_WRITEBACK_RULES.map((rule) => (
                    <tr key={rule.name}>
                      <td style={{ fontWeight: 600 }}>{rule.name}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{rule.target}</td>
                      <td>
                        <span className="pill" style={{ fontSize: '10px' }}>{rule.schedule}</span>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{rule.lastRun}</td>
                      <td style={{ fontWeight: 600 }}>{rule.records}</td>
                      <td>
                        <span className={rule.status === 'active' ? 'pill pill-green' : 'pill pill-red'} style={{ fontSize: '10px' }}>
                          {rule.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                          <button className="btn btn-xs btn-primary" onClick={() => showToast(`Running ${rule.name}…`)}>
                            <RefreshCw size={10} /> Run
                          </button>
                          <button className="btn btn-xs btn-ghost" onClick={() => showToast('Edit dialog coming soon')}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Execution Log sub-tab */}
          {wbTab === 'Execution Log' && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
                Recent Write-Back Log
              </div>
              {WRITEBACK_LOG.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '8px 0', borderBottom: i < WRITEBACK_LOG.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 'var(--text-xs)' }}>
                  <Database size={11} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text2)' }}>{log.rule}</span>
                  <span style={{ color: 'var(--text3)', minWidth: 80 }}>{log.records.toLocaleString()} records</span>
                  <span className={log.status === 'success' ? 'pill pill-green' : 'pill pill-red'} style={{ fontSize: '10px' }}>{log.status}</span>
                  <span style={{ color: 'var(--text3)', minWidth: 70, textAlign: 'right' }}>{log.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* Weekly Chart sub-tab */}
          {wbTab === 'Weekly Chart' && (
            <div>
              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total This Week', value: '143' },
                  { label: 'Daily Avg', value: '20' },
                  { label: 'Peak Day', value: '31' },
                  { label: 'Success Rate', value: '91%' },
                ].map((stat) => (
                  <div key={stat.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 18 }}>
                  Weekly Executions
                </div>
                <div className="chart-bars" style={{ height: 160, alignItems: 'flex-end', gap: 10 }}>
                  {WEEKLY_CHART_DATA.map((d) => {
                    const maxCount = Math.max(...WEEKLY_CHART_DATA.map((x) => x.count))
                    return (
                      <div key={d.day} className="chart-col" style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4, textAlign: 'center' }}>
                          {d.count}
                        </div>
                        <div
                          className="chart-bar"
                          style={{
                            height: `${(d.count / maxCount) * 120}px`,
                            background: 'var(--accent)',
                            borderRadius: '3px 3px 0 0',
                            opacity: 0.85,
                            width: '100%',
                          }}
                        />
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 4, textAlign: 'center' }}>
                          {d.day}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Retry Policy sub-tab */}
          {wbTab === 'Retry Policy' && (
            <div className="card" style={{ maxWidth: 480 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 18 }}>
                Retry Policy Configuration
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>
                    Max Retries
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={retryMaxRetries}
                    onChange={(e) => setRetryMaxRetries(e.target.value)}
                    min={0}
                    max={10}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>
                    Backoff Strategy
                  </label>
                  <select
                    className="form-input"
                    value={retryBackoff}
                    onChange={(e) => setRetryBackoff(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Exponential">Exponential</option>
                    <option value="Linear">Linear</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>
                      Initial Delay (s)
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={retryInitialDelay}
                      onChange={(e) => setRetryInitialDelay(e.target.value)}
                      min={1}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>
                      Max Delay (s)
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={retryMaxDelay}
                      onChange={(e) => setRetryMaxDelay(e.target.value)}
                      min={1}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="dlq"
                    checked={retryDlq}
                    onChange={(e) => setRetryDlq(e.target.checked)}
                    style={{ width: 15, height: 15, cursor: 'pointer' }}
                  />
                  <label htmlFor="dlq" style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', cursor: 'pointer' }}>
                    Dead Letter Queue — route failed records after max retries
                  </label>
                </div>
                {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                <button
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                  onClick={() => showToast('Retry policy saved')}
                >
                  Save Policy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Tasks */}
      {activeTab === 'My Tasks' && <TasksPage />}
    </div>
  )
}
