/**
 * Composite Display Widgets
 *
 * Complex display widgets for activities, metrics, RACI, etc.
 * These are higher-level compositions for specialized displays.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Phone, Mail, Calendar, CheckCircle, XCircle, Clock, AlertTriangle,
  User, Users, ArrowUp, ArrowDown, Minus,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { WidgetRenderProps } from '../../registry/widget-registry';

// ==========================================
// PRIORITY BADGE
// ==========================================

const PRIORITY_COLORS: Record<string, { color: string; bgColor: string; icon: LucideIcon }> = {
  critical: { color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertTriangle },
  high: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: ArrowUp },
  medium: { color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Minus },
  low: { color: 'text-green-700', bgColor: 'bg-green-100', icon: ArrowDown },
};

export function PriorityBadge({
  value,
  className,
}: WidgetRenderProps<string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  const config = PRIORITY_COLORS[value.toLowerCase()] || PRIORITY_COLORS.medium;
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(config.bgColor, config.color, 'font-medium capitalize gap-1', className)}
    >
      <Icon className="h-3 w-3" />
      {value}
    </Badge>
  );
}

// ==========================================
// USER CARD
// ==========================================

interface UserValue {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
}

export function UserCard({
  value,
  className,
}: WidgetRenderProps<UserValue | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  const fullName = value.name || `${value.firstName || ''} ${value.lastName || ''}`.trim() || 'Unknown';
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar className="h-10 w-10">
        {value.avatarUrl ? (
          <AvatarImage src={value.avatarUrl} alt={fullName} />
        ) : null}
        <AvatarFallback className="bg-stone-200 text-stone-600">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{fullName}</p>
        {value.role && (
          <p className="text-xs text-muted-foreground truncate">{value.role}</p>
        )}
        {value.email && !value.role && (
          <p className="text-xs text-muted-foreground truncate">{value.email}</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// USER AVATAR WITH TOOLTIP
// ==========================================

export function UserAvatarWithTooltip({
  value,
  className,
}: WidgetRenderProps<UserValue | null>) {
  if (!value) return null;

  const fullName = value.name || `${value.firstName || ''} ${value.lastName || ''}`.trim() || 'Unknown';
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className={cn('h-8 w-8 cursor-pointer', className)}>
            {value.avatarUrl ? (
              <AvatarImage src={value.avatarUrl} alt={fullName} />
            ) : null}
            <AvatarFallback className="bg-stone-200 text-stone-600 text-xs">{initials}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{fullName}</p>
          {value.role && <p className="text-xs text-muted-foreground">{value.role}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ==========================================
// METRIC CARD
// ==========================================

interface MetricValue {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon?: string;
  color?: string;
}

export function MetricCard({
  value,
  className,
}: WidgetRenderProps<MetricValue | null>) {
  if (!value) return null;

  const isPositive = typeof value.change === 'number' && value.change > 0;
  const isNegative = typeof value.change === 'number' && value.change < 0;

  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{value.label}</p>
            <p className="text-2xl font-bold">{value.value}</p>
            {value.change !== undefined && (
              <p className={cn(
                'text-xs mt-1',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600',
                !isPositive && !isNegative && 'text-muted-foreground'
              )}>
                {isPositive && '+'}
                {value.change}
                {value.changeLabel && ` ${value.changeLabel}`}
              </p>
            )}
          </div>
          {value.icon && (
            <div className={cn(
              'p-3 rounded-full',
              value.color || 'bg-stone-100'
            )}>
              {/* Icon would be rendered here */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// KPI CARD (Compact Metric)
// ==========================================

export function KPICard({
  value,
  className,
}: WidgetRenderProps<MetricValue | null>) {
  if (!value) return null;

  return (
    <div className={cn('text-center p-4', className)}>
      <p className="text-3xl font-bold">{value.value}</p>
      <p className="text-sm text-muted-foreground">{value.label}</p>
      {value.change !== undefined && (
        <p className={cn(
          'text-xs mt-1',
          value.change > 0 && 'text-green-600',
          value.change < 0 && 'text-red-600'
        )}>
          {value.change > 0 ? '↑' : value.change < 0 ? '↓' : ''} {Math.abs(value.change)}%
        </p>
      )}
    </div>
  );
}

// ==========================================
// ACTIVITY CARD
// ==========================================

interface ActivityValue {
  id: string;
  type: string;
  subject: string;
  status: string;
  priority?: string;
  dueDate?: string | Date;
  assignee?: UserValue;
  entityType?: string;
  entityName?: string;
  outcome?: string;
  completedAt?: string | Date;
}

const ACTIVITY_TYPE_ICONS: Record<string, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle,
};

const STATUS_COLORS: Record<string, string> = {
  open: 'border-l-gray-400',
  in_progress: 'border-l-blue-500',
  completed: 'border-l-green-500',
  cancelled: 'border-l-red-500',
  overdue: 'border-l-red-600',
};

