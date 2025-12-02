/**
 * Column Definition Utilities
 *
 * Type-safe column builders and helpers for TanStack Table.
 */

import type { ColumnDef, AccessorFn, CellContext } from '@tanstack/react-table';
import type {
  ColumnConfig,
  ColumnType,
  StatusConfig,
  CurrencyConfig,
  DateConfig,
  RatingConfig,
  ProgressConfig,
  AlertConfig,
  TagsConfig,
  UserConfig,
  LinkConfig,
  ActionsConfig,
} from '@/components/tables/types';

// ==========================================
// COLUMN BUILDER
// ==========================================

export interface ColumnBuilder<TData> {
  /** Create a text column */
  text(config: ColumnConfig): ColumnDef<TData>;

  /** Create a number column */
  number(config: ColumnConfig & { format?: Intl.NumberFormatOptions }): ColumnDef<TData>;

  /** Create a currency column */
  currency(config: ColumnConfig & { config?: CurrencyConfig }): ColumnDef<TData>;

  /** Create a date column */
  date(config: ColumnConfig & { config?: DateConfig }): ColumnDef<TData>;

  /** Create a status/enum column */
  status(config: ColumnConfig & { config?: StatusConfig }): ColumnDef<TData>;

  /** Create a user/avatar column */
  user(config: ColumnConfig & { config?: UserConfig }): ColumnDef<TData>;

  /** Create a rating column */
  rating(config: ColumnConfig & { config?: RatingConfig }): ColumnDef<TData>;

  /** Create a progress column */
  progress(config: ColumnConfig & { config?: ProgressConfig }): ColumnDef<TData>;

  /** Create an alert column */
  alert(config: ColumnConfig & { config?: AlertConfig }): ColumnDef<TData>;

  /** Create a tags column */
  tags(config: ColumnConfig & { config?: TagsConfig }): ColumnDef<TData>;

  /** Create a link column */
  link(config: ColumnConfig & { config?: LinkConfig }): ColumnDef<TData>;

  /** Create an actions column */
  actions(config: { config: ActionsConfig }): ColumnDef<TData>;

  /** Create a selection column */
  selection(): ColumnDef<TData>;
}

/**
 * Create a column builder for a specific data type
 */
export function createColumnBuilder<TData>(): ColumnBuilder<TData> {
  return {
    text: (config) => createTextColumn<TData>(config),
    number: (config) => createNumberColumn<TData>(config),
    currency: (config) => createCurrencyColumn<TData>(config),
    date: (config) => createDateColumn<TData>(config),
    status: (config) => createStatusColumn<TData>(config),
    user: (config) => createUserColumn<TData>(config),
    rating: (config) => createRatingColumn<TData>(config),
    progress: (config) => createProgressColumn<TData>(config),
    alert: (config) => createAlertColumn<TData>(config),
    tags: (config) => createTagsColumn<TData>(config),
    link: (config) => createLinkColumn<TData>(config),
    actions: (config) => createActionsColumn<TData>(config),
    selection: () => createSelectionColumn<TData>(),
  };
}

// ==========================================
// COLUMN CREATORS
// ==========================================

function createTextColumn<TData>(config: ColumnConfig): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    minSize: config.minWidth,
    maxSize: config.maxWidth,
    meta: {
      type: 'text' as ColumnType,
      align: config.align ?? 'left',
      ...config.config,
    },
  };
}

function createNumberColumn<TData>(
  config: ColumnConfig & { format?: Intl.NumberFormatOptions }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'number' as ColumnType,
      align: config.align ?? 'right',
      format: config.format,
      ...config.config,
    },
  };
}

function createCurrencyColumn<TData>(
  config: ColumnConfig & { config?: CurrencyConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'currency' as ColumnType,
      align: config.align ?? 'right',
      currency: config.config?.currency ?? 'USD',
      locale: config.config?.locale ?? 'en-US',
      suffix: config.config?.suffix,
      showSymbol: config.config?.showSymbol ?? true,
      minimumFractionDigits: config.config?.minimumFractionDigits ?? 0,
      maximumFractionDigits: config.config?.maximumFractionDigits ?? 2,
    },
  };
}

function createDateColumn<TData>(
  config: ColumnConfig & { config?: DateConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'date' as ColumnType,
      align: config.align ?? 'left',
      format: config.config?.format ?? 'medium',
      showTime: config.config?.showTime ?? false,
      showTooltip: config.config?.showTooltip ?? true,
    },
  };
}

function createStatusColumn<TData>(
  config: ColumnConfig & { config?: StatusConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'status' as ColumnType,
      align: config.align ?? 'left',
      labels: config.config?.labels,
      colors: config.config?.colors,
      icons: config.config?.icons,
      showIcon: config.config?.showIcon ?? false,
      showTooltip: config.config?.showTooltip ?? false,
      descriptions: config.config?.descriptions,
    },
  };
}

