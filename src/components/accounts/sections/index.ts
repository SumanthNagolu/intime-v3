/**
 * Unified Account Sections
 *
 * These components handle all three modes: create, view, and edit.
 * Import and use the same component for wizard steps, detail views, and edit panels.
 */

export { IdentitySection } from './IdentitySection'
export { BillingSection } from './BillingSection'
export { TeamSection } from './TeamSection'
export { ComplianceSection } from './ComplianceSection'
export { LocationsSection } from './LocationsSection'
export { ContactsSection } from './ContactsSection'
export { ContractsSection } from './ContractsSection'

// Re-export types
export type { SectionMode } from '@/lib/accounts/types'
