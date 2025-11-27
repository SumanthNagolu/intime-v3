/**
 * Query Hooks Index
 *
 * Re-exports all query hooks for easy importing.
 *
 * Usage:
 * ```typescript
 * import { useJobs, useAccounts, useCandidates, useSubmissions } from '@/hooks/queries';
 *
 * // In component
 * const { jobs, isLoading } = useJobs({ status: 'open' });
 * const { accounts } = useAccounts({ status: 'active' });
 * ```
 */

// Jobs
export {
  useJobs,
  useJobsRaw,
  useJob,
  useJobRaw,
  useJobMetrics,
  useOpenJobs,
  useUrgentJobs,
  useJobsByClient,
  usePrefetchJobs,
  useInvalidateJobs,
  type JobsQueryOptions,
  type JobQueryOptions,
} from './jobs';

// Candidates (uses bench.consultants router)
export {
  useCandidates,
  useCandidatesRaw,
  useCandidate,
  useCandidateRaw,
  useBenchCandidates,
  useHotlistCandidates,
  useBenchAgingReport,
  usePrefetchCandidates,
  useInvalidateCandidates,
  type CandidatesQueryOptions,
  type CandidateQueryOptions,
  type BenchCandidatesOptions,
} from './candidates';

// Submissions
export {
  useSubmissions,
  useSubmissionsRaw,
  useSubmission,
  useSubmissionPipeline,
  useSubmissionsByStage,
  useSubmissionStats,
  useJobSubmissions,
  useJobPipeline,
  useCandidateSubmissions,
  usePrefetchSubmissions,
  useInvalidateSubmissions,
  type SubmissionsQueryOptions,
  type SubmissionQueryOptions,
  type PipelineQueryOptions,
} from './submissions';

// Accounts
export {
  useAccounts,
  useAccountsRaw,
  useAccount,
  useAccountRaw,
  useAccountPocs,
  useActiveAccounts,
  useProspectAccounts,
  useHoldAccounts,
  useAccountSearch,
  useAccountsByTier,
  useAccountStats,
  useAccountOptions,
  usePrefetchAccounts,
  useInvalidateAccounts,
  type AccountsQueryOptions,
  type AccountQueryOptions,
  type AccountSearchOptions,
  type AccountStats,
} from './accounts';

// Leads
export {
  useLeads,
  useLeadsRaw,
  useNewLeads,
  useQualifiedLeads,
  useNegotiationLeads,
  useAccountLeads,
  usePrefetchLeads,
  useInvalidateLeads,
  type LeadsQueryOptions,
  type LeadQueryOptions,
} from './leads';

// Deals
export {
  useDeals,
  useDealsRaw,
  useDeal,
  useDealRaw,
  useDealPipeline,
  useDiscoveryDeals,
  useProposalDeals,
  useNegotiationDeals,
  useAccountDeals,
  usePrefetchDeals,
  useInvalidateDeals,
  type DealsQueryOptions,
  type DealQueryOptions,
} from './deals';
