/**
 * Entity History Service
 *
 * Provides comprehensive history/audit trail tracking for all entities.
 * Implements Guidewire PolicyCenter-style "entity biography" tracking.
 *
 * Features:
 * - Field change detection with before/after values
 * - Status/stage transition tracking
 * - Owner/assignment change tracking
 * - Related object tracking (notes, documents, activities)
 * - Fire-and-forget pattern (non-blocking)
 *
 * @module lib/services/history-service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ENTITY_FIELD_CONFIGS, type EntityFieldConfig } from './history-configs'

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

/**
 * Change type values from entity_history.change_type enum
 */
export type ChangeType =
  | 'status_change'
  | 'stage_change'
  | 'owner_change'
  | 'assignment_change'
  | 'score_change'
  | 'priority_change'
  | 'category_change'
  | 'workflow_step'
  | 'custom'

/**
 * Context for history recording
 */
export interface HistoryContext {
  orgId: string
  userId: string | null
  correlationId?: string
  isAutomated?: boolean
}

/**
 * Related entity reference for tracking objects added to parent entities
 */
export interface RelatedEntity {
  type: string
  id: string
  label: string
  action?: 'added' | 'updated' | 'removed'
  metadata?: Record<string, unknown>
}

/**
 * Options for recording changes
 */
export interface RecordChangeOptions {
  reason?: string
  comment?: string
  relatedEntity?: RelatedEntity
  metadata?: Record<string, unknown>
}

/**
 * Entity History Service
 *
 * Centralized service for recording entity history/audit trail.
 * All methods are fire-and-forget (non-blocking) to not slow down mutations.
 */
export class HistoryService {
  private adminClient: SupabaseClient

  constructor() {
    this.adminClient = getAdminClient()
  }

  /**
   * Record entity creation
   */
  async recordEntityCreated(
    entityType: string,
    entityId: string,
    ctx: HistoryContext,
    options?: {
      entityName?: string
      initialStatus?: string
      metadata?: Record<string, unknown>
    }
  ): Promise<void> {
    const userProfileId = ctx.userId ? await this.getUserProfileId(ctx.userId) : null

    await this.adminClient.from('entity_history').insert({
      org_id: ctx.orgId,
      entity_type: entityType,
      entity_id: entityId,
      change_type: 'custom',
      field_name: 'lifecycle',
      old_value: null,
      new_value: 'created',
      old_value_label: null,
      new_value_label: options?.entityName
        ? `${this.formatEntityType(entityType)} created: ${options.entityName}`
        : `${this.formatEntityType(entityType)} created`,
      is_automated: ctx.isAutomated ?? false,
      correlation_id: ctx.correlationId,
      changed_by: userProfileId,
      metadata: {
        action: 'entity_created',
        initialStatus: options?.initialStatus,
        ...options?.metadata,
      },
    })
  }

  /**
   * Record status/stage change
   */
  async recordStatusChange(
    entityType: string,
    entityId: string,
    oldStatus: string | null,
    newStatus: string,
    ctx: HistoryContext,
    options?: RecordChangeOptions
  ): Promise<void> {
    const userProfileId = ctx.userId ? await this.getUserProfileId(ctx.userId) : null
    const config = this.getFieldConfig(entityType, 'status')

    // Calculate time in previous state if applicable
    let timeInPreviousState: string | null = null
    if (oldStatus) {
      const lastChange = await this.getLastStatusChange(entityType, entityId, ctx.orgId)
      if (lastChange) {
        const durationMs = Date.now() - new Date(lastChange.changed_at).getTime()
        timeInPreviousState = this.formatDuration(durationMs)
      }
    }

    await this.adminClient.from('entity_history').insert({
      org_id: ctx.orgId,
      entity_type: entityType,
      entity_id: entityId,
      change_type: 'status_change',
      field_name: 'status',
      old_value: oldStatus,
      new_value: newStatus,
      old_value_label: oldStatus ? (config?.valueLabels?.[oldStatus] ?? oldStatus) : null,
      new_value_label: config?.valueLabels?.[newStatus] ?? newStatus,
      reason: options?.reason,
      comment: options?.comment,
      is_automated: ctx.isAutomated ?? false,
      correlation_id: ctx.correlationId,
      time_in_previous_state: timeInPreviousState,
      changed_by: userProfileId,
      metadata: options?.metadata,
    })
  }

