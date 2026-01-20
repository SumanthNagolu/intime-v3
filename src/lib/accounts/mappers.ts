/**
 * Account Data Mappers
 *
 * Functions to map API response data to section-specific data types.
 * Used by both wizard and workspace to transform account data for sections.
 */

import type {
  IdentitySectionData,
  LocationsSectionData,
  BillingSectionData,
  ContactsSectionData,
  ContractsSectionData,
  ComplianceSectionData,
  TeamSectionData,
  AccountAddress,
  AccountContact,
  AccountContract,
  AccountCompliance,
} from './types'
import { DEFAULT_PHONE } from './types'
import type { PhoneInputValue } from '@/components/ui/phone-input'

/**
 * Parse phone value from string or object format
 */
function parsePhone(phone: unknown): PhoneInputValue {
  if (!phone) return { ...DEFAULT_PHONE }

  // If already an object with the right shape
  if (typeof phone === 'object' && phone !== null) {
    const p = phone as Record<string, unknown>
    return {
      countryCode: ((p.countryCode as string) || 'US') as PhoneInputValue['countryCode'],
      number: (p.number as string) || '',
    }
  }

  // If it's a string, assume US country code
  if (typeof phone === 'string') {
    return {
      countryCode: 'US',
      number: phone.replace(/^\+1\s?/, ''), // Remove +1 prefix if present
    }
  }

  return { ...DEFAULT_PHONE }
}

/**
 * Map account data to IdentitySectionData
 */
export function mapToIdentityData(account: Record<string, unknown>): IdentitySectionData {
  // Map company_type/relationship_type to companyType
  let companyType = 'direct_client'
  if (account.company_type) {
    companyType = account.company_type as string
  } else if (account.relationship_type) {
    switch (account.relationship_type) {
      case 'implementation_partner':
        companyType = 'implementation_partner'
        break
      case 'prime_vendor':
        companyType = 'staffing_vendor'
        break
      default:
        companyType = 'direct_client'
    }
  }

  // Load industries - prioritize array, then fall back to single industry field
  let industries: string[] = []
  if (Array.isArray(account.industries) && account.industries.length > 0) {
    industries = account.industries as string[]
  } else if (account.industry) {
    industries = [account.industry as string]
  }

  return {
    accountType: (account.account_type as 'company' | 'person') || 'company',
    name: (account.name as string) || '',
    legalName: (account.legal_name as string) || '',
    dba: (account.dba_name as string) || '',
    taxId: (account.tax_id as string) || '',
    email: (account.email as string) || '',
    phone: parsePhone(account.phone),
    website: (account.website as string) || '',
    linkedinUrl: (account.linkedin_url as string) || '',
    description: (account.description as string) || '',
    industries,
    companyType,
    tier: (account.tier as string) || '',
    segment: (account.segment as string) || '',
    status: (account.status as string) || 'prospect',
    foundedYear: account.founded_year ? String(account.founded_year) : '',
    employeeRange: (account.employee_range as string) || '',
    revenueRange: (account.revenue_range as string) || '',
    ownershipType: (account.ownership_type as string) || '',
  }
}

/**
 * Map account data to LocationsSectionData
 */
export function mapToLocationsData(account: Record<string, unknown>): LocationsSectionData {
  const rawAddresses = account.addresses as Record<string, unknown>[] | undefined

  const addresses: AccountAddress[] = (rawAddresses || []).map((a) => ({
    id: (a.id as string) || crypto.randomUUID(),
    type: (a.type as string) || (a.address_type as string) || 'office',
    addressLine1: (a.addressLine1 as string) || (a.address_line_1 as string) || '',
    addressLine2: (a.addressLine2 as string) || (a.address_line_2 as string) || '',
    city: (a.city as string) || '',
    state: (a.state as string) || (a.state_province as string) || '',
    postalCode: (a.postalCode as string) || (a.postal_code as string) || '',
    country: (a.country as string) || (a.country_code as string) || 'US',
    isPrimary: (a.isPrimary as boolean) ?? (a.is_primary as boolean) ?? false,
  }))

  return { addresses }
}

/**
 * Map account data to BillingSectionData
 */
export function mapToBillingData(account: Record<string, unknown>): BillingSectionData {
  return {
    billingEntityName: (account.billingEntityName as string) || (account.billing_entity_name as string) || '',
    billingEmail: (account.billingEmail as string) || (account.billing_email as string) || '',
    billingPhone: parsePhone(account.billingPhone || account.billing_phone),
    billingFrequency: (account.billingFrequency as string) || (account.billing_frequency as string) || 'monthly',
    paymentTermsDays: account.paymentTermsDays ? String(account.paymentTermsDays) : (account.payment_terms_days ? String(account.payment_terms_days) : '30'),
    poRequired: (account.poRequired as boolean) ?? (account.po_required as boolean) ?? false,
    currentPoNumber: (account.currentPoNumber as string) || (account.current_po_number as string) || '',
    poExpirationDate: (account.poExpirationDate as string) || (account.po_expiration_date as string) || null,
    currency: (account.defaultCurrency as string) || (account.default_currency as string) || 'USD',
    invoiceFormat: (account.invoiceFormat as string) || (account.invoice_format as string) || 'standard',
    invoiceDeliveryMethod: (account.invoiceDeliveryMethod as string) || (account.invoice_delivery_method as string) || 'email',
    creditStatus: (account.creditStatus as string) || (account.credit_status as string) || '',
    creditLimit: account.creditLimit ? String(account.creditLimit) : (account.credit_limit ? String(account.credit_limit) : ''),
    defaultMarkupPercentage: account.defaultMarkupPercentage ? String(account.defaultMarkupPercentage) : (account.default_markup_percentage ? String(account.default_markup_percentage) : ''),
    defaultFeePercentage: account.defaultFeePercentage ? String(account.defaultFeePercentage) : (account.default_fee_percentage ? String(account.default_fee_percentage) : ''),
    requiresApprovalForSubmission: (account.requiresApprovalForSubmission as boolean) ?? (account.requires_approval_for_submission as boolean) ?? false,
  }
}

