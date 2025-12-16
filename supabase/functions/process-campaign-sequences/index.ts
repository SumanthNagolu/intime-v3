/**
 * Process Campaign Sequences Edge Function
 *
 * This function is triggered by a cron job (every minute) to process
 * campaign enrollments that are due for their next sequence step.
 *
 * It handles:
 * - Finding due enrollments (next_step_at <= NOW())
 * - Checking send windows (business hours)
 * - Executing steps (email, linkedin, phone, sms, task)
 * - Updating enrollment progress
 * - Tracking stats via RPC functions
 *
 * Deployment:
 * 1. supabase secrets set RESEND_API_KEY=re_xxxxx
 * 2. supabase functions deploy process-campaign-sequences
 * 3. Set up cron: * * * * * (every minute)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================
// CORS HEADERS
// ============================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// TYPES
// ============================================
interface DueEnrollment {
  id: string
  org_id: string
  campaign_id: string
  contact_id: string
  current_step: number
  status: string
  sequence_status: string
  error_count: number
  ab_variant: string | null
  // Campaign data
  campaign_name: string
  campaign_status: string
  send_window_start: string
  send_window_end: string
  send_days: string[]
  timezone: string
  // Sequence data
  sequence_template_id: string
  sequence_steps: SequenceStep[]
  // Contact data
  contact_first_name: string
  contact_last_name: string
  contact_email: string
  contact_phone: string
  contact_company_name: string
}

interface SequenceStep {
  day: number
  action: string
  subject?: string
  body?: string
  templateId?: string
  delay_hours?: number
  delay_minutes?: number
  ab_variants?: Array<{
    id: string
    subject: string
    body: string
    weight: number
  }>
  skip_conditions?: Array<{
    field: string
    operator: string
    value: unknown
  }>
  stop_on_reply?: boolean
  task_config?: {
    title?: string
    description?: string
    priority?: string
    due_hours?: number
  }
}

interface TemplateContext {
  first_name: string
  last_name: string
  full_name: string
  email: string
  company: string
  campaign_name: string
  [key: string]: string
}

interface ProcessResult {
  enrollmentId: string
  status: 'success' | 'skipped' | 'error'
  action?: string
  error?: string
}

// ============================================
// CONSTANTS
// ============================================
const MAX_CONSECUTIVE_ERRORS = 3
const BATCH_SIZE = 100
const DEFAULT_FROM_EMAIL = 'noreply@intime.app'
const DEFAULT_FROM_NAME = 'InTime'

// ============================================
// MAIN HANDLER
// ============================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const now = new Date()
    const results: ProcessResult[] = []

    // ============================================
    // 1. QUERY DUE ENROLLMENTS
    // ============================================
    const { data: enrollments, error: queryError } = await supabase
      .rpc('get_due_campaign_enrollments', { batch_limit: BATCH_SIZE })

    if (queryError) {
      // If RPC doesn't exist, fall back to direct query
      console.log('RPC not found, using direct query')
      const { data: directEnrollments, error: directError } = await getDueEnrollmentsDirect(supabase)

      if (directError) {
        throw new Error(`Failed to fetch due enrollments: ${directError}`)
      }

      if (!directEnrollments || directEnrollments.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'No due enrollments found',
            processed: 0,
            timestamp: now.toISOString(),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Process each enrollment
      for (const enrollment of directEnrollments as DueEnrollment[]) {
        const result = await processEnrollment(supabase, enrollment, now)
        results.push(result)
      }
    } else {
      if (!enrollments || enrollments.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'No due enrollments found',
            processed: 0,
            timestamp: now.toISOString(),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Process each enrollment
      for (const enrollment of enrollments as DueEnrollment[]) {
        const result = await processEnrollment(supabase, enrollment, now)
        results.push(result)
      }
    }

    // ============================================
    // 4. RETURN RESULTS
    // ============================================
    const successful = results.filter(r => r.status === 'success')
    const skipped = results.filter(r => r.status === 'skipped')
    const errors = results.filter(r => r.status === 'error')

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successful: successful.length,
        skipped: skipped.length,
        errors: errors.length,
        results,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Campaign sequence processing error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================
// DIRECT QUERY (Fallback if RPC doesn't exist)
// ============================================
async function getDueEnrollmentsDirect(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('campaign_enrollments')
    .select(`
      id,
      org_id,
      campaign_id,
      contact_id,
      current_step,
      status,
      sequence_status,
      error_count,
      ab_variant,
      campaigns!inner (
        id,
        name,
        status,
        send_window_start,
        send_window_end,
        send_days,
        timezone
      ),
      contacts!inner (
        id,
        first_name,
        last_name,
        email,
        phone,
        company_name
      )
    `)
    .in('status', ['enrolled', 'contacted', 'engaged'])
    .not('next_step_at', 'is', null)
    .lte('next_step_at', new Date().toISOString())
    .eq('campaigns.status', 'active')
    .is('campaigns.deleted_at', null)
    .order('next_step_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    return { data: null, error: error.message }
  }

  // Transform the data to match expected structure
  const transformedData = await Promise.all(
    (data || []).map(async (enrollment: Record<string, unknown>) => {
      // Get sequence for this campaign
      const campaign = enrollment.campaigns as Record<string, unknown>
      const contact = enrollment.contacts as Record<string, unknown>

      const { data: sequenceData } = await supabase
        .from('campaign_sequences')
        .select(`
          sequence_template_id,
          sequence_templates!inner (
            steps
          )
        `)
        .eq('campaign_id', enrollment.campaign_id)
        .eq('is_active', true)
        .limit(1)
        .single()

      const sequenceTemplate = sequenceData?.sequence_templates as Record<string, unknown> | null

      return {
        id: enrollment.id,
        org_id: enrollment.org_id,
        campaign_id: enrollment.campaign_id,
        contact_id: enrollment.contact_id,
        current_step: enrollment.current_step,
        status: enrollment.status,
        sequence_status: enrollment.sequence_status,
        error_count: enrollment.error_count || 0,
        ab_variant: enrollment.ab_variant,
        campaign_name: campaign?.name,
        campaign_status: campaign?.status,
        send_window_start: campaign?.send_window_start || '09:00',
        send_window_end: campaign?.send_window_end || '17:00',
        send_days: campaign?.send_days || ['mon', 'tue', 'wed', 'thu', 'fri'],
        timezone: campaign?.timezone || 'America/New_York',
        sequence_template_id: sequenceData?.sequence_template_id,
        sequence_steps: sequenceTemplate?.steps || [],
        contact_first_name: contact?.first_name,
        contact_last_name: contact?.last_name,
        contact_email: contact?.email,
        contact_phone: contact?.phone,
        contact_company_name: contact?.company_name,
      } as DueEnrollment
    })
  )

  return { data: transformedData, error: null }
}

// ============================================
// PROCESS SINGLE ENROLLMENT
// ============================================
async function processEnrollment(
  supabase: SupabaseClient,
  enrollment: DueEnrollment,
  now: Date
): Promise<ProcessResult> {
  try {
    // ============================================
    // 2. CHECK SEND WINDOW
    // ============================================
    if (!isWithinSendWindow(enrollment, now)) {
      return {
        enrollmentId: enrollment.id,
        status: 'skipped',
        error: 'Outside send window',
      }
    }

    // ============================================
    // 3. GET CURRENT STEP
    // ============================================
    const steps = enrollment.sequence_steps
    const currentStepIndex = enrollment.current_step || 0

    if (!steps || currentStepIndex >= steps.length) {
      // Sequence complete
      await markSequenceComplete(supabase, enrollment.id)
      return {
        enrollmentId: enrollment.id,
        status: 'success',
        action: 'sequence_complete',
      }
    }

    const currentStep = steps[currentStepIndex]

    // ============================================
    // 4. CHECK SKIP CONDITIONS
    // ============================================
    if (currentStep.skip_conditions && currentStep.skip_conditions.length > 0) {
      const shouldSkip = await evaluateSkipConditions(
        supabase,
        enrollment,
        currentStep.skip_conditions
      )
      if (shouldSkip) {
        await advanceToNextStep(supabase, enrollment, steps, currentStepIndex, now)
        return {
          enrollmentId: enrollment.id,
          status: 'skipped',
          action: currentStep.action,
          error: 'Skip conditions met',
        }
      }
    }

    // ============================================
    // 5. EXECUTE STEP
    // ============================================
    const context = buildTemplateContext(enrollment)

    switch (currentStep.action) {
      case 'email':
        await executeEmailStep(supabase, enrollment, currentStep, context)
        break
      case 'linkedin':
      case 'phone':
      case 'call':
      case 'sms':
      case 'task':
        await executeTaskStep(supabase, enrollment, currentStep, context)
        break
      case 'wait':
        // No action needed, just advance
        break
      default:
        console.warn(`Unknown step action: ${currentStep.action}`)
    }

    // ============================================
    // 6. UPDATE PROGRESS
    // ============================================
    await advanceToNextStep(supabase, enrollment, steps, currentStepIndex, now)

    // ============================================
    // 7. LOG EXECUTION
    // ============================================
    await logSequenceExecution(supabase, enrollment, currentStep, currentStepIndex, 'sent')

    // ============================================
    // 8. UPDATE STATS
    // ============================================
    await updateStats(supabase, enrollment, currentStep)

    return {
      enrollmentId: enrollment.id,
      status: 'success',
      action: currentStep.action,
    }
  } catch (error) {
    console.error(`Error processing enrollment ${enrollment.id}:`, error)

    // Handle error
    await handleStepError(
      supabase,
      enrollment.id,
      error instanceof Error ? error : new Error('Unknown error')
    )

    // Log failed execution
    const steps = enrollment.sequence_steps
    const currentStepIndex = enrollment.current_step || 0
    if (steps && steps[currentStepIndex]) {
      await logSequenceExecution(
        supabase,
        enrollment,
        steps[currentStepIndex],
        currentStepIndex,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    return {
      enrollmentId: enrollment.id,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// SEND WINDOW CHECK
// ============================================
function isWithinSendWindow(enrollment: DueEnrollment, now: Date): boolean {
  const tz = enrollment.timezone || 'America/New_York'

  try {
    // Get current time in campaign timezone
    const localTime = now.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })

    // Get current day
    const localDay = now
      .toLocaleDateString('en-US', {
        timeZone: tz,
        weekday: 'short',
      })
      .toLowerCase()

    // Check day of week
    const sendDays = enrollment.send_days || ['mon', 'tue', 'wed', 'thu', 'fri']
    if (!sendDays.includes(localDay)) {
      return false
    }

    // Check time window
    const start = enrollment.send_window_start || '09:00'
    const end = enrollment.send_window_end || '17:00'

    return localTime >= start && localTime <= end
  } catch {
    // If timezone parsing fails, allow sending
    return true
  }
}

// ============================================
// TEMPLATE CONTEXT
// ============================================
function buildTemplateContext(enrollment: DueEnrollment): TemplateContext {
  return {
    first_name: enrollment.contact_first_name || '',
    last_name: enrollment.contact_last_name || '',
    full_name: `${enrollment.contact_first_name || ''} ${enrollment.contact_last_name || ''}`.trim(),
    email: enrollment.contact_email || '',
    company: enrollment.contact_company_name || '',
    campaign_name: enrollment.campaign_name || '',
    // Dot notation alternatives
    'contact.first_name': enrollment.contact_first_name || '',
    'contact.last_name': enrollment.contact_last_name || '',
    'contact.email': enrollment.contact_email || '',
    'contact.phone': enrollment.contact_phone || '',
    'campaign.name': enrollment.campaign_name || '',
  }
}

function resolveVariables(template: string, context: TemplateContext): string {
  return template.replace(/\{\{(\w+(?:\.\w+)?)\}\}/g, (match, key) => {
    return context[key] ?? match
  })
}

// ============================================
// EMAIL STEP EXECUTOR
// ============================================
async function executeEmailStep(
  supabase: SupabaseClient,
  enrollment: DueEnrollment,
  step: SequenceStep,
  context: TemplateContext
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')

  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }

  if (!enrollment.contact_email) {
    throw new Error('Contact has no email address')
  }

  // Select A/B variant if configured
  let subject = step.subject || ''
  let body = step.body || ''

  if (step.ab_variants && step.ab_variants.length > 0) {
    const variant = selectABVariant(step.ab_variants, enrollment.ab_variant)
    subject = variant.subject
    body = variant.body

    // Store the variant assignment if first time
    if (!enrollment.ab_variant) {
      await supabase
        .from('campaign_enrollments')
        .update({ ab_variant: variant.id })
        .eq('id', enrollment.id)
    }
  }

  // Resolve template variables
  const resolvedSubject = resolveVariables(subject, context)
  const resolvedBody = resolveVariables(body, context)

  // Get org email settings
  const { data: settings } = await supabase
    .from('system_settings')
    .select('key, value')
    .eq('org_id', enrollment.org_id)
    .in('key', ['email_from_address', 'email_from_name'])

  const fromEmail =
    settings?.find(s => s.key === 'email_from_address')?.value?.replace(/"/g, '') ||
    DEFAULT_FROM_EMAIL
  const fromName =
    settings?.find(s => s.key === 'email_from_name')?.value?.replace(/"/g, '') || DEFAULT_FROM_NAME

  // Send via Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: enrollment.contact_email,
      subject: resolvedSubject,
      html: resolvedBody,
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Resend API error: ${response.status} - ${errorData}`)
  }

  const resendData = await response.json()

  // Log to email_sends table
  await supabase.from('email_sends').insert({
    org_id: enrollment.org_id,
    recipient_email: enrollment.contact_email,
    recipient_name: context.full_name,
    subject: resolvedSubject,
    from_email: fromEmail,
    from_name: fromName,
    status: 'sent',
    resend_id: resendData.id,
    variables_data: context,
    sent_at: new Date().toISOString(),
    entity_type: 'campaign_enrollment',
    entity_id: enrollment.id,
    triggered_by: 'workflow',
  })

  // Log to communications table
  await supabase.from('communications').insert({
    org_id: enrollment.org_id,
    channel: 'email',
    direction: 'outbound',
    from_address: fromEmail,
    from_name: fromName,
    to_address: enrollment.contact_email,
    to_name: context.full_name,
    subject: resolvedSubject,
    body_html: resolvedBody,
    preview: resolvedBody.replace(/<[^>]*>/g, '').substring(0, 200),
    entity_type: 'contact',
    entity_id: enrollment.contact_id,
    provider: 'resend',
    provider_message_id: resendData.id,
    status: 'sent',
    sent_at: new Date().toISOString(),
  })

  // Call RPC to increment email stats
  await supabase.rpc('increment_enrollment_emails_sent', {
    p_enrollment_id: enrollment.id,
    p_first_contact: enrollment.status === 'enrolled',
  })

  await supabase.rpc('increment_campaign_emails_sent', {
    p_campaign_id: enrollment.campaign_id,
  })
}

// ============================================
// TASK STEP EXECUTOR (LinkedIn, Phone, SMS, Task)
// ============================================
async function executeTaskStep(
  supabase: SupabaseClient,
  enrollment: DueEnrollment,
  step: SequenceStep,
  context: TemplateContext
): Promise<void> {
  const taskConfig = step.task_config || {}

  // Map action to activity type
  const activityTypeMap: Record<string, string> = {
    linkedin: 'linkedin_message',
    phone: 'call',
    call: 'call',
    sms: 'task',
    task: 'task',
  }

  const activityType = activityTypeMap[step.action] || 'task'

  // Build task title and description
  const title = resolveVariables(
    taskConfig.title || `${step.action}: ${context.full_name}`,
    context
  )
  const description = resolveVariables(
    taskConfig.description || step.body || '',
    context
  )

  // Calculate due date
  const dueHours = taskConfig.due_hours || 24
  const dueDate = new Date(Date.now() + dueHours * 60 * 60 * 1000)

  // Get campaign owner for assignment
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('created_by')
    .eq('id', enrollment.campaign_id)
    .single()

  // Create activity
  const { error: activityError } = await supabase.from('activities').insert({
    org_id: enrollment.org_id,
    entity_type: 'contact',
    entity_id: enrollment.contact_id,
    activity_type: activityType,
    subject: title,
    description: description,
    status: 'scheduled',
    priority: taskConfig.priority || 'normal',
    due_date: dueDate.toISOString(),
    assigned_to: campaign?.created_by,
    created_by: campaign?.created_by,
    metadata: {
      campaign_id: enrollment.campaign_id,
      campaign_name: enrollment.campaign_name,
      enrollment_id: enrollment.id,
      sequence_step: enrollment.current_step,
      step_action: step.action,
    },
  })

  if (activityError) {
    throw new Error(`Failed to create activity: ${activityError.message}`)
  }

  // Update stats based on action type
  if (step.action === 'linkedin') {
    await supabase.rpc('increment_enrollment_linkedin_sent', {
      p_enrollment_id: enrollment.id,
    })
  } else if (step.action === 'phone' || step.action === 'call') {
    await supabase.rpc('increment_enrollment_calls_made', {
      p_enrollment_id: enrollment.id,
    })
  } else if (step.action === 'sms') {
    await supabase.rpc('increment_enrollment_sms_sent', {
      p_enrollment_id: enrollment.id,
    })
  }
}

// ============================================
// A/B VARIANT SELECTION
// ============================================
function selectABVariant(
  variants: Array<{ id: string; subject: string; body: string; weight: number }>,
  existingVariant: string | null
): { id: string; subject: string; body: string } {
  // If already assigned, use same variant
  if (existingVariant) {
    const existing = variants.find(v => v.id === existingVariant)
    if (existing) return existing
  }

  // Weighted random selection
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
  let random = Math.random() * totalWeight

  for (const variant of variants) {
    random -= variant.weight
    if (random <= 0) {
      return variant
    }
  }

  // Fallback to first variant
  return variants[0]
}

// ============================================
// SKIP CONDITIONS
// ============================================
async function evaluateSkipConditions(
  supabase: SupabaseClient,
  enrollment: DueEnrollment,
  conditions: Array<{ field: string; operator: string; value: unknown }>
): Promise<boolean> {
  // Get enrollment with full data for condition checking
  const { data: fullEnrollment } = await supabase
    .from('campaign_enrollments')
    .select('*')
    .eq('id', enrollment.id)
    .single()

  if (!fullEnrollment) return false

  for (const condition of conditions) {
    const fieldValue = fullEnrollment[condition.field]

    switch (condition.operator) {
      case 'eq':
        if (fieldValue === condition.value) return true
        break
      case 'neq':
        if (fieldValue !== condition.value) return true
        break
      case 'is_null':
        if (fieldValue === null || fieldValue === undefined) return true
        break
      case 'is_not_null':
        if (fieldValue !== null && fieldValue !== undefined) return true
        break
      case 'gt':
        if (fieldValue > (condition.value as number)) return true
        break
      case 'gte':
        if (fieldValue >= (condition.value as number)) return true
        break
      case 'lt':
        if (fieldValue < (condition.value as number)) return true
        break
      case 'lte':
        if (fieldValue <= (condition.value as number)) return true
        break
    }
  }

  return false
}

// ============================================
// PROGRESS TRACKING
// ============================================
async function advanceToNextStep(
  supabase: SupabaseClient,
  enrollment: DueEnrollment,
  steps: SequenceStep[],
  currentStepIndex: number,
  now: Date
): Promise<void> {
  const nextStepIndex = currentStepIndex + 1
  const currentStep = steps[currentStepIndex]
  const nextStep = steps[nextStepIndex]

  if (!nextStep) {
    // Sequence complete
    await markSequenceComplete(supabase, enrollment.id)
    return
  }

  // Calculate next step time
  const nextStepAt = calculateNextStepAt(currentStep, nextStep, now)

  await supabase
    .from('campaign_enrollments')
    .update({
      current_step: nextStepIndex,
      steps_completed: nextStepIndex,
      last_step_at: now.toISOString(),
      next_step_at: nextStepAt?.toISOString() || null,
      error_count: 0, // Reset error count on success
      updated_at: now.toISOString(),
    })
    .eq('id', enrollment.id)
}

function calculateNextStepAt(
  currentStep: SequenceStep,
  nextStep: SequenceStep,
  now: Date
): Date | null {
  const dayDiff = nextStep.day - currentStep.day
  const delayMs =
    Math.max(0, dayDiff) * 24 * 60 * 60 * 1000 +
    (nextStep.delay_hours || 0) * 60 * 60 * 1000 +
    (nextStep.delay_minutes || 0) * 60 * 1000

  // Minimum 1 hour delay if nothing specified
  const actualDelayMs = delayMs || 60 * 60 * 1000

  return new Date(now.getTime() + actualDelayMs)
}

async function markSequenceComplete(supabase: SupabaseClient, enrollmentId: string): Promise<void> {
  await supabase
    .from('campaign_enrollments')
    .update({
      sequence_status: 'completed',
      next_step_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId)
}

// ============================================
// SEQUENCE LOGGING
// ============================================
async function logSequenceExecution(
  supabase: SupabaseClient,
  enrollment: DueEnrollment,
  step: SequenceStep,
  stepNumber: number,
  status: string,
  errorMessage?: string
): Promise<void> {
  await supabase.from('campaign_sequence_logs').insert({
    org_id: enrollment.org_id,
    campaign_id: enrollment.campaign_id,
    enrollment_id: enrollment.id,
    contact_id: enrollment.contact_id,
    sequence_id: enrollment.sequence_template_id,
    step_number: stepNumber,
    channel: step.action,
    status: status,
    scheduled_at: new Date().toISOString(),
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    ab_variant: enrollment.ab_variant,
    error_message: errorMessage,
  })
}

// ============================================
// STATS UPDATE
// ============================================
async function updateStats(
  supabase: SupabaseClient,
  enrollment: DueEnrollment,
  step: SequenceStep
): Promise<void> {
  // Update campaign total_sent
  if (step.action === 'email') {
    // Already handled by increment_campaign_emails_sent RPC
  }

  // Update prospects_contacted if first contact
  if (enrollment.status === 'enrolled') {
    await supabase.rpc('increment_campaign_prospects_contacted', {
      p_campaign_id: enrollment.campaign_id,
    }).catch(() => {
      // RPC might not exist, ignore
    })
  }
}

// ============================================
// ERROR HANDLING
// ============================================
async function handleStepError(
  supabase: SupabaseClient,
  enrollmentId: string,
  error: Error
): Promise<void> {
  // Increment error count
  const { data: enrollment } = await supabase
    .from('campaign_enrollments')
    .select('error_count')
    .eq('id', enrollmentId)
    .single()

  const newErrorCount = (enrollment?.error_count || 0) + 1

  if (newErrorCount >= MAX_CONSECUTIVE_ERRORS) {
    // Pause this enrollment
    await supabase
      .from('campaign_enrollments')
      .update({
        status: 'paused',
        sequence_status: 'paused',
        error_count: newErrorCount,
        last_error: error.message,
        last_error_at: new Date().toISOString(),
        stop_reason: `Paused after ${MAX_CONSECUTIVE_ERRORS} consecutive errors: ${error.message}`,
      })
      .eq('id', enrollmentId)
  } else {
    // Update error count, retry later (15 min)
    await supabase
      .from('campaign_enrollments')
      .update({
        error_count: newErrorCount,
        last_error: error.message,
        last_error_at: new Date().toISOString(),
        next_step_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      .eq('id', enrollmentId)
  }
}
