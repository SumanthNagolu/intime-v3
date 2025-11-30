/**
 * Data Providers
 *
 * Provides data hooks that automatically switch between mock and live data
 * based on feature flags. This enables gradual migration of components.
 *
 * Usage:
 * ```tsx
 * import { useJobsData, useAccountsData } from '@/lib/data/providers';
 *
 * function JobsList() {
 *   const { jobs, isLoading, error, isLive } = useJobsData({ status: 'open' });
 *   // Returns mock data or live data based on feature flag
 * }
 * ```
 */

'use client';

import { useMemo } from 'react';
import { useFeatureFlag, FeatureFlags } from '@/lib/features';

// Import live data hooks
import {
  useJobs,
  useJob,
  useAccounts,
  useAccount,
  useSubmissions,
  useSubmissionPipeline,
  useCandidates,
  type JobsQueryOptions,
  type AccountsQueryOptions,
  type SubmissionsQueryOptions,
  type CandidatesQueryOptions,
} from '@/hooks/queries';

import type { DisplayAccount } from '@/lib/adapters';
import type { DisplayJob, DisplaySubmission, DisplayCandidate } from '@/types/aligned';

// ============================================
// MOCK DATA
// ============================================

const MOCK_JOBS: DisplayJob[] = [
  {
    id: 'mock-job-1',
    accountId: 'mock-account-1',
    title: 'Senior Guidewire Developer',
    status: 'open',
    type: 'Contract',
    rate: '$90-110/hr',
    location: 'Remote (US)',
    ownerId: 'user-1',
    client: 'TechCorp Insurance',
    positionsCount: 2,
    positionsFilled: 0,
    isRemote: true,
    requiredSkills: ['Guidewire', 'Java', 'SQL'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-job-2',
    accountId: 'mock-account-2',
    title: 'Full Stack Engineer',
    status: 'urgent',
    type: 'Full-time',
    rate: '$150k-180k/yr',
    location: 'San Francisco, CA',
    ownerId: 'user-1',
    client: 'StartupXYZ',
    positionsCount: 1,
    positionsFilled: 0,
    isRemote: false,
    requiredSkills: ['React', 'Node.js', 'PostgreSQL'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-job-3',
    accountId: 'mock-account-1',
    title: 'DevOps Engineer',
    status: 'open',
    type: 'C2H',
    rate: '$75-85/hr',
    location: 'Remote',
    ownerId: 'user-1',
    client: 'TechCorp Insurance',
    positionsCount: 1,
    positionsFilled: 0,
    isRemote: true,
    requiredSkills: ['AWS', 'Kubernetes', 'Terraform'],
    createdAt: new Date().toISOString(),
  },
];

const MOCK_ACCOUNTS: DisplayAccount[] = [
  {
    id: 'mock-account-1',
    name: 'TechCorp Insurance',
    industry: 'Insurance',
    status: 'Active',
    type: 'Direct Client',
    accountManagerId: 'user-1',
    responsiveness: 'High',
    preference: 'Quality',
    tier: 'platinum',
    pocs: [],
    activityLog: [],
    jobsCount: 5,
    placementsCount: 12,
  },
  {
    id: 'mock-account-2',
    name: 'StartupXYZ',
    industry: 'Technology',
    status: 'Active',
    type: 'Direct Client',
    accountManagerId: 'user-1',
    responsiveness: 'Medium',
    preference: 'Speed',
    tier: 'gold',
    pocs: [],
    activityLog: [],
    jobsCount: 2,
    placementsCount: 3,
  },
  {
    id: 'mock-account-3',
    name: 'BigBank Corp',
    industry: 'Financial Services',
    status: 'Prospect',
    type: 'MSP/VMS',
    accountManagerId: 'user-1',
    responsiveness: 'Low',
    preference: 'Quality',
    tier: 'silver',
    pocs: [],
    activityLog: [],
    jobsCount: 0,
    placementsCount: 0,
  },
];

const MOCK_SUBMISSIONS: DisplaySubmission[] = [
  {
    id: 'mock-sub-1',
    jobId: 'mock-job-1',
    candidateId: 'mock-candidate-1',
    status: 'screening',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    matchScore: 92,
    candidateName: 'John Developer',
    jobTitle: 'Senior Guidewire Developer',
    clientName: 'TechCorp Insurance',
  },
  {
    id: 'mock-sub-2',
    jobId: 'mock-job-1',
    candidateId: 'mock-candidate-2',
    status: 'submitted_to_client',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    matchScore: 85,
    candidateName: 'Jane Engineer',
    jobTitle: 'Senior Guidewire Developer',
    clientName: 'TechCorp Insurance',
    submittedRate: '$95/hr',
  },
  {
    id: 'mock-sub-3',
    jobId: 'mock-job-2',
    candidateId: 'mock-candidate-3',
    status: 'client_interview',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    matchScore: 78,
    candidateName: 'Bob Fullstack',
    jobTitle: 'Full Stack Engineer',
    clientName: 'StartupXYZ',
    interviewCount: 2,
  },
];

const MOCK_CANDIDATES: DisplayCandidate[] = [
  {
    id: 'mock-candidate-1',
    name: 'John Developer',
    role: 'Guidewire Developer',
    status: 'active',
    type: 'external',
    skills: ['Guidewire', 'Java', 'PolicyCenter', 'BillingCenter'],
    experience: '8 years',
    location: 'Chicago, IL',
    rate: '$95/hr',
    email: 'john@example.com',
    score: 92,
    visaStatus: 'USC',
    availability: 'Immediate',
    willingToRelocate: false,
  },
  {
    id: 'mock-candidate-2',
    name: 'Jane Engineer',
    role: 'Senior Software Engineer',
    status: 'active',
    type: 'external',
    skills: ['Java', 'Spring', 'Guidewire', 'AWS'],
    experience: '6 years',
    location: 'Remote',
    rate: '$90/hr',
    email: 'jane@example.com',
    score: 85,
    visaStatus: 'H1B',
    availability: '2 Weeks Notice',
    willingToRelocate: true,
  },
  {
    id: 'mock-candidate-3',
    name: 'Bob Fullstack',
    role: 'Full Stack Developer',
    status: 'active',
    type: 'internal_bench',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    experience: '5 years',
    location: 'San Francisco, CA',
    rate: '$85/hr',
    email: 'bob@example.com',
    score: 78,
    visaStatus: 'GC',
    availability: 'Immediate',
    willingToRelocate: false,
  },
];

// ============================================
// JOBS PROVIDER
// ============================================

interface JobsDataResult {
  jobs: DisplayJob[];
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
  refetch: () => void;
}

export function useJobsData(options: Omit<JobsQueryOptions, 'enabled'> = {}): JobsDataResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_JOBS_DATA);

  // Live data hook
  const liveQuery = useJobs({
    ...options,
    enabled: isLive,
  });

  // Mock data with filtering
  const mockJobs = useMemo(() => {
    let filtered = [...MOCK_JOBS];
    if (options.status) {
      const statusMap: Record<string, string[]> = {
        draft: ['draft'],
        open: ['open', 'urgent'],
        on_hold: ['hold'],
        filled: ['filled'],
        closed: ['filled'],
      };
      const allowedStatuses = statusMap[options.status] || [options.status];
      filtered = filtered.filter(j => allowedStatuses.includes(j.status));
    }
    if (options.clientId) {
      filtered = filtered.filter(j => j.accountId === options.clientId);
    }
    return filtered;
  }, [options.status, options.clientId]);

  if (isLive) {
    return {
      jobs: liveQuery.jobs,
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
      refetch: () => liveQuery.refetch(),
    };
  }

  return {
    jobs: mockJobs,
    isLoading: false,
    error: null,
    isLive: false,
    refetch: () => {},
  };
}

