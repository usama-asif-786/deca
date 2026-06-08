import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, Play, FileCode2, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

const TABS = [
  'Ontology Pipeline',
  'Pipeline Engine',
  'Pipeline-as-Code',
  'Readiness',
  'Data Quality',
  'Versioning',
  'Data Contracts',
]

// ─── Ontology Pipeline mock data ─────────────────────────────────────────────

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_SOURCE_SCAN = [
  { source: 'Salesforce', abbr: 'SF', bg: '#0099D7', fg: '#fff', type: 'SaaS CRM', cols: 48, rows: 24800, clean: 38, review: 7, unmapped: 3, lastScan: '5 min ago' },
  { source: 'Stripe', abbr: 'ST', bg: '#635BFF', fg: '#fff', type: 'SaaS Payments', cols: 32, rows: 142000, clean: 28, review: 3, unmapped: 1, lastScan: '5 min ago' },
  { source: 'HubSpot', abbr: 'HS', bg: '#FF7A59', fg: '#fff', type: 'SaaS CRM', cols: 22, rows: 18500, clean: 19, review: 2, unmapped: 1, lastScan: '10 min ago' },
  { source: 'QuickBooks', abbr: 'QB', bg: '#2CA01C', fg: '#fff', type: 'SaaS Accounting', cols: 18, rows: 8900, clean: 16, review: 1, unmapped: 1, lastScan: '15 min ago' },
  { source: 'Zendesk', abbr: 'ZD', bg: '#03363D', fg: '#fff', type: 'SaaS Support', cols: 14, rows: 31200, clean: 14, review: 0, unmapped: 0, lastScan: '20 min ago' },
]

const MOCK_COL_PROFILES = [
  { col: 'customer_id', source: 'Salesforce', type: 'VARCHAR(36)', nullPct: '0%', unique: '100%', min: 'c-0001', max: 'c-9842', anomalies: 0, status: 'clean' },
  { col: 'email', source: 'Salesforce', type: 'VARCHAR(255)', nullPct: '0.2%', unique: '99.8%', min: 'a...', max: 'z...', anomalies: 2, status: 'review' },
  { col: 'mrr', source: 'Stripe', type: 'DECIMAL(10,2)', nullPct: '1.1%', unique: '82%', min: '0.00', max: '49800.00', anomalies: 0, status: 'clean' },
  { col: 'created_at', source: 'Salesforce', type: 'TIMESTAMP', nullPct: '0%', unique: '98%', min: '2022-01-01', max: '2026-04-15', anomalies: 0, status: 'clean' },
  { col: 'phone', source: 'HubSpot', type: 'VARCHAR(20)', nullPct: '18%', unique: '92%', min: '+1-2...', max: '+9-9...', anomalies: 14, status: 'review' },
  { col: 'amount', source: 'Stripe', type: 'INTEGER', nullPct: '0%', unique: '74%', min: '0', max: '4980000', anomalies: 3, status: 'review' },
  { col: 'product_id', source: 'Salesforce', type: 'VARCHAR(36)', nullPct: '4.2%', unique: '100%', min: 'p-0001', max: 'p-0412', anomalies: 0, status: 'clean' },
  { col: 'ticket_subject', source: 'Zendesk', type: 'TEXT', nullPct: '0%', unique: '94%', min: 'A...', max: 'Z...', anomalies: 0, status: 'clean' },
]

const MOCK_TRANSFORMS = [
  { col: 'customer_id', source: 'Salesforce', rule: 'rename', expr: 'customer_id → id', output: 'customer.id', status: 'ok' },
  { col: 'email', source: 'Salesforce', rule: 'lowercase + trim', expr: 'LOWER(TRIM(email))', output: 'customer.email', status: 'ok' },
  { col: 'mrr', source: 'Stripe', rule: 'cast + divide', expr: 'CAST(mrr AS FLOAT) / 100', output: 'customer.mrr', status: 'ok' },
  { col: 'phone', source: 'HubSpot', rule: 'regex normalize', expr: 'REGEXP_REPLACE(phone, "[^0-9+]", "")', output: 'customer.phone', status: 'warn' },
  { col: 'amount', source: 'Stripe', rule: 'cast + divide', expr: 'amount / 100.0', output: 'transaction.amount_usd', status: 'ok' },
  { col: 'created_at', source: 'Salesforce', rule: 'parse date', expr: 'TO_TIMESTAMP(created_at)', output: 'customer.created_at', status: 'ok' },
]

const MOCK_CLASSIFY_RESULTS = [
  { col: 'customer_id', source: 'Salesforce', suggested: 'Entity ID', confidence: 98, concept: 'Customer', status: 'accepted' },
  { col: 'email', source: 'Salesforce', suggested: 'PII: Email', confidence: 99, concept: 'Customer', status: 'accepted' },
  { col: 'mrr', source: 'Stripe', suggested: 'Financial: Revenue', confidence: 94, concept: 'Transaction', status: 'accepted' },
  { col: 'phone', source: 'HubSpot', suggested: 'PII: Phone', confidence: 91, concept: 'Customer', status: 'review' },
  { col: 'ticket_subject', source: 'Zendesk', suggested: 'Text: Support', confidence: 87, concept: 'Support Ticket', status: 'accepted' },
  { col: 'product_id', source: 'Salesforce', suggested: 'Entity ID', confidence: 96, concept: 'Product', status: 'review' },
]

const MOCK_ER_CANDIDATES = [
  { id: 1, field: 'email', sources: ['Salesforce', 'HubSpot'], matches: 1842, score: 0.98, type: 'Exact', status: 'pending' },
  { id: 2, field: 'customer_id fuzzy', sources: ['Stripe', 'Salesforce'], matches: 421, score: 0.91, type: 'Fuzzy', status: 'pending' },
  { id: 3, field: 'company_name', sources: ['HubSpot', 'QuickBooks'], matches: 284, score: 0.84, type: 'Phonetic', status: 'merged' },
  { id: 4, field: 'phone', sources: ['HubSpot', 'Salesforce'], matches: 156, score: 0.79, type: 'Fuzzy', status: 'rejected' },
]

// Rich candidate pairs for side-by-side comparison
const MOCK_ER_PAIRS = [
  {
    id: 'p1', concept: 'Customer', confidence: 98, status: 'pending',
    matchedBy: 'Exact email match',
    a: { id: 'SF-c-1042', source: 'Salesforce', name: 'Acme Corp', email: 'john@acme.com', phone: '+1-555-0101', city: 'New York', country: 'US' },
    b: { id: 'HS-ct-8812', source: 'HubSpot', name: 'Acme Corporation', email: 'john@acme.com', phone: '+15550101', city: 'New York', country: null },
  },
  {
    id: 'p2', concept: 'Customer', confidence: 91, status: 'pending',
    matchedBy: 'Fuzzy name + phone',
    a: { id: 'SF-c-2201', source: 'Salesforce', name: 'GlobalTech Inc', email: 'sales@globaltech.io', phone: '+44-207-100-2200', city: 'London', country: 'UK' },
    b: { id: 'QB-cust-334', source: 'QuickBooks', name: 'Global Tech Inc.', email: null, phone: '+442071002200', city: 'London', country: 'UK' },
  },
  {
    id: 'p3', concept: 'Customer', confidence: 96, status: 'matched',
    matchedBy: 'Exact email match',
    resolvedName: 'Bright Ventures LLC',
    a: { id: 'SF-c-0821', source: 'Salesforce', name: 'Bright Ventures LLC', email: 'billing@brightventures.com', phone: '+1-415-900-1234', city: 'San Francisco', country: 'US' },
    b: { id: 'ST-cus-9932', source: 'Stripe', name: 'Bright Ventures', email: 'billing@brightventures.com', phone: null, city: null, country: 'US' },
  },
  {
    id: 'p4', concept: 'Customer', confidence: 79, status: 'rejected',
    matchedBy: 'Fuzzy name',
    a: { id: 'SF-c-3310', source: 'Salesforce', name: 'Atlas Manufacturing', email: 'info@atlas-us.com', phone: '+1-312-555-0088', city: 'Chicago', country: 'US' },
    b: { id: 'HS-ct-5521', source: 'HubSpot', name: 'Atlas Manufacturing GmbH', email: 'info@atlas.de', phone: '+49-89-12345', city: 'Munich', country: 'DE' },
  },
]

// Transform source columns mock data
const MOCK_SOURCE_COLS: Record<string, { col: string; type: string; nullable: boolean; status: string; samples: string[]; expr: string }[]> = {
  salesforce: [
    { col: 'customer_id', type: 'VARCHAR(36)', nullable: false, status: 'configured', samples: ['c-0001', 'c-1042', 'c-9842', 'c-0210'], expr: 'customer_id' },
    { col: 'email', type: 'VARCHAR(255)', nullable: false, status: 'configured', samples: ['John.DOE@Acme.COM', 'alice@corp.org', 'NULL', 'bob@email.COM'], expr: 'LOWER(TRIM(email))' },
    { col: 'AnnualRevenue', type: 'DECIMAL(15,2)', nullable: true, status: 'needs_review', samples: ['$4,500.00', 'NULL', '$120,000.00', '$89,000.00'], expr: 'AnnualRevenue' },
    { col: 'Phone', type: 'VARCHAR(20)', nullable: true, status: 'needs_review', samples: ['(555) 123-4567', '+1-800-555-0199', 'NULL', '5551234567'], expr: 'Phone' },
    { col: 'CreatedDate', type: 'DATETIME', nullable: false, status: 'clean', samples: ['2024-01-15T09:30:00Z', '2024-03-22T14:12:00Z', '2025-11-08T08:00:00Z', '2026-01-01T00:00:00Z'], expr: 'CreatedDate' },
  ],
  stripe: [
    { col: 'customer_id', type: 'VARCHAR(18)', nullable: false, status: 'clean', samples: ['cus_abc123', 'cus_xyz999', 'cus_def456', 'cus_ghi789'], expr: 'customer_id' },
    { col: 'mrr', type: 'INTEGER', nullable: false, status: 'configured', samples: ['450000', '1280000', '0', '89000'], expr: 'CAST(mrr AS FLOAT) / 100' },
    { col: 'amount', type: 'INTEGER', nullable: false, status: 'configured', samples: ['4500', '128000', '0', '8900'], expr: 'amount / 100.0' },
    { col: 'currency', type: 'VARCHAR(3)', nullable: false, status: 'clean', samples: ['usd', 'eur', 'gbp', 'usd'], expr: 'currency' },
  ],
  hubspot: [
    { col: 'hs_object_id', type: 'BIGINT', nullable: false, status: 'clean', samples: ['8812', '5521', '1023', '9900'], expr: 'hs_object_id' },
    { col: 'phone', type: 'VARCHAR(20)', nullable: true, status: 'needs_review', samples: ['(555) 123-9900', 'NULL', '+44 207 100 2200', '555-900-1234'], expr: 'phone' },
    { col: 'email', type: 'VARCHAR(255)', nullable: true, status: 'configured', samples: ['info@corp.com', 'NULL', 'sales@globaltech.io', 'contact@foo.org'], expr: 'LOWER(TRIM(email))' },
  ],
}

