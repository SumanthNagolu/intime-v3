/**
 * tRPC Router: Files Module
 * Handles file uploads, listing, and deletion for documents
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { fileUploads } from '@/lib/db/schema/shared';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { createAdminClient } from '@/lib/supabase/admin';

const DOCUMENTS_BUCKET = 'documents';

export const filesRouter = router({
  /**
   * Get files for an entity
   */
  list: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const { entityType, entityId, limit, offset } = input;

      const files = await db.select({
        id: fileUploads.id,
        bucket: fileUploads.bucket,
        filePath: fileUploads.filePath,
        fileName: fileUploads.fileName,
        fileSize: fileUploads.fileSize,
        mimeType: fileUploads.mimeType,
        entityType: fileUploads.entityType,
        entityId: fileUploads.entityId,
        uploadedBy: fileUploads.uploadedBy,
        uploadedAt: fileUploads.uploadedAt,
        metadata: fileUploads.metadata,
        uploaderName: userProfiles.fullName,
      })
        .from(fileUploads)
        .leftJoin(userProfiles, eq(fileUploads.uploadedBy, userProfiles.id))
        .where(and(
          eq(fileUploads.orgId, orgId),
          eq(fileUploads.entityType, entityType),
          eq(fileUploads.entityId, entityId),
          isNull(fileUploads.deletedAt)
        ))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(fileUploads.uploadedAt));

      return files;
    }),

  /**
   * Get signed URL for downloading a file
   */
  getDownloadUrl: orgProtectedProcedure
    .input(z.object({
      fileId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const [file] = await db.select()
        .from(fileUploads)
        .where(and(
          eq(fileUploads.id, input.fileId),
          eq(fileUploads.orgId, orgId),
          isNull(fileUploads.deletedAt)
        ))
        .limit(1);

      if (!file) {
        throw new Error('File not found');
      }

      const supabase = createAdminClient();
      const { data, error } = await supabase.storage
        .from(file.bucket)
        .createSignedUrl(file.filePath, 3600); // 1 hour

      if (error) {
        throw new Error(`Failed to generate download URL: ${error.message}`);
      }

      return {
        url: data.signedUrl,
        fileName: file.fileName,
        mimeType: file.mimeType,
      };
    }),

  /**
   * Get presigned upload URL
   */
  getUploadUrl: orgProtectedProcedure
    .input(z.object({
      fileName: z.string().min(1),
      mimeType: z.string().min(1),
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;
      const { fileName, mimeType, entityType, entityId } = input;

      // Get user profile ID - try authId first, then id
      let [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId))
        .limit(1);

      // Fallback: try by profile id directly
      if (!userProfile) {
        [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.id, userId))
          .limit(1);
      }

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${orgId}/${entityType}/${entityId}/${timestamp}-${sanitizedName}`;

      const supabase = createAdminClient();

      // Create signed upload URL
      const { data, error } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .createSignedUploadUrl(filePath);

      if (error) {
        throw new Error(`Failed to create upload URL: ${error.message}`);
      }

      return {
        uploadUrl: data.signedUrl,
        token: data.token,
        filePath,
        bucket: DOCUMENTS_BUCKET,
      };
    }),

  /**
   * Record a completed upload
   */
  recordUpload: orgProtectedProcedure
    .input(z.object({
      bucket: z.string(),
      filePath: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      mimeType: z.string(),
      entityType: z.string(),
      entityId: z.string().uuid(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;

      // Get user profile ID - try authId first, then id
      let [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId))
        .limit(1);

      // Fallback: try by profile id directly
      if (!userProfile) {
        [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.id, userId))
          .limit(1);
      }

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const [newFile] = await db.insert(fileUploads).values({
        orgId,
        bucket: input.bucket,
        filePath: input.filePath,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        entityType: input.entityType,
        entityId: input.entityId,
        uploadedBy: userProfile.id,
        metadata: input.metadata || {},
      }).returning();

      return newFile;
    }),

  /**
   * Update file metadata
   */
  updateMetadata: orgProtectedProcedure
    .input(z.object({
      fileId: z.string().uuid(),
      metadata: z.record(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      // Verify file exists and belongs to org
      const [file] = await db.select()
        .from(fileUploads)
        .where(and(
          eq(fileUploads.id, input.fileId),
          eq(fileUploads.orgId, orgId),
          isNull(fileUploads.deletedAt)
        ))
        .limit(1);

      if (!file) {
        throw new Error('File not found');
      }

      // Merge new metadata with existing
      const existingMetadata = (file.metadata as Record<string, any>) || {};
      const newMetadata = { ...existingMetadata, ...input.metadata };

      const [updated] = await db.update(fileUploads)
        .set({ metadata: newMetadata })
        .where(eq(fileUploads.id, input.fileId))
        .returning();

      return updated;
    }),

  /**
   * Delete a file (soft delete)
   */
  delete: orgProtectedProcedure
    .input(z.object({
      fileId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      // Get file info
      const [file] = await db.select()
        .from(fileUploads)
        .where(and(
          eq(fileUploads.id, input.fileId),
          eq(fileUploads.orgId, orgId),
          isNull(fileUploads.deletedAt)
        ))
        .limit(1);

      if (!file) {
        throw new Error('File not found');
      }

      // Delete from storage
      const supabase = createAdminClient();
      const { error: storageError } = await supabase.storage
        .from(file.bucket)
        .remove([file.filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with soft delete even if storage delete fails
      }

      // Soft delete from database
      const [deleted] = await db.update(fileUploads)
        .set({ deletedAt: new Date() })
        .where(eq(fileUploads.id, input.fileId))
        .returning();

      return { success: true, id: deleted.id };
    }),
});
