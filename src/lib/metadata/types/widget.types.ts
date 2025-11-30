/**
 * Widget Type Definitions
 *
 * Widgets are the atomic UI elements that display or edit data.
 * Fields are widget configurations bound to entity properties.
 */

import type { DynamicValue, VisibilityRule, ValidationRule } from './data.types';

// ==========================================
// FIELD TYPES
// ==========================================

export type FieldType =
  // Text types
  | 'text'           // Single line text
  | 'textarea'       // Multi-line text
  | 'richtext'       // Rich text editor (markdown/HTML)

  // Numeric types
  | 'number'         // Integer or decimal
  | 'currency'       // Money with currency symbol
  | 'percentage'     // Percentage (0-100)

  // Date/Time types
  | 'date'           // Date only
  | 'datetime'       // Date and time
  | 'time'           // Time only
  | 'duration'       // Time duration

  // Boolean/Choice types
  | 'boolean'        // Checkbox/toggle
  | 'enum'           // Single select from fixed options
  | 'select'         // Single select from dynamic options (entity reference)
  | 'multiselect'    // Multiple select
  | 'radio'          // Radio group
  | 'checkbox-group' // Checkbox group

  // Special types
  | 'tags'           // Tag input (array of strings)
  | 'email'          // Email with validation
  | 'phone'          // Phone with formatting
  | 'url'            // URL with validation
  | 'uuid'           // UUID (typically read-only)

  // File types
  | 'file'           // Single file upload
  | 'files'          // Multiple file upload
  | 'image'          // Image upload with preview

  // Composite types
  | 'address'        // Address input set
  | 'json'           // JSON editor
  | 'computed';      // Computed/derived field (read-only)

// ==========================================
// WIDGET TYPES
// ==========================================

export type WidgetType =
  // Display widgets (read-only)
  | 'text-display'
  | 'badge-display'
  | 'status-badge'
  | 'currency-display'
  | 'percentage-display'
  | 'date-display'
  | 'datetime-display'
  | 'boolean-display'
  | 'link-display'
  | 'email-display'
  | 'phone-display'
  | 'avatar-display'
  | 'image-display'
  | 'tags-display'
  | 'entity-link'
  | 'entity-list-display'
  | 'address-display'
  | 'json-display'
  | 'progress-display'
  | 'rating-display'
  | 'icon-display'

  // Input widgets
  | 'text-input'
  | 'textarea-input'
  | 'richtext-input'
  | 'number-input'
  | 'currency-input'
  | 'percentage-input'
  | 'date-input'
  | 'datetime-input'
  | 'time-input'
  | 'boolean-input'
  | 'select-input'
  | 'multiselect-input'
  | 'radio-input'
  | 'checkbox-input'
  | 'checkbox-group-input'
  | 'tags-input'
  | 'email-input'
  | 'phone-input'
  | 'url-input'
  | 'file-input'
  | 'files-input'
  | 'image-input'
  | 'entity-select'
  | 'entity-multiselect'
  | 'json-input'

  // Composite widgets
  | 'metric-card'
  | 'stat-item'
  | 'info-row'
  | 'timeline-item'
  | 'activity-item'
  | 'card'
  | 'section-header'

  // Layout widgets
  | 'spacer'
  | 'divider'
  | 'group';

// ==========================================
// FIELD DEFINITION
// ==========================================

export interface FieldDefinition {
  /** Unique field ID */
  id: string;

  /** Data field path (supports dot notation: 'address.city') - defaults to id if not provided */
  dataField?: string;

  /** Alias for dataField - for compatibility */
  path?: string;

  /** Display label */
  label?: string;

  /** Field description/help text */
  description?: string;

  /** Field type determines widget and validation */
  type?: FieldType;

  /** Alias for type - for compatibility with inputsets */
  fieldType?: FieldType | string;

  /** Visibility setting */
  visibility?: 'visible' | 'hidden' | 'conditional';

  // Validation
  /** Is field required */
  required?: boolean;

  /** Validation rules */
  validation?: ValidationRule[];

  /** Minimum length (for text) */
  minLength?: number;

  /** Maximum length (for text) */
  maxLength?: number;

