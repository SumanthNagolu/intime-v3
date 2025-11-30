/**
 * Recruiting Jobs Server Actions
 *
 * Provides CRUD operations for job requisitions with RBAC enforcement.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/recruiting-jobs
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

export interface Job {
  id: string;
  title: string;
  description: string | null;
  jobType: string | null;
  location: string | null;
  isRemote: boolean | null;
  hybridDays: number | null;
  rateMin: number | null;
  rateMax: number | null;
  rateType: string | null;
  currency: string | null;
  status: string | null;
  urgency: string | null;
  positionsCount: number | null;
  positionsFilled: number | null;
  requiredSkills: string[] | null;
  niceToHaveSkills: string[] | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  visaRequirements: string[] | null;
  accountId: string | null;
  accountName: string | null;
  dealId: string | null;
  ownerId: string;
  ownerName: string | null;
  recruiterIds: string[] | null;
  postedDate: string | null;
  targetFillDate: string | null;
  filledDate: string | null;
  clientSubmissionInstructions: string | null;
  clientInterviewProcess: string | null;
  submissionCount: number;
  activeSubmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobMetrics {
  totalJobs: number;
  openJobs: number;
  urgentJobs: number;
  filledThisMonth: number;
  avgTimeToFill: number;
  avgSubmissionsPerJob: number;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const listJobsFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['draft', 'open', 'urgent', 'on_hold', 'filled', 'cancelled']).optional(),
  accountId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  jobType: z.enum(['contract', 'full_time', 'c2h', 'part_time']).optional(),
  isRemote: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'rateMin', 'targetFillDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createJobSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  jobType: z.enum(['contract', 'full_time', 'c2h', 'part_time']).default('contract'),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  hybridDays: z.number().min(0).max(5).optional(),
  rateMin: z.number().min(0).optional(),
  rateMax: z.number().min(0).optional(),
  rateType: z.enum(['hourly', 'annual']).default('hourly'),
  currency: z.string().default('USD'),
  positionsCount: z.number().min(1).default(1),
  requiredSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  minExperienceYears: z.number().min(0).optional(),
  maxExperienceYears: z.number().min(0).optional(),
  visaRequirements: z.array(z.string()).optional(),
  accountId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  recruiterIds: z.array(z.string().uuid()).optional(),
  targetFillDate: z.string().optional(),
  clientSubmissionInstructions: z.string().optional(),
  clientInterviewProcess: z.string().optional(),
});

const updateJobSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  jobType: z.enum(['contract', 'full_time', 'c2h', 'part_time']).optional(),
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  hybridDays: z.number().min(0).max(5).optional(),
  rateMin: z.number().min(0).optional(),
  rateMax: z.number().min(0).optional(),
  rateType: z.enum(['hourly', 'annual']).optional(),
  currency: z.string().optional(),
  status: z.enum(['draft', 'open', 'urgent', 'on_hold', 'filled', 'cancelled']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  positionsCount: z.number().min(1).optional(),
  requiredSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  minExperienceYears: z.number().min(0).optional(),
  maxExperienceYears: z.number().min(0).optional(),
  visaRequirements: z.array(z.string()).optional(),
  ownerId: z.string().uuid().optional(),
  recruiterIds: z.array(z.string().uuid()).optional(),
  targetFillDate: z.string().optional(),
  clientSubmissionInstructions: z.string().optional(),
  clientInterviewProcess: z.string().optional(),
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
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
    metadata: metadata ?? {},
    severity: action === 'DELETE' ? 'warning' : 'info',
  });
}

// ============================================================================
// JOB ACTIONS
// ============================================================================

/**
 * List jobs with pagination, search, and filtering
 */
