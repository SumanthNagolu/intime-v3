/**
 * Data Type Definitions
 *
 * Types for data sources, visibility rules, and form state.
 */

// ==========================================
// DYNAMIC VALUES
// ==========================================

export type DynamicValueType =
  | 'static'       // Fixed value
  | 'field'        // From entity field
  | 'param'        // From URL param
  | 'query'        // From URL query
  | 'context'      // From render context
  | 'computed'     // Computed at runtime
  | 'template'     // Template string with {{field}} placeholders
  | 'count'        // Count of related items
  | 'selection'    // Current selection in list views
  | 'conditional'  // Conditional value based on expression
  | 'overdue-count' // Count of overdue items (activities, tasks)
  // Bench sales specific
  | 'visa-alert-level'; // Visa expiry alert level (green/yellow/orange/red/black)

export interface DynamicValueBase {
  type?: DynamicValueType;
  path?: string;
  default?: unknown;
  prefix?: string;
  transform?: string;  // Name of transform function
  template?: string;   // Template string with {{field}} placeholders
  value?: unknown;     // Static value
  condition?: {        // For conditional values
    field: string;
    operator: string;
    value?: unknown;   // Optional for 'exists', 'is_empty', etc.
  };
  ifTrue?: DynamicValue | unknown;
  ifFalse?: DynamicValue | unknown;

  // Shorthand properties (used when type is omitted)
  field?: string;      // Shorthand for path (when type='field')
  fields?: string[];   // Multiple fields for template strings
  param?: string;      // URL param name (when type='param')
  query?: string;      // URL query param name (when type='query')
}

// Allow shorthand { field: string } or full DynamicValueBase
export type DynamicValue = DynamicValueBase | { field: string } | { template: string; fields?: string[] };

// ==========================================
// DATA SOURCE
// ==========================================

export type DataSourceType =
  | 'entity'      // Single entity
  | 'list'        // List of entities
  | 'related'     // Related entities (e.g. job.candidates)
  | 'aggregate'   // Aggregated data (count, sum)
  | 'static'      // Static JSON
  | 'custom'      // Custom fetcher
  | 'conditional' // Conditional data source based on mode/params
  | 'field'       // Single field value
  | 'empty'       // Empty/null data source (for create mode)
  | 'query'       // tRPC query-based data source
  | 'inline'      // Inline static data
  | 'procedure';  // Procedure-based data source (alias for query)

export interface DataSourceDefinition {
  type: DataSourceType;
  entityType?: string; // 'job', 'candidate', etc.
  entityId?: string | DynamicValue;
  relation?: string; // For 'related' type

  // Relations to include (eager loading)
  include?: string[];

  // For field data source
  path?: string; // Field path for 'field' type

  // Filtering
  filter?: Record<string, unknown | DynamicValue>;
  searchFields?: string[];

  // Sorting
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };

  // Default sort (alias for sort)
  defaultSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };

  // Pagination
  pagination?: boolean;
  pageSize?: number; // Items per page
  defaultPageSize?: number; // Default page size
  limit?: number;    // Max items to fetch

  // Aggregation
  method?: 'count' | 'sum' | 'average' | 'min' | 'max';
  field?: string; // Field to aggregate

  // For aggregate data sources
  queries?: Array<{
    key: string;
    procedure: string;
    input?: Record<string, DynamicValue>;
  }>;

  // For aggregate data sources with multiple sources (alternative to queries)
  sources?: Array<{
    id?: string;        // Alternative to key (for backward compatibility)
    key?: string;
    type?: string;      // Optional type identifier
    procedure?: string;
    query?: string | { procedure: string; params?: Record<string, unknown> };     // Shorthand for procedure or query object
    params?: Record<string, unknown | DynamicValue>;
    input?: Record<string, unknown | DynamicValue>;
  }>;

  // For conditional data sources
  condition?: {
    field: string;
    operator: string;
    value?: unknown;
  };
  ifTrue?: DataSourceDefinition;
  ifFalse?: DataSourceDefinition;

  // Default values for empty/create mode
  defaults?: Record<string, unknown>;

  // For custom/procedure-based data sources
  query?: string | {
    procedure: string;
    input?: Record<string, unknown | DynamicValue>;
    params?: Record<string, unknown | DynamicValue>;
  };

  // Params for query-based data sources (when query is a string)
  params?: Record<string, unknown | DynamicValue>;

  // Shorthand for tRPC procedure (alternative to query)
  procedure?: string;

  // For inline static data
  data?: unknown;
}

