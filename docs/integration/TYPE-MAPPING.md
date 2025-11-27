# InTime v3 Type Mapping Reference

**Document Version:** 1.0
**Date:** 2025-11-26

This document provides field-by-field mapping between frontend prototype types and database schema.

---

## 1. Job Entity

### Frontend Type (`frontend-prototype/types.ts`)
```typescript
interface Job {
  id: string;
  accountId: string;
  title: string;
  status: 'open' | 'filled' | 'urgent' | 'hold' | 'draft';
  type: 'Contract' | 'Full-time' | 'C2H';
  rate: string;
  location: string;
  ownerId: string;
  description?: string;
  client: string;
}
```

### Database Schema (`src/lib/db/schema/ats.ts`)
```typescript
const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  accountId: uuid('account_id'),
  dealId: uuid('deal_id'),
  title: text('title').notNull(),
  description: text('description'),
  jobType: text('job_type').default('contract'),
  location: text('location'),
  isRemote: boolean('is_remote').default(false),
  hybridDays: integer('hybrid_days'),
  rateMin: numeric('rate_min'),
  rateMax: numeric('rate_max'),
  rateType: text('rate_type').default('hourly'),
  currency: text('currency').default('USD'),
  status: text('status').notNull().default('draft'),
  urgency: text('urgency').default('medium'),
  positionsCount: integer('positions_count').default(1),
  positionsFilled: integer('positions_filled').default(0),
  requiredSkills: text('required_skills').array(),
  niceToHaveSkills: text('nice_to_have_skills').array(),
  minExperienceYears: integer('min_experience_years'),
  maxExperienceYears: integer('max_experience_years'),
  visaRequirements: text('visa_requirements').array(),
  ownerId: uuid('owner_id').notNull(),
  recruiterIds: uuid('recruiter_ids').array(),
  postedDate: timestamp('posted_date'),
  targetFillDate: timestamp('target_fill_date'),
  filledDate: timestamp('filled_date'),
  clientSubmissionInstructions: text('client_submission_instructions'),
  clientInterviewProcess: text('client_interview_process'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  createdBy: uuid('created_by'),
  deletedAt: timestamp('deleted_at'),
  searchVector: text('search_vector'),
});
```

### Mapping Table

| Frontend | Database | Transform |
|----------|----------|-----------|
| `id` | `id` | Direct |
| `accountId` | `accountId` | Direct |
| `title` | `title` | Direct |
| `status` | `status` | Map: `'hold' → 'on_hold'`, `'urgent' → status: 'open' + urgency: 'urgent'` |
| `type` | `jobType` | Map: `'Contract' → 'contract'`, `'Full-time' → 'permanent'`, `'C2H' → 'contract_to_hire'` |
| `rate` | `rateMin`, `rateMax`, `rateType` | Parse: `"$100-120/hr"` → `{rateMin: 100, rateMax: 120, rateType: 'hourly'}` |
| `location` | `location` | Direct |
| `ownerId` | `ownerId` | Direct |
| `description` | `description` | Direct |
| `client` | N/A (join) | Compute: `account.name` via accountId join |
| N/A | `orgId` | From context |
| N/A | `dealId` | Add to frontend |
| N/A | `isRemote` | Add to frontend |
| N/A | `hybridDays` | Add to frontend |
| N/A | `currency` | Add to frontend (default: 'USD') |
| N/A | `positionsCount` | Add to frontend (default: 1) |
| N/A | `requiredSkills` | Add to frontend |
| N/A | `visaRequirements` | Add to frontend |
| N/A | `recruiterIds` | Add to frontend |
| N/A | `postedDate` | Add to frontend |
| N/A | `targetFillDate` | Add to frontend |

### Adapter Function

