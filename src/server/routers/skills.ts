import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// ENUMS
// ============================================

const SkillCategoryEnum = z.enum([
  'programming_language', 'framework', 'library', 'tool', 'platform',
  'database', 'cloud', 'methodology', 'soft_skill', 'domain', 'certification_skill'
])

const SkillDomainEnum = z.enum([
  'technology', 'business', 'creative', 'healthcare', 'finance', 'legal', 'general'
])

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformSkill(skill: Record<string, unknown>) {
  return {
    id: skill.id as string,
    name: skill.name as string,
    canonicalName: skill.canonical_name as string | null,
    category: skill.category as string | null,
    domain: skill.domain as string | null,
    description: skill.description as string | null,
    skillLevel: skill.skill_level as number,
    parentSkillId: skill.parent_skill_id as string | null,
    hierarchyPath: skill.hierarchy_path as string | null,
    aliases: skill.aliases as string[] | null,
    relatedSkills: skill.related_skills as string[] | null,
    version: skill.version as string | null,
    isLatestVersion: skill.is_latest_version as boolean,
    demandScore: skill.demand_score as number | null,
    trending: skill.trending as boolean,
    trendingDirection: skill.trending_direction as string | null,
    isVerified: skill.is_verified as boolean,
    deprecated: skill.deprecated as boolean,
    deprecatedSuccessorId: skill.deprecated_successor_id as string | null,
    orgId: skill.org_id as string | null,
    usageCount: skill.usage_count as number,
    createdAt: skill.created_at as string,
    updatedAt: skill.updated_at as string,
  }
}

// ============================================
// ROUTER
// ============================================

