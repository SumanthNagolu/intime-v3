import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { Resend } from 'resend'

// ============================================
// RESEND CLIENT (optional - only if API key is present)
// ============================================
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// ============================================
// HELPER: Slugify
// ============================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============================================
// HELPER: Strip HTML
// ============================================
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

// ============================================
// INPUT SCHEMAS
// ============================================
const templateCategorySchema = z.enum([
  'user', 'candidate', 'client', 'internal', 'system', 'marketing'
])

const templateStatusSchema = z.enum([
  'draft', 'active', 'disabled', 'archived'
])

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: templateCategorySchema,
  subject: z.string().min(1, 'Subject is required').max(200),
  preview_text: z.string().max(200).optional(),
  from_name: z.string().max(100).optional(),
  from_email: z.string().max(100).optional(),
  reply_to: z.string().email().optional().nullable(),
  body_html: z.string().min(1, 'Email body is required'),
  body_text: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string().uuid(),
})

// ============================================
// AVAILABLE TEMPLATE VARIABLES BY CATEGORY
// ============================================
const TEMPLATE_VARIABLES = {
  user: ['first_name', 'last_name', 'full_name', 'email', 'job_title', 'department', 'pod_name'],
  company: ['company_name', 'company_domain', 'company_address', 'company_phone', 'logo_url'],
  employment: ['start_date', 'start_date_short', 'manager_name', 'manager_email', 'hr_email'],
  links: ['password_setup_link', 'login_link', 'profile_link', 'onboarding_link', 'unsubscribe_link', 'preferences_link'],
  candidate: ['candidate_name', 'candidate_email', 'candidate_phone'],
  job: ['job_title', 'job_location', 'job_bill_rate', 'job_description'],
  submission: ['submission_status', 'submission_date'],
  interview: ['interview_date', 'interview_time', 'interview_location', 'interviewer_name'],
  placement: ['placement_start_date', 'placement_end_date', 'placement_rate'],
  system: ['current_date', 'current_year', 'current_time', 'sender_name', 'sender_email'],
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function extractVariables(html: string, subject: string): string[] {
  const combined = `${html} ${subject}`
  const matches = combined.match(/\{\{(\w+)\}\}/g) || []
  const variables = matches.map(m => m.replace(/\{\{|\}\}/g, ''))
  return [...new Set(variables)]
}

function validateVariables(variables: string[], category: string): string[] {
  const allValid = new Set([
    ...TEMPLATE_VARIABLES.user,
    ...TEMPLATE_VARIABLES.company,
    ...TEMPLATE_VARIABLES.employment,
    ...TEMPLATE_VARIABLES.links,
    ...TEMPLATE_VARIABLES.system,
    ...(category === 'candidate' ? TEMPLATE_VARIABLES.candidate : []),
    ...(category === 'candidate' || category === 'client' ? [
      ...TEMPLATE_VARIABLES.job,
      ...TEMPLATE_VARIABLES.submission,
      ...TEMPLATE_VARIABLES.interview,
      ...TEMPLATE_VARIABLES.placement
    ] : []),
  ])

  return variables.filter(v => !allValid.has(v))
}

function renderTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] ?? match
  })
}

