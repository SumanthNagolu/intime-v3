/**
 * Bench Sales Dashboard Widgets
 *
 * Custom widgets for the bench sales dashboard.
 * Note: Most widgets are now in ../dashboard/ and registered there.
 * This file re-exports for backwards compatibility.
 */

import { registerSectionWidget } from '../../registry/section-widget-registry';

// Import widgets that exist in this folder
import { PrioritizedTaskList } from './PrioritizedTaskList';
import { BenchStatusDistribution } from './BenchStatusDistribution';
import { JobOrderFeed } from './JobOrderFeed';

// Import from dashboard folder
import {
  ConsultantCardGrid,
  KanbanBoard,
  AlertList,
  SprintProgressWidget,
} from '../dashboard';

/**
 * Register all bench sales widgets
 * Note: Most widgets are now registered in ../dashboard/index.ts
 */
export function registerBenchSalesWidgets(): void {
  // These are duplicates from local folder - prefer dashboard versions
  // Only register if needed for backwards compatibility
}

// Export individual widgets
export { PrioritizedTaskList } from './PrioritizedTaskList';
export { BenchStatusDistribution } from './BenchStatusDistribution';
export { JobOrderFeed } from './JobOrderFeed';

// Re-export from dashboard folder
export { ConsultantCardGrid } from '../dashboard';
export { KanbanBoard as MiniKanbanBoard } from '../dashboard';
export { AlertList as PlacementCardList } from '../dashboard';
export { AlertList as ImmigrationAlertsDashboard } from '../dashboard';
export { SprintProgressWidget as MarketingActivityWidget } from '../dashboard';
export { SprintProgressWidget as RevenueCommissionWidget } from '../dashboard';
