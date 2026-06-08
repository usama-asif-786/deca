import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Tag, Zap, GitMerge, BarChart2, PlusCircle } from 'lucide-react'

const TABS = ['Label Studio', 'Active Learning', 'Weak Supervision', 'Inter-Annotator']

const LABEL_CLASSES = ['bug', 'feature_request', 'access_issue', 'billing', 'other']

// TODO: Replace with RTK Query endpoint — see src/app/services/api.ts
const MOCK_LABEL_TASKS = [
  { id: 'lt-001', text: 'Customer reported billing discrepancy after upgrade', label: null as string | null, assignee: 'Lisa Chen' },
  { id: 'lt-002', text: 'Feature request: bulk export for enterprise accounts', label: 'feature_request' as string | null, assignee: 'Lisa Chen' },
  { id: 'lt-003', text: 'App crashes when uploading files > 100MB', label: 'bug' as string | null, assignee: 'Tom Baker' },
  { id: 'lt-004', text: 'Unable to access dashboard after password reset', label: 'access_issue' as string | null, assignee: 'Lisa Chen' },
  { id: 'lt-005', text: 'Integration with Salesforce stopped syncing yesterday', label: null as string | null, assignee: 'Raj Desai' },
]

// TODO: Replace with RTK Query — model uncertainty scores from ML backend — see src/app/services/api.ts
const MOCK_AL_ITEMS = [
  { text: 'Payment failed but subscription still active', uncertainty: 0.89, suggestedLabel: 'billing' },
  { text: 'Cannot download invoice from settings page', uncertainty: 0.82, suggestedLabel: 'bug' },
  { text: 'API rate limits seem lower than documented', uncertainty: 0.78, suggestedLabel: 'feature_request' },
]

// TODO: Replace with RTK Query for LF performance metrics — see src/app/services/api.ts
const MOCK_LFS = [
  { name: 'keyword_bug', rule: 'if "crash" or "error" or "broken" in text', coverage: '18%', accuracy: '91%', votes: 'bug', enabled: true },
  { name: 'keyword_billing', rule: 'if "invoice" or "payment" or "charge" in text', coverage: '12%', accuracy: '88%', votes: 'billing', enabled: true },
  { name: 'keyword_feature', rule: 'if "feature" or "request" or "would be nice" in text', coverage: '14%', accuracy: '84%', votes: 'feature_request', enabled: true },
]

const TOTAL_TASKS = 1204
const LABELED_TASKS = 847

const ANNOTATORS = ['Lisa Chen', 'Tom Baker', 'Raj Desai']