// ER matching rules mock
const MOCK_ER_RULES = [
  { name: 'Exact Email Match', type: 'exact', fields: ['email'], weight: 100, threshold: null, enabled: true },
  { name: 'Fuzzy Name + Phone', type: 'fuzzy', fields: ['name', 'phone'], weight: 80, threshold: 85, enabled: true },
  { name: 'Composite: Name + Country', type: 'composite', fields: ['name', 'country'], weight: 60, threshold: 90, enabled: true },
  { name: 'Phonetic Company Name', type: 'fuzzy', fields: ['name'], weight: 40, threshold: 95, enabled: false },
]

// Merged entities mock
const MOCK_ER_MERGED = [
  { id: 'm1', name: 'Bright Ventures LLC', sources: ['Salesforce:SF-c-0821', 'Stripe:ST-cus-9932'], fieldCount: 14, confidence: 96 },
  { id: 'm2', name: 'TechCorp Solutions', sources: ['Salesforce:SF-c-1105', 'HubSpot:HS-ct-2240', 'QuickBooks:QB-cust-110'], fieldCount: 18, confidence: 91 },
  { id: 'm3', name: 'Nexus Data Inc', sources: ['HubSpot:HS-ct-7731', 'Stripe:ST-cus-4421'], fieldCount: 11, confidence: 88 },
]

// Blocking rules mock
const MOCK_BLOCKING_RULES = [
  { field: 'country', desc: 'Only compare records from the same country code', enabled: true },
  { field: 'industry', desc: 'Only compare records in the same industry vertical', enabled: false },
]

// Relate relationships for graph
const MOCK_RELATIONSHIPS = [
  { from: 'Customer', to: 'Transaction', type: 'has_many', joinKey: 'customer_id', desc: 'A customer has many transactions' },
  { from: 'Transaction', to: 'Product', type: 'references', joinKey: 'product_id', desc: 'A transaction references one product' },
  { from: 'Customer', to: 'Support Ticket', type: 'has_many', joinKey: 'customer_id', desc: 'A customer has many support tickets' },
  { from: 'Campaign', to: 'Customer', type: 'targets', joinKey: 'utm_source', desc: 'Campaigns target customers via UTM tracking' },
  { from: 'Employee', to: 'Customer', type: 'manages', joinKey: 'owner_id', desc: 'An employee manages multiple customers' },
]

const MOCK_SCHEMA_TABLES = [
  { name: 'customer_360', fields: 28, sources: 3, rows: '62.1K', version: 'v3.2.1', status: 'ready' },
  { name: 'transaction_unified', fields: 18, sources: 2, rows: '142K', version: 'v2.0.1', status: 'ready' },
  { name: 'product_catalog', fields: 12, sources: 2, rows: '412', version: 'v1.4.0', status: 'ready' },
  { name: 'support_case', fields: 14, sources: 1, rows: '31.2K', version: 'v1.1.0', status: 'ready' },
]

const MOCK_DEPLOY_ENVS = [
  { name: 'Development', slug: 'dev', status: 'deployed', version: 'v3.2.1', deployed: '10 min ago', checks: 42, passed: 42 },
  { name: 'Staging', slug: 'staging', status: 'deployed', version: 'v3.2.0', deployed: '2 days ago', checks: 42, passed: 41 },
  { name: 'Production', slug: 'prod', status: 'outdated', version: 'v3.1.2', deployed: '2 weeks ago', checks: 42, passed: 40 },
]

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_CONCEPTS = [
  { concept: 'Customer', sources: ['Salesforce', 'HubSpot', 'QuickBooks'], fields: 14, mapped: 12, status: 'active' },
  { concept: 'Transaction', sources: ['Stripe', 'QuickBooks'], fields: 8, mapped: 8, status: 'active' },
  { concept: 'Product', sources: ['Salesforce', 'Stripe'], fields: 6, mapped: 5, status: 'partial' },
  { concept: 'Support Ticket', sources: ['Zendesk'], fields: 10, mapped: 10, status: 'active' },
  { concept: 'Employee', sources: ['Rippling'], fields: 12, mapped: 7, status: 'partial' },
  { concept: 'Campaign', sources: ['HubSpot'], fields: 9, mapped: 9, status: 'active' },
]

// TODO: Replace with RTK Query / WebSocket for live pipeline status — see src/app/services/api.ts
const MOCK_PIPELINES = [
  { name: 'Customer 360 Pipeline', status: 'running', progress: 72, lastRun: '5 min ago', duration: '4m 12s', records: '48,291' },
  { name: 'Revenue Attribution', status: 'success', progress: 100, lastRun: '1hr ago', duration: '2m 08s', records: '12,440' },
  { name: 'Churn Risk Scoring', status: 'queued', progress: 0, lastRun: '3hr ago', duration: '—', records: '—' },
  { name: 'Support Ticket Enrichment', status: 'failed', progress: 45, lastRun: '30 min ago', duration: '1m 55s', records: '—' },
]

// TODO: Replace with RTK Query endpoint for readiness scores — see src/app/services/api.ts
const READINESS_CATEGORIES = [
  { label: 'Data Coverage', score: 84, color: 'var(--green)' },
  { label: 'Schema Consistency', score: 91, color: 'var(--green)' },
  { label: 'Freshness SLA', score: 67, color: 'var(--amber)' },
  { label: 'PII Compliance', score: 78, color: 'var(--amber)' },
  { label: 'Lineage Completeness', score: 55, color: 'var(--red)' },
]

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_DQ_SUITES = [
  { name: 'customer_quality', expectations: 42, lastRun: '5m ago', status: 'Pass', coverage: '98%', checks: ['expect_column_values_to_not_be_null(email)', 'expect_column_values_to_be_unique(customer_id)', 'expect_column_values_to_match_regex(phone)'] },
  { name: 'txn_validation', expectations: 38, lastRun: '12m ago', status: 'Warn', coverage: '91%', checks: ['expect_column_mean_to_be_between(amount, 50, 200)', 'expect_column_values_to_be_in_set(currency)', 'expect_table_row_count_to_be_between(10000, 500000)'] },
  { name: 'product_integrity', expectations: 28, lastRun: '1h ago', status: 'Pass', coverage: '100%', checks: ['expect_column_values_to_not_be_null(product_id)', 'expect_column_values_to_be_unique(sku)'] },
  { name: 'events_schema', expectations: 55, lastRun: '3m ago', status: 'Fail', coverage: '88%', checks: ['expect_column_values_to_match_regex(event_type, ^[a-z_]+$)', 'expect_table_row_count_to_be_between(10000, 500000)', 'expect_column_values_to_not_be_null(user_id)'] },
  { name: 'ml_features', expectations: 64, lastRun: '20m ago', status: 'Pass', coverage: '97%', checks: ['expect_column_max_to_be_between(churn_score, 0, 1)', 'expect_column_values_to_not_be_null(feature_vector)'] },
  { name: 'pii_compliance', expectations: 22, lastRun: '2h ago', status: 'Pass', coverage: '100%', checks: ['expect_column_values_to_not_be_null(masked_ssn)', 'expect_column_values_to_match_regex(masked_email)'] },
]

const MOCK_DQ_RESULTS = [
  { expectation: 'expect_column_values_to_not_be_null', suite: 'customer_quality', column: 'email', expected: '0% null', observed: '0% null', result: 'Pass' },
  { expectation: 'expect_column_values_to_be_unique', suite: 'customer_quality', column: 'customer_id', expected: 'unique', observed: 'unique', result: 'Pass' },
  { expectation: 'expect_column_mean_to_be_between', suite: 'txn_validation', column: 'amount', expected: '50–200', observed: '142.8', result: 'Pass' },
  { expectation: 'expect_column_values_to_match_regex', suite: 'events_schema', column: 'event_type', expected: '^[a-z_]+$', observed: '3 violations', result: 'Fail' },
  { expectation: 'expect_table_row_count_to_be_between', suite: 'events_schema', column: '*', expected: '10K–500K', observed: '8,421', result: 'Fail' },
  { expectation: 'expect_column_values_to_be_in_set', suite: 'txn_validation', column: 'currency', expected: 'USD,EUR,GBP', observed: 'USD,EUR,GBP,JPY', result: 'Fail' },
  { expectation: 'expect_column_max_to_be_between', suite: 'ml_features', column: 'churn_score', expected: '0–1', observed: '0.98', result: 'Pass' },
]

const MOCK_DQ_HISTORY = [
  { date: '2026-04-15 08:00', suite: 'customer_quality', passed: 42, failed: 0, total: 42, duration: '12s' },
  { date: '2026-04-15 07:45', suite: 'events_schema', passed: 48, failed: 7, total: 55, duration: '28s' },
  { date: '2026-04-15 07:30', suite: 'txn_validation', passed: 35, failed: 3, total: 38, duration: '18s' },
  { date: '2026-04-15 06:00', suite: 'ml_features', passed: 62, failed: 2, total: 64, duration: '45s' },
  { date: '2026-04-14 22:00', suite: 'pii_compliance', passed: 22, failed: 0, total: 22, duration: '8s' },
]

const DQ_TREND = [96, 94, 97, 93, 91, 95, 94]

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_DVC_DATASETS = [
  { name: 'customers_v3', size: '420 MB', rows: '1.2M', version: 'v3.2.1', hash: 'a3f8c2d', modified: '2h ago', files: ['customers.parquet (418 MB)', 'schema.json (2 KB)', 'metadata.yaml (1 KB)'] },
  { name: 'transactions', size: '1.2 GB', rows: '8.4M', version: 'v2.8.0', hash: 'b7e1f4a', modified: '6h ago', files: ['txn_2024.parquet (400 MB)', 'txn_2025.parquet (600 MB)', 'txn_2026.parquet (200 MB)'] },
  { name: 'clickstream_raw', size: '340 MB', rows: '24M', version: 'v1.14.3', hash: 'c9d2e5b', modified: '1d ago', files: ['events_apr.parquet (120 MB)', 'events_mar.parquet (220 MB)'] },
  { name: 'feature_cache', size: '89 MB', rows: '1.2M', version: 'v4.1.0', hash: 'd1a3f7c', modified: '3h ago', files: ['features.parquet (88 MB)', 'manifest.json (1 MB)'] },
]

