// ============================================================
// WhatsApp Template Definitions
// These must be pre-approved in Meta Business Manager
// ============================================================

/**
 * Template names registered with Meta for academy notifications.
 * Each template must be approved before use.
 *
 * To register templates:
 * 1. Go to Meta Business Manager > WhatsApp > Message Templates
 * 2. Create templates with these exact names
 * 3. Use the body variable placeholders {{1}}, {{2}}, etc.
 */
export const WHATSAPP_TEMPLATES = {
  /**
   * Welcome message on enrollment approval
   * Variables: {{1}} = firstName, {{2}} = pathTitle
   * Body: "Hi {{1}}! Welcome to InTime Academy. You've been enrolled in the {{2}} learning path. Start learning now at intime.dev/academy/learn"
   */
  ACADEMY_WELCOME: 'academy_welcome',

  /**
   * Progress update (sent weekly)
   * Variables: {{1}} = firstName, {{2}} = progressPercent, {{3}} = lessonsCompleted
   * Body: "Hi {{1}}! You're {{2}}% through your learning path with {{3}} lessons completed. Keep it up!"
   */
  ACADEMY_PROGRESS: 'academy_progress_update',

  /**
   * Inactivity reminder (7+ days)
   * Variables: {{1}} = firstName, {{2}} = daysSinceActive
   * Body: "Hi {{1}}, it's been {{2}} days since your last session. Your learning path is waiting! Continue at intime.dev/academy/learn"
   */
  ACADEMY_INACTIVITY: 'academy_inactivity',

  /**
   * Graduation congratulations
   * Variables: {{1}} = firstName, {{2}} = pathTitle
   * Body: "Congratulations {{1}}! You've completed the {{2}} learning path. Your certificate is ready at intime.dev/academy/learn"
   */
  ACADEMY_GRADUATION: 'academy_graduation',
} as const

export type WhatsAppTemplateName = typeof WHATSAPP_TEMPLATES[keyof typeof WHATSAPP_TEMPLATES]

/**
 * Helper to build template components for the WhatsApp API
 */
export function buildBodyParams(...texts: string[]) {
  return [{
    type: 'body' as const,
    parameters: texts.map(text => ({ type: 'text' as const, text })),
  }]
}
