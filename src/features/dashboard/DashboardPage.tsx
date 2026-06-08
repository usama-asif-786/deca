import { useState } from 'react'
import { useGetDashboardStatsQuery } from '@/app/services/api'
import { cn } from '@/lib/utils'
import KPIGrid from './components/KPIGrid'
import Chart from './components/Chart'
import ActivityFeed from './components/ActivityFeed'
import RevenueMetrics from './components/RevenueMetrics'
import PipelineStatus from './components/PipelineStatus'
import ReadinessScore from './components/ReadinessScore'
import CardWrapper from '@/components/common/CardWrapper'
import SkeletonLoader from '@/components/common/SkeletonLoader'
import { MOCK_MONITORING } from '@/lib/mockData'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'customers', label: 'Customers' },
  { id: 'operations', label: 'Operations' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'nps', label: 'NPS' },
  { id: 'adoption', label: 'Usage & Adoption' },
  { id: 'cost', label: 'Cost Dashboard' },
]

const MOCK_MRR_BREAKDOWN = [
  { category: 'New MRR', value: '$48,200', pct: 5.7 },
  { category: 'Expansion MRR', value: '$31,400', pct: 3.7 },
  { category: 'Contraction MRR', value: '-$12,800', pct: -1.5 },
  { category: 'Churned MRR', value: '-$19,300', pct: -2.3 },
  { category: 'Net New MRR', value: '$47,500', pct: 5.6 },
]

const MOCK_TOP_CUSTOMERS = [
  { name: 'GlobalTech Industries', mrr: '$42,800', arr: '$513,600', tier: 'Enterprise', since: 'Jan 2022' },
  { name: 'Pinnacle Partners', mrr: '$38,200', arr: '$458,400', tier: 'Enterprise', since: 'Mar 2022' },
  { name: 'Summit Healthcare', mrr: '$31,500', arr: '$378,000', tier: 'Enterprise', since: 'Jun 2022' },
  { name: 'Apex Digital', mrr: '$27,900', arr: '$334,800', tier: 'Enterprise', since: 'Sep 2022' },
  { name: 'Horizon Media', mrr: '$24,100', arr: '$289,200', tier: 'Enterprise', since: 'Nov 2022' },
  { name: 'Cascade Software', mrr: '$21,600', arr: '$259,200', tier: 'Growth', since: 'Jan 2023' },
  { name: 'Meridian Corp', mrr: '$18,400', arr: '$220,800', tier: 'Enterprise', since: 'Mar 2023' },
  { name: 'Sterling Finance', mrr: '$16,800', arr: '$201,600', tier: 'Growth', since: 'May 2023' },
  { name: 'Atlas Manufacturing', mrr: '$14,200', arr: '$170,400', tier: 'Enterprise', since: 'Jan 2024' },
  { name: 'Vantage Logistics', mrr: '$11,000', arr: '$132,000', tier: 'Growth', since: 'Aug 2024' },
]

const MOCK_REVENUE_CHART = [
  { month: 'Sep', value: 1.8 }, { month: 'Oct', value: 2.0 }, { month: 'Nov', value: 1.9 },
  { month: 'Dec', value: 2.2 }, { month: 'Jan', value: 2.5 }, { month: 'Feb', value: 2.4 },
]

const MOCK_CUSTOMER_GROWTH = [
  { month: 'Sep', value: 1089 }, { month: 'Oct', value: 1124 }, { month: 'Nov', value: 1156 },
  { month: 'Dec', value: 1178 }, { month: 'Jan', value: 1209 }, { month: 'Feb', value: 1247 },
]

const MOCK_CHURN_TABLE = [
  { name: 'Meridian Corp', mrr: '$18,400', usage: '12%', lastLogin: '18 days ago', risk: 92 },
  { name: 'Atlas Manufacturing', mrr: '$14,200', usage: '60%', lastLogin: '2 days ago', risk: 71 },
  { name: 'Vantage Logistics', mrr: '$11,000', usage: '13%', lastLogin: '7 days ago', risk: 68 },
  { name: 'Northwind Traders', mrr: '$8,400', usage: '25%', lastLogin: '12 days ago', risk: 61 },
  { name: 'Coastal Dynamics', mrr: '$6,200', usage: '31%', lastLogin: '5 days ago', risk: 54 },
]

