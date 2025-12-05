import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// Input schemas
const userStatusSchema = z.enum(['pending', 'active', 'suspended', 'deactivated'])

// Supabase Admin client for user management
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  )
}

export const usersRouter = router({
  // ============================================
  // LIST USERS
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      roleId: z.string().uuid().optional(),
      podId: z.string().uuid().optional(),
      status: userStatusSchema.optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { search, roleId, status, page, pageSize } = input
      // Use admin client to bypass RLS (we've already verified org access via middleware)
      const adminClient = getAdminClient()

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
          role:system_roles(id, name, display_name, code, category, color_code)
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
      if (status) {
        query = query.eq('status', status)
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

      // Add to pod if specified
      if (input.podId) {
        await supabase.from('pod_members').insert({
          org_id: orgId,
          pod_id: input.podId,
          user_id: profile.id,
          role: 'junior',
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
      phone: z.string().optional().nullable(),
      roleId: z.string().uuid().optional(),
      podId: z.string().uuid().optional().nullable(),
      managerId: z.string().uuid().optional().nullable(),
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
            role: 'junior',
            is_active: true,
          })
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
})
