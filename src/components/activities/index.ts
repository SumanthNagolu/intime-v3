/**
 * Activities Components
 *
 * Central export for all activity-related UI components.
 * These components implement the Guidewire-inspired activity-centric architecture.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 * @see docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
 */

// ==========================================
// EXISTING COMPONENTS
// ==========================================

export { ActivityTimeline } from './ActivityTimeline';
export type { ActivityTimelineProps } from './ActivityTimeline';

export { ActivityQueue } from './ActivityQueue';
export type { ActivityQueueProps } from './ActivityQueue';

export { QuickLogBar } from './QuickLogBar';
export type { QuickLogBarProps } from './QuickLogBar';

// ==========================================
// ACTION COMPONENTS
// ==========================================

export {
  CreateActivityButton,
  type CreateActivityButtonProps,
  ActivityStatusButtons,
  type ActivityStatusButtonsProps,
  ActivityQuickCreateModal,
  type ActivityQuickCreateModalProps,
  CompleteActivityModal,
  type CompleteActivityModalProps,
  DeferActivityModal,
  type DeferActivityModalProps,
  CancelActivityModal,
  type CancelActivityModalProps,
  ReassignActivityModal,
  type ReassignActivityModalProps,
} from './actions';

// ==========================================
// PATTERN COMPONENTS
// ==========================================

export {
  PatternSelector,
  type PatternSelectorProps,
  PatternCard,
  type PatternCardProps,
  PatternBadge,
  type PatternBadgeProps,
  PatternDetail,
  type PatternDetailProps,
} from './patterns';

// ==========================================
// VIEW COMPONENTS
// ==========================================

export {
  ActivityList,
  type ActivityListProps,
  ActivityKanban,
  type ActivityKanbanProps,
  type KanbanColumn,
  type KanbanColumnType,
  ActivityCalendar,
  type ActivityCalendarProps,
  type CalendarView,
} from './views';

// Re-export Activity types from views with clearer names
export type { Activity as ActivityListItem } from './views/ActivityList';
export type { Activity as KanbanActivity } from './views/ActivityKanban';
export type { Activity as CalendarActivity } from './views/ActivityCalendar';

// ==========================================
// DETAIL COMPONENTS
// ==========================================

export {
  ActivityHeader,
  type ActivityHeaderProps,
  ActivitySLA,
  type ActivitySLAProps,
  ActivityChecklist,
  type ActivityChecklistProps,
  type ChecklistItem,
  ActivityComments,
  type ActivityCommentsProps,
  type Comment,
  ActivityFields,
  type ActivityFieldsProps,
  ActivityHistory,
  type ActivityHistoryProps,
  type HistoryEvent,
  type HistoryEventType,
  ActivityRelated,
  type ActivityRelatedProps,
  type RelatedEntity,
  type RelatedActivity,
} from './components';

// ==========================================
// FEED COMPONENTS
// ==========================================

export {
  ActivityFeed,
  type ActivityFeedProps,
  ActivityFeedItem,
  type ActivityFeedItemProps,
  type FeedActivity,
  EventFeedItem,
  type EventFeedItemProps,
  type FeedEvent,
  type EventType,
} from './feed';

// ==========================================
// DASHBOARD WIDGETS
// ==========================================

export {
  MyActivitiesWidget,
  type MyActivitiesWidgetProps,
  TeamActivitiesWidget,
  type TeamActivitiesWidgetProps,
  ActivityMetricsWidget,
  type ActivityMetricsWidgetProps,
  OverdueActivitiesWidget,
  type OverdueActivitiesWidgetProps,
  UpcomingActivitiesWidget,
  type UpcomingActivitiesWidgetProps,
} from './widgets';