const MOCK_SOURCE_HEALTH = [
  { name: 'PostgreSQL', status: 'Healthy', freshness: '12 min', uptime: '99.8%', lastError: 'None' },
  { name: 'Google Sheets', status: 'Healthy', freshness: '5 min', uptime: '100%', lastError: 'None' },
  { name: 'Salesforce', status: 'Healthy', freshness: '8 min', uptime: '99.5%', lastError: 'Rate limit (Apr 10)' },
  { name: 'QuickBooks', status: 'Degraded', freshness: '4 hr', uptime: '97.2%', lastError: 'Timeout (Apr 13)' },
]

const MOCK_DATA_FRESHNESS = [
  { table: 'customers', source: 'PostgreSQL', freshness: '12 min', score: 98 },
  { table: 'invoices', source: 'QuickBooks', freshness: '4 hr', score: 62 },
  { table: 'opportunities', source: 'Salesforce', freshness: '8 min', score: 96 },
  { table: 'nps_surveys', source: 'Google Sheets', freshness: '5 min', score: 99 },
  { table: 'orders', source: 'PostgreSQL', freshness: '12 min', score: 98 },
  { table: 'payments', source: 'QuickBooks', freshness: '4 hr', score: 62 },
  { table: 'contacts', source: 'Salesforce', freshness: '8 min', score: 96 },
  { table: 'journal_entries', source: 'QuickBooks', freshness: '4 hr', score: 62 },
]

const MOCK_RUN_HISTORY = [
  { run: 47, date: 'Apr 13, 9:14 AM', rows: '841,847', duration: '9m 05s', status: 'running' },
  { run: 46, date: 'Apr 12, 9:00 AM', rows: '839,214', duration: '8m 52s', status: 'done' },
  { run: 45, date: 'Apr 11, 9:00 AM', rows: '836,901', duration: '8m 41s', status: 'done' },
  { run: 44, date: 'Apr 10, 9:00 AM', rows: '834,122', duration: '8m 38s', status: 'done' },
  { run: 43, date: 'Apr 9, 9:00 AM', rows: '831,457', duration: '9m 12s', status: 'failed' },
  { run: 42, date: 'Apr 8, 9:00 AM', rows: '829,001', duration: '8m 29s', status: 'done' },
]

const DATE_RANGES = ['7d', '30d', '90d', 'YTD']

// TODO: Replace with RTK Query for product analytics (Mixpanel/Amplitude/PostHog) — see src/app/services/api.ts
const MOCK_ADOPTION = [
  { feature: 'Ask AI', dau: 847, wau: 2840, mau: 8921, adoption: 78, trend: 'up' },
  { feature: 'Data Cards', dau: 421, wau: 1840, mau: 5102, adoption: 45, trend: 'up' },
  { feature: 'Alerts', dau: 312, wau: 1240, mau: 4891, adoption: 43, trend: 'flat' },
  { feature: 'Tasks', dau: 289, wau: 1102, mau: 3840, adoption: 34, trend: 'down' },
  { feature: 'Data Connectors', dau: 104, wau: 489, mau: 1840, adoption: 16, trend: 'up' },
]