```typescript
// src/lib/adapters/job.ts

import type { Job as DBJob } from '@/lib/db/schema/ats';
import type { Job as FrontendJob } from '@/types/frontend';

export function dbJobToFrontend(
  job: DBJob,
  account?: { name: string }
): FrontendJob {
  return {
    id: job.id,
    accountId: job.accountId || '',
    title: job.title,
    status: mapJobStatus(job.status, job.urgency),
    type: mapJobType(job.jobType),
    rate: formatRate(job.rateMin, job.rateMax, job.rateType),
    location: job.location || '',
    ownerId: job.ownerId,
    description: job.description || undefined,
    client: account?.name || '',
  };
}

export function frontendJobToDB(
  job: Partial<FrontendJob>,
  orgId: string
): Partial<DBJob> {
  const { status, urgency } = parseJobStatus(job.status);
  const { rateMin, rateMax, rateType } = parseRate(job.rate);

  return {
    orgId,
    accountId: job.accountId || null,
    title: job.title || '',
    description: job.description || null,
    jobType: mapFrontendJobType(job.type),
    location: job.location || null,
    rateMin: rateMin?.toString() || null,
    rateMax: rateMax?.toString() || null,
    rateType,
    status,
    urgency,
    ownerId: job.ownerId || '',
  };
}

function mapJobStatus(status: string, urgency?: string): FrontendJob['status'] {
  if (status === 'open' && urgency === 'urgent') return 'urgent';
  if (status === 'on_hold') return 'hold';
  return status as FrontendJob['status'];
}

function mapJobType(type?: string): FrontendJob['type'] {
  const map: Record<string, FrontendJob['type']> = {
    'contract': 'Contract',
    'permanent': 'Full-time',
    'contract_to_hire': 'C2H',
    'temp': 'Contract',
  };
  return map[type || 'contract'] || 'Contract';
}

function formatRate(min?: string | null, max?: string | null, type?: string | null): string {
  if (!min && !max) return 'N/A';
  const prefix = type === 'annual' ? '' : '$';
  const suffix = type === 'hourly' ? '/hr' : type === 'annual' ? '/yr' : '';
  if (min && max && min !== max) return `${prefix}${min}-${max}${suffix}`;
  return `${prefix}${min || max}${suffix}`;
}
```

---

## 2. Candidate Entity

### Frontend Type
```typescript
interface Candidate {
  id: string;
  name: string;
  role: string;
  status: 'new' | 'active' | 'placed' | 'bench' | 'student' | 'alumni' | 'blacklisted';
  type: 'external' | 'internal_bench' | 'student';
  skills: string[];
  experience: string;
  location: string;
  rate: string;
  email: string;
  score: number;
  notes?: string;
  source?: 'Academy' | 'LinkedIn' | 'Referral' | 'Recruiting' | 'Academy Sales';
  ownerId?: string;
}
```

### Database Schema (`src/lib/db/schema/user-profiles.ts`)
```typescript
const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: uuid('auth_id').unique(),
  orgId: uuid('org_id').notNull(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  timezone: text('timezone').default('America/New_York'),
  locale: text('locale').default('en-US'),
  // Candidate fields
  candidateStatus: text('candidate_status'),
  candidateResumeUrl: text('candidate_resume_url'),
  candidateSkills: text('candidate_skills').array(),
  candidateExperienceYears: integer('candidate_experience_years'),
  candidateCurrentVisa: text('candidate_current_visa'),
  candidateVisaExpiry: timestamp('candidate_visa_expiry'),
  candidateHourlyRate: numeric('candidate_hourly_rate'),
  candidateBenchStartDate: timestamp('candidate_bench_start_date'),
  candidateAvailability: text('candidate_availability'),
  candidateLocation: text('candidate_location'),
  candidateWillingToRelocate: boolean('candidate_willing_to_relocate').default(false),
  // ... employee fields, student fields, client fields
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
  isActive: boolean('is_active').default(true),
});
```

### Mapping Table

| Frontend | Database | Transform |
|----------|----------|-----------|
| `id` | `id` | Direct |
| `name` | `fullName` | Direct |
| `role` | `employeePosition` | Direct |
| `status` | `candidateStatus` | Direct |
| `type` | N/A | Computed from status/source |
| `skills` | `candidateSkills` | Direct (array) |
| `experience` | `candidateExperienceYears` | Format: `${years} years` |
| `location` | `candidateLocation` | Direct |
| `rate` | `candidateHourlyRate` | Format: `$${rate}/hr` |
| `email` | `email` | Direct |
| `score` | N/A | Compute from AI/submissions |
| `notes` | N/A | Add to model or use activity_log |
| `source` | N/A | Add field to user_profiles |
| `ownerId` | N/A | Add field for recruiter assignment |
| N/A | `candidateResumeUrl` | Add to frontend |
| N/A | `candidateCurrentVisa` | Add to frontend |
| N/A | `candidateVisaExpiry` | Add to frontend |
| N/A | `candidateAvailability` | Add to frontend |
| N/A | `candidateWillingToRelocate` | Add to frontend |