/**
 * Map account data to ContactsSectionData
 */
export function mapToContactsData(account: Record<string, unknown>): ContactsSectionData {
  const rawContacts = account.contacts as Record<string, unknown>[] | undefined

  const contacts: AccountContact[] = (rawContacts || []).map((c) => ({
    id: (c.id as string) || crypto.randomUUID(),
    firstName: (c.firstName as string) || (c.first_name as string) || '',
    lastName: (c.lastName as string) || (c.last_name as string) || '',
    email: (c.email as string) || '',
    phone: parsePhone(c.phone),
    mobile: c.mobile ? parsePhone(c.mobile) : undefined,
    title: (c.title as string) || '',
    department: (c.department as string) || '',
    role: (c.role as string) || 'primary',
    decisionAuthority: (c.decisionAuthority as string) || (c.decision_authority as string) || 'influencer',
    isPrimary: (c.isPrimary as boolean) ?? (c.is_primary as boolean) ?? false,
    linkedInUrl: (c.linkedInUrl as string) || (c.linkedin_url as string) || '',
    notes: (c.notes as string) || '',
  }))

  return { contacts }
}

/**
 * Map account data to ContractsSectionData
 */
export function mapToContractsData(account: Record<string, unknown>): ContractsSectionData {
  const rawContracts = account.contracts as Record<string, unknown>[] | undefined

  const contracts: AccountContract[] = (rawContracts || []).map((c) => ({
    id: (c.id as string) || crypto.randomUUID(),
    type: (c.type as string) || (c.contract_type as string) || 'msa',
    name: (c.name as string) || (c.contract_name as string) || '',
    number: (c.number as string) || (c.contract_number as string) || '',
    status: (c.status as string) || 'draft',
    effectiveDate: (c.effectiveDate as string | null) || (c.effective_date as string | null) || null,
    expiryDate: (c.expiryDate as string | null) || (c.expiry_date as string | null) || null,
    autoRenew: (c.autoRenew as boolean) ?? (c.auto_renew as boolean) ?? false,
    contractValue: c.contractValue ? String(c.contractValue) : (c.contract_value ? String(c.contract_value) : undefined),
    currency: (c.currency as string) || 'USD',
    fileUrl: (c.fileUrl as string) || (c.document_url as string) || undefined,
  }))

  return { contracts }
}

/**
 * Map account data to ComplianceSectionData
 */
export function mapToComplianceData(account: Record<string, unknown>): ComplianceSectionData {
  const rawCompliance = account.compliance as Record<string, unknown> | null | undefined

  if (!rawCompliance) {
    return {
      compliance: {
        insurance: {
          generalLiability: false,
          professionalLiability: false,
          workersComp: false,
          cyberLiability: false,
        },
        backgroundCheck: {
          required: false,
          level: '',
        },
        drugTest: {
          required: false,
        },
        certifications: [],
      },
    }
  }

  const insurance = rawCompliance.insurance as Record<string, boolean> | undefined
  const backgroundCheck = rawCompliance.backgroundCheck as Record<string, unknown> | undefined
  const drugTest = rawCompliance.drugTest as Record<string, boolean> | undefined

  const compliance: AccountCompliance = {
    insurance: {
      generalLiability: insurance?.generalLiability ?? false,
      professionalLiability: insurance?.professionalLiability ?? false,
      workersComp: insurance?.workersComp ?? false,
      cyberLiability: insurance?.cyberLiability ?? false,
    },
    backgroundCheck: {
      required: backgroundCheck?.required as boolean ?? false,
      level: (backgroundCheck?.level as string) || '',
    },
    drugTest: {
      required: drugTest?.required ?? false,
    },
    certifications: (rawCompliance.certifications as string[]) || [],
  }

  return { compliance }
}

/**
 * Map account data to TeamSectionData
 */
export function mapToTeamData(account: Record<string, unknown>): TeamSectionData {
  const rawTeam = account.team as Record<string, unknown> | undefined

  return {
    team: {
      ownerId: rawTeam?.ownerId as string || rawTeam?.owner_id as string || account.owner_id as string || '',
      ownerName: rawTeam?.ownerName as string || undefined,
      accountManagerId: rawTeam?.accountManagerId as string || rawTeam?.account_manager_id as string || account.account_manager_id as string || '',
      accountManagerName: rawTeam?.accountManagerName as string || undefined,
      recruiterId: rawTeam?.recruiterId as string || rawTeam?.recruiter_id as string || account.primary_recruiter_id as string || '',
      recruiterName: rawTeam?.recruiterName as string || undefined,
      salesLeadId: rawTeam?.salesLeadId as string || rawTeam?.sales_lead_id as string || account.sales_lead_id as string || '',
      salesLeadName: rawTeam?.salesLeadName as string || undefined,
    },
    preferredContactMethod: (account.preferred_contact_method as string) || 'email',
    meetingCadence: (account.meeting_cadence as string) || 'weekly',
    submissionMethod: (account.submission_method as string) || 'email',
  }
}
