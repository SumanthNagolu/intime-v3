'use server';

/**
 * Client Portal Server Actions
 * Handles client-facing access to jobs, submissions, interviews, and placements
 * These actions are for authenticated external clients to view their data
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { accounts, pointOfContacts, activityLog } from '@/lib/db/schema/crm';
import { jobs, submissions, interviews, placements } from '@/lib/db/schema/ats';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, or, ilike, desc, asc, sql, isNull, inArray } from 'drizzle-orm';

// =====================================================
// Types
// =====================================================

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  tier: string | null;
  accountManagerId: string | null;
  accountManagerName: string | null;
  website: string | null;
  headquartersLocation: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
}

export interface ClientJob {
  id: string;
  title: string;
  description: string | null;
  jobType: string;
  status: string;
  location: string | null;
  isRemote: boolean | null;
  rateMin: number | null;
  rateMax: number | null;
  rateType: string | null;
  requiredSkills: string[] | null;
  positionsCount: number;
  positionsFilled: number;
  submissionCount: number;
  priority: string | null;
  createdAt: string;
  targetStartDate: string | null;
}

export interface ClientSubmission {
  id: string;
  jobId: string;
  jobTitle: string | null;
  candidateFirstName: string | null;
  candidateLastInitial: string | null;
  candidateTitle: string | null;
  status: string;
  aiMatchScore: number | null;
  recruiterMatchScore: number | null;
  submittedRate: number | null;
  submittedAt: string | null;
  interviewCount: number;
  yearsExperience: number | null;
  skills: string[] | null;
}

export interface ClientInterview {
  id: string;
  submissionId: string;
  candidateFirstName: string | null;
  jobTitle: string | null;
  roundNumber: number;
  interviewType: string;
  scheduledAt: string | null;
  duration: number | null;
  status: string;
  notes: string | null;
}

export interface ClientPlacement {
  id: string;
  jobTitle: string | null;
  candidateFirstName: string | null;
  candidateLastInitial: string | null;
  startDate: string;
  endDate: string | null;
  billRate: number;
  status: string;
  onboardingStatus: string | null;
}

export interface ClientDashboardMetrics {
  activeJobs: number;
  totalSubmissions: number;
  pendingReview: number;
  scheduledInterviews: number;
  activePlacements: number;
  positionsFilled: number;
}

export interface ClientActivity {
  id: string;
  activityType: string;
  subject: string | null;
  body: string | null;
  performedByName: string | null;
  activityDate: string;
}

// =====================================================
// Helper Functions
// =====================================================

async function getCurrentClientContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get user profile
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, user.id),
  });

  if (!profile) {
    return null;
  }

  // Check if user is a client POC
  const poc = await db.query.pointOfContacts.findFirst({
    where: and(
      eq(pointOfContacts.email, profile.email || ''),
      eq(pointOfContacts.isActive, true),
      isNull(pointOfContacts.deletedAt)
    ),
  });

  // POC not found - client portal access requires POC record
  if (!poc) {
    return null;
  }

  // Get account ID from POC
  const accountId = poc.accountId;

  if (!accountId) {
    return null;
  }

  return {
    userId: user.id,
    orgId: profile.orgId,
    accountId: accountId as string,
    isAdmin: poc.decisionAuthority === 'final_decision',
  };
}

async function logClientActivity(
  userId: string,
  orgId: string,
  accountId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, unknown>
) {
  const supabase = await createClient();

  await supabase.from('audit_logs').insert({
    user_id: userId,
    org_id: orgId,
    action: `client.${action}`,
    table_name: resourceType,
    record_id: resourceId,
    details: { ...details, accountId },
    severity: 'info',
    user_ip_address: null,
    user_agent: null,
  });
}

// =====================================================
// Account Actions
// =====================================================

export async function getMyAccountAction(): Promise<ActionResult<ClientAccount>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const account = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.id, context.accountId),
        isNull(accounts.deletedAt)
      ),
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Get account manager name
    let accountManagerName: string | null = null;
    if (account.accountManagerId) {
      const manager = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, account.accountManagerId),
        columns: { firstName: true, lastName: true },
      });
      accountManagerName = manager ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() : null;
    }

    return {
      success: true,
      data: {
        id: account.id,
        name: account.name,
        industry: account.industry,
        status: account.status,
        tier: account.tier,
        accountManagerId: account.accountManagerId,
        accountManagerName,
        website: account.website,
        headquartersLocation: account.headquartersLocation,
        contractStartDate: account.contractStartDate?.toISOString() || null,
        contractEndDate: account.contractEndDate?.toISOString() || null,
      },
    };
  } catch (error) {
    console.error('Get my account error:', error);
    return { success: false, error: 'Failed to get account' };
  }
}

export async function getAccountContactsAction(): Promise<ActionResult<{ id: string; name: string; title: string | null; email: string; isPrimary: boolean }[]>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const contacts = await db.query.pointOfContacts.findMany({
      where: and(
        eq(pointOfContacts.accountId, context.accountId),
        eq(pointOfContacts.isActive, true),
        isNull(pointOfContacts.deletedAt)
      ),
      orderBy: [desc(pointOfContacts.isPrimary), asc(pointOfContacts.firstName)],
    });

    return {
      success: true,
      data: contacts.map(c => ({
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
        title: c.title,
        email: c.email,
        isPrimary: c.isPrimary || false,
      })),
    };
  } catch (error) {
    console.error('Get account contacts error:', error);
    return { success: false, error: 'Failed to get contacts' };
  }
}

// =====================================================
// Jobs Actions
// =====================================================

const listClientJobsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
  status: z.enum(['open', 'urgent', 'on_hold', 'filled', 'cancelled']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'status', 'positionsCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listClientJobsAction(
  input: z.infer<typeof listClientJobsSchema>
): Promise<PaginatedResult<ClientJob>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const validated = listClientJobsSchema.parse(input);
    const { page, pageSize, status, search, sortBy, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [
      eq(jobs.accountId, context.accountId),
      isNull(jobs.deletedAt),
    ];

    if (status) {
      conditions.push(eq(jobs.status, status));
    }

    if (search) {
      conditions.push(
        or(
          ilike(jobs.title, `%${search}%`),
          ilike(jobs.description, `%${search}%`)
        )!
      );
    }

    // Build query
    let query = db
      .select()
      .from(jobs)
      .where(and(...conditions));

    // Apply sorting
    const orderFn = sortOrder === 'asc' ? asc : desc;
    switch (sortBy) {
      case 'title':
        query = query.orderBy(orderFn(jobs.title)) as typeof query;
        break;
      case 'status':
        query = query.orderBy(orderFn(jobs.status)) as typeof query;
        break;
      case 'positionsCount':
        query = query.orderBy(orderFn(jobs.positionsCount)) as typeof query;
        break;
      case 'createdAt':
      default:
        query = query.orderBy(orderFn(jobs.createdAt)) as typeof query;
        break;
    }

    const jobResults = await query.limit(pageSize).offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Get submission counts
    const jobData: ClientJob[] = await Promise.all(
      jobResults.map(async (job) => {
        const submissionCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(submissions)
          .where(eq(submissions.jobId, job.id));

        return {
          id: job.id,
          title: job.title,
          description: job.description,
          jobType: job.jobType ?? 'full_time',
          status: job.status,
          location: job.location,
          isRemote: job.isRemote,
          rateMin: job.rateMin ? parseFloat(job.rateMin.toString()) : null,
          rateMax: job.rateMax ? parseFloat(job.rateMax.toString()) : null,
          rateType: job.rateType,
          requiredSkills: job.requiredSkills,
          positionsCount: job.positionsCount ?? 1,
          positionsFilled: job.positionsFilled ?? 0,
          submissionCount: Number(submissionCount[0]?.count || 0),
          priority: job.priority,
          createdAt: job.createdAt.toISOString(),
          targetStartDate: job.targetStartDate?.toISOString() ?? null,
        };
      })
    );

    await logClientActivity(
      context.userId,
      context.orgId,
      context.accountId,
      'jobs.viewed',
      'jobs',
      null,
      { page, status, search }
    );

    return {
      success: true,
      data: jobData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('List client jobs error:', error);
    return { success: false, error: 'Failed to list jobs' };
  }
}

export async function getClientJobAction(
  jobId: string
): Promise<ActionResult<ClientJob & { submissions: ClientSubmission[] }>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const job = await db.query.jobs.findFirst({
      where: and(
        eq(jobs.id, jobId),
        eq(jobs.accountId, context.accountId),
        isNull(jobs.deletedAt)
      ),
    });

    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    // Get submissions for this job (client view - limited candidate info)
    const jobSubmissions = await db
      .select({
        id: submissions.id,
        jobId: submissions.jobId,
        candidateId: submissions.candidateId,
        status: submissions.status,
        aiMatchScore: submissions.aiMatchScore,
        recruiterMatchScore: submissions.recruiterMatchScore,
        submittedRate: submissions.submittedRate,
        submittedAt: submissions.submittedToClientAt,
        candidateFirstName: userProfiles.firstName,
        candidateLastName: userProfiles.lastName,
        candidateTitle: userProfiles.title,
      })
      .from(submissions)
      .leftJoin(userProfiles, eq(submissions.candidateId, userProfiles.id))
      .where(and(
        eq(submissions.jobId, jobId),
        // Only show submissions that have been submitted to client
        sql`${submissions.status} not in ('sourced', 'screening', 'submission_ready')`
      ))
      .orderBy(desc(submissions.submittedToClientAt));

    // Get interview counts
    const submissionData: ClientSubmission[] = await Promise.all(
      jobSubmissions.map(async (sub) => {
        const interviewCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(interviews)
          .where(eq(interviews.submissionId, sub.id));

        return {
          id: sub.id,
          jobId: sub.jobId,
          jobTitle: job.title,
          candidateFirstName: sub.candidateFirstName,
          candidateLastInitial: sub.candidateLastName?.charAt(0) ?? null,
          candidateTitle: sub.candidateTitle,
          status: sub.status,
          aiMatchScore: sub.aiMatchScore,
          recruiterMatchScore: sub.recruiterMatchScore,
          submittedRate: sub.submittedRate ? parseFloat(sub.submittedRate.toString()) : null,
          submittedAt: sub.submittedAt?.toISOString() ?? null,
          interviewCount: Number(interviewCount[0]?.count || 0),
          yearsExperience: null, // Privacy - don't expose full details
          skills: null, // Privacy - don't expose full details
        };
      })
    );

    await logClientActivity(
      context.userId,
      context.orgId,
      context.accountId,
      'job.viewed',
      'jobs',
      jobId,
      { title: job.title }
    );

    return {
      success: true,
      data: {
        id: job.id,
        title: job.title,
        description: job.description,
        jobType: job.jobType ?? 'full_time',
        status: job.status,
        location: job.location,
        isRemote: job.isRemote,
        rateMin: job.rateMin ? parseFloat(job.rateMin.toString()) : null,
        rateMax: job.rateMax ? parseFloat(job.rateMax.toString()) : null,
        rateType: job.rateType,
        requiredSkills: job.requiredSkills,
        positionsCount: job.positionsCount ?? 1,
        positionsFilled: job.positionsFilled ?? 0,
        submissionCount: submissionData.length,
        priority: job.priority,
        createdAt: job.createdAt.toISOString(),
        targetStartDate: job.targetStartDate?.toISOString() ?? null,
        submissions: submissionData,
      },
    };
  } catch (error) {
    console.error('Get client job error:', error);
    return { success: false, error: 'Failed to get job' };
  }
}

// =====================================================
// Submissions Actions
// =====================================================

const listClientSubmissionsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
  jobId: z.string().uuid().optional(),
  status: z.enum([
    'submitted_to_client', 'client_review', 'client_interview',
    'offer_stage', 'placed', 'rejected'
  ]).optional(),
  sortBy: z.enum(['submittedAt', 'status', 'matchScore']).default('submittedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listClientSubmissionsAction(
  input: z.infer<typeof listClientSubmissionsSchema>
): Promise<PaginatedResult<ClientSubmission>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const validated = listClientSubmissionsSchema.parse(input);
    const { page, pageSize, jobId, status, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Get jobs for this account
    const accountJobs = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.accountId, context.accountId));

    const jobIds = accountJobs.map(j => j.id);

    if (jobIds.length === 0) {
      return { success: true, data: [], total: 0, page, pageSize };
    }

    // Build conditions
    const conditions = [
      inArray(submissions.jobId, jobIds),
      // Only show submissions visible to client
      sql`${submissions.status} not in ('sourced', 'screening', 'submission_ready')`,
    ];

    if (jobId) {
      conditions.push(eq(submissions.jobId, jobId));
    }

    if (status) {
      conditions.push(eq(submissions.status, status));
    }

    // Build query
    const submissionResults = await db
      .select({
        id: submissions.id,
        jobId: submissions.jobId,
        candidateId: submissions.candidateId,
        status: submissions.status,
        aiMatchScore: submissions.aiMatchScore,
        recruiterMatchScore: submissions.recruiterMatchScore,
        submittedRate: submissions.submittedRate,
        submittedAt: submissions.submittedToClientAt,
        candidateFirstName: userProfiles.firstName,
        candidateLastName: userProfiles.lastName,
        candidateTitle: userProfiles.title,
        jobTitle: jobs.title,
      })
      .from(submissions)
      .leftJoin(userProfiles, eq(submissions.candidateId, userProfiles.id))
      .leftJoin(jobs, eq(submissions.jobId, jobs.id))
      .where(and(...conditions))
      .orderBy(sortOrder === 'asc' ? asc(submissions.submittedToClientAt) : desc(submissions.submittedToClientAt))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Get interview counts
    const submissionData: ClientSubmission[] = await Promise.all(
      submissionResults.map(async (sub) => {
        const interviewCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(interviews)
          .where(eq(interviews.submissionId, sub.id));

        return {
          id: sub.id,
          jobId: sub.jobId,
          jobTitle: sub.jobTitle,
          candidateFirstName: sub.candidateFirstName,
          candidateLastInitial: sub.candidateLastName?.charAt(0) ?? null,
          candidateTitle: sub.candidateTitle,
          status: sub.status,
          aiMatchScore: sub.aiMatchScore,
          recruiterMatchScore: sub.recruiterMatchScore,
          submittedRate: sub.submittedRate ? parseFloat(sub.submittedRate.toString()) : null,
          submittedAt: sub.submittedAt?.toISOString() ?? null,
          interviewCount: Number(interviewCount[0]?.count || 0),
          yearsExperience: null,
          skills: null,
        };
      })
    );

    return {
      success: true,
      data: submissionData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('List client submissions error:', error);
    return { success: false, error: 'Failed to list submissions' };
  }
}

export async function getClientSubmissionAction(
  submissionId: string
): Promise<ActionResult<ClientSubmission & { interviews: ClientInterview[] }>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    // Get submission and verify it belongs to a job in client's account
    const submission = await db
      .select({
        id: submissions.id,
        jobId: submissions.jobId,
        candidateId: submissions.candidateId,
        status: submissions.status,
        aiMatchScore: submissions.aiMatchScore,
        recruiterMatchScore: submissions.recruiterMatchScore,
        submittedRate: submissions.submittedRate,
        submittedAt: submissions.submittedToClientAt,
        candidateFirstName: userProfiles.firstName,
        candidateLastName: userProfiles.lastName,
        candidateTitle: userProfiles.title,
        jobTitle: jobs.title,
        jobAccountId: jobs.accountId,
      })
      .from(submissions)
      .leftJoin(userProfiles, eq(submissions.candidateId, userProfiles.id))
      .leftJoin(jobs, eq(submissions.jobId, jobs.id))
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (!submission[0]) {
      return { success: false, error: 'Submission not found' };
    }

    const sub = submission[0];

    // Verify this submission belongs to client's account
    if (sub.jobAccountId !== context.accountId) {
      return { success: false, error: 'Access denied' };
    }

    // Get interviews for this submission
    const submissionInterviews = await db.query.interviews.findMany({
      where: eq(interviews.submissionId, submissionId),
      orderBy: [asc(interviews.roundNumber)],
    });

    const interviewData: ClientInterview[] = submissionInterviews.map(interview => ({
      id: interview.id,
      submissionId: interview.submissionId,
      candidateFirstName: sub.candidateFirstName,
      jobTitle: sub.jobTitle,
      roundNumber: interview.roundNumber,
      interviewType: interview.interviewType ?? 'technical',
      scheduledAt: interview.scheduledAt?.toISOString() ?? null,
      duration: interview.durationMinutes ?? null,
      status: interview.status,
      notes: interview.feedback ?? null,
    }));

    await logClientActivity(
      context.userId,
      context.orgId,
      context.accountId,
      'submission.viewed',
      'submissions',
      submissionId,
      {}
    );

    return {
      success: true,
      data: {
        id: sub.id,
        jobId: sub.jobId,
        jobTitle: sub.jobTitle,
        candidateFirstName: sub.candidateFirstName,
        candidateLastInitial: sub.candidateLastName?.charAt(0) ?? null,
        candidateTitle: sub.candidateTitle,
        status: sub.status,
        aiMatchScore: sub.aiMatchScore,
        recruiterMatchScore: sub.recruiterMatchScore,
        submittedRate: sub.submittedRate ? parseFloat(sub.submittedRate.toString()) : null,
        submittedAt: sub.submittedAt?.toISOString() ?? null,
        interviewCount: interviewData.length,
        yearsExperience: null,
        skills: null,
        interviews: interviewData,
      },
    };
  } catch (error) {
    console.error('Get client submission error:', error);
    return { success: false, error: 'Failed to get submission' };
  }
}

// =====================================================
// Client Feedback Actions
// =====================================================

const submitClientFeedbackSchema = z.object({
  submissionId: z.string().uuid(),
  decision: z.enum(['proceed', 'reject', 'hold']),
  feedback: z.string().optional(),
  interviewRequested: z.boolean().optional(),
});

export async function submitClientFeedbackAction(
  input: z.infer<typeof submitClientFeedbackSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const validated = submitClientFeedbackSchema.parse(input);

    // Verify submission belongs to client
    const submission = await db
      .select({
        id: submissions.id,
        jobId: submissions.jobId,
        status: submissions.status,
        accountId: jobs.accountId,
      })
      .from(submissions)
      .leftJoin(jobs, eq(submissions.jobId, jobs.id))
      .where(eq(submissions.id, validated.submissionId))
      .limit(1);

    if (!submission[0] || submission[0].accountId !== context.accountId) {
      return { success: false, error: 'Submission not found' };
    }

    // Update submission status based on decision
    let newStatus = submission[0].status;
    if (validated.decision === 'proceed') {
      newStatus = validated.interviewRequested ? 'client_interview' : 'offer_stage';
    } else if (validated.decision === 'reject') {
      newStatus = 'rejected';
    }
    // 'hold' keeps current status

    await db.update(submissions)
      .set({
        status: newStatus,
        clientDecisionNotes: validated.feedback ?? null,
        clientDecisionAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, validated.submissionId));

    // Log activity
    await db.insert(activityLog).values({
      orgId: context.orgId,
      entityType: 'submission',
      entityId: validated.submissionId,
      activityType: 'client_feedback',
      subject: `Client ${validated.decision}: ${submission[0].id}`,
      body: validated.feedback,
      performedBy: context.userId,
      direction: 'inbound',
    });

    await logClientActivity(
      context.userId,
      context.orgId,
      context.accountId,
      'submission.feedback',
      'submissions',
      validated.submissionId,
      { decision: validated.decision }
    );

    return { success: true, data: { id: validated.submissionId } };
  } catch (error) {
    console.error('Submit client feedback error:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}

// =====================================================
// Placements Actions
// =====================================================

export async function listClientPlacementsAction(): Promise<ActionResult<ClientPlacement[]>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    // Get jobs for this account
    const accountJobs = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.accountId, context.accountId));

    const jobIds = accountJobs.map(j => j.id);

    if (jobIds.length === 0) {
      return { success: true, data: [] };
    }

    // Get placements through submissions -> jobs
    const placementResults = await db
      .select({
        id: placements.id,
        submissionId: placements.submissionId,
        startDate: placements.startDate,
        endDate: placements.endDate,
        billRate: placements.billRate,
        status: placements.status,
        onboardingStatus: placements.onboardingStatus,
        candidateId: submissions.candidateId,
        jobId: submissions.jobId,
        candidateFirstName: userProfiles.firstName,
        candidateLastName: userProfiles.lastName,
        jobTitle: jobs.title,
      })
      .from(placements)
      .innerJoin(submissions, eq(placements.submissionId, submissions.id))
      .innerJoin(jobs, eq(submissions.jobId, jobs.id))
      .leftJoin(userProfiles, eq(submissions.candidateId, userProfiles.id))
      .where(inArray(submissions.jobId, jobIds))
      .orderBy(desc(placements.startDate));

    const placementData: ClientPlacement[] = placementResults.map(p => ({
      id: p.id,
      jobTitle: p.jobTitle,
      candidateFirstName: p.candidateFirstName,
      candidateLastInitial: p.candidateLastName?.charAt(0) ?? null,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate?.toISOString() ?? null,
      billRate: parseFloat(p.billRate.toString()),
      status: p.status,
      onboardingStatus: p.onboardingStatus ?? null,
    }));

    return { success: true, data: placementData };
  } catch (error) {
    console.error('List client placements error:', error);
    return { success: false, error: 'Failed to list placements' };
  }
}

// =====================================================
// Dashboard Actions
// =====================================================

export async function getClientDashboardMetricsAction(): Promise<ActionResult<ClientDashboardMetrics>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    // Get account jobs
    const accountJobs = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.accountId, context.accountId));

    const jobIds = accountJobs.map(j => j.id);

    // Get job stats
    const jobStats = await db
      .select({
        activeJobs: sql<number>`count(*) filter (where status in ('open', 'urgent'))`,
        positionsFilled: sql<number>`coalesce(sum(positions_filled), 0)`,
      })
      .from(jobs)
      .where(eq(jobs.accountId, context.accountId));

    // Get submission stats
    let submissionStats = { totalSubmissions: 0, pendingReview: 0 };
    if (jobIds.length > 0) {
      const subStats = await db
        .select({
          totalSubmissions: sql<number>`count(*)`,
          pendingReview: sql<number>`count(*) filter (where status in ('submitted_to_client', 'client_review'))`,
        })
        .from(submissions)
        .where(and(
          inArray(submissions.jobId, jobIds),
          sql`${submissions.status} not in ('sourced', 'screening', 'submission_ready')`
        ));
      submissionStats = {
        totalSubmissions: Number(subStats[0]?.totalSubmissions || 0),
        pendingReview: Number(subStats[0]?.pendingReview || 0),
      };
    }

    // Get interview stats
    let scheduledInterviews = 0;
    if (jobIds.length > 0) {
      const submissionIds = await db
        .select({ id: submissions.id })
        .from(submissions)
        .where(inArray(submissions.jobId, jobIds));

      const subIds = submissionIds.map(s => s.id);
      if (subIds.length > 0) {
        const interviewStats = await db
          .select({
            scheduled: sql<number>`count(*) filter (where status = 'scheduled' and scheduled_at >= now())`,
          })
          .from(interviews)
          .where(inArray(interviews.submissionId, subIds));
        scheduledInterviews = Number(interviewStats[0]?.scheduled || 0);
      }
    }

    // Get active placements
    let activePlacements = 0;
    if (jobIds.length > 0) {
      const submissionIds = await db
        .select({ id: submissions.id })
        .from(submissions)
        .where(inArray(submissions.jobId, jobIds));

      const subIds = submissionIds.map(s => s.id);
      if (subIds.length > 0) {
        const placementStats = await db
          .select({
            active: sql<number>`count(*) filter (where status = 'active')`,
          })
          .from(placements)
          .where(inArray(placements.submissionId, subIds));
        activePlacements = Number(placementStats[0]?.active || 0);
      }
    }

    await logClientActivity(
      context.userId,
      context.orgId,
      context.accountId,
      'dashboard.viewed',
      'dashboard',
      null,
      {}
    );

    return {
      success: true,
      data: {
        activeJobs: Number(jobStats[0]?.activeJobs || 0),
        totalSubmissions: submissionStats.totalSubmissions,
        pendingReview: submissionStats.pendingReview,
        scheduledInterviews,
        activePlacements,
        positionsFilled: Number(jobStats[0]?.positionsFilled || 0),
      },
    };
  } catch (error) {
    console.error('Get client dashboard metrics error:', error);
    return { success: false, error: 'Failed to get dashboard metrics' };
  }
}

export async function getClientRecentActivityAction(
  limit: number = 20
): Promise<ActionResult<ClientActivity[]>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const activities = await db
      .select({
        id: activityLog.id,
        activityType: activityLog.activityType,
        subject: activityLog.subject,
        body: activityLog.body,
        performedBy: activityLog.performedBy,
        activityDate: activityLog.activityDate,
        performerFirstName: userProfiles.firstName,
        performerLastName: userProfiles.lastName,
      })
      .from(activityLog)
      .leftJoin(userProfiles, eq(activityLog.performedBy, userProfiles.id))
      .where(and(
        eq(activityLog.entityType, 'account'),
        eq(activityLog.entityId, context.accountId)
      ))
      .orderBy(desc(activityLog.activityDate))
      .limit(limit);

    return {
      success: true,
      data: activities.map(a => ({
        id: a.id,
        activityType: a.activityType,
        subject: a.subject,
        body: a.body,
        performedByName: a.performerFirstName
          ? `${a.performerFirstName} ${a.performerLastName || ''}`.trim()
          : null,
        activityDate: a.activityDate.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Get client recent activity error:', error);
    return { success: false, error: 'Failed to get activity' };
  }
}

// =====================================================
// Interview Scheduling (Client Side)
// =====================================================

const requestInterviewSchema = z.object({
  submissionId: z.string().uuid(),
  preferredDates: z.array(z.string()).min(1),
  interviewType: z.enum(['phone_screen', 'technical', 'behavioral', 'panel', 'onsite', 'final']),
  duration: z.number().min(15).max(480).default(60),
  notes: z.string().optional(),
});

export async function requestInterviewAction(
  input: z.infer<typeof requestInterviewSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const validated = requestInterviewSchema.parse(input);

    // Verify submission belongs to client
    const submission = await db
      .select({
        id: submissions.id,
        jobId: submissions.jobId,
        accountId: jobs.accountId,
      })
      .from(submissions)
      .leftJoin(jobs, eq(submissions.jobId, jobs.id))
      .where(eq(submissions.id, validated.submissionId))
      .limit(1);

    if (!submission[0] || submission[0].accountId !== context.accountId) {
      return { success: false, error: 'Submission not found' };
    }

    // Get current round number
    const existingInterviews = await db
      .select({ roundNumber: interviews.roundNumber })
      .from(interviews)
      .where(eq(interviews.submissionId, validated.submissionId))
      .orderBy(desc(interviews.roundNumber))
      .limit(1);

    const nextRound = (existingInterviews[0]?.roundNumber || 0) + 1;

    // Get submission details for required fields
    const submissionDetails = await db.query.submissions.findFirst({
      where: eq(submissions.id, validated.submissionId),
      columns: { jobId: true, candidateId: true, orgId: true },
    });

    if (!submissionDetails) {
      return { success: false, error: 'Submission not found' };
    }

    // Create interview request (status: scheduled with first preferred date)
    const [interview] = await db.insert(interviews).values({
      orgId: submissionDetails.orgId,
      submissionId: validated.submissionId,
      jobId: submissionDetails.jobId,
      candidateId: submissionDetails.candidateId,
      roundNumber: nextRound,
      interviewType: validated.interviewType,
      scheduledAt: new Date(validated.preferredDates[0]),
      durationMinutes: validated.duration,
      status: 'scheduled',
      feedback: validated.notes ?? null,
    }).returning({ id: interviews.id });

    // Update submission status
    await db.update(submissions)
      .set({
        status: 'client_interview',
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, validated.submissionId));

    // Log activity
    await db.insert(activityLog).values({
      orgId: context.orgId,
      entityType: 'submission',
      entityId: validated.submissionId,
      activityType: 'interview_requested',
      subject: `Interview requested: Round ${nextRound}`,
      body: `Type: ${validated.interviewType}, Duration: ${validated.duration} min`,
      performedBy: context.userId,
      direction: 'inbound',
    });

    await logClientActivity(
      context.userId,
      context.orgId,
      context.accountId,
      'interview.requested',
      'interviews',
      interview.id,
      { submissionId: validated.submissionId, interviewType: validated.interviewType }
    );

    return { success: true, data: { id: interview.id } };
  } catch (error) {
    console.error('Request interview error:', error);
    return { success: false, error: 'Failed to request interview' };
  }
}

const submitInterviewFeedbackSchema = z.object({
  interviewId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  recommendation: z.enum(['strong_hire', 'hire', 'no_hire', 'strong_no_hire']),
  feedback: z.string().min(1),
});

export async function submitInterviewFeedbackAction(
  input: z.infer<typeof submitInterviewFeedbackSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentClientContext();
    if (!context) {
      return { success: false, error: 'Unauthorized - Client access required' };
    }

    const validated = submitInterviewFeedbackSchema.parse(input);

    // Verify interview belongs to client's account
    const interview = await db
      .select({
        id: interviews.id,
        submissionId: interviews.submissionId,
        accountId: jobs.accountId,
      })
      .from(interviews)
      .innerJoin(submissions, eq(interviews.submissionId, submissions.id))
      .innerJoin(jobs, eq(submissions.jobId, jobs.id))
      .where(eq(interviews.id, validated.interviewId))
      .limit(1);

    if (!interview[0] || interview[0].accountId !== context.accountId) {
      return { success: false, error: 'Interview not found' };
    }

    // Update interview with feedback
    await db.update(interviews)
      .set({
        status: 'completed',
        rating: validated.rating,
        recommendation: validated.recommendation,
        feedback: validated.feedback,
        updatedAt: new Date(),
      })
      .where(eq(interviews.id, validated.interviewId));

    // Log activity
    await db.insert(activityLog).values({
      orgId: context.orgId,
      entityType: 'interview',
      entityId: validated.interviewId,
      activityType: 'interview_feedback',
      subject: `Interview feedback: ${validated.recommendation}`,
      body: validated.feedback,
      performedBy: context.userId,
      direction: 'inbound',
    });

    await logClientActivity(
      context.userId,
      context.orgId,
      context.accountId,
      'interview.feedback',
      'interviews',
      validated.interviewId,
      { rating: validated.rating, recommendation: validated.recommendation }
    );

    return { success: true, data: { id: validated.interviewId } };
  } catch (error) {
    console.error('Submit interview feedback error:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}
