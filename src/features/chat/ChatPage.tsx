import { useState } from 'react'
import { useGetChatMessagesQuery } from '@/app/services/api'
import type { ChatMessage } from '@/lib/mockData'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import SuggestChips from './components/SuggestChips'
import SavedConversations from './components/SavedConversations'
import { Plus } from 'lucide-react'

const AI_RESPONSES: Record<string, string> = {
  default: "I'm analyzing your data across all connected sources. Based on current pipeline state:\n\n- **8 sources** connected, 1 overdue for sync\n- **87% quality score** — down 7pp this week\n- **4.8% churn rate** — above warning threshold\n\nWhat would you like to explore further?",
}

function generateAIResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase()
  if (lower.includes('churn')) {
    return "Your current churn rate is **4.8%** — above the 4.0% warning threshold set last quarter. The increase is driven primarily by the **SMB segment** (up 1.6pp to 6.8%) and **trial conversion drops** (21% vs 28% target).\n\nWould you like me to generate a retention action plan?"
  }
  if (lower.includes('revenue')) {
    return "Revenue MTD is **$1.24M** — up **5.1%** vs last month.\n\n- Enterprise: $842K (68%)\n- Mid-Market: $289K (23%)\n- SMB: $109K (9%)\n\nThe enterprise segment is performing strongly. SMB revenue growth is lagging due to elevated churn."
  }
  if (lower.includes('nps')) {
    return "Current NPS score is **52** — up 4 points vs Q4 2025.\n\n- Promoters: 67% (+5pp)\n- Passives: 18% (-2pp)\n- Detractors: 15% (-3pp)\n\nTop drivers of promoter sentiment: **data pipeline reliability**, **AI query quality**, and **customer success responsiveness**."
  }
  return AI_RESPONSES.default
}

export default function ChatPage() {
  const { data: initialMessages, isLoading } = useGetChatMessagesQuery()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConvo, setActiveConvo] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [initialized, setInitialized] = useState(false)

  if (!initialized && initialMessages && !isLoading) {
    setMessages(initialMessages)
    setInitialized(true)
  }

  const handleSend = (text: string) => {
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: text,
      time: 'just now',
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `m-${Date.now()}-ai`,
        role: 'ai',
        content: generateAIResponse(text),
        time: 'just now',
        citations: ['Salesforce CRM', 'Revenue Analytics', 'NPS Survey Data'],
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1200)
  }

  const handleConvoSelect = (id: number) => {
    setActiveConvo(id)
    if (initialMessages) setMessages(initialMessages)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, height: 'calc(100vh - 120px)', maxHeight: 800 }}>
      {/* Sidebar */}
      <div>
        <button
          className="btn btn-primary btn-sm btn-block"
          style={{ marginBottom: 14 }}
          onClick={() => { setMessages([]); setActiveConvo(-1) }}
        >
          <Plus size={14} />
          New Chat
        </button>
        <SavedConversations activeId={activeConvo} onSelect={handleConvoSelect} />
        <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Context
          </div>
          {[
            { label: 'Sources', value: '8 connected' },
            { label: 'Time range', value: 'Last 30 days' },
            { label: 'Tenant', value: 'All tenants' },
            { label: 'Model', value: 'Claude Sonnet' },
          ].map((ctx) => (
            <div key={ctx.label} className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{ctx.label}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text)', fontWeight: 500 }}>{ctx.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text)' }}>Ask AI</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Natural language queries across all your data</div>
            </div>
            <div className="flex items-center gap-6">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Connected</span>
            </div>
          </div>

          {/* Suggestions (only when no messages) */}
          {messages.length === 0 && !isLoading && (
            <div>
              <div style={{ textAlign: 'center', padding: '24px 0 16px', color: 'var(--text3)', fontSize: 'var(--text-sm)' }}>
                Ask anything about your data
              </div>
              <SuggestChips onSelect={handleSend} />
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
            <MessageList messages={messages} isTyping={isTyping} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      </div>
    </div>
  )
}