export interface QueryDefinition {
  name: string;
  source: DataSourceDefinition;
}

// ==========================================
// VISIBILITY & PERMISSIONS
// ==========================================

export type VisibilityType = 'visible' | 'hidden' | 'disabled' | 'readonly';

export type ConditionOperator =
  | 'eq' | 'ne' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte'
  | 'contains' | 'not_contains' | 'in' | 'nin' | 'not_in'
  | 'is_empty' | 'is_not_empty' | 'is_true' | 'is_false'
  | 'exists' | 'not_exists'
  | 'and' | 'or';  // Logic combiners for compound conditions

export interface ConditionExpression {
  field?: string | DynamicValue;
  operator: ConditionOperator;
  value?: unknown | DynamicValue;
  /** Nested conditions for compound expressions */
  conditions?: ConditionExpression[];
}

export interface VisibilityRule {
  type?: 'permission' | 'role' | 'condition' | 'feature_flag' | 'script';

  // For permission/role
  permission?: string;
  roles?: string[];

  // For condition - supports shorthand format
  condition?: ConditionExpression;
  conditions?: ConditionExpression[]; // implicitly AND

  // Shorthand condition format (when type is omitted)
  field?: string | DynamicValue;
  path?: string;  // Alternative to field (shorthand)
  operator?: ConditionOperator | 'and' | 'or';
  value?: unknown | DynamicValue;

  // For feature flag
  flag?: string;

  // For script (advanced)
  script?: string;

  // Badge-specific properties
  variant?: string;
  ifTrue?: { value: string; variant: string };
  ifFalse?: { value: string; variant: string };
}

export interface PermissionRule {
  action: 'view' | 'edit' | 'create' | 'delete' | 'approve';
  resource: string;
  conditions?: ConditionExpression[];
}

// ==========================================
// VALIDATION
// ==========================================

export type ValidationRuleType =
  | 'required'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'custom';

export interface ValidationRule {
  type: ValidationRuleType;
  value?: unknown;
  message?: string;
  customHandler?: string;
}

// ==========================================
// RUNTIME CONTEXT
// ==========================================

export interface RenderContext {
  // Data
  entity?: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  relatedData?: Map<string, unknown[]>;
  
  // User
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    permissions: string[];
  };
  
  // Access Control
  permissions: string[];
  roles: string[];
  
  // Navigation
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  
  // Form State
  formState?: FormState;
  
  // Computations
  computed: Map<string, unknown>;
  
  // Functions
  navigate: (path: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  refreshData?: () => Promise<void>;
}

export interface FormState {
  values: Record<string, unknown>;
  initialValues: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// ==========================================
// DATA BINDING
// ==========================================

export interface EntityFieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  readonly?: boolean;
  defaultValue?: unknown;
}

export interface MutationConfig {
  procedure: string; // tRPC procedure path
  onSuccess?: string; // Action ID
  onError?: string; // Action ID
  optimisticUpdate?: boolean;
}

// Interfaces for Data Binding within Renderers
export interface QueryBinding {
  data: unknown;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

export interface ListQueryBinding extends QueryBinding {
  data: unknown[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    setPage: (page: number) => void;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
    setSort: (field: string, direction: 'asc' | 'desc') => void;
  };
  filter?: {
    values: Record<string, unknown>;
    setFilter: (key: string, value: unknown) => void;
  };
}

export interface MutationBinding {
  mutate: (variables: unknown) => Promise<unknown>;
  isLoading: boolean;
  error: unknown;
}
