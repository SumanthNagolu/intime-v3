/**
 * Data Schema Definitions
 *
 * Zod schemas for data binding, dynamic values, visibility rules, and validation.
 */

import { z } from 'zod';

// ==========================================
// DYNAMIC VALUE SCHEMA
// ==========================================

export const dynamicValueTypeSchema = z.enum([
  'field',
  'param',
  'context',
  'computed',
  'static',
]);

export const dynamicValueSchema = z.object({
  type: dynamicValueTypeSchema,
  path: z.string(),
  default: z.unknown().optional(),
  format: z.string().optional(),
  transform: z.string().optional(),
});

// ==========================================
// DATA SOURCE SCHEMA
// ==========================================

export const dataSourceTypeSchema = z.enum([
  'entity',
  'query',
  'static',
  'computed',
]);

export const queryDefinitionSchema = z.object({
  procedure: z.string(),
  params: z.record(z.union([z.unknown(), dynamicValueSchema])).optional(),
  filters: z.record(z.union([z.unknown(), dynamicValueSchema])).optional(),
  sort: z
    .object({
      field: z.union([z.string(), dynamicValueSchema]),
      direction: z.enum(['asc', 'desc']),
    })
    .optional(),
  pagination: z
    .object({
      limit: z.union([z.number(), dynamicValueSchema]).optional(),
      offset: z.union([z.number(), dynamicValueSchema]).optional(),
      cursor: z.union([z.string(), dynamicValueSchema]).optional(),
    })
    .optional(),
});

export const dataSourceSchema = z.object({
  type: dataSourceTypeSchema,
  entityType: z.string().optional(),
  entityId: z.union([z.string(), dynamicValueSchema]).optional(),
  query: queryDefinitionSchema.optional(),
  data: z.unknown().optional(),
  transform: z.string().optional(),
  include: z.array(z.string()).optional(),
  pollingInterval: z.number().optional(),
  subscribe: z.boolean().optional(),
});

// ==========================================
// VISIBILITY SCHEMA
// ==========================================

export const visibilityTypeSchema = z.enum([
  'always',
  'never',
  'condition',
  'permission',
  'role',
]);

export const conditionOperatorSchema = z.enum([
  // Comparison
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',

  // String
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'matches',

  // Array
  'in',
  'notIn',
  'hasAny',
  'hasAll',

  // Null checks
  'isNull',
  'isNotNull',
  'isEmpty',
  'isNotEmpty',

  // Logical
  'and',
  'or',
  'not',
]);

export const conditionExpressionSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    operator: conditionOperatorSchema,
    field: z.string().optional(),
    value: z.union([z.unknown(), dynamicValueSchema]).optional(),
    conditions: z.array(conditionExpressionSchema).optional(),
  })
);

export const visibilityRuleSchema = z.object({
  type: visibilityTypeSchema,
  condition: conditionExpressionSchema.optional(),
  permission: z.string().optional(),
  roles: z.array(z.string()).optional(),
  negate: z.boolean().optional(),
});

// ==========================================
// PERMISSION SCHEMA
// ==========================================

export const permissionRuleSchema = z.object({
  action: z.string(),
  resource: z.string(),
  scope: z.enum(['own', 'team', 'organization', 'all']).optional(),
});

// ==========================================
// VALIDATION SCHEMA
// ==========================================

export const validationRuleTypeSchema = z.enum([
  'required',
  'minLength',
  'maxLength',
  'min',
  'max',
  'pattern',
  'email',
  'url',
  'phone',
  'uuid',
  'date',
  'custom',
]);

export const validationRuleSchema = z.object({
  type: validationRuleTypeSchema,
  value: z.unknown().optional(),
  message: z.string().optional(),
  validator: z.string().optional(),
  when: z.enum(['change', 'blur', 'submit']).optional(),
});

// ==========================================
// MUTATION CONFIG SCHEMA
// ==========================================

export const mutationConfigSchema = z.object({
  procedure: z.string(),
  input: z.record(z.union([z.string(), dynamicValueSchema])).optional(),
  optimistic: z.boolean().optional(),
  invalidate: z.array(z.string()).optional(),
  onSuccess: z.string().optional(),
  onError: z.string().optional(),
  redirectOnSuccess: z.union([z.string(), dynamicValueSchema]).optional(),
  successMessage: z.string().optional(),
  errorMessage: z.string().optional(),
});

// ==========================================
// ENTITY FIELD CONFIG SCHEMA
// ==========================================

export const entityFieldConfigSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.string(),
  required: z.boolean(),
  readonly: z.boolean(),
  hidden: z.boolean(),
  searchable: z.boolean(),
  sortable: z.boolean(),
  filterable: z.boolean(),
  group: z.string().optional(),
  order: z.number().optional(),
  defaultValue: z.unknown().optional(),
  relation: z
    .object({
      entityType: z.string(),
      cardinality: z.enum(['one', 'many']),
      foreignKey: z.string(),
      displayFields: z.array(z.string()),
    })
    .optional(),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        color: z.string().optional(),
      })
    )
    .optional(),
  optionsSource: z
    .object({
      entityType: z.string(),
      labelField: z.string(),
      valueField: z.string().optional(),
      filter: z.record(z.unknown()).optional(),
    })
    .optional(),
  format: z.string().optional(),
  parse: z.string().optional(),
  validation: z.array(validationRuleSchema).optional(),
});

// ==========================================
// TYPE EXPORTS
// ==========================================

export type DynamicValueInput = z.infer<typeof dynamicValueSchema>;
export type DataSourceInput = z.infer<typeof dataSourceSchema>;
export type QueryDefinitionInput = z.infer<typeof queryDefinitionSchema>;
export type VisibilityRuleInput = z.infer<typeof visibilityRuleSchema>;
export type ConditionExpressionInput = z.infer<typeof conditionExpressionSchema>;
export type PermissionRuleInput = z.infer<typeof permissionRuleSchema>;
export type ValidationRuleInput = z.infer<typeof validationRuleSchema>;
export type MutationConfigInput = z.infer<typeof mutationConfigSchema>;
export type EntityFieldConfigInput = z.infer<typeof entityFieldConfigSchema>;