const MOCK_VERSIONS = [
  { tag: 'v3.2.1', commit: 'a3f8c2d', date: '2026-04-15', delta: '+2.1 MB', author: 'sarah', msg: 'Add loyalty_tier column' },
  { tag: 'v3.2.0', commit: 'b1e4f7a', date: '2026-04-12', delta: '+18 MB', author: 'james', msg: 'Backfill missing zip codes' },
  { tag: 'v3.1.2', commit: 'c7d9e3b', date: '2026-04-08', delta: '-4.2 MB', author: 'sarah', msg: 'Remove duplicate records' },
  { tag: 'v3.1.0', commit: 'e5b3a9d', date: '2026-04-01', delta: '+42 MB', author: 'james', msg: 'Monthly refresh from CRM' },
  { tag: 'v3.0.0', commit: 'b9d3c6a', date: '2026-03-20', delta: '+380 MB', author: 'james', msg: 'Major schema overhaul v3' },
]

const DVC_PIPELINE_STAGES = [
  { name: 'dvc pull', color: 'var(--lime)', cmd: 'dvc pull customers_v3.dvc' },
  { name: 'preprocess', color: 'var(--cyan)', cmd: 'python src/preprocess.py' },
  { name: 'validate', color: 'var(--amber)', cmd: 'great_expectations checkpoint run customer_quality' },
  { name: 'split', color: 'var(--cyan)', cmd: 'python src/split.py --ratio 0.8' },
  { name: 'featurize', color: 'var(--purple)', cmd: 'python src/features.py' },
  { name: 'train', color: 'var(--red)', cmd: 'python src/train.py --model xgboost' },
]

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_CONTRACTS = [
  { name: 'customer-profile', producer: 'CRM Team', consumers: ['ML', 'Analytics'], checks: 8, status: 'Active', details: ['Freshness < 5min', 'Null rate < 1%', 'Schema match v3', 'Row count > 1M', 'Uniqueness on customer_id'] },
  { name: 'transaction-feed', producer: 'Payments', consumers: ['Fraud', 'BI'], checks: 12, status: 'Active', details: ['Freshness < 1min', 'Amount range 0–50000', 'Currency in (USD,EUR,GBP)', 'Schema match v2'] },
  { name: 'product-catalog', producer: 'Commerce', consumers: ['Search', 'Reco'], checks: 6, status: 'Active', details: ['Freshness < 1hr', 'Product ID unique', 'Price > 0'] },
  { name: 'clickstream-v2', producer: 'Web Platform', consumers: ['Analytics'], checks: 10, status: 'Violated', details: ['Freshness < 10min (VIOLATED)', 'Null rate < 5% (VIOLATED)', 'Event type regex match', 'Session ID not null'] },
  { name: 'model-scores', producer: 'ML Platform', consumers: ['Decisioning'], checks: 5, status: 'Active', details: ['Score range 0–1', 'Freshness < 30s', 'Model version match'] },
]

const MOCK_VIOLATIONS = [
  { contract: 'clickstream-v2', check: 'freshness', expected: '< 10min', actual: '14min', severity: 'High', time: '2026-04-15 06:12' },
  { contract: 'transaction-feed', check: 'schema', expected: '12 fields', actual: '13 fields (drift)', severity: 'Medium', time: '2026-04-14 22:30' },
  { contract: 'clickstream-v2', check: 'null_rate', expected: '< 5%', actual: '7.2%', severity: 'High', time: '2026-04-13 14:05' },
  { contract: 'product-catalog', check: 'row_count', expected: '> 10000', actual: '9,842', severity: 'Low', time: '2026-04-12 18:20' },
  { contract: 'clickstream-v2', check: 'freshness', expected: '< 10min', actual: '22min', severity: 'Critical', time: '2026-04-10 03:45' },
]

const PIPELINE_YAML = `# TODO: This will be editable with real-time execution via WebSocket
name: customer_360_pipeline
version: "2.1"
schedule: "0 */1 * * *"  # Every hour

sources:
  - id: salesforce_customers
    connector: salesforce
    entity: Account
    fields: [Id, Name, Industry, AnnualRevenue]

  - id: stripe_mrr
    connector: stripe
    entity: Subscription
    fields: [customer_id, mrr, status]

transformations:
  - name: normalize_customer_id
    type: map
    input: salesforce_customers.Id
    output: customer_id

  - name: calculate_health_score
    type: compute
    formula: "(nps_score * 0.3) + (login_frequency * 0.4) + (ticket_ratio * 0.3)"

output:
  entity: customer_360
  destination: warehouse
  freshness_sla: 2h`

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

function pipelineStatusClass(status: string) {
  switch (status) {
    case 'running': return 'pill pill-blue'
    case 'success': return 'pill pill-green'
    case 'failed': return 'pill pill-red'
    default: return 'pill'
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'running') return <Clock size={13} style={{ color: 'var(--cyan)' }} />
  if (status === 'success') return <CheckCircle2 size={13} style={{ color: 'var(--green)' }} />
  if (status === 'failed') return <XCircle size={13} style={{ color: 'var(--red)' }} />
  return <AlertTriangle size={13} style={{ color: 'var(--text3)' }} />
}

function severityClass(s: string) {
  if (s === 'Critical' || s === 'High') return 'pill pill-red'
  if (s === 'Medium') return 'pill pill-amber'
  return 'pill pill-blue'
}

