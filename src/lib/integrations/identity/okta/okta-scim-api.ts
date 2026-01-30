/**
 * Okta API Client
 * Low-level API wrapper for Okta Users/Groups API
 */

import crypto from 'crypto'
import type { IntegrationCredentials } from '../../types'

export interface OktaUser {
  id: string
  status: 'STAGED' | 'PROVISIONED' | 'ACTIVE' | 'RECOVERY' | 'LOCKED_OUT' | 'PASSWORD_EXPIRED' | 'SUSPENDED' | 'DEPROVISIONED'
  created: string
  activated?: string
  statusChanged?: string
  lastLogin?: string
  lastUpdated: string
  profile: OktaUserProfile
  credentials?: {
    password?: Record<string, unknown>
    recovery_question?: {
      question: string
    }
    provider: {
      type: string
      name: string
    }
  }
  _links?: Record<string, unknown>
}

export interface OktaUserProfile {
  login: string
  email: string
  firstName: string
  lastName: string
  secondEmail?: string
  mobilePhone?: string
  primaryPhone?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  countryCode?: string
  department?: string
  title?: string
  employeeNumber?: string
  manager?: string
  managerId?: string
  organization?: string
  division?: string
  [key: string]: string | undefined
}

export interface OktaGroup {
  id: string
  created: string
  lastUpdated: string
  lastMembershipUpdated: string
  objectClass: string[]
  type: 'OKTA_GROUP' | 'APP_GROUP' | 'BUILT_IN'
  profile: {
    name: string
    description?: string
  }
}

export interface OktaAppUser {
  id: string
  externalId?: string
  created: string
  lastUpdated: string
  scope: 'USER' | 'GROUP'
  status: 'STAGED' | 'PROVISIONED' | 'ACTIVE' | 'INACTIVE' | 'DELETED'
  credentials?: {
    userName: string
    password?: Record<string, unknown>
  }
  profile?: Record<string, string>
}

export class OktaAPI {
  private apiToken: string
  private domain: string

  constructor(credentials: IntegrationCredentials) {
    this.apiToken = credentials.apiKey || ''
    this.domain = credentials.baseUrl || ''

    // Ensure domain doesn't have trailing slash
    if (this.domain.endsWith('/')) {
      this.domain = this.domain.slice(0, -1)
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.domain}/api/v1${endpoint}`

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `SSWS ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Okta API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
      )
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  /**
   * Verify webhook signature (Okta Event Hooks)
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Okta uses HMAC-SHA256 for event hook verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64')

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    } catch {
      return false
    }
  }

  // User endpoints

  async listUsers(limit = 200): Promise<OktaUser[]> {
    return this.request<OktaUser[]>('GET', `/users?limit=${limit}`)
  }

  async searchUsers(query: string): Promise<OktaUser[]> {
    return this.request<OktaUser[]>('GET', `/users?q=${encodeURIComponent(query)}`)
  }

  async getUser(userId: string): Promise<OktaUser> {
    return this.request<OktaUser>('GET', `/users/${userId}`)
  }

  async getUserByLogin(login: string): Promise<OktaUser> {
    return this.request<OktaUser>('GET', `/users/${encodeURIComponent(login)}`)
  }

  async createUser(user: Partial<OktaUser>, activate = true): Promise<OktaUser> {
    return this.request<OktaUser>(
      'POST',
      `/users?activate=${activate}`,
      user as Record<string, unknown>
    )
  }

  async updateUser(userId: string, profile: Partial<OktaUserProfile>): Promise<OktaUser> {
    return this.request<OktaUser>('POST', `/users/${userId}`, { profile })
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request('DELETE', `/users/${userId}`)
  }

  async activateUser(userId: string, sendEmail = false): Promise<void> {
    await this.request('POST', `/users/${userId}/lifecycle/activate?sendEmail=${sendEmail}`)
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.request('POST', `/users/${userId}/lifecycle/deactivate`)
  }

  async suspendUser(userId: string): Promise<void> {
    await this.request('POST', `/users/${userId}/lifecycle/suspend`)
  }

  async unsuspendUser(userId: string): Promise<void> {
    await this.request('POST', `/users/${userId}/lifecycle/unsuspend`)
  }

  async resetPassword(userId: string, sendEmail = true): Promise<void> {
    await this.request('POST', `/users/${userId}/lifecycle/reset_password?sendEmail=${sendEmail}`)
  }

  // Group endpoints

  async listGroups(limit = 200): Promise<OktaGroup[]> {
    return this.request<OktaGroup[]>('GET', `/groups?limit=${limit}`)
  }

  async getGroup(groupId: string): Promise<OktaGroup> {
    return this.request<OktaGroup>('GET', `/groups/${groupId}`)
  }

  async createGroup(name: string, description?: string): Promise<OktaGroup> {
    return this.request<OktaGroup>('POST', '/groups', {
      profile: { name, description },
    })
  }

  async updateGroup(groupId: string, name: string, description?: string): Promise<OktaGroup> {
    return this.request<OktaGroup>('PUT', `/groups/${groupId}`, {
      profile: { name, description },
    })
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.request('DELETE', `/groups/${groupId}`)
  }

  async listGroupMembers(groupId: string): Promise<OktaUser[]> {
    return this.request<OktaUser[]>('GET', `/groups/${groupId}/users`)
  }

  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    await this.request('PUT', `/groups/${groupId}/users/${userId}`)
  }

  async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    await this.request('DELETE', `/groups/${groupId}/users/${userId}`)
  }

  // User groups

  async listUserGroups(userId: string): Promise<OktaGroup[]> {
    return this.request<OktaGroup[]>('GET', `/users/${userId}/groups`)
  }

  // App user endpoints (for app-specific user management)

  async listAppUsers(appId: string): Promise<OktaAppUser[]> {
    return this.request<OktaAppUser[]>('GET', `/apps/${appId}/users`)
  }

  async assignUserToApp(appId: string, userId: string, profile?: Record<string, string>): Promise<OktaAppUser> {
    return this.request<OktaAppUser>('POST', `/apps/${appId}/users`, {
      id: userId,
      scope: 'USER',
      profile,
    })
  }

  async unassignUserFromApp(appId: string, userId: string): Promise<void> {
    await this.request('DELETE', `/apps/${appId}/users/${userId}`)
  }
}
