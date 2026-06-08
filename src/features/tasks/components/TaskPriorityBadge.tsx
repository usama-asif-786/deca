import Pill from '@/components/common/Pill'

interface TaskPriorityBadgeProps {
  priority: 'high' | 'medium' | 'low'
}

export default function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const variantMap = {
    high: 'red' as const,
    medium: 'amber' as const,
    low: 'blue' as const,
  }
  return <Pill variant={variantMap[priority]}>{priority}</Pill>
}
