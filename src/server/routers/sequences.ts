import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// INPUT SCHEMAS
// ============================================

const ChannelEnum = z.enum(['email', 'linkedin', 'phone', 'sms'])

const SequenceStepSchema = z.object({
  day: z.number().int().min(0),
  action: z.string(),
  subject: z.string().optional(),
  body: z.string().optional(),
  templateId: z.string().uuid().optional(),
})

const SequenceSettingsSchema = z.object({
  stopOnReply: z.boolean().default(true),
  stopOnMeeting: z.boolean().default(true),
  sendTime: z.string().optional(),
  respectTimezone: z.boolean().default(true),
  dailyLimit: z.number().int().min(1).max(500).optional(),
})

const CreateSequenceInput = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  channel: ChannelEnum,
  steps: z.array(SequenceStepSchema).min(1, 'At least one step is required'),
  settings: SequenceSettingsSchema.optional(),
  isActive: z.boolean().default(true),
})

const UpdateSequenceInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  steps: z.array(SequenceStepSchema).optional(),
  settings: SequenceSettingsSchema.optional(),
  isActive: z.boolean().optional(),
})

// ============================================
// ROUTER
// ============================================

export const sequencesRouter = router({
  // ============================================
  // LIST SEQUENCE TEMPLATES
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      channel: ChannelEnum.optional(),
      isActive: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('sequence_templates')
        .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.channel) {
        query = query.eq('channel', input.channel)
      }

      if (input.isActive !== undefined) {
        query = query.eq('is_active', input.isActive)
      }

      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%,description.ilike.%${input.search}%`)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(seq => ({
          id: seq.id,
          name: seq.name,
          description: seq.description,
          channel: seq.channel,
          steps: seq.steps as Array<{ day: number; action: string; subject?: string; body?: string }>,
          settings: seq.settings as { stopOnReply?: boolean; stopOnMeeting?: boolean; sendTime?: string; dailyLimit?: number },
          isActive: seq.is_active,
          usageCount: seq.usage_count,
          createdAt: seq.created_at,
          updatedAt: seq.updated_at,
          creator: seq.creator,
        })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET SEQUENCE BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sequence_templates')
        .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
        .eq('org_id', orgId)
        .eq('id', input.id)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Sequence template not found' })
      }

      // Get campaigns using this sequence
      const { data: campaigns } = await adminClient
        .from('campaign_sequences')
        .select('campaign:campaigns(id, name, status)')
        .eq('sequence_template_id', input.id)
        .eq('org_id', orgId)
        .limit(10)

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        channel: data.channel,
        steps: data.steps as Array<{ day: number; action: string; subject?: string; body?: string; templateId?: string }>,
        settings: data.settings as { stopOnReply?: boolean; stopOnMeeting?: boolean; sendTime?: string; respectTimezone?: boolean; dailyLimit?: number },
        isActive: data.is_active,
        usageCount: data.usage_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        creator: data.creator,
        campaigns: campaigns?.map(c => c.campaign).filter(Boolean) ?? [],
      }
    }),

  // ============================================
  // CREATE SEQUENCE TEMPLATE
  // ============================================
  create: orgProtectedProcedure
    .input(CreateSequenceInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const userId = user?.id
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('sequence_templates')
        .insert({
          org_id: orgId,
          name: input.name,
          description: input.description,
          channel: input.channel,
          steps: input.steps,
          settings: input.settings ?? {},
          is_active: input.isActive,
          created_by: userId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Log activity
      await adminClient.from('activities').insert({
        org_id: orgId,
        entity_type: 'sequence_template',
        entity_id: data.id,
        activity_type: 'note',
        subject: 'Sequence Template Created',
        description: `"${input.name}" (${input.channel}) created with ${input.steps.length} steps`,
        created_by: userId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })

      return {
        id: data.id,
        name: data.name,
        channel: data.channel,
        steps: data.steps,
      }
    }),

  // ============================================
  // UPDATE SEQUENCE TEMPLATE
  // ============================================
  update: orgProtectedProcedure
    .input(UpdateSequenceInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const userId = user?.id
      const adminClient = getAdminClient()

      const { id, ...updates } = input

      // Build update object
      const updateData: Record<string, unknown> = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.steps !== undefined) updateData.steps = updates.steps
      if (updates.settings !== undefined) updateData.settings = updates.settings
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive

      const { data, error } = await adminClient
        .from('sequence_templates')
        .update(updateData)
        .eq('org_id', orgId)
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Log activity
      await adminClient.from('activities').insert({
        org_id: orgId,
        entity_type: 'sequence_template',
        entity_id: id,
        activity_type: 'note',
        subject: 'Sequence Template Updated',
        description: `"${data.name}" updated`,
        created_by: userId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })

      return {
        id: data.id,
        name: data.name,
        channel: data.channel,
        steps: data.steps,
        isActive: data.is_active,
      }
    }),

  // ============================================
  // DELETE SEQUENCE TEMPLATE (SOFT DELETE)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const userId = user?.id
      const adminClient = getAdminClient()

      // Get template info for logging
      const { data: template } = await adminClient
        .from('sequence_templates')
        .select('name, usage_count')
        .eq('org_id', orgId)
        .eq('id', input.id)
        .single()

      if (template?.usage_count && template.usage_count > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete sequence template that is used by ${template.usage_count} campaign(s). Remove it from campaigns first.`,
        })
      }

      const { error } = await adminClient
        .from('sequence_templates')
        .update({ deleted_at: new Date().toISOString() })
        .eq('org_id', orgId)
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Log activity
      if (template) {
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'sequence_template',
          entity_id: input.id,
          activity_type: 'note',
          subject: 'Sequence Template Deleted',
          description: `"${template.name}" deleted`,
          created_by: userId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
      }

      return { success: true }
    }),

  // ============================================
  // DUPLICATE SEQUENCE TEMPLATE
  // ============================================
  duplicate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      newName: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const userId = user?.id
      const adminClient = getAdminClient()

      // Get original template
      const { data: original, error: fetchError } = await adminClient
        .from('sequence_templates')
        .select('*')
        .eq('org_id', orgId)
        .eq('id', input.id)
        .is('deleted_at', null)
        .single()

      if (fetchError || !original) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Sequence template not found' })
      }

      // Create duplicate
      const { data, error } = await adminClient
        .from('sequence_templates')
        .insert({
          org_id: orgId,
          name: input.newName,
          description: original.description,
          channel: original.channel,
          steps: original.steps,
          settings: original.settings,
          is_active: true,
          usage_count: 0,
          created_by: userId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Log activity
      await adminClient.from('activities').insert({
        org_id: orgId,
        entity_type: 'sequence_template',
        entity_id: data.id,
        activity_type: 'note',
        subject: 'Sequence Template Duplicated',
        description: `Created "${input.newName}" from "${original.name}"`,
        created_by: userId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })

      return {
        id: data.id,
        name: data.name,
        channel: data.channel,
      }
    }),

  // ============================================
  // GET SEQUENCES FOR CAMPAIGN PICKER
  // ============================================
  listForPicker: orgProtectedProcedure
    .input(z.object({
      channel: ChannelEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('sequence_templates')
        .select('id, name, channel, steps, usage_count')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('usage_count', { ascending: false })
        .limit(100)

      if (input.channel) {
        query = query.eq('channel', input.channel)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(seq => ({
        id: seq.id,
        name: seq.name,
        channel: seq.channel,
        stepCount: Array.isArray(seq.steps) ? seq.steps.length : 0,
        usageCount: seq.usage_count,
      })) ?? []
    }),

  // ============================================
  // ASSIGN SEQUENCE TO CAMPAIGN
  // ============================================
  assignToCampaign: orgProtectedProcedure
    .input(z.object({
      campaignId: z.string().uuid(),
      sequenceTemplateId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Check if already assigned
      const { data: existing } = await adminClient
        .from('campaign_sequences')
        .select('id')
        .eq('campaign_id', input.campaignId)
        .eq('sequence_template_id', input.sequenceTemplateId)
        .single()

      if (existing) {
        return { success: true, alreadyExists: true }
      }

      const { error } = await adminClient
        .from('campaign_sequences')
        .insert({
          campaign_id: input.campaignId,
          sequence_template_id: input.sequenceTemplateId,
          org_id: orgId,
        })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Also update the campaign's sequence_template_ids array
      const { data: campaign } = await adminClient
        .from('campaigns')
        .select('sequence_template_ids')
        .eq('id', input.campaignId)
        .single()

      const existingIds = campaign?.sequence_template_ids ?? []
      if (!existingIds.includes(input.sequenceTemplateId)) {
        await adminClient
          .from('campaigns')
          .update({
            sequence_template_ids: [...existingIds, input.sequenceTemplateId],
          })
          .eq('id', input.campaignId)
      }

      return { success: true }
    }),

  // ============================================
  // REMOVE SEQUENCE FROM CAMPAIGN
  // ============================================
  removeFromCampaign: orgProtectedProcedure
    .input(z.object({
      campaignId: z.string().uuid(),
      sequenceTemplateId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('campaign_sequences')
        .delete()
        .eq('campaign_id', input.campaignId)
        .eq('sequence_template_id', input.sequenceTemplateId)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Also update the campaign's sequence_template_ids array
      const { data: campaign } = await adminClient
        .from('campaigns')
        .select('sequence_template_ids')
        .eq('id', input.campaignId)
        .single()

      if (campaign?.sequence_template_ids) {
        await adminClient
          .from('campaigns')
          .update({
            sequence_template_ids: campaign.sequence_template_ids.filter(
              (id: string) => id !== input.sequenceTemplateId
            ),
          })
          .eq('id', input.campaignId)
      }

      return { success: true }
    }),
})







