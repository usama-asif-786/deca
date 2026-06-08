import type { DataSource } from '@/lib/mockData'
import { MOCK_TENANTS } from '@/lib/mockData'
import SourceStatusBadge from './SourceStatusBadge'
import SourceHealthIndicator from './SourceHealthIndicator'
import { RefreshCw } from 'lucide-react'

interface SourceTableProps {
  sources: DataSource[]
  onConnect?: (source: DataSource) => void
  onManage?: (source: DataSource) => void
}

export default function SourceTable({ sources, onConnect, onManage }: SourceTableProps) {
  if (sources.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>
        No sources match your current filters.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Type</th>
            <th>Status</th>
            <th>Tenant</th>
            <th style={{ textAlign: 'right' }}>Rows</th>
            <th>Last Sync</th>
            <th>Next Sync</th>
            <th style={{ textAlign: 'center' }}>Health</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sources.map((src) => {
            const tenant = MOCK_TENANTS.find((t) => t.id === src.tenant)
            return (
              <tr key={src.id}>
                {/* Source */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: src.bg,
                        color: src.fg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 10,
                        flexShrink: 0,
                      }}
                    >
                      {src.abbr}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>
                        {src.name}
                      </div>
                      {src.label && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{src.label}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text3)',
                      background: 'var(--bg3)',
                      padding: '1px 8px',
                      borderRadius: 100,
                    }}
                  >
                    {src.type}
                  </span>
                </td>

                {/* Status */}
                <td>
                  <SourceStatusBadge connected={src.connected} />
                </td>

                {/* Tenant */}
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                  {tenant ? tenant.name : <span style={{ opacity: 0.4 }}>—</span>}
                </td>

                {/* Rows */}
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {src.rows !== undefined ? (
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)' }}>
                      {src.rows.toLocaleString()}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text3)' }}>—</span>
                  )}
                </td>

                {/* Last Sync */}
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                  {src.lastSync ?? <span style={{ opacity: 0.4 }}>—</span>}
                </td>

                {/* Next Sync */}
                <td>
                  {src.nextSync ? (
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: src.nextSync === 'Overdue' ? 'var(--red)' : 'var(--text3)',
                        fontWeight: src.nextSync === 'Overdue' ? 700 : 400,
                      }}
                    >
                      {src.nextSync === 'Overdue' && (
                        <RefreshCw size={10} style={{ marginRight: 3, display: 'inline' }} />
                      )}
                      {src.nextSync}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text3)', opacity: 0.4 }}>—</span>
                  )}
                </td>

                {/* Health */}
                <td style={{ textAlign: 'center' }}>
                  {src.health !== undefined ? (
                    <SourceHealthIndicator health={src.health} />
                  ) : (
                    <span style={{ color: 'var(--text3)', opacity: 0.4 }}>—</span>
                  )}
                </td>

                {/* Action */}
                <td>
                  {src.connected ? (
                    <button className="btn btn-xs btn-ghost" onClick={(e) => { e.stopPropagation(); onManage?.(src) }}>
                      Manage
                    </button>
                  ) : (
                    <button className="btn btn-xs btn-primary" onClick={(e) => { e.stopPropagation(); onConnect?.(src) }}>
                      Connect
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
