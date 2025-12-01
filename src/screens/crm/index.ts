/**
 * CRM Screen Definitions
 *
 * Export all CRM/TA module screen definitions.
 * 
 * @see docs/specs/20-USER-ROLES/03-ta/
 */

// Dashboard
export { taDashboardScreen } from './ta-dashboard.screen';

// Account screens
export { accountDetailScreen } from './account-detail.screen';
export { accountListScreen } from './account-list.screen';

// Lead screens
export { leadDetailScreen } from './lead-detail.screen';
export { leadListScreen } from './lead-list.screen';

// Deal screens
export { dealPipelineScreen } from './deal-pipeline.screen';

// Screen Registry Entry
export const crmScreens = {
  'ta-dashboard': () => import('./ta-dashboard.screen').then(m => m.taDashboardScreen),
  'lead-list': () => import('./lead-list.screen').then(m => m.leadListScreen),
  'lead-detail': () => import('./lead-detail.screen').then(m => m.leadDetailScreen),
  'account-list': () => import('./account-list.screen').then(m => m.accountListScreen),
  'account-detail': () => import('./account-detail.screen').then(m => m.accountDetailScreen),
  'deal-pipeline': () => import('./deal-pipeline.screen').then(m => m.dealPipelineScreen),
} as const;

export type CrmScreenId = keyof typeof crmScreens;
