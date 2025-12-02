/**
 * Activity Kanban View
 *
 * Kanban board for activities with drag-and-drop between columns.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { format, isPast } from 'date-fns';
import {
  Clock, AlertCircle, CheckCircle, Pause, XCircle, MoreHorizontal,
  Plus, GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { calculateSLAStatus, getSLAColors, type Priority } from '@/lib/activities/sla';
import { getPattern, getCategoryColor } from '@/lib/activities/patterns';
import { type ActivityStatus } from '@/lib/activities/transitions';

// ==========================================
// TYPES
// ==========================================

export interface Activity {
  id: string;
  subject: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
}

export type KanbanColumnType = 'status' | 'priority' | 'entity';

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  icon?: React.ElementType;
  wipLimit?: number;
}

export interface ActivityKanbanProps {
  /** Activities to display */
  activities: Activity[];

  /** Column configuration type */
  columnType?: KanbanColumnType;

  /** Custom columns (overrides columnType) */
  columns?: KanbanColumn[];

  /** Enable drag and drop */
  enableDragDrop?: boolean;

  /** WIP limit per column */
  wipLimit?: number;

  /** Card click handler */
  onCardClick?: (activity: Activity) => void;

  /** Status/column change handler */
  onColumnChange?: (activityId: string, newColumn: string) => void;

  /** Add activity handler */
  onAddActivity?: (column: string) => void;

  /** Additional className */
  className?: string;
}

// ==========================================
// COLUMN CONFIGURATIONS
// ==========================================

const STATUS_COLUMNS: KanbanColumn[] = [
  { id: 'pending', title: 'Pending', color: 'bg-gray-100', icon: Clock },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100', icon: AlertCircle },
  { id: 'completed', title: 'Completed', color: 'bg-green-100', icon: CheckCircle },
];

const PRIORITY_COLUMNS: KanbanColumn[] = [
  { id: 'critical', title: 'Critical', color: 'bg-red-100' },
  { id: 'high', title: 'High', color: 'bg-orange-100' },
  { id: 'normal', title: 'Normal', color: 'bg-blue-100' },
  { id: 'low', title: 'Low', color: 'bg-gray-100' },
];

function getColumnsForType(type: KanbanColumnType, activities: Activity[]): KanbanColumn[] {
  switch (type) {
    case 'status':
      return STATUS_COLUMNS;
    case 'priority':
      return PRIORITY_COLUMNS;
    case 'entity':
      // Dynamic columns based on entity types in activities
      const entityTypes = [...new Set(activities.map(a => a.entityType).filter(Boolean))];
      return entityTypes.map(type => ({
        id: type!,
        title: type!.charAt(0).toUpperCase() + type!.slice(1),
        color: 'bg-gray-100',
      }));
    default:
      return STATUS_COLUMNS;
  }
}

