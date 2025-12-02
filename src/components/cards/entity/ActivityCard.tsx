'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  PauseCircle,
  ExternalLink,
  AlertCircle,
  MoreHorizontal,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EntityCardProps, ActivityData, CardAction } from '../types';
import { formatRelativeTime } from '../types';

const PRIORITY_CONFIG: Record<ActivityData['priority'], { label: string; className: string; iconClass: string }> = {
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700', iconClass: 'text-red-500' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700', iconClass: 'text-orange-500' },
  normal: { label: 'Normal', className: 'bg-blue-100 text-blue-700', iconClass: 'text-blue-500' },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-700', iconClass: 'text-gray-400' },
};

const STATUS_CONFIG: Record<ActivityData['status'], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  open: { label: 'Open', className: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700', icon: PlayCircle },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  deferred: { label: 'Deferred', className: 'bg-gray-100 text-gray-700', icon: PauseCircle },
};

const SLA_CONFIG: Record<NonNullable<ActivityData['slaStatus']>, { className: string; dotClass: string }> = {
  on_track: { className: 'text-green-600', dotClass: 'bg-green-500' },
  warning: { className: 'text-yellow-600', dotClass: 'bg-yellow-500' },
  breached: { className: 'text-red-600', dotClass: 'bg-red-500' },
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'start', label: 'Start', icon: PlayCircle },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
  { id: 'defer', label: 'Defer', icon: PauseCircle },
  { id: 'reassign', label: 'Reassign', icon: User },
];

interface ActivityCardProps extends EntityCardProps<ActivityData> {}

export function ActivityCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: ActivityCardProps) {
  const priorityConfig = PRIORITY_CONFIG[data.priority];
  const statusConfig = STATUS_CONFIG[data.status];
  const slaConfig = data.slaStatus ? SLA_CONFIG[data.slaStatus] : null;
  const StatusIcon = statusConfig.icon;
  const PatternIcon = data.patternIcon || Clock;

  const assigneeInitials = data.assigneeName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(actionId, data);
    }
  };

  // Filter actions based on current status
  const filteredActions = actions.filter((action) => {
    if (action.id === 'start' && data.status !== 'open') return false;
    if (action.id === 'complete' && data.status === 'completed') return false;
    return true;
  });

  // Calculate checklist progress
  const checklistProgress = data.checklistProgress
    ? (data.checklistProgress.completed / data.checklistProgress.total) * 100
    : null;

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
          className
        )}
        onClick={onView}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={cn('p-1.5 rounded-md', priorityConfig.className)}>
              <PatternIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{data.subject}</p>
              <p className="text-xs text-charcoal-500">{data.patternName}</p>
            </div>
            {slaConfig && (
              <div className={cn('h-2 w-2 rounded-full', slaConfig.dotClass)} />
            )}
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
        onView && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onView}
    >
      <CardContent className="p-4">
        {/* Header: Pattern Icon, Name, Priority */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('p-2 rounded-lg', priorityConfig.className)}>
            <PatternIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-charcoal-500">{data.patternName}</span>
              <Badge className={cn('text-xs', priorityConfig.className)}>
                {priorityConfig.label}
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-charcoal-900 line-clamp-2">
              {data.subject}
            </h3>
          </div>
        </div>

        {/* Status & SLA */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
          {slaConfig && (
            <div className={cn('flex items-center gap-1.5 text-xs', slaConfig.className)}>
              <div className={cn('h-2 w-2 rounded-full', slaConfig.dotClass)} />
              <span>
                {data.slaStatus === 'on_track' && 'On Track'}
                {data.slaStatus === 'warning' && 'At Risk'}
                {data.slaStatus === 'breached' && 'SLA Breached'}
              </span>
            </div>
          )}
        </div>

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

        {/* Due Date */}
        {data.dueDate && (
          <div className="flex items-center gap-1.5 text-sm mb-3">
            <Clock className="h-4 w-4 text-charcoal-400" />
            <span className="text-charcoal-600">
              Due: {formatRelativeTime(data.dueDate)}
            </span>
          </div>
        )}

        {/* Entity Reference */}
        {data.entityLink && (
          <a
            href={data.entityLink}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline mb-3"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View {data.entityType}</span>
          </a>
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
      {filteredActions.length > 0 && (
        <CardFooter className="p-2 pt-0 flex justify-end gap-1">
          {filteredActions.slice(0, 2).map((action) => (
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
          {filteredActions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {filteredActions.slice(2).map((action) => (
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

export default ActivityCard;