### Adapter Function

```typescript
// src/lib/adapters/candidate.ts

import type { UserProfile } from '@/lib/db/schema/user-profiles';
import type { Candidate } from '@/types/frontend';

export function dbCandidateToFrontend(
  user: UserProfile,
  options?: { matchScore?: number }
): Candidate {
  return {
    id: user.id,
    name: user.fullName,
    role: user.employeePosition || 'Candidate',
    status: mapCandidateStatus(user.candidateStatus),
    type: determineCandidateType(user),
    skills: user.candidateSkills || [],
    experience: user.candidateExperienceYears
      ? `${user.candidateExperienceYears} years`
      : 'N/A',
    location: user.candidateLocation || '',
    rate: user.candidateHourlyRate
      ? `$${user.candidateHourlyRate}/hr`
      : 'N/A',
    email: user.email,
    score: options?.matchScore || 0,
    notes: undefined,
    source: undefined,
    ownerId: undefined,
  };
}

function mapCandidateStatus(status?: string | null): Candidate['status'] {
  const validStatuses: Candidate['status'][] = [
    'new', 'active', 'placed', 'bench', 'student', 'alumni', 'blacklisted'
  ];
  return validStatuses.includes(status as Candidate['status'])
    ? (status as Candidate['status'])
    : 'active';
}

function determineCandidateType(user: UserProfile): Candidate['type'] {
  if (user.studentEnrollmentDate) return 'student';
  if (user.candidateStatus === 'bench') return 'internal_bench';
  return 'external';
}
```

---

## 3. Account Entity

### Frontend Type
```typescript
interface Account {
  id: string;
  name: string;
  industry: string;
  status: 'Prospect' | 'Active' | 'Churned' | 'Hold';
  type: 'Direct Client' | 'MSP/VMS' | 'Implementation Partner';
  accountManagerId: string;
  logo?: string;
  responsiveness: 'High' | 'Medium' | 'Low';
  preference: 'Quality' | 'Quantity' | 'Speed';
  description?: string;
  pocs: PointOfContact[];
  activityLog?: { date: string; action: string; note?: string }[];
}
```

### Database Schema
```typescript
const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  name: text('name').notNull(),
  industry: text('industry'),
  companyType: text('company_type').default('direct_client'),
  status: text('status').notNull().default('prospect'),
  tier: text('tier'),
  accountManagerId: uuid('account_manager_id'),
  responsiveness: text('responsiveness'),
  preferredQuality: text('preferred_quality'),
  description: text('description'),
  contractStartDate: timestamp('contract_start_date'),
  contractEndDate: timestamp('contract_end_date'),
  paymentTermsDays: integer('payment_terms_days').default(30),
  markupPercentage: numeric('markup_percentage'),
  annualRevenueTarget: numeric('annual_revenue_target'),
  website: text('website'),
  headquartersLocation: text('headquarters_location'),
  phone: text('phone'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  deletedAt: timestamp('deleted_at'),
});
```

### Mapping Table

| Frontend | Database | Transform |
|----------|----------|-----------|
| `id` | `id` | Direct |
| `name` | `name` | Direct |
| `industry` | `industry` | Direct |
| `status` | `status` | Map: lowercase |
| `type` | `companyType` | Map enum values |
| `accountManagerId` | `accountManagerId` | Direct |
| `logo` | N/A | Add to schema or use file_uploads |
| `responsiveness` | `responsiveness` | Map: lowercase |
| `preference` | `preferredQuality` | Map values |
| `description` | `description` | Direct |
| `pocs` | `point_of_contacts` | Join table |
| `activityLog` | `activity_log` | Join table |
| N/A | `tier` | Add to frontend |
| N/A | `contractStartDate` | Add to frontend |
| N/A | `contractEndDate` | Add to frontend |
| N/A | `paymentTermsDays` | Add to frontend |
| N/A | `markupPercentage` | Add to frontend |

### Adapter Function

