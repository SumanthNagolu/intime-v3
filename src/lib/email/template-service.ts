import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// ============================================
// SERVICE CONFIGURATION
// ============================================
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// TYPES
// ============================================
export interface TemplateContext {
  // User
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  user_title?: string
  department?: string
  pod_name?: string

  // Company
  company_name?: string
  company_domain?: string
  company_address?: string
  company_phone?: string
  logo_url?: string

  // Employment
  start_date?: string
  start_date_short?: string
  manager_name?: string
  manager_email?: string
  hr_email?: string

  // Links
  password_setup_link?: string
  login_link?: string
  profile_link?: string
  onboarding_link?: string
  unsubscribe_link?: string
  preferences_link?: string

  // Candidate
  candidate_name?: string
  candidate_email?: string
  candidate_phone?: string

  // Job
  job_title?: string
  job_location?: string
  job_bill_rate?: string
  job_description?: string

  // Submission
  submission_status?: string
  submission_date?: string

  // Interview
  interview_date?: string
  interview_time?: string
  interview_location?: string
  interviewer_name?: string

  // Placement
  placement_start_date?: string
  placement_end_date?: string
  placement_rate?: string

  // System
  current_date?: string
  current_year?: string
  current_time?: string
  sender_name?: string
  sender_email?: string

  // Allow custom variables
  [key: string]: string | undefined
}

export interface SendTemplatedEmailParams {
  templateSlug: string
  orgId: string
  to: string
  toName?: string
  context: TemplateContext
  entityType?: string
  entityId?: string
  triggeredBy?: 'workflow' | 'manual' | 'system' | 'test'
  userId?: string
}

export interface SendTemplatedEmailResult {
  success: boolean
  messageId?: string
  error?: string
  sendId?: string
}

// ============================================
// HELPER: RENDER TEMPLATE
// ============================================
export function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] ?? match
  })
}

// ============================================
// MAIN: SEND TEMPLATED EMAIL
// ============================================
export async function sendTemplatedEmail(
  params: SendTemplatedEmailParams
): Promise<SendTemplatedEmailResult> {
  const {
    templateSlug,
    orgId,
    to,
    toName,
    context,
    entityType,
    entityId,
    triggeredBy = 'system',
    userId,
  } = params

  const db = getServiceClient()

  try {
    // Fetch active template
    const { data: template, error: templateError } = await db
      .from('email_templates')
      .select('*')
      .eq('org_id', orgId)
      .eq('slug', templateSlug)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single()

    if (templateError || !template) {
      console.error('Template not found:', templateSlug)
      return {
        success: false,
        error: `Template not found: ${templateSlug}`,
      }
    }

    // Add system variables
    const fullContext: TemplateContext = {
      ...context,
      current_date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
      current_year: new Date().getFullYear().toString(),
      current_time: new Date().toLocaleTimeString('en-US', { timeStyle: 'short' }),
    }

    // Render template
    const subject = renderTemplate(template.subject, fullContext)
    const html = renderTemplate(template.body_html, fullContext)
    const fromName = renderTemplate(template.from_name, fullContext)
    const fromEmail = renderTemplate(template.from_email, fullContext)

    // Get org settings for domain verification
    const { data: settings } = await db
      .from('system_settings')
      .select('key, value')
      .eq('org_id', orgId)
      .in('key', ['email_from_address', 'email_from_name'])

    const actualFromAddress = settings?.find(s => s.key === 'email_from_address')?.value?.replace(/"/g, '') || fromEmail
    const actualFromName = settings?.find(s => s.key === 'email_from_name')?.value?.replace(/"/g, '') || fromName

    // Send via Resend
    if (!resend) {
      console.warn('Resend not configured - skipping templated email')
      return { success: false, error: 'Email service not configured' }
    }
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `${actualFromName} <${actualFromAddress}>`,
      to,
      subject,
      html,
      replyTo: template.reply_to ? renderTemplate(template.reply_to, fullContext) : undefined,
    })

    // Log to email_sends (legacy)
    const { data: sendLog } = await db
      .from('email_sends')
      .insert({
        org_id: orgId,
        template_id: template.id,
        recipient_email: to,
        recipient_name: toName,
        subject,
        from_email: actualFromAddress,
        from_name: actualFromName,
        status: resendError ? 'failed' : 'sent',
        resend_id: resendData?.id,
        variables_data: fullContext,
        sent_at: new Date().toISOString(),
        error_message: resendError?.message,
        entity_type: entityType,
        entity_id: entityId,
        triggered_by: triggeredBy,
        created_by: userId,
      })
      .select('id')
      .single()

    // Log to unified communications table (fire-and-forget)
    void db.from('communications').insert({
      org_id: orgId,
      channel: 'email',
      direction: 'outbound',
      from_address: actualFromAddress,
      from_name: actualFromName,
      to_address: to,
      to_name: toName,
      subject,
      body_html: html,
      preview: html.replace(/<[^>]*>/g, '').substring(0, 200),
      entity_type: entityType,
      entity_id: entityId,
      provider: 'resend',
      provider_message_id: resendData?.id,
      status: resendError ? 'failed' : 'sent',
      sent_at: resendError ? null : new Date().toISOString(),
      failed_at: resendError ? new Date().toISOString() : null,
      error_message: resendError?.message,
      template_id: template.id,
      template_name: template.name,
      template_variables: fullContext,
      created_by: userId,
    }).then(({ error }) => {
      if (error) {
        console.error('[Communications] Failed to log email:', error)
      } else {
        console.log('[Communications] Email logged to unified table')
      }
    })

    if (resendError) {
      console.error('Failed to send email:', resendError)
      return {
        success: false,
        error: resendError.message,
        sendId: sendLog?.id,
      }
    }

    return {
      success: true,
      messageId: resendData?.id,
      sendId: sendLog?.id,
    }
  } catch (err) {
    console.error('Email send error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

// ============================================
// HELPER: GET AVAILABLE TEMPLATES
// ============================================
export async function getAvailableTemplates(orgId: string, category?: string) {
  const db = getServiceClient()

  let query = db
    .from('email_templates')
    .select('id, name, slug, category, subject')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return data || []
}

// ============================================
// HELPER: GET TEMPLATE BY SLUG
// ============================================
export async function getTemplateBySlug(orgId: string, slug: string) {
  const db = getServiceClient()

  const { data, error } = await db
    .from('email_templates')
    .select('*')
    .eq('org_id', orgId)
    .eq('slug', slug)
    .eq('status', 'active')
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching template:', error)
    return null
  }

  return data
}

// ============================================
// HELPER: SEND BULK TEMPLATED EMAILS
// ============================================
export async function sendBulkTemplatedEmails(
  templateSlug: string,
  orgId: string,
  recipients: Array<{ email: string; name?: string; context?: TemplateContext }>,
  baseContext: TemplateContext,
  triggeredBy: 'workflow' | 'manual' | 'system' = 'system',
  userId?: string
): Promise<{ successful: number; failed: number; errors: string[] }> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const recipient of recipients) {
    const result = await sendTemplatedEmail({
      templateSlug,
      orgId,
      to: recipient.email,
      toName: recipient.name,
      context: { ...baseContext, ...recipient.context },
      triggeredBy,
      userId,
    })

    if (result.success) {
      results.successful++
    } else {
      results.failed++
      results.errors.push(`${recipient.email}: ${result.error}`)
    }
  }

  return results
}
