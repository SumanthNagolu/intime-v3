/**
 * Okta Identity Provider
 * Integration with Okta for SCIM user provisioning
 */

import { BaseIdentityProvider } from '../../base-provider'
import type {
  IntegrationConfig,
  IntegrationCredentials,
  ProviderCapabilities,
  WebhookEvent,
  ScimUser,
} from '../../types'
import { OktaAPI, type OktaUser, type OktaGroup } from './okta-scim-api'

export class OktaProvider extends BaseIdentityProvider {
  private api: OktaAPI

  constructor(config: IntegrationConfig) {
    super(config)
    this.api = new OktaAPI(config.credentials)
  }

  get providerId(): string {
    return 'okta'
  }

  get providerName(): string {
    return 'Okta'
  }

  get capabilities(): ProviderCapabilities {
    return {
      canSyncEmployees: false,
      canProcessPayroll: false,
      canSendDocuments: false,
      canManageUsers: true,
      supportsWebhooks: true,
      supportsBidirectionalSync: true,
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const users = await this.api.listUsers(1)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: message }
    }
  }

  /**
   * Refresh tokens (Okta uses API tokens, not OAuth refresh)
   */
  async refreshTokens(): Promise<IntegrationCredentials> {
    // Okta API tokens don't expire in the same way as OAuth tokens
    // They are valid until revoked or until the configured lifetime
    return this.credentials
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    return this.api.verifyWebhookSignature(payload, signature, this.credentials.webhookSecret || '')
  }

  /**
   * Handle incoming webhook (Okta Event Hooks)
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    this.log('info', `Handling webhook: ${event.eventType}`, { eventId: event.id })

    switch (event.eventType) {
      case 'user.lifecycle.create':
        // User created in Okta
        // TODO: Create user in InTime
        break
      case 'user.lifecycle.activate':
        // User activated
        break
      case 'user.lifecycle.deactivate':
        // User deactivated
        // TODO: Deactivate user in InTime
        break
      case 'user.lifecycle.suspend':
        // User suspended
        break
      case 'user.lifecycle.unsuspend':
        // User unsuspended
        break
      case 'user.lifecycle.delete':
        // User deleted (hard delete)
        break
      case 'user.account.update_profile':
        // Profile updated
        // TODO: Sync profile changes
        break
      case 'group.user_membership.add':
        // User added to group
        break
      case 'group.user_membership.remove':
        // User removed from group
        break
      default:
        this.log('warn', `Unknown webhook event type: ${event.eventType}`)
    }
  }

  /**
   * List all users
   */
  async listUsers(): Promise<OktaUser[]> {
    try {
      return await this.api.listUsers()
    } catch (error) {
      this.handleError(error, 'Failed to list users')
    }
  }

  /**
   * Get single user
   */
  async getUser(userId: string): Promise<OktaUser> {
    try {
      return await this.api.getUser(userId)
    } catch (error) {
      this.handleError(error, 'Failed to get user')
    }
  }

  /**
   * Create user
   */
  async createUser(userData: ScimUser): Promise<OktaUser> {
    try {
      const oktaUser = this.mapToOktaUser(userData)
      return await this.api.createUser(oktaUser)
    } catch (error) {
      this.handleError(error, 'Failed to create user')
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userData: Partial<ScimUser>): Promise<OktaUser> {
    try {
      const oktaUser = this.mapToOktaUser(userData as ScimUser)
      return await this.api.updateUser(userId, oktaUser)
    } catch (error) {
      this.handleError(error, 'Failed to update user')
    }
  }

  /**
   * Delete user (deactivate then delete)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Okta requires deactivation before deletion
      await this.api.deactivateUser(userId)
      await this.api.deleteUser(userId)
    } catch (error) {
      this.handleError(error, 'Failed to delete user')
    }
  }

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<void> {
    try {
      await this.api.activateUser(userId)
    } catch (error) {
      this.handleError(error, 'Failed to activate user')
    }
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      await this.api.deactivateUser(userId)
    } catch (error) {
      this.handleError(error, 'Failed to deactivate user')
    }
  }

  /**
   * List groups
   */
  async listGroups(): Promise<OktaGroup[]> {
    try {
      return await this.api.listGroups()
    } catch (error) {
      this.handleError(error, 'Failed to list groups')
    }
  }

  /**
   * Add user to group
   */
  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    try {
      await this.api.addUserToGroup(groupId, userId)
    } catch (error) {
      this.handleError(error, 'Failed to add user to group')
    }
  }

  /**
   * Remove user from group
   */
  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    try {
      await this.api.removeUserFromGroup(groupId, userId)
    } catch (error) {
      this.handleError(error, 'Failed to remove user from group')
    }
  }

  /**
   * Sync all users from Okta to InTime
   */
  async syncUsersToInTime(): Promise<{ synced: number; errors: string[] }> {
    const errors: string[] = []
    let synced = 0

    try {
      const oktaUsers = await this.api.listUsers()

      for (const oktaUser of oktaUsers) {
        try {
          const scimUser = this.mapFromOktaUser(oktaUser)
          // TODO: Upsert user in InTime database
          synced++
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Failed to sync user ${oktaUser.id}: ${message}`)
        }
      }

      return { synced, errors }
    } catch (error) {
      this.handleError(error, 'Failed to sync users')
    }
  }

  /**
   * Map SCIM user to Okta format
   */
  private mapToOktaUser(scim: ScimUser): Partial<OktaUser> {
    return {
      profile: {
        login: scim.userName,
        email: scim.emails[0]?.value || scim.userName,
        firstName: scim.name.givenName,
        lastName: scim.name.familyName,
      },
    }
  }

  /**
   * Map Okta user to SCIM format
   */
  private mapFromOktaUser(okta: OktaUser): ScimUser {
    return {
      id: okta.id,
      externalId: okta.id,
      userName: okta.profile.login,
      active: okta.status === 'ACTIVE',
      name: {
        givenName: okta.profile.firstName,
        familyName: okta.profile.lastName,
        formatted: `${okta.profile.firstName} ${okta.profile.lastName}`,
      },
      emails: [
        {
          value: okta.profile.email,
          type: 'work',
          primary: true,
        },
      ],
    }
  }
}