```typescript
// src/lib/adapters/account.ts

import type { Account as DBAccount, PointOfContact as DBPOC } from '@/lib/db/schema/crm';
import type { Account, PointOfContact } from '@/types/frontend';

export function dbAccountToFrontend(
  account: DBAccount,
  pocs?: DBPOC[],
  activities?: any[]
): Account {
  return {
    id: account.id,
    name: account.name,
    industry: account.industry || '',
    status: mapAccountStatus(account.status),
    type: mapCompanyType(account.companyType),
    accountManagerId: account.accountManagerId || '',
    logo: undefined,
    responsiveness: mapResponsiveness(account.responsiveness),
    preference: mapPreferredQuality(account.preferredQuality),
    description: account.description || undefined,
    pocs: (pocs || []).map(dbPocToFrontend),
    activityLog: (activities || []).map(a => ({
      date: a.activityDate?.toISOString() || '',
      action: a.activityType || '',
      note: a.description || undefined,
    })),
  };
}

function mapAccountStatus(status?: string | null): Account['status'] {
  const map: Record<string, Account['status']> = {
    'prospect': 'Prospect',
    'active': 'Active',
    'inactive': 'Hold',
    'churned': 'Churned',
  };
  return map[status || 'prospect'] || 'Prospect';
}

function mapCompanyType(type?: string | null): Account['type'] {
  const map: Record<string, Account['type']> = {
    'direct_client': 'Direct Client',
    'vendor': 'MSP/VMS',
    'partner': 'Implementation Partner',
  };
  return map[type || 'direct_client'] || 'Direct Client';
}

function mapResponsiveness(value?: string | null): Account['responsiveness'] {
  const map: Record<string, Account['responsiveness']> = {
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
  };
  return map[value || 'medium'] || 'Medium';
}

function mapPreferredQuality(value?: string | null): Account['preference'] {
  const map: Record<string, Account['preference']> = {
    'premium': 'Quality',
    'standard': 'Speed',
    'budget': 'Quantity',
  };
  return map[value || 'standard'] || 'Quality';
}

function dbPocToFrontend(poc: DBPOC): PointOfContact {
  return {
    id: poc.id,
    name: `${poc.firstName} ${poc.lastName}`,
    role: poc.title || '',
    email: poc.email,
    phone: poc.phone || undefined,
    preference: mapContactPreference(poc.preferredContactMethod),
    influence: mapInfluence(poc.decisionAuthority),
  };
}
```

---

## 4. Submission Entity

### Frontend Type
```typescript
interface Submission {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'sourced' | 'screening' | 'submission_ready' | 'submitted_to_client' |
          'client_interview' | 'offer' | 'placed' | 'rejected';
  createdAt: string;
  lastActivity: string;
  notes?: string;
  matchScore: number;
}
```

### Database Schema
```typescript
const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  jobId: uuid('job_id').notNull(),
  candidateId: uuid('candidate_id').notNull(),
  accountId: uuid('account_id'),
  status: text('status').notNull().default('sourced'),
  aiMatchScore: integer('ai_match_score'),
  recruiterMatchScore: integer('recruiter_match_score'),
  matchExplanation: text('match_explanation'),
  submittedRate: numeric('submitted_rate'),
  submittedRateType: text('submitted_rate_type').default('hourly'),
  submissionNotes: text('submission_notes'),
  submittedToClientAt: timestamp('submitted_to_client_at'),
  submittedToClientBy: uuid('submitted_to_client_by'),
  clientResumeFileId: uuid('client_resume_file_id'),
  clientProfileUrl: text('client_profile_url'),
  interviewCount: integer('interview_count').default(0),
  lastInterviewDate: timestamp('last_interview_date'),
  interviewFeedback: text('interview_feedback'),
  offerExtendedAt: timestamp('offer_extended_at'),
  offerAcceptedAt: timestamp('offer_accepted_at'),
  offerDeclinedAt: timestamp('offer_declined_at'),
  offerDeclineReason: text('offer_decline_reason'),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  rejectionSource: text('rejection_source'),
  ownerId: uuid('owner_id').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  createdBy: uuid('created_by'),
  deletedAt: timestamp('deleted_at'),
});
```

### Mapping Table

| Frontend | Database | Transform |
|----------|----------|-----------|
| `id` | `id` | Direct |
| `jobId` | `jobId` | Direct |
| `candidateId` | `candidateId` | Direct |
| `status` | `status` | Direct (values match) |
| `createdAt` | `createdAt` | Format date |
| `lastActivity` | `updatedAt` | Format date |
| `notes` | `submissionNotes` | Direct |
| `matchScore` | `aiMatchScore` | Direct |
| N/A | `orgId` | From context |
| N/A | `accountId` | Add to frontend |
| N/A | `ownerId` | Add to frontend |
| N/A | `submittedRate` | Add to frontend |
| N/A | `interviewCount` | Add to frontend |
| N/A | `rejectionReason` | Add to frontend |

