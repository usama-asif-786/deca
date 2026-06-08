import { useState, type KeyboardEvent } from 'react'
import { Send, Paperclip, BarChart2, FileText, Lightbulb } from 'lucide-react'

const ACTION_CHIPS = [
  { icon: Lightbulb, label: 'Explain' },
  { icon: FileText, label: 'Summarize' },
  { icon: BarChart2, label: 'Analyze' },
]

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div>
      <div className="chat-input-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything about your data…"
          disabled={disabled}
          aria-label="Chat input"
        />
        <button
          className="btn btn-xs btn-ghost"
          title="Attach file"
          style={{ padding: 4, color: 'var(--text3)' }}
          type="button"
        >
          <Paperclip size={14} />
        </button>
        <button
          className="btn btn-xs btn-primary"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          type="button"
        >
          <Send size={14} />
        </button>
      </div>

      <div className="chat-actions" style={{ marginTop: 6 }}>
        {ACTION_CHIPS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="btn btn-xs btn-ghost"
            onClick={() => setValue((v) => (v ? `${v} (${label})` : label + ': '))}
            type="button"
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', marginLeft: 'auto' }}>
          Powered by Claude Sonnet
        </span>
      </div>
    </div>
  )
}
