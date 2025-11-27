# InTime v3 API Design Document

**Document Version:** 1.0
**Date:** 2025-11-26

This document specifies the complete tRPC API design for frontend integration.

---

## 1. API Architecture Overview

### 1.1 Router Structure

```
src/server/
├── trpc/
│   ├── trpc.ts                 # Context, procedures, router setup
│   └── routers/                # Academy-specific routers
│       ├── courses.ts
│       ├── enrollment.ts
│       ├── progress.ts
│       ├── quiz.ts
│       ├── badges.ts
│       └── ...
└── routers/                    # Business module routers
    ├── ats.ts                  # Applicant Tracking System
    ├── crm.ts                  # Customer Relationship Management
    ├── bench.ts                # Bench Sales
    ├── ta-hr.ts                # Talent Acquisition & HR
    ├── client.ts               # Client Portal APIs
    └── users.ts                # User management (to add)
```

### 1.2 Procedure Types

```typescript
// Public procedure - no auth required
const publicProcedure = t.procedure;

// Protected procedure - requires authenticated user
const protectedProcedure = t.procedure.use(authMiddleware);

// Org-protected procedure - requires auth + org context
const orgProtectedProcedure = t.procedure
  .use(authMiddleware)
  .use(orgMiddleware);

// Role-protected procedure - requires specific role
const roleProtectedProcedure = (roles: string[]) =>
  orgProtectedProcedure.use(roleMiddleware(roles));
```

### 1.3 Standard Response Patterns

```typescript
// List response with pagination
interface ListResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Single item response
interface ItemResponse<T> {
  item: T;
}

// Mutation response
interface MutationResponse<T> {
  success: boolean;
  item?: T;
  error?: string;
}
```

---

## 2. ATS Router - Complete Specification

### 2.1 Jobs Sub-Router

