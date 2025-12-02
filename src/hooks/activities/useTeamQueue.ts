/**
 * useTeamQueue Hook
 *
 * Manager's team view with workload distribution and SLA compliance.
 */

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { isPast, isToday, isTomorrow } from 'date-fns';
import { calculateSLAStatus } from '@/lib/activities/sla';
import type { ActivityStatus } from '@/lib/activities/transitions';
import type { Priority, SLAStatus } from '@/lib/activities/sla';

// ==========================================
// TYPES
// ==========================================

export interface TeamActivity {
  id: string;
  subject: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  entityType: string;
  entityId: string;
  slaStatus?: SLAStatus;
}

export interface TeamMemberWorkload {
  id: string;
  name: string;
  avatarUrl?: string;
  totalActivities: number;
  pendingCount: number;
  inProgressCount: number;
  overdueCount: number;
  atRiskCount: number;
  onTrackCount: number;
  completedTodayCount: number;
  healthScore: number; // 0-100
}

export interface TeamStats {
  totalActivities: number;
  totalOverdue: number;
  totalAtRisk: number;
  totalUnassigned: number;
  slaComplianceRate: number; // 0-100
  avgActivitiesPerMember: number;
  completedToday: number;
}

export interface UseTeamQueueOptions {
  /** Team member IDs to include */
  teamMemberIds?: string[];

  /** Include only specific statuses */
  statuses?: ActivityStatus[];

  /** Enable real-time updates */
  enableRealtime?: boolean;
}

export interface UseTeamQueueReturn {
  /** All team activities */
  activities: TeamActivity[];

  /** Workload by team member */
  memberWorkloads: TeamMemberWorkload[];

  /** Unassigned activities */
  unassignedActivities: TeamActivity[];

  /** Team statistics */
  stats: TeamStats;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Refetch */
  refetch: () => void;
}

// ==========================================
// HOOK
// ==========================================

export function useTeamQueue(options: UseTeamQueueOptions = {}): UseTeamQueueReturn {
  const {
    teamMemberIds,
    statuses = ['pending', 'in_progress'],
    enableRealtime = false,
  } = options;

  // Fetch overdue/pending activities
  const overdueQuery = trpc.activities.overdue.useQuery(
    { limit: 200 },
    { staleTime: enableRealtime ? 0 : 30000 }
  );

  // Process team data
  const processedData = useMemo(() => {
    if (!overdueQuery.data) {
      return {
        activities: [] as TeamActivity[],
        memberWorkloads: [] as TeamMemberWorkload[],
        unassignedActivities: [] as TeamActivity[],
        stats: {
          totalActivities: 0,
          totalOverdue: 0,
          totalAtRisk: 0,
          totalUnassigned: 0,
          slaComplianceRate: 100,
          avgActivitiesPerMember: 0,
          completedToday: 0,
        } as TeamStats,
      };
    }

    // Transform activities
    let activities = (overdueQuery.data as unknown as TeamActivity[]).map(activity => ({
      ...activity,
      slaStatus: activity.dueAt
        ? calculateSLAStatus(activity.dueAt, activity.priority)
        : undefined,
    }));

    // Filter by statuses
    if (statuses.length > 0) {
      activities = activities.filter(a => statuses.includes(a.status));
    }

    // Filter by team member IDs if provided
    if (teamMemberIds && teamMemberIds.length > 0) {
      activities = activities.filter(a =>
        !a.assigneeId || teamMemberIds.includes(a.assigneeId)
      );
    }

    // Separate unassigned
    const unassignedActivities = activities.filter(a => !a.assigneeId);
    const assignedActivities = activities.filter(a => a.assigneeId);

    // Group by team member
    const memberMap = new Map<string, TeamActivity[]>();
    assignedActivities.forEach(activity => {
      if (activity.assigneeId) {
        const existing = memberMap.get(activity.assigneeId) || [];
        existing.push(activity);
        memberMap.set(activity.assigneeId, existing);
      }
    });

    // Calculate workloads
    const memberWorkloads: TeamMemberWorkload[] = Array.from(memberMap.entries()).map(
      ([memberId, memberActivities]) => {
        const member = memberActivities[0]?.assignee;
        const pendingCount = memberActivities.filter(a => a.status === 'pending').length;
        const inProgressCount = memberActivities.filter(a => a.status === 'in_progress').length;
        const overdueCount = memberActivities.filter(a =>
          a.dueAt && isPast(new Date(a.dueAt)) && !isToday(new Date(a.dueAt))
        ).length;
        const atRiskCount = memberActivities.filter(a => a.slaStatus === 'at_risk').length;
        const onTrackCount = memberActivities.filter(a =>
          a.slaStatus === 'on_track' || !a.slaStatus
        ).length;

        // Health score: 100 - (overdue * 20 + at_risk * 10)
        const healthScore = Math.max(0, 100 - (overdueCount * 20) - (atRiskCount * 10));

        return {
          id: memberId,
          name: member?.name || 'Unknown',
          avatarUrl: member?.avatarUrl,
          totalActivities: memberActivities.length,
          pendingCount,
          inProgressCount,
          overdueCount,
          atRiskCount,
          onTrackCount,
          completedTodayCount: 0, // Would need separate query for completed activities
          healthScore,
        };
      }
    );

    // Sort by health score (worst first)
    memberWorkloads.sort((a, b) => a.healthScore - b.healthScore);

    // Calculate stats
    const totalOverdue = activities.filter(a =>
      a.dueAt && isPast(new Date(a.dueAt)) && !isToday(new Date(a.dueAt))
    ).length;
    const totalAtRisk = activities.filter(a => a.slaStatus === 'at_risk').length;
    const totalOnTrack = activities.filter(a =>
      a.slaStatus === 'on_track' || (!a.slaStatus && !a.dueAt)
    ).length;

    const slaComplianceRate = activities.length > 0
      ? Math.round((totalOnTrack / activities.length) * 100)
      : 100;

    const stats: TeamStats = {
      totalActivities: activities.length,
      totalOverdue,
      totalAtRisk,
      totalUnassigned: unassignedActivities.length,
      slaComplianceRate,
      avgActivitiesPerMember: memberWorkloads.length > 0
        ? Math.round(assignedActivities.length / memberWorkloads.length)
        : 0,
      completedToday: 0, // Would need separate query
    };

    return {
      activities,
      memberWorkloads,
      unassignedActivities,
      stats,
    };
  }, [overdueQuery.data, statuses, teamMemberIds]);

  return {
    ...processedData,
    isLoading: overdueQuery.isLoading,
    error: overdueQuery.error as Error | null,
    refetch: overdueQuery.refetch,
  };
}

export default useTeamQueue;
