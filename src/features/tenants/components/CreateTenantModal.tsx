import { useState } from 'react'
import { X, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tenant } from '@/lib/mockData'

// ─── TODO: Replace with RTK Query mutation response type ───────────────────────
interface CreateTenantModalProps {
  open: boolean
  onClose: () => void
  onCreated: (tenant: Tenant) => void
}

type PlanId = 'starter' | 'growth' | 'scale' | 'enterprise'

interface RegState {
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
  // Step 2 - Admin User
  fname: string
  lname: string
  email: string
  title: string
  phone: string
  role: string
  sendInvite: boolean
  tempPass: boolean
  sso: boolean
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

// ─── TODO: Replace with real tenant color palette from design tokens ───────────
const TENANT_COLORS = [
  '#F54E00', '#2d6a4f', '#006778', '#6a4c93',
  '#9c6400', '#c62828', '#1e1f23', '#006778',
]

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
  'Admin User',
  'Plan & Billing',
  'Workspace Config',
  'Review & Create',
]

const INITIAL_STATE: RegState = {
  step: 1,
  company: '',
  legal: '',
  industry: '',
  size: '',
  region: '',
  country: '',
  domain: '',
  website: '',
  tax: '',
  fname: '',
  lname: '',
  email: '',
  title: '',
  phone: '',
  role: 'Workspace Admin',
  sendInvite: true,
  tempPass: true,
  sso: false,
  plan: 'growth',
  billingCycle: 'Monthly',
  paymentMethod: 'Credit Card',
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
  onboardCall: true,
  dedicatedCSM: false,
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
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
                background: isDone
                  ? 'var(--green)'
                  : isActive
                  ? 'var(--accent)'
                  : 'var(--bg4)',
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
                color: isDone
                  ? 'var(--green)'
                  : isActive
                  ? 'var(--text)'
                  : 'var(--text3)',
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

// ─── Reusable Field Error ──────────────────────────────────────────────────────
function FieldError({ msg }: { msg: string }) {
  return (
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--red)', marginTop: 2, display: 'block' }}>
      {msg}
    </span>
  )
}

// ─── Step 1: Company Info ──────────────────────────────────────────────────────
function Step1({
  state,
  set,
  errors,
}: {
  state: RegState
  set: (patch: Partial<RegState>) => void
  errors: Record<string, string>
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Company Name *</label>
          <input
            className={cn('form-input', errors.company && 'border-red-500')}
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
            className={cn('form-input')}
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
    </div>
  )
}

