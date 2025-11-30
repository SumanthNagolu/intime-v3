/**
 * Shared Workspace Section Components
 *
 * Reusable display sections used across all workspace types.
 */

export { InfoCard } from './InfoCard';
export { MetricsGrid } from './MetricsGrid';
export { StatusBadge } from './StatusBadge';
export { QuickActionsBar } from './QuickActionsBar';
export { RelatedObjectsList } from './RelatedObjectsList';

// Re-export types
export type { InfoCardProps, InfoCardField } from './InfoCard';
export type { MetricsGridProps, MetricItem } from './MetricsGrid';
export type { StatusBadgeProps } from './StatusBadge';
export type { QuickActionsBarProps, QuickActionItem } from './QuickActionsBar';
export type { RelatedObjectsListProps, RelatedObject } from './RelatedObjectsList';
