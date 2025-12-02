'use client';

import * as React from 'react';
import { Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { KanbanCardBase, type KanbanCardBaseProps } from './KanbanCardBase';
import type { TaskData } from '../types';
import { formatRelativeTime, formatDaysRemaining } from '../types';

interface TaskKanbanCardProps extends Omit<KanbanCardBaseProps, 'id' | 'title' | 'subtitle' | 'statusColor' | 'badge' | 'children'> {
  data: TaskData;
}

function getPriorityColor(priority: TaskData['priority']): KanbanCardBaseProps['statusColor'] {
  switch (priority) {
    case 'urgent':
      return 'red';
    case 'high':
      return 'orange';
    case 'normal':
      return 'blue';
    case 'low':
      return 'gray';
    default:
      return 'gray';
  }
}

function getPriorityBadge(priority: TaskData['priority']) {
  const config = {
    urgent: { text: 'Urgent', className: 'bg-red-100 text-red-700' },
    high: { text: 'High', className: 'bg-orange-100 text-orange-700' },
    normal: { text: 'Normal', className: 'bg-blue-100 text-blue-700' },
    low: { text: 'Low', className: 'bg-gray-100 text-gray-500' },
  };
  return config[priority] || config.normal;
}

export function TaskKanbanCard({
  data,
  ...props
}: TaskKanbanCardProps) {
  const assigneeInitials = data.assigneeName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const priorityBadge = getPriorityBadge(data.priority);
  const dueDateInfo = data.dueDate ? formatDaysRemaining(data.dueDate) : null;
  const isOverdue = dueDateInfo?.isOverdue || false;

  return (
    <KanbanCardBase
      id={data.id}
      title={data.title}
      subtitle={data.entityType ? `Related to ${data.entityType}` : undefined}
      statusColor={getPriorityColor(data.priority)}
      badge={{
        text: priorityBadge.text,
        variant: 'secondary',
        className: priorityBadge.className,
      }}
      {...props}
    >
      {/* Due date */}
      {data.dueDate && (
        <div className={cn(
          'flex items-center gap-1 text-xs mt-2',
          isOverdue ? 'text-red-600' : 'text-charcoal-500'
        )}>
          {isOverdue && <AlertCircle className="h-3 w-3" />}
          <Clock className="h-3 w-3" />
          <span>
            {isOverdue
              ? `Overdue ${dueDateInfo?.days}d`
              : formatRelativeTime(data.dueDate)}
          </span>
        </div>
      )}

      {/* Entity link */}
      {data.entityLink && (
        <a
          href={data.entityLink}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1.5"
        >
          <ExternalLink className="h-3 w-3" />
          <span>View {data.entityType}</span>
        </a>
      )}

      {/* Assignee */}
      {data.assigneeName && (
        <div className="flex items-center gap-1.5 mt-2">
          <Avatar className="h-4 w-4">
            <AvatarImage src={data.assigneeAvatar} />
            <AvatarFallback className="text-[8px]">{assigneeInitials}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-charcoal-400">{data.assigneeName}</span>
        </div>
      )}

      {/* Checklist progress */}
      {data.checklistProgress && (
        <div className="flex items-center gap-1 text-[10px] text-charcoal-400 mt-1.5">
          <span>
            {data.checklistProgress.completed}/{data.checklistProgress.total} tasks
          </span>
          <div className="h-1 flex-1 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${(data.checklistProgress.completed / data.checklistProgress.total) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </KanbanCardBase>
  );
}

export default TaskKanbanCard;
