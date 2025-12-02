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
export { jobFormScreen } from './job-form.screen';

// Candidate Screens
export { candidateDetailScreen } from './candidate-detail.screen';
export { candidateFormScreen } from './candidate-form.screen';

// Submission Screens
export { submissionPipelineScreen } from './submission-pipeline.screen';
export { submissionDetailScreen } from './submission-detail.screen';

// Interview Screens
export { interviewsCalendarScreen } from './interviews-calendar.screen';
export { interviewDetailScreen } from './interview-detail.screen';

// Account Screens (CRM)
export { accountListScreen } from './account-list.screen';
export { accountDetailScreen } from './account-detail.screen';

// Contact Screens (CRM)
export { contactListScreen } from './contact-list.screen';
export { contactDetailScreen } from './contact-detail.screen';

// Lead Screens (CRM)
export { leadListScreen } from './lead-list.screen';
export { leadDetailScreen } from './lead-detail.screen';

// Deal Screens (CRM)
export { dealListScreen } from './deal-list.screen';
export { dealDetailScreen } from './deal-detail.screen';

// Activities Queue
export { activitiesQueueScreen } from './activities-queue.screen';

// Placement Screens
export { placementsListScreen } from './placements-list.screen';
export { placementDetailScreen } from './placement-detail.screen';

// List Screens (legacy grouped exports)
export { jobListScreen, candidateListScreen, submissionListScreen } from './list-screens';

// Screen Registry Entry
export const recruitingScreens = {
  // Dashboard
  'recruiter-dashboard': () =>
    import('./recruiter-dashboard.screen').then((m) => m.recruiterDashboardScreen),

  // Job Screens
  'job-list': () => import('./list-screens').then((m) => m.jobListScreen),
  'job-detail': () => import('./job-detail.screen').then((m) => m.jobDetailScreen),
  'job-form': () => import('./job-form.screen').then((m) => m.jobFormScreen),

  // Candidate Screens
  'candidate-list': () => import('./list-screens').then((m) => m.candidateListScreen),
  'candidate-detail': () => import('./candidate-detail.screen').then((m) => m.candidateDetailScreen),
  'candidate-form': () => import('./candidate-form.screen').then((m) => m.candidateFormScreen),

  // Submission Screens
  'submission-list': () => import('./list-screens').then((m) => m.submissionListScreen),
  'submission-pipeline': () =>
    import('./submission-pipeline.screen').then((m) => m.submissionPipelineScreen),
  'submission-detail': () =>
    import('./submission-detail.screen').then((m) => m.submissionDetailScreen),

  // Interview Screens
  'interviews-calendar': () =>
    import('./interviews-calendar.screen').then((m) => m.interviewsCalendarScreen),
  'interview-detail': () =>
    import('./interview-detail.screen').then((m) => m.interviewDetailScreen),

  // Account Screens (CRM)
  'account-list': () => import('./account-list.screen').then((m) => m.accountListScreen),
  'account-detail': () => import('./account-detail.screen').then((m) => m.accountDetailScreen),

  // Contact Screens (CRM)
  'contact-list': () => import('./contact-list.screen').then((m) => m.contactListScreen),
  'contact-detail': () => import('./contact-detail.screen').then((m) => m.contactDetailScreen),

  // Lead Screens (CRM)
  'lead-list': () => import('./lead-list.screen').then((m) => m.leadListScreen),
  'lead-detail': () => import('./lead-detail.screen').then((m) => m.leadDetailScreen),

  // Deal Screens (CRM)
  'deal-list': () => import('./deal-list.screen').then((m) => m.dealListScreen),
  'deal-detail': () => import('./deal-detail.screen').then((m) => m.dealDetailScreen),

  // Activities Queue
  'activities-queue': () =>
    import('./activities-queue.screen').then((m) => m.activitiesQueueScreen),

  // Placement Screens
  'placements-list': () =>
    import('./placements-list.screen').then((m) => m.placementsListScreen),
  'placement-detail': () =>
    import('./placement-detail.screen').then((m) => m.placementDetailScreen),
} as const;

export type RecruitingScreenId = keyof typeof recruitingScreens;
