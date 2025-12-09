'use client'

import { cn } from '@/lib/utils'

interface LibraryGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

const columnClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export function LibraryGrid({ children, columns = 3, className }: LibraryGridProps) {
  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {children}
    </div>
  )
}

