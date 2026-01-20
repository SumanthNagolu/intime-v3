/**
 * Compliance Section Service
 *
 * Handles saving compliance requirements data for an account.
 * Uses the company_compliance_requirements table.
 */

import { TRPCError } from '@trpc/server'
import { getAdminClient } from '@/lib/supabase/admin'
import type { ComplianceData } from '../validations'

interface SaveContext {
  orgId: string
  userId: string
}

export async function saveCompliance(
  accountId: string,
  data: ComplianceData,
  ctx: SaveContext
) {
  const adminClient = getAdminClient()

  // Build compliance data payload
  const complianceData = {
    company_id: accountId,
    org_id: ctx.orgId,

    // Insurance requirements
    general_liability_required: data.compliance.insurance.generalLiability,
    professional_liability_required: data.compliance.insurance.professionalLiability,
    workers_comp_required: data.compliance.insurance.workersComp,
    cyber_liability_required: data.compliance.insurance.cyberLiability,

    // Background check requirements
    background_check_required: data.compliance.backgroundCheck.required,
    background_check_level: data.compliance.backgroundCheck.level || null,

    // Drug test requirements
    drug_test_required: data.compliance.drugTest.required,

    // Store certifications in custom certifications field or JSON
    // Note: certifications array stored via a separate table or preferences JSON
    updated_at: new Date().toISOString(),
    updated_by: ctx.userId,
  }

  // Check if compliance record exists for this company
  const { data: existing } = await adminClient
    .from('company_compliance_requirements')
    .select('company_id')
    .eq('company_id', accountId)
    .single()

  if (existing) {
    // Update existing record
    const { error: updateError } = await adminClient
      .from('company_compliance_requirements')
      .update(complianceData)
      .eq('company_id', accountId)

    if (updateError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to update compliance: ${updateError.message}`,
      })
    }
  } else {
    // Insert new record
    const { error: insertError } = await adminClient
      .from('company_compliance_requirements')
      .insert({
        ...complianceData,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create compliance: ${insertError.message}`,
      })
    }
  }

  // Store certifications in company preferences JSON
  if (data.compliance.certifications && data.compliance.certifications.length > 0) {
    const { data: company } = await adminClient
      .from('companies')
      .select('preferences')
      .eq('id', accountId)
      .single()

    const currentPrefs = (company?.preferences as Record<string, unknown>) || {}

    await adminClient
      .from('companies')
      .update({
        preferences: {
          ...currentPrefs,
          required_certifications: data.compliance.certifications,
        },
        updated_by: ctx.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)
      .eq('org_id', ctx.orgId)
  }

  // Update company's updated_at timestamp
  await adminClient
    .from('companies')
    .update({
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .eq('org_id', ctx.orgId)

  return { success: true }
}
