/**
 * Job Type Adapter
 *
 * Transforms between database Job type and frontend display type.
 */

import type { AlignedJob, DisplayJob, JobStatus, JobType, JobUrgency, RateType } from '@/types/aligned/ats';

// ============================================
// DATABASE TO FRONTEND
// ============================================

export function dbJobToDisplay(
  job: AlignedJob,
  account?: { id: string; name: string } | null
): DisplayJob {
  return {
    id: job.id,
    accountId: job.accountId || '',
    title: job.title,
    status: mapJobStatusToFrontend(job.status, job.urgency),
    type: mapJobTypeToFrontend(job.jobType),
    rate: formatRate(job.rateMin, job.rateMax, job.rateType),
    location: formatLocation(job.location, job.isRemote),
    ownerId: job.ownerId,
    description: job.description || undefined,
    client: account?.name || job.account?.name || '',
    // Extended fields
    positionsCount: job.positionsCount,
    positionsFilled: job.positionsFilled,
    isRemote: job.isRemote,
    requiredSkills: job.requiredSkills || [],
    createdAt: job.createdAt.toISOString(),
    // Additional display fields
    accountName: account?.name || job.account?.name || undefined,
    pipelineCount: job._count?.submissions ?? 0,
    rateMin: job.rateMin,
    rateMax: job.rateMax,
    rateType: job.rateType,
    niceToHaveSkills: job.niceToHaveSkills || [],
    minExperienceYears: job.minExperienceYears,
    maxExperienceYears: job.maxExperienceYears,
    visaRequirements: job.visaRequirements || [],
    targetFillDate: job.targetFillDate?.toISOString() || null,
    postedDate: job.postedDate?.toISOString() || null,
    clientSubmissionInstructions: job.clientSubmissionInstructions,
    clientInterviewProcess: job.clientInterviewProcess,
    ownerName: job.owner?.fullName,
    updatedAt: job.updatedAt.toISOString(),
  };
}

export function dbJobsToDisplay(
  jobs: AlignedJob[],
  accountsMap?: Map<string, { id: string; name: string }>
): DisplayJob[] {
  return jobs.map(job => {
    const account = job.account || (job.accountId ? accountsMap?.get(job.accountId) : null);
    return dbJobToDisplay(job, account);
  });
}

// ============================================
// FRONTEND TO DATABASE
// ============================================

export interface CreateJobInput {
  accountId?: string;
  title: string;
  description?: string;
  type?: 'Contract' | 'Full-time' | 'C2H';
  status?: 'open' | 'filled' | 'urgent' | 'hold' | 'draft';
  rate?: string;
  location?: string;
  isRemote?: boolean;
  ownerId?: string;
  requiredSkills?: string[];
}

export function displayJobToDb(
  input: CreateJobInput,
  ctx: { orgId: string; userId: string }
): Partial<AlignedJob> {
  const { status, urgency } = parseJobStatus(input.status);
  const { rateMin, rateMax, rateType } = parseRate(input.rate);

  return {
    orgId: ctx.orgId,
    accountId: input.accountId || null,
    title: input.title,
    description: input.description || null,
    jobType: mapFrontendJobType(input.type),
    status,
    urgency,
    location: input.location || null,
    isRemote: input.isRemote || false,
    rateMin,
    rateMax,
    rateType,
    currency: 'USD',
    requiredSkills: input.requiredSkills || [],
    niceToHaveSkills: [],
    visaRequirements: [],
    positionsCount: 1,
    positionsFilled: 0,
    ownerId: input.ownerId || ctx.userId,
    recruiterIds: [],
    createdBy: ctx.userId,
  };
}

// ============================================
// STATUS MAPPING
// ============================================

function mapJobStatusToFrontend(
  status: JobStatus,
  urgency?: JobUrgency | null
): DisplayJob['status'] {
  if (status === 'open' && urgency === 'urgent') return 'urgent';
  if (status === 'on_hold') return 'hold';
  if (status === 'cancelled') return 'draft';
  return status as DisplayJob['status'];
}

