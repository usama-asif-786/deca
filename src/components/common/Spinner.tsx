import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'spinner',
        size === 'sm' && 'spinner-sm',
        size === 'lg' && 'spinner-lg',
        className,
      )}
      aria-label="Loading"
    />
  )
}
