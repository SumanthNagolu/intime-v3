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
export { accountCreateScreen, accountEditScreen, accountFormConfig } from './account-form.screen';

// Lead screens
export { leadDetailScreen } from './lead-detail.screen';
export { leadListScreen } from './lead-list.screen';

// Deal screens
export { dealPipelineScreen } from './deal-pipeline.screen';
export { dealListScreen } from './deal-list.screen';
export { dealDetailScreen } from './deal-detail.screen';
export { dealCreateScreen, dealEditScreen, dealFormConfig } from './deal-form.screen';

// Campaign screens
export { campaignListScreen } from './campaign-list.screen';
export { campaignDetailScreen } from './campaign-detail.screen';
export { campaignCreateScreen, campaignEditScreen, campaignFormConfig } from './campaign-form.screen';

// Contact screens (factory-generated)
export { contactListScreen } from './contact-list.screen';
export { contactDetailScreen } from './contact-detail.screen';
export { contactCreateScreen, contactEditScreen, contactFormConfig } from './contact-form.screen';

// Screen Registry Entry
export const crmScreens = {
  'ta-dashboard': () => import('./ta-dashboard.screen').then(m => m.taDashboardScreen),
  'lead-list': () => import('./lead-list.screen').then(m => m.leadListScreen),
  'lead-detail': () => import('./lead-detail.screen').then(m => m.leadDetailScreen),
  'account-list': () => import('./account-list.screen').then(m => m.accountListScreen),
  'account-detail': () => import('./account-detail.screen').then(m => m.accountDetailScreen),
  'account-create': () => import('./account-form.screen').then(m => m.accountCreateScreen),
  'account-edit': () => import('./account-form.screen').then(m => m.accountEditScreen),
  'deal-pipeline': () => import('./deal-pipeline.screen').then(m => m.dealPipelineScreen),
  'deal-list': () => import('./deal-list.screen').then(m => m.dealListScreen),
  'deal-detail': () => import('./deal-detail.screen').then(m => m.dealDetailScreen),
  'deal-create': () => import('./deal-form.screen').then(m => m.dealCreateScreen),
  'deal-edit': () => import('./deal-form.screen').then(m => m.dealEditScreen),
  'campaign-list': () => import('./campaign-list.screen').then(m => m.campaignListScreen),
  'campaign-detail': () => import('./campaign-detail.screen').then(m => m.campaignDetailScreen),
  'campaign-create': () => import('./campaign-form.screen').then(m => m.campaignCreateScreen),
  'campaign-edit': () => import('./campaign-form.screen').then(m => m.campaignEditScreen),
  'contact-list': () => import('./contact-list.screen').then(m => m.contactListScreen),
  'contact-detail': () => import('./contact-detail.screen').then(m => m.contactDetailScreen),
  'contact-create': () => import('./contact-form.screen').then(m => m.contactCreateScreen),
  'contact-edit': () => import('./contact-form.screen').then(m => m.contactEditScreen),
} as const;

export type CrmScreenId = keyof typeof crmScreens;
