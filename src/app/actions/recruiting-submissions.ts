/**
 * Recruiting Submissions Server Actions
 *
 * Provides CRUD operations for candidate submissions with RBAC enforcement.
 * Handles the entire submission pipeline from sourcing to placement.
 *
 * @module actions/recruiting-submissions
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Submission {
  id: string;
  jobId: string;
  jobTitle: string | null;
  candidateId: string;
  candidateName: string | null;
  candidateEmail: string | null;
  accountId: string | null;
  accountName: string | null;
  status: string;
  aiMatchScore: number | null;
  recruiterMatchScore: number | null;
  matchExplanation: string | null;
  submittedRate: number | null;
  submittedRateType: string;
  submissionNotes: string | null;
  submittedToClientAt: string | null;
  submittedToClientBy: string | null;
  clientResumeFileId: string | null;
  clientProfileUrl: string | null;
  interviewCount: number;
  lastInterviewDate: string | null;
  interviewFeedback: string | null;
  offerExtendedAt: string | null;
  offerAcceptedAt: string | null;
  offerDeclinedAt: string | null;
  offerDeclineReason: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  rejectionSource: string | null;
  ownerId: string;
  ownerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  status: string;
  label: string;
  count: number;
  submissions: Submission[];
}

// ============================================================================
// Validation Schemas
// ============================================================================

const listSubmissionsFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum([
    'sourced', 'screening', 'submission_ready', 'submitted_to_client',
    'client_review', 'client_interview', 'offer_stage', 'placed', 'rejected'
  ]).optional(),
  jobId: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'aiMatchScore', 'submittedRate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createSubmissionSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  status: z.enum(['sourced', 'screening']).default('sourced'),
  aiMatchScore: z.number().min(0).max(100).optional(),
  recruiterMatchScore: z.number().min(0).max(100).optional(),
  matchExplanation: z.string().optional(),
  submittedRate: z.number().min(0).optional(),
  submittedRateType: z.enum(['hourly', 'annual']).default('hourly'),
  submissionNotes: z.string().optional(),
  ownerId: z.string().uuid().optional(),
});

const updateSubmissionSchema = z.object({
  status: z.enum([
    'sourced', 'screening', 'submission_ready', 'submitted_to_client',
    'client_review', 'client_interview', 'offer_stage', 'placed', 'rejected'
  ]).optional(),
  aiMatchScore: z.number().min(0).max(100).optional(),
  recruiterMatchScore: z.number().min(0).max(100).optional(),
  matchExplanation: z.string().optional(),
  submittedRate: z.number().min(0).optional(),
  submittedRateType: z.enum(['hourly', 'annual']).optional(),
  submissionNotes: z.string().optional(),
  clientProfileUrl: z.string().url().optional(),
  interviewFeedback: z.string().optional(),
  ownerId: z.string().uuid().optional(),
});

const submitToClientSchema = z.object({
  submittedRate: z.number().min(0),
  submittedRateType: z.enum(['hourly', 'annual']).default('hourly'),
  clientProfileUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

const rejectSubmissionSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
  source: z.enum(['internal', 'client']).default('internal'),
});

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated', user: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, org_id, email, full_name')
    .eq('auth_id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'User profile not found', user, profile: null };
  }

  return { error: null, user, profile };
}

async function checkPermission(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_user_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
    p_required_scope: 'all',
  });

  if (error) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select(`role:roles!inner(name)`)
      .eq('user_id', userId)
      .is('deleted_at', null);

    const roleNames = roles?.map((r: any) => r.role?.name) || [];
    return roleNames.includes('super_admin') || roleNames.includes('admin') || roleNames.includes('recruiter') || roleNames.includes('sr_recruiter');
  }

  return data === true;
}

async function logAuditEvent(
  adminSupabase: ReturnType<typeof createAdminClient>,
  params: {
    tableName: string;
    action: string;
    recordId: string;
    userId: string;
    userEmail: string;
    orgId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }
) {
  const { tableName, action, recordId, userId, userEmail, orgId, oldValues, newValues, metadata } = params;

  await (adminSupabase.from as any)('audit_logs').insert({
    table_name: tableName,
    action,
    record_id: recordId,
    user_id: userId,
    user_email: userEmail,
    org_id: orgId,
    old_values: oldValues || null,
    new_values: newValues || null,
    metadata: metadata || {},
    severity: action === 'REJECT' ? 'warning' : 'info',
  });
}

function transformSubmission(sub: any): Submission {
  return {
    id: sub.id,
    jobId: sub.job_id,
    jobTitle: sub.job?.title || null,
    candidateId: sub.candidate_id,
    candidateName: sub.candidate?.full_name || null,
    candidateEmail: sub.candidate?.email || null,
    accountId: sub.account_id,
    accountName: sub.account?.name || null,
    status: sub.status,
    aiMatchScore: sub.ai_match_score,
    recruiterMatchScore: sub.recruiter_match_score,
    matchExplanation: sub.match_explanation,
    submittedRate: sub.submitted_rate ? parseFloat(sub.submitted_rate) : null,
    submittedRateType: sub.submitted_rate_type,
    submissionNotes: sub.submission_notes,
    submittedToClientAt: sub.submitted_to_client_at,
    submittedToClientBy: sub.submitted_to_client_by,
    clientResumeFileId: sub.client_resume_file_id,
    clientProfileUrl: sub.client_profile_url,
    interviewCount: sub.interview_count || 0,
    lastInterviewDate: sub.last_interview_date,
    interviewFeedback: sub.interview_feedback,
    offerExtendedAt: sub.offer_extended_at,
    offerAcceptedAt: sub.offer_accepted_at,
    offerDeclinedAt: sub.offer_declined_at,
    offerDeclineReason: sub.offer_decline_reason,
    rejectedAt: sub.rejected_at,
    rejectionReason: sub.rejection_reason,
    rejectionSource: sub.rejection_source,
    ownerId: sub.owner_id,
    ownerName: sub.owner?.full_name || null,
    createdAt: sub.created_at,
    updatedAt: sub.updated_at,
  };
}

// ============================================================================
// SUBMISSION ACTIONS
// ============================================================================

/**
 * List submissions with pagination, search, and filtering
 */
