'use client';

import * as React from 'react';
import {
  Eye,
  UserCheck,
  ArrowRightCircle,
  MoreHorizontal,
  Building2,
  Star,
  Clock,
  DollarSign,
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
import type { EntityCardProps, LeadData, CardAction } from '../types';
import { formatCurrency, formatRelativeTime } from '../types';

const STATUS_CONFIG: Record<LeadData['status'], { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contacted', className: 'bg-purple-100 text-purple-700' },
  qualified: { label: 'Qualified', className: 'bg-green-100 text-green-700' },
  unqualified: { label: 'Unqualified', className: 'bg-gray-100 text-gray-700' },
  converted: { label: 'Converted', className: 'bg-emerald-100 text-emerald-700' },
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View', icon: Eye },
  { id: 'qualify', label: 'Qualify', icon: UserCheck },
  { id: 'convert', label: 'Convert to Deal', icon: ArrowRightCircle },
];

interface LeadCardProps extends EntityCardProps<LeadData> {}

function LeadScoreIndicator({ score }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600 bg-green-100';
    if (s >= 60) return 'text-yellow-600 bg-yellow-100';
    if (s >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={cn(
      'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold',
      getScoreColor(score)
    )}>
      {score}
    </div>
  );
}

export function LeadCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: LeadCardProps) {
  const statusConfig = STATUS_CONFIG[data.status];

  const handleAction = (actionId: string) => {
    if (actionId === 'view' && onView) {
      onView();
    } else if (onAction) {
      onAction(actionId, data);
    }
  };

  const companyInitials = data.companyName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

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
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={data.logo} />
              <AvatarFallback className="text-xs">{companyInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{data.companyName}</p>
              <p className="text-xs text-charcoal-500 truncate">{data.contactName}</p>
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
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={data.logo} />
            <AvatarFallback>
              <Building2 className="h-6 w-6 text-charcoal-400" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-charcoal-900 truncate">{data.companyName}</h3>
            {data.contactName && (
              <p className="text-sm text-charcoal-500">
                {data.contactName}
                {data.contactTitle && `, ${data.contactTitle}`}
              </p>
            )}
          </div>
          {data.leadScore !== undefined && <LeadScoreIndicator score={data.leadScore} />}
        </div>

        {/* Status & Source */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={cn('text-xs', statusConfig.className)}>{statusConfig.label}</Badge>
          <Badge variant="outline" className="text-xs">{data.source}</Badge>
        </div>

        {/* Qualification Progress */}
        {data.qualificationProgress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-charcoal-500">Qualification</span>
              <span className="font-medium text-charcoal-700">{data.qualificationProgress}%</span>
            </div>
            <Progress value={data.qualificationProgress} className="h-1.5" />
          </div>
        )}

        {/* Last Touchpoint & Estimated Value */}
        <div className="flex items-center justify-between text-sm text-charcoal-600">
          {data.lastTouchpoint && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-charcoal-400" />
              <span className="text-xs">{formatRelativeTime(data.lastTouchpoint)}</span>
            </div>
          )}
          {data.estimatedValue !== undefined && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-charcoal-400" />
              <span className="text-xs font-medium">{formatCurrency(data.estimatedValue)}</span>
            </div>
          )}
        </div>
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

export default LeadCard;