```typescript
// src/server/routers/ats.ts

export const atsRouter = router({
  jobs: router({
    // ============================================
    // LIST - Get paginated jobs with filters
    // ============================================
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        cursor: z.string().uuid().optional(),
        status: z.enum(['draft', 'open', 'on_hold', 'filled', 'cancelled']).optional(),
        urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        accountId: z.string().uuid().optional(),
        ownerId: z.string().uuid().optional(),
        search: z.string().optional(),
        isRemote: z.boolean().optional(),
        minRate: z.number().optional(),
        maxRate: z.number().optional(),
        sortBy: z.enum(['createdAt', 'title', 'status', 'urgency']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        // Implementation: paginated query with joins
        // Returns: { items: Job[], total: number, hasMore: boolean }
      }),

    // ============================================
    // GET BY ID - Single job with relations
    // ============================================
    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          account: z.boolean().default(false),
          submissions: z.boolean().default(false),
          owner: z.boolean().default(false),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Implementation: single query with optional joins
        // Returns: Job with optional nested relations
      }),

    // ============================================
    // CREATE - New job
    // ============================================
    create: orgProtectedProcedure
      .input(createJobSchema)
      .mutation(async ({ ctx, input }) => {
        // Implementation: insert with audit fields
        // Side effects: create activity log
        // Returns: Created job
      }),

    // ============================================
    // UPDATE - Modify job
    // ============================================
    update: orgProtectedProcedure
      .input(updateJobSchema)
      .mutation(async ({ ctx, input }) => {
        // Implementation: update with optimistic locking
        // Side effects: create activity log for changes
        // Returns: Updated job
      }),

    // ============================================
    // DELETE - Soft delete job
    // ============================================
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // Implementation: set deletedAt
        // Side effects: log deletion
        // Returns: { success: boolean }
      }),

    // ============================================
    // SEARCH - Full-text search
    // ============================================
    search: orgProtectedProcedure
      .input(z.object({
        query: z.string().min(2),
        limit: z.number().min(1).max(50).default(20),
        filters: z.object({
          status: z.array(z.string()).optional(),
          accountIds: z.array(z.string().uuid()).optional(),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Implementation: full-text search on search_vector
        // Returns: { items: Job[], highlights: Record<string, string> }
      }),

    // ============================================
    // METRICS - Job analytics
    // ============================================
    metrics: orgProtectedProcedure
      .input(z.object({ jobId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        // Implementation: aggregate submission stats
        // Returns: { submissions: {...}, interviews: number, offers: number }
      }),

    // ============================================
    // DUPLICATE - Clone a job
    // ============================================
    duplicate: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        newTitle: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Implementation: copy job with new ID and title
        // Returns: New job
      }),

    // ============================================
    // UPDATE STATUS - Status change with validation
    // ============================================
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['draft', 'open', 'on_hold', 'filled', 'cancelled']),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Implementation: validate status transition
        // Side effects: update submissions if filled/cancelled
        // Returns: Updated job
      }),

    // ============================================
    // ASSIGN RECRUITERS - Manage job team
    // ============================================
    assignRecruiters: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        recruiterIds: z.array(z.string().uuid()),
        action: z.enum(['add', 'remove', 'set']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Implementation: update recruiterIds array
        // Side effects: notify recruiters
        // Returns: Updated job
      }),
  }),

  // =====================================================
  // SUBMISSIONS SUB-ROUTER
  // =====================================================

  submissions: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum([
          'sourced', 'screening', 'submission_ready', 'submitted_to_client',
          'client_review', 'client_interview', 'offer_stage', 'placed', 'rejected'
        ]).optional(),
        jobId: z.string().uuid().optional(),
        candidateId: z.string().uuid().optional(),
        ownerId: z.string().uuid().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        include: z.object({
          job: z.boolean().default(true),
          candidate: z.boolean().default(true),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Implementation with joins
      }),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          job: z.boolean().default(true),
          candidate: z.boolean().default(true),
          interviews: z.boolean().default(false),
          offers: z.boolean().default(false),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Single submission with optional relations
      }),

    create: orgProtectedProcedure
      .input(createSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        // Create with duplicate check (jobId + candidateId)
        // Calculate AI match score
        // Log activity
      }),

    update: orgProtectedProcedure
      .input(updateSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        // Update submission
      }),

    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum([
          'sourced', 'screening', 'submission_ready', 'submitted_to_client',
          'client_review', 'client_interview', 'offer_stage', 'placed', 'rejected'
        ]),
        notes: z.string().optional(),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validate status transition
        // Set rejection fields if applicable
        // Log activity
      }),

    bulkUpdateStatus: orgProtectedProcedure
      .input(z.object({
        ids: z.array(z.string().uuid()).min(1).max(100),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Batch update
      }),

    submitToClient: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        rate: z.number(),
        rateType: z.enum(['hourly', 'annual']),
        notes: z.string().optional(),
        resumeFileId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Set submittedToClientAt
        // Update status to 'submitted_to_client'
        // Notify client (if configured)
      }),

    getByJob: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        groupByStatus: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        // Get all submissions for a job
        // Optionally group by status for pipeline view
      }),

    getByCandidate: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        limit: z.number().default(20),
      }))
      .query(async ({ ctx, input }) => {
        // Get submission history for a candidate
      }),
  }),

  // =====================================================
  // INTERVIEWS SUB-ROUTER
  // =====================================================

  interviews: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
        submissionId: z.string().uuid().optional(),
        jobId: z.string().uuid().optional(),
        candidateId: z.string().uuid().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createInterviewSchema)
      .mutation(async ({ ctx, input }) => {
        // Create interview
        // Update submission interviewCount
        // Send calendar invite (if configured)
      }),

    update: orgProtectedProcedure
      .input(updateInterviewSchema)
      .mutation(async ({ ctx, input }) => {}),

    cancel: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string(),
        notifyParticipants: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        // Set status to 'cancelled'
        // Send cancellation emails
      }),

    complete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        feedback: z.string(),
        rating: z.number().int().min(1).max(5),
        recommendation: z.enum(['strong_no', 'no', 'maybe', 'yes', 'strong_yes']),
        strengths: z.string().optional(),
        concerns: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Set status to 'completed'
        // Update submission with feedback
      }),

    reschedule: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        newScheduledAt: z.date(),
        reason: z.string().optional(),
        notifyParticipants: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {}),

    getUpcoming: orgProtectedProcedure
      .input(z.object({
        days: z.number().default(7),
      }))
      .query(async ({ ctx, input }) => {
        // Get interviews in next N days
      }),
  }),

  // =====================================================
  // OFFERS SUB-ROUTER
  // =====================================================

  offers: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'sent', 'accepted', 'declined', 'withdrawn', 'expired']).optional(),
        submissionId: z.string().uuid().optional(),
        jobId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          submission: z.boolean().default(true),
          job: z.boolean().default(true),
          candidate: z.boolean().default(true),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createOfferSchema)
      .mutation(async ({ ctx, input }) => {
        // Create offer in 'draft' status
        // Update submission status to 'offer_stage'
      }),

    update: orgProtectedProcedure
      .input(updateOfferSchema)
      .mutation(async ({ ctx, input }) => {}),

    send: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        emailTemplate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Set status to 'sent', set sentAt
        // Send email to candidate
      }),

    respond: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        response: z.enum(['accepted', 'declined', 'countered']),
        notes: z.string().optional(),
        counterOffer: z.object({
          rate: z.number().optional(),
          startDate: z.date().optional(),
          notes: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Update offer status
        // If accepted, trigger placement creation flow
      }),

    withdraw: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Set status to 'withdrawn'
        // Notify candidate
      }),

    extend: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        newExpiryDate: z.date(),
        notifyCandidate: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {}),
  }),

  // =====================================================
  // PLACEMENTS SUB-ROUTER
  // =====================================================

  placements: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['active', 'extended', 'ended', 'cancelled']).optional(),
        candidateId: z.string().uuid().optional(),
        accountId: z.string().uuid().optional(),
        recruiterId: z.string().uuid().optional(),
        startDateFrom: z.date().optional(),
        startDateTo: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          job: z.boolean().default(true),
          candidate: z.boolean().default(true),
          account: z.boolean().default(true),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createPlacementSchema)
      .mutation(async ({ ctx, input }) => {
        // Create placement
        // Update job positionsFilled
        // Update candidate status to 'placed'
        // Update submission status to 'placed'
      }),

    update: orgProtectedProcedure
      .input(updatePlacementSchema)
      .mutation(async ({ ctx, input }) => {}),

    extend: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        newEndDate: z.date(),
        newBillRate: z.number().optional(),
        newPayRate: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Update end date
        // Set status to 'extended'
        // Increment extensionCount
      }),

    terminate: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        actualEndDate: z.date(),
        reason: z.enum([
          'contract_ended', 'candidate_resigned', 'client_terminated',
          'performance_issues', 'other'
        ]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Set status to 'ended'
        // Update candidate status back to 'active' or 'bench'
      }),

    activeCount: orgProtectedProcedure
      .query(async ({ ctx }) => {
        // Return count of active placements
      }),

    getByCandidate: orgProtectedProcedure
      .input(z.object({ candidateId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        // Get placement history for candidate
      }),

    getEndingSoon: orgProtectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        // Get placements ending in next N days
      }),

    getMetrics: orgProtectedProcedure
      .input(z.object({
        dateFrom: z.date(),
        dateTo: z.date(),
        groupBy: z.enum(['recruiter', 'account', 'month']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Aggregate placement metrics
      }),
  }),

  // =====================================================
  // SKILLS SUB-ROUTER
  // =====================================================

  skills: router({
    list: orgProtectedProcedure
      .input(z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    getCandidateSkills: orgProtectedProcedure
      .input(z.object({ candidateId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {}),

    addToCandidate: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        skillId: z.string().uuid(),
        proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
        yearsOfExperience: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    removeFromCandidate: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        skillId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    updateCandidateSkill: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        skillId: z.string().uuid(),
        proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
        yearsOfExperience: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),
  }),
});
```

