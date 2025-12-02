/**
 * Data Table Type Definitions
 *
 * Comprehensive types for feature-rich data tables with TanStack Table integration.
 */

import type { ColumnDef, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';

// ==========================================
// CORE TABLE TYPES
// ==========================================

export type DensityMode = 'compact' | 'comfortable' | 'spacious';

export interface DataTableProps<TData, TValue = unknown> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];

  /** Table data */
  data: TData[];

  /** Unique ID field for row selection */
  idField?: keyof TData;

  /** Pagination configuration */
  pagination?: PaginationConfig;

  /** Sorting configuration */
  sorting?: SortingConfig;

  /** Filter configuration */
  filters?: FilterConfig;

  /** Row selection configuration */
  selection?: SelectionConfig;

  /** Row click handler */
  onRowClick?: (row: TData) => void;

  /** Bulk actions */
  bulkActions?: BulkAction[];

  /** Custom empty state */
  emptyState?: React.ReactNode;

  /** Loading state */
  loading?: boolean;

  /** Error state */
  error?: Error | null;

  /** Density mode */
  density?: DensityMode;

  /** Enable sticky header */
  stickyHeader?: boolean;

  /** Enable column visibility toggle */
  columnVisibility?: boolean;

  /** Enable column reordering */
  columnReordering?: boolean;

  /** Enable export functionality */
  exportOptions?: ExportOptions;

  /** Table toolbar content */
  toolbar?: React.ReactNode;

  /** Table caption */
  caption?: string;

  /** CSS class name */
  className?: string;
}

// ==========================================
// PAGINATION
// ==========================================

export interface PaginationConfig {
  /** Current page index (0-based) */
  pageIndex: number;

  /** Page size */
  pageSize: number;

  /** Total page count */
  pageCount: number;

  /** Total row count */
  totalRows?: number;

  /** Page change handler */
  onPageChange: (page: number) => void;

  /** Page size change handler */
  onPageSizeChange: (size: number) => void;

  /** Available page sizes */
  pageSizeOptions?: number[];

  /** Manual pagination (server-side) */
  manual?: boolean;
}

// ==========================================
// SORTING
// ==========================================

export interface SortingConfig {
  /** Current sorting state */
  sortBy: SortingState;

  /** Sort change handler */
  onSortChange: (sort: SortingState) => void;

  /** Enable multi-column sorting */
  multiSort?: boolean;

  /** Manual sorting (server-side) */
  manual?: boolean;
}

// ==========================================
// FILTERING
// ==========================================

export interface FilterConfig {
  /** Current filter state */
  filters: ColumnFiltersState;

  /** Filter change handler */
  onFilterChange: (filters: ColumnFiltersState) => void;

  /** Global filter value */
  globalFilter?: string;

  /** Global filter change handler */
  onGlobalFilterChange?: (value: string) => void;

  /** Filter definitions */
  filterDefs?: FilterDefinition[];

  /** Quick filter presets */
  quickFilters?: QuickFilter[];

  /** Manual filtering (server-side) */
  manual?: boolean;
}

export interface FilterDefinition {
  /** Filter ID (matches column ID) */
  id: string;

  /** Filter label */
  label: string;

  /** Filter type */
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number' | 'number-range' | 'boolean';

  /** Options for select filters */
  options?: FilterOption[];

  /** Placeholder text */
  placeholder?: string;

  /** Default value */
  defaultValue?: unknown;
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
}

export interface QuickFilter {
  /** Filter ID */
  id: string;

  /** Filter label */
  label: string;

  /** Filter values to apply */
  values: Record<string, unknown>;

  /** Icon */
  icon?: LucideIcon;

  /** Color */
  color?: string;

  /** Is active */
  active?: boolean;
}

// ==========================================
// SELECTION
// ==========================================

export interface SelectionConfig {
  /** Selected row IDs */
  selected: string[];

