/**
 * Activity Queue Component
 * 
 * Shows the user's activity queue with overdue, due today, and upcoming sections.
 * Can be used as a sidebar widget or full-page view.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

'use client';

import React, { useMemo } from 'react';
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone, Mail, Calendar, CheckCircle, AlertTriangle,
  Clock, ArrowRight, MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ==========================================
// TYPES
// ==========================================

interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface Activity {
  id: string;
  activityType: string;
  subject: string;
  status: string;
  priority?: string;
  dueDate?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  assignee?: User;
}

export interface ActivityQueueProps {
  /** List of activities */
  activities: Activity[];
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Compact mode for sidebar widget */
  compact?: boolean;
  
  /** Maximum items to show in compact mode */
  maxItems?: number;
  
  /** Callback when clicking an activity */
  onActivityClick?: (activity: Activity) => void;
  
  /** Callback when completing an activity */
  onComplete?: (activityId: string) => void;
  
  /** Callback to view all activities */
  onViewAll?: () => void;
  
  /** Additional className */
  className?: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const ACTIVITY_TYPE_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle,
};

const PRIORITY_CONFIG: Record<string, { color: string; bgColor: string }> = {
  critical: { color: 'text-red-700', bgColor: 'bg-red-100' },
  high: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  medium: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  low: { color: 'text-green-700', bgColor: 'bg-green-100' },
};

// ==========================================
// HELPER COMPONENTS
// ==========================================