---

## 3. CRM Router - Complete Specification

```typescript
export const crmRouter = router({
  accounts: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['prospect', 'active', 'inactive', 'churned']).optional(),
        tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
        accountManagerId: z.string().uuid().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          pocs: z.boolean().default(true),
          jobs: z.boolean().default(false),
          deals: z.boolean().default(false),
          recentActivity: z.boolean().default(false),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createAccountSchema)
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(updateAccountSchema)
      .mutation(async ({ ctx, input }) => {}),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {}),

    search: orgProtectedProcedure
      .input(z.object({
        query: z.string().min(2),
        limit: z.number().default(20),
      }))
      .query(async ({ ctx, input }) => {}),

    getMetrics: orgProtectedProcedure
      .input(z.object({ accountId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        // Return: placements count, total revenue, active jobs, etc.
      }),
  }),

  leads: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['new', 'warm', 'hot', 'cold', 'converted', 'lost']).optional(),
        source: z.string().optional(),
        ownerId: z.string().uuid().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          recentActivity: z.boolean().default(true),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createLeadSchema)
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(updateLeadSchema)
      .mutation(async ({ ctx, input }) => {}),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {}),

    convertToDeal: orgProtectedProcedure
      .input(z.object({
        leadId: z.string().uuid(),
        dealData: z.object({
          title: z.string(),
          value: z.number(),
          stage: z.enum(['discovery', 'proposal', 'negotiation']).default('discovery'),
          expectedCloseDate: z.date().optional(),
        }),
        createAccount: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {}),

    bulkImport: orgProtectedProcedure
      .input(z.object({
        leads: z.array(createLeadSchema).max(500),
        source: z.string(),
        ownerId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['new', 'warm', 'hot', 'cold', 'converted', 'lost']),
        lostReason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),
  }),

  deals: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        stage: z.enum(['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
        accountId: z.string().uuid().optional(),
        ownerId: z.string().uuid().optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          account: z.boolean().default(true),
          lead: z.boolean().default(false),
          linkedJobs: z.boolean().default(false),
          recentActivity: z.boolean().default(false),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createDealSchema)
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(updateDealSchema)
      .mutation(async ({ ctx, input }) => {}),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {}),

    close: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        outcome: z.enum(['won', 'lost']),
        reason: z.string(),
        actualCloseDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    linkJob: orgProtectedProcedure
      .input(z.object({
        dealId: z.string().uuid(),
        jobId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    unlinkJob: orgProtectedProcedure
      .input(z.object({
        dealId: z.string().uuid(),
        jobId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    pipelineSummary: orgProtectedProcedure
      .input(z.object({
        ownerId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Return: deals grouped by stage with total values
      }),

    forecast: orgProtectedProcedure
      .input(z.object({
        months: z.number().min(1).max(12).default(3),
      }))
      .query(async ({ ctx, input }) => {
        // Return: weighted pipeline forecast
      }),
  }),

  pocs: router({
    list: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        isActive: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createPointOfContactSchema)
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(updatePointOfContactSchema)
      .mutation(async ({ ctx, input }) => {}),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {}),

    setPrimary: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        accountId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Set this POC as primary, unset others
      }),
  }),

  activities: router({
    list: orgProtectedProcedure
      .input(z.object({
        entityType: z.enum(['account', 'lead', 'deal', 'poc', 'candidate', 'submission']),
        entityId: z.string().uuid(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        activityType: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createActivityLogSchema)
      .mutation(async ({ ctx, input }) => {}),

    getTimeline: orgProtectedProcedure
      .input(z.object({
        entityType: z.enum(['account', 'lead', 'deal', 'poc', 'candidate', 'submission']),
        entityId: z.string().uuid(),
        limit: z.number().default(20),
      }))
      .query(async ({ ctx, input }) => {
        // Return formatted timeline with icons/labels
      }),
  }),
});
```

