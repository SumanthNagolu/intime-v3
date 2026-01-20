/**
 * Identity Section Service
 *
 * Handles saving identity/classification data for an account.
 */

import { TRPCError } from '@trpc/server'
import { getAdminClient } from '@/lib/supabase/admin'
import type { IdentityData } from '../validations'

interface SaveContext {
  orgId: string
  userId: string
}

/**
 * Map company type to relationship_type enum value
 */
function mapCompanyTypeToRelationship(companyType: string): string {
  switch (companyType) {
    case 'implementation_partner':
      return 'implementation_partner'
    case 'staffing_vendor':
      return 'prime_vendor'
    case 'direct_client':
    default:
      return 'direct_client'
  }
}

/**
 * Map status to category
 */
function mapStatusToCategory(status: string): string {
  switch (status) {
    case 'active':
      return 'client'
    case 'inactive':
      return 'client'
    case 'prospect':
    default:
      return 'prospect'
  }
}

export async function saveIdentity(
  accountId: string,
  data: IdentityData,
  ctx: SaveContext
) {
  const adminClient = getAdminClient()

  // Map company type to relationship_type
  const relationshipType = mapCompanyTypeToRelationship(data.companyType)

  // Map status to category
  const category = mapStatusToCategory(data.status)

  // Build update payload
  const updateData = {
    // Core identity
    name: data.name,
    legal_name: data.legalName || null,
    dba_name: data.dba || null,
    tax_id: null as string | null, // Note: taxId is in the schema but not in DB column - adjust if needed
    email: data.email || null,
    phone: data.phone?.number || null,
    website: data.website || null,
    linkedin_url: data.linkedinUrl || null,
    description: data.description || null,

    // Classification
    industry: data.industries[0] || null,
    // Note: industries array stored in custom_fields if needed
    relationship_type: relationshipType,
    tier: data.tier || null,
    segment: data.segment || null,
    status: data.status || 'prospect',
    category,

    // Corporate profile
    founded_year: data.foundedYear ? parseInt(data.foundedYear, 10) : null,
    employee_range: data.employeeRange || null,
    revenue_range: data.revenueRange || null,
    ownership_type: data.ownershipType || null,

    // Store account_type and industries array in custom_fields
    custom_fields: {
      account_type: data.accountType,
      industries: data.industries,
    },

    // Audit
    updated_by: ctx.userId,
    updated_at: new Date().toISOString(),
  }

  // Update the company record
  const { data: updated, error } = await adminClient
    .from('companies')
    .update(updateData)
    .eq('id', accountId)
    .eq('org_id', ctx.orgId)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to save identity: ${error.message}`,
    })
  }

  if (!updated) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Account not found',
    })
  }

  return updated
}
