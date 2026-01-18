import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// RESUMES-01: Candidate Resume Versioning System
// ============================================

const ResumeSourceEnum = z.enum(['uploaded', 'parsed', 'manual', 'ai_generated'])
const ResumeTypeEnum = z.enum(['master', 'tailored', 'anonymized'])

export const resumesRouter = router({
  // ============================================
  // LIST RESUMES BY CANDIDATE
  // ============================================
  listByCandidate: orgProtectedProcedure
    .input(
      z.object({
        candidateId: z.string().uuid(),
        includeArchived: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('candidate_resumes')
        .select(
          `
          *,
          uploader:user_profiles!candidate_resumes_uploaded_by_fkey(id, full_name, avatar_url)
        `
        )
        .eq('org_id', orgId)
        .eq('candidate_id', input.candidateId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (!input.includeArchived) {
        query = query.eq('is_archived', false)
      }

      const { data, error } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { items: data || [] }
    }),

  // ============================================
  // GET SINGLE RESUME
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('candidate_resumes')
        .select(
          `
          *,
          uploader:user_profiles!candidate_resumes_uploaded_by_fkey(id, full_name, avatar_url)
        `
        )
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' })

      return data
    }),

  // ============================================
  // CREATE NEW RESUME
  // ============================================
  create: orgProtectedProcedure
    .input(
      z.object({
        candidateId: z.string().uuid(),
        bucket: z.string().default('resumes'),
        filePath: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string().default('application/pdf'),
        resumeType: ResumeTypeEnum.default('master'),
        title: z.string().optional(),
        targetRole: z.string().optional(),
        source: ResumeSourceEnum.default('uploaded'),
        notes: z.string().optional(),
        isPrimary: z.boolean().default(false),
        // For versioning - creates new version of existing resume
        previousVersionId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      if (!user?.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
      }

      // Look up user_profiles.id from auth_id for FK constraints
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!userProfile?.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User profile not found' })
      }

      const userProfileId = userProfile.id

      // If setting as primary, unset any existing primary
      if (input.isPrimary) {
        await adminClient
          .from('candidate_resumes')
          .update({ is_primary: false })
          .eq('candidate_id', input.candidateId)
          .eq('org_id', orgId)
          .eq('is_primary', true)
          .eq('is_archived', false)
      }

      // If this is a new version, mark previous as not latest
      let version = 1
      if (input.previousVersionId) {
        const { data: previousVersion } = await adminClient
          .from('candidate_resumes')
          .select('version')
          .eq('id', input.previousVersionId)
          .single()

        if (previousVersion) {
          version = (previousVersion.version || 1) + 1

          await adminClient
            .from('candidate_resumes')
            .update({ is_latest: false })
            .eq('id', input.previousVersionId)
        }
      }

      const { data, error } = await adminClient
        .from('candidate_resumes')
        .insert({
          org_id: orgId,
          candidate_id: input.candidateId,
          version,
          is_latest: true,
          previous_version_id: input.previousVersionId || null,
          bucket: input.bucket,
          file_path: input.filePath,
          file_name: input.fileName,
          file_size: input.fileSize,
          mime_type: input.mimeType,
          resume_type: input.resumeType,
          title: input.title || null,
          target_role: input.targetRole || null,
          source: input.source,
          notes: input.notes || null,
          is_primary: input.isPrimary,
          is_archived: false,
          uploaded_by: userProfileId,
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return data
    }),

  // ============================================
  // UPDATE RESUME METADATA
  // ============================================
  update: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        targetRole: z.string().optional(),
        notes: z.string().optional(),
        resumeType: ResumeTypeEnum.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (input.title !== undefined) updateData.title = input.title
      if (input.targetRole !== undefined) updateData.target_role = input.targetRole
      if (input.notes !== undefined) updateData.notes = input.notes
      if (input.resumeType !== undefined) updateData.resume_type = input.resumeType

      const { data, error } = await adminClient
        .from('candidate_resumes')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return data
    }),

  // ============================================
  // SET AS PRIMARY RESUME
  // ============================================
  setPrimary: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        candidateId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Unset existing primary
      await adminClient
        .from('candidate_resumes')
        .update({ is_primary: false })
        .eq('candidate_id', input.candidateId)
        .eq('org_id', orgId)
        .eq('is_primary', true)
        .eq('is_archived', false)

      // Set new primary
      const { data, error } = await adminClient
        .from('candidate_resumes')
        .update({ is_primary: true, updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return data
    }),

  // ============================================
  // ARCHIVE RESUME (Soft Delete)
  // ============================================
  archive: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      if (!user?.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
      }

      // Look up user_profiles.id from auth_id
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      const { data, error } = await adminClient
        .from('candidate_resumes')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: userProfile?.id || null,
          is_primary: false, // Can't be primary if archived
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return data
    }),

  // ============================================
  // GET VERSION HISTORY
  // ============================================
  getVersionHistory: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // First get the resume to find its root
      const { data: resume, error: resumeError } = await adminClient
        .from('candidate_resumes')
        .select('candidate_id, file_name')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (resumeError) throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' })

      // Get all versions with same candidate and file name (or linked by previous_version_id)
      const { data: versions, error } = await adminClient
        .from('candidate_resumes')
        .select(
          `
          id, version, is_latest, file_name, file_size, created_at, is_archived,
          uploader:user_profiles!candidate_resumes_uploaded_by_fkey(id, full_name)
        `
        )
        .eq('candidate_id', resume.candidate_id)
        .eq('org_id', orgId)
        .eq('file_name', resume.file_name)
        .order('version', { ascending: false })

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { items: versions || [] }
    }),

  // ============================================
  // GET SUBMISSION USAGE
  // ============================================
  getSubmissionUsage: orgProtectedProcedure
    .input(z.object({ resumeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('submissions')
        .select(
          `
          id, status, submitted_at,
          job:jobs!submissions_job_id_fkey(id, title),
          account:companies!submissions_company_id_fkey(id, name)
        `
        )
        .eq('client_resume_file_id', input.resumeId)
        .eq('org_id', orgId)
        .order('submitted_at', { ascending: false })
        .limit(50)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { items: data || [] }
    }),

  // ============================================
  // UPLOAD RESUME (with file data via base64)
  // Uses admin client to bypass storage RLS
  // ============================================
  upload: orgProtectedProcedure
    .input(
      z.object({
        candidateId: z.string().uuid(),
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string().default('application/pdf'),
        fileSize: z.number(),
        resumeType: ResumeTypeEnum.default('master'),
        title: z.string().optional(),
        source: ResumeSourceEnum.default('uploaded'),
        isPrimary: z.boolean().default(true),
        // AI parsing results
        parsedContent: z.record(z.unknown()).optional(),
        parsedSkills: z.array(z.string()).optional(),
        parsedExperience: z.array(z.record(z.unknown())).optional(),
        aiSummary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      if (!user?.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
      }

      // Look up user_profiles.id from auth_id
      const { data: userProfile } = await adminClient
        .from('user_profiles')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!userProfile?.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User profile not found' })
      }

      // Decode base64 file
      const base64Data = input.fileData.split(',')[1] || input.fileData
      const fileBuffer = Buffer.from(base64Data, 'base64')

      // Generate storage path
      const timestamp = Date.now()
      const fileExt = input.fileName.split('.').pop() || 'pdf'
      const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `${orgId}/${input.candidateId}/${timestamp}_${sanitizedFileName}`

      // Upload to Supabase Storage using admin client (bypasses RLS)
      const { error: uploadError } = await adminClient.storage
        .from('resumes')
        .upload(storagePath, fileBuffer, {
          contentType: input.mimeType,
          upsert: false,
        })

      if (uploadError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to upload resume: ${uploadError.message}`,
        })
      }

      // Get public URL
      const { data: urlData } = adminClient.storage.from('resumes').getPublicUrl(storagePath)

      // If setting as primary, unset any existing primary
      if (input.isPrimary) {
        await adminClient
          .from('candidate_resumes')
          .update({ is_primary: false })
          .eq('candidate_id', input.candidateId)
          .eq('org_id', orgId)
          .eq('is_primary', true)
          .eq('is_archived', false)
      }

      // Create resume record
      const now = new Date().toISOString()
      const { data, error } = await adminClient
        .from('candidate_resumes')
        .insert({
          org_id: orgId,
          candidate_id: input.candidateId,
          bucket: 'resumes',
          file_path: storagePath,
          file_name: input.fileName,
          file_size: input.fileSize,
          mime_type: input.mimeType,
          resume_type: input.resumeType,
          title: input.title || null,
          source: input.source,
          is_primary: input.isPrimary,
          is_latest: true,
          version: 1,
          is_archived: false,
          // AI parsing results
          parsed_content: input.parsedContent || null,
          parsed_skills: input.parsedSkills || null,
          parsed_experience: input.parsedExperience || null,
          ai_summary: input.aiSummary || null,
          // Audit
          uploaded_by: userProfile.id,
          uploaded_at: now,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        // Try to delete uploaded file if DB insert fails
        await adminClient.storage.from('resumes').remove([storagePath])
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        id: data.id,
        fileName: data.file_name,
        filePath: data.file_path,
        publicUrl: urlData.publicUrl,
      }
    }),
})
