/**
 * Entity Schema System for InTime v4
 *
 * This is the single source of truth for entity configuration.
 * Each entity defines its schema once, and the UI components
 * dynamically render based on the schema.
 */

import type { LucideIcon } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'

// ============================================
// Core Types
// ============================================

/**
 * All supported entity types in InTime
 */
export type EntityType =
  | 'job'
  | 'candidate'
  | 'account'
  | 'contact'
  | 'lead'
  | 'deal'
  | 'submission'
  | 'placement'
  | 'interview'
  | 'campaign'
  | 'team'

/**
 * Field types for entity schema
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'richtext'
  | 'relation'
  | 'file'
  | 'image'
  | 'address'
  | 'tags'

/**
 * Field definition within an entity
 */
export interface FieldDefinition {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  description?: string
  defaultValue?: unknown
  // For select/multiselect
  options?: Array<{ value: string; label: string }>
  // For relation fields
  relationEntity?: EntityType
  relationField?: string
  // For number/currency
  min?: number
  max?: number
  // For display
  hidden?: boolean
  readOnly?: boolean
  // For validation
  pattern?: RegExp
  validate?: (value: unknown) => string | undefined
}

/**
 * Tab definition for entity detail view
 */
export interface TabDefinition {
  id: string
  label: string
  icon?: LucideIcon
  component?: ComponentType<{ entity: EntityData; schema: EntitySchema }>
  // Fields to show in this tab (for generic rendering)
  fields?: string[]
  // For relation tabs (e.g., submissions on a job)
  relationEntity?: EntityType
  relationField?: string
}

/**
 * Quick info field for the info bar
 */
export interface QuickInfoField {
  key: string
  label?: string
  format?: 'text' | 'date' | 'currency' | 'status' | 'relation'
  icon?: LucideIcon
}

/**
 * Status configuration for an entity
 */
export interface StatusConfig {
  field: string
  values: Array<{
    value: string
    label: string
    color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
    icon?: LucideIcon
  }>
  transitions?: Record<string, string[]>
}

/**
 * Action definition for entity operations
 */
export interface ActionDefinition {
  id: string
  label: string
  icon?: LucideIcon
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  shortcut?: string
  // When to show this action
  showForStatus?: string[]
  hideForStatus?: string[]
  // Action type
  type: 'navigate' | 'mutation' | 'modal' | 'command'
  // For navigation actions
  href?: string | ((entity: EntityData) => string)
  // For mutation actions
  mutation?: string
  confirmMessage?: string
}

/**
 * Column definition for list views
 */
export interface ColumnDefinition {
  key: string
  header: string
  sortable?: boolean
  width?: string
  format?: 'text' | 'date' | 'currency' | 'status' | 'relation' | 'avatar'
  render?: (value: unknown, entity: EntityData) => ReactNode
}

/**
 * Filter definition for list views
 */
export interface FilterDefinition {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'search' | 'boolean'
  options?: Array<{ value: string; label: string }>
}

/**
 * The main entity schema definition
 */
export interface EntitySchema {
  // Identity
  type: EntityType
  label: {
    singular: string
    plural: string
  }
  icon: LucideIcon
  basePath: string

  // Display fields
  titleField: string
  subtitleField?: string
  avatarField?: string

  // Status
  status: StatusConfig

  // Quick info bar fields
  quickInfo: QuickInfoField[]

  // Tabs for detail view
  tabs: TabDefinition[]

  // Actions available on this entity
  actions: {
    primary?: ActionDefinition
    secondary?: ActionDefinition[]
    dropdown?: ActionDefinition[]
  }

  // List view configuration
  list: {
    columns: ColumnDefinition[]
    filters: FilterDefinition[]
    defaultSort?: { key: string; direction: 'asc' | 'desc' }
    searchableFields?: string[]
  }

  // All fields (for forms and detail views)
  fields: Record<string, FieldDefinition>

  // Related entities (for activity feeds, etc.)
  relations?: Array<{
    type: EntityType
    field: string
    label: string
  }>

  // tRPC procedure names
  procedures: {
    list: string
    get: string
    create?: string
    update?: string
    delete?: string
  }
}

// ============================================
// Generic Entity Data Type
// ============================================

export interface EntityData {
  id: string
  [key: string]: unknown
}

// ============================================
// Schema Registry
// ============================================

const schemaRegistry = new Map<EntityType, EntitySchema>()

/**
 * Register an entity schema
 */
export function registerSchema(schema: EntitySchema): void {
  schemaRegistry.set(schema.type, schema)
}

/**
 * Get an entity schema by type
 */
export function getEntitySchema(type: EntityType): EntitySchema {
  const schema = schemaRegistry.get(type)
  if (!schema) {
    throw new Error(`No schema registered for entity type: ${type}`)
  }
  return schema
}

/**
 * Get all registered schemas
 */
export function getAllSchemas(): EntitySchema[] {
  return Array.from(schemaRegistry.values())
}

/**
 * Check if a schema exists for the given type
 */
export function hasSchema(type: string): type is EntityType {
  return schemaRegistry.has(type as EntityType)
}

// ============================================
// Schema Helpers
// ============================================

/**
 * Get the status configuration for a given value
 */
export function getStatusConfig(schema: EntitySchema, statusValue: string) {
  return schema.status.values.find((v) => v.value === statusValue)
}

/**
 * Check if a status transition is valid
 */
export function isValidTransition(
  schema: EntitySchema,
  fromStatus: string,
  toStatus: string
): boolean {
  const transitions = schema.status.transitions
  if (!transitions) return true
  const validTargets = transitions[fromStatus]
  return validTargets ? validTargets.includes(toStatus) : false
}

/**
 * Get available actions for an entity based on its status
 */
export function getAvailableActions(
  schema: EntitySchema,
  entity: EntityData
): ActionDefinition[] {
  const status = entity[schema.status.field] as string
  const allActions = [
    ...(schema.actions.secondary || []),
    ...(schema.actions.dropdown || []),
  ]

  return allActions.filter((action) => {
    if (action.showForStatus && !action.showForStatus.includes(status)) {
      return false
    }
    if (action.hideForStatus && action.hideForStatus.includes(status)) {
      return false
    }
    return true
  })
}

/**
 * Get the display title for an entity
 */
export function getEntityTitle(schema: EntitySchema, entity: EntityData): string {
  return String(entity[schema.titleField] || '')
}

/**
 * Get the display subtitle for an entity
 */
export function getEntitySubtitle(schema: EntitySchema, entity: EntityData): string | undefined {
  if (!schema.subtitleField) return undefined
  return String(entity[schema.subtitleField] || '')
}

/**
 * Format a field value for display
 */
export function formatFieldValue(
  field: FieldDefinition,
  value: unknown
): string {
  if (value === null || value === undefined) return '—'

  switch (field.type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(value))

    case 'date':
      return new Date(value as string).toLocaleDateString()

    case 'datetime':
      return new Date(value as string).toLocaleString()

    case 'boolean':
      return value ? 'Yes' : 'No'

    case 'select':
      const option = field.options?.find((o) => o.value === value)
      return option?.label || String(value)

    case 'multiselect':
      const values = value as string[]
      return values
        .map((v) => field.options?.find((o) => o.value === v)?.label || v)
        .join(', ')

    default:
      return String(value)
  }
}

// ============================================
// Entity Type Guards
// ============================================

export function isValidEntityType(type: unknown): type is EntityType {
  return typeof type === 'string' && hasSchema(type)
}
