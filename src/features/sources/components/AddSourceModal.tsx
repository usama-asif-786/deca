import ModalWrapper from '@/components/common/ModalWrapper'
import { CONNECTOR_CATALOG } from '@/lib/mockData'
import type { ConnectorCatalogItem, DataSource } from '@/lib/mockData'

interface AddSourceModalProps {
  open: boolean
  onClose: () => void
  existingSources: DataSource[]
  onAdd: (connector: ConnectorCatalogItem) => void
}

const TYPE_ORDER = ['Database', 'SaaS CRM', 'SaaS Payments', 'SaaS Accounting', 'SaaS Analytics', 'Data Warehouse', 'Spreadsheet', 'API', 'File']

export default function AddSourceModal({ open, onClose, existingSources, onAdd }: AddSourceModalProps) {
  const grouped: Record<string, ConnectorCatalogItem[]> = {}
  for (const c of CONNECTOR_CATALOG) {
    if (!grouped[c.type]) grouped[c.type] = []
    grouped[c.type].push(c)
  }

  const types = TYPE_ORDER.filter((t) => grouped[t])

  return (
    <ModalWrapper open={open} onClose={onClose} title="Add Data Source" size="lg">
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', marginBottom: 8 }}>
        Choose a connector type. You can add multiple instances of any connector.
      </p>

      {types.map((type) => (
        <div key={type}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 18, marginBottom: 8 }}>
            {type}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {grouped[type].map((c) => {
              const existing = existingSources.filter((s) => s.name === c.name).length
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onAdd(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', cursor: 'pointer',
                    background: 'var(--bg2)', textAlign: 'left',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, flexShrink: 0 }}>
                    {c.abbr}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{c.desc}</div>
                  </div>
                  {existing > 0 && (
                    <span className="pill pill-blue" style={{ fontSize: 10, flexShrink: 0 }}>{existing} added</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </ModalWrapper>
  )
}