  /** Selection change handler */
  onSelectionChange: (ids: string[]) => void;

  /** Selection mode */
  mode?: 'single' | 'multiple';

  /** Enable select all */
  enableSelectAll?: boolean;
}

// ==========================================
// BULK ACTIONS
// ==========================================

export interface BulkAction {
  /** Action ID */
  id: string;

  /** Action label */
  label: string;

  /** Icon */
  icon?: LucideIcon;

  /** Action handler */
  onClick: (selectedIds: string[]) => void | Promise<void>;

  /** Variant */
  variant?: 'default' | 'destructive' | 'outline';

  /** Requires confirmation */
  confirm?: ConfirmConfig;

  /** Loading state */
  loading?: boolean;

  /** Disabled state */
  disabled?: boolean;
}

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

// ==========================================
// EXPORT
// ==========================================

export interface ExportOptions {
  /** Enable CSV export */
  csv?: boolean;

  /** Enable Excel export */
  excel?: boolean;

  /** Enable PDF export */
  pdf?: boolean;

  /** Export file name */
  filename?: string;

  /** Columns to export (defaults to all visible) */
  columns?: string[];

  /** Custom export handler */
  onExport?: (format: 'csv' | 'excel' | 'pdf', data: unknown[]) => void;
}

// ==========================================
// COLUMN TYPES
// ==========================================

export type ColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'relative-date'
  | 'boolean'
  | 'enum'
  | 'status'
  | 'avatar'
  | 'user'
  | 'email'
  | 'phone'
  | 'url'
  | 'link'
  | 'rating'
  | 'progress'
  | 'tags'
  | 'alert'
  | 'actions';

export interface ColumnConfig {
  /** Column ID */
  id: string;

  /** Column header */
  header: string;

  /** Data accessor */
  accessor: string;

  /** Column type */
  type?: ColumnType;

  /** Width */
  width?: string | number;

  /** Min width */
  minWidth?: number;

  /** Max width */
  maxWidth?: number;

  /** Is sortable */
  sortable?: boolean;

  /** Is filterable */
  filterable?: boolean;

  /** Is visible by default */
  visible?: boolean;

  /** Is resizable */
  resizable?: boolean;

  /** Is sticky */
  sticky?: 'left' | 'right';

  /** Cell alignment */
  align?: 'left' | 'center' | 'right';

  /** Column-specific config */
  config?: Record<string, unknown>;
}

// ==========================================
// STATUS COLUMN
// ==========================================

export interface StatusConfig {
  /** Status value to label mapping */
  labels?: Record<string, string>;

  /** Status value to color mapping */
  colors?: Record<string, StatusColor>;

  /** Status value to icon mapping */
  icons?: Record<string, LucideIcon>;

  /** Show icon */
  showIcon?: boolean;

  /** Show tooltip with description */
  showTooltip?: boolean;

  /** Tooltip descriptions */
  descriptions?: Record<string, string>;
}

export type StatusColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gray'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'blue'
  | 'purple'
  | 'pink';

// ==========================================
// CURRENCY COLUMN
// ==========================================

export interface CurrencyConfig {
  /** Currency code (e.g., 'USD', 'EUR') */
  currency?: string;

  /** Locale for formatting */
  locale?: string;

  /** Minimum fraction digits */
  minimumFractionDigits?: number;

  /** Maximum fraction digits */
  maximumFractionDigits?: number;

  /** Show currency symbol */
  showSymbol?: boolean;

  /** Rate type suffix (e.g., '/hr', '/day') */
  suffix?: string;
}

// ==========================================
// DATE COLUMN
// ==========================================

export interface DateConfig {
  /** Date format */
  format?: 'short' | 'medium' | 'long' | 'relative' | string;

  /** Show time */
  showTime?: boolean;

  /** Timezone */
  timezone?: string;

  /** Show tooltip with full date */
  showTooltip?: boolean;
}

// ==========================================
// RATING COLUMN
// ==========================================

