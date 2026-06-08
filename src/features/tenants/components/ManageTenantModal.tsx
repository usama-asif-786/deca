import { useState, useEffect } from 'react'
import { X, Check, ChevronRight, ChevronLeft, Star, Trash2, Plus } from 'lucide-react'
import type { Tenant } from '@/lib/mockData'

// ─── TODO: Replace with RTK Query mutation response type ───────────────────────
interface ManageTenantModalProps {
  open: boolean
  tenant: Tenant | null
  onClose: () => void
  onSaved: (updated: Partial<Tenant>) => void
}

type PlanId = 'starter' | 'growth' | 'scale' | 'enterprise'

interface Manager {
  name: string
  role: string
  email: string
  title: string
  phone: string
  since: string
}

interface ManageState {
  step: 1 | 2 | 3 | 4 | 5
  // Step 1 - Company
  company: string
  legal: string
  industry: string
  size: string
  region: string
  country: string
  domain: string
  website: string
  tax: string
  color: string
  // Step 2 - People
  fname: string
  lname: string
  email: string
  title: string
  phone: string
  role: string
  managers: Manager[]
  // Step 3 - Plan
  plan: PlanId
  billingCycle: string
  paymentMethod: string
  // Step 4 - Workspace
  strictIsolation: boolean
  separateOntology: boolean
  crossTenant: boolean
  sharedTemplates: boolean
  syncFreq: string
  llmProvider: string
  retention: string
  timezone: string
  onboardTemplate: boolean
  sampleDash: boolean
  onboardCall: boolean
  dedicatedCSM: boolean
}

const PLAN_PRICES: Record<PlanId, number> = {
  starter: 99,
  growth: 499,
  scale: 999,
  enterprise: 2499,
}

const PLAN_SOURCES: Record<PlanId, number> = {
  starter: 5,
  growth: 15,
  scale: 30,
  enterprise: 100,
}

const PLAN_STORAGE: Record<PlanId, number> = {
  starter: 10,
  growth: 50,
  scale: 100,
  enterprise: 500,
}

const PLAN_API: Record<PlanId, number> = {
  starter: 25000,
  growth: 200000,
  scale: 500000,
  enterprise: 999999,
}

const PLANS = [
  {
    id: 'starter' as PlanId,
    name: 'Starter',
    price: 99,
    sources: 5,
    users: 5,
    storage: 10,
    api: 25000,
    features: ['5 data sources', 'Basic mapping', 'Email alerts', 'CSV export'],
  },
  {
    id: 'growth' as PlanId,
    name: 'Growth',
    price: 499,
    sources: 15,
    users: 25,
    storage: 50,
    api: 200000,
    features: ['15 data sources', 'Data management + AI', 'Slack + email alerts', 'API access', 'Custom dashboards'],
  },
  {
    id: 'scale' as PlanId,
    name: 'Scale',
    price: 999,
    sources: 30,
    users: 50,
    storage: 100,
    api: 500000,
    features: ['30 data sources', 'Full ontology pipeline', 'Write-back', 'MLOps', 'Priority support'],
  },
  {
    id: 'enterprise' as PlanId,
    name: 'Enterprise',
    price: 2499,
    sources: 100,
    users: 999,
    storage: 500,
    api: 999999,
    features: ['Unlimited sources', 'Knowledge graph', 'BYOLLM', 'SSO/SAML', 'Dedicated support', 'SLA 99.9%', 'Custom contracts'],
  },
]

const STEP_LABELS = [
  'Company Info',
  'People',
  'Plan & Billing',
  'Workspace Config',
  'Review & Save',
]

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function normalizePlanId(planStr: string): PlanId {
  const lower = planStr.toLowerCase()
  if (lower === 'starter') return 'starter'
  if (lower === 'growth') return 'growth'
  if (lower === 'scale') return 'scale'
  return 'enterprise'
}

