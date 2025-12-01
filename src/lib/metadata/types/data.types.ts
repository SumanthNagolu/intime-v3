/**
 * Data Type Definitions
 *
 * Types for data sources, visibility rules, and form state.
 */

// ==========================================
// DYNAMIC VALUES
// ==========================================

export type DynamicValueType =
  | 'static'    // Fixed value
  | 'field'     // From entity field
  | 'param'     // From URL param
  | 'query'     // From URL query
  | 'context'   // From render context
  | 'computed'; // Computed at runtime

export interface DynamicValue {
  type: DynamicValueType;
  path?: string;
  default?: unknown;
  transform?: string; // Name of transform function
}

// ==========================================
// DATA SOURCE
// ==========================================

export type DataSourceType =
  | 'entity'    // Single entity
  | 'list'      // List of entities
  | 'related'   // Related entities (e.g. job.candidates)
  | 'aggregate' // Aggregated data (count, sum)
  | 'static'    // Static JSON
  | 'custom';   // Custom fetcher

export interface DataSourceDefinition {
  type: DataSourceType;
  entityType?: string; // 'job', 'candidate', etc.
  entityId?: string | DynamicValue;
  relation?: string; // For 'related' type
  
  // Filtering
  filter?: Record<string, unknown | DynamicValue>;
  searchFields?: string[];
  
  // Sorting
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  
  // Pagination
  pagination?: boolean;
  limit?: number;
  
  // Aggregation
  method?: 'count' | 'sum' | 'average' | 'min' | 'max';
  field?: string; // Field to aggregate
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
  | 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' 
  | 'contains' | 'not_contains' | 'in' | 'not_in'
  | 'is_empty' | 'is_not_empty' | 'is_true' | 'is_false';

export interface ConditionExpression {
  field: string | DynamicValue;
  operator: ConditionOperator;
  value?: unknown | DynamicValue;
}

export interface VisibilityRule {
  type: 'permission' | 'role' | 'condition' | 'feature_flag' | 'script';
  
  // For permission/role
  permission?: string;
  roles?: string[];
  
  // For condition
  condition?: ConditionExpression;
  conditions?: ConditionExpression[]; // implicitly AND
  
  // For feature flag
  flag?: string;
  
  // For script (advanced)
  script?: string;
  
  // Logic
  operator?: 'and' | 'or'; // For multiple rules
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
