/**
 * BaseAgent Tests
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-005 - Base Agent Framework
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BaseAgent, ExampleAgent, type AgentConfig } from '@/lib/ai/agents/BaseAgent';

// Test implementation
class TestAgent extends BaseAgent<string, string> {
  async execute(input: string): Promise<string> {
    return `Processed: ${input}`;
  }
}

describe('BaseAgent', () => {
  describe('configuration', () => {
    it('should initialize with default config', () => {
      const agent = new TestAgent();
      const config = agent.getConfig();

      expect(config.agentName).toBe('BaseAgent');
      expect(config.enableCostTracking).toBe(false);
      expect(config.enableMemory).toBe(false);
      expect(config.enableRAG).toBe(false);
    });

    it('should accept custom config', () => {
      const config: Partial<AgentConfig> = {
        agentName: 'CustomAgent',
        enableCostTracking: true,
        orgId: 'org_123',
        userId: 'user_456',
      };

      const agent = new TestAgent(config);
      const actualConfig = agent.getConfig();

      expect(actualConfig.agentName).toBe('CustomAgent');
      expect(actualConfig.enableCostTracking).toBe(true);
      expect(actualConfig.orgId).toBe('org_123');
      expect(actualConfig.userId).toBe('user_456');
    });

    it('should allow config updates', () => {
      const agent = new TestAgent();
      agent.updateConfig({ agentName: 'UpdatedAgent' });

      const config = agent.getConfig();
      expect(config.agentName).toBe('UpdatedAgent');
    });
  });

  describe('execute', () => {
    it('should execute agent logic', async () => {
      const agent = new TestAgent();
      const result = await agent.execute('test input');

      expect(result).toBe('Processed: test input');
    });
  });

  describe('capability checks', () => {
    it('should report no capabilities without dependencies', () => {
      const agent = new TestAgent();

      expect(agent.hasRouter()).toBe(false);
      expect(agent.hasMemory()).toBe(false);
      expect(agent.hasRAG()).toBe(false);
      expect(agent.hasCostTracking()).toBe(false);
    });

    it('should report enabled capabilities with config', () => {
      const agent = new TestAgent({
        enableMemory: true,
        enableRAG: true,
      });

      // Still false because dependencies not injected
      expect(agent.hasMemory()).toBe(false);
      expect(agent.hasRAG()).toBe(false);
    });
  });

  describe('routeModel', () => {
    it('should return default model without router', async () => {
      const agent = new TestAgent();
      const model = await agent['routeModel']('test task');

      expect(model.provider).toBe('openai');
      expect(model.model).toBe('gpt-4o-mini');
      expect(model.reasoning).toContain('no router');
    });
  });

  describe('rememberContext', () => {
    it('should return empty array without memory', async () => {
      const agent = new TestAgent();
      const context = await agent['rememberContext']('conv-123');

      expect(context).toEqual([]);
    });
  });

  describe('search', () => {
    it('should return empty array without RAG', async () => {
      const agent = new TestAgent();
      const docs = await agent['search']('test query');

      expect(docs).toEqual([]);
    });
  });

  describe('ExampleAgent', () => {
    it('should execute example agent', async () => {
      const agent = new ExampleAgent();
      const result = await agent.execute('test');

      expect(result).toContain('Processed: test');
    });
  });
});
