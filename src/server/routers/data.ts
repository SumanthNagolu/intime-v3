import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import {
  getEntityConfig,
  getImportableEntities,
  getExportableEntities,
  parseBase64File,
  validateRows,
  detectFileType,
} from '@/lib/data-management'

// =============================================================================
// EDGE FUNCTION HELPERS
// =============================================================================

/**
 * Triggers a Supabase Edge Function asynchronously (fire-and-forget)
 * Uses service role key for authentication
 */
async function triggerEdgeFunction(
  functionName: string,
  payload: Record<string, unknown>
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase configuration for Edge Function')
    return
  }

  const url = `${supabaseUrl}/functions/v1/${functionName}`

  // Fire and forget - don't await
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify(payload),
  }).catch((error) => {
    console.error(`Edge Function ${functionName} trigger failed:`, error)
  })
}

/**
 * Triggers Edge Function and waits for response (for operations that need immediate result)
 */
async function callEdgeFunction<T>(
  functionName: string,
  payload: Record<string, unknown>
): Promise<T> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration for Edge Function')
  }

  const url = `${supabaseUrl}/functions/v1/${functionName}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Edge Function ${functionName} failed: ${error}`)
  }

  return response.json() as Promise<T>
}

export const dataRouter = router({
  // ============================================================================
  // ENTITY METADATA
  // ============================================================================

  getImportableEntities: orgProtectedProcedure
    .query(() => {
      return getImportableEntities().map(e => ({
        name: e.name,
        displayName: e.displayName,
        fields: e.fields.filter(f => f.importable).map(f => ({
          name: f.name,
          displayName: f.displayName,
          type: f.type,
          required: f.required,
          enumValues: f.enumValues,
        })),
      }))
    }),

  getExportableEntities: orgProtectedProcedure
    .query(() => {
      return getExportableEntities().map(e => ({
        name: e.name,
        displayName: e.displayName,
        fields: e.fields.filter(f => f.exportable).map(f => ({
          name: f.name,
          displayName: f.displayName,
          type: f.type,
        })),
      }))
    }),

  // ============================================================================
  // IMPORT OPERATIONS
  // ============================================================================

  parseImportFile: orgProtectedProcedure
    .input(z.object({
      fileData: z.string(), // base64
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const parsed = await parseBase64File(input.fileData, input.fileName)

        return {
          headers: parsed.headers,
          sampleRows: parsed.rows.slice(0, 5),
          totalRows: parsed.totalRows,
          parseErrors: parsed.errors,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Failed to parse file',
        })
      }
    }),

  validateImportData: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      fileData: z.string(),
      fileName: z.string(),
      fieldMapping: z.record(z.string()),
    }))
    .mutation(async ({ input }) => {
      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      const parsed = await parseBase64File(input.fileData, input.fileName)
      const validation = validateRows(parsed.rows, entityConfig, input.fieldMapping)

      return {
        totalRows: parsed.totalRows,
        validRows: validation.validRowCount,
        errorRows: validation.errorRowCount,
        errors: validation.errors.slice(0, 100), // Limit to first 100
        warnings: validation.warnings.slice(0, 100),
        valid: validation.valid,
      }
    }),

  createImportJob: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      fileName: z.string(),
      fileData: z.string(), // base64
      fieldMapping: z.record(z.string()),
      importOptions: z.object({
        errorHandling: z.enum(['skip', 'stop', 'flag']).default('skip'),
        createMissingReferences: z.boolean().default(false),
        updateExisting: z.boolean().default(false),
      }).default({}),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Parse the base64 file to get buffer
      const base64Content = input.fileData.includes(',')
        ? input.fileData.split(',')[1]
        : input.fileData
      const buffer = Buffer.from(base64Content, 'base64')

      // Upload file to storage
      const filePath = `${orgId}/${Date.now()}-${input.fileName}`
      const contentType = detectFileType(input.fileName) === 'csv'
        ? 'text/csv'
        : detectFileType(input.fileName) === 'json'
          ? 'application/json'
          : 'application/octet-stream'

      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(filePath, buffer, { contentType })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload file' })
      }

      // Parse to get row count
      const parsed = await parseBase64File(input.fileData, input.fileName)

      // Create import job record
      const { data: job, error: jobError } = await supabase
        .from('import_jobs')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          file_name: input.fileName,
          file_path: filePath,
          file_size_bytes: buffer.length,
          field_mapping: input.fieldMapping,
          import_options: input.importOptions,
          total_rows: parsed.totalRows,
          status: 'pending',
          created_by: user?.id,
        })
        .select()
        .single()

      if (jobError) {
        console.error('Job creation error:', jobError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create import job' })
      }

      // Trigger Edge Function to process asynchronously (fire-and-forget)
      // The Edge Function will update job status and progress in the database
      // Client should poll getImportJob to track progress
      triggerEdgeFunction('process-import', { jobId: job.id })

      // Log audit
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'import_jobs',
        record_id: job.id,
        new_values: { entity_type: input.entityType, file_name: input.fileName },
      })

      // Get updated job
      const { data: updatedJob } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('id', job.id)
        .single()

      return updatedJob || job
    }),

  getImportJob: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('import_jobs')
        .select(`
          *,
          created_by_user:user_profiles!import_jobs_created_by_fkey(email, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Import job not found' })
      }

      return data
    }),

  listImportJobs: orgProtectedProcedure
    .input(z.object({
      status: z.string().optional(),
      entityType: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('import_jobs')
        .select(`
          *,
          created_by_user:user_profiles!import_jobs_created_by_fkey(email, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) {
        query = query.eq('status', input.status)
      }
      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { jobs: data, total: count || 0 }
    }),

  // ============================================================================
  // EXPORT OPERATIONS
  // ============================================================================

  createExportJob: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      exportName: z.string().optional(),
      filters: z.record(z.unknown()).default({}),
      columns: z.array(z.string()),
      format: z.enum(['csv', 'excel', 'json']).default('csv'),
      includeHeaders: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Create export job record
      const { data: job, error: jobError } = await supabase
        .from('export_jobs')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          export_name: input.exportName || `${input.entityType}-export`,
          filters: input.filters,
          columns: input.columns,
          format: input.format,
          include_headers: input.includeHeaders,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          created_by: user?.id,
        })
        .select()
        .single()

      if (jobError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create export job' })
      }

      // Trigger Edge Function to process asynchronously (fire-and-forget)
      // Client should poll getExportJob to track progress
      triggerEdgeFunction('process-export', { jobId: job.id })

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'export_jobs',
        record_id: job.id,
        new_values: { entity_type: input.entityType, format: input.format },
      })

      // Get updated job
      const { data: updatedJob } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', job.id)
        .single()

      return updatedJob || job
    }),

  getExportJob: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('export_jobs')
        .select(`
          *,
          created_by_user:user_profiles!export_jobs_created_by_fkey(email, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Export job not found' })
      }

      return data
    }),

  getExportDownloadUrl: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: job } = await supabase
        .from('export_jobs')
        .select('file_path, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (!job || job.status !== 'completed' || !job.file_path) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Export not ready' })
      }

      const { data: signedUrl } = await supabase.storage
        .from('exports')
        .createSignedUrl(job.file_path, 3600) // 1 hour

      return { url: signedUrl?.signedUrl }
    }),

  listExportJobs: orgProtectedProcedure
    .input(z.object({
      status: z.string().optional(),
      entityType: z.string().optional(),
      scheduled: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('export_jobs')
        .select(`
          *,
          created_by_user:user_profiles!export_jobs_created_by_fkey(email, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) query = query.eq('status', input.status)
      if (input.entityType) query = query.eq('entity_type', input.entityType)
      if (input.scheduled !== undefined) query = query.eq('is_scheduled', input.scheduled)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { jobs: data, total: count || 0 }
    }),

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  bulkUpdate: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      ids: z.array(z.string().uuid()).min(1).max(1000),
      updates: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Validate updates against schema
      const validFields = entityConfig.fields
        .filter(f => f.importable)
        .map(f => f.dbColumn)

      const updateData: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(input.updates)) {
        const field = entityConfig.fields.find(f => f.name === key || f.dbColumn === key)
        if (field && validFields.includes(field.dbColumn)) {
          updateData[field.dbColumn] = value
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No valid fields to update' })
      }

      // Perform bulk update
      const { data, error } = await supabase
        .from(entityConfig.table)
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('org_id', orgId)
        .in('id', input.ids)
        .select('id')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'bulk_update',
        table_name: entityConfig.table,
        new_values: { ids: input.ids, updates: updateData, count: data?.length },
      })

      return { updatedCount: data?.length || 0 }
    }),

  bulkDelete: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      ids: z.array(z.string().uuid()).min(1).max(1000),
      permanent: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      if (input.permanent) {
        // Archive records first
        const { data: records } = await supabase
          .from(entityConfig.table)
          .select('*')
          .eq('org_id', orgId)
          .in('id', input.ids)

        if (records && records.length > 0) {
          await supabase.from('archived_records').insert(
            records.map(r => ({
              org_id: orgId,
              entity_type: input.entityType,
              original_id: r.id,
              original_data: r,
              archive_reason: 'bulk_delete',
              archived_by: user?.id,
            }))
          )
        }

        // Hard delete
        const { error } = await supabase
          .from(entityConfig.table)
          .delete()
          .eq('org_id', orgId)
          .in('id', input.ids)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }
      } else {
        // Soft delete
        const { error } = await supabase
          .from(entityConfig.table)
          .update({ deleted_at: new Date().toISOString() })
          .eq('org_id', orgId)
          .in('id', input.ids)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: input.permanent ? 'bulk_delete_permanent' : 'bulk_delete',
        table_name: entityConfig.table,
        new_values: { ids: input.ids, count: input.ids.length },
      })

      return { deletedCount: input.ids.length }
    }),

  // ============================================================================
  // DUPLICATE MANAGEMENT
  // ============================================================================

  detectDuplicates: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      ruleId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const entityConfig = getEntityConfig(input.entityType)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Call Edge Function for duplicate detection (waits for result)
      // This handles the O(n²) comparison in a dedicated function with better performance
      try {
        const result = await callEdgeFunction<{ success: boolean; duplicatesFound: number }>('detect-duplicates', {
          orgId,
          entityType: input.entityType,
          ruleId: input.ruleId,
          userId: user?.id,
        })

        // Audit log
        await supabase.from('audit_logs').insert({
          org_id: orgId,
          user_id: user?.id,
          user_email: user?.email,
          action: 'detect_duplicates',
          table_name: 'duplicate_records',
          new_values: { entity_type: input.entityType, found: result.duplicatesFound },
        })

        return { duplicatesFound: result.duplicatesFound }
      } catch (error) {
        console.error('Duplicate detection failed:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Duplicate detection failed. Please try again.',
        })
      }
    }),

  listDuplicates: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      status: z.enum(['pending', 'merged', 'dismissed']).default('pending'),
      minConfidence: z.number().min(0).max(1).default(0.5),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error, count } = await supabase
        .from('duplicate_records')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('status', input.status)
        .gte('confidence_score', input.minConfidence)
        .order('confidence_score', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { duplicates: data, total: count || 0 }
    }),

  getDuplicateRecords: orgProtectedProcedure
    .input(z.object({
      duplicateId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: duplicate, error } = await supabase
        .from('duplicate_records')
        .select('*')
        .eq('id', input.duplicateId)
        .eq('org_id', orgId)
        .single()

      if (error || !duplicate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Duplicate record not found' })
      }

      const entityConfig = getEntityConfig(duplicate.entity_type)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Get both records
      const { data: records } = await supabase
        .from(entityConfig.table)
        .select('*')
        .in('id', [duplicate.record_id_1, duplicate.record_id_2])
        .eq('org_id', orgId)

      return {
        duplicate,
        records: records || [],
        entityConfig: {
          name: entityConfig.name,
          displayName: entityConfig.displayName,
          fields: entityConfig.fields,
        },
      }
    }),

  mergeDuplicates: orgProtectedProcedure
    .input(z.object({
      duplicateId: z.string().uuid(),
      keepRecordId: z.string().uuid(),
      mergeRecordId: z.string().uuid(),
      fieldOverrides: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: duplicate } = await supabase
        .from('duplicate_records')
        .select('*')
        .eq('id', input.duplicateId)
        .eq('org_id', orgId)
        .single()

      if (!duplicate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Duplicate record not found' })
      }

      const entityConfig = getEntityConfig(duplicate.entity_type)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Get both records
      const { data: keepRecord } = await supabase
        .from(entityConfig.table)
        .select('*')
        .eq('id', input.keepRecordId)
        .eq('org_id', orgId)
        .single()

      const { data: mergeRecord } = await supabase
        .from(entityConfig.table)
        .select('*')
        .eq('id', input.mergeRecordId)
        .eq('org_id', orgId)
        .single()

      if (!keepRecord || !mergeRecord) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'One or both records not found' })
      }

      // Merge records - fill in missing fields from merge record
      const mergedData: Record<string, unknown> = { ...keepRecord }
      for (const field of entityConfig.fields) {
        if (field.importable && !mergedData[field.dbColumn] && mergeRecord[field.dbColumn]) {
          mergedData[field.dbColumn] = mergeRecord[field.dbColumn]
        }
      }

      // Apply overrides
      if (input.fieldOverrides) {
        for (const [key, value] of Object.entries(input.fieldOverrides)) {
          const field = entityConfig.fields.find(f => f.name === key || f.dbColumn === key)
          if (field) {
            mergedData[field.dbColumn] = value
          }
        }
      }

      // Update keep record
      await supabase
        .from(entityConfig.table)
        .update(mergedData)
        .eq('id', input.keepRecordId)

      // Archive and delete merge record
      await supabase.from('archived_records').insert({
        org_id: orgId,
        entity_type: duplicate.entity_type,
        original_id: input.mergeRecordId,
        original_data: mergeRecord,
        archive_reason: 'merged_duplicate',
        archived_by: user?.id,
      })

      await supabase
        .from(entityConfig.table)
        .delete()
        .eq('id', input.mergeRecordId)

      // Update duplicate record
      await supabase
        .from('duplicate_records')
        .update({
          status: 'merged',
          merged_into_id: input.keepRecordId,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.duplicateId)

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'merge_duplicate',
        table_name: entityConfig.table,
        record_id: input.keepRecordId,
        old_values: { merged_record: mergeRecord },
        new_values: { merged_into: input.keepRecordId },
      })

      return { mergedIntoId: input.keepRecordId }
    }),

  dismissDuplicate: orgProtectedProcedure
    .input(z.object({
      duplicateId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      await supabase
        .from('duplicate_records')
        .update({
          status: 'dismissed',
          dismissed_reason: input.reason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.duplicateId)
        .eq('org_id', orgId)

      return { success: true }
    }),

  // ============================================================================
  // GDPR OPERATIONS
  // ============================================================================

  createGdprRequest: orgProtectedProcedure
    .input(z.object({
      requestType: z.enum(['dsar', 'erasure', 'rectification', 'restriction', 'portability']),
      subjectEmail: z.string().email(),
      subjectName: z.string().optional(),
      subjectPhone: z.string().optional(),
      notes: z.string().optional(),
      dueDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Generate request number
      const year = new Date().getFullYear()
      const { count } = await supabase
        .from('gdpr_requests')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', `${year}-01-01`)

      const requestNumber = `GDPR-${year}-${String((count || 0) + 1).padStart(4, '0')}`

      const { data, error } = await supabase
        .from('gdpr_requests')
        .insert({
          org_id: orgId,
          request_number: requestNumber,
          request_type: input.requestType,
          subject_email: input.subjectEmail,
          subject_name: input.subjectName,
          subject_phone: input.subjectPhone,
          notes: input.notes,
          due_date: input.dueDate,
          status: 'pending',
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'gdpr_requests',
        record_id: data.id,
        new_values: { request_type: input.requestType, subject_email: input.subjectEmail },
      })

      return data
    }),

  getGdprRequest: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data, error } = await supabase
        .from('gdpr_requests')
        .select(`
          *,
          created_by_user:user_profiles!gdpr_requests_created_by_fkey(email, full_name),
          processed_by_user:user_profiles!gdpr_requests_processed_by_fkey(email, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'GDPR request not found' })
      }

      return data
    }),

  listGdprRequests: orgProtectedProcedure
    .input(z.object({
      status: z.string().optional(),
      requestType: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('gdpr_requests')
        .select(`
          *,
          created_by_user:user_profiles!gdpr_requests_created_by_fkey(email, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.status) query = query.eq('status', input.status)
      if (input.requestType) query = query.eq('request_type', input.requestType)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { requests: data, total: count || 0 }
    }),

  processGdprRequest: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      action: z.enum(['discover', 'export', 'anonymize', 'complete', 'reject']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: request } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' })
      }

      // Actions that use Edge Function for heavy processing
      if (input.action === 'discover' || input.action === 'export' || input.action === 'anonymize') {
        // Trigger Edge Function for data discovery/export/anonymization
        // These are potentially slow operations that scan multiple tables
        triggerEdgeFunction('process-gdpr-request', {
          requestId: input.id,
          action: input.action,
          orgId,
        })

        // Update status to indicate processing has started
        const statusMap = {
          discover: 'in_review',
          export: 'processing',
          anonymize: 'processing',
        }

        await supabase
          .from('gdpr_requests')
          .update({ status: statusMap[input.action] })
          .eq('id', input.id)

      } else if (input.action === 'complete') {
        // Simple status update - done inline
        await supabase
          .from('gdpr_requests')
          .update({
            status: 'completed',
            processed_by: user?.id,
            processed_at: new Date().toISOString(),
            compliance_notes: input.notes,
          })
          .eq('id', input.id)
      } else if (input.action === 'reject') {
        // Simple status update - done inline
        await supabase
          .from('gdpr_requests')
          .update({
            status: 'rejected',
            processed_by: user?.id,
            processed_at: new Date().toISOString(),
            compliance_notes: input.notes,
          })
          .eq('id', input.id)
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: `gdpr_${input.action}`,
        table_name: 'gdpr_requests',
        record_id: input.id,
        new_values: { action: input.action, notes: input.notes },
      })

      // Return updated request
      const { data: updated } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('id', input.id)
        .single()

      return updated
    }),

  // ============================================================================
  // ARCHIVE OPERATIONS
  // ============================================================================

  listArchivedRecords: orgProtectedProcedure
    .input(z.object({
      entityType: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('archived_records')
        .select(`
          *,
          archived_by_user:user_profiles!archived_records_archived_by_fkey(email, full_name)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('restored_at', null)
        .is('permanently_deleted_at', null)
        .order('archived_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (input.entityType) query = query.eq('entity_type', input.entityType)

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { records: data, total: count || 0 }
    }),

  restoreArchivedRecord: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: archived } = await supabase
        .from('archived_records')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('restored_at', null)
        .single()

      if (!archived) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Archived record not found' })
      }

      const entityConfig = getEntityConfig(archived.entity_type)
      if (!entityConfig) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid entity type' })
      }

      // Restore to original table
      const { deleted_at, ...restoreData } = archived.original_data as Record<string, unknown>
      await supabase
        .from(entityConfig.table)
        .upsert({
          ...restoreData,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        })

      // Mark as restored
      await supabase
        .from('archived_records')
        .update({
          restored_at: new Date().toISOString(),
          restored_by: user?.id,
        })
        .eq('id', input.id)

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'restore',
        table_name: entityConfig.table,
        record_id: archived.original_id,
      })

      return { restoredId: archived.original_id }
    }),

  permanentlyDelete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: archived } = await supabase
        .from('archived_records')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('permanently_deleted_at', null)
        .single()

      if (!archived) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Archived record not found' })
      }

      // Mark as permanently deleted (keep for audit trail)
      await supabase
        .from('archived_records')
        .update({
          permanently_deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
          original_data: { _redacted: true, _deleted_at: new Date().toISOString() },
        })
        .eq('id', input.id)

      // Audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'permanent_delete',
        table_name: 'archived_records',
        record_id: input.id,
        old_values: { entity_type: archived.entity_type, original_id: archived.original_id },
      })

      return { success: true }
    }),

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================

  getDashboardStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get counts in parallel
      const [
        importJobsResult,
        exportJobsResult,
        duplicatesResult,
        gdprResult,
        archivedResult,
      ] = await Promise.all([
        supabase
          .from('import_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId),
        supabase
          .from('export_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId),
        supabase
          .from('duplicate_records')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'pending'),
        supabase
          .from('gdpr_requests')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'pending'),
        supabase
          .from('archived_records')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .is('restored_at', null)
          .is('permanently_deleted_at', null),
      ])

      // Get recent operations
      const { data: recentOps } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', orgId)
        .in('action', ['create', 'bulk_update', 'bulk_delete', 'merge_duplicate', 'gdpr_export', 'restore'])
        .in('table_name', ['import_jobs', 'export_jobs', 'gdpr_requests', 'duplicate_records', 'archived_records'])
        .order('created_at', { ascending: false })
        .limit(10)

      return {
        totalImports: importJobsResult.count || 0,
        totalExports: exportJobsResult.count || 0,
        pendingDuplicates: duplicatesResult.count || 0,
        pendingGdpr: gdprResult.count || 0,
        archivedRecords: archivedResult.count || 0,
        recentOperations: recentOps || [],
      }
    }),
})

// ============================================================================
// NOTE: Import/Export/Duplicate processing is handled by Supabase Edge Functions
// See: supabase/functions/process-import/
//      supabase/functions/process-export/
//      supabase/functions/detect-duplicates/
//      supabase/functions/process-gdpr-request/
// ============================================================================
