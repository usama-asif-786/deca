import type { Task } from '@/lib/mockData'
import TaskItem from './TaskItem'
import EmptyState from '@/components/common/EmptyState'
import { ClipboardList } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  expandedTask: string | null
  onExpand: (id: string) => void
  onToggleDone: (id: string) => void
  onMove: (id: string, dir: 'up' | 'down') => void
}

export default function TaskList({ tasks, expandedTask, onExpand, onToggleDone, onMove }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No tasks found"
        description="No tasks match your current filter. Try changing the filter or create a new task."
      />
    )
  }

  return (
    <div>
      {tasks.map((task, i) => (
        <TaskItem
          key={task.id}
          task={task}
          isExpanded={expandedTask === task.id}
          isFirst={i === 0}
          isLast={i === tasks.length - 1}
          onExpand={(id) => onExpand(expandedTask === id ? '' : id)}
          onToggleDone={onToggleDone}
          onMove={onMove}
        />
      ))}
    </div>
  )
}
