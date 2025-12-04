/**
 * TA (Talent Acquisition) Screen Definitions
 *
 * Export all TA module screen definitions.
 * Routes: /employee/workspace/ta/*
 *
 * @see docs/specs/20-USER-ROLES/03-ta/
 */

// Dashboard
export { taDashboardScreen } from './ta-dashboard.screen';

// Lead screens
export { taLeadsScreen } from './ta-leads.screen';
export { leadDetailScreen } from './lead-detail.screen';
export { leadCreateScreen, leadEditScreen, leadFormConfig } from './lead-form.screen';

// Deal screens
export { taDealsScreen } from './ta-deals.screen';
export { dealDetailScreen } from './deal-detail.screen';
export { dealCreateScreen, dealEditScreen, dealFormConfig } from './deal-form.screen';

// Campaign screens
export { taCampaignsScreen } from './ta-campaigns.screen';
export { campaignDetailScreen } from './campaign-detail.screen';
export { campaignBuilderScreen } from './campaign-builder.screen';

// Training screens
export { trainingApplicationsScreen } from './training-applications.screen';
export { trainingApplicationDetailScreen } from './training-application-detail.screen';
export { trainingEnrollmentsScreen } from './training-enrollments.screen';
export { trainingPlacementTrackerScreen } from './training-placement-tracker.screen';

// Internal hiring screens
export { internalJobsScreen } from './internal-jobs.screen';
export { internalJobDetailScreen } from './internal-job-detail.screen';
export { internalJobCreateScreen, internalJobEditScreen, internalJobFormConfig } from './internal-job-form.screen';
export { internalCandidatesScreen } from './internal-candidates.screen';
export { internalCandidateDetailScreen } from './internal-candidate-detail.screen';

// Analytics & Activities
export { taAnalyticsScreen } from './ta-analytics.screen';
export { taActivitiesScreen } from './ta-activities.screen';

// Screen Registry Entry
export const taScreens = {
  // Dashboard
  'ta-dashboard': () => import('./ta-dashboard.screen').then(m => m.taDashboardScreen),

  // Leads
  'ta-leads': () => import('./ta-leads.screen').then(m => m.taLeadsScreen),
  'lead-detail': () => import('./lead-detail.screen').then(m => m.leadDetailScreen),
  'lead-create': () => import('./lead-form.screen').then(m => m.leadCreateScreen),
  'lead-edit': () => import('./lead-form.screen').then(m => m.leadEditScreen),

  // Deals
  'ta-deals': () => import('./ta-deals.screen').then(m => m.taDealsScreen),
  'deal-detail': () => import('./deal-detail.screen').then(m => m.dealDetailScreen),
  'deal-create': () => import('./deal-form.screen').then(m => m.dealCreateScreen),
  'deal-edit': () => import('./deal-form.screen').then(m => m.dealEditScreen),

  // Campaigns
  'ta-campaigns': () => import('./ta-campaigns.screen').then(m => m.taCampaignsScreen),
  'campaign-detail': () => import('./campaign-detail.screen').then(m => m.campaignDetailScreen),
  'campaign-builder': () => import('./campaign-builder.screen').then(m => m.campaignBuilderScreen),

  // Training
  'training-applications': () => import('./training-applications.screen').then(m => m.trainingApplicationsScreen),
  'training-application-detail': () => import('./training-application-detail.screen').then(m => m.trainingApplicationDetailScreen),
  'training-enrollments': () => import('./training-enrollments.screen').then(m => m.trainingEnrollmentsScreen),
  'training-placement-tracker': () => import('./training-placement-tracker.screen').then(m => m.trainingPlacementTrackerScreen),

  // Internal Hiring
  'internal-jobs': () => import('./internal-jobs.screen').then(m => m.internalJobsScreen),
  'internal-job-detail': () => import('./internal-job-detail.screen').then(m => m.internalJobDetailScreen),
  'internal-job-create': () => import('./internal-job-form.screen').then(m => m.internalJobCreateScreen),
  'internal-job-edit': () => import('./internal-job-form.screen').then(m => m.internalJobEditScreen),
  'internal-candidates': () => import('./internal-candidates.screen').then(m => m.internalCandidatesScreen),
  'internal-candidate-detail': () => import('./internal-candidate-detail.screen').then(m => m.internalCandidateDetailScreen),

  // Analytics & Activities
  'ta-analytics': () => import('./ta-analytics.screen').then(m => m.taAnalyticsScreen),
  'ta-activities': () => import('./ta-activities.screen').then(m => m.taActivitiesScreen),
} as const;

export type TaScreenId = keyof typeof taScreens;
