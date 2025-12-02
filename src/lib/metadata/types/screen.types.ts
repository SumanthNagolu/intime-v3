/**
 * Screen Type Definitions
 *
 * Guidewire-inspired metadata-driven screen definitions.
 * Screens are top-level navigable containers that define layout, data binding, and actions.
 */

import type { EntityType } from '@/lib/workspace/entity-registry';
import type { FieldDefinition, WidgetDefinition, FormatDefinition } from './widget.types';
import type { DataSourceDefinition, DynamicValue, VisibilityRule, PermissionRule, ConditionExpression } from './data.types';

// ==========================================
// SCREEN TYPES
// ==========================================

export type ScreenType =
  | 'detail'      // Single entity detail view
  | 'list'        // Table/grid of entities
  | 'list-detail' // Master-detail split view
  | 'wizard'      // Multi-step workflow
  | 'dashboard'   // KPI/widget dashboard
  | 'popup';      // Modal dialog

export type LucideIconName = string; // Icon name from lucide-react

// ==========================================
// SCREEN DEFINITION
// ==========================================

export interface ScreenDefinition {
  /** Unique identifier for the screen */
  id: string;

  /** Type of screen determines overall behavior */
  type: ScreenType;

  /** Entity type this screen operates on (optional for dashboards) */
  entityType?: EntityType;

  // Display
  /** Screen title - can be static or dynamic from entity field */
  title: string | DynamicValue;

  /** Optional subtitle */
  subtitle?: string | DynamicValue;

  /** Description for the screen */
  description?: string | DynamicValue;

  /** Icon for the screen */
  icon?: LucideIconName;

  // Layout
  /** Layout configuration (optional for wizard screens which use steps) */
  layout?: LayoutDefinition;

  // Data
  /** Primary data source for the screen */
  dataSource?: DataSourceDefinition;

  // Actions & Navigation
  /** Action buttons/menus for the screen */
  actions?: ActionDefinition[];

  /** Bulk actions for list screens with selection */
  bulkActions?: ActionDefinition[];

  /** Navigation configuration */
  navigation?: NavigationDefinition;

  /** Breadcrumbs (shorthand, alternative to navigation.breadcrumbs) */
  breadcrumbs?: BreadcrumbDefinition[];

  // Permissions
  /** Permission rules for accessing this screen */
  permissions?: PermissionRule[];

  // Lifecycle
  /** Lifecycle hooks */
  hooks?: ScreenHooks;

  // Keyboard shortcuts
  /** Keyboard shortcuts for quick actions */
  keyboard_shortcuts?: KeyboardShortcutDefinition[];

  /** Alias for keyboard_shortcuts */
  keyboardShortcuts?: KeyboardShortcutDefinition[];

  // Wizard-specific properties (for type: 'wizard')
  /** Wizard steps */
  steps?: WizardStepDefinition[];

  /** On complete action (for wizards) */
  onComplete?: WizardCompleteAction;
}

export interface KeyboardShortcutDefinition {
  /** Key to press (e.g., 'e', 'ctrl+s') */
  key: string;

  /** Action ID or handler name to execute */
  action: string;

  /** Human-readable description */
  description?: string;

  /** Modifier keys required */
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];

  /** Route to navigate to (alternative to action) */
  route?: string;
}

// ==========================================
// LAYOUT DEFINITION
// ==========================================

export type LayoutType =
  | 'single-column'  // Simple stacked sections
  | 'two-column'     // Two equal columns
  | 'sidebar-main'   // Narrow sidebar + main content
  | 'tabs'           // Tabbed content
  | 'wizard-steps'   // Wizard with step navigation
  | 'list'           // List layout for list screens
  | 'split-view';    // Split view (e.g., marketing profile editor)

export interface LayoutDefinition {
  /** Layout type */
  type: LayoutType;

  // For sidebar-main layouts
  /** Sidebar section definition */
  sidebar?: SectionDefinition;

  /** Sidebar width */
  sidebarWidth?: 'sm' | 'md' | 'lg';

  /** Sidebar position */
  sidebarPosition?: 'left' | 'right';

  // For tabbed layouts
  /** Tab definitions */
  tabs?: TabDefinition[];

  /** Default active tab */
  defaultTab?: string;

  /** Tab position */
  tabPosition?: 'top' | 'left';

  // For wizard layouts
  /** Wizard step definitions */
  steps?: WizardStepDefinition[];

  // Main content
  /** Main content sections (used in non-tabbed layouts) */
  sections?: SectionDefinition[];

  /** Main content section (for sidebar-main layouts) */
  main?: {
    sections?: SectionDefinition[];
  };

  // Header/Footer
  /** Header section */
  header?: SectionDefinition;

  /** Footer section */
  footer?: SectionDefinition;
}

