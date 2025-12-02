'use client';

/**
 * KanbanBoard Component
 *
 * Drag-and-drop Kanban board for pipeline visualization.
 * Used for submissions pipeline, deals pipeline, etc.
 */

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// TYPES
// ==========================================

export interface KanbanColumn<T> {
  /** Column ID */
  id: string;

  /** Column title */
  title: string;

  /** Column color */
  color?: string;

  /** Items in this column */
  items: T[];

  /** Is collapsed */
  collapsed?: boolean;
}

export interface KanbanBoardProps<T> {
  /** Columns with items */
  columns: KanbanColumn<T>[];

  /** Get item ID */
  getItemId: (item: T) => string;

  /** Render item card */
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;

  /** On item move */
  onItemMove?: (itemId: string, fromColumnId: string, toColumnId: string) => void;

  /** On column collapse toggle */
  onColumnToggle?: (columnId: string, collapsed: boolean) => void;

  /** Loading state */
  loading?: boolean;

  /** Column header actions */
  columnActions?: (column: KanbanColumn<T>) => React.ReactNode;

  /** Additional class name */
  className?: string;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function KanbanBoard<T>({
  columns,
  getItemId,
  renderItem,
  onItemMove,
  onColumnToggle,
  loading = false,
  columnActions,
  className,
}: KanbanBoardProps<T>) {
  const [activeItem, setActiveItem] = React.useState<T | null>(null);
  const [activeColumnId, setActiveColumnId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const itemId = String(active.id);

    // Find the item and its column
    for (const column of columns) {
      const item = column.items.find((i) => getItemId(i) === itemId);
      if (item) {
        setActiveItem(item);
        setActiveColumnId(column.id);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);

    // Check if hovering over a column
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      setActiveColumnId(overColumn.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      setActiveColumnId(null);
      return;
    }

    const itemId = String(active.id);
    const overId = String(over.id);

    // Find source column
    let fromColumnId: string | null = null;
    for (const column of columns) {
      if (column.items.some((i) => getItemId(i) === itemId)) {
        fromColumnId = column.id;
        break;
      }
    }

    // Determine target column
    let toColumnId: string | null = null;

    // Check if dropped on a column
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      toColumnId = overColumn.id;
    } else {
      // Check if dropped on an item in another column
      for (const column of columns) {
        if (column.items.some((i) => getItemId(i) === overId)) {
          toColumnId = column.id;
          break;
        }
      }
    }

    if (fromColumnId && toColumnId && fromColumnId !== toColumnId) {
      onItemMove?.(itemId, fromColumnId, toColumnId);
    }

    setActiveItem(null);
    setActiveColumnId(null);
  };

  if (loading) {
    return (
      <div className={cn('flex gap-4 overflow-x-auto p-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-72">
            <Skeleton className="h-10 w-full mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex gap-4 overflow-x-auto p-4', className)}>
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            getItemId={getItemId}
            renderItem={renderItem}
            onToggle={() => onColumnToggle?.(column.id, !column.collapsed)}
            actions={columnActions?.(column)}
            isActive={activeColumnId === column.id}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="opacity-80 rotate-3 scale-105">
            {renderItem(activeItem, true)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ==========================================
// COLUMN COMPONENT
// ==========================================

interface KanbanColumnComponentProps<T> {
  column: KanbanColumn<T>;
  getItemId: (item: T) => string;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  onToggle: () => void;
  actions?: React.ReactNode;
  isActive: boolean;
}

function KanbanColumnComponent<T>({
  column,
  getItemId,
  renderItem,
  onToggle,
  actions,
  isActive,
}: KanbanColumnComponentProps<T>) {
  const itemIds = React.useMemo(
    () => column.items.map(getItemId),
    [column.items, getItemId]
  );

  return (
    <div
      className={cn(
        'flex-shrink-0 w-72 flex flex-col',
        isActive && 'ring-2 ring-primary ring-offset-2 rounded-lg'
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-t-lg border-b',
          column.color ? `bg-${column.color}-50` : 'bg-muted'
        )}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggle}
          >
            {column.collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <span className="font-medium">{column.title}</span>
          <Badge variant="secondary" className="ml-1">
            {column.items.length}
          </Badge>
        </div>
        {actions}
      </div>

      {/* Column Content */}
      {!column.collapsed && (
        <div className="flex-1 min-h-[200px] p-2 bg-muted/30 rounded-b-lg overflow-y-auto">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {column.items.map((item) => (
                <SortableItem
                  key={getItemId(item)}
                  id={getItemId(item)}
                  item={item}
                  renderItem={renderItem}
                />
              ))}
            </div>
          </SortableContext>

          {column.items.length === 0 && (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
              No items
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SORTABLE ITEM
// ==========================================

interface SortableItemProps<T> {
  id: string;
  item: T;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
}

function SortableItem<T>({ id, item, renderItem }: SortableItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(isDragging && 'opacity-50')}
    >
      {renderItem(item, isDragging)}
    </div>
  );
}

// ==========================================
// DEFAULT KANBAN CARD
// ==========================================

export interface KanbanCardProps {
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; color?: string }>;
  footer?: React.ReactNode;
  onClick?: () => void;
}

export function KanbanCard({ title, subtitle, badges, footer, onClick }: KanbanCardProps) {
  return (
    <Card
      className={cn(
        'cursor-grab active:cursor-grabbing',
        onClick && 'hover:shadow-md transition-shadow'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div>
            <h4 className="font-medium text-sm line-clamp-2">{title}</h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
            )}
          </div>

          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.map((badge, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn('text-xs', badge.color)}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {footer && <div className="pt-2 border-t">{footer}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export default KanbanBoard;
