/**
 * Dashboard Components
 *
 * Export all dashboard-related components for role-based dashboards.
 */

// Widget components
export {
  MetricWidget,
  ListWidget,
  ChartWidget,
  PipelineWidget,
  ActivityWidget,
  QuickActionsWidget,
  type MetricWidgetProps,
  type ListWidgetProps,
  type ChartWidgetProps,
  type PipelineWidgetProps,
  type ActivityWidgetProps,
  type QuickActionsWidgetProps,
  type MetricData,
  type ListItem,
  type ChartDataPoint,
  type PipelineStage,
  type ActivityItem,
  type QuickActionItem,
} from './DashboardWidgets';

// Main dashboard component
export {
  RoleDashboard,
  type RoleDashboardProps,
  type DashboardData,
} from './RoleDashboard';
