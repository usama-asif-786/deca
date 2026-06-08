// ═══════════════════════════════════════════════
// FULCRUM HUB — Complete Mock Data
// ═══════════════════════════════════════════════

export interface TeamMember {
  id: string
  name: string
  initials: string
  color: string
  role: string
  email: string
  avatar?: string
  status: 'active' | 'away' | 'offline'
  permissions: string[]
}

export interface Tenant {
  id: string
  name: string
  industry: string
  region: string
  plan: string
  status: 'active' | 'trial' | 'pending' | 'suspended' | 'expired'
  users: number
  mrr: string
  since: string
  owner: string
  ownerEmail: string
  ownerTitle?: string
  ownerPhone?: string
  color: string
  sourcesQuota: number
  domain?: string
  billing: { plan: string; monthly: number; nextInvoice: string; paymentMethod: string; autoRenew?: boolean }
  usage: { storageGB: number; storageLimitGB: number; apiCalls: number; apiLimitMonth: number; pipelineRuns?: number; lastLogin: string }
  alerts: { type: 'critical' | 'warn' | 'info'; msg: string; time: string }[]
  activity: { action: string; user: string; time: string }[]
  managers?: { name: string; role: string; email: string; title?: string; phone?: string; since: string }[]
}

export interface DataSource {
  id: string
  name: string
  label?: string
  type: string
  abbr: string
  bg: string
  fg: string
  connected: boolean
  tenant?: string
  rows?: number
  lastSync?: string
  nextSync?: string
  health?: number
  meta?: string
  syncFreq?: string
}

export interface ConnectorCatalogItem {
  name: string
  type: string
  desc: string
  abbr: string
  bg: string
  fg: string
}

// TODO: Replace with RTK Query endpoint for connector catalog
export const CONNECTOR_CATALOG: ConnectorCatalogItem[] = [
  { name: 'PostgreSQL', type: 'Database', desc: 'Open-source relational DB', abbr: 'PG', bg: '#336791', fg: '#fff' },
  { name: 'MySQL', type: 'Database', desc: 'Widely-used relational DB', abbr: 'MY', bg: '#00618A', fg: '#fff' },
  { name: 'MongoDB', type: 'Database', desc: 'Document-based NoSQL', abbr: 'MG', bg: '#4DB33D', fg: '#fff' },
  { name: 'Redis', type: 'Database', desc: 'In-memory key-value store', abbr: 'RD', bg: '#DC382D', fg: '#fff' },
  { name: 'Salesforce', type: 'SaaS CRM', desc: 'CRM & sales pipeline', abbr: 'SF', bg: '#00A1E0', fg: '#fff' },
  { name: 'HubSpot', type: 'SaaS CRM', desc: 'Marketing & CRM platform', abbr: 'HS', bg: '#FF7A59', fg: '#fff' },
  { name: 'Stripe', type: 'SaaS Payments', desc: 'Payment processing', abbr: 'ST', bg: '#635BFF', fg: '#fff' },
  { name: 'QuickBooks', type: 'SaaS Accounting', desc: 'Accounting & finance', abbr: 'QB', bg: '#2CA01C', fg: '#fff' },
  { name: 'Zendesk', type: 'SaaS CRM', desc: 'Customer support platform', abbr: 'ZD', bg: '#03363D', fg: '#fff' },
  { name: 'Mixpanel', type: 'SaaS Analytics', desc: 'Product analytics', abbr: 'MX', bg: '#7856FF', fg: '#fff' },
  { name: 'Intercom', type: 'SaaS CRM', desc: 'Customer messaging', abbr: 'IC', bg: '#1F8DED', fg: '#fff' },
  { name: 'Snowflake', type: 'Data Warehouse', desc: 'Cloud data warehouse', abbr: 'SN', bg: '#29B5E8', fg: '#fff' },
  { name: 'Google BigQuery', type: 'Data Warehouse', desc: 'Serverless data warehouse', abbr: 'BQ', bg: '#4285F4', fg: '#fff' },
  { name: 'Google Sheets', type: 'Spreadsheet', desc: 'Cloud spreadsheets', abbr: 'GS', bg: '#34A853', fg: '#fff' },
  { name: 'REST API', type: 'API', desc: 'Generic REST API endpoint', abbr: 'API', bg: '#555', fg: '#fff' },
  { name: 'CSV / File Upload', type: 'File', desc: 'CSV, Excel, or JSON file', abbr: 'CSV', bg: '#9c6400', fg: '#fff' },
]

