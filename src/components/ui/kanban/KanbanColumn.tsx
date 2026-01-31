'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: React.ReactNode
  items: string[] // item IDs
  children: React.ReactNode
  className?: string
  isOverClassName?: string
}

export function KanbanColumn({
  id,
  title,
  items,
  children,
  className,
  isOverClassName,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className={cn('flex flex-col', className)}>
      {title}
      
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-[100px] transition-colors duration-200',
          isOver && isOverClassName
        )}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  )
}