---

## 4. Bench Router - Complete Specification

```typescript
export const benchRouter = router({
  consultants: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(['bench', 'marketing', 'interview_process', 'offer_stage']).optional(),
        minDaysOnBench: z.number().optional(),
        maxDaysOnBench: z.number().optional(),
        benchRepId: z.string().uuid().optional(),
        hasImmigrationCase: z.boolean().optional(),
        skills: z.array(z.string()).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          userProfile: z.boolean().default(true),
          submissions: z.boolean().default(false),
          immigrationCase: z.boolean().default(false),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createBenchMetadataSchema)
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(updateBenchMetadataSchema)
      .mutation(async ({ ctx, input }) => {}),

    markAsPlaced: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        placementDetails: z.object({
          startDate: z.date(),
          endDate: z.date().optional(),
          billRate: z.number(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {}),

    agingReport: orgProtectedProcedure
      .query(async ({ ctx }) => {}),

    getAlerts: orgProtectedProcedure
      .query(async ({ ctx }) => {
        // Return consultants needing attention (30/60 day alerts)
      }),

    sendHotlistReminder: orgProtectedProcedure
      .input(z.object({ consultantId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {}),
  }),

  externalJobs: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        sourceId: z.string().uuid().optional(),
        status: z.enum(['active', 'expired', 'filled', 'ignored']).optional(),
        search: z.string().optional(),
        skills: z.array(z.string()).optional(),
        location: z.string().optional(),
        minRate: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createExternalJobSchema)
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(updateExternalJobSchema)
      .mutation(async ({ ctx, input }) => {}),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {}),

    matchCandidates: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        limit: z.number().default(10),
      }))
      .query(async ({ ctx, input }) => {
        // Return ranked candidate matches
      }),

    ignore: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),
  }),

  sources: router({
    list: orgProtectedProcedure
      .query(async ({ ctx }) => {}),

    create: orgProtectedProcedure
      .input(z.object({
        name: z.string(),
        sourceType: z.enum(['dice', 'indeed', 'linkedin', 'monster', 'ziprecruiter', 'custom']),
        url: z.string().url(),
        isActive: z.boolean().default(true),
        scrapingConfig: z.record(z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        isActive: z.boolean().optional(),
        scrapingConfig: z.record(z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {}),

    testConnection: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // Validate source is accessible
      }),

    triggerScrape: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // Manually trigger a scrape
      }),
  }),

  submissions: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.string().optional(),
        consultantId: z.string().uuid().optional(),
        externalJobId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createBenchSubmissionSchema)
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(updateBenchSubmissionSchema)
      .mutation(async ({ ctx, input }) => {}),

    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum([
          'identified', 'contacted_candidate', 'candidate_interested',
          'submitted_to_vendor', 'vendor_review', 'interview',
          'offered', 'placed', 'rejected'
        ]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),
  }),

  hotlist: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(['draft', 'sent', 'expired']).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        candidateIds: z.array(z.string().uuid()).min(1),
        targetSkills: z.array(z.string()).optional(),
        targetRoles: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        description: z.string().optional(),
        candidateIds: z.array(z.string().uuid()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    send: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        recipientEmails: z.array(z.string().email()).min(1),
        accountIds: z.array(z.string().uuid()).optional(),
        subject: z.string(),
        messageBody: z.string(),
        includeResumes: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {}),

    trackEngagement: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        eventType: z.enum(['view', 'response']),
        responseText: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    generateDocument: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        format: z.enum(['pdf', 'docx']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate hotlist document
        // Return file URL
      }),
  }),

  immigration: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(['drafting', 'submitted', 'rfe', 'approved', 'denied', 'withdrawn']).optional(),
        caseType: z.string().optional(),
        candidateId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          candidate: z.boolean().default(true),
          documents: z.boolean().default(false),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(createImmigrationCaseSchema)
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(updateImmigrationCaseSchema)
      .mutation(async ({ ctx, input }) => {}),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {}),

    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['drafting', 'submitted', 'rfe', 'approved', 'denied', 'withdrawn']),
        notes: z.string().optional(),
        rfeDetails: z.object({
          receivedDate: z.date(),
          dueDate: z.date(),
          description: z.string(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    statistics: orgProtectedProcedure
      .query(async ({ ctx }) => {}),

    timeline: orgProtectedProcedure
      .input(z.object({ caseId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        // Return timeline of case events
      }),

    getExpiringVisas: orgProtectedProcedure
      .input(z.object({ days: z.number().default(90) }))
      .query(async ({ ctx, input }) => {
        // Return candidates with visas expiring soon
      }),
  }),
});
```

