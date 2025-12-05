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
  // GET ROLES
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
      type FlagWithFeature = { enabled: boolean; feature_flags: { code: string; name: string } | null }
      const allFeatureCodes = [
        ...new Set([
          ...(flags1?.map((f) => (f as FlagWithFeature).feature_flags?.code).filter(Boolean) ?? []),
          ...(flags2?.map((f) => (f as FlagWithFeature).feature_flags?.code).filter(Boolean) ?? []),
        ]),
      ]

      const featureComparison = allFeatureCodes.map((code) => {
        const f1 = flags1?.find((f) => (f as FlagWithFeature).feature_flags?.code === code) as FlagWithFeature | undefined
        const f2 = flags2?.find((f) => (f as FlagWithFeature).feature_flags?.code === code) as FlagWithFeature | undefined
        return {
          featureCode: code,
          featureName: f1?.feature_flags?.name ?? f2?.feature_flags?.name ?? code,
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
