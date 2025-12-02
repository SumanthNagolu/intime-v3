/**
 * Template Type Definitions
 *
 * Configuration types for screen factory functions.
 * Templates allow rapid generation of List, Detail, and Form screens.
 */

import type { EntityType } from '@/lib/workspace/entity-registry';
import type { FieldDefinition, OptionDefinition, FieldType, InputSetConfig } from '../types/widget.types';
import type { DynamicValue, VisibilityRule, PermissionRule } from '../types/data.types';
import type { ActionDefinition, SectionDefinition, TableColumnDefinition, LucideIconName } from '../types/screen.types';

// ==========================================
// BASE TEMPLATE CONFIG
// ==========================================

export interface BaseTemplateConfig {
  /** Entity type from registry */
  entityType: EntityType;

  /** Domain for routing (crm, recruiting, bench, hr, academy) */
  domain: string;

  /** Human-readable entity name (singular) */
  displayName?: string;

  /** Human-readable entity name (plural) */
  pluralName?: string;

  /** tRPC procedure names */
  procedures: {
    list?: string;
    getById?: string;
    create?: string;
    update?: string;
    delete?: string;
    getStats?: string;
  };

  /** Base route path (defaults to /employee/{domain}/{entityType}s) */
  basePath?: string;
}

// ==========================================
// LIST SCREEN TEMPLATE
// ==========================================

export interface ListTemplateConfig extends BaseTemplateConfig {
  /** Table columns to display */
  columns: ListColumnConfig[];

  /** Metrics section config (optional) */
  metrics?: MetricConfig[];

  /** Filter configuration */
  filters?: FilterConfig[];

  /** Quick filters (preset filter chips) */
  quickFilters?: QuickFilterConfig[];

  /** Row actions (shown on each row) */
  rowActions?: RowActionConfig[];

  /** Header actions (create, import, export) */
  headerActions?: HeaderActionConfig[];

  /** Row click behavior */
  rowClick?: 'navigate' | 'select' | 'expand' | 'none';

  /** Custom empty state */
  emptyState?: EmptyStateConfig;

  /** Enable bulk selection */
  bulkSelect?: boolean;

  /** Bulk actions (when rows selected) */
  bulkActions?: BulkActionConfig[];

  /** Default sort */
  defaultSort?: { field: string; direction: 'asc' | 'desc' };

  /** Default page size */
  defaultPageSize?: number;
}

export interface ListColumnConfig {
  /** Column ID */
  id: string;

  /** Column header label */
  label: string;

  /** Data field path */
  path: string;

  /** Field type for rendering */
  type?: FieldType | string;

  /** Is sortable */
  sortable?: boolean;

  /** Is filterable */
  filterable?: boolean;

  /** Column width */
  width?: string;

  /** For enum types - provide options */
  options?: OptionDefinition[];

  /** Badge color mapping for status fields */
  badgeColors?: Record<string, string>;

  /** Additional widget config */
  config?: Record<string, unknown>;

  /** Visibility rule */
  visible?: VisibilityRule;

  /** Link to entity detail */
  linkToDetail?: boolean;
}

export interface MetricConfig {
  /** Metric ID */
  id: string;

  /** Metric label */
  label: string;

  /** Field type (number, currency, percentage) */
  type: 'number' | 'currency' | 'percentage';

  /** Data path */
  path: string;

  /** Icon */
  icon?: LucideIconName;

  /** Color */
  color?: string;

  /** Trend path (for showing change) */
  trendPath?: string;

  /** Link to filtered list */
  link?: string;
}

export interface FilterConfig {
  /** Filter ID */
  id: string;

  /** Filter label */
  label: string;

  /** Field type */
  type: FieldType | 'date-range' | 'number-range';

  /** Options (for enum/select) */
  options?: OptionDefinition[];

  /** Placeholder text */
  placeholder?: string;

  /** Default value */
  defaultValue?: unknown;
}

export interface QuickFilterConfig {
  /** Filter ID */
  id: string;

  /** Filter label */
  label: string;

  /** Filter values to apply */
  values: Record<string, unknown>;

  /** Icon */
  icon?: LucideIconName;

  /** Color */
  color?: string;
}

export interface RowActionConfig {
  /** Action ID */
  id: string;

  /** Action label */
  label: string;

  /** Icon */
  icon?: LucideIconName;

  /** Action type */
  type: 'navigate' | 'mutation' | 'modal' | 'custom';

  /** Route (for navigate) */
  route?: string;

  /** Procedure (for mutation) */
  procedure?: string;

  /** Modal name (for modal) */
  modal?: string;

  /** Handler name (for custom) */
  handler?: string;

  /** Variant */
  variant?: 'default' | 'destructive';