export async function listSubmissionsAction(
  filters: z.infer<typeof listSubmissionsFiltersSchema>
): Promise<ActionResult<PaginatedResult<Submission>>> {
  const validation = listSubmissionsFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, status, jobId, candidateId, ownerId, accountId, sortBy, sortOrder } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'submissions', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: submissions:read required' };
  }

  let query = supabase
    .from('submissions')
    .select(`
      *,
      job:jobs!job_id(title),
      candidate:user_profiles!candidate_id(full_name, email),
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name)
    `, { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    // Search by candidate name or job title through relationships is complex
    // We'll handle this on the result set for now
  }
  if (status) query = query.eq('status', status);
  if (jobId) query = query.eq('job_id', jobId);
  if (candidateId) query = query.eq('candidate_id', candidateId);
  if (ownerId) query = query.eq('owner_id', ownerId);
  if (accountId) query = query.eq('account_id', accountId);

  const sortColumn = sortBy === 'createdAt' ? 'created_at' :
                     sortBy === 'updatedAt' ? 'updated_at' :
                     sortBy === 'aiMatchScore' ? 'ai_match_score' :
                     sortBy === 'submittedRate' ? 'submitted_rate' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc', nullsFirst: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: submissions, error, count } = await query;

  if (error) {
    console.error('List submissions error:', error);
    return { success: false, error: 'Failed to fetch submissions' };
  }

  let transformedSubmissions = (submissions || []).map(transformSubmission);

  // Apply search filter on results if search term provided
  if (search) {
    const searchLower = search.toLowerCase();
    transformedSubmissions = transformedSubmissions.filter(sub =>
      sub.candidateName?.toLowerCase().includes(searchLower) ||
      sub.jobTitle?.toLowerCase().includes(searchLower)
    );
  }

  return {
    success: true,
    data: {
      items: transformedSubmissions,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Get a single submission by ID
 */
export async function getSubmissionAction(submissionId: string): Promise<ActionResult<Submission>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'submissions', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: submissions:read required' };
  }

  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      job:jobs!job_id(title),
      candidate:user_profiles!candidate_id(full_name, email),
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name)
    `)
    .eq('id', submissionId)
    .is('deleted_at', null)
    .single();

  if (error || !submission) {
    return { success: false, error: 'Submission not found' };
  }

  return { success: true, data: transformSubmission(submission) };
}

/**
 * Create a new submission
 */
export async function createSubmissionAction(
  input: z.infer<typeof createSubmissionSchema>
): Promise<ActionResult<Submission>> {
  const validation = createSubmissionSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'submissions', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: submissions:create required' };
  }

  const data = validation.data;

  // Check if submission already exists for this job-candidate combo
  const { data: existing } = await supabase
    .from('submissions')
    .select('id')
    .eq('job_id', data.jobId)
    .eq('candidate_id', data.candidateId)
    .is('deleted_at', null)
    .single();

  if (existing) {
    return { success: false, error: 'Submission already exists for this job and candidate' };
  }

  // Get job to find account_id
  const { data: job } = await supabase
    .from('jobs')
    .select('account_id')
    .eq('id', data.jobId)
    .single();

  const { data: newSubmission, error } = await adminSupabase
    .from('submissions')
    .insert({
      org_id: profile.org_id,
      job_id: data.jobId,
      candidate_id: data.candidateId,
      account_id: job?.account_id || null,
      status: data.status,
      ai_match_score: data.aiMatchScore || null,
      recruiter_match_score: data.recruiterMatchScore || null,
      match_explanation: data.matchExplanation || null,
      submitted_rate: data.submittedRate || null,
      submitted_rate_type: data.submittedRateType,
      submission_notes: data.submissionNotes || null,
      owner_id: data.ownerId || profile.id,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !newSubmission) {
    console.error('Create submission error:', error);
    return { success: false, error: 'Failed to create submission' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'submissions',
    action: 'INSERT',
    recordId: newSubmission.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'recruiting_create_submission' },
  });

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/jobs/${data.jobId}`);

  return getSubmissionAction(newSubmission.id);
}

