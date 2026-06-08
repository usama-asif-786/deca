import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Play, XCircle, FileText, CheckCircle2, Clock, Loader, Star } from 'lucide-react'

const TABS = ['MLOps', 'Experiments', 'Datasets', 'Training Pipelines', 'Hyperparameter Tuning']

// TODO: Replace with RTK Query + WebSocket for live job status — see src/app/services/api.ts
const MOCK_JOBS = [
  { id: 'job-001', name: 'churn_model_v3_train', status: 'running', progress: 68, gpu: '2x A100', eta: '12 min', started: '5 min ago' },
  { id: 'job-002', name: 'ltv_model_retrain', status: 'queued', progress: 0, gpu: '1x V100', eta: '—', started: '—' },
  { id: 'job-003', name: 'sentiment_finetune', status: 'completed', progress: 100, gpu: '4x A100', eta: '—', started: '2 hr ago' },
  { id: 'job-004', name: 'nps_predictor_v2', status: 'failed', progress: 34, gpu: '1x A100', eta: '—', started: '1 hr ago' },
]

// TODO: Replace with MLflow/W&B API integration — see src/app/services/api.ts
const MOCK_EXPERIMENTS = [
  { id: 'exp-001', name: 'churn_v3_lr0001', model: 'XGBoost', accuracy: 0.894, f1: 0.881, auc: 0.923, params: { lr: 0.001, depth: 6, n_est: 500 }, status: 'champion' },
  { id: 'exp-002', name: 'churn_v3_lr0005', model: 'XGBoost', accuracy: 0.886, f1: 0.872, auc: 0.911, params: { lr: 0.005, depth: 5, n_est: 300 }, status: 'challenger' },
  { id: 'exp-003', name: 'churn_v3_rf', model: 'Random Forest', accuracy: 0.871, f1: 0.858, auc: 0.899, params: { n_est: 200, max_depth: 10 }, status: 'archived' },
  { id: 'exp-004', name: 'churn_v3_lgbm', model: 'LightGBM', accuracy: 0.901, f1: 0.889, auc: 0.931, params: { lr: 0.01, num_leaves: 64 }, status: 'running' },
]

// TODO: Replace with RTK Query endpoint for training datasets — see src/app/services/api.ts
const MOCK_DATASETS = [
  { name: 'churn_train_v3', version: 'v3.1', size: '1.2 GB', trainSplit: '70%', valSplit: '15%', testSplit: '15%', created: 'Apr 14, 2026', source: 'Feature Store' },
  { name: 'ltv_dataset_v1', version: 'v1.8', size: '0.8 GB', trainSplit: '80%', valSplit: '10%', testSplit: '10%', created: 'Mar 28, 2026', source: 'Feature Store' },
  { name: 'support_classifier_data', version: 'v2.4', size: '4.2 GB', trainSplit: '75%', valSplit: '12%', testSplit: '13%', created: 'Mar 15, 2026', source: 'Label Studio' },
  { name: 'nps_predictor_data', version: 'v0.9', size: '0.3 GB', trainSplit: '70%', valSplit: '15%', testSplit: '15%', created: 'Apr 18, 2026', source: 'Intercom API' },
]

// TODO: Replace with Optuna/Ray Tune API — see src/app/services/api.ts
const MOCK_HPO_TRIALS = [
  { trial: 1, lr: 0.001, depth: 6, n_est: 500, score: 0.923, status: 'best' },
  { trial: 2, lr: 0.005, depth: 8, n_est: 300, score: 0.914, status: 'done' },
  { trial: 3, lr: 0.01, depth: 4, n_est: 200, score: 0.908, status: 'done' },
  { trial: 4, lr: 0.002, depth: 6, n_est: 400, score: 0.919, status: 'done' },
  { trial: 5, lr: 0.001, depth: 7, n_est: 600, score: 0.921, status: 'done' },
]

const PIPELINE_STEPS = ['Ingest', 'Preprocess', 'Feature Eng', 'Train', 'Evaluate', 'Register']