// Agreement heatmap data (mock)
// TODO: Replace with RTK Query for annotation agreement metrics — see src/app/services/api.ts
const AGREEMENT_MATRIX: number[][] = [
  [100, 88, 82, 79],
  [88, 100, 91, 75],
  [82, 91, 100, 83],
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

function labelPillClass(label: string): string {
  const map: Record<string, string> = {
    bug: 'pill pill-red',
    feature_request: 'pill pill-blue',
    access_issue: 'pill pill-amber',
    billing: 'pill pill-purple',
    other: 'pill',
  }
  return map[label] ?? 'pill'
}

function agreementColor(val: number): string {
  if (val >= 90) return 'var(--green-bg)'
  if (val >= 80) return 'var(--amber-bg)'
  return 'var(--red-bg)'
}

export default function LabelingPage() {
  const [activeTab, setActiveTab] = useState('Label Studio')
  const [taskLabels, setTaskLabels] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      MOCK_LABEL_TASKS.filter((t) => t.label !== null).map((t) => [t.id, t.label as string]),
    ),
  )
  const [lfEnabled, setLfEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_LFS.map((lf) => [lf.name, lf.enabled])),
  )

  const progress = Math.round((LABELED_TASKS / TOTAL_TASKS) * 100)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Data Labeling
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          Annotation workspace · Active learning · Weak supervision
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

      {/* Label Studio */}
      {activeTab === 'Label Studio' && (
        <div>
          {/* Progress */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                Labeling Progress
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>
                {LABELED_TASKS.toLocaleString()} / {TOTAL_TASKS.toLocaleString()} labeled
              </span>
            </div>
            <div className="progress" style={{ marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--green)' }} />
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
              <span><strong style={{ color: 'var(--amber)' }}>357</strong> Pending</span>
              <span><strong style={{ color: 'var(--cyan)' }}>48</strong> In Progress</span>
              <span><strong style={{ color: 'var(--purple)' }}>22</strong> In Review</span>
            </div>
          </div>

          {/* Task cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_LABEL_TASKS.map((task) => {
              const currentLabel = taskLabels[task.id] ?? task.label
              return (
                <div key={task.id} className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Tag size={14} style={{ color: 'var(--text3)', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 10, lineHeight: 1.5 }}>
                        {task.text}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                          Assigned: {task.assignee}
                        </span>
                        <span style={{ flex: 1 }} />
                        {currentLabel && (
                          <span className={labelPillClass(currentLabel)} style={{ fontSize: '10px' }}>
                            {currentLabel}
                          </span>
                        )}
                        {LABEL_CLASSES.map((cls) => (
                          <button
                            key={cls}
                            className={cn('btn btn-xs', currentLabel === cls ? 'btn-primary' : 'btn-ghost')}
                            onClick={() => {
                              // TODO: Replace with RTK Query mutation — dispatch to real API endpoint
                              setTaskLabels((prev) => ({ ...prev, [task.id]: cls }))
                              showToast(`Labeled as "${cls}"`)
                            }}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Learning */}
      {activeTab === 'Active Learning' && (
        <div>
          <div className="card" style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--cyan-bg)', border: '1px solid var(--cyan)33' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--cyan)', fontWeight: 600 }}>
              <Zap size={12} style={{ display: 'inline', marginRight: 4 }} />
              Active Learning — Items sorted by model uncertainty (highest = most informative to label)
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_AL_ITEMS.map((item, idx) => (
              <div key={idx} className="card">
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
                  {item.text}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>
                    <span>Uncertainty</span>
                    <span style={{ fontWeight: 700, color: 'var(--red)' }}>{(item.uncertainty * 100).toFixed(0)}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${item.uncertainty * 100}%`, background: 'var(--red)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                    Suggested:{' '}
                    <span className={labelPillClass(item.suggestedLabel)} style={{ fontSize: '10px' }}>
                      {item.suggestedLabel}
                    </span>
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                    <button className="btn btn-xs btn-primary" onClick={() => showToast(`Accepted: ${item.suggestedLabel}`)}>
                      Accept Suggestion
                    </button>
                    <button className="btn btn-xs btn-ghost" onClick={() => showToast('Override mode — select a label')}>
                      Override
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Supervision */}
      {activeTab === 'Weak Supervision' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Labeling Functions (LFs)</div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
              Heuristic rules that vote on label assignments. Combined using a generative model.
            </p>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>LF Name</th>
                  <th>Rule</th>
                  <th>Coverage</th>
                  <th>Accuracy</th>
                  <th>Label Vote</th>
                  <th>Enabled</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LFS.map((lf) => (
                  <tr key={lf.name}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{lf.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lf.rule}
                    </td>
                    <td style={{ fontWeight: 600 }}>{lf.coverage}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>{lf.accuracy}</td>
                    <td>
                      <span className={labelPillClass(lf.votes)} style={{ fontSize: '10px' }}>{lf.votes}</span>
                    </td>
                    <td>
                      {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                      <button
                        className={cn('btn btn-xs', lfEnabled[lf.name] ? 'btn-primary' : 'btn-ghost')}
                        onClick={() => setLfEnabled((prev) => ({ ...prev, [lf.name]: !prev[lf.name] }))}
                      >
                        {lfEnabled[lf.name] ? 'On' : 'Off'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Applying LFs to unlabeled data…')}>
              <GitMerge size={13} /> Apply LFs
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('Add LF dialog coming soon')}>
              <PlusCircle size={13} /> Add LF
            </button>
          </div>
        </div>
      )}

      {/* Inter-Annotator */}
      {activeTab === 'Inter-Annotator' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Kappa score */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Cohen's Kappa
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>0.84</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--green)', fontWeight: 600, marginTop: 8 }}>
                Strong Agreement
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 4 }}>
                Across 3 annotators · 847 samples
              </div>
            </div>

            {/* Agreement heatmap */}
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                <BarChart2 size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--cyan)' }} />
                Pairwise Agreement (%)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${ANNOTATORS.length}, 1fr)`, gap: 4, alignItems: 'center' }}>
                <div />
                {ANNOTATORS.map((a) => (
                  <div key={a} style={{ fontSize: '10px', color: 'var(--text3)', textAlign: 'center', fontWeight: 600 }}>
                    {a.split(' ')[0]}
                  </div>
                ))}
                {ANNOTATORS.slice(0, ANNOTATORS.length - 1).map((annotator, ri) => (
                  <div key={annotator} style={{ display: 'contents' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', paddingRight: 6 }}>
                      {annotator.split(' ')[0]}
                    </div>
                    {AGREEMENT_MATRIX[ri].map((val, ci) => (
                      <div
                        key={ci}
                        style={{
                          background: agreementColor(val),
                          borderRadius: 'var(--radius)',
                          padding: '6px 4px',
                          textAlign: 'center',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: val >= 90 ? 'var(--green)' : val >= 80 ? 'var(--amber)' : 'var(--red)',
                        }}
                      >
                        {val}%
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Annotator stats */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Annotator</th>
                  <th>Labeled</th>
                  <th>Accuracy vs Consensus</th>
                  <th>Avg Time/Label</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Lisa Chen', labeled: 412, accuracy: 94, avgTime: '18s', status: 'active' },
                  { name: 'Tom Baker', labeled: 281, accuracy: 91, avgTime: '24s', status: 'active' },
                  { name: 'Raj Desai', labeled: 154, accuracy: 88, avgTime: '31s', status: 'away' },
                ].map((a) => (
                  <tr key={a.name}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td>{a.labeled}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ flex: 1, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${a.accuracy}%`, background: 'var(--green)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--green)', minWidth: 28 }}>{a.accuracy}%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{a.avgTime}</td>
                    <td>
                      <span className={a.status === 'active' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                        {a.status}
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