export interface Alert {
  id: string
  title: string
  desc: string
  severity: 'critical' | 'warn' | 'info'
  metric?: string
  threshold?: string
  time: string
  snoozed?: boolean
  source?: string
}

export interface Task {
  id: string
  title: string
  desc: string
  assignee: string
  dueDate: string
  status: 'open' | 'done' | 'in-progress'
  priority: 'high' | 'medium' | 'low'
  labels: string[]
  comments: { author: string; text: string; time: string }[]
  activityLog: string[]
}

export interface Notification {
  id: string
  text: string
  time: string
  read: boolean
  type: 'info' | 'warn' | 'success' | 'error'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  time: string
  citations?: string[]
}

export interface SyncHistoryItem {
  source: string
  time: string
  rows: string
  duration: string
  status: 'ok' | 'warn' | 'error'
}

export interface KPIStats {
  label: string
  value: string
  sub: string
  delta: string
  deltaType: 'up' | 'down' | 'flat'
}

// ─── TEAM ────────────────────────────────────────
export const MOCK_TEAM: TeamMember[] = [
  { id: 'sk', name: 'Sarah Kim', initials: 'SK', color: '#1e1f23', role: 'Platform Admin', email: 'sarah@acmecorp.com', status: 'active', permissions: ['admin', 'write', 'read'] },
  { id: 'mj', name: 'Mike Johnson', initials: 'MJ', color: '#2d6a4f', role: 'Data Engineer', email: 'mike@acmecorp.com', status: 'active', permissions: ['write', 'read'] },
  { id: 'rd', name: 'Raj Desai', initials: 'RD', color: '#6a4c93', role: 'ML Engineer', email: 'raj@acmecorp.com', status: 'away', permissions: ['write', 'read'] },
  { id: 'tb', name: 'Tom Baker', initials: 'TB', color: '#006778', role: 'Decision Maker', email: 'tom@acmecorp.com', status: 'active', permissions: ['read'] },
  { id: 'al', name: 'Amy Liu', initials: 'AL', color: '#9c6400', role: 'Data Analyst', email: 'amy@acmecorp.com', status: 'active', permissions: ['read', 'write'] },
  { id: 'jw', name: 'James Wilson', initials: 'JW', color: '#c62828', role: 'DevOps Engineer', email: 'james@acmecorp.com', status: 'offline', permissions: ['write', 'read'] },
]