export async function listJobsAction(
  filters: z.infer<typeof listJobsFiltersSchema>
): Promise<ActionResult<PaginatedResult<Job>>> {
  const validation = listJobsFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, status, accountId, ownerId, jobType, isRemote, sortBy, sortOrder } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'jobs', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: jobs:read required' };
  }

  const baseQuery = supabase.from('jobs') as any;
  let query = baseQuery
    .select(`
      id,
      title,
      description,
      job_type,
      location,
      is_remote,
      hybrid_days,
      rate_min,
      rate_max,
      rate_type,
      currency,
      status,
      urgency,
      positions_count,
      positions_filled,
      required_skills,
      nice_to_have_skills,
      min_experience_years,
      max_experience_years,
      visa_requirements,
      account_id,
      deal_id,
      owner_id,
      recruiter_ids,
      posted_date,
      target_fill_date,
      filled_date,
      client_submission_instructions,
      client_interview_process,
      created_at,
      updated_at,
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name),
      submissions(id, status)
    `, { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (status) query = query.eq('status', status);
  if (accountId) query = query.eq('account_id', accountId);
  if (ownerId) query = query.eq('owner_id', ownerId);
  if (jobType) query = query.eq('job_type', jobType);
  if (isRemote !== undefined) query = query.eq('is_remote', isRemote);

  const sortColumn = sortBy === 'createdAt' ? 'created_at' :
                     sortBy === 'updatedAt' ? 'updated_at' :
                     sortBy === 'rateMin' ? 'rate_min' :
                     sortBy === 'targetFillDate' ? 'target_fill_date' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: jobs, error, count } = await query;

  if (error) {
    console.error('List jobs error:', error);
    return { success: false, error: 'Failed to fetch jobs' };
  }

  const activeStatuses = ['sourced', 'screening', 'submission_ready', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage'];

  const transformedJobs: Job[] = (jobs || []).map((job: any) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    jobType: job.job_type,
    location: job.location,
    isRemote: job.is_remote,
    hybridDays: job.hybrid_days,
    rateMin: job.rate_min ? (typeof job.rate_min === 'string' ? parseFloat(job.rate_min) : job.rate_min) : null,
    rateMax: job.rate_max ? (typeof job.rate_max === 'string' ? parseFloat(job.rate_max) : job.rate_max) : null,
    rateType: job.rate_type,
    currency: job.currency,
    status: job.status,
    urgency: job.urgency,
    positionsCount: job.positions_count,
    positionsFilled: job.positions_filled,
    requiredSkills: job.required_skills,
    niceToHaveSkills: job.nice_to_have_skills,
    minExperienceYears: job.min_experience_years,
    maxExperienceYears: job.max_experience_years,
    visaRequirements: job.visa_requirements,
    accountId: job.account_id,
    accountName: job.account?.name || null,
    dealId: job.deal_id,
    ownerId: job.owner_id,
    ownerName: job.owner?.full_name || null,
    recruiterIds: job.recruiter_ids,
    postedDate: job.posted_date,
    targetFillDate: job.target_fill_date,
    filledDate: job.filled_date,
    clientSubmissionInstructions: job.client_submission_instructions,
    clientInterviewProcess: job.client_interview_process,
    submissionCount: job.submissions?.length || 0,
    activeSubmissions: job.submissions?.filter((s: any) => activeStatuses.includes(s.status)).length || 0,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  }));

  return {
    success: true,
    data: {
      items: transformedJobs,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Get a single job by ID
 */
export async function getJobAction(jobId: string): Promise<ActionResult<Job>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'jobs', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: jobs:read required' };
  }

  const { data: job, error } = await (supabase.from('jobs') as any)
    .select(`
      *,
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name),
      submissions(id, status)
    `)
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (error || !job) {
    return { success: false, error: 'Job not found' };
  }

  const activeStatuses = ['sourced', 'screening', 'submission_ready', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage'];

  return {
    success: true,
    data: {
      id: job.id,
      title: job.title,
      description: job.description,
      jobType: job.job_type,
      location: job.location,
      isRemote: job.is_remote,
      hybridDays: job.hybrid_days,
      rateMin: job.rate_min ? (typeof job.rate_min === 'string' ? parseFloat(job.rate_min) : job.rate_min) : null,
      rateMax: job.rate_max ? (typeof job.rate_max === 'string' ? parseFloat(job.rate_max) : job.rate_max) : null,
      rateType: job.rate_type,
      currency: job.currency,
      status: job.status,
      urgency: job.urgency,
      positionsCount: job.positions_count,
      positionsFilled: job.positions_filled,
      requiredSkills: job.required_skills,
      niceToHaveSkills: job.nice_to_have_skills,
      minExperienceYears: job.min_experience_years,
      maxExperienceYears: job.max_experience_years,
      visaRequirements: job.visa_requirements,
      accountId: job.account_id,
      accountName: job.account?.name || null,
      dealId: job.deal_id,
      ownerId: job.owner_id,
      ownerName: job.owner?.full_name || null,
      recruiterIds: job.recruiter_ids,
      postedDate: job.posted_date,
      targetFillDate: job.target_fill_date,
      filledDate: job.filled_date,
      clientSubmissionInstructions: job.client_submission_instructions,
      clientInterviewProcess: job.client_interview_process,
      submissionCount: job.submissions?.length || 0,
      activeSubmissions: job.submissions?.filter((s: any) => activeStatuses.includes(s.status)).length || 0,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    },
  };
}

/**
 * Create a new job
 */
export async function createJobAction(
  input: z.infer<typeof createJobSchema>
): Promise<ActionResult<Job>> {
  const validation = createJobSchema.safeParse(input);
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

  const hasPermission = await checkPermission(supabase, profile.id, 'jobs', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: jobs:create required' };
  }

  const data = validation.data;

  const { data: newJob, error } = await adminSupabase
    .from('jobs')
    .insert({
      org_id: profile.org_id,
      title: data.title,
      description: data.description || null,
      job_type: data.jobType,
      location: data.location || null,
      is_remote: data.isRemote,
      hybrid_days: data.hybridDays || null,
      rate_min: data.rateMin || null,
      rate_max: data.rateMax || null,
      rate_type: data.rateType,
      currency: data.currency,
      status: 'draft',
      urgency: 'medium',
      positions_count: data.positionsCount,
      positions_filled: 0,
      required_skills: data.requiredSkills || null,
      nice_to_have_skills: data.niceToHaveSkills || null,
      min_experience_years: data.minExperienceYears || null,
      max_experience_years: data.maxExperienceYears || null,
      visa_requirements: data.visaRequirements || null,
      account_id: data.accountId || null,
      deal_id: data.dealId || null,
      owner_id: data.ownerId || profile.id,
      recruiter_ids: data.recruiterIds || null,
      target_fill_date: data.targetFillDate || null,
      client_submission_instructions: data.clientSubmissionInstructions || null,
      client_interview_process: data.clientInterviewProcess || null,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !newJob) {
    console.error('Create job error:', error);
    return { success: false, error: 'Failed to create job' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'INSERT',
    recordId: newJob.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'recruiting_create_job' },
  });

  revalidatePath('/employee/recruiting/jobs');

  return getJobAction(newJob.id);
}

/**
 * Update a job
 */
export async function updateJobAction(
  jobId: string,
  input: z.infer<typeof updateJobSchema>
): Promise<ActionResult<Job>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const validation = updateJobSchema.safeParse(input);
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

  const hasPermission = await checkPermission(supabase, profile.id, 'jobs', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: jobs:update required' };
  }

  const { data: existingJob, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingJob) {
    return { success: false, error: 'Job not found' };
  }

  const data = validation.data;
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.jobType !== undefined) updateData.job_type = data.jobType;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.isRemote !== undefined) updateData.is_remote = data.isRemote;
  if (data.hybridDays !== undefined) updateData.hybrid_days = data.hybridDays;
  if (data.rateMin !== undefined) updateData.rate_min = data.rateMin;
  if (data.rateMax !== undefined) updateData.rate_max = data.rateMax;
  if (data.rateType !== undefined) updateData.rate_type = data.rateType;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'open' && !existingJob.posted_date) {
      updateData.posted_date = new Date().toISOString();
    }
    if (data.status === 'filled') {
      updateData.filled_date = new Date().toISOString();
    }
  }
  if (data.urgency !== undefined) updateData.urgency = data.urgency;
  if (data.positionsCount !== undefined) updateData.positions_count = data.positionsCount;
  if (data.requiredSkills !== undefined) updateData.required_skills = data.requiredSkills;
  if (data.niceToHaveSkills !== undefined) updateData.nice_to_have_skills = data.niceToHaveSkills;
  if (data.minExperienceYears !== undefined) updateData.min_experience_years = data.minExperienceYears;
  if (data.maxExperienceYears !== undefined) updateData.max_experience_years = data.maxExperienceYears;
  if (data.visaRequirements !== undefined) updateData.visa_requirements = data.visaRequirements;
  if (data.ownerId !== undefined) updateData.owner_id = data.ownerId;
  if (data.recruiterIds !== undefined) updateData.recruiter_ids = data.recruiterIds;
  if (data.targetFillDate !== undefined) updateData.target_fill_date = data.targetFillDate;
  if (data.clientSubmissionInstructions !== undefined) updateData.client_submission_instructions = data.clientSubmissionInstructions;
  if (data.clientInterviewProcess !== undefined) updateData.client_interview_process = data.clientInterviewProcess;

  const { error: updateError } = await adminSupabase
    .from('jobs')
    .update(updateData)
    .eq('id', jobId);

  if (updateError) {
    console.error('Update job error:', updateError);
    return { success: false, error: 'Failed to update job' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'UPDATE',
    recordId: jobId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingJob,
    newValues: updateData,
    metadata: { source: 'recruiting_update_job' },
  });

  revalidatePath('/employee/recruiting/jobs');
  revalidatePath(`/employee/recruiting/jobs/${jobId}`);

  return getJobAction(jobId);
}

