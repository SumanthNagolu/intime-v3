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

  // Alert widgets
  registerSectionWidget('AlertList', AlertList);
  registerSectionWidget('PipelineAlerts', AlertList); // Alias

  // Calendar widgets
  registerSectionWidget('CalendarWidget', CalendarWidget);
  registerSectionWidget('UpcomingCalendar', CalendarWidget); // Alias

  // Wins/Celebration widgets
  registerSectionWidget('WinsList', WinsList);
  registerSectionWidget('RecentWins', WinsList); // Alias
}

// Export individual widgets for direct use
export { SprintProgressWidget } from './SprintProgressWidget';
export { ActivityQueueWidget } from './ActivityQueueWidget';
export { AlertList } from './AlertList';
export { CalendarWidget } from './CalendarWidget';
export { WinsList } from './WinsList';
