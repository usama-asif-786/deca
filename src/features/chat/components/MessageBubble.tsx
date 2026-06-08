import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  role: 'user' | 'ai'
  content: string
  citations?: string[]
  time?: string
}

function formatContent(content: string): React.ReactNode {
  // Simple markdown-like rendering: **bold** and newlines
  const lines = content.split('\n')
  return lines.map((line, i) => {
    const formatted = line.replace(/\*\*(.*?)\*\*/g, (_, text) => `<strong>${text}</strong>`)
    return (
      <span key={i}>
        {i > 0 && <br />}
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
      </span>
    )
  })
}

export default function MessageBubble({ role, content, citations, time }: MessageBubbleProps) {
  return (
    <div className={cn('chat-msg', role === 'user' ? 'chat-user' : 'chat-ai')}>
      {role === 'ai' && (
        <div
          className="flex items-center gap-6"
          style={{ marginBottom: 8, fontSize: 'var(--text-xs)', color: 'var(--text3)', fontWeight: 500 }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            AI
          </span>
          Fulcrum AI
          {time && <span style={{ marginLeft: 'auto', fontWeight: 400 }}>{time}</span>}
        </div>
      )}

      {role === 'user' && time && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginBottom: 6, textAlign: 'right' }}>
          {time}
        </div>
      )}

      <div style={{ lineHeight: 1.65 }}>{formatContent(content)}</div>

      {citations && citations.length > 0 && (
        <div className="chat-cite">
          <div className="flex items-center gap-4" style={{ marginBottom: 4 }}>
            <BookOpen size={11} />
            <span style={{ fontWeight: 500 }}>Sources:</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {citations.map((c) => (
              <span
                key={c}
                style={{
                  padding: '1px 8px',
                  borderRadius: '100px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text2)',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
