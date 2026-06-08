import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalWrapperProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: '440px',
  md: '600px',
  lg: '700px',
  xl: '900px',
}

export default function ModalWrapper({ open, onClose, title, children, size = 'md' }: ModalWrapperProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn('modal', 'animate-in')}
        style={{ maxWidth: sizeMap[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <h2 className="modal-title" style={{ marginBottom: 0 }}>{title}</h2>
          <button
            className="btn btn-ghost btn-xs"
            onClick={onClose}
            aria-label="Close modal"
            style={{ padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
