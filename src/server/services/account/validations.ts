/**
 * Account Section Validation Schemas
 *
 * Re-exports and extends schemas from src/lib/accounts/schemas.ts
 * for use in per-section save endpoints.
 */

import { z } from 'zod'
import {
  phoneSchema,
  addressSchema,
  contactSchema,
  contractSchema,
  complianceSchema,
  teamSchema,
  identitySectionSchema,
  billingSectionSchema,
} from '@/lib/accounts/schemas'

// ============ RE-EXPORTS ============

export { phoneSchema, addressSchema, contactSchema, contractSchema, complianceSchema }

// ============ SECTION SCHEMAS FOR SAVE ENDPOINTS ============

/**
 * Identity section - core company info and classification
 */
export const identitySchema = identitySectionSchema

/**
 * Locations section - addresses array
 */
export const locationsSchema = z.object({
  addresses: z.array(addressSchema),
})

/**
 * Billing section - payment terms, PO, invoicing
 */
export const billingSchema = billingSectionSchema

/**
 * Contacts section - account contacts array
 */
export const contactsSchema = z.object({
  contacts: z.array(contactSchema),
})

/**
 * Contracts section - contracts array
 */
export const contractsSchema = z.object({
  contracts: z.array(contractSchema),
})

/**
 * Compliance section - insurance, background check, drug test, certifications
 */
export const accountComplianceSchema = z.object({
  compliance: complianceSchema,
})

/**
 * Team section - ownership, assignments, preferences
 */
export const accountTeamSchema = z.object({
  team: teamSchema,
  preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams']).default('email'),
  meetingCadence: z
    .enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed'])
    .default('weekly'),
  submissionMethod: z.string().default('email'),
})

// ============ TYPE EXPORTS ============

export type IdentityData = z.infer<typeof identitySchema>
export type LocationsData = z.infer<typeof locationsSchema>
export type BillingData = z.infer<typeof billingSchema>
export type ContactsData = z.infer<typeof contactsSchema>
export type ContractsData = z.infer<typeof contractsSchema>
export type ComplianceData = z.infer<typeof accountComplianceSchema>
export type TeamData = z.infer<typeof accountTeamSchema>