---

## 5. TA-HR Router - Complete Specification

*Due to length, abbreviated version - full patterns same as above.*

```typescript
export const taHrRouter = router({
  // CAMPAIGNS
  campaigns: router({
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
    create: orgProtectedProcedure.input(...).mutation(...),
    update: orgProtectedProcedure.input(...).mutation(...),
    delete: orgProtectedProcedure.input(...).mutation(...),
    duplicate: orgProtectedProcedure.input(...).mutation(...),
    pause: orgProtectedProcedure.input(...).mutation(...),
    resume: orgProtectedProcedure.input(...).mutation(...),
    metrics: orgProtectedProcedure.input(...).query(...),
  }),

  // CAMPAIGN CONTACTS
  campaignContacts: router({
    list: orgProtectedProcedure.input(...).query(...),
    add: orgProtectedProcedure.input(...).mutation(...),
    bulkAdd: orgProtectedProcedure.input(...).mutation(...),
    remove: orgProtectedProcedure.input(...).mutation(...),
    updateStatus: orgProtectedProcedure.input(...).mutation(...),
  }),

  // EMPLOYEES
  employees: router({
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
    create: orgProtectedProcedure.input(...).mutation(...),
    update: orgProtectedProcedure.input(...).mutation(...),
    terminate: orgProtectedProcedure.input(...).mutation(...),
    transfer: orgProtectedProcedure.input(...).mutation(...),
    orgChart: orgProtectedProcedure.query(...),
  }),

  // PODS
  pods: router({
    list: orgProtectedProcedure.query(...),
    getById: orgProtectedProcedure.input(...).query(...),
    create: orgProtectedProcedure.input(...).mutation(...),
    update: orgProtectedProcedure.input(...).mutation(...),
    delete: orgProtectedProcedure.input(...).mutation(...),
    performance: orgProtectedProcedure.input(...).query(...),
    leaderboard: orgProtectedProcedure.query(...),
    reassignMembers: orgProtectedProcedure.input(...).mutation(...),
  }),

  // PAYROLL
  payroll: router({
    runs: orgProtectedProcedure.input(...).query(...),
    getRunById: orgProtectedProcedure.input(...).query(...),
    createRun: orgProtectedProcedure.input(...).mutation(...),
    approveRun: orgProtectedProcedure.input(...).mutation(...),
    processRun: orgProtectedProcedure.input(...).mutation(...),
    items: orgProtectedProcedure.input(...).query(...),
    addItem: orgProtectedProcedure.input(...).mutation(...),
    updateItem: orgProtectedProcedure.input(...).mutation(...),
  }),

  // PERFORMANCE REVIEWS
  reviews: router({
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
    create: orgProtectedProcedure.input(...).mutation(...),
    update: orgProtectedProcedure.input(...).mutation(...),
    submit: orgProtectedProcedure.input(...).mutation(...),
    acknowledge: orgProtectedProcedure.input(...).mutation(...),
    schedule: orgProtectedProcedure.input(...).mutation(...),
  }),

  // TIME & ATTENDANCE
  timeAttendance: router({
    list: orgProtectedProcedure.input(...).query(...),
    getById: orgProtectedProcedure.input(...).query(...),
    clockIn: orgProtectedProcedure.input(...).mutation(...),
    clockOut: orgProtectedProcedure.input(...).mutation(...),
    create: orgProtectedProcedure.input(...).mutation(...),
    update: orgProtectedProcedure.input(...).mutation(...),
    approve: orgProtectedProcedure.input(...).mutation(...),
    reject: orgProtectedProcedure.input(...).mutation(...),
    getWeeklySummary: orgProtectedProcedure.input(...).query(...),
  }),

  // PTO
  pto: router({
    balance: orgProtectedProcedure.input(...).query(...),
    getRequests: orgProtectedProcedure.input(...).query(...),
    request: orgProtectedProcedure.input(...).mutation(...),
    approveRequest: orgProtectedProcedure.input(...).mutation(...),
    cancelRequest: orgProtectedProcedure.input(...).mutation(...),
    getCalendar: orgProtectedProcedure.input(...).query(...),
  }),
});
```

