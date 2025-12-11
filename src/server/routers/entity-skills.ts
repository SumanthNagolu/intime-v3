import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// ENUMS
// ============================================

const VerificationMethodEnum = z.enum([
  'self_reported', 'assessment', 'endorsement', 'certification', 'interview', 'resume_parsed'
])

const SourceEnum = z.enum([
  'manual', 'resume_parsed', 'linkedin_sync', 'assessment', 'import'
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

function transformEntitySkill(es: Record<string, unknown>) {
  const skill = es.skill as Record<string, unknown> | null
  const verifiedByUser = es.verified_by_user as Record<string, unknown> | null

  return {
    id: es.id as string,
    entityType: es.entity_type as string,
    entityId: es.entity_id as string,
    skillId: es.skill_id as string,
    skillNameOverride: es.skill_name_override as string | null,
    skillName: skill?.name ?? es.skill_name_override,
    skillCanonicalName: skill?.canonical_name ?? null,
    skillCategory: skill?.category ?? null,
    skillDomain: skill?.domain ?? null,
    proficiencyLevel: es.proficiency_level as number | null,
    yearsExperience: es.years_experience as number | null,
    lastUsedDate: es.last_used_date as string | null,
    isPrimary: es.is_primary as boolean,
    isRequired: es.is_required as boolean | null,
    minProficiencyRequired: es.min_proficiency_required as number | null,
    isVerified: es.is_verified as boolean,
    verifiedBy: es.verified_by as string | null,
    verifiedByUser: verifiedByUser ? {
      id: verifiedByUser.id as string,
      fullName: verifiedByUser.full_name as string,
    } : null,
    verifiedAt: es.verified_at as string | null,
    verificationMethod: es.verification_method as string | null,
    confidenceScore: es.confidence_score as number | null,
    source: es.source as string | null,
    sourceContext: es.source_context as string | null,
    createdAt: es.created_at as string,
    updatedAt: es.updated_at as string,
  }
}

// ============================================
// ROUTER
// ============================================

export const entitySkillsRouter = router({
  // ==========================================
  // LIST BY ENTITY - All skills for an entity
  // ==========================================
  listByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      verifiedOnly: z.boolean().default(false),
      primaryOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('entity_skills')
        .select(`
          *,
          skill:skills!skill_id(id, name, canonical_name, category, domain),
          verified_by_user:user_profiles!verified_by(id, full_name)
        `)
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)
        .order('is_primary', { ascending: false })
        .order('proficiency_level', { ascending: false, nullsFirst: false })

      if (input.verifiedOnly) {
        query = query.eq('is_verified', true)
      }
      if (input.primaryOnly) {
        query = query.eq('is_primary', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to list entity skills:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformEntitySkill) ?? []
    }),

  // ==========================================
  // GET BY ID - Single entity skill
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('entity_skills')
        .select(`
          *,
          skill:skills!skill_id(id, name, canonical_name, category, domain),
          verified_by_user:user_profiles!verified_by(id, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity skill not found' })
      }

      return transformEntitySkill(data)
    }),

  // ==========================================
  // ADD - Add skill to entity
  // ==========================================
  add: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      skillId: z.string().uuid(),
      skillNameOverride: z.string().optional(), // For ad-hoc skills
      proficiencyLevel: z.number().min(1).max(5).optional(),
      yearsExperience: z.number().min(0).max(50).optional(),
      lastUsedDate: z.coerce.date().optional(),
      isPrimary: z.boolean().default(false),
      isRequired: z.boolean().optional(), // For jobs
      minProficiencyRequired: z.number().min(1).max(5).optional(), // For jobs
      source: SourceEnum.default('manual'),
      sourceContext: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('entity_skills')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          skill_id: input.skillId,
          skill_name_override: input.skillNameOverride,
          proficiency_level: input.proficiencyLevel,
          years_experience: input.yearsExperience,
          last_used_date: input.lastUsedDate?.toISOString().split('T')[0],
          is_primary: input.isPrimary,
          is_required: input.isRequired,
          min_proficiency_required: input.minProficiencyRequired,
          source: input.source,
          source_context: input.sourceContext,
          verification_method: 'self_reported',
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {  // Unique violation
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Skill already added to this entity'
          })
        }
        console.error('Failed to add entity skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // BULK ADD - Add multiple skills at once
  // ==========================================
  bulkAdd: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      skills: z.array(z.object({
        skillId: z.string().uuid(),
        proficiencyLevel: z.number().min(1).max(5).optional(),
        yearsExperience: z.number().min(0).max(50).optional(),
        isPrimary: z.boolean().default(false),
        isRequired: z.boolean().optional(),
        minProficiencyRequired: z.number().min(1).max(5).optional(),
      })),
      source: SourceEnum.default('manual'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const skillsToInsert = input.skills.map(skill => ({
        org_id: orgId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        skill_id: skill.skillId,
        proficiency_level: skill.proficiencyLevel,
        years_experience: skill.yearsExperience,
        is_primary: skill.isPrimary,
        is_required: skill.isRequired,
        min_proficiency_required: skill.minProficiencyRequired,
        source: input.source,
        verification_method: 'self_reported',
      }))

      const { data, error } = await adminClient
        .from('entity_skills')
        .upsert(skillsToInsert, {
          onConflict: 'entity_type,entity_id,skill_id',
          ignoreDuplicates: true,
        })
        .select()

      if (error) {
        console.error('Failed to bulk add entity skills:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { count: data?.length ?? 0 }
    }),

  // ==========================================
  // UPDATE - Update entity skill
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      proficiencyLevel: z.number().min(1).max(5).optional(),
      yearsExperience: z.number().min(0).max(50).optional(),
      lastUsedDate: z.coerce.date().optional(),
      isPrimary: z.boolean().optional(),
      isRequired: z.boolean().optional(),
      minProficiencyRequired: z.number().min(1).max(5).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const { id, ...updates } = input

      const updateData: Record<string, unknown> = {}
      if (updates.proficiencyLevel !== undefined) updateData.proficiency_level = updates.proficiencyLevel
      if (updates.yearsExperience !== undefined) updateData.years_experience = updates.yearsExperience
      if (updates.lastUsedDate !== undefined) updateData.last_used_date = updates.lastUsedDate.toISOString().split('T')[0]
      if (updates.isPrimary !== undefined) updateData.is_primary = updates.isPrimary
      if (updates.isRequired !== undefined) updateData.is_required = updates.isRequired
      if (updates.minProficiencyRequired !== undefined) updateData.min_proficiency_required = updates.minProficiencyRequired

      const { error } = await adminClient
        .from('entity_skills')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update entity skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // REMOVE - Soft delete skill from entity
  // ==========================================
  remove: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('entity_skills')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to remove entity skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // VERIFY - Mark skill as verified
  // ==========================================
  verify: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      verificationMethod: VerificationMethodEnum,
      confidenceScore: z.number().min(0).max(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('entity_skills')
        .update({
          is_verified: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          verification_method: input.verificationMethod,
          confidence_score: input.confidenceScore,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to verify entity skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // UNVERIFY - Remove verification
  // ==========================================
  unverify: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('entity_skills')
        .update({
          is_verified: false,
          verified_by: null,
          verified_at: null,
          verification_method: 'self_reported',
          confidence_score: null,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to unverify entity skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // TOGGLE PRIMARY - Set as primary skill
  // ==========================================
  togglePrimary: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      isPrimary: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('entity_skills')
        .update({ is_primary: input.isPrimary })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to toggle primary skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // MATCH TO JOB - Match entity skills against job requirements
  // ==========================================
  matchToJob: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      jobId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('match_entity_skills_to_job', {
          p_entity_type: input.entityType,
          p_entity_id: input.entityId,
          p_job_id: input.jobId,
        })

      if (error) {
        console.error('Failed to match skills to job:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const results = (data as Array<{
        skill_id: string
        skill_name: string
        entity_proficiency: number | null
        job_min_proficiency: number | null
        is_required: boolean | null
        match_status: string
      }>) ?? []

      // Calculate match summary
      const required = results.filter(r => r.is_required)
      const requiredMatched = required.filter(r => r.match_status === 'matched')
      const requiredPartial = required.filter(r => r.match_status === 'partial')
      const requiredMissing = required.filter(r => r.match_status === 'missing')

      return {
        skills: results.map(r => ({
          skillId: r.skill_id,
          skillName: r.skill_name,
          entityProficiency: r.entity_proficiency,
          jobMinProficiency: r.job_min_proficiency,
          isRequired: r.is_required,
          matchStatus: r.match_status as 'matched' | 'partial' | 'missing',
        })),
        summary: {
          totalRequired: required.length,
          matched: requiredMatched.length,
          partial: requiredPartial.length,
          missing: requiredMissing.length,
          matchPercentage: required.length > 0
            ? Math.round((requiredMatched.length / required.length) * 100)
            : 100,
        },
      }
    }),

  // ==========================================
  // STATS BY ENTITY - Skill statistics for entity
  // ==========================================
  statsByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { count: total } = await adminClient
        .from('entity_skills')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)

      const { count: verified } = await adminClient
        .from('entity_skills')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .eq('is_verified', true)
        .is('deleted_at', null)

      const { count: primary } = await adminClient
        .from('entity_skills')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .eq('is_primary', true)
        .is('deleted_at', null)

      const { count: required } = await adminClient
        .from('entity_skills')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .eq('is_required', true)
        .is('deleted_at', null)

      return {
        total: total ?? 0,
        verified: verified ?? 0,
        primary: primary ?? 0,
        required: required ?? 0,
      }
    }),

  // ==========================================
  // SEARCH ENTITIES BY SKILL - Find entities with specific skills
  // ==========================================
  searchEntitiesBySkill: orgProtectedProcedure
    .input(z.object({
      skillIds: z.array(z.string().uuid()).min(1).max(10),
      entityType: z.string().optional(),
      minProficiency: z.number().min(1).max(5).optional(),
      verifiedOnly: z.boolean().default(false),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('entity_skills')
        .select('entity_type, entity_id, skill_id, proficiency_level, is_verified')
        .eq('org_id', orgId)
        .in('skill_id', input.skillIds)
        .is('deleted_at', null)

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }

      if (input.minProficiency !== undefined) {
        query = query.gte('proficiency_level', input.minProficiency)
      }

      if (input.verifiedOnly) {
        query = query.eq('is_verified', true)
      }

      const { data, error } = await query.order('proficiency_level', { ascending: false })

      if (error) {
        console.error('Failed to search entities by skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Group by entity and count matching skills
      const entityMap = new Map<string, {
        entityType: string
        entityId: string
        matchingSkills: number
        avgProficiency: number
        proficiencies: number[]
      }>()

      for (const row of data ?? []) {
        const key = `${row.entity_type}:${row.entity_id}`
        const existing = entityMap.get(key)

        if (existing) {
          existing.matchingSkills++
          existing.proficiencies.push(row.proficiency_level ?? 0)
        } else {
          entityMap.set(key, {
            entityType: row.entity_type,
            entityId: row.entity_id,
            matchingSkills: 1,
            avgProficiency: 0,
            proficiencies: [row.proficiency_level ?? 0],
          })
        }
      }

      // Calculate averages and sort
      const results = Array.from(entityMap.values())
        .map(e => ({
          ...e,
          avgProficiency: e.proficiencies.length > 0
            ? Number((e.proficiencies.reduce((a, b) => a + b, 0) / e.proficiencies.length).toFixed(1))
            : 0,
        }))
        .sort((a, b) => {
          // Sort by matching skills first, then by avg proficiency
          if (b.matchingSkills !== a.matchingSkills) {
            return b.matchingSkills - a.matchingSkills
          }
          return b.avgProficiency - a.avgProficiency
        })
        .slice(0, input.limit)

      return results.map(r => ({
        entityType: r.entityType,
        entityId: r.entityId,
        matchingSkills: r.matchingSkills,
        totalRequired: input.skillIds.length,
        avgProficiency: r.avgProficiency,
      }))
    }),
})
