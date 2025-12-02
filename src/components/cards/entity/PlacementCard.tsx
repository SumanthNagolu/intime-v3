'use client';

import * as React from 'react';
import {
  Eye,
  Calendar,
  DollarSign,
  MoreHorizontal,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  Clock,
  Building2,
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
import type { EntityCardProps, PlacementData, CardAction } from '../types';
import { formatCurrency, formatPercentage } from '../types';

const STATUS_CONFIG: Record<PlacementData['status'], { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
  terminated: { label: 'Terminated', className: 'bg-red-100 text-red-700' },
};

const CONTRACT_TYPE_CONFIG: Record<PlacementData['contractType'], string> = {
  c2c: 'C2C',
  w2: 'W2',
  '1099': '1099',
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View Details', icon: Eye },
  { id: 'check_in', label: 'Log Check-In', icon: MessageSquare },
  { id: 'extend', label: 'Extend', icon: RefreshCw },
];

interface PlacementCardProps extends EntityCardProps<PlacementData> {}

function HealthIndicator({ health }: { health: 'healthy' | 'attention' | 'at_risk' }) {
  const config = {
    healthy: { color: 'bg-green-500', label: 'Healthy' },
    attention: { color: 'bg-yellow-500', label: 'Needs Attention' },
    at_risk: { color: 'bg-red-500', label: 'At Risk' },
  };
  const { color, label } = config[health];

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('h-2 w-2 rounded-full', color)} />
      <span className="text-xs text-charcoal-600">{label}</span>
    </div>
  );
}

function CheckInIndicators({ checkInStatus }: { checkInStatus: PlacementData['checkInStatus'] }) {
  if (!checkInStatus) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-charcoal-500 mr-1">Check-ins:</span>
      {[30, 60, 90].map((day, index) => {
        const key = `day${day}` as keyof typeof checkInStatus;
        const completed = checkInStatus[key];
        return (
          <div
            key={day}
            className={cn(
              'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-medium',
              completed
                ? 'bg-green-100 text-green-700'
                : 'bg-charcoal-100 text-charcoal-400'
            )}
            title={`${day}-day check-in ${completed ? 'completed' : 'pending'}`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

export function PlacementCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: PlacementCardProps) {
  const statusConfig = STATUS_CONFIG[data.status];

  const initials = data.consultantName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  // Calculate days active
  const startDate = new Date(data.startDate);
  const endDate = data.endDate ? new Date(data.endDate) : new Date();
  const daysActive = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate health based on check-ins
  const health: 'healthy' | 'attention' | 'at_risk' = data.checkInStatus
    ? Object.values(data.checkInStatus).every(Boolean)
      ? 'healthy'
      : Object.values(data.checkInStatus).some(Boolean)
      ? 'attention'
      : 'at_risk'
    : 'healthy';

  // Calculate monthly value
  const monthlyValue = data.billRate * 160; // Assuming 160 hours/month

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
            <div className="h-12 w-12 bg-charcoal-200 rounded-full" />
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
              <AvatarImage src={data.consultantAvatar} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{data.consultantName}</p>
              <p className="text-xs text-charcoal-500 truncate">{data.jobTitle} @ {data.accountName}</p>
            </div>
            <HealthIndicator health={health} />
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
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={data.consultantAvatar} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-semibold text-charcoal-900">{data.consultantName}</h3>
              <p className="text-sm text-charcoal-500">{data.jobTitle} @ {data.accountName}</p>
            </div>
          </div>
          <HealthIndicator health={health} />
        </div>

        {/* Status & Contract Type */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={cn('text-xs', statusConfig.className)}>{statusConfig.label}</Badge>
          <Badge variant="outline" className="text-xs">
            {CONTRACT_TYPE_CONFIG[data.contractType]}
          </Badge>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-sm text-charcoal-600 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-charcoal-400" />
            <span>{new Date(data.startDate).toLocaleDateString()}</span>
            <span>-</span>
            <span>{data.endDate ? new Date(data.endDate).toLocaleDateString() : 'Ongoing'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-charcoal-500">
            <Clock className="h-3 w-3" />
            <span>{daysActive} days</span>
          </div>
        </div>

        {/* Rates & Margin */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-charcoal-50 rounded-md mb-3">
          <div className="text-center">
            <p className="text-xs text-charcoal-500">Bill Rate</p>
            <p className="text-sm font-semibold text-charcoal-900">{formatCurrency(data.billRate)}/hr</p>
          </div>
          <div className="text-center border-x border-charcoal-200">
            <p className="text-xs text-charcoal-500">Pay Rate</p>
            <p className="text-sm font-semibold text-charcoal-900">{formatCurrency(data.payRate)}/hr</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-charcoal-500">Margin</p>
            <p className={cn(
              'text-sm font-semibold',
              data.margin >= 25 ? 'text-green-600' : data.margin >= 20 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {formatPercentage(data.margin, 1)}
            </p>
          </div>
        </div>

        {/* Monthly Value */}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-charcoal-500">Monthly Value:</span>
          <span className="font-semibold text-charcoal-900">{formatCurrency(monthlyValue)}/mo</span>
        </div>

        {/* Check-in Status */}
        <CheckInIndicators checkInStatus={data.checkInStatus} />
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

export default PlacementCard;