/**
 * Delete a job (soft delete)
 */
export async function deleteJobAction(jobId: string): Promise<ActionResult<{ deleted: boolean }>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'jobs', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: jobs:delete required' };
  }

  const { data: existingJob, error: fetchError } = await (supabase.from('jobs') as any)
    .select('title, submissions(id)')
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingJob) {
    return { success: false, error: 'Job not found' };
  }

  // Prevent deletion if there are active submissions
  if (existingJob.submissions && existingJob.submissions.length > 0) {
    return { success: false, error: 'Cannot delete job with active submissions' };
  }

  const { error: deleteError } = await adminSupabase
    .from('jobs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', jobId);

  if (deleteError) {
    console.error('Delete job error:', deleteError);
    return { success: false, error: 'Failed to delete job' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'DELETE',
    recordId: jobId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { title: existingJob.title },
    metadata: { source: 'recruiting_delete_job' },
  });

  revalidatePath('/employee/recruiting/jobs');

  return { success: true, data: { deleted: true } };
}

/**
 * Publish a job (change status from draft to open)
 */
export async function publishJobAction(jobId: string): Promise<ActionResult<Job>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('status, title')
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !job) {
    return { success: false, error: 'Job not found' };
  }

  if (job.status !== 'draft') {
    return { success: false, error: 'Can only publish draft jobs' };
  }

  const { error: updateError } = await adminSupabase
    .from('jobs')
    .update({
      status: 'open',
      posted_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (updateError) {
    console.error('Publish job error:', updateError);
    return { success: false, error: 'Failed to publish job' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'PUBLISH',
    recordId: jobId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: 'draft' },
    newValues: { status: 'open' },
    metadata: { source: 'recruiting_publish_job', jobTitle: job.title },
  });

  revalidatePath('/employee/recruiting/jobs');
  revalidatePath(`/employee/recruiting/jobs/${jobId}`);

  return getJobAction(jobId);
}

