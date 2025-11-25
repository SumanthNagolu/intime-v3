/**
 * tRPC Router: ATS Module
 * Handles jobs, submissions, interviews, offers, and placements
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc/trpc';
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
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

export const atsRouter = router({
  // =====================================================
  // JOBS
  // =====================================================

  jobs: router({
    /**
     * Get all jobs
     */
    list: protectedProcedure
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
        if (status) conditions.push(eq(jobs.jobStatus, status));
        if (clientId) conditions.push(eq(jobs.clientId, clientId));

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
    getById: protectedProcedure
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
    create: protectedProcedure
      .input(createJobSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newJob] = await db.insert(jobs).values({
          ...input,
          orgId,
          ownerId: input.ownerId || userId,
          createdBy: userId,
        }).returning();

        return newJob;
      }),

    /**
     * Update job
     */
    update: protectedProcedure
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
    metrics: protectedProcedure
      .input(z.object({ jobId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Get submission counts by status
        const submissionStats = await db.select({
          status: submissions.submissionStatus,
          count: sql<number>`count(*)::int`,
        })
          .from(submissions)
          .where(and(
            eq(submissions.jobId, input.jobId),
            eq(submissions.orgId, orgId)
          ))
          .groupBy(submissions.submissionStatus);

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
    list: protectedProcedure
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
        if (status) conditions.push(eq(submissions.submissionStatus, status));
        if (jobId) conditions.push(eq(submissions.jobId, jobId));
        if (candidateId) conditions.push(eq(submissions.candidateId, candidateId));

        const results = await db.select().from(submissions)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(submissions.submittedAt));

        return results;
      }),

    /**
     * Get submission by ID
     */
    getById: protectedProcedure
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
    create: protectedProcedure
      .input(createSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newSubmission] = await db.insert(submissions).values({
          ...input,
          orgId,
          submittedBy: userId,
        }).returning();

        return newSubmission;
      }),

    /**
     * Update submission
     */
    update: protectedProcedure
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
    updateStatus: protectedProcedure
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
            submissionStatus: status,
            internalNotes: notes,
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
  }),

  // =====================================================
  // INTERVIEWS
  // =====================================================

  interviews: router({
    /**
     * Get all interviews
     */
    list: protectedProcedure
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
        if (status) conditions.push(eq(interviews.interviewStatus, status));
        if (submissionId) conditions.push(eq(interviews.submissionId, submissionId));

        const results = await db.select().from(interviews)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(interviews.scheduledTime));

        return results;
      }),

    /**
     * Create interview
     */
    create: protectedProcedure
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
    update: protectedProcedure
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
    cancel: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        cancellationReason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(interviews)
          .set({
            interviewStatus: 'cancelled',
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
    list: protectedProcedure
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
        if (status) conditions.push(eq(offers.offerStatus, status));
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
    create: protectedProcedure
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
    update: protectedProcedure
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
    send: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(offers)
          .set({
            offerStatus: 'sent',
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
    respond: protectedProcedure
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
            offerStatus: accept ? 'accepted' : 'declined',
            acceptedDeclinedAt: new Date(),
            responseNotes: notes,
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
    list: protectedProcedure
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
        if (status) conditions.push(eq(placements.placementStatus, status));
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
    create: protectedProcedure
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
    update: protectedProcedure
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
    extend: protectedProcedure
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
            placementStatus: 'extended',
            internalNotes: input.extensionNotes,
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
    activeCount: protectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const [result] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(placements)
          .where(and(
            eq(placements.orgId, orgId),
            eq(placements.placementStatus, 'active')
          ));

        return result?.count || 0;
      }),
  }),

  // =====================================================
  // SKILLS
  // =====================================================

  skills: router({
    /**
     * Get all skills
     */
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const results = await db.select().from(skills)
          .orderBy(skills.name);

        return results;
      }),

    /**
     * Get candidate skills
     */
    getCandidateSkills: protectedProcedure
      .input(z.object({ candidateId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const results = await db.select()
          .from(candidateSkills)
          .where(and(
            eq(candidateSkills.candidateId, input.candidateId),
            eq(candidateSkills.orgId, orgId)
          ));

        return results;
      }),

    /**
     * Add skill to candidate
     */
    addToCandid: protectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        skillId: z.string().uuid(),
        proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
        yearsOfExperience: z.number().min(0).max(50),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [newSkill] = await db.insert(candidateSkills).values({
          ...input,
          orgId,
        }).returning();

        return newSkill;
      }),
  }),
});