  /** Minimum value (for numbers) */
  min?: number;

  /** Maximum value (for numbers) */
  max?: number;

  /** Regex pattern */
  pattern?: string;

  // Options (for select/enum types)
  /** Static options */
  options?: OptionDefinition[];

  /** Dynamic options source */
  optionsSource?: OptionsSourceDefinition;

  // Display
  /** Placeholder text */
  placeholder?: string;

  /** Help text shown below field */
  helpText?: string;

  /** Grid column span */
  span?: 1 | 2 | 3 | 4;

  /** Order within group */
  order?: number;

  /** Field group name */
  group?: string;

  // Behavior
  /** Visibility rule */
  visible?: VisibilityRule;

  /** Is editable */
  editable?: boolean | VisibilityRule;

  /** Is read-only */
  readonly?: boolean;

  /** Is disabled */
  disabled?: boolean | VisibilityRule;

  /** Default value */
  defaultValue?: unknown | DynamicValue;

  /** Auto-focus this field */
  autoFocus?: boolean;

  // Dependencies
  /** Fields this field depends on */
  dependsOn?: DependencyDefinition[];

  // Formatting
  /** Format string or function name */
  format?: string;

  /** Parse function name (display to data) */
  parse?: string;

  // Widget config
  /** Additional widget-specific config */
  config?: Record<string, unknown>;
}

// ==========================================
// WIDGET DEFINITION
// ==========================================

export interface WidgetDefinition {
  /** Unique widget ID */
  id: string;

  /** Widget type */
  type: WidgetType;

  // Data binding
  /** Data field path */
  dataField?: string;

  /** Alternative data source */
  dataSource?: DynamicValue;

  // Display
  /** Label */
  label?: string | DynamicValue;

  /** Format configuration */
  format?: FormatDefinition;

  // Behavior
  /** Visibility rule */
  visible?: VisibilityRule;

  /** Click action */
  onClick?: string;

  // Widget config
  /** Widget-specific configuration */
  config?: WidgetConfig;
}

// ==========================================
// OPTION DEFINITIONS
// ==========================================

export interface OptionDefinition {
  /** Option value (stored in DB) */
  value: string;

  /** Display label */
  label: string;

  /** Optional description */
  description?: string;

  /** Optional color (for badges) */
  color?: string;

  /** Background color */
  bgColor?: string;

  /** Icon */
  icon?: string;

  /** Is disabled */
  disabled?: boolean;
}

export interface OptionsSourceDefinition {
  /** Entity type to fetch options from */
  entityType: string;

  /** Field to use as label */
  labelField: string;

  /** Field to use as value (defaults to 'id') */
  valueField?: string;

  /** Additional fields to include */
  includeFields?: string[];

  /** Filter criteria */
  filter?: Record<string, unknown>;

  /** Sort order */
  sort?: { field: string; direction: 'asc' | 'desc' };

  /** Maximum options to load */
  limit?: number;

  /** Allow search */
  searchable?: boolean;

  /** Search fields */
  searchFields?: string[];
}

// ==========================================
// DEPENDENCY DEFINITIONS
// ==========================================

export interface DependencyDefinition {
  /** Field this depends on */
  field: string;

  /** Condition for dependency */
  condition: 'exists' | 'equals' | 'notEquals' | 'contains' | 'custom';

  /** Value to compare (for equals/notEquals) */
  value?: unknown;

  /** Action when dependency met */
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'updateOptions';

  /** Options update function (for updateOptions action) */
  optionsUpdater?: string;
}

// ==========================================
// FORMAT DEFINITIONS
// ==========================================

export interface FormatDefinition {
  /** Format type */
  type: 'date' | 'currency' | 'number' | 'percentage' | 'phone' | 'custom';

  /** Format string or options */
  format?: string;

  /** Locale */
  locale?: string;

  /** Currency code (for currency type) */
  currency?: string;

  /** Decimal places (for numbers) */
  decimals?: number;

  /** Custom formatter function name */
  formatter?: string;

  /** Empty value display */
  emptyText?: string;
}

// ==========================================
// WIDGET CONFIG TYPES
// ==========================================

