import { useState } from 'react'
import { ChevronDown, ChevronUp, BellOff } from 'lucide-react'
import type { Alert } from '@/lib/mockData'
import { cn } from '@/lib/utils'
import AlertDetailPanel from './AlertDetailPanel'

interface AlertItemProps {
  alert: Alert
  isExpanded: boolean
  onExpand: (id: string) => void
  onSnooze: (id: string, duration: string) => void
}

const SEV_COLOR: Record<Alert['severity'], string> = {
  critical: 'var(--red)',
  warn: 'var(--amber)',
  info: 'var(--cyan)',
}

export default function AlertItem({ alert, isExpanded, onExpand, onSnooze }: AlertItemProps) {
  const dotColor = SEV_COLOR[alert.severity]

  return (
    <div
      className={cn('alert-item', isExpanded && 'expanded')}
      style={{ opacity: alert.snoozed ? 0.55 : 1 }}
    >
      <div
        className="alert-item-row"
        onClick={() => onExpand(alert.id)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        {/* Severity dot */}
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
            boxShadow: alert.severity === 'critical' ? `0 0 6px ${dotColor}66` : 'none',
          }}
        />

        {/* Title + desc */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {alert.title}
            {alert.snoozed && (
              <BellOff size={11} style={{ marginLeft: 6, color: 'var(--text3)', display: 'inline' }} />
            )}
          </div>
          {!isExpanded && (
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text3)',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {alert.desc}
            </div>
          )}
        </div>

        {/* Source + time */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2,
            flexShrink: 0,
          }}
        >
          {alert.source && (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text3)',
                background: 'var(--bg3)',
                padding: '1px 7px',
                borderRadius: 100,
              }}
            >
              {alert.source}
            </span>
          )}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{alert.time}</span>
        </div>

        {/* Expand icon */}
        <span style={{ color: 'var(--text3)', flexShrink: 0 }}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {/* Detail panel */}
      {isExpanded && (
        <AlertDetailPanel
          alert={alert}
          onClose={() => onExpand(alert.id)}
          onSnooze={onSnooze}
        />
      )}
    </div>
  )
}