export function useJobData(id: string | undefined): {
  job: DisplayJob | undefined;
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
} {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_JOBS_DATA);
  const liveQuery = useJob(id, { enabled: isLive && !!id });

  const mockJob = useMemo(() => {
    return MOCK_JOBS.find(j => j.id === id);
  }, [id]);

  if (isLive) {
    return {
      job: liveQuery.job,
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
    };
  }

  return {
    job: mockJob,
    isLoading: false,
    error: null,
    isLive: false,
  };
}

// ============================================
// ACCOUNTS PROVIDER
// ============================================

interface AccountsDataResult {
  accounts: DisplayAccount[];
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
  refetch: () => void;
}

export function useAccountsData(options: Omit<AccountsQueryOptions, 'enabled'> = {}): AccountsDataResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_ACCOUNTS_DATA);

  const liveQuery = useAccounts({
    ...options,
    enabled: isLive,
  });

  const mockAccounts = useMemo(() => {
    let filtered = [...MOCK_ACCOUNTS];
    if (options.status) {
      const statusMap: Record<string, string> = {
        prospect: 'Prospect',
        active: 'Active',
        inactive: 'Hold',
        churned: 'Churned',
      };
      filtered = filtered.filter(a => a.status === statusMap[options.status!]);
    }
    if (options.search) {
      const search = options.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(search) ||
        a.industry?.toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [options.status, options.search]);

  if (isLive) {
    return {
      accounts: liveQuery.accounts,
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
      refetch: () => liveQuery.refetch(),
    };
  }

  return {
    accounts: mockAccounts,
    isLoading: false,
    error: null,
    isLive: false,
    refetch: () => {},
  };
}

export function useAccountData(id: string | undefined): {
  account: DisplayAccount | undefined;
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
} {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_ACCOUNTS_DATA);
  const liveQuery = useAccount(id, { enabled: isLive && !!id });

  const mockAccount = useMemo(() => {
    return MOCK_ACCOUNTS.find(a => a.id === id);
  }, [id]);

  if (isLive) {
    return {
      account: liveQuery.account,
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
    };
  }

  return {
    account: mockAccount,
    isLoading: false,
    error: null,
    isLive: false,
  };
}

