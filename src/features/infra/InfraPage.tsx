import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Server, Network, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'

const TABS = ['Deployment', 'Network Intelligence', 'Chaos Testing']

// TODO: Replace with Kubernetes API / Helm deployment API — see src/app/services/api.ts
const MOCK_DEPLOYMENTS = [
  { name: 'api-gateway', image: 'fulcrum/gateway:2.4.1', replicas: '3/3', cpu: 42, memory: 68, uptime: '99.98%', status: 'healthy' },
  { name: 'ml-serving', image: 'fulcrum/mlserving:1.8.0', replicas: '2/2', cpu: 74, memory: 82, uptime: '99.95%', status: 'healthy' },
  { name: 'data-pipeline', image: 'fulcrum/pipeline:3.1.2', replicas: '4/4', cpu: 88, memory: 91, uptime: '99.82%', status: 'degraded' },
  { name: 'feature-store', image: 'fulcrum/features:2.0.1', replicas: '2/2', cpu: 31, memory: 55, uptime: '100%', status: 'healthy' },
  { name: 'auth-service', image: 'fulcrum/auth:1.2.4', replicas: '1/2', cpu: 12, memory: 34, uptime: '98.14%', status: 'degraded' },
]

// TODO: Replace with network monitoring WebSocket — see src/app/services/api.ts
const MOCK_NETWORK = [
  { service: 'api-gateway → ml-serving', latency: '12ms', latencyVal: 12, throughput: '4.2K rps', errors: '0.02%', errorsVal: 0.02, status: 'healthy' },
  { service: 'data-pipeline → feature-store', latency: '8ms', latencyVal: 8, throughput: '12.4K rps', errors: '0.00%', errorsVal: 0, status: 'healthy' },
  { service: 'api-gateway → data-pipeline', latency: '94ms', latencyVal: 94, throughput: '892 rps', errors: '1.24%', errorsVal: 1.24, status: 'degraded' },
  { service: 'ml-serving → feature-store', latency: '4ms', latencyVal: 4, throughput: '8.1K rps', errors: '0.01%', errorsVal: 0.01, status: 'healthy' },
]

// TODO: Replace with chaos engineering platform API (e.g. LitmusChaos, Gremlin) — see src/app/services/api.ts
const MOCK_CHAOS_EXPERIMENTS = [
  { name: 'Pod Failure — ml-serving', type: 'Pod Kill', target: 'ml-serving', status: 'completed', result: 'Service recovered in 8s', date: 'Apr 18' },
  { name: 'Network Latency — api-gateway', type: 'Network Chaos', target: 'api-gateway', status: 'completed', result: 'P99 increased to 340ms, no errors', date: 'Apr 15' },
  { name: 'Memory Stress — data-pipeline', type: 'Stress Test', target: 'data-pipeline', status: 'scheduled', result: '—', date: 'Apr 22' },
]

const BLAST_RADIUS_OPTIONS = ['Single Pod', 'Service', 'Namespace', 'Cluster']

function statusDot(status: string) {
  const color = status === 'healthy' ? 'var(--green)' : status === 'degraded' ? 'var(--amber)' : 'var(--red)'
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 6 }} />
}

function latencyColor(ms: number): string {
  if (ms <= 20) return 'var(--green)'
  if (ms <= 60) return 'var(--amber)'
  return 'var(--red)'
}

