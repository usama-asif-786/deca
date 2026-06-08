import type { TeamMember } from '@/lib/mockData'
import Pill from '@/components/common/Pill'
import { Mail } from 'lucide-react'

interface TeamCardProps {
  member: TeamMember
}

const STATUS_VARIANT: Record<TeamMember['status'], 'green' | 'amber' | 'gray'> = {
  active: 'green',
  away: 'amber',
  offline: 'gray',
}

const PERMISSION_VARIANT: Record<string, 'red' | 'cyan' | 'blue'> = {
  admin: 'red',
  write: 'cyan',
  read: 'blue',
}

export default function TeamCard({ member }: TeamCardProps) {
  return (
    <div className="team-card card">
      {/* Avatar */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: member.color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 18,
          margin: '0 auto 12px',
          flexShrink: 0,
        }}
      >
        {member.initials}
      </div>

      {/* Name + role */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{member.name}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{member.role}</div>
      </div>

      {/* Email */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          marginBottom: 12,
          fontSize: 'var(--text-xs)',
          color: 'var(--text3)',
        }}
      >
        <Mail size={11} />
        {member.email}
      </div>

      {/* Status + permissions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
        <Pill variant={STATUS_VARIANT[member.status]}>
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </Pill>
        {member.permissions.map((p) => (
          <Pill key={p} variant={PERMISSION_VARIANT[p] ?? 'gray'}>
            {p}
          </Pill>
        ))}
      </div>
    </div>
  )
}
