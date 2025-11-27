/**
 * HR Pods Server Actions
 *
 * Provides CRUD operations for pods (2-person teams) with RBAC enforcement.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/hr-pods
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ActionResult, PaginatedResult } from './types';
import {
  getCurrentUserContext,
  checkPermission,
  calculatePagination,
  calculateRange,
  logAuditEvent,
} from './helpers';

// ============================================================================
// Types
// ============================================================================

export interface Pod {
  id: string;
  name: string;
  podType: string;
  seniorMemberId: string | null;
  juniorMemberId: string | null;
  sprintDurationWeeks: number;
  placementsPerSprintTarget: number;
  totalPlacements: number;
  currentSprintPlacements: number;
  currentSprintStartDate: string | null;
  averagePlacementsPerSprint: number | null;
  isActive: boolean;
  formedDate: string | null;
  dissolvedDate: string | null;
  orgId: string;
  createdAt: string;
}

export interface PodWithMembers extends Pod {
  seniorMember?: {
    id: string;
    fullName: string;
    email: string;
    position: string | null;
    avatarUrl: string | null;
  } | null;
  juniorMember?: {
    id: string;
    fullName: string;
    email: string;
    position: string | null;
    avatarUrl: string | null;
  } | null;
  performance?: {
    thisWeekPlacements: number;
    thisMonthPlacements: number;
    onTrack: boolean;
  };
}

export interface PodFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  podType?: string;
  isActive?: boolean;
}

export interface CreatePodInput {
  name: string;
  podType: string;
  seniorMemberId?: string;
  juniorMemberId?: string;
  sprintDurationWeeks?: number;
  placementsPerSprintTarget?: number;
}

export interface UpdatePodInput {
  name?: string;
  podType?: string;
  seniorMemberId?: string | null;
  juniorMemberId?: string | null;
  sprintDurationWeeks?: number;
  placementsPerSprintTarget?: number;
  isActive?: boolean;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const podFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  podType: z.string().optional(),
  isActive: z.boolean().optional(),
});

const createPodSchema = z.object({
  name: z.string().min(1, 'Pod name is required').max(100),
  podType: z.enum(['recruiting', 'bench_sales', 'ta']),
  seniorMemberId: z.string().uuid().optional(),
  juniorMemberId: z.string().uuid().optional(),
  sprintDurationWeeks: z.number().min(1).max(4).default(2),
  placementsPerSprintTarget: z.number().min(1).max(10).default(2),
});

const updatePodSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  podType: z.enum(['recruiting', 'bench_sales', 'ta']).optional(),
  seniorMemberId: z.string().uuid().nullable().optional(),
  juniorMemberId: z.string().uuid().nullable().optional(),
  sprintDurationWeeks: z.number().min(1).max(4).optional(),
  placementsPerSprintTarget: z.number().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get paginated list of pods with filtering.
 */
