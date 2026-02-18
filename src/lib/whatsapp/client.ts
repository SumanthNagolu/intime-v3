// ============================================================
// WhatsApp Cloud API Client (Meta Graph API)
// ============================================================

const WHATSAPP_API_VERSION = 'v18.0'
const WHATSAPP_BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`

interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
}

interface TemplateComponent {
  type: 'body' | 'header' | 'button'
  parameters: Array<{
    type: 'text' | 'image' | 'document'
    text?: string
    image?: { link: string }
  }>
}

/**
 * Send a template message via WhatsApp Cloud API
 */
export async function sendTemplateMessage(params: {
  phone: string
  templateName: string
  languageCode?: string
  components?: TemplateComponent[]
}): Promise<WhatsAppSendResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    console.warn('[WhatsApp] Not configured - missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID')
    return { success: false, error: 'WhatsApp not configured' }
  }

  // Normalize phone number (ensure + prefix, remove spaces/dashes)
  const normalizedPhone = params.phone.replace(/[\s\-()]/g, '').replace(/^(?!\+)/, '+')

  try {
    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'template',
          template: {
            name: params.templateName,
            language: { code: params.languageCode || 'en_US' },
            components: params.components || [],
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[WhatsApp] API error:', data)
      return {
        success: false,
        error: data?.error?.message || `HTTP ${response.status}`,
      }
    }

    const messageId = data?.messages?.[0]?.id
    return { success: true, messageId }
  } catch (err) {
    console.error('[WhatsApp] Send error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Send a plain text message via WhatsApp Cloud API
 * Note: Only works within 24-hour customer service window
 */
export async function sendTextMessage(params: {
  phone: string
  text: string
}): Promise<WhatsAppSendResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'WhatsApp not configured' }
  }

  const normalizedPhone = params.phone.replace(/[\s\-()]/g, '').replace(/^(?!\+)/, '+')

  try {
    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'text',
          text: { body: params.text },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data?.error?.message || `HTTP ${response.status}` }
    }

    return { success: true, messageId: data?.messages?.[0]?.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
