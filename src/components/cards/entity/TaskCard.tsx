'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ExternalLink,
  User,
  CalendarClock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EntityCardProps, TaskData, CardAction } from '../types';
import { formatRelativeTime, formatDaysRemaining } from '../types';

const PRIORITY_CONFIG: Record<TaskData['priority'], { label: string; className: string; iconClass: string }> = {
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-200', iconClass: 'text-red-500' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200', iconClass: 'text-orange-500' },
  normal: { label: 'Normal', className: 'bg-blue-100 text-blue-700 border-blue-200', iconClass: 'text-blue-500' },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-500 border-gray-200', iconClass: 'text-gray-400' },
};

const STATUS_CONFIG: Record<TaskData['status'], { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  deferred: { label: 'Deferred', className: 'bg-yellow-100 text-yellow-700' },
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
  { id: 'reassign', label: 'Reassign', icon: User },
  { id: 'snooze', label: 'Snooze', icon: CalendarClock },
];

interface TaskCardProps extends EntityCardProps<TaskData> {
  onToggleComplete?: () => void;
}

export function TaskCard({
  data,
  variant = 'default',
  onView,
  onAction,
  onToggleComplete,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[data.priority];
  const statusConfig = STATUS_CONFIG[data.status];

  const assigneeInitials = data.assigneeName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  // Calculate due date status
  const dueDateInfo = data.dueDate ? formatDaysRemaining(data.dueDate) : null;
  const isOverdue = dueDateInfo?.isOverdue || false;

  // Checklist progress
  const checklistProgress = data.checklistProgress
    ? (data.checklistProgress.completed / data.checklistProgress.total) * 100
    : null;

  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(actionId, data);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete();
    }
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="h-4 bg-charcoal-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-charcoal-200 rounded w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5',
          selected && 'ring-2 ring-blue-500',
          data.status === 'completed' && 'opacity-60',
          className
        )}
        onClick={onView}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={data.status === 'completed'}
              onClick={handleCheckboxClick}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium truncate',
                data.status === 'completed' ? 'text-charcoal-400 line-through' : 'text-charcoal-900'
              )}>
                {data.title}
              </p>
              {data.dueDate && (
                <p className={cn(
                  'text-xs',
                  isOverdue ? 'text-red-500' : 'text-charcoal-500'
                )}>
                  {isOverdue ? 'Overdue' : formatRelativeTime(data.dueDate)}
                </p>
              )}
            </div>
            <Badge className={cn('text-xs border', priorityConfig.className)}>
              {priorityConfig.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        selected && 'ring-2 ring-blue-500',
        data.status === 'completed' && 'opacity-70',
        onView && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onView}
    >
      <CardContent className="p-4">
        {/* Header: Checkbox, Title, Priority */}
        <div className="flex items-start gap-3 mb-3">
          <Checkbox
            checked={data.status === 'completed'}
            onClick={handleCheckboxClick}
            className="mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'text-base font-semibold',
              data.status === 'completed' ? 'text-charcoal-400 line-through' : 'text-charcoal-900'
            )}>
              {data.title}
            </h3>
            {data.description && (
              <p className="text-sm text-charcoal-500 line-clamp-2 mt-0.5">
                {data.description}
              </p>
            )}
          </div>
          <Badge className={cn('text-xs border flex-shrink-0', priorityConfig.className)}>
            {priorityConfig.label}
          </Badge>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Due Date */}
        {data.dueDate && (
          <div className={cn(
            'flex items-center gap-1.5 text-sm mb-3',
            isOverdue ? 'text-red-600' : 'text-charcoal-600'
          )}>
            {isOverdue && <AlertCircle className="h-4 w-4" />}
            <Clock className="h-4 w-4" />
            <span>
              {isOverdue
                ? `Overdue by ${dueDateInfo?.days}d ${dueDateInfo?.hours}h`
                : `Due: ${formatRelativeTime(data.dueDate)}`}
            </span>
          </div>
        )}

        {/* Entity Reference */}
        {data.entityLink && data.entityType && (
          <a
            href={data.entityLink}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline mb-3"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View {data.entityType}</span>
          </a>
        )}

        {/* Assignee */}
        {data.assigneeName && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={data.assigneeAvatar} />
              <AvatarFallback className="text-xs">{assigneeInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-charcoal-600">{data.assigneeName}</span>
          </div>
        )}

        {/* Checklist Progress */}
        {checklistProgress !== null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal-500">Checklist</span>
              <span className="font-medium text-charcoal-700">
                {data.checklistProgress?.completed}/{data.checklistProgress?.total}
              </span>
            </div>
            <Progress value={checklistProgress} className="h-1.5" />
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {actions.length > 0 && data.status !== 'completed' && (
        <CardFooter className="p-2 pt-0 flex justify-end gap-1">
          {actions.slice(0, 2).map((action) => (
            <Button
              key={action.id}
              variant={action.variant as "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | null | undefined || 'ghost'}
              size="sm"
              disabled={action.disabled}
              className={cn(action.hidden && 'hidden')}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(action.id);
              }}
            >
              {action.icon && <action.icon className="h-3 w-3 mr-1" />}
              {action.label}
            </Button>
          ))}
          {actions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.slice(2).map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    disabled={action.disabled}
                    className={cn(action.hidden && 'hidden')}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(action.id);
                    }}
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default TaskCard;