// ─── Step 2: Admin User ────────────────────────────────────────────────────────
function Step2({
  state,
  set,
  errors,
}: {
  state: RegState
  set: (patch: Partial<RegState>) => void
  errors: Record<string, string>
}) {
  return (
    <div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: 16 }}>
        Set up the primary admin who will own this tenant workspace.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
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
        <div className="form-group">
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

      <div className="form-group">
        <label className="form-label">Email Address *</label>
        <input
          className="form-input"
          style={errors.email ? { borderColor: 'var(--red)' } : {}}
          type="email"
          value={state.email}
          onChange={(e) => set({ email: e.target.value })}
          placeholder="jane@acmecorp.com"
        />
        {errors.email && <FieldError msg={errors.email} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Job Title</label>
          <input
            className="form-input"
            value={state.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="VP of Data"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            className="form-input"
            value={state.phone}
            onChange={(e) => set({ phone: e.target.value })}
            placeholder="+1 555 000 0000"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Role in Fulcrum</label>
        <select
          className="form-input"
          value={state.role}
          onChange={(e) => set({ role: e.target.value })}
        >
          <option>Workspace Admin</option>
          <option>Decision Maker</option>
          <option>Team Member</option>
        </select>
      </div>

      <div
        style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 14,
          marginTop: 4,
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
          Initial Access
        </div>
        {(
          [
            { key: 'sendInvite', label: 'Send welcome email with login instructions' },
            { key: 'tempPass', label: 'Generate temporary password (must change on first login)' },
            { key: 'sso', label: 'Enable SSO (configure after creation)' },
          ] as { key: keyof RegState; label: string }[]
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
              onChange={(e) => set({ [key]: e.target.checked } as Partial<RegState>)}
              style={{ width: 14, height: 14, cursor: 'pointer' }}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3: Plan & Billing ────────────────────────────────────────────────────
function Step3({
  state,
  set,
}: {
  state: RegState
  set: (patch: Partial<RegState>) => void
}) {
  const selectedPlan = PLANS.find((p) => p.id === state.plan)!

  return (
    <div>
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
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text)',
                  marginBottom: 2,
                }}
              >
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

      {/* Billing cycle + payment */}
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
            { label: 'Sources', value: selectedPlan.sources === 100 ? 'Unlimited' : selectedPlan.sources },
            { label: 'Users', value: selectedPlan.users === 999 ? 'Unlimited' : selectedPlan.users },
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
  state: RegState
  set: (patch: Partial<RegState>) => void
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
          ] as { key: keyof RegState; label: string }[]
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
              onChange={(e) => set({ [key]: e.target.checked } as Partial<RegState>)}
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
          ] as { key: keyof RegState; label: string }[]
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
              onChange={(e) => set({ [key]: e.target.checked } as Partial<RegState>)}
              style={{ width: 14, height: 14, cursor: 'pointer' }}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Step 5: Review & Create ───────────────────────────────────────────────────
function Step5({ state }: { state: RegState }) {
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
            Admin User
          </div>
          <SummaryRow label="Name" value={`${state.fname} ${state.lname}`.trim() || '—'} />
          <SummaryRow label="Email" value={state.email || '—'} />
          <SummaryRow label="Title" value={state.title || '—'} />
          <SummaryRow label="Role" value={state.role} />
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

      {/* Ready banner */}
      <div
        style={{
          background: 'var(--green-bg)',
          border: '1px solid var(--green)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          fontSize: 'var(--text-sm)',
          color: 'var(--green)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Check size={16} />
        Ready to create. The admin user will receive a welcome email with login instructions.
      </div>
    </div>
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

// ─── Validation ────────────────────────────────────────────────────────────────
function validateStep(step: number, state: RegState): Record<string, string> {
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
export default function CreateTenantModal({ open, onClose, onCreated }: CreateTenantModalProps) {
  const [state, setState] = useState<RegState>(INITIAL_STATE)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!open) return null

  function set(patch: Partial<RegState>) {
    setState((prev) => ({ ...prev, ...patch }))
  }

  function handleNext() {
    const errs = validateStep(state.step, state)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    if (state.step < 5) set({ step: (state.step + 1) as RegState['step'] })
  }

  function handleBack() {
    setErrors({})
    if (state.step > 1) set({ step: (state.step - 1) as RegState['step'] })
  }

  function handleCreate() {
    // ─── TODO: Replace with RTK Query mutation — POST /api/tenants ────────────
    const newTenant: Tenant = {
      id: `t-${Date.now()}`,
      name: state.company,
      industry: state.industry || 'Other',
      region: state.region || 'North America',
      plan: capitalize(state.plan),
      color: TENANT_COLORS[Math.floor(Math.random() * TENANT_COLORS.length)],
      users: 1,
      sourcesQuota: PLAN_SOURCES[state.plan],
      mrr: '$0',
      since: 'Apr 2026',
      status: 'active' as const,
      owner: `${state.fname} ${state.lname}`,
      ownerEmail: state.email,
      ownerTitle: state.title,
      ownerPhone: state.phone,
      managers: [],
      domain: state.domain,
      billing: {
        plan: capitalize(state.plan),
        monthly: PLAN_PRICES[state.plan],
        nextInvoice: 'May 1, 2026',
        paymentMethod: state.paymentMethod || 'Pending setup',
        autoRenew: true,
      },
      usage: {
        storageGB: 0,
        storageLimitGB: PLAN_STORAGE[state.plan],
        apiCalls: 0,
        apiLimitMonth: PLAN_API[state.plan],
        pipelineRuns: 0,
        lastLogin: 'Never',
      },
      alerts: [{ type: 'info' as const, msg: 'Welcome! Workspace created — ready for data source setup.', time: 'Just now' }],
      activity: [
        { action: 'Tenant workspace created', user: 'System', time: 'Just now' },
        { action: `Admin user provisioned: ${state.email}`, user: 'System', time: 'Just now' },
      ],
    }

    onCreated(newTenant)
    setState(INITIAL_STATE)
    onClose()
  }

  function handleOverlayClose() {
    setState(INITIAL_STATE)
    setErrors({})
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleOverlayClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Create new tenant"
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
        }}
      >
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
              New Tenant
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
              Step {state.step} of 5 — {STEP_LABELS[state.step - 1]}
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
        {state.step === 2 && <Step2 state={state} set={set} errors={errors} />}
        {state.step === 3 && <Step3 state={state} set={set} />}
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
            <button className="btn btn-success btn-lg" onClick={handleCreate}>
              <Check size={16} />
              Create Tenant
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
