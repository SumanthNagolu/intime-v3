/**
 * Unit Tests: TimelineGenerator Service
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 4)
 * Story: AI-PROD-003 - Daily Timeline Generator
 *
 * @module tests/unit/ai/productivity/TimelineGenerator.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimelineGenerator } from '@/lib/ai/productivity/TimelineGenerator';

// Mock dependencies
vi.mock('@supabase/supabase-js');
vi.mock('openai');
vi.mock('@/lib/ai/productivity/ActivityClassifier');

describe('TimelineGenerator', () => {
  let generator: TimelineGenerator;
  let mockClassifier: Record<string, unknown>;
  let mockOpenAI: Record<string, unknown>;
  let mockSupabase: Record<string, unknown>;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    };

    // Mock OpenAI client
    mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    };

    // Mock ActivityClassifier
    mockClassifier = {
      getDailySummary: vi.fn(),
    };

    // Create generator instance WITH mocked dependencies
    generator = new TimelineGenerator(undefined, {
      classifier: mockClassifier as never,
      openai: mockOpenAI as never,
      supabase: mockSupabase as never,
    });
  });

  describe('generateDailyReport', () => {
    it('should generate a complete productivity report', async () => {
      // Mock classifier summary
      vi.spyOn(generator['classifier'], 'getDailySummary').mockResolvedValue({
        totalScreenshots: 100,
        analyzed: 95,
        byCategory: {
          coding: 45,
          email: 20,
          meeting: 15,
          documentation: 10,
          research: 5,
          social_media: 0,
          idle: 0,
        },
        productiveHours: 3.75,
      });

      const report = await generator.generateDailyReport(
        'test-user-id',
        '2025-01-15'
      );

      expect(report).toBeDefined();
      expect(report.summary).toBeTruthy();
      expect(report.productiveHours).toBeGreaterThan(0);
      expect(report.topActivities.length).toBeGreaterThan(0);
      expect(report.insights.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle no activity data gracefully', async () => {
      vi.spyOn(generator['classifier'], 'getDailySummary').mockResolvedValue({
        totalScreenshots: 0,
        analyzed: 0,
        byCategory: {
          coding: 0,
          email: 0,
          meeting: 0,
          documentation: 0,
          research: 0,
          social_media: 0,
          idle: 0,
        },
        productiveHours: 0,
      });

      await expect(
        generator.generateDailyReport('test-user-id', '2025-01-15')
      ).rejects.toThrow('No activity data available');
    });
  });

  describe('batchGenerateReports', () => {
    it('should generate reports for multiple employees', async () => {
      const count = await generator.batchGenerateReports('2025-01-15');

      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should generate report in less than 3 seconds', async () => {
      vi.spyOn(generator['classifier'], 'getDailySummary').mockResolvedValue({
        totalScreenshots: 100,
        analyzed: 95,
        byCategory: {
          coding: 45,
          email: 20,
          meeting: 15,
          documentation: 10,
          research: 5,
          social_media: 0,
          idle: 0,
        },
        productiveHours: 3.75,
      });

      const start = Date.now();
      await generator.generateDailyReport('test-user-id', '2025-01-15');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(3000);
    });
  });
});