export const skillsRouter = router({
  // ==========================================
  // SEARCH - Skill autocomplete
  // ==========================================
  search: orgProtectedProcedure
    .input(z.object({
      query: z.string().min(1),
      category: SkillCategoryEnum.optional(),
      domain: SkillDomainEnum.optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('skills')
        .select('id, name, canonical_name, category, domain, skill_level, parent_skill_id, is_verified, demand_score, trending')
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .eq('deprecated', false)
        .ilike('name', `%${input.query}%`)
        .order('demand_score', { ascending: false, nullsFirst: false })
        .order('usage_count', { ascending: false })
        .limit(input.limit)

      if (input.category) {
        query = query.eq('category', input.category)
      }
      if (input.domain) {
        query = query.eq('domain', input.domain)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to search skills:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(skill => ({
        id: skill.id,
        name: skill.name,
        canonicalName: skill.canonical_name,
        category: skill.category,
        domain: skill.domain,
        skillLevel: skill.skill_level,
        parentSkillId: skill.parent_skill_id,
        isVerified: skill.is_verified,
        demandScore: skill.demand_score,
        trending: skill.trending,
      })) ?? []
    }),

  // ==========================================
  // GET BY ID - Single skill with full details
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('skills')
        .select('*, parent:skills!parent_skill_id(id, name)')
        .eq('id', input.id)
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Skill not found' })
      }

      return {
        ...transformSkill(data),
        parent: data.parent as { id: string; name: string } | null,
      }
    }),

  // ==========================================
  // LIST BY CATEGORY - Skills in a category
  // ==========================================
  listByCategory: orgProtectedProcedure
    .input(z.object({
      category: SkillCategoryEnum,
      parentId: z.string().uuid().optional(),
      includeDeprecated: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('skills')
        .select('id, name, canonical_name, skill_level, demand_score, trending, is_verified, parent_skill_id')
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .eq('category', input.category)
        .order('demand_score', { ascending: false, nullsFirst: false })

      if (!input.includeDeprecated) {
        query = query.eq('deprecated', false)
      }

      if (input.parentId) {
        query = query.eq('parent_skill_id', input.parentId)
      } else {
        query = query.is('parent_skill_id', null)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to list skills by category:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(skill => ({
        id: skill.id,
        name: skill.name,
        canonicalName: skill.canonical_name,
        skillLevel: skill.skill_level,
        demandScore: skill.demand_score,
        trending: skill.trending,
        isVerified: skill.is_verified,
        parentSkillId: skill.parent_skill_id,
      })) ?? []
    }),

  // ==========================================
  // GET TRENDING - Top trending skills
  // ==========================================
  getTrending: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      domain: SkillDomainEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('skills')
        .select('id, name, category, domain, demand_score, trending_direction, usage_count')
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .eq('trending', true)
        .eq('is_verified', true)
        .eq('deprecated', false)
        .order('demand_score', { ascending: false, nullsFirst: false })
        .limit(input.limit)

      if (input.domain) {
        query = query.eq('domain', input.domain)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to get trending skills:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        domain: skill.domain,
        demandScore: skill.demand_score,
        trendingDirection: skill.trending_direction,
        usageCount: skill.usage_count,
      })) ?? []
    }),

  // ==========================================
  // GET HIERARCHY - Skill and its ancestors
  // ==========================================
  getHierarchy: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('get_skill_hierarchy', { p_skill_id: input.id })

      if (error) {
        console.error('Failed to get skill hierarchy:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return (data as Array<{
        skill_id: string
        skill_name: string
        skill_level: number
        depth: number
      }>) ?? []
    }),

  // ==========================================
  // GET CHILDREN - Child skills
  // ==========================================
  getChildren: orgProtectedProcedure
    .input(z.object({ parentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('skills')
        .select('id, name, canonical_name, skill_level, is_verified, usage_count')
        .eq('parent_skill_id', input.parentId)
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .eq('deprecated', false)
        .order('usage_count', { ascending: false })

      if (error) {
        console.error('Failed to get child skills:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(skill => ({
        id: skill.id,
        name: skill.name,
        canonicalName: skill.canonical_name,
        skillLevel: skill.skill_level,
        isVerified: skill.is_verified,
        usageCount: skill.usage_count,
      })) ?? []
    }),

  // ==========================================
  // CREATE - Create org-specific skill
  // ==========================================
  create: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      category: SkillCategoryEnum.optional(),
      domain: SkillDomainEnum.default('technology'),
      description: z.string().optional(),
      parentSkillId: z.string().uuid().optional(),
      aliases: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Check for duplicate canonical name within org
      const canonicalName = input.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_')

      const { data: existing } = await adminClient
        .from('skills')
        .select('id')
        .eq('canonical_name', canonicalName)
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .limit(1)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Skill "${input.name}" already exists`
        })
      }

      const { data, error } = await adminClient
        .from('skills')
        .insert({
          org_id: orgId,
          name: input.name,
          canonical_name: canonicalName,
          category: input.category,
          domain: input.domain,
          description: input.description,
          parent_skill_id: input.parentSkillId,
          aliases: input.aliases || [],
          is_verified: false,  // Org-specific skills need verification
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UPDATE - Update org-specific skill
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      category: SkillCategoryEnum.optional(),
      domain: SkillDomainEnum.optional(),
      description: z.string().optional(),
      parentSkillId: z.string().uuid().nullable().optional(),
      aliases: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Ensure we only update org-specific skills
      const { data: existing } = await adminClient
        .from('skills')
        .select('id, org_id')
        .eq('id', input.id)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Skill not found' })
      }

      if (existing.org_id !== orgId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot modify global skills. Create a custom skill instead.'
        })
      }

      const { id, ...updates } = input
      const dbUpdate: Record<string, unknown> = {}

      if (updates.name !== undefined) {
        dbUpdate.name = updates.name
        dbUpdate.canonical_name = updates.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_')
      }
      if (updates.category !== undefined) dbUpdate.category = updates.category
      if (updates.domain !== undefined) dbUpdate.domain = updates.domain
      if (updates.description !== undefined) dbUpdate.description = updates.description
      if (updates.parentSkillId !== undefined) dbUpdate.parent_skill_id = updates.parentSkillId
      if (updates.aliases !== undefined) dbUpdate.aliases = updates.aliases

      const { error } = await adminClient
        .from('skills')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DEPRECATE - Mark skill as deprecated
  // ==========================================
  deprecate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      successorId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Only allow deprecating org-specific skills
      const { data: existing } = await adminClient
        .from('skills')
        .select('id, org_id')
        .eq('id', input.id)
        .single()

      if (!existing || existing.org_id !== orgId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only deprecate org-specific skills'
        })
      }

      const { error } = await adminClient
        .from('skills')
        .update({
          deprecated: true,
          deprecated_successor_id: input.successorId,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to deprecate skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // STATS - Overall skill statistics
  // ==========================================
  stats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get total skills available to this org
      const { count: totalSkills } = await adminClient
        .from('skills')
        .select('id', { count: 'exact', head: true })
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .eq('deprecated', false)

      // Get org-specific skills
      const { count: customSkills } = await adminClient
        .from('skills')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('deprecated', false)

      // Get trending count
      const { count: trendingSkills } = await adminClient
        .from('skills')
        .select('id', { count: 'exact', head: true })
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .eq('trending', true)
        .eq('deprecated', false)

      // Get skills by category
      const { data: byCategory } = await adminClient
        .from('skills')
        .select('category')
        .or(`org_id.is.null,org_id.eq.${orgId}`)
        .eq('deprecated', false)

      const categoryCount = byCategory?.reduce((acc, skill) => {
        const cat = skill.category || 'uncategorized'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        totalSkills: totalSkills ?? 0,
        customSkills: customSkills ?? 0,
        trendingSkills: trendingSkills ?? 0,
        byCategory: categoryCount,
      }
    }),
})