export async function listPodsAction(
  filters: PodFilters = {}
): Promise<ActionResult<PaginatedResult<PodWithMembers>>> {
  const validation = podFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, podType, isActive } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'pods', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: pods:read required' };
  }

  // Build query
  let query = supabase
    .from('pods')
    .select(
      `
      id,
      name,
      pod_type,
      senior_member_id,
      junior_member_id,
      sprint_duration_weeks,
      placements_per_sprint_target,
      total_placements,
      current_sprint_placements,
      current_sprint_start_date,
      average_placements_per_sprint,
      is_active,
      formed_date,
      dissolved_date,
      org_id,
      created_at,
      senior_member:user_profiles!pods_senior_member_id_fkey (
        id,
        full_name,
        email,
        position,
        avatar_url
      ),
      junior_member:user_profiles!pods_junior_member_id_fkey (
        id,
        full_name,
        email,
        position,
        avatar_url
      )
    `,
      { count: 'exact' }
    )
    .eq('org_id', profile.orgId);

  // Apply filters
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (podType) {
    query = query.eq('pod_type', podType);
  }

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }

  // Apply pagination
  const { from, to } = calculateRange(page, pageSize);
  query = query.order('name', { ascending: true }).range(from, to);

  const { data: pods, error, count } = await query;

  if (error) {
    console.error('List pods error:', error);
    return { success: false, error: 'Failed to fetch pods' };
  }

  // Transform data
  const transformedPods: PodWithMembers[] = (pods || []).map((pod: any) => ({
    id: pod.id,
    name: pod.name,
    podType: pod.pod_type,
    seniorMemberId: pod.senior_member_id,
    juniorMemberId: pod.junior_member_id,
    sprintDurationWeeks: pod.sprint_duration_weeks,
    placementsPerSprintTarget: pod.placements_per_sprint_target,
    totalPlacements: pod.total_placements,
    currentSprintPlacements: pod.current_sprint_placements,
    currentSprintStartDate: pod.current_sprint_start_date,
    averagePlacementsPerSprint: pod.average_placements_per_sprint
      ? parseFloat(pod.average_placements_per_sprint)
      : null,
    isActive: pod.is_active,
    formedDate: pod.formed_date,
    dissolvedDate: pod.dissolved_date,
    orgId: pod.org_id,
    createdAt: pod.created_at,
    seniorMember: pod.senior_member
      ? {
          id: pod.senior_member.id,
          fullName: pod.senior_member.full_name,
          email: pod.senior_member.email,
          position: pod.senior_member.position,
          avatarUrl: pod.senior_member.avatar_url,
        }
      : null,
    juniorMember: pod.junior_member
      ? {
          id: pod.junior_member.id,
          fullName: pod.junior_member.full_name,
          email: pod.junior_member.email,
          position: pod.junior_member.position,
          avatarUrl: pod.junior_member.avatar_url,
        }
      : null,
    performance: {
      thisWeekPlacements: pod.current_sprint_placements || 0,
      thisMonthPlacements: pod.total_placements || 0,
      onTrack: (pod.current_sprint_placements || 0) >= (pod.placements_per_sprint_target || 2) / 2,
    },
  }));

  const total = count || 0;
  const pagination = calculatePagination(total, page, pageSize);

  return {
    success: true,
    data: {
      items: transformedPods,
      ...pagination,
    },
  };
}

/**
 * Get a single pod with full details.
 */
export async function getPodAction(podId: string): Promise<ActionResult<PodWithMembers>> {
  if (!podId || !z.string().uuid().safeParse(podId).success) {
    return { success: false, error: 'Invalid pod ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'pods', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: pods:read required' };
  }

  const { data: pod, error } = await supabase
    .from('pods')
    .select(
      `
      id,
      name,
      pod_type,
      senior_member_id,
      junior_member_id,
      sprint_duration_weeks,
      placements_per_sprint_target,
      total_placements,
      current_sprint_placements,
      current_sprint_start_date,
      average_placements_per_sprint,
      is_active,
      formed_date,
      dissolved_date,
      org_id,
      created_at,
      senior_member:user_profiles!pods_senior_member_id_fkey (
        id,
        full_name,
        email,
        position,
        avatar_url
      ),
      junior_member:user_profiles!pods_junior_member_id_fkey (
        id,
        full_name,
        email,
        position,
        avatar_url
      )
    `
    )
    .eq('id', podId)
    .eq('org_id', profile.orgId)
    .single();

  if (error || !pod) {
    return { success: false, error: 'Pod not found' };
  }

  return {
    success: true,
    data: {
      id: pod.id,
      name: pod.name,
      podType: pod.pod_type,
      seniorMemberId: pod.senior_member_id,
      juniorMemberId: pod.junior_member_id,
      sprintDurationWeeks: pod.sprint_duration_weeks,
      placementsPerSprintTarget: pod.placements_per_sprint_target,
      totalPlacements: pod.total_placements,
      currentSprintPlacements: pod.current_sprint_placements,
      currentSprintStartDate: pod.current_sprint_start_date,
      averagePlacementsPerSprint: pod.average_placements_per_sprint
        ? parseFloat(pod.average_placements_per_sprint)
        : null,
      isActive: pod.is_active,
      formedDate: pod.formed_date,
      dissolvedDate: pod.dissolved_date,
      orgId: pod.org_id,
      createdAt: pod.created_at,
      seniorMember: pod.senior_member
        ? {
            id: (pod.senior_member as any).id,
            fullName: (pod.senior_member as any).full_name,
            email: (pod.senior_member as any).email,
            position: (pod.senior_member as any).position,
            avatarUrl: (pod.senior_member as any).avatar_url,
          }
        : null,
      juniorMember: pod.junior_member
        ? {
            id: (pod.junior_member as any).id,
            fullName: (pod.junior_member as any).full_name,
            email: (pod.junior_member as any).email,
            position: (pod.junior_member as any).position,
            avatarUrl: (pod.junior_member as any).avatar_url,
          }
        : null,
    },
  };
}

