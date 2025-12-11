import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// DOCS-01: Centralized Documents System
// ============================================

// Input schemas
const DocumentTypeEnum = z.enum([
  'resume',
  'cover_letter',
  'id_document',
  'certification',
  'reference_letter',
  'background_check',
  'drug_test',
  'i9',
  'w4',
  'direct_deposit',
  'msa',
  'nda',
  'sow',
  'w9',
  'coi',
  'insurance',
  'contract',
  'job_description',
  'requirements',
  'scorecard',
  'other',
  'note_attachment',
  'email_attachment',
])

const DocumentCategoryEnum = z.enum([
  'compliance',
  'legal',
  'marketing',
  'hr',
  'operational',
  'general',
])

const AccessLevelEnum = z.enum(['public', 'standard', 'confidential', 'restricted'])

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export const documentsRouter = router({
  // ============================================
  // LIST DOCUMENTS BY ENTITY
  // ============================================
  listByEntity: orgProtectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        documentType: DocumentTypeEnum.optional(),
        category: DocumentCategoryEnum.optional(),
        latestOnly: z.boolean().default(true),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('documents')
        .select(
          `
          *,
          uploader:user_profiles!uploaded_by(id, full_name, avatar_url)
        `,
          { count: 'exact' }
        )
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (input.latestOnly) {
        query = query.eq('is_latest_version', true)
      }
      if (input.documentType) {
        query = query.eq('document_type', input.documentType)
      }
      if (input.category) {
        query = query.eq('document_category', input.category)
      }

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items:
          data?.map((d) => ({
            id: d.id,
            entityType: d.entity_type,
            entityId: d.entity_id,
            fileName: d.file_name,
            fileType: d.file_type,
            mimeType: d.mime_type,
            fileSizeBytes: d.file_size_bytes,
            storageBucket: d.storage_bucket,
            storagePath: d.storage_path,
            publicUrl: d.public_url,
            documentType: d.document_type,
            documentCategory: d.document_category,
            description: d.description,
            version: d.version,
            isLatestVersion: d.is_latest_version,
            expiresAt: d.expires_at,
            isConfidential: d.is_confidential,
            accessLevel: d.access_level,
            tags: d.tags,
            uploader: d.uploader,
            createdAt: d.created_at,
          })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET SINGLE DOCUMENT
  // ============================================
  getById: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        logAccess: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('documents')
        .select(
          `
          *,
          uploader:user_profiles!uploaded_by(id, full_name, avatar_url),
          previous:documents!previous_version_id(id, version, created_at, file_name)
        `
        )
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' })

      // Log access
      if (input.logAccess && user) {
        await supabase.from('document_access_log').insert({
          document_id: input.id,
          user_id: user.id,
          action: 'view',
        })
      }

      return {
        id: data.id,
        entityType: data.entity_type,
        entityId: data.entity_id,
        fileName: data.file_name,
        fileType: data.file_type,
        mimeType: data.mime_type,
        fileSizeBytes: data.file_size_bytes,
        storageBucket: data.storage_bucket,
        storagePath: data.storage_path,
        publicUrl: data.public_url,
        documentType: data.document_type,
        documentCategory: data.document_category,
        description: data.description,
        version: data.version,
        isLatestVersion: data.is_latest_version,
        previousVersionId: data.previous_version_id,
        versionNotes: data.version_notes,
        processingStatus: data.processing_status,
        processedAt: data.processed_at,
        ocrText: data.ocr_text,
        extractedMetadata: data.extracted_metadata,
        contentHash: data.content_hash,
        expiresAt: data.expires_at,
        expiryAlertSentAt: data.expiry_alert_sent_at,
        expiryAlertDaysBefore: data.expiry_alert_days_before,
        isConfidential: data.is_confidential,
        accessLevel: data.access_level,
        accessibleByRoles: data.accessible_by_roles,
        tags: data.tags,
        uploader: data.uploader,
        previousVersion: data.previous,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    }),

  // ============================================
  // CREATE DOCUMENT (after file upload)
  // ============================================
  create: orgProtectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        fileName: z.string(),
        fileType: z.string().optional(),
        mimeType: z.string().optional(),
        fileSizeBytes: z.number().optional(),
        storageBucket: z.string(),
        storagePath: z.string(),
        publicUrl: z.string().optional(),
        documentType: DocumentTypeEnum.default('other'),
        documentCategory: DocumentCategoryEnum.default('general'),
        description: z.string().optional(),
        expiresAt: z.coerce.date().optional(),
        isConfidential: z.boolean().default(false),
        accessLevel: AccessLevelEnum.default('standard'),
        tags: z.array(z.string()).optional(),
        contentHash: z.string().optional(),
        // For versioning
        previousVersionId: z.string().uuid().optional(),
        versionNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      // Determine version number
      let version = 1
      if (input.previousVersionId) {
        const { data: prev } = await supabase
          .from('documents')
          .select('version')
          .eq('id', input.previousVersionId)
          .single()
        version = (prev?.version || 0) + 1

        // Mark previous as not latest
        await supabase
          .from('documents')
          .update({ is_latest_version: false })
          .eq('id', input.previousVersionId)
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          file_name: input.fileName,
          file_type: input.fileType,
          mime_type: input.mimeType,
          file_size_bytes: input.fileSizeBytes,
          storage_bucket: input.storageBucket,
          storage_path: input.storagePath,
          public_url: input.publicUrl,
          document_type: input.documentType,
          document_category: input.documentCategory,
          description: input.description,
          version,
          is_latest_version: true,
          previous_version_id: input.previousVersionId,
          version_notes: input.versionNotes,
          expires_at: input.expiresAt?.toISOString(),
          is_confidential: input.isConfidential,
          access_level: input.accessLevel,
          tags: input.tags,
          content_hash: input.contentHash,
          uploaded_by: user?.id,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { id: data.id, version: data.version }
    }),

  // ============================================
  // UPDATE DOCUMENT METADATA
  // ============================================
  update: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        description: z.string().optional(),
        documentType: DocumentTypeEnum.optional(),
        documentCategory: DocumentCategoryEnum.optional(),
        expiresAt: z.coerce.date().nullable().optional(),
        isConfidential: z.boolean().optional(),
        accessLevel: AccessLevelEnum.optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx
      const { id, ...updates } = input

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.documentType !== undefined) updateData.document_type = updates.documentType
      if (updates.documentCategory !== undefined)
        updateData.document_category = updates.documentCategory
      if (updates.expiresAt !== undefined)
        updateData.expires_at = updates.expiresAt?.toISOString() || null
      if (updates.isConfidential !== undefined) updateData.is_confidential = updates.isConfidential
      if (updates.accessLevel !== undefined) updateData.access_level = updates.accessLevel
      if (updates.tags !== undefined) updateData.tags = updates.tags

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { success: true }
    }),

  // ============================================
  // DELETE DOCUMENT (SOFT)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, supabase } = ctx

      // Log deletion
      if (user) {
        await supabase.from('document_access_log').insert({
          document_id: input.id,
          user_id: user.id,
          action: 'delete',
        })
      }

      const { error } = await supabase
        .from('documents')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { success: true }
    }),

  // ============================================
  // LOG DOWNLOAD
  // ============================================
  logDownload: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user, supabase } = ctx

      if (user) {
        await supabase.from('document_access_log').insert({
          document_id: input.id,
          user_id: user.id,
          action: 'download',
        })
      }

      return { success: true }
    }),

  // ============================================
  // GET VERSION HISTORY
  // ============================================
  getVersionHistory: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get the document
      const { data: doc, error: docError } = await adminClient
        .from('documents')
        .select('id, entity_type, entity_id, document_type')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (docError) throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' })

      // Get all versions for this entity + document type
      const { data: versions, error } = await adminClient
        .from('documents')
        .select(
          `
          id, version, file_name, file_size_bytes, version_notes, created_at, is_latest_version,
          uploader:user_profiles!uploaded_by(id, full_name, avatar_url)
        `
        )
        .eq('org_id', orgId)
        .eq('entity_type', doc.entity_type)
        .eq('entity_id', doc.entity_id)
        .eq('document_type', doc.document_type)
        .is('deleted_at', null)
        .order('version', { ascending: false })

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        currentDocumentId: input.id,
        versions:
          versions?.map((v) => ({
            id: v.id,
            version: v.version,
            fileName: v.file_name,
            fileSizeBytes: v.file_size_bytes,
            versionNotes: v.version_notes,
            isLatestVersion: v.is_latest_version,
            uploader: v.uploader,
            createdAt: v.created_at,
          })) ?? [],
      }
    }),

  // ============================================
  // GET EXPIRING DOCUMENTS
  // ============================================
  getExpiring: orgProtectedProcedure
    .input(
      z.object({
        daysAhead: z.number().min(1).max(90).default(30),
        entityType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + input.daysAhead)

      let query = adminClient
        .from('documents')
        .select(
          `
          id, file_name, document_type, entity_type, entity_id, expires_at,
          uploader:user_profiles!uploaded_by(id, full_name)
        `
        )
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .eq('is_latest_version', true)
        .not('expires_at', 'is', null)
        .lte('expires_at', futureDate.toISOString())
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true })

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }

      const { data, error } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items:
          data?.map((d) => ({
            id: d.id,
            fileName: d.file_name,
            documentType: d.document_type,
            entityType: d.entity_type,
            entityId: d.entity_id,
            expiresAt: d.expires_at,
            uploader: d.uploader,
          })) ?? [],
      }
    }),

  // ============================================
  // GET ACCESS LOG
  // ============================================
  getAccessLog: orgProtectedProcedure
    .input(
      z.object({
        documentId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Verify document belongs to org
      const { error: docError } = await adminClient
        .from('documents')
        .select('id')
        .eq('id', input.documentId)
        .eq('org_id', orgId)
        .single()

      if (docError) throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' })

      const { data, error, count } = await adminClient
        .from('document_access_log')
        .select(
          `
          id, action, ip_address, user_agent, accessed_at,
          user:user_profiles!user_id(id, full_name, avatar_url)
        `,
          { count: 'exact' }
        )
        .eq('document_id', input.documentId)
        .order('accessed_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        items:
          data?.map((a) => ({
            id: a.id,
            action: a.action,
            ipAddress: a.ip_address,
            userAgent: a.user_agent,
            user: a.user,
            accessedAt: a.accessed_at,
          })) ?? [],
        total: count ?? 0,
      }
    }),

  // ============================================
  // GET STATS FOR ENTITY
  // ============================================
  statsByEntity: orgProtectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { count: total } = await adminClient
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)
        .eq('is_latest_version', true)

      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const { count: expiringSoon } = await adminClient
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)
        .eq('is_latest_version', true)
        .not('expires_at', 'is', null)
        .lte('expires_at', thirtyDaysFromNow.toISOString())
        .gte('expires_at', new Date().toISOString())

      return {
        total: total ?? 0,
        expiringSoon: expiringSoon ?? 0,
      }
    }),

  // ============================================
  // CHECK FOR DUPLICATE (by content hash)
  // ============================================
  checkDuplicate: orgProtectedProcedure
    .input(
      z.object({
        contentHash: z.string(),
        entityType: z.string().optional(),
        entityId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('documents')
        .select('id, file_name, entity_type, entity_id, created_at')
        .eq('org_id', orgId)
        .eq('content_hash', input.contentHash)
        .is('deleted_at', null)
        .limit(5)

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }
      if (input.entityId) {
        query = query.eq('entity_id', input.entityId)
      }

      const { data, error } = await query

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return {
        hasDuplicate: (data?.length ?? 0) > 0,
        duplicates:
          data?.map((d) => ({
            id: d.id,
            fileName: d.file_name,
            entityType: d.entity_type,
            entityId: d.entity_id,
            createdAt: d.created_at,
          })) ?? [],
      }
    }),

  // ============================================
  // UPDATE PROCESSING STATUS
  // ============================================
  updateProcessingStatus: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['pending', 'processing', 'completed', 'failed']),
        ocrText: z.string().optional(),
        extractedMetadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, supabase } = ctx

      const updateData: Record<string, unknown> = {
        processing_status: input.status,
        updated_at: new Date().toISOString(),
      }

      if (input.status === 'completed') {
        updateData.processed_at = new Date().toISOString()
      }
      if (input.ocrText !== undefined) {
        updateData.ocr_text = input.ocrText
      }
      if (input.extractedMetadata !== undefined) {
        updateData.extracted_metadata = input.extractedMetadata
      }

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      return { success: true }
    }),
})
