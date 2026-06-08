import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  color?: string
  label?: string
  showPercent?: boolean
  className?: string
}

export default function ProgressBar({ value, color, label, showPercent = true, className }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="progress-label">
          {label && <span>{label}</span>}
          {showPercent && <span>{clampedValue}%</span>}
        </div>
      )}
      <div className="progress">
        <div
          className="progress-fill"
          style={{
            width: `${clampedValue}%`,
            background: color ?? 'var(--green)',
          }}
        />
      </div>
    </div>
  )
}
