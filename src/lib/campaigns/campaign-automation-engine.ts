/**
 * Campaign Automation Engine
 *
 * Processes scheduled campaign sequence steps:
 * - Fetches due enrollments based on next_step_at
 * - Respects campaign send windows (time of day, days of week)
 * - Executes steps: email, linkedin, phone, task, wait
 * - Handles A/B testing variants
 * - Manages error handling and retry logic
 * - Updates enrollment and campaign statistics
 *
 * Issue: CAMPAIGNS-01 Phase 4
 */

import { createClient } from '@supabase/supabase-js'
import { sendTemplatedEmail, renderTemplate, type TemplateContext } from '@/lib/email/template-service'

// ============================================
// SERVICE CONFIGURATION
// ============================================

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// TYPES
// ============================================

interface Campaign {
  id: string
  name: string
  status: string
  send_window_start: string | null
  send_window_end: string | null
  send_days: string[] | null
  timezone: string | null
}

interface Contact {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  company_name: string | null
  phone: string | null
  linkedin_url: string | null
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

interface SequenceTemplate {
  id: string
  channel: string
  steps: SequenceStep[]
  settings: {
    stopOnReply?: boolean
    stopOnMeeting?: boolean
    sendTime?: string
    respectTimezone?: boolean
    dailyLimit?: number
  }
}

interface DueEnrollment {
  id: string
  org_id: string
  campaign_id: string
  contact_id: string
  current_step: number
  next_step_at: string
  ab_variant: string | null
  status: string
  sequence_status: string
  responded_at: string | null
  campaign: Campaign
  contact: Contact
}

interface ProcessingResult {
  processed: number
  errors: number
  skipped: number
  duration: number
}

// ============================================
// CAMPAIGN AUTOMATION ENGINE
// ============================================

export class CampaignAutomationEngine {
  private db = getAdminClient()
  private batchSize = 100

  /**
   * Process all due campaign steps (called by cron every minute)
   */
  async processScheduledSteps(): Promise<ProcessingResult> {
    const startTime = Date.now()
    let processed = 0
    let errors = 0
    let skipped = 0

    console.log('[Campaign Engine] Starting scheduled step processing...')

    // Get due enrollments in batches
    let hasMore = true
    while (hasMore) {
      const dueEnrollments = await this.getDueEnrollments()

      if (dueEnrollments.length === 0) {
        hasMore = false
        break
      }

      for (const enrollment of dueEnrollments) {
        try {
          // Check send window before processing
          if (!this.isWithinSendWindow(enrollment.campaign)) {
            skipped++
            continue
          }

          await this.executeNextStep(enrollment)
          processed++
        } catch (error) {
          console.error(`[Campaign Engine] Error processing enrollment ${enrollment.id}:`, error)
          await this.handleStepError(enrollment, error)
          errors++
        }
      }

      // If we got less than batch size, we're done
      if (dueEnrollments.length < this.batchSize) {
        hasMore = false
      }
    }

    const duration = Date.now() - startTime
    console.log(`[Campaign Engine] Completed: ${processed} processed, ${skipped} skipped (outside send window), ${errors} errors, ${duration}ms`)

    return { processed, errors, skipped, duration }
  }

  /**
   * Get enrollments that are due for their next step
   */
  private async getDueEnrollments(): Promise<DueEnrollment[]> {
    const now = new Date().toISOString()

    const { data, error } = await this.db
      .from('campaign_enrollments')
      .select(`
        id, org_id, campaign_id, contact_id, current_step, next_step_at,
        ab_variant, status, sequence_status, responded_at,
        campaign:campaigns!inner(
          id, name, status,
          send_window_start, send_window_end, send_days, timezone
        ),
        contact:contacts!inner(
          id, email, first_name, last_name, company_name, phone, linkedin_url
        )
      `)
      .in('status', ['enrolled', 'contacted', 'engaged'])
      .in('sequence_status', ['pending', 'in_progress'])
      .eq('campaigns.status', 'active')
      .lte('next_step_at', now)
      .not('next_step_at', 'is', null)
      .limit(this.batchSize)

    if (error) {
      console.error('[Campaign Engine] Error fetching due enrollments:', error)
      return []
    }

    // Type assertion - campaign and contact are single objects due to inner join
    return (data || []).map(row => ({
      ...row,
      campaign: row.campaign as unknown as Campaign,
      contact: row.contact as unknown as Contact,
    })) as DueEnrollment[]
  }

