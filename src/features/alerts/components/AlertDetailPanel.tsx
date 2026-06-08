import { useState } from 'react'
import type { Alert } from '@/lib/mockData'
import { BellOff, ExternalLink, Clock, Activity, X } from 'lucide-react'
import Pill from '@/components/common/Pill'

interface AlertDetailPanelProps {
  alert: Alert
  onClose: () => void
  onSnooze: (id: string, duration: string) => void
}

const SNOOZE_OPTIONS = ['15 min', '1 hour', '4 hours', '24 hours', '1 week']

const severityToVariant: Record<Alert['severity'], 'red' | 'amber' | 'cyan'> = {
  critical: 'red',
  warn: 'amber',
  info: 'cyan',
}

export default function AlertDetailPanel({ alert, onClose, onSnooze }: AlertDetailPanelProps) {
  const [snoozeOpen, setSnoozeOpen] = useState(false)

  return (
    <div className="alert-detail-panel">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-8">
          <Pill variant={severityToVariant[alert.severity]}>
            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
          </Pill>
          {alert.snoozed && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <BellOff size={11} /> Snoozed
            </span>
          )}
        </div>
        <button
          className="btn btn-ghost btn-xs"
          onClick={onClose}
          aria-label="Close detail panel"
          style={{ padding: '2px 6px' }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{alert.title}</div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', lineHeight: 1.55, marginBottom: 14 }}>
        {alert.desc}
      </div>

      {/* Meta rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {alert.source && (
          <div className="flex items-center gap-8" style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
            <ExternalLink size={11} />
            <span>Source: <strong style={{ color: 'var(--text2)' }}>{alert.source}</strong></span>
          </div>
        )}
        {alert.metric && (
          <div className="flex items-center gap-8" style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
            <Activity size={11} />
            <span>Metric: <strong style={{ color: 'var(--text2)' }}>{alert.metric}</strong></span>
            {alert.threshold && (
              <span>· Threshold: <strong style={{ color: 'var(--text2)' }}>{alert.threshold}</strong></span>
            )}
          </div>
        )}
        <div className="flex items-center gap-8" style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
          <Clock size={11} />
          <span>Fired {alert.time}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-8" style={{ position: 'relative' }}>
        <button className="btn btn-sm btn-primary">Acknowledge</button>

        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setSnoozeOpen((p) => !p)}
          >
            <BellOff size={13} />
            Snooze
          </button>

          {snoozeOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '4px 0',
                minWidth: 130,
                zIndex: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              }}
            >
              {SNOOZE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onSnooze(alert.id, opt)
                    setSnoozeOpen(false)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 14px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-sm btn-ghost">Dismiss</button>
      </div>
    </div>
  )
}
