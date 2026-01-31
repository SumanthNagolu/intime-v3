'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { SortableItem } from './SortableItem'
import { cn } from '@/lib/utils'

export interface KanbanColumnDef {
  id: string
  title: React.ReactNode
  className?: string
}

export interface GenericKanbanProps<T extends { id: string }> {
  items: T[]
  columns: KanbanColumnDef[]
  groupBy: (item: T) => string
  onDragEnd: (itemId: string, newColumnId: string) => void
  renderCard: (item: T, isOverlay?: boolean) => React.ReactNode
  renderColumnHeader?: (column: KanbanColumnDef, count: number) => React.ReactNode
  renderColumnFooter?: (column: KanbanColumnDef) => React.ReactNode
  columnClassName?: string
  boardClassName?: string
}

export function GenericKanban<T extends { id: string }>({
  items,
  columns,
  groupBy,
  onDragEnd,
  renderCard,
  renderColumnHeader,
  columnClassName,
  boardClassName,
}: GenericKanbanProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Group items
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, T[]> = {}
    columns.forEach(col => groups[col.id] = [])
    
    items.forEach(item => {
      const colId = groupBy(item)
      if (groups[colId]) {
        groups[colId].push(item)
      } else {
        // Fallback for unknown columns?
        // console.warn('Unknown column for item', item, colId)
      }
    })
    return groups
  }, [items, columns, groupBy])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const itemId = active.id as string
    const overId = over.id as string

    // Find the item
    const item = items.find(i => i.id === itemId)
    if (!item) return

    // Determine target column
    let targetColumnId = overId

    // If over is an item, find its column
    const overItem = items.find(i => i.id === overId)
    if (overItem) {
      targetColumnId = groupBy(overItem)
    }

    // Check if valid column
    const isValidColumn = columns.some(c => c.id === targetColumnId)
    if (!isValidColumn) return

    const currentColumnId = groupBy(item)
    
    if (currentColumnId !== targetColumnId) {
      onDragEnd(itemId, targetColumnId)
    }
  }

  const activeItem = activeId ? items.find(i => i.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex gap-4 overflow-x-auto pb-4 h-full", boardClassName)}>
        {columns.map(col => {
          const colItems = groupedItems[col.id] || []
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={
                renderColumnHeader 
                  ? renderColumnHeader(col, colItems.length) 
                  : (
                    <div className="p-4 font-semibold text-sm">
                      {col.title} ({colItems.length})
                    </div>
                  )
              }
              items={colItems.map(i => i.id)}
              className={cn("w-full max-w-xs flex-shrink-0", columnClassName, col.className)}
              isOverClassName="bg-opacity-50 bg-gray-100"
            >
              <div className="flex flex-col gap-2 p-2">
                {colItems.map(item => (
                  <SortableItem key={item.id} id={item.id}>
                    {renderCard(item)}
                  </SortableItem>
                ))}
              </div>
              {renderColumnFooter && renderColumnFooter(col)}
            </KanbanColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeItem ? renderCard(activeItem, true) : null}
      </DragOverlay>
    </DndContext>
  )
}
