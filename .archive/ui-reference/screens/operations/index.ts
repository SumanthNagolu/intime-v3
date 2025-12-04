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

// ─────────────────────────────────────────────────────────────────────────────
// MANAGER SCREENS
// ─────────────────────────────────────────────────────────────────────────────

// Manager Screens - Dashboard & Overview
export { podDashboardScreen } from './pod-dashboard.screen';
export { podOverviewScreen } from './pod-overview.screen';
export { podMetricsScreen } from './pod-metrics.screen';
export { sprintBoardScreen } from './sprint-board.screen';

// Manager Screens - Team & IC Management
export { teamManagementScreen } from './team-management.screen';
export { icPerformanceDetailScreen } from './ic-performance-detail.screen';
export { oneOnOnesScreen } from './one-on-ones.screen';
export { oneOnOneDetailScreen } from './one-on-one-detail.screen';

// Manager Screens - Escalations & Approvals
export { escalationsScreen } from './escalations.screen';
export { escalationDetailScreen } from './escalation-detail.screen';
export { approvalsQueueScreen } from './approvals-queue.screen';
export { approvalDetailScreen } from './approval-detail.screen';

// Manager Screens - RACI & Cross-Pod
export { raciWatchlistScreen } from './raci-watchlist.screen';
export { crossPodScreen } from './cross-pod.screen';

// Manager Screens - Activities
export { managerActivitiesScreen } from './manager-activities.screen';

// ─────────────────────────────────────────────────────────────────────────────
// CFO SCREENS (Financial)
// ─────────────────────────────────────────────────────────────────────────────

export { cfoDashboardScreen } from './cfo-dashboard.screen';
export { revenueAnalyticsScreen } from './revenue-analytics.screen';
export { marginAnalysisScreen } from './margin-analysis.screen';
export { arDashboardScreen } from './ar-dashboard.screen';
export { placementsFinancialScreen } from './placements-financial.screen';
export { financialReportsScreen } from './financial-reports.screen';

// ─────────────────────────────────────────────────────────────────────────────
// COO SCREENS (Operations)
// ─────────────────────────────────────────────────────────────────────────────

export { cooDashboardScreen } from './coo-dashboard.screen';
export { allPodsOverviewScreen } from './all-pods-overview.screen';
export { cooPodDetailScreen } from './coo-pod-detail.screen';
export { operationsAnalyticsScreen } from './operations-analytics.screen';
export { slaDashboardScreen } from './sla-dashboard.screen';
export { processMetricsScreen } from './process-metrics.screen';
export { cooEscalationsScreen } from './coo-escalations.screen';

// ─────────────────────────────────────────────────────────────────────────────
// CEO SCREENS (Strategic)
// ─────────────────────────────────────────────────────────────────────────────

export { ceoDashboardScreen } from './ceo-dashboard.screen';
export { businessIntelligenceScreen } from './business-intelligence.screen';
export { strategicInitiativesScreen } from './strategic-initiatives.screen';
export { portfolioOverviewScreen } from './portfolio-overview.screen';
export { executiveReportsScreen } from './executive-reports.screen';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED EXECUTIVE SCREENS
// ─────────────────────────────────────────────────────────────────────────────