/**
 * Create a new pod.
 */
export async function createPodAction(input: CreatePodInput): Promise<ActionResult<Pod>> {
  const validation = createPodSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const {
    name,
    podType,
    seniorMemberId,
    juniorMemberId,
    sprintDurationWeeks,
    placementsPerSprintTarget,
  } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'pods', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: pods:create required' };
  }

  // Validate members exist and belong to org
  if (seniorMemberId) {
    const { data: senior } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', seniorMemberId)
      .eq('org_id', profile.orgId)
      .single();

    if (!senior) {
      return { success: false, error: 'Senior member not found' };
    }
  }

  if (juniorMemberId) {
    const { data: junior } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', juniorMemberId)
      .eq('org_id', profile.orgId)
      .single();

    if (!junior) {
      return { success: false, error: 'Junior member not found' };
    }
  }

  // Create pod
  const { data: newPod, error } = await supabase
    .from('pods')
    .insert({
      name,
      pod_type: podType,
      senior_member_id: seniorMemberId,
      junior_member_id: juniorMemberId,
      sprint_duration_weeks: sprintDurationWeeks,
      placements_per_sprint_target: placementsPerSprintTarget,
      org_id: profile.orgId,
      is_active: true,
      formed_date: new Date().toISOString().split('T')[0],
      current_sprint_start_date: new Date().toISOString().split('T')[0],
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create pod error:', error);
    return { success: false, error: 'Failed to create pod' };
  }

  // Update employee_metadata for assigned members
  if (seniorMemberId) {
    await supabase
      .from('employee_metadata')
      .upsert(
        { user_id: seniorMemberId, pod_id: newPod.id, pod_role: 'senior' },
        { onConflict: 'user_id' }
      );
  }

  if (juniorMemberId) {
    await supabase
      .from('employee_metadata')
      .upsert(
        { user_id: juniorMemberId, pod_id: newPod.id, pod_role: 'junior' },
        { onConflict: 'user_id' }
      );
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'pods',
    action: 'create',
    recordId: newPod.id,
    userId: profile.id,
    newValues: { name, podType, seniorMemberId, juniorMemberId },
    severity: 'info',
    orgId: profile.orgId,
  });

  return {
    success: true,
    data: {
      id: newPod.id,
      name: newPod.name,
      podType: newPod.pod_type,
      seniorMemberId: newPod.senior_member_id,
      juniorMemberId: newPod.junior_member_id,
      sprintDurationWeeks: newPod.sprint_duration_weeks,
      placementsPerSprintTarget: newPod.placements_per_sprint_target,
      totalPlacements: newPod.total_placements,
      currentSprintPlacements: newPod.current_sprint_placements,
      currentSprintStartDate: newPod.current_sprint_start_date,
      averagePlacementsPerSprint: null,
      isActive: newPod.is_active,
      formedDate: newPod.formed_date,
      dissolvedDate: newPod.dissolved_date,
      orgId: newPod.org_id,
      createdAt: newPod.created_at,
    },
  };
}