// ============================================
// SUBMISSIONS PROVIDER
// ============================================

interface SubmissionsDataResult {
  submissions: DisplaySubmission[];
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
  refetch: () => void;
}

export function useSubmissionsData(options: Omit<SubmissionsQueryOptions, 'enabled'> = {}): SubmissionsDataResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_SUBMISSIONS_DATA);

  const liveQuery = useSubmissions({
    ...options,
    enabled: isLive,
  });

  const mockSubmissions = useMemo(() => {
    let filtered = [...MOCK_SUBMISSIONS];
    if (options.status) {
      filtered = filtered.filter(s => s.status === options.status);
    }
    if (options.jobId) {
      filtered = filtered.filter(s => s.jobId === options.jobId);
    }
    if (options.candidateId) {
      filtered = filtered.filter(s => s.candidateId === options.candidateId);
    }
    return filtered;
  }, [options.status, options.jobId, options.candidateId]);

  if (isLive) {
    return {
      submissions: liveQuery.submissions,
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
      refetch: () => liveQuery.refetch(),
    };
  }

  return {
    submissions: mockSubmissions,
    isLoading: false,
    error: null,
    isLive: false,
    refetch: () => {},
  };
}

// ============================================
// CANDIDATES PROVIDER
// ============================================

interface CandidatesDataResult {
  candidates: DisplayCandidate[];
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
  refetch: () => void;
}

export function useCandidatesData(options: Omit<CandidatesQueryOptions, 'enabled'> = {}): CandidatesDataResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_BENCH_DATA);

  const liveQuery = useCandidates({
    ...options,
    enabled: isLive,
  });

  const mockCandidates = useMemo(() => {
    let filtered = [...MOCK_CANDIDATES];
    if (options.status) {
      filtered = filtered.filter(c => c.status === options.status);
    }
    return filtered;
  }, [options.status]);

  if (isLive) {
    return {
      candidates: liveQuery.candidates as unknown as DisplayCandidate[],
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
      refetch: () => liveQuery.refetch(),
    };
  }

  return {
    candidates: mockCandidates,
    isLoading: false,
    error: null,
    isLive: false,
    refetch: () => {},
  };
}

// ============================================
// PIPELINE DATA PROVIDER
// ============================================

import type { PipelineData } from '@/lib/adapters';
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from '@/lib/adapters';

interface PipelineDataResult {
  pipelineData: PipelineData;
  stages: typeof PIPELINE_STAGES;
  stageLabels: typeof PIPELINE_STAGE_LABELS;
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
}

