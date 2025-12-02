'use client';

import * as React from 'react';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  ArrowRightLeft,
  Send,
  UserCheck,
  Award,
  CheckSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { TimelineEventData, TimelineEventType } from '../types';
import { formatRelativeTime } from '../types';

interface TimelineEventCardProps {
  data: TimelineEventData;
  isLast?: boolean;
  className?: string;
}

const EVENT_ICONS: Record<TimelineEventType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  status_change: ArrowRightLeft,
  submission: Send,
  interview: UserCheck,
  placement: Award,
  task_completed: CheckSquare,
};

const EVENT_COLORS: Record<TimelineEventType, { bg: string; text: string }> = {
  call: { bg: 'bg-green-100', text: 'text-green-600' },
  email: { bg: 'bg-blue-100', text: 'text-blue-600' },
  meeting: { bg: 'bg-purple-100', text: 'text-purple-600' },
  note: { bg: 'bg-gray-100', text: 'text-gray-600' },
  status_change: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  submission: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  interview: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  placement: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  task_completed: { bg: 'bg-teal-100', text: 'text-teal-600' },
};

export function TimelineEventCard({
  data,
  isLast = false,
  className,
}: TimelineEventCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const Icon = EVENT_ICONS[data.type];
  const colors = EVENT_COLORS[data.type];

  const actorInitials = data.actorName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const hasExpandableContent = data.description && data.description.length > 100;

  return (
    <div className={cn('relative flex gap-3', className)}>
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          colors.bg
        )}>
          <Icon className={cn('h-4 w-4', colors.text)} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-charcoal-200 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-charcoal-900">
              {data.title}
            </h4>
            <p className="text-xs text-charcoal-500 mt-0.5">
              {formatRelativeTime(data.timestamp)}
            </p>
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <div className="mt-2">
            <p className={cn(
              'text-sm text-charcoal-600',
              !expanded && hasExpandableContent && 'line-clamp-2'
            )}>
              {data.description}
            </p>
            {hasExpandableContent && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-0 mt-1 text-xs text-charcoal-500"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Actor & Entity Link */}
        <div className="flex items-center gap-3 mt-2">
          {data.actorName && (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={data.actorAvatar} />
                <AvatarFallback className="text-[9px]">{actorInitials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-charcoal-500">{data.actorName}</span>
            </div>
          )}
          {data.entityLink && data.entityType && (
            <a
              href={data.entityLink}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View {data.entityType}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineEventCard;
