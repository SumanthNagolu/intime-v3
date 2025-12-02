/**
 * Activity List View
 *
 * Full-featured list of activities with filtering, sorting, and grouping.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { format, isToday, isTomorrow, isThisWeek, isPast, startOfDay } from 'date-fns';
import {
  Calendar, Clock, AlertTriangle, Filter, SortAsc, SortDesc,
  CheckCircle, MoreVertical, ChevronDown, ChevronRight, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { calculateSLAStatus, getSLAColors, type SLAStatus, type Priority } from '@/lib/activities/sla';
import { getPattern, getCategoryColor, type PatternCategory } from '@/lib/activities/patterns';
import { getStatusConfig, type ActivityStatus } from '@/lib/activities/transitions';
import { ActivityStatusButtons } from '../actions/ActivityStatusButtons';

// ==========================================
// TYPES
// ==========================================

export interface Activity {
  id: string;
  subject: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  createdAt: string;
  completedAt?: string;
}

export type GroupBy = 'date' | 'status' | 'entity' | 'pattern' | 'priority' | 'none';
export type SortBy = 'dueAt' | 'priority' | 'createdAt' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface ActivityListProps {
  /** Activities to display */
  activities: Activity[];

  /** Loading state */
  isLoading?: boolean;

  /** Grouping option */
  groupBy?: GroupBy;

  /** Sort field */
  sortBy?: SortBy;

  /** Sort order */
  sortOrder?: SortOrder;

  /** Enable bulk selection */
  enableBulkSelect?: boolean;

  /** Selected activity IDs */
  selectedIds?: string[];

  /** Selection change handler */
  onSelectionChange?: (ids: string[]) => void;

  /** Activity click handler */
  onActivityClick?: (activity: Activity) => void;

  /** Status change handler */
  onStatusChange?: (activityId: string, status: ActivityStatus, data?: Record<string, unknown>) => void;

  /** Show filter controls */
  showFilters?: boolean;

  /** Show sort controls */
  showSort?: boolean;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getDateGroup(date: Date | null): string {
  if (!date) return 'No Due Date';
  if (isPast(date) && !isToday(date)) return 'Overdue';
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isThisWeek(date)) return 'This Week';
  return 'Later';
}

function groupActivities(
  activities: Activity[],
  groupBy: GroupBy
): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();

  if (groupBy === 'none') {
    groups.set('all', activities);
    return groups;
  }

  for (const activity of activities) {
    let key: string;

    switch (groupBy) {
      case 'date':
        key = getDateGroup(activity.dueAt ? new Date(activity.dueAt) : null);
        break;
      case 'status':
        key = activity.status;
        break;
      case 'entity':
        key = activity.entityType || 'No Entity';
        break;
      case 'pattern':
        key = activity.patternId;
        break;
      case 'priority':
        key = activity.priority;
        break;
      default:
        key = 'all';
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(activity);
  }

  return groups;
}

