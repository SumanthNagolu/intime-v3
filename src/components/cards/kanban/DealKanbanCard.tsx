'use client';

import * as React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { KanbanCardBase, type KanbanCardBaseProps } from './KanbanCardBase';
import type { DealData } from '../types';
import { formatCurrency } from '../types';

interface DealKanbanCardProps extends Omit<KanbanCardBaseProps, 'id' | 'title' | 'subtitle' | 'statusColor' | 'badge' | 'children'> {
  data: DealData;
}

function getStageColor(stage: DealData['stage']): KanbanCardBaseProps['statusColor'] {
  switch (stage) {
    case 'discovery':
      return 'blue';
    case 'proposal':
      return 'purple';
    case 'negotiation':
      return 'orange';
    case 'closed_won':
      return 'green';
    case 'closed_lost':
      return 'red';
    default:
      return 'gray';
  }
}

export function DealKanbanCard({
  data,
  ...props
}: DealKanbanCardProps) {
  const ownerInitials = data.ownerName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  // Calculate days until expected close
  const daysToClose = Math.ceil(
    (new Date(data.expectedCloseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Days in current stage (mock - would need actual tracking)
  const daysInStage = 3; // This would come from actual data

  return (
    <KanbanCardBase
      id={data.id}
      title={data.name}
      subtitle={data.accountName}
      statusColor={getStageColor(data.stage)}
      badge={{
        text: formatCurrency(data.value),
        variant: 'secondary',
        className: 'font-semibold',
      }}
      {...props}
    >
      {/* Days in stage */}
      <div className="flex items-center gap-1 text-xs text-charcoal-500 mt-2">
        <Clock className="h-3 w-3" />
        <span>{daysInStage}d in stage</span>
      </div>

      {/* Probability bar */}
      <div className="mt-2">
        <Progress value={data.probability} className="h-1" />
        <p className="text-[10px] text-charcoal-400 mt-0.5">
          {data.probability}% probability
        </p>
      </div>

      {/* Expected close */}
      <div className={cn(
        'flex items-center gap-1 text-[10px] mt-2',
        daysToClose < 0 ? 'text-red-500' : daysToClose < 7 ? 'text-orange-500' : 'text-charcoal-400'
      )}>
        <Calendar className="h-3 w-3" />
        <span>
          {daysToClose < 0
            ? `${Math.abs(daysToClose)}d overdue`
            : `${daysToClose}d to close`}
        </span>
      </div>

      {/* Owner */}
      {data.ownerName && (
        <div className="flex items-center gap-1.5 mt-2">
          <Avatar className="h-4 w-4">
            <AvatarImage src={data.ownerAvatar} />
            <AvatarFallback className="text-[8px]">{ownerInitials}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-charcoal-400">{data.ownerName}</span>
        </div>
      )}
    </KanbanCardBase>
  );
}

export default DealKanbanCard;
