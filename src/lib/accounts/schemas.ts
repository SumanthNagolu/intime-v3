/**
 * Account Validation Schemas - Zod schemas for all account data
 *
 * Used for:
 * - Form validation in wizard and edit modes
 * - API input validation in tRPC procedures
 * - Type inference
 */

import { z } from 'zod'

// ============ PHONE SCHEMA ============

export const phoneSchema = z.object({
  countryCode: z.string().default('US'),
  number: z.string().default(''),
})

// ============ ADDRESS SCHEMA ============

export const addressSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['headquarters', 'billing', 'mailing', 'office', 'shipping']),
  addressLine1: z.string().min(1, 'Street address is required'),
  addressLine2: z.string().default(''),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').default('US'),
  isPrimary: z.boolean().default(false),
})

export type AddressSchema = z.infer<typeof addressSchema>

// ============ CONTACT SCHEMA ============

export const contactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: phoneSchema,
  mobile: phoneSchema.optional(),
  title: z.string().default(''),
  department: z.string().default(''),
  role: z.enum(['primary', 'billing', 'executive_sponsor', 'hiring_manager', 'hr', 'procurement']),
  decisionAuthority: z.enum(['decision_maker', 'influencer', 'champion', 'gatekeeper']),
  influenceLevel: z.number().min(1).max(5).optional(),
  isPrimary: z.boolean().default(false),
  linkedInUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams']).optional(),
  bestTimeToContact: z.string().optional(),
  doNotCall: z.boolean().default(false),
  notes: z.string().optional(),
})

export type ContactSchema = z.infer<typeof contactSchema>

// ============ CONTRACT SCHEMA ============

export const contractSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['msa', 'nda', 'sow', 'rate_agreement', 'subcontract']),
  name: z.string().min(1, 'Contract name is required'),
  number: z.string().default(''),
  status: z.enum(['draft', 'active', 'pending_signature', 'expired']).default('draft'),
  effectiveDate: z.union([z.date(), z.string(), z.null()]).optional(),
  expiryDate: z.union([z.date(), z.string(), z.null()]).optional(),
  autoRenew: z.boolean().default(false),
  contractValue: z.string().optional(),
  currency: z.string().default('USD'),
  fileUrl: z.string().optional(),
  filePath: z.string().optional(),
  fileData: z.string().optional(),
  fileName: z.string().optional(),
  fileMimeType: z.string().optional(),
})

export type ContractSchema = z.infer<typeof contractSchema>

// ============ COMPLIANCE SCHEMA ============

export const complianceSchema = z.object({
  insurance: z.object({
    generalLiability: z.boolean().default(false),
    professionalLiability: z.boolean().default(false),
    workersComp: z.boolean().default(false),
    cyberLiability: z.boolean().default(false),
  }),
  backgroundCheck: z.object({
    required: z.boolean().default(false),
    level: z.string().default(''),
  }),
  drugTest: z.object({
    required: z.boolean().default(false),
  }),
  certifications: z.array(z.string()).default([]),
})

export type ComplianceSchema = z.infer<typeof complianceSchema>

// ============ TEAM SCHEMA ============

export const teamSchema = z.object({
  ownerId: z.string().uuid().optional().or(z.literal('')),
  ownerName: z.string().optional(),
  accountManagerId: z.string().uuid().optional().or(z.literal('')),
  accountManagerName: z.string().optional(),
  recruiterId: z.string().uuid().optional().or(z.literal('')),
  recruiterName: z.string().optional(),
  salesLeadId: z.string().uuid().optional().or(z.literal('')),
  salesLeadName: z.string().optional(),
  isStrategic: z.boolean().optional(),
  requiresApprovalForSubmission: z.boolean().optional(),
})

export type TeamSchema = z.infer<typeof teamSchema>

// ============ IDENTITY SECTION SCHEMA ============

