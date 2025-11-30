/**
 * Dashboard Widgets
 *
 * Reusable widget components for role-based dashboards.
 * Each widget type has specific rendering and data requirements.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Calendar,
  User,
  Briefcase,
  Target,
  Building2,
  DollarSign,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { entityRegistry, type EntityType } from '@/lib/workspace';

// =====================================================
// TYPES
// =====================================================

export interface MetricData {
  value: number;
  label: string;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  target?: number;
  icon?: LucideIcon;
}

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  statusColor?: 'default' | 'success' | 'warning' | 'error';
  timestamp?: string;
  entityType?: EntityType;
  href?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value?: number;
  color: string;
}

// =====================================================
// METRIC WIDGET
// =====================================================

export interface MetricWidgetProps {
  title: string;
  data?: MetricData;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MetricWidget({
  title,
  data,
  isLoading = false,
  onClick,
  className,
}: MetricWidgetProps) {
  const TrendIcon = data?.trend === 'up'
    ? TrendingUp
    : data?.trend === 'down'
    ? TrendingDown
    : Minus;

  const trendColor = data?.trend === 'up'
    ? 'text-emerald-600'
    : data?.trend === 'down'
    ? 'text-red-600'
    : 'text-muted-foreground';

  if (isLoading) {
    return (
      <Card className={cn('cursor-pointer hover:shadow-md transition-shadow', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          {title}
          {data?.icon && <data.icon className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-charcoal">
            {data?.value?.toLocaleString() ?? '-'}
          </span>
          {data?.change !== undefined && (
            <span className={cn('flex items-center text-sm font-medium', trendColor)}>
              <TrendIcon className="w-4 h-4 mr-1" />
              {Math.abs(data.change)}%
            </span>
          )}
        </div>
        {data?.label && (
          <p className="text-xs text-muted-foreground mt-1">{data.label}</p>
        )}
        {data?.target && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round((data.value / data.target) * 100)}%</span>
            </div>
            <Progress value={(data.value / data.target) * 100} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// LIST WIDGET
// =====================================================

export interface ListWidgetProps {
  title: string;
  items?: ListItem[];
  maxItems?: number;
  isLoading?: boolean;
  onViewAll?: () => void;
  onItemClick?: (item: ListItem) => void;
  emptyMessage?: string;
  className?: string;
}

const STATUS_COLORS = {
  default: 'bg-stone-100 text-stone-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
};

export function ListWidget({
  title,
  items = [],
  maxItems = 5,
  isLoading = false,
  onViewAll,
  onItemClick,
  emptyMessage = 'No items',
  className,
}: ListWidgetProps) {
  const router = useRouter();
  const displayItems = items.slice(0, maxItems);

  const handleItemClick = (item: ListItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else if (item.href) {
      router.push(item.href);
    } else if (item.entityType && item.id) {
      const config = entityRegistry[item.entityType];
      if (config) {
        router.push(config.routes.detail(item.id));
      }
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {displayItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ScrollArea className="max-h-[280px]">
            <ul className="divide-y divide-border">
              {displayItems.map((item) => {
                const entityConfig = item.entityType ? entityRegistry[item.entityType] : null;
                const Icon = entityConfig?.icon || User;

                return (
                  <li
                    key={item.id}
                    className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        entityConfig ? 'bg-stone-100' : 'bg-stone-100'
                      )}>
                        <Icon className={cn('w-4 h-4', entityConfig?.color || 'text-stone-600')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.status && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs',
                                STATUS_COLORS[item.statusColor || 'default']
                              )}
                            >
                              {item.status}
                            </Badge>
                          )}
                          {item.timestamp && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.timestamp}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
      {items.length > maxItems && onViewAll && (
        <CardFooter className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-rust hover:text-rust/80"
            onClick={onViewAll}
          >
            View all {items.length} items
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// =====================================================
// CHART WIDGET
// =====================================================

export interface ChartWidgetProps {
  title: string;
  data?: ChartDataPoint[];
  type?: 'bar' | 'donut';
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ChartWidget({
  title,
  data = [],
  type = 'bar',
  isLoading = false,
  onClick,
  className,
}: ChartWidgetProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn('cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === 'bar' ? (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color || '#D87254',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {/* Simple donut visualization */}
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {data.reduce<{ offset: number; elements: React.ReactNode[] }>(
                  (acc, item, index) => {
                    const percentage = (item.value / total) * 100;
                    const circumference = 2 * Math.PI * 35;
                    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -(acc.offset / 100) * circumference;

                    acc.elements.push(
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke={item.color || `hsl(${index * 60}, 60%, 50%)`}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                    acc.offset += percentage;
                    return acc;
                  },
                  { offset: 0, elements: [] }
                ).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-charcoal">{total}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color || `hsl(${index * 60}, 60%, 50%)` }}
                  />
                  <span className="text-muted-foreground flex-1">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// PIPELINE WIDGET
// =====================================================

export interface PipelineWidgetProps {
  title: string;
  stages?: PipelineStage[];
  isLoading?: boolean;
  onStageClick?: (stage: PipelineStage) => void;
  className?: string;
}

export function PipelineWidget({
  title,
  stages = [],
  isLoading = false,
  onStageClick,
  className,
}: PipelineWidgetProps) {
  const totalCount = stages.reduce((sum, stage) => sum + stage.count, 0);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 flex-1" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          <Badge variant="secondary" className="text-xs">
            {totalCount} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Pipeline bar */}
        <div className="h-3 flex rounded-full overflow-hidden mb-4">
          {stages.map((stage, index) => {
            const width = totalCount > 0 ? (stage.count / totalCount) * 100 : 0;
            return (
              <div
                key={stage.id}
                className="transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: stage.color,
                  minWidth: stage.count > 0 ? '4px' : '0',
                }}
                title={`${stage.name}: ${stage.count}`}
              />
            );
          })}
        </div>

        {/* Stage cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stages.map((stage) => (
            <button
              key={stage.id}
              className={cn(
                'p-3 rounded-lg border border-border text-left',
                'hover:border-rust/30 hover:bg-muted/50 transition-colors'
              )}
              onClick={() => onStageClick?.(stage)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {stage.name}
                </span>
              </div>
              <div className="text-xl font-bold text-charcoal">
                {stage.count}
              </div>
              {stage.value !== undefined && (
                <div className="text-xs text-muted-foreground">
                  ${stage.value.toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// ACTIVITY WIDGET
// =====================================================

export interface ActivityItem {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'submission' | 'interview';
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
  entityType?: EntityType;
  entityId?: string;
  entityTitle?: string;
}

export interface ActivityWidgetProps {
  title: string;
  activities?: ActivityItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
  className?: string;
}

const ACTIVITY_ICONS: Record<ActivityItem['type'], LucideIcon> = {
  call: CheckCircle2,
  email: Send,
  meeting: Calendar,
  note: AlertCircle,
  task: CheckCircle2,
  submission: Send,
  interview: Calendar,
};

export function ActivityWidget({
  title,
  activities = [],
  isLoading = false,
  onViewAll,
  className,
}: ActivityWidgetProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[300px]">
          <div className="px-4 pb-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

              {/* Activity items */}
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = ACTIVITY_ICONS[activity.type];
                  return (
                    <div key={activity.id} className="relative pl-10">
                      {/* Icon */}
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>

                      {/* Content */}
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{activity.timestamp}</span>
                          {activity.user && (
                            <>
                              <span>•</span>
                              <span>{activity.user}</span>
                            </>
                          )}
                        </div>
                        {activity.entityType && activity.entityTitle && (
                          <button
                            className="mt-1 text-xs text-rust hover:underline"
                            onClick={() => {
                              if (activity.entityType && activity.entityId) {
                                const config = entityRegistry[activity.entityType];
                                if (config) {
                                  router.push(config.routes.detail(activity.entityId));
                                }
                              }
                            }}
                          >
                            {activity.entityTitle}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      {onViewAll && (
        <CardFooter className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-rust hover:text-rust/80"
            onClick={onViewAll}
          >
            View all activity
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// =====================================================
// QUICK ACTIONS WIDGET
// =====================================================

export interface QuickActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  shortcut?: string;
}

export interface QuickActionsWidgetProps {
  title: string;
  actions: QuickActionItem[];
  className?: string;
}

export function QuickActionsWidget({
  title,
  actions,
  className,
}: QuickActionsWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto py-3 px-4 flex flex-col items-center gap-2 hover:border-rust hover:text-rust"
                onClick={action.onClick}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{action.label}</span>
                {action.shortcut && (
                  <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {action.shortcut}
                  </kbd>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default {
  MetricWidget,
  ListWidget,
  ChartWidget,
  PipelineWidget,
  ActivityWidget,
  QuickActionsWidget,
};
