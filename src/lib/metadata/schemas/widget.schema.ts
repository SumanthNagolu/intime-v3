/**
 * Widget Schema Definitions
 *
 * Zod schemas for runtime validation of widget and field definitions.
 */

import { z } from 'zod';
import { dynamicValueSchema, visibilityRuleSchema, validationRuleSchema } from './data.schema';

// ==========================================
// FIELD TYPE SCHEMA
// ==========================================

export const fieldTypeSchema = z.enum([
  // Text types
  'text',
  'textarea',
  'richtext',

  // Numeric types
  'number',
  'currency',
  'percentage',

  // Date/Time types
  'date',
  'datetime',
  'time',
  'duration',

  // Boolean/Choice types
  'boolean',
  'enum',
  'select',
  'multiselect',
  'radio',
  'checkbox-group',

  // Special types
  'tags',
  'email',
  'phone',
  'url',
  'uuid',

  // File types
  'file',
  'files',
  'image',

  // Composite types
  'address',
  'json',
  'computed',
]);

// ==========================================
// WIDGET TYPE SCHEMA
// ==========================================

export const widgetTypeSchema = z.enum([
  // Display widgets
  'text-display',
  'badge-display',
  'status-badge',
  'currency-display',
  'percentage-display',
  'date-display',
  'datetime-display',
  'boolean-display',
  'link-display',
  'email-display',
  'phone-display',
  'avatar-display',
  'image-display',
  'tags-display',
  'entity-link',
  'entity-list-display',
  'address-display',
  'json-display',
  'progress-display',
  'rating-display',
  'icon-display',

  // Input widgets
  'text-input',
  'textarea-input',
  'richtext-input',
  'number-input',
  'currency-input',
  'percentage-input',
  'date-input',
  'datetime-input',
  'time-input',
  'boolean-input',
  'select-input',
  'multiselect-input',
  'radio-input',
  'checkbox-input',
  'checkbox-group-input',
  'tags-input',
  'email-input',
  'phone-input',
  'url-input',
  'file-input',
  'files-input',
  'image-input',
  'entity-select',
  'entity-multiselect',
  'json-input',

  // Composite widgets
  'metric-card',
  'stat-item',
  'info-row',
  'timeline-item',
  'activity-item',
  'card',
  'section-header',

  // Layout widgets
  'spacer',
  'divider',
  'group',
]);

// ==========================================
// OPTION DEFINITION SCHEMA
// ==========================================

export const optionDefinitionSchema = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  bgColor: z.string().optional(),
  icon: z.string().optional(),
  disabled: z.boolean().optional(),
});

// ==========================================
// OPTIONS SOURCE SCHEMA
// ==========================================

export const optionsSourceSchema = z.object({
  entityType: z.string(),
  labelField: z.string(),
  valueField: z.string().optional(),
  includeFields: z.array(z.string()).optional(),
  filter: z.record(z.unknown()).optional(),
  sort: z
    .object({
      field: z.string(),
      direction: z.enum(['asc', 'desc']),
    })
    .optional(),
  limit: z.number().optional(),
  searchable: z.boolean().optional(),
  searchFields: z.array(z.string()).optional(),
});

// ==========================================
// DEPENDENCY DEFINITION SCHEMA
// ==========================================

export const dependencySchema = z.object({
  field: z.string(),
  condition: z.enum(['exists', 'equals', 'notEquals', 'contains', 'custom']),
  value: z.unknown().optional(),
  action: z.enum(['show', 'hide', 'enable', 'disable', 'require', 'updateOptions']),
  optionsUpdater: z.string().optional(),
});

// ==========================================
// FORMAT DEFINITION SCHEMA
// ==========================================

export const formatDefinitionSchema = z.object({
  type: z.enum(['date', 'currency', 'number', 'percentage', 'phone', 'custom']),
  format: z.string().optional(),
  locale: z.string().optional(),
  currency: z.string().optional(),
  decimals: z.number().optional(),
  formatter: z.string().optional(),
  emptyText: z.string().optional(),
});

// ==========================================
// FIELD DEFINITION SCHEMA
// ==========================================

export const fieldDefinitionSchema = z.object({
  id: z.string(),
  dataField: z.string(),
  label: z.string(),
  type: fieldTypeSchema,

  // Validation
  required: z.boolean().optional(),
  validation: z.array(validationRuleSchema).optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),

  // Options
  options: z.array(optionDefinitionSchema).optional(),
  optionsSource: optionsSourceSchema.optional(),

  // Display
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  span: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  order: z.number().optional(),
  group: z.string().optional(),

  // Behavior
  visible: visibilityRuleSchema.optional(),
  editable: z.union([z.boolean(), visibilityRuleSchema]).optional(),
  readonly: z.boolean().optional(),
  disabled: z.union([z.boolean(), visibilityRuleSchema]).optional(),
  defaultValue: z.union([z.unknown(), dynamicValueSchema]).optional(),
  autoFocus: z.boolean().optional(),

  // Dependencies
  dependsOn: z.array(dependencySchema).optional(),

  // Formatting
  format: z.string().optional(),
  parse: z.string().optional(),

  // Widget config
  config: z.record(z.unknown()).optional(),
});

// ==========================================
// WIDGET DEFINITION SCHEMA
// ==========================================

export const widgetDefinitionSchema = z.object({
  id: z.string(),
  type: widgetTypeSchema,

  // Data binding
  dataField: z.string().optional(),
  dataSource: dynamicValueSchema.optional(),

  // Display
  label: z.union([z.string(), dynamicValueSchema]).optional(),
  format: formatDefinitionSchema.optional(),

  // Behavior
  visible: visibilityRuleSchema.optional(),
  onClick: z.string().optional(),

  // Widget config
  config: z.record(z.unknown()).optional(),
});

// ==========================================
// INPUT SET CONFIG SCHEMA
// ==========================================

export const inputSetConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  fields: z.array(fieldDefinitionSchema),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  validationSchema: z.string().optional(),
});

// ==========================================
// FIELD GROUP SCHEMA
// ==========================================

export const fieldGroupSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  fields: z.array(z.string()),
  collapsible: z.boolean().optional(),
  defaultExpanded: z.boolean().optional(),
  order: z.number().optional(),
});

// ==========================================
// TYPE EXPORTS
// ==========================================

export type FieldDefinitionInput = z.infer<typeof fieldDefinitionSchema>;
export type WidgetDefinitionInput = z.infer<typeof widgetDefinitionSchema>;
export type OptionDefinitionInput = z.infer<typeof optionDefinitionSchema>;
export type OptionsSourceInput = z.infer<typeof optionsSourceSchema>;
export type InputSetConfigInput = z.infer<typeof inputSetConfigSchema>;
export type FieldGroupInput = z.infer<typeof fieldGroupSchema>;
