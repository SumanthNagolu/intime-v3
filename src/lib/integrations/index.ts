/**
 * Integrations Library
 * Central exports for all integration providers and utilities
 */

// Types
export * from './types'

// Base classes
export { BaseProvider, BasePayrollProvider, BaseESignatureProvider, BaseIdentityProvider } from './base-provider'

// Provider registry
export { providerRegistry, registerProvider } from './provider-registry'

// Gusto Payroll Provider
export { GustoProvider } from './payroll/gusto/GustoProvider'
export { GustoAPI } from './payroll/gusto/gusto-api'

// DocuSign E-Signature Provider
export { DocuSignProvider } from './esignature/docusign/DocuSignProvider'
export { DocuSignAPI } from './esignature/docusign/docusign-api'

// Okta Identity Provider
export { OktaProvider } from './identity/okta/OktaProvider'
export { OktaAPI } from './identity/okta/okta-scim-api'

// Initialize providers - register all providers on import
import { registerProvider } from './provider-registry'
import { GustoProvider } from './payroll/gusto/GustoProvider'
import { DocuSignProvider } from './esignature/docusign/DocuSignProvider'
import { OktaProvider } from './identity/okta/OktaProvider'

// Register Gusto
registerProvider({
  id: 'gusto',
  name: 'Gusto',
  category: 'payroll',
  description: 'Full-service payroll, benefits, and HR for modern businesses',
  logoUrl: '/integrations/gusto-logo.svg',
  docsUrl: 'https://docs.gusto.com/',
  constructor: GustoProvider,
})

// Register DocuSign
registerProvider({
  id: 'docusign',
  name: 'DocuSign',
  category: 'esignature',
  description: 'Electronic signature and agreement cloud',
  logoUrl: '/integrations/docusign-logo.svg',
  docsUrl: 'https://developers.docusign.com/',
  constructor: DocuSignProvider,
})

// Register Okta
registerProvider({
  id: 'okta',
  name: 'Okta',
  category: 'identity',
  description: 'Identity and access management',
  logoUrl: '/integrations/okta-logo.svg',
  docsUrl: 'https://developer.okta.com/',
  constructor: OktaProvider,
})
