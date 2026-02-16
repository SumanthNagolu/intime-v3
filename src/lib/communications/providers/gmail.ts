/**
 * Gmail Provider Integration
 * Phase 2: Communications
 *
 * Handles Gmail API authentication and operations.
 */

// ============================================
// Types
// ============================================

export interface GmailCredentials {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    mimeType: string
    body?: { data?: string; size: number }
    parts?: Array<{
      mimeType: string
      body?: { data?: string; size: number }
      parts?: Array<unknown>
    }>
  }
  internalDate: string
}

export interface GmailThread {
  id: string
  historyId: string
  messages: GmailMessage[]
}

export interface GmailLabel {
  id: string
  name: string
  type: 'system' | 'user'
  messagesTotal: number
  messagesUnread: number
}

// ============================================
// OAuth Configuration
// ============================================

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
]

/**
 * Get Gmail OAuth URL for user authorization
 */
export function getGmailAuthUrl(options: {
  clientId: string
  redirectUri: string
  state: string
}): string {
  const params = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: options.state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGmailAuthCode(options: {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
}): Promise<GmailCredentials> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: options.clientId,
      client_secret: options.clientSecret,
      redirect_uri: options.redirectUri,
      grant_type: 'authorization_code',
      code: options.code,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gmail auth failed: ${error}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }
}

/**
 * Refresh access token
 */
export async function refreshGmailToken(options: {
  clientId: string
  clientSecret: string
  refreshToken: string
}): Promise<GmailCredentials> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: options.clientId,
      client_secret: options.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: options.refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gmail token refresh failed: ${error}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: options.refreshToken, // Refresh token doesn't change
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }
}

// ============================================
// Gmail API Client
// ============================================

export class GmailClient {
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me'

  constructor(private accessToken: string) {}

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gmail API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Get user's email address
   */
  async getProfile(): Promise<{ emailAddress: string }> {
    return this.request('/profile')
  }

  /**
   * List messages with optional query
   */
  async listMessages(options?: {
    query?: string
    labelIds?: string[]
    maxResults?: number
    pageToken?: string
  }): Promise<{
    messages: Array<{ id: string; threadId: string }>
    nextPageToken?: string
    resultSizeEstimate: number
  }> {
    const params = new URLSearchParams()
    if (options?.query) params.set('q', options.query)
    if (options?.labelIds) params.set('labelIds', options.labelIds.join(','))
    if (options?.maxResults) params.set('maxResults', String(options.maxResults))
    if (options?.pageToken) params.set('pageToken', options.pageToken)

    return this.request(`/messages?${params.toString()}`)
  }

  /**
   * Get a single message
   */
  async getMessage(
    messageId: string,
    format: 'full' | 'metadata' | 'minimal' = 'full'
  ): Promise<GmailMessage> {
    return this.request(`/messages/${messageId}?format=${format}`)
  }

  /**
   * Get a thread with all messages
   */
  async getThread(threadId: string): Promise<GmailThread> {
    return this.request(`/threads/${threadId}?format=full`)
  }

  /**
   * List threads
   */
  async listThreads(options?: {
    query?: string
    labelIds?: string[]
    maxResults?: number
    pageToken?: string
  }): Promise<{
    threads: Array<{ id: string; snippet: string; historyId: string }>
    nextPageToken?: string
    resultSizeEstimate: number
  }> {
    const params = new URLSearchParams()
    if (options?.query) params.set('q', options.query)
    if (options?.labelIds) params.set('labelIds', options.labelIds.join(','))
    if (options?.maxResults) params.set('maxResults', String(options.maxResults))
    if (options?.pageToken) params.set('pageToken', options.pageToken)

    return this.request(`/threads?${params.toString()}`)
  }