function buildInitialState(tenant: Tenant): ManageState {
  const ownerParts = tenant.owner.split(' ')
  const fname = ownerParts[0] ?? ''
  const lname = ownerParts.slice(1).join(' ')

  return {
    step: 1,
    company: tenant.name,
    legal: '',
    industry: tenant.industry,
    size: '',
    region: tenant.region,
    country: '',
    domain: tenant.domain ?? '',
    website: '',
    tax: '',
    color: tenant.color,
    fname,
    lname,
    email: tenant.ownerEmail,
    title: tenant.ownerTitle ?? '',
    phone: tenant.ownerPhone ?? '',
    role: 'Workspace Admin',
    managers: (tenant.managers ?? []).map((m) => ({
      name: m.name,
      role: m.role,
      email: m.email,
      title: m.title ?? '',
      phone: m.phone ?? '',
      since: m.since,
    })),
    plan: normalizePlanId(tenant.plan),
    billingCycle: 'Monthly',
    paymentMethod: tenant.billing.paymentMethod,
    strictIsolation: true,
    separateOntology: true,
    crossTenant: false,
    sharedTemplates: false,
    syncFreq: 'Every 1 hour',
    llmProvider: 'Platform Default Claude Sonnet',
    retention: '1 year',
    timezone: 'America/New_York EST',
    onboardTemplate: true,
    sampleDash: true,
    onboardCall: false,
    dedicatedCSM: false,
  }
}

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {STEP_LABELS.map((_, i) => {
          const idx = i + 1
          const isDone = idx < step
          const isActive = idx === step
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--bg4)',
                transition: 'background 0.2s',
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {STEP_LABELS.map((label, i) => {
          const idx = i + 1
          const isDone = idx < step
          const isActive = idx === step
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                fontSize: 'var(--text-xs)',
                textAlign: 'center',
                color: isDone ? 'var(--green)' : isActive ? 'var(--text)' : 'var(--text3)',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FieldError({ msg }: { msg: string }) {
  return (
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--red)', marginTop: 2, display: 'block' }}>
      {msg}
    </span>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text2)' }}>{value}</span>
    </div>
  )
}

// ─── Step 1: Company Info ──────────────────────────────────────────────────────
function Step1({
  state,
  set,
  errors,
}: {
  state: ManageState
  set: (patch: Partial<ManageState>) => void
  errors: Record<string, string>
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Company Name *</label>
          <input
            className="form-input"
            style={errors.company ? { borderColor: 'var(--red)' } : {}}
            value={state.company}
            onChange={(e) => set({ company: e.target.value })}
            placeholder="Acme Corp"
          />
          {errors.company && <FieldError msg={errors.company} />}
        </div>
        <div className="form-group">
          <label className="form-label">Legal Entity Name</label>
          <input
            className="form-input"
            value={state.legal}
            onChange={(e) => set({ legal: e.target.value })}
            placeholder="Acme Corporation Ltd."
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Industry *</label>
          <select
            className="form-input"
            style={errors.industry ? { borderColor: 'var(--red)' } : {}}
            value={state.industry}
            onChange={(e) => set({ industry: e.target.value })}
          >
            <option value="">Select industry…</option>
            <option>SaaS / Technology</option>
            <option>Manufacturing</option>
            <option>Energy / Oil &amp; Gas</option>
            <option>Financial Services</option>
            <option>Healthcare</option>
            <option>Logistics / Supply Chain</option>
            <option>Retail / E-commerce</option>
            <option>Media / Entertainment</option>
            <option>Education</option>
            <option>Government</option>
            <option>Other</option>
          </select>
          {errors.industry && <FieldError msg={errors.industry} />}
        </div>
        <div className="form-group">
          <label className="form-label">Company Size</label>
          <select
            className="form-input"
            value={state.size}
            onChange={(e) => set({ size: e.target.value })}
          >
            <option value="">Select size…</option>
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>201-1000</option>
            <option>1000-5000</option>
            <option>5000+</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Region *</label>
          <select
            className="form-input"
            style={errors.region ? { borderColor: 'var(--red)' } : {}}
            value={state.region}
            onChange={(e) => set({ region: e.target.value })}
          >
            <option value="">Select region…</option>
            <option>North America</option>
            <option>Europe Western</option>
            <option>Europe DACH</option>
            <option>Europe UK</option>
            <option>Middle East</option>
            <option>Asia Pacific</option>
            <option>Latin America</option>
            <option>Africa</option>
          </select>
          {errors.region && <FieldError msg={errors.region} />}
        </div>
        <div className="form-group">
          <label className="form-label">Country</label>
          <select
            className="form-input"
            value={state.country}
            onChange={(e) => set({ country: e.target.value })}
          >
            <option value="">Select country…</option>
            <option>United States</option>
            <option>Canada</option>
            <option>UK</option>
            <option>Germany</option>
            <option>France</option>
            <option>UAE</option>
            <option>Saudi Arabia</option>
            <option>Japan</option>
            <option>Australia</option>
            <option>Brazil</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Company Domain *</label>
          <input
            className="form-input"
            style={errors.domain ? { borderColor: 'var(--red)' } : {}}
            value={state.domain}
            onChange={(e) => set({ domain: e.target.value })}
            placeholder="acmecorp.com"
          />
          {errors.domain && <FieldError msg={errors.domain} />}
        </div>
        <div className="form-group">
          <label className="form-label">Website</label>
          <input
            className="form-input"
            value={state.website}
            onChange={(e) => set({ website: e.target.value })}
            placeholder="https://acmecorp.com"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tax ID / VAT Number</label>
        <input
          className="form-input"
          value={state.tax}
          onChange={(e) => set({ tax: e.target.value })}
          placeholder="US12-3456789 or EU123456789"
        />
      </div>

      {/* Brand color picker */}
      <div className="form-group">
        <label className="form-label">Brand Color</label>
        <div className="flex items-center gap-8">
          <input
            type="color"
            value={state.color}
            onChange={(e) => set({ color: e.target.value })}
            style={{ width: 48, height: 32, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4 }}
          />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{state.color}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Add Manager Form ──────────────────────────────────────────────────────────
interface AddManagerFormState {
  name: string
  email: string
  role: string
  title: string
  phone: string
}

function AddManagerForm({
  onAdd,
  onCancel,
}: {
  onAdd: (m: Manager) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<AddManagerFormState>({
    name: '',
    email: '',
    role: 'Co-Admin',
    title: '',
    phone: '',
  })
  const [errs, setErrs] = useState<Record<string, string>>({})

  function handleAdd() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.role) e.role = 'Role is required'
    if (Object.keys(e).length > 0) { setErrs(e); return }
    onAdd({ ...form, since: 'Apr 2026' })
  }

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 12,
        marginTop: 8,
        background: 'var(--bg3)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          color: 'var(--text3)',
          marginBottom: 10,
        }}
      >
        Add Manager
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            style={errs.name ? { borderColor: 'var(--red)' } : {}}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Jane Smith"
          />
          {errs.name && <FieldError msg={errs.name} />}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Email *</label>
          <input
            className="form-input"
            style={errs.email ? { borderColor: 'var(--red)' } : {}}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="jane@company.com"
          />
          {errs.email && <FieldError msg={errs.email} />}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Role *</label>
          <select
            className="form-input"
            style={errs.role ? { borderColor: 'var(--red)' } : {}}
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            <option>Co-Admin</option>
            <option>Technical Lead</option>
            <option>Billing Contact</option>
            <option>Read-Only Auditor</option>
          </select>
          {errs.role && <FieldError msg={errs.role} />}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Title</label>
          <input
            className="form-input"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="CTO"
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-xs" onClick={handleAdd}>
          <Plus size={12} />
          Add Manager
        </button>
        <button className="btn btn-ghost btn-xs" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: People ────────────────────────────────────────────────────────────
function Step2({
  state,
  set,
  errors,
  onToast,
}: {
  state: ManageState
  set: (patch: Partial<ManageState>) => void
  errors: Record<string, string>
  onToast: (msg: string) => void
}) {
  const [showAddManager, setShowAddManager] = useState(false)

  const ROLE_COLORS: Record<string, string> = {
    'Co-Admin': 'var(--amber)',
    'Technical Lead': 'var(--green)',
    'Billing Contact': 'var(--cyan)',
    'Read-Only Auditor': 'var(--red)',
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function handleAddManager(m: Manager) {
    set({ managers: [...state.managers, m] })
    setShowAddManager(false)
  }

  function handleRemoveManager(idx: number) {
    set({ managers: state.managers.filter((_, i) => i !== idx) })
  }

  function handleChangeManagerRole(idx: number, role: string) {
    const updated = state.managers.map((m, i) => (i === idx ? { ...m, role } : m))
    set({ managers: updated })
  }

  return (
    <div>
      {/* Primary Owner Box */}
      <div
        style={{
          border: '1px solid var(--cyan)',
          borderRadius: 'var(--radius-lg)',
          padding: 14,
          marginBottom: 16,
          background: 'var(--bg3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            className="pill pill-cyan"
            style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.5px' }}
          >
            PRIMARY OWNER
          </span>
          <span className="pill pill-blue">{state.role}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">First Name *</label>
            <input
              className="form-input"
              style={errors.fname ? { borderColor: 'var(--red)' } : {}}
              value={state.fname}
              onChange={(e) => set({ fname: e.target.value })}
              placeholder="Jane"
            />
            {errors.fname && <FieldError msg={errors.fname} />}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Last Name *</label>
            <input
              className="form-input"
              style={errors.lname ? { borderColor: 'var(--red)' } : {}}
              value={state.lname}
              onChange={(e) => set({ lname: e.target.value })}
              placeholder="Smith"
            />
            {errors.lname && <FieldError msg={errors.lname} />}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email *</label>
            <input
              className="form-input"
              style={errors.email ? { borderColor: 'var(--red)' } : {}}
              type="email"
              value={state.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="jane@company.com"
            />
            {errors.email && <FieldError msg={errors.email} />}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={state.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="VP of Data"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={state.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="+1 555 000 0000"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => onToast('Password reset email sent to ' + state.email)}
          >
            Send Password Reset
          </button>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => onToast('Welcome email resent to ' + state.email)}
          >
            Resend Welcome Email
          </button>
        </div>
      </div>

      {/* Managers section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
            Additional Managers ({state.managers.length})
          </span>
          <button
            className="btn btn-primary btn-xs"
            onClick={() => setShowAddManager(true)}
          >
            <Plus size={12} />
            Add Manager
          </button>
        </div>

        {state.managers.length === 0 && !showAddManager && (
          <div
            style={{
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius)',
              padding: '14px 16px',
              textAlign: 'center',
              color: 'var(--text3)',
              fontSize: 'var(--text-sm)',
            }}
          >
            No additional managers
          </div>
        )}

        {state.managers.map((mgr, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '10px 12px',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--bg3)',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: ROLE_COLORS[mgr.role] ?? 'var(--text3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {getInitials(mgr.name)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                  {mgr.name}
                </span>
                <span
                  className="pill"
                  style={{
                    background: ROLE_COLORS[mgr.role] ? ROLE_COLORS[mgr.role] + '22' : 'var(--bg4)',
                    color: ROLE_COLORS[mgr.role] ?? 'var(--text3)',
                    fontSize: 10,
                    padding: '1px 7px',
                  }}
                >
                  {mgr.role}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                {mgr.email}
                {mgr.title && <span> · {mgr.title}</span>}
              </div>
            </div>

            {/* Role change */}
            <select
              className="form-input"
              style={{ width: 'auto', padding: '3px 8px', fontSize: 'var(--text-xs)', minHeight: 26 }}
              value={mgr.role}
              onChange={(e) => handleChangeManagerRole(idx, e.target.value)}
            >
              <option>Co-Admin</option>
              <option>Technical Lead</option>
              <option>Billing Contact</option>
              <option>Read-Only Auditor</option>
            </select>

            {/* Promote */}
            <button
              className="btn btn-ghost btn-xs"
              title="Promote to Owner"
              onClick={() => onToast(`${mgr.name} promoted to Primary Owner (pending confirmation)`)}
              style={{ padding: '3px 8px' }}
            >
              <Star size={12} />
            </button>

            {/* Remove */}
            <button
              className="btn btn-ghost btn-xs"
              title="Remove"
              onClick={() => handleRemoveManager(idx)}
              style={{ padding: '3px 8px', color: 'var(--red)' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {showAddManager && (
          <AddManagerForm
            onAdd={handleAddManager}
            onCancel={() => setShowAddManager(false)}
          />
        )}

        {/* Role permissions legend */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 10,
            marginTop: 12,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {[
            { role: 'Co-Admin', color: 'var(--amber)', bg: 'var(--amber-bg)' },
            { role: 'Technical Lead', color: 'var(--green)', bg: 'var(--green-bg)' },
            { role: 'Billing Contact', color: 'var(--cyan)', bg: 'var(--cyan-bg)' },
            { role: 'Read-Only Auditor', color: 'var(--red)', bg: 'var(--red-bg)' },
          ].map(({ role, color, bg }) => (
            <span
              key={role}
              className="pill"
              style={{ background: bg, color, fontSize: 'var(--text-xs)' }}
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Plan & Billing ────────────────────────────────────────────────────
function Step3({
  state,
  set,
  tenant,
}: {
  state: ManageState
  set: (patch: Partial<ManageState>) => void
  tenant: Tenant
}) {
  const selectedPlan = PLANS.find((p) => p.id === state.plan)!

  return (
    <div>
      {/* Current MRR */}
      <div
        style={{
          background: 'var(--green-bg)',
          border: '1px solid var(--green)',
          borderRadius: 'var(--radius)',
          padding: '8px 12px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 'var(--text-sm)',
        }}
      >
        <span style={{ color: 'var(--text3)' }}>Current MRR:</span>
        <span style={{ fontWeight: 700, color: 'var(--green)' }}>{tenant.mrr}</span>
        <span style={{ color: 'var(--text3)', marginLeft: 8 }}>Active plan: {tenant.billing.plan}</span>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {PLANS.map((plan) => {
          const isSelected = state.plan === plan.id
          return (
            <div
              key={plan.id}
              onClick={() => set({ plan: plan.id })}
              style={{
                border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: isSelected ? 'var(--bg4)' : 'var(--bg2)',
                borderRadius: 'var(--radius-lg)',
                padding: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 2 }}>
                {plan.name}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: isSelected ? 'var(--green)' : 'var(--text3)',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                ${plan.price}/mo
              </div>
              <ul style={{ padding: 0, listStyle: 'none' }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text2)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 4,
                      marginBottom: 3,
                    }}
                  >
                    <Check size={10} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Billing Cycle</label>
          <select
            className="form-input"
            value={state.billingCycle}
            onChange={(e) => set({ billingCycle: e.target.value })}
          >
            <option>Monthly</option>
            <option>Annual (save 20%)</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Payment Method</label>
          <select
            className="form-input"
            value={state.paymentMethod}
            onChange={(e) => set({ paymentMethod: e.target.value })}
          >
            <option>Credit Card</option>
            <option>Wire Transfer / Invoice</option>
            <option>SEPA Direct Debit</option>
            <option>Free Trial (14 days)</option>
          </select>
        </div>
      </div>

      {/* Plan limits info box */}
      <div
        style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 12,
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text3)',
            marginBottom: 8,
          }}
        >
          {selectedPlan.name} Plan Limits
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: 'Sources', value: selectedPlan.sources === 100 ? 'Unlimited' : String(selectedPlan.sources) },
            { label: 'Users', value: selectedPlan.users === 999 ? 'Unlimited' : String(selectedPlan.users) },
            { label: 'Storage', value: `${selectedPlan.storage} GB` },
            { label: 'API Calls', value: selectedPlan.api === 999999 ? 'Unlimited' : `${(selectedPlan.api / 1000).toFixed(0)}K/mo` },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Workspace Config ──────────────────────────────────────────────────
function Step4({
  state,
  set,
}: {
  state: ManageState
  set: (patch: Partial<ManageState>) => void
}) {
  return (
    <div>
      {/* Data Isolation */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 14,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text3)',
            marginBottom: 10,
          }}
        >
          Data Isolation
        </div>
        {(
          [
            { key: 'strictIsolation', label: 'Strict tenant isolation' },
            { key: 'separateOntology', label: 'Separate ontology' },
            { key: 'crossTenant', label: 'Cross-tenant benchmarking' },
            { key: 'sharedTemplates', label: 'Shared templates' },
          ] as { key: keyof ManageState; label: string }[]
        ).map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              color: 'var(--text2)',
            }}
          >
            <input
              type="checkbox"
              checked={state[key] as boolean}
              onChange={(e) => set({ [key]: e.target.checked } as Partial<ManageState>)}
              style={{ width: 14, height: 14, cursor: 'pointer' }}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Workspace Defaults */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text3)',
            marginBottom: 10,
          }}
        >
          Workspace Defaults
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Default Sync Frequency</label>
            <select
              className="form-input"
              value={state.syncFreq}
              onChange={(e) => set({ syncFreq: e.target.value })}
            >
              <option>Every 15 min</option>
              <option>Every 1 hour</option>
              <option>Every 6 hours</option>
              <option>Daily</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Default LLM Provider</label>
            <select
              className="form-input"
              value={state.llmProvider}
              onChange={(e) => set({ llmProvider: e.target.value })}
            >
              <option>Platform Default Claude Sonnet</option>
              <option>OpenAI GPT-4o</option>
              <option>BYOLLM</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Data Retention</label>
            <select
              className="form-input"
              value={state.retention}
              onChange={(e) => set({ retention: e.target.value })}
            >
              <option>30 days</option>
              <option>90 days</option>
              <option>1 year</option>
              <option>Unlimited</option>
              <option>Custom</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Timezone</label>
            <select
              className="form-input"
              value={state.timezone}
              onChange={(e) => set({ timezone: e.target.value })}
            >
              <option>UTC</option>
              <option>America/New_York EST</option>
              <option>Europe/Berlin CET</option>
              <option>Asia/Dubai GST</option>
              <option>Asia/Tokyo JST</option>
            </select>
          </div>
        </div>
      </div>

      {/* Onboarding */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 14,
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text3)',
            marginBottom: 10,
          }}
        >
          Onboarding
        </div>
        {(
          [
            { key: 'onboardTemplate', label: 'Apply industry template automatically' },
            { key: 'sampleDash', label: 'Create sample dashboard with demo data' },
            { key: 'onboardCall', label: 'Schedule onboarding call' },
            { key: 'dedicatedCSM', label: 'Assign dedicated CSM' },
          ] as { key: keyof ManageState; label: string }[]
        ).map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              color: 'var(--text2)',
            }}
          >
            <input
              type="checkbox"
              checked={state[key] as boolean}
              onChange={(e) => set({ [key]: e.target.checked } as Partial<ManageState>)}
              style={{ width: 14, height: 14, cursor: 'pointer' }}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Step 5: Review & Save ─────────────────────────────────────────────────────
function Step5({ state }: { state: ManageState }) {
  const plan = PLANS.find((p) => p.id === state.plan)!

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Company summary */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            background: 'var(--bg3)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--text3)',
              marginBottom: 8,
            }}
          >
            Company
          </div>
          <SummaryRow label="Name" value={state.company || '—'} />
          <SummaryRow label="Industry" value={state.industry || '—'} />
          <SummaryRow label="Region" value={state.region || '—'} />
          <SummaryRow label="Domain" value={state.domain || '—'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Brand Color</span>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                background: state.color,
                border: '1px solid var(--border)',
                marginLeft: 'auto',
              }}
            />
          </div>
        </div>

        {/* Admin User summary */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            background: 'var(--bg3)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--text3)',
              marginBottom: 8,
            }}
          >
            Primary Owner
          </div>
          <SummaryRow label="Name" value={`${state.fname} ${state.lname}`.trim() || '—'} />
          <SummaryRow label="Email" value={state.email || '—'} />
          <SummaryRow label="Title" value={state.title || '—'} />
          <SummaryRow label="Managers" value={String(state.managers.length)} />
        </div>
      </div>

      {/* Plan summary */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 14,
          background: 'var(--bg3)',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text3)',
            marginBottom: 8,
          }}
        >
          Plan &amp; Billing
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: 'var(--text-sm)' }}>
            {plan.name}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
            — ${plan.price}/mo
          </span>
        </div>
        <SummaryRow label="Billing Cycle" value={state.billingCycle} />
        <SummaryRow label="Payment" value={state.paymentMethod} />
      </div>

      {/* Save note */}
      <div
        style={{
          background: 'var(--amber-bg)',
          border: '1px solid var(--amber)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          fontSize: 'var(--text-sm)',
          color: 'var(--amber)',
          fontWeight: 600,
        }}
      >
        Changes will be applied immediately.
      </div>
    </div>
  )
}