// ============================================
// ROUTER
// ============================================
export const emailTemplatesRouter = router({
  // ============================================
  // LIST TEMPLATES
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      category: templateCategorySchema.optional(),
      status: templateStatusSchema.optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx
      const { search, category, status, page, pageSize } = input
      const offset = (page - 1) * pageSize

      let query = supabase
        .from('email_templates')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`)
      }
      if (category) {
        query = query.eq('category', category)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const { data, count, error } = await query.range(offset, offset + pageSize - 1)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET TEMPLATE BY ID
  // ============================================
  get: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid().optional(),
      slug: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      if (!input.id && !input.slug) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'id or slug required' })
      }

      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.id) {
        query = query.eq('id', input.id)
      } else if (input.slug) {
        query = query.eq('slug', input.slug).eq('status', 'active')
      }

      const { data, error } = await query.single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      return data
    }),

  // ============================================
  // GET CATEGORY STATS
  // ============================================
  getCategoryStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('email_templates')
        .select('category, status')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const stats = {
        total: data?.length || 0,
        active: data?.filter(t => t.status === 'active').length || 0,
        draft: data?.filter(t => t.status === 'draft').length || 0,
        disabled: data?.filter(t => t.status === 'disabled').length || 0,
        byCategory: {} as Record<string, number>,
      }

      data?.forEach(t => {
        stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + 1
      })

      return stats
    }),

  // ============================================
  // CREATE TEMPLATE
  // ============================================
  create: orgProtectedProcedure
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const slug = slugify(input.name)

      // Check for duplicate name
      const { data: existing } = await supabase
        .from('email_templates')
        .select('id')
        .eq('org_id', orgId)
        .eq('slug', slug)
        .is('deleted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Template with this name already exists' })
      }

      // Extract variables from template
      const variablesUsed = extractVariables(input.body_html, input.subject)

      // Validate variables
      const invalidVars = validateVariables(variablesUsed, input.category)
      if (invalidVars.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unknown variables: ${invalidVars.join(', ')}`,
        })
      }

      // Validate marketing templates have unsubscribe
      if (input.category === 'marketing' && !input.body_html.includes('{{unsubscribe_link}}')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Marketing emails require {{unsubscribe_link}}',
        })
      }

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          org_id: orgId,
          name: input.name,
          slug,
          category: input.category,
          subject: input.subject,
          preview_text: input.preview_text,
          from_name: input.from_name || '{{company_name}}',
          from_email: input.from_email || 'noreply@{{company_domain}}',
          reply_to: input.reply_to,
          body_html: input.body_html,
          body_text: input.body_text || stripHtml(input.body_html),
          variables_used: variablesUsed,
          notes: input.notes,
          status: 'draft',
          version: 1,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // ============================================
  // UPDATE TEMPLATE
  // ============================================
  update: orgProtectedProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const { id, ...updates } = input

      // Fetch current template
      const { data: current, error: fetchError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      // Build update object
      const updateData: Record<string, unknown> = { updated_by: user?.id }

      if (updates.name) {
        updateData.name = updates.name
        updateData.slug = slugify(updates.name)
      }
      if (updates.category) updateData.category = updates.category
      if (updates.subject) updateData.subject = updates.subject
      if (updates.preview_text !== undefined) updateData.preview_text = updates.preview_text
      if (updates.from_name) updateData.from_name = updates.from_name
      if (updates.from_email) updateData.from_email = updates.from_email
      if (updates.reply_to !== undefined) updateData.reply_to = updates.reply_to
      if (updates.body_html) {
        updateData.body_html = updates.body_html
        updateData.body_text = updates.body_text || stripHtml(updates.body_html)
        updateData.variables_used = extractVariables(updates.body_html, updates.subject || current.subject)
      }
      if (updates.notes !== undefined) updateData.notes = updates.notes

      // Validate if body changed
      if (updates.body_html) {
        const category = (updates.category || current.category) as string
        const variablesUsed = updateData.variables_used as string[]
        const invalidVars = validateVariables(variablesUsed, category)
        if (invalidVars.length > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Unknown variables: ${invalidVars.join(', ')}`,
          })
        }

        if (category === 'marketing' && !updates.body_html.includes('{{unsubscribe_link}}')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Marketing emails require {{unsubscribe_link}}',
          })
        }
      }

      const { data, error } = await supabase
        .from('email_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // ============================================
  // ACTIVATE TEMPLATE
  // ============================================
  activate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Fetch template
      const { data: template, error: fetchError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !template) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      // Archive previous active version with same slug
      await supabase
        .from('email_templates')
        .update({ status: 'archived', archived_at: new Date().toISOString() })
        .eq('org_id', orgId)
        .eq('slug', template.slug)
        .eq('status', 'active')
        .neq('id', input.id)

      // Activate this version
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          status: 'active',
          version: template.version + 1,
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // ============================================
  // DISABLE TEMPLATE
  // ============================================
  disable: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data, error } = await supabase
        .from('email_templates')
        .update({ status: 'disabled', updated_by: user?.id })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // ============================================
  // DUPLICATE TEMPLATE
  // ============================================
  duplicate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Fetch source template
      const { data: source, error: fetchError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !source) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      // Generate unique name
      const newName = `${source.name} (Copy)`
      const newSlug = slugify(newName)

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          org_id: orgId,
          name: newName,
          slug: newSlug,
          category: source.category,
          subject: source.subject,
          preview_text: source.preview_text,
          from_name: source.from_name,
          from_email: source.from_email,
          reply_to: source.reply_to,
          body_html: source.body_html,
          body_text: source.body_text,
          variables_used: source.variables_used,
          notes: source.notes,
          status: 'draft',
          version: 1,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data
    }),

  // ============================================
  // DELETE TEMPLATE (SOFT DELETE)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { error } = await supabase
        .from('email_templates')
        .update({ deleted_at: new Date().toISOString(), updated_by: user?.id })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ============================================
  // GET VERSION HISTORY
  // ============================================
  getVersionHistory: orgProtectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, version, status, updated_at, updated_by')
        .eq('org_id', orgId)
        .eq('slug', input.slug)
        .order('version', { ascending: false })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data || []
    }),

  // ============================================
  // PREVIEW TEMPLATE WITH SAMPLE DATA
  // ============================================
  preview: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      sampleData: z.record(z.string()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: template, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !template) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      // Default sample data
      const defaultSampleData: Record<string, string> = {
        first_name: 'Sarah',
        last_name: 'Chen',
        full_name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        job_title: 'Senior Recruiter',
        department: 'Recruiting',
        pod_name: 'Alpha Pod',
        company_name: 'InTime Staffing',
        company_domain: 'intime.com',
        company_address: '123 Main Street, San Francisco, CA',
        company_phone: '(555) 123-4567',
        logo_url: 'https://app.intime.com/logo.png',
        start_date: 'Monday, December 18, 2024',
        start_date_short: '12/18/2024',
        manager_name: 'Mike Rodriguez',
        manager_email: 'mike@intime.com',
        hr_email: 'hr@intime.com',
        password_setup_link: 'https://app.intime.com/setup/abc123',
        login_link: 'https://app.intime.com/login',
        profile_link: 'https://app.intime.com/profile',
        onboarding_link: 'https://app.intime.com/onboarding',
        unsubscribe_link: 'https://app.intime.com/unsubscribe/xyz',
        preferences_link: 'https://app.intime.com/preferences',
        candidate_name: 'John Smith',
        candidate_email: 'john.smith@email.com',
        candidate_phone: '(555) 987-6543',
        job_title: 'Senior Software Engineer',
        job_location: 'San Francisco, CA',
        job_bill_rate: '$150/hour',
        job_description: 'Full-stack development role...',
        submission_status: 'Submitted to Client',
        submission_date: 'December 10, 2024',
        interview_date: 'December 15, 2024',
        interview_time: '2:00 PM PST',
        interview_location: 'Video Call (Zoom)',
        interviewer_name: 'Jane Doe',
        placement_start_date: 'January 2, 2025',
        placement_end_date: 'December 31, 2025',
        placement_rate: '$140/hour',
        current_date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
        current_year: new Date().getFullYear().toString(),
        current_time: new Date().toLocaleTimeString('en-US', { timeStyle: 'short' }),
        sender_name: 'Admin User',
        sender_email: 'admin@intime.com',
      }

      const sampleData = { ...defaultSampleData, ...input.sampleData }

      const renderedSubject = renderTemplate(template.subject, sampleData)
      const renderedHtml = renderTemplate(template.body_html, sampleData)
      const renderedText = renderTemplate(template.body_text || '', sampleData)

      return {
        subject: renderedSubject,
        body_html: renderedHtml,
        body_text: renderedText,
        from_name: renderTemplate(template.from_name, sampleData),
        from_email: renderTemplate(template.from_email, sampleData),
        sampleData,
      }
    }),

  // ============================================
  // SEND TEST EMAIL
  // ============================================
  sendTest: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      recipients: z.array(z.string().email()).min(1).max(5),
      sampleData: z.record(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Fetch template
      const { data: template, error: fetchError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !template) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      // Get org settings for sender
      const { data: settings } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['email_from_address', 'email_from_name'])

      const fromAddress = settings?.find(s => s.key === 'email_from_address')?.value?.replace(/"/g, '') || 'noreply@intime.io'
      const fromName = settings?.find(s => s.key === 'email_from_name')?.value?.replace(/"/g, '') || 'InTime Platform'

      // Default sample data
      const sampleData: Record<string, string> = {
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        email: 'test@example.com',
        company_name: 'InTime Staffing',
        company_domain: 'intime.com',
        current_date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
        current_year: new Date().getFullYear().toString(),
        ...input.sampleData,
      }

      // Render template
      const subject = `[TEST] ${renderTemplate(template.subject, sampleData)}`
      const html = renderTemplate(template.body_html, sampleData)

      // Send via Resend
      if (!resend) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Email service not configured. Set RESEND_API_KEY to enable.' })
      }
      const results = await Promise.all(
        input.recipients.map(async (to) => {
          try {
            const { data, error } = await resend.emails.send({
              from: `${fromName} <${fromAddress}>`,
              to,
              subject,
              html,
            })

            // Log send
            await supabase.from('email_sends').insert({
              org_id: orgId,
              template_id: template.id,
              recipient_email: to,
              subject,
              from_email: fromAddress,
              from_name: fromName,
              status: error ? 'failed' : 'sent',
              resend_id: data?.id,
              variables_data: sampleData,
              sent_at: new Date().toISOString(),
              error_message: error?.message,
              triggered_by: 'test',
              created_by: user?.id,
            })

            return { to, success: !error, messageId: data?.id, error: error?.message }
          } catch (err) {
            return { to, success: false, error: err instanceof Error ? err.message : 'Unknown error' }
          }
        })
      )

      return {
        results,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
      }
    }),

  // ============================================
  // GET AVAILABLE VARIABLES
  // ============================================
  getVariables: orgProtectedProcedure
    .query(() => TEMPLATE_VARIABLES),
})

export default emailTemplatesRouter
