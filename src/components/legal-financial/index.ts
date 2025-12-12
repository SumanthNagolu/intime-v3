// Wave 3: Legal & Financial Infrastructure
// UI Components for compliance, contracts, and rates

// COMPLIANCE-01: Compliance Tracking System
export {
  ComplianceStatusBadge,
  COMPLIANCE_STATUS_CONFIG,
  type ComplianceStatus,
} from './compliance'
export { ComplianceItemsSection } from './compliance'
export { ComplianceItemForm } from './compliance'
export { ComplianceRequirementForm } from './compliance'
export { ExpiringComplianceWidget } from './compliance'

// CONTRACTS-01: Contract Lifecycle Management
export {
  ContractStatusBadge,
  ContractTypeBadge,
  CONTRACT_STATUS_CONFIG,
  CONTRACT_TYPE_CONFIG,
  type ContractStatus,
  type ContractType,
} from './contracts'
export { ContractsSection } from './contracts'
export { ContractForm } from './contracts'
export { ContractVersionHistory } from './contracts'
export { ContractSignatories } from './contracts'

// RATES-01: Rate Card Management
export { RateCardManager } from './rates'
export { RateCardItemEditor } from './rates'
export { EntityRateWidget } from './rates'
export { MarginCalculator } from './rates'
export { RateApprovalDialog } from './rates'