function ActivityCard({
  activity,
  onClick,
  onComplete,
  compact = false,
}: {
  activity: Activity;
  onClick?: () => void;
  onComplete?: () => void;
  compact?: boolean;
}) {
  const Icon = ACTIVITY_TYPE_ICONS[activity.activityType] || CheckCircle;
  const isOverdue = activity.dueDate && isPast(new Date(activity.dueDate));
  const priorityConfig = PRIORITY_CONFIG[activity.priority || 'medium'];
  
  const getDueDateLabel = () => {
    if (!activity.dueDate) return null;
    const date = new Date(activity.dueDate);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue ${formatDistanceToNow(date)}`;
    return format(date, 'MMM d');
  };
  
  return (
    <div 
      className={cn(
        'group flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        'hover:bg-stone-50',
        isOverdue && 'border-l-2 border-l-red-500',
        compact && 'py-2'
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn(
        'p-1.5 rounded-full flex-shrink-0',
        isOverdue ? 'bg-red-100' : 'bg-stone-100'
      )}>
        <Icon className={cn(
          'h-4 w-4',
          isOverdue ? 'text-red-600' : 'text-stone-600'
        )} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium truncate',
            compact ? 'text-sm' : 'text-sm'
          )}>
            {activity.subject}
          </span>
          {activity.priority && activity.priority !== 'medium' && (
            <Badge 
              variant="secondary"
              className={cn('text-[10px] px-1', priorityConfig.bgColor, priorityConfig.color)}
            >
              {activity.priority}
            </Badge>
          )}
        </div>
        
        {!compact && activity.entityName && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {activity.entityType}: {activity.entityName}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-1">
          {activity.dueDate && (
            <span className={cn(
              'text-xs',
              isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
            )}>
              {getDueDateLabel()}
            </span>
          )}
        </div>
      </div>
      
      {/* Quick actions */}
      {!compact && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onComplete?.(); }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Calendar className="h-4 w-4 mr-2" />
              Reschedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function QueueSection({
  title,
  icon: Icon,
  count,
  activities,
  onActivityClick,
  onComplete,
  compact,
  variant = 'default',
}: {
  title: string;
  icon: typeof AlertTriangle;
  count: number;
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onComplete?: (activityId: string) => void;
  compact?: boolean;
  variant?: 'overdue' | 'today' | 'default';
}) {
  if (activities.length === 0) return null;
  
  const headerColors = {
    overdue: 'text-red-700 bg-red-50',
    today: 'text-amber-700 bg-amber-50',
    default: 'text-stone-700 bg-stone-50',
  };
  
  return (
    <div className="space-y-1">
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md',
        headerColors[variant]
      )}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {count}
        </Badge>
      </div>
      
      <div className="space-y-0.5">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onClick={() => onActivityClick?.(activity)}
            onComplete={() => onComplete?.(activity.id)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityQueue({
  activities,
  isLoading = false,
  compact = false,
  maxItems = 10,
  onActivityClick,
  onComplete,
  onViewAll,
  className,
}: ActivityQueueProps) {
  // Categorize activities
  const { overdue, today, upcoming } = useMemo(() => {
    const now = new Date();
    const categorized = {
      overdue: [] as Activity[],
      today: [] as Activity[],
      upcoming: [] as Activity[],
    };
    
    // Filter to open activities only
    const openActivities = activities.filter(a => 
      a.status === 'open' || a.status === 'in_progress'
    );
    
    for (const activity of openActivities) {
      if (!activity.dueDate) {
        categorized.upcoming.push(activity);
        continue;
      }
      
      const dueDate = new Date(activity.dueDate);
      
      if (isPast(dueDate) && !isToday(dueDate)) {
        categorized.overdue.push(activity);
      } else if (isToday(dueDate)) {
        categorized.today.push(activity);
      } else {
        categorized.upcoming.push(activity);
      }
    }
    
    // Sort each category by priority then due date
    const sortFn = (a: Activity, b: Activity) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    };
    
    categorized.overdue.sort(sortFn);
    categorized.today.sort(sortFn);
    categorized.upcoming.sort(sortFn);
    
    return categorized;
  }, [activities]);
  
  // Limit items in compact mode
  const displayActivities = compact ? {
    overdue: overdue.slice(0, 3),
    today: today.slice(0, 3),
    upcoming: upcoming.slice(0, Math.max(0, maxItems - overdue.length - today.length)),
  } : { overdue, today, upcoming };
  
  const totalCount = overdue.length + today.length + upcoming.length;
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">My Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (totalCount === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">My Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No pending activities</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Activities</CardTitle>
            <div className="flex items-center gap-2">
              {overdue.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {overdue.length} overdue
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {totalCount} total
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <QueueSection
              title="Overdue"
              icon={AlertTriangle}
              count={overdue.length}
              activities={displayActivities.overdue}
              onActivityClick={onActivityClick}
              onComplete={onComplete}
              compact={compact}
              variant="overdue"
            />
            
            <QueueSection
              title="Due Today"
              icon={Clock}
              count={today.length}
              activities={displayActivities.today}
              onActivityClick={onActivityClick}
              onComplete={onComplete}
              compact={compact}
              variant="today"
            />
            
            <QueueSection
              title="Upcoming"
              icon={Calendar}
              count={upcoming.length}
              activities={displayActivities.upcoming}
              onActivityClick={onActivityClick}
              onComplete={onComplete}
              compact={compact}
            />
          </div>
          
          {onViewAll && (
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={onViewAll}
            >
              View All Activities
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Full view with tabs
  return (
    <div className={className}>
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Activities</h2>
          
          <TabsList>
            <TabsTrigger value="all">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="overdue" className={overdue.length > 0 ? 'text-red-600' : ''}>
              Overdue ({overdue.length})
            </TabsTrigger>
            <TabsTrigger value="today">
              Today ({today.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcoming.length})
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          <QueueSection
            title="Overdue"
            icon={AlertTriangle}
            count={overdue.length}
            activities={overdue}
            onActivityClick={onActivityClick}
            onComplete={onComplete}
            variant="overdue"
          />
          
          <QueueSection
            title="Due Today"
            icon={Clock}
            count={today.length}
            activities={today}
            onActivityClick={onActivityClick}
            onComplete={onComplete}
            variant="today"
          />
          
          <QueueSection
            title="Upcoming"
            icon={Calendar}
            count={upcoming.length}
            activities={upcoming}
            onActivityClick={onActivityClick}
            onComplete={onComplete}
          />
        </TabsContent>
        
        <TabsContent value="overdue">
          <QueueSection
            title="Overdue"
            icon={AlertTriangle}
            count={overdue.length}
            activities={overdue}
            onActivityClick={onActivityClick}
            onComplete={onComplete}
            variant="overdue"
          />
        </TabsContent>
        
        <TabsContent value="today">
          <QueueSection
            title="Due Today"
            icon={Clock}
            count={today.length}
            activities={today}
            onActivityClick={onActivityClick}
            onComplete={onComplete}
            variant="today"
          />
        </TabsContent>
        
        <TabsContent value="upcoming">
          <QueueSection
            title="Upcoming"
            icon={Calendar}
            count={upcoming.length}
            activities={upcoming}
            onActivityClick={onActivityClick}
            onComplete={onComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ActivityQueue;