export type WidgetConfig =
  | TextWidgetConfig
  | NumberWidgetConfig
  | SelectWidgetConfig
  | DateWidgetConfig
  | BadgeWidgetConfig
  | MetricWidgetConfig
  | EntityWidgetConfig
  | FileWidgetConfig
  | Record<string, unknown>;

export interface TextWidgetConfig {
  /** Truncate text after N characters */
  truncate?: number;

  /** Copy button */
  copyable?: boolean;

  /** Text transform */
  transform?: 'uppercase' | 'lowercase' | 'capitalize';

  /** CSS class */
  className?: string;
}

export interface NumberWidgetConfig {
  /** Show thousands separator */
  thousandsSeparator?: boolean;

  /** Prefix (e.g., '$') */
  prefix?: string;

  /** Suffix (e.g., 'hrs') */
  suffix?: string;

  /** Decimal places */
  decimals?: number;

  /** Show sign for positive numbers */
  showPositiveSign?: boolean;

  /** Color based on value */
  colorScale?: { positive: string; negative: string; zero?: string };
}

export interface SelectWidgetConfig {
  /** Allow clearing selection */
  clearable?: boolean;

  /** Allow searching */
  searchable?: boolean;

  /** Allow creating new options */
  creatable?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Group options by field */
  groupBy?: string;
}

export interface DateWidgetConfig {
  /** Date format */
  format?: string;

  /** Show relative time (e.g., '2 days ago') */
  relative?: boolean;

  /** Min date */
  minDate?: string | DynamicValue;

  /** Max date */
  maxDate?: string | DynamicValue;

  /** Disable specific dates */
  disabledDates?: string[];

  /** Show calendar icon */
  showIcon?: boolean;
}

export interface BadgeWidgetConfig {
  /** Color mapping by value */
  colorMap?: Record<string, { color: string; bgColor: string }>;

  /** Default color */
  defaultColor?: string;

  /** Badge variant */
  variant?: 'default' | 'outline' | 'secondary';

  /** Show dot indicator */
  showDot?: boolean;
}

export interface MetricWidgetConfig {
  /** Icon name */
  icon?: string;

  /** Background color */
  bgColor?: string;

  /** Icon color */
  iconColor?: string;

  /** Trend indicator */
  trend?: {
    field: string;
    positiveColor?: string;
    negativeColor?: string;
  };

  /** Link to detail */
  link?: string | DynamicValue;
}

export interface EntityWidgetConfig {
  /** Show avatar */
  showAvatar?: boolean;

  /** Avatar field */
  avatarField?: string;

  /** Show status badge */
  showStatus?: boolean;

  /** Link to entity detail */
  linkToDetail?: boolean;

  /** Display template */
  template?: string;
}

export interface FileWidgetConfig {
  /** Accepted file types */
  accept?: string[];

  /** Max file size in bytes */
  maxSize?: number;

  /** Max number of files */
  maxFiles?: number;

  /** Show preview */
  showPreview?: boolean;

  /** Upload endpoint */
  uploadEndpoint?: string;
}

// ==========================================
// INPUT SET CONFIG
// ==========================================

export interface InputSetConfig {
  /** InputSet ID */
  id: string;

  /** InputSet name */
  name?: string;

  /** InputSet label (display name) */
  label?: string;

  /** InputSet description */
  description?: string;

  /** Fields in this InputSet */
  fields: FieldDefinition[];

  /** Default column layout */
  columns?: 1 | 2 | 3 | 4;

  /** Layout configuration */
  layout?: {
    columns?: number;
    fieldLayout?: Array<{
      fieldId: string;
      colSpan?: number;
      rowSpan?: number;
    }>;
  };

  /** Validation schema name */
  validationSchema?: string;
}

// ==========================================
// FIELD GROUP
// ==========================================

export interface FieldGroup {
  /** Group name */
  name: string;

  /** Group label */
  label: string;

  /** Group description */
  description?: string;

  /** Group icon */
  icon?: string;

  /** Fields in this group */
  fields: string[];

  /** Is collapsible */
  collapsible?: boolean;

  /** Default expanded */
  defaultExpanded?: boolean;

  /** Display order */
  order?: number;
}
