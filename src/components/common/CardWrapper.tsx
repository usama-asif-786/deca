import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardWrapperProps {
  title?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  noPad?: boolean
}

export default function CardWrapper({ title, actions, children, className, noPad }: CardWrapperProps) {
  return (
    <div className={cn('card', noPad && 'p-0 overflow-hidden', className)}>
      {(title || actions) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {actions && <div className="flex items-center gap-8">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
