/**
 * Queue Manager
 *
 * Manages activity queues for users and teams.
 * Handles prioritization, claiming, and queue statistics.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema/activities';
import { pods } from '@/lib/db/schema/ta-hr';
import { eq, and, or, inArray, sql, asc, isNull } from 'drizzle-orm';
import { calculateSLAStatus, type SLAStatus, type Priority } from './sla';

// ============================================================================
// TYPES
// ============================================================================

export interface QueueActivity {
  id: string;
  subject: string | null;
  activityType: string;
  status: string;
  priority: string;
  dueDate: Date;
  entityType: string;
  entityId: string;
  assignedTo: string;
  createdAt: Date;
  slaStatus: SLAStatus;
  priorityScore: number;
}

export interface QueueOptions {
  status?: ('pending' | 'open' | 'in_progress')[];
  limit?: number;
  includeSnoozed?: boolean;
  activityTypes?: string[];
}

export interface TeamQueueOptions extends QueueOptions {
  includeUnassigned?: boolean;
}

export interface QueueStats {
  total: number;
  byStatus: {
    pending: number;
    open: number;
    in_progress: number;
  };
  bySLA: {
    breached: number;
    at_risk: number;
    on_track: number;
  };
  byPriority: {
    critical: number;
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  overdueCount: number;
}

// ============================================================================
// QUEUE MANAGER
// ============================================================================

export class QueueManager {
  /**
   * Get personal work queue for a user
   */
  async getPersonalQueue(
    userId: string,
    orgId: string,
    options?: QueueOptions
  ): Promise<QueueActivity[]> {
    const statuses = options?.status ?? ['open', 'in_progress'];
    const limit = options?.limit ?? 50;

    const conditions = [
      eq(activities.assignedTo, userId),
      eq(activities.orgId, orgId),
      inArray(activities.status, statuses),
    ];

    // Filter by activity types if specified
    if (options?.activityTypes && options.activityTypes.length > 0) {
      conditions.push(inArray(activities.activityType, options.activityTypes));
    }

    const results = await db
      .select({
        id: activities.id,
        subject: activities.subject,
        activityType: activities.activityType,
        status: activities.status,
        priority: activities.priority,
        dueDate: activities.dueDate,
        entityType: activities.entityType,
        entityId: activities.entityId,
        assignedTo: activities.assignedTo,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .where(and(...conditions))
      .orderBy(
        // Priority order: critical > urgent > high > normal > low
        sql`CASE ${activities.priority}
          WHEN 'critical' THEN 1
          WHEN 'urgent' THEN 2
          WHEN 'high' THEN 3
          WHEN 'normal' THEN 4
          WHEN 'medium' THEN 4
          WHEN 'low' THEN 5
          ELSE 6
        END`,
        // Then by due date (earliest first)
        asc(activities.dueDate)
      )
      .limit(limit);

    return results.map((activity) => ({
      ...activity,
      slaStatus: calculateSLAStatus(activity.dueDate, activity.priority as Priority),
      priorityScore: this.calculatePriorityScore({
        priority: activity.priority,
        dueDate: activity.dueDate,
        slaStatus: calculateSLAStatus(activity.dueDate, activity.priority as Priority),
      }),
    }));
  }

  /**
   * Get team queue (for managers)
   */
  async getTeamQueue(
    teamId: string,
    orgId: string,
    options?: TeamQueueOptions
  ): Promise<QueueActivity[]> {
    const statuses = options?.status ?? ['open', 'in_progress'];
    const limit = options?.limit ?? 100;

    // Get pod info to find team members
    const pod = await db.query.pods.findFirst({
      where: eq(pods.id, teamId),
    });

    if (!pod) {
      throw new Error('Team not found');
    }

    // Collect member IDs (senior + junior)
    const memberIds: string[] = [];
    if (pod.seniorMemberId) memberIds.push(pod.seniorMemberId);
    if (pod.juniorMemberId) memberIds.push(pod.juniorMemberId);

    if (memberIds.length === 0) {
      return [];
    }

    const conditions = [
      eq(activities.orgId, orgId),
      inArray(activities.status, statuses),
    ];

    // Include unassigned activities or team member activities
    if (options?.includeUnassigned) {
      conditions.push(
        or(inArray(activities.assignedTo, memberIds), isNull(activities.assignedTo))!
      );
    } else {
      conditions.push(inArray(activities.assignedTo, memberIds));
    }

    // Filter by activity types if specified
    if (options?.activityTypes && options.activityTypes.length > 0) {
      conditions.push(inArray(activities.activityType, options.activityTypes));
    }

    const results = await db
      .select({
        id: activities.id,
        subject: activities.subject,
        activityType: activities.activityType,
        status: activities.status,
        priority: activities.priority,
        dueDate: activities.dueDate,
        entityType: activities.entityType,
        entityId: activities.entityId,
        assignedTo: activities.assignedTo,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .where(and(...conditions))
      .orderBy(
        // SLA status order: breached > at_risk > on_track
        sql`CASE
          WHEN ${activities.dueDate} < NOW() THEN 1
          WHEN ${activities.dueDate} < NOW() + INTERVAL '4 hours' THEN 2
          ELSE 3
        END`,
        // Then by due date
        asc(activities.dueDate)
      )
      .limit(limit);

    return results.map((activity) => ({
      ...activity,
      slaStatus: calculateSLAStatus(activity.dueDate, activity.priority as Priority),
      priorityScore: this.calculatePriorityScore({
        priority: activity.priority,
        dueDate: activity.dueDate,
        slaStatus: calculateSLAStatus(activity.dueDate, activity.priority as Priority),
      }),
    }));
  }

  /**
   * Claim an activity from the queue
   */
  async claim(activityId: string, userId: string, orgId: string): Promise<typeof activities.$inferSelect> {
    // Get the activity
    const [activity] = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.id, activityId),
          eq(activities.orgId, orgId)
        )
      )
      .limit(1);

    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.assignedTo && activity.assignedTo !== userId) {
      throw new Error('Activity is already assigned to another user');
    }

    const [updated] = await db
      .update(activities)
      .set({
        assignedTo: userId,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    return updated;
  }

  /**
   * Unclaim an activity (return to queue)
   */
  async unclaim(activityId: string, userId: string, orgId: string): Promise<typeof activities.$inferSelect> {
    // Get the activity
    const [activity] = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.id, activityId),
          eq(activities.orgId, orgId)
        )
      )
      .limit(1);

    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.assignedTo !== userId) {
      throw new Error('You can only unclaim activities assigned to you');
    }

    if (activity.status === 'in_progress') {
      throw new Error('Cannot unclaim an activity that is in progress');
    }

    const [updated] = await db
      .update(activities)
      .set({
        assignedTo: null as unknown as string, // Set to null for unclaiming
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    return updated;
  }

  /**
   * Get next recommended activity for a user
   */
  async getNextRecommended(userId: string, orgId: string): Promise<QueueActivity | null> {
    const queue = await this.getPersonalQueue(userId, orgId, { limit: 1 });
    return queue[0] ?? null;
  }

  /**
   * Calculate priority score (0-100, higher = more urgent)
   */
  calculatePriorityScore(activity: {
    priority: string;
    dueDate: Date | null;
    slaStatus?: SLAStatus;
  }): number {
    let score = 0;

    // Priority base score (0-40)
    const priorityScores: Record<string, number> = {
      critical: 40,
      urgent: 35,
      high: 30,
      normal: 20,
      medium: 20,
      low: 10,
    };
    score += priorityScores[activity.priority] ?? 10;

    // SLA status score (0-40)
    const slaScores: Record<SLAStatus, number> = {
      breached: 40,
      at_risk: 25,
      on_track: 0,
    };
    score += slaScores[activity.slaStatus ?? 'on_track'] ?? 0;

    // Time urgency score (0-20)
    if (activity.dueDate) {
      const hoursUntilDue =
        (activity.dueDate.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilDue < 0) {
        score += 20; // Overdue
      } else if (hoursUntilDue < 2) {
        score += 15;
      } else if (hoursUntilDue < 8) {
        score += 10;
      } else if (hoursUntilDue < 24) {
        score += 5;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Sort activities by priority
   */
  sortByPriority<T extends { priorityScore?: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(userId: string, orgId: string): Promise<QueueStats> {
    const queue = await this.getPersonalQueue(userId, orgId, { limit: 1000 });

    const stats: QueueStats = {
      total: queue.length,
      byStatus: {
        pending: 0,
        open: queue.filter((a) => a.status === 'open').length,
        in_progress: queue.filter((a) => a.status === 'in_progress').length,
      },
      bySLA: {
        breached: queue.filter((a) => a.slaStatus === 'breached').length,
        at_risk: queue.filter((a) => a.slaStatus === 'at_risk').length,
        on_track: queue.filter((a) => a.slaStatus === 'on_track').length,
      },
      byPriority: {
        critical: queue.filter((a) => a.priority === 'critical').length,
        urgent: queue.filter((a) => a.priority === 'urgent').length,
        high: queue.filter((a) => a.priority === 'high').length,
        normal: queue.filter(
          (a) => a.priority === 'normal' || a.priority === 'medium'
        ).length,
        low: queue.filter((a) => a.priority === 'low').length,
      },
      overdueCount: queue.filter(
        (a) => a.dueDate && a.dueDate < new Date()
      ).length,
    };

    return stats;
  }

  /**
   * Get team queue statistics
   */
  async getTeamQueueStats(teamId: string, orgId: string): Promise<QueueStats & { memberStats: Record<string, QueueStats> }> {
    const queue = await this.getTeamQueue(teamId, orgId, { limit: 1000 });

    // Get pod members
    const pod = await db.query.pods.findFirst({
      where: eq(pods.id, teamId),
    });

    const memberStats: Record<string, QueueStats> = {};

    if (pod) {
      const memberIds = [pod.seniorMemberId, pod.juniorMemberId].filter(Boolean) as string[];

      for (const memberId of memberIds) {
        const memberQueue = queue.filter((a) => a.assignedTo === memberId);
        memberStats[memberId] = {
          total: memberQueue.length,
          byStatus: {
            pending: 0,
            open: memberQueue.filter((a) => a.status === 'open').length,
            in_progress: memberQueue.filter((a) => a.status === 'in_progress').length,
          },
          bySLA: {
            breached: memberQueue.filter((a) => a.slaStatus === 'breached').length,
            at_risk: memberQueue.filter((a) => a.slaStatus === 'at_risk').length,
            on_track: memberQueue.filter((a) => a.slaStatus === 'on_track').length,
          },
          byPriority: {
            critical: memberQueue.filter((a) => a.priority === 'critical').length,
            urgent: memberQueue.filter((a) => a.priority === 'urgent').length,
            high: memberQueue.filter((a) => a.priority === 'high').length,
            normal: memberQueue.filter(
              (a) => a.priority === 'normal' || a.priority === 'medium'
            ).length,
            low: memberQueue.filter((a) => a.priority === 'low').length,
          },
          overdueCount: memberQueue.filter(
            (a) => a.dueDate && a.dueDate < new Date()
          ).length,
        };
      }
    }

    return {
      total: queue.length,
      byStatus: {
        pending: 0,
        open: queue.filter((a) => a.status === 'open').length,
        in_progress: queue.filter((a) => a.status === 'in_progress').length,
      },
      bySLA: {
        breached: queue.filter((a) => a.slaStatus === 'breached').length,
        at_risk: queue.filter((a) => a.slaStatus === 'at_risk').length,
        on_track: queue.filter((a) => a.slaStatus === 'on_track').length,
      },
      byPriority: {
        critical: queue.filter((a) => a.priority === 'critical').length,
        urgent: queue.filter((a) => a.priority === 'urgent').length,
        high: queue.filter((a) => a.priority === 'high').length,
        normal: queue.filter(
          (a) => a.priority === 'normal' || a.priority === 'medium'
        ).length,
        low: queue.filter((a) => a.priority === 'low').length,
      },
      overdueCount: queue.filter((a) => a.dueDate && a.dueDate < new Date())
        .length,
      memberStats,
    };
  }
}

// Export singleton instance
export const queueManager = new QueueManager();
