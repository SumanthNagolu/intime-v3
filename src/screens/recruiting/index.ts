/**
 * Recruiting Screens Index
 * 
 * Exports all recruiter-related screen definitions.
 * These screens are used by the ScreenRenderer to create metadata-driven UIs.
 * 
 * @see docs/specs/20-USER-ROLES/01-recruiter/
 */

// Dashboard
export { recruiterDashboardScreen } from './recruiter-dashboard.screen';

// Job Screens
export { jobDetailScreen } from './job-detail.screen';

// Candidate Screens
export { candidateDetailScreen } from './candidate-detail.screen';

// Submission Screens
export { submissionPipelineScreen } from './submission-pipeline.screen';
export { submissionDetailScreen } from './submission-detail.screen';

// List Screens
export { 
  jobListScreen, 
  candidateListScreen, 
  submissionListScreen 
} from './list-screens';

// Screen Registry Entry
export const recruitingScreens = {
  'recruiter-dashboard': () => import('./recruiter-dashboard.screen').then(m => m.recruiterDashboardScreen),
  'job-list': () => import('./list-screens').then(m => m.jobListScreen),
  'job-detail': () => import('./job-detail.screen').then(m => m.jobDetailScreen),
  'candidate-list': () => import('./list-screens').then(m => m.candidateListScreen),
  'candidate-detail': () => import('./candidate-detail.screen').then(m => m.candidateDetailScreen),
  'submission-list': () => import('./list-screens').then(m => m.submissionListScreen),
  'submission-pipeline': () => import('./submission-pipeline.screen').then(m => m.submissionPipelineScreen),
  'submission-detail': () => import('./submission-detail.screen').then(m => m.submissionDetailScreen),
} as const;

export type RecruitingScreenId = keyof typeof recruitingScreens;
