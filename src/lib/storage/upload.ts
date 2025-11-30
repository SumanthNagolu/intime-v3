/**
 * Content Upload Service
 * Story: ACAD-004
 *
 * Handles uploading course content (videos, PDFs, images) to Supabase Storage
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  UploadResult,
  SignedUrlResult,
  getFileType,
  isValidFileType,
  isFileSizeValid,
  FileSizeExceededError,
  InvalidFileTypeError,
  FileUploadError,
  type ContentAsset,
} from '@/types/content';

const STORAGE_BUCKET = 'course-content';

/**
 * Upload course content file to Supabase Storage
 * Requires admin permissions - use only in server-side code
 */
export async function uploadCourseContent(
  file: File,
  options: {
    topicId?: string;
    lessonId?: string;
    isPublic?: boolean;
    uploadedBy?: string;
  } = {}
): Promise<UploadResult> {
  const { topicId, lessonId, isPublic: _isPublic = false, uploadedBy } = options;

  // Validate file type
  const fileType = getFileType(file.type);
  if (!isValidFileType(file.type, fileType)) {
    throw new InvalidFileTypeError(file.type, fileType);
  }

  // Validate file size
  if (!isFileSizeValid(file.size, fileType)) {
    throw new FileSizeExceededError(fileType, file.size, file.size);
  }

  const supabase = createAdminClient();

  // Generate unique storage path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = generateStoragePath(topicId, timestamp, sanitizedName);

  try {
    // Upload to Supabase Storage
    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new FileUploadError(
        `Upload failed: ${uploadError.message}`,
        'UPLOAD_FAILED',
        uploadError
      );
    }

    // Get public URL or generate signed URL
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    const cdnUrl = urlData.publicUrl;

    // Record in database
    const { data: assetId, error: dbError } = await supabase.rpc('record_content_upload', {
      p_filename: file.name,
      p_storage_path: storagePath,
      p_file_type: fileType,
      p_mime_type: file.type,
      p_file_size_bytes: file.size,
      p_topic_id: topicId ?? undefined,
      p_lesson_id: lessonId ?? undefined,
      p_uploaded_by: uploadedBy ?? undefined,
      p_cdn_url: cdnUrl,
    });

    if (dbError) {
      // If database record fails, attempt to clean up uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      throw new FileUploadError(
        `Failed to record upload: ${dbError.message}`,
        'DB_RECORD_FAILED',
        dbError
      );
    }

    return {
      assetId: assetId as string,
      storagePath,
      cdnUrl,
      fileType,
      fileSizeBytes: file.size,
    };
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error;
    }
    throw new FileUploadError(
      `Unexpected error during upload: ${error instanceof Error ? error.message : String(error)}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Generate signed URL for private content
 * Expires after specified duration (default 1 hour)
 */
export async function getSignedUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<SignedUrlResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) {
    throw new FileUploadError(
      `Failed to generate signed URL: ${error.message}`,
      'SIGNED_URL_FAILED',
      error
    );
  }

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  return {
    signedUrl: data.signedUrl,
    expiresAt,
  };
}

/**
 * Delete content asset from storage and database
 */
export async function deleteContentAsset(assetId: string): Promise<void> {
  const supabase = createAdminClient();

  // Get storage path first
  const { data: storagePath, error: pathError } = await supabase.rpc('get_asset_storage_path', {
    p_asset_id: assetId,
  });

  if (pathError || !storagePath) {
    throw new FileUploadError(
      `Asset not found: ${assetId}`,
      'ASSET_NOT_FOUND',
      pathError
    );
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([storagePath as string]);

  if (storageError) {
    throw new FileUploadError(
      `Failed to delete from storage: ${storageError.message}`,
      'STORAGE_DELETE_FAILED',
      storageError
    );
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('content_assets')
    .delete()
    .eq('id', assetId);

  if (dbError) {
    throw new FileUploadError(
      `Failed to delete database record: ${dbError.message}`,
      'DB_DELETE_FAILED',
      dbError
    );
  }
}

/**
 * Replace existing content asset with new file
 */
export async function replaceContentAsset(
  oldAssetId: string,
  newFile: File,
  uploadedBy?: string
): Promise<UploadResult> {
  const supabase = createAdminClient();

  // Get old asset details
  const { data: oldAsset, error: fetchError } = await supabase
    .from('content_assets')
    .select('topic_id, lesson_id, is_public')
    .eq('id', oldAssetId)
    .single();

  if (fetchError || !oldAsset) {
    throw new FileUploadError(
      `Old asset not found: ${oldAssetId}`,
      'ASSET_NOT_FOUND',
      fetchError
    );
  }

  // Upload new file
  const uploadResult = await uploadCourseContent(newFile, {
    topicId: oldAsset.topic_id ?? undefined,
    lessonId: oldAsset.lesson_id ?? undefined,
    isPublic: oldAsset.is_public ?? undefined,
    uploadedBy,
  });

  // Mark old asset as replaced
  const { error: replaceError } = await supabase.rpc('replace_content_asset', {
    p_old_asset_id: oldAssetId,
    p_new_asset_id: uploadResult.assetId,
  });

  if (replaceError) {
    throw new FileUploadError(
      `Failed to mark asset as replaced: ${replaceError.message}`,
      'REPLACE_FAILED',
      replaceError
    );
  }

  return uploadResult;
}

/**
 * Get all assets for a topic
 */
export async function getTopicAssets(topicId: string): Promise<ContentAsset[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_topic_assets', {
    p_topic_id: topicId,
  });

  if (error) {
    throw new FileUploadError(
      `Failed to fetch topic assets: ${error.message}`,
      'FETCH_FAILED',
      error
    );
  }

  return (data || []) as unknown as ContentAsset[];
}

/**
 * Get storage usage statistics for a course
 */
export async function getCourseStorageUsage(courseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_course_storage_usage', {
    p_course_id: courseId,
  });

  if (error) {
    throw new FileUploadError(
      `Failed to get storage usage: ${error.message}`,
      'FETCH_FAILED',
      error
    );
  }

  return data?.[0] || null;
}

/**
 * Helper: Generate storage path with proper structure
 */
function generateStoragePath(topicId: string | undefined, timestamp: number, filename: string): string {
  if (topicId) {
    return `courses/${topicId}/${timestamp}-${filename}`;
  }
  return `courses/general/${timestamp}-${filename}`;
}

/**
 * Helper: Extract text from PDF for searchability (placeholder)
 * TODO: Implement PDF text extraction
 */
export async function extractPDFText(_file: File): Promise<string> {
  // Placeholder - implement with pdf-parse or similar
  return '';
}

/**
 * Validate upload permissions
 */
export async function canUserUpload(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Check if user has admin or course_admin role
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId);

  if (error || !data) {
    return false;
  }

  return data.some((ur: { roles?: { name?: string } }) =>
    ['admin', 'course_admin'].includes(ur.roles?.name ?? '')
  );
}
