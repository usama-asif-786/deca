import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/mockData'
import { MOCK_TEAM } from '@/lib/mockData'
import TaskPriorityBadge from './TaskPriorityBadge'
import TaskDetailPanel from './TaskDetailPanel'

interface TaskItemProps {
  task: Task
  isExpanded: boolean
  isFirst: boolean
  isLast: boolean
  onExpand: (id: string) => void
  onToggleDone: (id: string) => void
  onMove: (id: string, dir: 'up' | 'down') => void
}

export default function TaskItem({ task, isExpanded, isFirst, isLast, onExpand, onToggleDone, onMove }: TaskItemProps) {
  const assignee = MOCK_TEAM.find((m) => m.id === task.assignee)
  const isDone = task.status === 'done'

  return (
    <div>
      <div
        className="task-item"
        onClick={() => onExpand(task.id)}
        style={{ opacity: isDone ? 0.6 : 1 }}
      >
        {/* Checkbox */}
        <div
          className={cn('task-check', isDone && 'done')}
          onClick={(e) => {
            e.stopPropagation()
            onToggleDone(task.id)
          }}
          role="checkbox"
          aria-checked={isDone}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              onToggleDone(task.id)
            }
          }}
        >
          {isDone && <Check size={10} />}
        </div>

        {/* Content */}
        <div className="task-body">
          <div
            className="task-title"
            style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text3)' : 'var(--text)' }}
          >
            {task.title}
          </div>
          <div className="task-meta flex items-center gap-8" style={{ marginTop: 3 }}>
            <span>Due {task.dueDate}</span>
            {task.labels.slice(0, 2).map((l) => (
              <span
                key={l}
                style={{
                  padding: '1px 6px',
                  borderRadius: '100px',
                  fontSize: 'var(--text-xs)',
                  background: 'var(--bg3)',
                  color: 'var(--text3)',
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Priority */}
        <TaskPriorityBadge priority={task.priority} />

        {/* Assignee avatar */}
        {assignee && (
          <div
            className="task-assignee"
            style={{ background: assignee.color, color: '#fff' }}
            title={assignee.name}
          >
            {assignee.initials}
          </div>
        )}

        {/* Move up/down */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-xs btn-ghost"
            style={{ padding: '1px 5px', opacity: isFirst ? 0.3 : 1 }}
            disabled={isFirst}
            onClick={() => onMove(task.id, 'up')}
            aria-label="Move up"
          >↑</button>
          <button
            className="btn btn-xs btn-ghost"
            style={{ padding: '1px 5px', opacity: isLast ? 0.3 : 1 }}
            disabled={isLast}
            onClick={() => onMove(task.id, 'down')}
            aria-label="Move down"
          >↓</button>
        </div>
      </div>

      {isExpanded && (
        <TaskDetailPanel task={task} onToggleDone={onToggleDone} />
      )}
    </div>
  )
}