// ==========================================
// SECTION DEFINITION
// ==========================================

export type SectionType =
  | 'info-card'       // Key-value info display
  | 'metrics-grid'    // KPI metrics
  | 'field-grid'      // Form field grid
  | 'table'           // Data table
  | 'list'            // Simple list
  | 'form'            // Editable form
  | 'input-set'       // Reusable input set
  | 'timeline'        // Activity timeline
  | 'tabs'            // Nested tabs
  | 'collapsible'     // Collapsible panel
  | 'custom'          // Custom component
  | 'metrics'         // Metrics section (alias for metrics-grid)
  | 'related-table'   // Related entity table
  | 'panel';          // Panel section

export interface SectionDefinition {
  /** Unique section ID */
  id: string;

  /** Section type */
  type: SectionType;

  /** Section title */
  title?: string | DynamicValue;

  /** Section description */
  description?: string | DynamicValue;

  /** Icon */
  icon?: LucideIconName;

  /** Section header (for tables with custom headers or avatar headers) */
  header?:
    | string
    | {
        type: 'avatar' | 'icon' | 'title';
        path?: string;
        fallbackPath?: string;
        size?: 'sm' | 'md' | 'lg';
        icon?: LucideIconName;
        badge?: DynamicValue | BadgeDefinition;
      };

  // Layout
  /** Number of columns for field grid, or column definitions for table sections */
  columns?: number | TableColumnDefinition[];

  /** Grid span (for nested sections) */
  span?: 1 | 2 | 3 | 4;

  /** Inline display mode (for filters) */
  inline?: boolean;

  // Content
  /** Widget definitions */
  widgets?: WidgetDefinition[];

  /** Alias for widgets - for metrics-grid sections */
  metrics?: WidgetDefinition[];

  /** Field definitions (for forms) */
  fields?: FieldDefinition[];

  /** InputSet reference */
  inputSet?: string;

  /** InputSet field prefix (for nested data) */
  inputSetPrefix?: string;

  /** Read-only mode for input sets */
  readOnly?: boolean;

  // For table sections
  /** Table column definitions */
  columns_config?: TableColumnDefinition[];

  /** Table data source (if different from screen) */
  dataSource?: DataSourceDefinition;

  /** Enable row selection */
  selectable?: boolean;

  /** Row click action */
  rowClick?: {
    type: 'navigate' | 'modal' | 'select' | 'expand';
    route?: string | DynamicValue;
    modal?: string;
    config?: Record<string, unknown>;
  };

  /** Empty state configuration */
  emptyState?: {
    title: string;
    description?: string;
    message?: string;
    icon?: LucideIconName;
    action?: ActionDefinition;
  };

  /** Pagination configuration for table sections */
  pagination?: {
    enabled?: boolean;
    pageSize?: number;
    defaultPageSize?: number;
    showPageSizeSelector?: boolean;
  } | boolean;

  /** Layout configuration for section content */
  layout?: 'grid' | 'list' | 'cards' | 'horizontal' | {
    type: 'grid' | 'list' | 'cards' | 'horizontal';
    columns?: number;
    gap?: 'sm' | 'md' | 'lg';
  };

  /** Nested sections (for container sections) */
  sections?: SectionDefinition[];

  // For custom sections
  /** Custom component name */
  component?: string;

  /** Component props */
  componentProps?: Record<string, unknown>;

  /** Generic config object for section-specific settings */
  config?: Record<string, unknown>;

  /** Section width */
  width?: string | number;

  /** Empty message */
  emptyMessage?: string;

  /** Is sortable (for table sections) */
  sortable?: boolean;

  // Behavior
  /** Visibility rule */
  visible?: VisibilityRule;

  /** Is section editable */
  editable?: boolean;

  /** Is section collapsible */
  collapsible?: boolean;

  /** Default expanded state */
  defaultExpanded?: boolean;

  /** Initial collapsed state */
  collapsed?: boolean;

  // Permissions
  /** Section-level permissions */
  permissions?: PermissionRule[];

  // Actions
  /** Section actions (header-level) */
  actions?: ActionDefinition[];

  /** Row-level actions (for table sections) */
  rowActions?: ActionDefinition[];

  // Footer
  /** Footer section for info-cards */
  footer?: {
    type: 'metrics-row' | 'actions' | 'custom' | 'quality-score' | 'progress';
    /** Label for footer (used in quality-score, progress) */
    label?: string;
    /** Data path for value (used in quality-score, progress) */
    path?: string;
    /** Direct value for footer */
    value?: DynamicValue;
    /** Maximum value (for progress bars, quality scores) */
    maxValue?: number;
    metrics?: Array<{
      label: string;
      value: DynamicValue;
      icon?: LucideIconName;
      format?: 'number' | 'currency' | 'percentage' | 'date' | 'custom';
    }>;
    actions?: ActionDefinition[];
    component?: string;
    /** Props for custom footer components */
    componentProps?: Record<string, unknown>;
  };
}