// TODO: Replace with RTK Query for cloud cost management API (AWS Cost Explorer / Infracost) — see src/app/services/api.ts
const MOCK_COSTS = [
  { service: 'Compute (EKS)', cost: '$4,820', budget: '$5,000', trend: 'up', percent: 96 },
  { service: 'Storage (S3)', cost: '$1,240', budget: '$2,000', trend: 'down', percent: 62 },
  { service: 'ML Training (GPU)', cost: '$2,890', budget: '$3,500', trend: 'up', percent: 83 },
  { service: 'LLM API Costs', cost: '$1,440', budget: '$2,000', trend: 'up', percent: 72 },
  { service: 'Database (RDS)', cost: '$890', budget: '$1,000', trend: 'flat', percent: 89 },
]

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp size={12} style={{ color: 'var(--green)', display: 'inline', marginLeft: 4 }} />
  if (trend === 'down') return <TrendingDown size={12} style={{ color: 'var(--red)', display: 'inline', marginLeft: 4 }} />
  return <Minus size={12} style={{ color: 'var(--text3)', display: 'inline', marginLeft: 4 }} />
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')
  const { data: stats, isLoading } = useGetDashboardStatsQuery()

  const totalMonthlyCost = MOCK_COSTS.reduce((acc, c) => {
    return acc + parseInt(c.cost.replace(/[$,]/g, ''))
  }, 0)

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            Data Intelligence Overview
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
            Fulcrum Hub — April 2026
          </p>
        </div>

        <div className="date-range-selector">
          {DATE_RANGES.map((dr) => (
            <button
              key={dr}
              className={cn(dateRange === dr && 'active')}
              onClick={() => setDateRange(dr)}
            >
              {dr}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={cn('tab', activeTab === tab.id && 'active')}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div>
          {isLoading ? (
            <div className="kpi-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="kpi">
                  <SkeletonLoader lines={3} height="14px" />
                </div>
              ))}
            </div>
          ) : (
            <KPIGrid stats={stats ?? []} />
          )}

          {!isLoading && stats && (
            <div className="kpi-grid" style={{ marginBottom: 22 }}>
              {stats.slice(4, 8).map((stat) => (
                <div key={stat.label} className="kpi">
                  <div className="kpi-label">{stat.label}</div>
                  <div className="kpi-value">{stat.value}</div>
                  <div className="kpi-sub">{stat.sub}</div>
                  <div
                    className={cn(
                      'kpi-delta flex items-center gap-4',
                      stat.deltaType === 'up' ? 'up' : stat.deltaType === 'down' ? 'down' : 'flat',
                    )}
                  >
                    {stat.delta}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <CardWrapper title="Revenue by Segment">
              <RevenueMetrics />
            </CardWrapper>
            <CardWrapper title="Pipeline Status">
              <PipelineStatus />
            </CardWrapper>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <CardWrapper title="Weekly Quality Trend">
              <Chart data={MOCK_MONITORING.chartData} height={160} />
              <div className="flex gap-12" style={{ marginTop: 8 }}>
                <div className="flex items-center gap-6">
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Quality Score</span>
                </div>
                <div className="flex items-center gap-6">
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--bg4)', display: 'inline-block' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Coverage</span>
                </div>
              </div>
            </CardWrapper>
            <CardWrapper title="Recent Activity">
              <ActivityFeed />
            </CardWrapper>
          </div>
        </div>
      )}

      {/* Tab: Revenue */}
      {activeTab === 'revenue' && (
        <div>
          {/* Revenue trend bar chart */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>Revenue Trend (6 months)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
              {MOCK_REVENUE_CHART.map((d) => {
                const h = Math.round((d.value / 2.5) * 140)
                return (
                  <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 2 }}>${d.value}M</span>
                    <div style={{ width: '100%', height: h, background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{d.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* MRR Breakdown */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '14px 18px 0', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 0 }}>MRR Breakdown</div>
            <table className="data-table">
              <thead>
                <tr><th>Category</th><th>Amount</th><th>% of MRR</th></tr>
              </thead>
              <tbody>
                {MOCK_MRR_BREAKDOWN.map((m) => (
                  <tr key={m.category}>
                    <td style={{ fontWeight: 500 }}>{m.category}</td>
                    <td style={{ fontWeight: 600, color: m.pct >= 0 ? 'var(--green)' : 'var(--red)' }}>{m.value}</td>
                    <td style={{ color: m.pct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>{m.pct > 0 ? '+' : ''}{m.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Customers by Revenue */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px 0', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Top Customers by Revenue</div>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Customer</th><th>MRR</th><th>ARR</th><th>Tier</th><th>Since</th></tr>
              </thead>
              <tbody>
                {MOCK_TOP_CUSTOMERS.map((c, i) => (
                  <tr key={c.name}>
                    <td style={{ color: 'var(--text3)', fontWeight: 500 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>{c.mrr}</td>
                    <td style={{ color: 'var(--text2)' }}>{c.arr}</td>
                    <td><span className={c.tier === 'Enterprise' ? 'pill pill-blue' : 'pill pill-purple'} style={{ fontSize: 10 }}>{c.tier}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{c.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Customers */}
      {activeTab === 'customers' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Customer growth chart */}
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>Customer Growth (6 months)</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
                {MOCK_CUSTOMER_GROWTH.map((d) => {
                  const h = Math.round((d.value / 1300) * 120)
                  return (
                    <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{d.value}</span>
                      <div style={{ width: '100%', height: h, background: 'var(--cyan)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{d.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* NPS gauge */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>NPS Score</div>
              <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 8 }}>
                <svg width="80" height="80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="var(--bg3)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="var(--green)" strokeWidth="6"
                    strokeDasharray={`${(42 / 100) * 188.5} 188.5`}
                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--green)' }}>42</div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Industry avg: 38</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="stat-grid-4" style={{ marginBottom: 14 }}>
            {[
              { label: 'Total Customers', value: '1,247', color: 'var(--text)' },
              { label: 'New This Month', value: '+38', color: 'var(--green)' },
              { label: 'At Risk', value: '12', color: 'var(--red)' },
              { label: 'Avg Revenue / Customer', value: '$679', color: 'var(--text)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Churn risk table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px 0', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>At-Risk Customers (Churn Probability)</div>
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>MRR</th><th>Usage</th><th>Last Login</th><th>Risk Score</th></tr>
              </thead>
              <tbody>
                {MOCK_CHURN_TABLE.map((c) => {
                  const riskColor = c.risk >= 80 ? 'var(--red)' : c.risk >= 60 ? 'var(--amber)' : 'var(--green)'
                  return (
                    <tr key={c.name}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ fontWeight: 600 }}>{c.mrr}</td>
                      <td style={{ color: 'var(--text3)' }}>{c.usage}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{c.lastLogin}</td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress" style={{ flex: 1, margin: 0 }}>
                            <div className="progress-fill" style={{ width: `${c.risk}%`, background: riskColor }} />
                          </div>
                          <span style={{ color: riskColor, fontSize: 'var(--text-xs)', fontWeight: 600, minWidth: 32 }}>{c.risk}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Operations */}
      {activeTab === 'operations' && (
        <div>
          <div className="stat-grid-4" style={{ marginBottom: 14 }}>
            {[
              { label: 'Pipeline Runs (Total)', value: '47', color: 'var(--text)' },
              { label: 'Connected Sources', value: '8', color: 'var(--green)' },
              { label: 'Uptime', value: '99.8%', color: 'var(--green)' },
              { label: 'Data Freshness', value: '88%', color: 'var(--cyan)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Source Health */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '14px 18px 0', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Source Health</div>
            <table className="data-table">
              <thead>
                <tr><th>Source</th><th>Status</th><th>Freshness</th><th>Uptime</th><th>Last Error</th></tr>
              </thead>
              <tbody>
                {MOCK_SOURCE_HEALTH.map((s) => (
                  <tr key={s.name}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td><span className={s.status === 'Healthy' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: 10 }}>{s.status}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{s.freshness}</td>
                    <td style={{ fontWeight: 600 }}>{s.uptime}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{s.lastError}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pipeline Run History */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '14px 18px 0', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Recent Pipeline Runs</div>
            <table className="data-table">
              <thead>
                <tr><th>Run #</th><th>Date</th><th>Rows</th><th>Duration</th><th>Status</th></tr>
              </thead>
              <tbody>
                {MOCK_RUN_HISTORY.map((r) => (
                  <tr key={r.run}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)' }}>#{r.run}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{r.date}</td>
                    <td style={{ fontWeight: 500 }}>{r.rows}</td>
                    <td style={{ color: 'var(--text2)' }}>{r.duration}</td>
                    <td><span className={r.status === 'done' ? 'pill pill-green' : r.status === 'running' ? 'pill pill-blue' : 'pill pill-red'} style={{ fontSize: 10 }}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Data Freshness Scores */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px 0', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Data Freshness Scores</div>
            <table className="data-table">
              <thead>
                <tr><th>Table</th><th>Source</th><th>Last Updated</th><th>Freshness Score</th></tr>
              </thead>
              <tbody>
                {MOCK_DATA_FRESHNESS.map((d) => {
                  const fColor = d.score >= 90 ? 'var(--green)' : d.score >= 70 ? 'var(--amber)' : 'var(--red)'
                  return (
                    <tr key={d.table}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)' }}>{d.table}</td>
                      <td style={{ color: 'var(--text2)' }}>{d.source}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{d.freshness} ago</td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress" style={{ flex: 1, margin: 0 }}>
                            <div className="progress-fill" style={{ width: `${d.score}%`, background: fColor }} />
                          </div>
                          <span style={{ color: fColor, fontSize: 'var(--text-xs)', fontWeight: 600 }}>{d.score}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Pipeline */}
      {activeTab === 'pipeline' && (
        <div>
          <div className="kpi-grid">
            {[
              { label: 'Last Run', value: '6h ago', sub: 'Run #47', delta: 'Duration: 7m 14s', deltaType: 'flat' as const },
              { label: 'Rows Processed', value: '1.24M', sub: 'Across 8 sources', delta: '+14K vs prev run', deltaType: 'up' as const },
              { label: 'Success Rate', value: '98.4%', sub: 'Last 30 runs', delta: 'Target: 99%', deltaType: 'flat' as const },
              { label: 'Avg Duration', value: '7.2min', sub: 'P95: 11.4min', delta: '-0.8min vs last week', deltaType: 'up' as const },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi">
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-sub">{kpi.sub}</div>
                <div className={cn('kpi-delta', kpi.deltaType)}>{kpi.delta}</div>
              </div>
            ))}
          </div>
          <CardWrapper title="Pipeline Run #47">
            <PipelineStatus />
          </CardWrapper>
          <CardWrapper title="Sub-task Progress">
            {[
              { name: 'Data Extraction', pct: 100, color: 'var(--green)' },
              { name: 'Schema Validation', pct: 100, color: 'var(--green)' },
              { name: 'Deduplication', pct: 100, color: 'var(--green)' },
              { name: 'Embedding Generation', pct: 67, color: 'var(--cyan)' },
              { name: 'Concept Linking', pct: 47, color: 'var(--cyan)' },
            ].map((st) => (
              <div key={st.name} style={{ marginBottom: 12 }}>
                <div className="progress-label">
                  <span style={{ color: 'var(--text2)' }}>{st.name}</span>
                  <span>{st.pct}%</span>
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${st.pct}%`, background: st.color }} />
                </div>
              </div>
            ))}
          </CardWrapper>
        </div>
      )}

      {/* Tab: Readiness */}
      {activeTab === 'readiness' && (
        <div>
          <CardWrapper title="AI Readiness Score">
            <ReadinessScore />
          </CardWrapper>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Mapped Concepts', value: '142 / 156', status: 'warn', pct: 91 },
              { label: 'Validated Sources', value: '8 / 8', status: 'ok', pct: 100 },
              { label: 'Quality Rules', value: '34 active', status: 'ok', pct: 88 },
            ].map((item) => (
              <div key={item.label} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                  {item.value}
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.status === 'ok' ? 'var(--green)' : 'var(--amber)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: NPS */}
      {activeTab === 'nps' && (
        <div>
          <div className="kpi-grid">
            {[
              { label: 'NPS Score', value: '52', sub: 'April 2026', delta: '+4 pts vs Q4 2025', deltaType: 'up' as const },
              { label: 'Promoters', value: '67%', sub: '190 respondents', delta: '+5pp vs Q4', deltaType: 'up' as const },
              { label: 'Passives', value: '18%', sub: '51 respondents', delta: '-2pp vs Q4', deltaType: 'flat' as const },
              { label: 'Detractors', value: '15%', sub: '43 respondents', delta: '-3pp vs Q4', deltaType: 'up' as const },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi">
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-sub">{kpi.sub}</div>
                <div className={cn('kpi-delta', kpi.deltaType)}>{kpi.delta}</div>
              </div>
            ))}
          </div>
          <CardWrapper title="NPS by Segment">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Segment</th>
                    <th>NPS</th>
                    <th>Responses</th>
                    <th>Promoters</th>
                    <th>Detractors</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { segment: 'Enterprise', nps: 71, resp: 48, promoters: 83, detractors: 12, trend: '+8' },
                    { segment: 'Mid-Market', nps: 54, resp: 92, promoters: 69, detractors: 15, trend: '+2' },
                    { segment: 'SMB', nps: 38, resp: 144, promoters: 56, detractors: 18, trend: '-4' },
                  ].map((row) => (
                    <tr key={row.segment}>
                      <td style={{ fontWeight: 500 }}>{row.segment}</td>
                      <td style={{ fontWeight: 600, color: row.nps >= 60 ? 'var(--green)' : row.nps >= 40 ? 'var(--amber)' : 'var(--red)' }}>{row.nps}</td>
                      <td>{row.resp}</td>
                      <td style={{ color: 'var(--green)' }}>{row.promoters}%</td>
                      <td style={{ color: 'var(--red)' }}>{row.detractors}%</td>
                      <td style={{ color: row.trend.startsWith('+') ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>{row.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardWrapper>
        </div>
      )}

      {/* Tab: Usage & Adoption */}
      {activeTab === 'adoption' && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: 20 }}>
            {[
              { label: 'MAU', value: '11,483', sub: 'Across all features', delta: '+12% MoM', deltaType: 'up' as const },
              { label: 'DAU', value: '1,973', sub: 'Active today', delta: '+8% DoD', deltaType: 'up' as const },
              { label: 'Avg Session', value: '18.4 min', sub: 'Per user', delta: '+2.1 min', deltaType: 'up' as const },
              { label: 'Feature Adoption', value: '43%', sub: 'Avg across features', delta: '+5pp QoQ', deltaType: 'up' as const },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi">
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-sub">{kpi.sub}</div>
                <div className={cn('kpi-delta', kpi.deltaType)}>{kpi.delta}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>DAU</th>
                  <th>WAU</th>
                  <th>MAU</th>
                  <th>Adoption %</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ADOPTION.map((f) => (
                  <tr key={f.feature}>
                    <td style={{ fontWeight: 600 }}>{f.feature}</td>
                    <td>{f.dau.toLocaleString()}</td>
                    <td>{f.wau.toLocaleString()}</td>
                    <td>{f.mau.toLocaleString()}</td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ flex: 1, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${f.adoption}%`, background: f.adoption >= 60 ? 'var(--green)' : f.adoption >= 30 ? 'var(--cyan)' : 'var(--amber)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, minWidth: 28 }}>{f.adoption}%</span>
                      </div>
                    </td>
                    <td>
                      <TrendIcon trend={f.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Cost Dashboard */}
      {activeTab === 'cost' && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total MTD Spend', value: `$${totalMonthlyCost.toLocaleString()}`, sub: 'April 2026', delta: '+$890 vs March', deltaType: 'down' as const },
              { label: 'Budget Remaining', value: '$14,500', sub: 'Of $27,500 budget', delta: '52.7% remaining', deltaType: 'up' as const },
              { label: 'Largest Cost', value: 'Compute (EKS)', sub: '$4,820 MTD', delta: '96% of budget', deltaType: 'down' as const },
              { label: 'LLM Costs', value: '$1,440', sub: 'API usage', delta: '+$240 vs Mar', deltaType: 'down' as const },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi">
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-sub">{kpi.sub}</div>
                <div className={cn('kpi-delta', kpi.deltaType)}>{kpi.delta}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {MOCK_COSTS.map((c) => (
              <div key={c.service} className="card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{c.service}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: c.percent >= 90 ? 'var(--red)' : c.percent >= 75 ? 'var(--amber)' : 'var(--green)' }}>
                      {c.cost}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>/ {c.budget}</span>
                    <TrendIcon trend={c.trend} />
                  </div>
                </div>
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${c.percent}%`,
                      background: c.percent >= 90 ? 'var(--red)' : c.percent >= 75 ? 'var(--amber)' : 'var(--green)',
                    }}
                  />
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 4 }}>
                  {c.percent}% of budget used
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
