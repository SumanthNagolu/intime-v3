/**
 * DocuSign E-Signature Provider
 * Integration with DocuSign for document signing
 */

import { BaseESignatureProvider } from '../../base-provider'
import type {
  IntegrationConfig,
  IntegrationCredentials,
  ProviderCapabilities,
  WebhookEvent,
  ESignatureDocument,
  ESignatureStatus,
} from '../../types'
import { DocuSignAPI, type DocuSignEnvelope, type DocuSignTemplate } from './docusign-api'

export class DocuSignProvider extends BaseESignatureProvider {
  private api: DocuSignAPI

  constructor(config: IntegrationConfig) {
    super(config)
    this.api = new DocuSignAPI(config.credentials)
  }

  get providerId(): string {
    return 'docusign'
  }

  get providerName(): string {
    return 'DocuSign'
  }

  get capabilities(): ProviderCapabilities {
    return {
      canSyncEmployees: false,
      canProcessPayroll: false,
      canSendDocuments: true,
      canManageUsers: false,
      supportsWebhooks: true,
      supportsBidirectionalSync: false,
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const userInfo = await this.api.getUserInfo()
      if (userInfo) {
        return { success: true }
      }
      return { success: false, error: 'Unable to retrieve user information' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: message }
    }
  }

  /**
   * Refresh OAuth tokens
   */
  async refreshTokens(): Promise<IntegrationCredentials> {
    try {
      const newTokens = await this.api.refreshAccessToken()
      return {
        ...this.credentials,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        tokenExpiresAt: newTokens.expiresAt,
      }
    } catch (error) {
      this.handleError(error, 'Failed to refresh tokens')
    }
  }

  /**
   * Verify webhook signature (DocuSign Connect)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    return this.api.verifyWebhookSignature(payload, signature, this.credentials.webhookSecret || '')
  }

  /**
   * Handle incoming webhook (DocuSign Connect)
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    this.log('info', `Handling webhook: ${event.eventType}`, { eventId: event.id })

    switch (event.eventType) {
      case 'envelope-sent':
        // Document was sent
        break
      case 'envelope-delivered':
        // Document was delivered to recipient
        break
      case 'envelope-signed':
        // Recipient signed
        break
      case 'envelope-completed':
        // All recipients signed
        // TODO: Download and store signed document
        break
      case 'envelope-declined':
        // Recipient declined
        break
      case 'envelope-voided':
        // Envelope was voided
        break
      default:
        this.log('warn', `Unknown webhook event type: ${event.eventType}`)
    }
  }

  /**
   * Get available templates
   */
  async getTemplates(): Promise<DocuSignTemplate[]> {
    try {
      return await this.api.listTemplates()
    } catch (error) {
      this.handleError(error, 'Failed to get templates')
    }
  }

  /**
   * Send document for signature
   */
  async sendDocument(document: ESignatureDocument): Promise<{ envelopeId: string }> {
    try {
      let envelope: DocuSignEnvelope

      if (document.templateId) {
        // Send from template
        envelope = await this.api.sendFromTemplate({
          templateId: document.templateId,
          emailSubject: document.name,
          templateRoles: document.recipients.map((r, index) => ({
            email: r.email,
            name: r.name,
            roleName: r.role || `signer${index + 1}`,
          })),
          tabs: document.fields,
        })
      } else {
        // Send ad-hoc document (would need document content)
        throw new Error('Ad-hoc document sending not implemented - use a template')
      }

      return { envelopeId: envelope.envelopeId }
    } catch (error) {
      this.handleError(error, 'Failed to send document')
    }
  }

  /**
   * Get document signing status
   */
  async getDocumentStatus(envelopeId: string): Promise<ESignatureStatus> {
    try {
      const envelope = await this.api.getEnvelope(envelopeId)
      const recipients = await this.api.getEnvelopeRecipients(envelopeId)

      return {
        documentId: envelopeId,
        status: this.mapEnvelopeStatus(envelope.status),
        recipients: recipients.signers.map((signer) => ({
          email: signer.email,
          name: signer.name,
          status: signer.status,
          signedAt: signer.signedDateTime ? new Date(signer.signedDateTime) : undefined,
        })),
        createdAt: new Date(envelope.createdDateTime),
        completedAt: envelope.completedDateTime ? new Date(envelope.completedDateTime) : undefined,
      }
    } catch (error) {
      this.handleError(error, 'Failed to get document status')
    }
  }

  /**
   * Download signed document
   */
  async downloadSignedDocument(envelopeId: string): Promise<Buffer> {
    try {
      return await this.api.downloadDocument(envelopeId)
    } catch (error) {
      this.handleError(error, 'Failed to download document')
    }
  }

  /**
   * Void an envelope
   */
  async voidDocument(envelopeId: string, reason: string): Promise<void> {
    try {
      await this.api.voidEnvelope(envelopeId, reason)
    } catch (error) {
      this.handleError(error, 'Failed to void document')
    }
  }

  /**
   * Resend envelope to recipients
   */
  async resendDocument(envelopeId: string): Promise<void> {
    try {
      await this.api.resendEnvelope(envelopeId)
    } catch (error) {
      this.handleError(error, 'Failed to resend document')
    }
  }

  /**
   * Map DocuSign status to internal status
   */
  private mapEnvelopeStatus(status: string): ESignatureStatus['status'] {
    const statusMap: Record<string, ESignatureStatus['status']> = {
      created: 'draft',
      sent: 'sent',
      delivered: 'delivered',
      signed: 'signed',
      completed: 'completed',
      declined: 'declined',
      voided: 'voided',
    }
    return statusMap[status.toLowerCase()] || 'draft'
  }
}
