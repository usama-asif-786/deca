import type { DataSource } from '@/lib/mockData'
import { MOCK_TENANTS } from '@/lib/mockData'
import SourceStatusBadge from './SourceStatusBadge'
import SourceHealthIndicator from './SourceHealthIndicator'
import { RefreshCw, Clock } from 'lucide-react'

interface SourceCardProps {
  source: DataSource
}

export default function SourceCard({ source }: SourceCardProps) {
  const tenant = MOCK_TENANTS.find((t) => t.id === source.tenant)

  return (
    <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top row: icon + name + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: source.bg,
            color: source.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {source.abbr}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>
            {source.name}
          </div>
          {source.label && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{source.label}</div>
          )}
        </div>
        <SourceStatusBadge connected={source.connected} />
      </div>

      {/* Meta */}
      {source.connected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {source.rows !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Rows</span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text2)' }}>
                {source.rows.toLocaleString()}
              </span>
            </div>
          )}
          {source.lastSync && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={10} /> Last sync
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{source.lastSync}</span>
            </div>
          )}
          {source.nextSync && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={10} /> Next sync
              </span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: source.nextSync === 'Overdue' ? 'var(--red)' : 'var(--text2)',
                  fontWeight: source.nextSync === 'Overdue' ? 600 : 400,
                }}
              >
                {source.nextSync}
              </span>
            </div>
          )}
          {source.health !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Health</span>
              <SourceHealthIndicator health={source.health} />
            </div>
          )}
        </div>
      )}

      {/* Footer: type + tenant */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text3)',
            background: 'var(--bg3)',
            padding: '1px 8px',
            borderRadius: 100,
          }}
        >
          {source.type}
        </span>
        {tenant && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{tenant.name}</span>
        )}
      </div>
    </div>
  )
}
