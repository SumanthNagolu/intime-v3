/**
 * HR Performance Reviews Server Actions
 *
 * Provides CRUD operations for performance reviews with workflow management.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/hr-reviews
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

// Database row types (as returned from Supabase)
interface DatabaseEmployee {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  position: string | null;
  avatar_url: string | null;
}

interface DatabaseReviewer {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface DatabaseReviewRow {
  id: string;
  employee_id: string;
  reviewer_id: string;
  review_cycle: string;
  review_type: string | null;
  period_start_date: string;
  period_end_date: string;
  overall_rating: number | null;
  quality_of_work: number | null;
  communication: number | null;
  teamwork: number | null;
  initiative: number | null;
  reliability: number | null;
  goals_achieved: unknown;
  goals_next_period: unknown;
  strengths: string | null;
  areas_for_improvement: string | null;
  manager_comments: string | null;
  employee_self_assessment: string | null;
  employee_comments: string | null;
  status: string;
  scheduled_date: string | null;
  completed_at: string | null;
  employee_acknowledged_at: string | null;
  org_id: string;
  created_at: string;
  employee?: DatabaseEmployee;
  reviewer?: DatabaseReviewer;
}

interface DatabasePendingReviewerRow {
  id: string;
  employee_id: string;
  reviewer_id: string;
  review_cycle: string;
  review_type: string | null;
  period_start_date: string;
  period_end_date: string;
  status: string;
  scheduled_date: string | null;
  org_id: string;
  created_at: string;
  employee?: DatabaseEmployee;
}

interface DatabasePendingEmployeeRow {
  id: string;
  employee_id: string;
  reviewer_id: string;
  review_cycle: string;
  review_type: string | null;
  period_start_date: string;
  period_end_date: string;
  overall_rating: number | null;
  status: string;
  scheduled_date: string | null;
  org_id: string;
  created_at: string;
  reviewer?: DatabaseReviewer;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewCycle: string;
  reviewType: string | null;
  periodStartDate: string;
  periodEndDate: string;
  overallRating: number | null;
  qualityOfWork: number | null;
  communication: number | null;
  teamwork: number | null;
  initiative: number | null;
  reliability: number | null;
  goalsAchieved: string[] | null;
  goalsNextPeriod: string[] | null;
  strengths: string | null;
  areasForImprovement: string | null;
  managerComments: string | null;
  employeeSelfAssessment: string | null;
  employeeComments: string | null;
  status: string;
  scheduledDate: string | null;
  completedAt: string | null;
  employeeAcknowledgedAt: string | null;
  orgId: string;
  createdAt: string;
}

export interface PerformanceReviewWithDetails extends PerformanceReview {
  employee?: {
    id: string;
    fullName: string;
    email: string;
    department: string | null;
    position: string | null;
    avatarUrl: string | null;
  } | null;
  reviewer?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export interface ReviewFilters {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  reviewerId?: string;
  reviewCycle?: string;
  reviewType?: string;
  status?: string;
}

export interface CreateReviewInput {
  employeeId: string;
  reviewerId: string;
  reviewCycle: string;
  reviewType: string;
  periodStartDate: string;
  periodEndDate: string;
  scheduledDate?: string;
}

export interface SubmitReviewFeedbackInput {
  overallRating: number;
  qualityOfWork?: number;
  communication?: number;
  teamwork?: number;
  initiative?: number;
  reliability?: number;
  strengths?: string;
  areasForImprovement?: string;
  managerComments?: string;
  goalsNextPeriod?: string[];
}

export interface SubmitSelfAssessmentInput {
  employeeSelfAssessment: string;
  goalsAchieved?: string[];
}

// ============================================================================
// Validation Schemas
// ============================================================================

const reviewFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  employeeId: z.string().uuid().optional(),
  reviewerId: z.string().uuid().optional(),
  reviewCycle: z.string().optional(),
  reviewType: z.string().optional(),
  status: z.string().optional(),
});

const createReviewSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  reviewerId: z.string().uuid('Invalid reviewer ID'),
  reviewCycle: z.string().min(1, 'Review cycle is required'),
  reviewType: z.enum(['annual', 'mid_year', 'probation', '90_day']),
  periodStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  periodEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const submitFeedbackSchema = z.object({
  overallRating: z.number().min(1).max(5),
  qualityOfWork: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  teamwork: z.number().min(1).max(5).optional(),
  initiative: z.number().min(1).max(5).optional(),
  reliability: z.number().min(1).max(5).optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  managerComments: z.string().optional(),
  goalsNextPeriod: z.array(z.string()).optional(),
});

const submitSelfAssessmentSchema = z.object({
  employeeSelfAssessment: z.string().min(10, 'Self assessment must be at least 10 characters'),
  goalsAchieved: z.array(z.string()).optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely parse goals field from database (can be JSON array or null).
 */