// ─── Validation ────────────────────────────────────────────────────────────────
function validateStep(step: number, state: ManageState): Record<string, string> {
  const errs: Record<string, string> = {}
  if (step === 1) {
    if (!state.company.trim()) errs.company = 'Company name is required'
    if (!state.industry) errs.industry = 'Industry is required'
    if (!state.region) errs.region = 'Region is required'
    if (!state.domain.trim()) errs.domain = 'Company domain is required'
  }
  if (step === 2) {
    if (!state.fname.trim()) errs.fname = 'First name is required'
    if (!state.lname.trim()) errs.lname = 'Last name is required'
    if (!state.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errs.email = 'Enter a valid email'
  }
  return errs
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function ManageTenantModal({ open, tenant, onClose, onSaved }: ManageTenantModalProps) {
  const [state, setState] = useState<ManageState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (tenant && open) {
      setState(buildInitialState(tenant))
      setErrors({})
    }
  }, [tenant, open])

  if (!open || !tenant || !state) return null

  function set(patch: Partial<ManageState>) {
    setState((prev) => prev ? { ...prev, ...patch } : prev)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleNext() {
    if (!state) return
    const errs = validateStep(state.step, state)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    if (state.step < 5) set({ step: (state.step + 1) as ManageState['step'] })
  }

  function handleBack() {
    if (!state) return
    setErrors({})
    if (state.step > 1) set({ step: (state.step - 1) as ManageState['step'] })
  }

  function handleSave() {
    if (!state || !tenant) return
    // ─── TODO: Replace with RTK Query mutation — PATCH /api/tenants/:id ──────
    const updated: Partial<Tenant> = {
      name: state.company,
      industry: state.industry,
      region: state.region,
      color: state.color,
      owner: `${state.fname} ${state.lname}`,
      ownerEmail: state.email,
      ownerTitle: state.title,
      ownerPhone: state.phone,
      plan: capitalize(state.plan),
      domain: state.domain,
      billing: {
        ...tenant.billing,
        monthly: PLAN_PRICES[state.plan],
        plan: capitalize(state.plan),
        paymentMethod: state.paymentMethod,
      },
      usage: {
        ...tenant.usage,
        storageLimitGB: PLAN_STORAGE[state.plan],
        apiLimitMonth: PLAN_API[state.plan],
      },
      sourcesQuota: PLAN_SOURCES[state.plan],
      managers: state.managers.map((m) => ({
        name: m.name,
        role: m.role,
        email: m.email,
        title: m.title,
        phone: m.phone,
        since: m.since,
      })),
    }

    onSaved(updated)
    onClose()
  }

  function handleOverlayClose() {
    setErrors({})
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleOverlayClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Manage tenant: ${tenant.name}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          width: '90%',
          maxWidth: 700,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Toast */}
        {toast && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: 'var(--green)',
              color: '#fff',
              borderRadius: 'var(--radius)',
              padding: '8px 14px',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Check size={14} />
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            <h2
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                color: 'var(--text)',
                marginBottom: 2,
              }}
            >
              Manage Tenant
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
              {tenant.name} — Step {state.step} of 5 — {STEP_LABELS[state.step - 1]}
            </p>
          </div>
          <button
            className="btn btn-ghost btn-xs"
            onClick={handleOverlayClose}
            aria-label="Close modal"
            style={{ padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <StepIndicator step={state.step} />

        {/* Step content */}
        {state.step === 1 && <Step1 state={state} set={set} errors={errors} />}
        {state.step === 2 && (
          <Step2 state={state} set={set} errors={errors} onToast={showToast} />
        )}
        {state.step === 3 && <Step3 state={state} set={set} tenant={tenant} />}
        {state.step === 4 && <Step4 state={state} set={set} />}
        {state.step === 5 && <Step5 state={state} />}

        {/* Footer */}
        <div
          className="flex items-center justify-between"
          style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}
        >
          {state.step === 1 ? (
            <button className="btn btn-ghost btn-sm" onClick={handleOverlayClose}>
              Cancel
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={handleBack}>
              <ChevronLeft size={14} />
              Back
            </button>
          )}

          {state.step < 5 ? (
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              Next
              <ChevronRight size={14} />
            </button>
          ) : (
            <button className="btn btn-success btn-lg" onClick={handleSave}>
              <Check size={16} />
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
