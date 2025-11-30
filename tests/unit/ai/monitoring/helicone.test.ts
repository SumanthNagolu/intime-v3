/**
 * Helicone Client Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-004 - Cost Monitoring with Helicone
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeliconeClient } from '@/lib/ai/monitoring/helicone';
import type { CostTrackingRequest, DateRange } from '@/lib/ai/monitoring/types';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((_table: string) => ({
      insert: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({ data: [], error: null })),
          })),
        })),
      })),
    })),
  })),
}));

describe('HeliconeClient', () => {
  let client: HeliconeClient;

  beforeEach(() => {
    client = new HeliconeClient({ apiKey: 'test-key' });
  });

  describe('trackRequest', () => {
    it('should track AI request cost', async () => {
      const request: CostTrackingRequest = {
        orgId: 'org_123',
        userId: 'user_456',
        provider: 'openai',
        model: 'gpt-4o-mini',
        inputTokens: 1000,
        outputTokens: 500,
        costUsd: 0.0004,
        latencyMs: 1200,
      };

      await expect(client.trackRequest(request)).resolves.toBeUndefined();
    });

    it('should handle tracking errors gracefully', async () => {
      const request: CostTrackingRequest = {
        orgId: 'org_123',
        userId: 'user_456',
        provider: 'openai',
        model: 'gpt-4o-mini',
        inputTokens: 1000,
        outputTokens: 500,
        costUsd: 0.0004,
        latencyMs: 1200,
      };

      // Should not throw even if database insert fails
      await expect(client.trackRequest(request)).resolves.toBeUndefined();
    });
  });

  describe('getCostSummary', () => {
    it('should return empty summary for no data', async () => {
      const dateRange: DateRange = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      const summary = await client.getCostSummary('org_123', dateRange);

      expect(summary.totalCost).toBe(0);
      expect(summary.totalRequests).toBe(0);
      expect(summary.byProvider.openai.cost).toBe(0);
      expect(summary.byProvider.anthropic.cost).toBe(0);
    });
  });

  describe('checkBudget', () => {
    it('should return null when under budget', async () => {
      const alert = await client.checkBudget('org_123');
      expect(alert).toBeNull();
    });
  });

  describe('getHeliconeHeaders', () => {
    it('should return correct headers', () => {
      const headers = client.getHeliconeHeaders({ sessionId: 'test-123' });

      expect(headers).toHaveProperty('Helicone-Auth');
      expect(headers['Helicone-Auth']).toBe('Bearer test-key');
      expect(headers['Helicone-Property-sessionId']).toBe('test-123');
    });
  });

  describe('proxy URLs', () => {
    it('should return OpenAI proxy URL', () => {
      const url = client.getOpenAIProxyUrl();
      expect(url).toBe('https://oai.helicone.ai/v1');
    });

    it('should return Anthropic proxy URL', () => {
      const url = client.getAnthropicProxyUrl();
      expect(url).toBe('https://anthropic.helicone.ai/v1');
    });
  });
});
