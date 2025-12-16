import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// INPUT SCHEMAS
// ============================================

const skillCategoryEnum = z.enum([
  'technical',
  'programming',
  'framework',
  'database',
  'cloud',
  'devops',
  'soft_skill',
  'industry',
  'certification',
  'language',
  'other'
])

const skillInput = z.object({
  contactId: z.string().uuid(),
  skillId: z.string().uuid().optional(), // FK to skills master table
  skillName: z.string().min(1),
  skillCategory: skillCategoryEnum.optional(),
  proficiencyLevel: z.number().min(1).max(5).default(3), // 1-5 scale
  yearsExperience: z.number().min(0).optional(),
  lastUsedDate: z.string().optional(), // ISO date
  isPrimary: z.boolean().default(false),
})


// ============================================
// HELPER FUNCTIONS
// ============================================

function transformSkill(skill: Record<string, unknown>) {
  return {
    id: skill.id as string,
    contactId: skill.contact_id as string,
    skillId: skill.skill_id as string | null,
    skillName: skill.skill_name as string,
    skillCategory: skill.skill_category as string | null,
    proficiencyLevel: skill.proficiency_level as number,
    yearsExperience: skill.years_experience as number | null,
    lastUsedDate: skill.last_used_date as string | null,
    isPrimary: skill.is_primary as boolean,
    isVerified: skill.is_verified as boolean,
    verifiedBy: skill.verified_by as string | null,
    verifiedAt: skill.verified_at as string | null,
    verificationMethod: skill.verification_method as string | null,
    createdAt: skill.created_at as string,
    updatedAt: skill.updated_at as string,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactSkillsRouter = router({
  // ==========================================
  // LIST - Paginated list with filters
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      skillName: z.string().optional(), // Search by name
      skillCategory: skillCategoryEnum.optional(),
      minProficiency: z.number().min(1).max(5).optional(),
      isPrimary: z.boolean().optional(),
      isVerified: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['skill_name', 'proficiency_level', 'years_experience', 'created_at']).default('proficiency_level'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_skills')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Filter by contact
      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      // Search by skill name
      if (input.skillName) {
        query = query.ilike('skill_name', `%${input.skillName}%`)
      }

      // Filter by category
      if (input.skillCategory) {
        query = query.eq('skill_category', input.skillCategory)
      }

      // Filter by minimum proficiency
      if (input.minProficiency !== undefined) {
        query = query.gte('proficiency_level', input.minProficiency)
      }

      // Filter primary skills
      if (input.isPrimary !== undefined) {
        query = query.eq('is_primary', input.isPrimary)
      }

      // Filter verified skills
      if (input.isVerified !== undefined) {
        query = query.eq('is_verified', input.isVerified)
      }

      // Apply sorting and pagination
      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list contact skills:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformSkill) ?? [],
        total: count ?? 0,
      }
    }),

  // ==========================================
  // GET BY ID - Single skill
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_skills')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Skill not found' })
      }

      return transformSkill(data)
    }),

  // ==========================================
  // GET BY CONTACT - All skills for a contact
  // ==========================================
  getByContact: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      primaryOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_skills')
        .select('*')
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)

      if (input.primaryOnly) {
        query = query.eq('is_primary', true)
      }

      query = query.order('is_primary', { ascending: false }).order('proficiency_level', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Failed to get skills by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformSkill) ?? []
    }),

  // ==========================================
  // SEARCH BY SKILL - Find contacts with a skill
  // ==========================================
  searchBySkill: orgProtectedProcedure
    .input(z.object({
      skillName: z.string().min(2),
      minProficiency: z.number().min(1).max(5).optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_skills')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, email, subtype, category)
        `)
        .eq('org_id', orgId)
        .ilike('skill_name', `%${input.skillName}%`)
        .is('deleted_at', null)

      if (input.minProficiency !== undefined) {
        query = query.gte('proficiency_level', input.minProficiency)
      }

      query = query.order('proficiency_level', { ascending: false }).limit(input.limit)

      const { data, error } = await query

      if (error) {
        console.error('Failed to search by skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(skill => ({
        ...transformSkill(skill),
        contact: skill.contact,
      })) ?? []
    }),

  // ==========================================
  // CREATE - Add new skill
  // ==========================================
  create: orgProtectedProcedure
    .input(skillInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_skills')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          skill_id: input.skillId,
          skill_name: input.skillName,
          skill_category: input.skillCategory,
          proficiency_level: input.proficiencyLevel,
          years_experience: input.yearsExperience,
          last_used_date: input.lastUsedDate,
          is_primary: input.isPrimary,
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
  // BULK CREATE - Add multiple skills at once
  // ==========================================
  bulkCreate: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      skills: z.array(z.object({
        skillId: z.string().uuid().optional(),
        skillName: z.string().min(1),
        skillCategory: skillCategoryEnum.optional(),
        proficiencyLevel: z.number().min(1).max(5).default(3),
        yearsExperience: z.number().min(0).optional(),
        isPrimary: z.boolean().default(false),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const skillsToInsert = input.skills.map(skill => ({
        org_id: orgId,
        contact_id: input.contactId,
        skill_id: skill.skillId,
        skill_name: skill.skillName,
        skill_category: skill.skillCategory,
        proficiency_level: skill.proficiencyLevel,
        years_experience: skill.yearsExperience,
        is_primary: skill.isPrimary,
      }))

      const { data, error } = await adminClient
        .from('contact_skills')
        .insert(skillsToInsert)
        .select()

      if (error) {
        console.error('Failed to bulk create skills:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { count: data?.length ?? 0 }
    }),

  // ==========================================
  // UPDATE - Modify existing skill
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      skillName: z.string().min(1).optional(),
      skillCategory: skillCategoryEnum.optional(),
      proficiencyLevel: z.number().min(1).max(5).optional(),
      yearsExperience: z.number().min(0).optional(),
      lastUsedDate: z.string().optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { id, ...updateData } = input

      // Build update object
      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updateData.skillName !== undefined) dbUpdate.skill_name = updateData.skillName
      if (updateData.skillCategory !== undefined) dbUpdate.skill_category = updateData.skillCategory
      if (updateData.proficiencyLevel !== undefined) dbUpdate.proficiency_level = updateData.proficiencyLevel
      if (updateData.yearsExperience !== undefined) dbUpdate.years_experience = updateData.yearsExperience
      if (updateData.lastUsedDate !== undefined) dbUpdate.last_used_date = updateData.lastUsedDate
      if (updateData.isPrimary !== undefined) dbUpdate.is_primary = updateData.isPrimary

      const { error } = await adminClient
        .from('contact_skills')
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
  // DELETE - Soft delete skill
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_skills')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete skill:', error)
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
      verificationMethod: z.string().optional(), // 'test', 'interview', 'certification', 'reference'
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_skills')
        .update({
          is_verified: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          verification_method: input.verificationMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to verify skill:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // STATS - Skill statistics
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_skills')
        .select('id, skill_name, skill_category, proficiency_level, is_primary, is_verified')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      const { data: skills } = await query

      const byCategory = skills?.reduce((acc, skill) => {
        const cat = skill.skill_category || 'other'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const byProficiency = skills?.reduce((acc, skill) => {
        acc[skill.proficiency_level] = (acc[skill.proficiency_level] || 0) + 1
        return acc
      }, {} as Record<number, number>) || {}

      return {
        total: skills?.length ?? 0,
        primary: skills?.filter(s => s.is_primary).length ?? 0,
        verified: skills?.filter(s => s.is_verified).length ?? 0,
        byCategory,
        byProficiency,
        averageProficiency: skills?.length
          ? (skills.reduce((sum, s) => sum + s.proficiency_level, 0) / skills.length).toFixed(1)
          : '0',
      }
    }),
})
