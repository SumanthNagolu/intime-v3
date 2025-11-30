/**
 * Mutation Hooks Index
 *
 * Re-exports all mutation hooks for easy importing.
 *
 * Usage:
 * ```typescript
 * import { useCreateJob, useUpdateAccount, useCreateSubmission } from '@/hooks/mutations';
 *
 * // In component
 * const { createJob, isCreating } = useCreateJob();
 * const { updateAccount } = useUpdateAccount({ optimistic: true });
 * ```
 */

// Jobs
export {
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useUpdateJobStatus,
  useBulkUpdateJobs,
  type CreateJobOptions,
  type UpdateJobInput,
  type UpdateJobOptions,
  type DeleteJobOptions,
  type JobStatusAction,
  type BulkUpdateJobsInput,
} from './jobs';

// Candidates (uses bench.consultants router)
export {
  useCreateCandidate,
  useUpdateCandidate,
  useUpdateResponsiveness,
  useUpdateContactFrequency,
  useCreateHotlist,
  useBulkUpdateCandidates,
  type CreateConsultantInput,
  type CreateCandidateOptions,
  type UpdateCandidateInput,
  type UpdateCandidateOptions,
  type CreateHotlistInput,
  type BulkUpdateCandidatesInput,
} from './candidates';

// Submissions
export {
  useCreateSubmission,
  useUpdateSubmission,
  useMoveSubmissionStage,
  useUpdateSubmissionStatus,
  useRejectSubmission,
  useSubmitToClient,
  useScheduleInterview,
  useBulkUpdateSubmissions,
  useBulkRejectSubmissions,
  type CreateSubmissionOptions,
  type UpdateSubmissionOptions,
  type RejectSubmissionInput,
  type SubmitToClientInput,
  type ScheduleInterviewInput,
  type BulkUpdateSubmissionsInput,
} from './submissions';

// Accounts
export {
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useUpdateAccountStatus,
  useUpdateAccountTier,
  useCreatePoc,
  useUpdatePoc,
  useDeletePoc,
  useSetPrimaryPoc,
  useBulkUpdateAccounts,
  useLogAccountActivity,
  type CreateAccountOptions,
  type UpdateAccountInput,
  type UpdateAccountOptions,
  type DeleteAccountOptions,
  type AccountStatusAction,
  type AccountTier,
  type UpdatePOCInput,
  type BulkUpdateAccountsInput,
  type LogActivityInput,
} from './accounts';

// Leads
export {
  useCreateLead,
  useUpdateLead,
  useUpdateLeadStatus,
  useDeleteLead,
  useConvertLead,
  useCreateLeadActivity,
  useInvalidateAllLeadData,
} from './leads';

// Deals
export {
  useCreateDeal,
  useUpdateDeal,
  useUpdateDealStage,
  useCloseDealWon,
  useCloseDealLost,
  useCreateDealActivity,
  useDealActivities,
  useDealPendingTasks,
  useInvalidateAllDealData,
} from './deals';
