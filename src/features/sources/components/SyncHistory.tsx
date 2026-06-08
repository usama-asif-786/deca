import { MOCK_SYNC_HISTORY } from '@/lib/mockData'
import Pill from '@/components/common/Pill'

export default function SyncHistory() {
  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 12 }}>
        Recent Sync Events
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Time</th>
              <th style={{ textAlign: 'right' }}>Rows</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SYNC_HISTORY.map((ev, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                  {ev.source}
                </td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{ev.time}</td>
                <td style={{ textAlign: 'right', fontSize: 'var(--text-sm)', fontVariantNumeric: 'tabular-nums' }}>
                  {ev.rows}
                </td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{ev.duration}</td>
                <td>
                  {ev.status === 'ok' && <Pill variant="green">OK</Pill>}
                  {ev.status === 'warn' && <Pill variant="amber">Warning</Pill>}
                  {ev.status === 'error' && <Pill variant="red">Error</Pill>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
