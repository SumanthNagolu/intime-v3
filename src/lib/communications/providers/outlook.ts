/**
 * Outlook/Microsoft Graph Provider Integration
 * Phase 2: Communications
 *
 * Handles Microsoft Graph API authentication and operations.
 */

// ============================================
// Types
// ============================================

export interface OutlookCredentials {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export interface OutlookMessage {
  id: string
  conversationId: string
  conversationIndex: string
  subject: string
  bodyPreview: string
  body: { contentType: 'text' | 'html'; content: string }
  from: { emailAddress: { name?: string; address: string } }
  toRecipients: Array<{ emailAddress: { name?: string; address: string } }>
  ccRecipients: Array<{ emailAddress: { name?: string; address: string } }>
  bccRecipients: Array<{ emailAddress: { name?: string; address: string } }>
  replyTo: Array<{ emailAddress: { name?: string; address: string } }>
  receivedDateTime: string
  sentDateTime: string
  hasAttachments: boolean
  importance: 'low' | 'normal' | 'high'
  isRead: boolean
  isDraft: boolean
  webLink: string
  categories: string[]
  flag: { flagStatus: 'notFlagged' | 'flagged' | 'complete' }
  internetMessageId: string
  parentFolderId: string
}

export interface OutlookFolder {
  id: string
  displayName: string
  parentFolderId: string
  childFolderCount: number
  unreadItemCount: number
  totalItemCount: number
}

export interface OutlookCalendarEvent {
  id: string
  subject: string
  bodyPreview: string
  body: { contentType: 'text' | 'html'; content: string }
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  location: { displayName: string; address?: object }
  attendees: Array<{
    type: 'required' | 'optional' | 'resource'
    status: { response: string; time: string }
    emailAddress: { name?: string; address: string }
  }>
  organizer: { emailAddress: { name?: string; address: string } }
  isAllDay: boolean
  isCancelled: boolean
  isOrganizer: boolean
  onlineMeeting?: { joinUrl: string }
  recurrence?: object
  webLink: string
}

// ============================================
// OAuth Configuration
// ============================================

const OUTLOOK_SCOPES = [
  'offline_access',
  'User.Read',
  'Mail.Read',
  'Mail.Send',
  'Mail.ReadWrite',
  'Calendars.Read',
  'Calendars.ReadWrite',
]

/**
 * Get Outlook OAuth URL for user authorization
 */
export function getOutlookAuthUrl(options: {
  clientId: string
  redirectUri: string
  state: string
  tenantId?: string
}): string {
  const tenant = options.tenantId ?? 'common'
  const params = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: OUTLOOK_SCOPES.join(' '),
    response_mode: 'query',
    state: options.state,
  })

  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeOutlookAuthCode(options: {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
  tenantId?: string
}): Promise<OutlookCredentials> {
  const tenant = options.tenantId ?? 'common'

  const response = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: options.clientId,
        client_secret: options.clientSecret,
        redirect_uri: options.redirectUri,
        grant_type: 'authorization_code',
        code: options.code,
        scope: OUTLOOK_SCOPES.join(' '),
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Outlook auth failed: ${error}`)
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
export async function refreshOutlookToken(options: {
  clientId: string
  clientSecret: string
  refreshToken: string
  tenantId?: string
}): Promise<OutlookCredentials> {
  const tenant = options.tenantId ?? 'common'

  const response = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: options.clientId,
        client_secret: options.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: options.refreshToken,
        scope: OUTLOOK_SCOPES.join(' '),
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Outlook token refresh failed: ${error}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? options.refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }
}

// ============================================
// Microsoft Graph API Client
// ============================================

export class OutlookClient {
  private baseUrl = 'https://graph.microsoft.com/v1.0'

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
      throw new Error(`Graph API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{
    id: string
    displayName: string
    mail: string
    userPrincipalName: string
  }> {
    return this.request('/me')
  }

  // ============================================
  // Email Operations
  // ============================================

  /**
   * List messages
   */
  async listMessages(options?: {
    folderId?: string
    filter?: string
    orderBy?: string
    top?: number
    skip?: number
    select?: string[]
  }): Promise<{
    value: OutlookMessage[]
    '@odata.nextLink'?: string
  }> {
    const folder = options?.folderId ?? 'inbox'
    const params = new URLSearchParams()
    if (options?.filter) params.set('$filter', options.filter)
    if (options?.orderBy) params.set('$orderby', options.orderBy)
    if (options?.top) params.set('$top', String(options.top))
    if (options?.skip) params.set('$skip', String(options.skip))
    if (options?.select) params.set('$select', options.select.join(','))

    const queryString = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/me/mailFolders/${folder}/messages${queryString}`)
  }

  /**
   * Get a single message
   */
  async getMessage(messageId: string): Promise<OutlookMessage> {
    return this.request(`/me/messages/${messageId}`)
  }

  /**
   * Get messages by conversation ID
   */
  async getConversation(conversationId: string): Promise<{ value: OutlookMessage[] }> {
    const filter = `conversationId eq '${conversationId}'`
    return this.request(`/me/messages?$filter=${encodeURIComponent(filter)}&$orderby=receivedDateTime`)
  }

  /**
   * Send an email
   */
  async sendMessage(options: {
    to: Array<{ email: string; name?: string }>
    cc?: Array<{ email: string; name?: string }>
    bcc?: Array<{ email: string; name?: string }>
    subject: string
    body: string
    bodyType?: 'text' | 'html'
    importance?: 'low' | 'normal' | 'high'
    conversationId?: string
  }): Promise<void> {
    const toRecipients = options.to.map((r) => ({
      emailAddress: { address: r.email, name: r.name },
    }))

    const ccRecipients = (options.cc ?? []).map((r) => ({
      emailAddress: { address: r.email, name: r.name },
    }))

    const bccRecipients = (options.bcc ?? []).map((r) => ({
      emailAddress: { address: r.email, name: r.name },
    }))

    const message = {
      subject: options.subject,
      body: {
        contentType: options.bodyType ?? 'html',
        content: options.body,
      },
      toRecipients,
      ccRecipients,
      bccRecipients,
      importance: options.importance ?? 'normal',
    }

    await this.request('/me/sendMail', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  /**
   * Reply to a message
   */
  async replyToMessage(
    messageId: string,
    options: {
      body: string
      bodyType?: 'text' | 'html'
      replyAll?: boolean
    }
  ): Promise<void> {
    const endpoint = options.replyAll
      ? `/me/messages/${messageId}/replyAll`
      : `/me/messages/${messageId}/reply`

    await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        message: {
          body: {
            contentType: options.bodyType ?? 'html',
            content: options.body,
          },
        },
      }),
    })
  }

  /**
   * Update message properties (read status, flag, etc.)
   */
  async updateMessage(
    messageId: string,
    options: {
      isRead?: boolean
      flag?: { flagStatus: 'notFlagged' | 'flagged' | 'complete' }
      categories?: string[]
    }
  ): Promise<OutlookMessage> {
    return this.request(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(options),
    })
  }

  /**
   * Move message to folder
   */
  async moveMessage(messageId: string, folderId: string): Promise<OutlookMessage> {
    return this.request(`/me/messages/${messageId}/move`, {
      method: 'POST',
      body: JSON.stringify({ destinationId: folderId }),
    })
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await this.request(`/me/messages/${messageId}`, { method: 'DELETE' })
  }

  /**
   * List mail folders
   */
  async listFolders(): Promise<{ value: OutlookFolder[] }> {
    return this.request('/me/mailFolders')
  }

  // ============================================
  // Calendar Operations
  // ============================================

  /**
   * List calendars
   */
  async listCalendars(): Promise<{
    value: Array<{
      id: string
      name: string
      color: string
      isDefaultCalendar: boolean
      canEdit: boolean
      owner: { name: string; address: string }
    }>
  }> {
    return this.request('/me/calendars')
  }

  /**
   * List calendar events
   */
  async listEvents(options?: {
    calendarId?: string
    startDateTime?: string
    endDateTime?: string
    filter?: string
    orderBy?: string
    top?: number
    select?: string[]
  }): Promise<{
    value: OutlookCalendarEvent[]
    '@odata.nextLink'?: string
  }> {
    const calendar = options?.calendarId ?? 'calendar'
    const params = new URLSearchParams()

    if (options?.startDateTime && options?.endDateTime) {
      params.set('startDateTime', options.startDateTime)
      params.set('endDateTime', options.endDateTime)
    }
    if (options?.filter) params.set('$filter', options.filter)
    if (options?.orderBy) params.set('$orderby', options.orderBy)
    if (options?.top) params.set('$top', String(options.top))
    if (options?.select) params.set('$select', options.select.join(','))

    const queryString = params.toString() ? `?${params.toString()}` : ''

    // Use calendarView for date range queries, events for all
    const endpoint = options?.startDateTime
      ? `/me/calendars/${calendar}/calendarView${queryString}`
      : `/me/calendars/${calendar}/events${queryString}`

    return this.request(endpoint)
  }

  /**
   * Get a single event
   */
  async getEvent(eventId: string): Promise<OutlookCalendarEvent> {
    return this.request(`/me/events/${eventId}`)
  }

  /**
   * Create a calendar event
   */
  async createEvent(options: {
    calendarId?: string
    subject: string
    body?: string
    bodyType?: 'text' | 'html'
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    location?: string
    attendees?: Array<{ email: string; name?: string; type?: 'required' | 'optional' }>
    isAllDay?: boolean
    isOnlineMeeting?: boolean
    onlineMeetingProvider?: 'teamsForBusiness'
  }): Promise<OutlookCalendarEvent> {
    const calendar = options.calendarId ?? 'calendar'

    const event: Record<string, unknown> = {
      subject: options.subject,
      start: options.start,
      end: options.end,
      isAllDay: options.isAllDay ?? false,
    }

    if (options.body) {
      event.body = {
        contentType: options.bodyType ?? 'html',
        content: options.body,
      }
    }

    if (options.location) {
      event.location = { displayName: options.location }
    }

    if (options.attendees) {
      event.attendees = options.attendees.map((a) => ({
        type: a.type ?? 'required',
        emailAddress: { address: a.email, name: a.name },
      }))
    }

    if (options.isOnlineMeeting) {
      event.isOnlineMeeting = true
      event.onlineMeetingProvider = options.onlineMeetingProvider ?? 'teamsForBusiness'
    }

    return this.request(`/me/calendars/${calendar}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    })
  }

  /**
   * Update a calendar event
   */
  async updateEvent(
    eventId: string,
    options: {
      subject?: string
      body?: string
      start?: { dateTime: string; timeZone: string }
      end?: { dateTime: string; timeZone: string }
      location?: string
      attendees?: Array<{ email: string; name?: string; type?: 'required' | 'optional' }>
    }
  ): Promise<OutlookCalendarEvent> {
    const updates: Record<string, unknown> = {}

    if (options.subject) updates.subject = options.subject
    if (options.body) updates.body = { contentType: 'html', content: options.body }
    if (options.start) updates.start = options.start
    if (options.end) updates.end = options.end
    if (options.location) updates.location = { displayName: options.location }
    if (options.attendees) {
      updates.attendees = options.attendees.map((a) => ({
        type: a.type ?? 'required',
        emailAddress: { address: a.email, name: a.name },
      }))
    }

    return this.request(`/me/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await this.request(`/me/events/${eventId}`, { method: 'DELETE' })
  }

  /**
   * Respond to calendar event (accept/decline/tentative)
   */
  async respondToEvent(
    eventId: string,
    response: 'accept' | 'decline' | 'tentativelyAccept',
    options?: { comment?: string; sendResponse?: boolean }
  ): Promise<void> {
    await this.request(`/me/events/${eventId}/${response}`, {
      method: 'POST',
      body: JSON.stringify({
        comment: options?.comment,
        sendResponse: options?.sendResponse ?? true,
      }),
    })
  }

  /**
   * Get free/busy information
   */
  async getFreeBusy(options: {
    schedules: string[]
    startTime: { dateTime: string; timeZone: string }
    endTime: { dateTime: string; timeZone: string }
    availabilityViewInterval?: number
  }): Promise<{
    value: Array<{
      scheduleId: string
      availabilityView: string
      scheduleItems: Array<{
        status: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown'
        start: { dateTime: string; timeZone: string }
        end: { dateTime: string; timeZone: string }
      }>
    }>
  }> {
    return this.request('/me/calendar/getSchedule', {
      method: 'POST',
      body: JSON.stringify({
        schedules: options.schedules,
        startTime: options.startTime,
        endTime: options.endTime,
        availabilityViewInterval: options.availabilityViewInterval ?? 30,
      }),
    })
  }

  // ============================================
  // Subscriptions (Webhooks)
  // ============================================

  /**
   * Create a subscription for change notifications
   */
  async createSubscription(options: {
    resource: string // e.g., '/me/messages', '/me/events'
    changeTypes: ('created' | 'updated' | 'deleted')[]
    notificationUrl: string
    expirationDateTime: string
    clientState?: string
  }): Promise<{
    id: string
    resource: string
    changeType: string
    notificationUrl: string
    expirationDateTime: string
  }> {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        changeType: options.changeTypes.join(','),
        notificationUrl: options.notificationUrl,
        resource: options.resource,
        expirationDateTime: options.expirationDateTime,
        clientState: options.clientState,
      }),
    })
  }

  /**
   * Renew a subscription
   */
  async renewSubscription(
    subscriptionId: string,
    expirationDateTime: string
  ): Promise<{ id: string; expirationDateTime: string }> {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ expirationDateTime }),
    })
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    await this.request(`/subscriptions/${subscriptionId}`, { method: 'DELETE' })
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert Outlook message to our internal format
 */
export function convertOutlookMessage(message: OutlookMessage): {
  providerId: string
  conversationId: string
  subject: string
  from: { email: string; name?: string }
  to: Array<{ email: string; name?: string }>
  cc: Array<{ email: string; name?: string }>
  date: Date
  snippet: string
  bodyText?: string
  bodyHtml?: string
  isUnread: boolean
  hasAttachments: boolean
  importance: 'low' | 'normal' | 'high'
} {
  return {
    providerId: message.id,
    conversationId: message.conversationId,
    subject: message.subject,
    from: {
      email: message.from.emailAddress.address,
      name: message.from.emailAddress.name,
    },
    to: message.toRecipients.map((r) => ({
      email: r.emailAddress.address,
      name: r.emailAddress.name,
    })),
    cc: message.ccRecipients.map((r) => ({
      email: r.emailAddress.address,
      name: r.emailAddress.name,
    })),
    date: new Date(message.receivedDateTime),
    snippet: message.bodyPreview,
    bodyText: message.body.contentType === 'text' ? message.body.content : undefined,
    bodyHtml: message.body.contentType === 'html' ? message.body.content : undefined,
    isUnread: !message.isRead,
    hasAttachments: message.hasAttachments,
    importance: message.importance,
  }
}

/**
 * Convert Outlook event to our internal format
 */
export function convertOutlookEvent(event: OutlookCalendarEvent): {
  providerId: string
  subject: string
  description?: string
  start: Date
  end: Date
  timezone: string
  location?: string
  attendees: Array<{ email: string; name?: string; status: string }>
  organizer: { email: string; name?: string }
  isAllDay: boolean
  isCancelled: boolean
  conferenceLink?: string
} {
  return {
    providerId: event.id,
    subject: event.subject,
    description: event.body?.content,
    start: new Date(event.start.dateTime + 'Z'),
    end: new Date(event.end.dateTime + 'Z'),
    timezone: event.start.timeZone,
    location: event.location?.displayName,
    attendees: event.attendees.map((a) => ({
      email: a.emailAddress.address,
      name: a.emailAddress.name,
      status: a.status.response,
    })),
    organizer: {
      email: event.organizer.emailAddress.address,
      name: event.organizer.emailAddress.name,
    },
    isAllDay: event.isAllDay,
    isCancelled: event.isCancelled,
    conferenceLink: event.onlineMeeting?.joinUrl,
  }
}