export function usePipelineData(jobId?: string): PipelineDataResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_SUBMISSIONS_DATA);

  const liveQuery = useSubmissionPipeline({
    jobId,
    enabled: isLive,
  });

  // Build mock pipeline data
  const mockPipeline = useMemo((): PipelineData => {
    const pipeline: PipelineData = {};
    PIPELINE_STAGES.forEach(stage => {
      pipeline[stage] = [];
    });

    let submissions = [...MOCK_SUBMISSIONS];
    if (jobId) {
      submissions = submissions.filter(s => s.jobId === jobId);
    }

    submissions.forEach(sub => {
      const stage = sub.status === 'offer' ? 'offer_stage' : sub.status;
      if (pipeline[stage]) {
        pipeline[stage].push(sub);
      }
    });

    return pipeline;
  }, [jobId]);

  if (isLive) {
    return {
      pipelineData: liveQuery.pipelineData,
      stages: liveQuery.stages,
      stageLabels: liveQuery.stageLabels,
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
    };
  }

  return {
    pipelineData: mockPipeline,
    stages: PIPELINE_STAGES,
    stageLabels: PIPELINE_STAGE_LABELS,
    isLoading: false,
    error: null,
    isLive: false,
  };
}

// ============================================
// DASHBOARD STATS PROVIDER
// ============================================

interface DashboardStats {
  openJobs: number;
  activeSubmissions: number;
  placements: number;
  revenue: number;
  conversionRate: number;
}

interface DashboardStatsResult {
  stats: DashboardStats;
  isLoading: boolean;
  isLive: boolean;
}

export function useDashboardStats(): DashboardStatsResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_JOBS_DATA);

  const jobsQuery = useJobs({ status: 'open', enabled: isLive });
  const submissionsQuery = useSubmissions({ enabled: isLive });

  // Calculate stats from live data
  const liveStats = useMemo((): DashboardStats => {
    const activeStatuses = ['screening', 'submitted_to_client', 'client_interview', 'offer'];
    const activeSubmissions = submissionsQuery.submissions.filter(s =>
      activeStatuses.includes(s.status)
    );

    return {
      openJobs: jobsQuery.jobs.length,
      activeSubmissions: activeSubmissions.length,
      placements: 3, // Would come from placements query
      revenue: 147000, // Would come from analytics
      conversionRate: 68,
    };
  }, [jobsQuery.jobs, submissionsQuery.submissions]);

  const mockStats: DashboardStats = {
    openJobs: MOCK_JOBS.filter(j => j.status === 'open' || j.status === 'urgent').length,
    activeSubmissions: MOCK_SUBMISSIONS.filter(s =>
      ['screening', 'submitted_to_client', 'client_interview', 'offer'].includes(s.status)
    ).length,
    placements: 3,
    revenue: 147000,
    conversionRate: 68,
  };

  if (isLive) {
    return {
      stats: liveStats,
      isLoading: jobsQuery.isLoading || submissionsQuery.isLoading,
      isLive: true,
    };
  }

  return {
    stats: mockStats,
    isLoading: false,
    isLive: false,
  };
}

// ============================================
// LEADS DATA PROVIDER
// ============================================

import { useLeads, type LeadsQueryOptions } from '@/hooks/queries/leads';
import type { DisplayLead } from '@/types/aligned';

// Mock leads data
const MOCK_LEADS: DisplayLead[] = [
  {
    id: 'lead-1',
    leadType: 'company',
    companyName: 'TechStart Inc',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@techstart.com',
    phone: '555-0101',
    status: 'warm',
    source: 'referral',
    estimatedValue: 75000,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'lead-2',
    leadType: 'company',
    companyName: 'CloudScale Solutions',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@cloudscale.io',
    phone: '555-0102',
    status: 'new',
    source: 'website',
    estimatedValue: 120000,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'lead-3',
    leadType: 'company',
    companyName: 'DataFlow Analytics',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@dataflow.com',
    phone: '555-0103',
    status: 'hot',
    source: 'linkedin',
    estimatedValue: 200000,
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'lead-4',
    leadType: 'company',
    companyName: 'SecureNet Corp',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily@securenet.com',
    phone: '555-0104',
    status: 'hot',
    source: 'conference',
    estimatedValue: 150000,
    createdAt: new Date('2024-02-15'),
  },
];

interface LeadsDataResult {
  leads: DisplayLead[];
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
  refetch: () => void;
}

