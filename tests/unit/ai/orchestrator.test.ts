/**
 * Orchestrator Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-007 - Multi-Agent Orchestrator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Orchestrator } from '@/lib/ai/orchestrator';
import { BaseAgent } from '@/lib/ai/agents/BaseAgent';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    intent: 'code_help',
                    confidence: 0.95,
                    reasoning: 'User asking about code implementation',
                  }),
                },
              },
            ],
          })
        ),
      },
    },
  })),
}));

// Test agent
class MockAgent extends BaseAgent<any, any> {
  async execute(input: any): Promise<any> {
    return { response: `Mock response for: ${input.query}` };
  }
}

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator();
  });

  describe('agent registration', () => {
    it('should register agents', () => {
      const agent = new MockAgent();
      orchestrator.register('TestAgent', agent);

      const agents = orchestrator.listAgents();
      expect(agents).toContain('TestAgent');
    });

    it('should track multiple agents', () => {
      orchestrator.register('Agent1', new MockAgent());
      orchestrator.register('Agent2', new MockAgent());

      const stats = orchestrator.getStats();
      expect(stats.totalAgents).toBe(2);
      expect(stats.registeredAgents).toContain('Agent1');
      expect(stats.registeredAgents).toContain('Agent2');
    });
  });

  describe('route', () => {
    it('should return fallback for unregistered agent', async () => {
      const response = await orchestrator.route('test query', 'user_123');

      expect(response.agentName).toBe('OrchestratorFallback');
      expect(response.confidence).toBeLessThan(0.5);
    });

    it('should route to registered agent', async () => {
      const agent = new MockAgent();
      orchestrator.register('CodeMentorAgent', agent);

      const response = await orchestrator.route(
        'How do I implement this feature?',
        'user_123'
      );

      expect(response.agentName).toBe('CodeMentorAgent');
      expect(response.response).toContain('Mock response');
    });
  });

  describe('handoff', () => {
    it('should log handoff between agents', async () => {
      orchestrator.register('Agent1', new MockAgent());
      orchestrator.register('Agent2', new MockAgent());

      await expect(
        orchestrator.handoff('Agent1', 'Agent2', { context: 'test' })
      ).resolves.toBeUndefined();
    });

    it('should throw for unknown target agent', async () => {
      await expect(
        orchestrator.handoff('Agent1', 'UnknownAgent', {})
      ).rejects.toThrow('Target agent not found');
    });
  });

  describe('stats', () => {
    it('should return correct stats', () => {
      orchestrator.register('Agent1', new MockAgent());
      orchestrator.register('Agent2', new MockAgent());

      const stats = orchestrator.getStats();

      expect(stats.totalAgents).toBe(2);
      expect(stats.registeredAgents).toEqual(['Agent1', 'Agent2']);
    });
  });
});
