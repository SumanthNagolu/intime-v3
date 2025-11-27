/**
 * Data Module
 *
 * Provides data hooks that automatically switch between mock and live data
 * based on feature flags.
 *
 * Usage:
 * ```tsx
 * import { useJobsData, useAccountsData, usePipelineData } from '@/lib/data';
 *
 * function MyComponent() {
 *   const { jobs, isLoading, isLive } = useJobsData({ status: 'open' });
 *
 *   // Show badge when using mock data
 *   if (!isLive) {
 *     return <MockDataBadge />;
 *   }
 * }
 * ```
 */

export {
  // Jobs
  useJobsData,
  useJobData,

  // Accounts
  useAccountsData,
  useAccountData,

  // Submissions
  useSubmissionsData,

  // Candidates
  useCandidatesData,

  // Pipeline
  usePipelineData,

  // Dashboard
  useDashboardStats,
} from './providers';
