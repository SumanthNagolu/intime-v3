/**
 * Operations/Manager/Executive Screens Index
 * 
 * Exports all operations, manager, and executive screen definitions.
 * 
 * @see docs/specs/20-USER-ROLES/04-manager/
 * @see docs/specs/20-USER-ROLES/07-cfo/
 * @see docs/specs/20-USER-ROLES/08-coo/
 * @see docs/specs/20-USER-ROLES/09-ceo/
 */

// Manager Screens
export { podDashboardScreen } from './pod-dashboard.screen';
export { podMetricsScreen } from './pod-metrics.screen';
export { escalationsScreen } from './escalations.screen';
export { approvalsQueueScreen } from './approvals-queue.screen';

// Executive Screens
export { cfoDashboardScreen } from './cfo-dashboard.screen';
export { cooDashboardScreen } from './coo-dashboard.screen';
export { ceoDashboardScreen } from './ceo-dashboard.screen';

// Screen Registry Entry
export const operationsScreens = {
  // Manager
  'pod-dashboard': () => import('./pod-dashboard.screen').then(m => m.podDashboardScreen),
  'pod-metrics': () => import('./pod-metrics.screen').then(m => m.podMetricsScreen),
  'escalations': () => import('./escalations.screen').then(m => m.escalationsScreen),
  'approvals-queue': () => import('./approvals-queue.screen').then(m => m.approvalsQueueScreen),
  // Executive
  'cfo-dashboard': () => import('./cfo-dashboard.screen').then(m => m.cfoDashboardScreen),
  'coo-dashboard': () => import('./coo-dashboard.screen').then(m => m.cooDashboardScreen),
  'ceo-dashboard': () => import('./ceo-dashboard.screen').then(m => m.ceoDashboardScreen),
} as const;

export type OperationsScreenId = keyof typeof operationsScreens;