export { forecastingScreen } from './forecasting.screen';
export { benchmarkingScreen } from './benchmarking.screen';

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const operationsScreens = {
  // ───────────────────────────────────────────────────────
  // Manager - Dashboard & Overview
  // ───────────────────────────────────────────────────────
  'pod-dashboard': () => import('./pod-dashboard.screen').then(m => m.podDashboardScreen),
  'pod-overview': () => import('./pod-overview.screen').then(m => m.podOverviewScreen),
  'pod-metrics': () => import('./pod-metrics.screen').then(m => m.podMetricsScreen),
  'sprint-board': () => import('./sprint-board.screen').then(m => m.sprintBoardScreen),

  // ───────────────────────────────────────────────────────
  // Manager - Team & IC Management
  // ───────────────────────────────────────────────────────
  'team-management': () => import('./team-management.screen').then(m => m.teamManagementScreen),
  'ic-performance-detail': () => import('./ic-performance-detail.screen').then(m => m.icPerformanceDetailScreen),
  'one-on-ones': () => import('./one-on-ones.screen').then(m => m.oneOnOnesScreen),
  'one-on-one-detail': () => import('./one-on-one-detail.screen').then(m => m.oneOnOneDetailScreen),

  // ───────────────────────────────────────────────────────
  // Manager - Escalations & Approvals
  // ───────────────────────────────────────────────────────
  'escalations': () => import('./escalations.screen').then(m => m.escalationsScreen),
  'escalation-detail': () => import('./escalation-detail.screen').then(m => m.escalationDetailScreen),
  'approvals-queue': () => import('./approvals-queue.screen').then(m => m.approvalsQueueScreen),
  'approval-detail': () => import('./approval-detail.screen').then(m => m.approvalDetailScreen),

  // ───────────────────────────────────────────────────────
  // Manager - RACI & Cross-Pod
  // ───────────────────────────────────────────────────────
  'raci-watchlist': () => import('./raci-watchlist.screen').then(m => m.raciWatchlistScreen),
  'cross-pod': () => import('./cross-pod.screen').then(m => m.crossPodScreen),

  // ───────────────────────────────────────────────────────
  // Manager - Activities
  // ───────────────────────────────────────────────────────
  'manager-activities': () => import('./manager-activities.screen').then(m => m.managerActivitiesScreen),

  // ───────────────────────────────────────────────────────
  // CFO - Financial Screens
  // ───────────────────────────────────────────────────────
  'cfo-dashboard': () => import('./cfo-dashboard.screen').then(m => m.cfoDashboardScreen),
  'revenue-analytics': () => import('./revenue-analytics.screen').then(m => m.revenueAnalyticsScreen),
  'margin-analysis': () => import('./margin-analysis.screen').then(m => m.marginAnalysisScreen),
  'ar-dashboard': () => import('./ar-dashboard.screen').then(m => m.arDashboardScreen),
  'placements-financial': () => import('./placements-financial.screen').then(m => m.placementsFinancialScreen),
  'financial-reports': () => import('./financial-reports.screen').then(m => m.financialReportsScreen),

  // ───────────────────────────────────────────────────────
  // COO - Operations Screens
  // ───────────────────────────────────────────────────────
  'coo-dashboard': () => import('./coo-dashboard.screen').then(m => m.cooDashboardScreen),
  'all-pods-overview': () => import('./all-pods-overview.screen').then(m => m.allPodsOverviewScreen),
  'coo-pod-detail': () => import('./coo-pod-detail.screen').then(m => m.cooPodDetailScreen),
  'operations-analytics': () => import('./operations-analytics.screen').then(m => m.operationsAnalyticsScreen),
  'sla-dashboard': () => import('./sla-dashboard.screen').then(m => m.slaDashboardScreen),
  'process-metrics': () => import('./process-metrics.screen').then(m => m.processMetricsScreen),
  'coo-escalations': () => import('./coo-escalations.screen').then(m => m.cooEscalationsScreen),

  // ───────────────────────────────────────────────────────
  // CEO - Strategic Screens
  // ───────────────────────────────────────────────────────
  'ceo-dashboard': () => import('./ceo-dashboard.screen').then(m => m.ceoDashboardScreen),
  'business-intelligence': () => import('./business-intelligence.screen').then(m => m.businessIntelligenceScreen),
  'strategic-initiatives': () => import('./strategic-initiatives.screen').then(m => m.strategicInitiativesScreen),
  'portfolio-overview': () => import('./portfolio-overview.screen').then(m => m.portfolioOverviewScreen),
  'executive-reports': () => import('./executive-reports.screen').then(m => m.executiveReportsScreen),

  // ───────────────────────────────────────────────────────
  // Shared Executive Screens
  // ───────────────────────────────────────────────────────
  'forecasting': () => import('./forecasting.screen').then(m => m.forecastingScreen),
  'benchmarking': () => import('./benchmarking.screen').then(m => m.benchmarkingScreen),
} as const;

export type OperationsScreenId = keyof typeof operationsScreens;
