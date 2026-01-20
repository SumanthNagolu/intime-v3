/**
 * Team Section Service
 *
 * Handles saving team assignment data for an account.
 * Updates company fields and company_team table.
 */

import { TRPCError } from '@trpc/server'
import { getAdminClient } from '@/lib/supabase/admin'
import type { TeamData } from '../validations'

interface SaveContext {
  orgId: string
  userId: string
}

/**
 * Helper to upsert a team member with a specific role
 */
async function upsertTeamMember(
  adminClient: ReturnType<typeof getAdminClient>,
  accountId: string,
  userId: string | undefined,
  role: string,
  ctx: SaveContext
) {
  if (!userId) return

  // Check if assignment already exists
  const { data: existing } = await adminClient
    .from('company_team')
    .select('id')
    .eq('company_id', accountId)
    .eq('user_id', userId)
    .eq('role', role)
    .is('removed_at', null)
    .single()

  if (!existing) {
    // First, remove any existing assignment for this role
    await adminClient
      .from('company_team')
      .update({
        removed_at: new Date().toISOString(),
        removed_by: ctx.userId,
      })
      .eq('company_id', accountId)
      .eq('role', role)
      .eq('org_id', ctx.orgId)
      .is('removed_at', null)

    // Insert new assignment
    const { error: insertError } = await adminClient
      .from('company_team')
      .insert({
        org_id: ctx.orgId,
        company_id: accountId,
        user_id: userId,
        role,
        is_primary: role === 'owner',
        assigned_at: new Date().toISOString(),
        assigned_by: ctx.userId,
        created_at: new Date().toISOString(),
      })

    if (insertError && !insertError.message.includes('duplicate')) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to assign team member: ${insertError.message}`,
      })
    }
  }
}

export async function saveTeam(
  accountId: string,
  data: TeamData,
  ctx: SaveContext
) {
  const adminClient = getAdminClient()

  // Update company's direct owner/account manager fields
  const companyUpdate: Record<string, unknown> = {
    updated_by: ctx.userId,
    updated_at: new Date().toISOString(),
    // Team preferences
    preferred_contact_method: data.preferredContactMethod || 'email',
    meeting_cadence: data.meetingCadence || 'weekly',
    submission_method: data.submissionMethod || 'email',
  }

  // Set owner_id if provided
  if (data.team.ownerId) {
    companyUpdate.owner_id = data.team.ownerId
  }

  // Set account_manager_id if provided
  if (data.team.accountManagerId) {
    companyUpdate.account_manager_id = data.team.accountManagerId
  }

  // Update is_strategic based on tier or explicit flag
  if (data.team.isStrategic !== undefined) {
    companyUpdate.is_strategic = data.team.isStrategic
  }

  // Update requires_approval_for_submission
  if (data.team.requiresApprovalForSubmission !== undefined) {
    companyUpdate.requires_approval_for_submission = data.team.requiresApprovalForSubmission
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
      message: `Failed to update company team: ${companyError.message}`,
    })
  }

  // Upsert team members in company_team table
  await upsertTeamMember(adminClient, accountId, data.team.ownerId, 'owner', ctx)
  await upsertTeamMember(adminClient, accountId, data.team.accountManagerId, 'account_manager', ctx)
  await upsertTeamMember(adminClient, accountId, data.team.recruiterId, 'recruiter', ctx)
  await upsertTeamMember(adminClient, accountId, data.team.salesLeadId, 'sales', ctx)

  return { success: true }
}
