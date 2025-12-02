'use client';

import * as React from 'react';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
  Clock,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ActivityData } from '../types';
import { formatRelativeTime } from '../types';

interface ActivityListItemProps {
  data: ActivityData;
  onComplete?: () => void;
  onClick?: () => void;
  className?: string;
}

const PATTERN_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckSquare,
};

const SLA_DOT_COLORS: Record<NonNullable<ActivityData['slaStatus']>, string> = {
  on_track: 'bg-green-500',
  warning: 'bg-yellow-500',
  breached: 'bg-red-500',
};

const PRIORITY_COLORS: Record<ActivityData['priority'], string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  normal: 'border-l-blue-500',
  low: 'border-l-gray-300',
};

export function ActivityListItem({
  data,
  onComplete,
  onClick,
  className,
}: ActivityListItemProps) {
  const Icon = data.patternIcon || PATTERN_ICONS[data.patternName.toLowerCase()] || Clock;
  const slaDotColor = data.slaStatus ? SLA_DOT_COLORS[data.slaStatus] : null;
  const priorityColor = PRIORITY_COLORS[data.priority];

  const assigneeInitials = data.assigneeName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg border-l-2 bg-white',
        'hover:bg-charcoal-50 transition-colors',
        priorityColor,
        onClick && 'cursor-pointer',
        data.status === 'completed' && 'opacity-60',
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 p-1.5 rounded-md',
        data.priority === 'urgent' ? 'bg-red-100 text-red-600' :
        data.priority === 'high' ? 'bg-orange-100 text-orange-600' :
        'bg-charcoal-100 text-charcoal-600'
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-charcoal-900 truncate',
          data.status === 'completed' && 'line-through text-charcoal-400'
        )}>
          {data.subject}
        </p>
        <div className="flex items-center gap-2 text-xs text-charcoal-500">
          {data.dueDate && (
            <span>{formatRelativeTime(data.dueDate)}</span>
          )}
          {data.assigneeName && (
            <>
              <span>•</span>
              <span>{data.assigneeName}</span>
            </>
          )}
        </div>
      </div>

      {/* Assignee Avatar */}
      {data.assigneeName && (
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage src={data.assigneeAvatar} />
          <AvatarFallback className="text-[10px]">{assigneeInitials}</AvatarFallback>
        </Avatar>
      )}

      {/* SLA Status Dot */}
      {slaDotColor && (
        <div className={cn('h-2 w-2 rounded-full flex-shrink-0', slaDotColor)} />
      )}

      {/* Quick Complete Action */}
      {onComplete && data.status !== 'completed' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 flex-shrink-0"
          onClick={handleComplete}
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default ActivityListItem;
