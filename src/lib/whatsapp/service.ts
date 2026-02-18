// ============================================================
// WhatsApp Service - High-level messaging with opt-in checks
// ============================================================

import { getAdminClient } from '@/lib/supabase/admin'
import { sendTemplateMessage } from './client'
import { WHATSAPP_TEMPLATES, buildBodyParams } from './templates'
import type { WhatsAppTemplateName } from './templates'

interface SendWhatsAppResult {
  success: boolean
  messageId?: string
  error?: string
  skipped?: boolean
  skipReason?: string
}

/**
 * Check if user has opted in to WhatsApp notifications
 */
async function checkOptIn(userId: string): Promise<{ optedIn: boolean; phone: string | null }> {
  const adminClient = getAdminClient()

  const { data } = await adminClient
    .from('user_profiles')
    .select('whatsapp_phone, whatsapp_opted_in')
    .eq('id', userId)
    .single()

  if (!data || !data.whatsapp_opted_in || !data.whatsapp_phone) {
    return { optedIn: false, phone: null }
  }

  return { optedIn: true, phone: data.whatsapp_phone }
}

/**
 * Log a WhatsApp message to the database
 */
async function logMessage(params: {
  userId: string
  templateName: string
  phone: string
  status: 'sent' | 'failed' | 'skipped'
  messageId?: string
  error?: string
  variables?: Record<string, string>
}) {
  const adminClient = getAdminClient()

  await adminClient
    .from('whatsapp_messages')
    .insert({
      user_id: params.userId,
      template_name: params.templateName,
      phone_number: params.phone,
      status: params.status,
      provider_message_id: params.messageId || null,
      error_message: params.error || null,
      template_variables: params.variables || null,
      sent_at: params.status === 'sent' ? new Date().toISOString() : null,
    })
    .then(({ error }) => {
      if (error) console.error('[WhatsApp] Failed to log message:', error)
    })
}

/**
 * Send a WhatsApp template message with opt-in check and logging
 */
async function sendWithOptInCheck(params: {
  userId: string
  templateName: WhatsAppTemplateName
  variables: string[]
  variablesMap?: Record<string, string>
}): Promise<SendWhatsAppResult> {
  const { optedIn, phone } = await checkOptIn(params.userId)

  if (!optedIn || !phone) {
    return { success: false, skipped: true, skipReason: 'User not opted in to WhatsApp' }
  }

  const result = await sendTemplateMessage({
    phone,
    templateName: params.templateName,
    components: buildBodyParams(...params.variables),
  })

  // Log to database (fire-and-forget)
  void logMessage({
    userId: params.userId,
    templateName: params.templateName,
    phone,
    status: result.success ? 'sent' : 'failed',
    messageId: result.messageId,
    error: result.error,
    variables: params.variablesMap,
  })

  return result
}

// ============================================================
// Academy-Specific WhatsApp Triggers
// ============================================================

/**
 * Send welcome message on enrollment approval
 */
export async function sendWhatsAppWelcome(params: {
  userId: string
  firstName: string
  pathTitle: string
}): Promise<SendWhatsAppResult> {
  return sendWithOptInCheck({
    userId: params.userId,
    templateName: WHATSAPP_TEMPLATES.ACADEMY_WELCOME,
    variables: [params.firstName, params.pathTitle],
    variablesMap: { firstName: params.firstName, pathTitle: params.pathTitle },
  })
}

/**
 * Send weekly progress update
 */
export async function sendWhatsAppProgressUpdate(params: {
  userId: string
  firstName: string
  progressPercent: number
  lessonsCompleted: number
}): Promise<SendWhatsAppResult> {
  return sendWithOptInCheck({
    userId: params.userId,
    templateName: WHATSAPP_TEMPLATES.ACADEMY_PROGRESS,
    variables: [params.firstName, `${params.progressPercent}`, `${params.lessonsCompleted}`],
    variablesMap: {
      firstName: params.firstName,
      progressPercent: `${params.progressPercent}`,
      lessonsCompleted: `${params.lessonsCompleted}`,
    },
  })
}

/**
 * Send inactivity reminder
 */
export async function sendWhatsAppInactivityReminder(params: {
  userId: string
  firstName: string
  daysSinceActive: number
}): Promise<SendWhatsAppResult> {
  return sendWithOptInCheck({
    userId: params.userId,
    templateName: WHATSAPP_TEMPLATES.ACADEMY_INACTIVITY,
    variables: [params.firstName, `${params.daysSinceActive}`],
    variablesMap: { firstName: params.firstName, daysSinceActive: `${params.daysSinceActive}` },
  })
}

/**
 * Send graduation congratulations
 */
export async function sendWhatsAppGraduation(params: {
  userId: string
  firstName: string
  pathTitle: string
}): Promise<SendWhatsAppResult> {
  return sendWithOptInCheck({
    userId: params.userId,
    templateName: WHATSAPP_TEMPLATES.ACADEMY_GRADUATION,
    variables: [params.firstName, params.pathTitle],
    variablesMap: { firstName: params.firstName, pathTitle: params.pathTitle },
  })
}