### Adapter Function

```typescript
// src/lib/adapters/submission.ts

import type { Submission as DBSubmission } from '@/lib/db/schema/ats';
import type { Submission } from '@/types/frontend';

export function dbSubmissionToFrontend(sub: DBSubmission): Submission {
  return {
    id: sub.id,
    jobId: sub.jobId,
    candidateId: sub.candidateId,
    status: sub.status as Submission['status'],
    createdAt: sub.createdAt?.toISOString() || '',
    lastActivity: sub.updatedAt?.toISOString() || '',
    notes: sub.submissionNotes || undefined,
    matchScore: sub.aiMatchScore || 0,
  };
}

export function frontendSubmissionToDB(
  sub: Partial<Submission>,
  ctx: { orgId: string; userId: string }
): Partial<DBSubmission> {
  return {
    orgId: ctx.orgId,
    jobId: sub.jobId,
    candidateId: sub.candidateId,
    status: sub.status,
    submissionNotes: sub.notes || null,
    aiMatchScore: sub.matchScore,
    ownerId: ctx.userId,
    createdBy: ctx.userId,
  };
}
```

---

## 5. Lead Entity

### Mapping Table

| Frontend | Database | Transform |
|----------|----------|-----------|
| `id` | `id` | Direct |
| `company` | `companyName` | Rename |
| `firstName` | `firstName` | Direct |
| `lastName` | `lastName` | Direct |
| `title` | `title` | Direct |
| `email` | `email` | Direct |
| `phone` | `phone` | Direct |
| `status` | `status` | Direct |
| `value` | `estimatedValue` | Parse/format number |
| `source` | `source` | Direct |
| `lastAction` | N/A | Compute from activity_log |
| `notes` | N/A | Add to schema or use activity_log |
| `contact` | N/A | Compute: `${firstName} ${lastName}` |
| N/A | `leadType` | Add to frontend |
| N/A | `industry` | Add to frontend |
| N/A | `companySize` | Add to frontend |
| N/A | `linkedinUrl` | Add to frontend |
| N/A | `engagementScore` | Add to frontend |
| N/A | `convertedToDealId` | Add to frontend |
| N/A | `convertedToAccountId` | Add to frontend |

---

## 6. Deal Entity

### Mapping Table

| Frontend | Database | Transform |
|----------|----------|-----------|
| `id` | `id` | Direct |
| `leadId` | `leadId` | Direct |
| `company` | Via accountId/leadId join | Compute |
| `title` | `title` | Direct |
| `value` | `value` | Parse/format number |
| `stage` | `stage` | Map stages |
| `probability` | `probability` | Direct |
| `expectedClose` | `expectedCloseDate` | Format date |
| `ownerId` | `ownerId` | Direct |
| `notes` | `description` | Rename |
| N/A | `accountId` | Add to frontend |
| N/A | `linkedJobIds` | Add to frontend |
| N/A | `actualCloseDate` | Add to frontend |
| N/A | `closeReason` | Add to frontend |

### Stage Mapping

| Frontend Stage | Database Stage |
|---------------|----------------|
| `'Prospect'` | `'discovery'` |
| `'Discovery'` | `'discovery'` |
| `'Proposal'` | `'proposal'` |
| `'Negotiation'` | `'negotiation'` |
| `'Won'` | `'closed_won'` |
| `'Lost'` | `'closed_lost'` |

---

## 7. Employee Entity

### Mapping Table

| Frontend | Database | Transform |
|----------|----------|-----------|
| `id` | `id` (user_profiles) | Direct |
| `firstName` | `fullName` | Parse first word |
| `lastName` | `fullName` | Parse last word(s) |
| `email` | `email` | Direct |
| `role` | `employeePosition` | Direct |
| `department` | `employeeDepartment` | Direct |
| `startDate` | `employeeHireDate` | Format date |
| `status` | `employeeStatus` | Map values |
| `manager` | `employeeManagerId` | Join to get name |
| `location` | N/A in user_profiles | Add or use employee_metadata |
| `salary` | `employeeSalary` | Format currency |
| `pod` | `recruiterPodId` | Join with pods table |
| `image` | `avatarUrl` | Direct |

