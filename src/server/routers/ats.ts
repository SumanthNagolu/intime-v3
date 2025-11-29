/**
 * tRPC Router: ATS Module
 * Handles jobs, submissions, interviews, offers, and placements
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  jobs,
  submissions,
  interviews,
  offers,
  placements,
  skills,
  candidateSkills
} from '@/lib/db/schema/ats';
import {
  createJobSchema,
  updateJobSchema,
  createSubmissionSchema,
  updateSubmissionSchema,
  createInterviewSchema,
  updateInterviewSchema,
  createOfferSchema,
  updateOfferSchema,
  createPlacementSchema,
  updatePlacementSchema
} from '@/lib/validations/ats';
import { eq, and, desc, sql, inArray, isNull, or } from 'drizzle-orm';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { accounts } from '@/lib/db/schema/crm';

export const atsRouter = router({
  // =====================================================
  // JOBS
  // =====================================================

  jobs: router({
    /**
     * Get all jobs
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'open', 'on_hold', 'filled', 'closed']).optional(),
        clientId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, clientId } = input;

        let conditions = [eq(jobs.orgId, orgId)];
        if (status) conditions.push(eq(jobs.status, status));
        if (clientId) conditions.push(eq(jobs.accountId, clientId));

        const results = await db.select().from(jobs)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(jobs.createdAt));

        return results;
      }),

    /**
     * Get job by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [job] = await db.select().from(jobs)
          .where(and(
            eq(jobs.id, input.id),
            eq(jobs.orgId, orgId)
          ))
          .limit(1);

        if (!job) {
          throw new Error('Job not found');
        }

        return job;
      }),

    /**
     * Create new job
     */
    create: orgProtectedProcedure
      .input(createJobSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Extract rate fields that need string conversion for numeric columns
        const { rateMin, rateMax, ...rest } = input;

        const [newJob] = await db.insert(jobs).values({
          ...rest,
          orgId,
          ownerId: input.ownerId || userId,
          createdBy: userId,
          // Convert numbers to strings for numeric columns
          rateMin: rateMin !== undefined ? String(rateMin) : undefined,
          rateMax: rateMax !== undefined ? String(rateMax) : undefined,
        }).returning();

        return newJob;
      }),

    /**
     * Update job
     */
    update: orgProtectedProcedure
      .input(updateJobSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(jobs)
          .set(data)
          .where(and(
            eq(jobs.id, id),
            eq(jobs.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Job not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get job metrics
     */
    metrics: orgProtectedProcedure
      .input(z.object({ jobId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Get submission counts by status
        const submissionStats = await db.select({
          status: submissions.status,
          count: sql<number>`count(*)::int`,
        })
          .from(submissions)
          .where(and(
            eq(submissions.jobId, input.jobId),
            eq(submissions.orgId, orgId)
          ))
          .groupBy(submissions.status);

        // Get interview count
        const [interviewCount] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(interviews)
          .where(and(
            eq(interviews.jobId, input.jobId),
            eq(interviews.orgId, orgId)
          ));

        // Get offer count
        const [offerCount] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(offers)
          .where(and(
            eq(offers.jobId, input.jobId),
            eq(offers.orgId, orgId)
          ));

        return {
          submissions: submissionStats,
          interviews: interviewCount?.count || 0,
          offers: offerCount?.count || 0,
        };
      }),
  }),

  // =====================================================
  // SUBMISSIONS
  // =====================================================

  submissions: router({
    /**
     * Get all submissions
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
        jobId: z.string().uuid().optional(),
        candidateId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, jobId, candidateId } = input;

        let conditions = [eq(submissions.orgId, orgId)];
        if (status) conditions.push(eq(submissions.status, status));
        if (jobId) conditions.push(eq(submissions.jobId, jobId));
        if (candidateId) conditions.push(eq(submissions.candidateId, candidateId));

        const results = await db.select().from(submissions)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(submissions.createdAt));

        return results;
      }),

    /**
     * Get submission by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [submission] = await db.select().from(submissions)
          .where(and(
            eq(submissions.id, input.id),
            eq(submissions.orgId, orgId)
          ))
          .limit(1);

        if (!submission) {
          throw new Error('Submission not found');
        }

        return submission;
      }),

    /**
     * Create new submission
     */
    create: orgProtectedProcedure
      .input(createSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Get user profile ID from auth ID
        let [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        // Fallback: try by profile id directly
        if (!userProfile) {
          [userProfile] = await db.select({ id: userProfiles.id })
            .from(userProfiles)
            .where(eq(userProfiles.id, userId))
            .limit(1);
        }

        const ownerId = userProfile?.id || userId;

        const [newSubmission] = await db.insert(submissions).values({
          ...input,
          orgId,
          ownerId,
        }).returning();

        return newSubmission;
      }),

    /**
     * Update submission
     */
    update: orgProtectedProcedure
      .input(updateSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(submissions)
          .set(data)
          .where(and(
            eq(submissions.id, id),
            eq(submissions.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Submission not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Update submission status
     */
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, status, notes } = input;

        const [updated] = await db.update(submissions)
          .set({
            status: status,
            submissionNotes: notes,
          })
          .where(and(
            eq(submissions.id, id),
            eq(submissions.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Submission not found');
        }

        return updated;
      }),

    /**
     * Get submissions by account (for Talent tab)
     */
    listByAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { accountId, limit, offset } = input;

        // Get submissions via jobs that belong to this account
        const results = await db.select({
          id: submissions.id,
          status: submissions.status,
          candidateId: submissions.candidateId,
          candidateName: sql<string>`COALESCE((SELECT up.first_name || ' ' || up.last_name FROM user_profiles up WHERE up.id = ${submissions.candidateId}), 'Unknown')`,
          jobId: submissions.jobId,
          jobTitle: sql<string>`(SELECT j.title FROM jobs j WHERE j.id = ${submissions.jobId})`,
          aiMatchScore: submissions.aiMatchScore,
          recruiterMatchScore: submissions.recruiterMatchScore,
          submittedToClientAt: submissions.submittedToClientAt,
          createdAt: submissions.createdAt,
        })
          .from(submissions)
          .where(and(
            eq(submissions.orgId, orgId),
            eq(submissions.accountId, accountId)
          ))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(submissions.createdAt));

        return results;
      }),
  }),

  // =====================================================
  // INTERVIEWS
  // =====================================================

  interviews: router({
    /**
     * Get all interviews
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
        submissionId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, submissionId } = input;

        let conditions = [eq(interviews.orgId, orgId)];
        if (status) conditions.push(eq(interviews.status, status));
        if (submissionId) conditions.push(eq(interviews.submissionId, submissionId));

        const results = await db.select().from(interviews)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(interviews.scheduledAt));

        return results;
      }),

    /**
     * Create interview
     */
    create: orgProtectedProcedure
      .input(createInterviewSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newInterview] = await db.insert(interviews).values({
          ...input,
          orgId,
          scheduledBy: userId,
        }).returning();

        return newInterview;
      }),

    /**
     * Update interview
     */
    update: orgProtectedProcedure
      .input(updateInterviewSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(interviews)
          .set(data)
          .where(and(
            eq(interviews.id, id),
            eq(interviews.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Interview not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Cancel interview
     */
    cancel: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        cancellationReason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(interviews)
          .set({
            status: 'cancelled',
            cancellationReason: input.cancellationReason,
          })
          .where(and(
            eq(interviews.id, input.id),
            eq(interviews.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Interview not found');
        }

        return updated;
      }),
  }),

  // =====================================================
  // OFFERS
  // =====================================================

  offers: router({
    /**
     * Get all offers
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'pending_approval', 'sent', 'accepted', 'declined', 'withdrawn']).optional(),
        submissionId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, submissionId } = input;

        let conditions = [eq(offers.orgId, orgId)];
        if (status) conditions.push(eq(offers.status, status));
        if (submissionId) conditions.push(eq(offers.submissionId, submissionId));

        const results = await db.select().from(offers)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(offers.createdAt));

        return results;
      }),

    /**
     * Create offer
     */
    create: orgProtectedProcedure
      .input(createOfferSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newOffer] = await db.insert(offers).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newOffer;
      }),

    /**
     * Update offer
     */
    update: orgProtectedProcedure
      .input(updateOfferSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(offers)
          .set(data)
          .where(and(
            eq(offers.id, id),
            eq(offers.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Offer not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Send offer
     */
    send: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(offers)
          .set({
            status: 'sent',
            sentAt: new Date(),
          })
          .where(and(
            eq(offers.id, input.id),
            eq(offers.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Offer not found');
        }

        // TODO: Send email notification to candidate

        return updated;
      }),

    /**
     * Accept/decline offer
     */
    respond: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        accept: z.boolean(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, accept, notes } = input;

        const [updated] = await db.update(offers)
          .set({
            status: accept ? 'accepted' : 'declined',
            ...(accept
              ? { acceptedAt: new Date() }
              : { declinedAt: new Date(), declineReason: notes }),
          })
          .where(and(
            eq(offers.id, id),
            eq(offers.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Offer not found');
        }

        return updated;
      }),
  }),

  // =====================================================
  // PLACEMENTS
  // =====================================================

  placements: router({
    /**
     * Get all placements
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['active', 'extended', 'completed', 'terminated']).optional(),
        candidateId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, candidateId } = input;

        let conditions = [eq(placements.orgId, orgId)];
        if (status) conditions.push(eq(placements.status, status));
        if (candidateId) conditions.push(eq(placements.candidateId, candidateId));

        const results = await db.select().from(placements)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(placements.startDate));

        return results;
      }),

    /**
     * Create placement
     */
    create: orgProtectedProcedure
      .input(createPlacementSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newPlacement] = await db.insert(placements).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newPlacement;
      }),

    /**
     * Update placement
     */
    update: orgProtectedProcedure
      .input(updatePlacementSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(placements)
          .set(data)
          .where(and(
            eq(placements.id, id),
            eq(placements.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Placement not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Extend placement
     */
    extend: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        newEndDate: z.date(),
        extensionNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(placements)
          .set({
            endDate: input.newEndDate,
            status: 'extended',
            extensionCount: sql`COALESCE(${placements.extensionCount}, 0) + 1`,
          })
          .where(and(
            eq(placements.id, input.id),
            eq(placements.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Placement not found');
        }

        return updated;
      }),

    /**
     * Get active placements count
     */
    activeCount: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const [result] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(placements)
          .where(and(
            eq(placements.orgId, orgId),
            eq(placements.status, 'active')
          ));

        return result?.count || 0;
      }),

    /**
     * Get placements by account (for Talent tab)
     */
    listByAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { accountId, limit, offset } = input;

        const results = await db.select({
          id: placements.id,
          status: placements.status,
          candidateId: placements.candidateId,
          candidateName: sql<string>`COALESCE((SELECT up.first_name || ' ' || up.last_name FROM user_profiles up WHERE up.id = ${placements.candidateId}), 'Unknown')`,
          jobId: placements.jobId,
          jobTitle: sql<string>`(SELECT j.title FROM jobs j WHERE j.id = ${placements.jobId})`,
          billRate: placements.billRate,
          payRate: placements.payRate,
          startDate: placements.startDate,
          endDate: placements.endDate,
          createdAt: placements.createdAt,
        })
          .from(placements)
          .where(and(
            eq(placements.orgId, orgId),
            eq(placements.accountId, accountId)
          ))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(placements.startDate));

        return results;
      }),
  }),

  // =====================================================
  // CANDIDATES (Talent Management)
  // =====================================================

  candidates: router({
    /**
     * Search candidates for adding to account
     */
    search: orgProtectedProcedure
      .input(z.object({
        query: z.string().optional(),
        skills: z.array(z.string()).optional(),
        visaTypes: z.array(z.string()).optional(),
        availability: z.enum(['immediate', '2_weeks', '1_month']).optional(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { query, skills, visaTypes, availability, limit } = input;

        let conditions = [
          eq(userProfiles.orgId, orgId),
          isNull(userProfiles.deletedAt),
          or(
            eq(userProfiles.candidateStatus, 'active'),
            eq(userProfiles.candidateStatus, 'bench')
          ),
        ];

        if (availability) {
          conditions.push(eq(userProfiles.candidateAvailability, availability));
        }

        const results = await db.select({
          id: userProfiles.id,
          fullName: userProfiles.fullName,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          email: userProfiles.email,
          phone: userProfiles.phone,
          candidateStatus: userProfiles.candidateStatus,
          candidateSkills: userProfiles.candidateSkills,
          candidateExperienceYears: userProfiles.candidateExperienceYears,
          candidateCurrentVisa: userProfiles.candidateCurrentVisa,
          candidateVisaExpiry: userProfiles.candidateVisaExpiry,
          candidateHourlyRate: userProfiles.candidateHourlyRate,
          candidateAvailability: userProfiles.candidateAvailability,
          candidateLocation: userProfiles.candidateLocation,
          candidateWillingToRelocate: userProfiles.candidateWillingToRelocate,
          candidateResumeUrl: userProfiles.candidateResumeUrl,
        })
          .from(userProfiles)
          .where(and(...conditions))
          .limit(limit)
          .orderBy(userProfiles.fullName);

        // Filter by search query (name or skills)
        let filtered = results;
        if (query) {
          const q = query.toLowerCase();
          filtered = results.filter(c =>
            c.fullName?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.candidateSkills?.some(s => s.toLowerCase().includes(q))
          );
        }

        // Filter by skills
        if (skills && skills.length > 0) {
          filtered = filtered.filter(c =>
            skills.some(skill =>
              c.candidateSkills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
            )
          );
        }

        // Filter by visa types
        if (visaTypes && visaTypes.length > 0) {
          filtered = filtered.filter(c =>
            c.candidateCurrentVisa && visaTypes.includes(c.candidateCurrentVisa)
          );
        }

        return filtered;
      }),

    /**
     * Create new candidate (talent)
     */
    create: orgProtectedProcedure
      .input(z.object({
        // Core info
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Valid email required'),
        phone: z.string().optional(),

        // Candidate/bench specialist fields
        candidateSkills: z.array(z.string()).min(1, 'At least one skill required'),
        candidateExperienceYears: z.number().min(0).max(50),
        candidateCurrentVisa: z.enum(['H1B', 'GC', 'USC', 'OPT', 'CPT', 'TN', 'L1', 'EAD', 'Other']),
        candidateVisaExpiry: z.coerce.date().optional(),
        candidateHourlyRate: z.number().min(0).optional(),
        candidateAvailability: z.enum(['immediate', '2_weeks', '1_month']),
        candidateLocation: z.string().optional(),
        candidateWillingToRelocate: z.boolean().default(false),
        candidateResumeUrl: z.string().url().optional(),

        // Optional: link to account
        accountId: z.string().uuid().optional(),
        jobId: z.string().uuid().optional(),
        submissionNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { accountId, jobId, submissionNotes, candidateHourlyRate, phone, ...candidateData } = input;

        // Sanitize phone to E.164 format (remove spaces, dashes, parentheses)
        const sanitizedPhone = phone ? phone.replace(/[\s\-\(\)]/g, '') : null;

        // Get user profile ID - try authId first, then id
        let [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        // Fallback: try by profile id directly
        if (!userProfile) {
          [userProfile] = await db.select({ id: userProfiles.id })
            .from(userProfiles)
            .where(eq(userProfiles.id, userId))
            .limit(1);
        }

        const creatorId = userProfile?.id || null;

        // Check if email already exists
        const [existing] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.email, input.email))
          .limit(1);

        if (existing) {
          throw new Error('A candidate with this email already exists');
        }

        // Create the candidate
        const [newCandidate] = await db.insert(userProfiles).values({
          ...candidateData,
          orgId,
          phone: sanitizedPhone,
          fullName: `${input.firstName} ${input.lastName}`,
          candidateStatus: 'active',
          candidateHourlyRate: candidateHourlyRate ? String(candidateHourlyRate) : null,
          createdBy: creatorId,
        }).returning();

        // If accountId and jobId provided, create a submission to link candidate to job
        if (accountId && jobId) {
          await db.insert(submissions).values({
            orgId,
            jobId,
            candidateId: newCandidate.id,
            accountId,
            status: 'sourced',
            submissionNotes: submissionNotes || `Added via Account Talent Pool`,
            ownerId: creatorId,
            createdBy: creatorId,
          });
        } else if (accountId) {
          // If only accountId, find the first open job for this account to create a submission
          const [firstJob] = await db.select({ id: jobs.id })
            .from(jobs)
            .where(and(
              eq(jobs.orgId, orgId),
              eq(jobs.accountId, accountId),
              eq(jobs.status, 'open')
            ))
            .limit(1);

          if (firstJob) {
            await db.insert(submissions).values({
              orgId,
              jobId: firstJob.id,
              candidateId: newCandidate.id,
              accountId,
              status: 'sourced',
              submissionNotes: submissionNotes || `Added via Account Talent Pool`,
              ownerId: creatorId,
              createdBy: creatorId,
            });
          }
        }

        return newCandidate;
      }),

    /**
     * Update candidate
     */
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        candidateSkills: z.array(z.string()).optional(),
        candidateExperienceYears: z.number().min(0).max(50).optional(),
        candidateCurrentVisa: z.enum(['H1B', 'GC', 'USC', 'OPT', 'CPT', 'TN', 'L1', 'EAD', 'Other']).optional(),
        candidateVisaExpiry: z.coerce.date().optional(),
        candidateHourlyRate: z.number().min(0).optional(),
        candidateAvailability: z.enum(['immediate', '2_weeks', '1_month']).optional(),
        candidateLocation: z.string().optional(),
        candidateWillingToRelocate: z.boolean().optional(),
        candidateResumeUrl: z.string().url().optional(),
        candidateStatus: z.enum(['active', 'placed', 'bench', 'inactive', 'blacklisted']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;
        const { id, candidateHourlyRate, ...data } = input;

        const updateData: Record<string, any> = { ...data, updatedBy: userId };
        if (candidateHourlyRate !== undefined) {
          updateData.candidateHourlyRate = String(candidateHourlyRate);
        }

        const [updated] = await db.update(userProfiles)
          .set(updateData)
          .where(and(
            eq(userProfiles.id, id),
            eq(userProfiles.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Candidate not found');
        }

        return updated;
      }),

    /**
     * Get candidate by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [candidate] = await db.select({
          id: userProfiles.id,
          fullName: userProfiles.fullName,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          email: userProfiles.email,
          phone: userProfiles.phone,
          candidateStatus: userProfiles.candidateStatus,
          candidateSkills: userProfiles.candidateSkills,
          candidateExperienceYears: userProfiles.candidateExperienceYears,
          candidateCurrentVisa: userProfiles.candidateCurrentVisa,
          candidateVisaExpiry: userProfiles.candidateVisaExpiry,
          candidateHourlyRate: userProfiles.candidateHourlyRate,
          candidateAvailability: userProfiles.candidateAvailability,
          candidateLocation: userProfiles.candidateLocation,
          candidateWillingToRelocate: userProfiles.candidateWillingToRelocate,
          candidateResumeUrl: userProfiles.candidateResumeUrl,
          createdAt: userProfiles.createdAt,
        })
          .from(userProfiles)
          .where(and(
            eq(userProfiles.id, input.id),
            eq(userProfiles.orgId, orgId)
          ))
          .limit(1);

        if (!candidate) {
          throw new Error('Candidate not found');
        }

        return candidate;
      }),

    /**
     * Link existing candidate to account (via submission)
     */
    linkToAccount: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        accountId: z.string().uuid(),
        jobId: z.string().uuid().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;
        const { candidateId, accountId, jobId, notes } = input;

        // Verify candidate exists
        const [candidate] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(and(
            eq(userProfiles.id, candidateId),
            eq(userProfiles.orgId, orgId)
          ))
          .limit(1);

        if (!candidate) {
          throw new Error('Candidate not found');
        }

        // Find a job to link to
        let targetJobId = jobId;
        if (!targetJobId) {
          const [firstJob] = await db.select({ id: jobs.id })
            .from(jobs)
            .where(and(
              eq(jobs.orgId, orgId),
              eq(jobs.accountId, accountId),
              eq(jobs.status, 'open')
            ))
            .limit(1);

          if (!firstJob) {
            throw new Error('No open jobs found for this account. Please create a job first.');
          }
          targetJobId = firstJob.id;
        }

        // Check if already linked
        const [existingSubmission] = await db.select({ id: submissions.id })
          .from(submissions)
          .where(and(
            eq(submissions.candidateId, candidateId),
            eq(submissions.jobId, targetJobId)
          ))
          .limit(1);

        if (existingSubmission) {
          throw new Error('Candidate is already linked to this job');
        }

        // Create submission
        const [newSubmission] = await db.insert(submissions).values({
          orgId,
          jobId: targetJobId,
          candidateId,
          accountId,
          status: 'sourced',
          submissionNotes: notes || 'Linked from Account Talent Pool',
          ownerId: userId,
          createdBy: userId,
        }).returning();

        return newSubmission;
      }),
  }),

  // =====================================================
  // SKILLS
  // =====================================================

  skills: router({
    /**
     * Get all skills
     */
    list: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const results = await db.select().from(skills)
          .orderBy(skills.name);

        return results;
      }),

    /**
     * Get candidate skills
     */
    getCandidateSkills: orgProtectedProcedure
      .input(z.object({ candidateId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const results = await db.select()
          .from(candidateSkills)
          .where(eq(candidateSkills.candidateId, input.candidateId));

        return results;
      }),

    /**
     * Add skill to candidate
     */
    addToCandidate: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        skillId: z.string().uuid(),
        proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
        yearsOfExperience: z.number().min(0).max(50),
      }))
      .mutation(async ({ ctx, input }) => {
        const [newSkill] = await db.insert(candidateSkills).values({
          candidateId: input.candidateId,
          skillId: input.skillId,
          proficiencyLevel: input.proficiencyLevel,
          yearsOfExperience: String(input.yearsOfExperience),
        }).returning();

        return newSkill;
      }),
  }),
});
