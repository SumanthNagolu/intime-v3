import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'
import { evaluatePermission } from '@/lib/auth/permission-evaluator'
import crypto from 'crypto'

// =============================================================================
// SCHEMAS
// =============================================================================

const scopeSchema = z.enum(['own', 'own_raci', 'own_ra', 'team', 'region', 'org', 'draft_only'])

// =============================================================================
// HELPERS
// =============================================================================

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

// =============================================================================
// ROUTER
// =============================================================================

export const permissionsRouter = router({
  // ============================================
  // GET OBJECT TYPES
  // ============================================
  getObjectTypes: orgProtectedProcedure.query(async () => {
    const adminClient = getAdminClient()

    const { data } = await adminClient
      .from('permissions')
      .select('object_type')
      .is('deleted_at', null)

    const objectTypes = [...new Set(data?.map((p) => p.object_type) ?? [])]
    return objectTypes.sort()
  }),

  // ============================================
  // GET ROLES (Simple - for dropdowns)
  // ============================================
  getRoles: orgProtectedProcedure.query(async () => {
    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from('system_roles')
      .select('id, code, name, display_name, category, hierarchy_level, color_code')
      .eq('is_active', true)
      .order('hierarchy_level')

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch roles',
      })
    }

    return data
  }),

  // ============================================
  // LIST ROLES (Full - for roles management page)
  // ============================================
  listRoles: orgProtectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.enum(['pod_ic', 'pod_manager', 'leadership', 'executive', 'portal', 'admin']).optional(),
        isActive: z.boolean().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const adminClient = getAdminClient()
      const { search, category, isActive, page, pageSize } = input

      let query = adminClient
        .from('system_roles')
        .select('*', { count: 'exact' })

      if (search) {
        query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%,code.ilike.%${search}%`)
      }
      if (category) {
        query = query.eq('category', category)
      }
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query
        .order('hierarchy_level')
        .range(from, to)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        items: data ?? [],
        pagination: {
          page,
          pageSize,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET ROLE BY ID
  // ============================================
  getRoleById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      // Get role details
      const { data: role, error: roleError } = await adminClient
        .from('system_roles')
        .select('*')
        .eq('id', input.id)
        .single()

      if (roleError || !role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Get role permissions
      const { data: permissions } = await adminClient
        .from('role_permissions')
        .select('permission_id, scope_condition, granted, permissions(id, code, name, object_type, action)')
        .eq('role_id', input.id)

      // Get feature flags
      const { data: features } = await adminClient
        .from('feature_flag_roles')
        .select('feature_flag_id, enabled, feature_flags(id, key, name)')
        .eq('role_id', input.id)

      // Get user count
      const { count: userCount } = await adminClient
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', input.id)
        .eq('is_active', true)

      return {
        ...role,
        permissions: permissions ?? [],
        features: features ?? [],
        userCount: userCount ?? 0,
      }
    }),

  // ============================================
  // CREATE ROLE
  // ============================================
  createRole: orgProtectedProcedure
    .input(
      z.object({
        code: z.string().min(2).max(50),
        name: z.string().min(2).max(100),
        displayName: z.string().min(2).max(100),
        description: z.string().optional(),
        category: z.enum(['pod_ic', 'pod_manager', 'leadership', 'executive', 'portal', 'admin']),
        hierarchyLevel: z.number().min(0).max(10).default(0),
        colorCode: z.string().default('#6366f1'),
        iconName: z.string().optional(),
        podType: z.enum(['recruiting', 'bench_sales', 'ta']).nullable().optional(),
        permissionIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Check for duplicate code
      const { data: existing } = await adminClient
        .from('system_roles')
        .select('id')
        .eq('code', input.code)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Role code already exists',
        })
      }

      // Create role
      const { data: role, error } = await adminClient
        .from('system_roles')
        .insert({
          code: input.code,
          name: input.name,
          display_name: input.displayName,
          description: input.description,
          category: input.category,
          hierarchy_level: input.hierarchyLevel,
          color_code: input.colorCode,
          icon_name: input.iconName,
          pod_type: input.podType,
          is_system_role: false,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Add permissions if provided
      if (input.permissionIds?.length) {
        await adminClient.from('role_permissions').insert(
          input.permissionIds.map((permissionId) => ({
            role_id: role.id,
            permission_id: permissionId,
            scope_condition: 'org',
            granted: true,
          }))
        )
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create_role',
        table_name: 'system_roles',
        record_id: role.id,
        new_values: {
          code: input.code,
          name: input.name,
          category: input.category,
        },
      })

      return role
    }),

  // ============================================
  // UPDATE ROLE
  // ============================================
  updateRole: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        displayName: z.string().min(2).max(100).optional(),
        description: z.string().optional(),
        hierarchyLevel: z.number().min(0).max(10).optional(),
        colorCode: z.string().optional(),
        iconName: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const { id, ...updates } = input

      // Check role exists
      const { data: existing } = await adminClient
        .from('system_roles')
        .select('id, is_system_role')
        .eq('id', id)
        .single()

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Build update object
      const updateData: Record<string, unknown> = {}
      if (updates.displayName !== undefined) updateData.display_name = updates.displayName
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.hierarchyLevel !== undefined) updateData.hierarchy_level = updates.hierarchyLevel
      if (updates.colorCode !== undefined) updateData.color_code = updates.colorCode
      if (updates.iconName !== undefined) updateData.icon_name = updates.iconName
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      updateData.updated_at = new Date().toISOString()

      const { data: role, error } = await adminClient
        .from('system_roles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update_role',
        table_name: 'system_roles',
        record_id: role.id,
        new_values: updateData,
      })

      return role
    }),

  // ============================================
  // DELETE ROLE (Soft delete)
  // ============================================
  deleteRole: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Check role exists and is not a system role
      const { data: role } = await adminClient
        .from('system_roles')
        .select('id, is_system_role, code')
        .eq('id', input.id)
        .single()

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      if (role.is_system_role) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete system roles',
        })
      }

      // Check for users with this role
      const { count: userCount } = await adminClient
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', input.id)
        .eq('is_active', true)

      if (userCount && userCount > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete role with ${userCount} active users`,
        })
      }

      // Soft delete by setting is_active = false
      const { error } = await adminClient
        .from('system_roles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete_role',
        table_name: 'system_roles',
        record_id: input.id,
        new_values: { deleted: true },
      })

      return { success: true }
    }),

  // ============================================
  // CLONE ROLE
  // ============================================
  cloneRole: orgProtectedProcedure
    .input(
      z.object({
        sourceRoleId: z.string().uuid(),
        newCode: z.string().min(2).max(50),
        newName: z.string().min(2).max(100),
        newDisplayName: z.string().min(2).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get source role
      const { data: sourceRole } = await adminClient
        .from('system_roles')
        .select('*')
        .eq('id', input.sourceRoleId)
        .single()

      if (!sourceRole) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source role not found',
        })
      }

      // Check for duplicate code
      const { data: existing } = await adminClient
        .from('system_roles')
        .select('id')
        .eq('code', input.newCode)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Role code already exists',
        })
      }

      // Create new role
      const { data: newRole, error: createError } = await adminClient
        .from('system_roles')
        .insert({
          code: input.newCode,
          name: input.newName,
          display_name: input.newDisplayName,
          description: `Cloned from ${sourceRole.display_name}`,
          category: sourceRole.category,
          hierarchy_level: sourceRole.hierarchy_level,
          color_code: sourceRole.color_code,
          icon_name: sourceRole.icon_name,
          pod_type: sourceRole.pod_type,
          is_system_role: false,
          is_active: true,
        })
        .select()
        .single()

      if (createError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: createError.message,
        })
      }

      // Copy permissions
      const { data: sourcePermissions } = await adminClient
        .from('role_permissions')
        .select('permission_id, scope_condition, granted')
        .eq('role_id', input.sourceRoleId)

      if (sourcePermissions?.length) {
        await adminClient.from('role_permissions').insert(
          sourcePermissions.map((p) => ({
            role_id: newRole.id,
            permission_id: p.permission_id,
            scope_condition: p.scope_condition,
            granted: p.granted,
          }))
        )
      }

      // Copy feature flags
      const { data: sourceFeatures } = await adminClient
        .from('feature_flag_roles')
        .select('feature_flag_id, enabled')
        .eq('role_id', input.sourceRoleId)

      if (sourceFeatures?.length) {
        await adminClient.from('feature_flag_roles').insert(
          sourceFeatures.map((f) => ({
            role_id: newRole.id,
            feature_flag_id: f.feature_flag_id,
            enabled: f.enabled,
          }))
        )
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'clone_role',
        table_name: 'system_roles',
        record_id: newRole.id,
        new_values: {
          sourceRoleId: input.sourceRoleId,
          newCode: input.newCode,
          newName: input.newName,
        },
      })

      return newRole
    }),

  // ============================================
  // GET ROLE STATS
  // ============================================
  getRoleStats: orgProtectedProcedure.query(async () => {
    const adminClient = getAdminClient()

    const { data: roles } = await adminClient
      .from('system_roles')
      .select('id, is_active, category, is_system_role')

    const totalRoles = roles?.length ?? 0
    const activeRoles = roles?.filter((r) => r.is_active).length ?? 0
    const inactiveRoles = totalRoles - activeRoles
    const systemRoles = roles?.filter((r) => r.is_system_role).length ?? 0
    const customRoles = totalRoles - systemRoles

    const byCategory = roles?.reduce(
      (acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    ) ?? {}

    return {
      total: totalRoles,
      active: activeRoles,
      inactive: inactiveRoles,
      system: systemRoles,
      custom: customRoles,
      byCategory,
    }
  }),

  // ============================================
  // GET PERMISSION MATRIX
  // ============================================
  getMatrix: orgProtectedProcedure
    .input(
      z.object({
        objectType: z.string(),
      })
    )
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      // Get all permissions for object type
      const { data: permissions, error: permError } = await adminClient
        .from('permissions')
        .select('id, code, name, action')
        .eq('object_type', input.objectType)
        .is('deleted_at', null)
        .order('action')

      if (permError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch permissions',
        })
      }

      // Get all roles
      const { data: roles, error: rolesError } = await adminClient
        .from('system_roles')
        .select('id, code, name, display_name, category, hierarchy_level, color_code')
        .eq('is_active', true)
        .order('hierarchy_level')

      if (rolesError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch roles',
        })
      }

      // Get role-permission mappings
      const { data: mappings, error: mappingsError } = await adminClient
        .from('role_permissions')
        .select('role_id, permission_id, scope_condition, granted')

      if (mappingsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch role permissions',
        })
      }

      // Build matrix
      const matrix = permissions?.map((perm) => ({
        permission: perm,
        rolePermissions: roles?.map((role) => {
          const mapping = mappings?.find(
            (m) => m.role_id === role.id && m.permission_id === perm.id
          )
          return {
            roleId: role.id,
            roleName: role.display_name,
            granted: mapping?.granted ?? false,
            scope: mapping?.scope_condition ?? null,
          }
        }),
      }))

      return { matrix, roles, objectType: input.objectType }
    }),

  // ============================================
  // UPDATE ROLE PERMISSION
  // ============================================
  updateRolePermission: orgProtectedProcedure
    .input(
      z.object({
        roleId: z.string().uuid(),
        permissionId: z.string().uuid(),
        granted: z.boolean(),
        scope: scopeSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Upsert role permission
      const { data, error } = await adminClient
        .from('role_permissions')
        .upsert(
          {
            role_id: input.roleId,
            permission_id: input.permissionId,
            granted: input.granted,
            scope_condition: input.scope ?? 'own',
            granted_by: user?.id,
          },
          {
            onConflict: 'role_id,permission_id',
          }
        )
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update role permission',
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update_permission',
        table_name: 'role_permissions',
        record_id: data.id,
        new_values: {
          roleId: input.roleId,
          permissionId: input.permissionId,
          granted: input.granted,
          scope: input.scope,
        },
      })

      return data
    }),

  // ============================================
  // TEST PERMISSION
  // ============================================
  testPermission: orgProtectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        permissionCode: z.string(),
        entityId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      const result = await evaluatePermission(
        adminClient,
        input.userId,
        input.permissionCode,
        input.entityId
      )

      return result
    }),

  // ============================================
  // LIST OVERRIDES
  // ============================================
  listOverrides: orgProtectedProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        activeOnly: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('permission_overrides')
        .select(
          `
          *,
          permissions (code, name, object_type, action),
          user:user_profiles!permission_overrides_user_id_fkey (id, full_name, email),
          creator:user_profiles!permission_overrides_created_by_fkey (id, full_name)
        `
        )
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (input.userId) {
        query = query.eq('user_id', input.userId)
      }

      if (input.activeOnly) {
        query = query
          .is('revoked_at', null)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch overrides',
        })
      }

      return data
    }),

  // ============================================
  // CREATE OVERRIDE
  // ============================================
  createOverride: orgProtectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        permissionCode: z.string(),
        granted: z.boolean(),
        scopeOverride: scopeSchema.optional(),
        reason: z.string().min(10, 'Reason must be at least 10 characters'),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get permission ID from code
      const { data: permission } = await adminClient
        .from('permissions')
        .select('id')
        .eq('code', input.permissionCode)
        .single()

      if (!permission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Permission not found',
        })
      }

      // Create override
      const { data, error } = await adminClient
        .from('permission_overrides')
        .insert({
          org_id: orgId,
          user_id: input.userId,
          permission_id: permission.id,
          granted: input.granted,
          scope_override: input.scopeOverride,
          reason: input.reason,
          expires_at: input.expiresAt,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create override',
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create_override',
        table_name: 'permission_overrides',
        record_id: data.id,
        new_values: {
          targetUserId: input.userId,
          permissionCode: input.permissionCode,
          granted: input.granted,
          reason: input.reason,
          expiresAt: input.expiresAt,
        },
      })

      return data
    }),

  // ============================================
  // REVOKE OVERRIDE
  // ============================================
  revokeOverride: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('permission_overrides')
        .update({
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke override',
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'revoke_override',
        table_name: 'permission_overrides',
        record_id: data.id,
        new_values: { revoked: true },
      })

      return data
    }),

  // ============================================
  // COMPARE ROLES
  // ============================================
  compareRoles: orgProtectedProcedure
    .input(
      z.object({
        roleId1: z.string().uuid(),
        roleId2: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      // Get both roles
      const { data: roles, error: rolesError } = await adminClient
        .from('system_roles')
        .select('id, code, name, display_name, category, hierarchy_level, color_code')
        .in('id', [input.roleId1, input.roleId2])

      if (rolesError || !roles || roles.length !== 2) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or both roles not found',
        })
      }

      // Get all permissions
      const { data: permissions } = await adminClient
        .from('permissions')
        .select('id, code, name, object_type, action')
        .is('deleted_at', null)
        .order('object_type')
        .order('action')

      // Get permissions for both roles
      const { data: rolePerms1 } = await adminClient
        .from('role_permissions')
        .select('permission_id, scope_condition, granted')
        .eq('role_id', input.roleId1)

      const { data: rolePerms2 } = await adminClient
        .from('role_permissions')
        .select('permission_id, scope_condition, granted')
        .eq('role_id', input.roleId2)

      // Get feature flags for both roles
      const { data: flags1 } = await adminClient
        .from('feature_flag_roles')
        .select('enabled, feature_flags (code, name)')
        .eq('role_id', input.roleId1)

      const { data: flags2 } = await adminClient
        .from('feature_flag_roles')
        .select('enabled, feature_flags (code, name)')
        .eq('role_id', input.roleId2)

      // Build permission comparison
      const permissionComparison = permissions?.map((perm) => {
        const p1 = rolePerms1?.find((rp) => rp.permission_id === perm.id)
        const p2 = rolePerms2?.find((rp) => rp.permission_id === perm.id)
        return {
          permission: perm,
          role1: { granted: p1?.granted ?? false, scope: p1?.scope_condition ?? null },
          role2: { granted: p2?.granted ?? false, scope: p2?.scope_condition ?? null },
          different:
            (p1?.granted ?? false) !== (p2?.granted ?? false) ||
            p1?.scope_condition !== p2?.scope_condition,
        }
      })

      // Build feature comparison
      type FlagWithFeature = { enabled: boolean; feature_flags: Array<{ code: string; name: string }> | null }
      const getFlagCode = (f: unknown) => {
        const flag = f as FlagWithFeature
        return flag.feature_flags?.[0]?.code
      }
      const getFlagName = (f: unknown) => {
        const flag = f as FlagWithFeature
        return flag.feature_flags?.[0]?.name
      }
      const allFeatureCodes = [
        ...new Set([
          ...(flags1?.map((f) => getFlagCode(f)).filter(Boolean) ?? []),
          ...(flags2?.map((f) => getFlagCode(f)).filter(Boolean) ?? []),
        ]),
      ]

      const featureComparison = allFeatureCodes.map((code) => {
        const f1 = flags1?.find((f) => getFlagCode(f) === code) as FlagWithFeature | undefined
        const f2 = flags2?.find((f) => getFlagCode(f) === code) as FlagWithFeature | undefined
        return {
          featureCode: code,
          featureName: getFlagName(f1) ?? getFlagName(f2) ?? code,
          role1Enabled: f1?.enabled ?? false,
          role2Enabled: f2?.enabled ?? false,
          different: (f1?.enabled ?? false) !== (f2?.enabled ?? false),
        }
      })

      return {
        role1: roles.find((r) => r.id === input.roleId1),
        role2: roles.find((r) => r.id === input.roleId2),
        permissionComparison,
        featureComparison,
      }
    }),

  // ============================================
  // FEATURE FLAGS
  // ============================================
  getFeatureFlags: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx
    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from('feature_flags')
      .select(
        `
        *,
        feature_flag_roles (
          role_id,
          enabled,
          system_roles (id, display_name, color_code)
        )
      `
      )
      .or(`org_id.eq.${orgId},is_global.eq.true`)
      .is('deleted_at', null)
      .order('name')

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch feature flags',
      })
    }

    return data
  }),

  updateFeatureFlagRole: orgProtectedProcedure
    .input(
      z.object({
        featureFlagId: z.string().uuid(),
        roleId: z.string().uuid(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('feature_flag_roles')
        .upsert(
          {
            feature_flag_id: input.featureFlagId,
            role_id: input.roleId,
            enabled: input.enabled,
          },
          {
            onConflict: 'feature_flag_id,role_id',
          }
        )
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update feature flag',
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update_feature_flag',
        table_name: 'feature_flag_roles',
        record_id: data.id,
        new_values: input,
      })

      return data
    }),

  // ============================================
  // API TOKENS
  // ============================================
  listTokens: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx
    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from('api_tokens')
      .select(
        `
        id,
        name,
        token_prefix,
        scopes,
        expires_at,
        last_used_at,
        usage_count,
        created_at,
        revoked_at,
        creator:user_profiles!api_tokens_created_by_fkey (full_name)
      `
      )
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch tokens',
      })
    }

    return data
  }),

  generateToken: orgProtectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        scopes: z.array(z.string()),
        expiresAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      const tokenPrefix = token.substring(0, 8)

      const { data, error } = await adminClient
        .from('api_tokens')
        .insert({
          org_id: orgId,
          name: input.name,
          token_hash: tokenHash,
          token_prefix: tokenPrefix,
          scopes: input.scopes,
          expires_at: input.expiresAt,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate token',
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'generate_token',
        table_name: 'api_tokens',
        record_id: data.id,
        new_values: { name: input.name, scopes: input.scopes },
      })

      // Return token ONLY on creation (never again)
      return {
        ...data,
        token: `itk_${token}`, // Full token only shown once
      }
    }),

  revokeToken: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('api_tokens')
        .update({
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke token',
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'revoke_token',
        table_name: 'api_tokens',
        record_id: data.id,
        new_values: { revoked: true },
      })

      return data
    }),

  // ============================================
  // BULK UPDATES
  // ============================================
  bulkUpdate: orgProtectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().uuid()).max(1000, 'Maximum 1000 users per batch'),
        updateType: z.enum([
          'enable_feature',
          'disable_feature',
          'change_scope',
          'add_permission',
          'remove_permission',
        ]),
        featureId: z.string().uuid().optional(),
        permissionId: z.string().uuid().optional(),
        scope: scopeSchema.optional(),
        reason: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Capture previous state (simplified - would need full implementation)
      const previousState: Record<string, unknown> = {}

      // Store in history for rollback
      const { data: historyEntry, error: historyError } = await adminClient
        .from('bulk_update_history')
        .insert({
          org_id: orgId,
          update_type: input.updateType,
          affected_user_ids: input.userIds,
          changes: {
            type: input.updateType,
            featureId: input.featureId,
            permissionId: input.permissionId,
            scope: input.scope,
          },
          previous_state: previousState,
          reason: input.reason,
          applied_by: user?.id,
        })
        .select()
        .single()

      if (historyError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record bulk update',
        })
      }

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'bulk_update',
        table_name: 'bulk_update_history',
        record_id: historyEntry.id,
        new_values: {
          updateType: input.updateType,
          affectedCount: input.userIds.length,
          reason: input.reason,
        },
      })

      return {
        success: true,
        affectedCount: input.userIds.length,
        historyId: historyEntry.id,
      }
    }),

  getBulkUpdateHistory: orgProtectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { page, pageSize } = input
      const adminClient = getAdminClient()

      const { data, error, count } = await adminClient
        .from('bulk_update_history')
        .select(
          `
          *,
          applier:user_profiles!bulk_update_history_applied_by_fkey (full_name),
          rollbacker:user_profiles!bulk_update_history_rolled_back_by_fkey (full_name)
        `,
          { count: 'exact' }
        )
        .eq('org_id', orgId)
        .order('applied_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch history',
        })
      }

      return {
        items: data,
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  rollbackBulkUpdate: orgProtectedProcedure
    .input(z.object({ historyId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get history entry
      const { data: history, error: historyError } = await adminClient
        .from('bulk_update_history')
        .select('*')
        .eq('id', input.historyId)
        .eq('org_id', orgId)
        .is('rolled_back_at', null)
        .single()

      if (historyError || !history) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bulk update not found or already rolled back',
        })
      }

      // Mark as rolled back
      await adminClient
        .from('bulk_update_history')
        .update({
          rolled_back_at: new Date().toISOString(),
          rolled_back_by: user?.id,
        })
        .eq('id', input.historyId)

      // Audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'rollback_bulk_update',
        table_name: 'bulk_update_history',
        record_id: input.historyId,
        new_values: { rolledBack: true },
      })

      return { success: true }
    }),

  // ============================================
  // GET ALL PERMISSIONS (for dropdowns)
  // ============================================
  getAllPermissions: orgProtectedProcedure.query(async () => {
    const adminClient = getAdminClient()

    const { data, error } = await adminClient
      .from('permissions')
      .select('id, code, name, object_type, action')
      .is('deleted_at', null)
      .order('object_type')
      .order('action')

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch permissions',
      })
    }

    return data
  }),
})
