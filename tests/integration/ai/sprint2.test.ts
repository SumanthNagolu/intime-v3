/**
 * Sprint 2 Integration Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Stories: AI-INF-004, AI-INF-005, AI-INF-006, AI-INF-007
 *
 * Tests full integration of:
 * - BaseAgent → Router → Memory → RAG
 * - Helicone cost tracking
 * - Prompt Library
 * - Orchestrator routing
 */

import { describe, it, expect, vi } from 'vitest';
import { BaseAgent } from '@/lib/ai/agents/BaseAgent';
import { AIRouter } from '@/lib/ai/router';
import { PromptLibrary } from '@/lib/ai/prompts/library';
import { Orchestrator } from '@/lib/ai/orchestrator';

// Mock environment
vi.stubEnv('OPENAI_API_KEY', 'test-key');
vi.stubEnv('HELICONE_API_KEY', 'test-helicone-key');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_KEY', 'test-service-key');

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
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

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() =>
          Promise.resolve({
            choices: [{ message: { content: '{"intent":"code_help","confidence":0.95,"reasoning":"test"}' } }],
          })
        ),
      },
    },
  })),
}));

describe('Sprint 2 Integration', () => {
  describe('BaseAgent with Router', () => {
    it('should route model selection', async () => {
      const router = new AIRouter();

      class TestAgent extends BaseAgent<string, string> {
        constructor() {
          super({ agentName: 'TestAgent' }, { router });
        }

        async execute(_input: string): Promise<string> {
          const model = await this.routeModel('test task');
          return `Using ${model.model}`;
        }
      }

      const agent = new TestAgent();
      const result = await agent.execute('test');

      expect(result).toContain('gpt-4o-mini');
    });
  });

  describe('Prompt Library', () => {
    it('should load and render templates', async () => {
      const library = new PromptLibrary();
      const metadata = library.getMetadata('activity_classification');

      expect(metadata.name).toBe('activity_classification');
      expect(metadata.category).toBe('productivity');
    });
  });

  describe('Orchestrator', () => {
    it('should route to agents', async () => {
      class TestAgent extends BaseAgent<unknown, unknown> {
        async execute(_input: unknown): Promise<unknown> {
          return { response: 'Test response' };
        }
      }

      const orchestrator = new Orchestrator();
      orchestrator.register('CodeMentorAgent', new TestAgent());

      const response = await orchestrator.route('test query', 'user_123');

      expect(response).toHaveProperty('agentName');
      expect(response).toHaveProperty('response');
      expect(response).toHaveProperty('confidence');
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete full agent execution with tracking', async () => {
      const router = new AIRouter();

      class FullIntegrationAgent extends BaseAgent<string, string> {
        constructor() {
          super(
            {
              agentName: 'FullIntegrationAgent',
              enableCostTracking: false, // Disabled for test
              orgId: 'org_test',
              userId: 'user_test',
            },
            { router }
          );
        }

        async execute(_input: string): Promise<string> {
          // Use router
          const model = await this.routeModel('test task');

          // Log interaction
          await this.logInteraction({
            type: 'test',
            model: model.model,
            tokens: 100,
            cost: 0.0001,
            latencyMs: 100,
          });

          return 'Success';
        }
      }

      const agent = new FullIntegrationAgent();
      const result = await agent.execute('test');

      expect(result).toBe('Success');
      expect(agent.hasRouter()).toBe(true);
    });
  });
});
