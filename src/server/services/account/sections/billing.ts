/**
 * Billing Section Service
 *
 * Handles saving billing/payment data for an account.
 * Maps billing data to company fields and company_client_details.
 */

import { TRPCError } from '@trpc/server'
import { getAdminClient } from '@/lib/supabase/admin'
import type { BillingData } from '../validations'

interface SaveContext {
  orgId: string
  userId: string
}

/**
 * Map billing frequency to payment terms string
 */
function mapPaymentTerms(paymentTermsDays: string): string {
  switch (paymentTermsDays) {
    case '15':
      return 'Net 15'
    case '30':
      return 'Net 30'
    case '45':
      return 'Net 45'
    case '60':
      return 'Net 60'
    case '90':
      return 'Net 90'
    default:
      return `Net ${paymentTermsDays}`
  }
}

export async function saveBilling(
  accountId: string,
  data: BillingData,
  ctx: SaveContext
) {
  const adminClient = getAdminClient()

  // Update main company fields
  const companyUpdate = {
    default_payment_terms: mapPaymentTerms(data.paymentTermsDays),
    default_currency: data.currency || 'USD',
    default_markup_percentage: data.defaultMarkupPercentage
      ? parseFloat(data.defaultMarkupPercentage)
      : null,
    default_fee_percentage: data.defaultFeePercentage
      ? parseFloat(data.defaultFeePercentage)
      : null,
    credit_limit: data.creditLimit ? parseFloat(data.creditLimit) : null,
    credit_status: data.creditStatus || 'approved',
    requires_po: data.poRequired,
    invoice_delivery_method: data.invoiceDeliveryMethod || 'email',
    requires_approval_for_submission: data.requiresApprovalForSubmission,
    updated_by: ctx.userId,
    updated_at: new Date().toISOString(),
  }

  const { error: companyError } = await adminClient
    .from('companies')
    .update(companyUpdate)
    .eq('id', accountId)
    .eq('org_id', ctx.orgId)
    .is('deleted_at', null)

  if (companyError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to update company billing: ${companyError.message}`,
    })
  }

  // Check if client_details exists
  const { data: existingDetails } = await adminClient
    .from('company_client_details')
    .select('id')
    .eq('company_id', accountId)
    .single()

  // Build client details payload
  const clientDetailsData = {
    company_id: accountId,
    billing_entity_name: data.billingEntityName || null,
    billing_email: data.billingEmail || null,
    billing_phone: data.billingPhone?.number || null,
    billing_frequency: data.billingFrequency || 'monthly',
    payment_terms_days: parseInt(data.paymentTermsDays, 10) || 30,
    requires_po: data.poRequired,
    current_po_number: data.currentPoNumber || null,
    po_expiration_date: data.poExpirationDate || null,
    invoice_format: data.invoiceFormat || 'standard',
    updated_at: new Date().toISOString(),
  }

  if (existingDetails) {
    // Update existing record
    const { error: detailsError } = await adminClient
      .from('company_client_details')
      .update(clientDetailsData)
      .eq('company_id', accountId)

    if (detailsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to update billing details: ${detailsError.message}`,
      })
    }
  } else {
    // Insert new record
    const { error: insertError } = await adminClient
      .from('company_client_details')
      .insert({
        ...clientDetailsData,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create billing details: ${insertError.message}`,
      })
    }
  }

  return { success: true }
}
