/**
 * Activity Header
 *
 * Header component for activity detail views showing pattern, status, SLA, and assignee.
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Clock, User, ExternalLink, Edit, MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getPattern, getCategoryColor, type ActivityPattern } from '@/lib/activities/patterns';
import { getStatusConfig, type ActivityStatus } from '@/lib/activities/transitions';
import type { Priority } from '@/lib/activities/sla';
import { ActivitySLA } from './ActivitySLA';
import { ActivityStatusButtons } from '../actions/ActivityStatusButtons';

export interface ActivityHeaderProps {
  /** Activity ID */
  activityId: string;

  /** Pattern ID */
  patternId: string;

  /** Activity subject */
  subject: string;

  /** Activity status */
  status: ActivityStatus;

  /** Priority level */
  priority: Priority;

  /** Due date */
  dueAt?: string;

  /** Assignee info */
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };

  /** Related entity link */
  entityLink?: {
    type: string;
    id: string;
    name: string;
    url: string;
  };

  /** Created at */
  createdAt: string;

  /** Allow editing subject */
  editableSubject?: boolean;

  /** Subject change handler */
  onSubjectChange?: (newSubject: string) => void;

  /** Status change handler */
  onStatusChange?: (status: ActivityStatus, data?: Record<string, unknown>) => void;

  /** Reassign handler */
  onReassign?: (newAssigneeId: string) => void;

  /** Additional className */
  className?: string;
}

const PRIORITY_STYLES: Record<Priority, { badge: string; dot: string }> = {
  critical: { badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  urgent: { badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  high: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  normal: { badge: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  low: { badge: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
};

export function ActivityHeader({
  activityId,
  patternId,
  subject,
  status,
  priority,
  dueAt,
  assignee,
  entityLink,
  createdAt,
  editableSubject = false,
  onSubjectChange,
  onStatusChange,
  onReassign,
  className,
}: ActivityHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedSubject, setEditedSubject] = React.useState(subject);

  const pattern = getPattern(patternId);
  const statusConfig = getStatusConfig(status);
  const priorityStyles = PRIORITY_STYLES[priority];
  const PatternIcon = pattern?.icon || Clock;

  const handleSaveSubject = () => {
    if (editedSubject.trim() && editedSubject !== subject) {
      onSubjectChange?.(editedSubject.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Pattern & Subject */}
      <div className="flex items-start gap-4">
        {/* Pattern Icon */}
        <div className={cn(
          'p-3 rounded-lg flex-shrink-0',
          pattern ? getCategoryColor(pattern.category) : 'bg-gray-100'
        )}>
          <PatternIcon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Pattern Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">
              {pattern?.name || 'Activity'}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {pattern?.category.replace('_', ' ')}
            </Badge>
          </div>

          {/* Subject */}
          {isEditing && editableSubject ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="text-xl font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveSubject();
                  if (e.key === 'Escape') {
                    setEditedSubject(subject);
                    setIsEditing(false);
                  }
                }}
              />
              <Button size="sm" onClick={handleSaveSubject}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => {
                setEditedSubject(subject);
                setIsEditing(false);
              }}>Cancel</Button>
            </div>
          ) : (
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {subject}
              {editableSubject && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 hover:opacity-100"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
            </h1>
          )}
        </div>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View History</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status & Priority Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Badge */}
        <Badge
          variant="outline"
          className={cn('text-sm px-3 py-1', statusConfig.bgColor, statusConfig.color)}
        >
          {statusConfig.label}
        </Badge>

        {/* Priority Badge */}
        <Badge variant="outline" className={cn('text-sm px-3 py-1', priorityStyles.badge)}>
          <span className={cn('h-2 w-2 rounded-full mr-1.5', priorityStyles.dot)} />
          {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
        </Badge>

        {/* SLA Indicator */}
        {dueAt && status !== 'completed' && status !== 'cancelled' && (
          <ActivitySLA dueAt={dueAt} priority={priority} variant="badge" />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-b py-3">
        <ActivityStatusButtons
          activityId={activityId}
          status={status}
          patternId={patternId}
          subject={subject}
          assigneeName={assignee?.name}
          onStatusChange={(newStatus, data) => onStatusChange?.(newStatus, data)}
          onReassign={onReassign}
        />

        {/* Due Date Display */}
        {dueAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Due {format(new Date(dueAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
          </div>
        )}
      </div>

      {/* Meta Info Row */}
      <div className="flex flex-wrap items-center gap-6 text-sm">
        {/* Assignee */}
        {assignee && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Assigned to:</span>
            <div className="flex items-center gap-1.5">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{assignee.name}</span>
            </div>
          </div>
        )}

        {/* Related Entity */}
        {entityLink && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{entityLink.type}:</span>
            <a
              href={entityLink.url}
              className="flex items-center gap-1 text-primary hover:underline font-medium"
            >
              {entityLink.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Created {format(new Date(createdAt), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeader;
