import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { ChatMessage } from '@/lib/mockData'

interface MessageListProps {
  messages: ChatMessage[]
  isTyping?: boolean
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="chat-area" aria-live="polite" aria-label="Conversation">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          citations={msg.citations}
          time={msg.time}
        />
      ))}

      {isTyping && (
        <div className="chat-msg chat-ai" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}>
          <div
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
            }}
          >
            AI
          </div>
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--text3)',
                  animation: 'pulse 1.2s ease infinite',
                  animationDelay: `${i * 200}ms`,
                  display: 'inline-block',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
