'use client'

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const sections = [
  {
    title: 'Insights',
    items: [
      { label: 'Dashboard', icon: '📊', href: '/' },
      { label: 'Monitoring & Alerts', icon: '🔔', href: '/alerts' },
      { label: 'Ask AI', icon: '✨', href: '/chat' },
      { label: 'Data Cards', icon: '📇', href: '/tasks' },
    ],
  },
  {
    title: 'Data',
    items: [
      { label: 'Tenants & Privacy', icon: '🏠', href: '/tenants' },
      { label: 'Data Connectors', icon: '🔌', href: '/connectors' },
      { label: 'Data Management', icon: '⚙️', href: '/management' },
      { label: 'Catalog & Lineage', icon: '📚', href: '/catalog' },
      { label: 'Feature Store', icon: '🍪', href: '/features' },
    ],
  },
  {
    title: 'AI & ML',
    items: [
      { label: 'Data Labeling', icon: '🏷️', href: '/labeling' },
      { label: 'Training & Experiments', icon: '🚀', href: '/training' },
      { label: 'Models & Governance', icon: '🤖', href: '/models' },
      { label: 'Federated & Decentralized', icon: '🌍', href: '/federated' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { label: 'Operations', icon: '⚡', href: '/operations' },
      { label: 'Developer & Marketplace', icon: '💻', href: '/developer' },
      { label: 'Infrastructure', icon: '☁️', href: '/infra' },
    ],
  },
  {
    title: 'Team',
    items: [
      { label: 'Team & Users', icon: '👥', href: '/team' },
    ],
  },
]

export function SideBar() {
  const location = useLocation()
const pathname = location.pathname
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">◆</span>
        Fulcrum Hub
      </div>

      <div className="sidebar-menu">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section">{section.title}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                      key={item.href}
                      ref={item.href}
                      className={`sidebar-item ${isActive ? 'active' : ''}`} to={''}                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span className="sidebar-item-label">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
          <div className="sidebar-avatar">SK</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Sarah Kim</div>
            <div className="sidebar-user-role">Platform Admin</div>
          </div>
          <span className="sidebar-user-arrow">▲</span>
        </div>
      </div>
    </nav>
  )
}