function parseJobStatus(frontendStatus?: DisplayJob['status']): {
  status: JobStatus;
  urgency: JobUrgency;
} {
  switch (frontendStatus) {
    case 'urgent':
      return { status: 'open', urgency: 'urgent' };
    case 'hold':
      return { status: 'on_hold', urgency: 'medium' };
    default:
      return {
        status: (frontendStatus as JobStatus) || 'draft',
        urgency: 'medium',
      };
  }
}

// ============================================
// JOB TYPE MAPPING
// ============================================

function mapJobTypeToFrontend(type: JobType | null | undefined): DisplayJob['type'] {
  const map: Record<JobType, DisplayJob['type']> = {
    'contract': 'Contract',
    'permanent': 'Full-time',
    'contract_to_hire': 'C2H',
    'temp': 'Contract',
  };
  return map[type || 'contract'] || 'Contract';
}

function mapFrontendJobType(type?: DisplayJob['type']): JobType {
  const map: Record<NonNullable<DisplayJob['type']>, JobType> = {
    'Contract': 'contract',
    'Full-time': 'permanent',
    'C2H': 'contract_to_hire',
  };
  return map[type || 'Contract'] || 'contract';
}

// ============================================
// RATE FORMATTING
// ============================================

interface ParsedRate {
  rateMin: number | null;
  rateMax: number | null;
  rateType: RateType;
}

export function parseRate(rate?: string | null): ParsedRate {
  if (!rate) {
    return { rateMin: null, rateMax: null, rateType: 'hourly' };
  }

  // Handle formats like "$100-120/hr", "$100/hr", "100k/yr", "$80-90"
  const cleanRate = rate.replace(/[$,]/g, '').trim();

  // Check for annual rate
  if (/yr|year|annual|k/i.test(cleanRate)) {
    const match = cleanRate.match(/([\d.]+)(?:k)?(?:-([\d.]+)(?:k)?)?/i);
    if (match) {
      const multiplier = /k/i.test(cleanRate) ? 1000 : 1;
      return {
        rateMin: parseFloat(match[1]) * multiplier,
        rateMax: match[2] ? parseFloat(match[2]) * multiplier : null,
        rateType: 'annual',
      };
    }
  }

  // Default: hourly rate
  const match = cleanRate.match(/([\d.]+)(?:-([\d.]+))?/);
  if (match) {
    return {
      rateMin: parseFloat(match[1]),
      rateMax: match[2] ? parseFloat(match[2]) : null,
      rateType: 'hourly',
    };
  }

  return { rateMin: null, rateMax: null, rateType: 'hourly' };
}

export function formatRate(
  min: number | null | undefined,
  max: number | null | undefined,
  type: RateType | null | undefined = 'hourly'
): string {
  if (!min && !max) return 'N/A';

  const formatNumber = (n: number) => {
    if (type === 'annual' && n >= 1000) {
      return `${(n / 1000).toFixed(0)}k`;
    }
    return n.toLocaleString();
  };

  const suffix = type === 'hourly' ? '/hr' : type === 'annual' ? '/yr' : '';

  if (min && max && min !== max) {
    return `$${formatNumber(min)}-${formatNumber(max)}${suffix}`;
  }

  return `$${formatNumber(min || max!)}${suffix}`;
}

// ============================================
// LOCATION FORMATTING
// ============================================

export function formatLocation(
  location: string | null | undefined,
  isRemote: boolean
): string {
  if (isRemote && !location) return 'Remote';
  if (isRemote && location) return `${location} (Remote)`;
  return location || 'N/A';
}

// ============================================
// UTILITY EXPORTS
// ============================================

export const jobAdapter = {
  toDisplay: dbJobToDisplay,
  toDisplayList: dbJobsToDisplay,
  toDb: displayJobToDb,
  formatRate,
  parseRate,
  formatLocation,
};
