import { Bell, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { markRead, markAllRead } from '@/app/slices/notificationSlice'
import { cn } from '@/lib/utils'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const notifications = useAppSelector((s) => s.notifications.notifications)
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button
        className="bell-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="bell-badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="bell-dropdown" role="dialog" aria-label="Notifications">
          <div
            className="flex items-center justify-between"
            style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}
          >
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Notifications</span>
            <div className="flex gap-6 items-center">
              {unreadCount > 0 && (
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={() => dispatch(markAllRead())}
                  style={{ fontSize: 'var(--text-xs)', padding: '2px 8px' }}
                >
                  Mark all read
                </button>
              )}
              <button
                className="bell-btn"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                style={{ padding: 2 }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn('notif-item', !n.read && 'unread')}
                onClick={() => dispatch(markRead(n.id))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') dispatch(markRead(n.id)) }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: n.type === 'error' ? 'var(--red)' : n.type === 'warn' ? 'var(--amber)' : n.type === 'success' ? 'var(--green)' : 'var(--cyan)',
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <div>
                    <div>{n.text}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