export function useLeadsData(options: Omit<LeadsQueryOptions, 'enabled'> = {}): LeadsDataResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_LEADS_DATA);
  const liveQuery = useLeads({ ...options, enabled: isLive });

  if (isLive) {
    return {
      leads: liveQuery.leads,
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
      refetch: liveQuery.refetch,
    };
  }

  // Filter mock data based on options
  let filtered = [...MOCK_LEADS];
  if (options.status) {
    filtered = filtered.filter(l => l.status === options.status);
  }

  return {
    leads: filtered,
    isLoading: false,
    error: null,
    isLive: false,
    refetch: () => {},
  };
}

// ============================================
// DEALS DATA PROVIDER
// ============================================

import { useDeals, useDealPipeline, type DealsQueryOptions } from '@/hooks/queries/deals';
import type { DisplayDeal } from '@/types/aligned';

// Mock deals data
const MOCK_DEALS: DisplayDeal[] = [
  {
    id: 'deal-1',
    leadId: 'lead-1',
    company: 'TechStart Inc',
    title: 'TechStart Staffing Contract',
    value: '75000',
    stage: 'Proposal',
    probability: 60,
    expectedClose: '2024-03-15',
    ownerId: 'user-1',
  },
  {
    id: 'deal-2',
    leadId: 'lead-2',
    company: 'CloudScale Solutions',
    title: 'CloudScale Dev Team Expansion',
    value: '240000',
    stage: 'Negotiation',
    probability: 80,
    expectedClose: '2024-03-01',
    ownerId: 'user-1',
  },
  {
    id: 'deal-3',
    leadId: 'lead-3',
    company: 'DataFlow Analytics',
    title: 'DataFlow Analytics Partnership',
    value: '180000',
    stage: 'Discovery',
    probability: 20,
    expectedClose: '2024-04-01',
    ownerId: 'user-1',
  },
  {
    id: 'deal-4',
    leadId: 'lead-4',
    company: 'SecureNet Corp',
    title: 'SecureNet Security Consultants',
    value: '95000',
    stage: 'Proposal',
    probability: 40,
    expectedClose: '2024-03-20',
    ownerId: 'user-1',
  },
];

interface DealsDataResult {
  deals: DisplayDeal[];
  isLoading: boolean;
  error: Error | null;
  isLive: boolean;
  refetch: () => void;
}

export function useDealsData(options: Omit<DealsQueryOptions, 'enabled'> = {}): DealsDataResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_DEALS_DATA);
  const liveQuery = useDeals({ ...options, enabled: isLive });

  if (isLive) {
    return {
      deals: liveQuery.deals,
      isLoading: liveQuery.isLoading,
      error: liveQuery.error as Error | null,
      isLive: true,
      refetch: liveQuery.refetch,
    };
  }

  // Filter mock data based on options
  const filtered = [...MOCK_DEALS];
  // Note: options.stage would be lowercase like 'discovery', DisplayDeal.stage is capitalized
  // We'll skip the filtering for now to avoid type mismatch
  // if (options.stage) {
  //   filtered = filtered.filter(d => d.stage === options.stage);
  // }

  return {
    deals: filtered,
    isLoading: false,
    error: null,
    isLive: false,
    refetch: () => {},
  };
}

// Pipeline summary provider
interface DealPipelineResult {
  pipeline: Array<{ stage: string; count: number; totalValue: number }>;
  isLoading: boolean;
  isLive: boolean;
}

export function useDealPipelineData(): DealPipelineResult {
  const isLive = useFeatureFlag(FeatureFlags.USE_LIVE_DEALS_DATA);
  const liveQuery = useDealPipeline({ enabled: isLive });

  if (isLive) {
    return {
      pipeline: liveQuery.pipeline,
      isLoading: liveQuery.isLoading,
      isLive: true,
    };
  }

  // Calculate mock pipeline from mock deals
  const stageMapping: Record<string, string> = {
    'Discovery': 'discovery',
    'Proposal': 'proposal',
    'Negotiation': 'negotiation',
  };

  const stages = ['discovery', 'qualification', 'proposal', 'negotiation'];
  const mockPipeline = stages.map(stage => {
    const stageDeals = MOCK_DEALS.filter(d => {
      const mappedStage = stageMapping[d.stage];
      return mappedStage === stage;
    });
    return {
      stage,
      count: stageDeals.length,
      totalValue: stageDeals.reduce((sum, d) => sum + parseFloat(d.value), 0),
    };
  });

  return {
    pipeline: mockPipeline,
    isLoading: false,
    isLive: false,
  };
}