  /**
   * Record owner/assignment change
   */
  async recordOwnerChange(
    entityType: string,
    entityId: string,
    oldOwnerId: string | null,
    newOwnerId: string,
    ctx: HistoryContext,
    options?: {
      fieldName?: string // 'owner_id' or 'assigned_to' etc.
      oldOwnerName?: string
      newOwnerName?: string
      reason?: string
    }
  ): Promise<void> {
    const userProfileId = ctx.userId ? await this.getUserProfileId(ctx.userId) : null
    const fieldName = options?.fieldName ?? 'owner_id'

    // Lookup owner names if not provided
    let oldName = options?.oldOwnerName
    let newName = options?.newOwnerName

    if (!oldName && oldOwnerId) {
      oldName = await this.getUserName(oldOwnerId)
    }
    if (!newName) {
      newName = await this.getUserName(newOwnerId)
    }

    await this.adminClient.from('entity_history').insert({
      org_id: ctx.orgId,
      entity_type: entityType,
      entity_id: entityId,
      change_type: 'owner_change',
      field_name: fieldName,
      old_value: oldOwnerId,
      new_value: newOwnerId,
      old_value_label: oldName,
      new_value_label: newName,
      reason: options?.reason,
      is_automated: ctx.isAutomated ?? false,
      correlation_id: ctx.correlationId,
      changed_by: userProfileId,
    })
  }

  /**
   * Record a related object being added to an entity
   */
  async recordRelatedObjectAdded(
    entityType: string,
    entityId: string,
    relatedEntity: RelatedEntity,
    ctx: HistoryContext
  ): Promise<void> {
    const userProfileId = ctx.userId ? await this.getUserProfileId(ctx.userId) : null

    await this.adminClient.from('entity_history').insert({
      org_id: ctx.orgId,
      entity_type: entityType,
      entity_id: entityId,
      change_type: 'custom',
      field_name: 'related_objects',
      old_value: null,
      new_value: relatedEntity.type,
      old_value_label: null,
      new_value_label: `${this.formatEntityType(relatedEntity.type)} added: ${relatedEntity.label}`,
      related_entity_type: relatedEntity.type,
      related_entity_id: relatedEntity.id,
      is_automated: ctx.isAutomated ?? false,
      correlation_id: ctx.correlationId,
      changed_by: userProfileId,
      metadata: {
        action: 'related_object_added',
        ...relatedEntity.metadata,
      },
    })
  }

  /**
   * Record a related object being updated
   */
  async recordRelatedObjectUpdated(
    entityType: string,
    entityId: string,
    relatedEntity: RelatedEntity,
    ctx: HistoryContext
  ): Promise<void> {
    const userProfileId = ctx.userId ? await this.getUserProfileId(ctx.userId) : null

    await this.adminClient.from('entity_history').insert({
      org_id: ctx.orgId,
      entity_type: entityType,
      entity_id: entityId,
      change_type: 'custom',
      field_name: 'related_objects',
      old_value: relatedEntity.type,
      new_value: relatedEntity.type,
      old_value_label: null,
      new_value_label: `${this.formatEntityType(relatedEntity.type)} updated: ${relatedEntity.label}`,
      related_entity_type: relatedEntity.type,
      related_entity_id: relatedEntity.id,
      is_automated: ctx.isAutomated ?? false,
      correlation_id: ctx.correlationId,
      changed_by: userProfileId,
      metadata: {
        action: 'related_object_updated',
        ...relatedEntity.metadata,
      },
    })
  }

  /**
   * Record a related object being removed
   */
  async recordRelatedObjectRemoved(
    entityType: string,
    entityId: string,
    relatedEntity: RelatedEntity,
    ctx: HistoryContext
  ): Promise<void> {
    const userProfileId = ctx.userId ? await this.getUserProfileId(ctx.userId) : null

    await this.adminClient.from('entity_history').insert({
      org_id: ctx.orgId,
      entity_type: entityType,
      entity_id: entityId,
      change_type: 'custom',
      field_name: 'related_objects',
      old_value: relatedEntity.type,
      new_value: null,
      old_value_label: `${this.formatEntityType(relatedEntity.type)}: ${relatedEntity.label}`,
      new_value_label: `${this.formatEntityType(relatedEntity.type)} removed`,
      related_entity_type: relatedEntity.type,
      related_entity_id: relatedEntity.id,
      is_automated: ctx.isAutomated ?? false,
      correlation_id: ctx.correlationId,
      changed_by: userProfileId,
      metadata: {
        action: 'related_object_removed',
        ...relatedEntity.metadata,
      },
    })
  }

  /**
   * Record a single field change
   */
  async recordFieldChange(
    entityType: string,
    entityId: string,
    fieldName: string,
    oldValue: unknown,
    newValue: unknown,
    ctx: HistoryContext,
    options?: RecordChangeOptions
  ): Promise<void> {
    const userProfileId = ctx.userId ? await this.getUserProfileId(ctx.userId) : null
    const config = this.getFieldConfig(entityType, fieldName)
    const changeType = config?.changeType ?? 'custom'

    await this.adminClient.from('entity_history').insert({
      org_id: ctx.orgId,
      entity_type: entityType,
      entity_id: entityId,
      change_type: changeType,
      field_name: fieldName,
      old_value: this.formatValue(oldValue),
      new_value: this.formatValue(newValue),
      old_value_label: this.getValueLabel(config, oldValue),
      new_value_label: this.getValueLabel(config, newValue),
      reason: options?.reason,
      comment: options?.comment,
      related_entity_type: options?.relatedEntity?.type,
      related_entity_id: options?.relatedEntity?.id,
      is_automated: ctx.isAutomated ?? false,
      correlation_id: ctx.correlationId,
      changed_by: userProfileId,
      metadata: options?.metadata,
    })
  }

