/**
 * Activity Queries
 * 
 * Helper functions for common activity queries.
 * These are higher-level queries that combine multiple operations.
 */

import { activityService } from './activity-service';
import type {
  Activity,
  ActivityFilters,
  ActivitySummary,
  ActivityQueueItem,
  TimelineEntry,
  ActivityType,
  ActivityStatus,
} from './activity.types';
import type { EntityType } from '@/types/core/entity.types';

/**
 * Get a user's activity queue (their assigned activities)
 * Organized by urgency: overdue, due today, upcoming
 */
export async function getMyActivities(
  orgId: string,
  userId: string,
  options?: { limit?: number }
): Promise<{
  overdue: ActivityQueueItem[];
  dueToday: ActivityQueueItem[];
  upcoming: ActivityQueueItem[];
  total: number;
}> {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  
  // Get all open/in_progress activities for user
  const allActivities = await activityService.getMany({
    orgId,
    assignedTo: userId,
    status: ['open', 'in_progress'],
    orderBy: 'dueDate',
    orderDir: 'asc',
    limit: options?.limit ?? 50,
  });
  
  const overdue: ActivityQueueItem[] = [];
  const dueToday: ActivityQueueItem[] = [];
  const upcoming: ActivityQueueItem[] = [];
  
  for (const activity of allActivities) {
    const item = mapToQueueItem(activity);
    
    if (activity.dueDate < now) {
      item.isOverdue = true;
      overdue.push(item);
    } else if (activity.dueDate <= endOfToday) {
      dueToday.push(item);
    } else {
      upcoming.push(item);
    }
  }
  
  return {
    overdue,
    dueToday,
    upcoming,
    total: allActivities.length,
  };
}

/**
 * Get activities for an entity (candidate, job, etc.)
 */
export async function getEntityActivities(
  orgId: string,
  entityType: EntityType,
  entityId: string,
  options?: {
    limit?: number;
    includeCompleted?: boolean;
    includeEvents?: boolean;
  }
): Promise<{
  activities: Activity[];
  openCount: number;
  completedCount: number;
  lastActivityAt?: Date;
}> {
  const includeCompleted = options?.includeCompleted ?? true;
  
  const activities = await activityService.getForEntity(
    orgId,
    entityType,
    entityId,
    {
      limit: options?.limit,
      includeCompleted,
    }
  );
  
  const openCount = activities.filter(
    a => a.status === 'open' || a.status === 'in_progress'
  ).length;
  
  const completedCount = activities.filter(
    a => a.status === 'completed'
  ).length;
  
  const lastActivityAt = activities.length > 0
    ? activities[0].completedAt ?? activities[0].updatedAt
    : undefined;
  
  return {
    activities,
    openCount,
    completedCount,
    lastActivityAt,
  };
}

/**
 * Get unified timeline for an entity (activities + events)
 */
export async function getEntityTimeline(
  orgId: string,
  entityType: EntityType,
  entityId: string,
  options?: {
    limit?: number;
    types?: ('activity' | 'event')[];
    activityTypes?: ActivityType[];
  }
): Promise<TimelineEntry[]> {
  const entries: TimelineEntry[] = [];
  const includeActivities = !options?.types || options.types.includes('activity');
  const includeEvents = !options?.types || options.types.includes('event');
  
  // Get activities
  if (includeActivities) {
    const activities = await activityService.getForEntity(
      orgId,
      entityType,
      entityId,
      { limit: options?.limit ?? 50, includeCompleted: true }
    );
    
    for (const activity of activities) {
      // Filter by activity type if specified
      if (options?.activityTypes && !options.activityTypes.includes(activity.activityType)) {
        continue;
      }
      
      entries.push({
        id: activity.id,
        type: 'activity',
        timestamp: activity.completedAt ?? activity.createdAt,
        activity: {
          activityNumber: activity.activityNumber,
          activityType: activity.activityType,
          subject: activity.subject,
          status: activity.status,
          outcome: activity.outcome,
          durationMinutes: activity.durationMinutes,
          performedBy: activity.performedBy,
        },
      });
    }
  }
  
  // Get events (would need event service)
  // TODO: Integrate with event service
  if (includeEvents) {
    // const events = await eventService.getForEntity(orgId, entityType, entityId);
    // for (const event of events) { ... }
  }
  
  // Sort by timestamp (most recent first)
  entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Apply limit
  if (options?.limit) {
    return entries.slice(0, options.limit);
  }
  
  return entries;
}