/**
 * Put a job on hold
 */
export async function holdJobAction(jobId: string, reason?: string): Promise<ActionResult<Job>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('status')
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !job) {
    return { success: false, error: 'Job not found' };
  }

  if (!['open', 'urgent'].includes(job.status)) {
    return { success: false, error: 'Can only put open or urgent jobs on hold' };
  }

  const { error: updateError } = await adminSupabase
    .from('jobs')
    .update({
      status: 'on_hold',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (updateError) {
    console.error('Hold job error:', updateError);
    return { success: false, error: 'Failed to put job on hold' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'HOLD',
    recordId: jobId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: job.status },
    newValues: { status: 'on_hold' },
    metadata: { source: 'recruiting_hold_job', reason },
  });

  revalidatePath('/employee/recruiting/jobs');
  revalidatePath(`/employee/recruiting/jobs/${jobId}`);

  return getJobAction(jobId);
}

/**
 * Reopen a job on hold
 */
export async function reopenJobAction(jobId: string): Promise<ActionResult<Job>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('status')
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !job) {
    return { success: false, error: 'Job not found' };
  }

  if (job.status !== 'on_hold') {
    return { success: false, error: 'Can only reopen jobs that are on hold' };
  }

  const { error: updateError } = await adminSupabase
    .from('jobs')
    .update({
      status: 'open',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (updateError) {
    console.error('Reopen job error:', updateError);
    return { success: false, error: 'Failed to reopen job' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'REOPEN',
    recordId: jobId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: 'on_hold' },
    newValues: { status: 'open' },
    metadata: { source: 'recruiting_reopen_job' },
  });

  revalidatePath('/employee/recruiting/jobs');
  revalidatePath(`/employee/recruiting/jobs/${jobId}`);

  return getJobAction(jobId);
}

