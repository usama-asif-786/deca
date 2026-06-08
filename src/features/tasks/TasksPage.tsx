import { useState } from 'react'
import { useGetTasksQuery } from '@/app/services/api'
import type { Task } from '@/lib/mockData'
import TaskList from './components/TaskList'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'high', label: 'High Priority' },
]

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false
  const parsed = new Date(`${dueDate} 2026`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parsed < today
}

export default function TasksPage() {
  const { data: initialTasks, isLoading } = useGetTasksQuery()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState('all')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  if (!initialized && initialTasks && !isLoading) {
    setTasks(initialTasks)
    setInitialized(true)
  }

  const handleToggleDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'open' : 'done' } as Task : t,
      ),
    )
  }

  const handleMove = (id: string, dir: 'up' | 'down') => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id)
      if (idx < 0) return prev
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'open') return t.status === 'open'
    if (filter === 'done') return t.status === 'done'
    if (filter === 'high') return t.priority === 'high'
    if (filter === 'in-progress') return t.status === 'in-progress'
    if (filter === 'overdue') return t.status !== 'done' && isOverdue(t.dueDate)
    return true
  })

  const openCount = tasks.filter((t) => t.status !== 'done').length
  const highCount = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length
  const overdueCount = tasks.filter((t) => t.status !== 'done' && isOverdue(t.dueDate)).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            My Tasks
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>
            {openCount} open · {highCount} high priority
            {overdueCount > 0 && <span style={{ color: 'var(--red)', marginLeft: 6 }}>· {overdueCount} overdue</span>}
          </p>
        </div>
        <button className="btn btn-primary btn-sm">
          <Plus size={14} />
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid-4" style={{ marginBottom: 18 }}>
        {[
          { label: 'Open', value: tasks.filter((t) => t.status === 'open').length, color: 'var(--text)' },
          { label: 'In Progress', value: tasks.filter((t) => t.status === 'in-progress').length, color: 'var(--cyan)' },
          { label: 'Done', value: tasks.filter((t) => t.status === 'done').length, color: 'var(--green)' },
          { label: 'Overdue', value: overdueCount, color: overdueCount > 0 ? 'var(--red)' : 'var(--text3)' },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => {
          const count = f.id === 'all' ? tasks.length
            : f.id === 'open' ? tasks.filter((t) => t.status === 'open').length
            : f.id === 'done' ? tasks.filter((t) => t.status === 'done').length
            : f.id === 'high' ? highCount
            : f.id === 'overdue' ? overdueCount
            : tasks.filter((t) => t.status === 'in-progress').length
          return (
            <button
              key={f.id}
              className={cn('btn btn-xs', filter === f.id ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setFilter(f.id)}
            >
              {f.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)' }}>
          <span className="spinner" style={{ marginRight: 8 }} />
          Loading tasks…
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          expandedTask={expandedTask}
          onExpand={(id) => setExpandedTask(expandedTask === id ? null : id)}
          onToggleDone={handleToggleDone}
          onMove={handleMove}
        />
      )}
    </div>
  )
}