function sortActivities(
  activities: Activity[],
  sortBy: SortBy,
  sortOrder: SortOrder
): Activity[] {
  return [...activities].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'dueAt':
        const dateA = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
        const dateB = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
        comparison = dateA - dateB;
        break;
      case 'priority':
        const priorityOrder: Record<Priority, number> = {
          critical: 0, urgent: 1, high: 2, normal: 3, low: 4
        };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'status':
        const statusOrder: Record<ActivityStatus, number> = {
          in_progress: 0, pending: 1, deferred: 2, completed: 3, cancelled: 4
        };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function ActivityRow({
  activity,
  selected,
  onSelect,
  onClick,
  onStatusChange,
  enableBulkSelect,
}: {
  activity: Activity;
  selected: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: () => void;
  onStatusChange?: (status: ActivityStatus, data?: Record<string, unknown>) => void;
  enableBulkSelect?: boolean;
}) {
  const pattern = getPattern(activity.patternId);
  const statusConfig = getStatusConfig(activity.status);
  const slaStatus = calculateSLAStatus(activity.dueAt, activity.priority);
  const slaColors = getSLAColors(slaStatus);
  const isOverdue = activity.dueAt && isPast(new Date(activity.dueAt)) &&
    activity.status !== 'completed' && activity.status !== 'cancelled';

  const PatternIcon = pattern?.icon || CheckCircle;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg transition-colors',
        'hover:bg-muted/50 cursor-pointer',
        selected && 'bg-primary/5 border border-primary',
        isOverdue && 'border-l-2 border-l-red-500'
      )}
      onClick={onClick}
    >
      {/* Checkbox */}
      {enableBulkSelect && (
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Pattern Icon */}
      <div className={cn(
        'p-2 rounded-lg flex-shrink-0',
        pattern ? getCategoryColor(pattern.category) : 'bg-gray-100'
      )}>
        <PatternIcon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{activity.subject}</span>
          <Badge
            variant="outline"
            className={cn('text-[10px]', statusConfig.bgColor, statusConfig.color)}
          >
            {statusConfig.label}
          </Badge>
          {activity.priority !== 'normal' && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px]',
                activity.priority === 'critical' && 'border-red-300 text-red-600',
                activity.priority === 'urgent' && 'border-orange-300 text-orange-600',
                activity.priority === 'high' && 'border-amber-300 text-amber-600',
                activity.priority === 'low' && 'border-gray-300 text-gray-600'
              )}
            >
              {activity.priority}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          {/* Entity */}
          {activity.entityName && (
            <span className="truncate">
              {activity.entityType}: {activity.entityName}
            </span>
          )}

          {/* Due Date */}
          {activity.dueAt && (
            <span className={cn('flex items-center gap-1', isOverdue && 'text-red-600 font-medium')}>
              <Clock className="h-3 w-3" />
              {format(new Date(activity.dueAt), 'MMM d, h:mm a')}
            </span>
          )}

          {/* SLA Status */}
          {activity.dueAt && activity.status !== 'completed' && (
            <span className={cn('flex items-center gap-1', slaColors.text)}>
              <span className={cn('h-2 w-2 rounded-full', slaColors.dot)} />
              {slaStatus === 'on_track' ? 'On Track' :
               slaStatus === 'at_risk' ? 'At Risk' : 'Breached'}
            </span>
          )}
        </div>
      </div>

      {/* Assignee */}
      {activity.assigneeName && (
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={activity.assigneeAvatar} />
          <AvatarFallback className="text-xs">
            {activity.assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActivityStatusButtons
          activityId={activity.id}
          status={activity.status}
          patternId={activity.patternId}
          subject={activity.subject}
          onStatusChange={onStatusChange}
          compact
          size="sm"
          showReassign={false}
        />
      </div>
    </div>
  );
}

function GroupHeader({
  label,
  count,
  expanded,
  onToggle,
  variant,
}: {
  label: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  variant?: 'overdue' | 'today' | 'default';
}) {
  const variantStyles = {
    overdue: 'bg-red-50 text-red-700',
    today: 'bg-amber-50 text-amber-700',
    default: 'bg-muted text-foreground',
  };

  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
        variantStyles[variant || 'default']
      )}
    >
      {expanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
      <span>{label}</span>
      <Badge variant="secondary" className="ml-auto">
        {count}
      </Badge>
    </button>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityList({
  activities,
  isLoading = false,
  groupBy = 'date',
  sortBy = 'dueAt',
  sortOrder = 'asc',
  enableBulkSelect = false,
  selectedIds = [],
  onSelectionChange,
  onActivityClick,
  onStatusChange,
  showFilters = true,
  showSort = true,
  className,
}: ActivityListProps) {
  const [currentGroupBy, setCurrentGroupBy] = useState(groupBy);
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Overdue', 'Today', 'Tomorrow']));

  // Filter states
  const [statusFilter, setStatusFilter] = useState<ActivityStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);

  // Apply filters
  const filteredActivities = useMemo(() => {
    let result = activities;

    if (statusFilter.length > 0) {
      result = result.filter(a => statusFilter.includes(a.status));
    }

    if (priorityFilter.length > 0) {
      result = result.filter(a => priorityFilter.includes(a.priority));
    }

    return result;
  }, [activities, statusFilter, priorityFilter]);

  // Sort and group
  const sortedActivities = useMemo(() => {
    return sortActivities(filteredActivities, currentSortBy, currentSortOrder);
  }, [filteredActivities, currentSortBy, currentSortOrder]);

  const groupedActivities = useMemo(() => {
    return groupActivities(sortedActivities, currentGroupBy);
  }, [sortedActivities, currentGroupBy]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(activities.map(a => a.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const toggleSelection = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, id]);
    } else {
      onSelectionChange?.(selectedIds.filter(i => i !== id));
    }
  };

  const getGroupVariant = (group: string): 'overdue' | 'today' | 'default' => {
    if (group === 'Overdue') return 'overdue';
    if (group === 'Today') return 'today';
    return 'default';
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      {(showFilters || showSort || enableBulkSelect) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Select All */}
            {enableBulkSelect && (
              <Checkbox
                checked={selectedIds.length === activities.length && activities.length > 0}
                onCheckedChange={(checked) => toggleAll(checked as boolean)}
              />
            )}

            {/* Filter */}
            {showFilters && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                    {(statusFilter.length > 0 || priorityFilter.length > 0) && (
                      <Badge className="ml-1 h-5 w-5 p-0 justify-center">
                        {statusFilter.length + priorityFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  {(['pending', 'in_progress', 'completed', 'deferred'] as ActivityStatus[]).map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, status]);
                        } else {
                          setStatusFilter(statusFilter.filter(s => s !== status));
                        }
                      }}
                    >
                      {getStatusConfig(status).label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Priority</DropdownMenuLabel>
                  {(['critical', 'urgent', 'high', 'normal', 'low'] as Priority[]).map((priority) => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={priorityFilter.includes(priority)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPriorityFilter([...priorityFilter, priority]);
                        } else {
                          setPriorityFilter(priorityFilter.filter(p => p !== priority));
                        }
                      }}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Group By */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Group: {currentGroupBy}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(['date', 'status', 'priority', 'entity', 'pattern', 'none'] as GroupBy[]).map((g) => (
                  <DropdownMenuItem key={g} onClick={() => setCurrentGroupBy(g)}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sort */}
          {showSort && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort: {currentSortBy}
                    {currentSortOrder === 'asc' ? (
                      <SortAsc className="h-3 w-3 ml-1" />
                    ) : (
                      <SortDesc className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(['dueAt', 'priority', 'createdAt', 'status'] as SortBy[]).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => {
                        if (s === currentSortBy) {
                          setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setCurrentSortBy(s);
                        }
                      }}
                    >
                      {s === 'dueAt' ? 'Due Date' :
                       s === 'createdAt' ? 'Created Date' :
                       s.charAt(0).toUpperCase() + s.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        {groupedActivities.size === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No activities found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          Array.from(groupedActivities.entries()).map(([group, groupActivities]) => (
            currentGroupBy === 'none' ? (
              <div key="all" className="space-y-1">
                {groupActivities.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    selected={selectedIds.includes(activity.id)}
                    onSelect={(checked) => toggleSelection(activity.id, checked)}
                    onClick={() => onActivityClick?.(activity)}
                    onStatusChange={(status, data) => onStatusChange?.(activity.id, status, data)}
                    enableBulkSelect={enableBulkSelect}
                  />
                ))}
              </div>
            ) : (
              <Collapsible
                key={group}
                open={expandedGroups.has(group)}
                onOpenChange={() => toggleGroup(group)}
              >
                <CollapsibleTrigger asChild>
                  <div>
                    <GroupHeader
                      label={group}
                      count={groupActivities.length}
                      expanded={expandedGroups.has(group)}
                      onToggle={() => toggleGroup(group)}
                      variant={getGroupVariant(group)}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1">
                  {groupActivities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      selected={selectedIds.includes(activity.id)}
                      onSelect={(checked) => toggleSelection(activity.id, checked)}
                      onClick={() => onActivityClick?.(activity)}
                      onStatusChange={(status, data) => onStatusChange?.(activity.id, status, data)}
                      enableBulkSelect={enableBulkSelect}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityList;