const PIPELINE_STATUSES: Record<string, ('done' | 'running' | 'pending')[]> = {
  'Churn Prediction Pipeline': ['done', 'done', 'done', 'running', 'pending', 'pending'],
  'LTV Estimator Pipeline': ['done', 'done', 'done', 'done', 'done', 'done'],
  'NPS Predictor Pipeline': ['done', 'done', 'pending', 'pending', 'pending', 'pending'],
}

// MLOps sub-tab mock data
const TASK_TEMPLATES = [
  { name: 'Churn Prediction Full Pipeline', steps: 6, lastUsed: 'Apr 18', runs: 47, tags: ['ML', 'churn'] },
  { name: 'NLP Fine-Tuning', steps: 8, lastUsed: 'Apr 14', runs: 23, tags: ['NLP', 'HuggingFace'] },
  { name: 'Feature Engineering Sprint', steps: 4, lastUsed: 'Apr 10', runs: 89, tags: ['Feature Store'] },
  { name: 'Model Evaluation Suite', steps: 5, lastUsed: 'Apr 20', runs: 34, tags: ['Evaluation'] },
]

const LLM_COST_ROWS = [
  { model: 'Claude Sonnet 4.6', provider: 'Anthropic', calls: 48291, inputTok: '124M', outputTok: '38M', cost: '$124.50', budgetPct: 62 },
  { model: 'GPT-4o', provider: 'OpenAI', calls: 12440, inputTok: '48M', outputTok: '12M', cost: '$89.20', budgetPct: 45 },
  { model: 'Llama 3.1 70B', provider: 'Self-hosted', calls: 8102, inputTok: '31M', outputTok: '9M', cost: '$0', budgetPct: 0 },
  { model: 'Gemini 1.5 Pro', provider: 'Google', calls: 0, inputTok: '—', outputTok: '—', cost: '$0', budgetPct: 0 },
]

const MODEL_PERF_CARDS = [
  {
    name: 'churn_predictor',
    version: 'v3.2',
    stats: { accuracy: 89.4, f1: 88.1, auc: 92.3, precision: 87.6 },
    confusion: { tp: 1842, fp: 218, fn: 204, tn: 6234 },
    trend: [87.1, 88.0, 88.3, 88.9, 89.1, 89.2, 89.4],
  },
  {
    name: 'support_classifier',
    version: 'v2.1',
    stats: { accuracy: 94.2, f1: 93.8, auc: 97.1, precision: 93.5 },
    confusion: { tp: 3241, fp: 198, fn: 210, tn: 8831 },
    trend: [92.1, 92.8, 93.2, 93.6, 93.9, 94.0, 94.2],
  },
]

const MLOPS_SUB_TABS = ['Job Monitor', 'Task Templates', 'LLM Costs', 'Model Performance'] as const
type MlopsSubTab = typeof MLOPS_SUB_TABS[number]

function jobStatusColor(status: string): string {
  switch (status) {
    case 'running': return 'var(--cyan)'
    case 'completed': return 'var(--green)'
    case 'failed': return 'var(--red)'
    case 'queued': return 'var(--text3)'
    default: return 'var(--text3)'
  }
}

function JobStatusIcon({ status }: { status: string }) {
  if (status === 'running') return <Loader size={13} style={{ color: 'var(--cyan)' }} />
  if (status === 'completed') return <CheckCircle2 size={13} style={{ color: 'var(--green)' }} />
  if (status === 'failed') return <XCircle size={13} style={{ color: 'var(--red)' }} />
  return <Clock size={13} style={{ color: 'var(--text3)' }} />
}