export const identitySectionSchema = z.object({
  // Account Type
  accountType: z.enum(['company', 'person']).default('company'),
  // Core Identity
  name: z.string().min(2, 'Name must be at least 2 characters'),
  legalName: z.string().default(''),
  dba: z.string().default(''),
  taxId: z.string().default(''),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: phoneSchema,
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  description: z.string().max(2000, 'Description too long').default(''),
  // Classification
  industries: z.array(z.string()).min(1, 'Select at least one industry'),
  companyType: z
    .enum(['direct_client', 'implementation_partner', 'staffing_vendor', ''])
    .default('direct_client'),
  tier: z.enum(['standard', 'preferred', 'strategic', 'exclusive', '']).default(''),
  segment: z.enum(['enterprise', 'mid_market', 'smb', 'startup', '']).default(''),
  status: z.enum(['prospect', 'active', 'inactive']).default('prospect'),
  // Corporate Profile
  foundedYear: z
    .string()
    .regex(/^(\d{4})?$/, 'Invalid year')
    .default(''),
  employeeRange: z.string().default(''),
  revenueRange: z.string().default(''),
  ownershipType: z.string().default(''),
})

export type IdentitySectionSchema = z.infer<typeof identitySectionSchema>

// ============ BILLING SECTION SCHEMA ============

export const billingSectionSchema = z.object({
  billingEntityName: z.string().default(''),
  billingEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  billingPhone: phoneSchema,
  billingFrequency: z.enum(['weekly', 'biweekly', 'monthly']).default('monthly'),
  paymentTermsDays: z.string().default('30'),
  poRequired: z.boolean().default(false),
  currentPoNumber: z.string().default(''),
  poExpirationDate: z.string().nullable().default(null),
  currency: z.string().default('USD'),
  invoiceFormat: z.string().default('standard'),
  invoiceDeliveryMethod: z.string().default('email'),
  creditStatus: z.string().default(''),
  creditLimit: z.string().default(''),
  defaultMarkupPercentage: z.string().default(''),
  defaultFeePercentage: z.string().default(''),
  requiresApprovalForSubmission: z.boolean().default(false),
})

export type BillingSectionSchema = z.infer<typeof billingSectionSchema>

// ============ TEAM SECTION SCHEMA ============

export const teamSectionSchema = z.object({
  team: teamSchema,
  preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams']).default('email'),
  meetingCadence: z
    .enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed'])
    .default('weekly'),
  submissionMethod: z.string().default('email'),
})

export type TeamSectionSchema = z.infer<typeof teamSectionSchema>

// ============ FULL ACCOUNT FORM SCHEMA ============

export const createAccountFormSchema = z.object({
  // Identity (Step 1)
  ...identitySectionSchema.shape,
  // Locations (Step 2)
  addresses: z.array(addressSchema).default([]),
  // Billing (Step 3)
  ...billingSectionSchema.shape,
  // Contacts (Step 4)
  contacts: z.array(contactSchema).default([]),
  // Contracts (Step 5)
  contracts: z.array(contractSchema).default([]),
  // Compliance (Step 6)
  compliance: complianceSchema,
  // Team (Step 7)
  ...teamSectionSchema.shape,
})

export type CreateAccountFormSchema = z.infer<typeof createAccountFormSchema>

// ============ VALIDATION HELPERS ============

/**
 * Validate a section's data
 */
export function validateSection<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    errors[path] = issue.message
  }

  return { success: false, errors }
}

/**
 * Get validation errors for wizard step
 */
export function getStepValidationErrors(
  step: number,
  formData: Record<string, unknown>
): string[] {
  const errors: string[] = []

  switch (step) {
    case 1: {
      // Identity & Classification
      if (!formData.name || (formData.name as string).length < 2) {
        errors.push('Please enter a valid company name (at least 2 characters)')
      }
      const industries = formData.industries as string[] | undefined
      if (!industries || industries.length === 0) {
        errors.push('Please select at least one industry')
      }
      break
    }
    case 2: {
      // Locations - optional, no required validation
      break
    }
    case 3: {
      // Billing - optional, no required validation
      break
    }
    case 4: {
      // Contacts - optional, no required validation
      break
    }
    case 5: {
      // Contracts - optional, no required validation
      break
    }
    case 6: {
      // Compliance - optional, no required validation
      break
    }
    case 7: {
      // Team
      const team = formData.team as { ownerId?: string } | undefined
      if (!team?.ownerId) {
        errors.push('Please assign an account owner')
      }
      break
    }
  }

  return errors
}

/**
 * Check if form data is valid for submission
 */
export function isFormValid(formData: Record<string, unknown>): boolean {
  // Check required fields across all steps
  const name = formData.name as string | undefined
  const industries = formData.industries as string[] | undefined
  const team = formData.team as { ownerId?: string } | undefined

  return Boolean(name && name.length >= 2 && industries && industries.length > 0 && team?.ownerId)
}
