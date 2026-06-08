import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Globe, Lock, Coins, Cpu, Network, Shield } from 'lucide-react'

const TABS = [
  'FL Overview', 'Aggregation', 'Privacy & Security', 'Personalization',
  'Smart Contracts', 'zkML', 'DAO & Tokens', 'DePIN Compute', 'ASI Stack', 'Network Effect',
]

// TODO: Replace with federated learning orchestration API — see src/app/services/api.ts
const MOCK_FL_NODES = [
  { id: 'node-1', name: 'EU Cluster', location: 'Frankfurt', flag: 'DE', status: 'active', dataPoints: 48291, lastUpdate: '2 min ago', contribution: 34 },
  { id: 'node-2', name: 'US East', location: 'Virginia', flag: 'US', status: 'active', dataPoints: 62441, lastUpdate: '1 min ago', contribution: 44 },
  { id: 'node-3', name: 'APAC Node', location: 'Singapore', flag: 'SG', status: 'syncing', dataPoints: 31102, lastUpdate: '5 min ago', contribution: 22 },
  { id: 'node-4', name: 'UK Node', location: 'London', flag: 'GB', status: 'offline', dataPoints: 0, lastUpdate: '2 hr ago', contribution: 0 },
]

// TODO: Replace with blockchain/smart contract API (Ethereum/Polygon) — see src/app/services/api.ts
const MOCK_CONTRACTS = [
  { name: 'FederatedReward.sol', address: '0x1a2b3c4d5e6f...', network: 'Polygon', stake: '1,000 MATIC', lastExec: '2 min ago' },
  { name: 'ModelGovernance.sol', address: '0xdeadbeef1234...', network: 'Ethereum', stake: '0.5 ETH', lastExec: '1 hr ago' },
  { name: 'DataPrivacy.sol', address: '0xcafebabe9876...', network: 'Polygon', stake: '500 MATIC', lastExec: '6 hr ago' },
]

// TODO: Replace with ZK proof generation API (e.g. EZKL, Noir) — see src/app/services/api.ts
const MOCK_ZK_STATS = [
  { label: 'Proof Time', value: '4.2s', color: 'var(--cyan)' },
  { label: 'Verification Time', value: '0.03s', color: 'var(--green)' },
  { label: 'Circuit Size', value: '1.4M gates', color: 'var(--text)' },
  { label: 'Proofs Generated', value: '1,204', color: 'var(--purple)' },
]

const MOCK_PROPOSALS = [
  { id: 'prop-001', title: 'Increase differential privacy budget to ε=0.15', votes: { yes: 824, no: 312 }, status: 'active', deadline: 'Apr 25, 2026' },
  { id: 'prop-002', title: 'Add Singapore node as voting member', votes: { yes: 1102, no: 88 }, status: 'passed', deadline: 'Apr 10, 2026' },
  { id: 'prop-003', title: 'Allocate 5% treasury to node incentives', votes: { yes: 647, no: 411 }, status: 'active', deadline: 'Apr 28, 2026' },
]

const MOCK_DEPIN = [
  { provider: 'Node-1 Cluster', gpu: 'A100 x 8', pricePerHr: '$2.40', availability: '98%', status: 'available' },
  { provider: 'CloudMiner Pro', gpu: 'V100 x 16', pricePerHr: '$1.80', availability: '95%', status: 'available' },
  { provider: 'DeepCompute EU', gpu: 'A100 x 4', pricePerHr: '$2.10', availability: '88%', status: 'busy' },
  { provider: 'ASI Alliance Node', gpu: 'H100 x 4', pricePerHr: '$3.20', availability: '99%', status: 'available' },
]

const MOCK_ASI_AGENTS = [
  { role: 'Orchestrator', name: 'FulcrumOrchestrator', tasks: 48, completed: 47, status: 'active' },
  { role: 'Sub-agent', name: 'DataPreprocessor', tasks: 182, completed: 182, status: 'idle' },
  { role: 'Sub-agent', name: 'FeatureEngineer', tasks: 96, completed: 94, status: 'active' },
  { role: 'Tool', name: 'SQLExecutor', tasks: 412, completed: 412, status: 'idle' },
  { role: 'Tool', name: 'APIConnector', tasks: 289, completed: 287, status: 'active' },
]

