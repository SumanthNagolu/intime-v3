/**
 * Gusto API Client
 * Low-level API wrapper for Gusto REST API
 */

import crypto from 'crypto'
import type { IntegrationCredentials } from '../../types'

const GUSTO_API_BASE = 'https://api.gusto.com'
const GUSTO_API_VERSION = '2024-03-01'

export interface GustoCompany {
  uuid: string
  name: string
  trade_name: string
  ein: string
  entity_type: string
  primary_payroll: {
    type: string
    pay_frequency: string
  }
  locations: GustoLocation[]
}

export interface GustoLocation {
  uuid: string
  street_1: string
  street_2?: string
  city: string
  state: string
  zip: string
  country: string
  active: boolean
}

export interface GustoEmployee {
  uuid: string
  version: string
  first_name: string
  middle_initial?: string
  last_name: string
  email: string
  ssn?: string
  date_of_birth: string
  department?: string
  terminated: boolean
  two_percent_shareholder: boolean
  onboarded: boolean
  home_address?: {
    street_1: string
    street_2?: string
    city: string
    state: string
    zip: string
  }
  jobs?: GustoJob[]
  compensations?: GustoCompensation[]
  custom_fields?: Record<string, string>
}

export interface GustoJob {
  uuid: string
  title: string
  rate?: number
  payment_unit: 'Year' | 'Month' | 'Week' | 'Hour' | 'Paycheck'
  current_compensation_id?: string
  hire_date: string
  location_uuid?: string
}

export interface GustoCompensation {
  uuid: string
  version: string
  job_uuid: string
  rate: number
  payment_unit: string
  flsa_status: string
  effective_date: string
}

export interface GustoPayroll {
  uuid: string
  version: string
  pay_period: {
    start_date: string
    end_date: string
  }
  check_date: string
  processed: boolean
  totals: {
    company_debit: number
    net_pay: number
    tax_debit: number
  }
}

export interface GustoPayStub {
  uuid: string
  employee_uuid: string
  check_date: string
  gross_pay: number
  net_pay: number
  taxes: number
  deductions: number
}

export class GustoAPI {
  private accessToken: string
  private refreshToken: string
  private clientId: string
  private clientSecret: string
  private companyId?: string

  constructor(credentials: IntegrationCredentials) {
    this.accessToken = credentials.accessToken || ''
    this.refreshToken = credentials.refreshToken || ''
    this.clientId = credentials.clientId || ''
    this.clientSecret = credentials.clientSecret || ''
    this.companyId = credentials.additionalFields?.companyId
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${GUSTO_API_BASE}${endpoint}`

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Gusto-API-Version': GUSTO_API_VERSION,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Gusto API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
      )
    }

    return response.json()
  }

  /**
   * Refresh OAuth access token
   */
  async refreshAccessToken(): Promise<{
    accessToken: string
    refreshToken: string
    expiresAt: string
  }> {
    const response = await fetch(`${GUSTO_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh Gusto access token')
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  // Company endpoints

  async getCompany(): Promise<GustoCompany> {
    if (!this.companyId) {
      // Get current user's companies
      const companies = await this.request<GustoCompany[]>('GET', '/v1/companies')
      if (companies.length > 0) {
        this.companyId = companies[0].uuid
        return companies[0]
      }
      throw new Error('No company found')
    }
    return this.request<GustoCompany>('GET', `/v1/companies/${this.companyId}`)
  }

  // Employee endpoints

  async listEmployees(): Promise<GustoEmployee[]> {
    if (!this.companyId) await this.getCompany()
    return this.request<GustoEmployee[]>('GET', `/v1/companies/${this.companyId}/employees`)
  }

  async getEmployee(employeeId: string): Promise<GustoEmployee> {
    return this.request<GustoEmployee>('GET', `/v1/employees/${employeeId}`)
  }

  async createEmployee(data: Partial<GustoEmployee>): Promise<GustoEmployee> {
    if (!this.companyId) await this.getCompany()
    return this.request<GustoEmployee>(
      'POST',
      `/v1/companies/${this.companyId}/employees`,
      data as Record<string, unknown>
    )
  }

  async updateEmployee(employeeId: string, data: Partial<GustoEmployee>): Promise<GustoEmployee> {
    return this.request<GustoEmployee>('PUT', `/v1/employees/${employeeId}`, data as Record<string, unknown>)
  }

  async terminateEmployee(employeeId: string, terminationDate: string): Promise<void> {
    // Get employee first to get version
    const employee = await this.getEmployee(employeeId)

    await this.request('PUT', `/v1/employees/${employeeId}`, {
      version: employee.version,
      termination_date: terminationDate,
    })
  }

  // Payroll endpoints

  async listPayrolls(): Promise<GustoPayroll[]> {
    if (!this.companyId) await this.getCompany()
    return this.request<GustoPayroll[]>('GET', `/v1/companies/${this.companyId}/payrolls`)
  }

  async getPayroll(payrollId: string): Promise<GustoPayroll> {
    if (!this.companyId) await this.getCompany()
    return this.request<GustoPayroll>('GET', `/v1/companies/${this.companyId}/payrolls/${payrollId}`)
  }

  async createPayroll(data: {
    payPeriodStart: string
    payPeriodEnd: string
    checkDate: string
  }): Promise<GustoPayroll> {
    if (!this.companyId) await this.getCompany()
    return this.request<GustoPayroll>('POST', `/v1/companies/${this.companyId}/payrolls`, {
      pay_period: {
        start_date: data.payPeriodStart,
        end_date: data.payPeriodEnd,
      },
      check_date: data.checkDate,
    })
  }

  // Pay stub endpoints

  async getPayStubs(employeeId: string): Promise<GustoPayStub[]> {
    return this.request<GustoPayStub[]>('GET', `/v1/employees/${employeeId}/pay_stubs`)
  }

  // Location endpoints

  async listLocations(): Promise<GustoLocation[]> {
    if (!this.companyId) await this.getCompany()
    return this.request<GustoLocation[]>('GET', `/v1/companies/${this.companyId}/locations`)
  }
}
