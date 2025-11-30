/**
 * Data Type Definitions
 *
 * Types for data binding, dynamic values, visibility rules, and validation.
 * These enable the metadata-driven data flow between UI and database.
 */

import type { EntityType } from '@/lib/workspace/entity-registry';

// ==========================================
// DYNAMIC VALUES
// ==========================================

export type DynamicValueType =
  | 'field'     // Entity field value
  | 'param'     // URL/route parameter
  | 'context'   // Context value (user, permissions, etc.)
  | 'computed'  // Computed/derived value
  | 'static';   // Static value

export interface DynamicValue {
  /** Value type */
  type: DynamicValueType;

  /** Path to value (dot notation supported) */
  path: string;

  /** Default value if path resolves to null/undefined */
  default?: unknown;

  /** Format configuration */
  format?: string;

  /** Transform function name */
  transform?: string;
}

// ==========================================
// DATA SOURCE
// ==========================================

export type DataSourceType =
  | 'entity'    // Single entity by ID
  | 'query'     // tRPC query
  | 'static'    // Static data
  | 'computed'; // Computed from other sources

export interface DataSourceDefinition {
  /** Data source type */
  type: DataSourceType;

  /** Entity type (for entity/query types) */
  entityType?: EntityType;

  /** Entity ID (for entity type) */
  entityId?: string | DynamicValue;

  /** Query definition (for query type) */
  query?: QueryDefinition;

  /** Static data (for static type) */
  data?: unknown;

  /** Transform function name */
  transform?: string;

  /** Include related entities */
  include?: string[];

  /** Polling interval in ms (for real-time) */
  pollingInterval?: number;

  /** Enable subscription (if supported) */
  subscribe?: boolean;
}

export interface QueryDefinition {
  /** tRPC procedure path */
  procedure: string;

  /** Query parameters */
  params?: Record<string, unknown | DynamicValue>;

  /** Filters */
  filters?: Record<string, unknown | DynamicValue>;

  /** Sort configuration */
  sort?: {
    field: string | DynamicValue;
    direction: 'asc' | 'desc';
  };

  /** Pagination */
  pagination?: {
    limit?: number | DynamicValue;
    offset?: number | DynamicValue;
    cursor?: string | DynamicValue;
  };
}

// ==========================================
// VISIBILITY RULES
// ==========================================

export type VisibilityType =
  | 'always'     // Always visible
  | 'never'      // Never visible
  | 'condition'  // Condition-based
  | 'permission' // Permission-based
  | 'role';      // Role-based

export interface VisibilityRule {
  /** Visibility type */
  type: VisibilityType;

  /** Condition expression (for condition type) */
  condition?: ConditionExpression;

  /** Permission name (for permission type) */
  permission?: string;

  /** Required roles (for role type) */
  roles?: string[];

  /** Invert the rule */
  negate?: boolean;
}

// ==========================================
// CONDITION EXPRESSIONS
// ==========================================

export type ConditionOperator =
  // Comparison
  | 'eq'        // Equals
  | 'neq'       // Not equals
  | 'gt'        // Greater than
  | 'gte'       // Greater than or equal
  | 'lt'        // Less than
  | 'lte'       // Less than or equal

  // String
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'matches'   // Regex match

  // Array
  | 'in'
  | 'notIn'
  | 'hasAny'    // Array has any of values
  | 'hasAll'    // Array has all values

  // Null checks
  | 'isNull'
  | 'isNotNull'
  | 'isEmpty'
  | 'isNotEmpty'

  // Logical
  | 'and'
  | 'or'
  | 'not';

export interface ConditionExpression {
  /** Condition operator */
  operator: ConditionOperator;

  /** Field path (for comparison operators) */
  field?: string;

  /** Value to compare against */
  value?: unknown | DynamicValue;

  /** Nested conditions (for and/or/not) */
  conditions?: ConditionExpression[];
}

// ==========================================
// PERMISSION RULES
// ==========================================

export interface PermissionRule {
  /** Required action */
  action: 'view' | 'create' | 'update' | 'delete' | string;

  /** Resource type */
  resource: string;

  /** Scope (own, team, all) */
  scope?: 'own' | 'team' | 'organization' | 'all';
}

// ==========================================
// VALIDATION RULES
// ==========================================

export type ValidationRuleType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'url'
  | 'phone'
  | 'uuid'
  | 'date'
  | 'custom';

export interface ValidationRule {
  /** Rule type */
  type: ValidationRuleType;

  /** Rule value (for min, max, pattern, etc.) */
  value?: unknown;

  /** Error message */
  message?: string;

  /** Custom validation function name */
  validator?: string;

  /** When to validate */
  when?: 'change' | 'blur' | 'submit';
}

// ==========================================
// RENDER CONTEXT
// ==========================================

export interface RenderContext {
  // Entity data
  /** Current entity data */
  entity: Record<string, unknown>;

