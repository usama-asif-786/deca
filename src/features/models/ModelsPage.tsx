import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react'

const TABS = ['Model Registry', 'BYOLLM', 'Serving & Deployment', 'Evaluation & Bias', 'Model Cards', 'Champion/Challenger']

// TODO: Replace with RTK Query endpoint for model registry — see src/app/services/api.ts
const MOCK_MODELS = [
  {
    name: 'churn_predictor', version: 'v3.2', framework: 'XGBoost', stage: 'Production', accuracy: '89.4%', deployed: 'Apr 12', owner: 'Lisa Chen', size: '12.4 MB',
    tags: ['finance', 'churn', 'production'],
    task: 'Classification',
    downloads: 142,
    author: 'Lisa Chen',
    desc: 'Predicts customer churn probability for proactive retention outreach using gradient boosting.',
    metrics: { accuracy: 89.4, f1: 88.1, auc: 92.3, precision: 87.6, recall: 88.7 },
    versions: [
      { tag: 'v3.2', status: 'active', date: 'Apr 12', size: '12.4 MB', deployedBy: 'Lisa Chen' },
      { tag: 'v3.1', status: 'deprecated', date: 'Mar 28', size: '11.9 MB', deployedBy: 'Lisa Chen' },
      { tag: 'v3.0', status: 'deprecated', date: 'Feb 14', size: '11.2 MB', deployedBy: 'Tom Baker' },
    ],
    config: { learning_rate: '0.001', max_depth: '6', n_estimators: '500', subsample: '0.8', colsample_bytree: '0.8', reg_alpha: '0.01' },
    endpoint: '/api/v1/predict/churn',
    rateLimit: '1000 req/min',
  },
  {
    name: 'ltv_estimator', version: 'v1.8', framework: 'LightGBM', stage: 'Staging', accuracy: '87.1%', deployed: 'Apr 10', owner: 'Lisa Chen', size: '8.2 MB',
    tags: ['finance', 'time-series', 'staging'],
    task: 'Regression',
    downloads: 58,
    author: 'Lisa Chen',
    desc: 'Estimates customer lifetime value using gradient boosting on historical transaction features.',
    metrics: { accuracy: 87.1, f1: 85.4, auc: 90.1, precision: 86.2, recall: 84.8 },
    versions: [
      { tag: 'v1.8', status: 'active', date: 'Apr 10', size: '8.2 MB', deployedBy: 'Lisa Chen' },
      { tag: 'v1.7', status: 'deprecated', date: 'Mar 20', size: '7.9 MB', deployedBy: 'Raj Desai' },
      { tag: 'v1.6', status: 'deprecated', date: 'Feb 28', size: '7.5 MB', deployedBy: 'Lisa Chen' },
    ],
    config: { learning_rate: '0.01', num_leaves: '64', n_estimators: '300', min_child_samples: '20', feature_fraction: '0.9', bagging_fraction: '0.8' },
    endpoint: '/api/v1/predict/ltv',
    rateLimit: '500 req/min',
  },
  {
    name: 'support_classifier', version: 'v2.1', framework: 'BERT', stage: 'Production', accuracy: '94.2%', deployed: 'Mar 28', owner: 'Tom Baker', size: '438 MB',
    tags: ['nlp', 'classification', 'production'],
    task: 'Text Classification',
    downloads: 312,
    author: 'Tom Baker',
    desc: 'Classifies incoming support tickets into categories for intelligent routing using fine-tuned BERT.',
    metrics: { accuracy: 94.2, f1: 93.8, auc: 97.1, precision: 93.5, recall: 94.1 },
    versions: [
      { tag: 'v2.1', status: 'active', date: 'Mar 28', size: '438 MB', deployedBy: 'Tom Baker' },
      { tag: 'v2.0', status: 'deprecated', date: 'Feb 15', size: '435 MB', deployedBy: 'Tom Baker' },
      { tag: 'v1.9', status: 'deprecated', date: 'Jan 30', size: '432 MB', deployedBy: 'Lisa Chen' },
    ],
    config: { model_base: 'bert-base-uncased', max_length: '512', batch_size: '32', epochs: '5', lr: '2e-5', warmup_steps: '500' },
    endpoint: '/api/v1/classify/support',
    rateLimit: '200 req/min',
  },
  {
    name: 'revenue_forecaster', version: 'v4.0', framework: 'Prophet', stage: 'Development', accuracy: '83.6%', deployed: '—', owner: 'Raj Desai', size: '3.1 MB',
    tags: ['finance', 'forecasting', 'development'],
    task: 'Time-Series Forecasting',
    downloads: 14,
    author: 'Raj Desai',
    desc: 'Forecasts monthly revenue using additive decomposition with trend, seasonality, and holiday components.',
    metrics: { accuracy: 83.6, f1: 0, auc: 0, precision: 0, recall: 0 },
    versions: [
      { tag: 'v4.0', status: 'active', date: 'Apr 18', size: '3.1 MB', deployedBy: 'Raj Desai' },
      { tag: 'v3.9', status: 'deprecated', date: 'Mar 10', size: '2.9 MB', deployedBy: 'Raj Desai' },
      { tag: 'v3.8', status: 'deprecated', date: 'Jan 22', size: '2.8 MB', deployedBy: 'Lisa Chen' },
    ],
    config: { seasonality_mode: 'multiplicative', changepoint_prior_scale: '0.05', seasonality_prior_scale: '10', holidays_prior_scale: '10', n_changepoints: '25', interval_width: '0.80' },
    endpoint: '/api/v1/forecast/revenue',
    rateLimit: '100 req/min',
  },
  {
    name: 'anomaly_detector', version: 'v1.2', framework: 'Isolation Forest', stage: 'Production', accuracy: '—', deployed: 'Mar 15', owner: 'Lisa Chen', size: '1.8 MB',
    tags: ['anomaly', 'unsupervised', 'production'],
    task: 'Anomaly Detection',
    downloads: 87,
    author: 'Lisa Chen',
    desc: 'Detects anomalous transactions and system events using unsupervised isolation forest ensemble.',
    metrics: { accuracy: 0, f1: 91.3, auc: 94.7, precision: 90.1, recall: 92.6 },
    versions: [
      { tag: 'v1.2', status: 'active', date: 'Mar 15', size: '1.8 MB', deployedBy: 'Lisa Chen' },
      { tag: 'v1.1', status: 'deprecated', date: 'Feb 02', size: '1.6 MB', deployedBy: 'Lisa Chen' },
      { tag: 'v1.0', status: 'deprecated', date: 'Dec 18', size: '1.5 MB', deployedBy: 'Tom Baker' },
    ],
    config: { n_estimators: '100', max_samples: 'auto', contamination: '0.05', max_features: '1.0', bootstrap: 'false', random_state: '42' },
    endpoint: '/api/v1/detect/anomaly',
    rateLimit: '2000 req/min',
  },
]

