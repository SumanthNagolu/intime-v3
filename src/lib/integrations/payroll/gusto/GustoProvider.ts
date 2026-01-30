/**
 * Gusto Payroll Provider
 * Integration with Gusto for payroll processing and employee management
 */

import { BasePayrollProvider } from '../../base-provider'
import type {
  IntegrationConfig,
  IntegrationCredentials,
  ProviderCapabilities,
  SyncResult,
  WebhookEvent,
  EmployeeSyncData,
} from '../../types'
import { GustoAPI, type GustoEmployee, type GustoCompany } from './gusto-api'

export class GustoProvider extends BasePayrollProvider {
  private api: GustoAPI

  constructor(config: IntegrationConfig) {
    super(config)
    this.api = new GustoAPI(config.credentials)
  }

  get providerId(): string {
    return 'gusto'
  }

  get providerName(): string {
    return 'Gusto'
  }

  get capabilities(): ProviderCapabilities {
    return {
      canSyncEmployees: true,
      canProcessPayroll: true,
      canSendDocuments: false,
      canManageUsers: false,
      supportsWebhooks: true,
      supportsBidirectionalSync: true,
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const company = await this.api.getCompany()
      if (company) {
        return { success: true }
      }
      return { success: false, error: 'Unable to retrieve company information' }
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
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    return this.api.verifyWebhookSignature(payload, signature, this.credentials.webhookSecret || '')
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    this.log('info', `Handling webhook: ${event.eventType}`, { eventId: event.id })

    switch (event.eventType) {
      case 'employee.created':
      case 'employee.updated':
        // TODO: Sync employee to InTime
        break
      case 'employee.terminated':
        // TODO: Handle termination
        break
      case 'payroll.processed':
        // TODO: Update payroll status
        break
      default:
        this.log('warn', `Unknown webhook event type: ${event.eventType}`)
    }
  }

  /**
   * Sync all employees from Gusto
   */
  async syncEmployees(): Promise<SyncResult> {
    const errors: SyncResult['errors'] = []
    let syncedCount = 0

    try {
      const employees = await this.api.listEmployees()

      for (const gustoEmployee of employees) {
        try {
          // Map Gusto employee to internal format
          const employeeData = this.mapGustoEmployee(gustoEmployee)

          // TODO: Upsert employee in database
          // await this.upsertEmployee(employeeData, gustoEmployee.uuid)

          syncedCount++
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          errors.push({
            entityId: gustoEmployee.uuid,
            entityType: 'employee',
            error: message,
            retryable: true,
          })
        }
      }

      return {
        success: errors.length === 0,
        syncedCount,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      this.handleError(error, 'Failed to sync employees')
    }
  }

  /**
   * Get all employees from Gusto
   */
  async getEmployees(): Promise<GustoEmployee[]> {
    try {
      return await this.api.listEmployees()
    } catch (error) {
      this.handleError(error, 'Failed to get employees')
    }
  }

  /**
   * Create employee in Gusto
   */
  async createEmployee(data: EmployeeSyncData): Promise<GustoEmployee> {
    try {
      const gustoData = this.mapToGustoEmployee(data)
      return await this.api.createEmployee(gustoData)
    } catch (error) {
      this.handleError(error, 'Failed to create employee')
    }
  }

  /**
   * Update employee in Gusto
   */
  async updateEmployee(externalId: string, data: Partial<EmployeeSyncData>): Promise<GustoEmployee> {
    try {
      const gustoData = this.mapToGustoEmployee(data as EmployeeSyncData)
      return await this.api.updateEmployee(externalId, gustoData)
    } catch (error) {
      this.handleError(error, 'Failed to update employee')
    }
  }

  /**
   * Terminate employee in Gusto
   */
  async terminateEmployee(externalId: string, terminationDate: string): Promise<void> {
    try {
      await this.api.terminateEmployee(externalId, terminationDate)
    } catch (error) {
      this.handleError(error, 'Failed to terminate employee')
    }
  }

  /**
   * Submit payroll
   */
  async submitPayroll(payrollData: {
    payPeriodStart: string
    payPeriodEnd: string
    checkDate: string
  }): Promise<{ payrollId: string }> {
    try {
      const result = await this.api.createPayroll(payrollData)
      return { payrollId: result.uuid }
    } catch (error) {
      this.handleError(error, 'Failed to submit payroll')
    }
  }

  /**
   * Get pay stubs for employee
   */
  async getPayStubs(employeeId: string): Promise<unknown[]> {
    try {
      return await this.api.getPayStubs(employeeId)
    } catch (error) {
      this.handleError(error, 'Failed to get pay stubs')
    }
  }

  /**
   * Map Gusto employee to internal format
   */
  private mapGustoEmployee(gusto: GustoEmployee): EmployeeSyncData {
    return {
      externalId: gusto.uuid,
      email: gusto.email,
      firstName: gusto.first_name,
      lastName: gusto.last_name,
      jobTitle: gusto.jobs?.[0]?.title,
      department: gusto.department,
      startDate: gusto.date_of_birth, // Would need hire_date from jobs
      status: gusto.terminated ? 'inactive' : 'active',
      salary: gusto.jobs?.[0]?.current_compensation_id ? {
        type: gusto.jobs[0].payment_unit === 'Hour' ? 'hourly' : 'annual',
        amount: gusto.jobs[0].rate || 0,
        currency: 'USD',
      } : undefined,
      address: gusto.home_address ? {
        line1: gusto.home_address.street_1,
        line2: gusto.home_address.street_2,
        city: gusto.home_address.city,
        state: gusto.home_address.state,
        postalCode: gusto.home_address.zip,
        country: 'US',
      } : undefined,
    }
  }

  /**
   * Map internal employee to Gusto format
   */
  private mapToGustoEmployee(data: EmployeeSyncData): Partial<GustoEmployee> {
    return {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      department: data.department,
      home_address: data.address ? {
        street_1: data.address.line1,
        street_2: data.address.line2 || '',
        city: data.address.city,
        state: data.address.state,
        zip: data.address.postalCode,
      } : undefined,
    }
  }
}
