import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

// ============================================
// INPUT SCHEMAS
// ============================================

const EntityTypeEnum = z.enum([
  'account',
  'job',
  'contact',
  'candidate',
  'submission',
  'placement',
  'vendor',
  'contract',
])

export type EntityType = z.infer<typeof EntityTypeEnum>

const CreateDraftInput = z.object({
  entityType: EntityTypeEnum,
  displayName: z.string().min(1).max(200),
  formData: z.record(z.unknown()),
  currentStep: z.number().int().min(1).default(1),
  totalSteps: z.number().int().min(1).default(1),
  wizardRoute: z.string().min(1),
})

const UpdateDraftInput = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(200).optional(),
  formData: z.record(z.unknown()).optional(),
  currentStep: z.number().int().min(1).optional(),
  totalSteps: z.number().int().min(1).optional(),
})

const GetDraftInput = z.object({
  id: z.string().uuid(),
})

const ListDraftsInput = z.object({
  entityType: EntityTypeEnum.optional(),
  limit: z.number().int().min(1).max(100).default(50),
})

const DeleteDraftInput = z.object({
  id: z.string().uuid(),
})

// ============================================
// RESPONSE TYPES
// ============================================

export interface DraftItem {
  id: string
  entityType: EntityType
  displayName: string
  formData: Record<string, unknown>
  currentStep: number
  totalSteps: number
  wizardRoute: string
  createdAt: string
  updatedAt: string
}

export interface DraftCounts {
  total: number
  byEntityType: Record<EntityType, number>
}

// ============================================
// ROUTER
// ============================================

export const draftsRouter = router({
  // ============================================
  // LIST DRAFTS
  // Get all drafts for current user, optionally filtered by entity type
  // ============================================
  list: orgProtectedProcedure
    .input(ListDraftsInput)
    .query(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      let query = supabase
        .from('entity_drafts')
        .select('*')
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(input.limit)

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to list drafts:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to load drafts',
        })
      }

      return (data || []).map((draft) => ({
        id: draft.id,
        entityType: draft.entity_type as EntityType,
        displayName: draft.display_name,
        formData: draft.form_data as Record<string, unknown>,
        currentStep: draft.current_step ?? 1,
        totalSteps: draft.total_steps ?? 1,
        wizardRoute: draft.wizard_route,
        createdAt: draft.created_at,
        updatedAt: draft.updated_at,
      })) as DraftItem[]
    }),

  // ============================================
  // GET SINGLE DRAFT
  // ============================================
  get: orgProtectedProcedure
    .input(GetDraftInput)
    .query(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { data, error } = await supabase
        .from('entity_drafts')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Draft not found',
        })
      }

      return {
        id: data.id,
        entityType: data.entity_type as EntityType,
        displayName: data.display_name,
        formData: data.form_data as Record<string, unknown>,
        currentStep: data.current_step ?? 1,
        totalSteps: data.total_steps ?? 1,
        wizardRoute: data.wizard_route,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as DraftItem
    }),

  // ============================================
  // CREATE DRAFT
  // Called when starting a new wizard
  // ============================================
  create: orgProtectedProcedure
    .input(CreateDraftInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { data, error } = await supabase
        .from('entity_drafts')
        .insert({
          org_id: orgId,
          user_id: user.id,
          entity_type: input.entityType,
          display_name: input.displayName,
          form_data: input.formData,
          current_step: input.currentStep,
          total_steps: input.totalSteps,
          wizard_route: input.wizardRoute,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create draft:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create draft',
        })
      }

      return {
        id: data.id,
        entityType: data.entity_type as EntityType,
        displayName: data.display_name,
        formData: data.form_data as Record<string, unknown>,
        currentStep: data.current_step ?? 1,
        totalSteps: data.total_steps ?? 1,
        wizardRoute: data.wizard_route,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as DraftItem
    }),

  // ============================================
  // UPDATE DRAFT
  // Called during debounced auto-save
  // ============================================
  update: orgProtectedProcedure
    .input(UpdateDraftInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {}
      if (input.displayName !== undefined) {
        updateData.display_name = input.displayName
      }
      if (input.formData !== undefined) {
        updateData.form_data = input.formData
      }
      if (input.currentStep !== undefined) {
        updateData.current_step = input.currentStep
      }
      if (input.totalSteps !== undefined) {
        updateData.total_steps = input.totalSteps
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No fields to update',
        })
      }

      const { data, error } = await supabase
        .from('entity_drafts')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Draft not found',
          })
        }
        console.error('Failed to update draft:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update draft',
        })
      }

      return {
        id: data.id,
        entityType: data.entity_type as EntityType,
        displayName: data.display_name,
        formData: data.form_data as Record<string, unknown>,
        currentStep: data.current_step ?? 1,
        totalSteps: data.total_steps ?? 1,
        wizardRoute: data.wizard_route,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as DraftItem
    }),

  // ============================================
  // DELETE DRAFT (soft delete)
  // Called on successful form submission or explicit delete
  // ============================================
  delete: orgProtectedProcedure
    .input(DeleteDraftInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      const { error } = await supabase
        .from('entity_drafts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .is('deleted_at', null)

      if (error) {
        console.error('Failed to delete draft:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete draft',
        })
      }

      return { success: true }
    }),

  // ============================================
  // GET DRAFT COUNTS
  // For displaying badges in the UI
  // ============================================
  counts: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, user, supabase } = ctx

    const { data, error } = await supabase
      .from('entity_drafts')
      .select('entity_type')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      console.error('Failed to get draft counts:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load draft counts',
      })
    }

    const byEntityType: Record<string, number> = {}
    for (const draft of data || []) {
      const type = draft.entity_type as string
      byEntityType[type] = (byEntityType[type] || 0) + 1
    }

    return {
      total: data?.length || 0,
      byEntityType: byEntityType as Record<EntityType, number>,
    } as DraftCounts
  }),
})