---

## 6. Users Router - New Router Needed

```typescript
// src/server/routers/users.ts

export const usersRouter = router({
  // PROFILE
  me: protectedProcedure
    .query(async ({ ctx }) => {
      // Return current user profile
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      fullName: z.string().optional(),
      phone: z.string().optional(),
      avatarUrl: z.string().url().optional(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {}),

  // CANDIDATES
  candidates: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(['active', 'placed', 'bench', 'inactive', 'blacklisted']).optional(),
        skills: z.array(z.string()).optional(),
        location: z.string().optional(),
        search: z.string().optional(),
        minExperience: z.number().optional(),
        maxExperience: z.number().optional(),
        visaType: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    getById: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        include: z.object({
          skills: z.boolean().default(true),
          submissions: z.boolean().default(false),
          placements: z.boolean().default(false),
          benchMetadata: z.boolean().default(false),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    create: orgProtectedProcedure
      .input(z.object({
        email: z.string().email(),
        fullName: z.string(),
        phone: z.string().optional(),
        skills: z.array(z.string()).optional(),
        experienceYears: z.number().optional(),
        location: z.string().optional(),
        hourlyRate: z.number().optional(),
        resumeUrl: z.string().url().optional(),
        currentVisa: z.string().optional(),
        availability: z.enum(['immediate', '2_weeks', '1_month']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        // ... updateable fields
      }))
      .mutation(async ({ ctx, input }) => {}),

    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['active', 'placed', 'bench', 'inactive', 'blacklisted']),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {}),

    search: orgProtectedProcedure
      .input(z.object({
        query: z.string().min(2),
        limit: z.number().default(20),
        filters: z.object({
          status: z.array(z.string()).optional(),
          skills: z.array(z.string()).optional(),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {}),
  }),

  // INTERNAL USERS (Employees/Recruiters)
  internal: router({
    list: roleProtectedProcedure(['admin', 'hr_manager'])
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        department: z.string().optional(),
        role: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {}),

    invite: roleProtectedProcedure(['admin', 'hr_manager'])
      .input(z.object({
        email: z.string().email(),
        fullName: z.string(),
        role: z.string(),
        department: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {}),
  }),
});
```

