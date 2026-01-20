/**
 * Contacts Section Service
 *
 * Handles saving contact data for an account.
 * Creates/updates contacts and links them via company_contacts junction.
 * Enhanced with partial save support and detailed error reporting.
 */

import { TRPCError } from '@trpc/server'
import { getAdminClient } from '@/lib/supabase/admin'
import type { ContactsData } from '../validations'
import { withErrorHandling } from '../utils'

interface SaveContext {
  orgId: string
  userId: string
}

interface ContactSaveResult {
  saved: string[]
  linked: string[]
  unlinked: string[]
  failed: Array<{ id: string; operation: string; error: string }>
}

export async function saveContacts(
  accountId: string,
  data: ContactsData,
  ctx: SaveContext
): Promise<{ success: boolean; details?: ContactSaveResult }> {
  return withErrorHandling(
    async () => {
      const adminClient = getAdminClient()
      const result: ContactSaveResult = {
        saved: [],
        linked: [],
        unlinked: [],
        failed: [],
      }

      // Get existing company_contacts for this account
      const { data: existingLinks, error: fetchError } = await adminClient
        .from('company_contacts')
        .select('id, contact_id')
        .eq('company_id', accountId)
        .eq('org_id', ctx.orgId)
        .eq('is_active', true)

      if (fetchError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch existing contacts: ${fetchError.message}`,
        })
      }

      const existingContactIds = new Set((existingLinks || []).map((l) => l.contact_id))
      const newContactIds = new Set(data.contacts.map((c) => c.id))

      // Determine contacts to unlink (exist in DB but not in new data)
      const toUnlink = (existingLinks || []).filter((l) => !newContactIds.has(l.contact_id))

      // Soft-delete removed contact links (set is_active = false)
      if (toUnlink.length > 0) {
        const { error: unlinkError } = await adminClient
          .from('company_contacts')
          .update({
            is_active: false,
            left_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq('company_id', accountId)
          .eq('org_id', ctx.orgId)
          .in(
            'id',
            toUnlink.map((l) => l.id)
          )

        if (unlinkError) {
          // Non-critical - log and continue
          console.error(`[saveContacts] Failed to unlink contacts: ${unlinkError.message}`)
        } else {
          result.unlinked = toUnlink.map((l) => l.contact_id)
        }
      }

      // Process each contact - continue on individual failures
      for (const contact of data.contacts) {
        try {
          // Upsert contact record
          const contactData = {
            id: contact.id,
            org_id: ctx.orgId,
            first_name: contact.firstName,
            last_name: contact.lastName,
            email: contact.email || null,
            phone: contact.phone?.number || null,
            mobile: contact.mobile?.number || null,
            title: contact.title || null,
            department: contact.department || null,
            linkedin_url: contact.linkedInUrl || null,
            notes: contact.notes || null,
            is_primary: contact.isPrimary,
            decision_authority: contact.decisionAuthority || null,
            company_id: accountId,
            updated_by: ctx.userId,
            updated_at: new Date().toISOString(),
          }

          const { error: contactError } = await adminClient.from('contacts').upsert(
            {
              ...contactData,
              created_by: ctx.userId,
            },
            {
              onConflict: 'id',
              ignoreDuplicates: false,
            }
          )

          if (contactError) {
            result.failed.push({
              id: contact.id,
              operation: 'save_contact',
              error: contactError.message,
            })
            continue // Skip linking if contact save failed
          }

          result.saved.push(contact.id)

          // Check if company_contacts link exists
          const isExisting = existingContactIds.has(contact.id)

          if (!isExisting) {
            // Create new link
            const linkData = {
              org_id: ctx.orgId,
              company_id: accountId,
              contact_id: contact.id,
              job_title: contact.title || null,
              department: contact.department || null,
              decision_authority: contact.decisionAuthority || null,
              is_primary: contact.isPrimary,
              is_active: true,
              preferred_contact_method: 'email',
              started_at: new Date().toISOString().split('T')[0],
              created_by: ctx.userId,
              created_at: new Date().toISOString(),
            }

            const { error: linkError } = await adminClient.from('company_contacts').insert(linkData)

            if (linkError) {
              result.failed.push({
                id: contact.id,
                operation: 'create_link',
                error: linkError.message,
              })
            } else {
              result.linked.push(contact.id)
            }
          } else {
            // Update existing link
            const { error: updateLinkError } = await adminClient
              .from('company_contacts')
              .update({
                job_title: contact.title || null,
                department: contact.department || null,
                decision_authority: contact.decisionAuthority || null,
                is_primary: contact.isPrimary,
                updated_at: new Date().toISOString(),
              })
              .eq('company_id', accountId)
              .eq('contact_id', contact.id)
              .eq('org_id', ctx.orgId)
              .eq('is_active', true)

            if (updateLinkError) {
              result.failed.push({
                id: contact.id,
                operation: 'update_link',
                error: updateLinkError.message,
              })
            } else {
              result.linked.push(contact.id)
            }
          }
        } catch (err) {
          result.failed.push({
            id: contact.id,
            operation: 'process',
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }

      // Update primary contact on company if one is marked as primary
      const primaryContact = data.contacts.find((c) => c.isPrimary)
      if (primaryContact && result.saved.includes(primaryContact.id)) {
        await adminClient
          .from('companies')
          .update({
            primary_contact_id: primaryContact.id,
            updated_by: ctx.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', accountId)
          .eq('org_id', ctx.orgId)
      }

      // Update company's contact count
      await adminClient
        .from('companies')
        .update({
          total_contacts_count: result.saved.length,
          updated_by: ctx.userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', accountId)
        .eq('org_id', ctx.orgId)

      // Return partial success if some contacts failed
      if (result.failed.length > 0) {
        if (result.saved.length === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to save any contacts: ${result.failed.map((f) => f.error).join(', ')}`,
          })
        }

        return {
          success: false,
          details: result,
        }
      }

      return { success: true, details: result }
    },
    {
      service: 'saveContacts',
      accountId,
      userId: ctx.userId,
    }
  )
}