  /**
   * Compare before/after snapshots and record all changes
   */
  async detectAndRecordChanges<T extends Record<string, unknown>>(
    entityType: string,
    entityId: string,
    before: T,
    after: T,
    ctx: HistoryContext,
    options?: {
      reason?: string
      fieldsToTrack?: string[]
    }
  ): Promise<void> {
    const entityConfig = ENTITY_FIELD_CONFIGS[entityType]
    if (!entityConfig) {
      console.warn(`[HistoryService] No field config for entity type: ${entityType}`)
      return
    }

    const fieldsToTrack = options?.fieldsToTrack ?? Object.keys(entityConfig)
    const changes: Array<{
      org_id: string
      entity_type: string
      entity_id: string
      change_type: ChangeType
      field_name: string
      old_value: string | null
      new_value: string | null
      old_value_label: string | null
      new_value_label: string | null
      reason: string | null
      is_automated: boolean
      correlation_id: string | null
      changed_by: string | null
    }> = []

    const userProfileId = ctx.userId ? await this.getUserProfileId(ctx.userId) : null

    for (const fieldName of fieldsToTrack) {
      const config = entityConfig[fieldName]
      if (!config) continue

      const oldValue = before[fieldName]
      const newValue = after[fieldName]

      // Skip if values are the same
      if (this.areValuesEqual(oldValue, newValue)) continue

      // Skip masked/sensitive fields
      if (config.sensitive) continue

      changes.push({
        org_id: ctx.orgId,
        entity_type: entityType,
        entity_id: entityId,
        change_type: config.changeType ?? 'custom',
        field_name: fieldName,
        old_value: this.formatValue(oldValue),
        new_value: this.formatValue(newValue),
        old_value_label: this.getValueLabel(config, oldValue),
        new_value_label: this.getValueLabel(config, newValue),
        reason: options?.reason ?? null,
        is_automated: ctx.isAutomated ?? false,
        correlation_id: ctx.correlationId ?? null,
        changed_by: userProfileId,
      })
    }

    if (changes.length > 0) {
      await this.adminClient.from('entity_history').insert(changes)
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get user_profiles.id from auth.users.id
   */
  private async getUserProfileId(authUserId: string): Promise<string | null> {
    const { data } = await this.adminClient
      .from('user_profiles')
      .select('id')
      .eq('auth_id', authUserId)
      .single()
    return data?.id ?? null
  }

  /**
   * Get user full name from user_profiles.id
   */
  private async getUserName(userProfileId: string): Promise<string | null> {
    const { data } = await this.adminClient
      .from('user_profiles')
      .select('full_name')
      .eq('id', userProfileId)
      .single()
    return data?.full_name ?? null
  }

  /**
   * Get last status change for calculating time in previous state
   */
  private async getLastStatusChange(
    entityType: string,
    entityId: string,
    orgId: string
  ): Promise<{ changed_at: string } | null> {
    const { data } = await this.adminClient
      .from('entity_history')
      .select('changed_at')
      .eq('org_id', orgId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('field_name', 'status')
      .order('changed_at', { ascending: false })
      .limit(1)
      .single()
    return data
  }

  /**
   * Get field configuration for an entity type
   */
  private getFieldConfig(entityType: string, fieldName: string): EntityFieldConfig | undefined {
    return ENTITY_FIELD_CONFIGS[entityType]?.[fieldName]
  }

  /**
   * Format value for storage
   */
  private formatValue(value: unknown): string | null {
    if (value === null || value === undefined) return null
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (value instanceof Date) return value.toISOString()
    return JSON.stringify(value)
  }

  /**
   * Get human-readable label for a value
   */
  private getValueLabel(config: EntityFieldConfig | undefined, value: unknown): string | null {
    if (value === null || value === undefined) return null
    if (config?.valueLabels && typeof value === 'string') {
      return config.valueLabels[value] ?? value
    }
    return this.formatValue(value)
  }

  /**
   * Check if two values are equal
   */
  private areValuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a === null && b === undefined) return true
    if (a === undefined && b === null) return true
    if (typeof a === 'object' && typeof b === 'object') {
      return JSON.stringify(a) === JSON.stringify(b)
    }
    return false
  }

  /**
   * Format entity type for display
   */
  private formatEntityType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
  }

  /**
   * Format duration in milliseconds to human-readable string
   */
  private formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'}`
    }
    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`
    }
    return 'less than an hour'
  }
}

/**
 * Singleton instance of HistoryService
 */
export const historyService = new HistoryService()