/**
 * Update a submission
 */
export async function updateSubmissionAction(
  submissionId: string,
  input: z.infer<typeof updateSubmissionSchema>
): Promise<ActionResult<Submission>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const validation = updateSubmissionSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'submissions', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: submissions:update required' };
  }

  const { data: existingSubmission, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingSubmission) {
    return { success: false, error: 'Submission not found' };
  }

  const data = validation.data;
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.status !== undefined) updateData.status = data.status;
  if (data.aiMatchScore !== undefined) updateData.ai_match_score = data.aiMatchScore;
  if (data.recruiterMatchScore !== undefined) updateData.recruiter_match_score = data.recruiterMatchScore;
  if (data.matchExplanation !== undefined) updateData.match_explanation = data.matchExplanation;
  if (data.submittedRate !== undefined) updateData.submitted_rate = data.submittedRate;
  if (data.submittedRateType !== undefined) updateData.submitted_rate_type = data.submittedRateType;
  if (data.submissionNotes !== undefined) updateData.submission_notes = data.submissionNotes;
  if (data.clientProfileUrl !== undefined) updateData.client_profile_url = data.clientProfileUrl;
  if (data.interviewFeedback !== undefined) updateData.interview_feedback = data.interviewFeedback;
  if (data.ownerId !== undefined) updateData.owner_id = data.ownerId;

  const { error: updateError } = await adminSupabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId);

  if (updateError) {
    console.error('Update submission error:', updateError);
    return { success: false, error: 'Failed to update submission' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'submissions',
    action: 'UPDATE',
    recordId: submissionId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingSubmission,
    newValues: updateData,
    metadata: { source: 'recruiting_update_submission' },
  });

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/submissions/${submissionId}`);
  revalidatePath(`/employee/recruiting/jobs/${existingSubmission.job_id}`);

  return getSubmissionAction(submissionId);
}

/**
 * Delete a submission (soft delete)
 */
export async function deleteSubmissionAction(submissionId: string): Promise<ActionResult<{ deleted: boolean }>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'submissions', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: submissions:delete required' };
  }

  const { data: existingSubmission, error: fetchError } = await supabase
    .from('submissions')
    .select('job_id, status')
    .eq('id', submissionId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingSubmission) {
    return { success: false, error: 'Submission not found' };
  }

  // Prevent deletion of placed submissions
  if (existingSubmission.status === 'placed') {
    return { success: false, error: 'Cannot delete a placed submission' };
  }

  const { error: deleteError } = await adminSupabase
    .from('submissions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', submissionId);

  if (deleteError) {
    console.error('Delete submission error:', deleteError);
    return { success: false, error: 'Failed to delete submission' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'submissions',
    action: 'DELETE',
    recordId: submissionId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingSubmission,
    metadata: { source: 'recruiting_delete_submission' },
  });

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/jobs/${existingSubmission.job_id}`);

  return { success: true, data: { deleted: true } };
}

