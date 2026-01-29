'use client'

import { useState, useMemo } from 'react'
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
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  Target,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { SprintItemCard } from './SprintItemCard'
import type { BoardColumn, SprintItemWithRelations, Sprint } from '@/types/scrum'
import { format, differenceInDays } from 'date-fns'

interface SprintBoardProps {
  columns: BoardColumn[]
  items: Record<string, SprintItemWithRelations[]>
  sprint?: Sprint
  onMoveItem: (itemId: string, targetColumn: string, targetOrder: number) => void
  onViewItem: (item: SprintItemWithRelations) => void
  onCreateItem: (column?: string) => void
  isLoading?: boolean
}

export function SprintBoard({
  columns,
  items,
  sprint,
  onMoveItem,
  onViewItem,
  onCreateItem,
  isLoading,
}: SprintBoardProps) {
  const [activeItem, setActiveItem] = useState<SprintItemWithRelations | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [localItems, setLocalItems] = useState(items)

  // Update local items when props change
  useMemo(() => {
    setLocalItems(items)
  }, [items])

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return localItems

    const filtered: Record<string, SprintItemWithRelations[]> = {}
    for (const [columnKey, columnItems] of Object.entries(localItems)) {
      filtered[columnKey] = columnItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.itemNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }, [localItems, searchQuery])

  // Calculate sprint progress
  const sprintProgress = sprint
    ? {
        percentage: sprint.totalItems > 0
          ? Math.round((sprint.completedItems / sprint.totalItems) * 100)
          : 0,
        daysRemaining: differenceInDays(new Date(sprint.endDate), new Date()),
        totalDays: differenceInDays(new Date(sprint.endDate), new Date(sprint.startDate)),
      }
    : null

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id as string

    // Find the item across all columns
    for (const columnItems of Object.values(localItems)) {
      const item = columnItems.find((i) => i.id === activeId)
      if (item) {
        setActiveItem(item)
        break
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find source and destination columns
    let sourceColumn = ''
    let destColumn = ''

    for (const [columnKey, columnItems] of Object.entries(localItems)) {
      if (columnItems.some((i) => i.id === activeId)) {
        sourceColumn = columnKey
      }
      if (columnItems.some((i) => i.id === overId) || columnKey === overId) {
        destColumn = columnKey
      }
    }

    // If dropping on a column directly
    if (columns.some((c) => c.columnKey === overId)) {
      destColumn = overId
    }

    if (sourceColumn && destColumn && sourceColumn !== destColumn) {
      // Optimistically move the item
      setLocalItems((prev) => {
        const sourceItems = [...(prev[sourceColumn] || [])]
        const destItems = [...(prev[destColumn] || [])]

        const itemIndex = sourceItems.findIndex((i) => i.id === activeId)
        if (itemIndex === -1) return prev

        const [movedItem] = sourceItems.splice(itemIndex, 1)
        destItems.push(movedItem)

        return {
          ...prev,
          [sourceColumn]: sourceItems,
          [destColumn]: destItems,
        }
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find destination column
    let destColumn = ''
    let destOrder = 0

    // Check if dropping on a column
    if (columns.some((c) => c.columnKey === overId)) {
      destColumn = overId
      destOrder = (filteredItems[overId]?.length || 0)
    } else {
      // Dropping on an item
      for (const [columnKey, columnItems] of Object.entries(filteredItems)) {
        const itemIndex = columnItems.findIndex((i) => i.id === overId)
        if (itemIndex !== -1) {
          destColumn = columnKey
          destOrder = itemIndex
          break
        }
      }
    }

    if (destColumn) {
      onMoveItem(activeId, destColumn, destOrder)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sprint Header */}
      {sprint && (
        <div className="flex-shrink-0 bg-white border-b border-charcoal-200/60 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-heading font-bold text-charcoal-900">
                {sprint.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                </span>
                {sprintProgress && sprintProgress.daysRemaining > 0 && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {sprintProgress.daysRemaining} days remaining
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Progress */}
              {sprintProgress && (
                <div className="w-48">
                  <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
                    <span>{sprint.completedItems} / {sprint.totalItems} items</span>
                    <span>{sprintProgress.percentage}%</span>
                  </div>
                  <Progress value={sprintProgress.percentage} className="h-2" />
                </div>
              )}

              <Button onClick={() => onCreateItem()}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Sprint Goal */}
          {sprint.goal && (
            <div className="flex items-start gap-2 p-3 bg-gold-50 border border-gold-200 rounded-lg">
              <Target className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-gold-700 uppercase tracking-wider">Sprint Goal</span>
                <p className="text-sm text-charcoal-700 mt-0.5">{sprint.goal}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Board Controls */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-charcoal-200/60 bg-cream">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6 bg-cream">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                items={filteredItems[column.columnKey] || []}
                onViewItem={onViewItem}
                onCreateItem={() => onCreateItem(column.columnKey)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem && (
              <div className="w-72 opacity-90 rotate-2">
                <SprintItemCard item={activeItem} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

// Board Column Component
interface BoardColumnProps {
  column: BoardColumn
  items: SprintItemWithRelations[]
  onViewItem: (item: SprintItemWithRelations) => void
  onCreateItem: () => void
}

function BoardColumn({ column, items, onViewItem, onCreateItem }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.columnKey,
  })

  // Check WIP limit
  const isOverWipLimit = column.wipLimit && items.length > column.wipLimit

  // Calculate total points in column
  const totalPoints = items.reduce((sum, item) => sum + (item.storyPoints || 0), 0)

  return (
    <div className="w-72 flex flex-col bg-charcoal-50/50 rounded-lg flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-charcoal-200/60">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              column.color === 'gray' && 'bg-charcoal-400',
              column.color === 'blue' && 'bg-blue-500',
              column.color === 'amber' && 'bg-amber-500',
              column.color === 'green' && 'bg-green-500',
              column.color === 'red' && 'bg-red-500'
            )}
          />
          <h3 className="font-medium text-charcoal-800">{column.name}</h3>
          <span className="text-xs text-charcoal-500 bg-charcoal-200/60 px-1.5 py-0.5 rounded">
            {items.length}
            {column.wipLimit && ` / ${column.wipLimit}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {totalPoints > 0 && (
            <span className="text-xs text-charcoal-500">{totalPoints} pts</span>
          )}
          <button
            onClick={onCreateItem}
            className="p-1 hover:bg-charcoal-200/60 rounded transition-colors"
          >
            <Plus className="w-4 h-4 text-charcoal-500" />
          </button>
        </div>
      </div>

      {/* WIP Limit Warning */}
      {isOverWipLimit && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 text-xs border-b border-amber-200">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>WIP limit exceeded</span>
        </div>
      )}

      {/* Items */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] transition-colors',
          isOver && 'bg-gold-50/50'
        )}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SprintItemCard
              key={item.id}
              item={item}
              onView={onViewItem}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-charcoal-400">
            <p className="text-sm">No items</p>
            <button
              onClick={onCreateItem}
              className="text-xs text-gold-600 hover:text-gold-700 mt-1"
            >
              Add an item
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
