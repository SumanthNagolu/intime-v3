/**
 * Dashboard Widgets Index
 *
 * Registers all dashboard section widgets with the section widget registry.
 */

import { registerSectionWidget } from '../../registry/section-widget-registry';

// Import all dashboard widgets
import { SprintProgressWidget } from './SprintProgressWidget';
import { ActivityQueueWidget } from './ActivityQueueWidget';
import { AlertList } from './AlertList';
import { CalendarWidget } from './CalendarWidget';
import { WinsList } from './WinsList';
import { RACIWatchlistWidget } from './RACIWatchlistWidget';
import { ClientHealthAlerts } from './ClientHealthAlerts';
import { CrossPillarOpportunities } from './CrossPillarOpportunities';
import { KanbanBoard } from './KanbanBoard';
import { ViewToggle } from './ViewToggle';
import { PipelineFilters } from './PipelineFilters';

// Bench Sales widgets
import { PrioritizedTaskList } from './PrioritizedTaskList';
import { BenchStatusDistribution } from './BenchStatusDistribution';
import { BenchStatusSummary } from './BenchStatusSummary';
import { JobOrderFeed } from './JobOrderFeed';
import { ConsultantCardGrid } from './ConsultantCardGrid';
import { QuickActivityPatterns } from './QuickActivityPatterns';
import { MarketingProfileGrid } from './MarketingProfileGrid';

// Additional Bench Sales widgets
import { PlacementCardList } from './PlacementCardList';
import { ImmigrationAlertsDashboard } from './ImmigrationAlertsDashboard';
import { MarketingActivityWidget } from './MarketingActivityWidget';
import { RevenueCommissionWidget } from './RevenueCommissionWidget';

/**
 * Register all dashboard widgets
 * Call this on app initialization
 */
export function registerDashboardWidgets(): void {
  // Sprint/KPI widgets
  registerSectionWidget('SprintProgressWidget', SprintProgressWidget);

  // Task/Activity widgets
  registerSectionWidget('ActivityQueueWidget', ActivityQueueWidget);
  registerSectionWidget('TaskQueueWidget', ActivityQueueWidget); // Alias
  registerSectionWidget('ActivityQueue', ActivityQueueWidget); // Bench screen alias

  // Alert widgets
  registerSectionWidget('AlertList', AlertList);
  registerSectionWidget('PipelineAlerts', AlertList); // Alias
  registerSectionWidget('ClientHealthAlerts', ClientHealthAlerts);

  // Calendar widgets
  registerSectionWidget('CalendarWidget', CalendarWidget);
  registerSectionWidget('UpcomingCalendar', CalendarWidget); // Alias

  // Wins/Celebration widgets
  registerSectionWidget('WinsList', WinsList);
  registerSectionWidget('RecentWins', WinsList); // Alias

  // RACI/Watchlist widgets
  registerSectionWidget('RACIWatchlistWidget', RACIWatchlistWidget);

  // Cross-pillar widgets
  registerSectionWidget('CrossPillarOpportunities', CrossPillarOpportunities);

  // Pipeline widgets
  registerSectionWidget('KanbanBoard', KanbanBoard);
  registerSectionWidget('PipelineFilters', PipelineFilters);
  registerSectionWidget('MiniKanbanBoard', KanbanBoard); // Bench screen alias

  // View toggle widgets
  registerSectionWidget('ViewToggle', ViewToggle);

  // Bench Sales widgets
  registerSectionWidget('PrioritizedTaskList', PrioritizedTaskList);
  registerSectionWidget('BenchStatusDistribution', BenchStatusDistribution);
  registerSectionWidget('BenchStatusSummary', BenchStatusSummary);
  registerSectionWidget('JobOrderFeed', JobOrderFeed);
  registerSectionWidget('ConsultantCardGrid', ConsultantCardGrid);
  registerSectionWidget('QuickActivityPatterns', QuickActivityPatterns);
  registerSectionWidget('MarketingProfileGrid', MarketingProfileGrid);

  // Full bench sales widgets
  registerSectionWidget('PlacementCardList', PlacementCardList);
  registerSectionWidget('ImmigrationAlertsDashboard', ImmigrationAlertsDashboard);
  registerSectionWidget('MarketingActivityWidget', MarketingActivityWidget);
  registerSectionWidget('RevenueCommissionWidget', RevenueCommissionWidget);
}

// Export individual widgets for direct use
export { SprintProgressWidget } from './SprintProgressWidget';
export { ActivityQueueWidget } from './ActivityQueueWidget';
export { AlertList } from './AlertList';
export { CalendarWidget } from './CalendarWidget';
export { WinsList } from './WinsList';
export { RACIWatchlistWidget } from './RACIWatchlistWidget';
export { ClientHealthAlerts } from './ClientHealthAlerts';
export { CrossPillarOpportunities } from './CrossPillarOpportunities';
export { KanbanBoard } from './KanbanBoard';
export { ViewToggle } from './ViewToggle';
export { PipelineFilters } from './PipelineFilters';

// Bench Sales widgets
export { PrioritizedTaskList } from './PrioritizedTaskList';
export { BenchStatusDistribution } from './BenchStatusDistribution';
export { BenchStatusSummary } from './BenchStatusSummary';
export { JobOrderFeed } from './JobOrderFeed';
export { ConsultantCardGrid } from './ConsultantCardGrid';
export { QuickActivityPatterns } from './QuickActivityPatterns';
export { MarketingProfileGrid } from './MarketingProfileGrid';

// Additional Bench Sales widgets
export { PlacementCardList } from './PlacementCardList';
export { ImmigrationAlertsDashboard } from './ImmigrationAlertsDashboard';
export { MarketingActivityWidget } from './MarketingActivityWidget';
export { RevenueCommissionWidget } from './RevenueCommissionWidget';