  /** Confirmation required */
  confirm?: {
    title: string;
    message: string;
  };

  /** Visibility rule */
  visible?: VisibilityRule;
}

export interface HeaderActionConfig {
  /** Action ID */
  id: string;

  /** Action type preset (create, import, export) or custom */
  type: 'create' | 'import' | 'export' | 'custom';

  /** Override label */
  label?: string;

  /** Override icon */
  icon?: LucideIconName;

  /** Override route (for create) */
  route?: string;

  /** Variant */
  variant?: 'default' | 'primary' | 'secondary' | 'outline';

  /** Handler name (for custom) */
  handler?: string;
}

export interface BulkActionConfig {
  /** Action ID */
  id: string;

  /** Action label */
  label: string;

  /** Icon */
  icon?: LucideIconName;

  /** Procedure to call */
  procedure: string;

  /** Confirmation */
  confirm?: {
    title: string;
    message: string;
  };
}

export interface EmptyStateConfig {
  /** Title */
  title: string;

  /** Description */
  description: string;

  /** Icon */
  icon?: LucideIconName;

  /** Action button */
  action?: {
    label: string;
    route: string;
  };
}

// ==========================================
// DETAIL SCREEN TEMPLATE
// ==========================================

export interface DetailTemplateConfig extends BaseTemplateConfig {
  /** Title field path */
  titleField: string;

  /** Subtitle field path (optional) */
  subtitleField?: string;

  /** Icon field path (optional) */
  iconField?: string;

  /** Status field for header badge */
  statusField?: string;

  /** Status options (for badge colors) */
  statusOptions?: OptionDefinition[];

  /** Sidebar configuration */
  sidebar?: SidebarConfig;

  /** Tab definitions */
  tabs: DetailTabConfig[];

  /** Header actions */
  headerActions?: DetailActionConfig[];

  /** Enable edit mode */
  editable?: boolean;

  /** Enable inline editing */
  inlineEdit?: boolean;
}

export interface SidebarConfig {
  /** Sidebar position */
  position?: 'left' | 'right';

  /** Sidebar width */
  width?: 'sm' | 'md' | 'lg';

  /** Sidebar title */
  title?: string;

  /** Sidebar fields */
  fields: SidebarFieldConfig[];
}

export interface SidebarFieldConfig {
  /** Field ID */
  id: string;

  /** Field label */
  label: string;

  /** Field type */
  type: FieldType | string;

  /** Data path */
  path: string;

  /** Options (for enum types) */
  options?: OptionDefinition[];

  /** Badge colors (for status fields) */
  badgeColors?: Record<string, string>;

  /** Additional config */
  config?: Record<string, unknown>;
}

export interface DetailTabConfig {
  /** Tab ID */
  id: string;

  /** Tab label */
  label: string;

  /** Tab icon */
  icon?: LucideIconName;

  /** Badge path (for count display) */
  badgePath?: string;

  /** Use InputSet references */
  inputSets?: string[];

  /** Or define inline sections */
  sections?: DetailSectionConfig[];

  /** Related entity table */
  relatedTable?: RelatedTableConfig;

  /** Related entity list */
  relatedList?: RelatedListConfig;

  /** Activity timeline */
  activityTimeline?: ActivityTimelineConfig;

  /** Visibility rule */
  visible?: VisibilityRule;

  /** Permissions */
  permissions?: PermissionRule[];
}

export interface DetailSectionConfig {
  /** Section ID */
  id: string;

  /** Section title */
  title?: string;

  /** Section type */
  type?: 'field-grid' | 'info-card' | 'form' | 'custom';

  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;

  /** Fields */
  fields?: FieldDefinition[];

  /** InputSet reference */
  inputSet?: string;

  /** Is collapsible */
  collapsible?: boolean;

  /** Default expanded */
  defaultExpanded?: boolean;

  /** Is editable */
  editable?: boolean;

  /** Custom component */
  component?: string;
}

export interface RelatedTableConfig {
  /** Related entity type */
  entity: string;

  /** Data source */
  dataSource: {
    procedure: string;
    params?: Record<string, string | DynamicValue>;
  };

  /** Table columns */
  columns: ListColumnConfig[];

  /** Row click behavior */
  rowClick?: 'navigate' | 'modal' | 'none';

  /** Row click route */
  rowRoute?: string;

  /** Add action */
  addAction?: {
    label?: string;
    modal?: string;
    route?: string;
  };

  /** Empty state */
  emptyState?: EmptyStateConfig;
}

export interface RelatedListConfig {
  /** Related entity type */
  entity: string;

  /** Data source procedure */
  procedure: string;

  /** List item template */
  template: 'card' | 'row' | 'timeline';

  /** Fields to display */
  fields: string[];

