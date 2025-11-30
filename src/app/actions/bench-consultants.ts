'use server';

/**
 * Bench Consultants Server Actions
 * Handles bench consultant management, external jobs, and bench submissions
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import {
  benchMetadata,
  externalJobs,
  jobSources,
  benchSubmissions,
  BenchSubmissionStatus,
  ExternalJobStatus
} from '@/lib/db/schema/bench';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, or, ilike, desc, asc, sql, gte, lte, isNull, inArray } from 'drizzle-orm';

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

export interface BenchConsultant {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  skills: string[] | null;
  location: string | null;
  visaStatus: string | null;
  benchStartDate: string;
  daysOnBench: number | null;
  alert30DaySent: boolean | null;
  alert60DaySent: boolean | null;
  lastHotlistSentAt: string | null;
  hotlistSendCount: number | null;
  lastOutreachDate: string | null;
  hasActiveImmigrationCase: boolean | null;
  lastContactedAt: string | null;
  contactFrequencyDays: number | null;
  isResponsive: boolean | null;
  responsivenessScore: number | null;
  benchSalesRepId: string | null;
  benchSalesRepName: string | null;
  submissionCount: number;
  activeSubmissions: number;
}

export interface ExternalJob {
  id: string;
  sourceName: string;
  sourceJobId: string | null;
  sourceUrl: string | null;
  title: string;
  description: string | null;
  companyName: string | null;
  location: string | null;
  isRemote: boolean | null;
  rateMin: number | null;
  rateMax: number | null;
  rateType: string | null;
  requiredSkills: string[] | null;
  experienceYearsMin: number | null;
  visaRequirements: string[] | null;
  status: string;
  scrapedAt: string;
  lastVerifiedAt: string | null;
  expiresAt: string | null;
  matchCount: number | null;
  submissionCount: number | null;
  createdAt: string;
}

export interface JobSource {
  id: string;
  name: string;
  sourceType: string;
  url: string | null;
  scrapeFrequencyHours: number | null;
  lastScrapeAt: string | null;
  nextScrapeAt: string | null;
  requiresAuth: boolean | null;
  isActive: boolean | null;
  isHealthy: boolean | null;
  lastError: string | null;
  errorCount: number | null;
  totalJobsScraped: number | null;
  successfulScrapes: number | null;
  failedScrapes: number | null;
  createdAt: string;
}

export interface BenchSubmission {
  id: string;
  externalJobId: string;
  candidateId: string;
  candidateName: string | null;
  jobTitle: string | null;
  companyName: string | null;
  status: string;
  submittedBy: string | null;
  submittedByName: string | null;
  submittedAt: string | null;
  submissionNotes: string | null;
  vendorName: string | null;
  vendorContactName: string | null;
  vendorContactEmail: string | null;
  vendorSubmissionId: string | null;
  vendorFeedback: string | null;
  interviewDate: string | null;
  interviewFeedback: string | null;
  placedAt: string | null;
  placementStartDate: string | null;
  placementBillRate: number | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  benchRepId: string | null;
  benchRepName: string | null;
  createdAt: string;
}

// =====================================================
// Helper Functions
// =====================================================

async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get user profile with org_id
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, user.id),
  });

  return profile ? { userId: user.id, orgId: profile.orgId } : null;
}

async function checkPermission(
  userId: string,
  permission: string,
  resourceType?: string,
  resourceId?: string
): Promise<{ allowed: boolean; scope?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_user_permission', {
    p_user_id: userId,
    p_permission: permission,
    p_table_name: resourceType || null,
    p_record_id: resourceId || null,
  });

  if (error) {
    console.error('Permission check error:', error);
    return { allowed: false };
  }

  return { allowed: data?.allowed ?? false, scope: data?.scope };
}

async function logAuditEvent(
  userId: string,
  orgId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, unknown>,
  severity: 'info' | 'warning' | 'critical' = 'info'
) {
  const supabase = await createClient();

  await supabase.from('audit_logs').insert({
    user_id: userId,
    org_id: orgId,
    action,
    table_name: resourceType,
    record_id: resourceId,
    metadata: details,
    severity,
    user_ip_address: null,
    user_agent: null,
  });
}

// =====================================================
// Bench Consultant Actions
// =====================================================

const listBenchConsultantsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  benchRepId: z.string().uuid().optional(),
  minDaysOnBench: z.number().optional(),
  maxDaysOnBench: z.number().optional(),
  hasImmigrationCase: z.boolean().optional(),
  isResponsive: z.boolean().optional(),
  sortBy: z.enum(['daysOnBench', 'lastContactedAt', 'responsivenessScore', 'name']).default('daysOnBench'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listBenchConsultantsAction(
  input: z.infer<typeof listBenchConsultantsSchema>
): Promise<PaginatedResult<BenchConsultant>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = listBenchConsultantsSchema.parse(input);
    const { page, pageSize, search, benchRepId, minDaysOnBench, maxDaysOnBench, hasImmigrationCase, isResponsive, sortBy, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [eq(userProfiles.orgId, context.orgId)];

    if (search) {
      conditions.push(
        or(
          ilike(userProfiles.firstName, `%${search}%`),
          ilike(userProfiles.lastName, `%${search}%`),
          ilike(userProfiles.email, `%${search}%`)
        )!
      );
    }

    if (benchRepId) {
      conditions.push(eq(benchMetadata.benchSalesRepId, benchRepId));
    }

    if (minDaysOnBench !== undefined) {
      conditions.push(gte(benchMetadata.daysOnBench, minDaysOnBench));
    }

    if (maxDaysOnBench !== undefined) {
      conditions.push(lte(benchMetadata.daysOnBench, maxDaysOnBench));
    }

    if (hasImmigrationCase !== undefined) {
      conditions.push(eq(benchMetadata.hasActiveImmigrationCase, hasImmigrationCase));
    }

    if (isResponsive !== undefined) {
      conditions.push(eq(benchMetadata.isResponsive, isResponsive));
    }

    // Get bench consultants with user profiles
    const consultantsQuery = db
      .select({
        userId: benchMetadata.userId,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        email: userProfiles.email,
        phone: userProfiles.phone,
        title: userProfiles.title,
        location: userProfiles.location,
        benchStartDate: benchMetadata.benchStartDate,
        daysOnBench: benchMetadata.daysOnBench,
        alert30DaySent: benchMetadata.alert30DaySent,
        alert60DaySent: benchMetadata.alert60DaySent,
        lastHotlistSentAt: benchMetadata.lastHotlistSentAt,
        hotlistSendCount: benchMetadata.hotlistSendCount,
        lastOutreachDate: benchMetadata.lastOutreachDate,
        hasActiveImmigrationCase: benchMetadata.hasActiveImmigrationCase,
        lastContactedAt: benchMetadata.lastContactedAt,
        contactFrequencyDays: benchMetadata.contactFrequencyDays,
        isResponsive: benchMetadata.isResponsive,
        responsivenessScore: benchMetadata.responsivenessScore,
        benchSalesRepId: benchMetadata.benchSalesRepId,
      })
      .from(benchMetadata)
      .innerJoin(userProfiles, eq(benchMetadata.userId, userProfiles.id))
      .where(and(...conditions));

    // Apply sorting
    let orderedQuery;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    switch (sortBy) {
      case 'daysOnBench':
        orderedQuery = consultantsQuery.orderBy(orderFn(benchMetadata.daysOnBench));
        break;
      case 'lastContactedAt':
        orderedQuery = consultantsQuery.orderBy(orderFn(benchMetadata.lastContactedAt));
        break;
      case 'responsivenessScore':
        orderedQuery = consultantsQuery.orderBy(orderFn(benchMetadata.responsivenessScore));
        break;
      case 'name':
        orderedQuery = consultantsQuery.orderBy(orderFn(userProfiles.firstName));
        break;
      default:
        orderedQuery = consultantsQuery.orderBy(desc(benchMetadata.daysOnBench));
    }

    const consultants = await orderedQuery.limit(pageSize).offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(benchMetadata)
      .innerJoin(userProfiles, eq(benchMetadata.userId, userProfiles.id))
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Get bench rep names and submission counts
    const consultantData: BenchConsultant[] = await Promise.all(
      consultants.map(async (c) => {
        let benchRepName: string | null = null;
        if (c.benchSalesRepId) {
          const rep = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.id, c.benchSalesRepId),
            columns: { firstName: true, lastName: true },
          });
          benchRepName = rep ? `${rep.firstName || ''} ${rep.lastName || ''}`.trim() : null;
        }

        // Get submission counts
        const submissionCounts = await db
          .select({
            total: sql<number>`count(*)`,
            active: sql<number>`count(*) filter (where status not in ('placed', 'rejected'))`
          })
          .from(benchSubmissions)
          .where(eq(benchSubmissions.candidateId, c.userId));

        return {
          id: c.userId,
          userId: c.userId,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          title: c.title,
          skills: null, // Would need to join with skills table
          location: c.location,
          visaStatus: null, // Would need to add to schema
          benchStartDate: c.benchStartDate,
          daysOnBench: c.daysOnBench,
          alert30DaySent: c.alert30DaySent,
          alert60DaySent: c.alert60DaySent,
          lastHotlistSentAt: c.lastHotlistSentAt?.toISOString() || null,
          hotlistSendCount: c.hotlistSendCount,
          lastOutreachDate: c.lastOutreachDate?.toISOString() || null,
          hasActiveImmigrationCase: c.hasActiveImmigrationCase,
          lastContactedAt: c.lastContactedAt?.toISOString() || null,
          contactFrequencyDays: c.contactFrequencyDays,
          isResponsive: c.isResponsive,
          responsivenessScore: c.responsivenessScore,
          benchSalesRepId: c.benchSalesRepId,
          benchSalesRepName: benchRepName,
          submissionCount: Number(submissionCounts[0]?.total || 0),
          activeSubmissions: Number(submissionCounts[0]?.active || 0),
        };
      })
    );

    return {
      success: true,
      data: consultantData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('List bench consultants error:', error);
    return { success: false, error: 'Failed to list bench consultants' };
  }
}

export async function getBenchConsultantAction(
  userId: string
): Promise<ActionResult<BenchConsultant>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const consultant = await db
      .select({
        userId: benchMetadata.userId,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        email: userProfiles.email,
        phone: userProfiles.phone,
        title: userProfiles.title,
        location: userProfiles.location,
        benchStartDate: benchMetadata.benchStartDate,
        daysOnBench: benchMetadata.daysOnBench,
        alert30DaySent: benchMetadata.alert30DaySent,
        alert60DaySent: benchMetadata.alert60DaySent,
        lastHotlistSentAt: benchMetadata.lastHotlistSentAt,
        hotlistSendCount: benchMetadata.hotlistSendCount,
        lastOutreachDate: benchMetadata.lastOutreachDate,
        hasActiveImmigrationCase: benchMetadata.hasActiveImmigrationCase,
        lastContactedAt: benchMetadata.lastContactedAt,
        contactFrequencyDays: benchMetadata.contactFrequencyDays,
        isResponsive: benchMetadata.isResponsive,
        responsivenessScore: benchMetadata.responsivenessScore,
        benchSalesRepId: benchMetadata.benchSalesRepId,
      })
      .from(benchMetadata)
      .innerJoin(userProfiles, eq(benchMetadata.userId, userProfiles.id))
      .where(and(
        eq(benchMetadata.userId, userId),
        eq(userProfiles.orgId, context.orgId)
      ))
      .limit(1);

    if (!consultant[0]) {
      return { success: false, error: 'Bench consultant not found' };
    }

    const c = consultant[0];

    // Get bench rep name
    let benchRepName: string | null = null;
    if (c.benchSalesRepId) {
      const rep = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, c.benchSalesRepId),
        columns: { firstName: true, lastName: true },
      });
      benchRepName = rep ? `${rep.firstName || ''} ${rep.lastName || ''}`.trim() : null;
    }

    // Get submission counts
    const submissionCounts = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where status not in ('placed', 'rejected'))`
      })
      .from(benchSubmissions)
      .where(eq(benchSubmissions.candidateId, userId));

    return {
      success: true,
      data: {
        id: c.userId,
        userId: c.userId,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        title: c.title,
        skills: null,
        location: c.location,
        visaStatus: null,
        benchStartDate: c.benchStartDate,
        daysOnBench: c.daysOnBench,
        alert30DaySent: c.alert30DaySent,
        alert60DaySent: c.alert60DaySent,
        lastHotlistSentAt: c.lastHotlistSentAt?.toISOString() || null,
        hotlistSendCount: c.hotlistSendCount,
        lastOutreachDate: c.lastOutreachDate?.toISOString() || null,
        hasActiveImmigrationCase: c.hasActiveImmigrationCase,
        lastContactedAt: c.lastContactedAt?.toISOString() || null,
        contactFrequencyDays: c.contactFrequencyDays,
        isResponsive: c.isResponsive,
        responsivenessScore: c.responsivenessScore,
        benchSalesRepId: c.benchSalesRepId,
        benchSalesRepName: benchRepName,
        submissionCount: Number(submissionCounts[0]?.total || 0),
        activeSubmissions: Number(submissionCounts[0]?.active || 0),
      },
    };
  } catch (error) {
    console.error('Get bench consultant error:', error);
    return { success: false, error: 'Failed to get bench consultant' };
  }
}

const addToBenchSchema = z.object({
  userId: z.string().uuid(),
  benchStartDate: z.string(),
  benchSalesRepId: z.string().uuid().optional(),
  contactFrequencyDays: z.number().min(1).max(30).default(3),
});

export async function addToBenchAction(
  input: z.infer<typeof addToBenchSchema>
): Promise<ActionResult<{ userId: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = addToBenchSchema.parse(input);

    // Verify user exists in org
    const user = await db.query.userProfiles.findFirst({
      where: and(
        eq(userProfiles.id, validated.userId),
        eq(userProfiles.orgId, context.orgId)
      ),
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if already on bench
    const existing = await db.query.benchMetadata.findFirst({
      where: eq(benchMetadata.userId, validated.userId),
    });

    if (existing) {
      return { success: false, error: 'User is already on bench' };
    }

    // Add to bench
    await db.insert(benchMetadata).values({
      userId: validated.userId,
      benchStartDate: validated.benchStartDate,
      benchSalesRepId: validated.benchSalesRepId,
      contactFrequencyDays: validated.contactFrequencyDays,
    });

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.consultant.added',
      'bench_metadata',
      validated.userId,
      { benchStartDate: validated.benchStartDate, benchSalesRepId: validated.benchSalesRepId }
    );

    return { success: true, data: { userId: validated.userId } };
  } catch (error) {
    console.error('Add to bench error:', error);
    return { success: false, error: 'Failed to add consultant to bench' };
  }
}

const updateBenchConsultantSchema = z.object({
  userId: z.string().uuid(),
  benchSalesRepId: z.string().uuid().optional().nullable(),
  contactFrequencyDays: z.number().min(1).max(30).optional(),
  isResponsive: z.boolean().optional(),
  responsivenessScore: z.number().min(0).max(100).optional(),
});

export async function updateBenchConsultantAction(
  input: z.infer<typeof updateBenchConsultantSchema>
): Promise<ActionResult<{ userId: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = updateBenchConsultantSchema.parse(input);
    const { userId, ...updates } = validated;

    // Verify exists
    const existing = await db.query.benchMetadata.findFirst({
      where: eq(benchMetadata.userId, userId),
    });

    if (!existing) {
      return { success: false, error: 'Bench consultant not found' };
    }

    // Update
    await db.update(benchMetadata)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(benchMetadata.userId, userId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.consultant.updated',
      'bench_metadata',
      userId,
      { updates }
    );

    return { success: true, data: { userId } };
  } catch (error) {
    console.error('Update bench consultant error:', error);
    return { success: false, error: 'Failed to update bench consultant' };
  }
}

export async function recordContactAction(
  userId: string,
  notes?: string
): Promise<ActionResult<{ userId: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    await db.update(benchMetadata)
      .set({
        lastContactedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(benchMetadata.userId, userId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.consultant.contacted',
      'bench_metadata',
      userId,
      { notes }
    );

    return { success: true, data: { userId } };
  } catch (error) {
    console.error('Record contact error:', error);
    return { success: false, error: 'Failed to record contact' };
  }
}

export async function removeFromBenchAction(
  userId: string,
  reason: string
): Promise<ActionResult<{ userId: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:delete');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Delete bench metadata (keeps user profile)
    await db.delete(benchMetadata).where(eq(benchMetadata.userId, userId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.consultant.removed',
      'bench_metadata',
      userId,
      { reason },
      'warning'
    );

    return { success: true, data: { userId } };
  } catch (error) {
    console.error('Remove from bench error:', error);
    return { success: false, error: 'Failed to remove from bench' };
  }
}

// =====================================================
// External Jobs Actions
// =====================================================

const listExternalJobsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sourceName: z.string().optional(),
  status: z.enum(['active', 'expired', 'filled', 'ignored']).optional(),
  isRemote: z.boolean().optional(),
  minRate: z.number().optional(),
  maxRate: z.number().optional(),
  skills: z.array(z.string()).optional(),
  sortBy: z.enum(['scrapedAt', 'rateMax', 'title', 'matchCount']).default('scrapedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listExternalJobsAction(
  input: z.infer<typeof listExternalJobsSchema>
): Promise<PaginatedResult<ExternalJob>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = listExternalJobsSchema.parse(input);
    const { page, pageSize, search, sourceName, status, isRemote, minRate, maxRate, skills, sortBy, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [
      eq(externalJobs.orgId, context.orgId),
      isNull(externalJobs.deletedAt),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(externalJobs.title, `%${search}%`),
          ilike(externalJobs.companyName, `%${search}%`),
          ilike(externalJobs.description, `%${search}%`)
        )!
      );
    }

    if (sourceName) {
      conditions.push(eq(externalJobs.sourceName, sourceName));
    }

    if (status) {
      conditions.push(eq(externalJobs.status, status));
    }

    if (isRemote !== undefined) {
      conditions.push(eq(externalJobs.isRemote, isRemote));
    }

    if (minRate !== undefined) {
      conditions.push(gte(externalJobs.rateMin, minRate.toString()));
    }

    if (maxRate !== undefined) {
      conditions.push(lte(externalJobs.rateMax, maxRate.toString()));
    }

    // Build query
    let query = db
      .select()
      .from(externalJobs)
      .where(and(...conditions));

    // Apply sorting
    const orderFn = sortOrder === 'asc' ? asc : desc;
    switch (sortBy) {
      case 'scrapedAt':
        query = query.orderBy(orderFn(externalJobs.scrapedAt)) as typeof query;
        break;
      case 'rateMax':
        query = query.orderBy(orderFn(externalJobs.rateMax)) as typeof query;
        break;
      case 'title':
        query = query.orderBy(orderFn(externalJobs.title)) as typeof query;
        break;
      case 'matchCount':
        query = query.orderBy(orderFn(externalJobs.matchCount)) as typeof query;
        break;
    }

    const jobs = await query.limit(pageSize).offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(externalJobs)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Filter by skills if provided (post-filter due to array column)
    let filteredJobs = jobs;
    if (skills && skills.length > 0) {
      filteredJobs = jobs.filter(job =>
        job.requiredSkills?.some(skill =>
          skills.some(s => skill.toLowerCase().includes(s.toLowerCase()))
        )
      );
    }

    const jobData: ExternalJob[] = filteredJobs.map(job => ({
      id: job.id,
      sourceName: job.sourceName,
      sourceJobId: job.sourceJobId,
      sourceUrl: job.sourceUrl,
      title: job.title,
      description: job.description,
      companyName: job.companyName,
      location: job.location,
      isRemote: job.isRemote,
      rateMin: job.rateMin ? Number(job.rateMin) : null,
      rateMax: job.rateMax ? Number(job.rateMax) : null,
      rateType: job.rateType,
      requiredSkills: job.requiredSkills,
      experienceYearsMin: job.experienceYearsMin,
      visaRequirements: job.visaRequirements,
      status: job.status,
      scrapedAt: job.scrapedAt.toISOString(),
      lastVerifiedAt: job.lastVerifiedAt?.toISOString() || null,
      expiresAt: job.expiresAt?.toISOString() || null,
      matchCount: job.matchCount,
      submissionCount: job.submissionCount,
      createdAt: job.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: jobData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('List external jobs error:', error);
    return { success: false, error: 'Failed to list external jobs' };
  }
}

export async function getExternalJobAction(
  jobId: string
): Promise<ActionResult<ExternalJob>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const job = await db.query.externalJobs.findFirst({
      where: and(
        eq(externalJobs.id, jobId),
        eq(externalJobs.orgId, context.orgId),
        isNull(externalJobs.deletedAt)
      ),
    });

    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    return {
      success: true,
      data: {
        id: job.id,
        sourceName: job.sourceName,
        sourceJobId: job.sourceJobId,
        sourceUrl: job.sourceUrl,
        title: job.title,
        description: job.description,
        companyName: job.companyName,
        location: job.location,
        isRemote: job.isRemote,
        rateMin: job.rateMin ? Number(job.rateMin) : null,
        rateMax: job.rateMax ? Number(job.rateMax) : null,
        rateType: job.rateType,
        requiredSkills: job.requiredSkills,
        experienceYearsMin: job.experienceYearsMin,
        visaRequirements: job.visaRequirements,
        status: job.status,
        scrapedAt: job.scrapedAt.toISOString(),
        lastVerifiedAt: job.lastVerifiedAt?.toISOString() || null,
        expiresAt: job.expiresAt?.toISOString() || null,
        matchCount: job.matchCount,
        submissionCount: job.submissionCount,
        createdAt: job.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Get external job error:', error);
    return { success: false, error: 'Failed to get job' };
  }
}

const createExternalJobSchema = z.object({
  sourceName: z.string().min(1),
  sourceJobId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  companyName: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  rateMin: z.number().optional(),
  rateMax: z.number().optional(),
  rateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']).default('hourly'),
  requiredSkills: z.array(z.string()).optional(),
  experienceYearsMin: z.number().optional(),
  visaRequirements: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
});

export async function createExternalJobAction(
  input: z.infer<typeof createExternalJobSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = createExternalJobSchema.parse(input);

    const [job] = await db.insert(externalJobs).values({
      orgId: context.orgId,
      sourceName: validated.sourceName,
      sourceJobId: validated.sourceJobId,
      sourceUrl: validated.sourceUrl,
      title: validated.title,
      description: validated.description,
      companyName: validated.companyName,
      location: validated.location,
      isRemote: validated.isRemote,
      rateMin: validated.rateMin?.toString(),
      rateMax: validated.rateMax?.toString(),
      rateType: validated.rateType,
      requiredSkills: validated.requiredSkills,
      experienceYearsMin: validated.experienceYearsMin,
      visaRequirements: validated.visaRequirements,
      status: 'active',
      scrapedAt: new Date(),
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
    }).returning({ id: externalJobs.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.external_job.created',
      'external_jobs',
      job.id,
      { title: validated.title, sourceName: validated.sourceName }
    );

    return { success: true, data: { id: job.id } };
  } catch (error) {
    console.error('Create external job error:', error);
    return { success: false, error: 'Failed to create job' };
  }
}

export async function updateExternalJobStatusAction(
  jobId: string,
  status: 'active' | 'expired' | 'filled' | 'ignored'
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    await db.update(externalJobs)
      .set({ status, updatedAt: new Date() })
      .where(and(
        eq(externalJobs.id, jobId),
        eq(externalJobs.orgId, context.orgId)
      ));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.external_job.status_updated',
      'external_jobs',
      jobId,
      { status }
    );

    return { success: true, data: { id: jobId } };
  } catch (error) {
    console.error('Update job status error:', error);
    return { success: false, error: 'Failed to update job status' };
  }
}

// =====================================================
// Bench Submissions Actions
// =====================================================

const listBenchSubmissionsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  candidateId: z.string().uuid().optional(),
  externalJobId: z.string().uuid().optional(),
  benchRepId: z.string().uuid().optional(),
  status: z.enum([
    'identified', 'contacted_candidate', 'candidate_interested',
    'submitted_to_vendor', 'vendor_review', 'interview',
    'offered', 'placed', 'rejected'
  ]).optional(),
  sortBy: z.enum(['createdAt', 'submittedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listBenchSubmissionsAction(
  input: z.infer<typeof listBenchSubmissionsSchema>
): Promise<PaginatedResult<BenchSubmission>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = listBenchSubmissionsSchema.parse(input);
    const { page, pageSize, candidateId, externalJobId, benchRepId, status, sortBy, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [eq(benchSubmissions.orgId, context.orgId)];

    if (candidateId) {
      conditions.push(eq(benchSubmissions.candidateId, candidateId));
    }

    if (externalJobId) {
      conditions.push(eq(benchSubmissions.externalJobId, externalJobId));
    }

    if (benchRepId) {
      conditions.push(eq(benchSubmissions.benchRepId, benchRepId));
    }

    if (status) {
      conditions.push(eq(benchSubmissions.status, status));
    }

    // Build query
    let query = db
      .select()
      .from(benchSubmissions)
      .where(and(...conditions));

    // Apply sorting
    const orderFn = sortOrder === 'asc' ? asc : desc;
    switch (sortBy) {
      case 'createdAt':
        query = query.orderBy(orderFn(benchSubmissions.createdAt)) as typeof query;
        break;
      case 'submittedAt':
        query = query.orderBy(orderFn(benchSubmissions.submittedAt)) as typeof query;
        break;
      case 'status':
        query = query.orderBy(orderFn(benchSubmissions.status)) as typeof query;
        break;
    }

    const submissions = await query.limit(pageSize).offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(benchSubmissions)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Enrich with names
    const submissionData: BenchSubmission[] = await Promise.all(
      submissions.map(async (sub) => {
        // Get candidate name
        const candidate = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.id, sub.candidateId),
          columns: { firstName: true, lastName: true },
        });

        // Get job details
        const job = await db.query.externalJobs.findFirst({
          where: eq(externalJobs.id, sub.externalJobId),
          columns: { title: true, companyName: true },
        });

        // Get submitter name
        let submittedByName: string | null = null;
        if (sub.submittedBy) {
          const submitter = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.id, sub.submittedBy),
            columns: { firstName: true, lastName: true },
          });
          submittedByName = submitter ? `${submitter.firstName || ''} ${submitter.lastName || ''}`.trim() : null;
        }

        // Get bench rep name
        let benchRepName: string | null = null;
        if (sub.benchRepId) {
          const rep = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.id, sub.benchRepId),
            columns: { firstName: true, lastName: true },
          });
          benchRepName = rep ? `${rep.firstName || ''} ${rep.lastName || ''}`.trim() : null;
        }

        return {
          id: sub.id,
          externalJobId: sub.externalJobId,
          candidateId: sub.candidateId,
          candidateName: candidate ? `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() : null,
          jobTitle: job?.title || null,
          companyName: job?.companyName || null,
          status: sub.status,
          submittedBy: sub.submittedBy,
          submittedByName,
          submittedAt: sub.submittedAt?.toISOString() || null,
          submissionNotes: sub.submissionNotes,
          vendorName: sub.vendorName,
          vendorContactName: sub.vendorContactName,
          vendorContactEmail: sub.vendorContactEmail,
          vendorSubmissionId: sub.vendorSubmissionId,
          vendorFeedback: sub.vendorFeedback,
          interviewDate: sub.interviewDate?.toISOString() || null,
          interviewFeedback: sub.interviewFeedback,
          placedAt: sub.placedAt?.toISOString() || null,
          placementStartDate: sub.placementStartDate,
          placementBillRate: sub.placementBillRate ? Number(sub.placementBillRate) : null,
          rejectedAt: sub.rejectedAt?.toISOString() || null,
          rejectionReason: sub.rejectionReason,
          benchRepId: sub.benchRepId,
          benchRepName,
          createdAt: sub.createdAt.toISOString(),
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
    console.error('List bench submissions error:', error);
    return { success: false, error: 'Failed to list submissions' };
  }
}

const createBenchSubmissionSchema = z.object({
  externalJobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  benchRepId: z.string().uuid().optional(),
  submissionNotes: z.string().optional(),
});

export async function createBenchSubmissionAction(
  input: z.infer<typeof createBenchSubmissionSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = createBenchSubmissionSchema.parse(input);

    // Check for duplicate
    const existing = await db.query.benchSubmissions.findFirst({
      where: and(
        eq(benchSubmissions.externalJobId, validated.externalJobId),
        eq(benchSubmissions.candidateId, validated.candidateId)
      ),
    });

    if (existing) {
      return { success: false, error: 'Submission already exists for this candidate and job' };
    }

    const [submission] = await db.insert(benchSubmissions).values({
      orgId: context.orgId,
      externalJobId: validated.externalJobId,
      candidateId: validated.candidateId,
      benchRepId: validated.benchRepId || context.userId,
      status: BenchSubmissionStatus.IDENTIFIED,
      submissionNotes: validated.submissionNotes,
    }).returning({ id: benchSubmissions.id });

    // Increment job match count
    await db.update(externalJobs)
      .set({
        matchCount: sql`coalesce(match_count, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(externalJobs.id, validated.externalJobId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.submission.created',
      'bench_submissions',
      submission.id,
      { externalJobId: validated.externalJobId, candidateId: validated.candidateId }
    );

    return { success: true, data: { id: submission.id } };
  } catch (error) {
    console.error('Create bench submission error:', error);
    return { success: false, error: 'Failed to create submission' };
  }
}

const updateBenchSubmissionStatusSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum([
    'identified', 'contacted_candidate', 'candidate_interested',
    'submitted_to_vendor', 'vendor_review', 'interview',
    'offered', 'placed', 'rejected'
  ]),
  // Optional fields based on status
  vendorName: z.string().optional(),
  vendorContactName: z.string().optional(),
  vendorContactEmail: z.string().email().optional(),
  vendorSubmissionId: z.string().optional(),
  vendorFeedback: z.string().optional(),
  interviewDate: z.string().optional(),
  interviewFeedback: z.string().optional(),
  placementStartDate: z.string().optional(),
  placementBillRate: z.number().optional(),
  rejectionReason: z.string().optional(),
});

export async function updateBenchSubmissionStatusAction(
  input: z.infer<typeof updateBenchSubmissionStatusSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = updateBenchSubmissionStatusSchema.parse(input);
    const { submissionId, status, ...updates } = validated;

    // Build update object
    const updateObj: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    // Add status-specific fields
    if (status === 'submitted_to_vendor') {
      updateObj.submittedAt = new Date();
      updateObj.submittedBy = context.userId;
      if (updates.vendorName) updateObj.vendorName = updates.vendorName;
      if (updates.vendorContactName) updateObj.vendorContactName = updates.vendorContactName;
      if (updates.vendorContactEmail) updateObj.vendorContactEmail = updates.vendorContactEmail;

      // Increment job submission count
      const sub = await db.query.benchSubmissions.findFirst({
        where: eq(benchSubmissions.id, submissionId),
      });
      if (sub) {
        await db.update(externalJobs)
          .set({
            submissionCount: sql`coalesce(submission_count, 0) + 1`,
            updatedAt: new Date(),
          })
          .where(eq(externalJobs.id, sub.externalJobId));
      }
    }

    if (updates.vendorSubmissionId) updateObj.vendorSubmissionId = updates.vendorSubmissionId;
    if (updates.vendorFeedback) updateObj.vendorFeedback = updates.vendorFeedback;

    if (status === 'interview' && updates.interviewDate) {
      updateObj.interviewDate = new Date(updates.interviewDate);
    }
    if (updates.interviewFeedback) updateObj.interviewFeedback = updates.interviewFeedback;

    if (status === 'placed') {
      updateObj.placedAt = new Date();
      if (updates.placementStartDate) updateObj.placementStartDate = updates.placementStartDate;
      if (updates.placementBillRate) updateObj.placementBillRate = updates.placementBillRate.toString();
    }

    if (status === 'rejected') {
      updateObj.rejectedAt = new Date();
      if (updates.rejectionReason) updateObj.rejectionReason = updates.rejectionReason;
    }

    await db.update(benchSubmissions)
      .set(updateObj)
      .where(and(
        eq(benchSubmissions.id, submissionId),
        eq(benchSubmissions.orgId, context.orgId)
      ));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.submission.status_updated',
      'bench_submissions',
      submissionId,
      { status, ...updates }
    );

    return { success: true, data: { id: submissionId } };
  } catch (error) {
    console.error('Update bench submission status error:', error);
    return { success: false, error: 'Failed to update submission status' };
  }
}

// =====================================================
// Job Sources Actions
// =====================================================

export async function listJobSourcesAction(): Promise<ActionResult<JobSource[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const sources = await db.query.jobSources.findMany({
      where: eq(jobSources.orgId, context.orgId),
      orderBy: [desc(jobSources.isActive), asc(jobSources.name)],
    });

    const sourceData: JobSource[] = sources.map(source => ({
      id: source.id,
      name: source.name,
      sourceType: source.sourceType,
      url: source.url,
      scrapeFrequencyHours: source.scrapeFrequencyHours,
      lastScrapeAt: source.lastScrapeAt?.toISOString() || null,
      nextScrapeAt: source.nextScrapeAt?.toISOString() || null,
      requiresAuth: source.requiresAuth,
      isActive: source.isActive,
      isHealthy: source.isHealthy,
      lastError: source.lastError,
      errorCount: source.errorCount,
      totalJobsScraped: source.totalJobsScraped,
      successfulScrapes: source.successfulScrapes,
      failedScrapes: source.failedScrapes,
      createdAt: source.createdAt.toISOString(),
    }));

    return { success: true, data: sourceData };
  } catch (error) {
    console.error('List job sources error:', error);
    return { success: false, error: 'Failed to list job sources' };
  }
}

const createJobSourceSchema = z.object({
  name: z.string().min(1),
  sourceType: z.enum(['vendor_portal', 'job_board', 'email', 'api', 'manual']).default('vendor_portal'),
  url: z.string().url().optional(),
  scrapeFrequencyHours: z.number().min(1).max(168).default(24),
  requiresAuth: z.boolean().default(false),
});

export async function createJobSourceAction(
  input: z.infer<typeof createJobSourceSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = createJobSourceSchema.parse(input);

    const [source] = await db.insert(jobSources).values({
      orgId: context.orgId,
      name: validated.name,
      sourceType: validated.sourceType,
      url: validated.url,
      scrapeFrequencyHours: validated.scrapeFrequencyHours,
      requiresAuth: validated.requiresAuth,
      createdBy: context.userId,
    }).returning({ id: jobSources.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.job_source.created',
      'job_sources',
      source.id,
      { name: validated.name, sourceType: validated.sourceType }
    );

    return { success: true, data: { id: source.id } };
  } catch (error) {
    console.error('Create job source error:', error);
    return { success: false, error: 'Failed to create job source' };
  }
}

export async function toggleJobSourceAction(
  sourceId: string,
  isActive: boolean
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    await db.update(jobSources)
      .set({ isActive, updatedAt: new Date() })
      .where(and(
        eq(jobSources.id, sourceId),
        eq(jobSources.orgId, context.orgId)
      ));

    await logAuditEvent(
      context.userId,
      context.orgId,
      'bench.job_source.toggled',
      'job_sources',
      sourceId,
      { isActive }
    );

    return { success: true, data: { id: sourceId } };
  } catch (error) {
    console.error('Toggle job source error:', error);
    return { success: false, error: 'Failed to toggle job source' };
  }
}

// =====================================================
// Dashboard & Analytics Actions
// =====================================================

export interface BenchDashboardMetrics {
  totalOnBench: number;
  avgDaysOnBench: number;
  over30Days: number;
  over60Days: number;
  activeSubmissions: number;
  placedThisMonth: number;
  pendingInterviews: number;
  responseRate: number;
  totalExternalJobs: number;
  activeExternalJobs: number;
}

export async function getBenchDashboardMetricsAction(): Promise<ActionResult<BenchDashboardMetrics>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get bench consultant metrics
    const benchStats = await db
      .select({
        totalOnBench: sql<number>`count(*)`,
        avgDaysOnBench: sql<number>`avg(days_on_bench)`,
        over30Days: sql<number>`count(*) filter (where days_on_bench >= 30)`,
        over60Days: sql<number>`count(*) filter (where days_on_bench >= 60)`,
      })
      .from(benchMetadata)
      .innerJoin(userProfiles, eq(benchMetadata.userId, userProfiles.id))
      .where(eq(userProfiles.orgId, context.orgId));

    // Get submission stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const submissionStats = await db
      .select({
        activeSubmissions: sql<number>`count(*) filter (where status not in ('placed', 'rejected'))`,
        placedThisMonth: sql<number>`count(*) filter (where status = 'placed' and placed_at >= ${startOfMonth})`,
        pendingInterviews: sql<number>`count(*) filter (where status = 'interview')`,
      })
      .from(benchSubmissions)
      .where(eq(benchSubmissions.orgId, context.orgId));

    // Get responsiveness rate
    const responsivenessStats = await db
      .select({
        responsive: sql<number>`count(*) filter (where is_responsive = true)`,
        total: sql<number>`count(*)`,
      })
      .from(benchMetadata)
      .innerJoin(userProfiles, eq(benchMetadata.userId, userProfiles.id))
      .where(eq(userProfiles.orgId, context.orgId));

    // Get external job stats
    const jobStats = await db
      .select({
        totalExternalJobs: sql<number>`count(*)`,
        activeExternalJobs: sql<number>`count(*) filter (where status = 'active')`,
      })
      .from(externalJobs)
      .where(and(
        eq(externalJobs.orgId, context.orgId),
        isNull(externalJobs.deletedAt)
      ));

    const totalConsultants = Number(responsivenessStats[0]?.total || 0);
    const responsiveCount = Number(responsivenessStats[0]?.responsive || 0);
    const responseRate = totalConsultants > 0 ? (responsiveCount / totalConsultants) * 100 : 0;

    return {
      success: true,
      data: {
        totalOnBench: Number(benchStats[0]?.totalOnBench || 0),
        avgDaysOnBench: Math.round(Number(benchStats[0]?.avgDaysOnBench || 0)),
        over30Days: Number(benchStats[0]?.over30Days || 0),
        over60Days: Number(benchStats[0]?.over60Days || 0),
        activeSubmissions: Number(submissionStats[0]?.activeSubmissions || 0),
        placedThisMonth: Number(submissionStats[0]?.placedThisMonth || 0),
        pendingInterviews: Number(submissionStats[0]?.pendingInterviews || 0),
        responseRate: Math.round(responseRate),
        totalExternalJobs: Number(jobStats[0]?.totalExternalJobs || 0),
        activeExternalJobs: Number(jobStats[0]?.activeExternalJobs || 0),
      },
    };
  } catch (error) {
    console.error('Get bench dashboard metrics error:', error);
    return { success: false, error: 'Failed to get dashboard metrics' };
  }
}

export interface BenchSubmissionPipeline {
  stage: string;
  count: number;
}

export async function getBenchSubmissionPipelineAction(): Promise<ActionResult<BenchSubmissionPipeline[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const pipeline = await db
      .select({
        stage: benchSubmissions.status,
        count: sql<number>`count(*)`,
      })
      .from(benchSubmissions)
      .where(eq(benchSubmissions.orgId, context.orgId))
      .groupBy(benchSubmissions.status);

    return {
      success: true,
      data: pipeline.map(p => ({
        stage: p.stage,
        count: Number(p.count),
      })),
    };
  } catch (error) {
    console.error('Get bench submission pipeline error:', error);
    return { success: false, error: 'Failed to get submission pipeline' };
  }
}

export async function getConsultantsNeedingContactAction(): Promise<ActionResult<BenchConsultant[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get consultants who haven't been contacted within their contact frequency
    const consultants = await db
      .select({
        userId: benchMetadata.userId,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        email: userProfiles.email,
        phone: userProfiles.phone,
        title: userProfiles.title,
        location: userProfiles.location,
        benchStartDate: benchMetadata.benchStartDate,
        daysOnBench: benchMetadata.daysOnBench,
        alert30DaySent: benchMetadata.alert30DaySent,
        alert60DaySent: benchMetadata.alert60DaySent,
        lastHotlistSentAt: benchMetadata.lastHotlistSentAt,
        hotlistSendCount: benchMetadata.hotlistSendCount,
        lastOutreachDate: benchMetadata.lastOutreachDate,
        hasActiveImmigrationCase: benchMetadata.hasActiveImmigrationCase,
        lastContactedAt: benchMetadata.lastContactedAt,
        contactFrequencyDays: benchMetadata.contactFrequencyDays,
        isResponsive: benchMetadata.isResponsive,
        responsivenessScore: benchMetadata.responsivenessScore,
        benchSalesRepId: benchMetadata.benchSalesRepId,
      })
      .from(benchMetadata)
      .innerJoin(userProfiles, eq(benchMetadata.userId, userProfiles.id))
      .where(and(
        eq(userProfiles.orgId, context.orgId),
        or(
          isNull(benchMetadata.lastContactedAt),
          sql`last_contacted_at < now() - (contact_frequency_days || ' days')::interval`
        )
      ))
      .orderBy(asc(benchMetadata.lastContactedAt))
      .limit(20);

    const consultantData: BenchConsultant[] = consultants.map(c => ({
      id: c.userId,
      userId: c.userId,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      title: c.title,
      skills: null,
      location: c.location,
      visaStatus: null,
      benchStartDate: c.benchStartDate,
      daysOnBench: c.daysOnBench,
      alert30DaySent: c.alert30DaySent,
      alert60DaySent: c.alert60DaySent,
      lastHotlistSentAt: c.lastHotlistSentAt?.toISOString() || null,
      hotlistSendCount: c.hotlistSendCount,
      lastOutreachDate: c.lastOutreachDate?.toISOString() || null,
      hasActiveImmigrationCase: c.hasActiveImmigrationCase,
      lastContactedAt: c.lastContactedAt?.toISOString() || null,
      contactFrequencyDays: c.contactFrequencyDays,
      isResponsive: c.isResponsive,
      responsivenessScore: c.responsivenessScore,
      benchSalesRepId: c.benchSalesRepId,
      benchSalesRepName: null,
      submissionCount: 0,
      activeSubmissions: 0,
    }));

    return { success: true, data: consultantData };
  } catch (error) {
    console.error('Get consultants needing contact error:', error);
    return { success: false, error: 'Failed to get consultants needing contact' };
  }
}

// =====================================================
// Matching Actions
// =====================================================

export async function findMatchingJobsAction(
  candidateId: string
): Promise<ActionResult<ExternalJob[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get candidate profile
    const candidate = await db.query.userProfiles.findFirst({
      where: and(
        eq(userProfiles.id, candidateId),
        eq(userProfiles.orgId, context.orgId)
      ),
    });

    if (!candidate) {
      return { success: false, error: 'Candidate not found' };
    }

    // Get active external jobs that the candidate hasn't been submitted to
    const existingSubmissions = await db
      .select({ jobId: benchSubmissions.externalJobId })
      .from(benchSubmissions)
      .where(eq(benchSubmissions.candidateId, candidateId));

    const submittedJobIds = existingSubmissions.map(s => s.jobId);

    let conditions = [
      eq(externalJobs.orgId, context.orgId),
      eq(externalJobs.status, 'active'),
      isNull(externalJobs.deletedAt),
    ];

    if (submittedJobIds.length > 0) {
      conditions.push(sql`${externalJobs.id} not in (${sql.join(submittedJobIds.map(id => sql`${id}`), sql`, `)})`);
    }

    const matchingJobs = await db
      .select()
      .from(externalJobs)
      .where(and(...conditions))
      .orderBy(desc(externalJobs.scrapedAt))
      .limit(50);

    // TODO: Add skill matching logic based on candidate skills

    const jobData: ExternalJob[] = matchingJobs.map(job => ({
      id: job.id,
      sourceName: job.sourceName,
      sourceJobId: job.sourceJobId,
      sourceUrl: job.sourceUrl,
      title: job.title,
      description: job.description,
      companyName: job.companyName,
      location: job.location,
      isRemote: job.isRemote,
      rateMin: job.rateMin ? Number(job.rateMin) : null,
      rateMax: job.rateMax ? Number(job.rateMax) : null,
      rateType: job.rateType,
      requiredSkills: job.requiredSkills,
      experienceYearsMin: job.experienceYearsMin,
      visaRequirements: job.visaRequirements,
      status: job.status,
      scrapedAt: job.scrapedAt.toISOString(),
      lastVerifiedAt: job.lastVerifiedAt?.toISOString() || null,
      expiresAt: job.expiresAt?.toISOString() || null,
      matchCount: job.matchCount,
      submissionCount: job.submissionCount,
      createdAt: job.createdAt.toISOString(),
    }));

    return { success: true, data: jobData };
  } catch (error) {
    console.error('Find matching jobs error:', error);
    return { success: false, error: 'Failed to find matching jobs' };
  }
}

export async function findMatchingCandidatesAction(
  jobId: string
): Promise<ActionResult<BenchConsultant[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get job details
    const job = await db.query.externalJobs.findFirst({
      where: and(
        eq(externalJobs.id, jobId),
        eq(externalJobs.orgId, context.orgId)
      ),
    });

    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    // Get candidates already submitted to this job
    const existingSubmissions = await db
      .select({ candidateId: benchSubmissions.candidateId })
      .from(benchSubmissions)
      .where(eq(benchSubmissions.externalJobId, jobId));

    const submittedCandidateIds = existingSubmissions.map(s => s.candidateId);

    // Get all bench consultants not already submitted
    let conditions = [eq(userProfiles.orgId, context.orgId)];

    if (submittedCandidateIds.length > 0) {
      conditions.push(sql`${benchMetadata.userId} not in (${sql.join(submittedCandidateIds.map(id => sql`${id}`), sql`, `)})`);
    }

    const consultants = await db
      .select({
        userId: benchMetadata.userId,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        email: userProfiles.email,
        phone: userProfiles.phone,
        title: userProfiles.title,
        location: userProfiles.location,
        benchStartDate: benchMetadata.benchStartDate,
        daysOnBench: benchMetadata.daysOnBench,
        alert30DaySent: benchMetadata.alert30DaySent,
        alert60DaySent: benchMetadata.alert60DaySent,
        lastHotlistSentAt: benchMetadata.lastHotlistSentAt,
        hotlistSendCount: benchMetadata.hotlistSendCount,
        lastOutreachDate: benchMetadata.lastOutreachDate,
        hasActiveImmigrationCase: benchMetadata.hasActiveImmigrationCase,
        lastContactedAt: benchMetadata.lastContactedAt,
        contactFrequencyDays: benchMetadata.contactFrequencyDays,
        isResponsive: benchMetadata.isResponsive,
        responsivenessScore: benchMetadata.responsivenessScore,
        benchSalesRepId: benchMetadata.benchSalesRepId,
      })
      .from(benchMetadata)
      .innerJoin(userProfiles, eq(benchMetadata.userId, userProfiles.id))
      .where(and(...conditions))
      .orderBy(desc(benchMetadata.daysOnBench))
      .limit(50);

    // TODO: Add skill matching logic based on job requirements

    const consultantData: BenchConsultant[] = consultants.map(c => ({
      id: c.userId,
      userId: c.userId,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      title: c.title,
      skills: null,
      location: c.location,
      visaStatus: null,
      benchStartDate: c.benchStartDate,
      daysOnBench: c.daysOnBench,
      alert30DaySent: c.alert30DaySent,
      alert60DaySent: c.alert60DaySent,
      lastHotlistSentAt: c.lastHotlistSentAt?.toISOString() || null,
      hotlistSendCount: c.hotlistSendCount,
      lastOutreachDate: c.lastOutreachDate?.toISOString() || null,
      hasActiveImmigrationCase: c.hasActiveImmigrationCase,
      lastContactedAt: c.lastContactedAt?.toISOString() || null,
      contactFrequencyDays: c.contactFrequencyDays,
      isResponsive: c.isResponsive,
      responsivenessScore: c.responsivenessScore,
      benchSalesRepId: c.benchSalesRepId,
      benchSalesRepName: null,
      submissionCount: 0,
      activeSubmissions: 0,
    }));

    return { success: true, data: consultantData };
  } catch (error) {
    console.error('Find matching candidates error:', error);
    return { success: false, error: 'Failed to find matching candidates' };
  }
}