/**
 * Move submission to screening
 */
export async function moveToScreeningAction(submissionId: string): Promise<ActionResult<Submission>> {
  return updateSubmissionAction(submissionId, { status: 'screening' });
}

/**
 * Mark submission ready for client submission
 */
export async function markSubmissionReadyAction(submissionId: string): Promise<ActionResult<Submission>> {
  return updateSubmissionAction(submissionId, { status: 'submission_ready' });
}

/**
 * Submit candidate to client
 */
export async function submitToClientAction(
  submissionId: string,
  input: z.infer<typeof submitToClientSchema>
): Promise<ActionResult<Submission>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const validation = submitToClientSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('status, job_id')
    .eq('id', submissionId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !submission) {
    return { success: false, error: 'Submission not found' };
  }

  if (!['submission_ready', 'screening'].includes(submission.status)) {
    return { success: false, error: 'Submission must be in screening or submission_ready status' };
  }

  const data = validation.data;

  const { error: updateError } = await adminSupabase
    .from('submissions')
    .update({
      status: 'submitted_to_client',
      submitted_rate: data.submittedRate,
      submitted_rate_type: data.submittedRateType,
      client_profile_url: data.clientProfileUrl || null,
      submission_notes: data.notes || null,
      submitted_to_client_at: new Date().toISOString(),
      submitted_to_client_by: profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (updateError) {
    console.error('Submit to client error:', updateError);
    return { success: false, error: 'Failed to submit to client' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'submissions',
    action: 'SUBMIT_TO_CLIENT',
    recordId: submissionId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: submission.status },
    newValues: { status: 'submitted_to_client', submittedRate: data.submittedRate },
    metadata: { source: 'recruiting_submit_to_client' },
  });

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/submissions/${submissionId}`);
  revalidatePath(`/employee/recruiting/jobs/${submission.job_id}`);

  return getSubmissionAction(submissionId);
}

/**
 * Move submission to client review
 */
export async function moveToClientReviewAction(submissionId: string): Promise<ActionResult<Submission>> {
  return updateSubmissionAction(submissionId, { status: 'client_review' });
}

/**
 * Move submission to client interview stage
 */
export async function moveToClientInterviewAction(submissionId: string): Promise<ActionResult<Submission>> {
  return updateSubmissionAction(submissionId, { status: 'client_interview' });
}

/**
 * Move submission to offer stage
 */
export async function moveToOfferStageAction(submissionId: string): Promise<ActionResult<Submission>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('status, job_id')
    .eq('id', submissionId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !submission) {
    return { success: false, error: 'Submission not found' };
  }

  const { error: updateError } = await adminSupabase
    .from('submissions')
    .update({
      status: 'offer_stage',
      offer_extended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (updateError) {
    console.error('Move to offer stage error:', updateError);
    return { success: false, error: 'Failed to move to offer stage' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'submissions',
    action: 'OFFER_EXTENDED',
    recordId: submissionId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: submission.status },
    newValues: { status: 'offer_stage' },
    metadata: { source: 'recruiting_offer_extended' },
  });

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/submissions/${submissionId}`);
  revalidatePath(`/employee/recruiting/jobs/${submission.job_id}`);

  return getSubmissionAction(submissionId);
}

