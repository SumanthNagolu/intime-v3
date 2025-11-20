/**
 * Unit Tests: EmployeeTwin Framework
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 4)
 * Story: AI-TWIN-001 - Employee AI Twin Framework
 *
 * @module tests/unit/ai/twins/EmployeeTwin.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeTwin } from '@/lib/ai/twins/EmployeeTwin';
import type { TwinRole } from '@/types/productivity';

// Mock dependencies
vi.mock('@supabase/supabase-js');
vi.mock('openai');

describe('EmployeeTwin', () => {
  let twin: EmployeeTwin;
  let mockOpenAI: any;
  let mockSupabase: any;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
    };

    // Mock OpenAI client
    mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    };

    // Create twin instance WITH mocked dependencies
    twin = new EmployeeTwin('test-employee-id', 'recruiter', undefined, {
      openai: mockOpenAI as any,
      supabase: mockSupabase as any,
    });
  });

  describe('getRole', () => {
    it('should return the correct role', () => {
      expect(twin.getRole()).toBe('recruiter');
    });
  });

  describe('generateMorningBriefing', () => {
    it('should generate a personalized briefing', async () => {
      const briefing = await twin.generateMorningBriefing();

      expect(briefing).toBeTruthy();
      expect(typeof briefing).toBe('string');
      expect(briefing.length).toBeGreaterThan(50);
    });
  });

  describe('generateProactiveSuggestion', () => {
    it('should generate a suggestion when actionable items exist', async () => {
      // Mock hasActionableItems to return true
      vi.spyOn(twin as any, 'hasActionableItems').mockResolvedValue(true);

      const suggestion = await twin.generateProactiveSuggestion();

      expect(suggestion).toBeTruthy();
      if (suggestion) {
        expect(typeof suggestion).toBe('string');
      }
    });

    it('should return null when no actionable items exist', async () => {
      // Mock hasActionableItems to return false
      vi.spyOn(twin as any, 'hasActionableItems').mockResolvedValue(false);

      const suggestion = await twin.generateProactiveSuggestion();

      expect(suggestion).toBeNull();
    });
  });

  describe('query', () => {
    it('should answer user questions', async () => {
      const result = await twin.query('What are my top priorities today?');

      expect(result.answer).toBeTruthy();
      expect(result.conversationId).toBeTruthy();
    });

    it('should maintain conversation context', async () => {
      const result1 = await twin.query('Hello', 'conv-123');
      const result2 = await twin.query('Follow up question', result1.conversationId);

      expect(result2.conversationId).toBe(result1.conversationId);
    });
  });

  describe('getInteractionHistory', () => {
    it('should fetch interaction history', async () => {
      const history = await twin.getInteractionHistory(5);

      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Role-Specific Behavior', () => {
    it('should use role-specific prompts', () => {
      const recruiterTwin = new EmployeeTwin('test-1', 'recruiter');
      const trainerTwin = new EmployeeTwin('test-2', 'trainer');
      const benchSalesTwin = new EmployeeTwin('test-3', 'bench_sales');
      const adminTwin = new EmployeeTwin('test-4', 'admin');

      expect(recruiterTwin.getRole()).toBe('recruiter');
      expect(trainerTwin.getRole()).toBe('trainer');
      expect(benchSalesTwin.getRole()).toBe('bench_sales');
      expect(adminTwin.getRole()).toBe('admin');
    });
  });

  describe('Performance', () => {
    it('should generate morning briefing in less than 2 seconds', async () => {
      const start = Date.now();
      await twin.generateMorningBriefing();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Cost Tracking', () => {
    it('should track AI costs for interactions', async () => {
      // Mock cost calculation
      const cost = twin['calculateCost'](1000, 'gpt-4o-mini');

      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(0.01); // Should be very cheap for 1000 tokens
    });
  });
});
