import { z } from 'zod'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * Reference Data Router
 *
 * Provides consolidated reference data loading for wizard pages.
 * Each wizard type has its own procedure that returns properly typed data,
 * following the "one database call per page" pattern.
 */
export const referenceRouter = router({
  /**
   * Reference data for job creation/intake wizards.
   * Returns accounts list for dropdown.
   */
  getJobWizardData: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const { data: accounts } = await adminClient
        .from('accounts')
        .select('id, name')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('name', { ascending: true })
        .limit(200)

      return {
        accounts: accounts ?? [],
      }
    }),

  /**
   * Reference data for user creation wizard.
   * Returns roles, pods, groups, and managers for dropdowns.
   */
  getUserCreateWizardData: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const [rolesResult, podsResult, groupsResult, managersResult] = await Promise.all([
        adminClient
          .from('system_roles')
          .select('id, code, name, display_name, description, category, hierarchy_level, pod_type, color_code')
          .order('hierarchy_level', { ascending: true }),
        adminClient
          .from('pods')
          .select('id, name, pod_type, status')
          .eq('org_id', orgId)
          .eq('status', 'active')
          .order('name', { ascending: true }),
        adminClient
          .from('groups')
          .select('id, name, code, group_type')
          .eq('org_id', orgId)
          .eq('is_active', true)
          .is('deleted_at', null)
          .neq('group_type', 'root')
          .order('name', { ascending: true }),
        adminClient
          .from('user_profiles')
          .select('id, full_name, email, avatar_url')
          .eq('org_id', orgId)
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('full_name', { ascending: true })
          .limit(200),
      ])

      return {
        roles: rolesResult.data ?? [],
        pods: podsResult.data ?? [],
        groups: groupsResult.data ?? [],
        managers: managersResult.data ?? [],
      }
    }),

  /**
   * Reference data for user edit wizard.
   * Returns roles, pods, groups, managers, and the user being edited.
   */
  getUserEditWizardData: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const [rolesResult, podsResult, groupsResult, managersResult, userResult] = await Promise.all([
        adminClient
          .from('system_roles')
          .select('id, code, name, display_name, description, category, hierarchy_level, pod_type, color_code')
          .order('hierarchy_level', { ascending: true }),
        adminClient
          .from('pods')
          .select('id, name, pod_type, status')
          .eq('org_id', orgId)
          .eq('status', 'active')
          .order('name', { ascending: true }),
        adminClient
          .from('groups')
          .select('id, name, code, group_type')
          .eq('org_id', orgId)
          .eq('is_active', true)
          .is('deleted_at', null)
          .neq('group_type', 'root')
          .order('name', { ascending: true }),
        adminClient
          .from('user_profiles')
          .select('id, full_name, email, avatar_url')
          .eq('org_id', orgId)
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('full_name', { ascending: true })
          .limit(200),
        adminClient
          .from('user_profiles')
          .select(`
            id,
            full_name,
            first_name,
            last_name,
            email,
            phone,
            role_id,
            manager_id,
            primary_group_id,
            status,
            two_factor_enabled,
            pod_memberships:pod_members(
              id,
              pod_id,
              role,
              is_active,
              pod:pods(id, name, pod_type)
            )
          `)
          .eq('id', input.userId)
          .eq('org_id', orgId)
          .single(),
      ])

      return {
        roles: rolesResult.data ?? [],
        pods: podsResult.data ?? [],
        groups: groupsResult.data ?? [],
        managers: managersResult.data ?? [],
        user: userResult.data ?? null,
      }
    }),

  /**
   * Reference data for pod creation wizard.
   * Returns regions and available users for dropdowns.
   */
  getPodCreateWizardData: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const [regionsResult, usersResult] = await Promise.all([
        adminClient
          .from('regions')
          .select('id, name, code')
          .eq('org_id', orgId)
          .order('name', { ascending: true }),
        adminClient
          .from('user_profiles')
          .select('id, full_name, email, avatar_url, role_id')
          .eq('org_id', orgId)
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('full_name', { ascending: true })
          .limit(200),
      ])

      return {
        regions: regionsResult.data ?? [],
        users: usersResult.data ?? [],
      }
    }),

  /**
   * Reference data for pod edit wizard.
   * Returns regions, available users, and the pod being edited.
   */
  getPodEditWizardData: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const [regionsResult, usersResult, podResult] = await Promise.all([
        adminClient
          .from('regions')
          .select('id, name, code')
          .eq('org_id', orgId)
          .order('name', { ascending: true }),
        adminClient
          .from('user_profiles')
          .select('id, full_name, email, avatar_url, role_id')
          .eq('org_id', orgId)
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('full_name', { ascending: true })
          .limit(200),
        adminClient
          .from('pods')
          .select(`
            id,
            name,
            description,
            pod_type,
            region_id,
            manager_id,
            sprint_duration_weeks,
            placements_per_sprint_target,
            manager:user_profiles!manager_id(id, full_name, email, avatar_url),
            members:pod_members(
              id,
              is_active,
              role,
              joined_at,
              user:user_profiles!user_id(id, full_name, email, avatar_url, role_id)
            )
          `)
          .eq('id', input.podId)
          .eq('org_id', orgId)
          .single(),
      ])

      return {
        regions: regionsResult.data ?? [],
        users: usersResult.data ?? [],
        pod: podResult.data ?? null,
      }
    }),

  /**
   * Reference data for timesheet creation wizard.
   * Returns active placements.
   */
  getTimesheetWizardData: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const { data: placements } = await adminClient
        .from('placements')
        .select(`
          id,
          status,
          consultant:consultants!consultant_id(id, first_name, last_name),
          job:jobs!job_id(id, title),
          account:accounts!account_id(id, name)
        `)
        .eq('org_id', orgId)
        .in('status', ['active', 'on_assignment'])
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100)

      return {
        placements: placements ?? [],
      }
    }),

  /**
   * Reference data for invoice creation wizard.
   * Returns clients and active placements.
   */
  getInvoiceWizardData: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const [clientsResult, placementsResult] = await Promise.all([
        adminClient
          .from('accounts')
          .select('id, name')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .eq('status', 'active')
          .order('name', { ascending: true })
          .limit(200),
        adminClient
          .from('placements')
          .select(`
            id,
            consultant:consultants!consultant_id(id, first_name, last_name),
            job:jobs!job_id(id, title),
            account:accounts!account_id(id, name)
          `)
          .eq('org_id', orgId)
          .in('status', ['active', 'on_assignment'])
          .is('deleted_at', null)
          .limit(100),
      ])

      return {
        clients: clientsResult.data ?? [],
        placements: placementsResult.data ?? [],
      }
    }),

  /**
   * Reference data for payroll creation wizard.
   * Returns active consultants with their placements.
   */
  getPayrollWizardData: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const { data: consultants } = await adminClient
        .from('consultants')
        .select(`
          id,
          first_name,
          last_name,
          email,
          placements:placements!consultant_id(
            id,
            status,
            job:jobs!job_id(id, title),
            account:accounts!account_id(id, name)
          )
        `)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('last_name', { ascending: true })
        .limit(200)

      return {
        consultants: consultants ?? [],
      }
    }),
})