export interface RatingConfig {
  /** Maximum rating value */
  max?: number;

  /** Rating type */
  type?: 'stars' | 'number' | 'percentage';

  /** Show label */
  showLabel?: boolean;

  /** Color gradient */
  colorGradient?: boolean;
}

// ==========================================
// PROGRESS COLUMN
// ==========================================

export interface ProgressConfig {
  /** Maximum value */
  max?: number;

  /** Show percentage label */
  showLabel?: boolean;

  /** Show as steps (e.g., "3/5") */
  asSteps?: boolean;

  /** Color by progress */
  colorByProgress?: boolean;
}

// ==========================================
// ALERT COLUMN
// ==========================================

export type AlertLevel = 'green' | 'yellow' | 'orange' | 'red' | 'black';

export interface AlertConfig {
  /** Alert level thresholds */
  thresholds?: {
    green: number;
    yellow: number;
    orange: number;
    red: number;
  };

  /** Alert level labels */
  labels?: Record<AlertLevel, string>;

  /** Show icon */
  showIcon?: boolean;

  /** Show days remaining */
  showDays?: boolean;

  /** Invert (lower is worse) */
  invert?: boolean;
}

// ==========================================
// TAGS COLUMN
// ==========================================

export interface TagsConfig {
  /** Maximum visible tags */
  maxVisible?: number;

  /** Tag color mapping */
  colors?: Record<string, string>;

  /** Show count badge */
  showCount?: boolean;

  /** Clickable for filtering */
  clickable?: boolean;
}

// ==========================================
// USER COLUMN
// ==========================================

export interface UserConfig {
  /** Show avatar */
  showAvatar?: boolean;

  /** Avatar field path */
  avatarField?: string;

  /** Name field path */
  nameField?: string;

  /** Email field path */
  emailField?: string;

  /** Click to view profile */
  clickable?: boolean;

  /** Profile route */
  profileRoute?: string;

  /** Show multiple users */
  multiple?: boolean;

  /** Max visible users */
  maxVisible?: number;
}

// ==========================================
// LINK COLUMN
// ==========================================

export interface LinkConfig {
  /** Route template (use {id} for row ID) */
  route?: string;

  /** Field to use for route param */
  routeField?: string;

  /** Open in new tab */
  newTab?: boolean;

  /** Icon to show */
  icon?: LucideIcon;

  /** Truncate text */
  truncate?: number;
}

// ==========================================
// ACTIONS COLUMN
// ==========================================

export interface ActionsConfig {
  /** Actions to show */
  actions: ActionItem[];

  /** Show as dropdown */
  dropdown?: boolean;

  /** Quick actions (shown inline) */
  quickActions?: ActionItem[];

  /** Dropdown label */
  dropdownLabel?: string;
}

export interface ActionItem {
  /** Action ID */
  id: string;

  /** Action label */
  label: string;

  /** Icon */
  icon?: LucideIcon;

  /** Click handler */
  onClick: (row: unknown) => void;

  /** Variant */
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';

  /** Visibility condition */
  visible?: (row: unknown) => boolean;

  /** Disabled condition */
  disabled?: (row: unknown) => boolean;

  /** Separator before this action */
  separator?: boolean;

  /** Keyboard shortcut */
  shortcut?: string;
}

// ==========================================
// EMPTY STATES
// ==========================================

export interface EmptyStateProps {
  /** State type */
  type: 'no-data' | 'no-results' | 'error';

  /** Title */
  title?: string;

  /** Description */
  description?: string;

  /** Icon */
  icon?: LucideIcon;

  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };

  /** Error object (for error state) */
  error?: Error;
}

// ==========================================
// SKELETON STATE
// ==========================================

export interface SkeletonConfig {
  /** Number of rows */
  rows?: number;

  /** Show header skeleton */
  header?: boolean;

  /** Show pagination skeleton */
  pagination?: boolean;
}
