'use client';

import * as React from 'react';
import {
  Eye,
  RefreshCw,
  MessageSquare,
  MoreHorizontal,
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  Target,
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
import type { EntityCardProps, DealData, CardAction } from '../types';
import { formatCurrency } from '../types';

const STAGE_CONFIG: Record<DealData['stage'], { label: string; className: string; order: number }> = {
  discovery: { label: 'Discovery', className: 'bg-blue-100 text-blue-700', order: 1 },
  proposal: { label: 'Proposal', className: 'bg-purple-100 text-purple-700', order: 2 },
  negotiation: { label: 'Negotiation', className: 'bg-orange-100 text-orange-700', order: 3 },
  closed_won: { label: 'Closed Won', className: 'bg-green-100 text-green-700', order: 4 },
  closed_lost: { label: 'Closed Lost', className: 'bg-red-100 text-red-700', order: 4 },
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View', icon: Eye },
  { id: 'update_stage', label: 'Update Stage', icon: RefreshCw },
  { id: 'add_note', label: 'Add Note', icon: MessageSquare },
];

interface DealCardProps extends EntityCardProps<DealData> {}

export function DealCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: DealCardProps) {
  const stageConfig = STAGE_CONFIG[data.stage];

  const ownerInitials = data.ownerName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const handleAction = (actionId: string) => {
    if (actionId === 'view' && onView) {
      onView();
    } else if (onAction) {
      onAction(actionId, data);
    }
  };

  // Calculate days until expected close
  const daysToClose = Math.ceil(
    (new Date(data.expectedCloseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="h-5 bg-charcoal-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-charcoal-200 rounded w-1/2" />
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{data.name}</p>
              <p className="text-xs text-charcoal-500 truncate">{data.accountName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-charcoal-900">{formatCurrency(data.value)}</p>
              <Badge className={cn('text-xs', stageConfig.className)}>{stageConfig.label}</Badge>
            </div>
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-charcoal-900 truncate">{data.name}</h3>
            <a
              href={`/employee/workspace/accounts/${data.accountId}`}
              className="text-sm text-blue-600 hover:underline truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {data.accountName}
            </a>
          </div>
          <Badge className={cn('text-xs flex-shrink-0', stageConfig.className)}>
            {stageConfig.label}
          </Badge>
        </div>

        {/* Value & Probability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-charcoal-400" />
            <span className="text-lg font-bold text-charcoal-900">{formatCurrency(data.value)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-charcoal-400" />
            <span className="text-sm font-medium text-charcoal-600">{data.probability}%</span>
          </div>
        </div>

        {/* Probability Bar */}
        <div className="mb-3">
          <Progress value={data.probability} className="h-2" />
        </div>

        {/* Expected Close Date */}
        <div className="flex items-center gap-1.5 text-sm text-charcoal-600 mb-3">
          <Calendar className="h-4 w-4 text-charcoal-400" />
          <span>
            Expected close: {new Date(data.expectedCloseDate).toLocaleDateString()}
            <span className={cn(
              'ml-1',
              daysToClose < 0 ? 'text-red-500' : daysToClose < 7 ? 'text-orange-500' : 'text-charcoal-400'
            )}>
              ({daysToClose < 0 ? `${Math.abs(daysToClose)}d overdue` : `${daysToClose}d`})
            </span>
          </span>
        </div>

        {/* Owner */}
        {data.ownerName && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={data.ownerAvatar} />
              <AvatarFallback className="text-xs">{ownerInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-charcoal-600">{data.ownerName}</span>
          </div>
        )}

        {/* Competitors */}
        {data.competitors && data.competitors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-charcoal-500">Competitors:</span>
            {data.competitors.map((competitor) => (
              <Badge key={competitor} variant="secondary" className="text-xs">
                {competitor}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {actions.length > 0 && (
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

export default DealCard;