function errorColor(pct: number): string {
  if (pct === 0) return 'var(--green)'
  if (pct < 0.5) return 'var(--amber)'
  return 'var(--red)'
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

export default function InfraPage() {
  const [activeTab, setActiveTab] = useState('Deployment')
  const [blastRadius, setBlastRadius] = useState('Single Pod')

  const totalPods = MOCK_DEPLOYMENTS.reduce((acc, d) => {
    const [ready, total] = d.replicas.split('/').map(Number)
    return { ready: acc.ready + ready, total: acc.total + total }
  }, { ready: 0, total: 0 })

  const avgCpu = Math.round(MOCK_DEPLOYMENTS.reduce((acc, d) => acc + d.cpu, 0) / MOCK_DEPLOYMENTS.length)
  const avgMem = Math.round(MOCK_DEPLOYMENTS.reduce((acc, d) => acc + d.memory, 0) / MOCK_DEPLOYMENTS.length)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Infrastructure
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          Kubernetes deployments, network intelligence, and chaos testing
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

      {/* Deployment */}
      {activeTab === 'Deployment' && (
        <div>
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Total Pods', value: `${totalPods.ready}/${totalPods.total}`, color: totalPods.ready === totalPods.total ? 'var(--green)' : 'var(--amber)', icon: Server },
              { label: 'CPU Avg', value: `${avgCpu}%`, color: avgCpu > 80 ? 'var(--amber)' : 'var(--cyan)', icon: Zap },
              { label: 'Memory Avg', value: `${avgMem}%`, color: avgMem > 85 ? 'var(--red)' : 'var(--cyan)', icon: Server },
              { label: 'SLO Uptime', value: '99.9%', color: 'var(--green)', icon: CheckCircle2 },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <s.icon size={11} style={{ color: s.color }} />
                  {s.label}
                </div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Image</th>
                  <th>Replicas</th>
                  <th>CPU</th>
                  <th>Memory</th>
                  <th>Uptime</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DEPLOYMENTS.map((d) => (
                  <tr key={d.name}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>
                      {statusDot(d.status)}
                      {d.name}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{d.image}</td>
                    <td style={{ fontWeight: 600, color: d.replicas.split('/')[0] === d.replicas.split('/')[1] ? 'var(--green)' : 'var(--amber)' }}>
                      {d.replicas}
                    </td>
                    <td style={{ minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress" style={{ flex: 1, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${d.cpu}%`, background: d.cpu > 80 ? 'var(--amber)' : 'var(--cyan)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 28 }}>{d.cpu}%</span>
                      </div>
                    </td>
                    <td style={{ minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress" style={{ flex: 1, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${d.memory}%`, background: d.memory > 85 ? 'var(--red)' : 'var(--cyan)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 28 }}>{d.memory}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: parseFloat(d.uptime) >= 99.9 ? 'var(--green)' : 'var(--amber)' }}>{d.uptime}</td>
                    <td>
                      <span className={d.status === 'healthy' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Scaling ${d.name}…`)}>Scale</button>
                        <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Rolling back ${d.name}…`)}>Rollback</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Network Intelligence */}
      {activeTab === 'Network Intelligence' && (
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Route</th>
                  <th>Latency</th>
                  <th>Throughput</th>
                  <th>Error Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_NETWORK.map((n) => (
                  <tr key={n.service}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>
                      <Network size={11} style={{ display: 'inline', marginRight: 5, color: 'var(--text3)' }} />
                      {n.service}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: latencyColor(n.latencyVal) }}>
                      {n.latency}
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{n.throughput}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: errorColor(n.errorsVal) }}>
                      {n.errors}
                    </td>
                    <td>
                      <span className={n.status === 'healthy' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                        {n.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-xs btn-ghost" onClick={() => showToast(`Tracing ${n.service}…`)}>Trace</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Latency Heatmap */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
              Latency Heatmap
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${MOCK_DEPLOYMENTS.length}, 1fr)`, gap: 4, alignItems: 'center' }}>
              <div />
              {MOCK_DEPLOYMENTS.map((d) => (
                <div key={d.name} style={{ fontSize: '10px', color: 'var(--text3)', textAlign: 'center', fontWeight: 600, padding: '0 4px' }}>
                  {d.name.replace('-', '\n')}
                </div>
              ))}
              {MOCK_DEPLOYMENTS.map((rowDep, ri) => (
                <div key={rowDep.name} style={{ display: 'contents' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', paddingRight: 8 }}>{rowDep.name}</div>
                  {MOCK_DEPLOYMENTS.map((colDep, ci) => {
                    if (ri === ci) {
                      return <div key={colDep.name} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text3)' }}>—</div>
                    }
                    const routeLatency = MOCK_NETWORK.find(
                      (n) => n.service.includes(rowDep.name) && n.service.includes(colDep.name),
                    )
                    const latVal = routeLatency?.latencyVal ?? Math.floor(Math.random() * 100) + 5
                    const bg = latVal <= 20 ? 'var(--green-bg)' : latVal <= 60 ? 'var(--amber-bg)' : 'var(--red-bg)'
                    const color = latVal <= 20 ? 'var(--green)' : latVal <= 60 ? 'var(--amber)' : 'var(--red)'
                    return (
                      <div key={colDep.name} style={{ background: bg, borderRadius: 'var(--radius)', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color }}>
                        {latVal}ms
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chaos Testing */}
      {activeTab === 'Chaos Testing' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, marginBottom: 16 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Experiment</th>
                    <th>Type</th>
                    <th>Target</th>
                    <th>Status</th>
                    <th>Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CHAOS_EXPERIMENTS.map((e) => (
                    <tr key={e.name}>
                      <td style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>{e.name}</td>
                      <td>
                        <span className="pill" style={{ fontSize: '10px' }}>{e.type}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{e.target}</td>
                      <td>
                        <span className={e.status === 'completed' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.result}
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{e.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Run experiment panel */}
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                <AlertTriangle size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--red)' }} />
                Run Experiment
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Experiment Type</label>
                <select className="form-input">
                  <option>Pod Kill</option>
                  <option>Network Chaos</option>
                  <option>Stress Test</option>
                  <option>I/O Chaos</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Target Service</label>
                <select className="form-input">
                  {MOCK_DEPLOYMENTS.map((d) => (
                    <option key={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Blast Radius</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {BLAST_RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      className={cn('btn btn-xs', blastRadius === opt ? 'btn-primary' : 'btn-ghost')}
                      onClick={() => setBlastRadius(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', background: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={() => showToast('Chaos experiment started — monitor results carefully!')}
              >
                Run Experiment
              </button>
              <p style={{ fontSize: '10px', color: 'var(--text3)', marginTop: 8, textAlign: 'center' }}>
                Blast radius: {blastRadius} · Production-safe mode enabled
              </p>
            </div>
          </div>

          {/* Result summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Experiments Run', value: '12', icon: Zap, color: 'var(--cyan)' },
              { label: 'Mean Recovery Time', value: '11.2s', icon: CheckCircle2, color: 'var(--green)' },
              { label: 'Failed SLO During Chaos', value: '1', icon: AlertTriangle, color: 'var(--amber)' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <s.icon size={24} style={{ color: s.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{s.value}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