---

## 7. Frontend Hook Patterns

### 7.1 Query Hooks

```typescript
// src/hooks/queries/useJobs.ts

import { trpc } from '@/lib/trpc';

export function useJobs(input?: {
  status?: JobStatus;
  accountId?: string;
  limit?: number;
}) {
  return trpc.ats.jobs.list.useQuery(input, {
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useJob(id: string, options?: { include?: JobInclude }) {
  return trpc.ats.jobs.getById.useQuery(
    { id, include: options?.include },
    { enabled: !!id }
  );
}

export function useJobMetrics(jobId: string) {
  return trpc.ats.jobs.metrics.useQuery(
    { jobId },
    { enabled: !!jobId }
  );
}
```

### 7.2 Mutation Hooks

```typescript
// src/hooks/mutations/useJobMutations.ts

import { trpc } from '@/lib/trpc';

export function useCreateJob() {
  const utils = trpc.useUtils();

  return trpc.ats.jobs.create.useMutation({
    onSuccess: () => {
      utils.ats.jobs.list.invalidate();
    },
  });
}

export function useUpdateJob() {
  const utils = trpc.useUtils();

  return trpc.ats.jobs.update.useMutation({
    onSuccess: (data) => {
      utils.ats.jobs.getById.invalidate({ id: data.id });
      utils.ats.jobs.list.invalidate();
    },
  });
}

export function useDeleteJob() {
  const utils = trpc.useUtils();

  return trpc.ats.jobs.delete.useMutation({
    onSuccess: () => {
      utils.ats.jobs.list.invalidate();
    },
  });
}

export function useUpdateJobStatus() {
  const utils = trpc.useUtils();

  return trpc.ats.jobs.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await utils.ats.jobs.getById.cancel({ id });
      const previousJob = utils.ats.jobs.getById.getData({ id });

      utils.ats.jobs.getById.setData({ id }, (old) => ({
        ...old!,
        status,
      }));

      return { previousJob };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousJob) {
        utils.ats.jobs.getById.setData({ id }, context.previousJob);
      }
    },
    onSettled: ({ id }) => {
      utils.ats.jobs.getById.invalidate({ id });
      utils.ats.jobs.list.invalidate();
    },
  });
}
```