// TODO: Replace with LLM provider API keys and model management backend — see src/app/services/api.ts
const MOCK_LLMS = [
  { name: 'Claude Sonnet 4.6', provider: 'Anthropic', status: 'active', calls: '48,291', latency: '890ms', cost: '$124.50' },
  { name: 'GPT-4o', provider: 'OpenAI', status: 'active', calls: '12,440', latency: '1,240ms', cost: '$89.20' },
  { name: 'Llama 3.1 70B', provider: 'Self-hosted', status: 'active', calls: '8,102', latency: '340ms', cost: '$0' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', status: 'inactive', calls: '0', latency: '—', cost: '$0' },
]

// TODO: Replace with Kubernetes deployment API — see src/app/services/api.ts
const MOCK_ENDPOINTS = [
  { model: 'churn_predictor', endpoint: '/api/v1/predict/churn', replicas: 3, rps: 142, p99: '24ms', uptime: '99.98%', status: 'healthy', traffic: [60, 80, 75, 90, 85, 142] },
  { model: 'support_classifier', endpoint: '/api/v1/classify/support', replicas: 2, rps: 58, p99: '48ms', uptime: '99.95%', status: 'healthy', traffic: [40, 45, 50, 55, 60, 58] },
  { model: 'ltv_estimator', endpoint: '/api/v1/predict/ltv', replicas: 1, rps: 12, p99: '91ms', uptime: '99.82%', status: 'degraded', traffic: [20, 18, 15, 12, 10, 12] },
]

// TODO: Replace with bias evaluation pipeline results — see src/app/services/api.ts
const MOCK_BIAS = [
  { model: 'churn_predictor', group: 'Enterprise', eqOdds: 0.92, demoParity: 0.88, status: 'pass' },
  { model: 'churn_predictor', group: 'Mid-Market', eqOdds: 0.88, demoParity: 0.85, status: 'pass' },
  { model: 'churn_predictor', group: 'SMB', eqOdds: 0.74, demoParity: 0.71, status: 'warn' },
  { model: 'support_classifier', group: 'English', eqOdds: 0.95, demoParity: 0.93, status: 'pass' },
  { model: 'support_classifier', group: 'Non-English', eqOdds: 0.79, demoParity: 0.74, status: 'warn' },
]

const MODEL_CARDS = [
  {
    name: 'churn_predictor v3.2',
    intendedUse: 'Predict customer churn probability for proactive retention outreach.',
    performance: 'Accuracy: 89.4%, F1: 88.1%, AUC: 92.3% on held-out test set (Apr 2026).',
    limitations: 'May underperform on SMB segment with < 6 months history. Not validated on non-English markets.',
    ethical: 'Reviewed for demographic parity across customer segments. Retrain triggered if PSI > 0.2.',
    owner: 'Lisa Chen',
    updated: 'Apr 18, 2026',
  },
  {
    name: 'support_classifier v2.1',
    intendedUse: 'Classify incoming support tickets into categories for intelligent routing.',
    performance: 'Accuracy: 94.2%, F1: 93.8% on balanced test set (Mar 2026).',
    limitations: 'Trained on English-language tickets. Non-English accuracy drops to ~79%.',
    ethical: 'No personal identifiers used as features. Predictions are advisory — human review required for escalations.',
    owner: 'Tom Baker',
    updated: 'Mar 28, 2026',
  },
]

// TODO: Replace with A/B testing framework API — see src/app/services/api.ts
const CHAMP_CHALLENGER = {
  champion: { name: 'churn_predictor v3.2', traffic: 80, accuracy: 89.4, f1: 88.1, auc: 92.3 },
  challenger: { name: 'churn_v3_lgbm', traffic: 20, accuracy: 90.1, f1: 88.9, auc: 93.1 },
}

function stagePillClass(stage: string): string {
  switch (stage) {
    case 'Production': return 'pill pill-green'
    case 'Staging': return 'pill pill-amber'
    case 'Development': return 'pill'
    default: return 'pill'
  }
}

function MetricDelta({ val, base }: { val: number; base: number }) {
  const diff = val - base
  if (diff > 0) return <TrendingUp size={12} style={{ color: 'var(--green)', display: 'inline', marginLeft: 4 }} />
  if (diff < 0) return <TrendingDown size={12} style={{ color: 'var(--red)', display: 'inline', marginLeft: 4 }} />
  return <Minus size={12} style={{ color: 'var(--text3)', display: 'inline', marginLeft: 4 }} />
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

type ModelEntry = typeof MOCK_MODELS[number]

function ModelCard({ model, isExpanded, onToggle }: {
  model: ModelEntry
  isExpanded: boolean
  onToggle: () => void
}) {
  const [modelTab, setModelTab] = useState('Overview')
  const MODEL_INNER_TABS = ['Overview', 'Versions', 'Metrics', 'API / Inference', 'Config']

  return (
    <div
      style={{
        borderRadius: 'var(--radius)',
        border: isExpanded ? '1px solid var(--cyan)' : '1px solid var(--border)',
        marginBottom: 8,
        overflow: 'hidden',
        transition: 'border-color 120ms ease',
      }}
    >
      {/* Card header / clickable row */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--bg2)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Chevron */}
        <span
          style={{
            fontSize: 12,
            color: 'var(--text3)',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
            display: 'inline-block',
            width: 14,
            flexShrink: 0,
          }}
        >
          ▶
        </span>

        {/* Name + version */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              {model.name}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{model.version}</span>
            <span className={stagePillClass(model.stage)} style={{ fontSize: '10px' }}>{model.stage}</span>
            <span className="pill" style={{ fontSize: '10px' }}>{model.framework}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            {model.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  padding: '1px 7px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--cyan-bg)',
                  color: 'var(--cyan)',
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right side stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Accuracy</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cyan)' }}>{model.accuracy}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Downloads</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{model.downloads}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Owner</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{model.owner}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-xs btn-primary"
              onClick={(e) => { e.stopPropagation(); showToast(`Deploying ${model.name}…`) }}
            >
              Deploy
            </button>
            <button
              className="btn btn-xs btn-ghost"
              onClick={(e) => { e.stopPropagation(); showToast(`Archiving ${model.name}`) }}
            >
              Archive
            </button>
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          {/* Inner sub-tab bar */}
          <div style={{ display: 'flex', gap: 4, padding: '10px 16px 0', borderBottom: '1px solid var(--border)' }}>
            {MODEL_INNER_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setModelTab(t)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: 'var(--radius) var(--radius) 0 0',
                  background: modelTab === t ? 'var(--cyan)' : 'transparent',
                  color: modelTab === t ? '#fff' : 'var(--text3)',
                  border: modelTab === t ? '1px solid var(--cyan)' : '1px solid transparent',
                  borderBottom: 'none',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: '16px' }}>
            {/* Overview tab */}
            {modelTab === 'Overview' && (
              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {[
                    { label: 'Task', value: model.task },
                    { label: 'Framework', value: model.framework },
                    { label: 'Size', value: model.size },
                    { label: 'Accuracy', value: model.accuracy },
                    { label: 'Downloads', value: String(model.downloads) },
                    { label: 'License', value: 'Apache 2.0' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        background: 'var(--bg3)',
                        borderRadius: 'var(--radius)',
                        padding: '10px 12px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: stat.label === 'Task' || stat.label === 'Framework' || stat.label === 'License' ? 'inherit' : 'var(--mono)' }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)', lineHeight: 1.7 }}>
                  {model.desc}
                </p>
              </div>
            )}

            {/* Versions tab */}
            {modelTab === 'Versions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {model.versions.map((v) => (
                  <div
                    key={v.tag}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      background: 'var(--bg3)',
                      borderRadius: 'var(--radius)',
                      border: v.status === 'active' ? '1px solid var(--green)' : '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, color: 'var(--text)', minWidth: 40 }}>{v.tag}</span>
                    <span
                      className={v.status === 'active' ? 'pill pill-green' : 'pill'}
                      style={{ fontSize: '10px' }}
                    >
                      {v.status}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{v.date}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{v.size}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)', marginLeft: 'auto' }}>
                      Deployed by {v.deployedBy}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Metrics tab */}
            {modelTab === 'Metrics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Accuracy', value: model.metrics.accuracy, color: 'var(--cyan)' },
                  { label: 'F1 Score', value: model.metrics.f1, color: 'var(--green)' },
                  { label: 'AUC', value: model.metrics.auc, color: 'var(--cyan)' },
                  { label: 'Precision', value: model.metrics.precision, color: 'var(--green)' },
                  { label: 'Recall', value: model.metrics.recall, color: 'var(--amber)' },
                ].map((m) => (
                  <div key={m.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{m.label}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: m.value > 0 ? m.color : 'var(--text3)' }}>
                        {m.value > 0 ? `${m.value.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${m.value > 0 ? m.value : 0}%`, background: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* API / Inference tab */}
            {modelTab === 'API / Inference' && (
              <div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '10px 14px', flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Endpoint</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)', fontWeight: 600 }}>{model.endpoint}</div>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '10px 14px', flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Rate Limit</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{model.rateLimit}</div>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '10px 14px', flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Auth</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>Bearer Token</div>
                  </div>
                </div>
                <pre
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '12px 14px',
                    fontSize: 11,
                    fontFamily: 'var(--mono)',
                    color: 'var(--text2)',
                    overflowX: 'auto',
                    lineHeight: 1.6,
                    whiteSpace: 'pre',
                  }}
                >{`curl -X POST https://api.fulcrumhub.io${model.endpoint} \\
  -H "Authorization: Bearer $FULCRUM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"customer_id": "cust_12345", "features": {...}}'`}</pre>
              </div>
            )}

            {/* Config tab */}
            {modelTab === 'Config' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}
              >
                {Object.entries(model.config).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: 'var(--bg3)',
                      borderRadius: 'var(--radius)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'lowercase' }}>{key}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState('Model Registry')
  const [expandedModel, setExpandedModel] = useState<number | null>(null)

  function handleToggleModel(idx: number) {
    setExpandedModel(expandedModel === idx ? null : idx)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Models & Governance
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          Registry, serving, bias evaluation, and champion/challenger testing
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

      {/* Model Registry */}
      {activeTab === 'Model Registry' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Register model dialog coming soon')}>
              <Plus size={13} /> Register Model
            </button>
          </div>
          {MOCK_MODELS.map((model, idx) => (
            <ModelCard
              key={model.name}
              model={model}
              isExpanded={expandedModel === idx}
              onToggle={() => handleToggleModel(idx)}
            />
          ))}
        </div>
      )}

      {/* BYOLLM */}
      {activeTab === 'BYOLLM' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Add provider dialog coming soon')}>
              <Plus size={13} /> Add Provider
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Total Calls</th>
                  <th>Avg Latency</th>
                  <th>Cost (MTD)</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LLMS.map((llm) => {
                  const calls = parseInt(llm.calls.replace(/,/g, '')) || 0
                  const maxCalls = 48291
                  return (
                    <tr key={llm.name}>
                      <td style={{ fontWeight: 600 }}>{llm.name}</td>
                      <td>
                        <span className="pill" style={{ fontSize: '10px' }}>{llm.provider}</span>
                      </td>
                      <td>
                        <span className={llm.status === 'active' ? 'pill pill-green' : 'pill'} style={{ fontSize: '10px' }}>
                          {llm.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{llm.calls}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{llm.latency}</td>
                      <td style={{ fontWeight: 600, color: llm.cost === '$0' ? 'var(--green)' : 'var(--text)' }}>{llm.cost}</td>
                      <td style={{ minWidth: 100 }}>
                        <div className="progress" style={{ height: 5 }}>
                          <div className="progress-fill" style={{ width: `${(calls / maxCalls) * 100}%`, background: 'var(--cyan)' }} />
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

      {/* Serving & Deployment */}
      {activeTab === 'Serving & Deployment' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Endpoint</th>
                <th>Replicas</th>
                <th>RPS</th>
                <th>P99 Latency</th>
                <th>Uptime</th>
                <th>Traffic</th>
                <th>Status</th>
                <th>Scale</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ENDPOINTS.map((ep) => (
                <tr key={ep.model}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{ep.model}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{ep.endpoint}</td>
                  <td style={{ fontWeight: 600 }}>{ep.replicas}</td>
                  <td style={{ fontWeight: 600 }}>{ep.rps}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{ep.p99}</td>
                  <td style={{ color: parseFloat(ep.uptime) >= 99.9 ? 'var(--green)' : 'var(--amber)', fontWeight: 600 }}>{ep.uptime}</td>
                  <td style={{ minWidth: 80 }}>
                    {/* Mini sparkline bars */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}>
                      {ep.traffic.map((v, i) => {
                        const max = Math.max(...ep.traffic)
                        return (
                          <div
                            key={i}
                            style={{
                              width: 6,
                              height: `${(v / max) * 22}px`,
                              background: ep.status === 'healthy' ? 'var(--green)' : 'var(--amber)',
                              borderRadius: '1px',
                              opacity: 0.7 + (i / ep.traffic.length) * 0.3,
                            }}
                          />
                        )
                      })}
                    </div>
                  </td>
                  <td>
                    <span className={ep.status === 'healthy' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                      {ep.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                      <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Scaling up ${ep.model}`)}>▲</button>
                      <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Scaling down ${ep.model}`)}>▼</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Evaluation & Bias */}
      {activeTab === 'Evaluation & Bias' && (
        <div>
          <div className="card" style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--amber-bg)', border: '1px solid var(--amber)33' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--amber)', fontWeight: 600 }}>
              Fairness metrics computed using Equal Opportunity Difference and Demographic Parity Difference.
              Values below 0.80 require review.
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Group</th>
                  <th>Equalized Odds</th>
                  <th>Demographic Parity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BIAS.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{b.model}</td>
                    <td>
                      <span className="pill" style={{ fontSize: '10px' }}>{b.group}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ flex: 1, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${b.eqOdds * 100}%`, background: b.eqOdds >= 0.85 ? 'var(--green)' : 'var(--amber)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, minWidth: 32 }}>{b.eqOdds.toFixed(2)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ flex: 1, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${b.demoParity * 100}%`, background: b.demoParity >= 0.85 ? 'var(--green)' : 'var(--amber)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, minWidth: 32 }}>{b.demoParity.toFixed(2)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={b.status === 'pass' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Model Cards */}
      {activeTab === 'Model Cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {MODEL_CARDS.map((mc) => (
            <div key={mc.name} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{mc.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 2 }}>
                    Owner: {mc.owner} · Updated: {mc.updated}
                  </div>
                </div>
                <span className="pill pill-green" style={{ fontSize: '10px' }}>Published</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Intended Use', content: mc.intendedUse },
                  { label: 'Performance', content: mc.performance },
                  { label: 'Limitations', content: mc.limitations },
                  { label: 'Ethical Considerations', content: mc.ethical },
                ].map((section) => (
                  <div key={section.label}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      {section.label}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)', lineHeight: 1.6 }}>
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Champion/Challenger */}
      {activeTab === 'Champion/Challenger' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 16 }}>
              Traffic Split
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ fontWeight: 600, color: 'var(--green)', minWidth: 160 }}>
                Champion: {CHAMP_CHALLENGER.champion.name}
              </span>
              <div style={{ flex: 1, height: 20, background: 'var(--bg3)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${CHAMP_CHALLENGER.champion.traffic}%`, background: 'var(--green)', borderRadius: 'var(--radius)' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${CHAMP_CHALLENGER.challenger.traffic}%`, background: 'var(--cyan)', borderRadius: 'var(--radius)' }} />
              </div>
              <span style={{ fontWeight: 600, color: 'var(--cyan)', minWidth: 160, textAlign: 'right' }}>
                {CHAMP_CHALLENGER.challenger.name}: Challenger
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
              <span>{CHAMP_CHALLENGER.champion.traffic}% traffic</span>
              <span>{CHAMP_CHALLENGER.challenger.traffic}% traffic</span>
            </div>
          </div>

          {/* Metric comparison */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 16 }}>
              Metric Comparison
            </div>
            {[
              { label: 'Accuracy', champ: CHAMP_CHALLENGER.champion.accuracy, chal: CHAMP_CHALLENGER.challenger.accuracy },
              { label: 'F1 Score', champ: CHAMP_CHALLENGER.champion.f1, chal: CHAMP_CHALLENGER.challenger.f1 },
              { label: 'AUC', champ: CHAMP_CHALLENGER.champion.auc, chal: CHAMP_CHALLENGER.challenger.auc },
            ].map((metric) => (
              <div key={metric.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>
                  <span>{metric.label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{metric.champ.toFixed(1)}%</span>
                    <span>vs</span>
                    <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>
                      {metric.chal.toFixed(1)}%
                      <MetricDelta val={metric.chal} base={metric.champ} />
                    </span>
                  </span>
                </div>
                <div style={{ position: 'relative', height: 10 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg3)', borderRadius: 'var(--radius)' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${metric.champ}%`, background: 'var(--green)', borderRadius: 'var(--radius)', opacity: 0.6 }} />
                  <div style={{ position: 'absolute', top: 2, left: 0, bottom: 2, width: `${metric.chal}%`, background: 'var(--cyan)', borderRadius: 'var(--radius)', opacity: 0.6 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Challenger promoted to champion')}>
                Promote Challenger
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => showToast('Experiment ended')}>
                End Experiment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