export function ActivityCard({
  value,
  className,
}: WidgetRenderProps<ActivityValue | null>) {
  if (!value) return null;

  const Icon = ACTIVITY_TYPE_ICONS[value.type] || CheckCircle;
  const isOverdue = value.dueDate && new Date(value.dueDate) < new Date() && value.status !== 'completed';
  const statusClass = isOverdue ? STATUS_COLORS.overdue : STATUS_COLORS[value.status] || STATUS_COLORS.open;

  return (
    <div className={cn(
      'p-3 border rounded-lg border-l-4 hover:bg-stone-50 transition-colors',
      statusClass,
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-stone-100 rounded-full">
          <Icon className="h-4 w-4 text-stone-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{value.subject}</span>
            {value.priority && (
              <PriorityBadge value={value.priority} className="text-xs" />
            )}
          </div>
          {value.entityType && value.entityName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {value.entityType}: {value.entityName}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {value.dueDate && (
              <span className={cn(isOverdue && 'text-red-600 font-medium')}>
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {format(new Date(value.dueDate), 'MMM d, h:mm a')}
              </span>
            )}
            {value.assignee && (
              <>
                <span>•</span>
                <span>
                  {value.assignee.name || `${value.assignee.firstName} ${value.assignee.lastName}`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TIMELINE ITEM
// ==========================================

interface TimelineItemValue {
  id: string;
  type: 'activity' | 'event';
  activityType?: string;
  eventType?: string;
  subject?: string;
  description?: string;
  occurredAt: string | Date;
  actor?: UserValue;
  status?: string;
  outcome?: string;
  icon?: string;
}

export function TimelineItem({
  value,
  className,
}: WidgetRenderProps<TimelineItemValue | null>) {
  if (!value) return null;

  const isActivity = value.type === 'activity';
  const Icon = value.activityType
    ? ACTIVITY_TYPE_ICONS[value.activityType] || CheckCircle
    : Clock;

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    successful: 'bg-green-100 text-green-700',
    unsuccessful: 'bg-red-100 text-red-700',
    open: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className={cn('flex gap-3 pb-4', className)}>
      <div className="flex flex-col items-center">
        <div className={cn(
          'p-2 rounded-full',
          isActivity ? 'bg-blue-100' : 'bg-stone-100'
        )}>
          <Icon className={cn(
            'h-4 w-4',
            isActivity ? 'text-blue-600' : 'text-stone-600'
          )} />
        </div>
        <div className="w-px flex-1 bg-stone-200 mt-2" />
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{value.subject || value.eventType}</span>
          {value.status && (
            <Badge
              variant="secondary"
              className={cn('text-xs', statusColors[value.status] || 'bg-gray-100')}
            >
              {value.status}
            </Badge>
          )}
        </div>
        {value.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {value.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(value.occurredAt), { addSuffix: true })}</span>
          {value.actor && (
            <>
              <span>•</span>
              <span>
                {value.actor.name || `${value.actor.firstName} ${value.actor.lastName}`}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// RACI PANEL
// ==========================================

interface RACIValue {
  accountable?: UserValue;
  responsible?: UserValue[];
  consulted?: UserValue[];
  informed?: UserValue[];
}

export function RACIPanel({
  value,
  className,
}: WidgetRenderProps<RACIValue | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">No owners assigned</span>;

  const renderUsers = (users: UserValue[] | UserValue | undefined, label: string, color: string) => {
    if (!users) return null;
    const userArray = Array.isArray(users) ? users : [users];
    if (userArray.length === 0) return null;

    return (
      <div className="flex items-start gap-2">
        <Badge variant="outline" className={cn('text-xs', color)}>
          {label}
        </Badge>
        <div className="flex flex-wrap gap-1">
          {userArray.map((user) => (
            <UserAvatarWithTooltip key={user.id} value={user} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      {renderUsers(value.accountable, 'A', 'bg-purple-100 text-purple-700 border-purple-300')}
      {renderUsers(value.responsible, 'R', 'bg-blue-100 text-blue-700 border-blue-300')}
      {renderUsers(value.consulted, 'C', 'bg-amber-100 text-amber-700 border-amber-300')}
      {renderUsers(value.informed, 'I', 'bg-gray-100 text-gray-700 border-gray-300')}
    </div>
  );
}

// ==========================================
// ACTIVITY BADGE COUNT
// ==========================================

interface ActivityCountValue {
  overdue: number;
  dueToday: number;
  upcoming: number;
}

export function ActivityBadgeCount({
  value,
  className,
}: WidgetRenderProps<ActivityCountValue | null>) {
  if (!value) return null;

  const hasOverdue = value.overdue > 0;
  const hasDueToday = value.dueToday > 0;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {hasOverdue && (
        <Badge variant="destructive" className="text-xs">
          {value.overdue} overdue
        </Badge>
      )}
      {hasDueToday && (
        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
          {value.dueToday} today
        </Badge>
      )}
      {!hasOverdue && !hasDueToday && value.upcoming > 0 && (
        <Badge variant="secondary" className="text-xs">
          {value.upcoming} upcoming
        </Badge>
      )}
    </div>
  );
}

// ==========================================
// STALE INDICATOR
// ==========================================

interface StaleIndicatorValue {
  lastActivityAt: string | Date | null;
  staleDays?: number;
}

export function StaleIndicator({
  value,
  className,
}: WidgetRenderProps<StaleIndicatorValue | null>) {
  if (!value || !value.lastActivityAt) {
    return (
      <Badge variant="outline" className={cn('text-xs border-red-300 text-red-600', className)}>
        No activity
      </Badge>
    );
  }

  const staleDays = value.staleDays || 7;
  const daysSince = Math.floor(
    (Date.now() - new Date(value.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isStale = daysSince >= staleDays;

  if (!isStale) return null;

  return (
    <Badge variant="outline" className={cn('text-xs border-amber-300 text-amber-600', className)}>
      Stale ({daysSince}d)
    </Badge>
  );
}

// ==========================================
// EXPORT MAP
// ==========================================

export const compositeDisplayWidgets = {
  'priority-badge': PriorityBadge,
  'user-card': UserCard,
  'user-avatar-tooltip': UserAvatarWithTooltip,
  'metric-card': MetricCard,
  'kpi-card': KPICard,
  'activity-card': ActivityCard,
  'timeline-item': TimelineItem,
  'raci-panel': RACIPanel,
  'activity-badge-count': ActivityBadgeCount,
  'stale-indicator': StaleIndicator,
} as const;

