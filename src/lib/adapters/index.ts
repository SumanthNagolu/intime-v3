/**
 * Type Adapters Index
 *
 * Re-exports all type adapters for easy importing.
 *
 * Usage:
 * ```typescript
 * import { jobAdapter, candidateAdapter, submissionAdapter, accountAdapter } from '@/lib/adapters';
 *
 * // Convert database job to frontend display
 * const displayJob = jobAdapter.toDisplay(dbJob, account);
 *
 * // Convert frontend input to database format
 * const dbData = jobAdapter.toDb(formData, ctx);
 * ```
 */

// ============================================
// IMPORTS (needed for adapters object)
// ============================================
import { jobAdapter } from './job';
import { candidateAdapter } from './candidate';
import { submissionAdapter } from './submission';
import { accountAdapter, pocAdapter } from './account';

// ============================================
// RE-EXPORTS
// ============================================

// Job adapter
export {
  dbJobToDisplay,
  dbJobsToDisplay,
  displayJobToDb,
  parseRate,
  formatRate,
  formatLocation,
  jobAdapter,
  type CreateJobInput,
} from './job';

// Candidate adapter
export {
  dbCandidateToDisplay,
  dbCandidatesToDisplay,
  displayCandidateToDb,
  dbCandidateToBenchDisplay,
  displayStatusToDb,
  formatExperience,
  formatHourlyRate,
  formatAvailability,
  formatSkillsList,
  candidateAdapter,
  type CreateCandidateInput,
  type DisplayBenchCandidate,
} from './candidate';

// Submission adapter
export {
  dbSubmissionToDisplay,
  dbSubmissionsToDisplay,
  displaySubmissionToDb,
  groupSubmissionsByStage,
  formatLastActivity,
  getStatusColor,
  getMatchScoreColor,
  getMatchScoreBadge,
  calculateSubmissionStats,
  submissionAdapter,
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type CreateSubmissionInput,
  type PipelineData,
  type SubmissionStats,
} from './submission';

// Account adapter
export {
  dbAccountToDisplay,
  dbAccountsToDisplay,
  displayAccountToDb,
  dbPocToDisplay,
  displayPocToDb,
  getTierBadgeVariant,
  getStatusBadgeVariant,
  accountAdapter,
  pocAdapter,
  type CreateAccountInput,
  type CreatePOCInput,
} from './account';

// ============================================
// COMBINED ADAPTER UTILITIES
// ============================================

/**
 * Context required for database operations
 */
export interface AdapterContext {
  orgId: string;
  userId: string;
}

/**
 * All adapters in a single object
 */
export const adapters = {
  job: jobAdapter,
  candidate: candidateAdapter,
  submission: submissionAdapter,
  account: accountAdapter,
  poc: pocAdapter,
};
