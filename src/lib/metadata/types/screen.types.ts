/**
 * Screen Type Definitions
 *
 * Guidewire-inspired metadata-driven screen definitions.
 * Screens are top-level navigable containers that define layout, data binding, and actions.
 */

import type { EntityType } from '@/lib/workspace/entity-registry';
import type { FieldDefinition, WidgetDefinition } from './widget.types';
import type { DataSourceDefinition, DynamicValue, VisibilityRule, PermissionRule } from './data.types';

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

  /** Icon for the screen */
  icon?: LucideIconName;

  // Layout
  /** Layout configuration */
  layout: LayoutDefinition;

  // Data
  /** Primary data source for the screen */
  dataSource?: DataSourceDefinition;

  // Actions & Navigation
  /** Action buttons/menus for the screen */
  actions?: ActionDefinition[];

  /** Navigation configuration */
  navigation?: NavigationDefinition;

  // Permissions
  /** Permission rules for accessing this screen */
  permissions?: PermissionRule[];

  // Lifecycle
  /** Lifecycle hooks */
  hooks?: ScreenHooks;
}

// ==========================================
// LAYOUT DEFINITION
// ==========================================

export type LayoutType =
  | 'single-column'  // Simple stacked sections
  | 'two-column'     // Two equal columns
  | 'sidebar-main'   // Narrow sidebar + main content
  | 'tabs'           // Tabbed content
  | 'wizard-steps';  // Wizard with step navigation

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
  | 'custom';         // Custom component

export interface SectionDefinition {
  /** Unique section ID */
  id: string;

  /** Section type */
  type: SectionType;

  /** Section title */
  title?: string | DynamicValue;

  /** Section description */
  description?: string;

  /** Icon */
  icon?: LucideIconName;

  // Layout
  /** Number of columns for field grid */
  columns?: 1 | 2 | 3 | 4;

  /** Grid span (for nested sections) */
  span?: 1 | 2 | 3 | 4;

  // Content
  /** Widget definitions */
  widgets?: WidgetDefinition[];

  /** Field definitions (for forms) */
  fields?: FieldDefinition[];

  /** InputSet reference */
  inputSet?: string;

  /** InputSet field prefix (for nested data) */
  inputSetPrefix?: string;

  // For table sections
  /** Table column definitions */
  columns_config?: TableColumnDefinition[];

  /** Table data source (if different from screen) */
  dataSource?: DataSourceDefinition;

  // For custom sections
  /** Custom component name */
  component?: string;

  /** Component props */
  componentProps?: Record<string, unknown>;

  // Behavior
  /** Visibility rule */
  visible?: VisibilityRule;

  /** Is section editable */
  editable?: boolean;

  /** Is section collapsible */
  collapsible?: boolean;

  /** Default expanded state */
  defaultExpanded?: boolean;

  // Permissions
  /** Section-level permissions */
  permissions?: PermissionRule[];

  // Actions
  /** Section actions */
  actions?: ActionDefinition[];
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
  badge?: string | number | DynamicValue;

  /** Tab sections */
  sections: SectionDefinition[];

  /** Visibility rule */
  visible?: VisibilityRule;

  /** Permissions */
  permissions?: PermissionRule[];

  /** Lazy load tab content */
  lazy?: boolean;
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

  /** Widget type for rendering */
  type?: string;

  /** Widget config */
  config?: Record<string, unknown>;

  /** Is sortable */
  sortable?: boolean;

  /** Is filterable */
  filterable?: boolean;

  /** Column width */
  width?: string | number;

  /** Is column visible */
  visible?: boolean | VisibilityRule;
}

// ==========================================
// ACTION DEFINITION
// ==========================================

export type ActionType =
  | 'navigate'    // Navigate to route
  | 'modal'       // Open modal
  | 'mutation'    // Execute mutation
  | 'download'    // Download file
  | 'custom';     // Custom handler

export interface ActionDefinition {
  /** Action ID */
  id: string;

  /** Action type */
  type: ActionType;

  /** Button label */
  label: string;

  /** Button icon */
  icon?: LucideIconName;

  /** Button variant */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

  /** Action config */
  config?: ActionConfig;

  /** Visibility rule */
  visible?: VisibilityRule;

  /** Permissions */
  permissions?: PermissionRule[];

  /** Confirmation dialog */
  confirm?: ConfirmConfig;
}

export type ActionConfig =
  | { type: 'navigate'; route: string | DynamicValue; params?: Record<string, DynamicValue> }
  | { type: 'modal'; modal: string; props?: Record<string, DynamicValue> }
  | { type: 'mutation'; procedure: string; input?: Record<string, DynamicValue> }
  | { type: 'download'; url: string | DynamicValue; filename?: string }
  | { type: 'custom'; handler: string };

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
