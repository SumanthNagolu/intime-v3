'use client';

import * as React from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { KanbanCardBase, type KanbanCardBaseProps } from './KanbanCardBase';
import type { SubmissionData } from '../types';
import { formatPercentage } from '../types';

interface SubmissionKanbanCardProps extends Omit<KanbanCardBaseProps, 'id' | 'title' | 'subtitle' | 'statusColor' | 'badge' | 'children'> {
  data: SubmissionData;
}

function getStatusColor(status: string): KanbanCardBaseProps['statusColor'] {
  switch (status) {
    case 'placed':
      return 'green';
    case 'offer':
      return 'blue';
    case 'interview':
      return 'purple';
    case 'submitted':
    case 'client_review':
      return 'yellow';
    case 'rejected':
    case 'withdrawn':
      return 'red';
    default:
      return 'gray';
  }
}

function getMarginColor(margin: number): string {
  if (margin >= 25) return 'text-green-600 bg-green-50';
  if (margin >= 20) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

export function SubmissionKanbanCard({
  data,
  ...props
}: SubmissionKanbanCardProps) {
  const initials = data.candidateName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <KanbanCardBase
      id={data.id}
      title={data.candidateName}
      subtitle={data.jobTitle}
      statusColor={getStatusColor(data.status)}
      {...props}
    >
      {/* Candidate Avatar + Days in stage */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarImage src={data.candidateAvatar} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-charcoal-500">{data.accountName}</span>
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs',
          data.daysInStage > 7 ? 'text-orange-600' : 'text-charcoal-500'
        )}>
          <Clock className="h-3 w-3" />
          <span>{data.daysInStage}d</span>
        </div>
      </div>

      {/* Margin indicator */}
      {data.margin !== undefined && (
        <div className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium mt-2',
          getMarginColor(data.margin)
        )}>
          <DollarSign className="h-3 w-3" />
          <span>{formatPercentage(data.margin, 1)} margin</span>
        </div>
      )}

      {/* Sub-status badge */}
      {data.nextAction && (
        <p className="text-[10px] text-charcoal-400 mt-1.5 truncate">
          Next: {data.nextAction}
        </p>
      )}
    </KanbanCardBase>
  );
}

export default SubmissionKanbanCard;