  /**
   * Send an email
   */
  async sendMessage(options: {
    to: string
    subject: string
    body: string
    cc?: string
    bcc?: string
    threadId?: string
    inReplyTo?: string
    references?: string[]
  }): Promise<{ id: string; threadId: string; labelIds: string[] }> {
    // Construct MIME message
    const headers = [
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      'Content-Type: text/html; charset=utf-8',
    ]

    if (options.cc) headers.push(`Cc: ${options.cc}`)
    if (options.bcc) headers.push(`Bcc: ${options.bcc}`)
    if (options.inReplyTo) headers.push(`In-Reply-To: ${options.inReplyTo}`)
    if (options.references) headers.push(`References: ${options.references.join(' ')}`)

    const rawMessage = `${headers.join('\r\n')}\r\n\r\n${options.body}`
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const body: { raw: string; threadId?: string } = { raw: encodedMessage }
    if (options.threadId) body.threadId = options.threadId

    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  /**
   * Modify message labels
   */
  async modifyMessage(
    messageId: string,
    options: {
      addLabelIds?: string[]
      removeLabelIds?: string[]
    }
  ): Promise<GmailMessage> {
    return this.request(`/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify(options),
    })
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<GmailMessage> {
    return this.modifyMessage(messageId, { removeLabelIds: ['UNREAD'] })
  }

  /**
   * Mark message as unread
   */
  async markAsUnread(messageId: string): Promise<GmailMessage> {
    return this.modifyMessage(messageId, { addLabelIds: ['UNREAD'] })
  }

  /**
   * Archive message (remove from inbox)
   */
  async archive(messageId: string): Promise<GmailMessage> {
    return this.modifyMessage(messageId, { removeLabelIds: ['INBOX'] })
  }

  /**
   * Move to trash
   */
  async trash(messageId: string): Promise<GmailMessage> {
    return this.request(`/messages/${messageId}/trash`, { method: 'POST' })
  }

  /**
   * List labels
   */
  async listLabels(): Promise<{ labels: GmailLabel[] }> {
    return this.request('/labels')
  }

  /**
   * Watch for changes (push notifications)
   */
  async watch(options: {
    topicName: string
    labelIds?: string[]
  }): Promise<{ historyId: string; expiration: string }> {
    return this.request('/watch', {
      method: 'POST',
      body: JSON.stringify({
        topicName: options.topicName,
        labelIds: options.labelIds ?? ['INBOX'],
      }),
    })
  }

  /**
   * Get history (incremental sync)
   */
  async getHistory(options: {
    startHistoryId: string
    historyTypes?: ('messageAdded' | 'messageDeleted' | 'labelAdded' | 'labelRemoved')[]
    labelId?: string
    maxResults?: number
    pageToken?: string
  }): Promise<{
    history: Array<{
      id: string
      messages?: Array<{ id: string; threadId: string }>
      messagesAdded?: Array<{ message: { id: string; threadId: string } }>
      messagesDeleted?: Array<{ message: { id: string; threadId: string } }>
      labelsAdded?: Array<{ message: { id: string }; labelIds: string[] }>
      labelsRemoved?: Array<{ message: { id: string }; labelIds: string[] }>
    }>
    historyId: string
    nextPageToken?: string
  }> {
    const params = new URLSearchParams({ startHistoryId: options.startHistoryId })
    if (options.historyTypes) params.set('historyTypes', options.historyTypes.join(','))
    if (options.labelId) params.set('labelId', options.labelId)
    if (options.maxResults) params.set('maxResults', String(options.maxResults))
    if (options.pageToken) params.set('pageToken', options.pageToken)

    return this.request(`/history?${params.toString()}`)
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Parse Gmail message headers
 */
export function parseGmailHeaders(
  headers: Array<{ name: string; value: string }>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const header of headers) {
    result[header.name.toLowerCase()] = header.value
  }
  return result
}

/**
 * Extract body from Gmail message
 */
export function extractGmailBody(message: GmailMessage): {
  text?: string
  html?: string
} {
  const result: { text?: string; html?: string } = {}

  function decodeBase64(data: string): string {
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
  }

  function findPart(parts: GmailMessage['payload']['parts'], mimeType: string): string | undefined {
    for (const part of parts ?? []) {
      if (part.mimeType === mimeType && part.body?.data) {
        return decodeBase64(part.body.data)
      }
      if (part.parts) {
        const nested = findPart(part.parts as GmailMessage['payload']['parts'], mimeType)
        if (nested) return nested
      }
    }
    return undefined
  }

  // Check payload body directly
  if (message.payload.body?.data) {
    const decoded = decodeBase64(message.payload.body.data)
    if (message.payload.mimeType === 'text/html') {
      result.html = decoded
    } else {
      result.text = decoded
    }
  }

  // Check parts
  if (message.payload.parts) {
    result.text = findPart(message.payload.parts, 'text/plain')
    result.html = findPart(message.payload.parts, 'text/html')
  }

  return result
}

/**
 * Parse email address from header
 */
export function parseEmailAddress(value: string): { email: string; name?: string } {
  // Format: "Name <email@example.com>" or just "email@example.com"
  const match = value.match(/^(.+?)\s*<(.+?)>$/)
  if (match) {
    return { name: match[1].replace(/^["']|["']$/g, ''), email: match[2] }
  }
  return { email: value }
}

/**
 * Convert Gmail message to our internal format
 */
export function convertGmailMessage(message: GmailMessage): {
  providerId: string
  threadId: string
  subject: string
  from: { email: string; name?: string }
  to: Array<{ email: string; name?: string }>
  cc: Array<{ email: string; name?: string }>
  date: Date
  snippet: string
  bodyText?: string
  bodyHtml?: string
  labels: string[]
  isUnread: boolean
} {
  const headers = parseGmailHeaders(message.payload.headers)
  const body = extractGmailBody(message)

  const toAddresses = (headers.to ?? '')
    .split(',')
    .map((a) => parseEmailAddress(a.trim()))
    .filter((a) => a.email)

  const ccAddresses = (headers.cc ?? '')
    .split(',')
    .map((a) => parseEmailAddress(a.trim()))
    .filter((a) => a.email)

  return {
    providerId: message.id,
    threadId: message.threadId,
    subject: headers.subject ?? '(No subject)',
    from: parseEmailAddress(headers.from ?? ''),
    to: toAddresses,
    cc: ccAddresses,
    date: new Date(parseInt(message.internalDate)),
    snippet: message.snippet,
    bodyText: body.text,
    bodyHtml: body.html,
    labels: message.labelIds,
    isUnread: message.labelIds.includes('UNREAD'),
  }
}