function parseGoalsField(value: unknown): string[] | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return null;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Get paginated list of performance reviews.
 */
export async function listReviewsAction(
  filters: ReviewFilters = {}
): Promise<ActionResult<PaginatedResult<PerformanceReviewWithDetails>>> {
  const validation = reviewFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, employeeId, reviewerId, reviewCycle, reviewType, status } =
    validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'performance_reviews', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: performance_reviews:read required' };
  }

  // Build query
  let query = supabase
    .from('performance_reviews')
    .select(
      `
      id,
      employee_id,
      reviewer_id,
      review_cycle,
      review_type,
      period_start_date,
      period_end_date,
      overall_rating,
      quality_of_work,
      communication,
      teamwork,
      initiative,
      reliability,
      goals_achieved,
      goals_next_period,
      strengths,
      areas_for_improvement,
      manager_comments,
      employee_self_assessment,
      employee_comments,
      status,
      scheduled_date,
      completed_at,
      employee_acknowledged_at,
      org_id,
      created_at,
      employee:user_profiles!performance_reviews_employee_id_fkey (
        id,
        full_name,
        email,
        department,
        position,
        avatar_url
      ),
      reviewer:user_profiles!performance_reviews_reviewer_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `,
      { count: 'exact' }
    )
    .eq('org_id', profile.orgId);

  // Apply filters
  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }

  if (reviewerId) {
    query = query.eq('reviewer_id', reviewerId);
  }

  if (reviewCycle) {
    query = query.eq('review_cycle', reviewCycle);
  }

  if (reviewType) {
    query = query.eq('review_type', reviewType);
  }

  if (status) {
    query = query.eq('status', status);
  }

  // Apply pagination
  const { from, to } = calculateRange(page, pageSize);
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data: reviews, error, count } = await query;

  if (error) {
    console.error('List reviews error:', error);
    return { success: false, error: 'Failed to fetch reviews' };
  }

  // Transform data
  const transformedReviews: PerformanceReviewWithDetails[] = (reviews || []).map((review) => {
    const typedReview = review as unknown as DatabaseReviewRow;
    return {
      id: typedReview.id,
      employeeId: typedReview.employee_id,
      reviewerId: typedReview.reviewer_id,
      reviewCycle: typedReview.review_cycle,
      reviewType: typedReview.review_type,
      periodStartDate: typedReview.period_start_date,
      periodEndDate: typedReview.period_end_date,
      overallRating: typedReview.overall_rating,
      qualityOfWork: typedReview.quality_of_work,
      communication: typedReview.communication,
      teamwork: typedReview.teamwork,
      initiative: typedReview.initiative,
      reliability: typedReview.reliability,
      goalsAchieved: parseGoalsField(typedReview.goals_achieved),
      goalsNextPeriod: parseGoalsField(typedReview.goals_next_period),
      strengths: typedReview.strengths,
      areasForImprovement: typedReview.areas_for_improvement,
      managerComments: typedReview.manager_comments,
      employeeSelfAssessment: typedReview.employee_self_assessment,
      employeeComments: typedReview.employee_comments,
      status: typedReview.status,
      scheduledDate: typedReview.scheduled_date,
      completedAt: typedReview.completed_at,
      employeeAcknowledgedAt: typedReview.employee_acknowledged_at,
      orgId: typedReview.org_id,
      createdAt: typedReview.created_at,
      employee: typedReview.employee
        ? {
            id: typedReview.employee.id,
            fullName: typedReview.employee.full_name,
            email: typedReview.employee.email,
            department: typedReview.employee.department,
            position: typedReview.employee.position,
            avatarUrl: typedReview.employee.avatar_url,
          }
        : null,
      reviewer: typedReview.reviewer
        ? {
            id: typedReview.reviewer.id,
            fullName: typedReview.reviewer.full_name,
            email: typedReview.reviewer.email,
            avatarUrl: typedReview.reviewer.avatar_url,
          }
        : null,
    };
  });

  const total = count || 0;
  const pagination = calculatePagination(total, page, pageSize);

  return {
    success: true,
    data: {
      items: transformedReviews,
      ...pagination,
    },
  };
}