/**
 * Mark job as urgent
 */
export async function markJobUrgentAction(jobId: string): Promise<ActionResult<Job>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('status')
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !job) {
    return { success: false, error: 'Job not found' };
  }

  if (job.status !== 'open') {
    return { success: false, error: 'Can only mark open jobs as urgent' };
  }

  const { error: updateError } = await adminSupabase
    .from('jobs')
    .update({
      status: 'urgent',
      urgency: 'critical',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (updateError) {
    console.error('Mark urgent error:', updateError);
    return { success: false, error: 'Failed to mark job as urgent' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'MARK_URGENT',
    recordId: jobId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { status: 'open' },
    newValues: { status: 'urgent' },
    metadata: { source: 'recruiting_mark_urgent' },
  });

  revalidatePath('/employee/recruiting/jobs');
  revalidatePath(`/employee/recruiting/jobs/${jobId}`);

  return getJobAction(jobId);
}

/**
 * Clone a job
 */
export async function cloneJobAction(jobId: string): Promise<ActionResult<Job>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'jobs', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: jobs:create required' };
  }

  const { data: sourceJob, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !sourceJob) {
    return { success: false, error: 'Source job not found' };
  }

  const { data: newJob, error: createError } = await adminSupabase
    .from('jobs')
    .insert({
      org_id: profile.org_id,
      title: `${sourceJob.title} (Copy)`,
      description: sourceJob.description,
      job_type: sourceJob.job_type,
      location: sourceJob.location,
      is_remote: sourceJob.is_remote,
      hybrid_days: sourceJob.hybrid_days,
      rate_min: sourceJob.rate_min,
      rate_max: sourceJob.rate_max,
      rate_type: sourceJob.rate_type,
      currency: sourceJob.currency,
      status: 'draft',
      urgency: 'medium',
      positions_count: sourceJob.positions_count,
      positions_filled: 0,
      required_skills: sourceJob.required_skills,
      nice_to_have_skills: sourceJob.nice_to_have_skills,
      min_experience_years: sourceJob.min_experience_years,
      max_experience_years: sourceJob.max_experience_years,
      visa_requirements: sourceJob.visa_requirements,
      account_id: sourceJob.account_id,
      deal_id: sourceJob.deal_id,
      owner_id: profile.id,
      recruiter_ids: sourceJob.recruiter_ids,
      client_submission_instructions: sourceJob.client_submission_instructions,
      client_interview_process: sourceJob.client_interview_process,
      created_by: profile.id,
    })
    .select()
    .single();

  if (createError || !newJob) {
    console.error('Clone job error:', createError);
    return { success: false, error: 'Failed to clone job' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'CLONE',
    recordId: newJob.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: { sourceJobId: jobId, newJobId: newJob.id },
    metadata: { source: 'recruiting_clone_job', sourceJobTitle: sourceJob.title },
  });

  revalidatePath('/employee/recruiting/jobs');

  return getJobAction(newJob.id);
}

/**
 * Get job metrics/stats
 */
