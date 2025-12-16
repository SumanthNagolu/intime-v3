import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * HISTORY-01: Unified Audit Trail System
 *
 * Provides procedures for:
 * - Entity history (status/state changes)
 * - Audit log (field-level changes)
 * - System events (application-level events)
 * - Unified timeline API
 */

const ChangeTypeEnum = z.enum([
  'status_change', 'stage_change', 'owner_change', 'assignment_change',
  'score_change', 'priority_change', 'category_change', 'workflow_step', 'custom'
])

const EventCategoryEnum = z.enum(['security', 'data', 'system', 'integration', 'workflow'])
const SeverityEnum = z.enum(['debug', 'info', 'warning', 'error', 'critical'])

export const historyRouter = router({
  // ============================================
  // ENTITY HISTORY
  // ============================================

  // Get history for an entity
  getEntityHistory: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      changeType: ChangeTypeEnum.optional(),
      fieldName: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('entity_history')
        .select(`
          *,
          changed_by_user:user_profiles!changed_by(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .order('changed_at', { ascending: false })

      if (input.changeType) {
        query = query.eq('change_type', input.changeType)
      }
      if (input.fieldName) {
        query = query.eq('field_name', input.fieldName)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items: data?.map(h => ({
          id: h.id,
          entityType: h.entity_type,
          entityId: h.entity_id,
          changeType: h.change_type,
          fieldName: h.field_name,
          oldValue: h.old_value,
          newValue: h.new_value,
          oldValueLabel: h.old_value_label,
          newValueLabel: h.new_value_label,
          reason: h.reason,
          comment: h.comment,
          isAutomated: h.is_automated,
          timeInPreviousState: h.time_in_previous_state,
          changedBy: h.changed_by_user,
          changedAt: h.changed_at,
          metadata: h.metadata,
        })) ?? [],
        total: count ?? 0,
      }
    }),

  // Record a manual history entry
  recordChange: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      changeType: ChangeTypeEnum,
      fieldName: z.string(),
      oldValue: z.string().optional(),
      newValue: z.string(),
      oldValueLabel: z.string().optional(),
      newValueLabel: z.string().optional(),
      reason: z.string().optional(),
      comment: z.string().optional(),
      relatedEntityType: z.string().optional(),
      relatedEntityId: z.string().uuid().optional(),
      correlationId: z.string().uuid().optional(),
      metadata: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { data, error } = await supabase
        .from('entity_history')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          change_type: input.changeType,
          field_name: input.fieldName,
          old_value: input.oldValue,
          new_value: input.newValue,
          old_value_label: input.oldValueLabel,
          new_value_label: input.newValueLabel,
          reason: input.reason,
          comment: input.comment,
          related_entity_type: input.relatedEntityType,
          related_entity_id: input.relatedEntityId,
          correlation_id: input.correlationId,
          changed_by: user?.id,
          metadata: input.metadata,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { id: data.id }
    }),

  // ============================================
  // AUDIT LOG
  // ============================================

  // Get audit log for entity
  getAuditLog: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      operation: z.enum(['create', 'update', 'delete', 'restore']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('audit_log')
        .select(`
          *,
          performed_by_user:user_profiles!performed_by(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .order('performed_at', { ascending: false })

      if (input.operation) {
        query = query.eq('operation', input.operation)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items: data?.map(a => ({
          id: a.id,
          entityType: a.entity_type,
          entityId: a.entity_id,
          operation: a.operation,
          changes: a.changes,
          changeCount: a.change_count,
          containsPii: a.contains_pii,
          performedBy: a.performed_by_user,
          performedAt: a.performed_at,
        })) ?? [],
        total: count ?? 0,
      }
    }),

  // Record an audit log entry
  recordAudit: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      operation: z.enum(['create', 'update', 'delete', 'restore']),
      changes: z.record(z.object({
        old: z.unknown().optional(),
        new: z.unknown().optional(),
      })),
      containsPii: z.boolean().default(false),
      piiFields: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { data, error } = await supabase
        .from('audit_log')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          operation: input.operation,
          changes: input.changes,
          change_count: Object.keys(input.changes).length,
          contains_pii: input.containsPii,
          pii_fields: input.piiFields,
          performed_by: user?.id,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { id: data.id }
    }),

  // ============================================
  // SYSTEM EVENTS
  // ============================================

  // Log a system event
  logEvent: orgProtectedProcedure
    .input(z.object({
      eventType: z.string(),
      eventCategory: EventCategoryEnum,
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
      details: z.record(z.unknown()).default({}),
      severity: SeverityEnum.default('info'),
      message: z.string().optional(),
      durationMs: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { data, error } = await supabase
        .from('system_events')
        .insert({
          org_id: orgId,
          event_type: input.eventType,
          event_category: input.eventCategory,
          entity_type: input.entityType,
          entity_id: input.entityId,
          details: input.details,
          severity: input.severity,
          message: input.message,
          user_id: user?.id,
          duration_ms: input.durationMs,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { id: data.id }
    }),

  // Get system events
  getSystemEvents: orgProtectedProcedure
    .input(z.object({
      eventCategory: EventCategoryEnum.optional(),
      severity: z.array(SeverityEnum).optional(),
      eventType: z.string().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('system_events')
        .select(`
          *,
          user:user_profiles!user_id(id, full_name, avatar_url)
        `, { count: 'exact' })
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .order('occurred_at', { ascending: false })

      if (input.eventCategory) {
        query = query.eq('event_category', input.eventCategory)
      }
      if (input.severity && input.severity.length > 0) {
        query = query.in('severity', input.severity)
      }
      if (input.eventType) {
        query = query.eq('event_type', input.eventType)
      }
      if (input.startDate) {
        query = query.gte('occurred_at', input.startDate.toISOString())
      }
      if (input.endDate) {
        query = query.lte('occurred_at', input.endDate.toISOString())
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items: data ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // UNIFIED TIMELINE
  // ============================================

  // Get unified timeline for an entity (history + audit + activities)
  getEntityTimeline: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      includeRelated: z.boolean().default(false),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get entity history
      const { data: history } = await adminClient
        .from('entity_history')
        .select('id, change_type, field_name, old_value, new_value, changed_at, changed_by')
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .order('changed_at', { ascending: false })
        .limit(input.limit)

      // Get activities
      const { data: activities } = await adminClient
        .from('activities')
        .select('id, activity_type, subject, status, completed_at, created_at, performed_by')
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .order('created_at', { ascending: false })
        .limit(input.limit)

      // Combine and sort
      const timeline = [
        ...(history?.map(h => ({
          type: 'history' as const,
          id: h.id,
          event: `${h.field_name}: ${h.old_value ?? '(none)'} → ${h.new_value}`,
          changeType: h.change_type,
          timestamp: h.changed_at,
          userId: h.changed_by,
        })) ?? []),
        ...(activities?.map(a => ({
          type: 'activity' as const,
          id: a.id,
          event: a.subject,
          activityType: a.activity_type,
          status: a.status,
          timestamp: a.completed_at || a.created_at,
          userId: a.performed_by,
        })) ?? []),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, input.limit)

      return timeline
    }),

  // Get stats for an entity
  statsByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { count: historyCount } = await adminClient
        .from('entity_history')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)

      const { count: auditCount } = await adminClient
        .from('audit_log')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)

      return {
        historyEntries: historyCount ?? 0,
        auditEntries: auditCount ?? 0,
        total: (historyCount ?? 0) + (auditCount ?? 0),
      }
    }),

  // ============================================
  // DATA RETENTION POLICIES
  // ============================================

  // List retention policies
  listRetentionPolicies: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('data_retention_policies')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return data ?? []
    }),

  // Create retention policy
  createRetentionPolicy: orgProtectedProcedure
    .input(z.object({
      tableName: z.string(),
      entityType: z.string().optional(),
      retentionDays: z.number().min(1),
      archiveAfterDays: z.number().optional(),
      maskPiiAfterDays: z.number().optional(),
      actionOnExpiry: z.enum(['archive', 'delete', 'anonymize']).default('archive'),
      processingFrequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { data, error } = await supabase
        .from('data_retention_policies')
        .insert({
          org_id: orgId,
          table_name: input.tableName,
          entity_type: input.entityType,
          retention_days: input.retentionDays,
          archive_after_days: input.archiveAfterDays,
          mask_pii_after_days: input.maskPiiAfterDays,
          action_on_expiry: input.actionOnExpiry,
          processing_frequency: input.processingFrequency,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A retention policy for this table and entity type already exists',
          })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // Update retention policy
  updateRetentionPolicy: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      retentionDays: z.number().min(1).optional(),
      archiveAfterDays: z.number().optional(),
      maskPiiAfterDays: z.number().optional(),
      actionOnExpiry: z.enum(['archive', 'delete', 'anonymize']).optional(),
      processingFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx
      const { id, ...updates } = input

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (updates.retentionDays !== undefined) updateData.retention_days = updates.retentionDays
      if (updates.archiveAfterDays !== undefined) updateData.archive_after_days = updates.archiveAfterDays
      if (updates.maskPiiAfterDays !== undefined) updateData.mask_pii_after_days = updates.maskPiiAfterDays
      if (updates.actionOnExpiry !== undefined) updateData.action_on_expiry = updates.actionOnExpiry
      if (updates.processingFrequency !== undefined) updateData.processing_frequency = updates.processingFrequency
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive

      const { data, error } = await supabase
        .from('data_retention_policies')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return data
    }),

  // Delete retention policy
  deleteRetentionPolicy: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx

      const { error } = await supabase
        .from('data_retention_policies')
        .delete()
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { success: true }
    }),
})
