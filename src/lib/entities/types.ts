/**
 * Entity Configuration Types
 *
 * Defines the structure for entity configurations that sync
 * frontend screens with backend database/tRPC.
 */

import { z } from 'zod';

// ==========================================
// FIELD TYPES
// ==========================================

export type EntityFieldType =
  | 'uuid'
  | 'text'
  | 'number'
  | 'integer'
  | 'currency'
  | 'percentage'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'enum'
  | 'json'
  | 'array'
  | 'email'
  | 'phone'
  | 'url';

export interface EntityFieldConfig {
  /** Field data type */
  type: EntityFieldType;

  /** Is this the primary key */
  primaryKey?: boolean;

  /** Is this field required */
  required?: boolean;

  /** Default value */
  defaultValue?: unknown;

  /** Maximum length (for text) */
  maxLength?: number;

  /** Minimum length (for text) */
  minLength?: number;

  /** Minimum value (for numbers) */
  min?: number;

  /** Maximum value (for numbers) */
  max?: number;

  /** Enum options */
  options?: string[];

  /** Foreign key reference */
  references?: string;

  /** Is this field internal only (not exposed to frontend) */
  internal?: boolean;

  /** Is this field computed/generated */
  computed?: boolean;

  /** Is this the soft delete field */
  softDelete?: boolean;

  /** Is this auto-managed (createdAt, updatedAt) */
  auto?: boolean;

  /** Precision for numeric types */
  precision?: number;

  /** Scale for numeric types */
  scale?: number;

  /** Custom validation regex */
  pattern?: string;

  /** Field description */
  description?: string;
}

// ==========================================
// RELATION TYPES
// ==========================================

export type RelationType = 'belongsTo' | 'hasMany' | 'hasOne' | 'manyToMany';

export interface EntityRelation {
  /** Relation type */
  type: RelationType;

  /** Related entity name */
  entity: string;

  /** Local field for belongsTo */
  field?: string;

  /** Foreign key field for hasMany/hasOne */
  foreignKey?: string;

  /** Junction table for manyToMany */
  through?: string;

  /** Include in default queries */
  eager?: boolean;
}

// ==========================================
// INDEX TYPES
// ==========================================

export interface EntityIndex {
  /** Fields to index */
  fields: string[];

  /** Is this a unique index */
  unique?: boolean;

  /** Partial index condition */
  where?: string;

  /** Index name (auto-generated if not provided) */
  name?: string;
}

// ==========================================
// PROCEDURE TYPES
// ==========================================

export interface EntityProcedures {
  /** Get single entity by ID */
  getById: string;

  /** List entities with pagination/filters */
  list: string;

  /** Create new entity */
  create: string;

  /** Update existing entity */
  update: string;

  /** Delete entity (soft delete) */
  delete: string;

  /** Additional custom procedures */
  [key: string]: string;
}

// ==========================================
// ENTITY CONFIG
// ==========================================

export interface EntityConfig {
  /** Entity name (singular, camelCase) */
  name: string;

  /** Display name for UI */
  displayName: string;

  /** Plural name for UI */
  pluralName: string;

  /** Database table name */
  tableName: string;

  /** Database schema (default: public) */
  schema?: string;

  /** tRPC router name */
  router: string;

  /** Standard procedure names */
  procedures: EntityProcedures;

  /** Field definitions */
  fields: Record<string, EntityFieldConfig>;

  /** Relations to other entities */
  relations?: Record<string, EntityRelation>;

  /** Database indexes */
  indexes?: EntityIndex[];

  /** Searchable fields */
  searchFields?: string[];

  /** Default sort field */
  defaultSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };

  /** Fields to include in list view */
  listFields?: string[];

  /** Fields to include in detail view */
  detailFields?: string[];
}

// ==========================================
// ZOD SCHEMA GENERATORS
// ==========================================

/**
 * Generate Zod schema from entity field config
 */
export function fieldToZodType(field: EntityFieldConfig): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case 'uuid':
      schema = z.string().uuid();
      break;
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
      schema = z.string();
      if (field.type === 'email') schema = (schema as z.ZodString).email();
      if (field.type === 'url') schema = (schema as z.ZodString).url();
      if (field.minLength) schema = (schema as z.ZodString).min(field.minLength);
      if (field.maxLength) schema = (schema as z.ZodString).max(field.maxLength);
      if (field.pattern) schema = (schema as z.ZodString).regex(new RegExp(field.pattern));
      break;
    case 'number':
    case 'integer':
    case 'percentage':
      schema = z.number();
      if (field.type === 'integer') schema = (schema as z.ZodNumber).int();
      if (field.min !== undefined) schema = (schema as z.ZodNumber).min(field.min);
      if (field.max !== undefined) schema = (schema as z.ZodNumber).max(field.max);
      break;
    case 'currency':
      // Currency stored as string for precision
      schema = z.string().regex(/^\d+(\.\d{1,2})?$/);
      break;
    case 'boolean':
      schema = z.boolean();
      break;
    case 'date':
    case 'datetime':
    case 'timestamp':
      schema = z.date().or(z.string().datetime());
      break;
    case 'enum':
      if (field.options && field.options.length > 0) {
        schema = z.enum(field.options as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;
    case 'json':
      schema = z.record(z.unknown());
      break;
    case 'array':
      schema = z.array(z.string());
      break;
    default:
      schema = z.unknown();
  }

  if (!field.required) {
    schema = schema.optional().nullable();
  }

  if (field.defaultValue !== undefined) {
    schema = schema.default(field.defaultValue);
  }

  return schema;
}

/**
 * Generate complete Zod schema from entity config
 */
export function entityToZodSchema(config: EntityConfig): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
    if (!fieldConfig.internal && !fieldConfig.computed) {
      shape[fieldName] = fieldToZodType(fieldConfig);
    }
  }

  return z.object(shape);
}

/**
 * Generate create input schema (omit auto-fields)
 */
export function entityToCreateSchema(config: EntityConfig): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
    if (
      !fieldConfig.internal &&
      !fieldConfig.computed &&
      !fieldConfig.auto &&
      !fieldConfig.primaryKey
    ) {
      shape[fieldName] = fieldToZodType(fieldConfig);
    }
  }

  return z.object(shape);
}

/**
 * Generate update input schema (all fields optional)
 */
export function entityToUpdateSchema(config: EntityConfig): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const createSchema = entityToCreateSchema(config);
  return z.object({
    id: z.string().uuid(),
    data: createSchema.partial(),
  });
}
