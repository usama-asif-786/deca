import { cn } from '@/lib/utils'

type PillVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'cyan' | 'purple' | 'lime'

interface PillProps {
  variant: PillVariant
  children: React.ReactNode
  className?: string
}

const variantMap: Record<PillVariant, string> = {
  green: 'pill-green',
  amber: 'pill-amber',
  red: 'pill-red',
  blue: 'pill-blue',
  gray: 'pill-gray',
  cyan: 'pill-cyan',
  purple: 'pill-purple',
  lime: 'pill-lime',
}

export default function Pill({ variant, children, className }: PillProps) {
  return (
    <span className={cn('pill', variantMap[variant], className)}>
      {children}
    </span>
  )
}
