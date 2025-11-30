/**
 * tRPC Router: ATS Module
 * Handles jobs, submissions, interviews, offers, and placements
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { ownershipProcedure } from '../trpc/middleware';
import { db } from '@/lib/db';
import { ownershipFilterSchema } from '@/lib/validations/ownership';
import { buildOwnershipCondition } from '@/lib/db/queries/ownership-filter';
import {
  jobs,
  submissions,
  interviews,
  offers,
  placements,
  skills,
  candidateSkills,
  candidateResumes,
  addresses,
  candidateWorkAuthorizations,
  candidateEducation,
  candidateWorkHistory,
  candidateCertifications,
  candidateReferences,
  candidateBackgroundChecks,
  candidateComplianceDocuments,
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
  updatePlacementSchema,
  createAddressSchema,
  updateAddressSchema,
  createWorkAuthorizationSchema,
  updateWorkAuthorizationSchema,
  createEducationSchema,
  updateEducationSchema,
  createWorkHistorySchema,
  updateWorkHistorySchema,
  createCertificationSchema,
  updateCertificationSchema,
  createReferenceSchema,
  updateReferenceSchema,
  createBackgroundCheckSchema,
  updateBackgroundCheckSchema,
  createComplianceDocumentSchema,
  updateComplianceDocumentSchema,
  updateCandidateProfileSchema,
} from '@/lib/validations/ats';
import { eq, and, desc, sql, isNull, or, SQL } from 'drizzle-orm';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { accounts } from '@/lib/db/schema/crm';

export const atsRouter = router({
  // =====================================================
  // JOBS
  // =====================================================

  jobs: router({
    /**
     * Get all jobs with optional ownership filtering
     */
    list: ownershipProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'open', 'on_hold', 'filled', 'closed']).optional(),
        clientId: z.string().uuid().optional(),
        ownership: ownershipFilterSchema.optional(),
      }))
      .query(async ({ ctx, input }) => {
        const orgId = ctx.orgId as string;
        const { isManager, managedUserIds } = ctx;
        const profileId = ctx.profileId as string;
        const { limit, offset, status, clientId, ownership } = input;

        const conditions: SQL<unknown>[] = [eq(jobs.orgId, orgId) as SQL<unknown>];
        if (status) conditions.push(eq(jobs.status, status) as SQL<unknown>);
        if (clientId) conditions.push(eq(jobs.accountId, clientId) as SQL<unknown>);

        // Apply ownership filter if specified
        if (ownership) {
          const ownershipCondition = await buildOwnershipCondition(
            { userId: profileId, orgId, isManager: isManager ?? false, managedUserIds },
            'job',
            { id: jobs.id as unknown as SQL<unknown>, ownerId: jobs.ownerId as unknown as SQL<unknown> },
            ownership
          );
          conditions.push(ownershipCondition);
        }

        const results = await db.select().from(jobs)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
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

        if (!userId) {
          throw new Error('User context missing');
        }

        // Extract rate fields that need string conversion for numeric columns
        const { rateMin, rateMax, ownerId, ...rest } = input;

        const jobValues: typeof jobs.$inferInsert = {
          ...rest,
          orgId,
          ownerId: ownerId ?? userId,
          createdBy: userId,
          ...(rateMin !== undefined && { rateMin: String(rateMin) }),
          ...(rateMax !== undefined && { rateMax: String(rateMax) }),
        };

        const [newJob] = await db.insert(jobs).values(jobValues).returning();

        return newJob;
      }),

    /**
     * Update job
     */
    update: orgProtectedProcedure
      .input(updateJobSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, rateMin, rateMax, ...data } = input;

        const [updated] = await db.update(jobs)
          .set({
            ...data,
            ...(rateMin !== undefined && { rateMin: String(rateMin) }),
            ...(rateMax !== undefined && { rateMax: String(rateMax) }),
          })
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
     * Get all submissions with optional ownership filtering
     */
    list: ownershipProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
        jobId: z.string().uuid().optional(),
        candidateId: z.string().uuid().optional(),
        ownership: ownershipFilterSchema.optional(),
      }))
      .query(async ({ ctx, input }) => {
        const orgId = ctx.orgId as string;
        const { isManager, managedUserIds } = ctx;
        const profileId = ctx.profileId as string;
        const { limit, offset, status, jobId, candidateId, ownership } = input;

        const conditions: SQL<unknown>[] = [eq(submissions.orgId, orgId) as SQL<unknown>];
        if (status) conditions.push(eq(submissions.status, status) as SQL<unknown>);
        if (jobId) conditions.push(eq(submissions.jobId, jobId) as SQL<unknown>);
        if (candidateId) conditions.push(eq(submissions.candidateId, candidateId) as SQL<unknown>);

        // Apply ownership filter if specified
        if (ownership) {
          const ownershipCondition = await buildOwnershipCondition(
            { userId: profileId, orgId, isManager: isManager ?? false, managedUserIds },
            'submission',
            { id: submissions.id as unknown as SQL<unknown>, ownerId: submissions.ownerId as unknown as SQL<unknown> },
            ownership
          );
          conditions.push(ownershipCondition);
        }

        const results = await db.select().from(submissions)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .limit(limit)
          .offset(offset)
          .orderBy(desc(submissions.createdAt));

        return results;
      }),

    /**
     * Get submission by ID with candidate, job, account, and interviews
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

        // Fetch related candidate
        let candidate = null;
        if (submission.candidateId) {
          const [candidateData] = await db.select({
            id: userProfiles.id,
            firstName: userProfiles.firstName,
            lastName: userProfiles.lastName,
            email: userProfiles.email,
            phone: userProfiles.phone,
            avatarUrl: userProfiles.avatarUrl,
            title: userProfiles.title,
            candidateLocation: userProfiles.candidateLocation,
            candidateCurrentVisa: userProfiles.candidateCurrentVisa,
            candidateExperienceYears: userProfiles.candidateExperienceYears,
            candidateHourlyRate: userProfiles.candidateHourlyRate,
            candidateSkills: userProfiles.candidateSkills,
            candidateResumeUrl: userProfiles.candidateResumeUrl,
            candidateAvailability: userProfiles.candidateAvailability,
          }).from(userProfiles)
            .where(eq(userProfiles.id, submission.candidateId))
            .limit(1);
          candidate = candidateData || null;
        }

        // Fetch related job with account info
        let job = null;
        let account = null;
        if (submission.jobId) {
          const [jobData] = await db.select({
            id: jobs.id,
            title: jobs.title,
            location: jobs.location,
            status: jobs.status,
            rateMin: jobs.rateMin,
            rateMax: jobs.rateMax,
            rateType: jobs.rateType,
            jobType: jobs.jobType,
            isRemote: jobs.isRemote,
            accountId: jobs.accountId,
            clientSubmissionInstructions: jobs.clientSubmissionInstructions,
            clientInterviewProcess: jobs.clientInterviewProcess,
          }).from(jobs)
            .where(eq(jobs.id, submission.jobId))
            .limit(1);
          job = jobData || null;

          // Fetch account if available
          if (jobData?.accountId) {
            const [accountData] = await db.select({
              id: accounts.id,
              name: accounts.name,
              companyType: accounts.companyType,
            }).from(accounts)
              .where(eq(accounts.id, jobData.accountId))
              .limit(1);
            account = accountData || null;
          }
        }

        // Fetch related interviews
        const submissionInterviews = await db.select().from(interviews)
          .where(eq(interviews.submissionId, input.id))
          .orderBy(desc(interviews.scheduledAt));

        // Fetch related offers
        const submissionOffers = await db.select().from(offers)
          .where(eq(offers.submissionId, input.id))
          .orderBy(desc(offers.createdAt));

        return {
          ...submission,
          candidate,
          job,
          account,
          interviews: submissionInterviews,
          offers: submissionOffers,
        };
      }),

    /**
     * Create new submission
     */
    create: orgProtectedProcedure
      .input(createSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.userId as string;
        const orgId = ctx.orgId as string;

        // Get user profile ID from auth ID
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(
            eq(userProfiles.authId, userId) as SQL<unknown>,
            eq(userProfiles.id, userId) as SQL<unknown>
          ))
          .limit(1);

        const ownerId = userProfile?.id ?? userId;

        // Extract fields that need conversion
        const { submittedRate, ...rest } = input;

        const [newSubmission] = await db.insert(submissions).values({
          ...rest,
          orgId,
          ownerId,
          ...(submittedRate !== undefined && { submittedRate: String(submittedRate) }),
        }).returning();

        return newSubmission;
      }),

    /**
     * Update submission
     */
    update: orgProtectedProcedure
      .input(updateSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, submittedRate, ...data } = input;

        const updateData = {
          ...data,
          ...(submittedRate !== undefined && { submittedRate: String(submittedRate) }),
        };

        const [updated] = await db.update(submissions)
          .set(updateData)
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
     * Update submission status with stage-specific data
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
     * Transition submission to vendor pending stage
     */
    submitToVendor: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        notes: z.string().optional(),
        submittedRate: z.number().optional(),
        submittedRateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orgId = ctx.orgId as string;
        const userId = ctx.userId as string;
        const { id, notes, submittedRate, submittedRateType } = input;

        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(
            eq(userProfiles.authId, userId) as SQL<unknown>,
            eq(userProfiles.id, userId) as SQL<unknown>
          ))
          .limit(1);

        const updateData: Record<string, unknown> = {
            status: 'vendor_pending',
            vendorSubmittedAt: new Date(),
            vendorSubmittedBy: userProfile?.id ?? userId,
            vendorDecision: 'pending',
            vendorNotes: notes,
            submittedRateType: submittedRateType,
            updatedAt: new Date(),
          };
        if (submittedRate) updateData.submittedRate = String(submittedRate);

        const [updated] = await db.update(submissions)
          .set(updateData)
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
     * Record vendor decision (accept/reject)
     */
    recordVendorDecision: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        decision: z.enum(['accepted', 'rejected']),
        notes: z.string().optional(),
        screeningNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orgId = ctx.orgId as string;
        const userId = ctx.userId as string;
        const { id, decision, notes, screeningNotes } = input;

        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(
            eq(userProfiles.authId, userId) as SQL<unknown>,
            eq(userProfiles.id, userId) as SQL<unknown>
          ))
          .limit(1);

        const newStatus = decision === 'accepted' ? 'vendor_accepted' : 'vendor_rejected';

        const updateData: Record<string, unknown> = {
            status: newStatus,
            vendorDecision: decision,
            vendorDecisionAt: new Date(),
            vendorDecisionBy: userProfile?.id ?? userId,
            vendorNotes: notes,
            vendorScreeningNotes: screeningNotes,
            vendorScreeningCompletedAt: new Date(),
            // If rejected, set rejection info
            ...(decision === 'rejected' ? {
              rejectedAt: new Date(),
              rejectionReason: notes ?? 'Rejected by vendor',
              rejectionSource: 'vendor',
            } : {}),
            updatedAt: new Date(),
          };

        const [updated] = await db.update(submissions)
          .set(updateData)
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
     * Submit to client
     */
    submitToClient: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        notes: z.string().optional(),
        submittedRate: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orgId = ctx.orgId as string;
        const userId = ctx.userId as string;
        const { id, notes, submittedRate } = input;

        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(
            eq(userProfiles.authId, userId) as SQL<unknown>,
            eq(userProfiles.id, userId) as SQL<unknown>
          ))
          .limit(1);

        const updateData: Record<string, unknown> = {
            status: 'submitted_to_client',
            submittedToClientAt: new Date(),
            submittedToClientBy: userProfile?.id ?? userId,
            clientDecision: 'pending',
            submissionNotes: notes,
            updatedAt: new Date(),
          };
        if (submittedRate) updateData.submittedRate = String(submittedRate);

        const [updated] = await db.update(submissions)
          .set(updateData)
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
     * Record client decision (accept/reject)
     */
    recordClientDecision: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        decision: z.enum(['accepted', 'rejected']),
        notes: z.string().optional(),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, decision, notes, feedback } = input;

        const newStatus = decision === 'accepted' ? 'client_accepted' : 'client_rejected';

        const [updated] = await db.update(submissions)
          .set({
            status: newStatus,
            clientDecision: decision,
            clientDecisionAt: new Date(),
            clientDecisionNotes: notes,
            interviewFeedback: feedback,
            // If rejected, set rejection info
            ...(decision === 'rejected' ? {
              rejectedAt: new Date(),
              rejectionReason: notes || feedback || 'Rejected by client',
              rejectionSource: 'client',
            } : {}),
            updatedAt: new Date(),
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
     * Move to interview stage
     */
    moveToInterview: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(submissions)
          .set({
            status: 'client_interview',
            updatedAt: new Date(),
          })
          .where(and(
            eq(submissions.id, input.id),
            eq(submissions.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Submission not found');
        }

        return updated;
      }),

    /**
     * Move to offer stage
     */
    moveToOffer: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(submissions)
          .set({
            status: 'offer_stage',
            offerExtendedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(submissions.id, input.id),
            eq(submissions.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Submission not found');
        }

        return updated;
      }),

    /**
     * Mark as placed
     */
    markPlaced: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(submissions)
          .set({
            status: 'placed',
            offerAcceptedAt: new Date(),
            submissionNotes: input.notes,
            updatedAt: new Date(),
          })
          .where(and(
            eq(submissions.id, input.id),
            eq(submissions.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Submission not found');
        }

        return updated;
      }),

    /**
     * Withdraw submission
     */
    withdraw: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(submissions)
          .set({
            status: 'withdrawn',
            rejectionReason: input.reason,
            rejectionSource: 'candidate',
            rejectedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(submissions.id, input.id),
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

        const conditions = [eq(interviews.orgId, orgId)];
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

        const conditions: SQL<unknown>[] = [eq(offers.orgId, orgId)];
        if (status) conditions.push(eq(offers.status, status));
        if (submissionId) conditions.push(eq(offers.submissionId, submissionId));

        const results = await db.select().from(offers)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
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

        if (!userId) {
          throw new Error('User context missing');
        }

        const { billRate, benefits, ...offerData } = input;
        const normalizedBenefits = Array.isArray(benefits) ? benefits.join(', ') : benefits ?? null;

        const offerValues: typeof offers.$inferInsert = {
          ...offerData,
          benefits: normalizedBenefits,
          rate: billRate !== undefined ? String(billRate) : '0',
          orgId,
          createdBy: userId,
        };

        const [newOffer] = await db.insert(offers).values(offerValues).returning();

        return newOffer;
      }),

    /**
     * Update offer
     */
    update: orgProtectedProcedure
      .input(updateOfferSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, billRate, benefits, ...data } = input;

        const updateData = {
          ...data,
          ...(billRate !== undefined && { rate: String(billRate) }),
          ...(benefits !== undefined && { benefits: Array.isArray(benefits) ? benefits.join(', ') : benefits }),
        };

        const [updated] = await db.update(offers)
          .set(updateData)
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

        const conditions: SQL<unknown>[] = [eq(placements.orgId, orgId)];
        if (status) conditions.push(eq(placements.status, status));
        if (candidateId) conditions.push(eq(placements.candidateId, candidateId));

        const results = await db.select().from(placements)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
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

        if (!userId) {
          throw new Error('User context missing');
        }

        const { billRate, payRate, ...rest } = input;
        const basePlacement = rest as unknown as typeof placements.$inferInsert;

        const placementValues: typeof placements.$inferInsert = {
          ...basePlacement,
          recruiterId: userId,
          billRate: billRate !== undefined && billRate !== null ? String(billRate) : '0',
          payRate: payRate !== undefined && payRate !== null ? String(payRate) : '0',
          orgId,
          createdBy: userId,
        };

        const [newPlacement] = await db.insert(placements).values(placementValues).returning();

        return newPlacement;
      }),

    /**
     * Update placement
     */
    update: orgProtectedProcedure
      .input(updatePlacementSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, billRate, payRate, ...data } = input;

        const updateData = {
          ...data,
          ...(billRate !== undefined && { billRate: String(billRate) }),
          ...(payRate !== undefined && { payRate: String(payRate) }),
        };

        const [updated] = await db.update(placements)
          .set(updateData)
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
     * Get all candidates/talent with optional ownership filtering
     */
    list: ownershipProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
        ownership: ownershipFilterSchema.optional(),
      }))
      .query(async ({ ctx, input }) => {
        const orgId = ctx.orgId as string;
        const { isManager, managedUserIds } = ctx;
        const profileId = ctx.profileId as string;
        const { limit, offset, status, ownership } = input;

        const conditions: SQL<unknown>[] = [
          eq(userProfiles.orgId, orgId) as SQL<unknown>,
          isNull(userProfiles.deletedAt) as SQL<unknown>,
        ];

        // Filter by candidate status if specified
        if (status) {
          conditions.push(eq(userProfiles.candidateStatus, status) as SQL<unknown>);
        } else {
          // By default, only show profiles with candidate status set (actual candidates)
          const statusCondition = or(
            eq(userProfiles.candidateStatus, 'active') as SQL<unknown>,
            eq(userProfiles.candidateStatus, 'bench') as SQL<unknown>,
            eq(userProfiles.candidateStatus, 'placed') as SQL<unknown>,
            eq(userProfiles.candidateStatus, 'inactive') as SQL<unknown>
          );
          if (statusCondition) conditions.push(statusCondition);
        }

        // Apply ownership filter if specified
        if (ownership) {
          const ownershipCondition = await buildOwnershipCondition(
            { userId: profileId, orgId, isManager: isManager ?? false, managedUserIds },
            'candidate',
            { id: userProfiles.id as unknown as SQL<unknown>, ownerId: userProfiles.createdBy as unknown as SQL<unknown> },
            ownership
          );
          conditions.push(ownershipCondition);
        }

        const results = await db.select({
          id: userProfiles.id,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          fullName: userProfiles.fullName,
          email: userProfiles.email,
          phone: userProfiles.phone,
          title: userProfiles.title,
          status: userProfiles.candidateStatus,
          location: userProfiles.candidateLocation,
          visaStatus: userProfiles.candidateCurrentVisa,
          skills: userProfiles.candidateSkills,
          experienceYears: userProfiles.candidateExperienceYears,
          availability: userProfiles.candidateAvailability,
          hourlyRate: userProfiles.candidateHourlyRate,
          createdAt: userProfiles.createdAt,
        })
          .from(userProfiles)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .limit(limit)
          .offset(offset)
          .orderBy(desc(userProfiles.createdAt));

        return results;
      }),

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

        const conditions = [
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
        const userId = ctx.userId as string;
        const orgId = ctx.orgId as string;
        const { accountId, jobId, submissionNotes, candidateHourlyRate, phone, ...candidateData } = input;

        // Sanitize phone to E.164 format (remove spaces, dashes, parentheses)
        const sanitizedPhone = phone ? phone.replace(/[\s\-\(\)]/g, '') : null;

        // Get user profile ID - try authId first, then id
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(
            eq(userProfiles.authId, userId) as SQL<unknown>,
            eq(userProfiles.id, userId) as SQL<unknown>
          ))
          .limit(1);

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
            submissionNotes: submissionNotes ?? `Added via Account Talent Pool`,
            ownerId: creatorId ?? userId,
            createdBy: creatorId ?? userId,
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
              submissionNotes: submissionNotes ?? `Added via Account Talent Pool`,
              ownerId: creatorId ?? userId,
              createdBy: creatorId ?? userId,
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

        const updateData: Record<string, unknown> = { ...data, updatedBy: userId };
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
          avatarUrl: userProfiles.avatarUrl,
          timezone: userProfiles.timezone,
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
          candidateBenchStartDate: userProfiles.candidateBenchStartDate,
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
     * Get full candidate profile with all related data for editing
     */
    getFullProfile: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Get candidate profile with all fields
        const [candidate] = await db.select().from(userProfiles)
          .where(and(
            eq(userProfiles.id, input.id),
            eq(userProfiles.orgId, orgId)
          ))
          .limit(1);

        if (!candidate) {
          throw new Error('Candidate not found');
        }

        // Fetch all related data in parallel
        const [
          candidateAddresses,
          workAuths,
          educationRecords,
          workHistoryRecords,
          certificationRecords,
          referenceRecords,
          backgroundCheckRecords,
          complianceDocRecords,
          resumeRecords,
        ] = await Promise.all([
          // Addresses
          db.select().from(addresses)
            .where(and(
              eq(addresses.orgId, orgId),
              eq(addresses.entityType, 'candidate'),
              eq(addresses.entityId, input.id),
            ))
            .orderBy(desc(addresses.isPrimary), desc(addresses.createdAt)),

          // Work Authorizations
          db.select().from(candidateWorkAuthorizations)
            .where(and(
              eq(candidateWorkAuthorizations.orgId, orgId),
              eq(candidateWorkAuthorizations.candidateId, input.id),
            ))
            .orderBy(desc(candidateWorkAuthorizations.isPrimary), desc(candidateWorkAuthorizations.createdAt)),

          // Education
          db.select().from(candidateEducation)
            .where(and(
              eq(candidateEducation.orgId, orgId),
              eq(candidateEducation.candidateId, input.id),
            ))
            .orderBy(desc(candidateEducation.isHighestDegree), desc(candidateEducation.endDate)),

          // Work History
          db.select().from(candidateWorkHistory)
            .where(and(
              eq(candidateWorkHistory.orgId, orgId),
              eq(candidateWorkHistory.candidateId, input.id),
            ))
            .orderBy(desc(candidateWorkHistory.isCurrent), desc(candidateWorkHistory.startDate)),

          // Certifications
          db.select().from(candidateCertifications)
            .where(and(
              eq(candidateCertifications.orgId, orgId),
              eq(candidateCertifications.candidateId, input.id),
            ))
            .orderBy(desc(candidateCertifications.issueDate)),

          // References
          db.select().from(candidateReferences)
            .where(and(
              eq(candidateReferences.orgId, orgId),
              eq(candidateReferences.candidateId, input.id),
            ))
            .orderBy(desc(candidateReferences.createdAt)),

          // Background Checks
          db.select().from(candidateBackgroundChecks)
            .where(and(
              eq(candidateBackgroundChecks.orgId, orgId),
              eq(candidateBackgroundChecks.candidateId, input.id),
            ))
            .orderBy(desc(candidateBackgroundChecks.createdAt)),

          // Compliance Documents
          db.select().from(candidateComplianceDocuments)
            .where(and(
              eq(candidateComplianceDocuments.orgId, orgId),
              eq(candidateComplianceDocuments.candidateId, input.id),
            ))
            .orderBy(candidateComplianceDocuments.requiredBy, desc(candidateComplianceDocuments.createdAt)),

          // Resumes
          db.select().from(candidateResumes)
            .where(and(
              eq(candidateResumes.orgId, orgId),
              eq(candidateResumes.candidateId, input.id),
              eq(candidateResumes.isArchived, false),
            ))
            .orderBy(desc(candidateResumes.isLatest), desc(candidateResumes.version)),
        ]);

        return {
          ...candidate,
          addresses: candidateAddresses,
          workAuthorizations: workAuths,
          education: educationRecords,
          workHistory: workHistoryRecords,
          certifications: certificationRecords,
          references: referenceRecords,
          backgroundChecks: backgroundCheckRecords,
          complianceDocuments: complianceDocRecords,
          resumes: resumeRecords,
        };
      }),

    /**
     * Update candidate profile (enhanced with all new fields)
     */
    updateProfile: orgProtectedProcedure
      .input(updateCandidateProfileSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, candidateHourlyRate, minimumHourlyRate, desiredSalaryAnnual, minimumAnnualSalary, ...data } = input;

        // Convert numeric fields to strings for DB
        const updateData: Record<string, unknown> = {
          ...data,
          updatedBy: userId,
          updatedAt: new Date(),
          lastProfileUpdate: new Date(),
        };

        // Handle numeric conversions
        if (candidateHourlyRate !== undefined) {
          updateData.candidateHourlyRate = String(candidateHourlyRate);
        }
        if (minimumHourlyRate !== undefined) {
          updateData.minimumHourlyRate = String(minimumHourlyRate);
        }
        if (desiredSalaryAnnual !== undefined) {
          updateData.desiredSalaryAnnual = String(desiredSalaryAnnual);
        }
        if (minimumAnnualSalary !== undefined) {
          updateData.minimumAnnualSalary = String(minimumAnnualSalary);
        }

        // Update fullName if first/last name changed
        if (data.firstName || data.lastName) {
          const [existing] = await db.select({
            firstName: userProfiles.firstName,
            lastName: userProfiles.lastName,
          })
            .from(userProfiles)
            .where(eq(userProfiles.id, id))
            .limit(1);

          if (existing) {
            const newFirstName = data.firstName || existing.firstName || '';
            const newLastName = data.lastName || existing.lastName || '';
            updateData.fullName = `${newFirstName} ${newLastName}`.trim();
          }
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
          submissionNotes: notes ?? 'Linked from Account Talent Pool',
          ownerId: userId as string,
          createdBy: userId as string,
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
      .query(async () => {
        const results = await db.select().from(skills)
          .orderBy(skills.name);

        return results;
      }),

    /**
     * Get candidate skills
     */
    getCandidateSkills: orgProtectedProcedure
      .input(z.object({ candidateId: z.string().uuid() }))
      .query(async ({ input }) => {
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
      .mutation(async ({ input }) => {
        const [newSkill] = await db.insert(candidateSkills).values({
          candidateId: input.candidateId,
          skillId: input.skillId,
          proficiencyLevel: input.proficiencyLevel,
          yearsOfExperience: String(input.yearsOfExperience),
        }).returning();

        return newSkill;
      }),
  }),

  // =====================================================
  // RESUMES - Resume Versioning System
  // =====================================================

  resumes: router({
    /**
     * Get all resumes for a candidate
     */
    list: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        includeArchived: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { candidateId, includeArchived } = input;

        const conditions = [
          eq(candidateResumes.orgId, orgId),
          eq(candidateResumes.candidateId, candidateId),
        ];

        if (!includeArchived) {
          conditions.push(eq(candidateResumes.isArchived, false));
        }

        const results = await db.select()
          .from(candidateResumes)
          .where(and(...conditions))
          .orderBy(desc(candidateResumes.version));

        return results;
      }),

    /**
     * Get latest resume for a candidate
     */
    getLatest: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        resumeType: z.enum(['master', 'formatted', 'client_specific']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { candidateId, resumeType } = input;

        const conditions = [
          eq(candidateResumes.orgId, orgId),
          eq(candidateResumes.candidateId, candidateId),
          eq(candidateResumes.isLatest, true),
          eq(candidateResumes.isArchived, false),
        ];

        if (resumeType) {
          conditions.push(eq(candidateResumes.resumeType, resumeType));
        }

        const [resume] = await db.select()
          .from(candidateResumes)
          .where(and(...conditions))
          .limit(1);

        return resume || null;
      }),

    /**
     * Create a new resume version
     */
    create: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        bucket: z.string().default('resumes'),
        filePath: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        resumeType: z.enum(['master', 'formatted', 'client_specific']).default('master'),
        title: z.string().optional(),
        notes: z.string().optional(),
        parsedContent: z.string().optional(),
        parsedSkills: z.array(z.string()).optional(),
        aiSummary: z.string().optional(),
        submissionWriteUp: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        if (!userId) {
          throw new Error('User context missing');
        }

        const { candidateId, resumeType, bucket, filePath, fileName, fileSize, mimeType, title, notes, parsedContent, parsedSkills, aiSummary, submissionWriteUp } = input;

        // Get the current latest version for this resume type
        const [currentLatest] = await db.select()
          .from(candidateResumes)
          .where(and(
            eq(candidateResumes.orgId, orgId),
            eq(candidateResumes.candidateId, candidateId),
            eq(candidateResumes.resumeType, resumeType),
            eq(candidateResumes.isLatest, true),
            eq(candidateResumes.isArchived, false),
          ))
          .limit(1);

        const newVersion = currentLatest ? currentLatest.version + 1 : 1;

        // Mark previous version as not latest
        if (currentLatest) {
          await db.update(candidateResumes)
            .set({ isLatest: false, updatedAt: new Date() })
            .where(eq(candidateResumes.id, currentLatest.id));
        }

        // Create new version
        const resumeValues: typeof candidateResumes.$inferInsert = {
          orgId,
          candidateId,
          version: newVersion,
          isLatest: true,
          previousVersionId: currentLatest?.id ?? null,
          resumeType: resumeType,
          bucket,
          filePath,
          fileName,
          fileSize: typeof fileSize === 'number' ? fileSize : Number(fileSize),
          mimeType,
          ...(title !== undefined && { title }),
          ...(notes !== undefined && { notes }),
          ...(parsedContent !== undefined && { parsedContent }),
          ...(parsedSkills !== undefined && { parsedSkills }),
          ...(aiSummary !== undefined && { aiSummary }),
          ...(submissionWriteUp !== undefined && { submissionWriteUp }),
          uploadedBy: userId,
        };

        const [newResume] = await db.insert(candidateResumes).values(resumeValues).returning();

        return newResume;
      }),

    /**
     * Update resume metadata
     */
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        notes: z.string().optional(),
        parsedContent: z.string().optional(),
        parsedSkills: z.array(z.string()).optional(),
        aiSummary: z.string().optional(),
        submissionWriteUp: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...updates } = input;

        const [updated] = await db.update(candidateResumes)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateResumes.id, id),
            eq(candidateResumes.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Resume not found');
        }

        return updated;
      }),

    /**
     * Archive a resume (soft delete - never truly delete)
     */
    archive: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [archived] = await db.update(candidateResumes)
          .set({
            isArchived: true,
            archivedAt: new Date(),
            archivedBy: userId,
            isLatest: false,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateResumes.id, input.id),
            eq(candidateResumes.orgId, orgId),
          ))
          .returning();

        if (!archived) {
          throw new Error('Resume not found');
        }

        // If this was the latest, find the next most recent to mark as latest
        if (archived.isLatest) {
          const [nextLatest] = await db.select()
            .from(candidateResumes)
            .where(and(
              eq(candidateResumes.candidateId, archived.candidateId),
              eq(candidateResumes.resumeType, archived.resumeType || 'master'),
              eq(candidateResumes.isArchived, false),
            ))
            .orderBy(desc(candidateResumes.version))
            .limit(1);

          if (nextLatest) {
            await db.update(candidateResumes)
              .set({ isLatest: true, updatedAt: new Date() })
              .where(eq(candidateResumes.id, nextLatest.id));
          }
        }

        return archived;
      }),

    /**
     * Restore an archived resume
     */
    restore: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [restored] = await db.update(candidateResumes)
          .set({
            isArchived: false,
            archivedAt: null,
            archivedBy: null,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateResumes.id, input.id),
            eq(candidateResumes.orgId, orgId),
          ))
          .returning();

        if (!restored) {
          throw new Error('Resume not found');
        }

        return restored;
      }),
  }),

  // =====================================================
  // ADDRESSES (Global Multi-Country Support)
  // =====================================================

  addresses: router({
    /**
     * List addresses for an entity
     */
    list: orgProtectedProcedure
      .input(z.object({
        entityType: z.enum(['candidate', 'account', 'contact', 'vendor']),
        entityId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const results = await db.select().from(addresses)
          .where(and(
            eq(addresses.orgId, orgId),
            eq(addresses.entityType, input.entityType),
            eq(addresses.entityId, input.entityId),
          ))
          .orderBy(desc(addresses.isPrimary), desc(addresses.createdAt));

        return results;
      }),

    /**
     * Get address by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [address] = await db.select().from(addresses)
          .where(and(
            eq(addresses.id, input.id),
            eq(addresses.orgId, orgId),
          ))
          .limit(1);

        if (!address) {
          throw new Error('Address not found');
        }

        return address;
      }),

    /**
     * Create address
     */
    create: orgProtectedProcedure
      .input(createAddressSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // If setting as primary, unset other primary addresses for this entity
        if (input.isPrimary) {
          await db.update(addresses)
            .set({ isPrimary: false })
            .where(and(
              eq(addresses.orgId, orgId),
              eq(addresses.entityType, input.entityType),
              eq(addresses.entityId, input.entityId),
              eq(addresses.addressType, input.addressType),
            ));
        }

        const [newAddress] = await db.insert(addresses).values({
          ...(input as typeof addresses.$inferInsert),
          orgId,
          createdBy: userId,
        }).returning();

        return newAddress;
      }),

    /**
     * Update address
     */
    update: orgProtectedProcedure
      .input(updateAddressSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        // If setting as primary, unset other primary addresses
        if (data.isPrimary) {
          const [existing] = await db.select().from(addresses)
            .where(eq(addresses.id, id))
            .limit(1);

          if (existing) {
            await db.update(addresses)
              .set({ isPrimary: false })
              .where(and(
                eq(addresses.orgId, orgId),
                eq(addresses.entityType, existing.entityType),
                eq(addresses.entityId, existing.entityId),
                eq(addresses.addressType, existing.addressType),
              ));
          }
        }

        const [updated] = await db.update(addresses)
          .set({ ...(data as Partial<typeof addresses.$inferInsert>), updatedBy: userId, updatedAt: new Date() })
          .where(and(
            eq(addresses.id, id),
            eq(addresses.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Address not found');
        }

        return updated;
      }),

    /**
     * Delete address (hard delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deleted] = await db.delete(addresses)
          .where(and(
            eq(addresses.id, input.id),
            eq(addresses.orgId, orgId),
          ))
          .returning();

        if (!deleted) {
          throw new Error('Address not found');
        }

        return deleted;
      }),
  }),

  // =====================================================
  // WORK AUTHORIZATIONS (Visa, I-9, EAD Tracking)
  // =====================================================

  workAuthorizations: router({
    /**
     * List work authorizations for a candidate
     */
    list: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        countryCode: z.string().length(2).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions = [
          eq(candidateWorkAuthorizations.orgId, orgId),
          eq(candidateWorkAuthorizations.candidateId, input.candidateId),
        ];

        if (input.countryCode) {
          conditions.push(eq(candidateWorkAuthorizations.countryCode, input.countryCode));
        }

        const results = await db.select().from(candidateWorkAuthorizations)
          .where(and(...conditions))
          .orderBy(desc(candidateWorkAuthorizations.isPrimary), desc(candidateWorkAuthorizations.createdAt));

        return results;
      }),

    /**
     * Get work authorization by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [auth] = await db.select().from(candidateWorkAuthorizations)
          .where(and(
            eq(candidateWorkAuthorizations.id, input.id),
            eq(candidateWorkAuthorizations.orgId, orgId),
          ))
          .limit(1);

        if (!auth) {
          throw new Error('Work authorization not found');
        }

        return auth;
      }),

    /**
     * Create work authorization
     */
    create: orgProtectedProcedure
      .input(createWorkAuthorizationSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newAuth] = await db.insert(candidateWorkAuthorizations).values({
          ...(input as unknown as typeof candidateWorkAuthorizations.$inferInsert),
          orgId,
          createdBy: userId,
        }).returning();

        return newAuth;
      }),

    /**
     * Update work authorization
     */
    update: orgProtectedProcedure
      .input(updateWorkAuthorizationSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(candidateWorkAuthorizations)
          .set({ ...(data as Partial<typeof candidateWorkAuthorizations.$inferInsert>), updatedBy: userId, updatedAt: new Date() })
          .where(and(
            eq(candidateWorkAuthorizations.id, id),
            eq(candidateWorkAuthorizations.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Work authorization not found');
        }

        return updated;
      }),

    /**
     * Delete work authorization (hard delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deleted] = await db.delete(candidateWorkAuthorizations)
          .where(and(
            eq(candidateWorkAuthorizations.id, input.id),
            eq(candidateWorkAuthorizations.orgId, orgId),
          ))
          .returning();

        if (!deleted) {
          throw new Error('Work authorization not found');
        }

        return deleted;
      }),
  }),

  // =====================================================
  // EDUCATION
  // =====================================================

  education: router({
    /**
     * List education for a candidate
     */
    list: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const results = await db.select().from(candidateEducation)
          .where(and(
            eq(candidateEducation.orgId, orgId),
            eq(candidateEducation.candidateId, input.candidateId),
          ))
          .orderBy(desc(candidateEducation.isHighestDegree), desc(candidateEducation.endDate));

        return results;
      }),

    /**
     * Get education by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [edu] = await db.select().from(candidateEducation)
          .where(and(
            eq(candidateEducation.id, input.id),
            eq(candidateEducation.orgId, orgId),
          ))
          .limit(1);

        if (!edu) {
          throw new Error('Education record not found');
        }

        return edu;
      }),

    /**
     * Create education
     */
    create: orgProtectedProcedure
      .input(createEducationSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newEdu] = await db.insert(candidateEducation).values({
          ...(input as unknown as typeof candidateEducation.$inferInsert),
          orgId,
          createdBy: userId,
        }).returning();

        return newEdu;
      }),

    /**
     * Update education
     */
    update: orgProtectedProcedure
      .input(updateEducationSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(candidateEducation)
          .set({ ...(data as Partial<typeof candidateEducation.$inferInsert>), updatedBy: userId, updatedAt: new Date() })
          .where(and(
            eq(candidateEducation.id, id),
            eq(candidateEducation.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Education record not found');
        }

        return updated;
      }),

    /**
     * Delete education (hard delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deleted] = await db.delete(candidateEducation)
          .where(and(
            eq(candidateEducation.id, input.id),
            eq(candidateEducation.orgId, orgId),
          ))
          .returning();

        if (!deleted) {
          throw new Error('Education record not found');
        }

        return deleted;
      }),
  }),

  // =====================================================
  // WORK HISTORY
  // =====================================================

  workHistory: router({
    /**
     * List work history for a candidate
     */
    list: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const results = await db.select().from(candidateWorkHistory)
          .where(and(
            eq(candidateWorkHistory.orgId, orgId),
            eq(candidateWorkHistory.candidateId, input.candidateId),
          ))
          .orderBy(desc(candidateWorkHistory.isCurrent), desc(candidateWorkHistory.startDate));

        return results;
      }),

    /**
     * Get work history by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [work] = await db.select().from(candidateWorkHistory)
          .where(and(
            eq(candidateWorkHistory.id, input.id),
            eq(candidateWorkHistory.orgId, orgId),
          ))
          .limit(1);

        if (!work) {
          throw new Error('Work history record not found');
        }

        return work;
      }),

    /**
     * Create work history
     */
    create: orgProtectedProcedure
      .input(createWorkHistorySchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newWork] = await db.insert(candidateWorkHistory).values({
          ...(input as unknown as typeof candidateWorkHistory.$inferInsert),
          orgId,
          createdBy: userId,
        }).returning();

        return newWork;
      }),

    /**
     * Update work history
     */
    update: orgProtectedProcedure
      .input(updateWorkHistorySchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(candidateWorkHistory)
          .set({ ...(data as Partial<typeof candidateWorkHistory.$inferInsert>), updatedBy: userId, updatedAt: new Date() })
          .where(and(
            eq(candidateWorkHistory.id, id),
            eq(candidateWorkHistory.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Work history record not found');
        }

        return updated;
      }),

    /**
     * Delete work history (hard delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deleted] = await db.delete(candidateWorkHistory)
          .where(and(
            eq(candidateWorkHistory.id, input.id),
            eq(candidateWorkHistory.orgId, orgId),
          ))
          .returning();

        if (!deleted) {
          throw new Error('Work history record not found');
        }

        return deleted;
      }),
  }),

  // =====================================================
  // CERTIFICATIONS
  // =====================================================

  certifications: router({
    /**
     * List certifications for a candidate
     */
    list: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const results = await db.select().from(candidateCertifications)
          .where(and(
            eq(candidateCertifications.orgId, orgId),
            eq(candidateCertifications.candidateId, input.candidateId),
          ))
          .orderBy(desc(candidateCertifications.issueDate));

        return results;
      }),

    /**
     * Get certification by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [cert] = await db.select().from(candidateCertifications)
          .where(and(
            eq(candidateCertifications.id, input.id),
            eq(candidateCertifications.orgId, orgId),
          ))
          .limit(1);

        if (!cert) {
          throw new Error('Certification not found');
        }

        return cert;
      }),

    /**
     * Create certification
     */
    create: orgProtectedProcedure
      .input(createCertificationSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newCert] = await db.insert(candidateCertifications).values({
          ...(input as unknown as typeof candidateCertifications.$inferInsert),
          orgId,
          createdBy: userId,
        }).returning();

        return newCert;
      }),

    /**
     * Update certification
     */
    update: orgProtectedProcedure
      .input(updateCertificationSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(candidateCertifications)
          .set({ ...(data as Partial<typeof candidateCertifications.$inferInsert>), updatedBy: userId, updatedAt: new Date() })
          .where(and(
            eq(candidateCertifications.id, id),
            eq(candidateCertifications.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Certification not found');
        }

        return updated;
      }),

    /**
     * Delete certification (hard delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deleted] = await db.delete(candidateCertifications)
          .where(and(
            eq(candidateCertifications.id, input.id),
            eq(candidateCertifications.orgId, orgId),
          ))
          .returning();

        if (!deleted) {
          throw new Error('Certification not found');
        }

        return deleted;
      }),
  }),

  // =====================================================
  // REFERENCES
  // =====================================================

  references: router({
    /**
     * List references for a candidate
     */
    list: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const results = await db.select().from(candidateReferences)
          .where(and(
            eq(candidateReferences.orgId, orgId),
            eq(candidateReferences.candidateId, input.candidateId),
          ))
          .orderBy(desc(candidateReferences.createdAt));

        return results;
      }),

    /**
     * Get reference by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [ref] = await db.select().from(candidateReferences)
          .where(and(
            eq(candidateReferences.id, input.id),
            eq(candidateReferences.orgId, orgId),
          ))
          .limit(1);

        if (!ref) {
          throw new Error('Reference not found');
        }

        return ref;
      }),

    /**
     * Create reference
     */
    create: orgProtectedProcedure
      .input(createReferenceSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newRef] = await db.insert(candidateReferences).values({
          ...(input as unknown as typeof candidateReferences.$inferInsert),
          orgId,
          createdBy: userId,
        }).returning();

        return newRef;
      }),

    /**
     * Update reference
     */
    update: orgProtectedProcedure
      .input(updateReferenceSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(candidateReferences)
          .set({ ...(data as Partial<typeof candidateReferences.$inferInsert>), updatedBy: userId, updatedAt: new Date() })
          .where(and(
            eq(candidateReferences.id, id),
            eq(candidateReferences.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Reference not found');
        }

        return updated;
      }),

    /**
     * Delete reference (hard delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deleted] = await db.delete(candidateReferences)
          .where(and(
            eq(candidateReferences.id, input.id),
            eq(candidateReferences.orgId, orgId),
          ))
          .returning();

        if (!deleted) {
          throw new Error('Reference not found');
        }

        return deleted;
      }),

    /**
     * Request reference check
     */
    requestCheck: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [updated] = await db.update(candidateReferences)
          .set({
            status: 'contacted',
            contactAttempts: 1,
            lastContactAttempt: new Date(),
            contactedBy: userId,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateReferences.id, input.id),
            eq(candidateReferences.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Reference not found');
        }

        return updated;
      }),
  }),

  // =====================================================
  // BACKGROUND CHECKS
  // =====================================================

  backgroundChecks: router({
    /**
     * List background checks for a candidate
     */
    list: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        submissionId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions = [
          eq(candidateBackgroundChecks.orgId, orgId),
          eq(candidateBackgroundChecks.candidateId, input.candidateId),
        ];

        if (input.submissionId) {
          conditions.push(eq(candidateBackgroundChecks.submissionId, input.submissionId));
        }

        const results = await db.select().from(candidateBackgroundChecks)
          .where(and(...conditions))
          .orderBy(desc(candidateBackgroundChecks.createdAt));

        return results;
      }),

    /**
     * Get background check by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [check] = await db.select().from(candidateBackgroundChecks)
          .where(and(
            eq(candidateBackgroundChecks.id, input.id),
            eq(candidateBackgroundChecks.orgId, orgId),
          ))
          .limit(1);

        if (!check) {
          throw new Error('Background check not found');
        }

        return check;
      }),

    /**
     * Create background check
     */
    create: orgProtectedProcedure
      .input(createBackgroundCheckSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newCheck] = await db.insert(candidateBackgroundChecks).values({
          ...(input as unknown as typeof candidateBackgroundChecks.$inferInsert),
          orgId,
          createdBy: userId,
        }).returning();

        return newCheck;
      }),

    /**
     * Update background check
     */
    update: orgProtectedProcedure
      .input(updateBackgroundCheckSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(candidateBackgroundChecks)
          .set({ ...(data as Partial<typeof candidateBackgroundChecks.$inferInsert>), updatedBy: userId, updatedAt: new Date() })
          .where(and(
            eq(candidateBackgroundChecks.id, id),
            eq(candidateBackgroundChecks.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Background check not found');
        }

        return updated;
      }),

    /**
     * Order background check
     */
    order: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        provider: z.string().optional(),
        packageName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [updated] = await db.update(candidateBackgroundChecks)
          .set({
            status: 'initiated',
            initiatedAt: new Date(),
            requestedBy: userId,
            provider: input.provider,
            packageName: input.packageName,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateBackgroundChecks.id, input.id),
            eq(candidateBackgroundChecks.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Background check not found');
        }

        return updated;
      }),

    /**
     * Complete background check with result
     */
    complete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        result: z.enum(['clear', 'consider', 'adverse', 'incomplete']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [updated] = await db.update(candidateBackgroundChecks)
          .set({
            status: 'completed',
            overallResult: input.result,
            notes: input.notes,
            completedAt: new Date(),
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateBackgroundChecks.id, input.id),
            eq(candidateBackgroundChecks.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Background check not found');
        }

        return updated;
      }),
  }),

  // =====================================================
  // COMPLIANCE DOCUMENTS
  // =====================================================

  complianceDocuments: router({
    /**
     * List compliance documents for a candidate
     */
    list: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        placementId: z.string().uuid().optional(),
        status: z.enum(['pending', 'submitted', 'approved', 'rejected', 'expired']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions = [
          eq(candidateComplianceDocuments.orgId, orgId),
          eq(candidateComplianceDocuments.candidateId, input.candidateId),
        ];

        if (input.placementId) {
          conditions.push(eq(candidateComplianceDocuments.placementId, input.placementId));
        }

        if (input.status) {
          conditions.push(eq(candidateComplianceDocuments.status, input.status));
        }

        const results = await db.select().from(candidateComplianceDocuments)
          .where(and(...conditions))
          .orderBy(candidateComplianceDocuments.requiredBy, desc(candidateComplianceDocuments.createdAt));

        return results;
      }),

    /**
     * Get compliance document by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [doc] = await db.select().from(candidateComplianceDocuments)
          .where(and(
            eq(candidateComplianceDocuments.id, input.id),
            eq(candidateComplianceDocuments.orgId, orgId),
          ))
          .limit(1);

        if (!doc) {
          throw new Error('Compliance document not found');
        }

        return doc;
      }),

    /**
     * Create compliance document
     */
    create: orgProtectedProcedure
      .input(createComplianceDocumentSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newDoc] = await db.insert(candidateComplianceDocuments).values({
          ...(input as unknown as typeof candidateComplianceDocuments.$inferInsert),
          orgId,
          createdBy: userId,
        }).returning();

        return newDoc;
      }),

    /**
     * Update compliance document
     */
    update: orgProtectedProcedure
      .input(updateComplianceDocumentSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(candidateComplianceDocuments)
          .set({ ...(data as Partial<typeof candidateComplianceDocuments.$inferInsert>), updatedBy: userId, updatedAt: new Date() })
          .where(and(
            eq(candidateComplianceDocuments.id, id),
            eq(candidateComplianceDocuments.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Compliance document not found');
        }

        return updated;
      }),

    /**
     * Submit compliance document
     */
    submit: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        fileId: z.string().uuid().optional(),
        fileUrl: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [updated] = await db.update(candidateComplianceDocuments)
          .set({
            status: 'submitted',
            submittedAt: new Date(),
            fileId: input.fileId,
            fileUrl: input.fileUrl,
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateComplianceDocuments.id, input.id),
            eq(candidateComplianceDocuments.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Compliance document not found');
        }

        return updated;
      }),

    /**
     * Approve compliance document
     */
    approve: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [updated] = await db.update(candidateComplianceDocuments)
          .set({
            status: 'approved',
            approvedAt: new Date(),
            approvedBy: userId,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateComplianceDocuments.id, input.id),
            eq(candidateComplianceDocuments.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Compliance document not found');
        }

        return updated;
      }),

    /**
     * Reject compliance document
     */
    reject: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [updated] = await db.update(candidateComplianceDocuments)
          .set({
            status: 'rejected',
            rejectedAt: new Date(),
            rejectedBy: userId,
            rejectionReason: input.reason,
            updatedAt: new Date(),
          })
          .where(and(
            eq(candidateComplianceDocuments.id, input.id),
            eq(candidateComplianceDocuments.orgId, orgId),
          ))
          .returning();

        if (!updated) {
          throw new Error('Compliance document not found');
        }

        return updated;
      }),
  }),
});
