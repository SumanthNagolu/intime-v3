/**
 * Data Tables - Main Export
 *
 * Comprehensive data table system for InTime v3.
 */

// Base Components
export { DataTable } from './DataTable';
export type { DataTableProps, DensityMode } from './types';

// Column Components
export {
  StatusColumn,
  defaultStatusColors,
  DateColumn,
  RelativeDateColumn,
  DateTimeColumn,
  CurrencyColumn,
  RateColumn,
  RateRangeColumn,
  UserColumn,
  MultipleUsersColumn,
  EntityLinkColumn,
  JobLinkColumn,
  AccountLinkColumn,
  CandidateLinkColumn,
  ContactLinkColumn,
  RatingColumn,
  MatchScoreColumn,
  ProgressColumn,
  AlertColumn,
  VisaAlertColumn,
  BenchDaysColumn,
  TagsColumn,
  SkillsColumn,
  ActionsColumn,
} from './columns';

// Domain Tables
export {
  // Recruiting
  JobsTable,
  createJobColumns,
  jobFilterDefs,
  jobQuickFilters,
  CandidatesTable,
  createCandidateColumns,
  candidateFilterDefs,
  SubmissionsTable,
  createSubmissionColumns,
  submissionFilterDefs,
  // CRM
  AccountsTable,
  createAccountColumns,
  accountFilterDefs,
  // Bench Sales
  BenchConsultantsTable,
  createBenchConsultantColumns,
  benchConsultantFilterDefs,
  benchConsultantQuickFilters,
  // HR
  EmployeesTable,
  createEmployeeColumns,
  employeeFilterDefs,
  // Activities
  ActivitiesTable,
  createActivityColumns,
  activityFilterDefs,
} from './domain';

export type {
  JobRow,
  CandidateRow,
  SubmissionRow,
  AccountRow,
  BenchConsultantRow,
  EmployeeRow,
  ActivityRow,
} from './domain';

// Specialized Views
export { KanbanBoard, KanbanCard } from './KanbanBoard';
export type { KanbanColumn, KanbanBoardProps, KanbanCardProps } from './KanbanBoard';

export { CalendarView } from './CalendarView';
export type { CalendarEvent, CalendarViewMode, CalendarViewProps } from './CalendarView';

// Types
export type {
  PaginationConfig,
  SortingConfig,
  FilterConfig,
  FilterDefinition,
  FilterOption,
  QuickFilter,
  SelectionConfig,
  BulkAction,
  ConfirmConfig,
  ExportOptions,
  ColumnType,
  ColumnConfig,
  StatusConfig,
  StatusColor,
  CurrencyConfig,
  DateConfig,
  RatingConfig,
  ProgressConfig,
  AlertConfig,
  AlertLevel,
  TagsConfig,
  UserConfig,
  LinkConfig,
  ActionsConfig,
  ActionItem,
  EmptyStateProps,
  SkeletonConfig,
} from './types';
