/**
 * Locations Section Service
 *
 * Handles saving address data for an account.
 * Uses the centralized addresses table with enhanced error handling.
 */

import { TRPCError } from '@trpc/server'
import { getAdminClient } from '@/lib/supabase/admin'
import type { LocationsData } from '../validations'
import { withErrorHandling } from '../utils'

interface SaveContext {
  orgId: string
  userId: string
}

interface AddressSaveResult {
  saved: string[]
  failed: Array<{ id: string; error: string }>
  deleted: string[]
}

export async function saveLocations(
  accountId: string,
  data: LocationsData,
  ctx: SaveContext
): Promise<{ success: boolean; details?: AddressSaveResult }> {
  return withErrorHandling(
    async () => {
      const adminClient = getAdminClient()
      const result: AddressSaveResult = {
        saved: [],
        failed: [],
        deleted: [],
      }

      // Get existing address IDs for this account
      const { data: existingAddresses, error: fetchError } = await adminClient
        .from('addresses')
        .select('id')
        .eq('entity_type', 'account')
        .eq('entity_id', accountId)
        .eq('org_id', ctx.orgId)

      if (fetchError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch existing addresses: ${fetchError.message}`,
        })
      }

      const existingIds = new Set((existingAddresses || []).map((a) => a.id))
      const newIds = new Set(data.addresses.map((a) => a.id))

      // Determine addresses to delete (exist in DB but not in new data)
      const toDelete = [...existingIds].filter((id) => !newIds.has(id))

      // Delete removed addresses
      if (toDelete.length > 0) {
        const { error: deleteError } = await adminClient
          .from('addresses')
          .delete()
          .eq('entity_type', 'account')
          .eq('entity_id', accountId)
          .eq('org_id', ctx.orgId)
          .in('id', toDelete)

        if (deleteError) {
          // Non-critical: log and continue
          console.error(`[saveLocations] Failed to delete addresses: ${deleteError.message}`)
        } else {
          result.deleted = toDelete
        }
      }

      // Upsert addresses - continue on individual failures
      for (const addr of data.addresses) {
        const addressData = {
          id: addr.id,
          entity_type: 'account',
          entity_id: accountId,
          org_id: ctx.orgId,
          address_type: addr.type,
          address_line_1: addr.addressLine1,
          address_line_2: addr.addressLine2 || null,
          city: addr.city,
          state_province: addr.state,
          postal_code: addr.postalCode,
          country_code: addr.country,
          is_primary: addr.isPrimary,
          created_by: ctx.userId,
          updated_by: ctx.userId,
          updated_at: new Date().toISOString(),
        }

        const { error: upsertError } = await adminClient
          .from('addresses')
          .upsert(addressData, {
            onConflict: 'id',
            ignoreDuplicates: false,
          })

        if (upsertError) {
          result.failed.push({
            id: addr.id,
            error: upsertError.message,
          })
        } else {
          result.saved.push(addr.id)
        }
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

      // Return partial success if some addresses failed
      if (result.failed.length > 0) {
        if (result.saved.length === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to save any addresses: ${result.failed.map((f) => f.error).join(', ')}`,
          })
        }

        // Partial success - some saved, some failed
        return {
          success: false,
          details: result,
        }
      }

      return { success: true, details: result }
    },
    {
      service: 'saveLocations',
      accountId,
      userId: ctx.userId,
    }
  )
}
