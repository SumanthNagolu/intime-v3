/**
 * DocuSign API Client
 * Low-level API wrapper for DocuSign eSignature REST API
 */

import crypto from 'crypto'
import type { IntegrationCredentials } from '../../types'

const DOCUSIGN_AUTH_SERVER = 'https://account.docusign.com'
const DOCUSIGN_API_BASE = 'https://www.docusign.net/restapi'

export interface DocuSignUserInfo {
  sub: string
  name: string
  email: string
  accounts: {
    account_id: string
    account_name: string
    is_default: boolean
    base_uri: string
  }[]
}

export interface DocuSignEnvelope {
  envelopeId: string
  status: string
  statusDateTime: string
  createdDateTime: string
  sentDateTime?: string
  deliveredDateTime?: string
  completedDateTime?: string
  emailSubject: string
  emailBlurb?: string
}

export interface DocuSignRecipients {
  signers: DocuSignSigner[]
  carbonCopies?: DocuSignCarbonCopy[]
}

export interface DocuSignSigner {
  recipientId: string
  email: string
  name: string
  routingOrder?: string
  status: string
  signedDateTime?: string
  deliveredDateTime?: string
  tabs?: DocuSignTabs
}

export interface DocuSignCarbonCopy {
  recipientId: string
  email: string
  name: string
  routingOrder?: string
}

export interface DocuSignTabs {
  signHereTabs?: DocuSignTab[]
  initialHereTabs?: DocuSignTab[]
  dateSignedTabs?: DocuSignTab[]
  textTabs?: DocuSignTab[]
  checkboxTabs?: DocuSignTab[]
}

export interface DocuSignTab {
  documentId: string
  pageNumber: string
  xPosition: string
  yPosition: string
  tabLabel?: string
  value?: string
}

export interface DocuSignTemplate {
  templateId: string
  name: string
  description?: string
  shared: boolean
  created: string
  lastModified: string
  folderId?: string
  folderName?: string
}

export interface SendFromTemplateRequest {
  templateId: string
  emailSubject: string
  emailBlurb?: string
  templateRoles: {
    email: string
    name: string
    roleName: string
    tabs?: Record<string, string | number | boolean>
  }[]
  tabs?: Record<string, string | number | boolean>
}

export class DocuSignAPI {
  private accessToken: string
  private refreshToken: string
  private clientId: string
  private clientSecret: string
  private accountId?: string
  private baseUri?: string

  constructor(credentials: IntegrationCredentials) {
    this.accessToken = credentials.accessToken || ''
    this.refreshToken = credentials.refreshToken || ''
    this.clientId = credentials.clientId || ''
    this.clientSecret = credentials.clientSecret || ''
    this.accountId = credentials.additionalFields?.accountId
    this.baseUri = credentials.baseUrl
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>,
    isAuthServer = false
  ): Promise<T> {
    const baseUrl = isAuthServer ? DOCUSIGN_AUTH_SERVER : (this.baseUri || DOCUSIGN_API_BASE)
    const url = `${baseUrl}${endpoint}`

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `DocuSign API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
      )
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T
    return JSON.parse(text)
  }

  /**
   * Get user info (also sets account ID and base URI)
   */
  async getUserInfo(): Promise<DocuSignUserInfo> {
    const userInfo = await this.request<DocuSignUserInfo>('GET', '/oauth/userinfo', undefined, true)

    // Set account ID and base URI from default account
    const defaultAccount = userInfo.accounts.find(a => a.is_default) || userInfo.accounts[0]
    if (defaultAccount) {
      this.accountId = defaultAccount.account_id
      this.baseUri = defaultAccount.base_uri
    }

    return userInfo
  }

  /**
   * Refresh OAuth access token
   */
  async refreshAccessToken(): Promise<{
    accessToken: string
    refreshToken: string
    expiresAt: string
  }> {
    const response = await fetch(`${DOCUSIGN_AUTH_SERVER}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh DocuSign access token')
    }

    const data = await response.json()
    this.accessToken = data.access_token
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }
  }

  /**
   * Verify webhook signature (DocuSign Connect)
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // DocuSign Connect uses HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  private async ensureAccountId(): Promise<void> {
    if (!this.accountId) {
      await this.getUserInfo()
    }
  }

  // Template endpoints

  async listTemplates(): Promise<DocuSignTemplate[]> {
    await this.ensureAccountId()
    const response = await this.request<{ envelopeTemplates: DocuSignTemplate[] }>(
      'GET',
      `/v2.1/accounts/${this.accountId}/templates`
    )
    return response.envelopeTemplates || []
  }

  async getTemplate(templateId: string): Promise<DocuSignTemplate> {
    await this.ensureAccountId()
    return this.request<DocuSignTemplate>(
      'GET',
      `/v2.1/accounts/${this.accountId}/templates/${templateId}`
    )
  }

  // Envelope endpoints

  async sendFromTemplate(request: SendFromTemplateRequest): Promise<DocuSignEnvelope> {
    await this.ensureAccountId()

    const envelopeDefinition = {
      templateId: request.templateId,
      emailSubject: request.emailSubject,
      emailBlurb: request.emailBlurb,
      templateRoles: request.templateRoles.map(role => ({
        email: role.email,
        name: role.name,
        roleName: role.roleName,
        tabs: role.tabs ? this.formatTabs(role.tabs) : undefined,
      })),
      status: 'sent', // Send immediately
    }

    return this.request<DocuSignEnvelope>(
      'POST',
      `/v2.1/accounts/${this.accountId}/envelopes`,
      envelopeDefinition
    )
  }

  async getEnvelope(envelopeId: string): Promise<DocuSignEnvelope> {
    await this.ensureAccountId()
    return this.request<DocuSignEnvelope>(
      'GET',
      `/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}`
    )
  }

  async getEnvelopeRecipients(envelopeId: string): Promise<DocuSignRecipients> {
    await this.ensureAccountId()
    return this.request<DocuSignRecipients>(
      'GET',
      `/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}/recipients`
    )
  }

  async downloadDocument(envelopeId: string, documentId = 'combined'): Promise<Buffer> {
    await this.ensureAccountId()

    const response = await fetch(
      `${this.baseUri}/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}/documents/${documentId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async voidEnvelope(envelopeId: string, reason: string): Promise<void> {
    await this.ensureAccountId()
    await this.request(
      'PUT',
      `/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}`,
      {
        status: 'voided',
        voidedReason: reason,
      }
    )
  }

  async resendEnvelope(envelopeId: string): Promise<void> {
    await this.ensureAccountId()
    await this.request(
      'PUT',
      `/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}/recipients?resend_envelope=true`,
      {}
    )
  }

  /**
   * Format tabs from simple key-value to DocuSign format
   */
  private formatTabs(tabs: Record<string, string | number | boolean>): DocuSignTabs {
    const textTabs: DocuSignTab[] = []

    for (const [label, value] of Object.entries(tabs)) {
      if (typeof value === 'string' || typeof value === 'number') {
        textTabs.push({
          documentId: '1',
          pageNumber: '1',
          xPosition: '0',
          yPosition: '0',
          tabLabel: label,
          value: String(value),
        })
      }
    }

    return { textTabs }
  }
}
