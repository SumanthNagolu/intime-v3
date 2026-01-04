import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import type { JobContactRole, JobContactLink } from '@/types/workspace'

// ============================================
// INPUT SCHEMAS
// ============================================

const jobContactRoleEnum = z.enum([
  'hiring_manager',
  'hr_contact',
  'technical_interviewer',
  'decision_maker',
  'recruiter_poc',
  'end_client_contact'
])

const linkInput = z.object({
  jobId: z.string().uuid(),
  contactId: z.string().uuid(),
  role: jobContactRoleEnum,
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
})

const updateInput = z.object({
  id: z.string().uuid(),
  role: jobContactRoleEnum.optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().nullable().optional(),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformJobContact(data: Record<string, unknown>): JobContactLink {
  const contact = data.contact as Record<string, unknown> | null
  const job = data.job as Record<string, unknown> | null

  return {
    id: data.id as string,
    jobId: data.job_id as string,
    contactId: data.contact_id as string,
    role: data.role as JobContactRole,
    isPrimary: (data.is_primary as boolean) ?? false,
    notes: data.notes as string | null,
    createdAt: data.created_at as string,
    contact: contact ? {
      id: contact.id as string,
      firstName: contact.first_name as string,
      lastName: contact.last_name as string,
      fullName: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown',
      email: contact.email as string | null,
      phone: contact.phone as string | null,
      title: contact.title as string | null,
      avatarUrl: contact.avatar_url as string | null,
    } : undefined,
    job: job ? {
      id: job.id as string,
      title: job.title as string,
      status: job.status as string,
      account: job.account ? {
        id: (job.account as Record<string, unknown>).id as string,
        name: (job.account as Record<string, unknown>).name as string,
      } : null,
    } : undefined,
  }
}

// ============================================
// ROUTER
// ============================================

export const jobContactsRouter = router({
  // ==========================================
  // LIST BY JOB - Get all contacts for a job
  // ==========================================
  listByJob: orgProtectedProcedure
    .input(z.object({
      jobId: z.string().uuid(),
      role: jobContactRoleEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('job_contacts')
        .select(`
          *,
          contact:contacts!contact_id(
            id, first_name, last_name, email, phone, title, avatar_url
          )
        `)
        .eq('org_id', orgId)
        .eq('job_id', input.jobId)
        .is('deleted_at', null)

      if (input.role) {
        query = query.eq('role', input.role)
      }

      const { data, error } = await query
        .order('is_primary', { ascending: false })
        .order('role')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return (data || []).map(transformJobContact)
    }),

  // ==========================================
  // LIST BY CONTACT - Get all jobs for a contact
  // ==========================================
  listByContact: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      role: jobContactRoleEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('job_contacts')
        .select(`
          *,
          job:jobs!job_id(
            id, title, status, job_type, rate_min, rate_max,
            positions_count, positions_filled, priority, created_at,
            owner:user_profiles!owner_id(id, first_name, last_name),
            account:companies!company_id(id, name)
          )
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)

      if (input.role) {
        query = query.eq('role', input.role)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return (data || []).map(transformJobContact)
    }),

  // ==========================================
  // LINK - Create a new job-contact relationship
  // ==========================================
  link: orgProtectedProcedure
    .input(linkInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id from auth_id (FK references user_profiles, not auth.users)
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // If setting as primary, unset other primaries for this role on this job
      if (input.isPrimary) {
        await adminClient
          .from('job_contacts')
          .update({
            is_primary: false,
            updated_at: new Date().toISOString(),
            updated_by: userProfileId,
          })
          .eq('job_id', input.jobId)
          .eq('role', input.role)
          .eq('org_id', orgId)
          .is('deleted_at', null)
      }

      const { data, error } = await adminClient
        .from('job_contacts')
        .insert({
          org_id: orgId,
          job_id: input.jobId,
          contact_id: input.contactId,
          role: input.role,
          is_primary: input.isPrimary,
          notes: input.notes || null,
          created_by: userProfileId,
        })
        .select('id')
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This contact is already linked to this job with the same role'
          })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UNLINK - Soft delete a job-contact relationship
  // ==========================================
  unlink: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id from auth_id
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      const { error } = await adminClient
        .from('job_contacts')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: userProfileId,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // UPDATE - Change role, isPrimary, or notes
  // ==========================================
  update: orgProtectedProcedure
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Look up user_profiles.id from auth_id
      let userProfileId: string | null = null
      if (user?.id) {
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        userProfileId = profile?.id ?? null
      }

      // Build update object
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: userProfileId,
      }

      if (input.role !== undefined) updateData.role = input.role
      if (input.isPrimary !== undefined) updateData.is_primary = input.isPrimary
      if (input.notes !== undefined) updateData.notes = input.notes

      // If setting as primary, first get the current record to know the job and role
      if (input.isPrimary === true) {
        const { data: currentRecord } = await adminClient
          .from('job_contacts')
          .select('job_id, role')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (currentRecord) {
          // Unset other primaries for this role on this job
          await adminClient
            .from('job_contacts')
            .update({ is_primary: false, updated_at: new Date().toISOString() })
            .eq('job_id', currentRecord.job_id)
            .eq('role', input.role || currentRecord.role)
            .eq('org_id', orgId)
            .neq('id', input.id)
            .is('deleted_at', null)
        }
      }

      const { error } = await adminClient
        .from('job_contacts')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This contact already has this role on the job'
          })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // GET BY ID - Get a single job-contact link
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('job_contacts')
        .select(`
          *,
          contact:contacts!contact_id(
            id, first_name, last_name, email, phone, title, avatar_url
          ),
          job:jobs!job_id(
            id, title, status,
            account:companies!company_id(id, name)
          )
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job contact link not found' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return transformJobContact(data)
    }),
})