/**
 * Update an existing pod.
 */
export async function updatePodAction(
  podId: string,
  input: UpdatePodInput
): Promise<ActionResult<Pod>> {
  if (!podId || !z.string().uuid().safeParse(podId).success) {
    return { success: false, error: 'Invalid pod ID' };
  }

  const validation = updatePodSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'pods', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: pods:update required' };
  }

  // Verify pod exists
  const { data: existingPod } = await supabase
    .from('pods')
    .select('*')
    .eq('id', podId)
    .eq('org_id', profile.orgId)
    .single();

  if (!existingPod) {
    return { success: false, error: 'Pod not found' };
  }

  // Build update object
  const updates: Record<string, any> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.podType !== undefined) updates.pod_type = input.podType;
  if (input.seniorMemberId !== undefined) updates.senior_member_id = input.seniorMemberId;
  if (input.juniorMemberId !== undefined) updates.junior_member_id = input.juniorMemberId;
  if (input.sprintDurationWeeks !== undefined)
    updates.sprint_duration_weeks = input.sprintDurationWeeks;
  if (input.placementsPerSprintTarget !== undefined)
    updates.placements_per_sprint_target = input.placementsPerSprintTarget;
  if (input.isActive !== undefined) {
    updates.is_active = input.isActive;
    if (!input.isActive) {
      updates.dissolved_date = new Date().toISOString().split('T')[0];
    }
  }

  const { error: updateError } = await supabase.from('pods').update(updates).eq('id', podId);

  if (updateError) {
    console.error('Update pod error:', updateError);
    return { success: false, error: 'Failed to update pod' };
  }

  // Update employee_metadata for member changes
  if (input.seniorMemberId !== undefined) {
    // Remove old senior assignment
    if (existingPod.senior_member_id && existingPod.senior_member_id !== input.seniorMemberId) {
      await supabase
        .from('employee_metadata')
        .update({ pod_id: null, pod_role: null })
        .eq('user_id', existingPod.senior_member_id);
    }
    // Add new senior assignment
    if (input.seniorMemberId) {
      await supabase
        .from('employee_metadata')
        .upsert(
          { user_id: input.seniorMemberId, pod_id: podId, pod_role: 'senior' },
          { onConflict: 'user_id' }
        );
    }
  }

  if (input.juniorMemberId !== undefined) {
    // Remove old junior assignment
    if (existingPod.junior_member_id && existingPod.junior_member_id !== input.juniorMemberId) {
      await supabase
        .from('employee_metadata')
        .update({ pod_id: null, pod_role: null })
        .eq('user_id', existingPod.junior_member_id);
    }
    // Add new junior assignment
    if (input.juniorMemberId) {
      await supabase
        .from('employee_metadata')
        .upsert(
          { user_id: input.juniorMemberId, pod_id: podId, pod_role: 'junior' },
          { onConflict: 'user_id' }
        );
    }
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'pods',
    action: 'update',
    recordId: podId,
    userId: profile.id,
    oldValues: existingPod,
    newValues: updates,
    changedFields: Object.keys(updates),
    severity: 'info',
    orgId: profile.orgId,
  });

  // Fetch updated pod
  const result = await getPodAction(podId);
  if (!result.success || !result.data) {
    return { success: false, error: 'Failed to fetch updated pod' };
  }

  return { success: true, data: result.data };
}

/**
 * Delete a pod.
 */
