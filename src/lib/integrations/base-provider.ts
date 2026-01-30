/**
 * Base Provider
 * Abstract base class for all integration providers
 */

import type {
  IntegrationConfig,
  IntegrationCredentials,
  ProviderCapabilities,
  SyncResult,
  WebhookEvent,
} from './types'

export abstract class BaseProvider {
  protected config: IntegrationConfig
  protected credentials: IntegrationCredentials

  constructor(config: IntegrationConfig) {
    this.config = config
    this.credentials = config.credentials
  }

  /**
   * Provider identification
   */
  abstract get providerId(): string
  abstract get providerName(): string
  abstract get capabilities(): ProviderCapabilities

  /**
   * Connection management
   */
  abstract testConnection(): Promise<{ success: boolean; error?: string }>
  abstract refreshTokens(): Promise<IntegrationCredentials>

  /**
   * Webhook handling
   */
  abstract verifyWebhookSignature(payload: string, signature: string): boolean
  abstract handleWebhook(event: WebhookEvent): Promise<void>

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean
    latencyMs: number
    details?: Record<string, unknown>
  }> {
    const start = Date.now()
    const result = await this.testConnection()
    const latencyMs = Date.now() - start

    return {
      healthy: result.success,
      latencyMs,
      details: result.error ? { error: result.error } : undefined,
    }
  }

  /**
   * Logging helper
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
    const logData = {
      provider: this.providerId,
      orgId: this.config.orgId,
      message,
      ...data,
    }

    switch (level) {
      case 'info':
        console.log('[Integration]', logData)
        break
      case 'warn':
        console.warn('[Integration]', logData)
        break
      case 'error':
        console.error('[Integration]', logData)
        break
    }
  }

  /**
   * Error handling helper
   */
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : String(error)
    this.log('error', `${context}: ${message}`, { error })
    throw new Error(`[${this.providerId}] ${context}: ${message}`)
  }
}

/**
 * Base Payroll Provider
 */
export abstract class BasePayrollProvider extends BaseProvider {
  abstract syncEmployees(): Promise<SyncResult>
  abstract getEmployees(): Promise<unknown[]>
  abstract createEmployee(data: unknown): Promise<unknown>
  abstract updateEmployee(externalId: string, data: unknown): Promise<unknown>
  abstract terminateEmployee(externalId: string, terminationDate: string): Promise<void>

  // Optional payroll features
  async submitPayroll?(payrollData: unknown): Promise<unknown> {
    throw new Error('submitPayroll not implemented')
  }
  async getPayStubs?(employeeId: string): Promise<unknown[]> {
    throw new Error('getPayStubs not implemented')
  }
  async getTaxDocuments?(employeeId: string, year: number): Promise<unknown[]> {
    throw new Error('getTaxDocuments not implemented')
  }
}

/**
 * Base E-Signature Provider
 */
export abstract class BaseESignatureProvider extends BaseProvider {
  abstract getTemplates(): Promise<unknown[]>
  abstract sendDocument(document: unknown): Promise<{ envelopeId: string }>
  abstract getDocumentStatus(envelopeId: string): Promise<unknown>
  abstract downloadSignedDocument(envelopeId: string): Promise<Buffer>
  abstract voidDocument(envelopeId: string, reason: string): Promise<void>
}

/**
 * Base Identity Provider (SCIM)
 */
export abstract class BaseIdentityProvider extends BaseProvider {
  abstract listUsers(): Promise<unknown[]>
  abstract getUser(userId: string): Promise<unknown>
  abstract createUser(userData: unknown): Promise<unknown>
  abstract updateUser(userId: string, userData: unknown): Promise<unknown>
  abstract deleteUser(userId: string): Promise<void>
  abstract activateUser(userId: string): Promise<void>
  abstract deactivateUser(userId: string): Promise<void>

  // Group management (optional)
  async listGroups?(): Promise<unknown[]> {
    throw new Error('listGroups not implemented')
  }
  async addUserToGroup?(userId: string, groupId: string): Promise<void> {
    throw new Error('addUserToGroup not implemented')
  }
  async removeUserFromGroup?(userId: string, groupId: string): Promise<void> {
    throw new Error('removeUserFromGroup not implemented')
  }
}