export async function getJobMetricsAction(): Promise<ActionResult<JobMetrics>> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Get all jobs
  const { data: jobs, error } = await (supabase.from('jobs') as any)
    .select('id, status, filled_date, created_at, submissions(id)')
    .is('deleted_at', null);

  if (error) {
    console.error('Get job metrics error:', error);
    return { success: false, error: 'Failed to fetch job metrics' };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalJobs = jobs?.length || 0;
  const openJobs = jobs?.filter((j: any) => j.status === 'open').length || 0;
  const urgentJobs = jobs?.filter((j: any) => j.status === 'urgent').length || 0;
  const filledThisMonth = jobs?.filter((j: any) =>
    j.status === 'filled' && j.filled_date && new Date(j.filled_date) >= startOfMonth
  ).length || 0;

  // Calculate avg time to fill (for filled jobs)
  const filledJobs = jobs?.filter((j: any) => j.status === 'filled' && j.filled_date) || [];
  let totalDays = 0;
  filledJobs.forEach((j: any) => {
    const created = new Date(j.created_at);
    const filled = new Date(j.filled_date);
    totalDays += Math.ceil((filled.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  });
  const avgTimeToFill = filledJobs.length > 0 ? Math.round(totalDays / filledJobs.length) : 0;

  // Calculate avg submissions per job
  let totalSubmissions = 0;
  jobs?.forEach((j: any) => {
    totalSubmissions += j.submissions?.length || 0;
  });
  const avgSubmissionsPerJob = totalJobs > 0 ? Math.round((totalSubmissions / totalJobs) * 10) / 10 : 0;

  return {
    success: true,
    data: {
      totalJobs,
      openJobs,
      urgentJobs,
      filledThisMonth,
      avgTimeToFill,
      avgSubmissionsPerJob,
    },
  };
}

/**
 * Get jobs by account
 */
export async function getJobsByAccountAction(accountId: string): Promise<ActionResult<Job[]>> {
  if (!accountId || !z.string().uuid().safeParse(accountId).success) {
    return { success: false, error: 'Invalid account ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: jobs, error } = await (supabase.from('jobs') as any)
    .select(`
      *,
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name),
      submissions(id, status)
    `)
    .eq('account_id', accountId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get jobs by account error:', error);
    return { success: false, error: 'Failed to fetch jobs' };
  }

  const activeStatuses = ['sourced', 'screening', 'submission_ready', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage'];

  const transformedJobs: Job[] = (jobs || []).map((job: any) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    jobType: job.job_type,
    location: job.location,
    isRemote: job.is_remote,
    hybridDays: job.hybrid_days,
    rateMin: job.rate_min ? (typeof job.rate_min === 'string' ? parseFloat(job.rate_min) : job.rate_min) : null,
    rateMax: job.rate_max ? (typeof job.rate_max === 'string' ? parseFloat(job.rate_max) : job.rate_max) : null,
    rateType: job.rate_type,
    currency: job.currency,
    status: job.status,
    urgency: job.urgency,
    positionsCount: job.positions_count,
    positionsFilled: job.positions_filled,
    requiredSkills: job.required_skills,
    niceToHaveSkills: job.nice_to_have_skills,
    minExperienceYears: job.min_experience_years,
    maxExperienceYears: job.max_experience_years,
    visaRequirements: job.visa_requirements,
    accountId: job.account_id,
    accountName: job.account?.name || null,
    dealId: job.deal_id,
    ownerId: job.owner_id,
    ownerName: job.owner?.full_name || null,
    recruiterIds: job.recruiter_ids,
    postedDate: job.posted_date,
    targetFillDate: job.target_fill_date,
    filledDate: job.filled_date,
    clientSubmissionInstructions: job.client_submission_instructions,
    clientInterviewProcess: job.client_interview_process,
    submissionCount: job.submissions?.length || 0,
    activeSubmissions: job.submissions?.filter((s: any) => activeStatuses.includes(s.status)).length || 0,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  }));

  return { success: true, data: transformedJobs };
}

/**
 * Assign recruiters to a job
 */
export async function assignRecruitersAction(
  jobId: string,
  recruiterIds: string[]
): Promise<ActionResult<Job>> {
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return { success: false, error: 'Invalid job ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'jobs', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: jobs:update required' };
  }

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('recruiter_ids')
    .eq('id', jobId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !job) {
    return { success: false, error: 'Job not found' };
  }

  const { error: updateError } = await adminSupabase
    .from('jobs')
    .update({
      recruiter_ids: recruiterIds,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (updateError) {
    console.error('Assign recruiters error:', updateError);
    return { success: false, error: 'Failed to assign recruiters' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'jobs',
    action: 'ASSIGN_RECRUITERS',
    recordId: jobId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { recruiter_ids: job.recruiter_ids },
    newValues: { recruiter_ids: recruiterIds },
    metadata: { source: 'recruiting_assign_recruiters' },
  });

  revalidatePath('/employee/recruiting/jobs');
  revalidatePath(`/employee/recruiting/jobs/${jobId}`);

  return getJobAction(jobId);
}
