import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_SAVED_CONVOS } from '@/lib/mockData'

interface SavedConversationsProps {
  activeId: number
  onSelect: (id: number) => void
}

export default function SavedConversations({ activeId, onSelect }: SavedConversationsProps) {
  return (
    <div className="saved-convos">
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
        Saved Conversations
      </div>
      {MOCK_SAVED_CONVOS.map((convo) => (
        <div
          key={convo.id}
          className={cn('saved-convo-item', activeId === convo.id && 'active')}
          onClick={() => onSelect(convo.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelect(convo.id) }}
        >
          <MessageSquare size={12} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {convo.label}
          </span>
          <span style={{ color: 'var(--text3)', flexShrink: 0 }}>{convo.time}</span>
        </div>
      ))}
    </div>
  )
}
