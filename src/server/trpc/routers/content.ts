/**
 * Content Upload tRPC Router
 * Story: ACAD-004
 *
 * Endpoints for:
 * - Uploading course content
 * - Generating signed URLs
 * - Managing content assets
 * - Storage analytics
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  uploadCourseContent,
  getSignedUrl,
  deleteContentAsset,
  replaceContentAsset,
  getTopicAssets,
  getCourseStorageUsage,
  canUserUpload,
} from '@/lib/storage/upload';
import { createClient } from '@/lib/supabase/server';

export const contentRouter = router({
  /**
   * Upload content (requires admin permissions)
   * Note: File upload handled separately via multipart form data
   * This endpoint records the upload after it's complete
   */
  recordUpload: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        storagePath: z.string(),
        fileType: z.enum(['video', 'pdf', 'image', 'document', 'other']),
        mimeType: z.string(),
        fileSizeBytes: z.number().int().positive(),
        topicId: z.string().uuid().optional(),
        lessonId: z.string().uuid().optional(),
        cdnUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user can upload
      const canUpload = await canUserUpload(ctx.userId);
      if (!canUpload) {
        throw new Error('Insufficient permissions to upload content');
      }

      const supabase = await createClient();

      const { data: assetId, error } = await supabase.rpc('record_content_upload', {
        p_filename: input.filename,
        p_storage_path: input.storagePath,
        p_file_type: input.fileType,
        p_mime_type: input.mimeType,
        p_file_size_bytes: input.fileSizeBytes,
        p_topic_id: input.topicId ?? undefined,
        p_lesson_id: input.lessonId ?? undefined,
        p_uploaded_by: ctx.userId,
        p_cdn_url: input.cdnUrl ?? undefined,
      });

      if (error) {
        throw new Error(`Failed to record upload: ${error.message}`);
      }

      return { assetId };
    }),

  /**
   * Get signed URL for private content
   */
  getSignedUrl: protectedProcedure
    .input(
      z.object({
        storagePath: z.string(),
        expiresInSeconds: z.number().int().positive().default(3600),
      })
    )
    .query(async ({ input }) => {
      const result = await getSignedUrl(input.storagePath, input.expiresInSeconds);
      return result;
    }),

  /**
   * Get content asset by ID
   */
  getAsset: protectedProcedure
    .input(
      z.object({
        assetId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('content_assets')
        .select(
          `
          *,
          topic:module_topics(id, title, slug),
          lesson:topic_lessons(id, title),
          uploader:user_profiles!uploaded_by(id, full_name, email)
        `
        )
        .eq('id', input.assetId)
        .single();

      if (error) {
        throw new Error(`Asset not found: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get all assets for a topic
   */
  getTopicAssets: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const assets = await getTopicAssets(input.topicId);
      return assets;
    }),

  /**
   * Get assets for a course
   */
  getCourseAssets: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('content_assets')
        .select(
          `
          *,
          topic:module_topics!inner(
            id,
            title,
            module:course_modules!inner(
              id,
              course_id
            )
          )
        `
        )
        .eq('topic.module.course_id', input.courseId)
        .eq('is_current', true)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch course assets: ${error.message}`);
      }

      return data || [];
    }),

  /**
   * Delete content asset
   */
  deleteAsset: protectedProcedure
    .input(
      z.object({
        assetId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user can delete
      const canUpload = await canUserUpload(ctx.userId);
      if (!canUpload) {
        throw new Error('Insufficient permissions to delete content');
      }

      await deleteContentAsset(input.assetId);

      return { success: true };
    }),

  /**
   * Replace content asset with new version
   */
  replaceAsset: protectedProcedure
    .input(
      z.object({
        oldAssetId: z.string().uuid(),
        newFilename: z.string(),
        newStoragePath: z.string(),
        newFileType: z.enum(['video', 'pdf', 'image', 'document', 'other']),
        newMimeType: z.string(),
        newFileSizeBytes: z.number().int().positive(),
        newCdnUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user can upload
      const canUpload = await canUserUpload(ctx.userId);
      if (!canUpload) {
        throw new Error('Insufficient permissions to replace content');
      }

      const supabase = await createClient();

      // Create new asset
      const { data: newAssetId, error: uploadError } = await supabase.rpc(
        'record_content_upload',
        {
          p_filename: input.newFilename,
          p_storage_path: input.newStoragePath,
          p_file_type: input.newFileType,
          p_mime_type: input.newMimeType,
          p_file_size_bytes: input.newFileSizeBytes,
          p_uploaded_by: ctx.userId,
          p_cdn_url: input.newCdnUrl ?? undefined,
        }
      );

      if (uploadError || !newAssetId) {
        throw new Error(`Failed to record new asset: ${uploadError?.message}`);
      }

      // Mark old as replaced
      const { error: replaceError } = await supabase.rpc('replace_content_asset', {
        p_old_asset_id: input.oldAssetId,
        p_new_asset_id: newAssetId,
      });

      if (replaceError) {
        throw new Error(`Failed to mark as replaced: ${replaceError.message}`);
      }

      return { newAssetId };
    }),

  /**
   * Get storage usage for a course
   */
  getStorageUsage: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const usage = await getCourseStorageUsage(input.courseId);

      if (!usage) {
        return {
          fileCount: 0,
          totalBytes: 0,
          videoCount: 0,
          videoBytes: 0,
          documentCount: 0,
          documentBytes: 0,
        };
      }

      return usage;
    }),

  /**
   * Search content assets
   */
  searchAssets: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        fileType: z.enum(['video', 'pdf', 'image', 'document', 'other']).optional(),
        courseId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      let query = supabase
        .from('content_assets')
        .select(
          `
          *,
          topic:module_topics(
            id,
            title,
            module:course_modules(
              id,
              title,
              course:courses(id, title)
            )
          )
        `
        )
        .eq('is_current', true)
        .or(`filename.ilike.%${input.query}%,searchable_content.ilike.%${input.query}%`)
        .limit(input.limit);

      if (input.fileType) {
        query = query.eq('file_type', input.fileType);
      }

      if (input.courseId) {
        query = query.eq('topic.module.course_id', input.courseId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      return data || [];
    }),

  /**
   * Get asset version history
   */
  getAssetHistory: protectedProcedure
    .input(
      z.object({
        assetId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      // Get all versions (current and replaced)
      const { data: versions, error } = await supabase
        .from('content_assets')
        .select('*')
        .or(`id.eq.${input.assetId},replaced_by.eq.${input.assetId}`)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch history: ${error.message}`);
      }

      return versions || [];
    }),

  /**
   * Check if user can upload
   */
  canUpload: protectedProcedure.query(async ({ ctx }) => {
    const canUpload = await canUserUpload(ctx.userId);
    return { canUpload };
  }),
});