// ─── TENANTS ──────────────────────────────────────
export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1',
    name: 'Pinnacle Energy Corp',
    industry: 'Energy / Oil & Gas',
    region: 'Middle East',
    plan: 'Enterprise',
    status: 'active',
    users: 24,
    mrr: '$2,499',
    since: 'Jan 2023',
    owner: 'Ahmed Al-Rashid',
    ownerEmail: 'ahmed@pinnacle-energy.com',
    ownerTitle: 'VP Data & Analytics',
    color: '#F54E00',
    sourcesQuota: 100,
    billing: { plan: 'Enterprise', monthly: 2499, nextInvoice: 'May 14, 2026', paymentMethod: 'Wire Transfer' },
    usage: { storageGB: 48, storageLimitGB: 500, apiCalls: 412000, apiLimitMonth: 999999, lastLogin: '2 min ago' },
    alerts: [{ type: 'warn', msg: 'Storage usage at 68% of limit', time: '3h ago' }],
    activity: [
      { action: 'Added 3 new data sources', user: 'Ahmed Al-Rashid', time: '1d ago' },
      { action: 'Updated ontology mappings', user: 'System', time: '3d ago' },
    ],
    managers: [
      { name: 'Fatima Hassan', role: 'Technical Lead', email: 'fatima@pinnacle-energy.com', title: 'Data Architect', since: 'Mar 2023' },
    ],
  },
  {
    id: 't2',
    name: 'Nordic Retail Group',
    industry: 'Retail / E-commerce',
    region: 'Europe (Western)',
    plan: 'Scale',
    status: 'active',
    users: 12,
    mrr: '$999',
    since: 'Apr 2023',
    owner: 'Lars Eriksson',
    ownerEmail: 'lars@nordic-retail.com',
    color: '#2d6a4f',
    sourcesQuota: 30,
    billing: { plan: 'Scale', monthly: 999, nextInvoice: 'May 20, 2026', paymentMethod: 'Credit Card' },
    usage: { storageGB: 18, storageLimitGB: 100, apiCalls: 89000, apiLimitMonth: 500000, lastLogin: '4h ago' },
    alerts: [],
    activity: [{ action: 'Pipeline run completed', user: 'System', time: '2h ago' }],
    managers: [],
  },
  {
    id: 't3',
    name: 'MediSync Health',
    industry: 'Healthcare',
    region: 'North America',
    plan: 'Growth',
    status: 'trial',
    users: 5,
    mrr: '$0',
    since: 'Apr 2026',
    owner: 'Dr. Priya Mehta',
    ownerEmail: 'priya@medisync.health',
    color: '#006778',
    sourcesQuota: 15,
    billing: { plan: 'Trial', monthly: 0, nextInvoice: 'Trial ends May 2, 2026', paymentMethod: 'N/A' },
    usage: { storageGB: 2, storageLimitGB: 50, apiCalls: 1200, apiLimitMonth: 200000, lastLogin: '1h ago' },
    alerts: [{ type: 'info', msg: 'Trial expires in 11 days', time: '1d ago' }],
    activity: [{ action: 'Trial workspace created', user: 'System', time: '3d ago' }],
    managers: [],
  },
  {
    id: 't4',
    name: 'FinCore Analytics',
    industry: 'Financial Services',
    region: 'North America',
    plan: 'Enterprise',
    status: 'active',
    users: 18,
    mrr: '$2,499',
    since: 'Aug 2022',
    owner: 'Marcus Patel',
    ownerEmail: 'marcus@fincore.com',
    color: '#6a4c93',
    sourcesQuota: 100,
    billing: { plan: 'Enterprise', monthly: 2499, nextInvoice: 'May 1, 2026', paymentMethod: 'Invoice' },
    usage: { storageGB: 124, storageLimitGB: 500, apiCalls: 845000, apiLimitMonth: 999999, lastLogin: '15 min ago' },
    alerts: [
      { type: 'critical', msg: 'API rate limit at 92% — consider upgrade', time: '1h ago' },
      { type: 'warn', msg: 'Source Salesforce sync overdue by 2h', time: '2h ago' },
    ],
    activity: [
      { action: 'Added compliance dataset', user: 'Marcus Patel', time: '6h ago' },
      { action: 'Ran full pipeline rebuild', user: 'System', time: '1d ago' },
    ],
    managers: [
      { name: 'Carol Zhang', role: 'Co-Admin', email: 'carol@fincore.com', title: 'CTO', since: 'Aug 2022' },
    ],
  },
]

// ─── DATA SOURCES ──────────────────────────────────
export const MOCK_SOURCES: DataSource[] = [
  { id: 'src-1', name: 'Salesforce CRM', label: 'prod-crm', type: 'CRM', abbr: 'SF', bg: '#00A1E0', fg: '#fff', connected: true, tenant: 't1', rows: 142580, lastSync: '14 min ago', nextSync: '46 min', health: 99 },
  { id: 'src-2', name: 'PostgreSQL', label: 'analytics-db', type: 'Database', abbr: 'PG', bg: '#336791', fg: '#fff', connected: true, tenant: 't1', rows: 892400, lastSync: '1h ago', nextSync: '2h', health: 97 },
  { id: 'src-3', name: 'HubSpot', label: 'marketing', type: 'Marketing', abbr: 'HS', bg: '#FF7A59', fg: '#fff', connected: true, tenant: 't2', rows: 34200, lastSync: '2h ago', nextSync: '4h', health: 98 },
  { id: 'src-4', name: 'Stripe', label: 'payments-prod', type: 'Payments', abbr: 'ST', bg: '#635BFF', fg: '#fff', connected: true, tenant: 't2', rows: 186900, lastSync: '30 min ago', nextSync: '30 min', health: 100 },
  { id: 'src-5', name: 'Snowflake', label: 'dw-main', type: 'Data Warehouse', abbr: 'SN', bg: '#29B5E8', fg: '#fff', connected: true, tenant: 't4', rows: 4200000, lastSync: '2h ago', nextSync: 'Overdue', health: 94 },
  { id: 'src-6', name: 'Zendesk', label: 'support', type: 'Support', abbr: 'ZD', bg: '#03363D', fg: '#fff', connected: true, tenant: 't1', rows: 28400, lastSync: '3h ago', nextSync: '5h', health: 96 },
  { id: 'src-7', name: 'Google BigQuery', label: 'bq-analytics', type: 'Data Warehouse', abbr: 'BQ', bg: '#4285F4', fg: '#fff', connected: true, tenant: 't4', rows: 1840000, lastSync: '1h ago', nextSync: '2h', health: 100 },
  { id: 'src-8', name: 'MySQL', label: 'ops-db', type: 'Database', abbr: 'MY', bg: '#00618A', fg: '#fff', connected: true, tenant: 't3', rows: 54200, lastSync: '45 min ago', nextSync: '1h', health: 99 },
  { id: 'src-9', name: 'Mixpanel', label: 'product-analytics', type: 'Analytics', abbr: 'MX', bg: '#7856FF', fg: '#fff', connected: false, tenant: 't2' },
  { id: 'src-10', name: 'Intercom', label: 'customer-chat', type: 'Support', abbr: 'IC', bg: '#1F8DED', fg: '#fff', connected: false, tenant: 't3' },
  { id: 'src-11', name: 'MongoDB', label: 'platform-db', type: 'Database', abbr: 'MG', bg: '#4DB33D', fg: '#fff', connected: true, rows: 220000, lastSync: '2h ago', nextSync: '4h', health: 98 },
  { id: 'src-12', name: 'Redis', label: 'cache-layer', type: 'Cache', abbr: 'RD', bg: '#DC382D', fg: '#fff', connected: false },
]

