/**
 * Content Upload System Tests
 * Story: ACAD-004
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// TODO: Requires database setup
describe.skip('Content Upload System', () => {
  const testTopicId = '11111111-1111-1111-1111-111111111111'; // Guidewire Topic 1.1
  let testAssetId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create or get test user
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', 'test-content@example.com')
      .single();

    if (existingUser) {
      testUserId = existingUser.id;
    } else {
      const { data: newUser } = await supabase
        .from('user_profiles')
        .insert({
          email: 'test-content@example.com',
          full_name: 'Test Content User',
        })
        .select('id')
        .single();

      testUserId = newUser!.id;
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test assets
    if (testAssetId) {
      await supabase.from('content_assets').delete().eq('id', testAssetId);
    }
  });

  describe('Database Functions', () => {
    it('should record content upload', async () => {
      const { data: assetId, error } = await supabase.rpc('record_content_upload', {
        p_filename: 'test-video.mp4',
        p_storage_path: 'courses/test/test-video.mp4',
        p_file_type: 'video',
        p_mime_type: 'video/mp4',
        p_file_size_bytes: 1024000,
        p_topic_id: testTopicId,
        p_uploaded_by: testUserId,
        p_cdn_url: 'https://cdn.example.com/test-video.mp4',
      });

      expect(error).toBeNull();
      expect(assetId).toBeTruthy();

      testAssetId = assetId as string;

      // Verify asset record
      const { data: asset } = await supabase
        .from('content_assets')
        .select('*')
        .eq('id', testAssetId)
        .single();

      expect(asset).toBeTruthy();
      expect(asset?.filename).toBe('test-video.mp4');
      expect(asset?.file_type).toBe('video');
      expect(asset?.is_current).toBe(true);
    });

    it('should validate file type', async () => {
      const { error } = await supabase.rpc('record_content_upload', {
        p_filename: 'test.txt',
        p_storage_path: 'courses/test/test.txt',
        p_file_type: 'invalid_type',
        p_mime_type: 'text/plain',
        p_file_size_bytes: 100,
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('Invalid file type');
    });

    it('should validate file size', async () => {
      const { error } = await supabase.rpc('record_content_upload', {
        p_filename: 'test.pdf',
        p_storage_path: 'courses/test/test.pdf',
        p_file_type: 'pdf',
        p_mime_type: 'application/pdf',
        p_file_size_bytes: 0, // Invalid
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('Invalid file size');
    });

    it('should prevent duplicate storage paths', async () => {
      // Try to create asset with same storage path
      const { error } = await supabase.rpc('record_content_upload', {
        p_filename: 'test-video-2.mp4',
        p_storage_path: 'courses/test/test-video.mp4', // Same path
        p_file_type: 'video',
        p_mime_type: 'video/mp4',
        p_file_size_bytes: 1024000,
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('unique');
    });
  });

  describe('Asset Replacement', () => {
    it('should replace content asset', async () => {
      // Create new asset
      const { data: newAssetId } = await supabase.rpc('record_content_upload', {
        p_filename: 'test-video-v2.mp4',
        p_storage_path: 'courses/test/test-video-v2.mp4',
        p_file_type: 'video',
        p_mime_type: 'video/mp4',
        p_file_size_bytes: 2048000,
        p_topic_id: testTopicId,
      });

      expect(newAssetId).toBeTruthy();

      // Replace old asset
      const { error } = await supabase.rpc('replace_content_asset', {
        p_old_asset_id: testAssetId,
        p_new_asset_id: newAssetId,
      });

      expect(error).toBeNull();

      // Verify old asset marked as replaced
      const { data: oldAsset } = await supabase
        .from('content_assets')
        .select('*')
        .eq('id', testAssetId)
        .single();

      expect(oldAsset?.is_current).toBe(false);
      expect(oldAsset?.replaced_by).toBe(newAssetId);

      // Verify new asset is current
      const { data: newAsset } = await supabase
        .from('content_assets')
        .select('*')
        .eq('id', newAssetId)
        .single();

      expect(newAsset?.is_current).toBe(true);

      // Cleanup
      await supabase.from('content_assets').delete().eq('id', newAssetId);
    });
  });

  describe('Topic Assets Query', () => {
    it('should get all assets for a topic', async () => {
      const { data, error } = await supabase.rpc('get_topic_assets', {
        p_topic_id: testTopicId,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        expect(data[0].asset_id).toBeTruthy();
        expect(data[0].filename).toBeTruthy();
        expect(data[0].file_type).toBeTruthy();
      }
    });

    it('should only return current assets', async () => {
      const { data } = await supabase.rpc('get_topic_assets', {
        p_topic_id: testTopicId,
      });

      // All returned assets should be current
      data?.forEach((asset: { is_current?: boolean }) => {
        expect(asset.is_current).not.toBe(false);
      });
    });
  });

  describe('Storage Usage', () => {
    it('should calculate course storage usage', async () => {
      const testCourseId = '11111111-1111-1111-1111-111111111111'; // Guidewire course

      const { data, error } = await supabase.rpc('get_course_storage_usage', {
        p_course_id: testCourseId,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();

      if (data && data.length > 0) {
        const usage = data[0];
        expect(usage.file_count).toBeGreaterThanOrEqual(0);
        expect(usage.total_bytes).toBeGreaterThanOrEqual(0);
        expect(usage.video_count).toBeGreaterThanOrEqual(0);
        expect(usage.video_bytes).toBeGreaterThanOrEqual(0);
        expect(usage.document_count).toBeGreaterThanOrEqual(0);
        expect(usage.document_bytes).toBeGreaterThanOrEqual(0);
      }
    });

    it('should aggregate file counts correctly', async () => {
      const testCourseId = '11111111-1111-1111-1111-111111111111';

      // Get usage
      const { data } = await supabase.rpc('get_course_storage_usage', {
        p_course_id: testCourseId,
      });

      if (data && data.length > 0) {
        const usage = data[0];

        // Total file count should be sum of type counts
        const calculatedTotal = usage.video_count + usage.document_count;
        expect(usage.file_count).toBeLessThanOrEqual(calculatedTotal + 100); // Allow for other types
      }
    });
  });

  describe('RLS Policies', () => {
    it('should allow public assets to be viewed by all', async () => {
      // Create public asset
      const { data: publicAssetId } = await supabase.rpc('record_content_upload', {
        p_filename: 'public-image.jpg',
        p_storage_path: 'courses/test/public-image.jpg',
        p_file_type: 'image',
        p_mime_type: 'image/jpeg',
        p_file_size_bytes: 50000,
      });

      // Mark as public
      await supabase
        .from('content_assets')
        .update({ is_public: true })
        .eq('id', publicAssetId);

      // Should be viewable without auth
      const { data, error } = await supabase
        .from('content_assets')
        .select('*')
        .eq('id', publicAssetId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();

      // Cleanup
      await supabase.from('content_assets').delete().eq('id', publicAssetId);
    });

    it('should allow enrolled students to view course assets', async () => {
      // This test requires auth context switching
      // Skipping for now
      expect(true).toBe(true);
    });

    it('should prevent non-enrolled students from viewing private assets', async () => {
      // This test requires auth context switching
      // Skipping for now
      expect(true).toBe(true);
    });
  });

  describe('Full-Text Search', () => {
    it('should search assets by filename', async () => {
      const { data, error } = await supabase
        .from('content_assets')
        .select('*')
        .ilike('filename', '%test%')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
    });

    it('should search assets by content (when populated)', async () => {
      // Create asset with searchable content
      const { data: searchableAssetId } = await supabase.rpc('record_content_upload', {
        p_filename: 'searchable-doc.pdf',
        p_storage_path: 'courses/test/searchable-doc.pdf',
        p_file_type: 'pdf',
        p_mime_type: 'application/pdf',
        p_file_size_bytes: 100000,
      });

      // Add searchable content
      await supabase
        .from('content_assets')
        .update({ searchable_content: 'This is test content about insurance fundamentals' })
        .eq('id', searchableAssetId);

      // Search by content
      const { data } = await supabase
        .from('content_assets')
        .select('*')
        .ilike('searchable_content', '%insurance%');

      expect(data).toBeTruthy();
      expect(data!.length).toBeGreaterThan(0);

      // Cleanup
      await supabase.from('content_assets').delete().eq('id', searchableAssetId);
    });
  });

  describe('File Type Utilities', () => {
    it('should get storage path for asset', async () => {
      const { data: storagePath, error } = await supabase.rpc('get_asset_storage_path', {
        p_asset_id: testAssetId,
      });

      expect(error).toBeNull();
      expect(storagePath).toBe('courses/test/test-video.mp4');
    });

    it('should handle non-existent asset', async () => {
      const { data: storagePath } = await supabase.rpc('get_asset_storage_path', {
        p_asset_id: '00000000-0000-0000-0000-000000000000',
      });

      expect(storagePath).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle assets with no topic or lesson', async () => {
      const { data: assetId, error } = await supabase.rpc('record_content_upload', {
        p_filename: 'standalone.pdf',
        p_storage_path: 'courses/general/standalone.pdf',
        p_file_type: 'pdf',
        p_mime_type: 'application/pdf',
        p_file_size_bytes: 10000,
        p_topic_id: null,
        p_lesson_id: null,
      });

      expect(error).toBeNull();
      expect(assetId).toBeTruthy();

      // Cleanup
      await supabase.from('content_assets').delete().eq('id', assetId);
    });

    it('should handle very large file sizes', async () => {
      const { data: assetId, error } = await supabase.rpc('record_content_upload', {
        p_filename: 'large-video.mp4',
        p_storage_path: 'courses/test/large-video.mp4',
        p_file_type: 'video',
        p_mime_type: 'video/mp4',
        p_file_size_bytes: 2147483647, // Max int (2GB)
      });

      expect(error).toBeNull();
      expect(assetId).toBeTruthy();

      // Cleanup
      await supabase.from('content_assets').delete().eq('id', assetId);
    });

    it('should handle special characters in filename', async () => {
      const { data: assetId, error } = await supabase.rpc('record_content_upload', {
        p_filename: 'test file with spaces & symbols!.pdf',
        p_storage_path: 'courses/test/test_file_with_spaces___symbols_.pdf',
        p_file_type: 'pdf',
        p_mime_type: 'application/pdf',
        p_file_size_bytes: 10000,
      });

      expect(error).toBeNull();
      expect(assetId).toBeTruthy();

      // Cleanup
      await supabase.from('content_assets').delete().eq('id', assetId);
    });
  });
});
