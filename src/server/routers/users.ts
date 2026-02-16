import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure, protectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendInvitationEmail } from '@/lib/email'

// Input schemas
const userStatusSchema = z.enum(['pending', 'active', 'suspended', 'deactivated'])

export const usersRouter = router({
  // ============================================
  // GET MY ROLE (for navigation, no orgId needed)
  // ============================================
  getMyRole: protectedProcedure
    .query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const userId = ctx.user.id

      // Get user profile with role
      const { data: profile, error: profileError } = await adminClient
        .from('user_profiles')
        .select('id, role_id, employee_role')
        .eq('auth_id', userId)
        .single()

      if (profileError || !profile) {
        console.log('[getMyRole] No profile found for user:', userId, profileError?.message)
        return null
      }

      // If no role_id, try employee_role as fallback
      if (!profile.role_id) {
        if (profile.employee_role) {
          return {
            code: profile.employee_role,
            category: 'pod_ic', // Default category
            displayName: profile.employee_role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          }
        }
        return null
      }

      // Get system role details
      const { data: systemRole, error: roleError } = await adminClient
        .from('system_roles')
        .select('code, category, display_name')
        .eq('id', profile.role_id)
        .single()

      if (roleError || !systemRole) {
        console.log('[getMyRole] No system role found:', profile.role_id, roleError?.message)
        return null
      }

      return {
        code: systemRole.code,
        category: systemRole.category,
        displayName: systemRole.display_name,
      }
    }),

  // ============================================
  // LIST USERS
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      roleId: z.string().uuid().optional(),
      podId: z.string().uuid().optional(),
      status: userStatusSchema.optional(),
      candidateOnly: z.boolean().optional(), // Filter for talent pool candidates only
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { search, roleId, podId, status, candidateOnly, page, pageSize } = input
      // Use admin client to bypass RLS (we've already verified org access via middleware)
      const adminClient = getAdminClient()

      // If filtering by pod, first get user IDs that belong to that pod
      let userIdsInPod: string[] | null = null
      if (podId) {
        const { data: podMembers, error: podError } = await adminClient
          .from('pod_members')
          .select('user_id')
          .eq('pod_id', podId)
          .eq('is_active', true)
          .eq('org_id', orgId)

        if (podError) {
          console.error('Failed to fetch pod members:', podError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch pod members',
          })
        }

        userIdsInPod = podMembers?.map((pm) => pm.user_id) ?? []
        // If no users in pod, return empty result
        if (userIdsInPod.length === 0) {
          return {
            items: [],
            pagination: {
              total: 0,
              page,
              pageSize,
              totalPages: 0,
            },
          }
        }
      }

      let query = adminClient
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          avatar_url,
          status,
          is_active,
          role_id,
          manager_id,
          primary_group_id,
          start_date,
          last_login_at,
          created_at,
          candidate_status,
          candidate_skills,
          candidate_experience_years,
          candidate_hourly_rate,
          candidate_availability,
          role:system_roles(id, name, display_name, code, category, color_code),
          primary_group:groups!user_profiles_primary_group_id_fkey(id, name, code, group_type),
          pod_memberships:pod_members(
            id,
            pod_id,
            role,
            is_active,
            pod:pods(id, name, pod_type)
          )
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      if (roleId) {
        query = query.eq('role_id', roleId)
      }
      if (podId && userIdsInPod) {
        query = query.in('id', userIdsInPod)
      }
      if (status) {
        query = query.eq('status', status)
      }
      // Filter for candidates only (talent pool) - excludes internal employees
      if (candidateOnly) {
        query = query.not('candidate_status', 'is', null)
      }

      // Pagination
      const offset = (page - 1) * pageSize
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        console.error('Failed to fetch users:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        })
      }

      const filteredData = data ?? []

      // Transform data: Supabase returns arrays for single relations, extract first element
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedItems = filteredData.map((user: any) => ({
        ...user,
        role: Array.isArray(user.role) ? user.role[0] : user.role,
        primary_group: Array.isArray(user.primary_group) ? user.primary_group[0] : user.primary_group,
        pod_memberships: user.pod_memberships?.map((pm: { pod?: unknown[] | unknown; [key: string]: unknown }) => ({
          ...pm,
          pod: Array.isArray(pm.pod) ? pm.pod[0] : pm.pod,
        })),
      }))

      return {
        items: transformedItems,
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET USER BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      // Use admin client to bypass RLS (we've already verified org access via middleware)
      const adminClient = getAdminClient()

      const { data: user, error } = await adminClient
        .from('user_profiles')
        .select(`
          id,
          full_name,
          first_name,
          last_name,
          email,
          phone,
          avatar_url,
          status,
          is_active,
          role_id,
          manager_id,
          primary_group_id,
          start_date,
          last_login_at,
          two_factor_enabled,
          password_changed_at,
          created_at,
          updated_at,
          role:system_roles(id, name, display_name, code, category, color_code, description),
          primary_group:groups!user_profiles_primary_group_id_fkey(id, name, code, group_type),
          group_memberships:group_members(
            id,
            group_id,
            is_manager,
            is_active,
            joined_at,
            group:groups(id, name, code, group_type)
          ),
          pod_memberships:pod_members(
            id,
            pod_id,
            role,
            is_active,
            joined_at,
            pod:pods(id, name, pod_type, status)
          )
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Transform: Supabase may return arrays for single relations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData = user as any
      const transformedUser = {
        ...userData,
        role: Array.isArray(userData.role) ? userData.role[0] : userData.role,
        primary_group: Array.isArray(userData.primary_group) ? userData.primary_group[0] : userData.primary_group,
        group_memberships: userData.group_memberships?.map((gm: { group?: unknown[] | unknown; [key: string]: unknown }) => ({
          ...gm,
          group: Array.isArray(gm.group) ? gm.group[0] : gm.group,
        })),
        pod_memberships: userData.pod_memberships?.map((pm: { pod?: unknown[] | unknown; [key: string]: unknown }) => ({
          ...pm,
          pod: Array.isArray(pm.pod) ? pm.pod[0] : pm.pod,
        })),
      }

      return transformedUser
    }),

  // ============================================
  // CREATE USER
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      email: z.string().email(),
      phone: z.string().optional(),
      roleId: z.string().uuid(),
      podId: z.string().uuid().optional(),
      podRole: z.enum(['junior', 'senior']).default('junior'), // Pod role assignment
      primaryGroupId: z.string().uuid().optional(), // Guidewire-style group assignment
      managerId: z.string().uuid().optional(),
      sendInvitation: z.boolean().default(true),
      initialPassword: z.string().min(8).optional(),
      requireTwoFactor: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user: currentUser } = ctx
      const adminClient = getAdminClient()

      // Check for duplicate email
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('org_id', orgId)
        .eq('email', input.email)
        .is('deleted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A user with this email already exists',
        })
      }

      // Create user in Supabase Auth
      const password = input.initialPassword || Math.random().toString(36).slice(-12) + 'Aa1!'
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: input.email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: input.firstName,
          last_name: input.lastName,
          org_id: orgId,
        },
      })

      if (authError || !authData.user) {
        console.error('Failed to create auth user:', authError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: authError?.message || 'Failed to create user account',
        })
      }

      // Create user_profiles record
      const fullName = `${input.firstName} ${input.lastName}`
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          org_id: orgId,
          email: input.email,
          first_name: input.firstName,
          last_name: input.lastName,
          full_name: fullName,
          phone: input.phone,
          role_id: input.roleId,
          manager_id: input.managerId,
          primary_group_id: input.primaryGroupId, // Guidewire-style group assignment
          two_factor_enabled: input.requireTwoFactor,
          status: input.sendInvitation ? 'pending' : 'active',
          is_active: true,
          created_by: currentUser?.id,
        })
        .select()
        .single()

      if (profileError || !profile) {
        // Rollback: Delete auth user if profile creation failed
        await adminClient.auth.admin.deleteUser(authData.user.id)
        console.error('Failed to create user profile:', profileError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user profile',
        })
      }

      // Add to group if specified (Guidewire-style group membership)
      if (input.primaryGroupId) {
        await supabase.from('group_members').insert({
          org_id: orgId,
          group_id: input.primaryGroupId,
          user_id: profile.id,
          is_manager: false,
          is_active: true,
          created_by: currentUser?.id,
        })
      }

      // Add to pod if specified
      if (input.podId) {
        await supabase.from('pod_members').insert({
          org_id: orgId,
          pod_id: input.podId,
          user_id: profile.id,
          role: input.podRole,
          is_active: true,
        })
      }

      // Create invitation record if sending invitation
      if (input.sendInvitation) {
        const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
        await supabase.from('user_invitations').insert({
          org_id: orgId,
          email: input.email,
          first_name: input.firstName,
          last_name: input.lastName,
          role_id: input.roleId,
          pod_id: input.podId,
          manager_id: input.managerId,
          token,
          invited_by: currentUser?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          require_two_factor: input.requireTwoFactor,
        })

        // Send invitation email
        const { data: org } = await adminClient
          .from('organizations')
          .select('name')
          .eq('id', orgId)
          .single()

        const inviterName = currentUser?.email || 'Your administrator'
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation?token=${token}`

        await sendInvitationEmail({
          to: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          invitedBy: inviterName,
          inviteLink: inviteUrl,
          orgName: org?.name,
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: currentUser?.id,
        user_email: currentUser?.email,
        action: 'create',
        table_name: 'user_profiles',
        record_id: profile.id,
        new_values: {
          email: input.email,
          full_name: fullName,
          role_id: input.roleId,
          primary_group_id: input.primaryGroupId,
          pod_id: input.podId,
          send_invitation: input.sendInvitation,
        },
      })

      return profile
    }),

  // ============================================
  // UPDATE USER
  // ============================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      firstName: z.string().min(1).max(100).optional(),
      lastName: z.string().min(1).max(100).optional(),
      phone: z.string().max(20).regex(/^[\d\s+\-()]*$/, 'Invalid phone number format').optional().nullable(),
      roleId: z.string().uuid().optional(),
      podId: z.string().uuid().optional().nullable(),
      podRole: z.enum(['junior', 'senior']).optional(), // Pod role assignment
      managerId: z.string().uuid().optional().nullable(),
      primaryGroupId: z.string().uuid().optional().nullable(), // Guidewire-style group assignment
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user: currentUser } = ctx
      const { id, podId, ...updateData } = input

      // Get current user
      const { data: currentProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          pod_memberships:pod_members(id, pod_id, is_active)
        `)
        .eq('id', id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !currentProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Build update object
      const updates: Record<string, unknown> = {}
      if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
        const firstName = updateData.firstName ?? currentProfile.first_name
        const lastName = updateData.lastName ?? currentProfile.last_name
        updates.first_name = firstName
        updates.last_name = lastName
        updates.full_name = `${firstName} ${lastName}`
      }
      if (updateData.phone !== undefined) updates.phone = updateData.phone
      if (updateData.roleId !== undefined) updates.role_id = updateData.roleId
      if (updateData.managerId !== undefined) updates.manager_id = updateData.managerId
      if (updateData.primaryGroupId !== undefined) updates.primary_group_id = updateData.primaryGroupId

      // Update profile
      const { data: profile, error: updateError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !profile) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
        })
      }

      // Handle pod membership change if specified
      if (podId !== undefined) {
        type PodMembership = { id: string; pod_id: string; is_active: boolean }
        const currentPodMembership = (currentProfile.pod_memberships as PodMembership[])?.find((pm) => pm.is_active)

        // Remove from current pod
        if (currentPodMembership && currentPodMembership.pod_id !== podId) {
          await supabase
            .from('pod_members')
            .update({
              is_active: false,
              left_at: new Date().toISOString(),
            })
            .eq('id', currentPodMembership.id)
        }

        // Add to new pod if specified
        if (podId && (!currentPodMembership || currentPodMembership.pod_id !== podId)) {
          await supabase.from('pod_members').insert({
            org_id: orgId,
            pod_id: podId,
            user_id: id,
            role: input.podRole ?? 'junior',
            is_active: true,
          })
        }

        // Update existing pod membership role if only role changed (same pod)
        if (podId && currentPodMembership && currentPodMembership.pod_id === podId && input.podRole) {
          await supabase
            .from('pod_members')
            .update({ role: input.podRole })
            .eq('id', currentPodMembership.id)
        }
      }

      // Handle group membership sync when primaryGroupId changes
      if (input.primaryGroupId !== undefined && input.primaryGroupId !== currentProfile.primary_group_id) {
        const adminClient = getAdminClient()

        // Deactivate old group membership if it existed
        if (currentProfile.primary_group_id) {
          await adminClient
            .from('group_members')
            .update({ is_active: false })
            .eq('user_id', id)
            .eq('group_id', currentProfile.primary_group_id)
        }

        // Create or activate new group membership if new group is specified
        if (input.primaryGroupId) {
          await adminClient
            .from('group_members')
            .upsert({
              org_id: orgId,
              group_id: input.primaryGroupId,
              user_id: id,
              is_manager: false,
              is_active: true,
            }, { onConflict: 'group_id,user_id' })
        }
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: currentUser?.id,
        user_email: currentUser?.email,
        action: 'update',
        table_name: 'user_profiles',
        record_id: id,
        old_values: currentProfile,
        new_values: profile,
      })

      return profile
    }),

  // ============================================
  // UPDATE STATUS
  // ============================================
  updateStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['active', 'suspended', 'deactivated']),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user: currentUser } = ctx
      const adminClient = getAdminClient()

      // Get current user
      const { data: currentProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !currentProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Prevent self-deactivation
      if (input.id === currentUser?.id && input.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot deactivate your own account',
        })
      }

      // Update profile status
      const { data: profile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          status: input.status,
          is_active: input.status === 'active',
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !profile) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user status',
        })
      }

      // If suspending or deactivating, ban user in Supabase Auth
      if (input.status === 'suspended' || input.status === 'deactivated') {
        await adminClient.auth.admin.updateUserById(input.id, {
          ban_duration: input.status === 'suspended' ? '876000h' : 'none', // 100 years for suspended
        })
      } else if (input.status === 'active') {
        // Unban if reactivating
        await adminClient.auth.admin.updateUserById(input.id, {
          ban_duration: 'none',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: currentUser?.id,
        user_email: currentUser?.email,
        action: 'update_status',
        table_name: 'user_profiles',
        record_id: input.id,
        old_values: { status: currentProfile.status },
        new_values: { status: input.status, reason: input.reason },
      })

      return profile
    }),

  // ============================================
  // RESET PASSWORD
  // ============================================
  resetPassword: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user: currentUser } = ctx
      const adminClient = getAdminClient()

      // Get user
      const { data: targetUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Generate password reset link
      const { error: resetError } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: targetUser.email,
      })

      if (resetError) {
        console.error('Failed to generate password reset link:', resetError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send password reset email',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: currentUser?.id,
        user_email: currentUser?.email,
        action: 'reset_password',
        table_name: 'user_profiles',
        record_id: input.id,
        new_values: { email: targetUser.email },
      })

      return { success: true, email: targetUser.email }
    }),

  // ============================================
  // REVOKE ALL SESSIONS
  // ============================================
  revokeAllSessions: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user: currentUser } = ctx
      const adminClient = getAdminClient()

      // Verify user belongs to org
      const { data: targetUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Sign out user from all sessions
      const { error: signOutError } = await adminClient.auth.admin.signOut(input.id)

      if (signOutError) {
        console.error('Failed to revoke sessions:', signOutError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke sessions',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: currentUser?.id,
        user_email: currentUser?.email,
        action: 'revoke_sessions',
        table_name: 'user_profiles',
        record_id: input.id,
        new_values: { email: targetUser.email },
      })

      return { success: true }
    }),

  // ============================================
  // GET USER ACTIVITY
  // ============================================
  getActivity: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: activities, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', orgId)
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user activity',
        })
      }

      return activities ?? []
    }),

  // ============================================
  // GET LOGIN HISTORY
  // ============================================
  getLoginHistory: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: history, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('org_id', orgId)
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch login history',
        })
      }

      return history ?? []
    }),

  // ============================================
  // GET ROLES
  // ============================================
  getRoles: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase } = ctx

      const { data: roles, error } = await supabase
        .from('system_roles')
        .select('id, code, name, display_name, description, category, hierarchy_level, pod_type, color_code')
        .eq('is_active', true)
        .order('hierarchy_level')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch roles',
        })
      }

      return roles ?? []
    }),

  // ============================================
  // GET AVAILABLE MANAGERS (users who can be managers)
  // ============================================
  getAvailableManagers: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          role:system_roles(id, name, display_name, category)
        `)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('full_name')

      if (input.search) {
        query = query.or(`full_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
      }

      const { data: users, error } = await query.limit(50)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch managers',
        })
      }

      // Filter to only return users with manager-level roles or above
      const managerRoleCategories = ['pod_manager', 'leadership', 'executive', 'admin']
      interface UserWithRole {
        id: string
        full_name: string
        email: string
        avatar_url?: string | null
        role: { id: string; name: string; display_name: string; category: string } | null
      }
      const managers = (users as unknown as UserWithRole[])?.filter(
        (u) => u.role && managerRoleCategories.includes(u.role.category)
      )

      return managers ?? []
    }),

  // ============================================
  // GET PODS (for pod assignment dropdown)
  // ============================================
  getPods: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data: pods, error } = await supabase
        .from('pods')
        .select('id, name, pod_type, status')
        .eq('org_id', orgId)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('name')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pods',
        })
      }

      return pods ?? []
    }),

  // ============================================
  // LIST WITH FILTER OPTIONS (Consolidated for single DB call)
  // ============================================
  listWithFilterOptions: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      roleId: z.string().uuid().optional(),
      podId: z.string().uuid().optional(),
      status: userStatusSchema.optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx
      const { search, roleId, podId, status, page, pageSize } = input
      const adminClient = getAdminClient()

      // Execute all queries in parallel
      const [usersResult, rolesResult, podsResult, podMembersResult] = await Promise.all([
        // Users list query (will apply pod filter below if needed)
        (async () => {
          let userIdsInPod: string[] | null = null
          if (podId) {
            const { data: podMembers } = await adminClient
              .from('pod_members')
              .select('user_id')
              .eq('pod_id', podId)
              .eq('is_active', true)
              .eq('org_id', orgId)
            userIdsInPod = podMembers?.map((pm) => pm.user_id) ?? []
            if (userIdsInPod.length === 0) {
              return { data: [], count: 0, error: null }
            }
          }

          let query = adminClient
            .from('user_profiles')
            .select(`
              id,
              full_name,
              email,
              phone,
              avatar_url,
              status,
              is_active,
              role_id,
              manager_id,
              start_date,
              last_login_at,
              created_at,
              role:system_roles(id, name, display_name, code, category, color_code),
              pod_memberships:pod_members(
                id,
                pod_id,
                role,
                is_active,
                pod:pods(id, name, pod_type)
              )
            `, { count: 'exact' })
            .eq('org_id', orgId)
            .is('deleted_at', null)

          if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
          }
          if (roleId) {
            query = query.eq('role_id', roleId)
          }
          if (podId && userIdsInPod) {
            query = query.in('id', userIdsInPod)
          }
          if (status) {
            query = query.eq('status', status)
          }

          const offset = (page - 1) * pageSize
          query = query
            .range(offset, offset + pageSize - 1)
            .order('created_at', { ascending: false })

          return query
        })(),

        // Roles for filter dropdown
        supabase
          .from('system_roles')
          .select('id, code, name, display_name, description, category, hierarchy_level, pod_type, color_code')
          .eq('is_active', true)
          .order('hierarchy_level'),

        // Pods for filter dropdown
        supabase
          .from('pods')
          .select('id, name, pod_type, status')
          .eq('org_id', orgId)
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('name'),

        // Stats: count by status
        adminClient
          .from('user_profiles')
          .select('status')
          .eq('org_id', orgId)
          .is('deleted_at', null),
      ])

      if (usersResult.error) {
        console.error('Failed to fetch users:', usersResult.error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        })
      }

      const filteredData = usersResult.data ?? []

      // Transform data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedItems = filteredData.map((user: any) => ({
        ...user,
        role: Array.isArray(user.role) ? user.role[0] : user.role,
        pod_memberships: user.pod_memberships?.map((pm: { pod?: unknown[] | unknown; [key: string]: unknown }) => ({
          ...pm,
          pod: Array.isArray(pm.pod) ? pm.pod[0] : pm.pod,
        })),
      }))

      // Calculate stats
      const statusCounts = (podMembersResult.data ?? []).reduce((acc, user) => {
        const s = user.status as string
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        items: transformedItems,
        pagination: {
          total: usersResult.count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((usersResult.count ?? 0) / pageSize),
        },
        filterOptions: {
          roles: rolesResult.data ?? [],
          pods: podsResult.data ?? [],
        },
        stats: {
          total: podMembersResult.data?.length ?? 0,
          active: statusCounts['active'] ?? 0,
          pending: statusCounts['pending'] ?? 0,
          suspended: statusCounts['suspended'] ?? 0,
          deactivated: statusCounts['deactivated'] ?? 0,
        },
      }
    }),

  // ============================================
  // GET FULL USER (Consolidated for single DB call)
  // ============================================
  getFullUser: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx
      const adminClient = getAdminClient()

      // Execute all queries in parallel
      const [userResult, activityResult, loginHistoryResult, managerResult] = await Promise.all([
        // Main user data
        adminClient
          .from('user_profiles')
          .select(`
            id,
            full_name,
            first_name,
            last_name,
            email,
            phone,
            avatar_url,
            status,
            is_active,
            role_id,
            manager_id,
            start_date,
            last_login_at,
            two_factor_enabled,
            password_changed_at,
            created_at,
            updated_at,
            role:system_roles(id, name, display_name, code, category, color_code, description),
            pod_memberships:pod_members(
              id,
              pod_id,
              role,
              is_active,
              joined_at,
              pod:pods(id, name, pod_type, status)
            )
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single(),

        // Activity history
        supabase
          .from('audit_logs')
          .select('*')
          .eq('org_id', orgId)
          .eq('user_id', input.id)
          .order('created_at', { ascending: false })
          .limit(50),

        // Login history
        supabase
          .from('login_history')
          .select('*')
          .eq('org_id', orgId)
          .eq('user_id', input.id)
          .order('created_at', { ascending: false })
          .limit(50),

        // Get manager info separately for reliable join
        adminClient
          .from('user_profiles')
          .select('id, full_name, email, avatar_url')
          .eq('org_id', orgId)
          .is('deleted_at', null),
      ])

      if (userResult.error || !userResult.data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData = userResult.data as any
      const manager = userData.manager_id
        ? managerResult.data?.find((m) => m.id === userData.manager_id)
        : null

      const transformedUser = {
        ...userData,
        role: Array.isArray(userData.role) ? userData.role[0] : userData.role,
        manager: manager ?? null,
        pod_memberships: userData.pod_memberships?.map((pm: { pod?: unknown[] | unknown; [key: string]: unknown }) => ({
          ...pm,
          pod: Array.isArray(pm.pod) ? pm.pod[0] : pm.pod,
        })),
      }

      return {
        ...transformedUser,
        sections: {
          activity: {
            items: activityResult.data ?? [],
            total: activityResult.data?.length ?? 0,
          },
          loginHistory: {
            items: loginHistoryResult.data ?? [],
            total: loginHistoryResult.data?.length ?? 0,
          },
        },
      }
    }),

  // ============================================
  // CREATE CANDIDATE (Quick Add for Talent Pool)
  // ============================================
  createCandidate: orgProtectedProcedure
    .input(z.object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      email: z.string().email(),
      phone: z.string().optional(),
      currentTitle: z.string().optional(), // Stored in metadata for now
      skills: z.array(z.string()).optional(),
      source: z.string().optional(),
      experienceYears: z.number().min(0).max(50).optional(),
      hourlyRate: z.number().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      if (!user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        })
      }

      // Check if email already exists
      const { data: existingUser } = await adminClient
        .from('user_profiles')
        .select('id, email')
        .eq('email', input.email)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A candidate with this email already exists',
        })
      }

      // Create candidate in user_profiles with candidate_status
      const { data: candidate, error: createError } = await adminClient
        .from('user_profiles')
        .insert({
          org_id: orgId,
          first_name: input.firstName,
          last_name: input.lastName,
          full_name: `${input.firstName} ${input.lastName}`,
          email: input.email,
          phone: input.phone,
          status: 'active',
          is_active: true,
          // Candidate-specific fields
          candidate_status: 'active',
          candidate_availability: 'immediate',
          candidate_skills: input.skills || [],
          candidate_experience_years: input.experienceYears,
          candidate_hourly_rate: input.hourlyRate,
          // Audit fields
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id, full_name, email, candidate_status, candidate_skills')
        .single()

      if (createError || !candidate) {
        console.error('Failed to create candidate:', createError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: createError?.message || 'Failed to create candidate',
        })
      }

      // Log activity for candidate creation
      await adminClient
        .from('activities')
        .insert({
          org_id: orgId,
          entity_type: 'candidate',
          entity_id: candidate.id,
          activity_type: 'created',
          description: `Candidate ${candidate.full_name} added to talent pool`,
          created_by: user.id,
          created_at: new Date().toISOString(),
          metadata: {
            source: input.source || 'manual',
            skills: input.skills,
          },
        })

      return {
        id: candidate.id,
        fullName: candidate.full_name,
        email: candidate.email,
        status: candidate.candidate_status,
        skills: candidate.candidate_skills,
      }
    }),
})