// ─── ALERTS ────────────────────────────────────────
export const MOCK_ALERTS: Alert[] = [
  { id: 'a1', title: 'Churn Rate Exceeded Threshold', desc: 'Customer churn rate is 4.8% — above the 4.0% warning threshold.', severity: 'critical', metric: 'churn_rate', threshold: '4.0%', time: '12 min ago', source: 'Salesforce CRM' },
  { id: 'a2', title: 'Revenue Pipeline Stalled', desc: 'No new deals closed in 72h. Pipeline velocity dropped 38%.', severity: 'warn', metric: 'pipeline_velocity', threshold: '0', time: '1h ago', source: 'HubSpot' },
  { id: 'a3', title: 'Source Sync Overdue', desc: 'Snowflake sync overdue by 4h. Expected window: every 2h.', severity: 'warn', metric: 'source_freshness', threshold: '2h', time: '4h ago', source: 'Snowflake' },
  { id: 'a4', title: 'Data Quality Score Dropped', desc: 'Overall quality score dropped from 94% to 87%. 42 records failing validation.', severity: 'warn', metric: 'quality_score', threshold: '90%', time: '6h ago', source: 'PostgreSQL' },
  { id: 'a5', title: 'New Data Schema Detected', desc: 'PostgreSQL analytics-db has 3 new columns that need ontology mapping.', severity: 'info', time: '1d ago', source: 'PostgreSQL' },
  { id: 'a6', title: 'API Rate Limit Warning', desc: 'FinCore tenant using 92% of monthly API limit. At current rate, limit exceeded in 3d.', severity: 'critical', metric: 'api_usage', threshold: '90%', time: '2h ago', source: 'Platform' },
  { id: 'a7', title: 'Model Drift Detected', desc: 'Customer segmentation model accuracy dropped below 80%.', severity: 'warn', metric: 'model_accuracy', threshold: '80%', time: '12h ago', source: 'ML Platform' },
  { id: 'a8', title: 'Storage Approaching Limit', desc: 'Pinnacle Energy at 68% storage capacity. Estimated 45 days to limit.', severity: 'info', time: '8h ago', source: 'Platform' },
]

