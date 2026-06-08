import type { TeamMember } from '@/lib/mockData'
import TeamCard from './TeamCard'

interface TeamGridProps {
  members: TeamMember[]
}

export default function TeamGrid({ members }: TeamGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 14,
      }}
    >
      {members.map((m) => (
        <TeamCard key={m.id} member={m} />
      ))}
    </div>
  )
}