  /** Add action */
  addAction?: {
    label?: string;
    modal?: string;
  };
}

export interface ActivityTimelineConfig {
  /** Data source procedure */
  procedure: string;

  /** Filter options */
  filterOptions?: OptionDefinition[];

  /** Show add activity button */
  showAddButton?: boolean;

  /** Add activity modal */
  addModal?: string;
}

export interface DetailActionConfig {
  /** Action ID */
  id: string;

  /** Action type */
  type: 'edit' | 'delete' | 'navigate' | 'mutation' | 'modal' | 'custom';

  /** Override label */
  label?: string;

  /** Icon */
  icon?: LucideIconName;

  /** Variant */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'destructive';

  /** Route (for navigate) */
  route?: string;

  /** Procedure (for mutation) */
  procedure?: string;

  /** Modal (for modal) */
  modal?: string;

  /** Handler (for custom) */
  handler?: string;

  /** Confirmation */
  confirm?: {
    title: string;
    message: string;
    destructive?: boolean;
  };

  /** Visibility */
  visible?: VisibilityRule;
}

// ==========================================
// FORM SCREEN TEMPLATE
// ==========================================

export interface FormTemplateConfig extends BaseTemplateConfig {
  /** Form mode */
  mode: 'create' | 'edit';

  /** Form title (static or dynamic) */
  title?: string | DynamicValue;

  /** Form subtitle */
  subtitle?: string;

  /** Form sections */
  sections: FormSectionConfig[];

  /** Submit configuration */
  submit: FormSubmitConfig;

  /** Cancel route */
  cancelRoute?: string;

  /** Enable auto-save draft */
  autoSaveDraft?: boolean;

  /** Show field progress */
  showProgress?: boolean;
}

export interface FormSectionConfig {
  /** Section ID */
  id: string;

  /** Section title */
  title?: string;

  /** Section description */
  description?: string;

  /** Section icon */
  icon?: LucideIconName;

  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;

  /** InputSet reference */
  inputSet?: string;

  /** Inline fields */
  fields?: FieldDefinition[];

  /** Is collapsible */
  collapsible?: boolean;

  /** Default expanded */
  defaultExpanded?: boolean;

  /** Visibility rule */
  visible?: VisibilityRule;
}

export interface FormSubmitConfig {
  /** Submit button label */
  label?: string;

  /** Procedure to call */
  procedure?: string;

  /** Success message */
  successMessage?: string;

  /** Success redirect route */
  redirectTo?: string | 'detail' | 'list';

  /** Transform function name (optional) */
  transform?: string;

  /** On success handler */
  onSuccess?: string;

  /** On error handler */
  onError?: string;
}

// ==========================================
// WIZARD SCREEN TEMPLATE
// ==========================================

export interface WizardTemplateConfig extends BaseTemplateConfig {
  /** Wizard title */
  title: string;

  /** Wizard steps */
  steps: WizardStepConfig[];

  /** Submit configuration */
  submit: FormSubmitConfig;

  /** Allow step navigation */
  allowNavigation?: boolean;

  /** Show progress indicator */
  showProgress?: boolean;

  /** Enable draft saving */
  enableDraft?: boolean;
}

export interface WizardStepConfig {
  /** Step ID */
  id: string;

  /** Step title */
  title: string;

  /** Step description */
  description?: string;

  /** Step icon */
  icon?: LucideIconName;

  /** Step sections */
  sections: FormSectionConfig[];

  /** Validation fields */
  requiredFields?: string[];

  /** Can skip this step */
  skippable?: boolean;

  /** Custom validation handler */
  validate?: string;
}

// ==========================================
// SHARED UTILITIES
// ==========================================

/**
 * Helper to create a DynamicValue from a field path
 */
export function fieldValue(path: string, defaultValue?: unknown): DynamicValue {
  return { type: 'field', path, default: defaultValue };
}

/**
 * Helper to create a URL param value
 */
export function paramValue(path: string, defaultValue?: unknown): DynamicValue {
  return { type: 'param', path, default: defaultValue };
}

/**
 * Helper to create a static value
 */
export function staticValue(value: unknown): DynamicValue {
  return { type: 'static', path: String(value), default: value };
}

/**
 * Helper to capitalize first letter
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Helper to pluralize a word
 */
export function pluralize(str: string): string {
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) {
    return str + 'es';
  }
  return str + 's';
}

/**
 * Generate default base path
 */
export function getBasePath(domain: string, entityType: string): string {
  return `/employee/${domain}/${pluralize(entityType)}`;
}

/**
 * Generate default procedure name
 */
export function getProcedureName(domain: string, entityType: string, operation: string): string {
  return `${domain}.${pluralize(entityType)}.${operation}`;
}