export async function deletePodAction(podId: string): Promise<ActionResult<void>> {
  if (!podId || !z.string().uuid().safeParse(podId).success) {
    return { success: false, error: 'Invalid pod ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'pods', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: pods:delete required' };
  }

  // Verify pod exists
  const { data: pod } = await supabase
    .from('pods')
    .select('*')
    .eq('id', podId)
    .eq('org_id', profile.orgId)
    .single();

  if (!pod) {
    return { success: false, error: 'Pod not found' };
  }

  // Remove employee_metadata pod assignments
  await supabase
    .from('employee_metadata')
    .update({ pod_id: null, pod_role: null })
    .eq('pod_id', podId);

  // Delete pod
  const { error: deleteError } = await supabase.from('pods').delete().eq('id', podId);

  if (deleteError) {
    console.error('Delete pod error:', deleteError);
    return { success: false, error: 'Failed to delete pod' };
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'pods',
    action: 'delete',
    recordId: podId,
    userId: profile.id,
    oldValues: pod,
    severity: 'warning',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Get pod performance metrics.
 */
export async function getPodPerformanceAction(
  podId: string
): Promise<
  ActionResult<{
    totalPlacements: number;
    currentSprintPlacements: number;
    targetPlacements: number;
    sprintProgress: number;
    averagePerSprint: number;
    trend: 'up' | 'down' | 'flat';
  }>
> {
  if (!podId || !z.string().uuid().safeParse(podId).success) {
    return { success: false, error: 'Invalid pod ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'pods', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: pods:read required' };
  }

  const { data: pod, error } = await supabase
    .from('pods')
    .select(
      `
      total_placements,
      current_sprint_placements,
      placements_per_sprint_target,
      average_placements_per_sprint
    `
    )
    .eq('id', podId)
    .eq('org_id', profile.orgId)
    .single();

  if (error || !pod) {
    return { success: false, error: 'Pod not found' };
  }

  const totalPlacements = pod.total_placements || 0;
  const currentSprintPlacements = pod.current_sprint_placements || 0;
  const targetPlacements = pod.placements_per_sprint_target || 2;
  const averagePerSprint = pod.average_placements_per_sprint
    ? parseFloat(pod.average_placements_per_sprint)
    : 0;

  const sprintProgress = Math.min(100, (currentSprintPlacements / targetPlacements) * 100);

  // Determine trend
  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (currentSprintPlacements > averagePerSprint) trend = 'up';
  else if (currentSprintPlacements < averagePerSprint) trend = 'down';

  return {
    success: true,
    data: {
      totalPlacements,
      currentSprintPlacements,
      targetPlacements,
      sprintProgress,
      averagePerSprint,
      trend,
    },
  };
}

/**
 * Start a new sprint for a pod.
 */
export async function startNewSprintAction(podId: string): Promise<ActionResult<void>> {
  if (!podId || !z.string().uuid().safeParse(podId).success) {
    return { success: false, error: 'Invalid pod ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'pods', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: pods:update required' };
  }

  // Get current pod data
  const { data: pod } = await supabase
    .from('pods')
    .select('*')
    .eq('id', podId)
    .eq('org_id', profile.orgId)
    .single();

  if (!pod) {
    return { success: false, error: 'Pod not found' };
  }

  // Update average placements per sprint
  const totalSprints = Math.max(1, Math.floor(pod.total_placements / (pod.placements_per_sprint_target || 2)));
  const newAverage = ((pod.average_placements_per_sprint || 0) * (totalSprints - 1) + pod.current_sprint_placements) / totalSprints;

  // Reset sprint
  const { error: updateError } = await supabase
    .from('pods')
    .update({
      current_sprint_placements: 0,
      current_sprint_start_date: new Date().toISOString().split('T')[0],
      average_placements_per_sprint: newAverage.toFixed(2),
    })
    .eq('id', podId);

  if (updateError) {
    return { success: false, error: 'Failed to start new sprint' };
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'pods',
    action: 'start_sprint',
    recordId: podId,
    userId: profile.id,
    metadata: { previousSprintPlacements: pod.current_sprint_placements },
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}
