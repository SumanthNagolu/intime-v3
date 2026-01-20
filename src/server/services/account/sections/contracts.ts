/**
 * Contracts Section Service
 *
 * Handles saving contract data for an account.
 * Uses the centralized contracts table.
 */

import { TRPCError } from '@trpc/server'
import { getAdminClient } from '@/lib/supabase/admin'
import type { ContractsData } from '../validations'

interface SaveContext {
  orgId: string
  userId: string
}

/**
 * Map contract status from form to DB enum
 */
function mapContractStatus(status: string): string {
  switch (status) {
    case 'draft':
      return 'draft'
    case 'active':
      return 'active'
    case 'pending_signature':
      return 'pending_signature'
    case 'expired':
      return 'expired'
    default:
      return 'draft'
  }
}

export async function saveContracts(
  accountId: string,
  data: ContractsData,
  ctx: SaveContext
) {
  const adminClient = getAdminClient()

  // Get existing contract IDs for this account
  const { data: existingContracts, error: fetchError } = await adminClient
    .from('contracts')
    .select('id')
    .eq('entity_type', 'account')
    .eq('entity_id', accountId)
    .eq('org_id', ctx.orgId)
    .is('deleted_at', null)

  if (fetchError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to fetch existing contracts: ${fetchError.message}`,
    })
  }

  const existingIds = new Set((existingContracts || []).map(c => c.id))
  const newIds = new Set(data.contracts.map(c => c.id))

  // Determine contracts to soft-delete (exist in DB but not in new data)
  const toDelete = [...existingIds].filter(id => !newIds.has(id))

  // Soft delete removed contracts
  if (toDelete.length > 0) {
    const { error: deleteError } = await adminClient
      .from('contracts')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('entity_type', 'account')
      .eq('entity_id', accountId)
      .eq('org_id', ctx.orgId)
      .in('id', toDelete)

    if (deleteError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to delete contracts: ${deleteError.message}`,
      })
    }
  }

  // Upsert contracts
  for (const contract of data.contracts) {
    const contractData = {
      id: contract.id,
      org_id: ctx.orgId,
      entity_type: 'account',
      entity_id: accountId,
      contract_name: contract.name,
      contract_number: contract.number || null,
      contract_type: contract.type,
      status: mapContractStatus(contract.status),
      effective_date: contract.effectiveDate
        ? new Date(contract.effectiveDate).toISOString().split('T')[0]
        : null,
      expiry_date: contract.expiryDate
        ? new Date(contract.expiryDate).toISOString().split('T')[0]
        : null,
      auto_renew: contract.autoRenew,
      contract_value: contract.contractValue
        ? parseFloat(contract.contractValue)
        : null,
      currency: contract.currency || 'USD',
      document_url: contract.fileUrl || null,
      updated_at: new Date().toISOString(),
      created_by: ctx.userId,
    }

    const { error: upsertError } = await adminClient
      .from('contracts')
      .upsert(contractData, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })

    if (upsertError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to save contract: ${upsertError.message}`,
      })
    }
  }

  // Update MSA status on company if there's an active MSA
  const activeMsa = data.contracts.find(
    c => c.type === 'msa' && c.status === 'active'
  )

  if (activeMsa) {
    await adminClient
      .from('companies')
      .update({
        msa_status: 'active',
        msa_effective_date: activeMsa.effectiveDate
          ? new Date(activeMsa.effectiveDate).toISOString().split('T')[0]
          : null,
        msa_expiration_date: activeMsa.expiryDate
          ? new Date(activeMsa.expiryDate).toISOString().split('T')[0]
          : null,
        msa_auto_renews: activeMsa.autoRenew,
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