function createUserColumn<TData>(
  config: ColumnConfig & { config?: UserConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'user' as ColumnType,
      align: config.align ?? 'left',
      showAvatar: config.config?.showAvatar ?? true,
      avatarField: config.config?.avatarField,
      nameField: config.config?.nameField,
      emailField: config.config?.emailField,
      clickable: config.config?.clickable ?? false,
      profileRoute: config.config?.profileRoute,
      multiple: config.config?.multiple ?? false,
      maxVisible: config.config?.maxVisible ?? 3,
    },
  };
}

function createRatingColumn<TData>(
  config: ColumnConfig & { config?: RatingConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'rating' as ColumnType,
      align: config.align ?? 'left',
      max: config.config?.max ?? 5,
      ratingType: config.config?.type ?? 'stars',
      showLabel: config.config?.showLabel ?? false,
      colorGradient: config.config?.colorGradient ?? true,
    },
  };
}

function createProgressColumn<TData>(
  config: ColumnConfig & { config?: ProgressConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'progress' as ColumnType,
      align: config.align ?? 'left',
      max: config.config?.max ?? 100,
      showLabel: config.config?.showLabel ?? true,
      asSteps: config.config?.asSteps ?? false,
      colorByProgress: config.config?.colorByProgress ?? true,
    },
  };
}

function createAlertColumn<TData>(
  config: ColumnConfig & { config?: AlertConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'alert' as ColumnType,
      align: config.align ?? 'left',
      thresholds: config.config?.thresholds ?? {
        green: 181,
        yellow: 90,
        orange: 30,
        red: 1,
      },
      labels: config.config?.labels,
      showIcon: config.config?.showIcon ?? true,
      showDays: config.config?.showDays ?? true,
      invert: config.config?.invert ?? false,
    },
  };
}

function createTagsColumn<TData>(
  config: ColumnConfig & { config?: TagsConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: false,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'tags' as ColumnType,
      align: config.align ?? 'left',
      maxVisible: config.config?.maxVisible ?? 3,
      colors: config.config?.colors,
      showCount: config.config?.showCount ?? true,
      clickable: config.config?.clickable ?? false,
    },
  };
}

function createLinkColumn<TData>(
  config: ColumnConfig & { config?: LinkConfig }
): ColumnDef<TData> {
  return {
    id: config.id,
    accessorKey: config.accessor,
    header: config.header,
    enableSorting: config.sortable ?? true,
    enableHiding: config.visible !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
    meta: {
      type: 'link' as ColumnType,
      align: config.align ?? 'left',
      route: config.config?.route,
      routeField: config.config?.routeField ?? 'id',
      newTab: config.config?.newTab ?? false,
      icon: config.config?.icon,
      truncate: config.config?.truncate,
    },
  };
}

function createActionsColumn<TData>(
  config: { config: ActionsConfig }
): ColumnDef<TData> {
  return {
    id: 'actions',
    header: '',
    enableSorting: false,
    enableHiding: false,
    size: 80,
    meta: {
      type: 'actions' as ColumnType,
      align: 'right' as const,
      actions: config.config.actions,
      dropdown: config.config.dropdown ?? true,
      quickActions: config.config.quickActions,
      dropdownLabel: config.config.dropdownLabel ?? 'Actions',
    },
  };
}

function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    header: ({ table }) => null, // Rendered by DataTable
    cell: ({ row }) => null, // Rendered by DataTable
    enableSorting: false,
    enableHiding: false,
    size: 40,
    meta: {
      type: 'selection' as const,
    },
  };
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Get value from nested path
 */
export function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * Create accessor function from path
 */
export function createAccessor<TData>(path: string): AccessorFn<TData> {
  return (row) => getNestedValue(row, path);
}

/**
 * Format number value
 */
export function formatNumber(
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US', options).format(num);
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency = 'USD',
  locale = 'en-US',
  options?: Partial<CurrencyConfig>
): string {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(num);

  return options?.suffix ? `${formatted}${options.suffix}` : formatted;
}

/**
 * Format date value
 */
export function formatDate(
  value: Date | string | null | undefined,
  format: DateConfig['format'] = 'medium',
  showTime = false
): string {
  if (!value) return '-';

  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';

  if (format === 'relative') {
    return getRelativeTime(date);
  }

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: format === 'short' ? 'short' : format === 'long' ? 'long' : 'medium',
    ...(showTime && { timeStyle: 'short' }),
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Calculate days difference from now
 */
export function getDaysFromNow(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get alert level from days
 */
export function getAlertLevel(
  days: number | null,
  thresholds = { green: 181, yellow: 90, orange: 30, red: 1 }
): 'green' | 'yellow' | 'orange' | 'red' | 'black' {
  if (days === null) return 'green';
  if (days <= 0) return 'black';
  if (days < thresholds.red) return 'red';
  if (days < thresholds.orange) return 'orange';
  if (days < thresholds.yellow) return 'yellow';
  return 'green';
}