/**
 * Mark offer as accepted
 */
export async function acceptOfferAction(submissionId: string): Promise<ActionResult<Submission>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('status, job_id')
    .eq('id', submissionId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !submission) {
    return { success: false, error: 'Submission not found' };
  }

  if (submission.status !== 'offer_stage') {
    return { success: false, error: 'Submission must be in offer stage' };
  }

  const { error: updateError } = await adminSupabase
    .from('submissions')
    .update({
      status: 'placed',
      offer_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (updateError) {
    console.error('Accept offer error:', updateError);
    return { success: false, error: 'Failed to accept offer' };
  }

  // Increment positions_filled on the job
  const { data: job } = await supabase
    .from('jobs')
    .select('positions_count, positions_filled')
    .eq('id', submission.job_id)
    .single();

  if (job) {
    const newFilled = (job.positions_filled || 0) + 1;
    const updateJobData: Record<string, unknown> = { positions_filled: newFilled };

    if (job.positions_count && newFilled >= job.positions_count) {
      updateJobData.status = 'filled';
      updateJobData.filled_date = new Date().toISOString();
    }

    await adminSupabase
      .from('jobs')
      .update(updateJobData)
      .eq('id', submission.job_id);
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'submissions',
    action: 'OFFER_ACCEPTED',
    recordId: submissionId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: 'offer_stage' },
    newValues: { status: 'placed' },
    metadata: { source: 'recruiting_offer_accepted' },
  });

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/submissions/${submissionId}`);
  revalidatePath(`/employee/recruiting/jobs/${submission.job_id}`);

  return getSubmissionAction(submissionId);
}

/**
 * Mark offer as declined
 */
export async function declineOfferAction(
  submissionId: string,
  reason: string
): Promise<ActionResult<Submission>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('status, job_id')
    .eq('id', submissionId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !submission) {
    return { success: false, error: 'Submission not found' };
  }

  if (submission.status !== 'offer_stage') {
    return { success: false, error: 'Submission must be in offer stage' };
  }

  const { error: updateError } = await adminSupabase
    .from('submissions')
    .update({
      status: 'rejected',
      offer_declined_at: new Date().toISOString(),
      offer_decline_reason: reason,
      rejection_reason: `Offer declined: ${reason}`,
      rejection_source: 'candidate',
      rejected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (updateError) {
    console.error('Decline offer error:', updateError);
    return { success: false, error: 'Failed to decline offer' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'submissions',
    action: 'OFFER_DECLINED',
    recordId: submissionId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: 'offer_stage' },
    newValues: { status: 'rejected', reason },
    metadata: { source: 'recruiting_offer_declined', reason },
  });

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/submissions/${submissionId}`);
  revalidatePath(`/employee/recruiting/jobs/${submission.job_id}`);

  return getSubmissionAction(submissionId);
}

/**
 * Reject a submission
 */
