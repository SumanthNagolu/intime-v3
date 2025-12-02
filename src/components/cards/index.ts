/**
 * InTime v3 Card Components
 *
 * Reusable card components for dashboards, kanban views, and entity displays.
 * Following the Guidewire Activity-Centric UI pattern.
 */

// ============================================================================
// Types
// ============================================================================
export * from './types';

// ============================================================================
// Base Metric Cards
// ============================================================================
export { StatCard } from './StatCard';
export { KPICard } from './KPICard';
export { MetricGroupCard } from './MetricGroupCard';
export { CountdownCard } from './CountdownCard';

// ============================================================================
// Entity Cards
// ============================================================================
export {
  JobCard,
  CandidateCard,
  SubmissionCard,
  BenchConsultantCard,
  PlacementCard,
  ActivityCard,
  TaskCard,
  LeadCard,
  DealCard,
  AccountCard,
  ContactCard,
} from './entity';

// ============================================================================
// Kanban Cards
// ============================================================================
export {
  KanbanCardBase,
  type KanbanCardBaseProps,
  SubmissionKanbanCard,
  DealKanbanCard,
  TaskKanbanCard,
} from './kanban';

// ============================================================================
// List Cards
// ============================================================================
export {
  ActivityListItem,
  TimelineEventCard,
  NotificationCard,
} from './list';

// ============================================================================
// Dashboard Cards
// ============================================================================
export {
  RecentActivityFeed,
  PipelineFunnelCard,
  TasksDueCard,
  AlertsBannerCard,
} from './dashboard';

// ============================================================================
// Financial Cards
// ============================================================================
export {
  RevenueCard,
  MarginCard,
  CashFlowCard,
} from './financial';

// ============================================================================
// Card Utilities
// ============================================================================
export {
  CardSkeleton,
  CardEmpty,
  CardError,
  CardGroup,
} from './utils';