// ─── TASKS ─────────────────────────────────────────
export const MOCK_TASKS: Task[] = [
  {
    id: 'tsk-1',
    title: 'Map revenue fields from Salesforce to unified schema',
    desc: 'Three revenue-related columns in Salesforce prod-crm need to be mapped to the Revenue concept in the ontology. Affects downstream dashboards.',
    assignee: 'mj',
    dueDate: 'Apr 22',
    status: 'open',
    priority: 'high',
    labels: ['mapping', 'revenue'],
    comments: [
      { author: 'Sarah Kim', text: 'Raj — can you help with the currency conversion logic here?', time: '2h ago' },
    ],
    activityLog: ['Created by Sarah Kim — Apr 18', 'Assigned to Mike Johnson — Apr 18'],
  },
  {
    id: 'tsk-2',
    title: 'Investigate churn rate anomaly in Q1 data',
    desc: 'Alert fired at 4.8% churn. Need to determine if this is data quality issue or real signal.',
    assignee: 'rd',
    dueDate: 'Apr 21',
    status: 'in-progress',
    priority: 'high',
    labels: ['investigation', 'churn'],
    comments: [],
    activityLog: ['Created by Tom Baker — Apr 17', 'Status changed to in-progress — Apr 18'],
  },
  {
    id: 'tsk-3',
    title: 'Onboard MediSync Health trial tenant',
    desc: 'Set up workspace, configure initial data sources, and schedule onboarding call.',
    assignee: 'sk',
    dueDate: 'Apr 24',
    status: 'open',
    priority: 'medium',
    labels: ['onboarding', 'tenant'],
    comments: [],
    activityLog: ['Created by Sarah Kim — Apr 19'],
  },
  {
    id: 'tsk-4',
    title: 'Fix PostgreSQL sync schedule',
    desc: 'analytics-db sync is running every 3h instead of configured 1h. Check connector config.',
    assignee: 'mj',
    dueDate: 'Apr 20',
    status: 'done',
    priority: 'high',
    labels: ['bug', 'sync'],
    comments: [{ author: 'Mike Johnson', text: 'Fixed — cron was misconfigured after last deployment.', time: '1d ago' }],
    activityLog: ['Created — Apr 15', 'Resolved by Mike Johnson — Apr 19'],
  },
  {
    id: 'tsk-5',
    title: 'Review and approve ontology v2.4 for Pinnacle Energy',
    desc: 'New version includes 8 new business concepts mapped from the OSIsoft PI source.',
    assignee: 'tb',
    dueDate: 'Apr 25',
    status: 'open',
    priority: 'medium',
    labels: ['approval', 'ontology'],
    comments: [],
    activityLog: ['Created by Raj Desai — Apr 18'],
  },
  {
    id: 'tsk-6',
    title: 'Deploy ML model v1.3 to production',
    desc: 'Customer churn model v1.3 passed staging validation. Ready for production deployment.',
    assignee: 'rd',
    dueDate: 'Apr 23',
    status: 'open',
    priority: 'medium',
    labels: ['ml', 'deployment'],
    comments: [],
    activityLog: ['Created by Raj Desai — Apr 19'],
  },
]

// ─── NOTIFICATIONS ──────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', text: 'Churn rate alert fired — 4.8% exceeds threshold', time: '12 min ago', read: false, type: 'error' },
  { id: 'n2', text: 'MediSync Health trial started — 14 days remaining', time: '3h ago', read: false, type: 'info' },
  { id: 'n3', text: 'Pipeline run #47 completed successfully — 1.2M rows', time: '6h ago', read: false, type: 'success' },
  { id: 'n4', text: 'FinCore API usage at 92% — approaching limit', time: '2h ago', read: false, type: 'warn' },
  { id: 'n5', text: 'Task "Fix PostgreSQL sync schedule" marked done by Mike Johnson', time: '1d ago', read: true, type: 'success' },
  { id: 'n6', text: 'Snowflake sync overdue — 4h past scheduled window', time: '4h ago', read: true, type: 'warn' },
  { id: 'n7', text: 'New invite: james@acmecorp.com accepted team invitation', time: '2d ago', read: true, type: 'info' },
]

// ─── CHAT MESSAGES ──────────────────────────────────
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'c1', role: 'user', content: 'What is our current churn rate and how does it compare to last quarter?', time: '10 min ago' },
  {
    id: 'c2',
    role: 'ai',
    content: 'Your current churn rate is **4.8%** (as of April 2026), which is up from **3.9%** last quarter — a **0.9 percentage point increase**.\n\nThis puts you above your warning threshold of 4.0%. The increase is driven primarily by the SMB segment, where churn has risen from 5.2% to 6.8% QoQ.',
    time: '10 min ago',
    citations: ['Salesforce CRM', 'Revenue Analytics'],
  },
  { id: 'c3', role: 'user', content: 'Which customer segments are driving the increase?', time: '8 min ago' },
  {
    id: 'c4',
    role: 'ai',
    content: 'Three segments are driving the churn increase:\n\n1. **SMB (< $50K ARR)** — Churn up 1.6pp to 6.8%. Main cause: price sensitivity after Q1 repricing.\n2. **Mid-Market E-commerce** — Churn up 0.8pp to 4.2%. Correlated with competitor launches.\n3. **Trial Conversions** — Conversion rate dropped from 28% to 21%. Onboarding friction flagged in NPS feedback.',
    time: '8 min ago',
    citations: ['Salesforce CRM', 'HubSpot', 'NPS Survey Data'],
  },
  { id: 'c5', role: 'user', content: 'Can you generate a retention action plan?', time: '5 min ago' },
  {
    id: 'c6',
    role: 'ai',
    content: 'Based on your data patterns, here is a recommended retention action plan:\n\n**Immediate (This Week)**\n- Contact top 20 at-risk SMB accounts (predicted churn score > 0.7)\n- Schedule QBRs with all Mid-Market accounts dormant for 14+ days\n\n**Short-term (This Month)**\n- Launch SMB retention discount program (10-15% for 6-month commits)\n- Revise trial onboarding flow — target 3-step reduction in time-to-first-value\n- Assign CSM to all trial accounts with >5 users\n\n**Tracking**\nSet weekly churn rate checkpoints. Target: return to 3.9% by May 31.',
    time: '5 min ago',
    citations: ['Salesforce CRM', 'Customer Success Platform', 'ML Churn Model v1.3'],
  },
]