### 7.3 Infinite Query Pattern

```typescript
// src/hooks/queries/useInfiniteSubmissions.ts

export function useInfiniteSubmissions(input?: {
  jobId?: string;
  status?: string;
}) {
  return trpc.ats.submissions.list.useInfiniteQuery(
    {
      ...input,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
      staleTime: 30 * 1000,
    }
  );
}
```

---

## 8. Error Handling

### 8.1 Standard Error Codes

```typescript
// src/lib/errors.ts

export const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export class AppError extends TRPCError {
  constructor(
    code: keyof typeof ErrorCodes,
    message: string,
    cause?: unknown
  ) {
    super({
      code: mapToTRPCCode(code),
      message,
      cause,
    });
  }
}
```

### 8.2 Error Response Pattern

```typescript
// In router procedures
if (!job) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: `Job with ID ${input.id} not found`,
  });
}

if (!canUpdateJob(ctx.userId, job)) {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'You do not have permission to update this job',
  });
}
```

---

## Appendix: Validation Schema Index

| Module | Schema File | Schemas |
|--------|-------------|---------|
| ATS | `src/lib/validations/ats.ts` | createJobSchema, updateJobSchema, createSubmissionSchema, updateSubmissionSchema, createInterviewSchema, updateInterviewSchema, createOfferSchema, updateOfferSchema, createPlacementSchema, updatePlacementSchema |
| CRM | `src/lib/validations/crm.ts` | createAccountSchema, updateAccountSchema, createLeadSchema, updateLeadSchema, createDealSchema, updateDealSchema, createPointOfContactSchema, updatePointOfContactSchema, createActivityLogSchema |
| Bench | `src/lib/validations/bench.ts` | createBenchMetadataSchema, updateBenchMetadataSchema, createExternalJobSchema, updateExternalJobSchema, createBenchSubmissionSchema, updateBenchSubmissionSchema, createImmigrationCaseSchema, updateImmigrationCaseSchema |
| TA-HR | `src/lib/validations/ta-hr.ts` | createCampaignSchema, updateCampaignSchema, createEmployeeMetadataSchema, updateEmployeeMetadataSchema, createPodSchema, updatePodSchema, createPayrollRunSchema, createPerformanceReviewSchema, updatePerformanceReviewSchema, createTimeAttendanceSchema, updateTimeAttendanceSchema |
