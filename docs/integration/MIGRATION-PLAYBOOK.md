# InTime v3 Component Migration Playbook

**Document Version:** 1.0
**Date:** 2025-11-26

This document provides step-by-step instructions for migrating each frontend prototype component to use the production tRPC backend.

---

## Table of Contents

1. [Migration Principles](#1-migration-principles)
2. [Pre-Migration Setup](#2-pre-migration-setup)
3. [RecruiterDashboard Migration](#3-recruiterdashboard-migration)
4. [JobDetail Migration](#4-jobdetail-migration)
5. [PipelineView Migration](#5-pipelineview-migration)
6. [CandidateDetail Migration](#6-candidatedetail-migration)
7. [Generic Migration Template](#7-generic-migration-template)
8. [Testing Checklist](#8-testing-checklist)

---

## 1. Migration Principles

### 1.1 Core Principles

1. **Preserve UX**: Users should see no degradation in experience
2. **Feature Flags**: All migrations should be toggleable
3. **Parallel Data**: Keep mock data working during migration
4. **Progressive Enhancement**: Start with read operations, then mutations
5. **Test First**: Write E2E tests before changing code

### 1.2 File Structure

```
src/
├── components/
│   ├── recruiting/
│   │   ├── RecruiterDashboard.tsx    # Migrated component
│   │   └── RecruiterDashboard.mock.tsx # Preserved mock version
├── hooks/
│   ├── queries/
│   │   ├── useJobs.ts
│   │   ├── useSubmissions.ts
│   │   └── ...
│   └── mutations/
│       ├── useJobMutations.ts
│       └── ...
├── lib/
│   └── adapters/
│       ├── job.ts
│       ├── candidate.ts
│       └── ...
└── types/
    └── aligned/
        ├── ats.ts
        └── ...
```

### 1.3 Migration States

```typescript
// src/lib/featureFlags.ts

export const MIGRATION_FLAGS = {
  RECRUITER_DASHBOARD_REAL_DATA: false,
  JOB_DETAIL_REAL_DATA: false,
  PIPELINE_VIEW_REAL_DATA: false,
  // ... etc
} as const;
```

---

## 2. Pre-Migration Setup

### 2.1 Create Type Adapters

Before migrating any component, create the type adapter:

```bash
# Create adapter directory
mkdir -p src/lib/adapters
```

```typescript
// src/lib/adapters/index.ts
export * from './job';
export * from './candidate';
export * from './submission';
export * from './account';
// ... etc
```

### 2.2 Create Query Hooks

```bash
# Create hooks directory
mkdir -p src/hooks/queries
mkdir -p src/hooks/mutations
```

```typescript
// src/hooks/queries/index.ts
export * from './useJobs';
export * from './useSubmissions';
export * from './useCandidates';
export * from './useAccounts';
// ... etc
```

### 2.3 Create Aligned Types

```typescript
// src/types/aligned/index.ts
export * from './ats';
export * from './crm';
export * from './bench';
// ... etc
```

### 2.4 Setup Test Fixtures

```typescript
// src/test/fixtures/jobs.ts
export const mockJob = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Senior Java Developer',
  accountId: '456...',
  status: 'open',
  // ... complete mock object
};

export const mockJobs = [mockJob, /* ... */];
```

---

## 3. RecruiterDashboard Migration

### 3.1 Current State Analysis

**File**: `frontend-prototype/components/recruiting/RecruiterDashboard.tsx`

**Data Used**:
- Jobs list (from useAppStore)
- Submissions list (from useAppStore)
- Candidates list (from useAppStore)
- Current user (from useAppStore)

**Key Features**:
- Stats cards (open jobs, pending submissions, interviews today)
- Jobs table with filters
- Submissions pipeline mini-view
- Recent activity feed

### 3.2 Step 1: Create Hook Dependencies

```typescript
// src/hooks/queries/useDashboardData.ts

import { trpc } from '@/lib/trpc';

export function useRecruiterDashboardData() {
  const { data: jobs, isLoading: jobsLoading } = trpc.ats.jobs.list.useQuery({
    status: 'open',
    limit: 10,
  });

  const { data: submissions, isLoading: submissionsLoading } = trpc.ats.submissions.list.useQuery({
    limit: 50,
  });

  const { data: interviews, isLoading: interviewsLoading } = trpc.ats.interviews.list.useQuery({
    dateFrom: new Date(),
    dateTo: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
  });

  const { data: activePlacementsCount } = trpc.ats.placements.activeCount.useQuery();

  return {
    jobs: jobs?.items || [],
    submissions: submissions?.items || [],
    interviews: interviews?.items || [],
    activePlacements: activePlacementsCount || 0,
    isLoading: jobsLoading || submissionsLoading || interviewsLoading,
  };
}
```

### 3.3 Step 2: Create Adapted Types

```typescript
// src/components/recruiting/RecruiterDashboard.types.ts

import type { AlignedJob, AlignedSubmission } from '@/types/aligned/ats';

export interface DashboardStats {
  openJobs: number;
  pendingSubmissions: number;
  interviewsToday: number;
  activePlacements: number;
}

export interface DashboardProps {
  initialData?: {
    jobs: AlignedJob[];
    submissions: AlignedSubmission[];
  };
}
```

### 3.4 Step 3: Create Migrated Component

```typescript
// src/components/recruiting/RecruiterDashboard.tsx

'use client';

import { useState } from 'react';
import { useRecruiterDashboardData } from '@/hooks/queries/useDashboardData';
import { dbJobToFrontend, dbSubmissionToFrontend } from '@/lib/adapters';
import { MIGRATION_FLAGS } from '@/lib/featureFlags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

// Import mock data fallback
import { useMockDashboardData } from './RecruiterDashboard.mock';

export function RecruiterDashboard() {
  // Feature flag: use real or mock data
  const useRealData = MIGRATION_FLAGS.RECRUITER_DASHBOARD_REAL_DATA;

  // Fetch real data
  const {
    jobs: realJobs,
    submissions: realSubmissions,
    interviews,
    activePlacements,
    isLoading: realLoading,
  } = useRecruiterDashboardData();

  // Mock data fallback
  const { jobs: mockJobs, submissions: mockSubmissions } = useMockDashboardData();

  // Select data source
  const jobs = useRealData ? realJobs.map(dbJobToFrontend) : mockJobs;
  const submissions = useRealData ? realSubmissions.map(dbSubmissionToFrontend) : mockSubmissions;
  const isLoading = useRealData ? realLoading : false;

  // Calculate stats
  const stats = {
    openJobs: jobs.filter(j => j.status === 'open').length,
    pendingSubmissions: submissions.filter(s =>
      ['sourced', 'screening', 'submission_ready'].includes(s.status)
    ).length,
    interviewsToday: interviews?.length || 0,
    activePlacements,
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Open Jobs" value={stats.openJobs} />
        <StatsCard title="Pending Submissions" value={stats.pendingSubmissions} />
        <StatsCard title="Interviews Today" value={stats.interviewsToday} />
        <StatsCard title="Active Placements" value={stats.activePlacements} />
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <JobsTable jobs={jobs} />
        </CardContent>
      </Card>

      {/* Submissions Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsPipeline submissions={submissions} />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
```

### 3.5 Step 4: Write E2E Tests

```typescript
// tests/e2e/recruiter-dashboard.spec.ts

import { test, expect } from '@playwright/test';

test.describe('RecruiterDashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as recruiter
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'recruiter@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/recruiting');
  });

  test('displays stats cards', async ({ page }) => {
    await expect(page.getByText('Open Jobs')).toBeVisible();
    await expect(page.getByText('Pending Submissions')).toBeVisible();
    await expect(page.getByText('Interviews Today')).toBeVisible();
    await expect(page.getByText('Active Placements')).toBeVisible();
  });

  test('displays jobs table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Active Jobs' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('clicking a job navigates to detail', async ({ page }) => {
    const firstJob = page.getByRole('row').nth(1);
    await firstJob.click();
    await expect(page).toHaveURL(/\/recruiting\/jobs\/[a-f0-9-]+/);
  });

  test('shows loading skeleton while fetching', async ({ page }) => {
    // Slow down API
    await page.route('**/trpc/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/recruiting');
    await expect(page.locator('.skeleton')).toBeVisible();
  });
});
```

### 3.6 Step 5: Integration Testing

```typescript
// src/components/recruiting/__tests__/RecruiterDashboard.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { RecruiterDashboard } from '../RecruiterDashboard';
import { TRPCWrapper } from '@/test/utils';

describe('RecruiterDashboard', () => {
  it('renders stats cards with data', async () => {
    render(
      <TRPCWrapper>
        <RecruiterDashboard />
      </TRPCWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Open Jobs')).toBeInTheDocument();
    });

    expect(screen.getByText(/\d+/)).toBeInTheDocument();
  });

  it('handles empty state gracefully', async () => {
    // Mock empty response
    render(
      <TRPCWrapper mockData={{ jobs: [], submissions: [] }}>
        <RecruiterDashboard />
      </TRPCWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    // Mock error
    render(
      <TRPCWrapper mockError={new Error('API Error')}>
        <RecruiterDashboard />
      </TRPCWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### 3.7 Step 6: Enable Feature Flag

```typescript
// src/lib/featureFlags.ts

export const MIGRATION_FLAGS = {
  RECRUITER_DASHBOARD_REAL_DATA: true, // Enable after testing
  // ...
};
```

---

## 4. JobDetail Migration

### 4.1 Current State

**File**: `frontend-prototype/components/recruiting/JobDetail.tsx`

**Data Used**:
- Single job by ID
- Account info (client)
- Submissions for this job
- Interviews for this job

### 4.2 Migration Steps

#### Step 1: Create Query Hook

```typescript
// src/hooks/queries/useJobDetail.ts

import { trpc } from '@/lib/trpc';

export function useJobDetail(id: string) {
  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
  } = trpc.ats.jobs.getById.useQuery(
    {
      id,
      include: { account: true, submissions: true },
    },
    { enabled: !!id }
  );

  const { data: metrics } = trpc.ats.jobs.metrics.useQuery(
    { jobId: id },
    { enabled: !!id }
  );

  return {
    job,
    metrics,
    isLoading: jobLoading,
    error: jobError,
  };
}
```

#### Step 2: Create Mutation Hooks

```typescript
// src/hooks/mutations/useJobActions.ts

import { trpc } from '@/lib/trpc';

export function useUpdateJobStatus() {
  const utils = trpc.useUtils();

  return trpc.ats.jobs.updateStatus.useMutation({
    onSuccess: (data) => {
      utils.ats.jobs.getById.invalidate({ id: data.id });
      utils.ats.jobs.list.invalidate();
    },
  });
}

export function useDeleteJob() {
  const utils = trpc.useUtils();
  const router = useRouter();

  return trpc.ats.jobs.delete.useMutation({
    onSuccess: () => {
      utils.ats.jobs.list.invalidate();
      router.push('/recruiting/jobs');
    },
  });
}
```

#### Step 3: Migrate Component

```typescript
// src/components/recruiting/JobDetail.tsx

'use client';

import { useParams } from 'next/navigation';
import { useJobDetail } from '@/hooks/queries/useJobDetail';
import { useUpdateJobStatus, useDeleteJob } from '@/hooks/mutations/useJobActions';
import { dbJobToFrontend } from '@/lib/adapters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { job, metrics, isLoading, error } = useJobDetail(id);
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();

  if (isLoading) return <JobDetailSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!job) return <NotFound />;

  const displayJob = dbJobToFrontend(job, job.account);

  const handleStatusChange = async (newStatus: string) => {
    await updateStatus.mutateAsync({
      id: job.id,
      status: newStatus,
    });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this job?')) {
      await deleteJob.mutateAsync({ id: job.id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{displayJob.title}</h1>
          <p className="text-muted-foreground">{displayJob.client}</p>
        </div>
        <div className="flex gap-2">
          <StatusDropdown
            currentStatus={displayJob.status}
            onStatusChange={handleStatusChange}
            isLoading={updateStatus.isLoading}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => /* navigate to edit */}>
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => /* duplicate */}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Job Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Status" value={displayJob.status} />
        <InfoCard label="Type" value={displayJob.type} />
        <InfoCard label="Rate" value={displayJob.rate} />
        <InfoCard label="Location" value={displayJob.location} />
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            label="Submissions"
            value={metrics.submissions.reduce((a, b) => a + b.count, 0)}
          />
          <MetricCard label="Interviews" value={metrics.interviews} />
          <MetricCard label="Offers" value={metrics.offers} />
        </div>
      )}

      {/* Description */}
      {job.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({job.submissions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsTable submissions={job.submissions || []} />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. PipelineView Migration

### 5.1 Current State

**File**: `frontend-prototype/components/recruiting/PipelineView.tsx`

**Data Used**:
- Submissions grouped by status
- Job details for each submission
- Candidate details for each submission

**Interactions**:
- Drag and drop to change status
- Quick view modal
- Status update

### 5.2 Migration Steps

#### Step 1: Create Query Hook

```typescript
// src/hooks/queries/usePipelineData.ts

import { trpc } from '@/lib/trpc';

export function usePipelineData(options?: { jobId?: string }) {
  const { data, isLoading, refetch } = trpc.ats.submissions.list.useQuery({
    jobId: options?.jobId,
    limit: 200,
    include: { job: true, candidate: true },
  });

  // Group submissions by status
  const pipeline = useMemo(() => {
    if (!data?.items) return {};

    return data.items.reduce((acc, submission) => {
      const status = submission.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(submission);
      return acc;
    }, {} as Record<string, typeof data.items>);
  }, [data?.items]);

  return {
    pipeline,
    submissions: data?.items || [],
    isLoading,
    refetch,
  };
}
```

#### Step 2: Create Status Update Mutation

```typescript
// src/hooks/mutations/useSubmissionActions.ts

import { trpc } from '@/lib/trpc';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

export function useUpdateSubmissionStatus() {
  const utils = trpc.useUtils();

  return trpc.ats.submissions.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await utils.ats.submissions.list.cancel();

      // Get current data
      const previousData = utils.ats.submissions.list.getData();

      // Optimistically update the UI
      utils.ats.submissions.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((sub) =>
            sub.id === id ? { ...sub, status } : sub
          ),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.ats.submissions.list.setData(undefined, context.previousData);
      }
    },
    onSettled: () => {
      utils.ats.submissions.list.invalidate();
    },
  });
}
```

#### Step 3: Migrate Component with DnD

```typescript
// src/components/recruiting/PipelineView.tsx

'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { usePipelineData } from '@/hooks/queries/usePipelineData';
import { useUpdateSubmissionStatus } from '@/hooks/mutations/useSubmissionActions';

const PIPELINE_STAGES = [
  { id: 'sourced', label: 'Sourced' },
  { id: 'screening', label: 'Screening' },
  { id: 'submission_ready', label: 'Ready to Submit' },
  { id: 'submitted_to_client', label: 'Submitted' },
  { id: 'client_review', label: 'Client Review' },
  { id: 'client_interview', label: 'Interview' },
  { id: 'offer_stage', label: 'Offer' },
  { id: 'placed', label: 'Placed' },
] as const;

export function PipelineView({ jobId }: { jobId?: string }) {
  const { pipeline, isLoading } = usePipelineData({ jobId });
  const updateStatus = useUpdateSubmissionStatus();

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const submissionId = result.draggableId;
    const newStatus = result.destination.droppableId;

    await updateStatus.mutateAsync({
      id: submissionId,
      status: newStatus,
    });
  };

  if (isLoading) return <PipelineSkeleton />;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.id} className="min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{stage.label}</h3>
              <Badge variant="secondary">
                {pipeline[stage.id]?.length || 0}
              </Badge>
            </div>

            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'min-h-[500px] rounded-lg bg-muted/50 p-2 space-y-2',
                    snapshot.isDraggingOver && 'bg-muted'
                  )}
                >
                  {(pipeline[stage.id] || []).map((submission, index) => (
                    <Draggable
                      key={submission.id}
                      draggableId={submission.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <SubmissionCard
                            submission={submission}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

function SubmissionCard({
  submission,
  isDragging,
}: {
  submission: Submission;
  isDragging: boolean;
}) {
  return (
    <Card
      className={cn(
        'cursor-grab active:cursor-grabbing',
        isDragging && 'shadow-lg rotate-2'
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{submission.candidate?.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {submission.job?.title}
            </p>
          </div>
          {submission.aiMatchScore && (
            <Badge variant={submission.aiMatchScore >= 80 ? 'success' : 'secondary'}>
              {submission.aiMatchScore}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(new Date(submission.updatedAt))} ago
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## 6. CandidateDetail Migration

### 6.1 Migration Steps

```typescript
// src/hooks/queries/useCandidateDetail.ts

export function useCandidateDetail(id: string) {
  const { data: candidate, isLoading } = trpc.users.candidates.getById.useQuery({
    id,
    include: {
      skills: true,
      submissions: true,
      placements: true,
      benchMetadata: true,
    },
  });

  return { candidate, isLoading };
}

// src/components/recruiting/CandidateDetail.tsx

export function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const { candidate, isLoading } = useCandidateDetail(id);
  const updateCandidate = useUpdateCandidate();

  if (isLoading) return <CandidateDetailSkeleton />;
  if (!candidate) return <NotFound />;

  const displayCandidate = dbCandidateToFrontend(candidate);

  return (
    <div className="space-y-6">
      {/* Header with avatar and name */}
      <header className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={candidate.avatarUrl} />
          <AvatarFallback>{getInitials(candidate.fullName)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{displayCandidate.name}</h1>
          <p className="text-muted-foreground">{displayCandidate.role}</p>
          <div className="flex gap-2 mt-2">
            <Badge>{displayCandidate.status}</Badge>
            {candidate.candidateCurrentVisa && (
              <Badge variant="outline">{candidate.candidateCurrentVisa}</Badge>
            )}
          </div>
        </div>
      </header>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <p>{candidate.email}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p>{candidate.phone || 'N/A'}</p>
          </div>
          <div>
            <Label>Location</Label>
            <p>{displayCandidate.location || 'N/A'}</p>
          </div>
          <div>
            <Label>Availability</Label>
            <p>{candidate.candidateAvailability || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {displayCandidate.skills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submission History */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionHistoryTable submissions={candidate.submissions || []} />
        </CardContent>
      </Card>

      {/* Placement History */}
      <Card>
        <CardHeader>
          <CardTitle>Placement History</CardTitle>
        </CardHeader>
        <CardContent>
          <PlacementHistoryTable placements={candidate.placements || []} />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 7. Generic Migration Template

Use this template for any component migration:

```typescript
// Step 1: Create query hook
// src/hooks/queries/use[Entity].ts

import { trpc } from '@/lib/trpc';

export function use[Entity]List(input?: ListInput) {
  return trpc.[module].[entity].list.useQuery(input);
}

export function use[Entity](id: string) {
  return trpc.[module].[entity].getById.useQuery(
    { id },
    { enabled: !!id }
  );
}

// Step 2: Create mutation hooks
// src/hooks/mutations/use[Entity]Actions.ts

export function useCreate[Entity]() {
  const utils = trpc.useUtils();
  return trpc.[module].[entity].create.useMutation({
    onSuccess: () => {
      utils.[module].[entity].list.invalidate();
    },
  });
}

export function useUpdate[Entity]() {
  const utils = trpc.useUtils();
  return trpc.[module].[entity].update.useMutation({
    onSuccess: (data) => {
      utils.[module].[entity].getById.invalidate({ id: data.id });
      utils.[module].[entity].list.invalidate();
    },
  });
}

export function useDelete[Entity]() {
  const utils = trpc.useUtils();
  return trpc.[module].[entity].delete.useMutation({
    onSuccess: () => {
      utils.[module].[entity].list.invalidate();
    },
  });
}

// Step 3: Create adapter
// src/lib/adapters/[entity].ts

export function db[Entity]ToFrontend(dbEntity: DB[Entity]): Frontend[Entity] {
  return {
    // Map fields
  };
}

export function frontend[Entity]ToDB(frontendEntity: Frontend[Entity], ctx: Context): DB[Entity] {
  return {
    // Map fields back
  };
}

// Step 4: Migrate component
// src/components/[module]/[Component].tsx

'use client';

import { use[Entity]List, use[Entity] } from '@/hooks/queries/use[Entity]';
import { useCreate[Entity], useUpdate[Entity], useDelete[Entity] } from '@/hooks/mutations/use[Entity]Actions';
import { db[Entity]ToFrontend } from '@/lib/adapters';

export function [Component]() {
  const { data, isLoading, error } = use[Entity]List();
  const create = useCreate[Entity]();
  const update = useUpdate[Entity]();
  const deleteEntity = useDelete[Entity]();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;

  const items = (data?.items || []).map(db[Entity]ToFrontend);

  return (
    // Component JSX
  );
}
```

---

## 8. Testing Checklist

### 8.1 Pre-Migration Tests

- [ ] Document current component behavior
- [ ] Write E2E tests for existing functionality
- [ ] Capture performance baseline
- [ ] List all data dependencies

### 8.2 During Migration Tests

- [ ] Unit test adapters
- [ ] Unit test query hooks
- [ ] Unit test mutation hooks
- [ ] Integration test component with mocked tRPC

### 8.3 Post-Migration Tests

- [ ] E2E tests pass with real API
- [ ] Loading states work correctly
- [ ] Error states are handled
- [ ] Optimistic updates work
- [ ] Cache invalidation is correct
- [ ] Performance is acceptable
- [ ] No console errors/warnings

### 8.4 Acceptance Criteria Template

```markdown
## Component: [ComponentName]

### Functional Requirements
- [ ] List view displays data from API
- [ ] Detail view loads correctly
- [ ] Create form submits to API
- [ ] Update form persists changes
- [ ] Delete removes item with confirmation
- [ ] Filters work correctly
- [ ] Pagination works correctly
- [ ] Search works correctly

### Non-Functional Requirements
- [ ] Loading skeleton displays during fetch
- [ ] Error message displays on API error
- [ ] Retry button works on error
- [ ] Empty state displays when no data
- [ ] Performance < 2s initial load
- [ ] Optimistic updates for status changes
- [ ] No layout shift during loading

### Edge Cases
- [ ] Handles deleted referenced data
- [ ] Handles permission errors
- [ ] Handles network disconnection
- [ ] Handles concurrent updates
```

---

## Appendix: Common Patterns

### A.1 Pagination Pattern

```typescript
// Cursor-based pagination
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  trpc.[module].[entity].list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

// In component
<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
  isLoading={isFetchingNextPage}
>
  {data?.pages.flatMap(page => page.items).map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</InfiniteScroll>
```

### A.2 Optimistic Update Pattern

```typescript
useMutation({
  onMutate: async (newData) => {
    await utils.query.cancel();
    const previousData = utils.query.getData();
    utils.query.setData((old) => optimisticallyUpdate(old, newData));
    return { previousData };
  },
  onError: (err, variables, context) => {
    utils.query.setData(context?.previousData);
  },
  onSettled: () => {
    utils.query.invalidate();
  },
});
```

### A.3 Form Submission Pattern

```typescript
const form = useForm<CreateInput>({
  resolver: zodResolver(createSchema),
  defaultValues: { /* ... */ },
});

const create = useCreateEntity();

const onSubmit = async (data: CreateInput) => {
  try {
    await create.mutateAsync(data);
    toast.success('Created successfully');
    form.reset();
    router.push('/list');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### A.4 Error Handling Pattern

```typescript
function ErrorState({ error }: { error: TRPCError }) {
  if (error.code === 'NOT_FOUND') {
    return <NotFound />;
  }
  if (error.code === 'UNAUTHORIZED') {
    return <Redirect to="/login" />;
  }
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message}
        <Button onClick={refetch}>Retry</Button>
      </AlertDescription>
    </Alert>
  );
}
```