  /** Entity type */
  entityType: EntityType;

  /** Entity ID */
  entityId: string;

  // Related data
  /** Related entity data */
  relatedData: Map<string, unknown>;

  // User context
  /** Current user profile */
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    permissions: string[];
  };

  /** User permissions */
  permissions: string[];

  /** User roles */
  roles: string[];

  // Route context
  /** URL parameters */
  params: Record<string, string>;

  /** Query parameters */
  query: Record<string, string>;

  // Form state (for editable screens)
  /** Form state */
  formState?: FormState;

  // Computed values
  /** Computed values cache */
  computed: Map<string, unknown>;

  // Utilities
  /** Navigate function */
  navigate: (path: string) => void;

  /** Show toast */
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export interface FormState {
  /** Current form values */
  values: Record<string, unknown>;

  /** Initial values */
  initialValues: Record<string, unknown>;

  /** Field errors */
  errors: Record<string, string | null>;

  /** Touched fields */
  touched: Record<string, boolean>;

  /** Is form dirty */
  isDirty: boolean;

  /** Is form valid */
  isValid: boolean;

  /** Is form submitting */
  isSubmitting: boolean;
}

// ==========================================
// ENTITY BINDING CONFIG
// ==========================================

export interface EntityFieldConfig {
  /** Field name (DB column) */
  name: string;

  /** Display label */
  label: string;

  /** Field type */
  type: string;

  /** Is required */
  required: boolean;

  /** Is readonly */
  readonly: boolean;

  /** Is hidden from UI */
  hidden: boolean;

  /** Is searchable */
  searchable: boolean;

  /** Is sortable */
  sortable: boolean;

  /** Is filterable */
  filterable: boolean;

  /** Field group */
  group?: string;

  /** Display order */
  order?: number;

  /** Default value */
  defaultValue?: unknown;

  /** Relation config (for foreign keys) */
  relation?: {
    entityType: EntityType;
    cardinality: 'one' | 'many';
    foreignKey: string;
    displayFields: string[];
  };

  /** Options (for enum types) */
  options?: Array<{ value: string; label: string; color?: string }>;

  /** Options source (for select types) */
  optionsSource?: {
    entityType: EntityType;
    labelField: string;
    valueField?: string;
    filter?: Record<string, unknown>;
  };

  /** Format function name */
  format?: string;

  /** Parse function name */
  parse?: string;

  /** Validation rules */
  validation?: ValidationRule[];
}

// ==========================================
// MUTATION CONFIG
// ==========================================

export interface MutationConfig {
  /** tRPC procedure path */
  procedure: string;

  /** Input mapping */
  input?: Record<string, string | DynamicValue>;

  /** Optimistic update */
  optimistic?: boolean;

  /** Cache invalidation queries */
  invalidate?: string[];

  /** On success callback name */
  onSuccess?: string;

  /** On error callback name */
  onError?: string;

  /** Redirect after success */
  redirectOnSuccess?: string | DynamicValue;

  /** Toast message on success */
  successMessage?: string;

  /** Toast message on error */
  errorMessage?: string;
}

// ==========================================
// QUERY BINDING RESULT
// ==========================================

export interface QueryBinding<T = unknown> {
  /** Entity type */
  entityType: EntityType;

  /** Query data */
  data: T | undefined;

  /** Is loading */
  isLoading: boolean;

  /** Has error */
  isError: boolean;

  /** Error object */
  error: Error | null;

  /** Refetch function */
  refetch: () => Promise<void>;

  /** Is fetching (refetch in progress) */
  isFetching: boolean;

  /** Is stale */
  isStale: boolean;
}

export interface ListQueryBinding<T = unknown> extends QueryBinding<T[]> {
  /** Pagination info */
  pagination: {
    /** Has more pages */
    hasMore: boolean;

    /** Total count (if available) */
    total?: number;

    /** Current page */
    page?: number;

    /** Page size */
    pageSize?: number;
  };

  /** Fetch next page */
  fetchNextPage?: () => Promise<void>;

  /** Fetch previous page */
  fetchPreviousPage?: () => Promise<void>;
}

// ==========================================
// MUTATION BINDING RESULT
// ==========================================

export interface MutationBinding<TInput = unknown, TOutput = unknown> {
  /** Entity type */
  entityType: EntityType;

  /** Execute mutation */
  mutate: (input: TInput) => Promise<TOutput>;

  /** Execute mutation async */
  mutateAsync: (input: TInput) => Promise<TOutput>;

  /** Is mutation pending */
  isPending: boolean;

  /** Has error */
  isError: boolean;

  /** Is successful */
  isSuccess: boolean;

  /** Error object */
  error: Error | null;

  /** Result data */
  data: TOutput | undefined;

  /** Reset mutation state */
  reset: () => void;
}
