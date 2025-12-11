import { z } from 'zod'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// ENTITIES-01: Entity Resolution Service
// Central registry and resolution for polymorphic entity types
// ============================================

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Transform database row to camelCase response
function transformEntityType(row: Record<string, unknown>) {
  return {
    entityType: row.entity_type as string,
    tableName: row.table_name as string,
    idColumn: row.id_column as string,
    displayNameColumn: row.display_name_column as string,
    displayName: row.display_name as string,
    urlPattern: row.url_pattern as string | null,
    iconName: row.icon_name as string | null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  }
}

// ============================================
// ROUTER
// ============================================

export const entitiesRouter = router({
  // ==========================================
  // LIST TYPES - Get all registered entity types
  // ==========================================
  listTypes: orgProtectedProcedure
    .query(async () => {
      const adminClient = getAdminClient()
      const { data, error } = await adminClient
        .from('entity_type_registry')
        .select('*')
        .eq('is_active', true)
        .order('display_name')

      if (error) throw new Error(error.message)
      return (data ?? []).map(transformEntityType)
    }),

  // ==========================================
  // GET TYPE - Get single entity type info
  // ==========================================
  getType: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
    }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()
      const { data, error } = await adminClient
        .from('entity_type_registry')
        .select('*')
        .eq('entity_type', input.entityType)
        .eq('is_active', true)
        .single()

      if (error) throw new Error(error.message)
      return transformEntityType(data)
    }),

  // ==========================================
  // RESOLVE - Resolve an entity to display info
  // ==========================================
  resolve: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()
      const { data, error } = await adminClient
        .rpc('resolve_entity', {
          p_entity_type: input.entityType,
          p_entity_id: input.entityId,
        })

      if (error) throw new Error(error.message)
      return data as {
        id: string
        type: string
        typeName: string
        name: string
        url: string
        error?: string
      }
    }),

  // ==========================================
  // RESOLVE BULK - Bulk resolve multiple entities
  // ==========================================
  resolveBulk: orgProtectedProcedure
    .input(z.array(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    })))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()
      const results = await Promise.all(
        input.map(async ({ entityType, entityId }) => {
          const { data, error } = await adminClient
            .rpc('resolve_entity', {
              p_entity_type: entityType,
              p_entity_id: entityId,
            })
          return {
            entityType,
            entityId,
            resolved: error ? { error: error.message } : data,
          }
        })
      )
      return results
    }),

  // ==========================================
  // VALIDATE TYPE - Check if an entity type is valid
  // ==========================================
  validateType: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
    }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()
      const { data, error } = await adminClient
        .from('entity_type_registry')
        .select('entity_type')
        .eq('entity_type', input.entityType)
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw new Error(error.message)
      return { isValid: data !== null }
    }),

  // ==========================================
  // GET URL - Get the URL pattern for an entity
  // ==========================================
  getUrl: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()
      const { data, error } = await adminClient
        .from('entity_type_registry')
        .select('url_pattern')
        .eq('entity_type', input.entityType)
        .eq('is_active', true)
        .single()

      if (error) throw new Error(error.message)

      if (!data.url_pattern) {
        return { url: null }
      }

      return {
        url: data.url_pattern.replace('{id}', input.entityId),
      }
    }),
})