---

## 8. BenchConsultant Entity

### Mapping (extends Candidate)

| Frontend | Database | Transform |
|----------|----------|-----------|
| All Candidate fields | As above | See Candidate section |
| `daysOnBench` | `bench_metadata.daysOnBench` | Join with bench_metadata |
| `lastContact` | `bench_metadata.lastContactedAt` | Format date |
| `visaStatus` | `user_profiles.candidateCurrentVisa` | Direct |
| N/A | `bench_metadata.benchStartDate` | Add to frontend |
| N/A | `bench_metadata.benchSalesRepId` | Add to frontend |
| N/A | `bench_metadata.hasActiveImmigrationCase` | Add to frontend |
| N/A | `bench_metadata.immigrationCaseId` | Add to frontend |
| N/A | `bench_metadata.alert30DaySent` | Add to frontend |
| N/A | `bench_metadata.alert60DaySent` | Add to frontend |
| N/A | `bench_metadata.hotlistSendCount` | Add to frontend |

---

## 9. Shared Type Utilities

### Status Mapping Utilities

```typescript
// src/lib/adapters/utils/status-maps.ts

export const jobStatusMap = {
  toFrontend: {
    'draft': 'draft',
    'open': 'open',
    'on_hold': 'hold',
    'filled': 'filled',
    'cancelled': 'draft',
  } as const,
  toDatabase: {
    'draft': 'draft',
    'open': 'open',
    'urgent': 'open', // urgency handled separately
    'hold': 'on_hold',
    'filled': 'filled',
  } as const,
};

export const candidateStatusMap = {
  toFrontend: {
    'active': 'active',
    'placed': 'placed',
    'bench': 'bench',
    'inactive': 'blacklisted',
    'blacklisted': 'blacklisted',
  } as const,
  toDatabase: {
    'new': 'active',
    'active': 'active',
    'placed': 'placed',
    'bench': 'bench',
    'student': 'active',
    'alumni': 'inactive',
    'blacklisted': 'blacklisted',
  } as const,
};

export const accountStatusMap = {
  toFrontend: {
    'prospect': 'Prospect',
    'active': 'Active',
    'inactive': 'Hold',
    'churned': 'Churned',
  } as const,
  toDatabase: {
    'Prospect': 'prospect',
    'Active': 'active',
    'Hold': 'inactive',
    'Churned': 'churned',
  } as const,
};

export const dealStageMap = {
  toFrontend: {
    'discovery': 'Discovery',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation',
    'closed_won': 'Won',
    'closed_lost': 'Lost',
  } as const,
  toDatabase: {
    'Prospect': 'discovery',
    'Discovery': 'discovery',
    'Proposal': 'proposal',
    'Negotiation': 'negotiation',
    'Won': 'closed_won',
    'Lost': 'closed_lost',
  } as const,
};
```

### Date Formatting Utilities

```typescript
// src/lib/adapters/utils/date-format.ts

export function formatDateForFrontend(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

export function formatDateTimeForFrontend(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toISOString();
}

export function parseDateFromFrontend(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}
```

### Rate Formatting Utilities

```typescript
// src/lib/adapters/utils/rate-format.ts

interface ParsedRate {
  min: number | null;
  max: number | null;
  type: 'hourly' | 'annual' | 'daily';
}

export function parseRateString(rate: string): ParsedRate {
  // Handle formats like "$100-120/hr", "$100/hr", "100k/yr"
  const hourlyMatch = rate.match(/\$?([\d,]+)(?:-([\d,]+))?\s*\/?\s*(hr|hour)/i);
  if (hourlyMatch) {
    return {
      min: parseFloat(hourlyMatch[1].replace(',', '')),
      max: hourlyMatch[2] ? parseFloat(hourlyMatch[2].replace(',', '')) : null,
      type: 'hourly',
    };
  }

  const annualMatch = rate.match(/\$?([\d,]+)(?:k)?(?:-([\d,]+)(?:k)?)?\s*\/?\s*(yr|year|annual)/i);
  if (annualMatch) {
    const multiplier = rate.toLowerCase().includes('k') ? 1000 : 1;
    return {
      min: parseFloat(annualMatch[1].replace(',', '')) * multiplier,
      max: annualMatch[2] ? parseFloat(annualMatch[2].replace(',', '')) * multiplier : null,
      type: 'annual',
    };
  }

  // Default: try to parse as hourly
  const numMatch = rate.match(/\$?([\d,]+)/);
  return {
    min: numMatch ? parseFloat(numMatch[1].replace(',', '')) : null,
    max: null,
    type: 'hourly',
  };
}

export function formatRate(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  type: string | null | undefined = 'hourly'
): string {
  const minNum = typeof min === 'string' ? parseFloat(min) : min;
  const maxNum = typeof max === 'string' ? parseFloat(max) : max;

  if (!minNum && !maxNum) return 'N/A';

  const suffix = type === 'hourly' ? '/hr' : type === 'annual' ? '/yr' : '';

  if (minNum && maxNum && minNum !== maxNum) {
    return `$${minNum.toLocaleString()}-${maxNum.toLocaleString()}${suffix}`;
  }

  return `$${(minNum || maxNum)?.toLocaleString()}${suffix}`;
}
```

