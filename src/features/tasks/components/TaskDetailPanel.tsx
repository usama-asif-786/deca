import { useState } from 'react'
import type { Task } from '@/lib/mockData'
import { MOCK_TEAM } from '@/lib/mockData'
import TaskPriorityBadge from './TaskPriorityBadge'
import Pill from '@/components/common/Pill'
import { Calendar, User, MessageCircle, Activity, Send } from 'lucide-react'

interface TaskDetailPanelProps {
  task: Task
  onToggleDone: (id: string) => void
}

export default function TaskDetailPanel({ task, onToggleDone }: TaskDetailPanelProps) {
  const assignee = MOCK_TEAM.find((m) => m.id === task.assignee)
  const [commentText, setCommentText] = useState('')
  const [localComments, setLocalComments] = useState<{ author: string; text: string; time: string }[]>([])

  function postComment() {
    const text = commentText.trim()
    if (!text) return
    setLocalComments((prev) => [...prev, { author: 'You', text, time: 'Just now' }])
    setCommentText('')
  }

  return (
    <div className="task-detail-panel">
      <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', lineHeight: 1.6 }}>{task.desc}</div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-16" style={{ marginBottom: 12 }}>
        {assignee && (
          <div className="flex items-center gap-6">
            <User size={12} style={{ color: 'var(--text3)' }} />
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: assignee.color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 600,
              }}
            >
              {assignee.initials}
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>{assignee.name}</span>
          </div>
        )}
        <div className="flex items-center gap-6">
          <Calendar size={12} style={{ color: 'var(--text3)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text2)' }}>Due {task.dueDate}</span>
        </div>
        <TaskPriorityBadge priority={task.priority} />
        {task.labels.map((l) => (
          <Pill key={l} variant="gray">{l}</Pill>
        ))}
      </div>

      {/* Comments */}
      {(task.comments.length > 0 || localComments.length > 0) && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginBottom: 10 }}>
          <div className="flex items-center gap-6" style={{ marginBottom: 8 }}>
            <MessageCircle size={12} style={{ color: 'var(--text3)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Comments ({task.comments.length + localComments.length})
            </span>
          </div>
          {[...task.comments, ...localComments].map((c, i) => (
            <div key={i} className="flex gap-8" style={{ marginBottom: 8 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--bg4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {c.author.split(' ').map((w) => w[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', marginBottom: 2 }}>
                  <span style={{ fontWeight: 500 }}>{c.author}</span>
                  <span style={{ color: 'var(--text3)', marginLeft: 6 }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text2)', lineHeight: 1.5 }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity log */}
      {task.activityLog.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          <div className="flex items-center gap-6" style={{ marginBottom: 8 }}>
            <Activity size={12} style={{ color: 'var(--text3)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Activity
            </span>
          </div>
          {task.activityLog.map((entry, i) => (
            <div key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', padding: '2px 0' }}>
              {entry}
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
        <div className="flex items-center gap-6" style={{ marginBottom: 6 }}>
          <MessageCircle size={12} style={{ color: 'var(--text3)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Add Comment
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="form-input"
            style={{ flex: 1, fontSize: 'var(--text-sm)', padding: '6px 10px' }}
            placeholder="Add a comment… (Enter to post)"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); postComment() } }}
          />
          <button
            className="btn btn-xs btn-primary"
            onClick={postComment}
            disabled={!commentText.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Send size={11} /> Post
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-8" style={{ marginTop: 12 }}>
        <button
          className="btn btn-xs btn-primary"
          onClick={() => onToggleDone(task.id)}
        >
          {task.status === 'done' ? 'Reopen Task' : 'Mark Done'}
        </button>
        <button className="btn btn-xs btn-ghost">Edit</button>
      </div>
    </div>
  )
}