// ─── SYNC HISTORY ──────────────────────────────────
export const MOCK_SYNC_HISTORY: SyncHistoryItem[] = [
  { source: 'Salesforce CRM', time: '14 min ago', rows: '142,580', duration: '48s', status: 'ok' },
  { source: 'Stripe', time: '30 min ago', rows: '186,900', duration: '32s', status: 'ok' },
  { source: 'PostgreSQL', time: '1h ago', rows: '892,400', duration: '2m 14s', status: 'ok' },
  { source: 'HubSpot', time: '2h ago', rows: '34,200', duration: '28s', status: 'ok' },
  { source: 'Zendesk', time: '3h ago', rows: '28,400', duration: '22s', status: 'warn' },
  { source: 'Google BigQuery', time: '4h ago', rows: '1,840,000', duration: '8m 42s', status: 'ok' },
  { source: 'MySQL', time: '45 min ago', rows: '54,200', duration: '34s', status: 'ok' },
  { source: 'MongoDB', time: '2h ago', rows: '220,000', duration: '1m 12s', status: 'ok' },
]

// ─── KPI STATS ──────────────────────────────────────
export const MOCK_KPI_STATS: KPIStats[] = [
  { label: 'Total Revenue MTD', value: '$1.24M', sub: '$1.18M last month', delta: '+5.1% vs last month', deltaType: 'up' },
  { label: 'Active Customers', value: '2,847', sub: 'Net new: +42 this month', delta: '+1.5% MoM', deltaType: 'up' },
  { label: 'Churn Rate', value: '4.8%', sub: 'Threshold: 4.0%', delta: '+0.9pp vs last quarter', deltaType: 'down' },
  { label: 'NPS Score', value: '52', sub: 'Based on 284 responses', delta: '+4 pts vs Q4 2025', deltaType: 'up' },
  { label: 'Data Sources', value: '12', sub: '8 connected, 4 pending', delta: '+2 this month', deltaType: 'up' },
  { label: 'Pipeline Health', value: '94%', sub: 'Last run: 6h ago', delta: '-2% vs last week', deltaType: 'down' },
  { label: 'Data Quality', value: '87%', sub: '42 records failing', delta: '-7pp this week', deltaType: 'down' },
  { label: 'AI Queries', value: '1,284', sub: 'Avg response: 1.2s', delta: '+18% vs last week', deltaType: 'up' },
]

// ─── MONITORING DATA ────────────────────────────────
export const MOCK_MONITORING = {
  uptime: '99.97%',
  activeConnections: 8,
  avgLatency: '124ms',
  errorRate: '0.02%',
  chartData: [
    { label: 'Mon', value: 84, secondary: 92 },
    { label: 'Tue', value: 92, secondary: 88 },
    { label: 'Wed', value: 88, secondary: 94 },
    { label: 'Thu', value: 96, secondary: 90 },
    { label: 'Fri', value: 91, secondary: 87 },
    { label: 'Sat', value: 78, secondary: 84 },
    { label: 'Sun', value: 85, secondary: 89 },
  ],
}

// ─── SAVED CONVERSATIONS ────────────────────────────
export const MOCK_SAVED_CONVOS = [
  { id: 0, label: 'Churn Analysis Q1 2026', time: '10 min ago' },
  { id: 1, label: 'Revenue Breakdown by Segment', time: '2h ago' },
  { id: 2, label: 'NPS Driver Analysis', time: '1d ago' },
  { id: 3, label: 'Pipeline Velocity Report', time: '3d ago' },
  { id: 4, label: 'Data Quality Summary', time: '1w ago' },
]
