import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  lines?: number
  width?: string
  height?: string
  className?: string
}

export default function SkeletonLoader({ lines = 3, width = '100%', height = '16px', className }: SkeletonLoaderProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width: i === lines - 1 ? '60%' : width,
            height,
          }}
        />
      ))}
    </div>
  )
}