// ==========================================
// TAB DEFINITION
// ==========================================

export interface TabDefinition {
  /** Tab ID */
  id: string;

  /** Tab label */
  label: string;

  /** Tab icon */
  icon?: LucideIconName;

  /** Badge content (e.g., count) */
  badge?: string | number | DynamicValue | BadgeDefinition;

  /** Tab sections */
  sections: SectionDefinition[];

  /** Tab-level actions */
  actions?: ActionDefinition[];

  /** Visibility rule */
  visible?: VisibilityRule;

  /** Permissions */
  permissions?: PermissionRule[];

  /** Lazy load tab content */
  lazy?: boolean;
}

export interface BadgeDefinition {
  /** Badge type */
  type: 'count' | 'conditional' | 'overdue-count' | 'static' | 'field';

  /** Data path for count/value */
  path?: string;

  /** Badge variant/color */
  variant?: 'default' | 'primary' | 'secondary' | 'warning' | 'destructive' | 'success' | 'status' | string;

  /** Condition for conditional badges */
  condition?: {
    field: string;
    operator: string;
    value: unknown;
  };

  /** Value when condition is true */
  ifTrue?: { value: string | number; variant: string };

  /** Value when condition is false */
  ifFalse?: { value: string | number; variant: string };
}

// ==========================================
// WIZARD STEP DEFINITION
// ==========================================

export interface WizardStepDefinition {
  /** Step ID */
  id: string;

  /** Step title */
  title: string;

  /** Step description */
  description?: string;

  /** Step icon */
  icon?: LucideIconName;

  /** Step sections */
  sections: SectionDefinition[];

  /** Step validation rules */
  validation?: StepValidation;

  /** Can skip this step */
  skippable?: boolean;

  /** Visibility rule */
  visible?: VisibilityRule;

  /** Before entering step hook */
  onEnter?: string;

  /** Before leaving step hook */
  onLeave?: string;
}

export interface StepValidation {
  /** Required fields */
  required?: string[];

  /** Custom validation function name */
  custom?: string;
}

// ==========================================
// TABLE COLUMN DEFINITION
// ==========================================

export interface TableColumnDefinition {
  /** Column ID */
  id: string;

  /** Column header */
  header?: string;

  /** Alias for header - for compatibility */
  label?: string;

  /** Data accessor (field path) */
  accessor?: string;

  /** Alias for accessor - for compatibility */
  path?: string;

  /** Alias for accessor/path - for compatibility */
  field?: string;

  /** Widget type for rendering */
  type?: string;

  /** Widget config */
  config?: Record<string, unknown>;

  /** Options for select/enum columns */
  options?: Array<{ value: string | number; label: string; color?: string }>;

  /** Is sortable */
  sortable?: boolean;

  /** Is filterable */
  filterable?: boolean;

  /** Column width */
  width?: string | number;

  /** Maximum width */
  max?: string | number;

  /** Is column visible */
  visible?: boolean | VisibilityRule;

  /** Row actions for this column */
  actions?: ActionDefinition[];

  /** Link pattern for navigation (e.g., '/entity/{id}') */
  linkPattern?: string | DynamicValue;

  /** Is primary column (for list views) */
  primary?: boolean;

  /** Highlight configuration */
  highlight?: {
    condition?: ConditionExpression;
    color?: string;
    positive?: string;
    negative?: string;
    neutral?: string;
  };

  /** Suffix for column display */
  suffix?: string | DynamicValue;

  /** Format configuration */
  format?: FormatDefinition | string;

  /** Truncate text */
  truncate?: boolean | number;

  /** Custom component for rendering */
  component?: string;
}

// ==========================================
// ACTION DEFINITION
// ==========================================

export type ActionType =
  | 'navigate'    // Navigate to route
  | 'modal'       // Open modal
  | 'mutation'    // Execute mutation
  | 'download'    // Download file
  | 'custom'      // Custom handler
  | 'function'    // Execute a function handler
  | 'workflow'    // Trigger a workflow
  | 'export';     // Export data

export interface ActionDefinition {
  /** Action ID (optional for inline/embedded actions) */
  id?: string;

  /** Action type */
  type: ActionType;

  /** Button label */
  label?: string;

  /** Button icon */
  icon?: LucideIconName;

  /** Button variant */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'icon';

  /** Action config */
  config?: ActionConfig;

  /** Visibility rule */
  visible?: VisibilityRule;

  /** Permissions */
  permissions?: PermissionRule[];

  /** Confirmation dialog */
  confirm?: ConfirmConfig;