// ─── Sub-tab button row ───────────────────────────────────────────────────────
function SubTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
      {tabs.map((t) => (
        <button
          key={t}
          className={`btn btn-xs ${active === t ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onChange(t)}
          type="button"
        >
          {t}
        </button>
      ))}
    </div>
  )
}

const ONT_TABS = ['1. Discover', '2. Profile', '3. Transform', '4. Classify', '5. Model', '6. Resolve', '7. Relate', '8. Materialize', '9. Publish']

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState('Ontology Pipeline')

  // Ontology Pipeline sub-tabs
  const [ontTab, setOntTab] = useState('1. Discover')
  const [discoverExpanded, setDiscoverExpanded] = useState<number | null>(null)
  const [resolveExpanded, setResolveExpanded] = useState<number | null>(null)

  // Transform Studio state
  const [transformSource, setTransformSource] = useState<string | null>('salesforce')
  const [transformExpanded, setTransformExpanded] = useState<string | null>(null)
  const [transformExprMode, setTransformExprMode] = useState<Record<string, boolean>>({})

  // Entity Resolution state
  const [erTab, setErTab] = useState('overview')
  const [erStatusFilter, setErStatusFilter] = useState('pending')

  // Data Quality sub-state
  const [dqInner, setDqInner] = useState('Suites')
  const [dqExpandSuite, setDqExpandSuite] = useState<number | null>(null)

  // Versioning sub-state
  const [verInner, setVerInner] = useState('Datasets')
  const [verExpandDs, setVerExpandDs] = useState<number | null>(null)

  // Data Contracts sub-state
  const [dcInner, setDcInner] = useState('Contracts')
  const [dcExpandContract, setDcExpandContract] = useState<number | null>(null)

  const overallReadiness = Math.round(
    READINESS_CATEGORIES.reduce((acc, c) => acc + c.score, 0) / READINESS_CATEGORIES.length,
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Data Management
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          Ontology mapping, pipeline orchestration, data quality, and governance
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
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

      {/* ── Ontology Pipeline ── */}
      {activeTab === 'Ontology Pipeline' && (
        <div>
          {/* 6-stat header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Source Columns', value: MOCK_SOURCE_SCAN.reduce((a, s) => a + s.cols, 0), color: 'var(--text)' },
              { label: 'Transforms OK', value: MOCK_SOURCE_SCAN.reduce((a, s) => a + s.clean, 0), color: 'var(--green)' },
              { label: 'Needs Review', value: MOCK_SOURCE_SCAN.reduce((a, s) => a + s.review, 0), color: 'var(--amber)' },
              { label: 'Concepts', value: MOCK_CONCEPTS.length, color: 'var(--text)' },
              { label: 'Assigned', value: MOCK_CONCEPTS.filter(c => c.status === 'active').reduce((a, c) => a + c.mapped, 0), color: 'var(--green)' },
              { label: 'Unassigned', value: MOCK_SOURCE_SCAN.reduce((a, s) => a + s.unmapped, 0), color: 'var(--red)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* 9 sub-tabs */}
          <div className="tabs" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            {ONT_TABS.map((t) => (
              <button key={t} className={cn('tab', ontTab === t && 'active')} onClick={() => setOntTab(t)} type="button">{t}</button>
            ))}
          </div>

          {/* 1. Discover */}
          {ontTab === '1. Discover' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: 14 }}>
                Fulcrum scanned {MOCK_SOURCE_SCAN.length} connected sources and found {MOCK_SOURCE_SCAN.reduce((a, s) => a + s.cols, 0)} columns across {(MOCK_SOURCE_SCAN.reduce((a, s) => a + s.rows, 0) / 1000).toFixed(0)}K rows.
              </p>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>Source Breakdown ({MOCK_SOURCE_SCAN.length} sources)</div>
                  <button className="btn btn-xs btn-ghost" onClick={() => showToast('Re-scanning all sources…')}>↺ Re-scan All</button>
                </div>
                {MOCK_SOURCE_SCAN.map((s, idx) => {
                  const health = Math.round((s.clean / s.cols) * 100)
                  const isExp = discoverExpanded === idx
                  return (
                    <div key={s.source} style={{ borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', background: isExp ? 'var(--bg3)' : undefined }} onClick={() => setDiscoverExpanded(isExp ? null : idx)}>
                        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius)', background: s.bg, color: s.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{s.abbr}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{s.source}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{s.type}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 'var(--text-xs)', color: 'var(--text3)', alignItems: 'center' }}>
                          <span><strong style={{ color: 'var(--text)' }}>{s.cols}</strong> cols</span>
                          <span><strong style={{ color: 'var(--text)' }}>{s.rows.toLocaleString()}</strong> rows</span>
                          <span style={{ color: s.review > 0 ? 'var(--amber)' : 'var(--green)' }}>{s.review} review</span>
                          <div style={{ width: 50 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                              <span>Health</span><span style={{ color: health >= 80 ? 'var(--green)' : 'var(--amber)' }}>{health}%</span>
                            </div>
                            <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2 }}>
                              <div style={{ height: 4, borderRadius: 2, width: `${health}%`, background: health >= 80 ? 'var(--green)' : 'var(--amber)' }} />
                            </div>
                          </div>
                          <span>{s.lastScan}</span>
                          <span style={{ color: 'var(--text3)' }}>{isExp ? '▼' : '▶'}</span>
                        </div>
                      </div>
                      {isExp && (
                        <div style={{ background: 'var(--bg3)', padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
                            {[{ l: 'Clean', v: s.clean, c: 'var(--green)' }, { l: 'Needs Review', v: s.review, c: 'var(--amber)' }, { l: 'Unmapped', v: s.unmapped, c: 'var(--red)' }, { l: 'Total', v: s.cols, c: 'var(--text)' }].map((st) => (
                              <div key={st.l} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: st.c }}>{st.v}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{st.l}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-xs btn-ghost" onClick={() => { setOntTab('2. Profile'); setDiscoverExpanded(null) }}>Open in Profile →</button>
                            <button className="btn btn-xs btn-ghost" onClick={() => { setOntTab('3. Transform'); setDiscoverExpanded(null) }}>Open in Transform Studio →</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setOntTab('2. Profile')}>Next: Profile Data →</button>
            </div>
          )}

          {/* 2. Profile */}
          {ontTab === '2. Profile' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: 14 }}>
                Statistical profiling of all columns across connected sources.
              </p>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Column</th><th>Source</th><th>Type</th><th>Null %</th><th>Unique %</th><th>Min</th><th>Max</th><th>Anomalies</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_COL_PROFILES.map((p) => (
                      <tr key={`${p.source}.${p.col}`}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>{p.col}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{p.source}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)' }}>{p.type}</td>
                        <td style={{ color: parseFloat(p.nullPct) > 10 ? 'var(--amber)' : 'var(--text2)', fontSize: 'var(--text-xs)' }}>{p.nullPct}</td>
                        <td style={{ fontSize: 'var(--text-xs)' }}>{p.unique}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>{p.min}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>{p.max}</td>
                        <td style={{ color: p.anomalies > 0 ? 'var(--red)' : 'var(--text3)', fontWeight: p.anomalies > 0 ? 700 : 400 }}>{p.anomalies > 0 ? `⚠ ${p.anomalies}` : '—'}</td>
                        <td><span className={p.status === 'clean' ? 'pill pill-green' : 'pill pill-amber'}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setOntTab('1. Discover')}>← Back</button>
                <button className="btn btn-primary btn-sm" onClick={() => setOntTab('3. Transform')}>Next: Fix & Transform →</button>
              </div>
            </div>
          )}

          {/* 3. Transform */}
          {ontTab === '3. Transform' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 16 }}>
                <strong>Step 1:</strong> For each source, review the raw columns and configure transforms to clean the data before it enters the ontology.
              </p>

              {/* Source selector cards */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {MOCK_SOURCE_SCAN.map((s) => {
                  const cols = MOCK_SOURCE_COLS[s.source.toLowerCase()] ?? []
                  const needsWork = cols.filter(c => c.status === 'needs_review').length
                  const isSelected = transformSource === s.source.toLowerCase()
                  return (
                    <div
                      key={s.source}
                      style={{ padding: '10px 14px', border: `1px solid ${isSelected ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', background: isSelected ? 'var(--bg3)' : 'var(--bg2)', minWidth: 140 }}
                      onClick={() => { setTransformSource(s.source.toLowerCase()); setTransformExpanded(null) }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: s.bg, color: s.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 600 }}>{s.abbr}</div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{s.source}</span>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 4 }}>
                        {s.cols} columns{needsWork > 0 && <span style={{ color: 'var(--amber)', marginLeft: 4 }}>· {needsWork} need review</span>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Column list for selected source */}
              {!transformSource ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Select a source above to view and configure its columns</div>
              ) : (() => {
                const cols = MOCK_SOURCE_COLS[transformSource] ?? []
                const srcInfo = MOCK_SOURCE_SCAN.find(s => s.source.toLowerCase() === transformSource)
                if (!cols.length) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No columns discovered for this source yet.</div>
                return (
                  <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div><span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{srcInfo?.source ?? transformSource}</span> <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{cols.length} columns</span></div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-xs btn-primary" onClick={() => showToast('Auto-detecting transforms…')}>✨ Auto-Detect All</button>
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Exported transforms')}>Export</button>
                      </div>
                    </div>
                    {cols.map((col, ci) => {
                      const key = `${transformSource}-${ci}`
                      const isExp = transformExpanded === key
                      const isExpr = transformExprMode[key] ?? false
                      const statusColor = col.status === 'clean' ? 'var(--green)' : col.status === 'configured' ? 'var(--cyan)' : col.status === 'needs_review' ? 'var(--amber)' : 'var(--red)'
                      const statusLabel = col.status === 'clean' ? 'Clean' : col.status === 'configured' ? 'Transform Set' : col.status === 'needs_review' ? 'Needs Review' : 'Unmapped'
                      const samples = col.samples

                      return (
                        <div key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer' }} onClick={() => setTransformExpanded(isExp ? null : key)}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0, display: 'inline-block' }} />
                            <code style={{ fontFamily: 'var(--mono)', color: 'var(--amber)', fontSize: 'var(--text-xs)', minWidth: 130 }}>{col.col}</code>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 80 }}>{col.type}</span>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 55 }}>{col.nullable === false ? 'NOT NULL' : 'NULL?'}</span>
                            {col.expr !== col.col
                              ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--cyan)', flex: 1 }}>⚙ {col.expr}</span>
                              : <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', flex: 1 }}>passthrough</span>
                            }
                            <span className={col.status === 'clean' || col.status === 'configured' ? 'pill pill-green' : col.status === 'needs_review' ? 'pill pill-amber' : 'pill pill-red'} style={{ fontSize: 10 }}>{statusLabel}</span>
                            <span style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>{isExp ? '▼' : '▶'}</span>
                          </div>

                          {isExp && (
                            <div style={{ padding: '12px 16px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                              {/* Sample values */}
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Sample Values from Source</div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                                {samples.map((sv, si) => {
                                  const isNull = sv === 'NULL'
                                  return <span key={si} style={{ padding: '3px 8px', background: isNull ? 'rgba(239,68,68,0.1)' : 'var(--bg3)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: isNull ? 'var(--red)' : 'var(--text2)' }}>{sv}</span>
                                })}
                              </div>

                              {/* Mode toggle */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase' }}>Transform Configuration</div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button className={`btn btn-xs ${!isExpr ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTransformExprMode(p => ({ ...p, [key]: false }))}>⚙ Visual Builder</button>
                                  <button className={`btn btn-xs ${isExpr ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTransformExprMode(p => ({ ...p, [key]: true }))}>📝 Expression</button>
                                </div>
                              </div>

                              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg2)', marginBottom: 12, overflow: 'hidden' }}>
                                {!isExpr ? (
                                  col.expr !== col.col ? (
                                    <div>
                                      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg3)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, flexShrink: 0 }}>1</div>
                                        <code style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--cyan)', flex: 1 }}>{col.expr}</code>
                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                          <span style={{ padding: '2px 6px', background: 'rgba(245,158,11,0.15)', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--amber)' }}>{samples[0]}</span>
                                          <span style={{ color: 'var(--green)', fontSize: 'var(--text-xs)' }}>→</span>
                                          <span style={{ padding: '2px 6px', background: 'rgba(34,197,94,0.12)', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: 'var(--green)' }}>{samples[0].toLowerCase().trim()}</span>
                                        </div>
                                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Remove step')}>✕</button>
                                      </div>
                                      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Add step')}>+ Add Step</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
                                      <div style={{ fontSize: 'var(--text-sm)', marginBottom: 8 }}>No transforms — raw value passes through unchanged</div>
                                      <button className="btn btn-sm btn-primary" onClick={() => showToast('Add transform step')}>+ Add Transform Step</button>
                                    </div>
                                  )
                                ) : (
                                  <div style={{ padding: 14 }}>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>
                                      Write a SQL-compatible expression. Reference the column as <code style={{ color: 'var(--text3)' }}>{col.col}</code>
                                    </div>
                                    <textarea className="form-input" style={{ fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', minHeight: 60, lineHeight: 1.6, background: 'var(--bg)', color: 'var(--text3)', width: '100%' }} defaultValue={col.expr} />
                                    <div style={{ marginTop: 8, padding: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>SQL Reference</div>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                                        <div><code>TRIM(col)</code> — whitespace</div>
                                        <div><code>CAST(col AS type)</code> — cast</div>
                                        <div><code>LOWER(col)</code> — lowercase</div>
                                        <div><code>COALESCE(col, default)</code> — null fallback</div>
                                        <div><code>REGEXP_REPLACE(col, p, r)</code> — regex</div>
                                        <div><code>ROUND(col / 100.0, 2)</code> — math</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {col.expr !== col.col && (
                                <>
                                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Full Transform Preview</div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 4, alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textAlign: 'center' }}>INPUT</div><div /><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textAlign: 'center' }}>OUTPUT</div>
                                    {samples.slice(0, 3).flatMap((sv, si) => {
                                      const isNull = sv === 'NULL'
                                      const out = isNull ? 'NULL' : sv.toLowerCase().trim()
                                      const changed = out !== sv
                                      return [
                                        <div key={`in-${si}`} style={{ padding: '3px 6px', background: 'rgba(245,158,11,0.15)', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: isNull ? 'var(--red)' : 'var(--amber)' }}>{sv}</div>,
                                        <span key={`arr-${si}`} style={{ color: 'var(--green)', fontSize: 'var(--text-xs)', textAlign: 'center' }}>→</span>,
                                        <div key={`out-${si}`} style={{ padding: '3px 6px', background: changed ? 'rgba(34,197,94,0.12)' : 'var(--bg3)', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 'var(--text-xs)', color: changed ? 'var(--green)' : 'var(--text3)' }}>{out}</div>,
                                      ]
                                    })}
                                  </div>
                                </>
                              )}

                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-xs btn-primary" onClick={() => showToast('Marked clean')}>✓ Mark Clean</button>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Testing on all rows…')}>Test on All Rows</button>
                                <button className="btn btn-xs btn-ghost" onClick={() => { setOntTab('4. Classify'); setTransformExpanded(null) }}>Assign to Concept →</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setOntTab('2. Profile')}>← Back</button>
                <button className="btn btn-primary btn-sm" onClick={() => setOntTab('4. Classify')}>Next: Classify →</button>
              </div>
            </div>
          )}

          {/* 4. Classify */}
          {ontTab === '4. Classify' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: 14 }}>
                ML-based classification suggests concept assignments. Review and accept or override.
              </p>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Column</th><th>Source</th><th>ML Suggestion</th><th>Confidence</th><th>Concept</th><th>Status</th><th /></tr>
                  </thead>
                  <tbody>
                    {MOCK_CLASSIFY_RESULTS.map((r) => (
                      <tr key={`${r.source}.${r.col}`}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>{r.col}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{r.source}</td>
                        <td><span className="pill pill-purple" style={{ fontSize: 10 }}>{r.suggested}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ height: 4, width: 60, background: 'var(--bg4)', borderRadius: 2 }}>
                              <div style={{ height: 4, borderRadius: 2, width: `${r.confidence}%`, background: r.confidence >= 90 ? 'var(--green)' : 'var(--amber)' }} />
                            </div>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{r.confidence}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 'var(--text-sm)' }}>{r.concept}</td>
                        <td><span className={r.status === 'accepted' ? 'pill pill-green' : 'pill pill-amber'}>{r.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast('Accepted')}>✓ Accept</button>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast('Override')}>Override</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setOntTab('3. Transform')}>← Back</button>
                <button className="btn btn-primary btn-sm" onClick={() => setOntTab('5. Model')}>Next: Model Concepts →</button>
              </div>
            </div>
          )}

          {/* 5. Model (Concepts) */}
          {ontTab === '5. Model' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)' }}>Assign source fields to unified business concepts.</p>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Add concept')}><Plus size={13} /> Add Concept</button>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Concept</th><th>Sources</th><th>Fields</th><th>Mapped</th><th>Coverage</th><th>Status</th><th /></tr>
                  </thead>
                  <tbody>
                    {MOCK_CONCEPTS.map((c) => {
                      const coverage = Math.round((c.mapped / c.fields) * 100)
                      return (
                        <tr key={c.concept}>
                          <td style={{ fontWeight: 600 }}>{c.concept}</td>
                          <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{c.sources.map((s) => <span key={s} className="pill" style={{ fontSize: '10px' }}>{s}</span>)}</div></td>
                          <td>{c.fields}</td><td>{c.mapped}</td>
                          <td style={{ minWidth: 100 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="progress" style={{ flex: 1, height: 6 }}>
                                <div className="progress-fill" style={{ width: `${coverage}%`, background: coverage === 100 ? 'var(--green)' : coverage >= 80 ? 'var(--cyan)' : 'var(--amber)' }} />
                              </div>
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 30 }}>{coverage}%</span>
                            </div>
                          </td>
                          <td><span className={c.status === 'active' ? 'pill pill-green' : 'pill pill-amber'}>{c.status}</span></td>
                          <td><button className="btn btn-xs btn-ghost" onClick={() => setOntTab('6. Resolve')}>Resolve Entities →</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setOntTab('4. Classify')}>← Back</button>
                <button className="btn btn-primary btn-sm" onClick={() => setOntTab('6. Resolve')}>Next: Resolve Entities →</button>
              </div>
            </div>
          )}

          {/* 6. Resolve */}
          {ontTab === '6. Resolve' && (
            <div>
              {/* 6-stat header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Source Records', value: '225,400', color: 'var(--text)' },
                  { label: 'Matched', value: '1,842', color: 'var(--green)' },
                  { label: 'Pending Review', value: '2', color: 'var(--amber)' },
                  { label: 'Rejected', value: '1', color: 'var(--text3)' },
                  { label: 'Merged Entities', value: '3', color: 'var(--text3)' },
                  { label: 'Splits', value: '0', color: 'var(--text)' },
                ].map(s => <div key={s.label} className="stat"><div className="stat-label">{s.label}</div><div className="stat-value" style={{ color: s.color }}>{s.value}</div></div>)}
              </div>

              {/* Inner tabs */}
              <div className="tabs" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'candidates', label: 'Candidate Pairs (2 pending)' },
                  { id: 'rules', label: 'Matching Rules' },
                  { id: 'merged', label: 'Merged Entities (3)' },
                  { id: 'blocking', label: 'Blocking Rules' },
                ].map(t => (
                  <button key={t.id} className={cn('tab', erTab === t.id && 'active')} onClick={() => setErTab(t.id)} type="button">{t.label}</button>
                ))}
              </div>

              {/* Overview */}
              {erTab === 'overview' && (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 16 }}>
                    Entity resolution matches records representing the same real-world entity across {MOCK_CONCEPTS.length} business concepts and {MOCK_SOURCE_SCAN.length} connected sources.
                  </p>
                  <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>Concept</th><th>Records</th><th>Matched</th><th>Pending</th><th>Merged</th><th>Quality</th><th /></tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Customer', records: 62100, matched: 1842, pending: 2, merged: 3, quality: 97 },
                          { name: 'Transaction', records: 142000, matched: 0, pending: 0, merged: 0, quality: 100 },
                          { name: 'Product', records: 412, matched: 8, pending: 0, merged: 2, quality: 94 },
                          { name: 'Support Ticket', records: 31200, matched: 0, pending: 0, merged: 0, quality: 100 },
                        ].map(c => {
                          const qColor = c.quality >= 90 ? 'var(--green)' : c.quality >= 70 ? 'var(--amber)' : 'var(--red)'
                          return (
                            <tr key={c.name}>
                              <td style={{ fontWeight: 500 }}>{c.name}</td>
                              <td>{c.records.toLocaleString()}</td>
                              <td style={{ color: 'var(--green)' }}>{c.matched.toLocaleString()}</td>
                              <td style={{ color: c.pending > 0 ? 'var(--amber)' : 'var(--text3)' }}>{c.pending}</td>
                              <td>{c.merged}</td>
                              <td style={{ color: qColor }}>{c.quality}%</td>
                              <td><button className="btn btn-xs btn-ghost" onClick={() => setErTab('candidates')}>Review</button></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-primary" onClick={() => setErTab('candidates')}>Review All Pending (2)</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => showToast('Auto-resolving high-confidence pairs…')}>Auto-Resolve Low-Risk</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => showToast('Exporting ER report…')}>Export Report</button>
                  </div>
                </div>
              )}

              {/* Candidate Pairs — side-by-side comparison */}
              {erTab === 'candidates' && (
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[
                      { id: 'pending', label: `Pending (${MOCK_ER_PAIRS.filter(p => p.status === 'pending').length})` },
                      { id: 'matched', label: `Matched (${MOCK_ER_PAIRS.filter(p => p.status === 'matched').length})` },
                      { id: 'rejected', label: `Rejected (${MOCK_ER_PAIRS.filter(p => p.status === 'rejected').length})` },
                      { id: 'all', label: `All (${MOCK_ER_PAIRS.length})` },
                    ].map(f => (
                      <button key={f.id} className={`btn btn-xs ${erStatusFilter === f.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setErStatusFilter(f.id)}>{f.label}</button>
                    ))}
                  </div>
                  {MOCK_ER_PAIRS.filter(p => erStatusFilter === 'all' || p.status === erStatusFilter).map(cp => {
                    const a = cp.a
                    const b = cp.b
                    const confColor = cp.confidence >= 90 ? 'var(--green)' : cp.confidence >= 70 ? 'var(--amber)' : 'var(--red)'
                    const compareFields = Object.keys(a).filter(k => k !== 'id' && k !== 'source')
                    return (
                      <div key={cp.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 10, overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg3)' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 600, color: confColor }}>{cp.confidence}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{a.name} <span style={{ color: 'var(--text3)' }}>↔</span> {b.name}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{cp.matchedBy}</div>
                          </div>
                          <span className="pill pill-blue" style={{ fontSize: 10 }}>{cp.concept}</span>
                          <span className={cp.status === 'matched' ? 'pill pill-green' : cp.status === 'rejected' ? 'pill pill-red' : 'pill pill-amber'}>{cp.status}</span>
                        </div>

                        {/* Side-by-side */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0 }}>
                          <div style={{ padding: '10px 14px' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{a.source}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 4 }}>{a.id}</div>
                            {compareFields.map(fld => {
                              const va = (a as Record<string, string | null>)[fld] != null ? String((a as Record<string, string | null>)[fld]) : 'NULL'
                              const vb = (b as Record<string, string | null>)[fld] != null ? String((b as Record<string, string | null>)[fld]) : 'NULL'
                              const isDiff = va !== vb && va !== 'NULL' && vb !== 'NULL'
                              return (
                                <div key={fld} style={{ padding: '2px 0', fontSize: 'var(--text-xs)' }}>
                                  <span style={{ color: 'var(--text3)', minWidth: 55, display: 'inline-block' }}>{fld}:</span>
                                  <span style={{ fontFamily: 'var(--mono)', color: isDiff ? 'var(--amber)' : va === 'NULL' ? 'var(--red)' : 'var(--text2)', fontWeight: isDiff ? 500 : 400, fontStyle: va === 'NULL' ? 'italic' : 'normal' }}>{va}</span>
                                </div>
                              )
                            })}
                          </div>
                          <div style={{ width: 1, background: 'var(--border)' }} />
                          <div style={{ padding: '10px 14px' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{b.source}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 4 }}>{b.id}</div>
                            {compareFields.map(fld => {
                              const va = (a as Record<string, string | null>)[fld] != null ? String((a as Record<string, string | null>)[fld]) : 'NULL'
                              const vb = (b as Record<string, string | null>)[fld] != null ? String((b as Record<string, string | null>)[fld]) : 'NULL'
                              const isDiff = va !== vb && va !== 'NULL' && vb !== 'NULL'
                              return (
                                <div key={fld} style={{ padding: '2px 0', fontSize: 'var(--text-xs)' }}>
                                  <span style={{ color: 'var(--text3)', minWidth: 55, display: 'inline-block' }}>{fld}:</span>
                                  <span style={{ fontFamily: 'var(--mono)', color: isDiff ? 'var(--amber)' : vb === 'NULL' ? 'var(--red)' : 'var(--text2)', fontWeight: isDiff ? 500 : 400, fontStyle: vb === 'NULL' ? 'italic' : 'normal' }}>{vb}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        {cp.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
                            <button className="btn btn-xs btn-primary" onClick={() => showToast('Records merged')}>✓ Same — Merge</button>
                            <button className="btn btn-xs btn-ghost" style={{ color: 'var(--red)' }} onClick={() => showToast('Rejected')}>✕ Different — Reject</button>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast('Skipped')}>Skip</button>
                          </div>
                        )}
                        {cp.status === 'matched' && (
                          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'rgba(34,197,94,0.08)', fontSize: 'var(--text-xs)', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            ✓ Merged as: <strong>{'resolvedName' in cp ? cp.resolvedName : ''}</strong>
                            <button className="btn btn-xs btn-ghost" style={{ marginLeft: 8 }} onClick={() => showToast('Split apart')}>Split Apart</button>
                          </div>
                        )}
                        {cp.status === 'rejected' && (
                          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'rgba(239,68,68,0.08)', fontSize: 'var(--text-xs)', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            ✕ Rejected — different entities
                            <button className="btn btn-xs btn-ghost" style={{ marginLeft: 8 }} onClick={() => showToast('Merging…')}>Undo — Merge</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Matching Rules */}
              {erTab === 'rules' && (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 16 }}>Matching rules determine how records from different sources are compared to find duplicates.</p>
                  <div className="card" style={{ padding: 14, marginBottom: 10 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 10 }}>Customer <span className="pill" style={{ fontSize: 10, marginLeft: 4 }}>crm</span></div>
                    {MOCK_ER_RULES.map((rule, ri) => (
                      <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 4, opacity: rule.enabled ? 1 : 0.5 }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, minWidth: 160 }}>{rule.name}</span>
                        <span className={`pill ${rule.type === 'exact' ? 'pill-green' : rule.type === 'fuzzy' ? 'pill-amber' : 'pill-blue'}`} style={{ fontSize: 10 }}>{rule.type}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Fields: </span>
                        {rule.fields.map(f => <code key={f} style={{ fontSize: 'var(--text-xs)', color: 'var(--cyan)', background: 'var(--bg3)', padding: '1px 4px', borderRadius: 3, marginRight: 2 }}>{f}</code>)}
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Weight: {rule.weight}</span>
                        {rule.threshold && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginLeft: 4 }}>Threshold: {rule.threshold}%</span>}
                      </div>
                    ))}
                    <button className="btn btn-xs btn-ghost" style={{ marginTop: 4 }} onClick={() => showToast('Add matching rule')}>+ Add Rule</button>
                  </div>
                </div>
              )}

              {/* Merged Entities */}
              {erTab === 'merged' && (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 16 }}>Entities merged from multiple source records into a single golden record.</p>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                      <thead><tr><th>Entity</th><th>Concept</th><th>Sources</th><th>Fields</th><th>Confidence</th><th /></tr></thead>
                      <tbody>
                        {MOCK_ER_MERGED.map(me => (
                          <tr key={me.id}>
                            <td style={{ fontWeight: 500 }}>{me.name}</td>
                            <td><span className="pill" style={{ fontSize: 10 }}>Customer</span></td>
                            <td><div style={{ display: 'flex', gap: 4 }}>{me.sources.map(s => <span key={s} className="pill" style={{ fontSize: 10 }}>{s.split(':')[0]}</span>)}</div></td>
                            <td>{me.fieldCount}</td>
                            <td style={{ color: me.confidence >= 90 ? 'var(--green)' : 'var(--amber)' }}>{me.confidence}%</td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Loading details…')}>Inspect</button>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Split entity')}>Split</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Blocking Rules */}
              {erTab === 'blocking' && (
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 12 }}>Blocking rules prevent records from being compared if they differ on a key field. This avoids false matches.</p>
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--amber)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 16, fontSize: 'var(--text-xs)', color: 'var(--amber)' }}>
                    <strong>Example:</strong> Without blocking by country, "Atlas Manufacturing" (US) would incorrectly match "Atlas Manufacturing GmbH" (Germany).
                  </div>
                  <div className="card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Customer</span>
                      <button className="btn btn-xs btn-ghost" onClick={() => showToast('Add blocking rule')}>+ Add Rule</button>
                    </div>
                    {MOCK_BLOCKING_RULES.map((br, bi) => (
                      <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 4 }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>Block by: <code style={{ color: 'var(--text3)' }}>{br.field}</code></span>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{br.desc}</div>
                        </div>
                        <span className={br.enabled ? 'pill pill-green' : 'pill'} style={{ fontSize: 10 }}>{br.enabled ? 'enabled' : 'disabled'}</span>
                        <button className="btn btn-xs btn-ghost" style={{ color: 'var(--red)' }} onClick={() => showToast('Removed blocking rule')}>Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setOntTab('5. Model')}>← Back</button>
                <button className="btn btn-primary btn-sm" onClick={() => setOntTab('7. Relate')}>Next: Relate →</button>
              </div>
            </div>
          )}

          {/* 7. Relate — SVG Knowledge Graph */}
          {ontTab === '7. Relate' && (() => {
            const concepts = MOCK_CONCEPTS
            const nodeW = 110, nodeH = 50, cx = 400, cy = 250, radius = 190
            const positions: Record<string, { x: number; y: number }> = {}
            concepts.forEach((c, i) => {
              const angle = (2 * Math.PI * i / concepts.length) - Math.PI / 2
              positions[c.concept] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
            })
            const relColors: Record<string, string> = { has_many: '#6b7280', references: '#2d6a4f', targets: '#a855f7', manages: '#3b82f6' }
            return (
              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: 14 }}>
                  Define relationships between concepts to build the knowledge graph. Click a node to view concept details.
                </p>
                <div style={{ position: 'relative', width: '100%', overflowX: 'auto', marginBottom: 14 }}>
                  <svg width="800" height="500" style={{ display: 'block', margin: '0 auto' }}>
                    {/* Edges */}
                    {MOCK_RELATIONSHIPS.map((r, ri) => {
                      const from = positions[r.from]
                      const to = positions[r.to]
                      if (!from || !to) return null
                      const color = relColors[r.type] ?? '#6b7280'
                      const mx = (from.x + to.x) / 2 + nodeW / 2
                      const my = (from.y + to.y) / 2 + nodeH / 2
                      return (
                        <g key={ri}>
                          <line x1={from.x + nodeW / 2} y1={from.y + nodeH / 2} x2={to.x + nodeW / 2} y2={to.y + nodeH / 2} stroke={color} strokeWidth={1.5} strokeDasharray={r.type === 'manages' ? '4,4' : undefined} opacity={0.5} />
                          <text x={mx} y={my - 4} textAnchor="middle" fontSize={8} fill={color}>{r.type.replace('_', ' ')}</text>
                          <text x={mx} y={my + 6} textAnchor="middle" fontSize={7} fill="#6b7280">{r.joinKey}</text>
                        </g>
                      )
                    })}
                    {/* Nodes */}
                    {concepts.map(c => {
                      const pos = positions[c.concept]
                      if (!pos) return null
                      const coverage = Math.round((c.mapped / c.fields) * 100)
                      const qColor = coverage >= 90 ? '#22c55e' : coverage >= 70 ? '#f59e0b' : '#ef4444'
                      return (
                        <g key={c.concept} style={{ cursor: 'pointer' }}>
                          <rect x={pos.x} y={pos.y} width={nodeW} height={nodeH} rx={8} fill="var(--bg2)" stroke="var(--border)" strokeWidth={1.5} />
                          <text x={pos.x + nodeW / 2} y={pos.y + 18} textAnchor="middle" fontSize={11} fontWeight={500} fill="var(--text)">{c.concept}</text>
                          <text x={pos.x + nodeW / 2} y={pos.y + 32} textAnchor="middle" fontSize={9} fill="var(--text3)">{c.fields} fields · {coverage}%</text>
                          <circle cx={pos.x + nodeW - 8} cy={pos.y + 8} r={5} fill={qColor} />
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                  <span><span style={{ display: 'inline-block', width: 16, height: 2, background: '#6b7280', verticalAlign: 'middle', marginRight: 4 }} />has many</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 2, background: '#2d6a4f', verticalAlign: 'middle', marginRight: 4 }} />references</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 2, background: '#a855f7', verticalAlign: 'middle', marginRight: 4 }} />targets</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 2, background: '#3b82f6', borderTop: '1px dashed #3b82f6', verticalAlign: 'middle', marginRight: 4 }} />manages</span>
                  <span>● quality: green ≥90% / amber ≥70% / red &lt;70%</span>
                </div>

                {/* Relationship table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>Relationships ({MOCK_RELATIONSHIPS.length})</div>
                    <button className="btn btn-xs btn-ghost" onClick={() => showToast('Add relationship')}><Plus size={11} /> Add</button>
                  </div>
                  <table className="data-table" style={{ fontSize: 'var(--text-xs)' }}>
                    <thead><tr><th>From</th><th>Type</th><th>To</th><th>Join Key</th><th>Description</th><th /></tr></thead>
                    <tbody>
                      {MOCK_RELATIONSHIPS.map((r, ri) => (
                        <tr key={ri}>
                          <td style={{ fontWeight: 500 }}>{r.from}</td>
                          <td><span className="pill pill-blue" style={{ fontSize: 10 }}>{r.type}</span></td>
                          <td style={{ fontWeight: 500 }}>{r.to}</td>
                          <td><code style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{r.joinKey}</code></td>
                          <td style={{ color: 'var(--text3)' }}>{r.desc}</td>
                          <td><button className="btn btn-xs btn-ghost" onClick={() => showToast('Edit relationship')}>Edit</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setOntTab('6. Resolve')}>← Back</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setOntTab('8. Materialize')}>Next: Materialize →</button>
                </div>
              </div>
            )
          })()}

          {/* 8. Materialize */}
          {ontTab === '8. Materialize' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: 14 }}>
                Generate unified schema tables from your concept definitions and relationships.
              </p>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>Unified Schema Tables</div>
                  <button className="btn btn-xs btn-primary" onClick={() => showToast('Building schema…')}>▶ Build Schema</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Table</th><th>Fields</th><th>Sources</th><th>Rows</th><th>Version</th><th>Status</th><th /></tr>
                  </thead>
                  <tbody>
                    {MOCK_SCHEMA_TABLES.map((t) => (
                      <tr key={t.name}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>{t.name}</td>
                        <td>{t.fields}</td>
                        <td>{t.sources}</td>
                        <td style={{ color: 'var(--text2)' }}>{t.rows}</td>
                        <td><span className="pill">{t.version}</span></td>
                        <td><span className="pill pill-green">{t.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast('Viewing schema')}>View Schema</button>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast('Exported')}>Export DDL</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setOntTab('7. Relate')}>← Back</button>
                <button className="btn btn-primary btn-sm" onClick={() => setOntTab('9. Publish')}>Next: Validate & Publish →</button>
              </div>
            </div>
          )}

          {/* 9. Publish */}
          {ontTab === '9. Publish' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: 14 }}>
                Validate and deploy your unified ontology to target environments.
              </p>
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Quality Checks</div>
                {[
                  { check: 'Schema consistency', status: 'Pass', detail: 'All tables match declared schema v3.2.1' },
                  { check: 'Referential integrity', status: 'Pass', detail: 'All foreign keys resolved' },
                  { check: 'PII masking', status: 'Pass', detail: '6 PII columns masked in all envs' },
                  { check: 'Freshness SLA', status: 'Warn', detail: 'transactions_unified: 4 min behind 2-min SLA' },
                  { check: 'Row count thresholds', status: 'Pass', detail: 'All tables within expected ranges' },
                ].map((q) => (
                  <div key={q.check} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span className={q.status === 'Pass' ? 'pill pill-green' : 'pill pill-amber'} style={{ minWidth: 40 }}>{q.status}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{q.check}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{q.detail}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)' }}>Deployment Environments</div>
                {MOCK_DEPLOY_ENVS.map((env) => (
                  <div key={env.slug} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{env.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Version {env.version} · deployed {env.deployed} · {env.passed}/{env.checks} checks passed</div>
                    </div>
                    <span className={env.status === 'deployed' ? 'pill pill-green' : 'pill pill-amber'}>{env.status}</span>
                    <button className="btn btn-xs btn-primary" onClick={() => showToast(`Deploying to ${env.name}…`)}>Deploy →</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setOntTab('8. Materialize')}>← Back</button>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Ontology published successfully!')}>✓ Publish All Environments</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Pipeline Engine ── */}
      {activeTab === 'Pipeline Engine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_PIPELINES.map((p) => (
            <div key={p.name} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <StatusIcon status={p.status} />
                <div style={{ fontWeight: 600, color: 'var(--text)', flex: 1 }}>{p.name}</div>
                <span className={pipelineStatusClass(p.status)}>{p.status}</span>
              </div>
              <div className="progress" style={{ marginBottom: 10 }}>
                <div className="progress-fill" style={{ width: `${p.progress}%`, background: p.status === 'failed' ? 'var(--red)' : p.status === 'success' ? 'var(--green)' : 'var(--cyan)' }} />
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 12 }}>
                <span>Last run: {p.lastRun}</span>
                <span>Duration: {p.duration}</span>
                <span>Records: {p.records}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                <button className="btn btn-primary btn-sm" onClick={() => showToast(`Running ${p.name}…`)}>
                  <Play size={12} /> Run Now
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Opening logs…')}>View Logs</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pipeline-as-Code ── */}
      {activeTab === 'Pipeline-as-Code' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <FileCode2 size={15} style={{ color: 'var(--orange)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>pipeline.yaml</span>
          </div>
          <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)', overflowX: 'auto', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
            {PIPELINE_YAML}
          </pre>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Pipeline started…')}>
              <Play size={12} /> Run Pipeline
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('Saved!')}>Save</button>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('Validation passed')}>Validate</button>
          </div>
        </div>
      )}

      {/* ── Readiness ── */}
      {activeTab === 'Readiness' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 16 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: overallReadiness >= 80 ? 'var(--green)' : overallReadiness >= 60 ? 'var(--amber)' : 'var(--red)', lineHeight: 1 }}>
                {overallReadiness}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 4 }}>/ 100</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginTop: 8 }}>Overall Readiness</div>
              <svg width="80" height="80" style={{ marginTop: 12 }} viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg3)" strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={overallReadiness >= 80 ? 'var(--green)' : overallReadiness >= 60 ? 'var(--amber)' : 'var(--red)'} strokeWidth="8" strokeDasharray={`${(overallReadiness / 100) * 213.6} 213.6`} strokeLinecap="round" transform="rotate(-90 40 40)" />
              </svg>
            </div>
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 16 }}>Category Breakdown</div>
              {READINESS_CATEGORIES.map((cat) => (
                <div key={cat.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 'var(--text-xs)' }}>
                    <span style={{ color: 'var(--text2)' }}>{cat.label}</span>
                    <span style={{ fontWeight: 700, color: cat.color }}>{cat.score}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${cat.score}%`, background: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>Recommendations</div>
            {[
              { text: 'Fix 2 remaining critical issues (Duplicate IDs across PG Prod + SF Prod, Currency mismatch in QB US)', impact: 'high' },
              { text: 'Resolve QB Acme Corp (US) sync delay (4hr overdue) to improve Freshness by ~12 points', impact: 'high' },
              { text: 'Approve remaining 8 field mappings across 156 total to reach 100%', impact: 'medium' },
              { text: 'Connect 4 remaining source instances for full coverage', impact: 'medium' },
              { text: 'Resolve enum mismatch between E-commerce DB and PG Prod (order_status field)', impact: 'low' },
              { text: 'Refresh PG Staging DB data (currently 7 days behind production)', impact: 'low' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className={r.impact === 'high' ? 'pill pill-red' : r.impact === 'medium' ? 'pill pill-amber' : 'pill pill-blue'} style={{ width: 60, textAlign: 'center', fontSize: 10 }}>{r.impact}</span>
                <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>{r.text}</span>
                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Navigating…')}>Go</button>
              </div>
            ))}
          </div>

          {/* Score History */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px 0', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Score History</div>
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Score</th><th>Change</th></tr>
              </thead>
              <tbody>
                {[
                  { date: 'Apr 13', score: 87 }, { date: 'Apr 12', score: 84 },
                  { date: 'Apr 11', score: 81 }, { date: 'Apr 10', score: 76 }, { date: 'Apr 9', score: 72 },
                ].map((h, i, arr) => {
                  const prev = arr[i + 1]
                  const delta = prev ? h.score - prev.score : 0
                  return (
                    <tr key={h.date}>
                      <td style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>{h.date}</td>
                      <td style={{ fontWeight: 500 }}>{h.score}/100</td>
                      <td style={{ fontWeight: 600, color: delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--text3)' }}>
                        {delta > 0 ? `+${delta}` : delta < 0 ? delta : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Readiness Checklist */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>Readiness Checklist</div>
            {[
              { text: '8 of 12 source instances connected and syncing', done: true },
              { text: 'Critical data quality issues resolved (2 remaining)', done: false },
              { text: 'Core field mappings approved (95% — target >80%)', done: true },
              { text: 'Pipeline completed at least 1 successful run', done: true },
              { text: 'Embedding generation finished across all sources', done: false },
              { text: 'Cross-source join keys validated (email, customer_id, invoice_no)', done: true },
              { text: 'No sync overdue for more than 2 hours', done: false },
            ].map((ch, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, background: ch.done ? 'var(--green)' : 'transparent', border: ch.done ? 'none' : '2px solid var(--border2)', color: ch.done ? 'var(--bg)' : 'var(--text3)' }}>
                  {ch.done ? '✓' : ''}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: ch.done ? 'var(--text2)' : 'var(--text)' }}>{ch.text}</span>
              </div>
            ))}
          </div>

          {/* Go Live CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, background: overallReadiness >= 80 ? 'var(--green-bg)' : 'var(--amber-bg)', border: `1px solid ${overallReadiness >= 80 ? 'var(--green)' : 'var(--amber)'}`, borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 'var(--text-sm)', color: overallReadiness >= 80 ? 'var(--green)' : 'var(--amber)' }}>
              {overallReadiness >= 80 ? '✅ Your data is nearly ready. Resolve remaining issues to reach 100%.' : '⚠️ Data readiness below threshold. Address critical items before proceeding.'}
            </div>
            <button className={`btn btn-lg ${overallReadiness >= 80 ? 'btn-primary' : 'btn-ghost'}`} disabled={overallReadiness < 80} onClick={() => showToast('Deploying to production…')}>
              Go Live
            </button>
          </div>
        </div>
      )}

      {/* ── Data Quality ── */}
      {activeTab === 'Data Quality' && (
        <div>
          {/* Stats */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Quality Score', value: '94.2%', color: 'var(--green)' },
              { label: 'Test Suites', value: '18', color: 'var(--text)' },
              { label: 'Passed', value: '312', color: 'var(--green)' },
              { label: 'Failed', value: '21', color: 'var(--red)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <SubTabs tabs={['Suites', 'Results', 'History', 'Config']} active={dqInner} onChange={setDqInner} />

          {/* Suites */}
          {dqInner === 'Suites' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 24 }} />
                    <th>Suite Name</th>
                    <th>Expectations</th>
                    <th>Last Run</th>
                    <th>Status</th>
                    <th>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DQ_SUITES.map((s, idx) => (
                    <>
                      <tr key={s.name} style={{ cursor: 'pointer' }} onClick={() => setDqExpandSuite(dqExpandSuite === idx ? null : idx)}>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{dqExpandSuite === idx ? '▼' : '▶'}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{s.name}</td>
                        <td>{s.expectations}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{s.lastRun}</td>
                        <td>
                          <span className={s.status === 'Pass' ? 'pill pill-green' : s.status === 'Warn' ? 'pill pill-amber' : 'pill pill-red'}>{s.status}</span>
                        </td>
                        <td>{s.coverage}</td>
                      </tr>
                      {dqExpandSuite === idx && (
                        <tr key={`${s.name}-exp`}>
                          <td colSpan={6} style={{ padding: 0 }}>
                            <div style={{ background: 'var(--bg3)', padding: '12px 16px', fontSize: 'var(--text-xs)' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Expectations in <strong>{s.name}</strong></div>
                              {s.checks.map((ch, i) => (
                                <div key={i} style={{ padding: '3px 8px', marginBottom: 3, background: 'var(--bg4)', borderRadius: 'var(--radius)', fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{ch}</div>
                              ))}
                              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Edit suite')}>Edit Suite</button>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Running ${s.name}…`)}>Run Now</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Results */}
          {dqInner === 'Results' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Expectation</th>
                    <th>Suite</th>
                    <th>Column</th>
                    <th>Expected</th>
                    <th>Observed</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DQ_RESULTS.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.expectation}</td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{r.suite}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.column}</td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{r.expected}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: r.result === 'Fail' ? 'var(--red)' : 'var(--text2)' }}>{r.observed}</td>
                      <td>
                        <span className={r.result === 'Pass' ? 'pill pill-green' : 'pill pill-red'}>{r.result}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* History */}
          {dqInner === 'History' && (
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Date</th><th>Suite</th><th>Passed</th><th>Failed</th><th>Total</th><th>Duration</th></tr>
                  </thead>
                  <tbody>
                    {MOCK_DQ_HISTORY.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.date}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.suite}</td>
                        <td style={{ color: 'var(--green)', fontWeight: 600 }}>{r.passed}</td>
                        <td style={{ color: r.failed > 0 ? 'var(--red)' : 'var(--text3)' }}>{r.failed}</td>
                        <td>{r.total}</td>
                        <td style={{ color: 'var(--text3)' }}>{r.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>Quality Score Trend (7 days)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '8px 0' }}>
                  {DQ_TREND.map((v, i) => {
                    const h = Math.round(v * 0.7)
                    const color = v >= 95 ? 'var(--green)' : v >= 90 ? 'var(--amber)' : 'var(--red)'
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{v}%</div>
                        <div style={{ width: '100%', height: h, background: color, borderRadius: 2, opacity: 0.75 }} />
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Apr {9 + i}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Config */}
          {dqInner === 'Config' && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 16 }}>Quality Gate Settings</div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Block Pipeline on Failure</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text2)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Enabled — pipeline halts when any critical expectation fails
                </label>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Notification Channels</label>
                {['Slack #data-quality', 'Email: data-eng@company.com', 'PagerDuty (critical only)', 'Jira ticket creation'].map((ch, i) => (
                  <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 6, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={i < 2 || i === 3} /> {ch}
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Schedule</label>
                <select className="form-input" style={{ width: '100%', maxWidth: 300 }} defaultValue="Every 30 minutes">
                  {['Every 30 minutes', 'Hourly', 'Every 6 hours', 'Daily'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Configuration saved')}>Save Configuration</button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Defaults restored')}>Reset to Defaults</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Versioning ── */}
      {activeTab === 'Versioning' && (
        <div>
          {/* Stats */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Tracked Datasets', value: '14', color: 'var(--text)' },
              { label: 'Total Versions', value: '128', color: 'var(--text)' },
              { label: 'Storage Used', value: '2.4 TB', color: 'var(--cyan)' },
              { label: 'Last Commit', value: '12m ago', color: 'var(--green)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <SubTabs tabs={['Datasets', 'Versions', 'Diff', 'Pipeline']} active={verInner} onChange={setVerInner} />

          {/* Datasets */}
          {verInner === 'Datasets' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 24 }} />
                    <th>Name</th>
                    <th>Size</th>
                    <th>Rows</th>
                    <th>Version</th>
                    <th>Hash</th>
                    <th>Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DVC_DATASETS.map((d, idx) => (
                    <>
                      <tr key={d.name} style={{ cursor: 'pointer' }} onClick={() => setVerExpandDs(verExpandDs === idx ? null : idx)}>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{verExpandDs === idx ? '▼' : '▶'}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{d.name}</td>
                        <td>{d.size}</td>
                        <td>{d.rows}</td>
                        <td><span className="pill pill-blue">{d.version}</span></td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{d.hash}</td>
                        <td style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>{d.modified}</td>
                      </tr>
                      {verExpandDs === idx && (
                        <tr key={`${d.name}-exp`}>
                          <td colSpan={7} style={{ padding: 0 }}>
                            <div style={{ background: 'var(--bg3)', padding: '12px 16px', fontSize: 'var(--text-xs)' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Files in <strong>{d.name}</strong></div>
                              {d.files.map((f) => (
                                <div key={f} style={{ padding: '3px 8px', marginBottom: 3, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{f}</div>
                              ))}
                              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('dvc pull started')}>dvc pull</button>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Opening history…')}>View History</button>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Compare view coming soon')}>Compare</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Versions */}
          {verInner === 'Versions' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Tag</th><th>Commit</th><th>Date</th><th>Size Delta</th><th>Author</th><th>Message</th></tr>
                </thead>
                <tbody>
                  {MOCK_VERSIONS.map((v) => (
                    <tr key={v.tag}>
                      <td><span className="pill pill-blue" style={{ fontSize: '10px' }}>{v.tag}</span></td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{v.commit}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{v.date}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: v.delta.startsWith('+') ? 'var(--green)' : 'var(--red)' }}>{v.delta}</td>
                      <td>{v.author}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{v.msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Diff */}
          {verInner === 'Diff' && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>Side-by-Side Diff</div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">From</label>
                  <select className="form-input" style={{ width: '100%' }}>
                    {['v3.2.0', 'v3.1.0', 'v3.0.0'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">To</label>
                  <select className="form-input" style={{ width: '100%' }}>
                    {['v3.2.1', 'v3.2.0'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 12 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 8 }}>v3.2.0 (Before)</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>
                    <div>Rows: <strong>1,204,821</strong></div>
                    <div>Columns: <strong>14</strong></div>
                    <div>Size: <strong>418 MB</strong></div>
                    <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 11 }}>customer_id, name, email, phone, address, city, state, zip, created_at, updated_at, segment, ltv, churn_score, status</div>
                  </div>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 12 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 8 }}>v3.2.1 (After)</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>
                    <div>Rows: <strong>1,205,112</strong> <span style={{ color: 'var(--green)' }}>(+291)</span></div>
                    <div>Columns: <strong>15</strong> <span style={{ color: 'var(--green)' }}>(+1)</span></div>
                    <div>Size: <strong>420 MB</strong> <span style={{ color: 'var(--green)' }}>(+2.1 MB)</span></div>
                    <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 11 }}>customer_id, name, email, phone, address, city, state, zip, created_at, updated_at, segment, ltv, churn_score, status, <span style={{ color: 'var(--green)' }}>loyalty_tier</span></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Diff report downloaded')}>Download Diff Report</button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Opening sample rows…')}>View Sample Rows</button>
              </div>
            </div>
          )}

          {/* Pipeline DAG */}
          {verInner === 'Pipeline' && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>DVC Pipeline DAG</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {DVC_PIPELINE_STAGES.map((s, i) => (
                  <>
                    {i > 0 && <span key={`arrow-${i}`} style={{ color: 'var(--text3)' }}>→</span>}
                    <span key={s.name} className="pill" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}>{s.name}</span>
                  </>
                ))}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)', marginBottom: 10, fontWeight: 600 }}>Stage Details</div>
              {DVC_PIPELINE_STAGES.map((s) => (
                <div key={s.name} style={{ display: 'flex', gap: 16, padding: '6px 10px', marginBottom: 4, background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ minWidth: 80, fontWeight: 600, color: 'var(--text)' }}>{s.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{s.cmd}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Pipeline running…')}><Play size={12} /> Run Pipeline</button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('dvc repro…')}>dvc repro</button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Opening metrics…')}>View Metrics</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Data Contracts ── */}
      {activeTab === 'Data Contracts' && (
        <div>
          {/* Stats */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Active Contracts', value: '22', color: 'var(--text)' },
              { label: 'Producers', value: '8', color: 'var(--text)' },
              { label: 'Consumers', value: '15', color: 'var(--text)' },
              { label: 'Violations (7d)', value: '3', color: 'var(--amber)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SubTabs tabs={['Contracts', 'Producers', 'Violations', 'Config']} active={dcInner} onChange={setDcInner} />
            {dcInner === 'Contracts' && (
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Add contract dialog coming soon')}><Plus size={13} /> Add Contract</button>
            )}
          </div>

          {/* Contracts */}
          {dcInner === 'Contracts' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 24 }} />
                    <th>Contract</th>
                    <th>Producer</th>
                    <th>Consumers</th>
                    <th>Checks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CONTRACTS.map((c, idx) => (
                    <>
                      <tr key={c.name} style={{ cursor: 'pointer' }} onClick={() => setDcExpandContract(dcExpandContract === idx ? null : idx)}>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{dcExpandContract === idx ? '▼' : '▶'}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{c.name}</td>
                        <td style={{ color: 'var(--text2)' }}>{c.producer}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {c.consumers.map((con) => <span key={con} className="pill" style={{ fontSize: '10px' }}>{con}</span>)}
                          </div>
                        </td>
                        <td>{c.checks}</td>
                        <td><span className={c.status === 'Active' ? 'pill pill-green' : 'pill pill-red'}>{c.status}</span></td>
                      </tr>
                      {dcExpandContract === idx && (
                        <tr key={`${c.name}-exp`}>
                          <td colSpan={6} style={{ padding: 0 }}>
                            <div style={{ background: 'var(--bg3)', padding: '12px 16px', fontSize: 'var(--text-xs)' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Contract Checks</div>
                              {c.details.map((d) => (
                                <div key={d} style={{ padding: '3px 8px', marginBottom: 3, background: 'var(--bg4)', borderRadius: 'var(--radius)', color: d.includes('VIOLATED') ? 'var(--red)' : 'var(--text2)' }}>{d}</div>
                              ))}
                              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Edit contract')}>Edit Contract</button>
                                <button className="btn btn-xs btn-ghost" onClick={() => showToast('Details opening…')}>View Details</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Producers */}
          {dcInner === 'Producers' && (
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Team</th><th>Datasets</th><th>Contracts</th><th>Violations</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { team: 'CRM Team', datasets: 3, contracts: 4, violations: 0 },
                      { team: 'Payments', datasets: 2, contracts: 3, violations: 1 },
                      { team: 'Commerce', datasets: 4, contracts: 5, violations: 0 },
                      { team: 'Web Platform', datasets: 2, contracts: 2, violations: 2 },
                    ].map((r) => (
                      <tr key={r.team}>
                        <td style={{ fontWeight: 600 }}>{r.team}</td>
                        <td>{r.datasets}</td>
                        <td>{r.contracts}</td>
                        <td><span className={r.violations === 0 ? 'pill pill-green' : r.violations < 2 ? 'pill pill-amber' : 'pill pill-red'}>{r.violations}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast('Edit contract')}>Edit Contract</button>
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast('Details opening…')}>View Details</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>Producer Performance Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                  {[
                    { label: 'Avg SLA Compliance', value: '97.8%', color: 'var(--green)' },
                    { label: 'Avg Freshness Score', value: '94.2%', color: 'var(--green)' },
                    { label: 'Schema Drift Events', value: '4', color: 'var(--amber)' },
                    { label: 'Open Violations', value: '3', color: 'var(--red)' },
                  ].map((s) => (
                    <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Violations */}
          {dcInner === 'Violations' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Contract</th><th>Check</th><th>Expected</th><th>Actual</th><th>Severity</th><th>Time</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {MOCK_VIOLATIONS.map((v, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{v.contract}</td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{v.check}</td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>{v.expected}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>{v.actual}</td>
                      <td><span className={severityClass(v.severity)}>{v.severity}</span></td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{v.time}</td>
                      <td>
                        <button className="btn btn-xs btn-primary" onClick={() => showToast('Violation resolved')}>Resolve</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Config */}
          {dcInner === 'Config' && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 16 }}>Contract Enforcement Settings</div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Enforcement Mode</label>
                {[
                  { label: 'Block', desc: 'Reject data that violates contract' },
                  { label: 'Warn', desc: 'Allow data but log violation' },
                  { label: 'Monitor', desc: 'Track only, no alerts' },
                ].map((opt, i) => (
                  <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 6, cursor: 'pointer' }}>
                    <input type="radio" name="dc_enforce" defaultChecked={i === 1} /> <strong>{opt.label}</strong> — {opt.desc}
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Notification Channels</label>
                {['Slack #data-contracts', 'Email: contract-owners@company.com', 'PagerDuty (critical)'].map((ch, i) => (
                  <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 6, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={i < 2} /> {ch}
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Scan Schedule</label>
                <select className="form-input" style={{ width: '100%', maxWidth: 300 }}>
                  {['Every 15 minutes', 'Every 30 minutes', 'Hourly', 'On data arrival'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Settings saved')}>Save Settings</button>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Test passed')}>Test Configuration</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