function getActivityColumn(activity: Activity, columnType: KanbanColumnType): string {
  switch (columnType) {
    case 'status':
      return activity.status;
    case 'priority':
      return activity.priority;
    case 'entity':
      return activity.entityType || 'other';
    default:
      return activity.status;
  }
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function KanbanCard({
  activity,
  onClick,
  onQuickAction,
  draggable = false,
}: {
  activity: Activity;
  onClick?: () => void;
  onQuickAction?: (action: string) => void;
  draggable?: boolean;
}) {
  const pattern = getPattern(activity.patternId);
  const slaStatus = calculateSLAStatus(activity.dueAt, activity.priority);
  const slaColors = getSLAColors(slaStatus);
  const isOverdue = activity.dueAt && isPast(new Date(activity.dueAt)) &&
    activity.status !== 'completed' && activity.status !== 'cancelled';

  const PatternIcon = pattern?.icon || CheckCircle;

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-150',
        'hover:shadow-md hover:-translate-y-0.5',
        isOverdue && 'border-l-2 border-l-red-500'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          {draggable && (
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab flex-shrink-0 mt-0.5" />
          )}
          <div className={cn('p-1.5 rounded', pattern ? getCategoryColor(pattern.category) : 'bg-gray-100')}>
            <PatternIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2">{activity.subject}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onQuickAction?.('view')}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickAction?.('complete')}>Complete</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickAction?.('defer')}>Defer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Entity */}
        {activity.entityName && (
          <p className="text-xs text-muted-foreground mb-2 truncate">
            {activity.entityType}: {activity.entityName}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Due Date */}
            {activity.dueAt && (
              <span className={cn(
                'text-xs flex items-center gap-1',
                isOverdue ? 'text-red-600' : 'text-muted-foreground'
              )}>
                <Clock className="h-3 w-3" />
                {format(new Date(activity.dueAt), 'MMM d')}
              </span>
            )}

            {/* SLA Indicator */}
            {activity.dueAt && activity.status !== 'completed' && (
              <span className={cn('h-2 w-2 rounded-full', slaColors.dot)} />
            )}
          </div>

          {/* Assignee */}
          {activity.assigneeName && (
            <Avatar className="h-5 w-5">
              <AvatarImage src={activity.assigneeAvatar} />
              <AvatarFallback className="text-[10px]">
                {activity.assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumnComponent({
  column,
  activities,
  wipLimit,
  onCardClick,
  onQuickAction,
  onAddActivity,
  enableDragDrop,
  onDragOver,
  onDrop,
}: {
  column: KanbanColumn;
  activities: Activity[];
  wipLimit?: number;
  onCardClick?: (activity: Activity) => void;
  onQuickAction?: (activityId: string, action: string) => void;
  onAddActivity?: () => void;
  enableDragDrop?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const isOverWipLimit = wipLimit && activities.length > wipLimit;
  const Icon = column.icon;

  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[320px] rounded-lg',
        column.color || 'bg-muted/50'
      )}
      onDragOver={enableDragDrop ? onDragOver : undefined}
      onDrop={enableDragDrop ? onDrop : undefined}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <Badge variant="secondary" className={cn(
            'text-xs',
            isOverWipLimit && 'bg-red-100 text-red-700'
          )}>
            {activities.length}
            {wipLimit && `/${wipLimit}`}
          </Badge>
        </div>
        {onAddActivity && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddActivity}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              draggable={enableDragDrop}
              onDragStart={(e) => {
                e.dataTransfer.setData('activityId', activity.id);
              }}
            >
              <KanbanCard
                activity={activity}
                onClick={() => onCardClick?.(activity)}
                onQuickAction={(action) => onQuickAction?.(activity.id, action)}
                draggable={enableDragDrop}
              />
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No activities
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityKanban({
  activities,
  columnType = 'status',
  columns: customColumns,
  enableDragDrop = true,
  wipLimit,
  onCardClick,
  onColumnChange,
  onAddActivity,
  className,
}: ActivityKanbanProps) {
  const columns = customColumns || getColumnsForType(columnType, activities);

  // Group activities by column
  const activitiesByColumn = useMemo(() => {
    const grouped = new Map<string, Activity[]>();

    for (const column of columns) {
      grouped.set(column.id, []);
    }

    for (const activity of activities) {
      const columnId = getActivityColumn(activity, columnType);
      if (grouped.has(columnId)) {
        grouped.get(columnId)!.push(activity);
      }
    }

    return grouped;
  }, [activities, columns, columnType]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((columnId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const activityId = e.dataTransfer.getData('activityId');
    if (activityId && onColumnChange) {
      onColumnChange(activityId, columnId);
    }
  }, [onColumnChange]);

  const handleQuickAction = useCallback((activityId: string, action: string) => {
    if (action === 'complete' && onColumnChange) {
      onColumnChange(activityId, 'completed');
    }
    // Other actions would be handled here
  }, [onColumnChange]);

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          activities={activitiesByColumn.get(column.id) || []}
          wipLimit={column.wipLimit || wipLimit}
          onCardClick={onCardClick}
          onQuickAction={handleQuickAction}
          onAddActivity={onAddActivity ? () => onAddActivity(column.id) : undefined}
          enableDragDrop={enableDragDrop}
          onDragOver={handleDragOver}
          onDrop={handleDrop(column.id)}
        />
      ))}
    </div>
  );
}

export default ActivityKanban;
