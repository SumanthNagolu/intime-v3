'use client';

import * as React from 'react';
import {
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EntityCardProps, SubmissionData, CardAction } from '../types';
import { formatCurrency, formatRelativeTime, formatPercentage } from '../types';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  sourced: { label: 'Sourced', className: 'bg-gray-100 text-gray-700' },
  screening: { label: 'Screening', className: 'bg-blue-100 text-blue-700' },
  submitted: { label: 'Submitted', className: 'bg-purple-100 text-purple-700' },
  client_review: { label: 'Client Review', className: 'bg-indigo-100 text-indigo-700' },
  interview: { label: 'Interview', className: 'bg-cyan-100 text-cyan-700' },
  offer: { label: 'Offer', className: 'bg-amber-100 text-amber-700' },
  placed: { label: 'Placed', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-700' },
};

const STAGE_CONFIG: Record<string, { label: string; order: number }> = {
  sourced: { label: 'Sourced', order: 1 },
  screening: { label: 'Screening', order: 2 },
  submitted: { label: 'Submitted', order: 3 },
  vendor_review: { label: 'Vendor Review', order: 4 },
  client_review: { label: 'Client Review', order: 5 },
  interview: { label: 'Interview', order: 6 },
  offer: { label: 'Offer', order: 7 },
  placed: { label: 'Placed', order: 8 },
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View Details', icon: Eye },
  { id: 'update_status', label: 'Update Status', icon: RefreshCw },
  { id: 'schedule_interview', label: 'Schedule Interview', icon: Calendar },
];

interface SubmissionCardProps extends EntityCardProps<SubmissionData> {}

function getMarginColor(margin: number): string {
  if (margin >= 25) return 'text-green-600';
  if (margin >= 20) return 'text-yellow-600';
  if (margin >= 15) return 'text-orange-600';
  return 'text-red-600';
}

function getDaysInStageColor(days: number): string {
  if (days <= 3) return 'text-charcoal-500';
  if (days <= 7) return 'text-yellow-600';
  if (days <= 14) return 'text-orange-600';
  return 'text-red-600';
}

export function SubmissionCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: SubmissionCardProps) {
  const statusConfig = STATUS_CONFIG[data.status] || { label: data.status, className: 'bg-gray-100 text-gray-700' };
  const stageConfig = STAGE_CONFIG[data.pipelineStage] || { label: data.pipelineStage, order: 0 };
  const marginColor = data.margin !== undefined ? getMarginColor(data.margin) : '';
  const daysColor = getDaysInStageColor(data.daysInStage);

  const initials = data.candidateName
    .split(' ')
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

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-charcoal-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-charcoal-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-charcoal-200 rounded w-1/2" />
            </div>
          </div>
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
            <Avatar className="h-8 w-8">
              <AvatarImage src={data.candidateAvatar} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{data.candidateName}</p>
              <p className="text-xs text-charcoal-500 truncate">{data.jobTitle}</p>
            </div>
            <Badge className={cn('text-xs', statusConfig.className)}>{statusConfig.label}</Badge>
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
        {/* Header: Candidate Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={data.candidateAvatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-charcoal-900 truncate">
              {data.candidateName}
            </h3>
            <Badge className={cn('text-xs mt-0.5', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Job Reference */}
        <div className="flex items-center gap-2 text-sm text-charcoal-600 mb-3">
          <span className="truncate">{data.jobTitle}</span>
          <ArrowRight className="h-3 w-3 flex-shrink-0 text-charcoal-400" />
          <span className="font-medium truncate">{data.accountName}</span>
        </div>

        {/* Pipeline Stage & Days */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-xs">
            {stageConfig.label}
          </Badge>
          <div className={cn('flex items-center gap-1 text-xs', daysColor)}>
            <Clock className="h-3 w-3" />
            <span>{data.daysInStage}d in stage</span>
          </div>
        </div>

        {/* Rates & Margin */}
        {(data.billRate !== undefined || data.payRate !== undefined) && (
          <div className="flex items-center gap-4 text-xs mb-3 p-2 bg-charcoal-50 rounded-md">
            {data.billRate !== undefined && (
              <div>
                <span className="text-charcoal-500">Bill:</span>
                <span className="ml-1 font-medium">{formatCurrency(data.billRate)}/hr</span>
              </div>
            )}
            {data.payRate !== undefined && (
              <div>
                <span className="text-charcoal-500">Pay:</span>
                <span className="ml-1 font-medium">{formatCurrency(data.payRate)}/hr</span>
              </div>
            )}
            {data.margin !== undefined && (
              <div>
                <span className="text-charcoal-500">Margin:</span>
                <span className={cn('ml-1 font-semibold', marginColor)}>
                  {formatPercentage(data.margin, 1)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Submitted Date */}
        <div className="flex items-center gap-1 text-xs text-charcoal-500 mb-2">
          <Calendar className="h-3 w-3" />
          <span>Submitted {formatRelativeTime(data.submittedDate)}</span>
        </div>

        {/* Interview Date */}
        {data.interviewDate && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Calendar className="h-3 w-3" />
            <span>Interview: {new Date(data.interviewDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Next Action */}
        {data.nextAction && (
          <div className="mt-2 pt-2 border-t border-charcoal-100">
            <p className="text-xs text-charcoal-500">
              <span className="font-medium">Next:</span> {data.nextAction}
            </p>
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

export default SubmissionCard;