function nodeStatusClass(status: string): string {
  switch (status) {
    case 'active': return 'pill pill-green'
    case 'syncing': return 'pill pill-amber'
    case 'offline': return 'pill pill-red'
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

export default function FederatedPage() {
  const [activeTab, setActiveTab] = useState('FL Overview')

  const totalDataPoints = MOCK_FL_NODES.reduce((acc, n) => acc + n.dataPoints, 0)
  const activeNodes = MOCK_FL_NODES.filter((n) => n.status === 'active').length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Federated & Decentralized
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
          Privacy-preserving federated learning across distributed nodes
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

      {/* FL Overview */}
      {activeTab === 'FL Overview' && (
        <div>
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Active Nodes', value: String(activeNodes), color: 'var(--green)' },
              { label: 'Total Data Points', value: totalDataPoints.toLocaleString(), color: 'var(--cyan)' },
              { label: 'Global Round', value: '47', color: 'var(--text)' },
              { label: 'Model Accuracy', value: '89.4%', color: 'var(--orange)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Data Points</th>
                  <th>Last Update</th>
                  <th>Contribution</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FL_NODES.map((node) => (
                  <tr key={node.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Globe size={13} style={{ display: 'inline', marginRight: 6, color: 'var(--text3)' }} />
                      {node.name}
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{node.location}</td>
                    <td>
                      <span className={nodeStatusClass(node.status)} style={{ fontSize: '10px' }}>{node.status}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{node.dataPoints.toLocaleString()}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{node.lastUpdate}</td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ flex: 1, height: 5 }}>
                          <div className="progress-fill" style={{ width: `${node.contribution}%`, background: 'var(--cyan)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 24 }}>{node.contribution}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aggregation */}
      {activeTab === 'Aggregation' && (
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
              FedAvg Algorithm — Round 47
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              {[
                { label: 'Round Progress', value: '3/4 nodes aggregated', progress: 75 },
                { label: 'Gradient Convergence', value: '0.0021 loss delta', progress: 91 },
              ].map((m) => (
                <div key={m.label} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>
                    <span>{m.label}</span>
                    <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{m.value}</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${m.progress}%`, background: 'var(--cyan)' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Aggregation Method', value: 'FedAvg' },
                { label: 'Rounds Completed', value: '46' },
                { label: 'ETA Next Round', value: '8 min' },
                { label: 'Gradient Clip', value: '1.0' },
                { label: 'Learning Rate', value: '0.001' },
                { label: 'Batch Size', value: '256' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Security */}
      {activeTab === 'Privacy & Security' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                <Lock size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--purple)' }} />
                Differential Privacy
              </div>
              {[
                { label: 'Privacy Budget (ε)', value: '0.1', status: 'Tight (Recommended)' },
                { label: 'Delta (δ)', value: '1e-5', status: 'Standard' },
                { label: 'Noise Mechanism', value: 'Gaussian', status: 'Active' },
                { label: 'Clipping Norm', value: '1.0', status: 'Active' },
              ].map((p) => (
                <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text3)' }}>{p.label}</span>
                  <span>
                    <strong style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{p.value}</strong>
                    <span style={{ marginLeft: 8, color: 'var(--green)' }}>{p.status}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                <Shield size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--green)' }} />
                Compliance Checks
              </div>
              {[
                { label: 'GDPR Article 25 (Privacy by Design)', pass: true },
                { label: 'Secure Aggregation Protocol', pass: true },
                { label: 'Homomorphic Encryption', pass: false },
                { label: 'Data Minimization', pass: true },
                { label: 'Right to Erasure', pass: true },
              ].map((c) => (
                <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ color: 'var(--text2)' }}>{c.label}</span>
                  <span className={c.pass ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                    {c.pass ? 'Pass' : 'Partial'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Personalization */}
      {activeTab === 'Personalization' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>Local Accuracy</th>
                <th>Global Accuracy</th>
                <th>Personalization Gain</th>
                <th>Fine-tune Rounds</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FL_NODES.filter((n) => n.status !== 'offline').map((node) => {
                const localAcc = 89 + Math.random() * 6
                const globalAcc = 89.4
                return (
                  <tr key={node.id}>
                    <td style={{ fontWeight: 600 }}>{node.name}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>{localAcc.toFixed(1)}%</td>
                    <td>{globalAcc}%</td>
                    <td style={{ color: 'var(--cyan)' }}>+{(localAcc - globalAcc).toFixed(1)}%</td>
                    <td>5</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Smart Contracts */}
      {activeTab === 'Smart Contracts' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
            Deployed Contracts
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Address</th>
                <th>Network</th>
                <th>Stake</th>
                <th>Last Execution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTRACTS.map((c) => (
                <tr key={c.name}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{c.address}</td>
                  <td>
                    <span className="pill pill-purple" style={{ fontSize: '10px' }}>{c.network}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.stake}</td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{c.lastExec}</td>
                  <td>
                    {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                    <button className="btn btn-xs btn-ghost" onClick={() => showToast('Contract interaction coming soon')}>
                      Interact
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* zkML */}
      {activeTab === 'zkML' && (
        <div>
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {MOCK_ZK_STATS.map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
              Recent Proof Generations
            </div>
            {[
              { id: 'proof-001', model: 'churn_predictor v3.2', status: 'verified', time: '3.9s', size: '2.1 MB', date: '2 min ago' },
              { id: 'proof-002', model: 'ltv_estimator v1.8', status: 'verified', time: '4.8s', size: '1.8 MB', date: '1 hr ago' },
              { id: 'proof-003', model: 'support_classifier v2.1', status: 'pending', time: '—', size: '—', date: 'Generating…' },
            ].map((p) => (
              <div key={p.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, flex: 1 }}>{p.model}</span>
                <span className={p.status === 'verified' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>{p.status}</span>
                <span style={{ color: 'var(--text3)', minWidth: 40 }}>{p.time}</span>
                <span style={{ color: 'var(--text3)', minWidth: 50 }}>{p.size}</span>
                <span style={{ color: 'var(--text3)' }}>{p.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAO & Tokens */}
      {activeTab === 'DAO & Tokens' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                <Coins size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--amber)' }} />
                Token Distribution
              </div>
              {[
                { label: 'Node Operators', pct: 40, color: 'var(--cyan)' },
                { label: 'Treasury', pct: 30, color: 'var(--green)' },
                { label: 'Core Team', pct: 20, color: 'var(--orange)' },
                { label: 'Community', pct: 10, color: 'var(--purple)' },
              ].map((t) => (
                <div key={t.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 4 }}>
                    <span>{t.label}</span>
                    <span style={{ fontWeight: 700, color: t.color }}>{t.pct}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${t.pct}%`, background: t.color }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                Treasury Balance: <strong style={{ color: 'var(--text)' }}>2,480,000 FHT</strong>
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                Governance Proposals
              </div>
              {MOCK_PROPOSALS.map((p) => {
                const total = p.votes.yes + p.votes.no
                const yesPct = Math.round((p.votes.yes / total) * 100)
                return (
                  <div key={p.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{p.title}</div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span className={p.status === 'active' ? 'pill pill-blue' : 'pill pill-green'} style={{ fontSize: '10px' }}>{p.status}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Closes: {p.deadline}</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${yesPct}%`, background: 'var(--green)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text3)', marginTop: 3 }}>
                      <span style={{ color: 'var(--green)' }}>Yes: {p.votes.yes.toLocaleString()}</span>
                      <span style={{ color: 'var(--red)' }}>No: {p.votes.no.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* DePIN Compute */}
      {activeTab === 'DePIN Compute' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>GPU Type</th>
                <th>Price/hr</th>
                <th>Availability</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DEPIN.map((d) => (
                <tr key={d.provider}>
                  <td style={{ fontWeight: 600 }}>{d.provider}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{d.gpu}</td>
                  <td style={{ fontWeight: 600, color: 'var(--green)' }}>{d.pricePerHr}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress" style={{ flex: 1, height: 5 }}>
                        <div className="progress-fill" style={{ width: d.availability, background: 'var(--green)' }} />
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', minWidth: 28 }}>{d.availability}</span>
                    </div>
                  </td>
                  <td>
                    <span className={d.status === 'available' ? 'pill pill-green' : 'pill pill-amber'} style={{ fontSize: '10px' }}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    {/* TODO: Replace with RTK Query mutation — dispatch to real API endpoint */}
                    <button className="btn btn-xs btn-primary" onClick={() => showToast(`Provisioning ${d.gpu} from ${d.provider}…`)}>
                      <Cpu size={10} /> Provision
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ASI Stack */}
      {activeTab === 'ASI Stack' && (
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Agent Name</th>
                  <th>Tasks Assigned</th>
                  <th>Completed</th>
                  <th>Success Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ASI_AGENTS.map((a) => {
                  const rate = Math.round((a.completed / a.tasks) * 100)
                  return (
                    <tr key={a.name}>
                      <td>
                        <span className={a.role === 'Orchestrator' ? 'pill pill-purple' : a.role === 'Sub-agent' ? 'pill pill-blue' : 'pill'} style={{ fontSize: '10px' }}>
                          {a.role}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{a.name}</td>
                      <td>{a.tasks}</td>
                      <td style={{ color: 'var(--green)' }}>{a.completed}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress" style={{ flex: 1, height: 5 }}>
                            <div className="progress-fill" style={{ width: `${rate}%`, background: 'var(--green)' }} />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--green)', minWidth: 28 }}>{rate}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={a.status === 'active' ? 'pill pill-green' : 'pill'} style={{ fontSize: '10px' }}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Network Effect */}
      {activeTab === 'Network Effect' && (
        <div>
          {/* TODO: Replace with network graph API — see src/app/services/api.ts */}
          <div className="stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              { label: 'Total Nodes', value: '4', color: 'var(--text)' },
              { label: 'Connections', value: '12', color: 'var(--cyan)' },
              { label: 'Network Growth', value: '+33% QoQ', color: 'var(--green)' },
              { label: 'Data Velocity', value: '141K pts/sync', color: 'var(--orange)' },
            ].map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 16 }}>
              <Network size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--cyan)' }} />
              Node Connection Map
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {MOCK_FL_NODES.map((node) => (
                <div
                  key={node.id}
                  style={{
                    background: node.status === 'active' ? 'var(--cyan-bg)' : node.status === 'syncing' ? 'var(--amber-bg)' : 'var(--bg3)',
                    borderRadius: 'var(--radius)',
                    padding: '14px',
                    textAlign: 'center',
                    border: `1px solid ${node.status === 'active' ? 'var(--cyan)33' : 'var(--border)'}`,
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🌐</div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text)', marginBottom: 4 }}>{node.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: 6 }}>{node.location}</div>
                  <span className={nodeStatusClass(node.status)} style={{ fontSize: '10px' }}>{node.status}</span>
                  {node.status !== 'offline' && (
                    <div style={{ marginTop: 8, fontSize: '10px', color: 'var(--text3)' }}>
                      {node.contribution}% contribution
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