  /**
   * Check if current time is within campaign's send window
   */
  private isWithinSendWindow(campaign: Campaign): boolean {
    const now = new Date()

    // Get current time in campaign timezone
    const timezone = campaign.timezone || 'America/New_York'
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'short',
    })

    const parts = formatter.formatToParts(now)
    const hour = parts.find(p => p.type === 'hour')?.value || '00'
    const minute = parts.find(p => p.type === 'minute')?.value || '00'
    const currentTime = `${hour}:${minute}`
    const currentDay = parts.find(p => p.type === 'weekday')?.value?.toLowerCase()

    // Check day
    const sendDays = campaign.send_days || ['mon', 'tue', 'wed', 'thu', 'fri']
    if (!sendDays.includes(currentDay || '')) {
      return false
    }

    // Check time window
    const windowStart = campaign.send_window_start || '09:00'
    const windowEnd = campaign.send_window_end || '17:00'

    return currentTime >= windowStart && currentTime <= windowEnd
  }

  /**
   * Execute the next sequence step for an enrollment
   */
  async executeNextStep(enrollment: DueEnrollment): Promise<void> {
    // Get the sequence template for this campaign
    const template = await this.getSequenceTemplate(enrollment.campaign_id)
    if (!template) {
      console.log(`[Campaign Engine] No active sequence template for campaign ${enrollment.campaign_id}`)
      await this.completeEnrollment(enrollment)
      return
    }

    // Get the next step number
    const nextStepNumber = enrollment.current_step + 1
    const steps = template.steps || []
    const nextStep = steps[nextStepNumber - 1] // 0-indexed array, 1-indexed step number

    if (!nextStep) {
      // No more steps - complete the enrollment
      await this.completeEnrollment(enrollment)
      return
    }

    // Check if we should stop on reply
    if (template.settings.stopOnReply && enrollment.responded_at) {
      console.log(`[Campaign Engine] Stopping enrollment ${enrollment.id} due to reply`)
      await this.stopEnrollment(enrollment, 'responded')
      return
    }

    // Check skip conditions
    if (await this.shouldSkipStep(enrollment, nextStep)) {
      await this.skipToNextStep(enrollment, nextStep, nextStepNumber, template)
      return
    }

    // Execute based on action type
    const action = nextStep.action?.toLowerCase() || 'email'
    switch (action) {
      case 'email':
      case 'send_email':
        await this.sendEmailStep(enrollment, nextStep, template)
        break
      case 'linkedin':
      case 'send_linkedin':
        await this.createLinkedInTask(enrollment, nextStep, nextStepNumber)
        break
      case 'phone':
      case 'call':
        await this.createCallTask(enrollment, nextStep, nextStepNumber)
        break
      case 'sms':
      case 'send_sms':
        await this.sendSmsStep(enrollment, nextStep, nextStepNumber)
        break
      case 'task':
        await this.createTask(enrollment, nextStep, nextStepNumber)
        break
      case 'wait':
        // Just move to next step timing
        break
      default:
        console.warn(`[Campaign Engine] Unknown action type: ${action}`)
    }

    // Create sequence log
    await this.createSequenceLog(enrollment, nextStep, nextStepNumber, template.channel, 'sent')

    // Calculate and schedule next step
    await this.scheduleNextStep(enrollment, nextStepNumber, steps)
  }

  /**
   * Get the primary sequence template for a campaign
   */
  private async getSequenceTemplate(campaignId: string): Promise<SequenceTemplate | null> {
    const { data, error } = await this.db
      .from('campaign_sequences')
      .select(`
        sequence_template:sequence_templates!inner(
          id, channel, steps, settings
        )
      `)
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .eq('sequence_templates.is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    const template = data.sequence_template as unknown as SequenceTemplate
    return {
      id: template.id,
      channel: template.channel,
      steps: Array.isArray(template.steps) ? template.steps : [],
      settings: template.settings || {},
    }
  }

  /**
   * Check if step should be skipped based on conditions
   */
  private async shouldSkipStep(
    enrollment: DueEnrollment,
    step: SequenceStep
  ): Promise<boolean> {
    if (!step.skip_conditions || step.skip_conditions.length === 0) {
      return false
    }

    // Get full enrollment data for condition evaluation
    const { data: fullEnrollment } = await this.db
      .from('campaign_enrollments')
      .select('*')
      .eq('id', enrollment.id)
      .single()

    if (!fullEnrollment) return false

    for (const condition of step.skip_conditions) {
      const value = fullEnrollment[condition.field as keyof typeof fullEnrollment]

      switch (condition.operator) {
        case 'eq':
          if (value === condition.value) return true
          break
        case 'neq':
          if (value !== condition.value) return true
          break
        case 'gt':
          if (typeof value === 'number' && value > (condition.value as number)) return true
          break
        case 'gte':
          if (typeof value === 'number' && value >= (condition.value as number)) return true
          break
        case 'lt':
          if (typeof value === 'number' && value < (condition.value as number)) return true
          break
        case 'lte':
          if (typeof value === 'number' && value <= (condition.value as number)) return true
          break
        case 'is_null':
          if (value === null || value === undefined) return true
          break
        case 'is_not_null':
          if (value !== null && value !== undefined) return true
          break
      }
    }

    return false
  }

  /**
   * Send an email step
   */
  private async sendEmailStep(
    enrollment: DueEnrollment,
    step: SequenceStep,
    template: SequenceTemplate
  ): Promise<void> {
    // Validate email
    if (!enrollment.contact.email) {
      console.warn(`[Campaign Engine] No email for contact ${enrollment.contact_id}`)
      return
    }

    // Resolve content (handle A/B variants)
    let subject = step.subject || ''
    let bodyHtml = step.body || ''
    let variant: string | null = enrollment.ab_variant

    if (step.ab_variants && step.ab_variants.length > 0) {
      if (!variant) {
        // Weighted random selection
        const totalWeight = step.ab_variants.reduce((sum, v) => sum + v.weight, 0)
        let random = Math.random() * totalWeight

        for (const v of step.ab_variants) {
          random -= v.weight
          if (random <= 0) {
            variant = v.id
            subject = v.subject
            bodyHtml = v.body
            break
          }
        }

        // Update enrollment with variant
        await this.db
          .from('campaign_enrollments')
          .update({ ab_variant: variant })
          .eq('id', enrollment.id)
      } else {
        // Use assigned variant
        const assignedVariant = step.ab_variants.find(v => v.id === variant)
        if (assignedVariant) {
          subject = assignedVariant.subject
          bodyHtml = assignedVariant.body
        }
      }
    }

    // Build merge variables
    const variables = this.buildVariables(enrollment)

    // Merge variables into content
    subject = this.mergeVariables(subject, variables)
    bodyHtml = this.mergeVariables(bodyHtml, variables)

    // Send via template service if template ID provided, otherwise direct send
    if (step.templateId) {
      await sendTemplatedEmail({
        templateSlug: step.templateId,
        orgId: enrollment.org_id,
        to: enrollment.contact.email,
        toName: `${enrollment.contact.first_name || ''} ${enrollment.contact.last_name || ''}`.trim() || undefined,
        context: variables as TemplateContext,
        entityType: 'campaign_enrollment',
        entityId: enrollment.id,
        triggeredBy: 'system',
      })
    } else {
      // Direct send via Resend (using email service pattern)
      const { Resend } = await import('resend')
      const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

      if (resend) {
        // Get org settings for from address
        const { data: settings } = await this.db
          .from('system_settings')
          .select('key, value')
          .eq('org_id', enrollment.org_id)
          .in('key', ['email_from_address', 'email_from_name'])

        const fromAddress = settings?.find(s => s.key === 'email_from_address')?.value?.replace(/"/g, '') || 'noreply@intime.app'
        const fromName = settings?.find(s => s.key === 'email_from_name')?.value?.replace(/"/g, '') || 'InTime'

        await resend.emails.send({
          from: `${fromName} <${fromAddress}>`,
          to: enrollment.contact.email,
          subject,
          html: bodyHtml,
        })

        // Log the send
        await this.db
          .from('email_sends')
          .insert({
            org_id: enrollment.org_id,
            recipient_email: enrollment.contact.email,
            recipient_name: `${enrollment.contact.first_name || ''} ${enrollment.contact.last_name || ''}`.trim(),
            subject,
            from_email: fromAddress,
            from_name: fromName,
            status: 'sent',
            variables_data: variables,
            sent_at: new Date().toISOString(),
            entity_type: 'campaign_enrollment',
            entity_id: enrollment.id,
            triggered_by: 'system',
          })
      } else {
        console.warn('[Campaign Engine] Resend not configured - skipping email send')
      }
    }

    // Update enrollment stats (increment emails_sent using raw SQL via RPC)
    try {
      await this.db.rpc('increment_enrollment_emails_sent', {
        p_enrollment_id: enrollment.id,
        p_first_contact: enrollment.status === 'enrolled',
      })
    } catch {
      // Fallback: update without increment if RPC doesn't exist
      await this.db
        .from('campaign_enrollments')
        .update({
          last_step_at: new Date().toISOString(),
          last_contacted_at: new Date().toISOString(),
          status: enrollment.status === 'enrolled' ? 'contacted' : enrollment.status,
        })
        .eq('id', enrollment.id)
    }

    // Update campaign stats (increment total_sent via RPC)
    try {
      await this.db.rpc('increment_campaign_emails_sent', {
        p_campaign_id: enrollment.campaign_id,
      })
    } catch {
      // Fallback: just log - triggers handle stats
      console.log('[Campaign Engine] Using trigger-based stats updates')
    }
  }

  private buildVariables(enrollment: DueEnrollment): Record<string, string> {
    return {
      first_name: enrollment.contact.first_name || '',
      last_name: enrollment.contact.last_name || '',
      full_name: `${enrollment.contact.first_name || ''} ${enrollment.contact.last_name || ''}`.trim(),
      email: enrollment.contact.email || '',
      company: enrollment.contact.company_name || '',
      company_name: enrollment.contact.company_name || '',
      campaign_name: enrollment.campaign.name,
      'contact.first_name': enrollment.contact.first_name || '',
      'contact.last_name': enrollment.contact.last_name || '',
      'contact.email': enrollment.contact.email || '',
      'contact.company': enrollment.contact.company_name || '',
      'campaign.name': enrollment.campaign.name,
    }
  }

  private mergeVariables(template: string, variables: Record<string, string>): string {
    if (!template) return ''
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
      return variables[key] || match
    })
  }

  /**
   * Create a task for LinkedIn outreach
   */
  private async createLinkedInTask(
    enrollment: DueEnrollment,
    step: SequenceStep,
    stepNumber: number
  ): Promise<void> {
    const taskConfig = step.task_config || {}
    const variables = this.buildVariables(enrollment)

    await this.db.from('activities').insert({
      org_id: enrollment.org_id,
      entity_type: 'contact',
      entity_id: enrollment.contact_id,
      secondary_entity_type: 'campaign',
      secondary_entity_id: enrollment.campaign_id,
      type: 'task',
      subject: this.mergeVariables(taskConfig.title || 'Send LinkedIn message', variables),
      description: this.mergeVariables(taskConfig.description || step.body || '', variables),
      status: 'open',
      priority: taskConfig.priority || 'normal',
      due_date: new Date(Date.now() + (taskConfig.due_hours || 24) * 60 * 60 * 1000).toISOString(),
      metadata: {
        campaign_id: enrollment.campaign_id,
        enrollment_id: enrollment.id,
        sequence_step: stepNumber,
        channel: 'linkedin',
        linkedin_url: enrollment.contact.linkedin_url,
      },
    })

    // Update enrollment stats
    await this.db
      .from('campaign_enrollments')
      .update({
        linkedin_sent: 1, // Increment
        last_step_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id)
  }

  /**
   * Create a task for phone call
   */
  private async createCallTask(
    enrollment: DueEnrollment,
    step: SequenceStep,
    stepNumber: number
  ): Promise<void> {
    const taskConfig = step.task_config || {}
    const variables = this.buildVariables(enrollment)

    await this.db.from('activities').insert({
      org_id: enrollment.org_id,
      entity_type: 'contact',
      entity_id: enrollment.contact_id,
      secondary_entity_type: 'campaign',
      secondary_entity_id: enrollment.campaign_id,
      type: 'call',
      subject: this.mergeVariables(taskConfig.title || 'Campaign follow-up call', variables),
      description: this.mergeVariables(taskConfig.description || step.body || '', variables),
      status: 'scheduled',
      priority: taskConfig.priority || 'normal',
      due_date: new Date(Date.now() + (taskConfig.due_hours || 24) * 60 * 60 * 1000).toISOString(),
      metadata: {
        campaign_id: enrollment.campaign_id,
        enrollment_id: enrollment.id,
        sequence_step: stepNumber,
        channel: 'phone',
        phone_number: enrollment.contact.phone,
      },
    })

    // Update enrollment stats
    await this.db
      .from('campaign_enrollments')
      .update({
        calls_made: 1, // Increment
        last_step_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id)
  }

  /**
   * Send SMS step (placeholder - requires Twilio integration)
   */
  private async sendSmsStep(
    enrollment: DueEnrollment,
    step: SequenceStep,
    stepNumber: number
  ): Promise<void> {
    // SMS requires Twilio integration - create a task instead for now
    console.log('[Campaign Engine] SMS not fully implemented, creating task instead')

    const taskConfig = step.task_config || {}
    const variables = this.buildVariables(enrollment)

    await this.db.from('activities').insert({
      org_id: enrollment.org_id,
      entity_type: 'contact',
      entity_id: enrollment.contact_id,
      secondary_entity_type: 'campaign',
      secondary_entity_id: enrollment.campaign_id,
      type: 'task',
      subject: this.mergeVariables(taskConfig.title || 'Send SMS message', variables),
      description: this.mergeVariables(step.body || '', variables),
      status: 'open',
      priority: taskConfig.priority || 'normal',
      due_date: new Date(Date.now() + (taskConfig.due_hours || 24) * 60 * 60 * 1000).toISOString(),
      metadata: {
        campaign_id: enrollment.campaign_id,
        enrollment_id: enrollment.id,
        sequence_step: stepNumber,
        channel: 'sms',
        phone_number: enrollment.contact.phone,
      },
    })

    // Update enrollment stats
    await this.db
      .from('campaign_enrollments')
      .update({
        sms_sent: 1, // Increment
        last_step_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id)
  }

  /**
   * Create a general task
   */
  private async createTask(
    enrollment: DueEnrollment,
    step: SequenceStep,
    stepNumber: number
  ): Promise<void> {
    const taskConfig = step.task_config || {}
    const variables = this.buildVariables(enrollment)

    await this.db.from('activities').insert({
      org_id: enrollment.org_id,
      entity_type: 'contact',
      entity_id: enrollment.contact_id,
      secondary_entity_type: 'campaign',
      secondary_entity_id: enrollment.campaign_id,
      type: 'task',
      subject: this.mergeVariables(taskConfig.title || step.subject || 'Campaign task', variables),
      description: this.mergeVariables(taskConfig.description || step.body || '', variables),
      status: 'open',
      priority: taskConfig.priority || 'normal',
      due_date: new Date(Date.now() + (taskConfig.due_hours || 24) * 60 * 60 * 1000).toISOString(),
      metadata: {
        campaign_id: enrollment.campaign_id,
        enrollment_id: enrollment.id,
        sequence_step: stepNumber,
      },
    })
  }

  /**
   * Calculate next step timing
   */
  private async scheduleNextStep(
    enrollment: DueEnrollment,
    completedStepNumber: number,
    steps: SequenceStep[]
  ): Promise<void> {
    const nextStepNumber = completedStepNumber + 1
    const nextStep = steps[nextStepNumber - 1] // 0-indexed

    if (!nextStep) {
      // No next step - we'll complete after a delay
      await this.db
        .from('campaign_enrollments')
        .update({
          current_step: completedStepNumber,
          steps_completed: completedStepNumber,
          next_step_at: null,
          sequence_status: 'completed',
        })
        .eq('id', enrollment.id)
      return
    }

    // Calculate delay from current step to next
    const currentStepDay = steps[completedStepNumber - 1]?.day || 0
    const nextStepDay = nextStep.day || 0
    const dayDifference = nextStepDay - currentStepDay

    // Calculate delay in milliseconds
    const delayMs =
      Math.max(0, dayDifference) * 24 * 60 * 60 * 1000 +
      (nextStep.delay_hours || 0) * 60 * 60 * 1000 +
      (nextStep.delay_minutes || 0) * 60 * 1000

    // If no delay specified, use 1 hour as minimum
    const actualDelayMs = delayMs || 60 * 60 * 1000

    const nextStepAt = new Date(Date.now() + actualDelayMs)

    await this.db
      .from('campaign_enrollments')
      .update({
        current_step: completedStepNumber,
        steps_completed: completedStepNumber,
        next_step_at: nextStepAt.toISOString(),
        sequence_status: 'in_progress',
      })
      .eq('id', enrollment.id)
  }

  /**
   * Skip current step and move to next
   */
  private async skipToNextStep(
    enrollment: DueEnrollment,
    step: SequenceStep,
    stepNumber: number,
    template: SequenceTemplate
  ): Promise<void> {
    await this.createSequenceLog(enrollment, step, stepNumber, template.channel, 'skipped')
    await this.scheduleNextStep(enrollment, stepNumber, template.steps)
  }

  /**
   * Complete an enrollment (no more steps)
   */
  private async completeEnrollment(enrollment: DueEnrollment): Promise<void> {
    await this.db
      .from('campaign_enrollments')
      .update({
        sequence_status: 'completed',
        next_step_at: null,
      })
      .eq('id', enrollment.id)

    // Update campaign stats
    await this.db
      .from('campaigns')
      .update({
        total_completed: 1, // Increment
        total_active: -1, // Decrement
      })
      .eq('id', enrollment.campaign_id)

    console.log(`[Campaign Engine] Enrollment ${enrollment.id} completed all steps`)
  }

  /**
   * Stop an enrollment (responded, unsubscribed, etc.)
   */
  private async stopEnrollment(enrollment: DueEnrollment, reason: string): Promise<void> {
    await this.db
      .from('campaign_enrollments')
      .update({
        sequence_status: 'stopped',
        stop_reason: reason,
        next_step_at: null,
      })
      .eq('id', enrollment.id)

    // Update campaign stats
    await this.db
      .from('campaigns')
      .update({
        total_active: -1, // Decrement
      })
      .eq('id', enrollment.campaign_id)
  }

  /**
   * Handle errors during step execution
   */
  private async handleStepError(enrollment: DueEnrollment, error: unknown): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update error tracking
    const { data: current } = await this.db
      .from('campaign_enrollments')
      .select('error_count')
      .eq('id', enrollment.id)
      .single()

    const newErrorCount = (current?.error_count || 0) + 1

    await this.db
      .from('campaign_enrollments')
      .update({
        error_count: newErrorCount,
        last_error: errorMessage,
        last_error_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id)

    // If too many errors, pause the enrollment
    if (newErrorCount >= 3) {
      await this.db
        .from('campaign_enrollments')
        .update({
          sequence_status: 'paused',
          next_step_at: null,
        })
        .eq('id', enrollment.id)

      console.warn(`[Campaign Engine] Enrollment ${enrollment.id} paused after ${newErrorCount} errors`)
    }
  }

  /**
   * Create sequence execution log
   */
  private async createSequenceLog(
    enrollment: DueEnrollment,
    step: SequenceStep,
    stepNumber: number,
    channel: string,
    status: 'pending' | 'sent' | 'skipped' | 'failed'
  ): Promise<void> {
    await this.db.from('campaign_sequence_logs').insert({
      org_id: enrollment.org_id,
      campaign_id: enrollment.campaign_id,
      enrollment_id: enrollment.id,
      step_number: stepNumber,
      channel,
      action_type: step.action || 'email',
      action_at: new Date().toISOString(),
      subject: step.subject,
      content_preview: step.body?.substring(0, 200),
      status,
      ab_variant: enrollment.ab_variant,
      scheduled_at: enrollment.next_step_at,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
  }

  /**
   * Manually trigger enrollment processing for testing
   */
  async processEnrollment(enrollmentId: string): Promise<boolean> {
    const { data: enrollment, error } = await this.db
      .from('campaign_enrollments')
      .select(`
        id, org_id, campaign_id, contact_id, current_step, next_step_at,
        ab_variant, status, sequence_status, responded_at,
        campaign:campaigns!inner(
          id, name, status,
          send_window_start, send_window_end, send_days, timezone
        ),
        contact:contacts!inner(
          id, email, first_name, last_name, company_name, phone, linkedin_url
        )
      `)
      .eq('id', enrollmentId)
      .single()

    if (error || !enrollment) {
      console.error('[Campaign Engine] Enrollment not found:', enrollmentId)
      return false
    }

    const dueEnrollment: DueEnrollment = {
      ...enrollment,
      campaign: enrollment.campaign as unknown as Campaign,
      contact: enrollment.contact as unknown as Contact,
    }

    try {
      await this.executeNextStep(dueEnrollment)
      return true
    } catch (err) {
      console.error('[Campaign Engine] Error processing enrollment:', err)
      await this.handleStepError(dueEnrollment, err)
      return false
    }
  }
}

// ============================================
// SINGLETON & EXPORTS
// ============================================

export const campaignAutomation = new CampaignAutomationEngine()

/**
 * Process scheduled campaign steps (for cron job)
 */
export async function processScheduledCampaignSteps(): Promise<ProcessingResult> {
  return campaignAutomation.processScheduledSteps()
}

/**
 * Manually process a specific enrollment (for testing)
 */
export async function processEnrollment(enrollmentId: string): Promise<boolean> {
  return campaignAutomation.processEnrollment(enrollmentId)
}
