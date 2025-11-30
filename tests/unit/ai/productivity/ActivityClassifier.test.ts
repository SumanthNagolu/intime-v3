/**
 * Unit Tests: ActivityClassifier Service
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 4)
 * Story: AI-PROD-002 - Activity Classification
 *
 * @module tests/unit/ai/productivity/ActivityClassifier.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActivityClassifier } from '@/lib/ai/productivity/ActivityClassifier';
import type { ActivityCategory } from '@/types/productivity';

// Mock dependencies
vi.mock('openai');
vi.mock('@supabase/supabase-js');

describe('ActivityClassifier', () => {
  let classifier: ActivityClassifier;
  let mockSupabase: Record<string, unknown>;
  let mockOpenAI: Record<string, unknown>;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      update: vi.fn().mockReturnThis(),
      storage: {
        from: vi.fn().mockReturnThis(),
        createSignedUrl: vi.fn(),
      },
    };

    // Mock OpenAI client
    mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    };

    // Create classifier instance WITH mocked dependencies
    classifier = new ActivityClassifier(undefined, {
      supabase: mockSupabase as never,
      openai: mockOpenAI as never,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyScreenshot', () => {
    it('should classify a screenshot successfully', async () => {
      // Mock screenshot data
      const mockScreenshot = {
        id: 'test-screenshot-id',
        user_id: 'test-user-id',
        filename: 'test-user-id/2025-01-15T10:00:00.000Z.jpg',
        file_size: 50000,
        captured_at: '2025-01-15T10:00:00.000Z',
        analyzed: false,
      };

      // Mock signed URL
      mockSupabase.single.mockResolvedValue({
        data: mockScreenshot,
        error: null,
      });

      mockSupabase.storage.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://test.com/image.jpg' },
        error: null,
      });

      // Mock OpenAI response
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: 'coding',
                confidence: 0.95,
                reasoning: 'IDE visible with code',
              }),
            },
          },
        ],
        usage: { total_tokens: 100 },
      });

      // Mock update
      mockSupabase.update.mockResolvedValue({ error: null });

      // Execute classification
      const result = await classifier.classifyScreenshot('test-screenshot-id');

      // Verify result
      expect(result.category).toBe('coding');
      expect(result.confidence).toBe(0.95);
      expect(result.reasoning).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });

    it('should handle classification errors gracefully', async () => {
      // Mock screenshot not found
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Screenshot not found'),
      });

      // Expect error to be thrown
      await expect(
        classifier.classifyScreenshot('invalid-id')
      ).rejects.toThrow();
    });

    it('should fallback to idle classification on API failure', async () => {
      // Mock successful screenshot fetch
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'test-screenshot-id',
          filename: 'test.jpg',
        },
        error: null,
      });

      mockSupabase.storage.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://test.com/image.jpg' },
        error: null,
      });

      // Mock OpenAI API error
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('API error')
      );

      // Mock update
      mockSupabase.update.mockResolvedValue({ error: null });

      // Execute classification
      const result = await classifier.classifyScreenshot('test-screenshot-id');

      // Verify fallback
      expect(result.category).toBe('idle');
      expect(result.confidence).toBeLessThan(0.2);
    });
  });

  describe('batchClassify', () => {
    it('should process multiple screenshots in batches', async () => {
      // Mock unanalyzed screenshots
      const mockScreenshots = Array.from({ length: 25 }, (_, i) => ({
        id: `screenshot-${i}`,
      }));

      mockSupabase.select.mockResolvedValue({
        data: mockScreenshots,
        error: null,
      });

      // Mock successful classification for all
      vi.spyOn(classifier, 'classifyScreenshot').mockResolvedValue({
        category: 'coding' as ActivityCategory,
        confidence: 0.9,
        reasoning: 'Test',
        timestamp: new Date().toISOString(),
      });

      // Execute batch classification
      const count = await classifier.batchClassify('test-user-id', '2025-01-15');

      // Verify all screenshots processed
      expect(count).toBe(25);
    });

    it('should handle partial failures in batch', async () => {
      // Mock screenshots
      const mockScreenshots = [
        { id: 'screenshot-1' },
        { id: 'screenshot-2' },
        { id: 'screenshot-3' },
      ];

      mockSupabase.select.mockResolvedValue({
        data: mockScreenshots,
        error: null,
      });

      // Mock mixed results (2 successes, 1 failure)
      vi.spyOn(classifier, 'classifyScreenshot')
        .mockResolvedValueOnce({
          category: 'coding' as ActivityCategory,
          confidence: 0.9,
          reasoning: 'Test',
          timestamp: new Date().toISOString(),
        })
        .mockRejectedValueOnce(new Error('Classification failed'))
        .mockResolvedValueOnce({
          category: 'email' as ActivityCategory,
          confidence: 0.85,
          reasoning: 'Test',
          timestamp: new Date().toISOString(),
        });

      // Execute batch classification
      const count = await classifier.batchClassify('test-user-id', '2025-01-15');

      // Verify only successful classifications counted
      expect(count).toBe(2);
    });

    it('should return 0 when no unanalyzed screenshots exist', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [],
        error: null,
      });

      const count = await classifier.batchClassify('test-user-id', '2025-01-15');

      expect(count).toBe(0);
    });
  });

  describe('getDailySummary', () => {
    it('should aggregate activity data correctly', async () => {
      // Mock screenshot data with various categories
      const mockScreenshots = [
        { activity_category: 'coding', confidence: 0.95, analyzed: true },
        { activity_category: 'coding', confidence: 0.92, analyzed: true },
        { activity_category: 'email', confidence: 0.88, analyzed: true },
        { activity_category: 'meeting', confidence: 0.91, analyzed: true },
        { activity_category: 'idle', confidence: 0.85, analyzed: true },
      ];

      mockSupabase.select.mockResolvedValue({
        data: mockScreenshots,
        error: null,
      });

      // Execute summary
      const summary = await classifier.getDailySummary(
        'test-user-id',
        '2025-01-15'
      );

      // Verify aggregation
      expect(summary.totalScreenshots).toBe(5);
      expect(summary.analyzed).toBe(5);
      expect(summary.byCategory.coding).toBe(2);
      expect(summary.byCategory.email).toBe(1);
      expect(summary.byCategory.meeting).toBe(1);
      expect(summary.byCategory.idle).toBe(1);

      // Verify productive hours calculation (4 productive screenshots × 30s = 120s = 0.03 hours)
      expect(summary.productiveHours).toBeGreaterThan(0);
    });

    it('should return empty summary for no data', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [],
        error: null,
      });

      const summary = await classifier.getDailySummary(
        'test-user-id',
        '2025-01-15'
      );

      expect(summary.totalScreenshots).toBe(0);
      expect(summary.analyzed).toBe(0);
      expect(summary.productiveHours).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should classify screenshot in less than 2 seconds', async () => {
      // Mock fast responses
      mockSupabase.single.mockResolvedValue({
        data: { id: 'test', filename: 'test.jpg' },
        error: null,
      });

      mockSupabase.storage.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://test.com/image.jpg' },
        error: null,
      });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: 'coding',
                confidence: 0.95,
                reasoning: 'Test',
              }),
            },
          },
        ],
      });

      mockSupabase.update.mockResolvedValue({ error: null });

      const start = Date.now();
      await classifier.classifyScreenshot('test-screenshot-id');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Cost Optimization', () => {
    it('should use batch processing to reduce costs', async () => {
      const mockScreenshots = Array.from({ length: 10 }, (_, i) => ({
        id: `screenshot-${i}`,
      }));

      mockSupabase.select.mockResolvedValue({
        data: mockScreenshots,
        error: null,
      });

      vi.spyOn(classifier, 'classifyScreenshot').mockResolvedValue({
        category: 'coding' as ActivityCategory,
        confidence: 0.9,
        reasoning: 'Test',
        timestamp: new Date().toISOString(),
      });

      await classifier.batchClassify('test-user-id', '2025-01-15');

      // Verify batch processing used (10 screenshots processed)
      expect(classifier.classifyScreenshot).toHaveBeenCalledTimes(10);
    });
  });
});