/**
 * Get a single performance review with full details.
 */
export async function getReviewAction(
  reviewId: string
): Promise<ActionResult<PerformanceReviewWithDetails>> {
  if (!reviewId || !z.string().uuid().safeParse(reviewId).success) {
    return { success: false, error: 'Invalid review ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'performance_reviews', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: performance_reviews:read required' };
  }

  const { data: review, error } = await supabase
    .from('performance_reviews')
    .select(
      `
      id,
      employee_id,
      reviewer_id,
      review_cycle,
      review_type,
      period_start_date,
      period_end_date,
      overall_rating,
      quality_of_work,
      communication,
      teamwork,
      initiative,
      reliability,
      goals_achieved,
      goals_next_period,
      strengths,
      areas_for_improvement,
      manager_comments,
      employee_self_assessment,
      employee_comments,
      status,
      scheduled_date,
      completed_at,
      employee_acknowledged_at,
      org_id,
      created_at,
      employee:user_profiles!performance_reviews_employee_id_fkey (
        id,
        full_name,
        email,
        department,
        position,
        avatar_url
      ),
      reviewer:user_profiles!performance_reviews_reviewer_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq('id', reviewId)
    .eq('org_id', profile.orgId)
    .single();

  if (error || !review) {
    return { success: false, error: 'Review not found' };
  }

  const typedReview = review as unknown as DatabaseReviewRow;

  return {
    success: true,
    data: {
      id: typedReview.id,
      employeeId: typedReview.employee_id,
      reviewerId: typedReview.reviewer_id,
      reviewCycle: typedReview.review_cycle,
      reviewType: typedReview.review_type,
      periodStartDate: typedReview.period_start_date,
      periodEndDate: typedReview.period_end_date,
      overallRating: typedReview.overall_rating,
      qualityOfWork: typedReview.quality_of_work,
      communication: typedReview.communication,
      teamwork: typedReview.teamwork,
      initiative: typedReview.initiative,
      reliability: typedReview.reliability,
      goalsAchieved: parseGoalsField(typedReview.goals_achieved),
      goalsNextPeriod: parseGoalsField(typedReview.goals_next_period),
      strengths: typedReview.strengths,
      areasForImprovement: typedReview.areas_for_improvement,
      managerComments: typedReview.manager_comments,
      employeeSelfAssessment: typedReview.employee_self_assessment,
      employeeComments: typedReview.employee_comments,
      status: typedReview.status,
      scheduledDate: typedReview.scheduled_date,
      completedAt: typedReview.completed_at,
      employeeAcknowledgedAt: typedReview.employee_acknowledged_at,
      orgId: typedReview.org_id,
      createdAt: typedReview.created_at,
      employee: typedReview.employee
        ? {
            id: typedReview.employee.id,
            fullName: typedReview.employee.full_name,
            email: typedReview.employee.email,
            department: typedReview.employee.department,
            position: typedReview.employee.position,
            avatarUrl: typedReview.employee.avatar_url,
          }
        : null,
      reviewer: typedReview.reviewer
        ? {
            id: typedReview.reviewer.id,
            fullName: typedReview.reviewer.full_name,
            email: typedReview.reviewer.email,
            avatarUrl: typedReview.reviewer.avatar_url,
          }
        : null,
    },
  };
}

/**
 * Create a new performance review.
 */
export async function createReviewAction(
  input: CreateReviewInput
): Promise<ActionResult<PerformanceReview>> {
  const validation = createReviewSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const {
    employeeId,
    reviewerId,
    reviewCycle,
    reviewType,
    periodStartDate,
    periodEndDate,
    scheduledDate,
  } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'performance_reviews', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: performance_reviews:create required' };
  }

  // Verify employee and reviewer exist
  const { data: employee } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', employeeId)
    .eq('org_id', profile.orgId)
    .single();

  if (!employee) {
    return { success: false, error: 'Employee not found' };
  }

  const { data: reviewer } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', reviewerId)
    .eq('org_id', profile.orgId)
    .single();

  if (!reviewer) {
    return { success: false, error: 'Reviewer not found' };
  }

  // Create review
  const { data: newReview, error } = await supabase
    .from('performance_reviews')
    .insert({
      employee_id: employeeId,
      reviewer_id: reviewerId,
      review_cycle: reviewCycle,
      review_type: reviewType,
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      scheduled_date: scheduledDate,
      status: 'draft',
      org_id: profile.orgId,
    })
    .select()
    .single();

  if (error) {
    console.error('Create review error:', error);
    return { success: false, error: 'Failed to create review' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'performance_reviews',
    action: 'create',
    recordId: newReview.id,
    userId: profile.id,
    userEmail: profile.email,
    newValues: { employeeId, reviewerId, reviewCycle, reviewType },
    severity: 'info',
    orgId: profile.orgId,
  });

  return {
    success: true,
    data: {
      id: newReview.id,
      employeeId: newReview.employee_id,
      reviewerId: newReview.reviewer_id,
      reviewCycle: newReview.review_cycle,
      reviewType: newReview.review_type,
      periodStartDate: newReview.period_start_date,
      periodEndDate: newReview.period_end_date,
      overallRating: null,
      qualityOfWork: null,
      communication: null,
      teamwork: null,
      initiative: null,
      reliability: null,
      goalsAchieved: null,
      goalsNextPeriod: null,
      strengths: null,
      areasForImprovement: null,
      managerComments: null,
      employeeSelfAssessment: null,
      employeeComments: null,
      status: newReview.status,
      scheduledDate: newReview.scheduled_date,
      completedAt: null,
      employeeAcknowledgedAt: null,
      orgId: newReview.org_id,
      createdAt: newReview.created_at,
    },
  };
}

/**
 * Submit manager feedback for a review.
 */
export async function submitReviewFeedbackAction(
  reviewId: string,
  input: SubmitReviewFeedbackInput
): Promise<ActionResult<void>> {
  if (!reviewId || !z.string().uuid().safeParse(reviewId).success) {
    return { success: false, error: 'Invalid review ID' };
  }

  const validation = submitFeedbackSchema.safeParse(input);
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

  const hasPermission = await checkPermission(supabase, profile.id, 'performance_reviews', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: performance_reviews:update required' };
  }

  // Verify review exists and user is the reviewer
  const { data: review } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('org_id', profile.orgId)
    .single();

  if (!review) {
    return { success: false, error: 'Review not found' };
  }

  if (review.reviewer_id !== profile.id) {
    // Check if user has admin permissions to submit on behalf of others
    const hasAdminPerm = await checkPermission(supabase, profile.id, 'performance_reviews', 'manage');
    if (!hasAdminPerm) {
      return { success: false, error: 'You are not authorized to submit feedback for this review' };
    }
  }

  // Update review with feedback
  const { error: updateError } = await supabase
    .from('performance_reviews')
    .update({
      overall_rating: input.overallRating,
      quality_of_work: input.qualityOfWork,
      communication: input.communication,
      teamwork: input.teamwork,
      initiative: input.initiative,
      reliability: input.reliability,
      strengths: input.strengths,
      areas_for_improvement: input.areasForImprovement,
      manager_comments: input.managerComments,
      goals_next_period: input.goalsNextPeriod,
      status: 'pending_employee_review',
      completed_at: new Date().toISOString(),
    })
    .eq('id', reviewId);

  if (updateError) {
    console.error('Submit feedback error:', updateError);
    return { success: false, error: 'Failed to submit feedback' };
  }

  // Update employee's performance rating
  // Note: Using type assertion since performance_rating column may not be in generated types
  await (supabase as { from: (table: string) => ReturnType<typeof supabase.from> }).from('user_profiles')
    .update({ performance_rating: input.overallRating } as Record<string, unknown>)
    .eq('id', review.employee_id);

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'performance_reviews',
    action: 'submit_feedback',
    recordId: reviewId,
    userId: profile.id,
    userEmail: profile.email,
    newValues: { overallRating: input.overallRating },
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Submit employee self-assessment.
 */
export async function submitSelfAssessmentAction(
  reviewId: string,
  input: SubmitSelfAssessmentInput
): Promise<ActionResult<void>> {
  if (!reviewId || !z.string().uuid().safeParse(reviewId).success) {
    return { success: false, error: 'Invalid review ID' };
  }

  const validation = submitSelfAssessmentSchema.safeParse(input);
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

  // Verify review exists and user is the employee
  const { data: review } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('org_id', profile.orgId)
    .single();

  if (!review) {
    return { success: false, error: 'Review not found' };
  }

  if (review.employee_id !== profile.id) {
    return { success: false, error: 'You can only submit self-assessment for your own review' };
  }

  // Update review with self-assessment
  const { error: updateError } = await supabase
    .from('performance_reviews')
    .update({
      employee_self_assessment: input.employeeSelfAssessment,
      goals_achieved: input.goalsAchieved,
    })
    .eq('id', reviewId);

  if (updateError) {
    console.error('Submit self-assessment error:', updateError);
    return { success: false, error: 'Failed to submit self-assessment' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'performance_reviews',
    action: 'submit_self_assessment',
    recordId: reviewId,
    userId: profile.id,
    userEmail: profile.email,
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Employee acknowledges their review.
 */
export async function acknowledgeReviewAction(
  reviewId: string,
  comments?: string
): Promise<ActionResult<void>> {
  if (!reviewId || !z.string().uuid().safeParse(reviewId).success) {
    return { success: false, error: 'Invalid review ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Verify review exists and user is the employee
  const { data: review } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('org_id', profile.orgId)
    .single();

  if (!review) {
    return { success: false, error: 'Review not found' };
  }

  if (review.employee_id !== profile.id) {
    return { success: false, error: 'You can only acknowledge your own review' };
  }

  if (review.status !== 'pending_employee_review') {
    return { success: false, error: 'Review is not ready for acknowledgment' };
  }

  // Update review
  const { error: updateError } = await supabase
    .from('performance_reviews')
    .update({
      employee_comments: comments,
      employee_acknowledged_at: new Date().toISOString(),
      status: 'acknowledged',
    })
    .eq('id', reviewId);

  if (updateError) {
    console.error('Acknowledge review error:', updateError);
    return { success: false, error: 'Failed to acknowledge review' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'performance_reviews',
    action: 'acknowledge',
    recordId: reviewId,
    userId: profile.id,
    userEmail: profile.email,
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Delete a draft review.
 */
export async function deleteReviewAction(reviewId: string): Promise<ActionResult<void>> {
  if (!reviewId || !z.string().uuid().safeParse(reviewId).success) {
    return { success: false, error: 'Invalid review ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'performance_reviews', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: performance_reviews:delete required' };
  }

  // Verify review exists and is in draft status
  const { data: review } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('org_id', profile.orgId)
    .single();

  if (!review) {
    return { success: false, error: 'Review not found' };
  }

  if (review.status !== 'draft') {
    return { success: false, error: 'Only draft reviews can be deleted' };
  }

  const { error: deleteError } = await supabase
    .from('performance_reviews')
    .delete()
    .eq('id', reviewId);

  if (deleteError) {
    console.error('Delete review error:', deleteError);
    return { success: false, error: 'Failed to delete review' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'performance_reviews',
    action: 'delete',
    recordId: reviewId,
    userId: profile.id,
    userEmail: profile.email,
    oldValues: review,
    severity: 'warning',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Get review statistics for HR dashboard.
 */
export async function getReviewStatsAction(): Promise<
  ActionResult<{
    totalReviews: number;
    pendingReviews: number;
    completedReviews: number;
    avgRating: number;
    reviewsByType: { type: string; count: number }[];
    reviewsByStatus: { status: string; count: number }[];
  }>
> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'performance_reviews', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: performance_reviews:read required' };
  }

  // Get all reviews for org
  const { data: reviews, count: totalReviews } = await supabase
    .from('performance_reviews')
    .select('status, review_type, overall_rating', { count: 'exact' })
    .eq('org_id', profile.orgId);

  if (!reviews) {
    return {
      success: true,
      data: {
        totalReviews: 0,
        pendingReviews: 0,
        completedReviews: 0,
        avgRating: 0,
        reviewsByType: [],
        reviewsByStatus: [],
      },
    };
  }

  // Calculate stats
  const pendingReviews = reviews.filter(
    (r) => r.status === 'draft' || r.status === 'pending_employee_review'
  ).length;
  const completedReviews = reviews.filter(
    (r) => r.status === 'completed' || r.status === 'acknowledged'
  ).length;

  const ratingsSum = reviews
    .filter((r) => r.overall_rating)
    .reduce((sum, r) => sum + (r.overall_rating || 0), 0);
  const ratingsCount = reviews.filter((r) => r.overall_rating).length;
  const avgRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

  // Group by type
  const typeGroups: Record<string, number> = {};
  reviews.forEach((r) => {
    const reviewType = r.review_type ?? 'unknown';
    typeGroups[reviewType] = (typeGroups[reviewType] ?? 0) + 1;
  });
  const reviewsByType = Object.entries(typeGroups).map(([type, count]) => ({ type, count }));

  // Group by status
  const statusGroups: Record<string, number> = {};
  reviews.forEach((r) => {
    statusGroups[r.status] = (statusGroups[r.status] || 0) + 1;
  });
  const reviewsByStatus = Object.entries(statusGroups).map(([status, count]) => ({ status, count }));

  return {
    success: true,
    data: {
      totalReviews: totalReviews || 0,
      pendingReviews,
      completedReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewsByType,
      reviewsByStatus,
    },
  };
}

/**
 * Get reviews pending action for current user.
 */
export async function getMyPendingReviewsAction(): Promise<
  ActionResult<{
    asReviewer: PerformanceReviewWithDetails[];
    asEmployee: PerformanceReviewWithDetails[];
  }>
> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Get reviews where I'm the reviewer and need to submit feedback
  const { data: reviewerReviews } = await supabase
    .from('performance_reviews')
    .select(
      `
      id,
      employee_id,
      reviewer_id,
      review_cycle,
      review_type,
      period_start_date,
      period_end_date,
      status,
      scheduled_date,
      org_id,
      created_at,
      employee:user_profiles!performance_reviews_employee_id_fkey (
        id,
        full_name,
        email,
        department,
        position,
        avatar_url
      )
    `
    )
    .eq('reviewer_id', profile.id)
    .eq('status', 'draft')
    .order('scheduled_date', { ascending: true });

  // Get reviews where I'm the employee and need to acknowledge
  const { data: employeeReviews } = await supabase
    .from('performance_reviews')
    .select(
      `
      id,
      employee_id,
      reviewer_id,
      review_cycle,
      review_type,
      period_start_date,
      period_end_date,
      overall_rating,
      status,
      scheduled_date,
      org_id,
      created_at,
      reviewer:user_profiles!performance_reviews_reviewer_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq('employee_id', profile.id)
    .eq('status', 'pending_employee_review')
    .order('completed_at', { ascending: false });

  const asReviewer: PerformanceReviewWithDetails[] = (reviewerReviews || []).map((r) => {
    const typedR = r as unknown as DatabasePendingReviewerRow;
    return {
      id: typedR.id,
      employeeId: typedR.employee_id,
      reviewerId: typedR.reviewer_id,
      reviewCycle: typedR.review_cycle,
      reviewType: typedR.review_type,
      periodStartDate: typedR.period_start_date,
      periodEndDate: typedR.period_end_date,
      overallRating: null,
      qualityOfWork: null,
      communication: null,
      teamwork: null,
      initiative: null,
      reliability: null,
      goalsAchieved: null,
      goalsNextPeriod: null,
      strengths: null,
      areasForImprovement: null,
      managerComments: null,
      employeeSelfAssessment: null,
      employeeComments: null,
      status: typedR.status,
      scheduledDate: typedR.scheduled_date,
      completedAt: null,
      employeeAcknowledgedAt: null,
      orgId: typedR.org_id,
      createdAt: typedR.created_at,
      employee: typedR.employee
        ? {
            id: typedR.employee.id,
            fullName: typedR.employee.full_name,
            email: typedR.employee.email,
            department: typedR.employee.department,
            position: typedR.employee.position,
            avatarUrl: typedR.employee.avatar_url,
          }
        : null,
    };
  });

  const asEmployee: PerformanceReviewWithDetails[] = (employeeReviews || []).map((r) => {
    const typedR = r as unknown as DatabasePendingEmployeeRow;
    return {
      id: typedR.id,
      employeeId: typedR.employee_id,
      reviewerId: typedR.reviewer_id,
      reviewCycle: typedR.review_cycle,
      reviewType: typedR.review_type,
      periodStartDate: typedR.period_start_date,
      periodEndDate: typedR.period_end_date,
      overallRating: typedR.overall_rating,
      qualityOfWork: null,
      communication: null,
      teamwork: null,
      initiative: null,
      reliability: null,
      goalsAchieved: null,
      goalsNextPeriod: null,
      strengths: null,
      areasForImprovement: null,
      managerComments: null,
      employeeSelfAssessment: null,
      employeeComments: null,
      status: typedR.status,
      scheduledDate: typedR.scheduled_date,
      completedAt: null,
      employeeAcknowledgedAt: null,
      orgId: typedR.org_id,
      createdAt: typedR.created_at,
      reviewer: typedR.reviewer
        ? {
            id: typedR.reviewer.id,
            fullName: typedR.reviewer.full_name,
            email: typedR.reviewer.email,
            avatarUrl: typedR.reviewer.avatar_url,
          }
        : null,
    };
  });

  return {
    success: true,
    data: {
      asReviewer,
      asEmployee,
    },
  };
}