  /** Disabled state rule */
  disabled?: VisibilityRule;

  /** Custom handler name (shorthand for config.handler) */
  handler?: string;

  /** Alias for handler - for compatibility */
  action?: string;

  /** Success callback configuration */
  onSuccess?: {
    type: 'navigate' | 'toast' | 'refresh' | 'close';
    route?: string | DynamicValue;
    message?: string;
    toast?: string | { message: string; type?: 'success' | 'error' | 'info' };
  };

  /** Action position (for list/detail screens) */
  position?: 'header' | 'footer' | 'inline';

  /** Trigger for action (e.g., swipe-right, swipe-left) */
  trigger?: string;
}

export type ActionConfig =
  | { type: 'navigate'; route: string | DynamicValue; params?: Record<string, DynamicValue | unknown> }
  | {
      type: 'modal';
      modal: string;
      props?: Record<string, DynamicValue | unknown>;
      preset?: Record<string, unknown>;
      context?: Record<string, DynamicValue | unknown> | string;
    }
  | { type: 'mutation'; procedure: string; input?: Record<string, DynamicValue | unknown> }
  | { type: 'download'; url: string | DynamicValue; filename?: string }
  | { type: 'custom'; handler: string; args?: Record<string, unknown>; params?: Record<string, DynamicValue | unknown> }
  | { type: 'function'; handler: string; args?: Record<string, unknown>; params?: Record<string, DynamicValue | unknown> }
  | { type: 'workflow'; workflow: string; input?: Record<string, DynamicValue | unknown> }
  // Shorthand forms (without type prefix)
  | { handler: string; params?: Record<string, DynamicValue | unknown> }
  | { modal: string; props?: Record<string, DynamicValue | unknown>; context?: Record<string, DynamicValue | unknown> | string };

export interface ConfirmConfig {
  /** Confirmation title */
  title: string;

  /** Confirmation message */
  message: string;

  /** Confirm button label */
  confirmLabel?: string;

  /** Cancel button label */
  cancelLabel?: string;

  /** Is destructive */
  destructive?: boolean;
}

// ==========================================
// NAVIGATION DEFINITION
// ==========================================

export interface NavigationDefinition {
  /** Back button configuration */
  back?: {
    label?: string;
    route?: string | DynamicValue;
  };

  /** Breadcrumb configuration */
  breadcrumbs?: BreadcrumbDefinition[];

  /** Mode-specific navigation (create/edit) */
  create?: {
    breadcrumbs?: BreadcrumbDefinition[];
  };

  edit?: {
    breadcrumbs?: BreadcrumbDefinition[];
  };

  /** Allow skipping steps (for wizards) */
  allowSkip?: boolean;

  /** Show progress indicator (for wizards) */
  showProgress?: boolean;

  /** Show step numbers (for wizards) */
  showStepNumbers?: boolean;

  /** Allow saving draft (for wizards) */
  saveDraft?: boolean;

  /** Allow resuming draft (for wizards) */
  allowResume?: boolean;
}

export interface BreadcrumbDefinition {
  /** Breadcrumb label */
  label: string | DynamicValue;

  /** Breadcrumb route */
  route?: string | DynamicValue;

  /** Is active (current page) */
  active?: boolean;
}

// ==========================================
// SCREEN HOOKS
// ==========================================

export interface ScreenHooks {
  /** Called before screen renders */
  onBeforeRender?: string;

  /** Called after data loads */
  onDataLoad?: string;

  /** Called before save/submit */
  onBeforeSave?: string;

  /** Called after successful save */
  onAfterSave?: string;

  /** Called on error */
  onError?: string;
}

// ==========================================
// WIZARD SCREEN DEFINITION (Extended)
// ==========================================

export interface WizardScreenDefinition extends Omit<ScreenDefinition, 'type' | 'layout' | 'navigation'> {
  type: 'wizard';

  /** Wizard steps */
  steps: WizardStepDefinition[];

  /** Wizard navigation options */
  navigation?: WizardNavigation;

  /** On complete action */
  onComplete?: WizardCompleteAction;
}

export interface WizardNavigation {
  /** Allow skipping steps */
  allowSkip?: boolean;

  /** Show progress indicator */
  showProgress?: boolean;

  /** Show step numbers */
  showStepNumbers?: boolean;

  /** Allow saving draft */
  saveDraft?: boolean;

  /** Allow resuming draft */
  allowResume?: boolean;
}

export interface WizardCompleteAction {
  /** Action type */
  action: 'create' | 'update' | 'custom';

  /** Entity type to create/update */
  entityType?: EntityType;

  /** Redirect after success */
  successRedirect?: string;

  /** Success message */
  successMessage?: string;

  /** Custom handler name */
  handler?: string;
}