function expStatusClass(status: string): string {
  switch (status) {
    case 'champion': return 'pill pill-green'
    case 'challenger': return 'pill pill-blue'
    case 'running': return 'pill pill-amber'
    case 'archived': return 'pill'
    default: return 'pill'
  }
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

function TaskTemplatesTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {TASK_TEMPLATES.map((tpl) => (
        <div
          key={tpl.name}
          className="card"
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 6 }}>{tpl.name}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {tpl.tags.map((tag) => (
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
          <div style={{ display: 'flex', gap: 20, fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
            <span><strong style={{ color: 'var(--text)' }}>{tpl.steps}</strong> steps</span>
            <span><strong style={{ color: 'var(--text)' }}>{tpl.runs}</strong> runs</span>
            <span>Last used: <strong style={{ color: 'var(--text2)' }}>{tpl.lastUsed}</strong></span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-primary btn-sm" onClick={() => showToast(`Using template: ${tpl.name}`)}>
              Use Template
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast(`Edit: ${tpl.name}`)}>
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function LlmCostsTab() {
  return (
    <div>
      {/* 5-stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Total MTD', value: '$213.70', color: 'var(--text)' },
          { label: 'GPT-4o Cost', value: '$89.20', color: 'var(--amber)' },
          { label: 'Claude Sonnet', value: '$124.50', color: 'var(--cyan)' },
          { label: 'Llama (free)', value: '$0', color: 'var(--green)' },
          { label: 'Budget Remaining', value: '$286.30', color: 'var(--green)' },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Usage table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Provider</th>
              <th>Calls</th>
              <th>Input Tokens</th>
              <th>Output Tokens</th>
              <th>Cost</th>
              <th>Budget %</th>
            </tr>
          </thead>
          <tbody>
            {LLM_COST_ROWS.map((row) => (
              <tr key={row.model}>
                <td style={{ fontWeight: 600 }}>{row.model}</td>
                <td>
                  <span className="pill" style={{ fontSize: '10px' }}>{row.provider}</span>
                </td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{row.calls.toLocaleString()}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{row.inputTok}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{row.outputTok}</td>
                <td style={{ fontWeight: 700, color: row.cost === '$0' ? 'var(--green)' : 'var(--text)' }}>{row.cost}</td>
                <td style={{ minWidth: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress" style={{ flex: 1, height: 5 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${row.budgetPct}%`,
                          background: row.budgetPct > 80 ? 'var(--red)' : row.budgetPct > 50 ? 'var(--amber)' : 'var(--green)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 28 }}>{row.budgetPct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ModelPerformanceTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {MODEL_PERF_CARDS.map((card) => (
        <div key={card.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{card.name}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{card.version}</div>
          </div>

          {/* 4-stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { label: 'Accuracy', value: card.stats.accuracy },
              { label: 'F1', value: card.stats.f1 },
              { label: 'AUC', value: card.stats.auc },
              { label: 'Precision', value: card.stats.precision },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: 'var(--bg3)',
                  borderRadius: 'var(--radius)',
                  padding: '8px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, color: 'var(--cyan)' }}>{s.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>

          {/* Confusion matrix */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Confusion Matrix
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text3)', textAlign: 'left', fontWeight: 600 }}></th>
                  <th style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text3)', textAlign: 'center', fontWeight: 600 }}>Pred Pos</th>
                  <th style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text3)', textAlign: 'center', fontWeight: 600 }}>Pred Neg</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>Actual Pos</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', background: 'var(--green-bg)', borderRadius: 'var(--radius)', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--green)' }}>
                    TP {card.confusion.tp.toLocaleString()}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', background: 'var(--red-bg)', borderRadius: 'var(--radius)', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--red)' }}>
                    FN {card.confusion.fn.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>Actual Neg</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', background: 'var(--amber-bg)', borderRadius: 'var(--radius)', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--amber)' }}>
                    FP {card.confusion.fp.toLocaleString()}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', background: 'var(--green-bg)', borderRadius: 'var(--radius)', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--green)' }}>
                    TN {card.confusion.tn.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Weekly trend bar chart */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Weekly Performance Trend
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
              {card.trend.map((val, i) => {
                const min = Math.min(...card.trend)
                const max = Math.max(...card.trend)
                const range = max - min || 1
                const heightPct = ((val - min) / range) * 30 + 10
                const isLast = i === card.trend.length - 1
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}px`,
                        background: isLast ? 'var(--cyan)' : 'var(--border)',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 200ms ease',
                      }}
                    />
                    <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
              <span>{card.trend[0].toFixed(1)}%</span>
              <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{card.trend[card.trend.length - 1].toFixed(1)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('MLOps')
  const [mlopsSubTab, setMlopsSubTab] = useState<MlopsSubTab>('Job Monitor')

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Training & Experiments
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          MLOps, experiment tracking, datasets, and hyperparameter tuning
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

      {/* MLOps */}
      {activeTab === 'MLOps' && (
        <div>
          {/* Top stats */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Active Jobs', value: '1', color: 'var(--cyan)' },
              { label: 'Completed Today', value: '3', color: 'var(--green)' },
              { label: 'GPU Utilization', value: '74%', color: 'var(--orange)' },
              { label: 'Queue Depth', value: '2', color: 'var(--text3)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* MLOps inner sub-tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
            {MLOPS_SUB_TABS.map((t) => (
              <button
                key={t}
                type="button"
                className={cn('btn btn-xs', mlopsSubTab === t ? 'btn-primary' : 'btn-ghost')}
                onClick={() => setMlopsSubTab(t)}
                style={{ marginBottom: -1, borderRadius: 'var(--radius) var(--radius) 0 0' }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Job Monitor */}
          {mlopsSubTab === 'Job Monitor' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>GPU</th>
                    <th>ETA</th>
                    <th>Started</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_JOBS.map((job) => (
                    <tr key={job.id}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{job.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <JobStatusIcon status={job.status} />
                          <span style={{ fontSize: 'var(--text-xs)', color: jobStatusColor(job.status), fontWeight: 600, textTransform: 'capitalize' }}>
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress" style={{ flex: 1, height: 5 }}>
                            <div
                              className="progress-fill"
                              style={{
                                width: `${job.progress}%`,
                                background: job.status === 'failed' ? 'var(--red)' : job.status === 'completed' ? 'var(--green)' : 'var(--cyan)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 28 }}>{job.progress}%</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>{job.gpu}</td>
                      <td style={{ color: 'var(--text2)' }}>{job.eta}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{job.started}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Logs for ${job.name}`)}>
                            <FileText size={11} /> View Logs
                          </button>
                          {job.status === 'running' && (
                            // TODO: Replace with RTK Query mutation — dispatch to real API endpoint
                            <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Cancelling ${job.name}…`)}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Task Templates */}
          {mlopsSubTab === 'Task Templates' && <TaskTemplatesTab />}

          {/* LLM Costs */}
          {mlopsSubTab === 'LLM Costs' && <LlmCostsTab />}

          {/* Model Performance */}
          {mlopsSubTab === 'Model Performance' && <ModelPerformanceTab />}
        </div>
      )}

      {/* Experiments */}
      {activeTab === 'Experiments' && (
        <div>
          <div style={{ marginBottom: 14, fontSize: 'var(--text-xs)', color: 'var(--text3)', fontStyle: 'italic' }}>
            Experiment tracking powered by MLflow / W&amp;B integration
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Experiment</th>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>F1</th>
                  <th>AUC</th>
                  <th>Key Params</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EXPERIMENTS.map((exp) => (
                  <tr
                    key={exp.id}
                    style={{ background: exp.status === 'champion' ? 'var(--green-bg)' : undefined }}
                  >
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>
                      {exp.status === 'champion' && (
                        <Star size={11} style={{ color: 'var(--green)', display: 'inline', marginRight: 4 }} />
                      )}
                      {exp.name}
                    </td>
                    <td>{exp.model}</td>
                    <td style={{ fontWeight: 600 }}>{(exp.accuracy * 100).toFixed(1)}%</td>
                    <td>{(exp.f1 * 100).toFixed(1)}%</td>
                    <td style={{ fontWeight: 600, color: 'var(--cyan)' }}>{(exp.auc * 100).toFixed(1)}%</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
                      {Object.entries(exp.params).map(([k, v]) => `${k}=${v}`).join(', ')}
                    </td>
                    <td>
                      <span className={expStatusClass(exp.status)} style={{ fontSize: '10px' }}>
                        {exp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {exp.status !== 'champion' && (
                          // TODO: Replace with RTK Query mutation — dispatch to real API endpoint
                          <button className="btn btn-xs btn-primary" onClick={() => showToast(`Promoted ${exp.name} to champion`)}>
                            Promote
                          </button>
                        )}
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast('Experiment details coming soon')}>
                          View
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

      {/* Datasets */}
      {activeTab === 'Datasets' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Version</th>
                <th>Size</th>
                <th>Train</th>
                <th>Val</th>
                <th>Test</th>
                <th>Created</th>
                <th>Lineage Source</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DATASETS.map((d) => (
                <tr key={d.name}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{d.name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>{d.version}</td>
                  <td style={{ fontWeight: 600 }}>{d.size}</td>
                  <td style={{ color: 'var(--green)' }}>{d.trainSplit}</td>
                  <td style={{ color: 'var(--amber)' }}>{d.valSplit}</td>
                  <td style={{ color: 'var(--cyan)' }}>{d.testSplit}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>{d.created}</td>
                  <td>
                    <span className="pill" style={{ fontSize: '10px' }}>{d.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Training Pipelines */}
      {activeTab === 'Training Pipelines' && (
        <div>
          {/* TODO: Replace with Kubeflow/Airflow API — see src/app/services/api.ts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(PIPELINE_STATUSES).map(([pipelineName, statuses]) => (
              <div key={pipelineName} className="card">
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 16 }}>
                  {pipelineName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
                  {PIPELINE_STEPS.map((step, si) => {
                    const status = statuses[si]
                    const color = status === 'done' ? 'var(--green)' : status === 'running' ? 'var(--cyan)' : 'var(--bg4)'
                    const textColor = status === 'pending' ? 'var(--text3)' : '#fff'
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: status === 'pending' ? '2px solid var(--border)' : 'none' }} />
                          <div
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius)',
                              background: color,
                              color: textColor,
                              fontSize: '11px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              border: status === 'pending' ? '1px solid var(--border)' : 'none',
                            }}
                          >
                            {step}
                          </div>
                        </div>
                        {si < PIPELINE_STEPS.length - 1 && (
                          <div style={{ width: 24, height: 2, background: status === 'done' ? 'var(--green)' : 'var(--border)', flexShrink: 0 }} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                  <button className="btn btn-primary btn-sm" onClick={() => showToast(`Running ${pipelineName}…`)}>
                    <Play size={12} /> Run
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => showToast('Logs coming soon')}>View Logs</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hyperparameter Tuning */}
      {activeTab === 'Hyperparameter Tuning' && (
        <div>
          {/* Summary */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Trials Completed', value: '48', color: 'var(--text)' },
              { label: 'Best AUC', value: '0.923', color: 'var(--green)' },
              { label: 'Search Strategy', value: 'TPE', color: 'var(--cyan)' },
              { label: 'Time Elapsed', value: '2h 14m', color: 'var(--text3)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Parameter ranges */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
              Search Space
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { param: 'learning_rate', range: '[0.001, 0.1]', type: 'log-uniform' },
                { param: 'max_depth', range: '[3, 10]', type: 'int' },
                { param: 'n_estimators', range: '[100, 1000]', type: 'int' },
              ].map((p) => (
                <div key={p.param} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {p.param}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                    {p.range} · {p.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top trials table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
              Top Trials (by AUC)
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trial</th>
                  <th>Learning Rate</th>
                  <th>Max Depth</th>
                  <th>N Estimators</th>
                  <th>AUC Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HPO_TRIALS.map((t) => (
                  <tr
                    key={t.trial}
                    style={{ background: t.status === 'best' ? 'var(--green-bg)' : undefined }}
                  >
                    <td style={{ fontWeight: 600 }}>
                      {t.status === 'best' && <Star size={11} style={{ color: 'var(--green)', display: 'inline', marginRight: 4 }} />}
                      #{t.trial}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{t.lr}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{t.depth}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{t.n_est}</td>
                    <td style={{ fontWeight: 700, color: t.status === 'best' ? 'var(--green)' : 'var(--text)' }}>
                      {t.score.toFixed(3)}
                    </td>
                    <td>
                      <span className={t.status === 'best' ? 'pill pill-green' : 'pill'} style={{ fontSize: '10px' }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
