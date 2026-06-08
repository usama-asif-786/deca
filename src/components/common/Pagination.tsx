import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  total: number
  perPage: number
  className?: string
}

export default function Pagination({ page, totalPages, onChange, total, perPage, className }: PaginationProps) {
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)

  return (
    <div className={cn('pagination', className)}>
      <span>
        Showing {start}–{end} of {total}
      </span>
      <div className="pagination-btns">
        <button
          className="page-btn"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={12} />
        </button>

        {visiblePages.map((p, i) => {
          const prev = visiblePages[i - 1]
          return (
            <>
              {prev && p - prev > 1 && (
                <span key={`ellipsis-${p}`} style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: 'var(--text3)', fontSize: 'var(--text-xs)' }}>...</span>
              )}
              <button
                key={p}
                className={cn('page-btn', page === p && 'active')}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            </>
          )
        })}

        <button
          className="page-btn"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
