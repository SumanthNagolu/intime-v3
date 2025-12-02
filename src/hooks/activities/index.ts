/**
 * Activity Hooks Index
 *
 * Enhanced hooks for activity management.
 */

// Single activity management
export {
  useActivity,
  type Activity,
  type UseActivityOptions,
  type UseActivityReturn,
} from './useActivity';

// Activity list management
export {
  useActivities,
  type ActivityListItem,
  type SortField,
  type SortDirection,
  type GroupBy,
  type ActivitiesFilters,
  type UseActivitiesOptions,
  type ActivityGroup,
  type UseActivitiesReturn,
} from './useActivities';

// Activity mutations
export {
  useActivityMutations,
  type CreateActivityInput,
  type UpdateActivityInput,
  type CompleteActivityInput,
  type DeferActivityInput,
  type CancelActivityInput,
  type ReassignActivityInput,
  type AddCommentInput,
  type UpdateChecklistInput,
  type UseActivityMutationsReturn,
} from './useActivityMutations';

// Personal queue
export {
  useMyQueue,
  type QueueActivity,
  type QueueCounts,
  type UseMyQueueOptions,
  type UseMyQueueReturn,
} from './useMyQueue';

// Team queue (manager view)
export {
  useTeamQueue,
  type TeamActivity,
  type TeamMemberWorkload,
  type TeamStats,
  type UseTeamQueueOptions,
  type UseTeamQueueReturn,
} from './useTeamQueue';

// Pattern management
export {
  useActivityPatterns,
  type PatternWithDefaults,
  type UseActivityPatternsOptions,
  type UseActivityPatternsReturn,
} from './useActivityPatterns';
