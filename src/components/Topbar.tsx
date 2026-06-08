'use client'

import React, { useState } from 'react'

interface TopbarProps {
  title?: string
}

const notifications = [
  { id: 1, title: 'New data source connected', message: 'PostgreSQL connection established', type: 'success' },
  { id: 2, title: 'Model training complete', message: 'Model-v2.1 is ready for deployment', type: 'success' },
  { id: 3, title: 'Alert threshold breached', message: 'Data quality score dropped below 85%', type: 'warning' },
  { id: 4, title: 'System maintenance scheduled', message: 'Scheduled for 2:00 AM UTC tomorrow', type: 'info' },
]

export function Topbar({ title = 'Dashboard' }: TopbarProps) {
  const [bellOpen, setBellOpen] = useState(false)
  const [theme, setTheme] = useState('dark')

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    document.documentElement.classList.toggle('dark', theme === 'light')
  }

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." className="search-field" />
        </div>

        <button className="btn-tour" title="Platform Tour">
          🎯 Tour
        </button>

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle light/dark theme">
          ☯
        </button>

        <div className="bell-wrap">
          <button className="bell-btn" onClick={() => setBellOpen(!bellOpen)}>
            🔔
            <span className="bell-badge">4</span>
          </button>

          {bellOpen && (
            <div className="bell-dropdown">
              {notifications.map((notif) => (
                <div key={notif.id} className="notif-item">
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-message">{notif.message}</div>
                    <span className={`notif-badge notif-badge-${notif.type}`}>{notif.type}</span>
                  </div>
                  <button className="notif-close">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}