/**
 * Get activity statistics for a team/period
 */
export async function getActivityStats(
  orgId: string,
  options?: {
    userId?: string;
    teamId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{
  totalCreated: number;
  totalCompleted: number;
  completionRate: number;
  avgDurationMinutes: number;
  byType: Record<ActivityType, number>;
  byOutcome: Record<string, number>;
  overdueClosed: number;
  onTimeRate: number;
}> {
  // Get activities for the period
  const filters: ActivityFilters = {
    orgId,
    limit: 1000,  // Reasonable limit for stats
  };
  
  if (options?.userId) {
    filters.assignedTo = options.userId;
  }
  
  if (options?.startDate) {
    filters.dueAfter = options.startDate;
  }
  
  if (options?.endDate) {
    filters.dueBefore = options.endDate;
  }
  
  const activities = await activityService.getMany(filters);
  
  // Calculate stats
  const completed = activities.filter(a => a.status === 'completed');
  const totalDuration = completed.reduce(
    (sum, a) => sum + (a.durationMinutes ?? 0),
    0
  );
  
  const byType: Record<string, number> = {};
  const byOutcome: Record<string, number> = {};
  let overdueClosedCount = 0;
  
  for (const activity of activities) {
    byType[activity.activityType] = (byType[activity.activityType] ?? 0) + 1;
    
    if (activity.outcome) {
      byOutcome[activity.outcome] = (byOutcome[activity.outcome] ?? 0) + 1;
    }
    
    if (
      activity.status === 'completed' &&
      activity.completedAt &&
      activity.completedAt > activity.dueDate
    ) {
      overdueClosedCount++;
    }
  }
  
  const completedOnTime = completed.length - overdueClosedCount;
  
  return {
    totalCreated: activities.length,
    totalCompleted: completed.length,
    completionRate: activities.length > 0
      ? (completed.length / activities.length) * 100
      : 0,
    avgDurationMinutes: completed.length > 0
      ? totalDuration / completed.length
      : 0,
    byType: byType as Record<ActivityType, number>,
    byOutcome,
    overdueClosed: overdueClosedCount,
    onTimeRate: completed.length > 0
      ? (completedOnTime / completed.length) * 100
      : 100,
  };
}

/**
 * Check if entity has required activities for a transition
 */
export async function checkTransitionRequirements(
  orgId: string,
  entityType: EntityType,
  entityId: string,
  requirements: {
    activityType: ActivityType;
    minCount: number;
    status: ActivityStatus;
  }[]
): Promise<{
  met: boolean;
  missing: { type: ActivityType; required: number; actual: number }[];
}> {
  const activities = await activityService.getForEntity(
    orgId,
    entityType,
    entityId,
    { includeCompleted: true }
  );
  
  const missing: { type: ActivityType; required: number; actual: number }[] = [];
  
  for (const req of requirements) {
    const count = activities.filter(
      a => a.activityType === req.activityType && a.status === req.status
    ).length;
    
    if (count < req.minCount) {
      missing.push({
        type: req.activityType,
        required: req.minCount,
        actual: count,
      });
    }
  }
  
  return {
    met: missing.length === 0,
    missing,
  };
}

/**
 * Get stale entities (no activity for X days)
 */
export async function getStaleEntities(
  orgId: string,
  entityType: EntityType,
  daysSinceActivity: number,
  options?: { limit?: number }
): Promise<{ entityId: string; lastActivityAt: Date; daysSince: number }[]> {
  // This would need to query activities grouped by entity
  // and find those with no recent activity
  // For now, return empty array
  console.warn('getStaleEntities not fully implemented');
  return [];
}

/**
 * Helper: Map Activity to QueueItem
 */
function mapToQueueItem(activity: Activity): ActivityQueueItem {
  const now = new Date();
  
  return {
    id: activity.id,
    activityNumber: activity.activityNumber,
    activityType: activity.activityType,
    subject: activity.subject,
    status: activity.status,
    priority: activity.priority,
    dueDate: activity.dueDate,
    isOverdue: activity.dueDate < now && 
      (activity.status === 'open' || activity.status === 'in_progress'),
    entityType: activity.entityType,
    entityId: activity.entityId,
  };
}