---

## 10. Aligned TypeScript Types

Based on the mapping analysis, here are the recommended aligned types:

```typescript
// src/types/aligned/ats.ts

export interface AlignedJob {
  // From frontend
  id: string;
  accountId: string | null;
  title: string;
  status: 'draft' | 'open' | 'on_hold' | 'filled' | 'cancelled';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  jobType: 'contract' | 'contract_to_hire' | 'permanent' | 'temp';
  location: string | null;
  isRemote: boolean;
  ownerId: string;
  description: string | null;

  // Rate structure (from database)
  rateMin: number | null;
  rateMax: number | null;
  rateType: 'hourly' | 'daily' | 'annual';
  currency: string;

  // Additional from database
  dealId: string | null;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  visaRequirements: string[];
  positionsCount: number;
  positionsFilled: number;
  recruiterIds: string[];
  postedDate: Date | null;
  targetFillDate: Date | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;

  // Computed/joined
  client?: {
    id: string;
    name: string;
  };
}

export interface AlignedCandidate {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;

  // Candidate-specific
  status: 'active' | 'placed' | 'bench' | 'inactive' | 'blacklisted';
  skills: string[];
  experienceYears: number | null;
  location: string | null;
  hourlyRate: number | null;
  resumeUrl: string | null;
  currentVisa: string | null;
  visaExpiry: Date | null;
  availability: 'immediate' | '2_weeks' | '1_month' | null;
  willingToRelocate: boolean;

  // Bench metadata (if applicable)
  benchStartDate?: Date | null;
  daysOnBench?: number | null;
  benchSalesRepId?: string | null;

  // Computed
  displayRate: string;
  displayExperience: string;
}

export interface AlignedSubmission {
  id: string;
  jobId: string;
  candidateId: string;
  accountId: string | null;
  ownerId: string;

  status: 'sourced' | 'screening' | 'submission_ready' | 'submitted_to_client' |
          'client_review' | 'client_interview' | 'offer_stage' | 'placed' | 'rejected';

  aiMatchScore: number | null;
  recruiterMatchScore: number | null;
  matchExplanation: string | null;

  submittedRate: number | null;
  submittedRateType: 'hourly' | 'annual';
  submissionNotes: string | null;

  submittedToClientAt: Date | null;
  interviewCount: number;
  lastInterviewDate: Date | null;

  rejectedAt: Date | null;
  rejectionReason: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Joined
  job?: AlignedJob;
  candidate?: AlignedCandidate;
}
```

---

## Appendix: Migration Checklist per Entity

### Job Migration Checklist
- [ ] Create adapter: `src/lib/adapters/job.ts`
- [ ] Add rate parsing utility
- [ ] Update frontend Job interface with additional fields
- [ ] Create display components for new fields
- [ ] Update all forms to include new fields
- [ ] Add validation schemas
- [ ] Update tRPC queries/mutations

### Candidate Migration Checklist
- [ ] Create adapter: `src/lib/adapters/candidate.ts`
- [ ] Add bench metadata join logic
- [ ] Update frontend Candidate interface
- [ ] Add visa/availability display components
- [ ] Update candidate forms
- [ ] Add skill junction table handling

### Account Migration Checklist
- [ ] Create adapter: `src/lib/adapters/account.ts`
- [ ] Add POC join logic
- [ ] Add activity log join logic
- [ ] Update frontend Account interface
- [ ] Add tier/contract date display
- [ ] Update account forms

Continue for all entities...
