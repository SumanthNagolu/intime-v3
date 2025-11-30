/**
 * Recruiting Interviews Server Actions
 *
 * Provides CRUD operations for interview scheduling and management with RBAC enforcement.
 * Includes offers and placement workflow support.
 *
 * @module actions/recruiting-interviews
 */

'use server';

import { createClient, type UntypedFromFunction } from '@/lib/supabase/server';
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

export interface Interview {
  id: string;
  submissionId: string;
  jobId: string;
  jobTitle: string | null;
  candidateId: string;
  candidateName: string | null;
  candidateEmail: string | null;
  roundNumber: number;
  interviewType: string;
  scheduledAt: string | null;
  durationMinutes: number;
  timezone: string;
  meetingLink: string | null;
  meetingLocation: string | null;
  interviewerNames: string[] | null;
  interviewerEmails: string[] | null;
  scheduledBy: string | null;
  scheduledByName: string | null;
  status: string;
  cancellationReason: string | null;
  feedback: string | null;
  rating: number | null;
  recommendation: string | null;
  feedbackSubmittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  submissionId: string;
  jobId: string;
  jobTitle: string | null;
  candidateId: string;
  candidateName: string | null;
  offerType: string;
  rate: number;
  rateType: string;
  startDate: string | null;
  endDate: string | null;
  bonus: number | null;
  benefits: string | null;
  relocationAssistance: boolean;
  signOnBonus: number | null;
  status: string;
  sentAt: string | null;
  expiresAt: string | null;
  candidateCounterOffer: number | null;
  negotiationNotes: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Placement {
  id: string;
  submissionId: string;
  offerId: string | null;
  jobId: string;
  jobTitle: string | null;
  candidateId: string;
  candidateName: string | null;
  accountId: string;
  accountName: string | null;
  placementType: string;
  startDate: string;
  endDate: string | null;
  billRate: number;
  payRate: number;
  markupPercentage: number | null;
  status: string;
  endReason: string | null;
  actualEndDate: string | null;
  totalRevenue: number | null;
  totalPaid: number | null;
  onboardingStatus: string;
  onboardingCompletedAt: string | null;
  performanceRating: number | null;
  extensionCount: number;
  recruiterId: string;
  recruiterName: string | null;
  accountManagerId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

// Interview Schemas
const listInterviewsFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  submissionId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['scheduledAt', 'createdAt', 'roundNumber']).default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const createInterviewSchema = z.object({
  submissionId: z.string().uuid(),
  roundNumber: z.number().min(1).default(1),
  interviewType: z.enum(['phone_screen', 'technical', 'behavioral', 'panel', 'onsite', 'final']).default('technical'),
  scheduledAt: z.string(),
  durationMinutes: z.number().min(15).default(60),
  timezone: z.string().default('America/New_York'),
  meetingLink: z.string().url().optional(),
  meetingLocation: z.string().optional(),
  interviewerNames: z.array(z.string()).optional(),
  interviewerEmails: z.array(z.string().email()).optional(),
});

const updateInterviewSchema = z.object({
  scheduledAt: z.string().optional(),
  durationMinutes: z.number().min(15).optional(),
  timezone: z.string().optional(),
  meetingLink: z.string().url().optional(),
  meetingLocation: z.string().optional(),
  interviewerNames: z.array(z.string()).optional(),
  interviewerEmails: z.array(z.string().email()).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  cancellationReason: z.string().optional(),
});

const submitFeedbackSchema = z.object({
  feedback: z.string().min(1, 'Feedback is required'),
  rating: z.number().min(1).max(5),
  recommendation: z.enum(['strong_hire', 'hire', 'no_hire', 'strong_no_hire']),
});

// Offer Schemas
const createOfferSchema = z.object({
  submissionId: z.string().uuid(),
  offerType: z.enum(['contract', 'full_time', 'c2h']).default('contract'),
  rate: z.number().min(0),
  rateType: z.enum(['hourly', 'annual']).default('hourly'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bonus: z.number().min(0).optional(),
  benefits: z.string().optional(),
  relocationAssistance: z.boolean().default(false),
  signOnBonus: z.number().min(0).optional(),
  expiresAt: z.string().optional(),
});

// Schema defined for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateOfferSchema = z.object({
  rate: z.number().min(0).optional(),
  rateType: z.enum(['hourly', 'annual']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bonus: z.number().min(0).optional(),
  benefits: z.string().optional(),
  relocationAssistance: z.boolean().optional(),
  signOnBonus: z.number().min(0).optional(),
  expiresAt: z.string().optional(),
  candidateCounterOffer: z.number().min(0).optional(),
  negotiationNotes: z.string().optional(),
});

// Placement Schemas
const createPlacementSchema = z.object({
  submissionId: z.string().uuid(),
  offerId: z.string().uuid().optional(),
  placementType: z.enum(['contract', 'full_time', 'c2h']).default('contract'),
  startDate: z.string(),
  endDate: z.string().optional(),
  billRate: z.number().min(0),
  payRate: z.number().min(0),
  recruiterId: z.string().uuid().optional(),
  accountManagerId: z.string().uuid().optional(),
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

    const roleNames = roles?.map((r: { role?: { name?: string } }) => r.role?.name) || [];
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

  await (adminSupabase.from as unknown as UntypedFromFunction)('audit_logs').insert({
    table_name: tableName,
    action,
    record_id: recordId,
    user_id: userId,
    user_email: userEmail,
    org_id: orgId,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
    metadata: metadata ?? {},
    severity: action.includes('CANCEL') ? 'warning' : 'info',
  });
}

// ============================================================================
// INTERVIEW ACTIONS
// ============================================================================

interface InterviewRow {
  id: string;
  submission_id: string;
  job_id: string;
  job?: { title?: string } | null;
  candidate_id: string;
  candidate?: { full_name?: string; email?: string } | null;
  round_number: number;
  interview_type: string;
  scheduled_at: string | null;
  duration_minutes: number;
  timezone: string;
  meeting_link: string | null;
  meeting_location: string | null;
  interviewer_names: string[] | null;
  interviewer_emails: string[] | null;
  scheduled_by: string | null;
  scheduler?: { full_name?: string } | null;
  status: string;
  cancellation_reason: string | null;
  feedback: string | null;
  rating: number | null;
  recommendation: string | null;
  feedback_submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * List interviews with pagination and filtering
 */
export async function listInterviewsAction(
  filters: z.infer<typeof listInterviewsFiltersSchema>
): Promise<ActionResult<PaginatedResult<Interview>>> {
  const validation = listInterviewsFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, status, submissionId, jobId, candidateId, dateFrom, dateTo, sortBy, sortOrder } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  let query = supabase
    .from('interviews')
    .select(`
      *,
      job:jobs!interviews_job_id_fkey(title),
      candidate:user_profiles!interviews_candidate_id_fkey(full_name, email),
      scheduler:user_profiles!interviews_scheduled_by_fkey(full_name)
    `, { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (submissionId) query = query.eq('submission_id', submissionId);
  if (jobId) query = query.eq('job_id', jobId);
  if (candidateId) query = query.eq('candidate_id', candidateId);
  if (dateFrom) query = query.gte('scheduled_at', dateFrom);
  if (dateTo) query = query.lte('scheduled_at', dateTo);

  const sortColumn = sortBy === 'scheduledAt' ? 'scheduled_at' :
                     sortBy === 'roundNumber' ? 'round_number' :
                     'created_at';
  query = query.order(sortColumn, { ascending: sortOrder === 'asc', nullsFirst: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: interviews, error, count } = await query;

  if (error) {
    console.error('List interviews error:', error);
    return { success: false, error: 'Failed to fetch interviews' };
  }

  const transformedInterviews: Interview[] = (interviews || []).map((i: unknown) => {
    const interview = i as InterviewRow;
    return {
      id: interview.id,
      submissionId: interview.submission_id,
      jobId: interview.job_id,
      jobTitle: interview.job?.title ?? null,
      candidateId: interview.candidate_id,
      candidateName: interview.candidate?.full_name ?? null,
      candidateEmail: interview.candidate?.email ?? null,
      roundNumber: interview.round_number,
      interviewType: interview.interview_type,
      scheduledAt: interview.scheduled_at,
      durationMinutes: interview.duration_minutes,
      timezone: interview.timezone,
      meetingLink: interview.meeting_link,
      meetingLocation: interview.meeting_location,
      interviewerNames: interview.interviewer_names,
      interviewerEmails: interview.interviewer_emails,
      scheduledBy: interview.scheduled_by,
      scheduledByName: interview.scheduler?.full_name ?? null,
      status: interview.status,
      cancellationReason: interview.cancellation_reason,
      feedback: interview.feedback,
      rating: interview.rating,
      recommendation: interview.recommendation,
      feedbackSubmittedAt: interview.feedback_submitted_at,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at,
    };
  });

  return {
    success: true,
    data: {
      items: transformedInterviews,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Get a single interview by ID
 */
export async function getInterviewAction(interviewId: string): Promise<ActionResult<Interview>> {
  if (!interviewId || !z.string().uuid().safeParse(interviewId).success) {
    return { success: false, error: 'Invalid interview ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: interview, error } = await supabase
    .from('interviews')
    .select(`
      *,
      job:jobs!interviews_job_id_fkey(title),
      candidate:user_profiles!interviews_candidate_id_fkey(full_name, email),
      scheduler:user_profiles!interviews_scheduled_by_fkey(full_name)
    `)
    .eq('id', interviewId)
    .single();

  if (error || !interview) {
    return { success: false, error: 'Interview not found' };
  }

  return {
    success: true,
    data: {
      id: interview.id,
      submissionId: interview.submission_id,
      jobId: interview.job_id,
      jobTitle: interview.job?.title || null,
      candidateId: interview.candidate_id,
      candidateName: interview.candidate?.full_name || null,
      candidateEmail: interview.candidate?.email || null,
      roundNumber: interview.round_number,
      interviewType: interview.interview_type as string,
      scheduledAt: interview.scheduled_at,
      durationMinutes: interview.duration_minutes as number,
      timezone: interview.timezone as string,
      meetingLink: interview.meeting_link,
      meetingLocation: interview.meeting_location,
      interviewerNames: interview.interviewer_names,
      interviewerEmails: interview.interviewer_emails,
      scheduledBy: interview.scheduled_by,
      scheduledByName: interview.scheduler?.full_name || null,
      status: interview.status,
      cancellationReason: interview.cancellation_reason,
      feedback: interview.feedback,
      rating: interview.rating,
      recommendation: interview.recommendation,
      feedbackSubmittedAt: interview.feedback_submitted_at,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at,
    },
  };
}

/**
 * Schedule a new interview
 */
export async function createInterviewAction(
  input: z.infer<typeof createInterviewSchema>
): Promise<ActionResult<Interview>> {
  const validation = createInterviewSchema.safeParse(input);
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

  const hasPermission = await checkPermission(supabase, profile.id, 'interviews', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: interviews:create required' };
  }

  // Get submission details
  const { data: submission } = await supabase
    .from('submissions')
    .select('job_id, candidate_id')
    .eq('id', input.submissionId)
    .is('deleted_at', null)
    .single();

  if (!submission) {
    return { success: false, error: 'Submission not found' };
  }

  const data = validation.data;

  const { data: newInterview, error } = await adminSupabase
    .from('interviews')
    .insert({
      org_id: profile.org_id,
      submission_id: data.submissionId,
      job_id: submission.job_id,
      candidate_id: submission.candidate_id,
      round_number: data.roundNumber,
      interview_type: data.interviewType,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.durationMinutes,
      timezone: data.timezone,
      meeting_link: data.meetingLink || null,
      meeting_location: data.meetingLocation || null,
      interviewer_names: data.interviewerNames || null,
      interviewer_emails: data.interviewerEmails || null,
      scheduled_by: profile.id,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error || !newInterview) {
    console.error('Create interview error:', error);
    return { success: false, error: 'Failed to create interview' };
  }

  // Update submission interview count
  await adminSupabase
    .from('submissions')
    .update({
      interview_count: (await adminSupabase
        .from('interviews')
        .select('id', { count: 'exact', head: true })
        .eq('submission_id', data.submissionId)
      ).count || 0
    })
    .eq('id', data.submissionId);

  await logAuditEvent(adminSupabase, {
    tableName: 'interviews',
    action: 'INSERT',
    recordId: newInterview.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'recruiting_schedule_interview' },
  });

  revalidatePath('/employee/recruiting/interviews');
  revalidatePath(`/employee/recruiting/submissions/${data.submissionId}`);

  return getInterviewAction(newInterview.id);
}

/**
 * Update an interview
 */
export async function updateInterviewAction(
  interviewId: string,
  input: z.infer<typeof updateInterviewSchema>
): Promise<ActionResult<Interview>> {
  if (!interviewId || !z.string().uuid().safeParse(interviewId).success) {
    return { success: false, error: 'Invalid interview ID' };
  }

  const validation = updateInterviewSchema.safeParse(input);
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

  const { data: existingInterview, error: fetchError } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', interviewId)
    .single();

  if (fetchError || !existingInterview) {
    return { success: false, error: 'Interview not found' };
  }

  const data = validation.data;
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.scheduledAt !== undefined) updateData.scheduled_at = data.scheduledAt;
  if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;
  if (data.meetingLink !== undefined) updateData.meeting_link = data.meetingLink;
  if (data.meetingLocation !== undefined) updateData.meeting_location = data.meetingLocation;
  if (data.interviewerNames !== undefined) updateData.interviewer_names = data.interviewerNames;
  if (data.interviewerEmails !== undefined) updateData.interviewer_emails = data.interviewerEmails;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.cancellationReason !== undefined) updateData.cancellation_reason = data.cancellationReason;

  const { error: updateError } = await adminSupabase
    .from('interviews')
    .update(updateData)
    .eq('id', interviewId);

  if (updateError) {
    console.error('Update interview error:', updateError);
    return { success: false, error: 'Failed to update interview' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'interviews',
    action: 'UPDATE',
    recordId: interviewId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingInterview,
    newValues: updateData,
    metadata: { source: 'recruiting_update_interview' },
  });

  revalidatePath('/employee/recruiting/interviews');
  revalidatePath(`/employee/recruiting/interviews/${interviewId}`);

  return getInterviewAction(interviewId);
}

/**
 * Cancel an interview
 */
export async function cancelInterviewAction(
  interviewId: string,
  reason: string
): Promise<ActionResult<Interview>> {
  if (!interviewId || !z.string().uuid().safeParse(interviewId).success) {
    return { success: false, error: 'Invalid interview ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: interview, error: fetchError } = await supabase
    .from('interviews')
    .select('status, submission_id')
    .eq('id', interviewId)
    .single();

  if (fetchError || !interview) {
    return { success: false, error: 'Interview not found' };
  }

  if (interview.status !== 'scheduled') {
    return { success: false, error: 'Can only cancel scheduled interviews' };
  }

  const { error: updateError } = await adminSupabase
    .from('interviews')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', interviewId);

  if (updateError) {
    console.error('Cancel interview error:', updateError);
    return { success: false, error: 'Failed to cancel interview' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'interviews',
    action: 'CANCEL',
    recordId: interviewId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: 'scheduled' },
    newValues: { status: 'cancelled', reason },
    metadata: { source: 'recruiting_cancel_interview', reason },
  });

  revalidatePath('/employee/recruiting/interviews');
  revalidatePath(`/employee/recruiting/submissions/${interview.submission_id}`);

  return getInterviewAction(interviewId);
}

/**
 * Submit interview feedback
 */
export async function submitInterviewFeedbackAction(
  interviewId: string,
  input: z.infer<typeof submitFeedbackSchema>
): Promise<ActionResult<Interview>> {
  if (!interviewId || !z.string().uuid().safeParse(interviewId).success) {
    return { success: false, error: 'Invalid interview ID' };
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
  const adminSupabase = createAdminClient();

  const { data: interview, error: fetchError } = await supabase
    .from('interviews')
    .select('status, submission_id')
    .eq('id', interviewId)
    .single();

  if (fetchError || !interview) {
    return { success: false, error: 'Interview not found' };
  }

  const data = validation.data;

  const { error: updateError } = await adminSupabase
    .from('interviews')
    .update({
      status: 'completed',
      feedback: data.feedback,
      rating: data.rating,
      recommendation: data.recommendation,
      feedback_submitted_at: new Date().toISOString(),
      submitted_by: profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', interviewId);

  if (updateError) {
    console.error('Submit feedback error:', updateError);
    return { success: false, error: 'Failed to submit feedback' };
  }

  // Update submission with latest interview date and feedback
  await adminSupabase
    .from('submissions')
    .update({
      last_interview_date: new Date().toISOString(),
      interview_feedback: data.feedback,
      updated_at: new Date().toISOString(),
    })
    .eq('id', interview.submission_id);

  await logAuditEvent(adminSupabase, {
    tableName: 'interviews',
    action: 'FEEDBACK_SUBMITTED',
    recordId: interviewId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: { rating: data.rating, recommendation: data.recommendation },
    metadata: { source: 'recruiting_interview_feedback' },
  });

  revalidatePath('/employee/recruiting/interviews');
  revalidatePath(`/employee/recruiting/submissions/${interview.submission_id}`);

  return getInterviewAction(interviewId);
}

/**
 * Get interviews for a submission
 */
export async function getSubmissionInterviewsAction(
  submissionId: string
): Promise<ActionResult<Interview[]>> {
  if (!submissionId || !z.string().uuid().safeParse(submissionId).success) {
    return { success: false, error: 'Invalid submission ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: interviews, error } = await supabase
    .from('interviews')
    .select(`
      *,
      job:jobs!interviews_job_id_fkey(title),
      candidate:user_profiles!interviews_candidate_id_fkey(full_name, email),
      scheduler:user_profiles!interviews_scheduled_by_fkey(full_name)
    `)
    .eq('submission_id', submissionId)
    .order('round_number', { ascending: true });

  if (error) {
    console.error('Get submission interviews error:', error);
    return { success: false, error: 'Failed to fetch interviews' };
  }

  const transformedInterviews: Interview[] = (interviews || []).map((i: unknown) => {
    const interview = i as InterviewRow;
    return {
      id: interview.id,
      submissionId: interview.submission_id,
      jobId: interview.job_id,
      jobTitle: interview.job?.title ?? null,
      candidateId: interview.candidate_id,
      candidateName: interview.candidate?.full_name ?? null,
      candidateEmail: interview.candidate?.email ?? null,
      roundNumber: interview.round_number,
      interviewType: interview.interview_type,
      scheduledAt: interview.scheduled_at,
      durationMinutes: interview.duration_minutes,
      timezone: interview.timezone,
      meetingLink: interview.meeting_link,
      meetingLocation: interview.meeting_location,
      interviewerNames: interview.interviewer_names,
      interviewerEmails: interview.interviewer_emails,
      scheduledBy: interview.scheduled_by,
      scheduledByName: interview.scheduler?.full_name ?? null,
      status: interview.status,
      cancellationReason: interview.cancellation_reason,
      feedback: interview.feedback,
      rating: interview.rating,
      recommendation: interview.recommendation,
      feedbackSubmittedAt: interview.feedback_submitted_at,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at,
    };
  });

  return { success: true, data: transformedInterviews };
}

/**
 * Get upcoming interviews (next 7 days)
 */
export async function getUpcomingInterviewsAction(): Promise<ActionResult<Interview[]>> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const { data: interviews, error } = await supabase
    .from('interviews')
    .select(`
      *,
      job:jobs!interviews_job_id_fkey(title),
      candidate:user_profiles!interviews_candidate_id_fkey(full_name, email),
      scheduler:user_profiles!interviews_scheduled_by_fkey(full_name)
    `)
    .eq('status', 'scheduled')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', nextWeek.toISOString())
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('Get upcoming interviews error:', error);
    return { success: false, error: 'Failed to fetch interviews' };
  }

  const transformedInterviews: Interview[] = (interviews || []).map((i: unknown) => {
    const interview = i as InterviewRow;
    return {
      id: interview.id,
      submissionId: interview.submission_id,
      jobId: interview.job_id,
      jobTitle: interview.job?.title ?? null,
      candidateId: interview.candidate_id,
      candidateName: interview.candidate?.full_name ?? null,
      candidateEmail: interview.candidate?.email ?? null,
      roundNumber: interview.round_number,
      interviewType: interview.interview_type,
      scheduledAt: interview.scheduled_at,
      durationMinutes: interview.duration_minutes,
      timezone: interview.timezone,
      meetingLink: interview.meeting_link,
      meetingLocation: interview.meeting_location,
      interviewerNames: interview.interviewer_names,
      interviewerEmails: interview.interviewer_emails,
      scheduledBy: interview.scheduled_by,
      scheduledByName: interview.scheduler?.full_name ?? null,
      status: interview.status,
      cancellationReason: interview.cancellation_reason,
      feedback: interview.feedback,
      rating: interview.rating,
      recommendation: interview.recommendation,
      feedbackSubmittedAt: interview.feedback_submitted_at,
      createdAt: interview.created_at,
      updatedAt: interview.updated_at,
    };
  });

  return { success: true, data: transformedInterviews };
}

// ============================================================================
// OFFER ACTIONS
// ============================================================================

/**
 * Create an offer
 */
export async function createOfferAction(
  input: z.infer<typeof createOfferSchema>
): Promise<ActionResult<Offer>> {
  const validation = createOfferSchema.safeParse(input);
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

  const hasPermission = await checkPermission(supabase, profile.id, 'offers', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: offers:create required' };
  }

  // Get submission details
  const { data: submission } = await supabase
    .from('submissions')
    .select('job_id, candidate_id')
    .eq('id', input.submissionId)
    .is('deleted_at', null)
    .single();

  if (!submission) {
    return { success: false, error: 'Submission not found' };
  }

  const data = validation.data;

  const { data: newOffer, error } = await adminSupabase
    .from('offers')
    .insert({
      org_id: profile.org_id,
      submission_id: data.submissionId,
      job_id: submission.job_id,
      candidate_id: submission.candidate_id,
      offer_type: data.offerType,
      rate: data.rate,
      rate_type: data.rateType,
      start_date: data.startDate || null,
      end_date: data.endDate || null,
      bonus: data.bonus || null,
      benefits: data.benefits || null,
      relocation_assistance: data.relocationAssistance,
      sign_on_bonus: data.signOnBonus || null,
      status: 'draft',
      expires_at: data.expiresAt || null,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !newOffer) {
    console.error('Create offer error:', error);
    return { success: false, error: 'Failed to create offer' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'offers',
    action: 'INSERT',
    recordId: newOffer.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'recruiting_create_offer' },
  });

  revalidatePath('/employee/recruiting/offers');
  revalidatePath(`/employee/recruiting/submissions/${data.submissionId}`);

  return getOfferAction(newOffer.id);
}

/**
 * Get an offer by ID
 */
export async function getOfferAction(offerId: string): Promise<ActionResult<Offer>> {
  if (!offerId || !z.string().uuid().safeParse(offerId).success) {
    return { success: false, error: 'Invalid offer ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: offer, error } = await supabase
    .from('offers')
    .select(`
      *,
      job:jobs!offers_job_id_fkey(title),
      candidate:user_profiles!offers_candidate_id_fkey(full_name)
    `)
    .eq('id', offerId)
    .single();

  if (error || !offer) {
    return { success: false, error: 'Offer not found' };
  }

  return {
    success: true,
    data: {
      id: offer.id,
      submissionId: offer.submission_id,
      jobId: offer.job_id,
      jobTitle: offer.job?.title || null,
      candidateId: offer.candidate_id,
      candidateName: offer.candidate?.full_name || null,
      offerType: offer.offer_type as string,
      rate: typeof offer.rate === 'string' ? parseFloat(offer.rate) : offer.rate,
      rateType: offer.rate_type as string,
      startDate: offer.start_date,
      endDate: offer.end_date,
      bonus: offer.bonus ? (typeof offer.bonus === 'string' ? parseFloat(offer.bonus) : offer.bonus) : null,
      benefits: offer.benefits,
      relocationAssistance: offer.relocation_assistance as boolean,
      signOnBonus: offer.sign_on_bonus ? (typeof offer.sign_on_bonus === 'string' ? parseFloat(offer.sign_on_bonus) : offer.sign_on_bonus) : null,
      status: offer.status,
      sentAt: offer.sent_at,
      expiresAt: offer.expires_at,
      candidateCounterOffer: offer.candidate_counter_offer ? (typeof offer.candidate_counter_offer === 'string' ? parseFloat(offer.candidate_counter_offer) : offer.candidate_counter_offer) : null,
      negotiationNotes: offer.negotiation_notes,
      acceptedAt: offer.accepted_at,
      declinedAt: offer.declined_at,
      declineReason: offer.decline_reason,
      createdAt: offer.created_at,
      updatedAt: offer.updated_at,
    },
  };
}

/**
 * Send an offer to candidate
 */
export async function sendOfferAction(offerId: string): Promise<ActionResult<Offer>> {
  if (!offerId || !z.string().uuid().safeParse(offerId).success) {
    return { success: false, error: 'Invalid offer ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: offer, error: fetchError } = await supabase
    .from('offers')
    .select('status, submission_id')
    .eq('id', offerId)
    .single();

  if (fetchError || !offer) {
    return { success: false, error: 'Offer not found' };
  }

  if (offer.status !== 'draft') {
    return { success: false, error: 'Can only send draft offers' };
  }

  const { error: updateError } = await adminSupabase
    .from('offers')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', offerId);

  if (updateError) {
    console.error('Send offer error:', updateError);
    return { success: false, error: 'Failed to send offer' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'offers',
    action: 'SEND',
    recordId: offerId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: 'draft' },
    newValues: { status: 'sent' },
    metadata: { source: 'recruiting_send_offer' },
  });

  revalidatePath('/employee/recruiting/offers');
  revalidatePath(`/employee/recruiting/submissions/${offer.submission_id}`);

  return getOfferAction(offerId);
}

// ============================================================================
// PLACEMENT ACTIONS
// ============================================================================

interface PlacementRow {
  id: string;
  submission_id: string;
  offer_id: string | null;
  job_id: string;
  job?: { title?: string } | null;
  candidate_id: string;
  candidate?: { full_name?: string } | null;
  account_id: string;
  account?: { name?: string } | null;
  placement_type: string;
  start_date: string;
  end_date: string | null;
  bill_rate: string | number;
  pay_rate: string | number;
  markup_percentage: string | number | null;
  status: string;
  end_reason: string | null;
  actual_end_date: string | null;
  total_revenue: string | number | null;
  total_paid: string | number | null;
  onboarding_status: string;
  onboarding_completed_at: string | null;
  performance_rating: number | null;
  extension_count: number;
  recruiter_id: string;
  recruiter?: { full_name?: string } | null;
  account_manager_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a placement
 */
export async function createPlacementAction(
  input: z.infer<typeof createPlacementSchema>
): Promise<ActionResult<Placement>> {
  const validation = createPlacementSchema.safeParse(input);
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

  const hasPermission = await checkPermission(supabase, profile.id, 'placements', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: placements:create required' };
  }

  // Get submission details
  const { data: submission } = await supabase
    .from('submissions')
    .select('job_id, candidate_id, account_id')
    .eq('id', input.submissionId)
    .is('deleted_at', null)
    .single();

  if (!submission) {
    return { success: false, error: 'Submission not found' };
  }

  if (!submission.account_id) {
    return { success: false, error: 'Submission must be associated with an account' };
  }

  const data = validation.data;

  // Calculate markup percentage
  const markupPercentage = data.billRate > 0
    ? ((data.billRate - data.payRate) / data.billRate) * 100
    : 0;

  const { data: newPlacement, error } = await adminSupabase
    .from('placements')
    .insert({
      org_id: profile.org_id,
      submission_id: data.submissionId,
      offer_id: data.offerId || null,
      job_id: submission.job_id,
      candidate_id: submission.candidate_id,
      account_id: submission.account_id,
      placement_type: data.placementType,
      start_date: data.startDate,
      end_date: data.endDate || null,
      bill_rate: data.billRate,
      pay_rate: data.payRate,
      markup_percentage: markupPercentage,
      status: 'active',
      onboarding_status: 'pending',
      recruiter_id: data.recruiterId || profile.id,
      account_manager_id: data.accountManagerId || null,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !newPlacement) {
    console.error('Create placement error:', error);
    return { success: false, error: 'Failed to create placement' };
  }

  // Update submission to placed status
  await adminSupabase
    .from('submissions')
    .update({
      status: 'placed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.submissionId);

  await logAuditEvent(adminSupabase, {
    tableName: 'placements',
    action: 'INSERT',
    recordId: newPlacement.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'recruiting_create_placement' },
  });

  revalidatePath('/employee/recruiting/placements');
  revalidatePath(`/employee/recruiting/submissions/${data.submissionId}`);

  return getPlacementAction(newPlacement.id);
}

/**
 * Get a placement by ID
 */
export async function getPlacementAction(placementId: string): Promise<ActionResult<Placement>> {
  if (!placementId || !z.string().uuid().safeParse(placementId).success) {
    return { success: false, error: 'Invalid placement ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: placement, error } = await supabase
    .from('placements')
    .select(`
      *,
      job:jobs!placements_job_id_fkey(title),
      candidate:user_profiles!placements_candidate_id_fkey(full_name),
      account:accounts!placements_account_id_fkey(name),
      recruiter:user_profiles!placements_recruiter_id_fkey(full_name)
    `)
    .eq('id', placementId)
    .single();

  if (error || !placement) {
    return { success: false, error: 'Placement not found' };
  }

  return {
    success: true,
    data: {
      id: placement.id,
      submissionId: placement.submission_id,
      offerId: placement.offer_id,
      jobId: placement.job_id,
      jobTitle: placement.job?.title || null,
      candidateId: placement.candidate_id,
      candidateName: placement.candidate?.full_name || null,
      accountId: placement.account_id,
      accountName: placement.account?.name || null,
      placementType: placement.placement_type as string,
      startDate: placement.start_date,
      endDate: placement.end_date,
      billRate: typeof placement.bill_rate === 'string' ? parseFloat(placement.bill_rate) : placement.bill_rate,
      payRate: typeof placement.pay_rate === 'string' ? parseFloat(placement.pay_rate) : placement.pay_rate,
      markupPercentage: placement.markup_percentage ? (typeof placement.markup_percentage === 'string' ? parseFloat(placement.markup_percentage) : placement.markup_percentage) : null,
      status: placement.status,
      endReason: placement.end_reason,
      actualEndDate: placement.actual_end_date,
      totalRevenue: placement.total_revenue ? (typeof placement.total_revenue === 'string' ? parseFloat(placement.total_revenue) : placement.total_revenue) : null,
      totalPaid: placement.total_paid ? (typeof placement.total_paid === 'string' ? parseFloat(placement.total_paid) : placement.total_paid) : null,
      onboardingStatus: placement.onboarding_status as string,
      onboardingCompletedAt: placement.onboarding_completed_at,
      performanceRating: placement.performance_rating,
      extensionCount: placement.extension_count as number,
      recruiterId: placement.recruiter_id,
      recruiterName: placement.recruiter?.full_name || null,
      accountManagerId: placement.account_manager_id,
      createdAt: placement.created_at,
      updatedAt: placement.updated_at,
    },
  };
}

/**
 * List placements
 */
export async function listPlacementsAction(
  filters: { status?: string; accountId?: string; page?: number; pageSize?: number } = {}
): Promise<ActionResult<PaginatedResult<Placement>>> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;

  let query = supabase
    .from('placements')
    .select(`
      *,
      job:jobs!placements_job_id_fkey(title),
      candidate:user_profiles!placements_candidate_id_fkey(full_name),
      account:accounts!placements_account_id_fkey(name),
      recruiter:user_profiles!placements_recruiter_id_fkey(full_name)
    `, { count: 'exact' });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.accountId) query = query.eq('account_id', filters.accountId);

  query = query.order('created_at', { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: placements, error, count } = await query;

  if (error) {
    console.error('List placements error:', error);
    return { success: false, error: 'Failed to fetch placements' };
  }

  const transformedPlacements: Placement[] = (placements || []).map((p: unknown) => {
    const placement = p as PlacementRow;
    return {
      id: placement.id,
      submissionId: placement.submission_id,
      offerId: placement.offer_id,
      jobId: placement.job_id,
      jobTitle: placement.job?.title ?? null,
      candidateId: placement.candidate_id,
      candidateName: placement.candidate?.full_name ?? null,
      accountId: placement.account_id,
      accountName: placement.account?.name ?? null,
      placementType: placement.placement_type,
      startDate: placement.start_date,
      endDate: placement.end_date,
      billRate: typeof placement.bill_rate === 'string' ? parseFloat(placement.bill_rate) : placement.bill_rate,
      payRate: typeof placement.pay_rate === 'string' ? parseFloat(placement.pay_rate) : placement.pay_rate,
      markupPercentage: placement.markup_percentage ? (typeof placement.markup_percentage === 'string' ? parseFloat(placement.markup_percentage) : placement.markup_percentage) : null,
      status: placement.status,
      endReason: placement.end_reason,
      actualEndDate: placement.actual_end_date,
      totalRevenue: placement.total_revenue ? (typeof placement.total_revenue === 'string' ? parseFloat(placement.total_revenue) : placement.total_revenue) : null,
      totalPaid: placement.total_paid ? (typeof placement.total_paid === 'string' ? parseFloat(placement.total_paid) : placement.total_paid) : null,
      onboardingStatus: placement.onboarding_status,
      onboardingCompletedAt: placement.onboarding_completed_at,
      performanceRating: placement.performance_rating,
      extensionCount: placement.extension_count,
      recruiterId: placement.recruiter_id,
      recruiterName: placement.recruiter?.full_name ?? null,
      accountManagerId: placement.account_manager_id,
      createdAt: placement.created_at,
      updatedAt: placement.updated_at,
    };
  });

  return {
    success: true,
    data: {
      items: transformedPlacements,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Complete placement onboarding
 */
export async function completePlacementOnboardingAction(
  placementId: string
): Promise<ActionResult<Placement>> {
  if (!placementId || !z.string().uuid().safeParse(placementId).success) {
    return { success: false, error: 'Invalid placement ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const adminSupabase = createAdminClient();

  const { error: updateError } = await adminSupabase
    .from('placements')
    .update({
      onboarding_status: 'completed',
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', placementId);

  if (updateError) {
    console.error('Complete onboarding error:', updateError);
    return { success: false, error: 'Failed to complete onboarding' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'placements',
    action: 'ONBOARDING_COMPLETE',
    recordId: placementId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: { onboarding_status: 'completed' },
    metadata: { source: 'recruiting_complete_onboarding' },
  });

  revalidatePath('/employee/recruiting/placements');

  return getPlacementAction(placementId);
}

/**
 * End a placement
 */
export async function endPlacementAction(
  placementId: string,
  reason: string,
  actualEndDate: string
): Promise<ActionResult<Placement>> {
  if (!placementId || !z.string().uuid().safeParse(placementId).success) {
    return { success: false, error: 'Invalid placement ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const adminSupabase = createAdminClient();

  const { error: updateError } = await adminSupabase
    .from('placements')
    .update({
      status: 'ended',
      end_reason: reason,
      actual_end_date: actualEndDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', placementId);

  if (updateError) {
    console.error('End placement error:', updateError);
    return { success: false, error: 'Failed to end placement' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'placements',
    action: 'END',
    recordId: placementId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: { status: 'ended', reason, actualEndDate },
    metadata: { source: 'recruiting_end_placement', reason },
  });

  revalidatePath('/employee/recruiting/placements');

  return getPlacementAction(placementId);
}
