/**
 * Activity Timeline Component
 * 
 * Unified timeline showing activities and events for an entity.
 * Central UI component for the activity-centric architecture.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

'use client';

import React, { useState, useMemo } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Phone, Mail, Calendar, CheckCircle, XCircle, Clock, 
  MessageSquare, Linkedin, FileText, Send, MoreVertical,
  ChevronDown, ChevronUp, Filter, Plus,
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
  type: 'activity';
  activityType: string;
  subject: string;
  body?: string;
  status: string;
  priority?: string;
  outcome?: string;
  direction?: 'inbound' | 'outbound';
  dueDate?: string;
  completedAt?: string;
  duration?: number;
  assignee?: User;
  createdBy?: User;
  createdAt: string;
  entityType?: string;
  entityId?: string;
}

interface Event {
  id: string;
  type: 'event';
  eventType: string;
  description?: string;
  occurredAt: string;
  actor?: User;
  metadata?: Record<string, unknown>;
}

type TimelineEntry = Activity | Event;

export interface ActivityTimelineProps {
  /** Entity type (candidate, job, etc.) */
  entityType: string;
  
  /** Entity ID */
  entityId: string;
  
  /** Combined activities and events */
  entries: TimelineEntry[];
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Whether to show events (default: true) */
  showEvents?: boolean;
  
  /** Whether to show filter controls */
  showFilters?: boolean;
  
  /** Callback when adding new activity */
  onAddActivity?: () => void;
  
  /** Callback when clicking an activity */
  onActivityClick?: (activity: Activity) => void;
  
  /** Callback when completing an activity */
  onComplete?: (activityId: string) => void;
  
  /** Callback when rescheduling an activity */
  onReschedule?: (activityId: string) => void;
  
  /** Additional className */
  className?: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const ACTIVITY_TYPE_CONFIG: Record<string, { icon: typeof Phone; color: string; bgColor: string }> = {
  call: { icon: Phone, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  email: { icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  meeting: { icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100' },
  task: { icon: CheckCircle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  note: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  sms: { icon: MessageSquare, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  linkedin: { icon: Linkedin, color: 'text-sky-600', bgColor: 'bg-sky-100' },
  submission: { icon: Send, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Open', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100' },
  deferred: { label: 'Deferred', color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  successful: { label: 'Successful', color: 'text-green-600' },
  unsuccessful: { label: 'Unsuccessful', color: 'text-red-600' },
  no_answer: { label: 'No Answer', color: 'text-gray-600' },
  left_voicemail: { label: 'Left Voicemail', color: 'text-amber-600' },
  rescheduled: { label: 'Rescheduled', color: 'text-blue-600' },
  pending_response: { label: 'Pending Response', color: 'text-purple-600' },
};

// ==========================================
// HELPER COMPONENTS
// ==========================================

function UserAvatar({ user, size = 'sm' }: { user?: User; size?: 'sm' | 'md' }) {
  if (!user) return null;
  
  const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';
  
  return (
    <Avatar className={sizeClass}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
      <AvatarFallback className={cn('bg-stone-200 text-stone-600', textClass)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function DateGroupHeader({ date }: { date: Date }) {
  let label: string;
  
  if (isToday(date)) {
    label = 'Today';
  } else if (isYesterday(date)) {
    label = 'Yesterday';
  } else {
    label = format(date, 'EEEE, MMMM d, yyyy');
  }
  
  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function ActivityItem({
  activity,
  onClick,
  onComplete,
  onReschedule,
}: {
  activity: Activity;
  onClick?: () => void;
  onComplete?: () => void;
  onReschedule?: () => void;
}) {
  const config = ACTIVITY_TYPE_CONFIG[activity.activityType] || ACTIVITY_TYPE_CONFIG.task;
  const statusConfig = STATUS_CONFIG[activity.status] || STATUS_CONFIG.open;
  const Icon = config.icon;
  
  const isOverdue = activity.dueDate && 
    new Date(activity.dueDate) < new Date() && 
    activity.status !== 'completed' &&
    activity.status !== 'cancelled';
  
  return (
    <div 
      className={cn(
        'group relative flex gap-3 py-3 px-3 rounded-lg transition-colors',
        'hover:bg-stone-50 cursor-pointer',
        isOverdue && 'border-l-2 border-l-red-500'
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn('p-2 rounded-full flex-shrink-0', config.bgColor)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{activity.subject}</span>
          {activity.priority && activity.priority !== 'medium' && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px] px-1.5 py-0',
                activity.priority === 'high' && 'border-orange-300 text-orange-600',
                activity.priority === 'critical' && 'border-red-300 text-red-600',
                activity.priority === 'low' && 'border-green-300 text-green-600'
              )}
            >
              {activity.priority}
            </Badge>
          )}
        </div>
        
        {activity.body && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {activity.body}
          </p>
        )}
        
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {/* Status */}
          <Badge 
            variant="secondary"
            className={cn('text-[10px]', statusConfig.bgColor, statusConfig.color)}
          >
            {statusConfig.label}
          </Badge>
          
          {/* Outcome */}
          {activity.outcome && (
            <span className={OUTCOME_CONFIG[activity.outcome]?.color}>
              {OUTCOME_CONFIG[activity.outcome]?.label || activity.outcome}
            </span>
          )}
          
          {/* Due date */}
          {activity.dueDate && activity.status !== 'completed' && (
            <span className={cn(isOverdue && 'text-red-600 font-medium')}>
              Due {formatDistanceToNow(new Date(activity.dueDate), { addSuffix: true })}
            </span>
          )}
          
          {/* Completed at */}
          {activity.completedAt && (
            <span>
              Completed {formatDistanceToNow(new Date(activity.completedAt), { addSuffix: true })}
            </span>
          )}
          
          {/* Assignee */}
          {activity.assignee && (
            <div className="flex items-center gap-1">
              <UserAvatar user={activity.assignee} size="sm" />
              <span>{activity.assignee.name || activity.assignee.firstName}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {activity.status !== 'completed' && activity.status !== 'cancelled' && (
              <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onComplete?.(); }}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onReschedule?.(); }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function EventItem({ event }: { event: Event }) {
  return (
    <div className="flex gap-3 py-2 px-3 text-sm text-muted-foreground">
      <div className="p-1.5 rounded-full bg-stone-100 flex-shrink-0">
        <Clock className="h-3 w-3 text-stone-500" />
      </div>
      <div className="flex-1 min-w-0">
        <span>{event.eventType.replace(/_/g, ' ')}</span>
        {event.description && (
          <span className="ml-1">&mdash; {event.description}</span>
        )}
      </div>
      <div className="text-xs flex-shrink-0">
        {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityTimeline({
  entityType: _entityType,
  entityId: _entityId,
  entries,
  isLoading = false,
  showEvents = true,
  showFilters = true,
  onAddActivity,
  onActivityClick,
  onComplete,
  onReschedule,
  className,
}: ActivityTimelineProps) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Filter and group entries by date
  const groupedEntries = useMemo(() => {
    let filtered = entries;
    
    // Filter by type
    if (filterType) {
      filtered = entries.filter(e => {
        if (e.type === 'activity') return e.activityType === filterType;
        return false;
      });
    }
    
    // Filter events if not showing
    if (!showEvents || !showAllEvents) {
      filtered = filtered.filter(e => e.type === 'activity');
    }
    
    // Sort by date (newest first)
    filtered = [...filtered].sort((a, b) => {
      const dateA = a.type === 'activity' ? a.createdAt : a.occurredAt;
      const dateB = b.type === 'activity' ? b.createdAt : b.occurredAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    // Group by date
    const groups = new Map<string, TimelineEntry[]>();
    
    for (const entry of filtered) {
      const date = entry.type === 'activity' ? entry.createdAt : entry.occurredAt;
      const dateKey = format(new Date(date), 'yyyy-MM-dd');
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(entry);
    }
    
    return groups;
  }, [entries, filterType, showEvents, showAllEvents]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity</h3>
        
        <div className="flex items-center gap-2">
          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  {filterType || 'All'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType(null)}>
                  All Activities
                </DropdownMenuItem>
                {Object.keys(ACTIVITY_TYPE_CONFIG).map((type) => (
                  <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {onAddActivity && (
            <Button size="sm" onClick={onAddActivity}>
              <Plus className="h-4 w-4 mr-1" />
              Log Activity
            </Button>
          )}
        </div>
      </div>
      
      {/* Events toggle */}
      {showEvents && (
        <button
          onClick={() => setShowAllEvents(!showAllEvents)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {showAllEvents ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showAllEvents ? 'Hide system events' : 'Show system events'}
        </button>
      )}
      
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border" />
        
        {groupedEntries.size === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities yet
          </div>
        ) : (
          Array.from(groupedEntries.entries()).map(([dateKey, dayEntries]) => (
            <div key={dateKey}>
              <DateGroupHeader date={new Date(dateKey)} />
              
              <div className="space-y-1">
                {dayEntries.map((entry) => (
                  entry.type === 'activity' ? (
                    <ActivityItem
                      key={entry.id}
                      activity={entry}
                      onClick={() => onActivityClick?.(entry)}
                      onComplete={() => onComplete?.(entry.id)}
                      onReschedule={() => onReschedule?.(entry.id)}
                    />
                  ) : (
                    <EventItem key={entry.id} event={entry} />
                  )
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityTimeline;

