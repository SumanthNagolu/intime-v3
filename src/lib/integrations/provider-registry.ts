/**
 * Provider Registry
 * Central registry for all integration providers
 */

import type { IntegrationConfig, IntegrationCategory } from './types'
import type { BaseProvider, BasePayrollProvider, BaseESignatureProvider, BaseIdentityProvider } from './base-provider'

// Provider constructor types
type ProviderConstructor<T extends BaseProvider> = new (config: IntegrationConfig) => T

interface ProviderRegistration {
  id: string
  name: string
  category: IntegrationCategory
  description: string
  logoUrl?: string
  docsUrl?: string
  constructor: ProviderConstructor<BaseProvider>
}

class ProviderRegistry {
  private providers: Map<string, ProviderRegistration> = new Map()

  /**
   * Register a provider
   */
  register(registration: ProviderRegistration): void {
    this.providers.set(registration.id, registration)
  }

  /**
   * Get provider registration by ID
   */
  getRegistration(providerId: string): ProviderRegistration | undefined {
    return this.providers.get(providerId)
  }

  /**
   * Create provider instance from config
   */
  createProvider(config: IntegrationConfig): BaseProvider {
    const registration = this.providers.get(config.provider)
    if (!registration) {
      throw new Error(`Unknown provider: ${config.provider}`)
    }
    return new registration.constructor(config)
  }

  /**
   * Create payroll provider instance
   */
  createPayrollProvider(config: IntegrationConfig): BasePayrollProvider {
    const provider = this.createProvider(config)
    if (config.category !== 'payroll') {
      throw new Error(`Provider ${config.provider} is not a payroll provider`)
    }
    return provider as BasePayrollProvider
  }

  /**
   * Create e-signature provider instance
   */
  createESignatureProvider(config: IntegrationConfig): BaseESignatureProvider {
    const provider = this.createProvider(config)
    if (config.category !== 'esignature') {
      throw new Error(`Provider ${config.provider} is not an e-signature provider`)
    }
    return provider as BaseESignatureProvider
  }

  /**
   * Create identity provider instance
   */
  createIdentityProvider(config: IntegrationConfig): BaseIdentityProvider {
    const provider = this.createProvider(config)
    if (config.category !== 'identity') {
      throw new Error(`Provider ${config.provider} is not an identity provider`)
    }
    return provider as BaseIdentityProvider
  }

  /**
   * List all registered providers
   */
  listProviders(): ProviderRegistration[] {
    return Array.from(this.providers.values())
  }

  /**
   * List providers by category
   */
  listProvidersByCategory(category: IntegrationCategory): ProviderRegistration[] {
    return Array.from(this.providers.values()).filter(p => p.category === category)
  }

  /**
   * Check if provider is registered
   */
  hasProvider(providerId: string): boolean {
    return this.providers.has(providerId)
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry()

// Provider registration function
export function registerProvider(registration: ProviderRegistration): void {
  providerRegistry.register(registration)
}

// Export the registry class for testing
export { ProviderRegistry }