export async function rejectSubmissionAction(
  submissionId: string,
  input: z.infer<typeof rejectSubmissionSchema>
): Promise<ActionResult<Submission>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const validation = rejectSubmissionSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('status, job_id')
    .eq('id', submissionId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !submission) {
    return { success: false, error: 'Submission not found' };
  }

  if (['placed', 'rejected'].includes(submission.status)) {
    return { success: false, error: 'Cannot reject a placed or already rejected submission' };
  }

  const data = validation.data;

  const { error: updateError } = await adminSupabase
    .from('submissions')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: data.reason,
      rejection_source: data.source,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (updateError) {
    console.error('Reject submission error:', updateError);
    return { success: false, error: 'Failed to reject submission' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'submissions',
    action: 'REJECT',
    recordId: submissionId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: submission.status },
    newValues: { status: 'rejected', reason: data.reason, source: data.source },
    metadata: { source: 'recruiting_reject_submission' },
  });

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/submissions/${submissionId}`);
  revalidatePath(`/employee/recruiting/jobs/${submission.job_id}`);

  return getSubmissionAction(submissionId);
}

/**
 * Get submission pipeline for a job
 */
export async function getSubmissionPipelineAction(
  jobId?: string
): Promise<ActionResult<PipelineStage[]>> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  let query = supabase
    .from('submissions')
    .select(`
      *,
      job:jobs!job_id(title),
      candidate:user_profiles!candidate_id(full_name, email),
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name)
    `)
    .is('deleted_at', null);

  if (jobId) {
    query = query.eq('job_id', jobId);
  }

  const { data: submissions, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Get submission pipeline error:', error);
    return { success: false, error: 'Failed to fetch pipeline' };
  }

  const stageOrder = [
    { status: 'sourced', label: 'Sourced' },
    { status: 'screening', label: 'Screening' },
    { status: 'submission_ready', label: 'Ready to Submit' },
    { status: 'submitted_to_client', label: 'Submitted' },
    { status: 'client_review', label: 'Client Review' },
    { status: 'client_interview', label: 'Interview' },
    { status: 'offer_stage', label: 'Offer' },
    { status: 'placed', label: 'Placed' },
    { status: 'rejected', label: 'Rejected' },
  ];

  const pipeline: PipelineStage[] = stageOrder.map(stage => ({
    status: stage.status,
    label: stage.label,
    count: 0,
    submissions: [],
  }));

  (submissions || []).forEach((sub: any) => {
    const stageIndex = pipeline.findIndex(p => p.status === sub.status);
    if (stageIndex !== -1) {
      pipeline[stageIndex].count++;
      pipeline[stageIndex].submissions.push(transformSubmission(sub));
    }
  });

  return { success: true, data: pipeline };
}

/**
 * Get submissions for a specific job
 */
export async function getJobSubmissionsAction(jobId: string): Promise<ActionResult<Submission[]>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: submissions, error } = await supabase
    .from('submissions')
    .select(`
      *,
      job:jobs!job_id(title),
      candidate:user_profiles!candidate_id(full_name, email),
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name)
    `)
    .eq('job_id', jobId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get job submissions error:', error);
    return { success: false, error: 'Failed to fetch submissions' };
  }

  return { success: true, data: (submissions || []).map(transformSubmission) };
}

/**
 * Update match scores
 */
export async function updateMatchScoresAction(
  submissionId: string,
  scores: { aiMatchScore?: number; recruiterMatchScore?: number; matchExplanation?: string }
): Promise<ActionResult<Submission>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (scores.aiMatchScore !== undefined) updateData.ai_match_score = scores.aiMatchScore;
  if (scores.recruiterMatchScore !== undefined) updateData.recruiter_match_score = scores.recruiterMatchScore;
  if (scores.matchExplanation !== undefined) updateData.match_explanation = scores.matchExplanation;

  const { error: updateError } = await adminSupabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId);

  if (updateError) {
    console.error('Update match scores error:', updateError);
    return { success: false, error: 'Failed to update match scores' };
  }

  revalidatePath('/employee/recruiting/submissions');
  revalidatePath(`/employee/recruiting/submissions/${submissionId}`);

  return getSubmissionAction(submissionId);
}
